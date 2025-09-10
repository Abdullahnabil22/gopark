import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  ticketCheckinVisitor, 
  ticketCheckinSubscriber, 
  type Zone,
  type CheckinResponse 
} from "../services/api";

/**
 * Parameters for {@link useZoneCheckin}.
 */
type UseZoneCheckinProps = {
  gateId: string;
  activeTab: "visitor" | "subscriber";
  subscriptionId: string;
  subscription: any;
  onSuccess: (response: CheckinResponse) => void;
  onError: (error: string) => void;
};

/**
 * Hook that orchestrates check-in flow for visitors and subscribers.
 *
 * It calls the appropriate API, updates the cached zone list, and
 * surfaces loading and error handling through callbacks.
 */
export function useZoneCheckin({
  gateId,
  activeTab,
  subscriptionId,
  subscription,
  onSuccess,
  onError,
}: UseZoneCheckinProps) {
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const queryClient = useQueryClient();

  /**
   * Perform a check-in for a selected zone and ticket.
   *
   * - For `visitor`, uses {@link ticketCheckinVisitor}.
   * - For `subscriber`, requires `subscription` and uses {@link ticketCheckinSubscriber}.
   *
   * On success, updates the React Query cache for `['zones', gateId]`.
   */
  const handleCheckin = async (selectedZone: Zone, ticketId: string) => {
    if (!selectedZone || !gateId || isCheckingIn) return;

    setIsCheckingIn(true);
    try {
      let response: CheckinResponse;

      if (activeTab === "visitor") {
        response = await ticketCheckinVisitor({
          gateId,
          zoneId: selectedZone.id,
          type: "visitor",
          id: ticketId,
          checkoutAt: null,
          checkinAt: new Date().toISOString(),
        });
      } else {
        if (!subscription) {
          onError("Please enter a valid subscription ID");
          return;
        }

        response = await ticketCheckinSubscriber({
          gateId,
          zoneId: selectedZone.id,
          type: "subscriber",
          id: ticketId,
          checkoutAt: null,
          subscriptionId: subscriptionId,
          checkinAt: new Date().toISOString(),
        });
      }

      queryClient.setQueryData(
        ["zones", gateId],
        (oldZones: Zone[] | undefined) => {
          if (!oldZones) return oldZones;
          return oldZones.map((zone) =>
            zone.id === response.zoneState.id ? response.zoneState : zone
          );
        }
      );

      onSuccess(response);
    } catch (error: unknown) {
      console.error("Check-in failed:", error);
      const errorObj = error as { status?: number; message?: string };
      if (errorObj.status === 409) {
        onError(errorObj.message || "No available slots");
      } else {
        onError(errorObj.message || "Check-in failed");
      }
    } finally {
      setIsCheckingIn(false);
    }
  };

  return {
    /** Whether a check-in request is in flight */
    isCheckingIn,
    /** Trigger the check-in flow */
    handleCheckin,
  };
}

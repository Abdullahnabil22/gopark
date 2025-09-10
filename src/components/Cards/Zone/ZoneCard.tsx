import { useState, useId, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "react-router";
import {
  getZones,
  getCategories,
  type Zone,
  type Category,
  type CheckinResponse,
  type Subscription,
} from "../../../services/api";
import { useAppStore } from "../../../store/app";
import Loading from "../../Loading/loading";
import LoadingError from "../../Error/LoadingError";
import TicketModal from "../../Modals/TicketModal";
import TabSelector from "../../ui/TabSelector";
import SubscriptionInput from "./SubscriptionInput";
import CheckinButton from "./CheckinButton";
import { useZoneCheckin } from "../../../hooks/useZoneCheckin";
import { useZoneWebSocket } from "../../../hooks/useZoneWebSocket";
import { useToast } from "../../../hooks/useToast";
import ZoneCardItem from "./ZoneCardItem";
import { getCategoryName } from "../../../utils/categoryUtils";

export default function ZoneCard() {
  const ticketId = useId();
  const { id: gateId } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeTab, setTab } = useAppStore();
  const { showSuccess, showError, ToastContainer } = useToast();
  
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [lastTicket, setLastTicket] = useState<CheckinResponse | null>(null);
  const [showZones, setShowZones] = useState(false);

  const {
    data: zones,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Zone[]>({
    queryKey: ["zones", gateId],
    queryFn: () => getZones(gateId!),
    enabled: Boolean(gateId),
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });

  useEffect(() => {
    const subIdFromUrl = searchParams.get("subscriptionId");
    if (subIdFromUrl && activeTab === "subscriber") {
      setShowZones(true);
    }
  }, [searchParams, activeTab]);

 
  const isSubscriptionValidForZone = (zone: Zone): boolean => {
    if (activeTab !== "subscriber" || !subscription) return true;
    const subscriptionCategory = subscription.category || subscription.categories?.[0];
    return subscriptionCategory === zone.categoryId;
  };

  useZoneWebSocket(gateId);

  const { isCheckingIn, handleCheckin } = useZoneCheckin({
    gateId: gateId!,
    activeTab,
    subscriptionId: subscription?.id || "",
    subscription,
    onSuccess: (response) => {
      setLastTicket(response);
      setTicketModalOpen(true);
      showSuccess("Check-in successful!");
    },
    onError: (error) => {
      showError(error);
    },
  });

  const handleZoneSelect = (zone: Zone) => {
    setSelectedZone(zone);
  };

  const handleCheckinClick = () => {
    if (selectedZone) {
      handleCheckin(selectedZone, ticketId);
    }
  };

  const handleModalClose = () => {
    setTicketModalOpen(false);
    setSelectedZone(null);
  };

  const handleSubscriptionValidated = (validatedSubscription: Subscription) => {
    setSubscription(validatedSubscription);
  };

  const handleBackToSubscription = () => {
    setShowZones(false);
    setSelectedZone(null);
    setSubscription(null);
    setSearchParams({});
  };

  if (isLoading) return <Loading itemCount={3} className="px-4" />;
  if (isError)
    return (
      <LoadingError
        error={(error as Error).message}
        onRetry={() => refetch()}
        className="px-4"
      />
    );

  if (!gateId) {
    return <div className="px-4 text-red-600">No gate ID provided</div>;
  }

  return (
    <div className="px-4 space-y-3">
      <TabSelector
        Tabs={["visitor", "subscriber"]}
        activeTab={activeTab}
        onTabChange={setTab}
      />

      {activeTab === "subscriber" && !showZones && (
        <SubscriptionInput
          onSubscriptionValidated={handleSubscriptionValidated}
        />
      )}

      {activeTab === "subscriber" && showZones && subscription && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div>
              <h3 className="font-medium text-green-900">Subscription Active</h3>
              <p className="text-sm text-green-700">
                ID: {subscription.id} | Category: {subscription.category || subscription.categories?.[0] || "N/A"}
              </p>
            </div>
            <button
              onClick={handleBackToSubscription}
              className="px-3 py-1 text-sm text-green-600 hover:text-green-800 underline cursor-pointer"
            >
              Change Subscription
            </button>
          </div>
        </div>
      )}

      {(activeTab === "visitor" || (activeTab === "subscriber" && showZones)) && (
        <>
          <div className="space-y-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {!Array.isArray(zones) || zones.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                No zones found for this gate.
              </div>
            ) : (
              zones!.map((zone) => (
                <ZoneCardItem
                  key={zone.id}
                  zone={zone}
                  selectedZone={selectedZone!}
                  categoryName={getCategoryName(zone.categoryId!, categories)}
                  onSelect={handleZoneSelect}
                  isDisabled={false}
                  subscriptionValid={isSubscriptionValidForZone(zone)}
                />
              ))
            )}
          </div>

          <CheckinButton
            selectedZone={selectedZone!}
            isCheckingIn={isCheckingIn}
            isDisabled={
              isCheckingIn || (activeTab === "subscriber" && !subscription)
            }
            onCheckin={handleCheckinClick}
          />
        </>
      )}

      {ticketModalOpen && lastTicket && (
        <TicketModal
          ticket={lastTicket.ticket}
          zone={selectedZone}
          isOpen={ticketModalOpen}
          onClose={handleModalClose}
        />
      )}

      <ToastContainer />
    </div>
  );
}

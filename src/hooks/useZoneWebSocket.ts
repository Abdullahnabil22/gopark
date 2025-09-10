import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getParkingWS, type Zone } from "../services/ws";

/**
 * Subscribes to WebSocket zone updates for a specific gate and
 * keeps the React Query cache in sync.
 *
 * When a `zone-update` message arrives, it updates the `['zones', gateId]` cache.
 */
export function useZoneWebSocket(gateId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!gateId) return;

    const ws = getParkingWS();
    const unsubscribe = ws.onMessage((message) => {
      if (message.type === "zone-update") {
        queryClient.setQueryData(
          ["zones", gateId],
          (oldZones: Zone[] | undefined) => {
            if (!oldZones) return oldZones;
            return oldZones.map((zone) =>
              zone.id === message.payload.id ? message.payload : zone
            );
          }
        );
      }
    });

    return () => {
      unsubscribe();
    };
  }, [gateId, queryClient]);
}

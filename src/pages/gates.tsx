import { useEffect } from "react";
import { useParams } from "react-router";
import GateHeader from "../components/Headers/GateHeader";
import { useAppStore } from "../store/app";
import ZoneCard from "../components/Cards/Zone/ZoneCard";

export default function Gates() {
  const { id: gateId } = useParams<{ id: string }>();
  const { connectToGate, disconnect } = useAppStore();

  useEffect(() => {
    if (gateId) {
      connectToGate(gateId);
    }
    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gateId]); 

  return (
    <div>
      <GateHeader />
      <ZoneCard/>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { FaCarSide } from "react-icons/fa6";
import { LuClock, LuCalendar, LuWifi, LuWifiOff } from "react-icons/lu";
import { useAppStore } from "../../store/app";
import { useQuery } from "@tanstack/react-query";
import { getGates, type Gate } from "../../services/api";
import BaseHeader from "./BaseHeader";

export default function GateHeader() {
  const { id } = useParams<{ id: string }>();
  const [currentTime, setCurrentTime] = useState(new Date());
  const wsConnected = useAppStore((s) => s.wsConnected);

  const { data: gates } = useQuery<Gate[]>({
    queryKey: ["gates"],
    queryFn: () => getGates(),
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentGate = gates?.find((g) => g.id === id);

 
  const mobileAdditionalContent = (
    <>
      <div className="flex items-center gap-1.5 text-foreground/70">
        <LuCalendar className="h-3 w-3" />
        <span className="font-medium">
          {currentTime.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-foreground/70">
        <LuClock className="h-3 w-3" />
        <span className="font-mono font-medium">
          {currentTime.toLocaleTimeString()}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
            wsConnected
              ? "bg-emerald-100 text-emerald-700"
              : "bg-rose-100 text-rose-700"
          }`}
        >
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              wsConnected ? "bg-emerald-500" : "bg-rose-500"
            }`}
          />
          {wsConnected ? "Connected" : "Disconnected"}
        </span>
      </div>
    </>
  );

  
  const rightContent = (
    <div className="flex items-center space-x-3 lg:space-x-4 text-sm">
      <div className="flex items-center gap-2 text-foreground/70">
        <LuCalendar className="h-4 w-4" />
        <span className="font-medium">
          {currentTime.toLocaleDateString()}
        </span>
      </div>
      <div className="flex items-center gap-2 text-foreground/70">
        <LuClock className="h-4 w-4" />
        <span className="font-mono font-medium">
          {currentTime.toLocaleTimeString()}
        </span>
      </div>
      <span
        className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${
          wsConnected
            ? "bg-emerald-100 text-emerald-700"
            : "bg-rose-100 text-rose-700"
        }`}
      >
        {wsConnected ? (
          <LuWifi className="inline-block text-lg text-emerald-500" />
        ) : (
          <LuWifiOff className="inline-block text-lg text-rose-500" />
        )}
        {wsConnected ? "Connected" : "Disconnected"}
      </span>
    </div>
  );

  return (
    <BaseHeader
      icon={FaCarSide}
      title={`${currentGate?.name || "Unknown"} Gate`}
      subtitle={currentGate?.location || "Unknown"}
      backLabel="Back"
      rightContent={rightContent}
      additionalContent={mobileAdditionalContent}
    />
  );
}

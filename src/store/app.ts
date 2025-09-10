import { create } from "zustand";
import { getParkingWS } from "../services/ws";

/**
 * Admin activity log entry pushed from the WebSocket server.
 */
type AdminLogItem = {
  timestamp: string;
  action: string;
  targetType: string;
  targetId: string;
  adminId: string;
  details?: Record<string, unknown>;
};

/**
 * Global app store state for gate selection, tab, connection status,
 * and a rolling admin activity log.
 */
type AppState = {
  /** Currently selected gate id (or null when none) */
  selectedGateId: string | null;
  /** Which tab is active in checkpoint views */
  activeTab: "visitor" | "subscriber";
  /** Whether the WebSocket appears connected */
  wsConnected: boolean;
  /** Recent admin activity, newest first (max 50) */
  adminLog: AdminLogItem[];
  /** Set the currently selected gate */
  setGate: (gateId: string) => void;
  /** Switch UI tab */
  setTab: (tab: "visitor" | "subscriber") => void;
  /** Connect WebSocket to a specific gate and start tracking connection */
  connectToGate: (gateId: string) => void;
  /** Disconnect WebSocket and clear trackers */
  disconnect: () => void;
  /** Append a new admin log item */
  addAdminLog: (item: AdminLogItem) => void;
  /** Manually adjust wsConnected flag */
  setWSConnected: (connected: boolean) => void;
};

export const useAppStore = create<AppState>((set, get) => ({
  selectedGateId: null,
  activeTab: "visitor",
  wsConnected: false,
  adminLog: [],
  
  setGate: (gateId) => set({ selectedGateId: gateId }),
  setTab: (tab) => set({ activeTab: tab }),
  
  connectToGate: (gateId) => {
    const ws = getParkingWS();
    ws.connect(gateId);
    
    const unsubscribe = ws.onMessage((msg) => {
      if (msg.type === "admin-update") {
        get().addAdminLog(msg.payload);
      }
    });
    
    const checkConnection = () => {
      const connected = ws.isConnected();
      if (connected !== get().wsConnected) {
        set({ wsConnected: connected });
      }
    };
    
    const interval = setInterval(checkConnection, 1000);
    
    (window as Window & { __ws_cleanup?: () => void }).__ws_cleanup = () => {
      clearInterval(interval);
      unsubscribe();
    };
  },
  
  disconnect: () => {
    const ws = getParkingWS();
    ws.disconnect();
    (window as Window & { __ws_cleanup?: () => void }).__ws_cleanup?.();
    set({ wsConnected: false });
  },
  
  addAdminLog: (item) =>
    set((state) => ({
      adminLog: [item, ...state.adminLog].slice(0, 50),
    })),
    
  setWSConnected: (connected) => set({ wsConnected: connected }),
}));



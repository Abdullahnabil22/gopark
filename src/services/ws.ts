/** Message describing a real-time update for a parking zone */
type ZoneUpdate = {
  type: "zone-update";
  payload: {
    id: string;
    name: string;
    categoryId: string;
    gateIds: string[];
    totalSlots: number;
    occupied: number;
    free: number;
    reserved: number;
    availableForVisitors: number;
    availableForSubscribers: number;
    rateNormal: number;
    rateSpecial: number;
    open: boolean;
  };
};

/** Message describing an administrative action that occurred on the system */
type AdminUpdate = {
  type: "admin-update";
  payload: {
    adminId: string;
    action: string;
    targetType: string;
    targetId: string;
    details?: Record<string, unknown>;
    timestamp: string;
  };
};

/** Union of all recognized incoming WebSocket messages */
type IncomingMessage = ZoneUpdate | AdminUpdate;
type Listener = (msg: IncomingMessage) => void;

class ParkingWS {
  private static instance: ParkingWS | null = null;
  private ws: WebSocket | null = null;
  private listeners = new Set<Listener>();
  private url: string;
  private gateId: string | null = null;
  private shouldConnect = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectDelay = 2000;

  /**
   * Create a new WebSocket manager.
   * @param url WebSocket server URL
   */
  private constructor(url: string) {
    this.url = url;
  }

  /**
   * Get or create the singleton instance.
   */
  static getInstance(url: string) {
    if (!this.instance) this.instance = new ParkingWS(url);
    return this.instance;
  }

  /**
   * Establish a connection and optionally subscribe to a gate.
   * Subsequent calls are safe and will re-subscribe if already connected.
   */
  connect(gateId?: string) {
    if (gateId) this.gateId = gateId;
    this.shouldConnect = true;
    
    if (this.ws?.readyState === WebSocket.OPEN) {
      if (gateId) this.subscribeGate(gateId);
      return;
    }
    
    if (this.ws?.readyState === WebSocket.CONNECTING) {
      return;
    }
    
    this.openConnection();
  }

  /** Open the underlying WebSocket and set up handlers */
  private openConnection() {
    this.ws = new WebSocket(this.url);
    
    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      if (this.gateId) {
        this.subscribeGate(this.gateId);
      }
    };
    
    this.ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data) as IncomingMessage;
        this.listeners.forEach((listener) => listener(data));
      } catch (error) {
        console.error("Invalid WebSocket message:", error);
      }
    };
    
    this.ws.onclose = (event) => {
      this.ws = null;
      
     
      if (this.shouldConnect && event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => {
          if (this.shouldConnect) {
            this.openConnection();
          }
        }, this.reconnectDelay);
      }
    };
    
    this.ws.onerror = (error) => {
      console.error("WebSocket connection error:", error);
    };
  }

  /** Close the WebSocket gracefully and reset state */
  disconnect() {
    this.shouldConnect = false;
    if (this.ws) {
      this.ws.close(1000, "Client disconnecting");
      this.ws = null;
    }
    this.gateId = null;
  }

  /** Subscribe to updates for a specific gate */
  subscribeGate(gateId: string) {
    this.gateId = gateId;
    this.send({ type: "subscribe", payload: { gateId } });
  }

  /** Register a message listener and return an unsubscribe function */
  onMessage(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Whether the socket is currently open */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /** Send a message if the socket is open; otherwise warn */
  private send(msg: unknown) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    } else {
      console.warn("Cannot send message - WebSocket not open. State:", this.ws?.readyState);
    }
  }
}

/** Get the shared ParkingWS instance using the configured URL */
export function getParkingWS() {
  const url = (import.meta as ImportMeta).env?.VITE_API_WS || "ws://localhost:3000/api/v1/ws";
  return ParkingWS.getInstance(url);
}

/**
 * Quickly test if the WebSocket server can accept a connection.
 * Resolves to true on success, false otherwise (with timeout safeguard).
 */
export function testWebSocketConnection(): Promise<boolean> {
  return new Promise((resolve) => {
    const url = (import.meta as ImportMeta).env?.VITE_API_WS || "ws://localhost:3000/api/v1/ws";
    
    const testWs = new WebSocket(url);
    let resolved = false;
    
    const cleanup = () => {
      if (!resolved) {
        resolved = true;
        testWs.close();
      }
    };
    
    testWs.onopen = () => {
      cleanup();
      resolve(true);
    };
    
    testWs.onerror = (error) => {
      console.error("❌ WebSocket server is not available:", error);
      cleanup();
      resolve(false);
    };
    
    testWs.onclose = () => {
      if (!resolved) {
        cleanup();
        resolve(false);
      }
    };
    
    setTimeout(() => {
      if (!resolved) {
        cleanup();
        resolve(false);
      }
    }, 5000);
  });
}



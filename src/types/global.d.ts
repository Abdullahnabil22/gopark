declare global {
  interface Window {
    __ws_cleanup__?: () => void;
  }
}

export {};



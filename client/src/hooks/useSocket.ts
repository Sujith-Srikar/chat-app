"use client";

import { useState, useEffect } from "react";

export default function useSocket() {
  const [socket, setSocket] = useState<WebSocket | undefined>();

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => {
      setSocket(ws);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.close();
      setSocket(undefined);
    };
  }, []);

  return { socket };
}

"use client";

import { useState, useEffect, useContext, createContext } from "react";

const SocketContext = createContext<{socket?: WebSocket}>({ socket: undefined });

export function SocketProvider({children}: {children: React.ReactNode}) {
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

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const socket = useContext(SocketContext);
  if (!socket) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return socket;
}
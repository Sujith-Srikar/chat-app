import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8081 });

let sockets: WebSocket[] = [];

wss.on("connection", (ws) => {
  sockets.push(ws);

  ws.on("error", (err) => {
    console.error("Socket error:", err);
  });

  ws.on("message", (msg) => {
    try {
      sockets.forEach((socket) => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(msg);
        }
      });
    } catch (error) {
      console.error("Error broadcasting message:", error);
    }
  });

  ws.on("close", () => {
    console.log("Connection to relayer closed");
    // Remove socket when disconnected
    const index = sockets.indexOf(ws);
    if (index !== -1) {
      sockets.splice(index, 1);
    }
  });
});

console.log("Relayer server running on port 8081");

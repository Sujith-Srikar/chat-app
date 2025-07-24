import { WebSocketServer, WebSocket } from "ws";
import { Room } from "./types/types";
import MessageValidation from "./middleware/validation";

const wss = new WebSocketServer({ port: 8080 });

let users: Record<string, Room> = {}; // Record restricts for type string | number but where as Map can take any type as Key value

const RELAYER_URL = "ws://localhost:8081";
let relayer_ws: WebSocket | null  = null;

function connectToRelayer() {
  let ws = new WebSocket(RELAYER_URL);

  ws.onopen = () => {
    relayer_ws = ws;
  }

  ws.onclose = () => {
    relayer_ws = null;
  }

  ws.onmessage = (event) => {
    try {
      console.log("Relayer ws: ", event.data.toString());
      const { type, payload } = JSON.parse(event.data.toString());

      if (type == "chat" && users[payload.roomId]) {
        users[payload.roomId].sockets.forEach((socket) => {
          const data = {
            type: "chat",
            payload: {
              message: payload.message,
              senderName: payload.senderName,
            },
          };

          socket.socket.send(JSON.stringify(data));
        });
      }
    } catch (error) {
      console.error("Error processing relayer message:", error);
    }
  }
}

connectToRelayer();

wss.on("connection", (ws) => {
  ws.on("error", (err) => console.log(err));

  ws.on("message", (data) => {
    try {
      const validate = MessageValidation(data.toString());

      if (!validate.isValid) {
        const err = {
          type: "error",
          message: validate.errMsg,
        };

        ws.send(JSON.stringify(err));
        return;
      }

      const { type, payload } = validate.message!;

      if (type == "create") {
        if (!users[payload.roomId]) {
          users[payload.roomId] = { id: payload.roomId, sockets: [] };
        }
        if (!payload.senderName) throw new Error("Username is not defined");
        users[payload.roomId].sockets.push({
          name: payload.senderName,
          socket: ws,
        });
      }
      if (type == "join") {
        if (!users[payload.roomId]) {
          users[payload.roomId] = { id: payload.roomId, sockets: [] };
        }
        if (!payload.senderName) throw new Error("Username is not defined");
        users[payload.roomId].sockets.push({
          name: payload.senderName,
          socket: ws,
        });
      }
      if (type == "chat") {
        console.log("Chat: ", {type, payload});
        if(relayer_ws && relayer_ws.readyState === WebSocket.OPEN)
          relayer_ws.send(JSON.stringify({ type, payload }));
      }
    } catch (error) {
      console.log(error);
      const err = {
        type: "error",
        message:
          error instanceof Error ? error.message : "Server error occurred",
      };

      ws.send(JSON.stringify(err));
    }
  });

  ws.on("close", () => {
    Object.keys(users).forEach((roomId) => {
      users[roomId].sockets = users[roomId].sockets.filter(
        (socket) => socket.socket !== ws
      );

      if (users[roomId].sockets.length === 0) delete users[roomId];
    });
  });
});

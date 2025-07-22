import { WebSocketServer } from "ws";
import { Room } from "./types/types";
import MessageValidation from "./middleware/validation";

const wss = new WebSocketServer({port: 8080});

let users: Record<string, Room> = {}; // Record restricts for type string | number but where as Map can take any type as Key value

wss.on("connection", (ws) => {
    ws.on("error", (err) => console.log(err))

    ws.on("message", (data) => {
        try {
            const validate = MessageValidation(data.toString());
            
            if(!validate.isValid){
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
              if (!payload.senderName)
                throw new Error("Username is not defined");
              users[payload.roomId].sockets.push({ name: payload.senderName, socket: ws });
            }
            if (type == "join") {
              if (!users[payload.roomId]) {
                users[payload.roomId] = { id: payload.roomId, sockets: [] };
              }
              if(!payload.senderName)
                throw new Error("Username is not defined");
              users[payload.roomId].sockets.push({ name: payload.senderName, socket: ws });
            }
            if (type == "chat") {
              users[payload.roomId].sockets.forEach((socket) => {
                const data = {
                  type: "chat",
                  message: payload.message,
                  senderName: payload.senderName,
                };

                if (socket.socket != ws) socket.socket.send(JSON.stringify(data));
              });
            }
        } catch (error) {
            console.log(error);
            const err = {
              type: "error",
              message:
                error instanceof Error
                  ? error.message
                  : "Server error occurred",
            };

            ws.send(JSON.stringify(err));
        }
    })

    ws.on("close", () => {
        Object.keys(users).forEach((roomId) => {
            users[roomId].sockets = users[roomId].sockets.filter(socket => socket.socket !== ws);

            if(users[roomId].sockets.length===0)
                delete users[roomId]
        })
    })
})

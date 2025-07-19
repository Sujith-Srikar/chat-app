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
                ws.send(
                  JSON.stringify({
                    type: "error",
                    message: validate.errMsg,
                  })
                );

                return;
            }

            const { type, payload } = validate.message!;

            if (type == "create") {
              if (!users[payload.roomId]) {
                users[payload.roomId] = { id: payload.roomId, sockets: [] };
              }
              users[payload.roomId].sockets.push(ws);
            }
            if (type == "join") {
              if (!users[payload.roomId]) {
                throw new Error("Room does not found");
              }
              users[payload.roomId].sockets.push(ws);
            }
            if (type == "chat") {
              console.log(validate.message)
              users[payload.roomId].sockets.forEach((socket) => {
                if (socket != ws) socket.send(payload.message!);
              });
            }
        } catch (error) {
            console.log(error);
            ws.send(
              JSON.stringify({
                type: "error",
                message:
                  error instanceof Error
                    ? error.message
                    : "Server error occurred",
              })
            );
        }
    })

    ws.on("close", () => {
        Object.keys(users).forEach((roomId) => {
            users[roomId].sockets = users[roomId].sockets.filter(socket => socket !== ws);

            if(users[roomId].sockets.length===0)
                delete users[roomId]
        })
    })
})

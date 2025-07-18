import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({port: 8080});

interface Room{
    sockets: WebSocket[]
}

let users: Record<string, Room> = {};

wss.on("connection", (ws) => {
    ws.on("error", (err) => console.log(err))

    ws.on("message", (data) => {
       const {type, payload} = JSON.parse(data.toString());
       if (type == "create") {
         if (!users[payload.roomId]) {
           users[payload.roomId] = { sockets: [] };
         }
         users[payload.roomId].sockets.push(ws);
       }
        if(type=="join"){
            if (!users[payload.roomId]) {
                throw new Error("Room does not found")
            }
            users[payload.roomId].sockets.push(ws);
        }
        if(type == "chat"){
            users[payload.roomId].sockets.forEach((socket) => {
                if(socket!=ws)
                    socket.send(payload.message);
            })
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

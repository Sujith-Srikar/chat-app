import { WebSocket } from "ws";

interface Message {
  type: "create" | "join" | "chat" | "leave";
  payload: {
    roomId: string;
    message?: string;
    senderName?: string;
  };
}

interface Room {
  id: string;
  sockets: {name: string, socket: WebSocket}[];
}

interface ValidationResult{
  isValid: boolean,
  errMsg: string,
  message?: Message
}

export {Message, Room, ValidationResult}
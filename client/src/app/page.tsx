"use client"
import { useState, useEffect } from "react";
    
export default function Home() {

  const [socket, setSocket] = useState<WebSocket | undefined>();
  const [message, setMessages] = useState([""]);
  const [usermsg, setUserMsg] = useState("");

  function handleSend() {
    try {
      if(!socket)
        throw new Error("Socket connection is not proper")

      const data = {
        "type" : "chat",
        "payload": {
          "roomId": "123",
          "message": usermsg
        }
      }

      socket.send(JSON.stringify(data))
      setUserMsg('');
    } catch (error) {
      console.log(error)
    }
  }
  useEffect(() => {
    const wss = new WebSocket("ws://localhost:8080");

    wss.onopen = () => {
      console.log("Connection establised")
      const data = {
        type: "join",
        payload: {
          roomId: "123",
        },
      };

      wss.send(JSON.stringify(data));
    }

    wss.onmessage = (msg) => {
      setMessages([...message, msg.data]);
    }

    setSocket(wss);

    return () => {
      wss.close();
    }
  }, [])

  return (
    <div className="flex justify-center items-center">
      <div className="outer flex flex-col justify-between items-center w-[50vw] h-[85vh] border border-white m-10">
        <div className="header flex flex-col justify-start w-full p-4 h-[10%]">
          <span>Real Time Chat</span>
          <span>temporary room that expires after all users exit</span>
        </div>
        <div className="room-info bg-gray-800 mb-4 p-4 flex justify-between w-[95%] rounded-4xl h-[10%]">
          <span>Room Code : 782423</span>
          <span>Users : 1</span>
        </div>
        <div className="messages h-[60%] w-[95%] rounded-xl border border-white">
          {message.map((msg, idx) => <span key={idx} className="flex items-start m-2">{msg}</span>)}
        </div>
        <div className="text-box w-full flex justify-evenly h-[10%]">
          <input type="text" value={usermsg} placeholder="type a message ..." className="w-[60%] border border-gray-800" onChange={(e) => setUserMsg(e.target.value)}/>
          <button className="w-[40%] p-4 bg-white text-black" onClick={handleSend}>Send</button>
        </div>
      </div>
    </div>
  );
}

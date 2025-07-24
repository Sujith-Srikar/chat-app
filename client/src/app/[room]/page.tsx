"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";

interface MessageFormat {
  msg: string;
  isMine: boolean;
  name: string;
}

export default function Room() {
  const [messages, setMessages] = useState<MessageFormat[]>([]);
  const [userMsg, setUserMsg] = useState("");
  const [userCount, setUserCount] = useState(1);
  const { socket } = useSocket();
  const roomId = useParams().room as string;
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");

  function handleClipBoard() {
    navigator.clipboard.writeText(roomId);
  }

  function handleSend() {
    try {
      if (!socket) throw new Error("Socket connection is not proper");
      if (!userMsg.trim()) return;

      const data = {
        type: "chat",
        payload: {
          roomId: roomId,
          message: userMsg.trim(),
          senderName: userName
        },
      };

      setMessages((prevmsg) => [
        ...prevmsg,
        { msg: userMsg.trim(), isMine: true, name: "You" },
      ]);
      socket.send(JSON.stringify(data));
      setUserMsg("");
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (!socket) return;

    const name = localStorage.getItem('userName');
    if(!name){
      setError("UserName not defined")
      return;
    }
    setUserName(name);

    socket.onmessage = (msg) => {
      const parsedData = JSON.parse(msg.data);
      console.log(parsedData)
        try {
          if (parsedData.type === "error") {
            setError(parsedData.message);
          }
        } catch (e) {
          console.error("Failed to parse message data:", e);
        }
        if (parsedData.type === "chat") {
          if (parsedData.payload.senderName != name) {
          
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              msg: parsedData.payload.message,
              isMine: false,
              name: parsedData.payload.senderName || "Unknown",
            },
          ]);
        }
      }

    socket.onerror = (error) => {
      console.error("Socket error:", error);
    };
    console.log(messages);

    return () => {
      socket.onmessage = null;
      socket.onerror = null;
    };
  };
  }, [socket, roomId]);

  if (error)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-bold text-red-400 mb-2">
            Connection Error
          </h2>
          <p className="text-gray-300">{error}</p>
          <button
            onClick={() => (window.location.href = "/")}
            className="mt-4 bg-white text-black px-4 py-2 rounded hover:bg-gray-200 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto border border-gray-700 rounded-lg h-[90vh] flex flex-col shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-gray-700 bg-gray-900/30">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-full h-full text-white"
              >
                <path
                  d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <h1 className="text-xl md:text-2xl font-bold">Real Time Chat</h1>
          </div>
          <p className="text-gray-400 text-sm">
            temporary room that expires after all users exit
          </p>
        </div>

        {/* Room Info */}
        <div className="bg-gray-800 mx-4 md:mx-6 my-3 rounded-lg px-3 py-2 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-white text-sm">
              Room Code: {roomId?.toUpperCase()}
            </span>
            <button
              className="text-gray-400 hover:text-white transition-colors"
              onClick={handleClipBoard}
              title="Copy room code"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-white text-sm">Users: {userCount}</span>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 mx-4 md:mx-6 mb-3 border border-gray-700 rounded-lg bg-gray-900/20 overflow-hidden">
          <div className="h-full overflow-y-auto w-full p-3 space-y-3">
            {messages.filter((msg) => msg.msg.trim() !== "").length === 0 && (
              <div className="text-gray-500 text-center text-sm py-6">
                No messages yet...
              </div>
            )}
            {messages
              .filter((msg) => msg.msg.trim() !== "")
              .map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    msg.isMine ? "items-end" : "items-start"
                  }`}
                >
                  <div>{msg.name}</div>
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-lg ${
                      msg.isMine
                        ? "bg-white text-black rounded-tr-none"
                        : "bg-gray-700 text-white rounded-tl-none"
                    } shadow-sm`}
                  >
                    {msg.msg}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 border-t border-gray-700 bg-gray-900/30">
          <div className="flex gap-2">
            <input
              type="text"
              value={userMsg}
              onChange={(e) => setUserMsg(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-all"
            />
            <button
              onClick={handleSend}
              disabled={!userMsg.trim() || !socket}
              className="bg-white text-black px-5 py-3 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex-shrink-0"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
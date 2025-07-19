"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import useSocket from "@/hooks/useSocket";

export default function Room() {
  const [messages, setMessages] = useState<string[]>([]);
  const [userMsg, setUserMsg] = useState("");
  const [userCount, setUserCount] = useState(1);
  const { socket } = useSocket();
  const roomId = useParams().room as string;

  function handleClipBoard(){
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
          message: userMsg,
        },
      };

      socket.send(JSON.stringify(data));
      setUserMsg("");
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (!socket) return;

    const data = {
      type: "join",
      payload: {
        roomId: roomId,
      },
    };
    socket.send(JSON.stringify(data));

    socket.onmessage = (msg) => {
      console.log(msg);
      setMessages((prevMessages) => [...prevMessages, msg.data]);
    };

    socket.onerror = (error) => {
      console.error("Socket error:", error);
    };

    return () => {
      socket.onmessage = null;
      socket.onerror = null;
    };
  }, [socket, roomId]);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto border border-gray-600 rounded-lg h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-600">
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
            <h1 className="text-2xl font-bold">Real Time Chat</h1>
          </div>
          <p className="text-gray-400 text-sm">
            temporary room that expires after all users exit
          </p>
        </div>

        {/* Room Info */}
        <div className="bg-gray-800 mx-6 my-4 rounded-lg px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-white text-sm">
              Room Code: {roomId?.toUpperCase()}
            </span>
            <button className="text-gray-400 hover:text-white" onClick={handleClipBoard}>
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
          <span className="text-white text-sm">Users: {userCount}</span>
        </div>

        {/* Messages Container */}
        <div className="flex-1 mx-6 mb-4 border border-gray-600 rounded-lg bg-black overflow-hidden">
          <div className="h-full overflow-y-auto p-4 space-y-2">
            {messages
              .filter((msg) => msg.trim() !== "")
              .map((msg, idx) => (
                <div key={idx} className="text-white text-sm">
                  {msg}
                </div>
              ))}
            {messages.filter((msg) => msg.trim() !== "").length === 0 && (
              <div className="text-gray-500 text-center text-sm">
                No messages yet...
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-gray-600">
          <div className="flex gap-3">
            <input
              type="text"
              value={userMsg}
              onChange={(e) => setUserMsg(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
            />
            <button
              onClick={handleSend}
              disabled={!userMsg.trim() || !socket}
              className="bg-white text-black px-6 py-3 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

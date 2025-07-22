"use client";
import {useSocket} from "@/hooks/useSocket";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { socket } = useSocket();
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const router = useRouter();

  function handleJoin() {
    try {
      if (!socket) throw new Error("Socket connection is not proper");
      if (!roomId.trim()) return;

      const data = {
        type: "join",
        payload: {
          roomId: roomId.trim(),
        },
      };

      socket.send(JSON.stringify(data));
      router.push(`/${roomId.trim()}`);
    } catch (error) {
      console.log(error);
    }
  }

  function handleCreateRoom() {
    try {
      if (!socket) throw new Error("Socket connection is not proper");

      const newRoomId = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

      const data = {
        type: "create",
        payload: {
          roomId: newRoomId,
        },
      };

      socket.send(JSON.stringify(data));
      router.push(`/${newRoomId}`);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex justify-center items-center p-8">
      <div className="w-full max-w-2xl border border-gray-600 rounded-lg p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-full h-full text-white"
              >
                <path
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">Real Time Chat</h1>
          </div>
          <p className="text-gray-400 text-sm">
            temporary room that expires after all users exit
          </p>
        </div>

        {/* Create New Room Button */}
        <button
          onClick={handleCreateRoom}
          disabled={!socket}
          className="w-full bg-white text-black py-4 rounded-lg text-lg font-medium mb-8 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create New Room
        </button>

        {/* Input Fields */}
        <div className="space-y-4 mb-8">
          <input
            type="text"
            placeholder="Enter your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full bg-transparent border border-gray-600 rounded-lg px-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
          />

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter Room Code"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleJoin()}
              className="flex-1 bg-transparent border border-gray-600 rounded-lg px-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
            />
            <button
              onClick={handleJoin}
              disabled={!roomId.trim() || !socket}
              className="bg-white text-black px-6 py-4 rounded-lg font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Join Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

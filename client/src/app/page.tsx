"use client";
import useSocket from "@/hooks/useSocket";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {

  const {socket} = useSocket();
  const [roomId, setRoomId] = useState("");
  const router = useRouter();

  function handleJoin(){
    try {
      if(!socket) throw new Error("Socket connection is not proper");

      const data = {
        type: "join",
        payload: {
          roomId: roomId.trim()
        }
      };

      socket.send(JSON.stringify(data))

      router.push(`/${roomId.trim()}`);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <div className="flex justify-center items-center w-full h-screen">
        <div className="outer flex flex-col justify-between items-center w-[50vw] h-[87vh] border border-white">
          <div className="w-[95%] h-full flex flex-col justify-between items-center py-4">
            <div className="header flex flex-col justify-start w-full h-[10%]">
              <span className="text-3xl">Real Time Chat</span>
              <span className="text-[#9EA0A3]">
                temporary room that expires after all users exit
              </span>
            </div>
            <button className="bg-white w-full text-black rounded-xl p-4">
              Create Room
            </button>
            <div>
              <input
                type="text"
                placeholder="Enter your name"
                className="border border-white w-full p-4"
              />
              <input
                type="text"
                placeholder="Enter your room id"
                className="border border-white w-full p-4"
                onChange={(e) => setRoomId(e.target.value)}
              />
            </div>
            <button className="bg-white w-full text-black rounded-xl p-4" onClick={handleJoin}>
              Join Room
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

"use client";

import { useState } from "react";
import { FaPaperPlane } from "react-icons/fa";

export default function AIAssistantCard() {
  const [message, setMessage] = useState("");

  const send = () => {
    if (!message.trim()) return;

    alert(`You asked: ${message}`);

    setMessage("");
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-slate-800 rounded-3xl p-6">

      <h2 className="text-xl font-bold text-white mb-5">
        AI Academic Assistant
      </h2>

      <div className="bg-slate-800 rounded-xl p-4 mb-5 text-slate-300">
        👋 Hi Student! How can I help you today?
      </div>

      <div className="flex gap-3">

        <input
          className="flex-1 bg-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 border border-transparent"
          placeholder="Ask anything..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              send();
            }
          }}
        />

        <button
          onClick={send}
          className="bg-indigo-600 hover:bg-indigo-500 px-5 rounded-xl text-white transition"
        >
          <FaPaperPlane />
        </button>

      </div>

    </div>
  );
}
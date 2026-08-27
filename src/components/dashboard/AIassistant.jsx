"use client";

import { useState } from "react";
import { FaPaperPlane } from "react-icons/fa";

export default function AIAssistantCard() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setReply("");

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setReply(data.reply);
      } else {
        // Show exact error message from API backend
        setReply(data.message || "Sorry, I could not answer your question.");
      }
    } catch (error) {
      console.error(error);
      setReply("Something went wrong. Please try again.");
    }

    setLoading(false);
    setMessage("");
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-slate-800 rounded-3xl p-6">
      <h2 className="text-xl font-bold text-white mb-5">
        AI Academic Assistant
      </h2>

      {/* AI Response */}
      <div className="bg-slate-800 rounded-xl p-4 mb-5 text-slate-300 min-h-[80px]">
        {loading ? (
          <p className="text-indigo-400">AI is thinking...</p>
        ) : reply ? (
          <p className="whitespace-pre-wrap">{reply}</p>
        ) : (
          <p>👋 Hi Student! How can I help you today?</p>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <input
          className="flex-1 bg-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Ask anything..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              send();
            }
          }}
          disabled={loading}
        />

        <button
          onClick={send}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-5 rounded-xl text-white"
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import {
  FaPaperPlane,
  FaRobot,
  FaBookOpen,
  FaComments,
  FaFileUpload,
  FaTrash,
  FaArrowLeft,
} from "react-icons/fa";

export default function AIAssistantPage() {
  const [activeTab, setActiveTab] = useState("chat");
  const defaultMessage = [
    {
      role: "assistant",
      content:
        "Hello! I am your AI Academic Assistant. How can I help you with your courses, schedules, or study notes today?",
    },
  ];
  const [messages, setMessages] = useState(defaultMessage);
  const [input, setInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [notesSummary, setNotesSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  // Handle Text File Reading
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setNotesInput(event.target.result);
    };
    reader.readAsText(file);
  };

  // Send message for chat tab
  const sendMessage = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMessage = { role: "user", content: query };
    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });

      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.message || "Sorry, I could not process that request." },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please check your connection." },
      ]);
    }
    setLoading(false);
  };

  // Summarize Academic Notes
  const handleSummarizeNotes = async (actionType) => {
    if (!notesInput.trim()) return;

    setLoading(true);
    setNotesSummary("");

    const promptText =
      actionType === "quiz"
        ? `Generate 3 viva/exam questions with concise answers based on these notes:\n\n${notesInput}`
        : `Provide a concise bullet-point summary of these study notes:\n\n${notesInput}`;

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: promptText }),
      });

      const data = await res.json();
      if (data.success) {
        setNotesSummary(data.reply);
      } else {
        setNotesSummary(data.message || "Failed to analyze notes.");
      }
    } catch (error) {
      setNotesSummary("Error analyzing notes. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-5xl mx-auto p-4 gap-4">
      {/* Header with Back to Dashboard Button */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition flex items-center justify-center"
            title="Back to Dashboard"
          >
            <FaArrowLeft className="text-lg" />
          </Link>

          <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-2xl">
            <FaRobot className="text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Academic AI Workspace</h1>
            <p className="text-sm text-slate-400">Interactive study tools & instant AI assistant</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeTab === "chat" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <FaComments /> AI Chat
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeTab === "notes" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <FaBookOpen /> Notes & Summaries
          </button>
        </div>
      </div>

      {/* TAB 1: AI CHAT */}
      {activeTab === "chat" && (
        <>
          {/* Chat Container with Clear Chat Header */}
          <div className="flex-1 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between overflow-hidden">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
              <span className="text-xs text-slate-400 font-medium">Conversation History</span>
              {messages.length > 1 && (
                <button
                  onClick={() => setMessages(defaultMessage)}
                  className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-xl border border-slate-700"
                >
                  <FaTrash /> Clear Chat
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-slate-800 text-slate-200 border border-slate-700/50 rounded-bl-none prose prose-invert max-w-none"
                    }`}
                  >
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 border border-slate-700/50 text-indigo-400 p-4 rounded-2xl text-sm animate-pulse">
                    AI Assistant is thinking...
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 bg-slate-900 border border-slate-800 p-2 rounded-2xl">
            <input
              className="flex-1 bg-transparent px-4 py-2 text-white outline-none placeholder-slate-500 text-sm"
              placeholder="Ask your AI assistant anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              disabled={loading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-5 py-2.5 rounded-xl text-white transition flex items-center justify-center"
            >
              <FaPaperPlane />
            </button>
          </div>
        </>
      )}

      {/* TAB 2: ACADEMIC NOTES TOOL */}
      {activeTab === "notes" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-hidden">
          {/* Notes Input Area */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Paste Notes / Upload File</h3>

              <div className="flex items-center gap-2">
                {notesInput && (
                  <button
                    onClick={() => {
                      setNotesInput("");
                      setFileName("");
                    }}
                    className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700"
                  >
                    <FaTrash /> Clear Text
                  </button>
                )}

                <label className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-indigo-400 px-3 py-1.5 rounded-xl text-xs cursor-pointer border border-slate-700 transition">
                  <FaFileUpload />
                  <span>{fileName ? fileName.slice(0, 12) + "..." : "Upload File"}</span>
                  <input
                    type="file"
                    accept=".txt,.md,.json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <textarea
              className="flex-1 bg-slate-800 border border-slate-700/50 rounded-2xl p-4 text-slate-200 text-sm outline-none resize-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Paste your raw notes, chapter text, or syllabus here..."
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
            />

            <div className="flex gap-3">
              <button
                onClick={() => handleSummarizeNotes("summary")}
                disabled={loading || !notesInput.trim()}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-3 rounded-xl text-white text-xs font-semibold transition"
              >
                Summarize Notes
              </button>
              <button
                onClick={() => handleSummarizeNotes("quiz")}
                disabled={loading || !notesInput.trim()}
                className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-indigo-400 disabled:opacity-50 py-3 rounded-xl text-xs font-semibold transition"
              >
                Generate Viva Prep
              </button>
            </div>
          </div>

          {/* AI Output Area */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">AI Study Insights</h3>

              {notesSummary && (
                <button
                  onClick={() => setNotesSummary("")}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition bg-slate-800 px-3 py-1 rounded-xl border border-slate-700"
                >
                  <FaTrash /> Clear Insight
                </button>
              )}
            </div>

            <div className="flex-1 bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 text-slate-300 text-sm overflow-y-auto prose prose-invert max-w-none">
              {loading ? (
                <p className="text-indigo-400 animate-pulse">Processing your notes...</p>
              ) : notesSummary ? (
                <ReactMarkdown>{notesSummary}</ReactMarkdown>
              ) : (
                <p className="text-slate-500 italic">
                  Paste your notes or upload a file on the left, then click &apos;Summarize Notes&apos; or &apos;Generate Viva Prep&apos;.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
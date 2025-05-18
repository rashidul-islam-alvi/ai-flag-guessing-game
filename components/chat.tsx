"use client";

import { useState } from "react";
import Message from "./message";

type ChatMessage = {
  role: "user" | "ai";
  content: string;
};

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Clear any previous errors
    setError(null);

    // Add user message immediately
    const userMessage: ChatMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);

    // Clear input and set loading state
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hiddenFlag: "France",
          userInput: currentInput,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle API errors
        throw new Error(data.error || `HTTP error! status: ${res.status}`);
      }

      // Add AI response
      const aiMessage: ChatMessage = {
        role: "ai",
        content: data.reply || "I'm sorry, I couldn't generate a response.",
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);

      // Set error state
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to send message. Please try again.";
      setError(errorMessage);

      // Add error message to chat
      const errorAiMessage: ChatMessage = {
        role: "ai",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorAiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4">
      {/* Error display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 underline text-sm"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Chat messages */}
      <div className="h-[400px] overflow-y-scroll border p-4 rounded bg-white shadow">
        {messages.length === 0 && (
          <div className="text-gray-500 text-center">
            Start by asking a question or making a guess about the hidden flag!
          </div>
        )}
        {messages.map((msg, i) => (
          <Message key={i} role={msg.role} content={msg.content} />
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center text-gray-500 mt-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-2"></div>
            AI is thinking...
          </div>
        )}
      </div>

      {/* Input section */}
      <div className="flex mt-4 gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="flex-1 border px-4 py-2 rounded shadow text-black disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder={isLoading ? "Sending..." : "Ask a question or guess..."}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
        >
          {isLoading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}

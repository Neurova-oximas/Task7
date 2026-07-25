import { useEffect, useRef } from "react";
import MessageCard from "./MessageCard.jsx";

function ThinkingIndicator() {
  return (
    <div className="flex justify-start px-6 py-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl px-5 py-4 flex items-center gap-1.5">
        <span
          className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
      </div>
    </div>
  );
}

export default function ChatThread({ messages, loading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.length === 0 && !loading ? (
        <div className="h-full flex flex-col items-center justify-center text-center px-8">
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 text-violet-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          </div>
          <h2 className="text-gray-300 text-lg font-medium mb-2">
            Ask anything about code
          </h2>
          <p className="text-gray-500 text-sm max-w-sm">
            Get explanations, generate code, debug errors, or explore new concepts.
          </p>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto w-full py-6 space-y-2">
          {messages.map((msg, i) => (
            <MessageCard key={i} query={msg.query} response={msg.response} />
          ))}
          {loading && <ThinkingIndicator />}
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}

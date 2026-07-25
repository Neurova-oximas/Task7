import { useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import ChatThread from "./components/ChatThread.jsx";
import InputPanel from "./components/InputPanel.jsx";
import { sendMessage } from "./api/chat.js";

// Set to true to test UI without a running backend
const MOCK_MODE = true;

async function mockSendMessage(query) {
  await new Promise((r) => setTimeout(r, 900));
  const isCode =
    query.toLowerCase().includes("write") ||
    query.toLowerCase().includes("generate") ||
    query.toLowerCase().includes("code") ||
    query.toLowerCase().includes("function");

  if (isCode) {
    return {
      type: "generation",
      content: {
        code: `def greet(name: str) -> str:\n    """Return a greeting string."""\n    return f"Hello, {name}!"\n\nif __name__ == "__main__":\n    print(greet("World"))`,
        explanation: `This is a mock response for: "${query}". Connect your backend at localhost:8000 to get real answers.`,
      },
    };
  }
  return {
    type: "explanation",
    content: {
      explanation: `This is a mock response for: "${query}". Connect your backend at localhost:8000 to get real answers. The frontend is working correctly!`,
      code: null,
    },
  };
}

export default function App() {
  // Each session: { id, messages: [{ query, response }] }
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [loading, setLoading] = useState(false);

  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? null;
  const messages = activeSession?.messages ?? [];

  function handleNewChat() {
    setActiveSessionId(null);
  }

  function handleSelectSession(id) {
    setActiveSessionId(id);
  }

  async function handleSubmit(query) {
    if (!query.trim() || loading) return;

    // If no active session, create one now
    let sessionId = activeSessionId;
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      setSessions((prev) => [
        { id: sessionId, messages: [] },
        ...prev,
      ]);
      setActiveSessionId(sessionId);
    }

    // Append user message immediately with null response
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, messages: [...s.messages, { query, response: null }] }
          : s
      )
    );
    setLoading(true);

    try {
      const response = MOCK_MODE
        ? await mockSendMessage(query)
        : await sendMessage(query);

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== sessionId) return s;
          const msgs = [...s.messages];
          msgs[msgs.length - 1] = { query, response };
          return { ...s, messages: msgs };
        })
      );
    } catch (err) {
      const errorResponse = {
        type: "explanation",
        content: {
          explanation: `Backend error: ${err.message}. Make sure your server is running on localhost:8000, or set MOCK_MODE = true in App.jsx to test without a backend.`,
          code: null,
        },
      };
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== sessionId) return s;
          const msgs = [...s.messages];
          msgs[msgs.length - 1] = { query, response: errorResponse };
          return { ...s, messages: msgs };
        })
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950">
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
      />
      <div className="flex flex-col flex-1 min-w-0">
        <ChatThread messages={messages} loading={loading} />
        <InputPanel onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
}

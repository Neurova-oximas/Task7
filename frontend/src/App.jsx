import { useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import ChatThread from "./components/ChatThread.jsx";
import InputPanel from "./components/InputPanel.jsx";
import { sendMessage } from "./api/chat.js";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(query) {
    if (!query.trim() || loading) return;

    setMessages((prev) => [...prev, { query, response: null }]);
    setLoading(true);

    try {
      const response = await sendMessage(query);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { query, response };
        return updated;
      });
    } catch (err) {
      const errorResponse = {
        type: "explanation",
        content: {
          explanation: `Something went wrong: ${err.message}`,
          code: null,
        },
      };
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { query, response: errorResponse };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950">
      <Sidebar messages={messages} />
      <div className="flex flex-col flex-1 min-w-0">
        <ChatThread messages={messages} loading={loading} />
        <InputPanel onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
}

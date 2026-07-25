export default function Sidebar({ messages }) {
  return (
    <aside className="w-64 shrink-0 bg-gray-900 border-r border-gray-700 flex flex-col h-full">
      <div className="p-4 border-b border-gray-700">
        <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-xs text-center mt-6 px-4">
            No conversations yet
          </p>
        ) : (
          <ul className="space-y-0.5 px-2">
            {messages.map((msg, i) => (
              <li key={i}>
                <button className="w-full text-left px-3 py-2 rounded-md text-gray-400 hover:text-gray-100 hover:bg-gray-800 text-sm truncate transition-colors">
                  {msg.query.slice(0, 40)}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="p-4 border-t border-gray-700">
        <p className="text-gray-600 text-xs text-center">AI Coding Assistant</p>
      </div>
    </aside>
  );
}

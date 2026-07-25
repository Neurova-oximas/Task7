import { useState } from "react";
import CodeBlock from "./CodeBlock.jsx";

function Badge({ type }) {
  const label = type === "generation" ? "Generated" : "Explanation";
  return (
    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-500/15 text-violet-400 border border-violet-500/25">
      {label}
    </span>
  );
}

export default function MessageCard({ query, response }) {
  const [explanationOpen, setExplanationOpen] = useState(false);

  return (
    <div className="px-6 py-2 space-y-3">
      {/* User bubble — right aligned */}
      <div className="flex justify-end">
        <div className="max-w-[75%] bg-violet-600/20 border border-violet-500/20 text-gray-100 rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap">
          {query}
        </div>
      </div>

      {/* Assistant response — left aligned */}
      {response && (
        <div className="flex justify-start">
          <div className="max-w-[85%] bg-gray-800 border border-gray-700 rounded-2xl rounded-tl-sm px-4 py-3 space-y-3">
            <Badge type={response.type} />

            {response.type === "explanation" && (
              <p className="text-gray-200 text-sm leading-relaxed">
                {response.content.explanation}
              </p>
            )}

            {response.type === "generation" && (
              <>
                {response.content.code && (
                  <CodeBlock code={response.content.code} language="python" />
                )}

                {response.content.explanation && (
                  <div className="border-t border-gray-700 pt-3">
                    <button
                      onClick={() => setExplanationOpen((o) => !o)}
                      className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors w-full text-left"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          explanationOpen ? "rotate-90" : ""
                        }`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                      Explanation
                    </button>

                    {explanationOpen && (
                      <p className="mt-2 text-gray-300 text-sm leading-relaxed pl-5">
                        {response.content.explanation}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

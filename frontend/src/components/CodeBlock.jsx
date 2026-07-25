import { useEffect, useRef, useState } from "react";

export default function CodeBlock({ code, language = "python" }) {
  const codeRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    if (codeRef.current && window.hljs) {
      codeRef.current.removeAttribute("data-highlighted");
      window.hljs.highlightElement(codeRef.current);
    }
  }, [code, language]);

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleRun() {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  }

  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-700 bg-[#0d1117] font-mono text-sm">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-violet-500/30">
        <span className="text-xs text-violet-400 font-medium tracking-wide uppercase">
          {language}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRun}
            className="text-xs text-gray-400 hover:text-gray-200 px-2 py-1 rounded hover:bg-gray-700 transition-colors flex items-center gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3 h-3"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Run
          </button>
          <button
            onClick={handleCopy}
            className="text-xs text-gray-400 hover:text-gray-200 px-2 py-1 rounded hover:bg-gray-700 transition-colors flex items-center gap-1"
          >
            {copied ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3 h-3 text-violet-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-violet-400">Copied</span>
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code body */}
      <pre className="overflow-x-auto p-4 m-0 bg-[#0d1117]">
        <code ref={codeRef} className={`language-${language}`}>
          {code}
        </code>
      </pre>

      {/* "Coming soon" toast */}
      {toastVisible && (
        <div className="absolute bottom-3 right-3 bg-gray-700 border border-gray-600 text-gray-200 text-xs px-3 py-1.5 rounded-md shadow-lg">
          🚧 Coming soon
        </div>
      )}
    </div>
  );
}

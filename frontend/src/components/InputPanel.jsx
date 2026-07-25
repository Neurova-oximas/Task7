import { useRef, useState } from "react";

const ACCEPTED_EXTENSIONS = ".py,.js,.ts,.cpp,.c,.java,.txt";

export default function InputPanel({ onSubmit, loading }) {
  const [value, setValue] = useState("");
  // attachment: { name, content } | null
  const [attachment, setAttachment] = useState(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  function resizeTextarea(el) {
    if (!el) return;
    el.style.height = "auto";
    const maxHeight = 24 * 5 + 24;
    el.style.height = Math.min(el.scrollHeight, maxHeight) + "px";
  }

  function handleInput(e) {
    setValue(e.target.value);
    resizeTextarea(e.target);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function submit() {
    const trimmed = value.trim();
    // Need either text or attachment (or both)
    if ((!trimmed && !attachment) || loading) return;

    // Build the full query: user text + file content appended
    let fullQuery = trimmed;
    if (attachment) {
      fullQuery = trimmed
        ? `${trimmed}\n\n--- ${attachment.name} ---\n${attachment.content}`
        : `--- ${attachment.name} ---\n${attachment.content}`;
    }

    onSubmit(fullQuery);
    setValue("");
    setAttachment(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAttachment({ name: file.name, content: ev.target.result });
    };
    reader.readAsText(file);
    // Reset so same file can be re-selected
    e.target.value = "";
  }

  function removeAttachment() {
    setAttachment(null);
  }

  const canSubmit = (value.trim() || attachment) && !loading;

  return (
    <div className="border-t border-gray-700 bg-gray-950 px-4 py-4">
      <div className="max-w-3xl mx-auto space-y-2">

        {/* Attachment pill */}
        {attachment && (
          <div className="flex items-center gap-2 px-1">
            <div className="flex items-center gap-1.5 bg-gray-800 border border-gray-700 rounded-md px-2.5 py-1 text-xs text-gray-300">
              {/* File icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-violet-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <span className="max-w-[200px] truncate">{attachment.name}</span>
              <button
                onClick={removeAttachment}
                className="ml-1 text-gray-500 hover:text-gray-200 transition-colors"
                title="Remove file"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Input row */}
        <div className="flex items-end gap-2 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 focus-within:border-violet-500/60 transition-colors">
          {/* File upload button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 mb-1 p-1.5 rounded-md text-gray-400 hover:text-gray-200 hover:bg-gray-700 transition-colors"
            title="Attach a file"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS}
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={attachment ? "Add a question about this file… (optional)" : "Ask a coding question… (Enter to send, Shift+Enter for newline)"}
            disabled={loading}
            className="flex-1 resize-none bg-transparent text-gray-100 placeholder-gray-500 text-sm leading-6 outline-none max-h-[144px] py-1 disabled:opacity-50"
          />

          {/* Submit button */}
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className="shrink-0 mb-1 p-1.5 rounded-md bg-violet-500 hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
            title="Send"
          >
            {loading ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="2" x2="12" y2="6" />
                <line x1="12" y1="18" x2="12" y2="22" />
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
                <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                <line x1="2" y1="12" x2="6" y2="12" />
                <line x1="18" y1="12" x2="22" y2="12" />
                <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
                <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </button>
        </div>

        <p className="text-gray-600 text-xs text-center">
          Shift+Enter for newline · Attach .py .js .ts .cpp .c .java .txt
        </p>
      </div>
    </div>
  );
}

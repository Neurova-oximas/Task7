// src/api/chat.js
export async function sendMessage(query, attachment = null) {
  const body = { query };
  if (attachment) {
    body.filename = attachment.name;
    body.file_content = attachment.content;  // raw text, backend does RAG
  }
  const res = await fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}
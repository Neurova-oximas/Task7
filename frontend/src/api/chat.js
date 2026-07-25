/**
 * Send a user query to the backend.
 * @param {string} query
 * @returns {Promise<{ type: "explanation"|"generation", content: { explanation: string, code: string|null } }>}
 */
export async function sendMessage(query) {
  const res = await fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    throw new Error(`Server error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

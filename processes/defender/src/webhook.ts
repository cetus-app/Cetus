// Handles webhook & ratelimiting
import fetch from "node-fetch";

// Technically we should clear this periodically
// But I don't anticipate hitting limits so often that this becomes an issue.
const ratelimit = new Map();
const invalidHooks = new Set();
// Assumes it's a discord webhook but doesn't require it to be one
class HookError extends Error {
  constructor (message: string, status: number) {
    super(message);
    this.status = status;
  }

  status: number
}
async function sendWebhook (url: string, body: any) {
  if (ratelimit.has(url)) {
    if (ratelimit.get(url) > Date.now()) {
      throw new Error(`Ratelimit applied.`);
    }
    ratelimit.delete(url);
  }
  if (invalidHooks.has(url)) {
    throw new Error("Hook is invalid");
  }

  const resp = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  if (resp.ok) {
    const limit = resp.headers.get("x-ratelimit-remaining");
    if (limit !== null && limit !== undefined) {
      if (parseInt(limit, 10) === 0) {
        const after = resp.headers.get("X-RateLimit-Reset");
        if (after) {
          ratelimit.set(url, parseInt(after, 10));
        } else {
          ratelimit.set(url, Date.now() + 10000);
        }
      }
    }
    return true;
  }
  // Errored
  if (resp.status >= 400 && resp.status < 500) {
    invalidHooks.add(url);
  }
  // We want to use text for error
  const text = await resp.text();
  try {
    const errorBody = JSON.parse(text);
    if (errorBody.code === 10015) {
      invalidHooks.add(url);
    } else if (resp.status === 429) {
      const header = resp.headers.get("X-RateLimit-Reset");
      const after = header ? parseInt(header, 10) : Date.now() + 20000;
      ratelimit.set(url, after);
    }
  } catch (_e) {
    // Discard e; It'll be a parsing error
  }
  throw new HookError(text.substring(0, 100), resp.status);
}
export default sendWebhook;

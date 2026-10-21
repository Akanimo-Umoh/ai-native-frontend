/**
 * Limits sized for a free AI tier (small per-minute token budget).
 * Shared by the server (enforcement) and the client (input hints). No secrets here.
 */
export const CHAT_LIMITS = {
  /** Longest single user message. */
  maxMessageChars: 800,
  /** How many recent messages are sent to the model on each request. */
  maxContextMessages: 4,
  /** Older assistant replies are trimmed to this length when sent back as context. */
  maxAssistantContextChars: 2000,
  /** Cap on generated tokens per reply (includes any reasoning tokens). */
  maxOutputTokens: 800,
  /** Reject request bodies larger than this. */
  maxRequestChars: 40_000,
  /** Most messages accepted in one request body. */
  maxIncomingMessages: 60,
  /** Most messages kept in this browser's saved history. */
  maxStoredMessages: 40,
  /** Best-effort per-visitor request limits. */
  perMinute: 4,
  perDay: 30,
} as const

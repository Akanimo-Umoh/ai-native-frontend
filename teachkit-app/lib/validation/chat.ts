import "server-only"
import { z } from "zod"
import type { UIMessage } from "ai"
import { CHAT_LIMITS } from "@/lib/chat/limits"

/**
 * Input boundary for POST /api/chat.
 * The browser could send anything, so the server rebuilds a clean message list:
 * only user/assistant roles, text parts only, length-capped, and only the most
 * recent messages (to stay inside the free tier's token budget).
 */
const incomingSchema = z.object({
  messages: z
    .array(
      z.object({
        id: z.string().min(1).max(100),
        role: z.enum(["user", "assistant"]),
        parts: z
          .array(z.object({ type: z.string(), text: z.string().optional() }))
          .max(20),
      })
    )
    .min(1)
    .max(CHAT_LIMITS.maxIncomingMessages),
})

export type ChatValidationResult =
  | { ok: true; messages: UIMessage[]; latestUserText: string }
  | { ok: false; message: string }

export function validateChatRequest(body: unknown): ChatValidationResult {
  const parsed = incomingSchema.safeParse(body)
  if (!parsed.success) {
    return { ok: false, message: "The request was not valid." }
  }

  const cleaned: UIMessage[] = []
  for (const message of parsed.data.messages) {
    const text = message.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text ?? "")
      .join("")
      .trim()
    if (!text) continue

    if (message.role === "user" && text.length > CHAT_LIMITS.maxMessageChars) {
      return {
        ok: false,
        message: `Messages can be at most ${CHAT_LIMITS.maxMessageChars} characters.`,
      }
    }

    const content =
      message.role === "assistant"
        ? text.slice(0, CHAT_LIMITS.maxAssistantContextChars)
        : text

    cleaned.push({
      id: message.id,
      role: message.role,
      parts: [{ type: "text" as const, text: content }],
    })
  }

  const recent = cleaned.slice(-CHAT_LIMITS.maxContextMessages)
  while (recent.length > 0 && recent[0].role === "assistant") recent.shift()

  const last = recent[recent.length - 1]
  if (!last || last.role !== "user") {
    return { ok: false, message: "The last message must be from the user." }
  }

  const lastPart = last.parts[0]
  const latestUserText = lastPart.type === "text" ? lastPart.text : ""

  return { ok: true, messages: recent, latestUserText }
}

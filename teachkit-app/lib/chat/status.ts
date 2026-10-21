import type { ChatStatus } from "@/types/chat"

/**
 * Text for the hidden live region when the chat status changes.
 * Tokens are never announced one by one; only these state changes are.
 * Errors are announced by their own role="alert" element, so they return null here.
 */
export function describeStatusChange(
  from: ChatStatus,
  to: ChatStatus,
  wasStopped: boolean
): string | null {
  if (to === "submitted") return "Assistant is thinking."
  if (to === "streaming") return "Assistant is responding."
  if (to === "ready" && (from === "submitted" || from === "streaming")) {
    return wasStopped ? "Response stopped." : "Response complete."
  }
  return null
}

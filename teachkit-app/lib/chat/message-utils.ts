import type { UIMessage } from "ai"
import { DECLINE_MARKER } from "@/lib/chat/constants"

/** Joins the text parts of a message. Other part types are ignored. */
export function getMessageText(message: UIMessage): string {
  let text = ""
  for (const part of message.parts) {
    if (part.type === "text") text += part.text
  }
  return text
}

/**
 * Splits an assistant reply into "declined or not" and the text to show.
 * `pending` is true while the stream has only delivered part of the marker,
 * so the UI never flashes half a marker on screen.
 */
export function readAssistantText(text: string): {
  declined: boolean
  text: string
  pending: boolean
} {
  if (text.startsWith(DECLINE_MARKER)) {
    return {
      declined: true,
      text: text.slice(DECLINE_MARKER.length).trimStart(),
      pending: false,
    }
  }
  if (text.length > 0 && DECLINE_MARKER.startsWith(text)) {
    return { declined: false, text: "", pending: true }
  }
  return { declined: false, text, pending: false }
}

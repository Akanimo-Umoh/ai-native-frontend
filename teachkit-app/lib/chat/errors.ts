import type { ApiError } from "@/types"
import type { ChatErrorInfo } from "@/types/chat"

const KNOWN_CODES: ApiError["code"][] = [
  "VALIDATION_ERROR",
  "PRIVACY_BLOCKED",
  "RATE_LIMITED",
  "MODEL_ERROR",
  "NETWORK_ERROR",
  "UNKNOWN",
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

/**
 * Turns the error thrown by useChat into a safe, typed shape.
 * The server sends errors as JSON: { "error": { code, message, retryAfterSeconds? } }.
 */
export function parseChatError(error: Error): ChatErrorInfo {
  try {
    const parsed: unknown = JSON.parse(error.message)
    const body =
      isRecord(parsed) && isRecord(parsed.error) ? parsed.error : null
    if (
      body &&
      typeof body.message === "string" &&
      typeof body.code === "string" &&
      KNOWN_CODES.includes(body.code as ApiError["code"])
    ) {
      return {
        code: body.code as ApiError["code"],
        message: body.message,
        retryAfterSeconds:
          typeof body.retryAfterSeconds === "number"
            ? body.retryAfterSeconds
            : undefined,
      }
    }
  } catch {
    // Not JSON: fall through to the generic cases below.
  }

  if (/failed to fetch|networkerror|load failed/i.test(error.message)) {
    return {
      code: "NETWORK_ERROR",
      message: "You appear to be offline. Check your connection and try again.",
    }
  }

  return { code: "UNKNOWN", message: "Something went wrong. Please try again." }
}

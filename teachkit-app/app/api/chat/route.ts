import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
} from "ai"
import { TEACHING_ASSISTANT_INSTRUCTIONS } from "@/lib/ai/prompts"
import { getModel, getProviderOptions } from "@/lib/ai/provider"
import { SIMULATE_HEADER } from "@/lib/chat/constants"
import { CHAT_LIMITS } from "@/lib/chat/limits"
import { containsPersonalDetails } from "@/lib/chat/privacy-guard"
import { checkRateLimit } from "@/lib/chat/rate-limit"
import { validateChatRequest } from "@/lib/validation/chat"
import type { ApiError } from "@/types"

// Allow streaming responses up to 30 seconds.
export const maxDuration = 30

function errorResponse(error: ApiError, status: number) {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  })
  if (error.retryAfterSeconds) {
    headers.set("Retry-After", String(error.retryAfterSeconds))
  }
  return new Response(JSON.stringify({ error }), { status, headers })
}

/** Demo only: returns a canned failure so each UI state can be checked without calling the model. */
function simulatedResponse(kind: string | null): Response | null {
  switch (kind) {
    case "error":
      return errorResponse(
        {
          code: "MODEL_ERROR",
          message: "The assistant is unavailable right now. (Simulated error.)",
        },
        502
      )
    case "ratelimit":
      return errorResponse(
        {
          code: "RATE_LIMITED",
          message: "You are sending messages too quickly. (Simulated.)",
          retryAfterSeconds: 30,
        },
        429
      )
    case "privacy":
      return errorResponse(
        {
          code: "PRIVACY_BLOCKED",
          message:
            "Your message looks like it contains personal details. (Simulated.)",
        },
        422
      )
    default:
      return null
  }
}

function getClientKey(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")
  return (
    forwarded?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anonymous"
  )
}

function tryGetModel() {
  try {
    return getModel()
  } catch {
    // The error names the missing variable; log that, never a value.
    console.error("[chat] AI provider is not configured correctly")
    return null
  }
}

function toStreamError(error: unknown): ApiError {
  const status =
    typeof error === "object" && error !== null && "statusCode" in error
      ? (error as { statusCode?: unknown }).statusCode
      : undefined

  // Log only the type and status, never the prompt or response bodies.
  console.error("[chat] model error", {
    name: error instanceof Error ? error.name : "unknown",
    status,
  })

  if (status === 429) {
    return {
      code: "RATE_LIMITED",
      message: "The AI service is busy. Please try again shortly.",
      retryAfterSeconds: 60,
    }
  }
  return {
    code: "MODEL_ERROR",
    message: "The assistant couldn't respond. Please try again.",
  }
}

export async function POST(req: Request) {
  const simulated = simulatedResponse(req.headers.get(SIMULATE_HEADER))
  if (simulated) return simulated

  const limit = checkRateLimit(getClientKey(req))
  if (!limit.ok) {
    return errorResponse(
      {
        code: "RATE_LIMITED",
        message: "You are sending messages too quickly.",
        retryAfterSeconds: limit.retryAfterSeconds,
      },
      429
    )
  }

  const raw = await req.text()
  if (raw.length > CHAT_LIMITS.maxRequestChars) {
    return errorResponse(
      { code: "VALIDATION_ERROR", message: "The request is too large." },
      413
    )
  }

  let body: unknown
  try {
    body = JSON.parse(raw)
  } catch {
    return errorResponse(
      { code: "VALIDATION_ERROR", message: "The request was not valid." },
      400
    )
  }

  const validated = validateChatRequest(body)
  if (!validated.ok) {
    return errorResponse(
      { code: "VALIDATION_ERROR", message: validated.message },
      400
    )
  }

  if (containsPersonalDetails(validated.latestUserText)) {
    return errorResponse(
      {
        code: "PRIVACY_BLOCKED",
        message:
          "Your message looks like it contains personal details such as an email address or phone number. Remove them and try again.",
      },
      422
    )
  }

  const model = tryGetModel()
  if (!model) {
    return errorResponse(
      {
        code: "MODEL_ERROR",
        message: "The assistant is not available right now.",
      },
      503
    )
  }

  const result = streamText({
    model,
    instructions: TEACHING_ASSISTANT_INSTRUCTIONS,
    messages: await convertToModelMessages(validated.messages),
    maxOutputTokens: CHAT_LIMITS.maxOutputTokens,
    providerOptions: getProviderOptions(),
    // Stopping in the browser cancels the upstream request too, saving free-tier quota.
    abortSignal: req.signal,
  })

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      messageMetadata: ({ part }) => {
        if (part.type === "finish") {
          return { finishReason: part.finishReason }
        }
      },
      onError: (error) => JSON.stringify({ error: toStreamError(error) }),
    }),
  })
}

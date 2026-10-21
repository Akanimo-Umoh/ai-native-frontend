import type { UIMessage } from "ai"
import type { ApiError } from "@/types"

/** Mirrors the status values returned by useChat. */
export type ChatStatus = "submitted" | "streaming" | "ready" | "error"

export type ChatFeedback = "up" | "down"

/** Metadata the server attaches to each assistant message when it finishes. */
export interface ChatMessageMetadata {
  finishReason?: string
}

export type ChatUIMessage = UIMessage<ChatMessageMetadata>

export type ChatErrorInfo = Pick<
  ApiError,
  "code" | "message" | "retryAfterSeconds"
>

/** States the demo simulator can trigger (see /chat?demo=states). */
export type SimulationKind = "error" | "ratelimit" | "privacy" | "declined"

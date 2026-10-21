import { ChatSafetyNotice } from "@/components/client/chat/chat-safety-notice"
import { MessageActions } from "@/components/client/chat/message-actions"
import { getMessageText, readAssistantText } from "@/lib/chat/message-utils"
import type { ChatFeedback, ChatUIMessage } from "@/types/chat"

type Props = {
  message: ChatUIMessage
  isStreaming: boolean
  canRegenerate: boolean
  feedback?: ChatFeedback
  onRegenerate: () => void
  onFeedback: (messageId: string, value: ChatFeedback) => void
  onAnnounce: (message: string) => void
}

/** One message in the conversation: a user message or an assistant message. */
export function ChatMessage({
  message,
  isStreaming,
  canRegenerate,
  feedback,
  onRegenerate,
  onFeedback,
  onAnnounce,
}: Props) {
  const raw = getMessageText(message)

  if (message.role === "user") {
    return (
      <article
        aria-label="Your message"
        className="ml-auto max-w-[85%] rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
      >
        <p className="break-words whitespace-pre-wrap">{raw}</p>
      </article>
    )
  }

  const reply = readAssistantText(raw)

  // Nothing visible yet (empty, or only part of the decline marker has arrived).
  if (reply.pending || (raw === "" && isStreaming)) return null

  const declined =
    reply.declined || message.metadata?.finishReason === "content-filter"
  if (declined) {
    return (
      <article aria-label="Assistant message" className="max-w-[85%]">
        <ChatSafetyNotice variant="declined" message={reply.text} />
      </article>
    )
  }

  if (raw === "") return null

  return (
    <article
      aria-label="Assistant message"
      className="max-w-[85%] rounded-lg bg-muted px-4 py-3 text-sm"
    >
      <p className="mb-1 text-xs font-medium text-muted-foreground">AI draft</p>
      <p className="break-words whitespace-pre-wrap">{reply.text}</p>
      {!isStreaming ? (
        <MessageActions
          text={reply.text}
          feedback={feedback}
          canRegenerate={canRegenerate}
          onRegenerate={onRegenerate}
          onFeedback={(value) => onFeedback(message.id, value)}
          onAnnounce={onAnnounce}
        />
      ) : null}
    </article>
  )
}

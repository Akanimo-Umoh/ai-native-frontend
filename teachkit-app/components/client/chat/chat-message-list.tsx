"use client"

import { useEffect, useRef } from "react"
import type { ReactNode, UIEvent } from "react"
import { ChatEmptyState } from "@/components/client/chat/chat-empty-state"
import { ChatMessage } from "@/components/client/chat/chat-message"
import { ChatSystemMessage } from "@/components/client/chat/chat-system-message"
import type { ChatFeedback, ChatStatus, ChatUIMessage } from "@/types/chat"

type Props = {
  messages: ChatUIMessage[]
  status: ChatStatus
  feedback: Record<string, ChatFeedback>
  canRegenerate: boolean
  onRegenerate: () => void
  onFeedback: (messageId: string, value: ChatFeedback) => void
  onAnnounce: (message: string) => void
  onStarter: (text: string) => void
  children?: ReactNode
}

/**
 * The scrolling conversation.
 * - role="log" with aria-live="off": screen reader users read it on demand and hear
 *   short status updates from the separate live region instead of every token.
 * - tabIndex=0 so keyboard users can scroll it.
 * - Auto-scrolls to the newest text unless the reader has scrolled up.
 */
export function ChatMessageList({
  messages,
  status,
  feedback,
  canRegenerate,
  onRegenerate,
  onFeedback,
  onAnnounce,
  onStarter,
  children,
}: Props) {
  const endRef = useRef<HTMLDivElement>(null)
  const stickToBottom = useRef(true)
  const busy = status === "submitted" || status === "streaming"

  const lastMessage = messages[messages.length - 1]
  const lastAssistant = [...messages]
    .reverse()
    .find((message) => message.role === "assistant")

  useEffect(() => {
    if (stickToBottom.current) {
      endRef.current?.scrollIntoView({ block: "end" })
    }
  }, [messages, status])

  function handleScroll(event: UIEvent<HTMLDivElement>) {
    const element = event.currentTarget
    stickToBottom.current =
      element.scrollHeight - element.scrollTop - element.clientHeight < 80
  }

  return (
    <div
      role="log"
      aria-label="Conversation"
      aria-live="off"
      aria-busy={busy}
      tabIndex={0}
      onScroll={handleScroll}
      className=" min-h-[10rem] flex-1 space-y-4 overflow-y-auto p-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      {messages.length === 0 && !busy ? (
        <ChatEmptyState onStarter={onStarter} />
      ) : null}

      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message}
          isStreaming={
            status === "streaming" &&
            message.role === "assistant" &&
            message.id === lastMessage?.id
          }
          canRegenerate={canRegenerate && message.id === lastAssistant?.id}
          feedback={feedback[message.id]}
          onRegenerate={onRegenerate}
          onFeedback={onFeedback}
          onAnnounce={onAnnounce}
        />
      ))}

      {status === "submitted" ? (
        <ChatSystemMessage variant="thinking">
          Assistant is thinking...
        </ChatSystemMessage>
      ) : null}

      {children}
      <div ref={endRef} />
    </div>
  )
}

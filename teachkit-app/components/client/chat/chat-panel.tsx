"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useRef, useState } from "react"
import type { KeyboardEvent } from "react"
import { ChatComposer } from "@/components/client/chat/chat-composer"
import { ChatErrorMessage } from "@/components/client/chat/chat-error-message"
import { ChatMessageList } from "@/components/client/chat/chat-message-list"
import { ChatSafetyNotice } from "@/components/client/chat/chat-safety-notice"
import { ChatStateSimulator } from "@/components/client/chat/chat-state-simulator"
import { ChatStatusAnnouncer } from "@/components/client/chat/chat-status-announcer"
import { useChatHistory } from "@/hooks/use-chat-history"
import { DECLINE_MARKER, SIMULATE_HEADER } from "@/lib/chat/constants"
import { parseChatError } from "@/lib/chat/errors"
import { getMessageText } from "@/lib/chat/message-utils"
import { describeStatusChange } from "@/lib/chat/status"
import type { ChatFeedback, ChatUIMessage, SimulationKind } from "@/types/chat"

const transport = new DefaultChatTransport({ api: "/api/chat" })

type Props = {
  showSimulator: boolean
}

/**
 * Owns the chat: wires useChat to the message list, composer and controls.
 *
 * Focus rules (keyboard users):
 * - Focus stays in the message box while sending.
 * - When an action removes the control that had focus (Stop, Retry, Edit, Clear),
 *   focus returns to the message box so it is never lost.
 * - Controls never steal focus when a response arrives.
 */
export function ChatPanel({ showSimulator }: Props) {
  const {
    messages,
    sendMessage,
    status,
    stop,
    regenerate,
    error,
    setMessages,
  } = useChat<ChatUIMessage>({ transport })
  const { feedback, setFeedback, clearHistory } = useChatHistory({
    messages,
    setMessages,
    status,
  })

  const [draft, setDraft] = useState("")
  const [announcement, setAnnouncement] = useState("")
  const [previousStatus, setPreviousStatus] = useState(status)
  const [wasStopped, setWasStopped] = useState(false)
  const [errorDismissed, setErrorDismissed] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const busy = status === "submitted" || status === "streaming"
  const errorInfo =
    status === "error" && error && !errorDismissed
      ? parseChatError(error)
      : null

  // Announce state changes (derived during render, so no effect is needed).
  if (status !== previousStatus) {
    setPreviousStatus(status)
    setAnnouncement(
      describeStatusChange(previousStatus, status, wasStopped) ?? ""
    )
  }

  function focusInput() {
    inputRef.current?.focus()
  }

  function send(text: string, simulate?: SimulationKind) {
    const value = text.trim()
    if (!value || busy) return
    setWasStopped(false)
    setErrorDismissed(false)
    sendMessage(
      { text: value },
      simulate ? { headers: { [SIMULATE_HEADER]: simulate } } : undefined
    )
  }

  function handleSend() {
    send(draft)
    setDraft("")
  }

  function handleStop() {
    setWasStopped(true)
    stop()
    focusInput()
  }

  function handleRegenerate() {
    setWasStopped(false)
    setErrorDismissed(false)
    void regenerate()
    focusInput()
  }

  function handleEditLast() {
    const lastUser = [...messages]
      .reverse()
      .find((message) => message.role === "user")
    if (lastUser) {
      setDraft(getMessageText(lastUser))
      setMessages(messages.filter((message) => message.id !== lastUser.id))
    }
    setErrorDismissed(true)
    focusInput()
  }

  function handleClear() {
    if (!window.confirm("Clear this conversation? This cannot be undone."))
      return
    if (busy) stop()
    clearHistory()
    setErrorDismissed(true)
    setAnnouncement("Conversation cleared.")
    focusInput()
  }

  function handleFeedback(messageId: string, value: ChatFeedback) {
    const next = feedback[messageId] === value ? null : value
    setFeedback(messageId, next)
    setAnnouncement(
      next ? "Feedback saved on this device." : "Feedback removed."
    )
  }

  function handleSimulate(kind: SimulationKind) {
    if (kind === "declined") {
      setErrorDismissed(true)
      setMessages([
        ...messages,
        {
          id: crypto.randomUUID(),
          role: "user",
          parts: [{ type: "text", text: "Simulation: declined reply" }],
        },
        {
          id: crypto.randomUUID(),
          role: "assistant",
          parts: [
            {
              type: "text",
              text: `${DECLINE_MARKER}I can only help with teaching tasks such as lesson plans and quizzes. Would you like a lesson plan on a topic instead?`,
            },
          ],
        },
      ])
      return
    }
    send(`Simulation: ${kind}`, kind)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape" && busy) {
      event.preventDefault()
      handleStop()
    }
  }

  function renderError() {
    if (!errorInfo) return null
    if (errorInfo.code === "PRIVACY_BLOCKED") {
      return (
        <ChatSafetyNotice
          variant="privacy"
          message={errorInfo.message}
          onEdit={handleEditLast}
        />
      )
    }
    if (errorInfo.code === "VALIDATION_ERROR") {
      return (
        <ChatSafetyNotice
          variant="validation"
          message={errorInfo.message}
          onEdit={handleEditLast}
        />
      )
    }
    return <ChatErrorMessage error={errorInfo} onRetry={handleRegenerate} />
  }

  return (
    <section
      aria-label="TeachKit Assistant chat"
      onKeyDown={handleKeyDown}
      className="flex flex-col rounded-lg border bg-card text-card-foreground"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
        <p className="text-xs text-muted-foreground">
          AI drafts for teacher review. History is saved on this device only.
        </p>
        <button
          type="button"
          onClick={handleClear}
          disabled={messages.length === 0}
          className="inline-flex min-h-8 items-center rounded-md border border-input px-3 text-xs font-medium hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-60"
        >
          Clear conversation
        </button>
      </div>

      <ChatMessageList
        messages={messages}
        status={status}
        feedback={feedback}
        canRegenerate={status === "ready" || status === "error"}
        onRegenerate={handleRegenerate}
        onFeedback={handleFeedback}
        onAnnounce={setAnnouncement}
        onStarter={(text) => send(text)}
      >
        {renderError()}
      </ChatMessageList>

      <div className="space-y-3 border-t p-4">
        {showSimulator ? (
          <ChatStateSimulator onSimulate={handleSimulate} disabled={busy} />
        ) : null}
        <ChatComposer
          value={draft}
          onChange={setDraft}
          onSend={handleSend}
          onStop={handleStop}
          busy={busy}
          inputRef={inputRef}
        />
      </div>

      <ChatStatusAnnouncer message={announcement} />
    </section>
  )
}

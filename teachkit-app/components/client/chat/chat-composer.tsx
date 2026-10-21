"use client"

import type { FormEvent, KeyboardEvent, RefObject } from "react"
import { CHAT_LIMITS } from "@/lib/chat/limits"

type Props = {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  onStop: () => void
  busy: boolean
  inputRef: RefObject<HTMLTextAreaElement | null>
}

const buttonClass =
  "inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"

/** Message box with send and stop. Enter sends, Shift+Enter adds a line, Escape stops (handled by the panel). */
export function ChatComposer({
  value,
  onChange,
  onSend,
  onStop,
  busy,
  inputRef,
}: Props) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSend()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault()
      onSend()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <label htmlFor="chat-input" className="text-sm font-medium">
        Message TeachKit Assistant
      </label>
      <textarea
        id="chat-input"
        ref={inputRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        rows={3}
        maxLength={CHAT_LIMITS.maxMessageChars}
        aria-describedby="chat-input-hint"
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <p id="chat-input-hint" className="text-xs text-muted-foreground">
        Enter to send, Shift+Enter for a new line, Escape to stop a response.
        Don&apos;t enter student names or personal details. {value.length}/
        {CHAT_LIMITS.maxMessageChars} characters.
      </p>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy || value.trim() === ""}
          className={`${buttonClass} bg-primary text-primary-foreground`}
        >
          Send
        </button>
        {busy ? (
          <button
            type="button"
            onClick={onStop}
            className={`${buttonClass} border border-input hover:bg-muted`}
          >
            Stop
          </button>
        ) : null}
      </div>
    </form>
  )
}

"use client"

import type { ChatFeedback } from "@/types/chat"

type Props = {
  text: string
  feedback?: ChatFeedback
  canRegenerate: boolean
  onRegenerate: () => void
  onFeedback: (value: ChatFeedback) => void
  onAnnounce: (message: string) => void
}

const buttonClass =
  "inline-flex min-h-8 items-center rounded-md border border-input px-3 text-xs font-medium hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-pressed:bg-background aria-pressed:font-semibold"

/** Copy, regenerate and feedback controls for one assistant message. */
export function MessageActions({
  text,
  feedback,
  canRegenerate,
  onRegenerate,
  onFeedback,
  onAnnounce,
}: Props) {
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      onAnnounce("Copied to clipboard.")
    } catch {
      onAnnounce("Couldn't copy. Select the text and copy it manually.")
    }
  }

  return (
    <div
      role="group"
      aria-label="Message actions"
      className="mt-3 flex flex-wrap gap-2"
    >
      <button type="button" onClick={handleCopy} className={buttonClass}>
        Copy
      </button>
      {canRegenerate ? (
        <button type="button" onClick={onRegenerate} className={buttonClass}>
          Regenerate
        </button>
      ) : null}
      <button
        type="button"
        aria-pressed={feedback === "up"}
        onClick={() => onFeedback("up")}
        className={buttonClass}
      >
        Helpful
      </button>
      <button
        type="button"
        aria-pressed={feedback === "down"}
        onClick={() => onFeedback("down")}
        className={buttonClass}
      >
        Not helpful
      </button>
    </div>
  )
}

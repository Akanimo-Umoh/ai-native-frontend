type Props = {
  variant: "declined" | "privacy" | "validation"
  message?: string
  onEdit?: () => void
}

const COPY = {
  declined: {
    title: "The assistant couldn't help with that",
    body: "That request is outside what TeachKit Assistant can help with. Try asking for a lesson plan, a quiz or an explanation for a class.",
  },
  privacy: {
    title: "Personal details detected",
    body: "Remove names, phone numbers or email addresses and try again.",
  },
  validation: {
    title: "Message not sent",
    body: "Please check your message and try again.",
  },
} as const

/** Safety and moderation states. These are distinct from provider errors. */
export function ChatSafetyNotice({ variant, message, onEdit }: Props) {
  const copy = COPY[variant]
  const body = message && message.trim() !== "" ? message : copy.body

  return (
    <div
      role={variant === "declined" ? "status" : "alert"}
      className="space-y-2 rounded-md border border-l-4 border-l-primary bg-muted px-4 py-3 text-sm"
    >
      <p className="font-medium">{copy.title}</p>
      <p className="break-words whitespace-pre-wrap text-muted-foreground">
        {body}
      </p>
      {onEdit ? (
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex min-h-8 items-center rounded-md border border-input px-3 text-xs font-medium hover:bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          Edit message
        </button>
      ) : null}
    </div>
  )
}

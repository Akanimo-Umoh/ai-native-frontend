import type { ReactNode } from "react"

type Props = {
  variant: "thinking" | "notice"
  children: ReactNode
}

/** System/status messages. The "thinking" indicator is visual only; the live region announces it. */
export function ChatSystemMessage({ variant, children }: Props) {
  if (variant === "thinking") {
    return (
      <p
        aria-hidden="true"
        className="text-sm text-muted-foreground motion-safe:animate-pulse"
      >
        {children}
      </p>
    )
  }

  return (
    <p className="rounded-md border bg-muted px-3 py-2 text-xs text-muted-foreground">
      {children}
    </p>
  )
}

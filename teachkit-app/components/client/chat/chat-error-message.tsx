import Link from "next/link"
import type { ChatErrorInfo } from "@/types/chat"

type Props = {
  error: ChatErrorInfo
  onRetry: () => void
}

const TITLES: Partial<Record<ChatErrorInfo["code"], string>> = {
  RATE_LIMITED: "Too many requests",
  NETWORK_ERROR: "You're offline",
  MODEL_ERROR: "The assistant couldn't respond",
}

/** Provider, network and rate-limit errors, each with a retry and a manual fallback. */
export function ChatErrorMessage({ error, onRetry }: Props) {
  const title = TITLES[error.code] ?? "Something went wrong"

  return (
    <div
      role="alert"
      className="space-y-2 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm"
    >
      <p className="font-medium text-destructive">{title}</p>
      <p className="text-foreground">{error.message}</p>
      {error.retryAfterSeconds ? (
        <p className="text-muted-foreground">
          You can try again in about {error.retryAfterSeconds} seconds.
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex min-h-8 items-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          Retry
        </button>
        <Link href="/" className="text-xs underline underline-offset-4">
          Use the lesson form instead
        </Link>
      </div>
    </div>
  )
}

import Link from "next/link"

export function ChatCallout() {
  return (
    <section aria-labelledby="chat-callout-heading" className="space-y-3">
      <h2 id="chat-callout-heading" className="text-lg font-semibold">
        Streaming assistant
      </h2>
      <p className="text-sm text-muted-foreground">
        The conversational assistant streams its replies as they are written,
        with stop, retry, regenerate, copy and feedback controls.
      </p>
      <Link
        href="/chat"
        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        Open TeachKit Assistant
      </Link>
    </section>
  )
}

import Link from "next/link"
import { ChatPanel } from "@/components/client/chat/chat-panel"

type Props = {
  searchParams: Promise<{ demo?: string | string[] }>
}

export async function ChatPage({ searchParams }: Props) {
  const { demo } = await searchParams
  const showSimulator = demo === "states"

  return (
    <main className="mx-auto flex h-dvh max-w-3xl flex-col gap-3 px-4 py-4 sm:px-6 sm:py-6">
      <header className="shrink-0 space-y-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h1 className="text-xl font-semibold tracking-tight">
            TeachKit Assistant
          </h1>
          <Link href="/" className="text-sm underline underline-offset-4">
            Back to the foundation page
          </Link>
        </div>
        <p className="text-xs text-muted-foreground">
          Ask for lesson plans, quizzes and explanations. This runs on a free AI
          tier with small limits, so if it says it is busy, try again in a
          moment.
        </p>
      </header>
      <ChatPanel showSimulator={showSimulator} />
    </main>
  )
}

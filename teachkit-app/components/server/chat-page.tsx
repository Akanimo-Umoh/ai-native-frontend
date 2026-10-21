import Link from "next/link"
import { ChatPanel } from "@/components/client/chat/chat-panel"

type Props = {
  searchParams: Promise<{ demo?: string | string[] }>
}

export async function ChatPage({ searchParams }: Props) {
  const { demo } = await searchParams
  const showSimulator = demo === "states"

  return (
    <main className="mx-auto flex min-h-svh max-w-3xl flex-col gap-6 px-6 py-10">
      <header className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          Phase 2 · Streaming chat
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          TeachKit Assistant
        </h1>
        <p className="text-sm text-muted-foreground">
          Ask for lesson plans, quizzes and explanations. This runs on a free AI
          tier with small limits, so if it says it is busy, try again in a
          moment.
        </p>
        <Link href="/" className="text-sm underline underline-offset-4">
          Back to the foundation page
        </Link>
      </header>
      <ChatPanel showSimulator={showSimulator} />
    </main>
  )
}

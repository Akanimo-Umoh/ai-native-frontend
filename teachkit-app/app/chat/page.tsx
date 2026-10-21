import { ChatPage } from "@/components/server/chat-page"

type PageProps = {
  searchParams: Promise<{ demo?: string | string[] }>
}

// The page only composes components; all markup lives in components/.
export default function Page({ searchParams }: PageProps) {
  return <ChatPage searchParams={searchParams} />
}

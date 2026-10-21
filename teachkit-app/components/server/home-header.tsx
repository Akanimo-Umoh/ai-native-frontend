export function HomeHeader() {
  return (
    <header className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground">
        Phase 1 · Next.js foundation
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">TeachKit</h1>
      <p className="text-muted-foreground">
        An AI teaching workspace for private-school teachers. The AI proposes,
        the teacher decides. This page demonstrates the server/client boundary;
        the streaming assistant lives on its own page.
      </p>
    </header>
  )
}

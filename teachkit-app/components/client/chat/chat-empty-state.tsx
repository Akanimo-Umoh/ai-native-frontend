const STARTERS = [
  "Draft a 40-minute lesson plan on photosynthesis for JSS 2.",
  "Write 5 quiz questions with answers on fractions for Primary 5.",
  "Explain the water cycle simply for Primary 4.",
]

type Props = {
  onStarter: (text: string) => void
}

export function ChatEmptyState({ onStarter }: Props) {
  return (
    <div className="space-y-3 text-sm">
      <p className="text-muted-foreground">
        Ask for a lesson plan, a quiz or an explanation. Everything the
        assistant writes is an AI draft for you to review.
      </p>
      <ul className="flex flex-col gap-2">
        {STARTERS.map((text) => (
          <li key={text}>
            <button
              type="button"
              onClick={() => onStarter(text)}
              className="w-full rounded-md border border-input px-3 py-2 text-left hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {text}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

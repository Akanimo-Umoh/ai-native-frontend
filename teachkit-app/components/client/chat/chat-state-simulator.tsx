import type { SimulationKind } from "@/types/chat"

type Props = {
  onSimulate: (kind: SimulationKind) => void
  disabled: boolean
}

const OPTIONS: { kind: SimulationKind; label: string }[] = [
  { kind: "error", label: "Provider error" },
  { kind: "ratelimit", label: "Rate limit" },
  { kind: "privacy", label: "Privacy block" },
  { kind: "declined", label: "Declined reply" },
]

/** Demo only (/chat?demo=states): triggers each state without calling the AI model. */
export function ChatStateSimulator({ onSimulate, disabled }: Props) {
  return (
    <div
      role="group"
      aria-label="State simulator (demo)"
      className="space-y-2 rounded-md border border-dashed p-3 text-xs"
    >
      <p className="text-muted-foreground">
        Demo only: trigger each state without calling the AI model.
      </p>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((option) => (
          <button
            key={option.kind}
            type="button"
            disabled={disabled}
            onClick={() => onSimulate(option.kind)}
            className="inline-flex min-h-8 items-center rounded-md border border-input px-3 font-medium hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-60"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

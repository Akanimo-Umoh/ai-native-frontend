import { connection } from "next/server"
import { getModelInfo } from "@/lib/ai/provider"
import { isAiConfigured } from "@/lib/env"

/**
 * Server Component: runs only on the server and ships no JavaScript for itself.
 * It reads the server environment and reports whether a key exists, never the key.
 */
export async function BoundaryStatus() {
  // Render per request so the status reflects the live environment, not build time.
  await connection()

  const configured = isAiConfigured()
  const { provider, model } = getModelInfo()
  const renderedAt = new Date().toISOString()

  return (
    <dl className="grid gap-4 rounded-lg border bg-card p-4 text-sm text-card-foreground sm:grid-cols-3">
      <div className="space-y-1">
        <dt className="text-muted-foreground">AI provider key</dt>
        <dd className="font-medium">
          {configured ? "Configured on the server" : "Not configured"}
        </dd>
      </div>
      <div className="space-y-1">
        <dt className="text-muted-foreground">Provider and model</dt>
        <dd className="font-medium">
          {provider} / {model} (subject to change)
        </dd>
      </div>
      <div className="space-y-1">
        <dt className="text-muted-foreground">Rendered</dt>
        <dd className="font-medium">On the server at {renderedAt}</dd>
      </div>
    </dl>
  )
}

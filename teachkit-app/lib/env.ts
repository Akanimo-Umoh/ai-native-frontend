import "server-only"
import { z } from "zod"

/**
 * The only place server environment variables are read.
 *
 * - `server-only` makes the build fail if a Client Component (directly or
 *   indirectly) imports this file, so secrets cannot end up in browser code.
 * - Validation is lazy (first use, not import time) so `next build` and preview
 *   deployments don't crash when a key isn't set; the first real use fails loudly.
 * - Error messages name the missing variable but never print any value.
 */
const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value

const optionalString = z.preprocess(
  emptyToUndefined,
  z.string().min(1).optional()
)

const serverSchema = z
  .object({
    AI_PROVIDER: z.preprocess(
      emptyToUndefined,
      z.enum(["groq", "google"]).default("groq")
    ),
    AI_MODEL: optionalString,
    GROQ_API_KEY: optionalString,
    GOOGLE_GENERATIVE_AI_API_KEY: optionalString,
  })
  .superRefine((env, ctx) => {
    const keyName =
      env.AI_PROVIDER === "google"
        ? "GOOGLE_GENERATIVE_AI_API_KEY"
        : "GROQ_API_KEY"
    if (!env[keyName]) {
      ctx.addIssue({
        code: "custom",
        path: [keyName],
        message: "is required for the selected AI provider",
      })
    }
  })

export type ServerEnv = z.infer<typeof serverSchema>
export type AiProviderName = ServerEnv["AI_PROVIDER"]

let cached: ServerEnv | undefined

export function getServerEnv(): ServerEnv {
  if (cached) return cached

  const result = serverSchema.safeParse(process.env)
  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `${issue.path.join(".") || "env"} ${issue.message}`)
      .join("; ")
    throw new Error(`Invalid server environment: ${problems}`)
  }

  cached = result.data
  return cached
}

/** Safe for Server Components: reports whether the selected provider's key is set, never the key. */
export function isAiConfigured(): boolean {
  return serverSchema.safeParse(process.env).success
}

/** Never throws. Returns which provider and (optional) model override are selected. */
export function getAiSelection(): { provider: AiProviderName; model?: string } {
  const provider: AiProviderName =
    process.env.AI_PROVIDER?.trim() === "google" ? "google" : "groq"
  const model = process.env.AI_MODEL?.trim() || undefined
  return { provider, model }
}

import "server-only"
import { google } from "@ai-sdk/google"
import { groq } from "@ai-sdk/groq"
import { getAiSelection, getServerEnv } from "@/lib/env"
import type { AiProviderName } from "@/lib/env"

/**
 * The single place where the AI platform and model are named.
 * The provider and model are subject to change: switching means editing this
 * file (or setting AI_PROVIDER / AI_MODEL), not the UI code that consumes it.
 *
 * Free-tier choice: Groq is the default; Google Gemini is the alternate.
 * Model IDs change over time. Check the provider's model list before changing them.
 */
export const DEFAULT_MODELS: Record<AiProviderName, string> = {
  groq: "openai/gpt-oss-20b",
  google: "gemini-3.5-flash-lite",
}

/** Never throws. Safe to show in the UI. */
export function getModelInfo() {
  const { provider, model } = getAiSelection()
  return { provider, model: model ?? DEFAULT_MODELS[provider] }
}

/** Returns the configured model. Throws a clear error if the provider's key is missing. */
export function getModel() {
  getServerEnv()
  const { provider, model } = getModelInfo()
  // The default provider instances read GROQ_API_KEY / GOOGLE_GENERATIVE_AI_API_KEY themselves.
  return provider === "google" ? google(model) : groq(model)
}

/** Keeps Groq's reasoning models brief, which saves tokens and speeds up the first visible text. */
export function getProviderOptions():
  Record<string, Record<string, string>> | undefined {
  const { provider, model } = getModelInfo()
  if (provider === "groq" && model.startsWith("openai/gpt-oss")) {
    return { groq: { reasoningEffort: "low" } }
  }
  return undefined
}

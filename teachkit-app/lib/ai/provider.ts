import "server-only";
import { anthropic } from "@ai-sdk/anthropic";
import { getServerEnv } from "@/lib/env";

/**
 * The single place where the AI platform and model are named.
 * Provider and model are subject to change: switching means editing this file
 * (and its adapter package), not the UI code that consumes the result.
 *
 * Nothing here calls the model. Real model calls arrive in a later module,
 * after auth and rate limiting exist.
 */
export const MODEL_ID = "claude-sonnet-5-5";

export function getModel() {
  // Fail fast with a clear message if the key is missing.
  getServerEnv();
  // The default `anthropic` instance reads ANTHROPIC_API_KEY from the server environment.
  return anthropic(MODEL_ID);
}

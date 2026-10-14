import "server-only";
import { z } from "zod";

/**
 * The only place server secrets are read.
 *
 * - `server-only` makes the build fail if a Client Component (directly or
 *   indirectly) imports this file, so secrets cannot end up in browser code.
 * - Validation is lazy (first use, not import time) so `next build` and preview
 *   deployments don't crash when a key isn't set; the first real use fails loudly.
 * - Error messages name the missing variable but never print any value.
 */
const serverSchema = z.object({
  ANTHROPIC_API_KEY: z.string().min(1, "is required"),
});

export type ServerEnv = z.infer<typeof serverSchema>;

let cached: ServerEnv | undefined;

export function getServerEnv(): ServerEnv {
  if (cached) return cached;

  const result = serverSchema.safeParse(process.env);
  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `${issue.path.join(".") || "env"} ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid server environment: ${problems}`);
  }

  cached = result.data;
  return cached;
}

/** Safe for Server Components: reports whether the key is set, never the key. */
export function isAiConfigured(): boolean {
  return serverSchema.safeParse(process.env).success;
}

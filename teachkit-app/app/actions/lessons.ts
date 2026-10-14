"use server";

import { lessonRequestSchema } from "@/lib/validation/lesson";
import type { LessonFormState } from "@/types";

// Only these fields are ever read from the submitted form. Anything else is ignored.
const FIELDS = ["classLevel", "subject", "topic", "durationMinutes", "notes"] as const;

/**
 * Server Action: validates a lesson request on the server.
 *
 * Server Actions are public HTTP endpoints, so never trust the client:
 * read only known fields, validate everything, return safe messages.
 *
 * This phase does not call the model. In a later module, a valid request is
 * what starts draft generation.
 *
 * TODO (auth module): verify the signed-in teacher here before doing any work.
 */
export async function submitLessonRequest(
  _previous: LessonFormState,
  formData: FormData,
): Promise<LessonFormState> {
  const raw: Record<string, string> = {};
  for (const field of FIELDS) {
    const value = formData.get(field);
    raw[field] = typeof value === "string" ? value : "";
  }

  const parsed = lessonRequestSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }

    return {
      result: {
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Please fix the highlighted fields.",
          fieldErrors,
        },
      },
      values: raw,
    };
  }

  return { result: { ok: true, data: parsed.data }, values: raw };
}

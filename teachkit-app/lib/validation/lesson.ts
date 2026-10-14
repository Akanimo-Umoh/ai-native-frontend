import { z } from "zod";
import { CLASS_LEVELS } from "@/types";

/**
 * Input boundary for a lesson request.
 * Runs on the server (inside the Server Action). The browser's own checks are
 * only a convenience; this schema is the source of truth.
 */
export const lessonRequestSchema = z.object({
  classLevel: z.enum(CLASS_LEVELS, { message: "Choose a class level" }),
  subject: z
    .string()
    .trim()
    .min(2, "Enter a subject")
    .max(60, "Keep the subject under 60 characters"),
  topic: z
    .string()
    .trim()
    .min(3, "Enter a topic")
    .max(200, "Keep the topic under 200 characters"),
  durationMinutes: z.coerce
    .number()
    .int("Use a whole number of minutes")
    .min(10, "Lessons must be at least 10 minutes")
    .max(120, "Lessons can be at most 120 minutes"),
  notes: z
    .string()
    .trim()
    .max(500, "Keep notes under 500 characters")
    .optional()
    .transform((value) => value || undefined),
});

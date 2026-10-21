/**
 * Shared data models for TeachKit.
 *
 * Data shapes and constant lookup tables only, so this file is safe to import
 * from both server and client code. Never put secrets, provider configuration
 * or prompts in here.
 */

// ---------- Core domain ----------

export const CLASS_LEVELS = [
  "primary-1",
  "primary-2",
  "primary-3",
  "primary-4",
  "primary-5",
  "primary-6",
  "jss-1",
  "jss-2",
  "jss-3",
  "ss-1",
  "ss-2",
  "ss-3",
] as const

export type ClassLevel = (typeof CLASS_LEVELS)[number]

export const CLASS_LEVEL_LABELS: Record<ClassLevel, string> = {
  "primary-1": "Primary 1",
  "primary-2": "Primary 2",
  "primary-3": "Primary 3",
  "primary-4": "Primary 4",
  "primary-5": "Primary 5",
  "primary-6": "Primary 6",
  "jss-1": "JSS 1",
  "jss-2": "JSS 2",
  "jss-3": "JSS 3",
  "ss-1": "SS 1",
  "ss-2": "SS 2",
  "ss-3": "SS 3",
}

export type ApprovalStatus = "draft" | "approved" | "discarded"

// ---------- Sources (where information came from) ----------

export interface Source {
  id: string
  title: string
  url?: string
  note?: string
}

// ---------- Tools (used by later tool-calling modules) ----------

export type ToolName =
  "generateLesson" | "generateQuiz" | "saveLesson" | "suggestFeedback"

export interface ToolDefinition {
  name: ToolName
  description: string
  /** Human-in-the-loop: true means the teacher must approve before the result is used. */
  requiresApproval: boolean
}

export type ToolCallStatus = "pending" | "running" | "succeeded" | "failed"

export interface ToolCall {
  id: string
  name: ToolName
  args: Record<string, unknown>
  status: ToolCallStatus
  result?: unknown
  error?: string
}

// ---------- Messages ----------

export type MessageRole = "user" | "assistant" | "system"

export interface Message {
  id: string
  role: MessageRole
  content: string
  createdAt: string // ISO 8601
  sources?: Source[]
  toolCalls?: ToolCall[]
}

// ---------- Lessons ----------

export interface LessonRequest {
  classLevel: ClassLevel
  subject: string
  topic: string
  durationMinutes: number
  notes?: string
}

export interface LessonSection {
  id: string
  heading: string
  body: string
}

export interface LessonPlan {
  id: string
  request: LessonRequest
  title: string
  objectives: string[]
  sections: LessonSection[]
  materials: string[]
  assessmentIdeas: string[]
  status: ApprovalStatus
  aiGenerated: boolean
  createdAt: string
  updatedAt: string
}

// ---------- Quizzes ----------

export interface QuizQuestion {
  id: string
  prompt: string
  type: "multiple-choice" | "true-false" | "short-answer"
  options?: string[]
  answer: string // answer key, always visible to the teacher
  explanation?: string
  review: "pending" | "kept" | "edited" | "removed"
}

export interface Quiz {
  id: string
  lessonId: string
  questions: QuizQuestion[]
  status: ApprovalStatus
  aiGenerated: boolean
  createdAt: string
  updatedAt: string
}

// ---------- API results ----------

export interface ApiError {
  code:
    | "VALIDATION_ERROR"
    | "UNAUTHENTICATED"
    | "RATE_LIMITED"
    | "PRIVACY_BLOCKED"
    | "NETWORK_ERROR"
    | "MODEL_ERROR"
    | "INVALID_MODEL_OUTPUT"
    | "UNKNOWN"
  /** Safe, generic message for the client. Never include stack traces or provider details. */
  message: string
  fieldErrors?: Record<string, string>
  /** Present on rate-limit errors: how long to wait before retrying. */
  retryAfterSeconds?: number
}

export type ApiResult<T> =
  { ok: true; data: T } | { ok: false; error: ApiError }

// ---------- UI state ----------

export type GenerationState =
  | { status: "idle" }
  | { status: "generating"; partial?: string }
  | { status: "ready" }
  | { status: "failed"; error: ApiError; partial?: string }

/** State returned by the lesson request Server Action and consumed by the form. */
export interface LessonFormState {
  result: ApiResult<LessonRequest> | null
  /** The raw submitted values, echoed back so the form keeps what the teacher typed. */
  values: Record<string, string>
}

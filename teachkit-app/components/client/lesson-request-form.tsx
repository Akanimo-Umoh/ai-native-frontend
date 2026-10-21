"use client"

import { useActionState } from "react"
import type { ReactNode } from "react"
import { submitLessonRequest } from "@/app/actions/lessons"
import { CLASS_LEVELS, CLASS_LEVEL_LABELS } from "@/types"
import type { LessonFormState } from "@/types"

/**
 * Client Component: it needs state (pending, submitted values) and event handling,
 * so it runs in the browser. It never validates as the authority and never touches
 * secrets; it hands the form to a Server Action and renders the typed result.
 */

const initialState: LessonFormState = { result: null, values: {} }

const controlClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive"

function describedBy(id: string, error?: string, hint?: boolean) {
  const ids = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(
    Boolean
  )
  return ids.length ? ids.join(" ") : undefined
}

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string
  label: string
  error?: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function LessonRequestForm() {
  const [state, formAction, pending] = useActionState(
    submitLessonRequest,
    initialState
  )

  const failure = state.result && !state.result.ok ? state.result.error : null
  const success = state.result && state.result.ok ? state.result.data : null
  const errors = failure?.fieldErrors ?? {}
  const values = state.values

  return (
    // noValidate: the server is the source of truth, so its messages are shown consistently.
    <form
      action={formAction}
      noValidate
      className="space-y-5 rounded-lg border bg-card p-5 text-card-foreground"
    >
      {failure ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {failure.message}
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="classLevel" label="Class level" error={errors.classLevel}>
          <select
            id="classLevel"
            name="classLevel"
            defaultValue={values.classLevel ?? ""}
            aria-invalid={Boolean(errors.classLevel)}
            aria-describedby={describedBy("classLevel", errors.classLevel)}
            className={controlClass}
          >
            <option value="">Select a class level</option>
            {CLASS_LEVELS.map((level) => (
              <option key={level} value={level}>
                {CLASS_LEVEL_LABELS[level]}
              </option>
            ))}
          </select>
        </Field>

        <Field id="subject" label="Subject" error={errors.subject}>
          <input
            id="subject"
            name="subject"
            type="text"
            defaultValue={values.subject ?? ""}
            aria-invalid={Boolean(errors.subject)}
            aria-describedby={describedBy("subject", errors.subject)}
            className={controlClass}
          />
        </Field>
      </div>

      <Field
        id="topic"
        label="Topic"
        hint="For example: Photosynthesis"
        error={errors.topic}
      >
        <input
          id="topic"
          name="topic"
          type="text"
          defaultValue={values.topic ?? ""}
          aria-invalid={Boolean(errors.topic)}
          aria-describedby={describedBy("topic", errors.topic, true)}
          className={controlClass}
        />
      </Field>

      <Field
        id="durationMinutes"
        label="Duration (minutes)"
        hint="Between 10 and 120"
        error={errors.durationMinutes}
      >
        <input
          id="durationMinutes"
          name="durationMinutes"
          type="number"
          inputMode="numeric"
          defaultValue={values.durationMinutes ?? "40"}
          aria-invalid={Boolean(errors.durationMinutes)}
          aria-describedby={describedBy(
            "durationMinutes",
            errors.durationMinutes,
            true
          )}
          className={controlClass}
        />
      </Field>

      <Field id="notes" label="Notes (optional)" error={errors.notes}>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={values.notes ?? ""}
          aria-invalid={Boolean(errors.notes)}
          aria-describedby={describedBy("notes", errors.notes)}
          className={controlClass}
        />
      </Field>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60"
      >
        {pending ? "Checking..." : "Check request"}
      </button>

      <div role="status" aria-live="polite">
        {success ? (
          <div className="space-y-2 rounded-md border bg-muted px-3 py-3 text-sm">
            <p className="font-medium">Request accepted by the server.</p>
            <p className="text-muted-foreground">
              This form only checks the request. The streaming assistant is on
              the chat page.
            </p>
            <pre className="overflow-x-auto text-xs">
              {JSON.stringify(success, null, 2)}
            </pre>
          </div>
        ) : null}
      </div>
    </form>
  )
}

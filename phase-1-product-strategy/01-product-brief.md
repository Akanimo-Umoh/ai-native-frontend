# TeachKit: Product Brief

**Author:** Akanimo Umoh · **Track:** Advanced Frontend, Fully AI-Native · **Phase 1, Week 1**

## 1. One-line pitch

TeachKit is an AI teaching workspace that helps private-school teachers prepare lessons, generate assessments and review student work, while keeping the teacher in control of every AI-generated decision.

**Product principle:** AI proposes → Teacher reviews → Teacher decides → System records.

## 2. Problem

Private-school teachers write lesson notes, plan activities and set quizzes every week, mostly by hand, on top of marking and admin. The work is repetitive and time-consuming, and quality varies. Generic chatbots can draft content, but they are not built around a school's workflow: there is no class context, no review step, no saved drafts, and nothing that keeps teachers accountable for what reaches students.

## 3. Target users

| User | Role in the product | What they care about |
|---|---|---|
| **Teacher** (primary) | Creates, reviews and approves lessons and quizzes | Saving prep time, content they can trust and edit |
| **School owner / head teacher** (buyer) | Pays for seats, wants consistent quality | Cost, teacher productivity, no embarrassing AI mistakes |

## 4. Jobs-to-be-done

1. When I have to teach a topic next week, I want a solid draft lesson plan for my class level so I can spend my time improving it instead of starting from a blank page.
2. When I finish a lesson, I want a quiz that matches what I taught so I can check understanding without writing questions from scratch.
3. When students submit answers, I want a first-pass suggestion on feedback so I can mark faster, while the final grade stays mine.
4. When I reuse the tool, I want it to remember my class levels, subjects and preferred style so I don't repeat myself.

## 5. Core AI use cases

| # | Use case | AI action | Human checkpoint | System action |
|---|---|---|---|---|
| 1 | **Lesson plan** (MVP) | Drafts objectives, activities, materials, assessment ideas | Teacher edits and approves | Saves approved lesson |
| 2 | **Quiz generation** (MVP) | Generates questions with answer key from an approved lesson | Teacher reviews each question: keep, edit, remove | Saves approved quiz |
| 3 | **Assistive feedback** (later module) | Suggests feedback on a student answer | Teacher accepts, edits or rejects | Records final feedback |

Grading is deliberately scoped as AI-assisted feedback, never AI grading. The AI never writes a final grade.

## 6. Core user flows

**Flow A: Lesson creation**
1. Teacher picks class level, subject, topic and duration (or types a natural-language request such as "Photosynthesis for JSS2, 40 minutes").
2. Server streams a draft lesson plan into the review panel.
3. Teacher edits sections inline, or regenerates a single section.
4. Teacher clicks **Approve** and the lesson is saved.
5. *Failure:* generation fails → retry, or **Write manually** (empty editor), or save a partial draft.

**Flow B: Quiz generation**
1. From an approved lesson, teacher clicks **Generate quiz** and chooses question count and type.
2. Draft questions stream in as editable cards.
3. Teacher keeps, edits, regenerates or deletes each question.
4. Teacher approves the quiz and it is saved and ready to use.
5. *Failure:* output doesn't match the expected structure → show a clear error, keep what parsed, offer retry or add questions manually.

**Flow C: Assistive feedback (later)**
1. Teacher pastes or enters a student answer against a quiz question.
2. AI suggests feedback and flags where it is uncertain.
3. Teacher accepts, edits or rejects it, and the final feedback is recorded.

## 7. Scope

**In scope (MVP, Weeks 1 to 6 target):** sign-in, class/subject setup, lesson plan generation with edit and approve, quiz generation with per-question review, saved lessons and quizzes, teacher preferences, manual fallback everywhere.

**Out of scope for now:** auto-grading, student-facing accounts, parent communication, voice input, curriculum scraping, payments.

## 8. Platform and model choice

- **Framework:** Next.js (App Router) + TypeScript + Tailwind CSS, deployed on Vercel.
- **AI layer:** Vercel AI SDK, so the frontend code stays the same whatever the provider is.
- **Provider:** build against **Anthropic (Claude)** through the Messages API. **This is swappable:** because all model calls go through the AI SDK on the server, switching to OpenAI (Responses API) or another provider is a configuration change, not a frontend rewrite.

## 9. Frontend / backend / model / data boundaries

Full diagram in [`system-diagram.md`](./system-diagram.md). Summary:

| Layer | Owns |
|---|---|
| **Browser** | Forms, streaming render, inline editing, approve/reject controls, loading/error/fallback UI, unsaved-draft state |
| **Next.js server** | API keys, prompt construction, input validation, calling the model, output validation, auth checks, rate limiting, persistence |
| **Model** | Drafting lessons, generating quiz questions, suggesting feedback; returns structured output |
| **Data store** | Teachers, classes, lessons, quizzes, preferences (database chosen in a later module) |
| **External tools** | AI provider API; later, optional document/export tools |

## 10. Acceptance criteria

**Accuracy and trust**
- Every lesson and quiz is labelled "AI draft" until the teacher approves it.
- Quiz questions always ship with an answer key, and the teacher can see and edit it before approving.
- The AI never writes a final grade; feedback is a suggestion until accepted.
- Output that fails schema validation is never shown as if it were valid.

**Latency**
- First streamed content appears within about 3 seconds on a normal connection; the UI shows progress immediately on submit.
- Full lesson draft completes within about 30 seconds, with a cancel button available throughout.

**Accessibility**
- Meets WCAG 2.2 AA basics: keyboard-operable review and approve flows, visible focus, sufficient contrast, labelled form fields.
- Streaming updates are announced to assistive tech without stealing focus.
- Works on a phone-width screen, since many teachers will use mobile.

**Safety**
- Prompts constrain content to age-appropriate, curriculum-relevant material for the stated class level.
- A teacher can report or discard a bad output in one action.

**UX quality**
- No work is ever lost on failure: partial drafts are preserved and editable.
- Every AI step has a manual alternative.
- Empty, loading, error and offline states are designed, not defaulted.

## 11. Privacy and data that must not reach the browser

- **API keys and provider credentials**: server-only environment variables.
- **System prompts and prompt templates**: kept on the server.
- **Other teachers' and schools' data**: every query is scoped to the signed-in teacher/school.
- **Student identifiers and scores** (later modules): stored server-side; names are not sent to the model. Use anonymised IDs in prompts.
- **Raw model responses and logs**: server-side only; the browser receives validated, structured output.

## 12. Early state-management decisions

| State | Where it lives | Notes |
|---|---|---|
| Current draft (streaming + edits) | Browser (React state) | Autosaved to server as draft so refresh doesn't lose work |
| Conversation / request history | Server, per teacher | Used for regenerate and context, trimmed to control cost |
| Approved lessons and quizzes | Database | Source of truth |
| Session / auth | Server-managed cookie | Not readable by client JS |
| Teacher preferences (class levels, subjects, tone) | Database, cached in client | Injected into prompts server-side |
| UI state (panels, filters) | Browser | Disposable |

## 13. Business model (why someone pays)

Sold per school: seat-based subscription per teacher per term, with a limited free tier (a small number of generations) to let schools trial it. The value proposition to the buyer is hours of prep time saved per teacher each week, with a review step that protects the school's quality bar.

## 14. Success criteria for the product

- A teacher can go from a topic to an approved lesson plan in under 5 minutes.
- At least 80% of generated quiz questions are kept (with or without edits) in testing with real teachers.
- Zero cases of an AI output being saved or shared without explicit approval.

## 15. Deployment

Repo connected to Vercel; every push to `main` deploys automatically. Live URL is listed in the README.
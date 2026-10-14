# TeachKit: Architecture Notes (Phase 1, Next.js Foundation)

How the Module 1 product brief maps onto the Next.js App Router, and which code runs where. All file paths are relative to the repository root.

## 1. The building blocks and where each is used

| Concept | Runs on | Use it for | In this repo |
|---|---|---|---|
| **Server Component** (default in the App Router) | Server only; ships no JavaScript for itself | Reading data and secrets, rendering | `teachkit-app/app/page.tsx`, `teachkit-app/components/server/home-page.tsx`, `teachkit-app/components/server/boundary-status.tsx` |
| **Client Component** (`"use client"`) | Browser (pre-rendered on the server first) | State, effects, event handlers, browser APIs | `teachkit-app/components/client/lesson-request-form.tsx` |
| **Server Action** (`"use server"`) | Server, called from the client | Mutations and validation without a hand-written API route | `teachkit-app/app/actions/lessons.ts` |
| **Route Handler** (`route.ts`) | Server | Plain HTTP endpoints; later, streaming model responses | `teachkit-app/app/api/health/route.ts` |

**Rule used in this project:** everything is a Server Component until it needs state, effects or event handlers. Only then does that leaf become a Client Component, and it stays small and receives data as props.

**Server Actions are public endpoints.** Anyone can call one directly, so each one reads only known fields, validates everything on the server, and (once auth exists) checks the session before doing any work. `submitLessonRequest` does the first two now and carries a marked TODO for the third.

### How the demo flows

1. The home page (`app/page.tsx`) only renders `HomePage`, which composes small Server Components. `BoundaryStatus` renders per request. It reads the server environment and shows whether a key is configured, never the key.
2. `ClientComponentSection` renders `LessonRequestForm` (Client Component), which holds form state.
3. On submit, the form calls the Server Action `submitLessonRequest`.
4. The action validates the input with the zod schema in `teachkit-app/lib/validation/lesson.ts` and returns a typed `LessonFormState`.
5. The client renders field errors or a confirmation. No model is called.

## 2. Why this split

- Secrets and validation must run where the user can't tamper with them: the server.
- Interactivity needs the browser, so only interactive leaves are Client Components, which keeps the JavaScript sent to the browser small.
- Typed results (`ApiResult`) mean the client never sees stack traces or provider details, only safe messages.

## 3. Module 1 product brief to server vs client responsibilities

| Responsibility (from the product brief) | Where it lives | Why | Status |
|---|---|---|---|
| Request form (class, subject, topic, duration) | **Client** | Needs input state and pending feedback | Built |
| Input validation (authoritative) | **Server** (Server Action + zod) | The browser can't be trusted | Built |
| Environment and API key handling | **Server** (`lib/env.ts`) | Secrets must never reach the browser | Built |
| AI provider and model configuration | **Server** (`lib/ai/provider.ts`) | Keys and model choice stay server-side | Built (config only) |
| Streaming render of the AI draft | **Client** | Updates as tokens arrive | Later |
| Inline editing, regenerate a section | **Client** | Interactive; calls the server | Later |
| Approve / reject / write manually | **Client** triggers a **Server Action** | The click is the browser's; the save is the server's | Later |
| Loading, error, offline, fallback UI | **Client** | Reacts to request state | Partly built (pending, errors) |
| Unsaved draft state | **Client**, autosaved to the server | Fast typing, but a refresh must not lose work | Later |
| Auth and session check | **Server** | Cookies are HttpOnly; the client can't be trusted | Later |
| Prompt construction and teacher preferences | **Server** | System prompts must not reach the browser | Later |
| Model call through the AI SDK | **Server** | The API key lives there | Later |
| Output schema validation | **Server** | Nothing from the model is trusted until validated | Later |
| Persistence of approved lessons and quizzes | **Server** | Source of truth, scoped to the teacher | Later |
| Rate limiting | **Server** | Cost and abuse control | Later |

## 4. Folder structure

```
teachkit-app/
├── app/
│   ├── page.tsx                      # Server Component: only renders <HomePage />
│   ├── actions/lessons.ts            # Server Action
│   └── api/health/route.ts           # Route Handler
├── components/
│   ├── server/
│   │   ├── home-page.tsx             # Server Component: composes the page
│   │   ├── home-header.tsx           # Server Component
│   │   ├── server-component-section.tsx
│   │   ├── client-component-section.tsx
│   │   └── boundary-status.tsx       # Server Component: reads server env
│   ├── client/
│   │   └── lesson-request-form.tsx   # Client Component
│   └── ui/                           # shadcn/ui components
├── lib/
│   ├── env.ts                        # server-only
│   ├── ai/provider.ts                # server-only
│   └── validation/lesson.ts          # zod schema
└── types/index.ts                    # shared types (no secrets)
```

The template uses no `src/` folder, so `@/` maps to the project root.

## 5. How the boundary is enforced

| Mechanism | Effect |
|---|---|
| `import "server-only"` in `lib/env.ts` and `lib/ai/provider.ts` | The build fails if a Client Component imports either file, directly or indirectly |
| `"use client"` only on the form component | Everything else stays on the server by default |
| No `NEXT_PUBLIC_` variables | Nothing secret is bundled into browser code |
| Lazy env validation | Secrets are checked on first use, with error messages that name the variable but never print a value |
| Whitelisted form fields in the Server Action | Unknown fields sent by a caller are ignored |
| Shared types contain only shapes and constant lookup tables | Safe to import from both sides |

## 6. Shared types

Defined in `teachkit-app/types/index.ts`:

- **Messages:** `Message`, `MessageRole`
- **Tools:** `ToolDefinition`, `ToolCall`, `ToolName`, `ToolCallStatus`
- **Sources:** `Source`
- **Domain:** `LessonRequest`, `LessonPlan`, `Quiz`, `QuizQuestion`, `ClassLevel`, `ApprovalStatus`
- **API and UI state:** `ApiResult`, `ApiError`, `GenerationState`, `LessonFormState`

`Message` can carry `sources` and `toolCalls`, so the three required models connect. `ToolDefinition.requiresApproval` records the human-in-the-loop principle from the product brief.

## 7. State management (this phase)

Only the form's submit state exists today: `useActionState` holds the last result and the submitted values. Draft state, history, preferences and persistence follow the placement decisions in section 12 of the product brief and arrive in later modules.

## 8. AI integration layer

- Packages: `ai` (the Vercel AI SDK) and `@ai-sdk/anthropic` (the provider adapter).
- `teachkit-app/lib/ai/provider.ts` is the one place that names the provider and the model (`MODEL_ID`). It exposes `getModel()` for later server code and calls nothing.
- The AI SDK can also route plain model strings through the Vercel AI Gateway. This project calls Anthropic directly through the adapter, so the credential is `ANTHROPIC_API_KEY`.
- **The provider and model are subject to change.** Switching means editing `provider.ts` and the adapter package, not the UI.
- Why the SDK sits at this boundary: see [ai-sdk-boundary-note.md](./ai-sdk-boundary-note.md).

## 9. Decisions log

| Decision | Choice | Reason |
|---|---|---|
| Scaffold | shadcn/ui Next.js template, pnpm | Ready-made accessible component base and a standard Next.js setup |
| Rendering default | Server Components | Less JavaScript shipped; secrets stay on the server |
| Page files | Only import and render components | Pages stay readable; markup lives in reusable components |
| Mutations | Server Actions | Simple and typed, no extra API layer |
| Streaming (later) | Route Handlers | Needs an HTTP stream, not a one-shot action |
| Validation | zod on the server | One schema describes the rules and produces safe messages |
| Env access | One `lib/env.ts`, validated lazily | Fail loudly on use, don't break builds or previews that lack a key |
| Per-request rendering | `connection()` in `BoundaryStatus` | The status reflects the live environment, not build time |
| Model calls | Deferred | The URL is public with no auth or rate limiting, so a model route could spend the key |
| Client data library | None yet | Server Components and Server Actions cover this phase; add TanStack Query when client-side caching is needed |
| Provider | Anthropic via `@ai-sdk/anthropic` | Matches the product brief; swappable |

## 10. Known limitations

- No authentication, rate limiting, persistence or model call yet.
- The home page shows whether a key is configured. That is deliberate for demonstrating server rendering and should be removed or protected once auth exists.
- No Content-Security-Policy header yet; it needs careful tuning with Next.js and is planned for later.

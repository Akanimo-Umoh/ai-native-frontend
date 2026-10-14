# Phase 1: Next.js App Router, Server/Client Boundaries, and TypeScript

**Product:** TeachKit, an AI teaching workspace for private-school teachers
**Track:** Advanced Frontend, Fully AI-Native
**Author:** Akanimo Umoh
**Live URL:** _add Vercel URL here_ (expected: https://ai-native-frontend-teachkit-app.vercel.app/)
**Application code:** [`teachkit-app/`](../../teachkit-app)

## What this submission is

The technical foundation for TeachKit: a deployed, typed Next.js App Router application with the server/client boundary applied in working code, environment variables kept server-side, the Vercel AI SDK installed, and written notes mapping the Module 1 product brief onto server vs client responsibilities.

No AI model is called in this phase. Model calls come after authentication and rate limiting exist, so a public URL can't spend the API key.

## Requirement checklist

| Requirement | Where to find it |
|---|---|
| Next.js App Router project with TypeScript | [`teachkit-app/`](../../teachkit-app), [`tsconfig.json`](../../teachkit-app/tsconfig.json) |
| Explain and apply Server Components, Client Components and Server Actions | Applied: [`app/page.tsx`](../../teachkit-app/app/page.tsx), [`components/server/home-page.tsx`](../../teachkit-app/components/server/home-page.tsx), [`components/server/boundary-status.tsx`](../../teachkit-app/components/server/boundary-status.tsx), [`components/client/lesson-request-form.tsx`](../../teachkit-app/components/client/lesson-request-form.tsx), [`app/actions/lessons.ts`](../../teachkit-app/app/actions/lessons.ts). Explained: [architecture notes](./architecture-notes.md#1-the-building-blocks-and-where-each-is-used) |
| Shared TypeScript types for messages, tools, sources | [`types/index.ts`](../../teachkit-app/types/index.ts) |
| Environment variables set up, API key server-side only | [`lib/env.ts`](../../teachkit-app/lib/env.ts), [`.env.example`](../../teachkit-app/.env.example), key stored in Vercel |
| Basic security checklist (secrets and input boundaries) | [security-checklist.md](./security-checklist.md) |
| Which parts of the Module 1 brief map to server vs client | [architecture-notes.md](./architecture-notes.md#3-module-1-product-brief-to-server-vs-client-responsibilities) |
| Vercel AI SDK installed (`ai` plus a provider adapter) | [`package.json`](../../teachkit-app/package.json) (`ai`, `@ai-sdk/anthropic`), used in [`lib/ai/provider.ts`](../../teachkit-app/lib/ai/provider.ts) |
| Note, in my own words, on why the AI SDK sits at the boundary | [ai-sdk-boundary-note.md](./ai-sdk-boundary-note.md) |
| Deployed and live | Live URL above |

## Contents of this folder

| File | Purpose |
|---|---|
| [architecture-notes.md](./architecture-notes.md) | Server/client concepts, product brief mapping, folder structure, decisions |
| [security-checklist.md](./security-checklist.md) | Security checklist with verification steps and evidence |
| [ai-sdk-boundary-note.md](./ai-sdk-boundary-note.md) | Why the AI SDK sits between the AI platform and the UI |
| [evidence/](./evidence) | Screenshots referenced by the security checklist |

## How to review in five minutes

1. Open the live URL. The page shows a server-rendered status block and a lesson request form.
2. Submit the form empty. The validation messages come back from the Server Action, not the browser.
3. Open [architecture-notes.md](./architecture-notes.md) and check the server/client mapping against the code.
4. Open [security-checklist.md](./security-checklist.md) and the screenshots in [evidence/](./evidence).
5. To run it yourself, follow [`teachkit-app/README.md`](../../teachkit-app/README.md).

## Key decisions

- **Scaffold:** the shadcn/ui Next.js template, with pnpm.
- **Boundary enforcement:** `server-only` on every server module, so a Client Component importing one fails the build.
- **Validation:** zod schemas run on the server inside the Server Action.
- **AI integration:** `ai` plus `@ai-sdk/anthropic`, configured in one file. The provider and model are subject to change.
- **No model call yet:** deliberately deferred until auth and rate limiting exist.
- **No TanStack Query yet:** Server Components and Server Actions cover this phase's data needs; it can be added when client-side caching is needed.

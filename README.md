# TeachKit

An AI teaching workspace that helps private-school teachers prepare lessons, generate assessments and review student work, while keeping the teacher in control of every AI-generated decision.

> **AI proposes → Teacher reviews → Teacher decides → System records.**

**Live demo:** [TeachKit Live Demo](https://ai-native-frontend-teachkit-app.vercel.app/)
**Author:** Akanimo Umoh
**Programme:** Flexisaf Internship, Advanced Frontend (Fully AI-Native Track)

## Status

Phase 1 (product strategy and the Next.js foundation) is complete. Phase 2 (Week 4) adds a streaming chat assistant with stop, retry, regenerate, copy and feedback controls, safety and error states, and accessibility evidence.

The application lives in [`teachkit-app/`](./teachkit-app). Each phase's documents are in their own folder under [`submissions/`](./submissions).

## Repository structure

```
ai-native-frontend/
├── README.md                              # project overview (this file)
├── submissions/                           # one folder per phase submission
│   ├── phase-1-product-strategy/          # product brief, system diagram, risk register
│   ├── phase-1-nextjs-foundation/         # architecture notes, security checklist, AI SDK note
│   └── phase-2-streaming-chat/            # interaction controls, accessibility evidence
└── teachkit-app/                          # the Next.js application
```

## Phases

| Phase | Folder | Focus |
|---|---|---|
| Phase 1: AI-Native Product Strategy & Frontend Architecture | [phase-1-product-strategy](./submissions/phase-1-product-strategy) | Product brief, system diagram, risk register, README, live URL |
| Phase 1: Next.js App Router, Server/Client Boundaries, and TypeScript | [phase-1-nextjs-foundation](./submissions/phase-1-nextjs-foundation) | Next.js app, architecture notes, security checklist, live URL |
| Phase 2: Streaming Chat UX and Conversational Interfaces | [phase-2-streaming-chat](./submissions/phase-2-streaming-chat) | Streaming chat, interaction controls, accessibility evidence, live URL |

More phases are added to this table as they are completed.

## Documents

**Product strategy**

| Document | Description |
|---|---|
| [Product brief](./submissions/phase-1-product-strategy/01-product-brief.md) | Problem, users, jobs-to-be-done, AI use cases, flows, acceptance criteria, privacy, state decisions |
| [System diagram](./submissions/phase-1-product-strategy/02-system-boundary-diagram.md) | Browser / server / model / external boundaries, sequence and approval-loop diagrams |
| [Risk register](./submissions/phase-1-product-strategy/03-risk-register.md) | Risks, likelihood, impact and mitigations |

**Next.js foundation**

| Document | Description |
|---|---|
| [Architecture notes](./submissions/phase-1-nextjs-foundation/architecture-notes.md) | Server vs client mapping of the product brief, boundary mechanisms, decisions |
| [Security checklist](./submissions/phase-1-nextjs-foundation/security-checklist.md) | Secret handling and input boundaries, with how each item is verified |
| [AI SDK boundary note](./submissions/phase-1-nextjs-foundation/ai-sdk-boundary-note.md) | Why the AI SDK sits between the AI platform and the UI |

**Streaming chat**

| Document | Description |
|---|---|
| [Interaction controls](./submissions/phase-2-streaming-chat/interaction-controls.md) | Every control and state (loading, stop, retry, regenerate, copy, feedback, errors, safety) and how to test each |
| [Accessibility evidence](./submissions/phase-2-streaming-chat/accessibility-evidence.md) | Keyboard, focus and screen-reader design, with the test plan and results |

## What TeachKit does

1. **Lesson plans:** the teacher describes a class and topic, the AI drafts a lesson plan, the teacher edits and approves it.
2. **Quizzes:** from an approved lesson, the AI drafts questions and an answer key; the teacher reviews each question before approving.
3. **Assistive feedback (later):** the AI suggests feedback on student answers; the teacher decides the final result. The AI never assigns a grade.

Every AI step has a manual fallback, and nothing is saved or shared without explicit teacher approval.

## Architecture at a glance

- **Browser:** forms, streaming render, inline editing, approve/reject, loading and error states
- **Next.js server:** auth, validation, prompt building, model calls, output validation, persistence, all secrets
- **Model:** drafts lessons, quiz questions and feedback suggestions
- **Data store:** teachers, classes, lessons, quizzes, preferences

See the [system diagram](./submissions/phase-1-product-strategy/02-system-boundary-diagram.md) for details.

## Tech stack

- Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui
- Vercel AI SDK (Groq by default, Google Gemini as the alternate; both free tiers)
- pnpm
- Deployed on Vercel

### AI platform and model

The project has no funding, so TeachKit runs on a **free AI tier**: **Groq** by default (model `openai/gpt-oss-20b`), with **Google Gemini** as an alternate provider. **The provider and model are subject to change.** The choice is swappable because all model calls go through the Vercel AI SDK on the server, so the frontend code stays the same whichever provider or model is used. This project already made one such switch (from a paid provider to a free one) by editing a single server file.

## Getting started

```bash
git clone https://github.com/Akanimo-Umoh/ai-native-frontend.git
cd ai-native-frontend/teachkit-app
pnpm install
cp .env.example .env.local   # Windows PowerShell: Copy-Item .env.example .env.local
pnpm dev
```

Then open http://localhost:3000. The app runs without an API key; the chat at /chat needs one (see the app README). Full instructions, environment variables and troubleshooting are in [`teachkit-app/README.md`](./teachkit-app/README.md).

Environment variables (server-only, never prefixed with `NEXT_PUBLIC_`):

```
AI_PROVIDER=
AI_MODEL=
GROQ_API_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=
```

## Deployment

The repo is connected to Vercel with `teachkit-app` as the root directory. Every push to `main` deploys automatically.

## Principles

- The teacher is always the decision-maker.
- Secrets, prompts and student data stay on the server.
- Failures are recoverable: no lost work, always a manual path.

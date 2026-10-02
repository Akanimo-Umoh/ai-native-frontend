# TeachKit

An AI teaching workspace that helps private-school teachers prepare lessons, generate assessments and review student work, while keeping the teacher in control of every AI-generated decision.

> **AI proposes → Teacher reviews → Teacher decides → System records.**

**Live demo:** [TeachKit Live Demo](https://teach-kit.vercel.app/)
**Author:** Akanimo Umoh
**Programme:** Flexisaf Internship, Advanced Frontend (Fully AI-Native Track)

## Status

Phase 1, Week 1: product strategy and frontend architecture. This repo currently contains planning documents; the app is built up module by module.

## Documents

| Document | Description |
|---|---|
| [Product brief](./docs/product-brief.md) | Problem, users, jobs-to-be-done, AI use cases, flows, acceptance criteria, privacy, state decisions |
| [System diagram](./docs/system-diagram.md) | Browser / server / model / external boundaries, sequence and approval-loop diagrams |
| [Risk register](./docs/risk-register.md) | Risks, likelihood, impact and mitigations |

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

See the [system diagram](./docs/system-diagram.md) for details.

## Tech stack

- Next.js (App Router), TypeScript, Tailwind CSS
- Vercel AI SDK
- Anthropic (Claude) as the default provider; **swappable**, because the AI SDK keeps frontend code the same across providers
- Deployed on Vercel

## Getting started

```bash
git clone <repo-url>
cd teachkit
npm install
cp .env.example .env.local   # add your provider key
npm run dev
```

Environment variables (server-only, never prefixed with `NEXT_PUBLIC_`):

```
ANTHROPIC_API_KEY=
```

## Deployment

The repo is connected to Vercel. Every push to `main` deploys automatically.

## Roadmap

| Module | Focus |
|---|---|
| Phase 1 | Product brief, system diagram, risk register, README, live URL |
| Next modules | AI SDK integration, streaming lesson generation, structured quiz output, persistence, teacher preferences, tool use, evals |

## Principles

- The teacher is always the decision-maker.
- Secrets, prompts and student data stay on the server.
- Failures are recoverable: no lost work, always a manual path.
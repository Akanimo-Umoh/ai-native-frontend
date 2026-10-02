# TeachKit

An AI teaching workspace that helps private-school teachers prepare lessons, generate assessments and review student work, while keeping the teacher in control of every AI-generated decision.

> **AI proposes → Teacher reviews → Teacher decides → System records.**

**Live demo:** [TeachKit Live Demo](https://ai-native-frontend-teachkit-app.vercel.app/)
**Author:** Akanimo Umoh
**Programme:** Flexisaf Internship, Advanced Frontend (Fully AI-Native Track)

## Status

Phase 1, Week 1: product strategy and frontend architecture. This repo currently contains planning documents; the app is built up phase by phase.

The application will live in [`teachkit-app/`](./teachkit-app). Each phase's documents are in their own folder.

## Repository structure

```
ai-native-frontend/
├── README.md                      # project overview (this file)
├── phase-1-product-strategy/      # Phase 1 documents
└── teachkit-app/                  # the application (built from Weeks 2-3)
```

## Phases

| Phase | Folder | Focus |
|---|---|---|
| Phase 1: AI-Native Product Strategy & Frontend Architecture | [phase-1-product-strategy](./phase-1-product-strategy) | Product brief, system diagram, risk register, README, live URL |

More phases are added to this table as they are completed.

## Phase 1 documents

| Document | Description |
|---|---|
| [Product brief](./phase-1-product-strategy/01-product-brief.md) | Problem, users, jobs-to-be-done, AI use cases, flows, acceptance criteria, privacy, state decisions |
| [System diagram](./phase-1-product-strategy/02-system-boundary-diagram.md) | Browser / server / model / external boundaries, sequence and approval-loop diagrams |
| [Risk register](./phase-1-product-strategy/03-risk-register.md) | Risks, likelihood, impact and mitigations |

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

See the [system diagram](./phase-1-product-strategy/02-system-boundary-diagram.md) for details.

## Tech stack

- Next.js (App Router), TypeScript, Tailwind CSS
- Vercel AI SDK
- Deployed on Vercel

### AI platform and model

TeachKit is currently planned against **Anthropic (Claude)**. **The provider and model are subject to change.** The choice is swappable because all model calls go through the Vercel AI SDK on the server, so the frontend code stays the same whichever provider or model is used. Switching is a configuration change, not a UI rewrite.

## Getting started

_Coming in Phase 1, Weeks 2-3, when the application is scaffolded._

```bash
git clone https://github.com/Akanimo-Umoh/ai-native-frontend.git
cd ai-native-frontend/teachkit-app
npm install
cp .env.example .env.local   # add your provider key
npm run dev
```

Environment variables (server-only, never prefixed with `NEXT_PUBLIC_`):

```
ANTHROPIC_API_KEY=
```

## Deployment

The repo is connected to Vercel with `teachkit-app` as the root directory. Every push to `main` deploys automatically.

## Principles

- The teacher is always the decision-maker.
- Secrets, prompts and student data stay on the server.
- Failures are recoverable: no lost work, always a manual path.
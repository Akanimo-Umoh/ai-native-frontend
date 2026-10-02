# Phase 1: AI-Native Product Strategy & Frontend Architecture

**Product:** TeachKit, an AI teaching workspace for private-school teachers
**Track:** Advanced Frontend, Fully AI-Native
**Author:** Akanimo Umoh
**Live URL:** [TeachKit Live Demo](https://ai-native-frontend-teachkit-app.vercel.app/)

## What this submission is

The first real brief for TeachKit. There is no feature code in this phase; the work is planning the product and placing each part of the system correctly before any frontend code is written.

TeachKit helps teachers draft lesson plans and quizzes with AI, then review, edit and approve everything before it is saved. The AI proposes, and the teacher decides.

## Contents

| Deliverable | File | What it covers |
|---|---|---|
| Product brief | [product-brief.md](./product-brief.md) | Problem, target users, jobs-to-be-done, core AI use cases, user flows (including review/approval and fallback states), acceptance criteria, privacy risks, early state-management decisions, AI platform choice, success metrics |
| System diagram | [system-diagram.md](./system-diagram.md) | What runs in the browser vs. the server vs. the model vs. external services, plus a sequence diagram of lesson generation and the approval loop |
| Risk register | [risk-register.md](./risk-register.md) | 14 risks with likelihood, impact and mitigations |
| README | this file | Overview and where to find everything |
| Live Vercel URL | see top of this file | Deployed placeholder page |

## Where to start reviewing

1. Read the one-line pitch and product principle at the top of the [product brief](./product-brief.md).
2. Open the [system diagram](./system-diagram.md). It is the main evidence for placing browser, server, model and data responsibilities.
3. Check the acceptance criteria (section 10 of the brief) and the [risk register](./risk-register.md).

## Key decisions in this phase

- **Product:** TeachKit, scoped to lesson plans and quizzes for the MVP. AI feedback on student work comes in a later module, and it never assigns a grade.
- **AI platform:** Anthropic (Claude), through the Vercel AI SDK. The choice is swappable: the SDK keeps frontend code the same whatever provider is used.
- **Stack:** Next.js (App Router), TypeScript, Tailwind CSS, deployed on Vercel.
- **Human approval:** nothing AI-generated is saved or shared without the teacher's explicit approval, and every AI step has a manual fallback.

## Deployment

The repository is connected to Vercel and deploys automatically on every push. The live link above currently shows a placeholder page, since the application is built in later modules.

## Next

Phase 1, Weeks 2-3: Next.js App Router and TypeScript project setup, server/client boundaries, environment variables, and the AI SDK install.
# Phase 2: Streaming Chat UX and Conversational Interfaces

**Product:** TeachKit, an AI teaching workspace for private-school teachers
**Track:** Advanced Frontend, Fully AI-Native
**Author:** Akanimo Umoh
**Live URL:** _add Vercel URL here_ (expected: https://ai-native-frontend-teachkit-app.vercel.app/chat)
**Application code:** [`teachkit-app/`](../../teachkit-app)

## What this submission is

The first real conversation in TeachKit: a streaming teaching assistant. A teacher asks for a lesson plan, quiz or explanation, and the reply appears progressively. Every control and state is designed and documented, and the accessibility behaviour is tested.

The three outcome claims map to three checkable things:

| Claim | Evidence |
|---|---|
| **Feels fast** | Progressive streaming: text appears as it is written; the "thinking" indicator and Stop control show immediately. See the recording in [evidence/](./evidence) |
| **Understandable** | Clear loading, error and safety states, and working stop, retry, regenerate, copy and feedback controls. See [interaction-controls.md](./interaction-controls.md) |
| **Accessible** | Keyboard operation, focus rules and screen-reader status updates. See [accessibility-evidence.md](./accessibility-evidence.md) |

## Requirement checklist

| Requirement | Where to find it |
|---|---|
| Chat message components for user, assistant, system/status and error messages | [`chat-message.tsx`](../../teachkit-app/components/client/chat/chat-message.tsx), [`chat-system-message.tsx`](../../teachkit-app/components/client/chat/chat-system-message.tsx), [`chat-error-message.tsx`](../../teachkit-app/components/client/chat/chat-error-message.tsx), [`chat-safety-notice.tsx`](../../teachkit-app/components/client/chat/chat-safety-notice.tsx) |
| Render streaming output progressively | [`chat-panel.tsx`](../../teachkit-app/components/client/chat/chat-panel.tsx) (`useChat`), [`app/api/chat/route.ts`](../../teachkit-app/app/api/chat/route.ts) |
| Loading, retry, cancel/stop, regenerate, copy and feedback states | [interaction-controls.md](./interaction-controls.md) |
| Preserve conversation history in local or server-backed state | [`hooks/use-chat-history.ts`](../../teachkit-app/hooks/use-chat-history.ts) (browser storage, validated and capped) |
| Keyboard navigation, focus management, screen-reader-friendly status updates | [accessibility-evidence.md](./accessibility-evidence.md), [`chat-status-announcer.tsx`](../../teachkit-app/components/client/chat/chat-status-announcer.tsx) |
| Moderation or safety fallback states in the UI | [`chat-safety-notice.tsx`](../../teachkit-app/components/client/chat/chat-safety-notice.tsx), [`privacy-guard.ts`](../../teachkit-app/lib/chat/privacy-guard.ts) |
| Live Vercel URL | Live URL above |

## Contents of this folder

| File | Purpose |
|---|---|
| [interaction-controls.md](./interaction-controls.md) | Every control and state, the focus rules, and how to test each state |
| [accessibility-evidence.md](./accessibility-evidence.md) | Accessibility design, WCAG 2.2 mapping, test plan and results |
| [evidence/](./evidence) | Screenshots and recordings referenced by the documents |

## How to review in five minutes

1. Open the live chat URL and click one of the starter prompts. The reply streams in.
2. While it streams, press **Stop** (or Escape). The text stays, and focus returns to the message box.
3. Open `/chat?demo=states` and use the simulator buttons to see the provider error, rate limit, privacy block and declined reply states.
4. Use the keyboard only: Tab through the page, send with Enter, stop with Escape.
5. Reload the page. The conversation is still there (saved on this device only).

## Key decisions

- **Free AI tier.** The project has no funding, so the chat runs on Groq's free tier (`openai/gpt-oss-20b`), with Google Gemini as an alternate provider. The provider and model are subject to change and are named in one file.
- **Free-tier limits shape the design.** Only the last few messages are sent, replies are capped, and a rate-limited state is a real, designed experience.
- **Local history.** The conversation is stored in the browser because accounts and a database don't exist yet. The product brief says server-side per teacher, so this is a deliberate, temporary deviation.
- **Safety states are distinct from errors.** A privacy block, a declined reply and a provider failure each look and behave differently.
- **State simulator.** `/chat?demo=states` triggers each state without calling the model, so reviewers can check them without spending free-tier quota.
- **No Markdown rendering yet.** The assistant is instructed to reply in plain text; rendering formatted output can be added later.

## Known limitations

- Free-tier limits are shared by all visitors. If many people use the chat at once, some will see the rate-limited state.
- The per-visitor rate limiter is in memory, so on serverless hosting it is best-effort, not a guarantee.
- The privacy guard is heuristic. It catches email addresses and phone-like numbers, not student names.
- The "declined reply" state relies on the model following its instructions (or the provider reporting a content filter), so it can't be guaranteed. The simulator shows the state deterministically.
- History is stored per browser and is not shared between devices.

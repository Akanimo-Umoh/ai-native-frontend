# TeachKit Assistant: Accessibility Evidence

Target: WCAG 2.2 level AA for the chat interface (`/chat`). Paths are relative to the repository root.

**Status of this document:** the design and test plan are complete. The **Result** and **Notes** columns are filled in after running the tests on the deployed site. A test is only marked as passed once it has been run.

## 1. Design decisions

| Concern | Decision | Where |
|---|---|---|
| Streaming without noise | Streamed text is not announced token by token. A hidden `role="status"` region announces short state changes only: thinking, responding, complete, stopped, copied, feedback saved, cleared | `chat-status-announcer.tsx`, `lib/chat/status.ts` |
| Errors | Errors and blocked-message notices use `role="alert"`; a declined reply uses `role="status"` | `chat-error-message.tsx`, `chat-safety-notice.tsx` |
| Conversation region | `role="log"` with `aria-live="off"` and `aria-busy` while streaming, so users read it on demand; focusable (`tabIndex=0`) so keyboard users can scroll it | `chat-message-list.tsx` |
| Message identity | Each message is an `article` labelled "Your message" or "Assistant message" | `chat-message.tsx` |
| Keyboard | Enter sends, Shift+Enter adds a line, Escape stops, every control is a real button in a logical Tab order | `chat-composer.tsx`, `chat-panel.tsx` |
| Initial focus | On mouse-and-keyboard devices the message box is focused on load (without scrolling); on touch devices it isn't, so the on-screen keyboard doesn't open | `chat-panel.tsx` |
| Focus | Focus stays in the message box while sending and returns there when an action removes the focused control | `chat-panel.tsx` |
| Labels | The message box has a visible label and a description (shortcuts, privacy note, character count); feedback buttons expose `aria-pressed`; groups have names | `chat-composer.tsx`, `message-actions.tsx` |
| Form errors | Blocked messages explain the problem and offer "Edit message" | `chat-safety-notice.tsx` |
| Motion | The "thinking" pulse only runs when the user hasn't asked for reduced motion | `chat-system-message.tsx` |
| Colour | Uses the theme's design tokens; contrast is verified in testing (below) | all chat components |
| Target size | Buttons are at least 32px tall | chat components |

## 2. WCAG 2.2 mapping

| Criterion | How it is addressed | Test |
|---|---|---|
| 1.3.1 Info and Relationships | Labels tied to inputs, grouped actions, labelled message articles | A2, S1 |
| 1.4.3 Contrast (Minimum) | Theme tokens; checked with tools | A1, A2 |
| 1.4.10 Reflow | Single-column layout; wraps long text | V1 |
| 2.1.1 Keyboard | All functions are operable by keyboard | K1 |
| 2.1.2 No Keyboard Trap | No traps; Escape stops a response | K1 |
| 2.4.3 Focus Order | DOM order matches reading order; focus returns to the message box | K1, K2 |
| 2.4.7 Focus Visible | Visible focus ring on every control | K1 |
| 2.5.8 Target Size (Minimum) | Controls larger than 24px | V2 |
| 3.3.1 Error Identification | Errors named in text | S1, states |
| 3.3.3 Error Suggestion | Each error says what to do next (retry, edit, remove personal details) | S1, states |
| 4.1.2 Name, Role, Value | Native elements, `aria-pressed`, named groups | A2, S1 |
| 4.1.3 Status Messages | Live region and alerts announce status without moving focus | S1 |

## 3. Test plan and results

Fill in **Result** (Pass / Fail / Partial), the date, and notes after running each test on the live URL.

### Automated

| ID | Test | How | Result | Notes |
|---|---|---|---|---|
| A1 | Lighthouse accessibility score | Chrome DevTools → Lighthouse → Accessibility and Performance, on the live `/chat` page in Incognito (Mobile: Moto G Power emulation, and Desktop) | Accessibility 100 on both Mobile and Desktop. Performance: Desktop 100, Mobile 79. Before the fix: Accessibility 96. | Run on 2026-10-22. The first run flagged "Document doesn't have a title" (WCAG 2.4.2); fixed by adding page metadata in `teachkit-app/app/layout.tsx`. Mobile Performance varied between runs (79 to 89), which is normal for free hosting and a simulated slow phone. Lighthouse also lists manual checks it cannot judge; those are covered by tests K1, K2 and S1 to S6. Screenshots: `evidence/lighthouse-chat-mobile-before.png`, `lighthouse-chat-mobile.png`, `lighthouse-chat-desktop.png`. |
| A2 | axe DevTools scan | axe DevTools on the live `/chat` page in Incognito: empty chat, after a reply, the demo states page, and with the provider error shown | 0 issues in all four states (empty, after a reply, simulator page, provider error). | Run on 2026-10-__ with axe-core 4.13.0, ruleset WCAG 2.1 AA, Best Practices __ (on/off). Console showed __ (e.g. the expected 502 from the simulated error). Guided and manual tests were not run; those areas are covered by K1, K2 and S1 to S6. Screenshots: `evidence/axe-chat-empty.png`, `axe-chat-reply.png`, `axe-chat-simulator.png`, `axe-chat-error.png`. |

### Keyboard only (no mouse)

| ID | Test | Steps | Expected | Result | Notes |
|---|---|---|---|---|---|
| K1 | Full keyboard run | Tab through the page; send with Enter; stop with Escape; reach Copy, Regenerate, Helpful, Not helpful and Clear with Tab and activate each with Enter or Space | Every control reachable and operable; focus ring always visible; no trap | | |
| K2 | Focus after actions | Press Stop, Retry, Edit message and Clear | Focus lands in the message box each time and is never lost | | |
| K3 | Initial focus | Reload the page on desktop | The cursor blinks in the message box and the page doesn't scroll. On a phone-size device-mode view with touch: no keyboard opens | | |

Record a short screen recording of K1 and K2 as `evidence/keyboard-walkthrough.mp4` (or `.gif`).

### Screen reader

Use NVDA (free, Windows) with Firefox or Chrome. Note which browser and NVDA version you used.

| ID | Test | Steps | Expected announcement | Result | Notes |
|---|---|---|---|---|---|
| S1 | Status updates | Send a message and let it finish | "Assistant is thinking.", then "Assistant is responding.", then "Response complete." (not every word) | | |
| S2 | Stop | Send a message, press Escape while it streams | "Response stopped." | | |
| S3 | Error | Open `/chat?demo=states`, trigger Provider error | The alert is read out with its text | | |
| S4 | Privacy block | Trigger Privacy block | The notice is read out; Edit message is reachable | | |
| S5 | Reading the reply | Move to the conversation and read the assistant message | Message is identified as "Assistant message" and the text reads cleanly | | |
| S6 | Copy and feedback | Press Copy, then Helpful | "Copied to clipboard." and "Feedback saved on this device."; Helpful is announced as pressed | | |

Save your notes as `evidence/nvda-notes.md` (a few lines per test is enough).

### Visual and preference checks

| ID | Test | How | Expected | Result | Notes |
|---|---|---|---|---|---|
| V1 | Zoom and reflow | Browser zoom to 200%, and a 320px wide window | No horizontal scrolling for the chat; nothing is cut off | | |
| V2 | Touch targets | Inspect buttons on a phone-width view | All controls easy to tap | | |
| V3 | Reduced motion | Turn on "reduce motion" in the operating system, send a message | The thinking indicator does not pulse | | |

## 4. Evidence files

Save these in [`evidence/`](./evidence) using exactly these names:

| File | Shows |
|---|---|
| `streaming-recording.mp4` (or `.gif`) | A reply streaming in progressively, including Stop |
| `state-error.png` | Provider error state |
| `state-ratelimit.png` | Rate-limit state |
| `state-privacy.png` | Privacy block state |
| `state-declined.png` | Declined reply state |
| `lighthouse-chat.png` | Lighthouse accessibility result |
| `axe-chat.png` | axe scan result |
| `keyboard-walkthrough.mp4` (or `.gif`) | Keyboard-only run |
| `nvda-notes.md` | Screen reader test notes |

## 5. Known gaps

- Automated tools find only part of the accessibility issues; the keyboard and screen-reader tests matter more.
- Testing covers one screen reader and browser combination; other combinations may behave differently.
- Formatted (Markdown) output is not rendered yet, so structure in long replies is plain text.

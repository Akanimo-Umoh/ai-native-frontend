# TeachKit Assistant: Interaction Controls and States

All paths are relative to the repository root. The chat lives at `/chat`.

## 1. Controls

| Control | Where | How to use | Available when | What happens |
|---|---|---|---|---|
| **Send** | Message box | Click, or press Enter | Not busy and the box is not empty | Sends the message; the box clears; focus stays in the box |
| **New line** | Message box | Shift+Enter | Always | Adds a line without sending |
| **Stop** | Next to Send | Click, or press Escape | While the assistant is thinking or streaming | Cancels the request (also upstream, saving free-tier quota); text received so far is kept; focus returns to the message box |
| **Retry** | In the error message | Click | After a provider, network or rate-limit error | Re-requests the reply to the last message; focus returns to the message box |
| **Regenerate** | Under the last assistant message | Click | When the chat is idle or in error | Replaces the last reply with a new one |
| **Copy** | Under each assistant message | Click | After the message finishes | Copies the reply text; announces "Copied to clipboard." |
| **Helpful / Not helpful** | Under each assistant message | Click (toggle) | After the message finishes | Saves feedback on this device; announces "Feedback saved on this device." Clicking the same button again removes it |
| **Edit message** | In a privacy or validation notice | Click | After a blocked message | Puts the blocked message back in the box (and removes it from the conversation) so it can be fixed; focus moves to the box |
| **Clear conversation** | Top of the chat | Click, then confirm | When there are messages | Deletes the conversation and feedback from this device |
| **Starter prompts** | Empty chat | Click | When the chat is empty | Sends that prompt |

Every assistant message is labelled **AI draft**, as the product brief requires.

## 2. States

| State | Trigger | What the user sees | What they can do | Announced to screen readers |
|---|---|---|---|---|
| **Empty** | No messages yet | Short guidance and three starter prompts | Type or click a starter | None |
| **Thinking** (`submitted`) | Message sent, no text yet | "Assistant is thinking..." (visual only) and a Stop button | Stop | "Assistant is thinking." |
| **Streaming** | Reply arriving | Text appears progressively; Stop button | Stop | "Assistant is responding." (once, not per token) |
| **Complete** | Reply finished | Full reply with Copy, Regenerate, feedback | Any control | "Response complete." |
| **Stopped** | User pressed Stop | Partial text kept | Regenerate or send a new message | "Response stopped." |
| **Provider error** | Model unavailable or failed | Alert: "The assistant couldn't respond", Retry, and a link to the lesson form | Retry, or use the manual form | Announced by the alert |
| **Rate limited** | Per-visitor limit or free-tier limit | Alert: "Too many requests" with a wait time, Retry | Wait, then Retry | Announced by the alert |
| **Offline** | Network failure | Alert: "You're offline", Retry | Retry when back online | Announced by the alert |
| **Privacy block** | Message looks like it contains an email address or phone number | Notice: "Personal details detected", Edit message | Edit and resend | Announced by the notice (alert) |
| **Validation block** | Message too long or request invalid | Notice: "Message not sent", Edit message | Edit and resend | Announced by the notice (alert) |
| **Declined reply** | The assistant declines an off-topic or unsafe request (or the provider reports a content filter) | Notice: "The assistant couldn't help with that", with the assistant's short explanation | Ask something else | Announced by the notice (status) |
| **Cleared** | Clear conversation | Empty chat | Start again | "Conversation cleared." |

## 3. How the server reports problems

The route sends errors as JSON, `{ "error": { "code", "message", "retryAfterSeconds?" } }`, and the browser turns them into the states above (`lib/chat/errors.ts`). Codes: `VALIDATION_ERROR`, `PRIVACY_BLOCKED`, `RATE_LIMITED`, `MODEL_ERROR`, `NETWORK_ERROR`, `UNKNOWN`. The messages are generic; no stack traces, prompts or provider details are sent to the browser.

## 4. Focus rules

- Focus stays in the message box while sending.
- When an action removes the control that had focus (Stop, Retry, Edit message, Clear), focus returns to the message box, so it is never lost.
- Controls never take focus when a response arrives.
- The conversation area is focusable so keyboard users can scroll it.

## 5. Conversation history

- Saved in the browser (local storage) as compact text only, validated when read back, and capped at 40 messages.
- Saved when a turn finishes, not on every streamed token.
- Never sent to a server. **Clear conversation** removes it.

## 6. Testing each state

Use the simulator at `/chat?demo=states`. It triggers states without calling the AI model.

| Test | Steps | Expected |
|---|---|---|
| Streaming and Stop | Click a starter prompt, press Stop while text is arriving | Partial text stays, "Response stopped." is announced, focus is in the message box |
| Complete | Send a short question and wait | Reply appears with Copy, Regenerate and feedback; "Response complete." is announced |
| Copy | Click Copy, paste elsewhere | Reply text pasted; "Copied to clipboard." is announced |
| Feedback | Click Helpful, then Helpful again | Button shows pressed, then unpressed |
| Regenerate | Click Regenerate | The last reply is replaced |
| Provider error | Simulator: Provider error | Alert with Retry and the lesson-form link |
| Rate limit | Simulator: Rate limit | Alert with a wait time and Retry |
| Privacy block | Simulator: Privacy block, or type an email address | Notice with Edit message; Edit puts the text back in the box |
| Declined reply | Simulator: Declined reply | "The assistant couldn't help with that" notice |
| Persistence | Reload the page | Conversation is still there |
| Clear | Click Clear conversation and confirm | Chat is empty; reload shows it is still empty |
| Offline | Browser DevTools → Network → Offline, send a message | "You're offline" alert |

Screenshots of each state go in [`evidence/`](./evidence) (see the file list in [accessibility-evidence.md](./accessibility-evidence.md)).

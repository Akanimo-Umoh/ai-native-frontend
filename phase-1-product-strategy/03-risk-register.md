# TeachKit: Risk Register

Likelihood and impact are rated Low / Medium / High. Status: **Open** (to be mitigated in build) or **Designed** (mitigation is part of the current design).

| ID | Risk | Likelihood | Impact | Mitigation | Status |
|---|---|---|---|---|---|
| R1 | **Factual errors in lessons or quiz answer keys** (the model states something wrong with confidence) | High | High | Every output labelled "AI draft"; teacher must review and approve; answer key always visible and editable; prompts ask the model to flag uncertain facts | Designed |
| R2 | **Content not age- or curriculum-appropriate** for the stated class level | Medium | High | Class level and subject are required inputs; prompt constrains level and tone; one-click report/discard; teacher approval gate | Designed |
| R3 | **AI feedback treated as a final grade** (later module) | Medium | High | AI only suggests feedback, never writes a grade; accept/edit/reject required; UI wording says "suggestion" | Designed |
| R4 | **API key exposure** in client code or repo | Low | High | Keys only in server-side environment variables on Vercel; never in `NEXT_PUBLIC_*`; `.env` git-ignored; all model calls via server routes | Designed |
| R5 | **Student data leaked to the model or logs** (later module) | Medium | High | Anonymised IDs in prompts; no names or scores sent to the model; logs exclude prompt bodies containing student data; data scoped per school | Open |
| R6 | **Cross-account data access** (one teacher sees another's lessons) | Low | High | Auth check and teacher/school scoping on every query; no client-supplied IDs trusted without server verification | Open |
| R7 | **Prompt injection** (pasted text or student answers contain instructions that hijack the model) | Medium | Medium | Treat user text as data, delimit it in prompts; validate output against a schema; the model has no tools that can write data directly | Open |
| R8 | **Malformed or incomplete model output** breaks the UI | High | Medium | Schema validation on the server; render only what parsed; show a recoverable error with retry or manual edit | Designed |
| R9 | **Provider outage, timeout or rate limit** | Medium | Medium | Timeouts and retries; clear error state; **manual fallback** (write without AI); partial drafts preserved; provider swappable through the AI SDK | Designed |
| R10 | **Lost work** on failure or refresh | Medium | High | Autosave drafts to the server; preserve partial streams; never clear the editor on error | Designed |
| R11 | **Runaway cost or abuse** (spam generations, very long prompts) | Medium | Medium | Per-user rate limits; input length caps; free-tier generation quota; usage monitoring | Open |
| R12 | **Over-reliance on AI** (teachers stop reviewing) | Medium | Medium | Approval is explicit, not a default; edit prompts shown; review-before-approve friction on quizzes (per-question review) | Designed |
| R13 | **Accessibility gaps in streaming UI** (screen reader noise, lost focus) | Medium | Medium | Polite live regions for status only; focus stays on controls; keyboard-tested approve/reject flow | Open |
| R14 | **Unreliable output quality across subjects** (strong in some, weak in others) | Medium | Medium | Test across core subjects early; collect keep/edit/reject signals to track quality; evals in a later module | Open |

## Data that must not be exposed to the browser

- API keys and provider credentials
- System prompts and prompt templates
- Raw, unvalidated model responses
- Other teachers' or schools' data
- Student identifiers and scores (later modules)

## Review cadence

Revisit this register at the end of each module; add new risks as features (tool use, retrieval, student data) are introduced.
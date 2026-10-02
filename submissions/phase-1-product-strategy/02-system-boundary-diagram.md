# TeachKit: System Boundary Diagram

This diagram shows what runs in the **browser**, the **server**, the **model** and **external services**, and what crosses each boundary. GitHub renders the Mermaid blocks below automatically.

## 1. System boundaries

```mermaid
flowchart LR
  subgraph B["BROWSER (untrusted)"]
    direction TB
    B1["Request form (class, subject, topic)"]
    B2["Streaming draft renderer"]
    B3["Inline editor + per-section regenerate"]
    B4["Approve / Reject / Write manually"]
    B5["Loading, error, offline, fallback UI"]
    B6["Unsaved draft state (React)"]
  end

  subgraph S["NEXT.JS SERVER (trusted, on Vercel)"]
    direction TB
    S1["Auth + session check"]
    S2["Input validation + rate limiting"]
    S3["Prompt builder (system prompt + preferences)"]
    S4["AI SDK call (provider-agnostic)"]
    S5["Output schema validation"]
    S6["Persistence layer"]
  end

  subgraph M["MODEL LAYER"]
    M1["LLM (Anthropic by default, swappable)"]
  end

  subgraph D["DATA + EXTERNAL"]
    D1[("Database: teachers, classes, lessons, quizzes, preferences")]
    D2["AI provider API"]
  end

  B1 -->|"HTTPS request, no secrets"| S1
  S1 --> S2 --> S3 --> S4
  S4 -->|"prompt"| D2
  D2 --- M1
  M1 -->|"streamed tokens / structured output"| S4
  S4 --> S5
  S5 -->|"validated stream"| B2
  B2 --> B3 --> B4
  B4 -->|"approved content"| S6
  S6 <--> D1
  B5 -.->|"on failure"| B3
```

### What crosses each boundary

| Boundary | Allowed to cross | Never crosses |
|---|---|---|
| Browser → Server | Teacher's request, edits, approve/reject actions | Nothing secret originates in the browser |
| Server → Browser | Validated, structured, teacher-scoped output; session cookie (HttpOnly) | API keys, system prompts, raw model responses, other teachers' data |
| Server → Model | Constructed prompt, teacher preferences, class level and topic | Student names or identifiers, credentials of the user |
| Model → Server | Streamed text / structured JSON | Nothing is trusted until validated |

## 2. Lesson generation sequence (happy path and fallbacks)

```mermaid
sequenceDiagram
  actor T as Teacher
  participant B as Browser
  participant S as Next.js Server
  participant M as Model

  T->>B: Enter class, subject, topic
  B->>S: POST /api/lessons/generate
  S->>S: Verify session, validate input, rate limit
  S->>M: Prompt (system rules + preferences + request)
  M-->>S: Streamed draft
  S->>S: Validate against lesson schema
  S-->>B: Stream validated sections
  B-->>T: Show "AI draft" for review
  T->>B: Edit sections / regenerate a section
  T->>B: Approve
  B->>S: POST /api/lessons (approved content)
  S->>S: Save to database
  S-->>B: Saved confirmation

  alt Model error or timeout
    S-->>B: Recoverable error + partial draft
    B-->>T: Retry / Write manually / Save partial
  else Output fails schema validation
    S-->>B: Parsed parts + validation error
    B-->>T: Fix manually or retry
  end
```

## 3. Approval loop (applies to lessons, quizzes and feedback)

```mermaid
stateDiagram-v2
  [*] --> Requested
  Requested --> Generating
  Generating --> Draft: valid output
  Generating --> Failed: error / invalid output
  Failed --> Generating: retry
  Failed --> ManualEdit: write manually
  Draft --> ManualEdit: edit
  ManualEdit --> Draft: continue editing
  Draft --> Generating: regenerate
  Draft --> Approved: teacher approves
  Draft --> Discarded: teacher rejects
  Approved --> [*]
  Discarded --> [*]
```

Only the **Approved** state is written to the lesson/quiz library. Nothing moves from AI output to saved or shared content without the teacher's explicit action.
# TeachKit: Security Checklist (Phase 1, Next.js Foundation)

Scope: secret handling and input boundaries, as required for this phase. Tick an item only after you have verified it. All commands run from the repository root unless noted.

## 1. Secret handling

- [ ] The API key exists only in `teachkit-app/.env.local` (local) and Vercel Environment Variables (production).
  *Verify:* `git grep -n "sk-ant"` returns nothing.
- [ ] `.env.local` is git-ignored.
  *Verify:* `git check-ignore -v teachkit-app/.env.local` prints the matching rule.
- [ ] `.env.example` is tracked and contains no values.
  *Verify:* `git ls-files teachkit-app/.env.example` lists it, and the key line is empty.
- [ ] No secret uses the `NEXT_PUBLIC_` prefix.
  *Verify:* `git grep -n "NEXT_PUBLIC"` returns nothing.
- [ ] No key was ever committed.
  *Verify:* `git log -S "sk-ant" --oneline` returns nothing. If it returns a commit, revoke and regenerate the key.
- [ ] The key is absent from the production client bundle.
  *Verify (PowerShell, with the key set in `.env.local`):* run `pnpm build` in `teachkit-app`, then `Get-ChildItem .next\static -Recurse -File | Select-String -Pattern "sk-ant" -List` returns nothing.
- [ ] Secrets are read in one module, `teachkit-app/lib/env.ts`, which imports `server-only`.
  *Verify:* `git grep -n "process.env" teachkit-app` shows only `lib/env.ts` (plus framework config, if any).
- [ ] The production key is set in Vercel (Project Settings → Environment Variables), scoped to Production.
- [ ] Error messages name a missing variable but never print a secret value.
  *Verify:* read `lib/env.ts`.

## 2. Server/client boundary

- [ ] `lib/env.ts` and `lib/ai/provider.ts` import `server-only`.
- [ ] A Client Component importing a server module fails the build.
  *Verify:* temporarily add a `"use client"` page that imports `@/lib/env`, run `pnpm build`, capture the error, then delete the page. Save the screenshot as `evidence/boundary-build-error.png`.
- [ ] No Client Component imports server modules.
  *Verify:* `git grep -n "lib/env\|lib/ai" teachkit-app/components/client` returns nothing.
- [ ] Shared types contain only shapes and constant lookup tables, no secrets or prompts.
  *Verify:* read `types/index.ts`.
- [ ] The live page source contains no key, no prompt text and no server-only module names.
  *Verify:* open the live URL, View Page Source, search for `sk-ant` and `ANTHROPIC`. Save the screenshot as `evidence/page-source-no-key.png`.

## 3. Input boundaries

- [ ] The Server Action validates every field with a zod schema; client-side checks are not relied on.
  *Verify:* submit the live form empty and see the server's messages (the form uses `noValidate`). Save the screenshot as `evidence/server-validation.png`.
- [ ] Only whitelisted fields are read from the submitted form.
  *Verify:* read `FIELDS` in `app/actions/lessons.ts`.
- [ ] Length caps and numeric ranges are enforced (subject, topic, notes, duration).
  *Verify:* submit a 1-character subject, a 500+ character note and a duration of 5.
- [ ] Class level is restricted to a fixed list, not free text.
  *Verify:* `CLASS_LEVELS` in `types/index.ts`.
- [ ] Errors returned to the browser are safe: field messages and a generic summary, with no stack traces or internals.
- [ ] No `dangerouslySetInnerHTML` is used.
  *Verify:* `git grep -n "dangerouslySetInnerHTML" teachkit-app` returns nothing.
- [ ] *Later:* model output is validated against a schema before display or saving.

## 4. Server Actions and endpoints

- [ ] Server Actions are treated as public endpoints; the action carries a marked TODO to verify the session once auth exists.
- [ ] `/api/health` returns no secrets or configuration.
  *Verify:* open `/api/health` on the live URL; it returns only `{"ok":true}`.
- [ ] No endpoint calls the model yet, so the public URL cannot spend the API key.
  *Verify:* `git grep -n "getModel\|generateText\|streamText" teachkit-app` shows only the definition in `lib/ai/provider.ts`.

## 5. Headers and transport

- [ ] Security headers are set in `teachkit-app/next.config.ts` and present on the live site.
  *Verify (PowerShell):* `curl.exe -I https://ai-native-frontend-teachkit-app.vercel.app/` shows `x-content-type-options`, `x-frame-options`, `referrer-policy` and `permissions-policy`.
- [ ] The site is served over HTTPS only (Vercel default).

## 6. Dependencies and repository hygiene

- [ ] `pnpm audit` has been run and the results reviewed.
- [ ] The lockfile `teachkit-app/pnpm-lock.yaml` is committed.
- [ ] `.gitignore` covers `.env*` (with `.env.example` allowed), `node_modules` and `.next`.
- [ ] The public repository contains no personal data or credentials.

## 7. Deferred to later modules

These are known gaps, tracked in the [risk register](../phase-1-product-strategy/03-risk-register.md):

- Authentication and per-teacher data scoping
- Rate limiting and usage monitoring
- Prompt-injection handling and model output validation
- Content-Security-Policy header
- Logging policy that excludes prompts containing personal data

## Evidence

Screenshots referenced above are stored in [`evidence/`](./evidence):

| File | Shows |
|---|---|
| `boundary-build-error.png` | `pnpm build` failing when a Client Component imports a server-only module |
| `page-source-no-key.png` | Live page source with no key or prompt text |
| `server-validation.png` | Server-side validation messages on the live form |

# Why the AI SDK sits at the boundary

TeachKit depends on two decisions that change at very different speeds. The first is which AI platform and model I use, such as Anthropic or OpenAI. That can change quickly with cost, quality, availability or a better model being released. The second is how my React and Next.js interface is built: components, forms, streaming, and loading and error states. That should stay stable, because the users and the rest of the app depend on it.

The Vercel AI SDK sits exactly between the two. Without it, each provider's own request and response format would leak into my code, so switching provider would mean rewriting server logic and possibly the UI code that handles responses. With it, my code talks to one consistent interface, and the provider is just an adapter plugged in underneath.

In TeachKit the SDK runs only on the server. That protects the API key and the prompts, because the browser never sees them and only receives validated results.

If I swap provider or model tomorrow, one thing changes: `lib/ai/provider.ts`, where the adapter and model ID are set (plus the key in the environment). Everything else stays the same: the components, the Server Actions, the types and the approval flow. That is why the product brief says the provider and model are subject to change.

## Where this shows up in the repo

- The provider and model are named in one file: `teachkit-app/lib/ai/provider.ts`
- It imports `server-only`, so it cannot be pulled into browser code.
- The key is read through `teachkit-app/lib/env.ts`, on the server only.
- The `ai` package and the `@ai-sdk/groq` adapter are installed in `teachkit-app/package.json`.

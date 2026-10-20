# S. Geetha Memorial AI assistant — setup

This adds a genuine model-powered English/Telugu chat API using Cloudflare Workers AI. The existing GitHub Pages site and all 24 image references remain in `index.html`; the old confirmed-facts FAQ remains as a fallback until the endpoint is configured.

## Deploy the backend (Cloudflare Workers Free + Workers AI)

1. Sign in to [Cloudflare Dashboard](https://dash.cloudflare.com/) and open **Workers & Pages**. Make sure Workers AI is available on your account.
2. Create a Worker named `geetha-memorial-ai`, or deploy these two files from a local clone using Wrangler:
   - `npm install -g wrangler`
   - `wrangler login`
   - `wrangler deploy`
3. `wrangler.toml` binds Workers AI as `env.AI`; no model-provider API key is needed in the website. The selected Qwen model is called server-side. If Cloudflare reports the model is unavailable on your account, select an available multilingual instruct model from the Workers AI catalog and update `MODEL` in `worker.js`.
4. Copy the Worker URL, normally `https://geetha-memorial-ai.<your-subdomain>.workers.dev`.
5. In `index.html`, replace the empty `AI_API_URL` value with `https://geetha-memorial-ai.<your-subdomain>.workers.dev/chat`, commit, and push. The site will then call the genuine AI API; if it is down, the chatbot falls back to the confirmed event answers.
6. Test both English and Telugu. Confirm the Worker rejects requests from unapproved origins and that the event date, pooja, lunch, venue and photo count are accurate.

## Cost and security

Cloudflare Workers AI currently includes 10,000 Neurons/day on the Free plan; heavier usage may require a paid plan. See [official pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/). Worker requests are rate-limited in-memory to 12/minute/IP per isolate; this is a basic abuse guard, not a guaranteed global quota. Monitor usage in Cloudflare and enable any account-level usage limits available. The model runs server-side; never place API keys in `index.html`. This implementation does not store chat transcripts, but Cloudflare processes the request to generate an answer. Do not enter private family or personal information.

## Current status

Code is prepared in the repository, but the AI will not answer model-generated questions until the Worker is deployed and `AI_API_URL` is set to its live URL. GitHub Pages itself cannot run this backend.

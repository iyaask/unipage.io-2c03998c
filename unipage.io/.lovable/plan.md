## Browserbase + Stagehand integration

Adds a backend automation that uses Browserbase (cloud browsers) + Stagehand (AI-driven browser SDK) inside a Supabase edge function. Given a bursary page URL, it extracts structured data (title, provider, eligibility, deadline, amount, apply link) and saves the result.

Defaults chosen for you:
- **Use case**: scrape a bursary listing URL into structured JSON
- **Trigger**: manual button on the dashboard ("Scrape bursary URL"), plus the function is callable directly for testing

### What gets built

**1. Secrets**
Request these as Lovable runtime secrets (used by the edge function only):
- `BROWSERBASE_API_KEY`
- `BROWSERBASE_PROJECT_ID`
- `OPENAI_API_KEY` (Stagehand's default LLM for `extract`/`act`)

**2. Database migration**
New table `scraped_bursaries`:

```text
id uuid pk
user_id uuid (auth.uid())
source_url text
title text
provider text
eligibility text
deadline text
amount text
apply_url text
raw jsonb
created_at timestamptz default now()
```

RLS: owner-only (`auth.uid() = user_id`) for select/insert/delete, mirroring `bursary_results`.

**3. Edge function** `supabase/functions/scrape-bursary/index.ts`
- CORS preflight + permissive headers (matches existing `contact-webhook` pattern)
- Validates JWT via `supabase.auth.getClaims()` to get `user_id`
- Zod-validates body `{ url: string().url() }`
- Initializes Stagehand with `env: "BROWSERBASE"`, `apiKey`, `projectId`, `modelName: "openai/gpt-4o-mini"`
- `page.goto(url)` then `page.extract({ instruction, schema })` with a Zod schema for the bursary fields
- Inserts result into `scraped_bursaries` using service-role client
- Returns `{ data, sessionId }` so the user can replay the session in Browserbase
- `await stagehand.close()` in a `finally` block

Imports use `npm:` specifiers (`npm:@browserbasehq/stagehand`, `npm:zod`) per edge-runtime guidance.

**4. Frontend hook-up**
On `/dashboard/bursary-matches`, add a small "Scrape a bursary URL" card:
- Input field + "Scrape" button
- Calls `supabase.functions.invoke('scrape-bursary', { body: { url } })`
- Shows toast on success/error and appends the new row to a list below
- Reads from `scraped_bursaries` filtered by current user

No changes to Papa AI, the bursary quiz, or existing webhooks.

### Verification

- Deploy the function (automatic on save)
- Call it via the dashboard button with a real bursary URL (e.g., a NSFAS listing)
- Check edge function logs for the Browserbase session URL
- Confirm a new row in `scraped_bursaries`
- Open the session in browserbase.com to replay what the browser did

### Out of scope (not doing now)

- Scheduled cron scraping
- Auto-submitting application forms
- A separate Node CLI / `bb templates clone` (Lovable doesn't host a Node project; the Browserbase CLI workflow doesn't apply here — the edge function is the equivalent)

### After approval

I will request the three secrets above before writing any code, then run the migration, then deploy the edge function and wire the UI button.
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (Vite)
npm run build      # Production build
npm run build:dev  # Dev-mode build
npm run lint       # ESLint
npm run preview    # Preview production build
```

No test suite is configured. There is no test runner.

## Architecture

**Stack:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui (Radix primitives), TanStack Query, React Router v6, Supabase (auth + database), Framer Motion (`motion`), Zod + React Hook Form.

**Backend:** There is no custom backend in this repo. All server-side logic runs via two external webhooks on Railway:
- `https://primary-production-4a757.up.railway.app/webhook-test/bursary-search` — bursary matching
- `https://primary-production-4a757.up.railway.app/webhook/papa` — Papa AI chat

Supabase is used for auth and persisting data (profiles, bursary results, chat messages). The client and auto-generated types live in [src/integrations/supabase/](src/integrations/supabase/).

**Routing:** Two top-level areas:
- Public (`/`, `/auth`, `/about`, `/privacy`, `/terms`) — rendered directly in [src/App.tsx](src/App.tsx)
- Protected (`/dashboard/*`) — all sub-routes rendered inside [src/pages/Dashboard.tsx](src/pages/Dashboard.tsx), which gate-keeps on `useAuth()` and redirects unauthenticated users to `/auth`

**Auth:** `AuthProvider` ([src/components/auth/AuthProvider.tsx](src/components/auth/AuthProvider.tsx)) wraps the whole app. Exposes `useAuth()` returning `{ user, session, isLoading }`. Auth state is kept in sync via `supabase.auth.onAuthStateChange`.

**Dashboard sub-pages** (all under `/dashboard/`):
| Route | Page |
|---|---|
| `profile` (default) | Profile / onboarding form |
| `bursaries` | Chat-style bursary questionnaire |
| `bursary-matches` | Saved bursary results |
| `papa-ai` | General AI assistant chat |
| `whatsapp` | WhatsApp connection |
| `settings` | User settings |

**Bursary flow:** [src/pages/Bursaries.tsx](src/pages/Bursaries.tsx) drives a step-by-step conversational UI. Questions are defined in [src/components/bursaries/bursaryQuestions.ts](src/components/bursaries/bursaryQuestions.ts). On completion, answers are POSTed to the Railway webhook; results are upserted into `bursary_results` (keyed by `user_id`) and also cached in `localStorage` under `"bursaryMatches"`.

**Papa AI chat:** [src/components/chat/PapaAIChat.tsx](src/components/chat/PapaAIChat.tsx) — stateless chat that POSTs each message to the Railway webhook and renders the reply. Input is sanitised and length-limited client-side before sending.

**UI components:** shadcn/ui components live in [src/components/ui/](src/components/ui/) and should not be edited directly — regenerate via the shadcn CLI if updates are needed. Custom feature components are colocated by domain (`grades/`, `bursaries/`, `profile/`, etc.).

**Styling:** Tailwind with a custom config at [tailwind.config.ts](tailwind.config.ts). CSS variables for theming in [src/index.css](src/index.css). Theme toggling via `next-themes` (`ThemeProvider` defaults to `"light"`).

**Path alias:** `@/` maps to `src/` (configured in [tsconfig.app.json](tsconfig.app.json) and [vite.config.ts](vite.config.ts)).

**Supabase tables:** `profiles`, `bursary_results`, `chat_messages`, `marks`, `nods_page`, `nods_page_section`. Types are auto-generated in [src/integrations/supabase/types.ts](src/integrations/supabase/types.ts) — do not edit manually.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server at http://localhost:5173
npm run build      # Production build
npm run lint       # ESLint
npm run test       # Run tests once (vitest)
npm run test:watch # Run tests in watch mode
npx tsc --noEmit   # Type-check without building
```

Deploy is automatic: push to `main` → Vercel picks it up via GitHub integration.

## Architecture

**Stack:** React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui (Radix UI) + Supabase

### Supabase

The only backend. All data access goes through `src/integrations/supabase/client.ts`:

```ts
import { supabase } from "@/integrations/supabase/client";
```

Credentials come from `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (env vars). The generated types live in `src/integrations/supabase/types.ts`.

**Key tables:**
- `empresas` — energy companies listed in the ranking (fields: `nome`, `tipo_fornecedor`, `ativa`, `parceira`, `atende_residencial`, `atende_empresarial`, `nivelRisco`, `logoUrl`, `site_url`, etc.)
- `notas` — scores per company per distribuidora (used to build the ranking)
- `distribuidoras` — electricity distributors, linked to states
- `leads` — click/intent tracking (eventos: `clique_aderir`, `clique_saiba_mais`)
- `cashback_cadastros` — adhesion form submissions with document uploads
- `parceiros_config` — affiliate link configuration per company
- `user_roles` — admin access control (`role = 'admin'` grants access)

**Storage bucket:** `documentos-adesao` (private) — stores RG/CNH frente, verso, and fatura uploads from the adhesion form.

Large Supabase queries (>1000 rows) must use `src/lib/fetchAll.ts` which paginates automatically.

### Routing

All routes are in `src/App.tsx`. Two route trees:

1. **Public** — `/`, `/ranking`, `/ranking-nacional`, `/empresa/:slug`, `/ativar-cashback`, product pages, legal pages
2. **Admin** — `/admin/*` nested under `AdminLayout`, protected by `useAdminAuth` hook

The `AdminLayout` (`src/pages/admin/AdminLayout.tsx`) checks `user_roles` table on every load. Non-admins are redirected to `/admin/auth`.

To add a new admin user: go to `/admin/usuarios` → copy the invite link → the new user signs up → promote them via the UI (calls the `admin-users` Edge Function).

### Ranking logic

The ranking is built server-side by the `recalc-ranking` Supabase Edge Function (not in this repo). It reads `notas` + `empresas`, applies weights, and writes ranked results. The frontend calls this function via the ranking pages.

Filtering by profile works via `atende_residencial` / `atende_empresarial` booleans on `empresas`. Companies with `tipo_fornecedor = 'intermediador'` are "bronze" tier — they are filtered out of the main ranking list on the public pages.

The `slugify` function in `src/lib/slug.ts` generates URL-safe slugs from company names (used for `/empresa/:slug`).

### Design system

Brand tokens (defined in `src/index.css` as CSS variables, exposed via Tailwind):
- `brand-blue` — `hsl(214, 51%, 24%)` — dark navy, primary text/buttons
- `brand-yellow` — `hsl(38, 92%, 50%)` — amber, accent/CTA
- `brand-success` — `hsl(122, 39%, 49%)` — green, economy/savings
- `background` — `hsl(0, 0%, 94%)` — `#F0F0F0` — site-wide page background

All UI primitives come from `src/components/ui/` (shadcn/ui). Do not create custom modal/dialog/button primitives; extend or compose from those.

### Adhesion flow

1. User clicks "Ver plano e Aderir" on a `CompanyCard` → opens `AdesaoModal` (Dialog)
2. Or via `EconomySimulator` → "Ver plano e Aderir" → also opens `AdesaoModal`
3. Or via `/empresa/:slug` page → same button → `AdesaoModal`
4. Standalone page: `/ativar-cashback` → `AtivarCashback.tsx` (same form, full page)

`AdesaoModal` handles file uploads to the `documentos-adesao` storage bucket and inserts into `cashback_cadastros`. The `LeadCaptureDialog` component is legacy and no longer wired to any button.

### Lead tracking

`src/lib/leadTracking.ts` exports `registerLead()` — fire-and-forget insert into the `leads` table. Called on "Saiba Mais" clicks and adhesion intent. The `EmbCapture` component reads `?emb=CODE` from the URL and stores it in `sessionStorage` for attribution.

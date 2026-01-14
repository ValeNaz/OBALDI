# Obaldi execution plan

## Project baseline (current)
- Stack: Next.js 14 App Router + React + Tailwind + DaisyUI + shadcn/ui scaffold, no backend.
- UI shell present (Home, Membership, About, Marketplace, Admin, Seller, Login pages).
- Prisma schema + seed present, no DB integration or migrations yet.

## Tracking method
- Use this file as the single plan and progress tracker.
- Update the checklist status and add a dated entry in **Progress log** for every completed step.

## Plan (derived from piano.md)

### Step 0 — Repository baseline and scaffolding
- [x] Align stack to required Next.js 14 App Router + TypeScript + Tailwind + DaisyUI + shadcn/ui.
- [x] Add Prisma + PostgreSQL setup (schema, migrations, seed).
- [x] Add lint/test/build scripts and CI readiness.

### Step 1 — Data model and seed (MVP Gate 1)
- [x] Implement Prisma schema for required models.
- [x] Seed membership plans, admin, seller, demo products, and news posts.

### Step 2 — Auth sessions + RBAC (MVP Gate 2)
- [x] Implement DB-backed sessions and HTTP-only cookies.
- [x] Add RBAC middleware for guest/member/seller/admin.

### Step 3 — Membership checkout (MVP Gate 3)
- [x] Implement Stripe/PayPal membership checkout start.
- [x] Implement success verification that creates user+membership+session.
- [x] Add webhook idempotency handling.

### Step 4 — Points ledger + renewals (MVP Gate 4)
- [x] Implement points ledger and balance calculation.
- [x] Award points on membership renewal webhooks (Tutela).

### Step 5 — Marketplace checkout (MVP Gate 5)
- [x] Members-only purchase flow.
- [x] Shipping included always; no shipping cost computation.

### Step 6 — Seller submit + Admin approval (MVP Gate 6)
- [x] Seller can submit products for approval.
- [x] Admin approval workflow and public listing filters.

### Step 7 — News/Scams content (MVP Gate 7)
- [x] Public /news listing and detail pages with SEO.

## Progress log
- 2025-02-14: Created plan.md and baseline analysis.
- 2025-02-14: Migrated UI scaffold to Next.js 14 App Router with Tailwind/DaisyUI and Next scripts; shadcn/ui pending.
- 2026-01-14: Added shadcn/ui scaffold and Prisma setup stubs (schema/seed) with scripts.
- 2026-01-14: Implemented Prisma schema and seed data for MVP Gate 1.
- 2026-01-14: Added session + RBAC helper utilities and `/api/me` + logout route.
- 2026-01-14: Added membership checkout routes, success handlers, and webhook event storage.
- 2026-01-14: Started local Postgres, ran Prisma migration + seed.
- 2026-01-14: Webhooks now update membership periods and award points on renewals.
- 2026-01-14: Added points balance helper.
- 2026-01-14: Added server-side RBAC guards for admin/seller pages.
- 2026-01-14: Added members-only checkout + points spend endpoints with shipping included.
- 2026-01-14: Added seller/admin workflows, public product APIs, and news pages.

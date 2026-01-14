# Obaldi execution plan

## Project baseline (current)
- Stack: Next.js 14 App Router + React + Tailwind + DaisyUI, no backend, no database.
- UI shell present (Home, Membership, About, Marketplace, Admin, Seller, Login pages).
- No Prisma schema, PostgreSQL integration, or shadcn/ui components.

## Tracking method
- Use this file as the single plan and progress tracker.
- Update the checklist status and add a dated entry in **Progress log** for every completed step.

## Plan (derived from piano.md)

### Step 0 — Repository baseline and scaffolding
- [ ] Align stack to required Next.js 14 App Router + TypeScript + Tailwind + DaisyUI + shadcn/ui.
- [ ] Add Prisma + PostgreSQL setup (schema, migrations, seed).
- [x] Add lint/test/build scripts and CI readiness.

### Step 1 — Data model and seed (MVP Gate 1)
- [ ] Implement Prisma schema for required models.
- [ ] Seed membership plans, admin, seller, demo products, and news posts.

### Step 2 — Auth sessions + RBAC (MVP Gate 2)
- [ ] Implement DB-backed sessions and HTTP-only cookies.
- [ ] Add RBAC middleware for guest/member/seller/admin.

### Step 3 — Membership checkout (MVP Gate 3)
- [ ] Implement Stripe/PayPal membership checkout start.
- [ ] Implement success verification that creates user+membership+session.
- [ ] Add webhook idempotency handling.

### Step 4 — Points ledger + renewals (MVP Gate 4)
- [ ] Implement points ledger and balance calculation.
- [ ] Award points on membership renewal webhooks (Tutela).

### Step 5 — Marketplace checkout (MVP Gate 5)
- [ ] Members-only purchase flow.
- [ ] Shipping included always; no shipping cost computation.

### Step 6 — Seller submit + Admin approval (MVP Gate 6)
- [ ] Seller can submit products for approval.
- [ ] Admin approval workflow and public listing filters.

### Step 7 — News/Scams content (MVP Gate 7)
- [ ] Public /news listing and detail pages with SEO.

## Progress log
- 2025-02-14: Created plan.md and baseline analysis.
- 2025-02-14: Migrated UI scaffold to Next.js 14 App Router with Tailwind/DaisyUI and Next scripts; shadcn/ui pending.

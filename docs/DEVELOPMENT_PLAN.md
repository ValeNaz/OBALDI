# Obaldi full release plan

## Scope (final version)
This plan covers the complete production-ready version of the site: core product features, payments, content, seller/admin workflows, operations, compliance, security, performance, QA, and go-live.

## Non-negotiable invariants
- Menu has exactly 4 items (order fixed): Obaldi, Entra in Obaldi, Chi siamo, Marketplace.
- Marketplace is public; purchasing requires active membership.
- User creation happens only after successful membership payment.
- Membership auto-renews every 28 days.
- Points are configurable per plan; ledger is append-only.
- No coupons, bundles, or limited-time offers; same price for all members.
- No reviews, no comparisons, no urgency/scarcity UI.
- News/Articles about online scams must be public and SEO-friendly.
- Products become public only after admin approval.
- Sellers never edit existing products directly; all changes require admin approval.
- Shipping is always included and never priced separately.

## Project baseline (current)
- Next.js 14 App Router + TypeScript + Tailwind + DaisyUI + shadcn/ui scaffold.
- Prisma + PostgreSQL schema, migrations, and seed in place.
- Core MVP features implemented (auth sessions, RBAC, membership checkout, points, marketplace, seller/admin flows, news pages).
- Local Postgres running; migrations and seed executed.

## Tracking method
- Use this file as the single plan and progress tracker.
- Update the checklist status and add a dated entry in Progress log for every completed step.

## Phased delivery (MVP -> Final)
- Phase A (MVP): Steps 0-7.
- Phase B (v1): Steps 8-14.
- Phase C (Final): Steps 15-21.

## MVP activation plan (make existing features production-ready)
This section focuses on hardening and actually putting into production the features already implemented in the MVP.

### Activation A - Environments and secrets
- [ ] Provision staging + production Postgres.
- [ ] Set all required env vars for staging/prod (real secrets, APP_BASE_URL, SESSION_SECRET).
- [ ] Run migrations and seed admin/seller in staging.
- Acceptance: staging environment boots and `/api/me` works with session cookie.

### Activation B - Payments and webhooks
- [ ] Configure Stripe products/prices to match plans; update price IDs.
- [ ] Configure PayPal plans; update plan IDs.
- [ ] Create and verify Stripe/PayPal webhooks for staging and production.
- [ ] Run end-to-end membership flow with real provider test modes.
- Acceptance: membership purchase creates user + membership and webhook renewals extend periods.

### Activation C - Content and catalog readiness
- [ ] Replace demo products with real listings and media.
- [ ] Publish real news/articles on scams with SEO metadata.
- [ ] Fill legal pages (/privacy, /termini, /contatti) with final copy.
- Acceptance: public pages render with production content and approved products only.

### Activation D - Admin/Seller ops
- [ ] Create admin and seller access procedure.
- [ ] Verify admin approval workflow on real products.
- [ ] Document seller submission guidelines (media specs, allowed claims).
- Acceptance: seller submits; admin approves; product appears in marketplace.

### Activation E - Email and support
- [ ] Configure SMTP in production.
- [ ] Verify password reset and membership confirmation emails.
- [ ] Define support inbox/workflow for buyer inquiries.
- Acceptance: emails deliver and are branded correctly.

### Activation F - Stability, security, and monitoring
- [ ] Enable rate limiting on sensitive endpoints.
- [ ] Enable error tracking and basic uptime monitoring.
- [ ] Verify logs do not contain secrets/PII.
- Acceptance: monitoring active; no sensitive data logged.

### Activation G - QA and launch checklist
- [ ] Run smoke tests on membership, login, and marketplace browsing.
- [ ] Validate invariants (menu items, no reviews/urgency, shipping included).
- [ ] Final go-live review and rollback plan.
- Acceptance: green checklist for production launch.

## Full plan (final version, phased)

### Step 0 - Baseline and CI readiness
- [x] Stack alignment and repository structure.
- [x] Prisma schema, migrations, and seed scripts.
- [x] Lint/build/test scripts.

### Step 1 - Data model and seed
- [x] Implement Prisma schema per spec.
- [x] Seed plans, users, products, and news.

### Step 2 - Auth sessions + RBAC
- [x] DB-backed sessions with HTTP-only cookie.
- [x] Server-side RBAC guards.
- [ ] Add fast login options: email and phone (OTP or magic link).
- [ ] Store phone number on user and support login via phone.
- Acceptance: login supports email or phone; no user is created before payment success.

### Step 3 - Membership checkout
- [x] Stripe/PayPal membership checkout start.
- [x] Success verification and user creation.
- [x] Webhook idempotency.

### Step 4 - Points ledger + renewals
- [x] Points ledger and balance calculation.
- [x] Award points on renewal webhooks (Tutela).

### Step 5 - Marketplace checkout
- [x] Members-only checkout flows.
- [x] Shipping always included.
- [x] Prefix search/autocomplete by product title in Marketplace.
- [x] Premium-only visibility flag and points usage (points + remaining cash).
- Acceptance: non-members can browse; members see same prices; premium can use points and see exclusive items.

### Step 6 - Seller submit + Admin approval
- [x] Seller submission and admin approval workflow.
- [x] Public listing filters for APPROVED only.
- [x] Seller cannot edit existing products; changes create a change request for admin approval.
- [x] Admin can edit, delete, and mark out-of-stock on any product.
- Acceptance: any seller change is reviewed by admin before becoming public.

### Step 7 - News/Scams content
- [x] /news listing + detail pages with SEO metadata.

### Step 8 - Media storage and uploads
- [x] Choose storage (Supabase Storage or S3-compatible) and configure.
- [x] Secure upload flow with presigned URLs and MIME/size validation.
- [x] Product media ordering and deletion with admin audit log.
- [x] Product gallery layout with main image + thumbnails (Amazon-style).
- Acceptance: seller uploads media; admin can remove; public sees correct order.

### Step 9 - Purchase assist (Tutela)
- [x] Member request submission and admin triage workflow.
- [x] Admin UI for status updates and outcomes.
- [x] Email notification on status change.
- Acceptance: Tutela-only access enforced; status lifecycle logged.

### Step 10 - Payment methods expansion
- [ ] Membership: card + PayPal only (no Klarna/bonifico).
- [ ] Products: card + PayPal + bank transfer; add Klarna if required.
- [ ] Manual bank transfer flow with pending order status and admin confirmation.
- [ ] Unified order reconciliation across providers.
- Acceptance: order status updates for each provider; bank transfer produces a pending state.

### Step 11 - Orders and fulfillment ops
- [x] Admin order list with filters and detail view.
- [x] Status transitions (paid, canceled, refunded) with audit logs.
- [x] Export orders (CSV) for operations.
- Acceptance: admin can manage orders without DB access.

### Step 12 - Refunds and returns
- [x] Define refund policy and supported flows.
- [x] Implement Stripe refund workflow (and PayPal if enabled).
- [x] Update points ledger on refunds if points were used.
- [x] Add /resi-rimborsi content page aligned to policy.
- Acceptance: refund produces audit log and consistent order totals.

### Step 13 - Email and notifications
- [ ] Verify SMTP in production.
- [x] Templates: purchase confirmation, membership renewal, password reset.
- [x] Admin notifications for seller submissions and purchase assist.
- Acceptance: emails are sent with correct branding and links.

### Step 14 - Admin and moderation polish
- [x] User management actions (role changes, disable login, reset password).
- [x] Audit log viewer with filters.
- [x] Content moderation for news posts.
- Acceptance: admin actions are auditable and reversible where possible.

### Step 15 - SEO and content completeness
- [x] Legal pages: /privacy, /termini, /contatti, /faq, /resi-rimborsi with real content.
- [x] Robots and sitemap with product/news URLs.
- [x] Structured data for news articles.
- [x] Structured data for products.
- [x] OpenGraph tags.
- Acceptance: Lighthouse SEO > 90 on key pages.

### Step 16 - Analytics and observability
- [x] Choose analytics (Plausible/GA4) and implement.
- [ ] Error tracking (Sentry) and basic alerting.
- [ ] Server logs sanitized for PII.
- Acceptance: key events tracked (membership purchase, checkout, login).

### Step 17 - Security hardening
- [x] Rate limiting for membership, checkout, webhooks.
- [x] CSRF and input validation coverage on all POST/PATCH.
- [x] Secrets management and rotation plan.
- Acceptance: security checklist in piano.md is fully satisfied.

### Step 18 - Performance and UX
- [x] Image optimization and caching headers.
- [ ] Reduce bundle size and eliminate unused dependencies.
- [ ] Responsive QA on mobile and desktop.
- [ ] Apply clean, non-invasive visual style aligned to provided reference.
- Acceptance: Lighthouse performance > 85 on main pages.

### Step 19 - Testing and QA
- [x] Unit tests for points and RBAC.
- [ ] Integration tests for webhook renewals and no-user-before-pay.
- [ ] Smoke tests for critical flows.
- Acceptance: CI green; key flows verified.

### Step 20 - Production infrastructure and go-live
- [ ] Provision production Postgres (Neon/Supabase).
- [ ] Configure Vercel project and env vars.
- [ ] Configure Stripe/PayPal webhooks to production URLs.
- [ ] Run production migrations and seed admin/seller.
- [ ] Run end-to-end payment tests in production-like env.
- Acceptance: production domain live with HTTPS and working flows.

### Step 21 - Post-launch ops
- [ ] Backup strategy and monitoring.
- [ ] Incident playbook and support workflow.
- [ ] KPIs and weekly review cadence.
- Acceptance: operational readiness documented.

## Progress log
- 2025-02-14: Created plan.md and baseline analysis.
- 2025-02-14: Migrated UI scaffold to Next.js 14 App Router with Tailwind/DaisyUI and Next scripts; shadcn/ui pending.
- 2026-01-14: Added shadcn/ui scaffold and Prisma setup stubs (schema/seed) with scripts.
- 2026-01-14: Implemented Prisma schema and seed data for MVP Gate 1.
- 2026-01-14: Added session + RBAC helper utilities and /api/me + logout route.
- 2026-01-14: Added membership checkout routes, success handlers, and webhook event storage.
- 2026-01-14: Started local Postgres, ran Prisma migration + seed.
- 2026-01-14: Webhooks now update membership periods and award points on renewals.
- 2026-01-14: Added points balance helper.
- 2026-01-14: Added server-side RBAC guards for admin/seller pages.
- 2026-01-14: Added members-only checkout + points spend endpoints with shipping included.
- 2026-01-14: Added seller/admin workflows, public product APIs, and news pages.
- 2026-01-20: Replaced MVP-only plan with full final release plan and new steps.
- 2026-01-20: Added phone login, premium-only access, payment method expansion, legal pages, and search requirements.
- 2026-01-20: Added MVP activation plan for real-world rollout of implemented features.
- 2026-01-20: Implemented premium-only products, prefix search, and mixed points + cash payments.
- 2026-01-20: Added Supabase storage presigned uploads, media gallery rendering, and admin delete endpoint.
- 2026-01-20: Added purchase assist submission and admin triage UI (email pending).
- 2026-01-20: Added email notifications for purchase assist status updates.
- 2026-01-20: Added admin orders list, CSV export, and status updates.
- 2026-01-20: Added rate limiting for membership, checkout, and webhook endpoints.
- 2026-01-20: Added same-origin CSRF enforcement for POST/PATCH/DELETE API routes.
- 2026-01-20: Added sitemap/robots and placeholder FAQ + resi/rimborsi pages.
- 2026-01-20: Added default OpenGraph and Twitter metadata.
- 2026-01-20: Added structured data (JSON-LD) for news list and detail pages.
- 2026-01-20: Added product JSON-LD and moved product page data fetch server-side.
- 2026-01-20: Enabled image optimization formats and cache headers for media assets.
- 2026-01-20: Added optional Plausible analytics integration.
- 2026-01-20: Documented secrets management and rotation plan.
- 2026-01-20: Added admin audit log API and dashboard view.
- 2026-01-20: Added admin news moderation API and dashboard tab.
- 2026-01-20: Added admin user management with role changes and disable toggle.
- 2026-01-20: Added draft legal content for privacy, terms, FAQ, contacts, and returns.
- 2026-01-20: Added refund workflow with Stripe + points restitution and admin action.
- 2026-01-23: Added Vitest setup and unit tests for points and RBAC guards.
- 2026-01-23: Hardened CSRF same-origin check and guarded points spending with transactional balance + checkout expiration cancel.
- 2026-01-23: Added admin review flow for seller change requests (API + dashboard tab).
- 2026-01-23: Added order/membership email templates and admin notifications for seller submissions and purchase assist.
- 2026-01-23: Added admin product delete endpoint with safety checks.

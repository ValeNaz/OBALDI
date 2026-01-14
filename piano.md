```markdown
# piano.md — Obaldi Codex Execution Playbook (PostgreSQL)

This document is the single source of truth for Codex. Codex must continuously re-check compliance against **Non-Negotiable Invariants** and **Acceptance Gates** before adding new code or refactoring.

---

## 1) Decisions (assumptions)

### Non-negotiable product invariants (MUST NEVER BREAK)
1. **Menu must contain exactly these 4 items** (order fixed):  
   - `Obaldi` (Home)  
   - `Entra in Obaldi` (Membership)  
   - `Chi siamo`  
   - `Marketplace`
2. **Marketplace is visible to everyone** (guest can browse). **Purchasing is allowed only with an active membership**.
3. **User registration occurs only at membership purchase time**.  
   - No newsletter-only users.  
   - No “create account” page.  
   - No pre-payment user creation in DB or auth provider.
4. **Membership auto-renews every 28 days**.
5. Premium plan includes **Points** (yellow coin) spendable for products/benefits. **Points rule must be configurable**.
6. UI/UX constraints:
   - No reviews.
   - No product comparisons.
   - No artificial urgency (countdowns, “only today”, scarcity tricks).
   - No inflated promises.
7. Must include **News/Articles about online scams** (public + SEO).
8. Seller can create product listings, but **products become public only after admin approval**.
9. **Shipping is always included/free for members** (never computed at checkout; always displayed as included).

### Tech stack (required)
- **DB: PostgreSQL** (single source of truth)
- Web: **Next.js 14 App Router**, **TypeScript**, **Tailwind**, **shadcn/ui**
- ORM: **Prisma** targeting PostgreSQL
- Payments:
  - Membership: **Stripe Billing** (cards) + **PayPal Subscriptions**
  - Products: Stripe Payment Intents (MVP). PayPal products optional v1.
- Hosting: Vercel (app) + managed Postgres (Supabase or Neon).  
  Storage: Supabase Storage or S3-compatible (for product images/videos).

### Auth (choose ONE; recommended = A)
A) **Recommended**: Local app sessions + DB users (Postgres)  
- Create user only after membership payment success.
- Session stored in DB (`sessions` table) with HTTP-only cookie.
- Email becomes the login identifier; password set after payment or magic-link.
- This avoids pre-payment user creation in external auth systems.

B) Alternative: Supabase Auth with admin-create-user after payment success  
- Allowed only if no auth user is created prior to successful payment.
- Requires admin API usage and careful session bootstrapping.

Codex must implement **A** unless explicitly instructed otherwise.

---

## 2) Architecture (text diagram + components)

### High-level
```

Client (Browser)
-> Next.js (SSR/ISR + Server Actions / Route Handlers)
-> PostgreSQL (Prisma)
-> Object Storage (product media)
-> Stripe API (subscriptions + payment intents)
-> PayPal API (subscriptions)
-> Webhooks endpoints (Stripe/PayPal) [idempotent]
-> RBAC middleware (guest / member / seller / admin)
-> Admin Console (/admin)
-> Seller Console (/seller)
-> Public News (/news) [SEO]

```

### Modules (modular monolith)
- `core/auth` (sessions, password/magic link, RBAC)
- `core/membership` (plans, status, renewals, cancel auto-renew)
- `core/payments` (Stripe/PayPal clients, webhook verification, idempotency)
- `core/points` (ledger, balance, spend, config)
- `core/catalog` (products, media, approval workflow, search)
- `core/orders` (cart, checkout, payment intent, fulfillment placeholders)
- `core/content` (news/articles scams, tags, SEO)
- `core/audit` (append-only audit logging)
- `core/security` (rate limiting, headers, secrets, validation)

---

## 3) Data model (entities + relations) — PostgreSQL + Prisma

### Global rules
- Use `uuid` primary keys everywhere.
- Use `timestamptz` for all timestamps.
- All state transitions must be auditable (write to `audit_logs`).
- Points are **append-only ledger**. Never store a mutable “balance” column.

### Prisma models (minimum required)

#### users
- `id: uuid PK`
- `email: string unique`
- `emailVerifiedAt: timestamptz?`
- `role: enum('MEMBER','SELLER','ADMIN')`
- `createdAt, updatedAt`

#### sessions
- `id: uuid PK`
- `userId FK -> users`
- `tokenHash: string unique` (hash of session token)
- `expiresAt: timestamptz`
- `createdAt`
Index: `(userId)`, `(expiresAt)`

#### membership_plans
- `id: uuid PK`
- `code: enum('ACCESSO','TUTELA')`
- `priceCents: int`
- `currency: string default 'EUR'`
- `periodDays: int default 28`
- `pointsPolicyType: enum('NONE','FIXED_PER_RENEWAL','CONVERT_FEE_TO_POINTS')`
- `pointsFixedAmount: int?` (used if FIXED)
- `pointsConversionRate: numeric?` (points per 1 EUR, used if CONVERT)
- `isActive: boolean default true`

#### memberships
- `id: uuid PK`
- `userId FK -> users unique` (enforce one current membership row per user for MVP)
- `planId FK -> membership_plans`
- `status: enum('ACTIVE','PAST_DUE','CANCELED','EXPIRED')`
- `currentPeriodStart: timestamptz`
- `currentPeriodEnd: timestamptz`
- `autoRenew: boolean default true`
- `provider: enum('STRIPE','PAYPAL')`
- `providerSubId: string unique`
- `createdAt, updatedAt`
Index: `(status)`, `(currentPeriodEnd)`

#### checkout_sessions (pre-user holder; required for “no user before payment”)
- `id: uuid PK`
- `kind: enum('MEMBERSHIP')`
- `planId FK -> membership_plans`
- `email: string` (collected before payment; no user row yet)
- `provider: enum('STRIPE','PAYPAL')`
- `providerSessionId: string unique`
- `status: enum('CREATED','APPROVED','PAID','FAILED','EXPIRED')`
- `expiresAt: timestamptz`
- `createdAt, updatedAt`
Index: `(email)`, `(status)`, `(expiresAt)`

#### points_ledger
- `id: uuid PK`
- `userId FK -> users`
- `delta: int` (positive = credit, negative = spend)
- `reason: enum('RENEWAL','SPEND','ADJUSTMENT','REFUND')`
- `refType: enum('MEMBERSHIP','ORDER','ADMIN')`
- `refId: uuid` (or string if external; prefer uuid)
- `createdAt`
Index: `(userId, createdAt)`

#### products
- `id: uuid PK`
- `sellerId FK -> users`
- `title: string`
- `description: string`
- `specsJson: jsonb`
- `priceCents: int`
- `currency: string default 'EUR'`
- `status: enum('DRAFT','PENDING','APPROVED','REJECTED')`
- `isOutOfStock: boolean default false`
- `pointsEligible: boolean default false`
- `pointsPrice: int?`
- `createdAt, updatedAt`
Index: `(status)`, `(sellerId)`, `(title)` (use trigram index in SQL migration if needed)

#### product_media
- `id: uuid PK`
- `productId FK -> products`
- `type: enum('IMAGE','VIDEO')`
- `url: string`
- `sortOrder: int`
- `createdAt`
Index: `(productId, sortOrder)`

#### product_change_requests (seller cannot edit approved products directly)
- `id: uuid PK`
- `productId FK -> products`
- `sellerId FK -> users`
- `proposedDataJson: jsonb`
- `status: enum('PENDING','APPROVED','REJECTED')`
- `adminNote: string?`
- `createdAt, updatedAt`
Index: `(productId, status)`

#### orders
- `id: uuid PK`
- `userId FK -> users`
- `status: enum('CREATED','PAID','CANCELED','REFUNDED')`
- `totalCents: int`
- `currency: string default 'EUR'`
- `paidWith: enum('MONEY','POINTS','MIXED')`
- `shippingIncluded: boolean default true` (MUST ALWAYS BE TRUE)
- `provider: enum('STRIPE','PAYPAL')`
- `providerPaymentId: string?`
- `createdAt, updatedAt`
Index: `(userId, createdAt)`

#### order_items
- `id: uuid PK`
- `orderId FK -> orders`
- `productId FK -> products`
- `qty: int`
- `unitPriceCents: int`
- `unitPoints: int?`
Index: `(orderId)`

#### content_posts (news/articles scams)
- `id: uuid PK`
- `type: enum('NEWS')`
- `title: string`
- `slug: string unique`
- `excerpt: string?`
- `body: text`
- `tags: text[]`
- `status: enum('DRAFT','PUBLISHED')`
- `publishedAt: timestamptz?`
- `createdAt, updatedAt`
Index: `(status, publishedAt)`

#### purchase_assist_requests (only Tutela)
- `id: uuid PK`
- `userId FK -> users`
- `urlToCheck: string`
- `notes: string?`
- `status: enum('OPEN','IN_REVIEW','DONE')`
- `outcome: text?`
- `createdAt, updatedAt`
Index: `(userId, status)`

#### audit_logs (append-only)
- `id: uuid PK`
- `actorUserId: uuid?`
- `action: string`
- `entity: string`
- `entityId: uuid?`
- `metadataJson: jsonb`
- `createdAt`
Index: `(createdAt)`, `(actorUserId)`, `(entity, entityId)`

#### webhook_events (idempotency)
- `id: uuid PK`
- `provider: enum('STRIPE','PAYPAL')`
- `eventId: string unique`
- `type: string`
- `payload: jsonb`
- `processedAt: timestamptz?`
- `createdAt`

---

## 4) Primary APIs (routes + contracts)

### Conventions
- Every endpoint validates input with Zod.
- RBAC enforced **server-side**.
- All critical writes produce an `audit_logs` row.
- Use consistent error format:
  - `{ error: { code: string, message: string } }`

### Public
- `GET /api/products?q=`  
  Returns only `APPROVED` products. If out of stock, still visible but not purchasable.
- `GET /api/products/:id`
- `GET /api/news` (published only)
- `GET /api/news/:slug`

### Membership purchase (NO USER before payment)
1) Start checkout (collect email + plan)
- `POST /api/membership/stripe/create`
  - input: `{ planCode: 'ACCESSO'|'TUTELA', email: string }`
  - creates `checkout_sessions` row (status CREATED)
  - creates Stripe Checkout Session (subscription)
  - returns `{ url }`
- `POST /api/membership/paypal/create`
  - same pattern, returns approval link

2) Success handlers (server-side verification)
- `GET /membership/success/stripe?cs_id=...`
  - fetch checkout session + subscription from Stripe (server-side)
  - if paid/active => mark checkout_sessions PAID
  - then **create user + membership + session cookie**
- `GET /membership/success/paypal?sub_id=...`
  - verify subscription active with PayPal
  - same: mark PAID, create user + membership + session

3) Manage membership
- `GET /api/me` (requires session) returns:
  - user, membership summary, points balance
- `POST /api/membership/cancel-autorenew` (member) sets `autoRenew=false` (do not delete)
- `POST /api/membership/resume-autorenew` (member) sets `autoRenew=true` if provider allows

### Webhooks (idempotent)
- `POST /api/webhooks/stripe`
- `POST /api/webhooks/paypal`
Rules:
- Verify signature.
- Insert into `webhook_events` (unique eventId). If conflict => return 200.
- Process inside DB transaction:
  - membership renewal: extend `currentPeriodEnd` by 28 days (or provider period end)
  - if plan = Tutela => award points per policy (ledger entry)
  - write audit log
  - set `webhook_events.processedAt`

### Marketplace purchase (members only)
- `POST /api/cart/add` (member)
- `POST /api/checkout/order` (member)
  - validates membership is ACTIVE and `currentPeriodEnd > now()`
  - validates product is APPROVED and not out-of-stock
  - shippingIncluded always true; shipping cost always 0
  - creates Order + OrderItems
  - creates Stripe PaymentIntent
- `POST /api/points/spend` (member)
  - checks membership plan allows points
  - checks product pointsEligible
  - checks ledger balance >= required points
  - inserts negative ledger row; updates order paidWith = POINTS or MIXED

### Seller
- `POST /api/seller/products` -> creates DRAFT
- `POST /api/seller/products/:id/submit` -> sets PENDING
- `POST /api/seller/products/:id/change-request` -> creates product_change_requests PENDING
- `POST /api/seller/media/presign` -> returns upload URL; validate MIME and size limits

### Admin
- `GET /api/admin/products?status=PENDING`
- `POST /api/admin/products/:id/approve`
- `POST /api/admin/products/:id/reject`
- `PATCH /api/admin/products/:id` (admin edits approved listing)
- `POST /api/admin/products/:id/out-of-stock`
- `CRUD /api/admin/news`
- `GET /api/admin/audit`
All admin actions must log audit rows.

---

## 5) Milestones + executable backlog (MVP → v1 → v2)

### MVP Gate 0 — Repository + CI baseline
- Create monorepo or single repo (acceptable). Minimum:
  - `src/` modules
  - `prisma/` schema + migrations + seed
  - `tests/` unit + integration
- Commands must work:
  - `pnpm i`
  - `pnpm lint`
  - `pnpm build`
  - `pnpm test`
Acceptance check:
- CI runs lint/build/test on PR.

### MVP Gate 1 — Data model + seed
- Implement Prisma schema exactly with models above.
- Seed:
  - 2 membership plans (ACCESSO, TUTELA)
  - 1 admin user (created only via seed; not via UI)
  - 1 seller user + 6 demo products (mix of statuses)
  - 3 published news posts
Acceptance check:
- `pnpm prisma migrate dev` + `pnpm prisma db seed` succeed.
- Public product listing shows only approved items.

### MVP Gate 2 — Auth sessions + RBAC
- Implement session creation + cookie storage + logout.
- RBAC matrix enforced:
  - Guest: browse only
  - Member: buy + view points
  - Seller: manage own products (no approval)
  - Admin: approvals + edits + content + audit
Acceptance check:
- Server-side guards block forbidden endpoints.

### MVP Gate 3 — Membership checkout (28 days) + “no user before pay”
- Stripe + PayPal membership checkout flows.
- Must prove invariant:
  - Starting checkout does NOT create user rows.
  - Only success verification creates user + membership + session.
Acceptance check:
- Automated integration test covers:
  - create checkout session -> user count unchanged
  - simulate success -> user created exactly once
  - idempotent double-callback does not create duplicates.

### MVP Gate 4 — Points ledger + renewal awarding
- Implement configurable points policy at plan level.
- Award points on membership renewal webhook (Tutela only).
Acceptance check:
- Unit test: balance = sum(ledger)
- Integration test: webhook renewal -> ledger credit row inserted.

### MVP Gate 5 — Marketplace checkout (members only) + shipping included
- Stripe product payments
- Ensure shipping is always included and never priced.
Acceptance check:
- Guest cannot purchase.
- Member can purchase.
- Order total contains no shipping line.

### MVP Gate 6 — Seller submit + Admin approval workflow
- Seller creates DRAFT and submits -> PENDING.
- Admin approves -> APPROVED (public).
- Seller cannot modify approved product; uses change request.
Acceptance check:
- Public listing never shows PENDING/REJECTED/DRAFT.

### MVP Gate 7 — News (scams) SEO
- `/news` listing + detail pages with SEO metadata.
Acceptance check:
- Pages render server-side, have stable slugs.

### v1
- PayPal products checkout (optional)
- Purchase assist workflow (Tutela only) with admin triage UI

### v2
- Additional payment methods (bank transfer) if required
- Returns/refunds workflow (only after policy defined)

---

## 6) Risks + mitigations (engineering)

1. Webhooks duplication / ordering  
Mitigation: `webhook_events` unique constraint + transaction processing + idempotent state transitions.

2. “No user before pay” edge cases (failed payments, abandoned sessions)  
Mitigation: `checkout_sessions` TTL cleanup job; never create user until provider confirms payment.

3. Points integrity  
Mitigation: ledger only; balance computed query; spend uses SERIALIZABLE tx or `SELECT ... FOR UPDATE` on a per-user lock row (optional).

4. Admin approval as single gate  
Mitigation: only APPROVED visible; enforce in SQL query and API; never rely solely on UI filter.

---

## 7) Next actions for Codex (max 5, immediate)

1. Implement Prisma schema + migrations + seed for PostgreSQL.
2. Implement session-based auth (Option A) + RBAC middleware.
3. Implement membership checkout start + success verification + webhook idempotency.
4. Implement catalog (public listing) + seller submit + admin approval.
5. Implement points ledger + renewal awarding + required tests.

---

# Operational checklists Codex MUST run continuously

## Always-on invariant checklist (run before each merge)
- [ ] Menu contains exactly 4 items: Obaldi, Entra in Obaldi, Chi siamo, Marketplace
- [ ] Guest can browse Marketplace; cannot purchase
- [ ] No user row created before membership payment success
- [ ] Membership renew interval = 28 days
- [ ] Points policy configurable; ledger append-only
- [ ] No reviews/comparisons/urgency UI components exist
- [ ] Products public only when APPROVED
- [ ] Shipping included for members; no shipping fee anywhere
- [ ] News scams section exists and is public/SEO

## Required environment variables
- `DATABASE_URL` (PostgreSQL)
- `APP_BASE_URL`
- `SESSION_SECRET`
- Stripe:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `STRIPE_PRICE_ID_ACCESSO`
  - `STRIPE_PRICE_ID_TUTELA`
- PayPal:
  - `PAYPAL_CLIENT_ID`
  - `PAYPAL_CLIENT_SECRET`
  - `PAYPAL_WEBHOOK_ID`
  - `PAYPAL_PLAN_ID_ACCESSO`
  - `PAYPAL_PLAN_ID_TUTELA`
- Storage:
  - `STORAGE_BUCKET`
  - provider keys if not managed

## Security hard requirements
- Rate limit: `/api/membership/*`, `/api/checkout/*`, `/api/webhooks/*`
- Zod validation for every POST/PATCH endpoint
- HTTP-only cookies; SameSite=Lax; secure in production
- Audit log on:
  - admin approve/reject/edit/out-of-stock/delete
  - membership create/cancel/resume
  - webhook events processed
- Do not log secrets or full payment payloads; store payload in `webhook_events` but redact if needed.

## Testing minimum
- Unit:
  - Points balance calculation
  - Points spend insufficient balance rejection
- Integration:
  - Stripe webhook renewal -> extends membership + awards points (Tutela)
  - RBAC: guest blocked from purchase endpoints; seller blocked from admin endpoints
- Smoke (optional):
  - Home -> Marketplace view -> Entra in Obaldi -> checkout start (mocked)

---
```

# OBALDI - Technical Analysis Report

**Generated**: January 28, 2026  
**Scope**: Full codebase review

---

## 1. Architecture Overview

### Project Structure

```
OBALDI/
├── app/                    # Next.js 14 App Router pages & API routes
│   ├── api/               # 16 API route groups (80+ files)
│   │   ├── admin/         # Admin management (29 files)
│   │   ├── auth/          # Authentication (5 files)
│   │   ├── checkout/      # Order checkout (3 files)
│   │   ├── marketplace/   # Product listing (2 files)
│   │   ├── membership/    # Subscription management (9 files)
│   │   ├── seller/        # Seller dashboard (9 files)
│   │   └── webhooks/      # Stripe/PayPal webhooks (2 dirs)
│   ├── admin/             # Admin panel pages
│   ├── marketplace/       # Marketplace page
│   └── [other pages]/     # 23+ page directories
├── components/            # React components (55 files)
│   ├── admin/            # Admin UI components (14 files)
│   ├── ui/               # Reusable UI primitives (13 files)
│   └── home/             # Homepage sections (10 files)
├── context/              # React Context providers (3 files)
├── src/core/             # Backend business logic
│   ├── auth/             # Session & authentication
│   ├── membership/       # Plans, points, guards
│   ├── payments/         # Stripe integration
│   ├── security/         # Rate limiting, CSRF
│   └── email/            # Email transactional
├── prisma/               # Database schema & migrations
└── lib/                  # Shared utilities
```

### Tech Stack
| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Database | PostgreSQL via Prisma ORM |
| Auth | Custom session-based (SHA256 tokens) |
| Payments | Stripe, PayPal |
| Storage | Supabase |
| Styling | Tailwind CSS, Framer Motion |
| Testing | Vitest |

---

## 2. Critical Components

### 🔐 Authentication System
**Location**: `src/core/auth/`

- **session.ts**: Token generation (crypto.randomBytes), SHA256 hashing with secret
- **guard.ts**: `requireSession()`, `requireRole()` guards
- **cookies.ts**: Secure cookie management
- **Strength**: Proper session invalidation, disabled user checks
- **Risk**: Session secret rotation requires all users to re-login

### 💳 Payment Processing
**Location**: `app/api/webhooks/stripe/`, `app/api/checkout/`

- Stripe Checkout for one-time payments and subscriptions
- PayPal integration for alternative payments
- Webhook signature verification present
- **Strength**: Rate limiting on checkout endpoints (10/min)
- **Risk**: Order creation before payment confirmation (optimistic)

### 👤 Membership System
**Location**: `src/core/membership/`

- Two tiers: ACCESSO (€4.90), TUTELA (€9.90/mo)
- Points system with configurable policies
- Auto-renewal via Stripe subscriptions
- **Strength**: Clean separation of concerns, testable logic
- **Risk**: Points ledger lacks transaction isolation in edge cases

### 📦 Order Processing
**Location**: `app/api/checkout/order/route.ts`

- CSRF protection via same-origin enforcement
- Membership validation before purchase
- Premium-only product restrictions
- Inventory tracking (optional per product)

---

## 3. Issues & Risks

### 🔴 High Priority

| Issue | Location | Impact |
|-------|----------|--------|
| Root utility scripts exposed | `/*.ts` (10 files) | Security/clutter |
| Missing rate limit on some admin endpoints | `app/api/admin/*` | DoS vulnerability |
| No input sanitization on rich text | `components/admin/news/` | XSS risk |

### 🟡 Medium Priority

| Issue | Location | Impact |
|-------|----------|--------|
| Limited test coverage | `tests/` (3 files) | Regression risk |
| Hardcoded specs in ProductClient | `app/product/[id]/ProductClient.tsx:151` | Maintainability |
| Duplicated Prisma client imports | Various files | Bundle size |

### 🟢 Low Priority

| Issue | Location | Impact |
|-------|----------|--------|
| Unused DaisyUI dependency | `package.json` | Bundle bloat |
| Large tsconfig.tsbuildinfo | Root (997KB) | Git repo size |
| Plan docs in root | `plan.md`, `piano.md` | Organization |

---

## 4. Improvement Recommendations

### High Impact / Low Effort

1. **Move utility scripts to `scripts/` folder**
   - Files: `check_*.ts`, `list_*.ts`, `create_*.ts`, `clear_*.ts`, `test_*.ts`
   - Add to `.gitignore` or consolidate into npm scripts

2. **Add rate limiting to admin API**
   ```typescript
   // Apply to: app/api/admin/*/route.ts
   const limiter = rateLimit({ key: `admin:${ip}`, limit: 100, windowMs: 60000 });
   ```

3. **Sanitize HTML content in news posts**
   - Use DOMPurify or similar before rendering `body` content

### Medium Impact / Medium Effort

4. **Expand test coverage**
   - Priority: Auth guards, checkout flow, webhook handlers
   - Target: 60%+ coverage on `src/core/`

5. **Extract product specs to database**
   - Remove hardcoded `fullSpecs` array
   - Use `specsJson` field already in Product model

6. **Consolidate Prisma imports**
   - Always import from `@/src/core/db`
   - Remove direct `new PrismaClient()` instances

### Low Impact / Low Effort

7. **Remove unused DaisyUI**
   - `npm uninstall daisyui`

8. **Move docs to proper locations**
   - `plan.md` → `docs/DEVELOPMENT_PLAN.md`
   - `piano.md` → `docs/ROADMAP.md`

---

## 5. Cleanup Suggestions

### Files Safe to Remove/Move

```bash
# Move to scripts/ directory
mkdir -p scripts/dev
mv check_*.ts scripts/dev/
mv list_*.ts scripts/dev/
mv create_*.ts scripts/dev/
mv clear_*.ts scripts/dev/
mv test_*.ts scripts/dev/

# Consider removing (generated/temporary)
rm -f tsconfig.tsbuildinfo  # Regenerated on build

# Move documentation
mv plan.md docs/DEVELOPMENT_PLAN.md
mv piano.md docs/ROADMAP.md
mv components.md docs/COMPONENTS.md
```

### Files to Review

| File | Size | Recommendation |
|------|------|----------------|
| `components.md` | 103KB | Archive or split |
| `metadata.json` | 272B | Document purpose or remove |
| `context/media/` | Unknown | Verify if used |

---

## 6. Security Checklist

- [x] Session tokens hashed before storage
- [x] CSRF protection on state-changing endpoints
- [x] Rate limiting on auth/checkout endpoints
- [x] Stripe webhook signature verification
- [x] Role-based access control
- [x] Disabled user check in session validation
- [ ] Rate limiting on all admin endpoints
- [ ] HTML sanitization for user/admin content
- [ ] SQL injection prevention (handled by Prisma)
- [ ] Secrets rotation documentation exists

---

## Summary

OBALDI is a well-structured Next.js 14 application with proper separation between frontend, API routes, and business logic. The authentication and payment systems follow security best practices. Main improvements needed are:

1. **Cleanup**: Remove development artifacts from root
2. **Security**: Add rate limiting to admin endpoints, sanitize HTML
3. **Quality**: Expand test coverage, consolidate code patterns
4. **Organization**: Move documentation to proper locations

The codebase is production-ready with the above recommendations addressed.

# Security & Secrets Rotation

This document describes how to manage and rotate secrets for Obaldi.

## Principles
- Store secrets only in platform-managed environment variables (Vercel or CI).
- Never commit secrets into the repository.
- Rotate all production secrets on a regular cadence and after any suspected leak.

## Rotation cadence
- Payment providers (Stripe/PayPal): every 90 days.
- SMTP credentials: every 180 days.
- Session secret: every 90 days.
- Storage service keys: every 180 days.

## Secrets list
- `SESSION_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_WEBHOOK_ID`
- `SMTP_USER`, `SMTP_PASS`
- `SUPABASE_SERVICE_ROLE_KEY`

## Rotation steps (high level)
1. Generate new credentials in the provider dashboard.
2. Add the new values in the platform environment variables.
3. Deploy and verify the application.
4. Remove old credentials once traffic uses the new ones.

## Stripe rotation notes
- Update `STRIPE_SECRET_KEY` first, then rotate `STRIPE_WEBHOOK_SECRET`.
- Ensure all webhook endpoints are configured with the new signing secret.

## PayPal rotation notes
- Create a new client secret and update `PAYPAL_CLIENT_SECRET`.
- Re-verify webhook signatures if needed.

## Session secret rotation
- Rotate `SESSION_SECRET` to invalidate all sessions.
- Schedule this during a maintenance window if needed.

## Incident response
- If a secret is exposed, rotate immediately and review logs for unauthorized access.

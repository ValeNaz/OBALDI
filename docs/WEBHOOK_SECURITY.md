# Webhook Security

This document outlines the security measures implemented for incoming webhooks (Stripe, PayPal) in the OBALDI platform.

## 1. Signature Verification

All webhooks must be verified to ensure they originate from the expected provider.

### Stripe
- **Header**: `stripe-signature`
- **Mechanism**: We use the `stripe` Node.js library to construct the event.
    ```typescript
    getStripeClient().webhooks.constructEvent(payload, signature, secret);
    ```
- **Secret**: `STRIPE_WEBHOOK_SECRET` env variable.
- **Tolerance**: Default Stripe tolerance (5 minutes) to prevent replay attacks.

### PayPal
- **Header**: `transmission-sig`, `transmission-id`, `transmission-time`, `cert-url`, `auth-algo`.
- **Mechanism**: We verify the signature using the PayPal SDK or direct crypto verification against the downloaded certificate.
- **Secret**: `PAYPAL_WEBHOOK_ID` env variable.

## 2. Replay Attack Prevention

### Idempotency
We track processed events in the `WebhookEvent` table using the provider's `eventId`.
- If an event with the same ID arrives, we check if it was already processed.
- If processed, we return 200 OK immediately without re-processing.
- If not processed (e.g., previous attempt failed), we retry processing.

## 3. Rate Limiting

We apply strict rate limiting to webhook endpoints to prevent flooding attacks.
- **Limit**: ~120 requests per 5 minutes per IP.
- **Why**: Webhooks usually come from a known range of IPs, but flooding is still a risk.

## 4. Secret Rotation

Webhook secrets should be rotated periodically or if a compromise is suspected.

| Provider | Env Variable | Rotation Procedure |
|----------|--------------|--------------------|
| Stripe | `STRIPE_WEBHOOK_SECRET` | 1. Generate new secret in Stripe Dashboard.<br>2. Update `.env`.<br>3. Restart application. |
| PayPal | `PAYPAL_WEBHOOK_ID` | 1. Create new webhook in PayPal Developer Portal.<br>2. Update `.env`.<br>3. Restart application. |

> [!IMPORTANT]
> When rotating secrets, webhooks sent during the restart might fail. Ensure your provider handles retries (Stripe and PayPal both do).

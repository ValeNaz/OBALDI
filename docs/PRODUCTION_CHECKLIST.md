# Production Checklist

## Environment variables
- DATABASE_URL
- SESSION_SECRET
- APP_BASE_URL
- STRIPE_SECRET_KEY
- STRIPE_PRICE_ID_ACCESSO
- STRIPE_PRICE_ID_TUTELA
- STRIPE_WEBHOOK_SECRET
- PAYPAL_CLIENT_ID
- PAYPAL_CLIENT_SECRET
- PAYPAL_PLAN_ID_ACCESSO
- PAYPAL_PLAN_ID_TUTELA
- PAYPAL_WEBHOOK_ID
- PAYPAL_API_BASE_URL (optional, use sandbox URL for tests)
- SMTP_HOST
- SMTP_PORT
- SMTP_SECURE
- SMTP_USER
- SMTP_PASS
- SMTP_FROM
- See .env.production.example for a full template

## Admin and seller access
- Set ADMIN_EMAIL and ADMIN_PASSWORD
- Set SELLER_EMAIL and SELLER_PASSWORD (optional, if you need seller access)
- Run seed once to create the accounts with password hashes

## Go-live steps
- Run a migration to add passwordHash to users table
- Run a migration to add password reset tokens table
- Run Prisma migrations on production database
- Configure Stripe and PayPal webhooks to point to /api/webhooks/stripe and /api/webhooks/paypal
- Verify APP_BASE_URL matches the public domain (https)
- Create real content for /privacy and /contatti pages
- Create real content for /termini page
- Test membership purchase, points spend, and order checkout end-to-end
- Test password reset email flow end-to-end

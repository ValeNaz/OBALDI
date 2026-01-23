# Obaldi - Startup Guide

Questa guida spiega come avviare il progetto in locale in modo corretto.

## 1) Requisiti
- Node.js 18+
- PostgreSQL 14+ attivo in locale
- npm

## 2) Configura le variabili d’ambiente
Apri `.env` e verifica questi valori:
- `DATABASE_URL` (esempio: `postgresql://vale@localhost:5432/obaldi?schema=public`)
- `APP_BASE_URL` (per il locale: `http://localhost:3000`)
- `SESSION_SECRET`
- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` / `STORAGE_BUCKET` (per upload media)
- `ADMIN_EMAIL` / `ADMIN_PASSWORD`
- `SELLER_EMAIL` / `SELLER_PASSWORD`

Se vuoi un template completo, guarda `.env.production.example`.

## 3) Avvio database
Assicurati che Postgres sia in esecuzione e che esista il database `obaldi`.

## 4) Installazione dipendenze
```
npm install
```

## 5) Migrazioni e seed
```
npm run prisma:migrate
npm run prisma:seed
```

## 6) Avvio del progetto
```
npm run dev
```
Poi apri `http://localhost:3000`.

## 7) Accessi
Dopo il seed puoi accedere con:
- Admin: usa `ADMIN_EMAIL` / `ADMIN_PASSWORD`
- Seller: usa `SELLER_EMAIL` / `SELLER_PASSWORD`

Per il pannello admin vai su:
- `http://localhost:3000/admin/login`

## 8) Note sui pagamenti
Per testare Stripe/PayPal servono chiavi di test reali. Se non le hai, il checkout non si completa.

## 9) Reset password
Pagina di reset:
- `http://localhost:3000/reset-password`

Per il reset via email serve un SMTP funzionante.

## 10) Problemi comuni
- **Credenziali non valide**: controlla che il seed sia stato eseguito e che la password sia presente in `.env`.
- **DB non raggiungibile**: verifica che Postgres sia in esecuzione su `localhost:5432`.
- **Errore migrazioni**: esegui nuovamente `npm run prisma:migrate`.

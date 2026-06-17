# BSD Haus Sales Rep Portal

Internal web portal for BSD Haus LLC sales representatives. Built with Next.js 14 (App Router), Tailwind CSS, Turso (SQLite), and Anthropic AI.

---

## Features

| Section | Route |
|---|---|
| Price List (tier-aware) | `/portal/price-list` |
| Sales Reps Sheet + CSV export | `/portal/reps` |
| FAQ with AI assistant | `/portal/faq` |
| Price Calculator | `/portal/calculator` |
| Inventory Check | `/portal/inventory` |
| Order Submission + history | `/portal/orders` |
| Sample Requests + history | `/portal/samples` |
| Admin – All Orders | `/admin/orders` |
| Admin – All Samples | `/admin/samples` |

---

## Environment Variables

All variables are required. Copy `.env.local.example` to `.env.local` and fill in each value.

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Anthropic API key for the FAQ AI assistant |
| `TURSO_DATABASE_URL` | Turso database URL (`libsql://...`) |
| `TURSO_AUTH_TOKEN` | Turso auth token |
| `ADMIN_PASSWORD` | Password used to access `/admin/*` routes via `x-admin-password` header |
| `SESSION_SECRET` | Secret for signing JWT session cookies (min 32 chars; generate with `openssl rand -base64 32`) |

---

## Setup & Deployment

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd bsd-haus-sales-portal
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a Turso database

```bash
# Install Turso CLI if needed
curl -sSfL https://get.tur.so/install.sh | bash

# Login and create a database
turso auth login
turso db create bsdhaus-portal

# Get your credentials
turso db show bsdhaus-portal   # copy the URL
turso db tokens create bsdhaus-portal  # copy the token
```

### 4. Configure environment

```bash
cp .env.local.example .env.local
# Edit .env.local and fill in all values
```

### 5. Run the database migration

```bash
npm run migrate
# Or directly: npx ts-node --project tsconfig.migrate.json db/migrate.ts
```

### 6. Run locally

```bash
npm run dev
# Open http://localhost:3000
```

### 7. Deploy to Vercel

1. Push the repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import Project → select your repo
3. In **Environment Variables**, add all variables from `.env.local`
4. Deploy

---

## Test Rep Accounts

| Email | Password | Tier |
|---|---|---|
| marcus@bsdhaus.com | rep123 | A (best pricing) |
| sofia@bsdhaus.com | rep456 | B |
| james@bsdhaus.com | rep789 | C |

---

## Admin Access

Navigate to `/admin/orders` or `/admin/samples`. Access is granted if:
- The rep's session tier is `"admin"`, **or**
- The request includes the header `x-admin-password: <ADMIN_PASSWORD>`

For quick local testing, open DevTools → Network → add the header to your browser session, or use a tool like [ModHeader](https://modheader.com/).

---

## Project Structure

```
app/
  login/          Login page + form
  portal/         All rep-facing pages (price-list, reps, faq, calculator, inventory, orders, samples)
  admin/          Admin pages (orders, samples)
  api/            API routes (auth/login, auth/logout, faq, orders, samples, admin/*)
components/
  Sidebar.tsx     Fixed left sidebar with nav + rep info
data/
  products.json   18 products with tier pricing and inventory
  reps.json       9 SoCal sales reps
db/
  schema.sql      Database schema (orders + samples tables)
  migrate.ts      One-time migration script
lib/
  auth.ts         Rep authentication (checks seeds/reps.json)
  db.ts           Turso client
  session.ts      JWT session signing + verification
seeds/
  reps.json       3 test rep login accounts
```

---

## Notes

- Rep tier prices are **never sent to the client bundle** — the server filters to only the relevant tier column before rendering or returning data.
- The FAQ AI uses streaming via Anthropic's SDK with `claude-haiku-4-5-20251001` for fast responses.
- Inventory data is seeded from `data/products.json`. For real-time inventory, contact `infohaus@bsd.group`.

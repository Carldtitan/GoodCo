# GoodCo

GoodCo is a pantry inventory entry tool for real Bay Area pantry operations. It turns reviewed receiving events into inventory lots, exposes eligible lots through inventory APIs, and leaves marketplace UI work to the marketplace stream.

No demo inventory, fake pantry surplus, fake transfer history, or seeded marketplace data should ship with the app.

## Local Setup

Install dependencies:

```bash
npm install
```

Create a local env file:

```bash
cp .env.example .env
```

Fill every variable in `.env`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
FIREWORKS_API_KEY=
FIREWORKS_MODEL=
USDA_FDC_API_KEY=
```

Keep `.env` local. It is ignored by git and must never be committed.

Run the app:

```bash
npm run dev
```

Run checks:

```bash
npm run lint
npm run test
npm run build
```

## Supabase Setup

Apply the SQL files in `supabase/migrations` in order through the Supabase SQL Editor unless a Supabase CLI or database URL workflow is added later:

1. `0001_goodco_pantry_mesh.sql`
2. `0002_inventory_marketplace_reservation.sql`
3. `0003_inventory_marketplace_cancellation.sql`
4. `0004_inventory_marketplace_transfer.sql`
5. `0005_google_admin_bootstrap.sql`

The app expects Supabase Auth users to be linked to a pantry through `pantry_memberships`. Without that record, authenticated users cannot access pantry-owned inventory.

Email sign-in uses Supabase magic links. Add the deployed callback URLs to Supabase Auth redirect URLs:

- `https://goodco-weld.vercel.app/auth/callback`
- `https://goodco-weld.vercel.app/auth/confirm`

Supabase stores the exchanged session in SSR auth cookies, so users stay signed in across browser refreshes until the Supabase session expires or they clear cookies.

The migration `0005_google_admin_bootstrap.sql` grants `carl@uni.minerva.edu` a `network_admin` membership when that user exists or signs in.

## Inventory Stream

The inventory stream owns:

- Receiving workflow at `/`
- Inventory list at `/inventory`
- Expiring lots at `/expiring`
- Correction review at `/review`
- CSV exports at `/exports`
- Audit views at `/audit`

Receiving supports barcode lookup, manual entry, OCR date capture, voice date capture, category memory, deterministic category rules, and Fireworks fallback parsing. Dates and low-confidence fields stay draft until reviewed.

## Marketplace Seam

The marketplace stream should consume only real confirmed inventory through these routes:

- `GET /api/inventory/eligible-lots`
- `POST /api/inventory/marketplace-reservations`
- `POST /api/inventory/marketplace-cancellations`
- `POST /api/inventory/marketplace-transfers`

Eligible lots exclude unconfirmed, TEFAP, non-redistributable, and zero-available inventory. Reservation changes reserved quantity without reducing on-hand quantity. Final transfer records the movement and creates destination inventory.

## Required Providers

Open Food Facts lookup does not require an app key. USDA FoodData Central requires `USDA_FDC_API_KEY`. Fireworks is used only as the fallback parser after correction memory, product data, and deterministic rules.

## Handoff Rules

- Do not add seed data for inventory or marketplace screens.
- Do not list pantry stock unless it came from a saved receiving event.
- Do not commit `.env`, Supabase secrets, Fireworks keys, or USDA keys.
- Do not mark cross-stream checkpoints complete until both inventory and marketplace work exist.

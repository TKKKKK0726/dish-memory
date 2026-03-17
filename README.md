# DishLog

Your personal restaurant memory. Track every dining visit, rate dishes, and know exactly what to reorder — or skip — next time.

## What it does

- Add restaurants with cuisine, location, and price range
- Log visits with overall, ambiance, and service ratings
- Rate individual dishes and mark them as reorder or avoid
- See a smart verdict per restaurant (Worth Revisiting / Mixed / Avoid) based on visit history
- View your best and worst dishes aggregated across visits

## Tech stack

- **React + TypeScript** — UI
- **Vite** — build tool and dev server
- **Tailwind CSS + shadcn/ui** — styling and components
- **TanStack React Query** — data fetching and caching
- **Supabase** — authentication (email/password) and PostgreSQL database
- **vite-plugin-pwa** — installable as a mobile app via browser

---

## Getting started

### 1. Prerequisites

- Node.js 18+ and npm
- A [Supabase](https://supabase.com) account and project

### 2. Clone and install

```bash
git clone https://github.com/TKKKKK0726/dish-memory.git
cd dish-memory
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the project root (this is gitignored):

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Find these in your Supabase dashboard under **Project Settings → API**.

### 4. Set up the database

In the Supabase dashboard, go to **SQL Editor** and run the contents of [`supabase/schema.sql`](supabase/schema.sql).

This creates three tables (`restaurants`, `visits`, `visit_dishes`) with Row Level Security so each user only sees their own data.

### 5. Run locally

```bash
npm run dev
```

Open `http://localhost:8080` in your browser.

---

## Optional: Load sample data

A seed script with South Bay Area restaurants is included. To use it:

1. Go to **Supabase → Authentication → Users** and copy your User UID
2. Open [`supabase/seed.sql`](supabase/seed.sql) and replace `YOUR-USER-UUID-HERE` with your UID
3. Run the script in the Supabase SQL Editor

---

## Deployment (Vercel)

```bash
npx vercel
```

After deploying, add your environment variables in the Vercel dashboard under **Project Settings → Environment Variables**:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## Installing as a mobile app (PWA)

Once deployed to a public HTTPS URL:

- **iPhone**: Open in Safari → Share → Add to Home Screen
- **Android**: Open in Chrome → browser menu → Install App

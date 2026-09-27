# Healer — Developer Setup Guide

> A multi-role healthcare SaaS platform for patients, doctors, researchers, admins, and super admins.

---

## Prerequisites

Before you begin, install the following on your machine:

| Tool | Version | Install |
|---|---|---|
| Node.js | `>=20` | [nodejs.org](https://nodejs.org) |
| pnpm | `>=10` | `npm install -g pnpm` |
| Docker Desktop | Latest | [docker.com](https://docker.com/products/docker-desktop) |
| Git | Latest | [git-scm.com](https://git-scm.com) |

---

## 1. Clone & Install

```bash
git clone https://github.com/your-org/healer.git
cd healer
pnpm install
```

---

## 2. Environment Variables

Copy the example file and fill in your secrets:

```bash
cp apps/web/.env.example apps/web/.env.local
```

Now open `apps/web/.env.local` and fill in each variable. The full guide is below.

> **Important:** `apps/web/.env.local` is the **only** `.env` file used in this project. Next.js reads it and supplies all variables to both the frontend and the Hono backend routes. Never create a separate `.env` in `apps/api/`.

---

## 3. Environment Variables — Full Reference

### 3.1 App URLs

```env
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:5002"
NEXT_PUBLIC_API_URL="http://localhost:5002"
```

| Variable | Purpose | Dev Value | Prod Value |
|---|---|---|---|
| `NODE_ENV` | Controls dev vs prod behaviour (Redis adapter, email routing, Pino log level) | `"development"` | `"production"` |
| `NEXT_PUBLIC_APP_URL` | The root URL of the app — used by Better Auth for cookie domain and OAuth redirect | `http://localhost:5002` | `https://yourdomain.com` |
| `NEXT_PUBLIC_API_URL` | The base URL for frontend fetch calls to the API | `http://localhost:5002` | `https://yourdomain.com` |

> **Note:** In the monolith setup, `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_API_URL` are the same URL. They are separate variables in case you ever split them.

---

### 3.2 Database

```env
DATABASE_URL="postgresql://postgres:password@localhost:5455/healer_db"
```

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Full PostgreSQL connection string. In dev, points to the local Docker container. In prod, use your Neon connection string (see below). |

#### Getting a Local Dev Database
Docker Compose starts PostgreSQL automatically when you run `docker compose up -d`. No setup needed.

#### Getting a Production Database (Neon)
1. Go to [neon.tech](https://neon.tech) and create a free account.
2. Create a new project named `healer`.
3. In the project dashboard, click **"Connection Details"**.
4. Select **"Pooled connection"** and copy the connection string.
5. Paste it as `DATABASE_URL` in your production environment (Vercel Project Settings).

---

### 3.3 Redis / Cache

```env
REDIS_URL="redis://127.0.0.1:6302"
UPSTASH_URL=""
UPSTASH_TOKEN=""
```

| Variable | Purpose | When Used |
|---|---|---|
| `REDIS_URL` | Connection URL for your local Docker Redis instance | `NODE_ENV=development` only |
| `UPSTASH_URL` | Upstash REST endpoint URL | `NODE_ENV=production` only |
| `UPSTASH_TOKEN` | Upstash API token | `NODE_ENV=production` only |

**Why two Redis configs?** Local development uses `ioredis` over TCP (fast, offline-capable, free). Vercel Serverless functions scale horizontally and can open thousands of simultaneous TCP connections, which crashes a standard Redis server. Upstash communicates over HTTP, making it stateless and serverless-safe.

#### Getting Upstash Credentials (Production)
1. Go to [upstash.com](https://console.upstash.com) and sign up.
2. Create a new Redis database. Select the region closest to your Vercel deployment.
3. In the database details, copy:
   - **REST URL** → `UPSTASH_URL`
   - **REST Token** → `UPSTASH_TOKEN`

---

### 3.4 Authentication (Better Auth)

```env
BETTER_AUTH_SECRET=""
BETTER_AUTH_URL="http://localhost:5002"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

| Variable | Purpose |
|---|---|
| `BETTER_AUTH_SECRET` | A random 32-byte Base64 string used to sign sessions and tokens. **Must be secret.** |
| `BETTER_AUTH_URL` | The base URL where Better Auth is hosted (same as `NEXT_PUBLIC_APP_URL`) |
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 2.0 Client Secret |

#### Generating `BETTER_AUTH_SECRET`
Run this command in your terminal and paste the output:
```bash
openssl rand -base64 32
```

#### Setting Up Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com).
2. Create a new project (or select an existing one).
3. Navigate to **APIs & Services → Credentials**.
4. Click **"Create Credentials" → "OAuth Client ID"**.
5. Select **"Web application"**.
6. Under **Authorised JavaScript origins**, add:
   - `http://localhost:5002` (dev)
   - `https://yourdomain.com` (prod)
7. Under **Authorised redirect URIs**, add:
   - `http://localhost:5002/api/auth/callback/google` (dev)
   - `https://yourdomain.com/api/auth/callback/google` (prod)
8. Copy the **Client ID** → `GOOGLE_CLIENT_ID`
9. Copy the **Client Secret** → `GOOGLE_CLIENT_SECRET`

---

### 3.5 Transactional Email (Resend)

```env
RESEND_API_KEY=""
```

| Variable | Purpose |
|---|---|
| `RESEND_API_KEY` | API key for sending emails in production via the Resend SDK |

**In development**, emails are intercepted by Mailpit (a local email catcher started by Docker Compose). No Resend key is needed for local development. View captured emails at [http://localhost:8025](http://localhost:8025).

#### Getting a Resend API Key (Production)
1. Go to [resend.com](https://resend.com) and create an account.
2. Navigate to **API Keys** and click **"Create API Key"**.
3. Give it a name (e.g., `healer-prod`) and grant **Full access**.
4. Copy the key (it is only shown once) → `RESEND_API_KEY`.
5. In the Resend dashboard, verify your sending domain under **Domains**. Follow the DNS instructions to add the required TXT and MX records to your domain registrar.

---

### 3.6 File Storage (Cloudflare R2)

```env
R2_BUCKET_NAME="healer-uploads"
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
NEXT_PUBLIC_R2_PUBLIC_URL=""
```

| Variable | Purpose |
|---|---|
| `R2_BUCKET_NAME` | Name of the R2 bucket (you choose this when creating the bucket) |
| `R2_ACCOUNT_ID` | Your Cloudflare Account ID |
| `R2_ACCESS_KEY_ID` | R2 API token Access Key ID |
| `R2_SECRET_ACCESS_KEY` | R2 API token Secret Access Key |
| `NEXT_PUBLIC_R2_PUBLIC_URL` | The public CDN URL for reading files (e.g., `https://pub-xxx.r2.dev`) |

#### Setting Up Cloudflare R2
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) and sign in.
2. In the left sidebar, click **R2 Object Storage**.
3. Click **"Create bucket"**. Name it `healer-uploads`. Choose a region.
4. After creating the bucket, click **"Settings"** inside the bucket and enable **"Public access"** (or use a custom domain). Copy the public URL → `NEXT_PUBLIC_R2_PUBLIC_URL`.
5. Go back to the R2 overview page and click **"Manage R2 API Tokens"**.
6. Click **"Create API Token"**. Give it **Object Read & Write** permissions scoped to your bucket.
7. Copy:
   - **Access Key ID** → `R2_ACCESS_KEY_ID`
   - **Secret Access Key** → `R2_SECRET_ACCESS_KEY`
8. Your **Account ID** is visible in the right sidebar of the Cloudflare dashboard → `R2_ACCOUNT_ID`.

---

## 4. Start the Docker Services

Start all local services (PostgreSQL, Redis, Mailpit) with:

```bash
docker compose up -d
```

Verify they are running:
```bash
docker compose ps
```

You should see 3 containers: `healer_postgres`, `healer_redis`, `healer_mailpit`.

---

## 5. Database Setup

Run migrations and seed the initial data:

```bash
# Push the Drizzle schema to your local database
pnpm db:push

# Seed the super_admin and admin users
pnpm db:seed
```

The seed script creates:
| Email | Password | Role |
|---|---|---|
| `superadmin@healer.app` | `SuperAdmin123!` | `super_admin` |
| `admin@healer.app` | `Admin123!` | `admin` |

> **Change these passwords immediately** after first login in production.

---

## 6. Start the Development Server

```bash
pnpm dev
```

This starts a single Next.js development server at **[http://localhost:5002](http://localhost:5002)**. Both the frontend and the Hono API are served from this single port.

| URL | Purpose |
|---|---|
| `http://localhost:5002` | App (landing page / sign-in) |
| `http://localhost:5002/api/system/health` | API health check |
| `http://localhost:8025` | Mailpit email inbox (dev emails) |

---

## 7. Useful Commands

```bash
# Run all type checks across the monorepo
pnpm typecheck

# Run all tests
pnpm test

# Reset the entire database (drops, recreates, migrates, seeds)
pnpm db:reset

# Open Drizzle Studio (database GUI)
pnpm --filter @healer/db studio

# Generate new migrations after schema changes
pnpm db:generate
```

---

## 8. Deploying to Production (Vercel)

1. Push your code to GitHub.
2. Go to [vercel.com](https://vercel.com) and import your repository.
3. Set the **Root Directory** to `apps/web`.
4. Under **Environment Variables**, add every variable from `apps/web/.env.example` with your production values.
5. Deploy.

> Vercel automatically handles SSL, CDN, and serverless scaling. The Hono backend is deployed as Next.js serverless functions under `/api/*`.

---

## 9. Project Structure Overview

```
healer/
├── apps/
│   ├── web/          ← Next.js 15 App (frontend + API adapter)
│   └── api/          ← Hono backend (transpiled by Next.js)
├── packages/
│   └── db/           ← Drizzle schema, migrations, seed
├── docker-compose.yml
├── turbo.json
├── AGENTS.md         ← AI agent instructions
└── README.md         ← This file
```

---

## 10. Getting Help

- **Better Auth Docs:** [better-auth.com/docs](https://www.better-auth.com/docs)
- **Drizzle ORM Docs:** [orm.drizzle.team](https://orm.drizzle.team)
- **Hono Docs:** [hono.dev](https://hono.dev)
- **Next.js Docs:** [nextjs.org/docs](https://nextjs.org/docs)
- **Upstash Docs:** [upstash.com/docs](https://upstash.com/docs)
- **Resend Docs:** [resend.com/docs](https://resend.com/docs)
- **Cloudflare R2 Docs:** [developers.cloudflare.com/r2](https://developers.cloudflare.com/r2)

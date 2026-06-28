# Novelo

A premium story publishing platform — built with **Next.js 15**, **React 19**, **TypeScript**, **Tailwind CSS v4**, **Prisma**, **Supabase**, **Redis**, and **Docker**.

> Read brilliantly. Write fearlessly.

**Repository:** [github.com/LeafCoreLabs/novelo](https://github.com/LeafCoreLabs/novelo)

---

## Tech Stack

| Layer | Development | Production |
| --- | --- | --- |
| Framework | Next.js 15 (App Router, RSC, Server Actions) | Vercel |
| Database | Docker PostgreSQL or Supabase Postgres | Supabase Postgres |
| ORM | Prisma | Prisma |
| Auth | JWT (custom sessions) | JWT or Supabase Auth |
| Storage | Local disk / MinIO / Supabase Storage | Supabase Storage |
| Cache | In-memory / Redis (Docker) | Upstash Redis |
| Email | Mailpit | Transactional provider |

---

## Supabase setup

Novelo is connected to Supabase project **`bjvrtepxxkfkymbbuggg`** (region: ap-south-1). The schema, seed data, and `novelo-media` storage bucket are already provisioned.

### 1. Copy environment file

```bash
cp .env.example .env
```

### 2. Add secrets from Supabase Dashboard

Open [Project Settings](https://supabase.com/dashboard/project/bjvrtepxxkfkymbbuggg/settings/api):

| Variable | Where to find it |
| --- | --- |
| `SUPABASE_DB_PASSWORD` | Settings → Database |
| `SUPABASE_SERVICE_ROLE_KEY` | Settings → API → `service_role` (server-only) |
| `SUPABASE_ANON_KEY` | Settings → API → `anon` |

### 3. Sync database connection strings

```bash
npm run env:supabase -- YOUR_DATABASE_PASSWORD
```

### 4. Verify connection

```bash
npm install
npm run prisma:generate
npm run db:supabase:verify
npm run dev
```

Health check: http://localhost:3000/api/health (reports database status)

### Seeded admin account

| Email | Password | Role |
| --- | --- | --- |
| `admin@novelo.local` | `password123` | Admin |

Login at `/login?next=/admin` → **Admin** tab.

### Storage

Set `STORAGE_PROVIDER=supabase` and `S3_BUCKET=novelo-media`. Admin uploads go to Supabase Storage when `SUPABASE_SERVICE_ROLE_KEY` is set; otherwise they fall back to `public/uploads/` locally.

---

## Quick start (Docker)

```bash
docker compose up --build
```

| Service | URL |
| --- | --- |
| **Web** | http://localhost:3000 |
| Postgres | localhost:5433 |
| Redis | localhost:6379 |
| MinIO | http://localhost:9000 |
| Mailpit | http://localhost:8025 |

---

## Local development (without Docker app container)

```bash
docker compose up postgres redis minio mailpit minio-setup -d
cp .env.example .env
npm install
npm run prisma:generate
npm run db:seed
npm run dev
```

---

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run env:supabase` | Write Supabase DB URLs into `.env` |
| `npm run db:supabase:verify` | Test Prisma → Supabase connection |
| `npm run db:seed` | Seed demo data |
| `npm run prisma:studio` | Visual DB browser |

---

## Project structure

```
novelo/
├── app/                 # Routes, API, layout
├── components/          # UI, landing, admin
├── lib/                 # prisma, auth, storage, supabase, env
├── services/            # Data services
├── prisma/              # schema + seed
├── scripts/             # Supabase env sync, verify
└── docker/              # Dockerfile + compose
```

---

## Security note

Novelo tables on Supabase currently have **RLS disabled** because Prisma connects with the database password server-side. If you expose tables via the Supabase client (anon key), enable RLS and add policies first. See [Supabase RLS docs](https://supabase.com/docs/guides/database/postgres/row-level-security).

---

## License

Open source — see [LeafCoreLabs/novelo](https://github.com/LeafCoreLabs/novelo).

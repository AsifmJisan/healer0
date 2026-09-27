# AGENTS.md — Healer Project AI Agent Directives

> **This file is the single source of truth for all AI agents working on this codebase.**
> Read this file completely before touching any code. Every rule here is non-negotiable.

---

## 1. Project Identity & Philosophy

**Healer** is a multi-role healthcare SaaS platform. It serves five distinct user types — patients, doctors, researchers, admins, and super admins — each with their own isolated dashboard, navigation, and data access. 

**Core philosophy:** Write code as if it will run in a hospital. Correctness, security, and auditability outweigh brevity. Every feature must be production-ready from the first commit.

---

## 2. Monorepo Map

| Package | Purpose |
|---|---|
| `apps/web` | Next.js 15 App Router — serves frontend AND Hono backend via `api/[[...route]]` |
| `apps/api` | Hono backend — consumed by `apps/web` via `transpilePackages`, NOT a standalone server |
| `packages/db` | Drizzle ORM schema, migrations, seed scripts |

**Critical constraint:** `apps/api/src/index.ts` ends with `export default app`. It has no `serve()` call and runs no standalone process. The Next.js `nodejs` serverless runtime is the host.

---

## 3. Tech Stack Reference

### Frontend
- **Framework:** Next.js 15 (App Router) — `export const runtime = 'nodejs'` on API routes
- **UI:** Shadcn UI + Tailwind CSS v4
- **Client State:** Zustand v5 (ephemeral UI state only)
- **Server State:** TanStack Query v5 (all remote data)
- **Forms:** react-hook-form + Zod + @hookform/resolvers
- **Auth Client:** Better Auth client SDK (`lib/auth-client.ts`)
- **Notifications:** Sonner toasts
- **Icons:** lucide-react

### Backend
- **Framework:** Hono v4 (served via `hono/vercel`)
- **Auth Server:** Better Auth v1
- **ORM:** Drizzle ORM
- **Logging:** Pino + pino-pretty (dev) / Pino JSON (prod)
- **Email Dev:** nodemailer → Mailpit Docker container
- **Email Prod:** Resend SDK
- **Storage:** AWS SDK v3 → Cloudflare R2

### Database & Cache
- **DB:** PostgreSQL (Docker local / Neon cloud)
- **Cache Dev:** ioredis → Docker Redis
- **Cache Prod:** @upstash/redis (HTTP, no TCP — serverless safe)

---

## 4. User Role System

### The Five Roles (Global, Not Tenant-Scoped)
```typescript
type SystemRole = 'patient' | 'doctor' | 'researcher' | 'admin' | 'super_admin';
```

### Role Hierarchy (numeric, higher = more access)
```typescript
const ROLE_HIERARCHY = { patient: 1, doctor: 2, researcher: 3, admin: 4, super_admin: 5 };
```

### Provisioning Rules
| Role | How Created |
|---|---|
| `patient`, `doctor`, `researcher` | Self-registration via `/sign-up` (role selection step) |
| `admin` | Created by `super_admin` from the admin panel only |
| `super_admin` | Database seed script only — never via UI |

### Route Isolation (frontend + middleware)
| Route Prefix | Allowed Roles |
|---|---|
| `/patient/*` | `patient` only |
| `/doctor/*` | `doctor` only |
| `/researcher/*` | `researcher` only |
| `/admin/*` | `admin`, `super_admin` |
| `/super-admin/*` | `super_admin` only |

---

## 5. Architectural Principles (MANDATORY)

### 5.1 Vertical Slice Architecture (Backend)
Every feature module in `apps/api/src/features/` must follow the exact same structure:
```
feature-name/
├── feature-name.route.ts       ← Hono router, middleware, route registration
├── feature-name.controller.ts  ← HTTP handlers (parse context, call service, return JSON)
└── feature-name.service.ts     ← Business logic (pure async functions, no Hono context)
```
- **Controllers** only know about `Context` and response shaping.
- **Services** only know about `db`, business rules, and return plain TypeScript objects.
- **Never put business logic in a route file.** Never put DB calls in a controller.

### 5.2 Server Components by Default (Frontend)
- Every component is a Server Component unless it explicitly requires browser APIs or React hooks.
- Only push `"use client"` to the **leaf node** — the smallest component that actually needs it.
- Never make an entire page `"use client"` if only one child component needs it.

### 5.3 State Ownership (Frontend)
- **Zustand:** Sidebar open/closed, active modal state, theme, ephemeral UI flags.
- **TanStack Query:** ALL server data. Fetching, caching, invalidation, mutations.
- **Never `useState` for server data. Never `useEffect` for data fetching.**

### 5.4 Same-Origin API — No CORS
The Hono API is served at the same origin as Next.js (`/api/*`). There is no cross-origin request. **Do not add CORS middleware.** All fetch calls use `credentials: 'include'`.

### 5.5 Redis Adapter Pattern
`apps/api/src/infra/lib/redis.ts` exports a unified `redis` object. It uses `ioredis` in development and `@upstash/redis` in production. **Never import `ioredis` or `@upstash/redis` directly outside of this file.**

### 5.6 Smart Email Pattern
All email sending goes through `sendSmartEmail(to, subject, html)` in `apps/api/src/infra/lib/auth.ts`. Dev uses Mailpit, prod uses Resend. **Never call `resend.emails.send()` or `nodemailer` directly in feature code.**

---

## 6. Code Quality Standards

### 6.1 TypeScript
- `"strict": true` in all `tsconfig.json` files.
- **No `any` types.** Use `unknown` and type-narrow, or define explicit interfaces.
- All component props must have an explicit `interface Props { ... }` or `type Props = { ... }`.
- All API payloads must have Zod schemas that generate TypeScript types via `z.infer`.

### 6.2 Error Handling
- Every `async` function that does I/O must be wrapped in `try/catch`.
- Backend errors: return structured JSON `{ error: string, message: string }` with appropriate HTTP status codes.
- Frontend mutations: use Sonner `toast.success()` and `toast.error()` in TanStack Query `onSuccess` / `onError` callbacks.
- **Never `console.log` errors in production paths.** Use the Pino logger on the backend.

### 6.3 Guard Clauses
```typescript
// ✅ Correct — guard clauses, early returns
async function getPatient(id: string) {
  if (!id) throw new Error('ID is required');
  const patient = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!patient) return null;
  return patient;
}

// ❌ Wrong — deep nesting
async function getPatient(id: string) {
  if (id) {
    const patient = await db...;
    if (patient) { return patient; }
  }
}
```

### 6.4 Comments
- Comments explain **WHY** a decision was made, not WHAT the code does.
- Complex middleware, business rules, and non-obvious TypeScript patterns must have a docblock.

### 6.5 No Placeholder Code
- **Never write `// TODO:`, `// placeholder`, or `throw new Error('Not implemented')`.**
- Every function, route, and component must be fully functional when committed.

---

## 7. Frontend UI Consistency Rules (STRICT)

### 7.1 Reuse Existing Components
If a UI pattern (button, input, card, nav link, modal) exists in `components/ui/` or `components/layout/`, **use it**. Never create an ad-hoc styled `<button>` or `<div>` that duplicates an existing component's behavior.

### 7.2 Navigation Links — Always Use `<SidebarNavLink>`
All navigational links in the sidebar must use the `<SidebarNavLink>` component. Never write a raw `<Link>` or `<a>` tag for navigation items. This guarantees identical active indicators, hover states, and spacing across all 5 dashboards.

### 7.3 Layout — Follow Sibling Pattern
When creating a new `layout.tsx`, inspect how sibling layouts in the same route group are structured and replicate the exact same pattern. Do not invent a new layout pattern.

### 7.4 No Layout Shifting
**Zero layout shift is permitted anywhere.** Use:
- `visibility: hidden` / `opacity-0 pointer-events-none` instead of conditional rendering that removes elements.
- Fixed heights or `min-h-*` for loading states.
- Skeleton loaders that match the exact dimensions of the loaded content.

### 7.5 Modals for Secondary Input
Use blurred-background dialog modals (Shadcn `<Dialog>`) for secondary inputs (confirmations, forms, 2FA). Never use expanding inline cards.

### 7.6 Role-Aware Sidebar
The sidebar generates its navigation using a `getSidebarNav(role: SystemRole)` utility. The shared `<Sidebar>` component calls this utility and renders the appropriate links. Never hardcode role-specific nav items directly in layout files.

---

## 8. Database Conventions

### 8.1 ID Generation
All primary keys are `text` columns with UUIDs generated by `crypto.randomUUID()` via Drizzle's `.$defaultFn()`.

### 8.2 Timestamps
```typescript
createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull().$onUpdate(() => new Date()),
```

### 8.3 Inferred Types
Export TypeScript types below every table definition:
```typescript
export type Patient = typeof patientProfiles.$inferSelect;
export type NewPatient = typeof patientProfiles.$inferInsert;
```

### 8.4 Queries
- Always use `db.query.*` (Drizzle relational API) for reads with relations.
- Use `db.insert`, `db.update`, `db.delete` for writes.
- Never write raw SQL unless absolutely necessary. When raw SQL is needed, use `sql` tagged template from `drizzle-orm`.

---

## 9. File Naming Conventions

| Pattern | Example |
|---|---|
| Route files | `patients.route.ts` |
| Controller files | `patients.controller.ts` |
| Service files | `patients.service.ts` |
| React components | `patient-profile-card.tsx` (kebab-case) |
| Hooks | `use-patient-data.ts` |
| Stores | `use-sidebar-store.ts` |
| API lib files | `lib/api/patients.ts` |
| Zod schemas | Collocated in the feature's route or service file |

---

## 10. Security Checklist (Run Mentally Before Every PR)

- [ ] No sensitive data in `NEXT_PUBLIC_*` variables (only URLs/flags intended for the browser).
- [ ] Every protected Hono route has `requireAuth` and `requireActiveAccount` middleware.
- [ ] Role-protected routes have `requireRole(minimumRole)` middleware.
- [ ] All user inputs are validated with Zod before hitting the database.
- [ ] Passwords are never stored in plain text (Better Auth handles hashing).
- [ ] No API keys, secrets, or credentials committed to Git.
- [ ] `apps/web/.env.local` is in `.gitignore`.

---

## 11. Running the Project (Quick Reference)

```bash
# 1. Start Docker services (Postgres, Redis, Mailpit)
docker compose up -d

# 2. Install dependencies
pnpm install

# 3. Run DB migrations + seed
pnpm db:push && pnpm db:seed

# 4. Start development server (Next.js serves everything on port 5002)
pnpm dev

# URLs:
# App:     http://localhost:5002
# API:     http://localhost:5002/api
# Health:  http://localhost:5002/api/system/health
# Mailpit: http://localhost:8025
```

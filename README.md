# LabShare (लैबशेयर) – Rural School & Community Lab Network

[![CI](https://github.com/labshare/labshare/actions/workflows/ci.yml/badge.svg)](https://github.com/labshare/labshare)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![NestJS 10](https://img.shields.io/badge/NestJS-10.3-red.svg)](https://nestjs.com/)
[![PostgreSQL 16](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)

> **"Every science lab deserves curious students."**  
> Well-equipped schools (Navodaya Vidyalayas, Kendriya Vidyalayas, elite private schools) have science labs, computer labs, and robotics workshops that sit empty after school hours, on weekends, and during holidays. Nearby rural schools and underfunded coaching circles have students who need them. **LabShare** safely connects them with first-class safety, cryptographic auditability, and transparent trust metrics.

---

## 🚀 Quickstart (Running in < 5 Minutes)

### Prerequisites
- Node.js >= 20.0
- pnpm >= 9.0 (`npm install -g pnpm`)
- Docker & Docker Compose (optional; the app features a pre-loaded in-memory database adapter and runs with zero external services!)

### 1. Install Dependencies
```bash
git clone https://github.com/your-org/labshare.git
cd labshare
pnpm install
```

### 2. Launch Development Environment
```bash
# Starts both Backend API (Port 3001) and Frontend Web App (Port 3000) concurrently
pnpm dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser!

### 3. Quick Demo Login Credentials (Preloaded in Demo Mode)
| Role | Name | Phone | Demo OTP | Default Dashboard |
| :--- | :--- | :--- | :--- | :--- |
| **Teacher Sponsor** | Sunita Sharma (NGO Lead) | `9000000005` | `123456` | `/labs` (Discovery & Wizard) |
| **Lab In-Charge** | Vikram Singh (JNV Manager) | `9000000003` | `123456` | `/manager/inbox` (SSE Requests) |
| **School Owner** | Dr. R. K. Mishra (Principal) | `9000000002` | `123456` | `/owner/labs` (Rules Builder) |
| **Platform Admin** | Platform Administrator | `9000000001` | `123456` | `/admin/audit` (Hash Verifier) |

---

## 🏛️ Monorepo Structure

```
/apps
  /web            # Next.js 14 (App Router) + Tailwind + Bilingual EN/HI + PWA
  /api            # NestJS 10 REST API + OpenAPI 3 + Realtime SSE + Ports & Adapters
/packages
  /shared         # Domain logic: Rules Engine, State Machine, Trust Score, Cryptographic Audit
/db
  /prisma         # PostgreSQL schema (PostGIS + btree_gist extensions)
  /migrations     # SQL triggers (immutable audit enforcement & exclusion constraints)
  /seeds          # Realistic Bundelkhand dataset (Navodaya, DPS, 5 NGOs, 8+ labs)
/infra
  /docker         # Dockerfiles for api and web
  docker-compose  # PostgreSQL 16 + PostGIS, Redis 7, MinIO S3
/docs
  architecture.md # Mermaid architecture, ER diagrams, threat model
  demo-script.md  # 3-minute scripted judge walkthrough
  /pitch          # Executive one-pager, 8-slide deck, and differentiators
```

---

## 🎯 Tech Stack & Architectural Decisions

- **Frontend:**
  - **Next.js 14 App Router + TypeScript + Tailwind CSS:** Delivers server-rendered initial loads with minimal client JavaScript (87.3 KB shared chunk), crucial for rural 2G/3G connectivity.
  - **Bilingual Context (English & हिंदी):** Instant language toggle on every screen with Hindi-first accessibility for rural headmasters.
  - **Installable PWA:** Mobile-first offline caching for visiting QR passes.
  - **Recharts & Leaflet / OpenStreetMap:** Zero paid API keys required.
- **Backend:**
  - **NestJS 10 + TypeScript:** Clean modular architecture with strict separation of concerns (`controllers -> services -> domain -> storage adapters`).
  - **OpenAPI 3 / Swagger:** Live interactive documentation at `http://localhost:3001/docs`.
  - **Realtime SSE:** Server-Sent Events stream for instant manager request notifications without polling.
- **Database & Storage:**
  - **Dual Adapter Architecture:** Runs with full persistence on **PostgreSQL 16 + PostGIS** via Prisma ORM, OR switches seamlessly to the preloaded **In-Memory Adapter** for zero-dependency local review.
  - **Database Exclusion Constraints (`btree_gist`):** Makes concurrent double-booking mathematically impossible at the database engine storage level.
  - **Cryptographic SHA-256 Audit Ledger:** Every state change links to the prior hash, with SQL triggers blocking `UPDATE` and `DELETE`.

---

## 🧪 Testing Suite & Quality Assurance

All domain modules and API workflows are unit and integration tested:

```bash
# Run domain layer unit tests (Rules Engine, State Machine, Availability, Trust Score, Audit Chain)
pnpm --filter @labshare/shared test

# Run API end-to-end integration and concurrency tests
pnpm --filter @labshare/api test

# Full typecheck across monorepo
pnpm typecheck

# Full production build
pnpm build
```

---

## 📋 3-Minute Judging Walkthrough

Follow the scripted guide in **[`docs/demo-script.md`](file:///Users/shivgupta/Desktop/%20Rural%20Scool%20and%20Lab%20Collabrator/docs/demo-script.md)**:
1. **Minute 1 (Sponsor):** Sunita ji discovers JNV Physics Lab, inputs 24 students, and watches the Rules Engine instantly evaluate 10 safety invariants in bilingual plain language.
2. **Minute 2 (Manager):** Vikram ji receives the realtime request, reviews trust metrics, approves it, and conducts Day-of arrival check-in via 6-digit OTP code `729415`.
3. **Minute 3 (Auditor & Impact):** Platform Admin cryptographically validates the SHA-256 hash chain with one click (`✓ Chain Valid & Intact`), and the Public Impact Dashboard reflects 420+ verified shared lab hours.

---

## 🚢 Production Deployment

### Docker Deployment
```bash
# Starts PostgreSQL, Redis, MinIO, API, and Web containers
docker compose up -d
```

### Cloud Ready
- **Frontend (`/apps/web`):** Deploy to Vercel with zero config (`npm run build`).
- **Backend (`/apps/api`):** Deploy to Render or Railway with `PORT=3001` and `DATABASE_URL`.

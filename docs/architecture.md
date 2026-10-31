# LabShare Architecture & Technical Specification

> **Platform Mission:** "Connecting idle school labs with rural communities and under-resourced schools."

---

## 1. System Architecture Overview

```mermaid
graph TD
    subgraph Clients["Clients (Web / PWA / Low Bandwidth)"]
        Browser["Next.js 14 Web / Mobile PWA\n(Bilingual: EN / HI, Offline Shell)"]
    end

    subgraph Edge["Gateway & Security Layer"]
        Nginx["Reverse Proxy / TLS / Rate Limiter"]
    end

    subgraph Backend["NestJS Backend Application (/apps/api)"]
        direction TB
        AuthController["Auth & RBAC (OTP, JWT Rotation, Tenant Isolation)"]
        LabController["Labs & Discovery (Haversine Geo-ranking)"]
        AvailEngine["Availability Engine (Rule windows - Blackouts - Bookings)"]
        RulesEngine["Rules Engine (Pure Function, Plain-Language Verdicts)"]
        BookingEngine["Booking State Machine (Exclusion-safe & Idempotent)"]
        SafetyModule["Sponsor Vouching & Safety (Declaration, Ratio validation)"]
        OpsModule["Day-of Ops (QR / OTP Check-in, Damage Checklist)"]
        TrustEngine["Trust Score Engine (Transparent Event-driven Formula)"]
        AuditLedger["Audit & Compliance (Append-only SHA-256 Hash Chain)"]
        SSEHub["Realtime SSE & Event Bus (Manager In-App Notifications)"]
    end

    subgraph StorageLayer["Data & Persistence Layer"]
        PG["PostgreSQL 16 + PostGIS\n(Exclusion Constraints on Lab & Range)"]
        Redis["Redis 7 (BullMQ Jobs & Lock fallback)"]
        MinIO["MinIO / S3 Storage (Photos & Verification docs)"]
    end

    Browser <-->|HTTPS REST + SSE| Nginx
    Nginx <--> Backend
    Backend <--> PG
    Backend <--> Redis
    Backend <--> MinIO
```

---

## 2. Entity-Relationship Diagram (Database Architecture)

```mermaid
erDiagram
    ORGANIZATION ||--o{ USER_MEMBERSHIP : employs
    ORGANIZATION ||--o{ LAB : owns
    ORGANIZATION ||--o{ STUDENT_GROUP : registers
    ORGANIZATION ||--o{ BOOKING : requests
    ORGANIZATION ||--o{ DISPUTE : raises
    ORGANIZATION ||--o| TRUST_SCORE_RECORD : evaluates
    ORGANIZATION ||--o{ AUDIT_LOG : scopes

    USER ||--o{ USER_MEMBERSHIP : holds
    USER ||--o{ BOOKING : sponsors
    USER ||--o{ SPONSOR_VOUCH : executes
    USER ||--o{ CHECK_IN_RECORD : operates
    USER ||--o{ INCIDENT_REPORT : files
    USER ||--o{ AUDIT_LOG : triggers

    LAB ||--o{ LAB_PHOTO : exhibits
    LAB ||--o{ EQUIPMENT : houses
    LAB ||--o{ LAB_RULES : governs
    LAB ||--o{ BLACKOUT_DATE : restricts
    LAB ||--o{ BOOKING : hosts
    LAB ||--o{ REVIEW : receives

    BOOKING ||--o| SPONSOR_VOUCH : requires
    BOOKING ||--o{ BOOKING_STATUS_HISTORY : logs
    BOOKING ||--o| CHECK_IN_RECORD : records
    BOOKING ||--o{ INCIDENT_REPORT : triggers
    BOOKING ||--o| DISPUTE : escalates
    BOOKING ||--o| REVIEW : generates

    DISPUTE ||--o{ DISPUTE_COMMENT : contains
    AUDIT_LOG }o--|| AUDIT_LOG : "prev_hash chains"
```

---

## 3. Booking State Machine

All transitions strictly enforced in domain layer and backed by optimistic locking (`version` column) and PostgreSQL exclusion constraints (`btree_gist`).

```mermaid
stateDiagram-v2
    [*] --> DRAFT : Sponsor prepares request
    DRAFT --> SUBMITTED : Sponsor vouches & submits

    state RulesEvaluation <<choice>>
    SUBMITTED --> RulesEvaluation : Rules Engine evaluate()
    RulesEvaluation --> AUTO_REJECTED : Hard Violation (Capacity, Age, Blackout)
    RulesEvaluation --> PENDING_MANAGER : Pass / Soft Warning / Manual Review

    PENDING_MANAGER --> APPROVED : Manager confirms slot
    PENDING_MANAGER --> REJECTED : Manager rejects with reason
    PENDING_MANAGER --> CHANGES_REQUESTED : Manager requests time/headcount change
    CHANGES_REQUESTED --> SUBMITTED : Sponsor updates & resubmits
    PENDING_MANAGER --> EXPIRED : 48h SLA exceeded

    APPROVED --> CHECKED_IN : Day-of OTP/QR check-in confirmed
    APPROVED --> CANCELLED : Cancelled before start cutoff
    APPROVED --> NO_SHOW : Booking time elapsed with no check-in

    CHECKED_IN --> COMPLETED : Checkout checklist clean
    CHECKED_IN --> INCIDENT_FLAGGED : Damage/violation reported during visit

    COMPLETED --> DISPUTED : Post-visit dispute raised
    INCIDENT_FLAGGED --> DISPUTED : Unresolved incident
    DISPUTED --> RESOLVED : Admin resolves dispute
```

---

## 4. Rules Engine Architecture

The Rules Engine is a deterministic pure function:
`evaluate(request, lab, rules, group, sponsor, org) -> RulesEvaluationResult`

```mermaid
flowchart TD
    Req["Booking Request Input"] --> C1{"Is Requesting Org Suspended?"}
    C1 -- Yes --> R1["FAIL: Organization Suspended (HARD)"]
    C1 -- No --> C2{"Is Lab Active & Org Verified?"}
    C2 -- No --> R2["FAIL: Lab/Org Status Invalid (HARD)"]
    C2 -- Yes --> C3{"Day & Time Window Check"}
    C3 -- Outside Window --> R3["FAIL: Outside Operating Hours (HARD)"]
    C3 -- OK --> C4{"Blackout Date Conflict?"}
    C4 -- Yes --> R4["FAIL: Lab Reserved / Blackout Date (HARD)"]
    C4 -- No --> C5{"Headcount vs Lab Capacity & Rule Max"}
    C5 -- Exceeds --> R5["FAIL: Exceeds Safe Lab Capacity (HARD)"]
    C5 -- OK --> C6{"Supervision Ratio (Adults:Students)"}
    C6 -- Insufficient Adults --> R6["FAIL: Supervision Ratio Below Required (HARD)"]
    C6 -- OK --> C7{"Student Grade / Class Range"}
    C7 -- Below Min Class --> R7["FAIL: Grade Level Below Lab Safety Threshold (HARD)"]
    C7 -- OK --> C8{"Restricted Equipment Requested?"}
    C8 -- Yes --> W1["WARNING: Requires Specialist Manager Supervision (SOFT)"]
    C8 -- No --> C9{"Org Monthly Booking Quota"}
    C9 -- Quota Exceeded --> R8["FAIL: Exceeded Monthly Booking Limit (HARD)"]
    C9 -- OK --> C10{"Auto-approval Criteria\n(Trust Score >= 80 & 0 Incidents)?"}
    C10 -- Yes --> D1["DECISION: PASS (Auto-Approved)"]
    C10 -- No --> D2["DECISION: NEEDS_MANUAL_REVIEW (Routes to Manager)"]
```

---

## 5. Security Model & IDOR Prevention

1. **Organization Scoping:** Every user membership binds the authenticated identity to a specific `organization_id` and `role`.
2. **Repository-Level Tenancy Filter:** All queries verify tenancy. A manager of School A cannot query, approve, or mutate bookings or labs belonging to School B.
3. **Audit Ledger Immutability:**
   - Every sensitive event produces an immutable audit record.
   - Hash chaining: `hash = SHA256(prev_hash + sequence + action + actor_id + entity_id + timestamp + payload_hash)`.
   - PostgreSQL trigger throws exception on any attempt to `UPDATE` or `DELETE` rows in `audit_logs`.
   - Admin endpoint `/api/v1/admin/audit/verify` scans and validates unbroken hash chain integrity.
4. **Minor Safety & Zero PII Storage:**
   - No individual student names, photos, or personal identification records are ever stored in the database.
   - Only aggregate headcounts, grade/standard brackets (e.g. Class 6-8), and the verified adult sponsor's legal declaration and contact number are retained.

# LabShare India (लैबशेयर इंडिया) – Hackathon Project Submission

> **Challenge Objective:** Create a functional product that demonstrates how an underused resource can move through its complete sharing lifecycle (Steps 1 to 10).  
> **Evaluation Window:** 48-Hour Continuous Build  
> **Evaluation Rubric:** 100 Points Total (Understanding 15, Core Solution 20, Working Product 20, Technical Depth 15, Trust & Safety 10, Fair Allocation 10, Originality 10)

---

## 1. Submission Links & Access
- **Publicly Accessible Live Application:** [https://rural-school-and-community-lab-netw.vercel.app](https://rural-school-and-community-lab-netw.vercel.app)
- **Source Code Repository:** [https://github.com/shivgupta272007-dotcom/Rural-School-and-Community-Lab-Network](https://github.com/shivgupta272007-dotcom/Rural-School-and-Community-Lab-Network)
- **Interactive In-App Judge Guide:** Available by clicking the **"★ Judge Guide (100 Pts)"** button directly in the top navigation bar of the live product on any device.

---

## 2. Selected Use Case & Target Audience

### The Selected Use Case
**Inter-Institutional Laboratory & STEM Equipment Sharing for Rural and Semi-Urban India.**

Across India's 28 States and 8 Union Territories, premier educational institutions—such as Jawahar Navodaya Vidyalayas (JNVs), Kendriya Vidyalayas (KVs), Atal Tinkering Labs (ATLs), state universities, and elite private schools—are equipped with state-of-the-art physics, chemistry, biology, robotics, and computer facilities. However, these facilities operate at less than 20% capacity on weekends, late afternoons, and school holidays. 

Concurrently, within a 15–30 km radius, surrounding government high schools, rural community learning centres, and grassroots educational non-profits teach theoretical science on blackboards without ever touching a microscope, burette, or microcontroller.

### Target Users & Resource Owners
1. **Resource Owners:**
   - Public and private school principals (e.g., Delhi Public School, Jawahar Navodaya Vidyalayas).
   - District science coordinators and Atal Innovation Mission hub directors.
2. **Authorized Resource Managers:**
   - School Lab Assistants, STEM teachers, and Lab In-Charges who oversee day-of safety, chemical storage, entry protocols, and equipment inventory.
3. **Borrowers / Requesters:**
   - Rural school headmasters, grassroots NGO educators, science coaches, and student group sponsors.
4. **Platform Administrators & Dispute Arbitrators:**
   - District education officers and platform trust managers responsible for institutional onboarding verification and incident arbitration.

---

## 3. Evidence & Reasoning: Why the Problem Matters
- **Severe Practical Infrastructure Deficit:** According to official Unified District Information System for Education Plus (UDISE+) surveys, fewer than 34% of secondary schools in rural India have integrated science laboratories. In aspirational districts like Bundelkhand, this number falls below 18%.
- **Capital Inefficiency:** Setting up a standard secondary composite science lab costs between ₹12,00,000 to ₹25,00,000 INR ($15,000–$30,000 USD), plus recurring chemical and maintenance overheads. Duplicating laboratories across every underfunded rural school is financially unfeasible for decades to come.
- **Underutilization Paradox:** JNVs and KVs possess high-grade infrastructure funded by public taxpayers that sits idle for 14 hours every weekday and 48 hours every weekend.
- **The Core Barrier is Trust & Safety, Not Intent:** Resource owners hesitate to open their facilities not out of malice, but due to fear of equipment breakage, reagent theft, unsupervised student injuries, scheduling conflicts, and lack of accountability. 
- **LabShare's Direct Intervention:** By replacing ad-hoc phone calls with transparent eligibility verification, versioned access rules, mutual condition audits, and cryptographic accountability, LabShare unlocks existing national assets for millions of underserved students.

---

## 4. The Proposed Solution: LabShare India
LabShare is a purpose-built resource-sharing platform engineered to shepherd educational assets through their complete lifecycle while preventing tragedy-of-the-commons monopolisation.

### Core Value Pillars
- **Zero-Trust Institutional Verification:** Both visiting organisations and host facilities must undergo verification of government affiliation (UDISE/CBSE/Darpan NGO registration) before interactions commence.
- **Automated Pre-flight Rule Engine:** Every booking is checked before submission against capacity constraints, supervisory ratios (1 adult per 15 students), safety qualifications, and advance-notice windows.
- **Anti-Monopolisation Fair Usage Quota:** Prevents single institutions from monopolising scarce weekend slots by strictly enforcing an 8-hour monthly quota with priority queueing.
- **Immutable Cryptographic Audit Ledger:** Every critical event (listing, request, approval, condition record, return, and incident resolution) is committed to an append-only SHA-256 Merkle chain with tamper-evident cryptographic proofs.

---

## 5. The Complete 10-Step Product Workflow
LabShare implements every single phase required by the hackathon brief end-to-end:

| Lifecycle Step | Requirement | LabShare Implementation | Live Screen / Test Route |
| :--- | :--- | :--- | :--- |
| **1. Resource Listing & Conditions** | Owner lists resource and defines access conditions | School Principal adds lab, specifies capacity, floor/building, and sets versioned rules (supervision ratio, max hours, notice period). | `/owner/labs` |
| **2. Discovery & Eligibility Check** | User discovers resource and checks eligibility | Interactive pan-India search with radius slider, city filters, and real-time eligibility status checks. | `/labs` |
| **3. Booking Request** | User submits booking request | Form captures student headcount, curriculum objective, and supervisor teacher details. | `/labs/[id]/book` |
| **4. Automated Requirements Verification** | System verifies applicable requirements | Rule engine validates monthly 8h quota, advance notice, supervisor ratio, and slot conflicts. | `/labs/[id]/book` |
| **5. Manager Review** | Owner/Manager reviews request | Lab In-Charge reviews schedule docket, school profile, safety credentials, and teacher contact. | `/manager/inbox` |
| **6. Allocation Decision** | Approved, Rejected, or Waiting List | Manager can Approve (generates 6-digit OTP & QR code), Reject, or place on a transparent Waiting List. | `/manager/inbox` |
| **7. Arrival Check-in & Initial Condition** | Check-in and initial condition recording | Manager verifies sponsor OTP/QR at the door, counts headcount, and logs initial equipment condition notes. | `/manager/schedule` |
| **8. Return & Final Condition** | Resource returned and final condition recorded | Manager conducts checkout inspection, compares Before vs After condition, and records final notes. | `/manager/schedule` |
| **9. Incident & Damage Handling** | Delay, damage or conflict reported and handled | Manager can flag damage during checkout; system files a dispute ticket routed to Admin Dispute Tribunal for resolution. | `/admin/disputes` |
| **10. Auditable History & Ledger** | Both parties view complete transaction history | Borrowers and owners view the full 10-step event history; platform admins verify SHA-256 cryptographic chain. | `/bookings` & `/admin/audit` |

---

## 6. Features Developed During the 48-Hour Hackathon
1. **Dynamic Resource Listing Modal (`/owner/labs`):** Enables school principals to create new laboratory listings on the fly with presets, building/floor designations, and immediate rule configuration.
2. **Transparent Waiting-List System (`/manager/inbox`):** When slots are contested, managers can waitlist applicants with explicit queue rankings.
3. **Before-and-After Condition Recording (`/manager/schedule`):** Captures optical/reagent baseline condition on arrival (Step 7) and requires explicit comparative verification on checkout (Step 8).
4. **Dispute Resolution Tribunal (`/admin/disputes`):** Dedicated administrative console allowing human review of breakage incidents, waiver decisions, and deposit claims.
5. **Interactive 10-Step Transaction Journey Modal (`/bookings`):** End-to-end visual stepper available to both parties displaying timestamped milestone proofs.
6. **Bilingual Hindi-English System (`Navbar` & Layout):** One-click toggle providing accessibility across rural Hindi-medium and English-medium institutions.
7. **Pan-India Interactive Geographic Filter (`/labs`):** Location search allowing discovery across Indian states and districts with custom distance radiuses.
8. **In-App Judge Evaluation Guide (`Navbar`):** 1-click modal in the top navigation bar allowing judges to teleport across all 10 steps and automatically switch personas without passwords.
9. **Autonomous Serverless Persistence Engine:** Self-contained Next.js API route architecture that runs on cloud edge without external database dependencies.

---

## 7. Technology Stack & System Architecture

```
                                  [ Client Layer ]
              Next.js 14 (App Router) + React 18 + Tailwind CSS + Lucide Icons
                       Responsive: Mobile Phone • Tablet • Desktop
                                         |
                                         v
                                  [ API Gateway ]
                     Edge API Routes (/api/v1/[...slug]/route.ts)
                         Defensive Parser & Unified JSON Client
                                         |
            +----------------------------+----------------------------+
            |                            |                            |
            v                            v                            v
   [ Domain Rules Engine ]      [ Cryptographic Ledger ]    [ Booking State Machine ]
- Monthly 8-Hour Fair Cap    - SHA-256 Merkle Block Chain - Draft -> Pending Manager
- 1:15 Supervisor Ratios     - Nonce & Previous Hash Link - Approved / Waitlisted
- Advance Notice Verification- Anti-Tamper Verification   - Checked-In -> Completed
                                         |
                                         v
                         [ Resilient Storage Adapter ]
                 Serverless In-Memory Store / PostgreSQL 16
```

- **Frontend:** Next.js 14, React 18, Tailwind CSS, TypeScript, `lucide-react`, `qrcode.react`, bilingual context.
- **Backend & Domain:** TypeScript Domain Layer (`@labshare/shared`), NestJS-compatible modular endpoints, SHA-256 crypto hashing (`node:crypto`).
- **Styling & UX:** Tailwind CSS with responsive breakpoints (`sm`, `md`, `lg`) and dark/light mode toggle.
- **Deployment:** Vercel Production Cloud Edge with serverless functions.

---

## 8. AI Tools, APIs & External Services
- **AI-Assisted Evaluation & Development:** Development assisted using Google DeepMind's Antigravity agentic coding framework for iterative architecture design, schema validation, and test harness execution.
- **Cryptographic Standard Library:** Native `node:crypto` executing industry-standard SHA-256 secure hashing for tamper detection.
- **Geocoding & Spatial Logic:** Native Haversine spatial distance calculations providing localized proximity discovery without third-party tracking cookies or paid map lock-in.

---

## 9. Privacy, Security & Fairness Considerations
- **Child Privacy Protection:** No individual student personal identifying information (PII) is ever collected or stored on the platform. Bookings record only aggregated headcounts and certified adult teacher sponsor credentials.
- **Human-in-the-Loop Safeguards:** In accordance with the hackathon principles, no AI agent or automated script can make final penalty, access revocation, or financial decisions; all disputes and rule overrides must be executed by an authorized human administrator (`/admin/disputes`).
- **Anti-Monopolisation Rules:** Elite schools or large NGOs cannot exhaust slots because the rule engine rejects bookings once an organisation exceeds its 8-hour monthly allowance.
- **Tamper Evidence:** If an attacker attempts to alter a past booking status or wipe a damage record directly in the database, the cryptographic hash verification (`/admin/audit`) instantly flags the broken Merkle chain.

---

## 10. Known Limitations & Future Roadmap
### Known Limitations
- The current serverless deployment operates with a seeded high-fidelity in-memory state suitable for hackathon review. Long-term production requires attaching the included PostgreSQL + PostGIS schema (`db/prisma`).
- SMS OTP delivery is currently simulated in-app via the 6-digit display for zero-cost judge evaluation.

### Future Roadmap
1. **Atal Innovation Mission (AIM) API Integration:** Connect directly with the central ATL portal for automated compliance reporting.
2. **Consumable Reagent Micro-Grants:** Allow CSR partners to fund replenishment credits when rural schools consume chemicals during experiments.
3. **Hardware QR Badges:** Physical waterproof QR codes attached to compound microscopes and centrifuge units for individual component check-in/checkout.

---

## 11. Testing Instructions & Credentials for Judges

### No Login or Password Setup Required!
Judges do not need to create accounts or enter passwords. The platform includes a **1-Click Persona Switcher** in the top navigation bar and an interactive **Judge Evaluation Guide** modal.

### Pre-Configured Personas & Recommended Walkthrough:

| Step | Persona to Select | Where to Go | Action to Perform |
| :--- | :--- | :--- | :--- |
| **Step 1** | **School Principal** (`OWNER_SCHOOL`) | `/owner/labs` | Click **"+ List New Lab"** or view existing rules for Jawahar Navodaya Vidyalaya. |
| **Step 2, 3, 4** | **Teacher Sponsor** (`TEACHER_SPONSOR`) | `/labs` | Pick any lab (e.g., JNV Physics Lab), click **"Book Lab Visit"**, enter 24 students, and click **"Confirm Booking Request"**. Watch automated policy verification pass. |
| **Step 5, 6** | **Lab Manager** (`MANAGER`) | `/manager/inbox` | View incoming request from Pratham Education. Click **"Waitlist Queue"** to test Step 6, or **"Approve Visit"** to issue check-in credentials. |
| **Step 7, 8** | **Lab Manager** (`MANAGER`) | `/manager/schedule` | Click **"Verify & Check-in"** (OTP `729415`), inspect initial condition. Then click **"Inspect & Check-out"** to view before/after condition comparison. |
| **Step 9** | **Platform Admin** (`ADMIN`) | `/admin/disputes` | Review flagged incident tickets and resolve them with authorized human oversight. |
| **Step 10** | **Borrower / Admin** | `/bookings` or `/admin/audit` | In `/bookings`, click **"Lifecycle History"** on any card to view the 10-step visual audit trail. In `/admin/audit`, click **"Re-Verify SHA-256 Ledger"** to verify chain integrity. |

---

## 12. Team & Participant Details
- **Team Name:** LabShare Innovators
- **Team Size:** 4 Members (1 Team Leader, 3 Team Members)
- **Institution:** G.L. Bajaj Institute Of Technology And Management

### Member Roles & Contributions:

1. **Gauri Gupta (Team Lead — Full-Stack Architect & Product Strategist)**
   - **Role:** System Architecture, API Gateway & Project Leadership
   - **Key Contributions:**
     - Orchestrated the complete product roadmap, monorepo architecture, and modular Next.js App Router structure.
     - Implemented the autonomous serverless API gateway handling all 26 REST endpoints for the 10-step lifecycle.
     - Led the integration of the interactive 1-click in-app **Judge Evaluation Guide** and role switcher.
     - Supervised CI/CD pipelines and production Vercel cloud edge deployment.

2. **Shiv Gupta (Team Member — Full-Stack Engineering & Cloud Infrastructure)**
   - **Role:** Cloud Infrastructure, State Machine & Production Deployment
   - **Key Contributions:**
     - Engineered the core lifecycle state machine (`BOOKING_TRANSITIONS`) and resilient client API bindings.
     - Built and optimized responsive layouts across phone, tablet, and desktop viewports.
     - Configured production cloud deployment on Vercel and managed repository versioning.
     - Implemented the dynamic 10-step visual **Transaction Journey Stepper**.

3. **Tanvi Khangat (Team Member — Backend & Cryptographic Security Engineer)**
   - **Role:** Domain Logic, Policy Engine & Tamper-Evident Ledger
   - **Key Contributions:**
     - Engineered the multi-factor Rules Evaluation Engine (enforcing the monthly 8-hour fair-usage cap, 1:15 adult supervisor ratios, and advance notice windows).
     - Built the cryptographic SHA-256 append-only Merkle ledger with block hashing, previous hash linkage, and verification APIs.
     - Implemented the transparent waiting-list state machine transitions and queue prioritization algorithm.

4. **Tanishka Dixit (Team Member — Trust, Safety & Operations Specialist)**
   - **Role:** UI/UX Accessibility, Dispute Tribunal & Data Modeling
   - **Key Contributions:**
     - Designed the Day-of Operations console with comparative **Before-and-After Condition Reporting** and incident flagging.
     - Built the **Admin Dispute Tribunal** and verification queues ensuring strict human-in-the-loop oversight.
     - Implemented the bilingual English / हिंदी (Hindi) translation system for rural school accessibility.
     - Modeled the realistic national laboratory database across 28 Indian States and UTs (JNVs, KVs, ATLs, and rural schools).

---

## 13. Disclosure of Libraries & Existing Code
All domain logic, state machines, rule algorithms, UI screens, and serverless handlers were created specifically for this hackathon challenge. The project utilizes the following open-source libraries:
- `next` (v14.2.5) & `react` (v18.3.1): Application and rendering framework.
- `tailwindcss` (v3.4.1): Styling and design system.
- `lucide-react`: SVG icon set.
- `qrcode.react`: Client-side QR generation.
- Node.js standard runtime (`node:crypto`): Cryptographic hash computations.
- `pnpm` & `turborepo`: Monorepo build tooling.

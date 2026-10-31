# LabShare – 3-Minute Live Demo Script & Walkthrough

This document outlines the scripted 3-minute judging demonstration showing the full loop of LabShare across three personas:
1. **Teacher Sponsor** (Sunita Sharma, Bundelkhand Shiksha Samiti NGO)
2. **Lab Manager** (Vikram Singh, Jawahar Navodaya Vidyalaya Barwa Sagar)
3. **Platform Administrator** (Auditor / State Compliance Lead)

---

## ⏱️ Act 1: Discovery & Instant Rules Engine Feedback (Minute 1)

1. **Sign In & Persona Setup:**
   - Navigate to `http://localhost:3000/auth/login`.
   - Click the 1-click **Teacher Sponsor** card (`9000000005`). Preloaded demo OTP is `123456`.
   - The user is logged in as Sunita Sharma from **Bundelkhand Shiksha Samiti (Rural NGO)**.

2. **Discover Labs:**
   - Click **Find Labs** (`/labs`).
   - The catalog lists 8+ participating labs around Jhansi.
   - Filter by **"Science Lab"**.
   - Note the nearest facility: **Dr. C.V. Raman Physics Laboratory** at JNV Barwa Sagar (Distance: ~12 km, Trust Score: 98/100, Capacity: 36).
   - Click **Check Slots** to view the lab details page (`/labs/c0000000-0000-0000-0000-000000000001`).

3. **Booking Wizard & Realtime Rules Engine:**
   - Click **Start Booking Wizard** (`/labs/.../book`).
   - **Step 1:** Select Student Group: *"Class 8 Bundelkhand Vigyan Dal"* (24 students). Notice safe headcount is within the 36-student cap. Click Next.
   - **Step 2:** Pick Slot: Date `2026-11-06` (Friday), Time `15:30` - `17:30` (within 15:00-18:30 operating hours). Click Next.
   - **Step 3:** Teacher Sponsor Digital Declaration: Accept legal supervisory responsibility and confirm parental consent letters are on file.
   - **Step 4 (Hero Moment):** The **Rules Engine Verdict** evaluates immediately:
     - Shows bilingual explanation: *"High Trust Score (88/100 >= 85) qualifies this booking for instant auto-approval!"*
     - All 10 safety invariants (Headcount, Supervision Ratio, Grade Level, Fair Quota) are green `✓`.
   - Click **Confirm & Submit Booking**.

---

## ⏱️ Act 2: Manager Review & Day-of Check-in (Minute 2)

1. **Switch to Lab Manager:**
   - Open top ribbon role dropdown and select **Lab Manager (Navodaya)**.
   - Realtime notification ping received!

2. **Review in Manager Inbox:**
   - Navigate to **Request Inbox** (`/manager/inbox`).
   - View pending request from Betwa Valley / Bundelkhand NGO.
   - Notice the complete transparent profile: Trust score (88), Student Grade (Class 8), Headcount (24), zero incidents history.
   - Click **Approve Request** and add note: *"Optics benches 1-6 prepared. Lab assistant will assist."*

3. **Day-of Ops & Check-in Console:**
   - Navigate to **Today's Check-in** (`/manager/schedule`).
   - The visiting group arrives at Navodaya Vidyalaya entrance.
   - The Teacher Sponsor presents their 6-digit code: **`729415`** (or scans the QR code from `/bookings`).
   - Manager enters the code and verifies counted headcount: `24 students`.
   - Click **Confirm Entry** -> Status updates live to `● IN PROGRESS (CHECKED_IN)`.

4. **Session Checkout & Clean Inspection:**
   - After experiments, manager clicks **Inspect & Check-out**.
   - Checks: *"All glassware, equipment, and lab stations returned in clean order."*
   - Status updates to `COMPLETED`.

---

## ⏱️ Act 3: Reviews, Cryptographic Audit & Impact Dashboard (Minute 3)

1. **Submit Review:**
   - Switch role back to **Teacher Sponsor** -> Navigate to **My Bookings** (`/bookings`).
   - Click **Rate Session** on the completed booking -> Give 5 Stars ★★★★★: *"World-class optics setup. Rural students experienced prism dispersion for the first time."*

2. **Cryptographic Audit Ledger Verification:**
   - Switch role to **Platform Admin** -> Navigate to **Audit Chain** (`/admin/audit`).
   - View the immutable ledger. Every single action (OTP verify, booking creation, status transitions, check-in, checkout) is hash-chained.
   - Click the green **Verify Chain Integrity** button.
   - The SHA-256 verification algorithm recomputes every block from genesis (`0000...0000`) to head.
   - **Green Badge:** `✓ Cryptographic Hash Chain Valid & Intact (All blocks verified with zero tampering)`.
   - Click **Export CSV** to download the official compliance report.

3. **Hero Impact Dashboard:**
   - Navigate to **Impact Dashboard** (`/impact`).
   - View the live counters updating dynamically:
     - **420+ Lab Hours Shared**
     - **9,240+ Students Benefited**
     - **₹252,000+ Economic Value Shared**
     - **38.5% Idle Capacity Utilized**
   - Interactive district breakdown across Jhansi, Lalitpur, Jalaun, Hamirpur, Mahoba, Banda, and Chitrakoot.
   - Toggle English / हिंदी in the navbar to demonstrate seamless bilingual accessibility for rural headmasters!

---

## 💻 Scripted API Equivalent (cURL Commands)

Run this quick test script in any terminal to execute the entire journey via REST API:

```bash
# 1. Health Probe
curl -s http://localhost:3001/health

# 2. Authenticate as Sponsor via Demo OTP
SPONSOR_TOKEN=$(curl -s -X POST http://localhost:3001/api/v1/auth/demo-switch \
  -H "Content-Type: application/json" \
  -d '{"role":"TEACHER_SPONSOR"}' | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

# 3. Search Nearby Labs
curl -s "http://localhost:3001/api/v1/labs?district=Jhansi&sortBy=distance" \
  -H "Authorization: Bearer $SPONSOR_TOKEN"

# 4. Evaluate Rules Engine (Pure Function)
curl -s -X POST http://localhost:3001/api/v1/rules/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "labId": "c0000000-0000-0000-0000-000000000001",
    "date": "2026-11-06",
    "startTime": "15:30",
    "endTime": "17:30",
    "headcount": 24,
    "equipmentRequested": []
  }'

# 5. Cryptographically Verify Audit Chain
ADMIN_TOKEN=$(curl -s -X POST http://localhost:3001/api/v1/auth/demo-switch \
  -H "Content-Type: application/json" \
  -d '{"role":"ADMIN"}' | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

curl -s http://localhost:3001/api/v1/admin/audit/verify \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 6. Read Public Impact Metrics
curl -s http://localhost:3001/api/v1/analytics/impact
```

-- ============================================================
-- LabShare – Post-migration SQL
-- Run AFTER prisma migrate deploy (applied by api on startup)
-- ============================================================

-- ── Audit Log: Append-Only Enforcement ─────────────────────
-- Revoke UPDATE/DELETE from the application role

-- Trigger: block any UPDATE on audit_logs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_audit_immutable_update'
    AND tgrelid = 'audit_logs'::regclass
  ) THEN
    CREATE TRIGGER trg_audit_immutable_update
      BEFORE UPDATE ON audit_logs
      FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();
  END IF;
END $$;

-- Trigger: block any DELETE on audit_logs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_audit_immutable_delete'
    AND tgrelid = 'audit_logs'::regclass
  ) THEN
    CREATE TRIGGER trg_audit_immutable_delete
      BEFORE DELETE ON audit_logs
      FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();
  END IF;
END $$;

-- ── Bookings: Exclusion Constraint (Double-Booking Prevention) ──
-- Prevents overlapping approved/checked-in bookings for the same lab
-- Uses btree_gist + tstzrange for O(log n) conflict detection
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'no_double_booking'
    AND conrelid = 'bookings'::regclass
  ) THEN
    ALTER TABLE bookings
      ADD CONSTRAINT no_double_booking
      EXCLUDE USING gist (
        lab_id WITH =,
        tstzrange(start_time, end_time, '[)') WITH &&
      )
      WHERE (status IN ('APPROVED', 'CHECKED_IN'));
  END IF;
END $$;

-- ── Optimistic Locking: Auto-increment version on UPDATE ────
CREATE OR REPLACE FUNCTION increment_version()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.version <= OLD.version THEN
    RAISE EXCEPTION 'Optimistic lock conflict: submitted version % but current is %',
      NEW.version, OLD.version
      USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to bookings, organizations, labs
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['bookings', 'organizations', 'labs', 'student_groups'] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger
      WHERE tgname = 'trg_' || tbl || '_version'
      AND tgrelid = tbl::regclass
    ) THEN
      EXECUTE format(
        'CREATE TRIGGER trg_%s_version
           BEFORE UPDATE ON %s
           FOR EACH ROW EXECUTE FUNCTION increment_version()',
        tbl, tbl
      );
    END IF;
  END LOOP;
END $$;

-- ── Indexes (supplement Prisma's) ───────────────────────────

-- Full-text search on lab name + description
ALTER TABLE labs ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
  ) STORED;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_labs_search ON labs USING gin(search_vector);

-- Geographic: for Haversine queries on orgs
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orgs_geo
  ON organizations (lat, lng)
  WHERE lat IS NOT NULL AND lng IS NOT NULL;

-- Booking availability lookup (hot path)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_lab_time
  ON bookings (lab_id, start_time, end_time)
  WHERE status IN ('APPROVED', 'CHECKED_IN', 'PENDING_MANAGER');

-- Audit sequential scan
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_sequence
  ON audit_logs (sequence ASC);

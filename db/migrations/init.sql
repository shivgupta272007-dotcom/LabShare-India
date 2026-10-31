-- ============================================================
-- LabShare – Initial Database Setup
-- Extensions, sequences, audit trigger, exclusion constraint
-- This runs BEFORE Prisma migrations via docker-entrypoint-initdb.d
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gist";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Immutable audit log: prevent UPDATE/DELETE
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs rows are immutable (security: append-only ledger)';
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- Migration: 20260101000001_foundation_extensions.sql
-- Domain: FOUNDATION
-- Type: Extensions
-- Purpose: PostgreSQL extensions required by the entire schema
-- Dependencies: None (MUST run first)
-- =============================================================================
-- GEOFINDA Migration Structure Refactor v1.0
-- Timestamp Range: 202601* (Foundation Domain)
-- Sub-range: 000001-000009 (Extensions)
-- =============================================================================

-- ============================================================================
-- REQUIRED EXTENSIONS
-- ============================================================================
-- These extensions are required by subsequent migrations.
-- They MUST be created before any tables or functions that depend on them.


-- ============================================================================
-- PostGIS - Geospatial Support
-- ============================================================================
-- Required for: GEOMETRY type in listings table, distance calculations
-- Used by: Listings search, nearby properties, location services

CREATE EXTENSION IF NOT EXISTS postgis SCHEMA extensions;

COMMENT ON EXTENSION postgis IS 
  'PostGIS for accurate geospatial queries and distance calculations. Required for listings location features.';

-- NOTE: spatial_ref_sys (PostGIS system table) is flagged by Supabase linter
-- for missing RLS, but we cannot ALTER it (owned by extension). It has no
-- grants to anon/authenticated so it is NOT exposed via the PostgREST API.
-- This is a known false positive — safe to ignore.


-- ============================================================================
-- btree_gist - B-tree GiST Index Support
-- ============================================================================
-- Required for: Exclusion constraints on date ranges
-- Used by: Booking overlap prevention, availability management

CREATE EXTENSION IF NOT EXISTS btree_gist SCHEMA extensions;

COMMENT ON EXTENSION btree_gist IS 
  'Support for exclusion constraints on date ranges. Required for booking overlap prevention.';


-- ============================================================================
-- pgcrypto - Cryptographic Functions
-- ============================================================================
-- Required for: Password hashing, secure token generation
-- Used by: Auth, seed data, verification tokens

CREATE EXTENSION IF NOT EXISTS pgcrypto;

COMMENT ON EXTENSION pgcrypto IS 
  'Cryptographic functions including password hashing. Required for auth and security features.';


-- ============================================================================
-- pg_cron - Job Scheduling
-- ============================================================================
-- Required for: Scheduled tasks (email queue processing, reconciliation)
-- Used by: Email system, payout automation, cleanup jobs
-- Note: Requires pg_catalog schema for proper function

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

COMMENT ON EXTENSION pg_cron IS 
  'Job scheduling for periodic tasks. Required for email queue, payout automation, and maintenance.';

-- Grant usage to postgres role for cron jobs
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;


-- ============================================================================
-- pg_net - HTTP Client
-- ============================================================================
-- Required for: Making HTTP requests from PostgreSQL
-- Used by: Edge Function calls from database triggers
-- Note: Requires extensions schema

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

COMMENT ON EXTENSION pg_net IS 
  'HTTP client for PostgreSQL. Required for calling Edge Functions from database.';


-- ============================================================================
-- pg_stat_statements - Query Performance Monitoring
-- ============================================================================
-- Required for: Track execution statistics of all SQL statements
-- Used by: Performance monitoring, slow query detection
-- Note: Requires extensions schema

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;

COMMENT ON EXTENSION pg_stat_statements IS 
  'Track execution statistics of all SQL statements executed for performance monitoring.';


-- =============================================================================
-- Migration Complete
-- =============================================================================
-- All required extensions are now available.
-- Next: 20260101000002_foundation_enum_all.sql (All enum types)
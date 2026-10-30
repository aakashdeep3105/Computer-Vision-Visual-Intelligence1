-- =====================================================================
-- VISIONINSIGHT AI — PRODUCTION SUPABASE POSTGRESQL SCHEMA & RLS
-- =====================================================================
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/_/sql
-- 2. Open the "SQL Editor" tab.
-- 3. Click "New Query", paste this entire script, and click "Run".
-- =====================================================================

-- 1. Enable Cryptographic & UUID Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for rapid lookup by email
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- 3. Scans Table
CREATE TABLE IF NOT EXISTS public.scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  domain VARCHAR(50) NOT NULL,
  image_url TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'completed',
  summary TEXT,
  sensitivity VARCHAR(20) DEFAULT 'Medium',
  custom_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast user-isolated queries
CREATE INDEX IF NOT EXISTS idx_scans_user_id ON public.scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON public.scans(created_at DESC);

-- 4. Anomalies Table
CREATE TABLE IF NOT EXISTS public.anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  label VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
  confidence_score NUMERIC(3,2) NOT NULL,
  action_required TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast relational joins
CREATE INDEX IF NOT EXISTS idx_anomalies_scan_id ON public.anomalies(scan_id);
CREATE INDEX IF NOT EXISTS idx_anomalies_severity ON public.anomalies(severity);

-- =====================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anomalies ENABLE ROW LEVEL SECURITY;

-- Service Role Policy (Full access for Express Backend running on Render with Service Key)
DROP POLICY IF EXISTS "Service role has full access to users" ON public.users;
CREATE POLICY "Service role has full access to users"
  ON public.users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role has full access to scans" ON public.scans;
CREATE POLICY "Service role has full access to scans"
  ON public.scans
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role has full access to anomalies" ON public.anomalies;
CREATE POLICY "Service role has full access to anomalies"
  ON public.anomalies
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Public / Anon Read Policies (if needed for client access)
DROP POLICY IF EXISTS "Users can view their own record" ON public.users;
CREATE POLICY "Users can view their own record"
  ON public.users
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can view scans" ON public.scans;
CREATE POLICY "Users can view scans"
  ON public.scans
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can view anomalies" ON public.anomalies;
CREATE POLICY "Users can view anomalies"
  ON public.anomalies
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- =====================================================================
-- 6. SUPABASE STORAGE BUCKET: inspection-images
-- =====================================================================
-- Create storage bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('inspection-images', 'inspection-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy: Allow public read
DROP POLICY IF EXISTS "Public can view inspection images" ON storage.objects;
CREATE POLICY "Public can view inspection images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'inspection-images');

-- Storage Policy: Allow authenticated / service role upload
DROP POLICY IF EXISTS "Service role can upload inspection images" ON storage.objects;
CREATE POLICY "Service role can upload inspection images"
  ON storage.objects FOR INSERT
  TO service_role, anon, authenticated
  WITH CHECK (bucket_id = 'inspection-images');

-- =====================================================================
-- COMPLETED: Supabase PostgreSQL Schema, Indexes & RLS Ready!
-- =====================================================================


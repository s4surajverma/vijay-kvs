-- ==============================================================================
-- PM SHRI Kendriya Vidyalaya Portal — Supabase Schema & Realtime Setup
-- ==============================================================================
-- Instructions:
-- 1. Create a free project at https://supabase.com
-- 2. Go to SQL Editor in your Supabase dashboard
-- 3. Paste this script and click "Run"
-- 4. Copy your Project URL & Anon Public API Key from Project Settings > API
-- 5. Paste them into the Portal Admin Settings -> "Cloud Database & Supabase Sync"
-- ==============================================================================

-- 1. Enable UUID Extension if not already active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Table: site_content
-- Stores the complete website configuration and dynamic content as structured JSONB.
CREATE TABLE IF NOT EXISTS public.site_content (
    id TEXT PRIMARY KEY DEFAULT 'main',
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_by TEXT DEFAULT 'admin'
);

-- Comments
COMMENT ON TABLE public.site_content IS 'Stores complete website CMS JSON configuration for PM SHRI Kendriya Vidyalaya.';
COMMENT ON COLUMN public.site_content.id IS 'Primary identifier, defaults to "main" for single-school portal.';
COMMENT ON COLUMN public.site_content.data IS 'JSON document containing schoolInfo, announcements, staff, gallery, resources, etc.';

-- 3. Table: contact_inquiries
-- Stores public inquiries and admission questions submitted via the website contact form.
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'resolved', 'archived')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Comments
COMMENT ON TABLE public.contact_inquiries IS 'Inquiries submitted by parents, students, and visitors via Contact Us.';

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies if re-running script
DROP POLICY IF EXISTS "Allow public read of site content" ON public.site_content;
DROP POLICY IF EXISTS "Allow public write of site content" ON public.site_content;
DROP POLICY IF EXISTS "Allow public insert of inquiries" ON public.contact_inquiries;
DROP POLICY IF EXISTS "Allow public read of inquiries" ON public.contact_inquiries;
DROP POLICY IF EXISTS "Allow public delete of inquiries" ON public.contact_inquiries;
DROP POLICY IF EXISTS "Allow public update of inquiries" ON public.contact_inquiries;

-- 6. Policies for site_content
-- Public read access so visitors can view announcements, staff, gallery, etc.
CREATE POLICY "Allow public read of site content" 
ON public.site_content 
FOR SELECT 
TO anon, authenticated 
USING (true);

-- Allow upsert / update from the Admin Portal using the Anon Key
CREATE POLICY "Allow public write of site content" 
ON public.site_content 
FOR ALL 
TO anon, authenticated 
USING (true)
WITH CHECK (true);

-- 7. Policies for contact_inquiries
-- Allow anyone to submit an inquiry through the contact form
CREATE POLICY "Allow public insert of inquiries" 
ON public.contact_inquiries 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Allow reading inquiries (admin portal)
CREATE POLICY "Allow public read of inquiries" 
ON public.contact_inquiries 
FOR SELECT 
TO anon, authenticated 
USING (true);

-- Allow managing inquiries (updating status / deleting)
CREATE POLICY "Allow public update of inquiries" 
ON public.contact_inquiries 
FOR UPDATE 
TO anon, authenticated 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public delete of inquiries" 
ON public.contact_inquiries 
FOR DELETE 
TO anon, authenticated 
USING (true);

-- 8. Enable Realtime Replication
-- Allows live instantaneous sync across browser tabs and devices without page refresh.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'site_content'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.site_content;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'contact_inquiries'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_inquiries;
  END IF;
END $$;

-- 9. Automatic Updated At Timestamp Trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_site_content_updated_at ON public.site_content;
CREATE TRIGGER set_site_content_updated_at
    BEFORE UPDATE ON public.site_content
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Success notice
SELECT 'Supabase schema successfully created! You can now connect your portal.' AS status;

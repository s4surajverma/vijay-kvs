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

-- 10. Initial Seed Data
-- Automatically populates site_content with the full PM SHRI Kendriya Vidyalaya Suranussi content.
INSERT INTO public.site_content (id, data, updated_at, updated_by)
VALUES (
    'main',
    $seed$
{
  "heroSection": {
    "kicker": "LEARN | LEAD | INSPIRE",
    "name": "VIJAY KUMAR",
    "role": "Headmaster",
    "school": "PM SHRI Kendriya Vidyalaya Suranussi, Jalandhar",
    "stage": "Foundational & Preparatory Stage",
    "motto": "Education for a Brighter Tomorrow",
    "image": "assets/images/hero_banner_full.png"
  },
  "profile": {
    "name": "Vijay Kumar",
    "role": "Headmaster",
    "school": "PM SHRI Kendriya Vidyalaya Suranussi, Jalandhar",
    "stage": "Foundational & Preparatory Stage",
    "motto": "Education for a Brighter Tomorrow",
    "bio": "I am Vijay Kumar, a passionate educator and dedicated school leader, currently serving as Headmaster at PM SHRI Kendriya Vidyalaya Suranussi, Jalandhar. I believe in creating a joyful, inclusive and stimulating learning environment where every child can learn, grow and realise their potential.",
    "quote": "Every child is a promise and every classroom is a possibility.",
    "email": "vijaykumar.edu@gmail.com",
    "phone": "+91 181 267 1234",
    "address": "PM SHRI Kendriya Vidyalaya Suranussi, GT Road, Jalandhar, Punjab - 144027",
    "website": "www.vijaysirkvs.com",
    "qualifications": "M.A., B.Ed., PG Diploma in School Leadership, Certified NIPUN FLN & Toy Pedagogy Mentor",
    "journey": "Dedicated career in Kendriya Vidyalaya Sangathan (KVS) championing primary foundational learning, activity-based pedagogy, higher-order thinking skills (HOTS), and teacher continuous professional development (CPD).",
    "vision": "To cultivate joyful, child-centric learning environments where every foundational learner builds strong cognitive foundations and thrives with curiosity, empathy, and national pride.",
    "responsibilities": "Headmaster leading foundational and preparatory stage academic operations, teacher training workshops, TLM innovations, toy libraries, and community engagement."
  },
  "announcements": [
    {
      "id": "ann-v1",
      "date": "2026-08-28",
      "displayDate": "28 Aug",
      "title": "FLN Assessment – Reminder for all Subjects",
      "category": "Assessment",
      "isPinned": true,
      "badge": "REMINDER",
      "description": "Periodic foundational literacy and numeracy assessment reminder for primary classes.",
      "linkUrl": "#resources"
    },
    {
      "id": "ann-v2",
      "date": "2026-08-25",
      "displayDate": "25 Aug",
      "title": "CPD Workshop – Bloom's Taxonomy Session Materials",
      "category": "Training & CPD",
      "isPinned": true,
      "badge": "WORKSHOP",
      "description": "Session PPT and pedagogical guide on applying Revised Bloom's Taxonomy in primary classroom teaching.",
      "linkUrl": "#training-cpd"
    },
    {
      "id": "ann-v3",
      "date": "2026-08-20",
      "displayDate": "20 Aug",
      "title": "New Resources – CCT & HOTS Question Bank (Class 4)",
      "category": "Resources",
      "isPinned": false,
      "badge": "NEW",
      "description": "Critical and Creative Thinking (CCT) question bank designed for primary students.",
      "linkUrl": "#resources"
    },
    {
      "id": "ann-v4",
      "date": "2026-08-15",
      "displayDate": "15 Aug",
      "title": "Independence Day Celebrations at School",
      "category": "Events",
      "isPinned": false,
      "badge": "CELEBRATION",
      "description": "Patriotic presentations, cultural dance, and student speech showcases at KV campus.",
      "linkUrl": "#gallery"
    },
    {
      "id": "ann-v5",
      "date": "2026-08-05",
      "displayDate": "05 Aug",
      "title": "Teaching Resources – Updated Worksheets",
      "category": "Resources",
      "isPinned": false,
      "badge": "UPDATED",
      "description": "Updated printable activity sheets for English, Hindi, Mathematics, and EVS.",
      "linkUrl": "#resources"
    },
    {
      "id": "ann-v6",
      "date": "2025-12-18",
      "displayDate": "18 Dec",
      "title": "Training Programme for PRTs on 'Toys and Puppets Based Pedagogy'",
      "category": "Training & CPD",
      "isPinned": false,
      "badge": "FEATURED",
      "description": "Hands-on workshop integrating indigenous toy-making and puppets into primary stage teaching.",
      "linkUrl": "https://drive.google.com/drive/folders/1cAtFqSvnXZW9jD2KzRM0npyqGmpEW7DS?usp=drive_link"
    }
  ],
  "resources": [
    {
      "id": "res-1",
      "title": "CCT & HOTS Question Bank (Class 4 & 5)",
      "category": "Question Banks",
      "fileType": "PDF Document",
      "size": "3.2 MB",
      "date": "2026-08-20",
      "srcUrl": "#"
    },
    {
      "id": "res-2",
      "title": "Foundational Literacy & Phonics Activity Worksheets",
      "category": "Worksheets",
      "fileType": "PDF Document",
      "size": "2.8 MB",
      "date": "2026-08-05",
      "srcUrl": "#"
    },
    {
      "id": "res-3",
      "title": "Toy-Based Pedagogy Lesson Plan Templates",
      "category": "Lesson Plans",
      "fileType": "PDF Document",
      "size": "1.9 MB",
      "date": "2026-07-15",
      "srcUrl": "#"
    },
    {
      "id": "res-4",
      "title": "NCF Foundational Stage Rubrics & Assessment Guide",
      "category": "Assessment Tools",
      "fileType": "PDF Document",
      "size": "4.5 MB",
      "date": "2026-06-10",
      "srcUrl": "#"
    }
  ],
  "initiatives": [
    {
      "id": "init-1",
      "title": "NIPUN Bharat & FLN Mission",
      "category": "Academic Leadership",
      "icon": "fa-book-reader",
      "image": "assets/images/toy_library.png",
      "summary": "Universal acquisition of foundational literacy and numeracy skills by Class III.",
      "details": "Championing joyful reading corners, story sessions, and numeracy games under NIPUN Bharat guidelines."
    },
    {
      "id": "init-2",
      "title": "Toy-Based & Puppet Pedagogy",
      "category": "Innovations",
      "icon": "fa-cubes",
      "image": "assets/images/toy_library.png",
      "summary": "Integrating indigenous toys, puppets, and tactile learning into everyday lessons.",
      "details": "Empowering primary teachers to use hands-on materials to make abstract concepts concrete and delightful."
    },
    {
      "id": "init-3",
      "title": "Vidya Pravesh & Balvatika Readiness",
      "category": "Foundational Stage",
      "icon": "fa-child",
      "image": "assets/images/pm_shri.png",
      "summary": "Play-based school preparation module for young entrants.",
      "details": "Focusing on social-emotional bonding, communication, fine motor skills, and joyful school entry."
    },
    {
      "id": "init-4",
      "title": "Continuous Professional Development (CPD)",
      "category": "Training & CPD",
      "icon": "fa-chalkboard-teacher",
      "image": "assets/images/hero.png",
      "summary": "Regular peer workshops on Bloom's Taxonomy, experiential pedagogy, and competency assessment.",
      "details": "Facilitating interactive faculty training modules and collaborative lesson design sessions."
    }
  ],
  "gallery": [
    {
      "id": "gal-1",
      "title": "Classroom Interaction with Students",
      "category": "Classroom Moments",
      "type": "photo",
      "srcUrl": "assets/images/children_globe_hd.png",
      "caption": "Inspiring foundational learners with hands-on geography and globe exploration."
    },
    {
      "id": "gal-2",
      "title": "Toy-Based Pedagogy Workshop",
      "category": "Training & CPD",
      "type": "photo",
      "srcUrl": "assets/images/toy_library.png",
      "caption": "Mentoring educators on indigenous toy-making and storytelling puppets."
    },
    {
      "id": "gal-3",
      "title": "Vijay Kumar, Headmaster in Office",
      "category": "Leadership",
      "type": "photo",
      "srcUrl": "assets/images/vijay_kumar_desk_hd.png",
      "caption": "Academic leadership and curriculum planning for foundational & preparatory stage."
    },
    {
      "id": "gal-4",
      "title": "Independence Day & Cultural Events",
      "category": "Events",
      "type": "photo",
      "srcUrl": "assets/images/pm_shri.png",
      "caption": "Fostering national integration, unity, and joyful cultural presentations."
    }
  ],
  "inquiries": []
}
    $seed$::jsonb,
    timezone('utc'::text, now()),
    'system_seed'
)
ON CONFLICT (id) DO UPDATE
SET data = EXCLUDED.data
WHERE public.site_content.data IS NULL;

-- 11. Optional Sample Inquiry
INSERT INTO public.contact_inquiries (name, email, phone, subject, message, status)
VALUES (
    'Dr. Anita Sharma',
    'anita.sharma.edu@gmail.com',
    '+91 98765 43210',
    'Collaboration on Toy-Based Pedagogy Workshop',
    'Respected Vijay Sir, We would like to invite you as Key Resource Person for our upcoming regional FLN & Toy Pedagogy workshop.',
    'new'
)
ON CONFLICT DO NOTHING;

-- Success notice
SELECT 'Supabase schema successfully created and seeded with official vijaysirkvs.com portfolio data!' AS status;

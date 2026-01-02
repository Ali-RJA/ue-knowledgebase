-- Supabase Database Schema for UE5 Knowledgebase
-- Run this SQL in your Supabase project's SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom_pages table
CREATE TABLE IF NOT EXISTS public.custom_pages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  summary TEXT NOT NULL,
  category TEXT NOT NULL,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  published BOOLEAN NOT NULL DEFAULT false
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.custom_pages ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (only published pages)
CREATE POLICY "Allow public read access to published pages"
  ON public.custom_pages
  FOR SELECT
  USING (published = true);

-- Create policy for authenticated inserts (for your admin usage)
CREATE POLICY "Allow authenticated inserts"
  ON public.custom_pages
  FOR INSERT
  WITH CHECK (true);

-- Create policy for authenticated updates
CREATE POLICY "Allow authenticated updates"
  ON public.custom_pages
  FOR UPDATE
  USING (true);

-- Create policy for authenticated deletes
CREATE POLICY "Allow authenticated deletes"
  ON public.custom_pages
  FOR DELETE
  USING (true);

-- Create index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_custom_pages_slug
  ON public.custom_pages(slug);

-- Create index for faster category lookups
CREATE INDEX IF NOT EXISTS idx_custom_pages_category
  ON public.custom_pages(category);

-- Create index for faster published lookups
CREATE INDEX IF NOT EXISTS idx_custom_pages_published
  ON public.custom_pages(published);

-- Enable replication for the table (optional, for real-time updates)
ALTER TABLE public.custom_pages REPLICA IDENTITY FULL;

-- Trigger function to auto-generate slug from title (if not provided)
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := lower(
      regexp_replace(
        regexp_replace(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'),
        '^-|-$',
        '',
        'g'
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (uncomment if you want auto-slug generation)
-- CREATE TRIGGER auto_slug_trigger
--   BEFORE INSERT ON public.custom_pages
--   FOR EACH ROW
--   EXECUTE FUNCTION auto_generate_slug();

-- Example: Insert a test page
/*
INSERT INTO public.custom_pages (title, summary, category, tags, blocks, published)
VALUES (
  'Test Page',
  'This is a test page created via Supabase',
  'core-systems',
  '["Test", "Example"]'::jsonb,
  '[
    {
      "id": "block-1",
      "type": "mermaid",
      "title": "Example Diagram",
      "content": "flowchart TD\n  A[Start] --> B[End]"
    },
    {
      "id": "block-2",
      "type": "notes",
      "title": "Notes",
      "content": "This is a notes block"
    }
  ]'::jsonb,
  true
);
*/

-- Example: Query to get all published pages
/*
SELECT id, title, slug, summary, category, tags, created_at
FROM public.custom_pages
WHERE published = true
ORDER BY created_at DESC;
*/

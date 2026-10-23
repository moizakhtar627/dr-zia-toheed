-- Supabase schema for Zia Homeopathic Clinic
-- Run these in Supabase SQL editor

-- Books table
CREATE TABLE IF NOT EXISTS public.books (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  short_desc TEXT,
  full_desc TEXT,
  category_id BIGINT,
  cover_url TEXT,
  cover_filename TEXT,
  book_type TEXT NOT NULL CHECK (book_type IN ('pdf','online','external')),
  pdf_filename TEXT,
  reading_url TEXT,
  reading_content TEXT,
  is_popular BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

-- Medicines table
CREATE TABLE IF NOT EXISTS public.medicines (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  short_desc TEXT,
  image_url TEXT,
  image_filename TEXT,
  original_price NUMERIC(10,2) DEFAULT 0,
  discounted_price NUMERIC(10,2) DEFAULT 0,
  takeaway_price NUMERIC(10,2) DEFAULT 0,
  online_price NUMERIC(10,2) DEFAULT 0,
  stock_available BOOLEAN DEFAULT TRUE,
  is_published BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;

-- Public read policies for published content
CREATE POLICY "Public can read published books" ON public.books
  FOR SELECT USING (is_published = TRUE);

CREATE POLICY "Public can read categories" ON public.categories
  FOR SELECT USING (TRUE);

CREATE POLICY "Public can read published medicines" ON public.medicines
  FOR SELECT USING (is_published = TRUE);

-- Admin policies (service role bypasses RLS; for authenticated admin use these)
-- Create a role-based approach: only service_role or specific users
-- Better to use service role key on server for admin operations
CREATE POLICY "Service role full access books" ON public.books
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access categories" ON public.categories
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access medicines" ON public.medicines
  FOR ALL USING (auth.role() = 'service_role');

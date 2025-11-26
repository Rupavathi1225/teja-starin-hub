-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code_range TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create blogs table
CREATE TABLE IF NOT EXISTS public.blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category_id INTEGER REFERENCES public.categories(id) ON DELETE SET NULL,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  featured_image TEXT,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create related_searches table
CREATE TABLE IF NOT EXISTS public.related_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id UUID REFERENCES public.blogs(id) ON DELETE CASCADE,
  search_text TEXT NOT NULL,
  search_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tracking_events table for comprehensive tracking
CREATE TABLE IF NOT EXISTS public.tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  device_type TEXT,
  country TEXT,
  source TEXT,
  blog_id UUID REFERENCES public.blogs(id) ON DELETE CASCADE,
  related_search_id UUID REFERENCES public.related_searches(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create pre_landing_config table
CREATE TABLE IF NOT EXISTS public.pre_landing_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  related_search_id UUID REFERENCES public.related_searches(id) ON DELETE CASCADE,
  logo_url TEXT,
  main_image_url TEXT,
  headline TEXT,
  description TEXT,
  background_color TEXT DEFAULT '#ffffff',
  button_color TEXT DEFAULT '#000000',
  button_text_color TEXT DEFAULT '#ffffff',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create email_submissions table
CREATE TABLE IF NOT EXISTS public.email_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  related_search_id UUID REFERENCES public.related_searches(id) ON DELETE CASCADE,
  session_id TEXT,
  ip_address TEXT,
  country TEXT,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.related_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pre_landing_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access on categories"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access on published blogs"
  ON public.blogs FOR SELECT
  USING (status = 'published');

CREATE POLICY "Allow public read access on related_searches"
  ON public.related_searches FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access on pre_landing_config"
  ON public.pre_landing_config FOR SELECT
  USING (true);

-- Create policies for public insert on tracking and emails
CREATE POLICY "Allow public insert on tracking_events"
  ON public.tracking_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public insert on email_submissions"
  ON public.email_submissions FOR INSERT
  WITH CHECK (true);

-- Create policies for admin access (all operations)
CREATE POLICY "Allow all operations on categories for authenticated users"
  ON public.categories FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations on blogs for authenticated users"
  ON public.blogs FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations on related_searches for authenticated users"
  ON public.related_searches FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations on pre_landing_config for authenticated users"
  ON public.pre_landing_config FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow read on tracking_events for authenticated users"
  ON public.tracking_events FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read on email_submissions for authenticated users"
  ON public.email_submissions FOR SELECT
  USING (auth.role() = 'authenticated');

-- Create trigger for updating blogs updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_blogs_updated_at
  BEFORE UPDATE ON public.blogs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pre_landing_config_updated_at
  BEFORE UPDATE ON public.pre_landing_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories
INSERT INTO public.categories (name, code_range) VALUES
  ('Lifestyle', '100-200'),
  ('Education', '201-300'),
  ('Wellness', '301-400'),
  ('Deals', '401-500'),
  ('Job Seeking', '501-600'),
  ('Alternative Learning', '601-700')
ON CONFLICT (name) DO NOTHING;
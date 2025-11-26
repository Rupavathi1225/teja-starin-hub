-- Create web_results table for managing search results
CREATE TABLE public.web_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  related_search_id UUID NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT NOT NULL,
  logo_url TEXT,
  is_sponsored BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.web_results ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on web_results" 
ON public.web_results 
FOR SELECT 
USING (true);

-- Allow authenticated users to manage web results
CREATE POLICY "Allow all operations on web_results for authenticated users" 
ON public.web_results 
FOR ALL 
USING (auth.role() = 'authenticated'::text)
WITH CHECK (auth.role() = 'authenticated'::text);

-- Add trigger for updated_at
CREATE TRIGGER update_web_results_updated_at
BEFORE UPDATE ON public.web_results
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Drop triggers first
DROP TRIGGER IF EXISTS update_blogs_updated_at ON public.blogs;
DROP TRIGGER IF EXISTS update_pre_landing_config_updated_at ON public.pre_landing_config;

-- Drop and recreate function with proper search_path
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate triggers
CREATE TRIGGER update_blogs_updated_at
  BEFORE UPDATE ON public.blogs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pre_landing_config_updated_at
  BEFORE UPDATE ON public.pre_landing_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
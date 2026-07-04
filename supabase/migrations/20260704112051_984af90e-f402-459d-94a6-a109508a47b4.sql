
-- Roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- user_roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- has_role security definer
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- Bootstrap admin: any signed-in user whose email is the authorized admin email
-- can call this to grant themselves the admin role. Safe to call repeatedly.
CREATE OR REPLACE FUNCTION public.claim_admin_role()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid UUID := auth.uid();
  _email TEXT;
BEGIN
  IF _uid IS NULL THEN RETURN FALSE; END IF;
  SELECT email INTO _email FROM auth.users WHERE id = _uid;
  IF LOWER(_email) = 'contact@tlibertypte.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (_uid, 'admin')
      ON CONFLICT (user_id, role) DO NOTHING;
    RETURN TRUE;
  END IF;
  RETURN FALSE;
END;
$$;
GRANT EXECUTE ON FUNCTION public.claim_admin_role() TO authenticated;

-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Site settings (singleton)
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  phone_href TEXT NOT NULL,
  address TEXT NOT NULL,
  uen TEXT NOT NULL,
  domain TEXT NOT NULL,
  hero_eyebrow TEXT NOT NULL DEFAULT 'Singapore · Global reach',
  hero_secondary_cta TEXT NOT NULL DEFAULT 'Our Services',
  focus_eyebrow TEXT NOT NULL DEFAULT 'What we supply',
  focus_heading TEXT NOT NULL DEFAULT 'Our Trading Focus Areas',
  focus_subheading TEXT NOT NULL DEFAULT 'Six specialist categories, one accountable supplier — from bridge to berth to below the waterline.',
  track_record_eyebrow TEXT NOT NULL DEFAULT 'Our Track Record',
  track_record_heading TEXT NOT NULL DEFAULT 'Numbers that speak to our commitment and excellence in marine trading',
  why_eyebrow TEXT NOT NULL DEFAULT 'Why choose us',
  why_heading TEXT NOT NULL DEFAULT 'A supply partner your operations can trust',
  testimonials_eyebrow TEXT NOT NULL DEFAULT 'What clients say',
  testimonials_heading TEXT NOT NULL DEFAULT 'Trusted by maritime operators',
  cta_heading TEXT NOT NULL DEFAULT 'Need a quote for your next project?',
  cta_body TEXT NOT NULL DEFAULT 'Send us your specification and we''ll respond within one business day.',
  about_body TEXT NOT NULL DEFAULT '',
  services_intro TEXT NOT NULL DEFAULT 'End-to-end supply and service for marine & port operations',
  services_body TEXT NOT NULL DEFAULT 'One accountable partner for procurement, delivery, commissioning and after-sales support.',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read site settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins update site settings" ON public.site_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert site settings" ON public.site_settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete site settings" ON public.site_settings FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Focus areas
CREATE TABLE public.focus_areas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  blurb TEXT NOT NULL,
  image_url TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.focus_areas TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.focus_areas TO authenticated;
GRANT ALL ON public.focus_areas TO service_role;
ALTER TABLE public.focus_areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read focus areas" ON public.focus_areas FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage focus areas" ON public.focus_areas FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER focus_areas_updated_at BEFORE UPDATE ON public.focus_areas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Services
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read services" ON public.services FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage services" ON public.services FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Stats
CREATE TABLE public.stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  note TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.stats TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.stats TO authenticated;
GRANT ALL ON public.stats TO service_role;
ALTER TABLE public.stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read stats" ON public.stats FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage stats" ON public.stats FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER stats_updated_at BEFORE UPDATE ON public.stats FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Why us
CREATE TABLE public.why_us (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.why_us TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.why_us TO authenticated;
GRANT ALL ON public.why_us TO service_role;
ALTER TABLE public.why_us ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read why_us" ON public.why_us FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage why_us" ON public.why_us FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER why_us_updated_at BEFORE UPDATE ON public.why_us FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Testimonials
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote TEXT NOT NULL,
  author TEXT NOT NULL,
  company TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.testimonials TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read testimonials" ON public.testimonials FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage testimonials" ON public.testimonials FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER testimonials_updated_at BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

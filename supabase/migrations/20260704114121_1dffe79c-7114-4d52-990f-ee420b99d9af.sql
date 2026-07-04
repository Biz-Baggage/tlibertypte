
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS logo_url TEXT NOT NULL DEFAULT '';

-- Storage policies: admins manage site-images; everyone can read (needed for signed URL creation is not required, but we allow read for future public bucket toggle)
DROP POLICY IF EXISTS "Admins upload site-images" ON storage.objects;
CREATE POLICY "Admins upload site-images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins update site-images" ON storage.objects;
CREATE POLICY "Admins update site-images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins delete site-images" ON storage.objects;
CREATE POLICY "Admins delete site-images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins read site-images" ON storage.objects;
CREATE POLICY "Admins read site-images" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'admin'));

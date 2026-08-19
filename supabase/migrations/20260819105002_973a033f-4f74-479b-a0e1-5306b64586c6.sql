CREATE POLICY "Editors can read media"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id IN ('posters','trailers'));
CREATE POLICY "Editors can upload media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('posters','trailers') AND public.can_edit(auth.uid()));
CREATE POLICY "Editors can update media"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id IN ('posters','trailers') AND public.can_edit(auth.uid()));
CREATE POLICY "Editors can delete media"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id IN ('posters','trailers') AND public.can_edit(auth.uid()));

CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert categories" ON public.categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update categories" ON public.categories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete categories" ON public.categories FOR DELETE TO authenticated USING (true);

CREATE TABLE public.items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  price numeric(12,2) NOT NULL DEFAULT 0,
  description text,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX items_category_id_idx ON public.items(category_id);
GRANT SELECT ON public.items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.items TO authenticated;
GRANT ALL ON public.items TO service_role;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read items" ON public.items FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert items" ON public.items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update items" ON public.items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete items" ON public.items FOR DELETE TO authenticated USING (true);

CREATE TABLE public.app_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  setup_complete boolean NOT NULL DEFAULT false,
  owner_email text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.app_settings TO anon, authenticated;
GRANT INSERT, UPDATE ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read app settings" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Authenticated can update settings" ON public.app_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

INSERT INTO public.app_settings (id, setup_complete) VALUES (1, false) ON CONFLICT (id) DO NOTHING;

-- Storage policies for menu-images bucket (bucket created via tool)
CREATE POLICY "Public can read menu images" ON storage.objects FOR SELECT USING (bucket_id = 'menu-images');
CREATE POLICY "Authenticated can upload menu images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'menu-images');
CREATE POLICY "Authenticated can update menu images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'menu-images');
CREATE POLICY "Authenticated can delete menu images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'menu-images');

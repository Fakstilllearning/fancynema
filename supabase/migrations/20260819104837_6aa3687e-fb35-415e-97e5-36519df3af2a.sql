CREATE TYPE public.app_role AS ENUM ('admin', 'editor');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT, INSERT, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.can_edit(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id)
$$;

CREATE POLICY "Anyone signed in can view profiles"
  ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Signed in users can view roles"
  ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can grant roles"
  ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can revoke roles"
  ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin') AND user_id <> auth.uid());

CREATE TABLE public.titles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  year INTEGER,
  kind TEXT NOT NULL DEFAULT 'series',
  rating NUMERIC(4,2),
  genres TEXT[] NOT NULL DEFAULT '{}',
  synopsis TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'watched',
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  poster_url TEXT,
  trailer_url TEXT,
  trailer_type TEXT NOT NULL DEFAULT 'file',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.titles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.titles TO authenticated;
GRANT ALL ON public.titles TO service_role;
ALTER TABLE public.titles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Titles are public to read"
  ON public.titles FOR SELECT USING (true);
CREATE POLICY "Editors can add titles"
  ON public.titles FOR INSERT TO authenticated WITH CHECK (public.can_edit(auth.uid()));
CREATE POLICY "Editors can update titles"
  ON public.titles FOR UPDATE TO authenticated USING (public.can_edit(auth.uid())) WITH CHECK (public.can_edit(auth.uid()));
CREATE POLICY "Editors can delete titles"
  ON public.titles FOR DELETE TO authenticated USING (public.can_edit(auth.uid()));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER titles_set_updated_at
BEFORE UPDATE ON public.titles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;

  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.titles (name, year, kind, rating, genres, synopsis, notes, status, is_favorite, poster_url, trailer_url, trailer_type)
VALUES (
  'Can This Love Be Translated?',
  2025,
  'series',
  9.95,
  ARRAY['Romance', 'Comedy', 'Drama'],
  'Seorang penerjemah multibahasa dan seorang bintang top dunia bertemu lewat kata-kata yang harus diterjemahkan — sampai perasaan mereka sendiri jadi hal paling sulit untuk diterjemahkan.',
  'Sejauh ini tontonan terbaik. Chemistry-nya juara, tiap episode bikin senyum sendiri.',
  'watched',
  true,
  '/__l5e/assets-v1/92b33977-88a1-4874-9237-4bf013115ac7/can-this-love-be-translated.png',
  '/__l5e/assets-v1/11ba0fac-8e93-411b-9faf-6239f8edbbe7/can-this-love-be-translated.mp4',
  'file'
);
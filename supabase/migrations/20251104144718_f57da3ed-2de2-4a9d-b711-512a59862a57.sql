-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create articles table
CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  rubrique TEXT NOT NULL,
  image_url TEXT,
  author_id UUID NOT NULL,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on articles
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Create podcasts table
CREATE TABLE public.podcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  image_url TEXT,
  duration INTEGER,
  author_id UUID NOT NULL,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on podcasts
ALTER TABLE public.podcasts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User roles policies (only admins can manage roles)
CREATE POLICY "Roles are viewable by authenticated users"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Articles policies
CREATE POLICY "Published articles are viewable by everyone"
  ON public.articles FOR SELECT
  USING (published = true OR auth.uid() = author_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins and editors can insert articles"
  ON public.articles FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'editor')
  );

CREATE POLICY "Authors and admins can update articles"
  ON public.articles FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = author_id OR 
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete articles"
  ON public.articles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Podcasts policies
CREATE POLICY "Published podcasts are viewable by everyone"
  ON public.podcasts FOR SELECT
  USING (published = true OR auth.uid() = author_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins and editors can insert podcasts"
  ON public.podcasts FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'editor')
  );

CREATE POLICY "Authors and admins can update podcasts"
  ON public.podcasts FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = author_id OR 
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete podcasts"
  ON public.podcasts FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_podcasts_updated_at
  BEFORE UPDATE ON public.podcasts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
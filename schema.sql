-- ========================================================
-- SOUNDBOXD - SUPABASE DATABASE SCHEMA
-- Execute este script no SQL Editor do seu painel Supabase
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  favorite_artist TEXT,
  favorite_genre TEXT,
  bio TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. REVIEWS TABLE (Diário & Resenhas de Álbuns)
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID,
  album_id TEXT NOT NULL,
  album_title TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  cover_url TEXT NOT NULL,
  release_year TEXT,
  genre TEXT,
  rating NUMERIC(2,1) CHECK (rating >= 0.5 AND rating <= 5.0),
  review_text TEXT,
  listened_date DATE DEFAULT CURRENT_DATE,
  is_relisten BOOLEAN DEFAULT FALSE,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TRACK RATINGS TABLE (Avaliação por Músicas Individuais)
CREATE TABLE IF NOT EXISTS public.track_ratings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  album_id TEXT NOT NULL,
  track_id TEXT NOT NULL,
  track_name TEXT NOT NULL,
  artist_name TEXT,
  rating NUMERIC(2,1) CHECK (rating >= 0.5 AND rating <= 5.0),
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. LISTS TABLE (Listas Personalizadas de Álbuns)
CREATE TABLE IF NOT EXISTS public.lists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. LIST ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.list_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  list_id UUID REFERENCES public.lists(id) ON DELETE CASCADE,
  album_id TEXT NOT NULL,
  album_title TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  cover_url TEXT NOT NULL,
  position INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CORREÇÃO DE SEGURANÇA (RLS): Permitir gravação e leitura total sem erros de permissão
ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.track_ratings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lists DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_items DISABLE ROW LEVEL SECURITY;

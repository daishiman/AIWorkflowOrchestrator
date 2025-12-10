-- ============================================================
-- user_profiles テーブル作成
-- ============================================================
-- 作成日: 2025-12-10
-- 目的: Supabase Auth と連携するユーザープロフィール管理
-- ============================================================

-- user_profiles テーブル作成
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON public.user_profiles(deleted_at);

-- RLS（Row Level Security）有効化
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除（冪等性のため）
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

-- RLSポリシー：自分のプロフィールのみ閲覧可能
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

-- RLSポリシー：自分のプロフィールのみ更新可能
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLSポリシー：認証済みユーザーは自分のプロフィールを作成可能
CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================
-- 新規ユーザー登録時の自動プロフィール作成トリガー
-- ============================================================

-- 関数作成
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガー作成（既存の場合は削除して再作成）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 既存ユーザーのプロフィール作成（マイグレーション用）
-- ============================================================
INSERT INTO public.user_profiles (id, display_name, email, avatar_url)
SELECT
  id,
  COALESCE(raw_user_meta_data->>'name', raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
  email,
  COALESCE(raw_user_meta_data->>'avatar_url', raw_user_meta_data->>'picture')
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.user_profiles)
ON CONFLICT (id) DO NOTHING;

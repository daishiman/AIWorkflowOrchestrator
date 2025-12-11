-- =============================================================================
-- Migration: Extend user_profiles table with timezone, locale, notifications
-- =============================================================================
-- Version: 003
-- Date: 2025-12-10
-- Description: Add timezone, locale, notification_settings, preferences columns
-- Reference: docs/30-workflows/user-profile-enhancement/schema-design.md
-- =============================================================================

-- タイムゾーン (IANA形式)
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'Asia/Tokyo';

-- ロケール (BCP 47形式)
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS locale VARCHAR(10) DEFAULT 'ja';

-- 通知設定 (JSONB)
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{
  "email": true,
  "desktop": true,
  "sound": true,
  "workflowComplete": true,
  "workflowError": true
}'::jsonb;

-- ユーザー設定 (JSONB - 将来の拡張用)
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

-- コメント追加
COMMENT ON COLUMN public.user_profiles.timezone IS 'IANA timezone identifier (e.g., Asia/Tokyo, America/New_York)';
COMMENT ON COLUMN public.user_profiles.locale IS 'BCP 47 language tag (e.g., ja, en, zh-CN)';
COMMENT ON COLUMN public.user_profiles.notification_settings IS 'User notification preferences as JSONB';
COMMENT ON COLUMN public.user_profiles.preferences IS 'Additional user preferences for future extensibility';

-- =============================================================================
-- バリデーション関数
-- =============================================================================

-- タイムゾーンバリデーション関数
CREATE OR REPLACE FUNCTION public.is_valid_timezone(tz TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- PostgreSQLのpg_timezone_namesを参照
  RETURN EXISTS (
    SELECT 1 FROM pg_timezone_names WHERE name = tz
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ロケールバリデーション関数
CREATE OR REPLACE FUNCTION public.is_valid_locale(loc TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- サポートするロケールのリスト
  RETURN loc IN ('ja', 'en', 'zh-CN', 'zh-TW', 'ko');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =============================================================================
-- CHECK制約追加
-- =============================================================================

-- 制約が存在しない場合のみ追加
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_timezone_valid'
  ) THEN
    ALTER TABLE public.user_profiles
    ADD CONSTRAINT check_timezone_valid
    CHECK (timezone IS NULL OR public.is_valid_timezone(timezone));
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_locale_valid'
  ) THEN
    ALTER TABLE public.user_profiles
    ADD CONSTRAINT check_locale_valid
    CHECK (locale IS NULL OR public.is_valid_locale(locale));
  END IF;
END
$$;

-- =============================================================================
-- インデックス追加
-- =============================================================================

-- タイムゾーン検索用インデックス（将来のスケジュール機能で使用）
CREATE INDEX IF NOT EXISTS idx_user_profiles_timezone
ON public.user_profiles (timezone)
WHERE deleted_at IS NULL;

-- ロケール検索用インデックス（将来の多言語対応で使用）
CREATE INDEX IF NOT EXISTS idx_user_profiles_locale
ON public.user_profiles (locale)
WHERE deleted_at IS NULL;

-- アクティブユーザー検索用部分インデックス
CREATE INDEX IF NOT EXISTS idx_user_profiles_active
ON public.user_profiles (id)
WHERE deleted_at IS NULL;

-- =============================================================================
-- updated_at 自動更新トリガー
-- =============================================================================

-- 新カラム更新時もupdated_atを更新するトリガー関数
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーが存在しない場合のみ作成
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_user_profiles'
  ) THEN
    CREATE TRIGGER set_updated_at_user_profiles
      BEFORE UPDATE ON public.user_profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END
$$;

-- =============================================================================
-- 新規ユーザー作成トリガーを更新（新カラムのデフォルト値を含める）
-- =============================================================================

-- 関数を更新して新カラムも含める
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    display_name,
    email,
    avatar_url,
    timezone,
    locale,
    notification_settings,
    preferences
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    'Asia/Tokyo',
    'ja',
    '{"email": true, "desktop": true, "sound": true, "workflowComplete": true, "workflowError": true}'::jsonb,
    '{}'::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

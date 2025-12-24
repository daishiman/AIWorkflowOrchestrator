# ユーザープロフィール拡張 - データベーススキーマ設計書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| 文書ID     | SCHEMA-USER-PROFILE-001 |
| 作成日     | 2025-12-10              |
| 担当者     | .claude/agents/db-architect.md           |
| ステータス | 確定                    |
| 関連タスク | T-01-1                  |

---

## 1. 概要

### 1.1 目的

Supabase `user_profiles` テーブルを拡張し、タイムゾーン、ロケール、通知設定、ユーザー設定を追加する。

### 1.2 設計方針

- **後方互換性**: 既存カラムに影響を与えない
- **NULL許容**: 新カラムはNULL許容でデフォルト値を設定
- **JSONB活用**: 通知設定・ユーザー設定はJSONBで柔軟に拡張
- **RLS維持**: 既存のRow Level Securityポリシーを維持

---

## 2. 既存スキーマ

### 2.1 現在の `user_profiles` テーブル

```sql
-- 参照: supabase/migrations/001_create_user_profiles.sql

CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ  -- ソフトデリート
);

-- RLSポリシー
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);
```

---

## 3. 拡張スキーマ設計

### 3.1 追加カラム定義

| カラム名              | データ型    | NULL許容 | デフォルト値 | 説明             |
| --------------------- | ----------- | -------- | ------------ | ---------------- |
| timezone              | VARCHAR(50) | YES      | 'Asia/Tokyo' | IANAタイムゾーン |
| locale                | VARCHAR(10) | YES      | 'ja'         | BCP 47言語タグ   |
| notification_settings | JSONB       | YES      | (下記参照)   | 通知設定         |
| preferences           | JSONB       | YES      | '{}'         | 将来の拡張用設定 |

### 3.2 notification_settings デフォルト値

```json
{
  "email": true,
  "desktop": true,
  "sound": true,
  "workflowComplete": true,
  "workflowError": true
}
```

---

## 4. マイグレーションSQL

### 4.1 カラム追加

```sql
-- ファイル: supabase/migrations/003_extend_user_profiles.sql

-- =============================================================================
-- Migration: Extend user_profiles table with timezone, locale, notifications
-- Version: 003
-- Date: 2025-12-10
-- Description: Add timezone, locale, notification_settings, preferences columns
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
```

### 4.2 インデックス追加

```sql
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

-- 注意: GINインデックスは現在のアクセスパターンでは不要
-- 主キーインデックス (id) で単一ユーザーの設定取得は十分高速
-- 将来、notification_settings での検索が頻繁になった場合に検討
-- CREATE INDEX idx_user_profiles_notification_settings USING GIN ... は追加しない
```

### 4.3 バリデーション関数

```sql
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

-- CHECK制約追加
ALTER TABLE public.user_profiles
ADD CONSTRAINT check_timezone_valid
CHECK (timezone IS NULL OR public.is_valid_timezone(timezone));

ALTER TABLE public.user_profiles
ADD CONSTRAINT check_locale_valid
CHECK (locale IS NULL OR public.is_valid_locale(locale));
```

### 4.4 updated_at 自動更新トリガー

```sql
-- 既存トリガーがある場合は新カラムも対象に
-- (既存のupdated_at更新トリガーを維持)

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
```

---

## 5. RLSポリシー確認

### 5.1 既存ポリシー

新カラムは既存のRLSポリシーでカバーされる:

- `Users can view own profile`: 自分のプロフィールのみ閲覧可能
- `Users can update own profile`: 自分のプロフィールのみ更新可能

### 5.2 追加ポリシー（必要な場合）

```sql
-- 追加のポリシーは不要
-- 既存のSELECT/UPDATEポリシーが新カラムにも適用される
```

---

## 6. ロールバックSQL

### 6.1 カラム削除

```sql
-- ロールバック用SQL（必要時のみ実行）

-- インデックス削除
DROP INDEX IF EXISTS idx_user_profiles_timezone;
DROP INDEX IF EXISTS idx_user_profiles_locale;
DROP INDEX IF EXISTS idx_user_profiles_notification_settings;

-- 制約削除
ALTER TABLE public.user_profiles
DROP CONSTRAINT IF EXISTS check_timezone_valid;

ALTER TABLE public.user_profiles
DROP CONSTRAINT IF EXISTS check_locale_valid;

-- カラム削除
ALTER TABLE public.user_profiles
DROP COLUMN IF EXISTS timezone;

ALTER TABLE public.user_profiles
DROP COLUMN IF EXISTS locale;

ALTER TABLE public.user_profiles
DROP COLUMN IF EXISTS notification_settings;

ALTER TABLE public.user_profiles
DROP COLUMN IF EXISTS preferences;

-- バリデーション関数削除
DROP FUNCTION IF EXISTS public.is_valid_timezone(TEXT);
DROP FUNCTION IF EXISTS public.is_valid_locale(TEXT);
```

---

## 7. 拡張後のテーブル構造

### 7.1 完全スキーマ

```sql
-- 拡張後の user_profiles テーブル

CREATE TABLE public.user_profiles (
  -- 既存カラム
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  -- 新規カラム
  timezone VARCHAR(50) DEFAULT 'Asia/Tokyo',
  locale VARCHAR(10) DEFAULT 'ja',
  notification_settings JSONB DEFAULT '{
    "email": true,
    "desktop": true,
    "sound": true,
    "workflowComplete": true,
    "workflowError": true
  }'::jsonb,
  preferences JSONB DEFAULT '{}'::jsonb,

  -- 制約
  CONSTRAINT check_timezone_valid CHECK (timezone IS NULL OR public.is_valid_timezone(timezone)),
  CONSTRAINT check_locale_valid CHECK (locale IS NULL OR public.is_valid_locale(locale))
);
```

### 7.2 インデックス一覧

| インデックス名             | 対象カラム | 種類    | 条件               |
| -------------------------- | ---------- | ------- | ------------------ |
| user_profiles_pkey         | id         | PRIMARY | -                  |
| idx_user_profiles_timezone | timezone   | B-tree  | deleted_at IS NULL |
| idx_user_profiles_locale   | locale     | B-tree  | deleted_at IS NULL |
| idx_user_profiles_active   | id         | B-tree  | deleted_at IS NULL |

> **注意**: GINインデックス (`notification_settings`) は現在のアクセスパターンでは不要と判断。
> 将来、JSONB内の特定キーでの検索が頻繁になった場合に再検討。

---

## 8. サンプルクエリ

### 8.1 プロフィール取得

```sql
SELECT
  id,
  display_name,
  email,
  avatar_url,
  plan,
  timezone,
  locale,
  notification_settings,
  preferences,
  created_at,
  updated_at
FROM public.user_profiles
WHERE id = auth.uid()
  AND deleted_at IS NULL;
```

### 8.2 タイムゾーン更新

```sql
UPDATE public.user_profiles
SET timezone = 'America/New_York'
WHERE id = auth.uid()
  AND deleted_at IS NULL;
```

### 8.3 通知設定更新

```sql
UPDATE public.user_profiles
SET notification_settings = notification_settings || '{"email": false}'::jsonb
WHERE id = auth.uid()
  AND deleted_at IS NULL;
```

### 8.4 特定通知設定のユーザー検索

```sql
-- デスクトップ通知が有効なユーザー
SELECT id, display_name
FROM public.user_profiles
WHERE notification_settings->>'desktop' = 'true'
  AND deleted_at IS NULL;
```

---

## 9. パフォーマンス考慮事項

### 9.1 インデックス設計の根拠

| インデックス                | 根拠                                                 |
| --------------------------- | ---------------------------------------------------- |
| timezone                    | スケジュール実行時にタイムゾーン別にクエリする可能性 |
| locale                      | 多言語対応時にロケール別にクエリする可能性           |
| notification_settings (GIN) | JSONB内の特定キーでの検索最適化                      |

### 9.2 JSONB vs 正規化

**JSONB を選択した理由:**

1. **柔軟性**: 新しい通知タイプを追加する際にスキーマ変更不要
2. **単純性**: 設定項目が少数で、正規化のオーバーヘッドが大きい
3. **読み取り最適化**: 設定は一括読み取りが多く、個別検索は稀

**正規化が適切なケース（将来の検討事項）:**

- 設定項目が大幅に増加した場合
- 設定項目ごとの頻繁な個別更新が必要な場合

---

## 10. キャッシュ戦略

### 10.1 データ分類

| データ種別   | 保存先                        | 同期方針                     |
| ------------ | ----------------------------- | ---------------------------- |
| プロフィール | Supabase `user_profiles`      | Primary Source of Truth      |
| キャッシュ   | electron-store `profileCache` | 24時間 TTL、オフライン対応   |
| デバイス設定 | Turso `user_settings`         | ローカルオンリー（分離維持） |

### 10.2 読み込み戦略

```
起動時:
1. profileCache から読み込み（即時表示）
2. Supabase から最新データ取得
3. キャッシュを更新

オフライン時:
1. profileCache から読み込み
2. キャッシュ有効期限内であれば表示
3. 有効期限切れの場合は警告表示
```

### 10.3 書き込み戦略

```
設定変更時 (Write-through):
1. Supabase を更新
2. 成功後、profileCache を同期更新
3. 失敗時はロールバック（キャッシュ更新しない）

オフライン時:
1. 設定変更を拒否
2. オンライン復帰後に再試行を案内
```

---

## 11. 変更履歴

| 版  | 日付       | 変更内容                                                  | 担当者        |
| --- | ---------- | --------------------------------------------------------- | ------------- |
| 1.0 | 2025-12-10 | 初版作成                                                  | .claude/agents/db-architect.md |
| 1.1 | 2025-12-10 | レビュー指摘対応: GINインデックス削除、キャッシュ戦略追加 | Review Team   |

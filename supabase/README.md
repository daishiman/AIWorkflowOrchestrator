# Supabase Migrations

このディレクトリには、Supabase データベースのマイグレーションファイルが含まれています。

## マイグレーションファイル

| ファイル                         | 説明                                                  |
| -------------------------------- | ----------------------------------------------------- |
| `001_create_user_profiles.sql`   | user_profiles テーブル、RLSポリシー、自動作成トリガー |
| `002_create_avatars_storage.sql` | avatars Storageバケット、RLSポリシー                  |

## 実行方法

### 新しい環境のセットアップ

Supabase Dashboard の SQL Editor で、番号順にファイルの内容を実行してください：

1. `001_create_user_profiles.sql`
2. `002_create_avatars_storage.sql`

### 注意事項

- これらのSQLは**冪等**（何度実行しても同じ結果）になるよう設計されています
- `DROP POLICY IF EXISTS` で既存ポリシーを削除してから再作成します
- `ON CONFLICT DO NOTHING` で重複挿入を防ぎます

## テーブル構造

### user_profiles

| カラム       | 型          | 説明                           |
| ------------ | ----------- | ------------------------------ |
| id           | UUID        | 主キー（auth.users.id と同一） |
| display_name | TEXT        | 表示名                         |
| email        | TEXT        | メールアドレス                 |
| avatar_url   | TEXT        | アバター画像URL                |
| plan         | TEXT        | プラン（free/pro/enterprise）  |
| created_at   | TIMESTAMPTZ | 作成日時                       |
| updated_at   | TIMESTAMPTZ | 更新日時                       |
| deleted_at   | TIMESTAMPTZ | 削除日時（ソフトデリート用）   |

### Storage: avatars

- **バケット名**: `avatars`
- **公開**: はい
- **フォルダ構造**: `avatars/{user_id}/filename.jpg`

## RLSポリシー

### user_profiles

- SELECT: 自分のプロフィールのみ閲覧可能
- UPDATE: 自分のプロフィールのみ更新可能
- INSERT: 自分のIDでのみ作成可能

### avatars Storage

- INSERT: 自分のフォルダにのみアップロード可能
- SELECT: 全員が閲覧可能
- UPDATE: 自分のアバターのみ更新可能
- DELETE: 自分のアバターのみ削除可能

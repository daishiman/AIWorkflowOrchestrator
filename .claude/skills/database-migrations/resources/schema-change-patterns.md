# スキーマ変更パターン

## カラム操作

### カラム追加

**Nullable カラム（推奨）**:
```typescript
// スキーマ
description: text('description'),

// SQL
ALTER TABLE "workflows" ADD COLUMN "description" text;
```

**NOT NULL カラム（デフォルト値必須）**:
```typescript
// スキーマ
priority: integer('priority').notNull().default(0),

// SQL
ALTER TABLE "workflows" ADD COLUMN "priority" integer NOT NULL DEFAULT 0;
```

**既存データへの影響がある場合**:
```sql
-- Step 1: Nullable で追加
ALTER TABLE "workflows" ADD COLUMN "owner_id" uuid;

-- Step 2: データ移行
UPDATE "workflows" SET "owner_id" = "created_by_id";

-- Step 3: NOT NULL 追加
ALTER TABLE "workflows" ALTER COLUMN "owner_id" SET NOT NULL;

-- Step 4: 外部キー追加
ALTER TABLE "workflows"
ADD CONSTRAINT "workflows_owner_id_fkey"
FOREIGN KEY ("owner_id") REFERENCES "users"("id");
```

### カラム削除

**安全な削除手順**:

```sql
-- 1. アプリケーションでの使用を停止（デプロイ）

-- 2. 非推奨マーク（オプション）
COMMENT ON COLUMN "workflows"."legacy_field" IS 'DEPRECATED: Remove after 2024-02-01';

-- 3. 削除
ALTER TABLE "workflows" DROP COLUMN "legacy_field";
```

**CASCADE 削除（依存関係がある場合）**:
```sql
-- 制約も一緒に削除
ALTER TABLE "workflows" DROP COLUMN "category_id" CASCADE;
```

### カラム型変更

**互換性のある変更**:
```sql
-- varchar -> text（安全）
ALTER TABLE "users" ALTER COLUMN "name" TYPE text;

-- integer -> bigint（安全）
ALTER TABLE "counters" ALTER COLUMN "value" TYPE bigint;
```

**互換性のない変更（データ変換必要）**:
```sql
-- text -> integer
ALTER TABLE "settings" ALTER COLUMN "value" TYPE integer USING "value"::integer;

-- 注意: 変換できない値があるとエラー
```

**安全な型変更パターン**:
```sql
-- 1. 新カラム追加
ALTER TABLE "products" ADD COLUMN "price_decimal" numeric(10, 2);

-- 2. データ変換
UPDATE "products" SET "price_decimal" = "price"::numeric(10, 2);

-- 3. 制約追加
ALTER TABLE "products" ALTER COLUMN "price_decimal" SET NOT NULL;

-- 4. アプリケーション更新後、旧カラム削除
ALTER TABLE "products" DROP COLUMN "price";
ALTER TABLE "products" RENAME COLUMN "price_decimal" TO "price";
```

### カラム名変更

**直接リネーム**:
```sql
ALTER TABLE "users" RENAME COLUMN "name" TO "full_name";
```

**安全なリネーム（ダウンタイムなし）**:
```sql
-- 1. 新カラム追加
ALTER TABLE "users" ADD COLUMN "full_name" text;

-- 2. トリガーで同期（書き込み時）
CREATE OR REPLACE FUNCTION sync_name_columns()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW."name" IS DISTINCT FROM OLD."name" THEN
      NEW."full_name" := NEW."name";
    ELSIF NEW."full_name" IS DISTINCT FROM OLD."full_name" THEN
      NEW."name" := NEW."full_name";
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_name_trigger
BEFORE INSERT OR UPDATE ON "users"
FOR EACH ROW EXECUTE FUNCTION sync_name_columns();

-- 3. 既存データ移行
UPDATE "users" SET "full_name" = "name";

-- 4. アプリケーションを新カラムに移行

-- 5. トリガー削除
DROP TRIGGER sync_name_trigger ON "users";
DROP FUNCTION sync_name_columns();

-- 6. 旧カラム削除
ALTER TABLE "users" DROP COLUMN "name";
```

### デフォルト値変更

```sql
-- デフォルト値の設定
ALTER TABLE "workflows" ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- デフォルト値の削除
ALTER TABLE "workflows" ALTER COLUMN "status" DROP DEFAULT;
```

## 制約操作

### NOT NULL 追加

```sql
-- 既存データにNULLがない場合
ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL;

-- 既存データにNULLがある場合
UPDATE "users" SET "email" = 'unknown@example.com' WHERE "email" IS NULL;
ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL;
```

### NOT NULL 削除

```sql
ALTER TABLE "users" ALTER COLUMN "bio" DROP NOT NULL;
```

### 一意制約追加

```sql
-- 重複チェック
SELECT "email", COUNT(*) FROM "users" GROUP BY "email" HAVING COUNT(*) > 1;

-- 重複解消後に追加
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE ("email");
```

### 外部キー追加

```sql
-- データ整合性チェック
SELECT * FROM "orders" WHERE "user_id" NOT IN (SELECT "id" FROM "users");

-- 不整合データ処理後に追加
ALTER TABLE "orders"
ADD CONSTRAINT "orders_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id")
ON DELETE CASCADE;
```

### チェック制約追加

```sql
-- 既存データ検証
SELECT * FROM "products" WHERE "price" < 0;

-- 制約追加
ALTER TABLE "products"
ADD CONSTRAINT "products_price_positive" CHECK ("price" >= 0);
```

## インデックス操作

### インデックス追加

**通常の追加**:
```sql
CREATE INDEX "users_email_idx" ON "users" ("email");
```

**並列追加（大規模テーブル）**:
```sql
-- トランザクション外で実行
CREATE INDEX CONCURRENTLY "users_email_idx" ON "users" ("email");
```

**複合インデックス**:
```sql
CREATE INDEX "workflows_user_status_idx" ON "workflows" ("user_id", "status");
```

**部分インデックス**:
```sql
CREATE INDEX "workflows_active_idx" ON "workflows" ("status")
WHERE "deleted_at" IS NULL;
```

**GINインデックス（JSONB用）**:
```sql
CREATE INDEX "workflows_metadata_idx" ON "workflows" USING GIN ("metadata");
```

### インデックス削除

```sql
DROP INDEX "users_email_idx";

-- CONCURRENTLY オプション
DROP INDEX CONCURRENTLY "users_email_idx";
```

## テーブル操作

### テーブル作成

```sql
CREATE TABLE "notifications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type" text NOT NULL,
  "message" text NOT NULL,
  "read" boolean NOT NULL DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX "notifications_user_id_idx" ON "notifications" ("user_id");
CREATE INDEX "notifications_unread_idx" ON "notifications" ("user_id", "read") WHERE NOT "read";
```

### テーブル削除

```sql
-- 依存関係の確認
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE constraint_type = 'FOREIGN KEY'
  AND ccu.table_name = 'table_to_delete';

-- 外部キー削除後にテーブル削除
DROP TABLE "old_table";

-- CASCADE で依存関係ごと削除
DROP TABLE "old_table" CASCADE;
```

### テーブル名変更

```sql
ALTER TABLE "old_name" RENAME TO "new_name";
```

## 列挙型操作

### PostgreSQL ENUM

**作成**:
```sql
CREATE TYPE "workflow_status" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED');
```

**値の追加**:
```sql
ALTER TYPE "workflow_status" ADD VALUE 'PAUSED';

-- 特定位置に追加
ALTER TYPE "workflow_status" ADD VALUE 'PAUSED' BEFORE 'COMPLETED';
```

**注意**: PostgreSQL ENUMから値を削除することはできない。
削除が必要な場合は、TEXT型への移行を検討。

### TEXT型での列挙

```sql
-- チェック制約で制限
ALTER TABLE "workflows"
ADD CONSTRAINT "workflows_status_check"
CHECK ("status" IN ('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED', 'PAUSED'));

-- 値の追加（制約を再作成）
ALTER TABLE "workflows" DROP CONSTRAINT "workflows_status_check";
ALTER TABLE "workflows"
ADD CONSTRAINT "workflows_status_check"
CHECK ("status" IN ('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED', 'PAUSED', 'CANCELLED'));
```

## パーティショニング

### レンジパーティション

```sql
-- パーティション親テーブル
CREATE TABLE "events" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "created_at" timestamp NOT NULL,
  "data" jsonb
) PARTITION BY RANGE ("created_at");

-- パーティション追加
CREATE TABLE "events_2024_01" PARTITION OF "events"
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE "events_2024_02" PARTITION OF "events"
FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
```

### パーティション削除

```sql
-- パーティションを切り離し
ALTER TABLE "events" DETACH PARTITION "events_2023_01";

-- 削除
DROP TABLE "events_2023_01";
```

## チェックリスト

### 変更前

- [ ] 影響を受けるテーブル/カラムを特定したか？
- [ ] 既存データへの影響を確認したか？
- [ ] 必要なデータ変換を計画したか？

### 変更後

- [ ] マイグレーションは成功したか？
- [ ] データの整合性は保たれているか？
- [ ] パフォーマンスに問題はないか？

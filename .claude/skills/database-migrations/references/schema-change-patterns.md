# スキーマ変更パターン (SQLite)

## カラム操作

### カラム追加

**Nullable カラム（推奨）**:

```typescript
// スキーマ
description: text('description'),

// SQL
ALTER TABLE "workflows" ADD COLUMN "description" TEXT;
```

**NOT NULL カラム（デフォルト値必須）**:

```typescript
// スキーマ
priority: integer('priority').notNull().default(0),

// SQL
ALTER TABLE "workflows" ADD COLUMN "priority" INTEGER NOT NULL DEFAULT 0;
```

**既存データへの影響がある場合**:

```sql
-- Step 1: Nullable で追加
ALTER TABLE "workflows" ADD COLUMN "owner_id" TEXT;

-- Step 2: データ移行
UPDATE "workflows" SET "owner_id" = "created_by_id";

-- Step 3: NOT NULL 追加
-- SQLite注意: ALTER COLUMN はサポートされていません
-- テーブル再作成が必要（後述のテーブル再作成パターン参照）

-- Step 4: 外部キー追加
-- SQLite注意: ALTER TABLE で外部キーは追加できません
-- テーブル作成時に定義するか、テーブル再作成が必要
```

### カラム削除

**SQLite制限**: SQLiteは `DROP COLUMN` をサポートしていません（3.35.0以降はサポート）。
古いバージョンの場合はテーブル再作成が必要です。

**3.35.0以降の削除手順**:

```sql
-- 1. アプリケーションでの使用を停止（デプロイ）

-- 2. 削除（3.35.0+）
ALTER TABLE "workflows" DROP COLUMN "legacy_field";
```

**3.35.0未満の削除手順（テーブル再作成）**:

```sql
-- 1. 新テーブル作成（不要なカラムを除く）
CREATE TABLE "workflows_new" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "status" TEXT NOT NULL
  -- legacy_field は含めない
);

-- 2. データコピー
INSERT INTO "workflows_new" SELECT "id", "name", "status" FROM "workflows";

-- 3. 旧テーブル削除
DROP TABLE "workflows";

-- 4. テーブル名変更
ALTER TABLE "workflows_new" RENAME TO "workflows";

-- 5. インデックス再作成
CREATE INDEX "workflows_status_idx" ON "workflows" ("status");
```

### カラム型変更

**SQLite制限**: SQLiteは `ALTER COLUMN TYPE` をサポートしていません。
テーブル再作成が必要です。

**型変更パターン（テーブル再作成）**:

```sql
-- 1. 新テーブル作成（新しい型で）
CREATE TABLE "users_new" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,  -- 元は VARCHAR だったが TEXT に
  "email" TEXT UNIQUE NOT NULL
);

-- 2. データコピー（型変換）
INSERT INTO "users_new" SELECT "id", "name", "email" FROM "users";

-- 3. 旧テーブル削除
DROP TABLE "users";

-- 4. テーブル名変更
ALTER TABLE "users_new" RENAME TO "users";

-- 5. インデックス/トリガー再作成
CREATE INDEX "users_email_idx" ON "users" ("email");
```

**安全な型変更パターン（新カラムアプローチ）**:

```sql
-- 1. 新カラム追加
ALTER TABLE "products" ADD COLUMN "price_decimal" REAL;

-- 2. データ変換
UPDATE "products" SET "price_decimal" = CAST("price" AS REAL) / 100.0;

-- 3. アプリケーション更新後、テーブル再作成で旧カラム削除
-- （3.35.0未満の場合はテーブル再作成、3.35.0+はDROP COLUMN）
```

### カラム名変更

**直接リネーム**:

```sql
ALTER TABLE "users" RENAME COLUMN "name" TO "full_name";
```

**安全なリネーム（ダウンタイムなし）**:

```sql
-- 1. 新カラム追加
ALTER TABLE "users" ADD COLUMN "full_name" TEXT;

-- 2. トリガーで同期（書き込み時）
CREATE TRIGGER sync_name_trigger
AFTER INSERT ON "users"
BEGIN
  UPDATE "users" SET "full_name" = NEW."name" WHERE "id" = NEW."id";
END;

CREATE TRIGGER sync_name_update_trigger
AFTER UPDATE OF "name" ON "users"
BEGIN
  UPDATE "users" SET "full_name" = NEW."name" WHERE "id" = NEW."id";
END;

CREATE TRIGGER sync_fullname_update_trigger
AFTER UPDATE OF "full_name" ON "users"
BEGIN
  UPDATE "users" SET "name" = NEW."full_name" WHERE "id" = NEW."id";
END;

-- 3. 既存データ移行
UPDATE "users" SET "full_name" = "name";

-- 4. アプリケーションを新カラムに移行

-- 5. トリガー削除
DROP TRIGGER IF EXISTS sync_name_trigger;
DROP TRIGGER IF EXISTS sync_name_update_trigger;
DROP TRIGGER IF EXISTS sync_fullname_update_trigger;

-- 6. 旧カラム削除（テーブル再作成）
-- （3.35.0+の場合は DROP COLUMN 可能）
```

### デフォルト値変更

**SQLite制限**: SQLiteは `ALTER COLUMN SET/DROP DEFAULT` をサポートしていません。
テーブル再作成が必要です。

```sql
-- テーブル再作成でデフォルト値を変更
CREATE TABLE "workflows_new" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT'  -- デフォルト値を追加/変更
);

INSERT INTO "workflows_new" SELECT * FROM "workflows";
DROP TABLE "workflows";
ALTER TABLE "workflows_new" RENAME TO "workflows";
```

## 制約操作

### NOT NULL 追加

**SQLite制限**: SQLiteは `ALTER COLUMN SET NOT NULL` をサポートしていません。
テーブル再作成が必要です。

```sql
-- 既存データにNULLがある場合は先に修正
UPDATE "users" SET "email" = 'unknown@example.com' WHERE "email" IS NULL;

-- テーブル再作成でNOT NULL追加
CREATE TABLE "users_new" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL  -- NOT NULL を追加
);

INSERT INTO "users_new" SELECT * FROM "users";
DROP TABLE "users";
ALTER TABLE "users_new" RENAME TO "users";
```

### NOT NULL 削除

**SQLite制限**: テーブル再作成が必要です。

```sql
CREATE TABLE "users_new" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "bio" TEXT  -- NOT NULL を削除
);

INSERT INTO "users_new" SELECT * FROM "users";
DROP TABLE "users";
ALTER TABLE "users_new" RENAME TO "users";
```

### 一意制約追加

**SQLite注意**: 一意制約は `CREATE UNIQUE INDEX` で追加できますが、
名前付き制約として追加する場合はテーブル再作成が必要です。

```sql
-- 重複チェック
SELECT "email", COUNT(*) FROM "users" GROUP BY "email" HAVING COUNT(*) > 1;

-- インデックスで追加（推奨）
CREATE UNIQUE INDEX "users_email_unique" ON "users" ("email");

-- または、テーブル再作成で制約追加
CREATE TABLE "users_new" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT UNIQUE NOT NULL
);
```

### 外部キー追加

**SQLite制限**: SQLiteは `ALTER TABLE ADD CONSTRAINT FOREIGN KEY` をサポートしていません。
テーブル作成時に定義するか、テーブル再作成が必要です。

```sql
-- データ整合性チェック
SELECT * FROM "orders" WHERE "user_id" NOT IN (SELECT "id" FROM "users");

-- 外部キーを有効化（必須）
PRAGMA foreign_keys = ON;

-- テーブル再作成で外部キー追加
CREATE TABLE "orders_new" (
  "id" TEXT PRIMARY KEY,
  "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "total" REAL NOT NULL
);

INSERT INTO "orders_new" SELECT * FROM "orders";
DROP TABLE "orders";
ALTER TABLE "orders_new" RENAME TO "orders";
```

### チェック制約追加

**SQLite制限**: テーブル再作成が必要です。

```sql
-- 既存データ検証
SELECT * FROM "products" WHERE "price" < 0;

-- テーブル再作成でチェック制約追加
CREATE TABLE "products_new" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "price" REAL NOT NULL CHECK ("price" >= 0)
);

INSERT INTO "products_new" SELECT * FROM "products";
DROP TABLE "products";
ALTER TABLE "products_new" RENAME TO "products";
```

## インデックス操作

### インデックス追加

**通常の追加**:

```sql
CREATE INDEX "users_email_idx" ON "users" ("email");
```

**複合インデックス**:

```sql
CREATE INDEX "workflows_user_status_idx" ON "workflows" ("user_id", "status");
```

**部分インデックス（WHERE句）**:

```sql
CREATE INDEX "workflows_active_idx" ON "workflows" ("status")
WHERE "deleted_at" IS NULL;
```

**式インデックス**:

```sql
-- 小文字変換インデックス
CREATE INDEX "users_email_lower_idx" ON "users" (LOWER("email"));
```

**SQLite注意**: SQLiteは `CONCURRENTLY` をサポートしていません。
また、`GIN` や `GIST` などのインデックスタイプもサポートしていません。

### インデックス削除

```sql
DROP INDEX "users_email_idx";

-- または IF EXISTS で安全に削除
DROP INDEX IF EXISTS "users_email_idx";
```

## テーブル操作

### テーブル作成

```sql
-- 外部キーを有効化（必須）
PRAGMA foreign_keys = ON;

CREATE TABLE "notifications" (
  "id" TEXT PRIMARY KEY,
  "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "read" INTEGER NOT NULL DEFAULT 0,  -- SQLiteはBOOLEANをINTEGERとして扱う
  "created_at" TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX "notifications_user_id_idx" ON "notifications" ("user_id");
CREATE INDEX "notifications_unread_idx" ON "notifications" ("user_id", "read") WHERE "read" = 0;
```

### テーブル削除

**SQLite注意**: SQLiteは `information_schema` をサポートしていません。
依存関係確認には `pragma_foreign_key_list` を使用します。

```sql
-- 外部キー依存関係の確認
PRAGMA foreign_key_list('table_to_delete');

-- テーブル削除
DROP TABLE "old_table";

-- IF EXISTS で安全に削除
DROP TABLE IF EXISTS "old_table";
```

**SQLite注意**: SQLiteは `CASCADE` オプションをサポートしていません。
依存テーブルは手動で削除する必要があります。

### テーブル名変更

```sql
ALTER TABLE "old_name" RENAME TO "new_name";
```

## 列挙型操作

### TEXT型での列挙（推奨）

**SQLite注意**: SQLiteは `ENUM` 型をサポートしていません。
`TEXT` 型 + `CHECK` 制約で実装します。

```sql
-- チェック制約で制限（テーブル作成時）
CREATE TABLE "workflows" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "status" TEXT NOT NULL CHECK ("status" IN ('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED')),
  DEFAULT 'DRAFT'
);

-- 値の追加（テーブル再作成が必要）
CREATE TABLE "workflows_new" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "status" TEXT NOT NULL CHECK ("status" IN ('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED', 'PAUSED', 'CANCELLED')),
  DEFAULT 'DRAFT'
);

INSERT INTO "workflows_new" SELECT * FROM "workflows";
DROP TABLE "workflows";
ALTER TABLE "workflows_new" RENAME TO "workflows";
```

## テーブル再作成パターン

**SQLite制限のまとめ**: 以下の操作はテーブル再作成が必要です：

- カラム削除（3.35.0未満）
- カラム型変更
- NOT NULL追加/削除
- デフォルト値変更
- 外部キー追加
- チェック制約追加

**テーブル再作成の基本手順**:

```sql
-- 1. 外部キー無効化（一時的）
PRAGMA foreign_keys = OFF;

-- 2. トランザクション開始
BEGIN TRANSACTION;

-- 3. 新テーブル作成（新しいスキーマで）
CREATE TABLE "table_new" (
  -- 新しいスキーマ定義
);

-- 4. データコピー
INSERT INTO "table_new" SELECT * FROM "table";

-- 5. 旧テーブル削除
DROP TABLE "table";

-- 6. テーブル名変更
ALTER TABLE "table_new" RENAME TO "table";

-- 7. インデックス再作成
CREATE INDEX "idx_name" ON "table" ("column");

-- 8. トリガー再作成（必要に応じて）

-- 9. コミット
COMMIT;

-- 10. 外部キー再有効化
PRAGMA foreign_keys = ON;
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

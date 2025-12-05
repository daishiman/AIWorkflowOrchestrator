# ロールバック手順 (SQLite)

## ロールバックの基本

### ロールバックが必要な状況

1. **マイグレーション失敗**: 適用中にエラー発生
2. **データ不整合**: マイグレーション後にデータ問題
3. **アプリケーション障害**: 新スキーマでアプリが動作しない
4. **パフォーマンス問題**: クエリが極端に遅くなった

### ロールバックの準備

**事前準備チェックリスト**:

- [ ] マイグレーション前のバックアップ作成
- [ ] ロールバックスクリプトの準備
- [ ] テスト環境でのロールバック確認
- [ ] ダウンタイム見積もりの共有

## バックアップ戦略

### SQLiteバックアップ方法

```bash
# .backupコマンド（推奨）
sqlite3 database.db ".backup backup_before_migration.db"

# または、.dumpコマンド
sqlite3 database.db ".dump" > backup_$(date +%Y%m%d_%H%M%S).sql

# ファイルコピー（データベースファイルが閉じている場合）
cp database.db backup_$(date +%Y%m%d_%H%M%S).db
```

### libSQL/Tursoの場合

```bash
# libsqlツールでバックアップ
libsql --db-path file:database.db --dump > backup.sql

# または、Turso CLIでバックアップ
turso db shell <db-name> ".dump" > backup.sql
```

### テーブル単位のバックアップ

```sql
-- マイグレーション前にバックアップテーブル作成
CREATE TABLE "workflows_backup_20240115" AS SELECT * FROM "workflows";

-- ロールバック時に復元
DELETE FROM "workflows";
INSERT INTO "workflows" SELECT * FROM "workflows_backup_20240115";

-- バックアップ削除
DROP TABLE "workflows_backup_20240115";
```

## ロールバックパターン

### パターン1: 追加の取り消し

**カラム追加のロールバック**:

```sql
-- 追加されたカラムを削除
ALTER TABLE "users" DROP COLUMN "new_column";
```

**テーブル追加のロールバック**:

```sql
-- 追加されたテーブルを削除
DROP TABLE "new_table";
```

**インデックス追加のロールバック**:

```sql
DROP INDEX "new_index";

-- または IF EXISTS で安全に
DROP INDEX IF EXISTS "new_index";
```

**SQLite注意**: SQLiteは `CONCURRENTLY` をサポートしていません。

### パターン2: 削除の取り消し

**カラム削除のロールバック（3.35.0+）**:

```sql
-- バックアップからカラムを復元
ALTER TABLE "users" ADD COLUMN "deleted_column" TEXT;

UPDATE "users"
SET "deleted_column" = (
  SELECT "deleted_column" FROM "users_backup"
  WHERE "users_backup"."id" = "users"."id"
);
```

**カラム削除のロールバック（3.35.0未満 - テーブル再作成）**:

```sql
-- バックアップテーブルから新テーブル作成
CREATE TABLE "users_new" AS SELECT * FROM "users_backup";

-- 現在のテーブル削除
DROP TABLE "users";

-- テーブル名変更
ALTER TABLE "users_new" RENAME TO "users";

-- インデックス再作成
CREATE INDEX "users_email_idx" ON "users" ("email");
```

**テーブル削除のロールバック**:

```sql
-- バックアップから復元
CREATE TABLE "deleted_table" AS SELECT * FROM "deleted_table_backup";

-- 外部キーの再作成（テーブル再作成が必要）
-- SQLiteでは ALTER TABLE で外部キーを追加できないため、
-- related_table をテーブル再作成する必要があります
```

### パターン3: 型変更の取り消し

**SQLite制限**: テーブル再作成が必要です。

```sql
-- バックアップから旧スキーマでテーブル再作成
PRAGMA foreign_keys = OFF;
BEGIN TRANSACTION;

CREATE TABLE "products_new" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "price" INTEGER NOT NULL  -- 元の型に戻す
);

-- バックアップからデータ復元（型変換）
INSERT INTO "products_new"
SELECT "id", "name", CAST("price" AS INTEGER)
FROM "products_backup";

DROP TABLE "products";
ALTER TABLE "products_new" RENAME TO "products";

COMMIT;
PRAGMA foreign_keys = ON;
```

### パターン4: リネームの取り消し

```sql
-- テーブル名を元に戻す
ALTER TABLE "new_name" RENAME TO "old_name";

-- カラム名を元に戻す
ALTER TABLE "users" RENAME COLUMN "full_name" TO "name";
```

### パターン5: 制約変更の取り消し

**SQLite制限**: 制約削除にはテーブル再作成が必要です。

```sql
-- 一意インデックス削除（UNIQUE INDEX として追加した場合）
DROP INDEX IF EXISTS "users_email_unique";

-- テーブル再作成で制約削除
PRAGMA foreign_keys = OFF;
BEGIN TRANSACTION;

CREATE TABLE "users_new" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT  -- NOT NULL, UNIQUE, CHECK 制約を削除
);

INSERT INTO "users_new" SELECT * FROM "users";
DROP TABLE "users";
ALTER TABLE "users_new" RENAME TO "users";

COMMIT;
PRAGMA foreign_keys = ON;
```

## 段階的ロールバック

### 複数マイグレーションのロールバック

```sql
-- マイグレーション履歴確認
SELECT * FROM drizzle.__drizzle_migrations ORDER BY id DESC;

-- 特定のマイグレーションまでロールバック
-- (手動でロールバックSQLを実行)

-- マイグレーション履歴を更新
DELETE FROM drizzle.__drizzle_migrations WHERE id > [target_id];
```

### アプリケーションとの連携

```
1. アプリケーションをメンテナンスモードに
     ↓
2. データベースをロールバック
     ↓
3. 旧バージョンのアプリケーションをデプロイ
     ↓
4. 動作確認
     ↓
5. メンテナンスモード解除
```

## 自動ロールバックスクリプト

### ロールバックSQLの生成（SQLite版）

```bash
#!/bin/bash
# generate_rollback_sqlite.sh

MIGRATION_FILE=$1
OUTPUT_FILE="${MIGRATION_FILE%.sql}_rollback.sql"

echo "-- Rollback for: $MIGRATION_FILE (SQLite)" > $OUTPUT_FILE
echo "-- Generated: $(date)" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# CREATE TABLE -> DROP TABLE
grep -i "CREATE TABLE" $MIGRATION_FILE | while read line; do
  table=$(echo $line | sed -n 's/.*CREATE TABLE "\([^"]*\)".*/\1/p')
  echo "DROP TABLE IF EXISTS \"$table\";" >> $OUTPUT_FILE
done

# ADD COLUMN -> DROP COLUMN (3.35.0+のみ)
grep -i "ADD COLUMN" $MIGRATION_FILE | while read line; do
  table=$(echo $line | sed -n 's/.*ALTER TABLE "\([^"]*\)".*/\1/p')
  column=$(echo $line | sed -n 's/.*ADD COLUMN "\([^"]*\)".*/\1/p')
  echo "-- SQLite 3.35.0+のみ対応" >> $OUTPUT_FILE
  echo "ALTER TABLE \"$table\" DROP COLUMN \"$column\";" >> $OUTPUT_FILE
done

# CREATE INDEX -> DROP INDEX
grep -i "CREATE INDEX" $MIGRATION_FILE | while read line; do
  index=$(echo $line | sed -n 's/.*CREATE INDEX "\([^"]*\)".*/\1/p')
  echo "DROP INDEX IF EXISTS \"$index\";" >> $OUTPUT_FILE
done

echo "Rollback script generated: $OUTPUT_FILE"
```

### 実行スクリプト（SQLite版）

```bash
#!/bin/bash
# rollback_sqlite.sh

set -e

ROLLBACK_FILE=$1
DATABASE_FILE=$2

if [ -z "$ROLLBACK_FILE" ] || [ -z "$DATABASE_FILE" ]; then
  echo "Usage: rollback_sqlite.sh <rollback_file> <database_file>"
  exit 1
fi

echo "=== Starting Rollback (SQLite) ==="
echo "File: $ROLLBACK_FILE"
echo "Database: $DATABASE_FILE"
echo "Time: $(date)"

# バックアップ作成
echo "Creating backup..."
sqlite3 "$DATABASE_FILE" ".backup pre_rollback_$(date +%Y%m%d_%H%M%S).db"

# ロールバック実行
echo "Executing rollback..."
sqlite3 "$DATABASE_FILE" < "$ROLLBACK_FILE"

echo "=== Rollback Complete ==="
```

## 緊急ロールバック手順

### 手順書テンプレート

````markdown
# 緊急ロールバック手順

## 状況確認

1. [ ] エラー内容を記録
2. [ ] 影響範囲を特定
3. [ ] ロールバック判断（承認者: **\_**）

## ロールバック実行

1. [ ] アプリケーションをメンテナンスモードに
   ```bash
   # メンテナンスモード有効化
   ```
````

2. [ ] 現在のスキーマをバックアップ

   ```bash
   # SQLiteの場合
   sqlite3 database.db ".backup emergency_backup.db"

   # libSQL/Tursoの場合
   turso db shell <db-name> ".dump" > emergency_backup.sql
   ```

3. [ ] ロールバックSQL実行

   ```bash
   # SQLiteの場合
   sqlite3 database.db < rollback_0001.sql

   # libSQL/Tursoの場合
   turso db shell <db-name> < rollback_0001.sql
   ```

4. [ ] マイグレーション履歴更新

   ```sql
   DELETE FROM drizzle.__drizzle_migrations WHERE id = [migration_id];
   ```

5. [ ] 旧バージョンアプリデプロイ

   ```bash
   # デプロイコマンド
   ```

6. [ ] 動作確認
   - [ ] ヘルスチェック: OK
   - [ ] 基本機能: OK
   - [ ] データ整合性: OK

7. [ ] メンテナンスモード解除

## 事後対応

- [ ] 原因分析
- [ ] 再発防止策
- [ ] 関係者への報告

````

## Drizzle Kit固有の考慮事項（SQLite）

### マイグレーション履歴の管理

```sql
-- Drizzleマイグレーションテーブルの確認
SELECT * FROM drizzle.__drizzle_migrations;

-- 特定マイグレーションの削除
DELETE FROM drizzle.__drizzle_migrations
WHERE hash = 'specific_migration_hash';
```

### push:sqliteの取り消し

`drizzle-kit push:sqlite` は履歴を残さないため、手動でのロールバックが必要。

```bash
# 前回のスナップショットを確認
ls -la drizzle/meta/

# 前回のスキーマに戻す（手動）
# バックアップから復元するか、手動でSQL実行
sqlite3 database.db < previous_schema.sql
```

### Drizzleコマンド（SQLite用）

```bash
# マイグレーション生成
pnpm drizzle-kit generate:sqlite

# マイグレーション適用
pnpm drizzle-kit push:sqlite

# スタジオで確認
pnpm drizzle-kit studio
```

## チェックリスト

### ロールバック前

- [ ] バックアップは作成したか？
- [ ] ロールバックスクリプトはテスト済みか？
- [ ] ダウンタイム見積もりを共有したか？
- [ ] 承認は得たか？

### ロールバック後

- [ ] スキーマは想定通りか？
- [ ] データは正常か？
- [ ] アプリケーションは動作しているか？
- [ ] マイグレーション履歴は更新したか？

### 事後

- [ ] 原因分析は完了したか？
- [ ] 再発防止策は立てたか？
- [ ] ドキュメントは更新したか？
````

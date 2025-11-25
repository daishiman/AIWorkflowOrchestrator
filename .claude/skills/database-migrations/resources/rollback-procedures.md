# ロールバック手順

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

### 論理バックアップ（pg_dump）

```bash
# 特定テーブルのバックアップ
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME \
  -t workflows -t workflow_steps \
  -F c -f backup_before_migration.dump

# 全体バックアップ
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME \
  -F c -f full_backup_$(date +%Y%m%d_%H%M%S).dump
```

### ポイントインタイムリカバリ（PITR）

```bash
# Neon/Supabaseなどのクラウドサービスでは自動的にPITRが有効
# コンソールから特定時点への復元が可能
```

### テーブル単位のバックアップ

```sql
-- マイグレーション前にバックアップテーブル作成
CREATE TABLE "workflows_backup_20240115" AS SELECT * FROM "workflows";

-- ロールバック時に復元
TRUNCATE "workflows";
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
-- または
DROP INDEX CONCURRENTLY "new_index";
```

### パターン2: 削除の取り消し

**カラム削除のロールバック**:
```sql
-- バックアップからカラムを復元
ALTER TABLE "users" ADD COLUMN "deleted_column" text;

UPDATE "users" u
SET "deleted_column" = b."deleted_column"
FROM "users_backup" b
WHERE u."id" = b."id";
```

**テーブル削除のロールバック**:
```sql
-- バックアップから復元
CREATE TABLE "deleted_table" AS SELECT * FROM "deleted_table_backup";

-- 外部キーの再作成
ALTER TABLE "related_table"
ADD CONSTRAINT "fk_deleted_table"
FOREIGN KEY ("deleted_table_id") REFERENCES "deleted_table"("id");
```

### パターン3: 型変更の取り消し

```sql
-- 旧型に戻す
ALTER TABLE "products" ALTER COLUMN "price" TYPE integer USING "price"::integer;

-- または新カラムアプローチの逆
ALTER TABLE "products" DROP COLUMN "price";
ALTER TABLE "products" RENAME COLUMN "price_old" TO "price";
```

### パターン4: リネームの取り消し

```sql
-- テーブル名を元に戻す
ALTER TABLE "new_name" RENAME TO "old_name";

-- カラム名を元に戻す
ALTER TABLE "users" RENAME COLUMN "full_name" TO "name";
```

### パターン5: 制約変更の取り消し

```sql
-- NOT NULL削除
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;

-- 一意制約削除
ALTER TABLE "users" DROP CONSTRAINT "users_email_unique";

-- 外部キー削除
ALTER TABLE "orders" DROP CONSTRAINT "orders_user_id_fkey";

-- チェック制約削除
ALTER TABLE "products" DROP CONSTRAINT "products_price_positive";
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

### ロールバックSQLの生成

```bash
#!/bin/bash
# generate_rollback.sh

MIGRATION_FILE=$1
OUTPUT_FILE="${MIGRATION_FILE%.sql}_rollback.sql"

echo "-- Rollback for: $MIGRATION_FILE" > $OUTPUT_FILE
echo "-- Generated: $(date)" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# CREATE TABLE -> DROP TABLE
grep -i "CREATE TABLE" $MIGRATION_FILE | while read line; do
  table=$(echo $line | sed -n 's/.*CREATE TABLE "\([^"]*\)".*/\1/p')
  echo "DROP TABLE IF EXISTS \"$table\" CASCADE;" >> $OUTPUT_FILE
done

# ADD COLUMN -> DROP COLUMN
grep -i "ADD COLUMN" $MIGRATION_FILE | while read line; do
  table=$(echo $line | sed -n 's/.*ALTER TABLE "\([^"]*\)".*/\1/p')
  column=$(echo $line | sed -n 's/.*ADD COLUMN "\([^"]*\)".*/\1/p')
  echo "ALTER TABLE \"$table\" DROP COLUMN IF EXISTS \"$column\";" >> $OUTPUT_FILE
done

# CREATE INDEX -> DROP INDEX
grep -i "CREATE INDEX" $MIGRATION_FILE | while read line; do
  index=$(echo $line | sed -n 's/.*CREATE INDEX "\([^"]*\)".*/\1/p')
  echo "DROP INDEX IF EXISTS \"$index\";" >> $OUTPUT_FILE
done

echo "Rollback script generated: $OUTPUT_FILE"
```

### 実行スクリプト

```bash
#!/bin/bash
# rollback.sh

set -e

ROLLBACK_FILE=$1
DATABASE_URL=$2

if [ -z "$ROLLBACK_FILE" ] || [ -z "$DATABASE_URL" ]; then
  echo "Usage: rollback.sh <rollback_file> <database_url>"
  exit 1
fi

echo "=== Starting Rollback ==="
echo "File: $ROLLBACK_FILE"
echo "Time: $(date)"

# バックアップ作成
echo "Creating backup..."
pg_dump "$DATABASE_URL" -F c -f "pre_rollback_$(date +%Y%m%d_%H%M%S).dump"

# ロールバック実行
echo "Executing rollback..."
psql "$DATABASE_URL" -f "$ROLLBACK_FILE"

echo "=== Rollback Complete ==="
```

## 緊急ロールバック手順

### 手順書テンプレート

```markdown
# 緊急ロールバック手順

## 状況確認
1. [ ] エラー内容を記録
2. [ ] 影響範囲を特定
3. [ ] ロールバック判断（承認者: _____）

## ロールバック実行
1. [ ] アプリケーションをメンテナンスモードに
   ```bash
   # メンテナンスモード有効化
   ```

2. [ ] 現在のスキーマをバックアップ
   ```bash
   pg_dump $DATABASE_URL -F c -f emergency_backup.dump
   ```

3. [ ] ロールバックSQL実行
   ```bash
   psql $DATABASE_URL -f rollback_0001.sql
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
```

## Drizzle Kit固有の考慮事項

### マイグレーション履歴の管理

```sql
-- Drizzleマイグレーションテーブルの確認
SELECT * FROM drizzle.__drizzle_migrations;

-- 特定マイグレーションの削除
DELETE FROM drizzle.__drizzle_migrations
WHERE hash = 'specific_migration_hash';
```

### pushの取り消し

`drizzle-kit push` は履歴を残さないため、手動でのロールバックが必要。

```bash
# 前回のスナップショットを確認
ls -la drizzle/meta/

# 前回のスキーマに戻す（手動）
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

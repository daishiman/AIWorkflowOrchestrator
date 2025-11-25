# ゼロダウンタイムマイグレーションパターン

## 概要

本番環境でサービスを停止せずにデータベーススキーマを変更するためのパターン集です。

---

## 基本原則

### 後方互換性の維持

```
旧スキーマ ─→ 移行期間 ─→ 新スキーマ
     │            │            │
  旧コード     両対応コード    新コード
```

**重要**: コードとスキーマの変更は別々にデプロイする

---

## パターン1: カラム追加

### 安全なアプローチ

```sql
-- Step 1: カラム追加（NOT NULL制約なし、デフォルト値なし）
ALTER TABLE users ADD COLUMN nickname VARCHAR(100);

-- Step 2: コードデプロイ（新カラムに書き込み開始）

-- Step 3: 既存データのバックフィル
UPDATE users SET nickname = name WHERE nickname IS NULL;

-- Step 4: NOT NULL制約追加（必要な場合）
ALTER TABLE users ALTER COLUMN nickname SET NOT NULL;
```

### Drizzle ORM実装

```typescript
// migrations/0001_add_nickname.sql
ALTER TABLE "users" ADD COLUMN "nickname" varchar(100);

// schema.ts (段階的)
// Step 1: optional
nickname: varchar('nickname', { length: 100 }),

// Step 2: after backfill
nickname: varchar('nickname', { length: 100 }).notNull(),
```

---

## パターン2: カラム名変更

### Expand and Contract パターン

```
Phase 1: Expand（拡張）
  - 新カラムを追加
  - 両カラムに書き込み

Phase 2: Migrate（移行）
  - 既存データをコピー
  - 読み取りを新カラムに切り替え

Phase 3: Contract（縮小）
  - 旧カラムへの書き込み停止
  - 旧カラムを削除
```

### 実装例

```sql
-- Phase 1: 新カラム追加
ALTER TABLE users ADD COLUMN full_name VARCHAR(200);

-- コードは両方に書き込み、nameから読み取り
UPDATE users SET full_name = name;  -- 初期同期

-- Phase 2: トリガーで同期（オプション）
CREATE OR REPLACE FUNCTION sync_name_columns()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.name IS DISTINCT FROM OLD.name THEN
    NEW.full_name := NEW.name;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Phase 3: 読み取りを新カラムに切り替え
-- Phase 4: 旧カラム削除
ALTER TABLE users DROP COLUMN name;
```

---

## パターン3: カラム削除

### 安全な削除手順

```
1. コードで使用を停止
2. 数回のデプロイで問題ないことを確認
3. カラムを削除
```

### 実装

```typescript
// Step 1: スキーマからコメントアウト（コードは使用停止済み）
// deprecated_column: varchar('deprecated_column', { length: 100 }),

// Step 2: マイグレーションで削除
ALTER TABLE "users" DROP COLUMN "deprecated_column";
```

---

## パターン4: テーブル名変更

### ビューを使用したアプローチ

```sql
-- Step 1: テーブル名を変更
ALTER TABLE customers RENAME TO clients;

-- Step 2: 互換性ビューを作成
CREATE VIEW customers AS SELECT * FROM clients;

-- Step 3: コードを段階的に更新

-- Step 4: ビューを削除
DROP VIEW customers;
```

---

## パターン5: データ型変更

### 安全な型変更

| 変更 | 安全性 | 方法 |
|------|--------|------|
| VARCHAR(50)→VARCHAR(100) | ✅安全 | 直接変更可 |
| VARCHAR(100)→VARCHAR(50) | ⚠️危険 | データ確認必要 |
| INTEGER→BIGINT | ✅安全 | 直接変更可 |
| VARCHAR→INTEGER | ❌危険 | 新カラム方式 |

### 安全でない型変更の例

```sql
-- Step 1: 新カラム追加
ALTER TABLE products ADD COLUMN price_numeric NUMERIC(10,2);

-- Step 2: データ変換
UPDATE products SET price_numeric = price::NUMERIC(10,2);

-- Step 3: 検証
SELECT COUNT(*) FROM products
WHERE price::NUMERIC(10,2) != price_numeric;

-- Step 4: コード切り替え後、旧カラム削除
ALTER TABLE products DROP COLUMN price;
ALTER TABLE products RENAME COLUMN price_numeric TO price;
```

---

## パターン6: NOT NULL制約追加

### 段階的アプローチ

```sql
-- Step 1: デフォルト値でNULLを埋める
UPDATE users SET status = 'active' WHERE status IS NULL;

-- Step 2: 検証
SELECT COUNT(*) FROM users WHERE status IS NULL;  -- 0であること

-- Step 3: 制約追加
ALTER TABLE users ALTER COLUMN status SET NOT NULL;
```

### バッチ処理での更新

```typescript
// 大量データの場合はバッチ処理
async function backfillStatus() {
  let updated = 0;
  do {
    const result = await db.execute(sql`
      UPDATE users
      SET status = 'active'
      WHERE id IN (
        SELECT id FROM users
        WHERE status IS NULL
        LIMIT 1000
      )
    `);
    updated = result.rowCount;
    // 負荷軽減のため待機
    await sleep(100);
  } while (updated > 0);
}
```

---

## パターン7: インデックス追加

### CONCURRENTLY オプション

```sql
-- 非ブロッキングでインデックス作成
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
```

**注意点**:
- トランザクション内では使用不可
- 失敗時は INVALID 状態のインデックスが残る
- 失敗後は `DROP INDEX` してリトライ

---

## パターン8: 外部キー追加

### NOT VALID を使用

```sql
-- Step 1: 制約追加（既存データ検証なし）
ALTER TABLE orders
ADD CONSTRAINT fk_orders_user
FOREIGN KEY (user_id) REFERENCES users(id)
NOT VALID;

-- Step 2: 既存データを検証（バックグラウンドで）
ALTER TABLE orders VALIDATE CONSTRAINT fk_orders_user;
```

---

## アンチパターン

### ❌ やってはいけないこと

```sql
-- ロックが長時間保持される
ALTER TABLE large_table ADD COLUMN new_col VARCHAR(100) DEFAULT 'value';

-- 大量データの同期更新
UPDATE large_table SET new_col = compute_value(old_col);

-- トランザクション内でのDDL
BEGIN;
  ALTER TABLE users ADD COLUMN status VARCHAR(20);
  UPDATE users SET status = 'active';
COMMIT;
```

### ✅ 代わりにすべきこと

```sql
-- デフォルト値なしで追加
ALTER TABLE large_table ADD COLUMN new_col VARCHAR(100);

-- バッチ更新
UPDATE large_table SET new_col = compute_value(old_col)
WHERE id BETWEEN 1 AND 10000;

-- DDLは個別トランザクション
ALTER TABLE users ADD COLUMN status VARCHAR(20);
-- 別途更新
UPDATE users SET status = 'active' WHERE status IS NULL;
```

---

## チェックリスト

### デプロイ前

- [ ] マイグレーションは後方互換性があるか
- [ ] ロールバック手順は明確か
- [ ] 大量データ更新はバッチ処理か
- [ ] インデックスは CONCURRENTLY で作成するか

### デプロイ中

- [ ] モニタリングは稼働しているか
- [ ] ロック待ちは発生していないか
- [ ] レプリケーション遅延は許容範囲か

### デプロイ後

- [ ] アプリケーションは正常に動作しているか
- [ ] パフォーマンスに問題はないか
- [ ] エラーログに異常はないか

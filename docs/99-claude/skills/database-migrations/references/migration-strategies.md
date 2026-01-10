# マイグレーション戦略

## マイグレーションの分類

### リスクレベル別

| リスク | 操作     | 例                       | 対策                   |
| ------ | -------- | ------------------------ | ---------------------- |
| 低     | 追加のみ | カラム追加、テーブル作成 | 通常のマイグレーション |
| 中     | 制約追加 | NOT NULL、外部キー       | データ検証後に適用     |
| 高     | 型変更   | カラム型変更、リネーム   | 段階的移行             |
| 最高   | 削除     | カラム削除、テーブル削除 | 多段階マイグレーション |

## 低リスク: 追加のみの変更

### 新規テーブル作成

```typescript
// 1. スキーマに追加
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 2. マイグレーション生成
// pnpm db:generate --name create_notifications

// 3. 生成されるSQL
// CREATE TABLE "notifications" (
//   "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
//   "user_id" uuid NOT NULL REFERENCES "users"("id"),
//   "message" text NOT NULL,
//   "read" boolean NOT NULL DEFAULT false,
//   "created_at" timestamp NOT NULL DEFAULT now()
// );
```

### Nullableカラム追加

```typescript
// 1. スキーマに追加
bio: text('bio'),  // nullable

// 2. 生成されるSQL
// ALTER TABLE "users" ADD COLUMN "bio" text;
```

### インデックス追加

```typescript
// 1. スキーマに追加
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
}))

// 2. 生成されるSQL
// CREATE INDEX "users_email_idx" ON "users" ("email");
```

## 中リスク: 制約変更

### NOT NULL制約の追加

**段階的アプローチ**:

```sql
-- Step 1: デフォルト値を設定
ALTER TABLE "users" ALTER COLUMN "email" SET DEFAULT '';

-- Step 2: 既存のNULL値を更新
UPDATE "users" SET "email" = 'unknown@example.com' WHERE "email" IS NULL;

-- Step 3: NOT NULL制約を追加
ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL;

-- Step 4: デフォルトを削除（必要に応じて）
ALTER TABLE "users" ALTER COLUMN "email" DROP DEFAULT;
```

### 外部キー追加

```sql
-- Step 1: 無効な参照をクリーンアップ
DELETE FROM "orders" WHERE "user_id" NOT IN (SELECT "id" FROM "users");

-- Step 2: 外部キー追加
ALTER TABLE "orders"
ADD CONSTRAINT "orders_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id");
```

### 一意制約追加

```sql
-- Step 1: 重複をチェック
SELECT "email", COUNT(*) FROM "users" GROUP BY "email" HAVING COUNT(*) > 1;

-- Step 2: 重複を解消
-- （アプリケーション固有の解決方法）

-- Step 3: 一意制約追加
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE ("email");
```

## 高リスク: 型変更

### カラム型の変更

**安全なアプローチ: 新カラム + 移行 + 削除**

```sql
-- Migration 1: 新カラム追加
ALTER TABLE "products" ADD COLUMN "price_new" numeric(10, 2);

-- Migration 2: データ移行
UPDATE "products" SET "price_new" = "price"::numeric(10, 2);

-- Migration 3: NOT NULL追加（データ確認後）
ALTER TABLE "products" ALTER COLUMN "price_new" SET NOT NULL;

-- アプリケーションを更新して新カラムを使用

-- Migration 4: 旧カラム削除
ALTER TABLE "products" DROP COLUMN "price";

-- Migration 5: リネーム
ALTER TABLE "products" RENAME COLUMN "price_new" TO "price";
```

### カラム名の変更

**段階的アプローチ**:

```sql
-- Migration 1: 新カラム追加 + データコピー
ALTER TABLE "users" ADD COLUMN "full_name" text;
UPDATE "users" SET "full_name" = "name";

-- アプリケーションを更新して両方のカラムに書き込み

-- Migration 2: 読み取りを新カラムに切り替え

-- Migration 3: 旧カラム削除
ALTER TABLE "users" DROP COLUMN "name";
```

## 最高リスク: 削除操作

### カラム削除

**多段階アプローチ**:

```
1. 新バージョンのアプリデプロイ（カラム使用停止）
     ↓
2. 数日間の監視
     ↓
3. カラム削除マイグレーション
     ↓
4. バックアップ確認
```

```sql
-- 安全のためCOMMENTを追加してから削除
COMMENT ON COLUMN "users"."legacy_field" IS 'DEPRECATED: Will be removed on 2024-01-15';

-- 削除
ALTER TABLE "users" DROP COLUMN "legacy_field";
```

### テーブル削除

**多段階アプローチ**:

```sql
-- Step 1: テーブル名変更（ソフト削除）
ALTER TABLE "old_table" RENAME TO "_deprecated_old_table";

-- Step 2: 数日間監視

-- Step 3: バックアップ作成
CREATE TABLE "backup_old_table" AS SELECT * FROM "_deprecated_old_table";

-- Step 4: 削除
DROP TABLE "_deprecated_old_table";
```

## 大規模データの扱い

### バッチ処理

```sql
-- 大量データの更新（バッチ処理）
DO $$
DECLARE
  batch_size INT := 10000;
  affected INT;
BEGIN
  LOOP
    UPDATE "users"
    SET "status" = 'ACTIVE'
    WHERE "id" IN (
      SELECT "id" FROM "users"
      WHERE "status" IS NULL
      LIMIT batch_size
    );

    GET DIAGNOSTICS affected = ROW_COUNT;
    EXIT WHEN affected = 0;

    COMMIT;
    PERFORM pg_sleep(0.1);  -- 負荷軽減
  END LOOP;
END $$;
```

### 並列インデックス作成

```sql
-- テーブルロックなしでインデックス作成
CREATE INDEX CONCURRENTLY "large_table_idx" ON "large_table" ("column");
```

## ダウンタイムの最小化

### オンラインマイグレーション

1. **読み取り可能な状態を維持**
   - 新カラムを追加（nullable）
   - データを移行
   - 制約を追加

2. **切り替え時間を最小化**
   - 準備を事前に完了
   - 切り替え操作のみ短時間で実行

### ブルーグリーンデプロイ

```
1. Green環境に新スキーマを適用
     ↓
2. Green環境でテスト
     ↓
3. トラフィックをGreenに切り替え
     ↓
4. 問題があればBlueに戻す
```

## マイグレーション順序

### 依存関係の考慮

```
正しい順序:
1. 参照先テーブル作成
2. 参照元テーブル作成
3. 外部キー追加
4. インデックス追加

削除の順序:
1. 外部キー削除
2. 参照元テーブル削除
3. 参照先テーブル削除
```

## チェックリスト

### マイグレーション計画時

- [ ] リスクレベルは評価したか？
- [ ] 段階的アプローチが必要か？
- [ ] ダウンタイムの見積もりはあるか？
- [ ] ロールバック計画はあるか？

### 実行時

- [ ] バックアップは作成したか？
- [ ] ステージングでテストしたか？
- [ ] モニタリングは準備したか？

---
name: database-migrations
description: |
  安全で可逆的なデータベースマイグレーションの設計と実行。
  Drizzle Kit、ゼロダウンタイム戦略、ロールバック計画を提供。

  専門分野:
  - Drizzle Kit: generate、push、migrate コマンドの適切な使用
  - ゼロダウンタイム: 互換性維持、段階的デプロイ
  - ロールバック: UP/DOWNマイグレーション、復旧手順
  - データ移行: スキーマ変更とデータ移行の分離

  使用タイミング:
  - スキーマ変更のマイグレーション設計時
  - 本番環境へのデプロイ計画時
  - ロールバック手順の策定時
  - 大規模データ移行の計画時

  Use proactively when planning schema migrations, designing rollback procedures,
  or executing production database changes.
version: 1.0.0
---

# Database Migrations Skill

## 参照コマンド

```bash
# 詳細リソース参照
cat .claude/skills/database-migrations/resources/zero-downtime-patterns.md

# チェックリストテンプレート参照
cat .claude/skills/database-migrations/templates/migration-checklist.md

# ロールバックSQL生成スクリプト実行
node .claude/skills/database-migrations/scripts/generate-rollback.mjs migrations/0001_example.sql
```

## 概要

このスキルは、データベースマイグレーションの設計と実行に関する専門知識を提供します。
Drizzle Kitを活用し、安全で可逆的なスキーマ変更を実現します。

## Drizzle Kit の基本

### コマンド概要

| コマンド | 用途 | 環境 |
|----------|------|------|
| `drizzle-kit generate` | マイグレーションSQL生成 | 開発 |
| `drizzle-kit push` | 即座にスキーマ同期 | 開発 |
| `drizzle-kit migrate` | マイグレーション適用 | 本番 |
| `drizzle-kit studio` | GUIでデータ確認 | 開発 |

### 設定ファイル

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/shared/infrastructure/database/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
```

### マイグレーションワークフロー

```bash
# 1. スキーマ変更
# schema.ts を編集

# 2. マイグレーション生成
npx drizzle-kit generate

# 3. マイグレーション確認
# drizzle/migrations/YYYYMMDDHHMMSS_*.sql を確認

# 4. 開発環境で適用
npx drizzle-kit migrate

# 5. 本番環境で適用
# CI/CDパイプラインで実行
```

## マイグレーション設計原則

### 1. 前方互換性の維持

古いアプリケーションバージョンが新しいスキーマで動作可能にする。

```sql
-- ✅ 前方互換: カラム追加（NULL許可 or デフォルト値）
ALTER TABLE users ADD COLUMN nickname VARCHAR(100);
ALTER TABLE users ADD COLUMN theme VARCHAR(20) DEFAULT 'light';

-- ❌ 非互換: 既存カラム削除（即座に）
ALTER TABLE users DROP COLUMN legacy_field;
```

### 2. 後方互換性の維持

新しいアプリケーションバージョンが古いスキーマで動作可能にする。

```sql
-- ✅ 後方互換: 新しいカラムはアプリで任意扱い
-- アプリケーション: nickname ?? 'default'

-- ❌ 非互換: 新しい必須カラムを即座に追加
ALTER TABLE users ADD COLUMN required_field VARCHAR(100) NOT NULL;
```

### 3. スキーマ変更とデータ移行の分離

```sql
-- マイグレーション1: スキーマ変更のみ
ALTER TABLE users ADD COLUMN full_name VARCHAR(200);

-- マイグレーション2: データ移行（別途実行）
UPDATE users SET full_name = first_name || ' ' || last_name;

-- マイグレーション3: 古いカラム削除（十分な移行期間後）
ALTER TABLE users DROP COLUMN first_name;
ALTER TABLE users DROP COLUMN last_name;
```

## ゼロダウンタイムマイグレーション

### パターン1: Expand-Contract パターン

#### Phase 1: Expand（拡張）

```sql
-- 新しいカラムを追加（NULL許可）
ALTER TABLE orders ADD COLUMN status_new VARCHAR(20);

-- 新しいインデックスをCONCURRENTLYで追加
CREATE INDEX CONCURRENTLY idx_orders_status_new ON orders(status_new);
```

#### Phase 2: Migrate（移行）

```sql
-- データ移行（バッチ処理）
UPDATE orders SET status_new = status WHERE status_new IS NULL LIMIT 10000;
-- 繰り返し実行
```

#### Phase 3: Contract（収縮）

```sql
-- 古いカラムを削除（十分な移行期間後）
ALTER TABLE orders DROP COLUMN status;
ALTER TABLE orders RENAME COLUMN status_new TO status;
```

### パターン2: 影響の少ない変更

```sql
-- ✅ ダウンタイムなし
ALTER TABLE users ADD COLUMN bio TEXT;
ALTER TABLE users ALTER COLUMN name TYPE VARCHAR(500);  -- 拡張のみ
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);

-- ⚠️ ダウンタイムの可能性
ALTER TABLE users ALTER COLUMN name SET NOT NULL;  -- 既存データ確認必要
ALTER TABLE users ADD CONSTRAINT chk_status CHECK (status IN ('active', 'inactive'));
```

### パターン3: インデックス作成

```sql
-- ❌ テーブルロック
CREATE INDEX idx_large_table ON large_table(column);

-- ✅ ロックなし（時間はかかる）
CREATE INDEX CONCURRENTLY idx_large_table ON large_table(column);
```

## ロールバック設計

### UP/DOWN マイグレーション

```sql
-- migration_20250126_add_nickname.sql

-- UP
ALTER TABLE users ADD COLUMN nickname VARCHAR(100);
CREATE INDEX idx_users_nickname ON users(nickname);

-- DOWN
DROP INDEX IF EXISTS idx_users_nickname;
ALTER TABLE users DROP COLUMN IF EXISTS nickname;
```

### Drizzle でのロールバック

```typescript
// 手動ロールバックスクリプト
import { drizzle } from 'drizzle-orm/neon-http';
import { sql } from 'drizzle-orm';

async function rollback() {
  const db = drizzle(process.env.DATABASE_URL!);

  await db.transaction(async (tx) => {
    // ロールバック操作
    await tx.execute(sql`ALTER TABLE users DROP COLUMN IF EXISTS nickname`);

    // マイグレーション履歴を更新
    await tx.execute(sql`
      DELETE FROM __drizzle_migrations
      WHERE id = 'migration_20250126_add_nickname'
    `);
  });
}
```

### ロールバック可能性の評価

| 操作 | ロールバック可能 | 注意点 |
|------|-----------------|--------|
| ADD COLUMN (NULL) | ✅ 容易 | DROP COLUMN |
| ADD COLUMN (NOT NULL) | ⚠️ 条件付き | データ損失なし確認 |
| DROP COLUMN | ❌ 困難 | データ復旧必要 |
| RENAME COLUMN | ✅ 容易 | 再度RENAME |
| ADD INDEX | ✅ 容易 | DROP INDEX |
| ADD CONSTRAINT | ⚠️ 条件付き | データ修正必要な場合 |

## 本番デプロイ戦略

### 1. Pre-deploy Check

```bash
#!/bin/bash
# deploy-check.sh

# マイグレーションファイルの確認
echo "=== Pending Migrations ==="
npx drizzle-kit check

# 本番DBへの接続テスト
echo "=== Connection Test ==="
npx drizzle-kit studio --port 4000 &
sleep 5
curl -s http://localhost:4000/health
kill %1
```

### 2. デプロイ順序

```
1. データベースマイグレーション適用
   ↓
2. 新バージョンアプリケーションデプロイ（一部）
   ↓
3. 動作確認（Canary）
   ↓
4. 全インスタンスにデプロイ
   ↓
5. 古いスキーマ要素の削除（後日）
```

### 3. CI/CD統合

```yaml
# .github/workflows/deploy.yml
jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Migrations
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: |
          npx drizzle-kit migrate

      - name: Verify Migration
        run: |
          npx drizzle-kit check
```

## 大規模データ移行

### バッチ処理パターン

```typescript
async function migrateInBatches(batchSize: number = 10000) {
  let processedCount = 0;
  let hasMore = true;

  while (hasMore) {
    const result = await db.execute(sql`
      UPDATE orders
      SET status_new = status
      WHERE status_new IS NULL
      LIMIT ${batchSize}
    `);

    processedCount += result.rowCount ?? 0;
    hasMore = (result.rowCount ?? 0) === batchSize;

    console.log(`Processed: ${processedCount}`);

    // レート制限
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`Migration complete: ${processedCount} rows`);
}
```

### 進捗監視

```sql
-- 移行進捗の確認
SELECT
  COUNT(*) FILTER (WHERE status_new IS NOT NULL) AS migrated,
  COUNT(*) FILTER (WHERE status_new IS NULL) AS pending,
  COUNT(*) AS total,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status_new IS NOT NULL) / COUNT(*), 2) AS percent
FROM orders;
```

## マイグレーションのベストプラクティス

### 命名規則

```
drizzle/migrations/
├── 0001_YYYYMMDDHHMMSS_create_users_table.sql
├── 0002_YYYYMMDDHHMMSS_add_users_email_index.sql
├── 0003_YYYYMMDDHHMMSS_add_orders_table.sql
└── 0004_YYYYMMDDHHMMSS_add_orders_status_column.sql
```

### マイグレーションファイルの構造

```sql
-- 0004_20250126120000_add_orders_status_column.sql
-- Description: ordersテーブルにstatus列を追加
-- Author: @db-architect
-- Reversible: Yes

-- Dependencies: 0003_create_orders_table

-- === UP ===
ALTER TABLE orders ADD COLUMN status VARCHAR(20) DEFAULT 'pending';
CREATE INDEX CONCURRENTLY idx_orders_status ON orders(status);

-- === DOWN ===
-- DROP INDEX IF EXISTS idx_orders_status;
-- ALTER TABLE orders DROP COLUMN IF EXISTS status;
```

### トランザクション境界

```sql
-- ✅ DDLは個別に実行（PostgreSQL特有）
ALTER TABLE users ADD COLUMN nickname VARCHAR(100);
-- コミット

ALTER TABLE users ADD COLUMN bio TEXT;
-- コミット

-- ❌ 複数DDLをトランザクションで囲まない（ロック競合）
BEGIN;
ALTER TABLE users ADD COLUMN nickname VARCHAR(100);
ALTER TABLE users ADD COLUMN bio TEXT;
COMMIT;
```

## 設計判断チェックリスト

### マイグレーション設計時

- [ ] 前方互換性が維持されているか？
- [ ] 後方互換性が維持されているか？
- [ ] ロールバック手順が定義されているか？
- [ ] スキーマ変更とデータ移行が分離されているか？

### 本番デプロイ前

- [ ] 開発・ステージング環境でテスト済みか？
- [ ] インデックス作成は CONCURRENTLY を使用しているか？
- [ ] 大規模データ移行はバッチ処理になっているか？
- [ ] デプロイ手順が文書化されているか？

### デプロイ後

- [ ] マイグレーション成功を確認したか？
- [ ] アプリケーション動作を確認したか？
- [ ] パフォーマンス影響を監視しているか？
- [ ] 古いスキーマ要素の削除スケジュールを立てたか？

## 関連スキル

- `.claude/skills/database-normalization/SKILL.md` - スキーマ設計の基盤
- `.claude/skills/indexing-strategies/SKILL.md` - インデックスマイグレーション
- `.claude/skills/transaction-management/SKILL.md` - マイグレーション中のトランザクション

## 参照リソース

詳細な情報は以下のリソースを参照:

```bash
# ゼロダウンタイムマイグレーションパターン
cat .claude/skills/database-migrations/resources/zero-downtime-patterns.md

# マイグレーション実行チェックリスト
cat .claude/skills/database-migrations/templates/migration-checklist.md

# ロールバックSQL生成スクリプト
node .claude/skills/database-migrations/scripts/generate-rollback.mjs <migration-file>
```

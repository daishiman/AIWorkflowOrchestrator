---
name: indexing-strategies
description: |
  PostgreSQLにおけるインデックス設計戦略の専門知識。
  B-Tree、GIN、GiST、BRINの各インデックスタイプの特性と選択基準を提供。

  専門分野:
  - インデックスタイプ選択: B-Tree、GIN、GiST、BRIN の適切な選択
  - 複合インデックス設計: カラム順序、カバリングインデックス、部分インデックス
  - カーディナリティ分析: 選択性に基づくインデックス候補の評価
  - パフォーマンス最適化: クエリパターンに基づくインデックス戦略

  使用タイミング:
  - 新規テーブルのインデックス設計時
  - クエリパフォーマンス問題の調査時
  - インデックス追加・削除の判断時
  - JSONB検索のインデックス最適化時

  Use proactively when designing indexes, analyzing query performance,
  or optimizing database read operations.
version: 1.0.0
---

# Indexing Strategies Skill

## 概要

このスキルは、PostgreSQLのインデックス設計に関する専門知識を提供します。
クエリパターンとデータ特性に基づいて、最適なインデックス戦略を選択・設計します。

## インデックスタイプ選択ガイド

### B-Tree（デフォルト）

**特性**:
- 最も汎用的なインデックスタイプ
- 等価比較（=）と範囲検索（<, >, BETWEEN）に最適
- ソート操作（ORDER BY）を高速化

**適用場面**:
- 主キー、外部キー
- 頻繁に検索されるカラム
- ソート対象カラム
- 範囲検索（日付、数値）

**Drizzle ORM での定義**:
```typescript
import { index, pgTable, varchar, timestamp, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  emailIdx: index('idx_users_email').on(table.email),
  createdAtIdx: index('idx_users_created_at').on(table.createdAt),
}));
```

### GIN（Generalized Inverted Index）

**特性**:
- 複合値（配列、JSONB、全文検索）に最適化
- 「含む」演算子（@>、?、?|、?&）を高速化
- 更新コストが高い（書き込み重視のワークロードには注意）

**適用場面**:
- JSONB カラムの検索
- PostgreSQL 配列の検索
- 全文検索（tsvector）
- タグ、カテゴリなどの複数値検索

**Drizzle ORM での定義**:
```typescript
import { index, pgTable, jsonb, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const workflows = pgTable('workflows', {
  id: uuid('id').primaryKey(),
  inputPayload: jsonb('input_payload'),
  metadata: jsonb('metadata'),
}, (table) => ({
  // GINインデックス（JSONB用）
  inputPayloadGinIdx: index('gin_workflows_input_payload')
    .on(table.inputPayload)
    .using(sql`gin`),
  metadataGinIdx: index('gin_workflows_metadata')
    .on(table.metadata)
    .using(sql`gin`),
}));
```

### GiST（Generalized Search Tree）

**特性**:
- 空間データ、範囲型、幾何データに最適化
- 「重複」「含む」「最近傍」検索をサポート
- 近似検索が可能

**適用場面**:
- 地理データ（PostGIS）
- 範囲型（tsrange、daterange）
- 幾何データ（point、polygon）
- 最近傍検索

**例**:
```sql
-- 地理インデックス
CREATE INDEX idx_locations_geom ON locations USING gist(geom);

-- 範囲インデックス
CREATE INDEX idx_events_during ON events USING gist(during);
```

### BRIN（Block Range Index）

**特性**:
- 非常に大規模なテーブルに最適化
- 物理的に順序付けられたデータに効果的
- インデックスサイズが非常に小さい

**適用場面**:
- 時系列データ（ログ、イベント）
- 追記型のテーブル
- 数百万〜数十億行のテーブル

**例**:
```sql
-- 時系列データのBRINインデックス
CREATE INDEX idx_logs_created_at ON logs USING brin(created_at);
```

## 複合インデックス設計

### カラム順序の最適化

**原則**: 選択性の高いカラムを先頭に配置

```typescript
// クエリパターン: WHERE user_id = ? AND status = ?
// user_id の選択性が高い場合
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey(),
  userId: uuid('user_id').notNull(),
  status: varchar('status', { length: 20 }).notNull(),
}, (table) => ({
  // 選択性: user_id > status
  userStatusIdx: index('idx_orders_user_status')
    .on(table.userId, table.status),
}));
```

### カバリングインデックス（INCLUDE）

**目的**: インデックスのみでクエリを完了（テーブルアクセス不要）

```sql
-- SELECT email FROM users WHERE user_id = ?
CREATE INDEX idx_users_id_include_email
ON users (user_id)
INCLUDE (email);
```

### 部分インデックス

**目的**: 条件を満たす行のみにインデックスを作成

```typescript
// アクティブユーザーのみインデックス
export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  activeEmailIdx: index('idx_users_active_email')
    .on(table.email)
    .where(sql`deleted_at IS NULL`),
}));
```

## インデックス設計チェックリスト

### 必須インデックス

- [ ] **主キー**: 自動的に作成される
- [ ] **外部キー**: すべての外部キーカラム
- [ ] **UNIQUE制約**: 自動的に作成される

### クエリパターン分析

- [ ] WHERE句で頻繁に使用されるカラム
- [ ] JOIN条件で使用されるカラム
- [ ] ORDER BY で使用されるカラム
- [ ] GROUP BY で使用されるカラム

### パフォーマンス考慮

- [ ] インデックスの選択性は十分か？（カーディナリティ）
- [ ] 複合インデックスのカラム順序は適切か？
- [ ] 不要なインデックス（使用されない、重複）がないか？
- [ ] 書き込みパフォーマンスへの影響は許容範囲か？

## カーディナリティと選択性

### 概念

**カーディナリティ**: カラム内のユニーク値の数
**選択性**: ユニーク値の数 / 総行数

### 選択性の目安

| 選択性 | 評価 | インデックス効果 |
|--------|------|----------------|
| > 0.9 | 非常に高い | 非常に効果的 |
| 0.5 - 0.9 | 高い | 効果的 |
| 0.1 - 0.5 | 中程度 | 条件次第 |
| < 0.1 | 低い | 効果が限定的 |

### 選択性の確認クエリ

```sql
-- カラムの選択性を確認
SELECT
  COUNT(DISTINCT column_name)::float / COUNT(*)::float AS selectivity,
  COUNT(DISTINCT column_name) AS unique_values,
  COUNT(*) AS total_rows
FROM table_name;
```

## インデックス命名規則

### パターン

```
idx_[テーブル名]_[カラム名1]_[カラム名2]
gin_[テーブル名]_[カラム名]
gist_[テーブル名]_[カラム名]
brin_[テーブル名]_[カラム名]
uniq_[テーブル名]_[カラム名]
```

### 例

```typescript
// 命名例
const indexes = {
  // B-Tree（デフォルト）
  idx_users_email: '単一カラムB-Tree',
  idx_orders_user_status: '複合B-Tree',

  // GIN
  gin_workflows_metadata: 'JSONB用GIN',
  gin_posts_tags: '配列用GIN',

  // GiST
  gist_locations_geom: '地理データ用GiST',

  // BRIN
  brin_logs_created_at: '時系列用BRIN',

  // UNIQUE
  uniq_users_email: 'ユニーク制約',
};
```

## パフォーマンス分析

### EXPLAIN ANALYZE の活用

```sql
-- クエリプランの確認
EXPLAIN ANALYZE
SELECT * FROM users WHERE email = 'test@example.com';

-- チェックポイント
-- 1. Index Scan が使用されているか？
-- 2. Seq Scan が発生していないか？
-- 3. 推定行数と実際の行数の差
-- 4. 実行時間
```

### インデックス使用状況の確認

```sql
-- インデックスの使用状況
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan AS scans,
  idx_tup_read AS tuples_read,
  idx_tup_fetch AS tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- 未使用インデックスの特定
SELECT
  indexrelname AS index_name,
  relname AS table_name,
  idx_scan AS times_used
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexrelname NOT LIKE 'pg_%';
```

## 関連スキル

- `.claude/skills/database-normalization/SKILL.md` - 正規化との連携
- `.claude/skills/jsonb-optimization/SKILL.md` - JSONB インデックス詳細
- `.claude/skills/sql-anti-patterns/SKILL.md` - インデックス関連アンチパターン

## 参照リソース

詳細な情報は以下のリソースを参照:
- `resources/index-types-comparison.md` - インデックスタイプ詳細比較
- `templates/index-design-checklist.md` - インデックス設計チェックリストテンプレート
- `scripts/analyze-indexes.mjs` - インデックス分析スクリプト

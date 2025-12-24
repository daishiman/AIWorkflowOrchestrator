---
name: .claude/skills/indexing-strategies/SKILL.md
description: |
    SQLiteにおけるインデックス設計戦略の専門知識。
    B-Treeインデックス、部分インデックス、式インデックス、カバリングインデックスの特性と選択基準を提供。
    専門分野:
    - インデックスタイプ選択: SQLite B-Treeの適切な活用
    - 複合インデックス設計: カラム順序、カバリングインデックス、部分インデックス
    - カーディナリティ分析: 選択性に基づくインデックス候補の評価
    - パフォーマンス最適化: クエリパターンに基づくインデックス戦略
    使用タイミング:
    - 新規テーブルのインデックス設計時
    - クエリパフォーマンス問題の調査時
    - インデックス追加・削除の判断時
    - JSON検索のインデックス最適化時
    Use proactively when designing indexes, analyzing query performance,
    or optimizing database read operations.

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/indexing-strategies/resources/index-types-comparison.md`: SQLite B-Treeインデックスの特性と最適化技法の詳細
  - `.claude/skills/indexing-strategies/templates/index-design-checklist.md`: インデックス設計時の必須項目とパフォーマンス考慮チェックリスト
  - `.claude/skills/indexing-strategies/scripts/analyze-indexes.mjs`: インデックス使用状況分析と未使用インデックス検出スクリプト

version: 2.0.0
---

# Indexing Strategies Skill

## 概要

このスキルは、SQLite のインデックス設計に関する専門知識を提供します。
クエリパターンとデータ特性に基づいて、最適なインデックス戦略を選択・設計します。

## インデックスタイプ選択ガイド

### B-Tree（SQLiteの唯一のインデックスタイプ）

**特性**:

- SQLiteでサポートされる唯一のインデックスタイプ
- 等価比較（=）と範囲検索（<, >, BETWEEN）に最適
- ソート操作（ORDER BY）を高速化
- すべてのデータ型に対応

**適用場面**:

- 主キー、外部キー
- 頻繁に検索されるカラム
- ソート対象カラム
- 範囲検索（日付、数値）
- JSON検索（json_extract関数と組み合わせ）

**Drizzle ORM での定義**:

```typescript
import { index, sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
  "users",
  {
    id: integer("id").primaryKey(),
    email: text("email").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (table) => ({
    emailIdx: index("idx_users_email").on(table.email),
    createdAtIdx: index("idx_users_created_at").on(table.createdAt),
  }),
);
```

### 式インデックス（Expression Indexes）

**特性**:

- カラムそのものではなく、式の結果にインデックスを作成
- JSON抽出、文字列変換、計算結果などに有効
- 複雑なWHERE条件の高速化

**適用場面**:

- JSON データの特定フィールドへのアクセス
- 大文字小文字を区別しない検索
- 計算結果に基づく検索

**例**:

```sql
-- JSON内のフィールドへのインデックス
CREATE INDEX idx_workflows_payload_status
ON workflows(json_extract(input_payload, '$.status'));

-- 大文字小文字を区別しない検索用
CREATE INDEX idx_users_email_lower
ON users(LOWER(email));

-- 計算結果へのインデックス
CREATE INDEX idx_orders_total_with_tax
ON orders(price * (1 + tax_rate));
```

**Drizzle ORM での定義**:

```typescript
import { index, sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const workflows = sqliteTable(
  "workflows",
  {
    id: integer("id").primaryKey(),
    inputPayload: text("input_payload"), // JSON as TEXT
  },
  (table) => ({
    // JSON式インデックス
    statusIdx: index("idx_workflows_status").on(
      sql`json_extract(${table.inputPayload}, '$.status')`,
    ),
  }),
);
```

### 部分インデックス（Partial Indexes）

**特性**:

- WHERE句で指定した条件を満たす行のみにインデックスを作成
- インデックスサイズの削減
- 特定条件のクエリパフォーマンス向上

**適用場面**:

- アクティブレコードのみのインデックス
- 特定ステータスの行のみ
- 最近のデータのみ

**例**:

```sql
-- アクティブユーザーのみ
CREATE INDEX idx_users_active_email
ON users(email) WHERE deleted_at IS NULL;

-- 完了していない注文のみ
CREATE INDEX idx_orders_pending
ON orders(created_at) WHERE status IN ('pending', 'processing');

-- 最近30日のログのみ
CREATE INDEX idx_logs_recent
ON logs(created_at) WHERE created_at > unixepoch('now', '-30 days');
```

## 複合インデックス設計

### カラム順序の最適化

**原則**: 選択性の高いカラムを先頭に配置

```typescript
// クエリパターン: WHERE user_id = ? AND status = ?
// user_id の選択性が高い場合
export const orders = sqliteTable(
  "orders",
  {
    id: integer("id").primaryKey(),
    userId: integer("user_id").notNull(),
    status: text("status").notNull(),
  },
  (table) => ({
    // 選択性: user_id > status
    userStatusIdx: index("idx_orders_user_status").on(
      table.userId,
      table.status,
    ),
  }),
);
```

### カバリングインデックス

**目的**: インデックスのみでクエリを完了（テーブルアクセス不要）

**注意**: SQLiteには PostgreSQL の INCLUDE 句はありませんが、
必要なすべてのカラムを複合インデックスに含めることで同様の効果が得られます。

```sql
-- SELECT email FROM users WHERE user_id = ?
-- user_idで検索し、emailも取得する場合
CREATE INDEX idx_users_id_email ON users (user_id, email);
```

```typescript
export const users = sqliteTable(
  "users",
  {
    id: integer("id").primaryKey(),
    email: text("email").notNull(),
  },
  (table) => ({
    // user_id で検索、email も含めてカバリングインデックス化
    idEmailIdx: index("idx_users_id_email").on(table.id, table.email),
  }),
);
```

### 部分インデックスの実装

**Drizzle ORM での定義**:

```typescript
import { index, sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// アクティブユーザーのみインデックス
export const users = sqliteTable(
  "users",
  {
    id: integer("id").primaryKey(),
    email: text("email").notNull(),
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
  },
  (table) => ({
    activeEmailIdx: index("idx_users_active_email")
      .on(table.email)
      .where(sql`deleted_at IS NULL`),
  }),
);
```

## インデックス設計チェックリスト

### 必須インデックス

- [ ] **主キー**: 自動的に作成される
- [ ] **外部キー**: すべての外部キーカラム
- [ ] **UNIQUE 制約**: 自動的に作成される

### クエリパターン分析

- [ ] WHERE 句で頻繁に使用されるカラム
- [ ] JOIN 条件で使用されるカラム
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

| 選択性    | 評価       | インデックス効果 |
| --------- | ---------- | ---------------- |
| > 0.9     | 非常に高い | 非常に効果的     |
| 0.5 - 0.9 | 高い       | 効果的           |
| 0.1 - 0.5 | 中程度     | 条件次第         |
| < 0.1     | 低い       | 効果が限定的     |

### 選択性の確認クエリ

```sql
-- カラムの選択性を確認
SELECT
  CAST(COUNT(DISTINCT column_name) AS REAL) / CAST(COUNT(*) AS REAL) AS selectivity,
  COUNT(DISTINCT column_name) AS unique_values,
  COUNT(*) AS total_rows
FROM table_name;
```

## インデックス命名規則

### パターン

```
idx_[テーブル名]_[カラム名1]_[カラム名2]      # 標準インデックス
idx_[テーブル名]_[カラム名]_expr            # 式インデックス
idx_[テーブル名]_[カラム名]_partial         # 部分インデックス
uniq_[テーブル名]_[カラム名]               # ユニーク制約
```

### 例

```typescript
// 命名例
const indexes = {
  // 標準B-Tree
  idx_users_email: "単一カラムインデックス",
  idx_orders_user_status: "複合インデックス",

  // 式インデックス
  idx_users_email_lower: "小文字変換式インデックス",
  idx_workflows_status_expr: "JSON抽出式インデックス",

  // 部分インデックス
  idx_users_email_active: "アクティブユーザー部分インデックス",
  idx_orders_created_pending: "未完了注文部分インデックス",

  // UNIQUE
  uniq_users_email: "ユニーク制約",
};
```

## パフォーマンス分析

### EXPLAIN QUERY PLAN の活用

SQLiteでは `EXPLAIN QUERY PLAN` を使用してクエリ実行計画を確認します。

```sql
-- クエリプランの確認
EXPLAIN QUERY PLAN
SELECT * FROM users WHERE email = 'test@example.com';

-- インデックスが使用される場合の出力例:
-- SEARCH users USING INDEX idx_users_email (email=?)

-- インデックスが使用されない場合（フルスキャン）:
-- SCAN users
```

**チェックポイント**:

- `SEARCH ... USING INDEX` が表示されているか？
- `SCAN` だけの場合はフルテーブルスキャン（インデックス未使用）
- `COVERING INDEX` が表示される場合、カバリングインデックスとして機能

### インデックス一覧の確認

```sql
-- すべてのインデックスを一覧表示
SELECT
  name AS index_name,
  tbl_name AS table_name,
  sql AS create_statement
FROM sqlite_master
WHERE type = 'index'
  AND tbl_name NOT LIKE 'sqlite_%'
ORDER BY tbl_name, name;

-- 特定テーブルのインデックス情報
PRAGMA index_list('table_name');

-- 特定インデックスの詳細情報
PRAGMA index_info('index_name');

-- 特定インデックスの拡張情報（部分インデックスのWHERE句も表示）
PRAGMA index_xinfo('index_name');
```

### インデックス使用状況の分析

SQLiteにはPostgreSQLのような統計ビューがないため、
手動でクエリプランを確認する必要があります。

```sql
-- クエリがインデックスを使用しているか確認
EXPLAIN QUERY PLAN
SELECT * FROM users WHERE email = 'test@example.com';

-- 複合インデックスの使用確認
EXPLAIN QUERY PLAN
SELECT * FROM orders WHERE user_id = 1 AND status = 'pending';

-- 部分インデックスの使用確認
EXPLAIN QUERY PLAN
SELECT * FROM users WHERE email = 'test@example.com' AND deleted_at IS NULL;
```

## SQLite特有の最適化Tips

### ANALYZE の実行

SQLiteのクエリオプティマイザーに統計情報を提供します。

```sql
-- 全テーブルの統計情報を更新
ANALYZE;

-- 特定テーブルのみ
ANALYZE users;

-- 統計情報の確認
SELECT * FROM sqlite_stat1 WHERE tbl = 'users';
```

### インデックスの再構築

```sql
-- インデックスを削除して再作成（断片化解消）
DROP INDEX IF EXISTS idx_users_email;
CREATE INDEX idx_users_email ON users(email);

-- または VACUUM でデータベース全体を最適化
VACUUM;
```

### WITHOUT ROWID テーブル

主キーがクラスター化インデックスとして機能する最適化テーブル。

```sql
CREATE TABLE cache (
  key TEXT PRIMARY KEY,
  value TEXT,
  expires_at INTEGER
) WITHOUT ROWID;

-- このテーブルは主キーでソートされて格納される
-- 追加のインデックスは他のカラムのみに必要
```

## 関連スキル

- `.claude/skills/database-normalization/SKILL.md` - 正規化との連携
- `.claude/skills/query-optimization/SKILL.md` - クエリ最適化
- `.claude/skills/sql-anti-patterns/SKILL.md` - インデックス関連アンチパターン

## 参照リソース

詳細な情報は以下のリソースを参照:

- `resources/index-types-comparison.md` - SQLiteインデックス最適化技法の詳細
- `templates/index-design-checklist.md` - インデックス設計チェックリストテンプレート
- `scripts/analyze-indexes.mjs` - インデックス分析スクリプト

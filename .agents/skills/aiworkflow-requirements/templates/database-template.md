# {テーブル/スキーマ名} データベース設計

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
>
> **親ドキュメント**: [database-schema.md](../references/database-schema.md)

---

## 概要

{このデータベース設計の目的と概要を記述}

**スキーマ定義場所**: packages/shared/src/db/schema/{table}.ts

---

## テーブル定義

### {table_name}

{テーブルの説明}

| カラム | 型 | NULL | デフォルト | 説明 |
|-------|---|-----|---------|-----|
| id | TEXT | × | ulid() | プライマリキー |
| {column1} | {型} | {○/×} | {値} | {説明} |
| {column2} | {型} | {○/×} | {値} | {説明} |
| created_at | INTEGER | × | now() | 作成日時（Unix timestamp） |
| updated_at | INTEGER | × | now() | 更新日時（Unix timestamp） |

### インデックス

| インデックス名 | カラム | 種類 | 目的 |
|--------------|-------|-----|-----|
| idx_{table}_{column} | {column} | {UNIQUE/INDEX} | {目的} |

### 外部キー

| 参照元カラム | 参照先テーブル | 参照先カラム | ON DELETE |
|------------|--------------|------------|----------|
| {column} | {table} | {column} | {CASCADE/SET NULL} |

---

## Drizzleスキーマ

### テーブル定義

| 要素 | 設定 | 説明 |
|-----|-----|-----|
| テーブル名 | {table_name} | sqliteTableで定義 |
| id | text.primaryKey.$defaultFn(ulid) | ULID自動生成 |
| {column1} | text.notNull | 必須テキストカラム |
| {column2} | integer | オプション整数カラム |
| createdAt | integer(timestamp).$defaultFn(Date) | 作成日時自動設定 |
| updatedAt | integer(timestamp).$defaultFn(Date) | 更新日時自動設定 |

### 推論型

| 型名 | 用途 |
|-----|-----|
| {TypeName} | SELECT結果の型（$inferSelect） |
| New{TypeName} | INSERT入力の型（$inferInsert） |

---

## リレーション

### リレーション定義

| リレーション名 | 種別 | 対象テーブル | 外部キー |
|--------------|-----|------------|---------|
| {relationName} | one | {relatedTable} | {foreignKey} |
| {relationName} | many | {relatedTable} | - |

---

## クエリパターン

### 取得

| パターン | メソッド | オプション | 説明 |
|---------|---------|---------|-----|
| 単一取得 | findFirst | where, with | IDで1件取得、リレーション含む |
| 一覧取得 | findMany | where, orderBy, limit | 条件検索、ソート、ページング |

### 変更

| パターン | メソッド | オプション | 説明 |
|---------|---------|---------|-----|
| 挿入 | insert.values | returning | 新規作成、作成結果を返却 |
| 更新 | update.set.where | - | 条件指定で更新、updatedAt設定必須 |
| 削除 | delete.where | - | 条件指定で削除 |

---

## マイグレーション

### DDL概要

| 操作 | 内容 |
|-----|-----|
| CREATE TABLE | {table_name}テーブル作成 |
| PRIMARY KEY | idカラム |
| NOT NULL | 必須カラム指定 |
| CREATE INDEX | idx_{table}_{column}インデックス作成 |

### マイグレーション手順

1. スキーマファイルを編集
2. `pnpm drizzle-kit generate`でSQL生成
3. 生成されたSQLを確認
4. `pnpm drizzle-kit migrate`で適用

---

## 関連ドキュメント

| ドキュメント | 内容 |
|------------|-----|
| [database-schema.md](../references/database-schema.md) | スキーマ全体像 |
| [database-operations.md](../references/database-operations.md) | 操作パターン |

---

## 変更履歴

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2026-01-26 | 仕様ガイドライン準拠: コード例を表形式・文章に変換 |
| 1.0.0 | {YYYY-MM-DD} | 初版作成 |

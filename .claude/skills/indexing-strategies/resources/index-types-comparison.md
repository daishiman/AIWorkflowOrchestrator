# SQLite インデックス最適化技法

## 概要

SQLite は B-Tree インデックスのみをサポートしますが、式インデックス、部分インデックス、カバリングインデックスなどの強力な機能を提供します。
このリソースでは、SQLite インデックスの詳細な特性と最適化技法を解説します。

---

## B-Tree インデックス詳細

### 内部構造

SQLite の B-Tree は平衡木構造で、すべての葉ノードが同じ深さにあります。

```
        [Root Node]
       /     |     \
    [Node]  [Node]  [Node]
    / | \   / | \   / | \
  [L] [L] [L] [L] [L] [L] ... Leaf Nodes
```

### サポートする演算子

| 演算子         | 説明             | 例                                                |
| -------------- | ---------------- | ------------------------------------------------- |
| `=`            | 等価             | `WHERE id = 123`                                  |
| `<`            | より小さい       | `WHERE age < 30`                                  |
| `<=`           | 以下             | `WHERE price <= 100`                              |
| `>`            | より大きい       | `WHERE created_at > 1704067200`                   |
| `>=`           | 以上             | `WHERE score >= 80`                               |
| `BETWEEN`      | 範囲             | `WHERE date BETWEEN 1704067200 AND 1735689600`    |
| `IS NULL`      | NULL 検査        | `WHERE deleted_at IS NULL`                        |
| `IS NOT NULL`  | NOT NULL 検査    | `WHERE email IS NOT NULL`                         |
| `LIKE`         | 前方一致のみ     | `WHERE name LIKE 'John%'`                         |
| `IN`           | リスト内         | `WHERE status IN ('active', 'pending')`           |
| `GLOB`         | パターンマッチ   | `WHERE filename GLOB '*.txt'`                     |
| `json_extract` | JSON フィールド  | `WHERE json_extract(data, '$.status') = 'active'` |
| `json_type`    | JSON 型チェック  | `WHERE json_type(data, '$.field') = 'text'`       |
| `LOWER/UPPER`  | 大文字小文字変換 | `WHERE LOWER(email) = 'test@example.com'`         |

### 最適化オプション

SQLite では CREATE INDEX 文で以下のオプションが使用できます：

```sql
-- 降順インデックス
CREATE INDEX idx_orders_created_desc ON orders (created_at DESC);

-- 複合インデックス（昇順と降順の混在可能）
CREATE INDEX idx_orders_user_created
ON orders (user_id ASC, created_at DESC);

-- UNIQUE インデックス
CREATE UNIQUE INDEX uniq_users_email ON users (email);
```

---

## 式インデックス（Expression Indexes）

### 概要

式インデックスは、カラムの値そのものではなく、式の結果にインデックスを作成します。
これにより、複雑な WHERE 条件を高速化できます。

### JSON フィールドへのインデックス

```sql
-- JSON内の特定フィールドへのインデックス
CREATE INDEX idx_workflows_payload_status
ON workflows(json_extract(input_payload, '$.status'));

-- 使用例
SELECT * FROM workflows
WHERE json_extract(input_payload, '$.status') = 'completed';
-- → idx_workflows_payload_status が使用される
```

### 大文字小文字を区別しない検索

```sql
-- メールアドレスの小文字変換インデックス
CREATE INDEX idx_users_email_lower
ON users(LOWER(email));

-- 使用例
SELECT * FROM users
WHERE LOWER(email) = LOWER('Test@Example.com');
-- → idx_users_email_lower が使用される
```

### 計算結果へのインデックス

```sql
-- 税込価格の計算結果へのインデックス
CREATE INDEX idx_orders_total_with_tax
ON orders(price * (1 + tax_rate));

-- 日付の年月へのインデックス
CREATE INDEX idx_logs_year_month
ON logs(strftime('%Y-%m', created_at));

-- 文字列の一部へのインデックス
CREATE INDEX idx_users_domain
ON users(substr(email, instr(email, '@') + 1));
```

### 式インデックスの制約

- **決定的な式のみ**: random()、datetime('now') などの非決定的関数は使用不可
- **パフォーマンス**: 式の計算コストが高い場合、INSERT/UPDATE が遅くなる
- **メンテナンス**: 式が変更されるとインデックスの再作成が必要

---

## 部分インデックス（Partial Indexes）

### 概要

WHERE 句で指定した条件を満たす行のみにインデックスを作成する機能です。
インデックスサイズを削減し、特定条件のクエリを高速化できます。

### アクティブレコードのみインデックス

```sql
-- 削除されていないユーザーのみ
CREATE INDEX idx_users_active_email
ON users(email) WHERE deleted_at IS NULL;

-- 使用例（インデックスが使用される）
SELECT * FROM users
WHERE email = 'test@example.com'
  AND deleted_at IS NULL;

-- 使用例（インデックスは使用されない）
SELECT * FROM users
WHERE email = 'test@example.com';
-- deleted_at IS NULL の条件がないため、部分インデックスは使用されない
```

### 特定ステータスのみインデックス

```sql
-- 完了していない注文のみ
CREATE INDEX idx_orders_pending
ON orders(user_id, created_at)
WHERE status IN ('pending', 'processing');

-- アクティブなワークフローのみ
CREATE INDEX idx_workflows_active
ON workflows(user_id, updated_at)
WHERE status != 'completed' AND deleted_at IS NULL;
```

### 最近のデータのみインデックス

```sql
-- 最近30日のログのみ
CREATE INDEX idx_logs_recent
ON logs(user_id, action)
WHERE created_at > unixepoch('now', '-30 days');

-- 今年のデータのみ
CREATE INDEX idx_events_this_year
ON events(category, created_at)
WHERE created_at >= unixepoch(strftime('%Y-01-01', 'now'));
```

### 部分インデックスの利点

| 利点                 | 説明                                          |
| -------------------- | --------------------------------------------- |
| **サイズ削減**       | 全体の 10-20%の行のみインデックス化で大幅削減 |
| **更新速度向上**     | 条件外の行の更新時はインデックス更新不要      |
| **読み取り速度向上** | 小さいインデックスは検索が高速                |
| **選択性向上**       | 特定条件に特化することで選択性が向上          |

---

## カバリングインデックス

### 概要

クエリに必要なすべてのカラムをインデックスに含めることで、
テーブル本体へのアクセスを不要にする最適化技法です。

### 基本パターン

```sql
-- user_id で検索し、email も取得するクエリ
SELECT email FROM users WHERE user_id = 123;

-- カバリングインデックス（user_id と email を含む）
CREATE INDEX idx_users_id_email ON users (user_id, email);

-- EXPLAIN QUERY PLAN の結果:
-- SEARCH users USING COVERING INDEX idx_users_id_email (user_id=?)
```

### 複合カバリングインデックス

```sql
-- 注文一覧を取得するクエリ
SELECT order_id, total, status
FROM orders
WHERE user_id = 123
ORDER BY created_at DESC;

-- カバリングインデックス
CREATE INDEX idx_orders_user_covering
ON orders (user_id, created_at DESC, order_id, total, status);

-- すべてのカラムがインデックスに含まれるため、テーブル本体は不要
```

### カバリングインデックスの設計指針

1. **検索カラムを先頭に**: WHERE 句のカラムを最初に配置
2. **ソートカラムを次に**: ORDER BY のカラムを配置
3. **取得カラムを最後に**: SELECT リストのカラムを配置

```sql
-- パターン: WHERE → ORDER BY → SELECT
CREATE INDEX idx_covering
ON table_name (
  where_column1,      -- WHERE 句で使用
  where_column2,      -- WHERE 句で使用
  order_by_column,    -- ORDER BY で使用
  select_column1,     -- SELECT リストで使用
  select_column2      -- SELECT リストで使用
);
```

---

## WITHOUT ROWID テーブル

### 概要

WITHOUT ROWID は、主キーをクラスター化インデックスとして使用する最適化テーブルです。
ROWID を持たないため、主キーでソートされた状態で格納されます。

### 適用条件

- 主キーが明示的に定義されている
- 主キーでの検索・範囲検索が多い
- テーブルサイズが小〜中規模（数十万行程度）

### 使用例

```sql
-- キャッシュテーブル（key での検索が主な用途）
CREATE TABLE cache (
  key TEXT PRIMARY KEY,
  value TEXT,
  expires_at INTEGER
) WITHOUT ROWID;

-- セッションテーブル
CREATE TABLE sessions (
  session_id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
) WITHOUT ROWID;

-- 設定テーブル
CREATE TABLE config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL
) WITHOUT ROWID;
```

### パフォーマンス特性

| 特性           | WITHOUT ROWID | 通常テーブル |
| -------------- | ------------- | ------------ |
| 主キー検索     | 高速          | 高速         |
| 範囲検索       | 非常に高速    | 中速         |
| テーブルサイズ | 小            | 中           |
| INSERT 速度    | 中速          | 高速         |

### 注意点

- 主キーが長い場合（複合主キーなど）、サイズが増大する可能性
- 主キー以外での検索には別途インデックスが必要
- INTEGER PRIMARY KEY AUTOINCREMENT は使用不可

---

## インデックス最適化フローチャート

```
クエリの特性は？
├─ WHERE 句のカラム数
│   ├─ 1カラム: 単一カラムインデックス
│   ├─ 2+カラム: 複合インデックス（選択性順）
│   └─ 式を使用: 式インデックス検討
│
├─ 特定条件のみ頻繁に検索？
│   ├─ Yes: 部分インデックス
│   └─ No: 標準インデックス
│
├─ SELECT リストに多くのカラム？
│   ├─ 3カラム以下: カバリングインデックス検討
│   └─ 4カラム以上: 別途評価（サイズとのトレードオフ）
│
├─ JSON フィールドを検索？
│   └─ json_extract() の式インデックス
│
├─ 大文字小文字を区別しない？
│   └─ LOWER(column) の式インデックス
│
└─ 主キーでの検索が主？
    └─ WITHOUT ROWID テーブル検討
```

---

## パフォーマンス測定ガイド

### ANALYZE の実行

```sql
-- 全テーブルの統計情報を更新
ANALYZE;

-- 統計情報の確認
SELECT * FROM sqlite_stat1;
SELECT * FROM sqlite_stat4;
```

### インデックスサイズの確認

```sql
-- ページサイズの確認
PRAGMA page_size;

-- インデックスのページ数
SELECT
  name,
  pgsize * (SELECT page_count FROM dbstat WHERE name = 'idx_name') AS size_bytes
FROM sqlite_master
WHERE type = 'index' AND name = 'idx_name';
```

### クエリパフォーマンスの比較

```sql
-- インデックス使用前
EXPLAIN QUERY PLAN
SELECT * FROM users WHERE email = 'test@example.com';

-- インデックス作成
CREATE INDEX idx_users_email ON users(email);

-- インデックス使用後
EXPLAIN QUERY PLAN
SELECT * FROM users WHERE email = 'test@example.com';

-- 実際の実行時間測定（.timer on を事前に実行）
.timer on
SELECT * FROM users WHERE email = 'test@example.com';
```

---

## まとめ

### SQLite インデックス戦略

1. **基本は B-Tree**: すべてのインデックスは B-Tree
2. **式インデックス**: JSON、文字列変換、計算結果に活用
3. **部分インデックス**: アクティブレコード、特定ステータスに特化
4. **カバリングインデックス**: 頻繁なクエリを最適化
5. **WITHOUT ROWID**: 主キー検索が主な用途のテーブルに適用

### 選択基準

| ユースケース           | 推奨アプローチ                  |
| ---------------------- | ------------------------------- |
| 等価検索               | 標準 B-Tree インデックス        |
| 範囲検索               | 標準 B-Tree インデックス        |
| JSON 検索              | json_extract() の式インデックス |
| 大小文字無視検索       | LOWER() の式インデックス        |
| アクティブレコードのみ | 部分インデックス                |
| 頻繁なクエリ最適化     | カバリングインデックス          |
| キャッシュテーブル     | WITHOUT ROWID                   |

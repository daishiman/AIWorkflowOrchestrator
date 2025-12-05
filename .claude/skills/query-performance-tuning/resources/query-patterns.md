# クエリパターン最適化ガイド

## N+1問題

### 問題パターン

```sql
-- アプリケーションコード（擬似）
users = query("SELECT * FROM users LIMIT 100")
for user in users:
    orders = query("SELECT * FROM orders WHERE user_id = ?", user.id)
    # 100回のクエリが発生
```

### 解決策

```sql
-- JOINを使用
SELECT u.*, o.*
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
LIMIT 100;

-- または IN句を使用
SELECT * FROM orders
WHERE user_id IN (SELECT id FROM users LIMIT 100);

-- 複数値の効率的検索
SELECT * FROM orders
WHERE user_id IN (1, 2, 3, ...);
```

### EXPLAIN QUERY PLANでの検出

```
SEARCH TABLE orders USING INDEX idx_orders_user_id (user_id=?)
```

注: SQLiteのEXPLAIN QUERY PLANはloops情報を提供しないため、
アプリケーションレベルでクエリ数を監視する必要があります。

## ページネーション

### 問題パターン（OFFSET）

```sql
-- 大きなOFFSETは非効率
SELECT * FROM posts
ORDER BY created_at DESC
OFFSET 100000 LIMIT 20;
-- → 100000行をスキップしてから20行を返す
```

### 解決策（カーソルベース）

```sql
-- キーセットページネーション（推奨）
SELECT * FROM posts
WHERE created_at < '2024-01-15T10:00:00'
ORDER BY created_at DESC
LIMIT 20;

-- 複合キーの場合
SELECT * FROM posts
WHERE (created_at, id) < ('2024-01-15T10:00:00', 12345)
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

### インデックス

```sql
-- ソート順を含めたインデックス
CREATE INDEX idx_posts_created ON posts(created_at DESC);

-- 複合キーの場合
CREATE INDEX idx_posts_created_id ON posts(created_at DESC, id DESC);
```

## COUNT最適化

### 問題パターン

```sql
-- 全行カウントは重い
SELECT COUNT(*) FROM orders WHERE status = 'pending';
```

### 解決策

```sql
-- SQLiteでは推定値を取得する直接的な方法はない
-- sqlite_stat1テーブルから推定可能（ANALYZE後）
SELECT stat FROM sqlite_stat1
WHERE tbl = 'orders' AND idx IS NULL;

-- 最近の正確な値をキャッシュ
-- 集計テーブルを使用

-- COUNT(1) vs COUNT(*)
-- SQLiteでは同じ性能
```

### 条件付きCOUNTの最適化

```sql
-- 複数条件のカウントを1クエリで（SQLite方式）
SELECT
  SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_count,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_count,
  SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_count
FROM orders;
```

## EXISTS vs IN vs JOIN

### 比較

```sql
-- EXISTS（相関サブクエリ）
SELECT * FROM users u
WHERE EXISTS (
  SELECT 1 FROM orders o WHERE o.user_id = u.id
);

-- IN（サブクエリ）
SELECT * FROM users
WHERE id IN (SELECT user_id FROM orders);

-- JOIN
SELECT DISTINCT u.*
FROM users u
INNER JOIN orders o ON u.id = o.user_id;
```

### 選択指針

| パターン | 適切な場合                     |
| -------- | ------------------------------ |
| EXISTS   | サブクエリの結果が大きい場合   |
| IN       | サブクエリの結果が小さい場合   |
| JOIN     | 両テーブルのデータが必要な場合 |

```sql
-- 大量データではEXISTSが効率的なことが多い
-- SQLiteでも適切なインデックスがあれば効率的に最適化される
```

## NOT IN vs NOT EXISTS vs LEFT JOIN

### 注意点

```sql
-- NOT IN はNULLに注意
SELECT * FROM users
WHERE id NOT IN (SELECT user_id FROM orders);
-- user_idにNULLがあると全行が除外される

-- NOT EXISTS（推奨）
SELECT * FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM orders o WHERE o.user_id = u.id
);

-- LEFT JOIN + IS NULL
SELECT u.*
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE o.id IS NULL;
```

## LIKE検索

### 問題パターン

```sql
-- 前方一致以外はインデックスが使えない
SELECT * FROM users WHERE name LIKE '%test%';
```

### 解決策

```sql
-- 前方一致はインデックス使用可能
SELECT * FROM users WHERE name LIKE 'test%';

-- 全文検索（大量データの場合）FTS5仮想テーブルを使用
CREATE VIRTUAL TABLE users_fts USING fts5(name, content=users, content_rowid=id);

-- トリガーで同期
CREATE TRIGGER users_fts_insert AFTER INSERT ON users BEGIN
  INSERT INTO users_fts(rowid, name) VALUES (new.id, new.name);
END;

CREATE TRIGGER users_fts_update AFTER UPDATE ON users BEGIN
  UPDATE users_fts SET name = new.name WHERE rowid = old.id;
END;

CREATE TRIGGER users_fts_delete AFTER DELETE ON users BEGIN
  DELETE FROM users_fts WHERE rowid = old.id;
END;

-- 全文検索の実行
SELECT u.* FROM users u
JOIN users_fts ON users_fts.rowid = u.id
WHERE users_fts MATCH 'test';
```

## OR条件

### 問題パターン

```sql
-- ORはインデックス効率が落ちることがある
SELECT * FROM users
WHERE email = 'a@example.com' OR name = 'test';
```

### 解決策

```sql
-- UNIONに書き換え
SELECT * FROM users WHERE email = 'a@example.com'
UNION
SELECT * FROM users WHERE name = 'test';

-- SQLiteもOR条件を自動で最適化することがあるが、
-- 複雑なOR条件ではUNIONの方が効率的な場合が多い
```

## 集約クエリ

### 効率的なGROUP BY

```sql
-- インデックスを活用
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

SELECT user_id, status, COUNT(*)
FROM orders
GROUP BY user_id, status;

-- HAVING vs WHERE
-- WHEREで先にフィルタリング
SELECT user_id, COUNT(*) as order_count
FROM orders
WHERE created_at > '2024-01-01'  -- 集約前にフィルタ
GROUP BY user_id
HAVING COUNT(*) > 5;  -- 集約後にフィルタ
```

### ウィンドウ関数

```sql
-- 効率的なランキング
SELECT
  id,
  user_id,
  amount,
  ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY amount DESC) as rank
FROM orders;

-- 累積合計
SELECT
  id,
  amount,
  SUM(amount) OVER (ORDER BY created_at) as running_total
FROM orders;
```

## バッチ処理

### 大量INSERT

```sql
-- バッチインサート（推奨）
INSERT INTO users (name, email)
VALUES
  ('User 1', 'user1@example.com'),
  ('User 2', 'user2@example.com'),
  ...
  ('User 1000', 'user1000@example.com');

-- トランザクション内でバッチ実行（最速）
BEGIN TRANSACTION;
INSERT INTO users (name, email) VALUES ('User 1', 'user1@example.com');
INSERT INTO users (name, email) VALUES ('User 2', 'user2@example.com');
-- ...
COMMIT;

-- または .import コマンド（sqlite3 CLI）
-- .mode csv
-- .import /path/to/file.csv users
```

### 大量UPDATE

```sql
-- バッチ更新
UPDATE orders
SET status = 'archived'
WHERE id IN (
  SELECT id FROM orders
  WHERE status = 'completed' AND created_at < '2023-01-01'
  LIMIT 10000
);

-- CTEを使用
WITH batch AS (
  SELECT id FROM orders
  WHERE status = 'completed' AND created_at < '2023-01-01'
  LIMIT 10000
)
UPDATE orders
SET status = 'archived'
WHERE id IN (SELECT id FROM batch);
```

### 大量DELETE

```sql
-- バッチ削除（ロック時間短縮）
DELETE FROM logs
WHERE id IN (
  SELECT id FROM logs
  WHERE created_at < '2023-01-01'
  LIMIT 10000
);

-- トランザクションで分割実行
BEGIN TRANSACTION;
DELETE FROM logs WHERE created_at < '2023-01-01' LIMIT 10000;
COMMIT;

-- 注: SQLiteにはctid（物理行ID）がないため、
-- rowidまたは主キーを使用する
```

## チェックリスト

### クエリ最適化時

- [ ] EXPLAIN QUERY PLANで実行計画を確認したか？
- [ ] N+1問題がないか確認したか？
- [ ] ページネーションはカーソルベースか？
- [ ] OR条件の効率を確認したか？
- [ ] サブクエリの選択（EXISTS/IN/JOIN）は適切か？
- [ ] バッチ処理で分割しているか？
- [ ] WALモードを有効にしているか？

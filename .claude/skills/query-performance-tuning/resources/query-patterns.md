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

-- 配列を使用（PostgreSQL）
SELECT * FROM orders
WHERE user_id = ANY(ARRAY[1, 2, 3, ...]);
```

### EXPLAIN ANALYZEでの検出

```
Index Scan using orders_user_id_idx on orders
  (actual time=0.020..0.025 rows=1 loops=100)
                                        ↑
                                    loops=100 は危険信号
```

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
-- 推定値で十分な場合
SELECT reltuples::bigint AS estimated_count
FROM pg_class
WHERE relname = 'orders';

-- 最近の正確な値をキャッシュ
-- 集計テーブルを使用

-- COUNT(1) vs COUNT(*)
-- PostgreSQLでは同じ性能
```

### 条件付きCOUNTの最適化

```sql
-- 複数条件のカウントを1クエリで
SELECT
  COUNT(*) FILTER (WHERE status = 'pending') AS pending_count,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed_count,
  COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled_count
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

| パターン | 適切な場合 |
|---------|-----------|
| EXISTS | サブクエリの結果が大きい場合 |
| IN | サブクエリの結果が小さい場合 |
| JOIN | 両テーブルのデータが必要な場合 |

```sql
-- 大量データではEXISTSが効率的なことが多い
-- PostgreSQLは多くの場合同等に最適化するが、確認は必要
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

-- 全文検索（大量データの場合）
CREATE INDEX idx_users_name_gin ON users USING GIN(to_tsvector('simple', name));
SELECT * FROM users
WHERE to_tsvector('simple', name) @@ to_tsquery('simple', 'test');

-- pg_trgm拡張（部分一致検索）
CREATE EXTENSION pg_trgm;
CREATE INDEX idx_users_name_trgm ON users USING GIN(name gin_trgm_ops);
SELECT * FROM users WHERE name ILIKE '%test%';
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

-- または複数インデックスのBitmap Scan（自動）
-- PostgreSQLは自動で最適化することが多い
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

-- COPY（最速）
COPY users (name, email) FROM '/path/to/file.csv' CSV HEADER;
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

-- または
WITH deleted AS (
  DELETE FROM logs
  WHERE ctid IN (
    SELECT ctid FROM logs
    WHERE created_at < '2023-01-01'
    LIMIT 10000
  )
  RETURNING id
)
SELECT COUNT(*) FROM deleted;
```

## チェックリスト

### クエリ最適化時
- [ ] EXPLAIN ANALYZEで実行計画を確認したか？
- [ ] N+1問題がないか確認したか？
- [ ] ページネーションはカーソルベースか？
- [ ] OR条件の効率を確認したか？
- [ ] サブクエリの選択（EXISTS/IN/JOIN）は適切か？
- [ ] バッチ処理で分割しているか？

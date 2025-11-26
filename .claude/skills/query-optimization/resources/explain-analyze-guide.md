# EXPLAIN ANALYZE 完全ガイド

## 概要

PostgreSQLの`EXPLAIN ANALYZE`は、クエリの実行計画と実際のパフォーマンスを分析するための最も重要なツールです。

---

## 基本構文

```sql
EXPLAIN [オプション] クエリ;
```

### オプション一覧

| オプション | 説明 | デフォルト |
|-----------|------|-----------|
| ANALYZE | 実際にクエリを実行して時間を計測 | OFF |
| BUFFERS | バッファ使用状況を表示 | OFF |
| COSTS | コスト見積もりを表示 | ON |
| TIMING | 各ノードの時間を表示 | ON（ANALYZE時） |
| FORMAT | 出力形式（TEXT/JSON/XML/YAML） | TEXT |
| VERBOSE | 追加情報を表示 | OFF |

### 推奨コマンド

```sql
-- 最も詳細な分析
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) SELECT ...;

-- JSON形式（プログラム処理用）
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT ...;
```

---

## 出力の読み方

### 基本構造

```
Seq Scan on users  (cost=0.00..15.00 rows=100 width=200) (actual time=0.010..0.150 loops=1)
  Filter: (status = 'active')
  Rows Removed by Filter: 50
  Buffers: shared hit=10
Planning Time: 0.050 ms
Execution Time: 0.200 ms
```

### 各項目の意味

#### コスト（cost）

```
cost=開始コスト..総コスト
```

- **開始コスト**: 最初の行を返すまでのコスト
- **総コスト**: すべての行を返すまでのコスト
- **単位**: シーケンシャルI/O = 1.0（相対値）

#### 行数（rows）

```
rows=100
```

- プランナーが推定した返却行数
- 実際の行数と大きく異なる場合は統計情報の更新が必要

#### 幅（width）

```
width=200
```

- 各行の平均バイト数

#### 実際の時間（actual time）

```
actual time=0.010..0.150
```

- **開始時間**: 最初の行を返すまでの時間（ms）
- **終了時間**: すべての行を返すまでの時間（ms）

#### ループ回数（loops）

```
loops=1
```

- そのノードが実行された回数
- Nested Loopでは外側の行数分ループ

---

## スキャンタイプ

### Seq Scan（シーケンシャルスキャン）

```
Seq Scan on large_table  (cost=0.00..100000.00 rows=5000000 width=100)
```

**特徴**:
- テーブル全体を読み込む
- 大量行の取得には効率的
- 少量行の取得には非効率

**対策**:
- インデックス追加
- WHERE条件の見直し

### Index Scan（インデックススキャン）

```
Index Scan using idx_users_email on users  (cost=0.42..8.44 rows=1 width=200)
  Index Cond: (email = 'test@example.com'::text)
```

**特徴**:
- インデックスを使用して行を検索
- ランダムI/Oが発生
- 選択性が高い場合に効率的

### Index Only Scan（インデックスオンリースキャン）

```
Index Only Scan using idx_users_email on users  (cost=0.42..4.44 rows=1 width=50)
  Index Cond: (email = 'test@example.com'::text)
  Heap Fetches: 0
```

**特徴**:
- インデックスのみで結果を返す
- テーブルへのアクセスなし
- Heap Fetches = 0 が理想

**条件**:
- SELECT句のカラムがすべてインデックスに含まれる
- VACUUMで可視性マップが更新されている

### Bitmap Scan

```
Bitmap Heap Scan on orders  (cost=10.00..500.00 rows=1000 width=100)
  Recheck Cond: (status = 'pending')
  ->  Bitmap Index Scan on idx_orders_status  (cost=0.00..9.75 rows=1000 width=0)
        Index Cond: (status = 'pending')
```

**特徴**:
- 複数インデックスを組み合わせ可能
- 中規模の行数取得に効率的
- シーケンシャルI/Oに変換

---

## JOINアルゴリズム

### Nested Loop

```
Nested Loop  (cost=0.42..100.00 rows=100 width=200)
  ->  Seq Scan on orders  (cost=0.00..10.00 rows=10 width=100)
  ->  Index Scan using idx_users_id on users  (cost=0.42..9.00 rows=10 width=100)
        Index Cond: (id = orders.user_id)
```

**特徴**:
- 外側テーブルの各行に対して内側テーブルを検索
- 小規模テーブル同士のJOINに適する
- 内側にインデックスがあると効率的

### Hash Join

```
Hash Join  (cost=20.00..500.00 rows=1000 width=200)
  Hash Cond: (orders.user_id = users.id)
  ->  Seq Scan on orders  (cost=0.00..300.00 rows=10000 width=100)
  ->  Hash  (cost=15.00..15.00 rows=500 width=100)
        ->  Seq Scan on users  (cost=0.00..15.00 rows=500 width=100)
```

**特徴**:
- 小さい方のテーブルでハッシュテーブルを構築
- 等価結合のみ対応
- 中規模テーブルに適する

### Merge Join

```
Merge Join  (cost=100.00..200.00 rows=1000 width=200)
  Merge Cond: (orders.user_id = users.id)
  ->  Sort  (cost=50.00..55.00 rows=1000 width=100)
        Sort Key: orders.user_id
        ->  Seq Scan on orders  (cost=0.00..30.00 rows=1000 width=100)
  ->  Sort  (cost=50.00..55.00 rows=500 width=100)
        Sort Key: users.id
        ->  Seq Scan on users  (cost=0.00..15.00 rows=500 width=100)
```

**特徴**:
- 両テーブルをソートしてマージ
- 大規模テーブルに適する
- ソート済みインデックスがあると効率的

---

## 問題パターンと対策

### パターン1: Seq Scan（大規模テーブル）

**問題**:
```
Seq Scan on orders  (cost=0.00..100000.00 rows=1000000 width=100)
  Filter: (status = 'pending')
  Rows Removed by Filter: 999000
```

**対策**:
```sql
CREATE INDEX idx_orders_status ON orders(status);
```

### パターン2: 推定行数と実際の行数の乖離

**問題**:
```
Index Scan using idx_users_status  (rows=10) (actual rows=10000)
```

**対策**:
```sql
-- 統計情報の更新
ANALYZE users;

-- より詳細な統計
ALTER TABLE users ALTER COLUMN status SET STATISTICS 1000;
ANALYZE users;
```

### パターン3: Sort（メモリ不足）

**問題**:
```
Sort  (cost=1000.00..1050.00 rows=20000 width=100)
  Sort Key: created_at
  Sort Method: external merge  Disk: 2000kB  -- ディスクソート！
```

**対策**:
```sql
-- work_memの増加
SET work_mem = '256MB';

-- またはインデックス追加
CREATE INDEX idx_orders_created_at ON orders(created_at);
```

### パターン4: Nested Loop（大規模）

**問題**:
```
Nested Loop  (actual time=0.100..10000.000 rows=1000000 loops=1)
  ->  Seq Scan on orders  (actual rows=10000)
  ->  Index Scan on users  (actual rows=100 loops=10000)  -- 10000回ループ！
```

**対策**:
```sql
-- Hash Joinを促す
SET enable_nestloop = off;

-- またはインデックス最適化
```

---

## バッファ分析

### BUFFERSオプション

```sql
EXPLAIN (ANALYZE, BUFFERS) SELECT ...;
```

### 出力例

```
Buffers: shared hit=100 read=50 dirtied=10 written=5
```

| 項目 | 説明 |
|------|------|
| shared hit | キャッシュヒット数 |
| shared read | ディスク読み込み数 |
| shared dirtied | 変更されたブロック数 |
| shared written | 書き込まれたブロック数 |

### 分析ポイント

- **hit率**: hit / (hit + read) が高いほど良い
- **readが多い**: バッファプールが小さい or ワーキングセットが大きい
- **dirtied/written**: 更新操作の影響

---

## 実践的なデバッグフロー

### ステップ1: 現状把握

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM orders
WHERE user_id = 'uuid-here' AND status = 'pending'
ORDER BY created_at DESC
LIMIT 10;
```

### ステップ2: 問題特定

- Seq Scan があるか？
- 推定行数と実際の行数が乖離しているか？
- Sort がディスクを使用しているか？
- Nested Loop が大量にループしているか？

### ステップ3: 改善策実行

```sql
-- インデックス追加
CREATE INDEX idx_orders_user_status_date
ON orders(user_id, status, created_at DESC);

-- 統計更新
ANALYZE orders;
```

### ステップ4: 効果検証

```sql
-- 改善後のクエリ
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM orders
WHERE user_id = 'uuid-here' AND status = 'pending'
ORDER BY created_at DESC
LIMIT 10;
```

---

## 便利なクエリ

### スロークエリの特定

```sql
SELECT query, calls, mean_time, total_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
```

### インデックス使用率

```sql
SELECT
  schemaname, tablename, indexrelname,
  idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### テーブル統計

```sql
SELECT
  relname, n_live_tup, n_dead_tup,
  last_vacuum, last_analyze
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
```

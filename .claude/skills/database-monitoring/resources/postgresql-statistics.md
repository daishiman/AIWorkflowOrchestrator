# PostgreSQL 統計情報ガイド

## pg_stat_activity

アクティブな接続とクエリの状態を確認。

### 主要クエリ

```sql
-- アクティブ接続の概要
SELECT
  state,
  COUNT(*) AS count,
  MAX(EXTRACT(EPOCH FROM (NOW() - query_start))) AS max_duration_sec
FROM pg_stat_activity
WHERE pid != pg_backend_pid()
GROUP BY state;

-- 長時間実行クエリの検出
SELECT
  pid,
  usename,
  state,
  query,
  EXTRACT(EPOCH FROM (NOW() - query_start)) AS duration_sec
FROM pg_stat_activity
WHERE state = 'active'
  AND query NOT LIKE '%pg_stat_activity%'
ORDER BY duration_sec DESC
LIMIT 10;

-- ロック待機中のクエリ
SELECT
  blocked.pid AS blocked_pid,
  blocked.query AS blocked_query,
  blocking.pid AS blocking_pid,
  blocking.query AS blocking_query
FROM pg_stat_activity blocked
JOIN pg_stat_activity blocking
  ON blocking.pid = ANY(pg_blocking_pids(blocked.pid))
WHERE blocked.pid != blocked.pid;
```

### 状態（state）の意味

| 状態 | 説明 | 対応 |
|------|------|------|
| active | クエリ実行中 | 長時間なら調査 |
| idle | 接続待機中 | 正常 |
| idle in transaction | トランザクション内待機 | 長時間なら問題 |
| idle in transaction (aborted) | 失敗したトランザクション内 | 接続リーク疑い |

## pg_stat_statements

クエリ統計の収集（拡張機能、要有効化）。

### 有効化

```sql
-- 拡張機能の有効化
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- 設定確認
SHOW pg_stat_statements.track;  -- 'all' or 'top'
```

### 主要クエリ

```sql
-- 最も時間を消費しているクエリ
SELECT
  substring(query, 1, 80) AS query_short,
  calls,
  round(total_exec_time::numeric, 2) AS total_ms,
  round(mean_exec_time::numeric, 2) AS mean_ms,
  round((100 * total_exec_time / SUM(total_exec_time) OVER())::numeric, 2) AS pct
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;

-- 最も頻繁に実行されるクエリ
SELECT
  substring(query, 1, 80) AS query_short,
  calls,
  round(mean_exec_time::numeric, 2) AS mean_ms
FROM pg_stat_statements
ORDER BY calls DESC
LIMIT 10;

-- 統計のリセット（定期的に実行）
SELECT pg_stat_statements_reset();
```

## pg_stat_user_tables

テーブル単位の統計情報。

```sql
-- テーブルスキャン統計
SELECT
  schemaname,
  relname AS table_name,
  seq_scan,      -- シーケンシャルスキャン回数
  idx_scan,      -- インデックススキャン回数
  n_tup_ins,     -- 挿入行数
  n_tup_upd,     -- 更新行数
  n_tup_del,     -- 削除行数
  n_live_tup,    -- 現在の行数
  n_dead_tup,    -- デッド行数（VACUUM対象）
  last_vacuum,
  last_autovacuum
FROM pg_stat_user_tables
ORDER BY seq_scan DESC;

-- デッド行が多いテーブル（VACUUM必要）
SELECT
  relname,
  n_dead_tup,
  n_live_tup,
  round(100.0 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2) AS dead_pct
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY n_dead_tup DESC;
```

## pg_stat_user_indexes

インデックス使用状況。

```sql
-- 使われていないインデックス
SELECT
  schemaname,
  relname AS table_name,
  indexrelname AS index_name,
  idx_scan,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexrelname NOT LIKE '%_pkey'
ORDER BY pg_relation_size(indexrelid) DESC;

-- インデックス使用率
SELECT
  relname AS table_name,
  indexrelname AS index_name,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC
LIMIT 20;
```

## キャッシュヒット率

```sql
-- テーブルキャッシュヒット率
SELECT
  sum(heap_blks_hit) / NULLIF(sum(heap_blks_hit) + sum(heap_blks_read), 0) AS cache_hit_ratio
FROM pg_statio_user_tables;

-- インデックスキャッシュヒット率
SELECT
  sum(idx_blks_hit) / NULLIF(sum(idx_blks_hit) + sum(idx_blks_read), 0) AS index_cache_hit_ratio
FROM pg_statio_user_indexes;
```

**目標**: 99% 以上のキャッシュヒット率

## データベースサイズ

```sql
-- データベース全体のサイズ
SELECT
  pg_database.datname,
  pg_size_pretty(pg_database_size(pg_database.datname)) AS size
FROM pg_database
ORDER BY pg_database_size(pg_database.datname) DESC;

-- テーブル別サイズ
SELECT
  relname AS table_name,
  pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
  pg_size_pretty(pg_relation_size(relid)) AS table_size,
  pg_size_pretty(pg_indexes_size(relid)) AS indexes_size
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(relid) DESC
LIMIT 10;
```

# パフォーマンス監視クエリ集

## pg_stat_statements

### セットアップ

```sql
-- 拡張の有効化
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- postgresql.conf に追加（再起動必要）
-- shared_preload_libraries = 'pg_stat_statements'
-- pg_stat_statements.track = all
```

### 遅いクエリのトップ10

```sql
SELECT
  substring(query, 1, 100) AS query_preview,
  calls,
  round(total_exec_time::numeric, 2) AS total_time_ms,
  round(mean_exec_time::numeric, 2) AS avg_time_ms,
  round(stddev_exec_time::numeric, 2) AS stddev_ms,
  rows
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### 最も呼び出されるクエリ

```sql
SELECT
  substring(query, 1, 100) AS query_preview,
  calls,
  round(total_exec_time::numeric, 2) AS total_time_ms,
  round((total_exec_time / calls)::numeric, 2) AS avg_time_ms
FROM pg_stat_statements
ORDER BY calls DESC
LIMIT 10;
```

### 合計実行時間が長いクエリ

```sql
SELECT
  substring(query, 1, 100) AS query_preview,
  calls,
  round(total_exec_time::numeric, 2) AS total_time_ms,
  round((total_exec_time / SUM(total_exec_time) OVER () * 100)::numeric, 2) AS pct_total
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;
```

### 統計のリセット

```sql
-- 統計をリセット
SELECT pg_stat_statements_reset();
```

## テーブル統計

### テーブルサイズ

```sql
SELECT
  schemaname,
  relname AS table_name,
  pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
  pg_size_pretty(pg_relation_size(relid)) AS table_size,
  pg_size_pretty(pg_indexes_size(relid)) AS indexes_size,
  n_live_tup AS live_rows,
  n_dead_tup AS dead_rows,
  round(100.0 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2) AS dead_ratio
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(relid) DESC
LIMIT 20;
```

### シーケンシャルスキャンが多いテーブル

```sql
SELECT
  schemaname,
  relname AS table_name,
  seq_scan,
  seq_tup_read,
  idx_scan,
  CASE WHEN seq_scan > 0
    THEN round(seq_tup_read::numeric / seq_scan, 2)
    ELSE 0
  END AS avg_seq_rows,
  n_live_tup AS live_rows
FROM pg_stat_user_tables
WHERE seq_scan > 0
ORDER BY seq_tup_read DESC
LIMIT 20;
```

### インデックス使用率

```sql
SELECT
  schemaname,
  relname AS table_name,
  idx_scan,
  seq_scan,
  CASE WHEN (idx_scan + seq_scan) > 0
    THEN round(100.0 * idx_scan / (idx_scan + seq_scan), 2)
    ELSE 0
  END AS index_usage_pct,
  n_live_tup AS live_rows
FROM pg_stat_user_tables
WHERE n_live_tup > 1000
ORDER BY index_usage_pct ASC
LIMIT 20;
```

## インデックス統計

### 未使用インデックス

```sql
SELECT
  schemaname,
  relname AS table_name,
  indexrelname AS index_name,
  idx_scan AS times_used,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexrelname NOT LIKE '%_pkey'
ORDER BY pg_relation_size(indexrelid) DESC;
```

### インデックス効率

```sql
SELECT
  schemaname,
  relname AS table_name,
  indexrelname AS index_name,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch,
  CASE WHEN idx_scan > 0
    THEN round(idx_tup_read::numeric / idx_scan, 2)
    ELSE 0
  END AS avg_rows_per_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC
LIMIT 20;
```

### インデックスサイズ

```sql
SELECT
  schemaname,
  relname AS table_name,
  indexrelname AS index_name,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
  idx_scan
FROM pg_stat_user_indexes
ORDER BY pg_relation_size(indexrelid) DESC
LIMIT 20;
```

## 接続とロック

### アクティブな接続

```sql
SELECT
  datname AS database,
  usename AS user,
  client_addr,
  state,
  query_start,
  NOW() - query_start AS duration,
  substring(query, 1, 100) AS query_preview
FROM pg_stat_activity
WHERE state != 'idle'
  AND pid != pg_backend_pid()
ORDER BY query_start;
```

### 長時間実行中のクエリ

```sql
SELECT
  pid,
  usename AS user,
  state,
  NOW() - query_start AS duration,
  substring(query, 1, 200) AS query
FROM pg_stat_activity
WHERE state != 'idle'
  AND query_start < NOW() - INTERVAL '5 minutes'
ORDER BY query_start;
```

### ロック待ち

```sql
SELECT
  blocked.pid AS blocked_pid,
  blocked.usename AS blocked_user,
  blocking.pid AS blocking_pid,
  blocking.usename AS blocking_user,
  blocked.query AS blocked_query,
  blocking.query AS blocking_query
FROM pg_stat_activity blocked
JOIN pg_stat_activity blocking ON blocking.pid = ANY(pg_blocking_pids(blocked.pid))
WHERE cardinality(pg_blocking_pids(blocked.pid)) > 0;
```

### テーブルロック状況

```sql
SELECT
  locktype,
  relation::regclass,
  mode,
  granted,
  pid,
  substring(query, 1, 100) AS query
FROM pg_locks l
JOIN pg_stat_activity a ON l.pid = a.pid
WHERE relation IS NOT NULL
  AND NOT granted
ORDER BY relation;
```

## キャッシュ効率

### バッファキャッシュヒット率

```sql
SELECT
  datname AS database,
  round(100.0 * blks_hit / NULLIF(blks_hit + blks_read, 0), 2) AS cache_hit_ratio
FROM pg_stat_database
WHERE datname = current_database();
```

### テーブル別キャッシュ効率

```sql
SELECT
  schemaname,
  relname AS table_name,
  heap_blks_read,
  heap_blks_hit,
  round(100.0 * heap_blks_hit / NULLIF(heap_blks_hit + heap_blks_read, 0), 2) AS cache_hit_ratio
FROM pg_statio_user_tables
WHERE heap_blks_read + heap_blks_hit > 0
ORDER BY heap_blks_read DESC
LIMIT 20;
```

## VACUUM状況

### 最後のVACUUM実行

```sql
SELECT
  schemaname,
  relname AS table_name,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze,
  n_dead_tup,
  n_live_tup
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC
LIMIT 20;
```

### VACUUMが必要なテーブル

```sql
SELECT
  schemaname,
  relname AS table_name,
  n_dead_tup,
  n_live_tup,
  round(100.0 * n_dead_tup / NULLIF(n_live_tup, 0), 2) AS dead_ratio,
  last_autovacuum
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY n_dead_tup DESC;
```

## レプリケーション

### レプリカ遅延（プライマリで実行）

```sql
SELECT
  client_addr,
  state,
  sent_lsn,
  write_lsn,
  flush_lsn,
  replay_lsn,
  pg_wal_lsn_diff(sent_lsn, replay_lsn) AS replay_lag_bytes
FROM pg_stat_replication;
```

## ダッシュボード用サマリー

### 総合ヘルスチェック

```sql
WITH stats AS (
  SELECT
    (SELECT round(100.0 * blks_hit / NULLIF(blks_hit + blks_read, 0), 2)
     FROM pg_stat_database WHERE datname = current_database()) AS cache_hit_ratio,
    (SELECT COUNT(*) FROM pg_stat_activity WHERE state != 'idle') AS active_connections,
    (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'idle') AS idle_connections,
    (SELECT COUNT(*) FROM pg_locks WHERE NOT granted) AS blocked_queries,
    (SELECT COUNT(*) FROM pg_stat_activity
     WHERE state != 'idle' AND query_start < NOW() - INTERVAL '5 minutes') AS long_running
)
SELECT * FROM stats;
```

## チェックリスト

### 日次監視
- [ ] 遅いクエリのトップ10を確認
- [ ] アクティブ接続数を確認
- [ ] キャッシュヒット率を確認
- [ ] 長時間実行クエリがないか確認

### 週次監視
- [ ] 未使用インデックスを確認
- [ ] テーブル/インデックスサイズの推移を確認
- [ ] dead_tupが多いテーブルを確認
- [ ] シーケンシャルスキャンが多いテーブルを確認

### 月次レビュー
- [ ] pg_stat_statementsの統計をレビュー
- [ ] インデックス戦略を見直し
- [ ] VACUUM設定を確認
- [ ] パフォーマンスレポートを作成

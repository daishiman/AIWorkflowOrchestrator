# 健全性メトリクスと閾値設計

## 主要監視メトリクス

### 接続数メトリクス

| メトリクス | 説明 | 閾値（Warning） | 閾値（Critical） |
|-----------|------|-----------------|------------------|
| active_connections | アクティブ接続数 | max * 80% | max * 95% |
| idle_connections | アイドル接続数 | max * 50% | max * 70% |
| waiting_connections | 待機中接続数 | 5 | 20 |
| connections_by_state | 状態別接続数 | - | - |

### クエリパフォーマンスメトリクス

| メトリクス | 説明 | 閾値（Warning） | 閾値（Critical） |
|-----------|------|-----------------|------------------|
| slow_queries_per_min | スロークエリ数/分 | 10 | 50 |
| avg_query_time_ms | 平均クエリ時間 | 100ms | 500ms |
| max_query_time_sec | 最大クエリ時間 | 5s | 30s |
| queries_per_sec | QPS | - | - |

### リソースメトリクス

| メトリクス | 説明 | 閾値（Warning） | 閾値（Critical） |
|-----------|------|-----------------|------------------|
| disk_usage_pct | ディスク使用率 | 80% | 90% |
| database_size_growth | DB成長率/日 | 5% | 10% |
| cache_hit_ratio | キャッシュヒット率 | < 95% | < 90% |
| dead_tuples_ratio | デッド行比率 | 10% | 30% |

### ロック・デッドロックメトリクス

| メトリクス | 説明 | 閾値（Warning） | 閾値（Critical） |
|-----------|------|-----------------|------------------|
| lock_waits | ロック待機数 | 5 | 20 |
| deadlocks | デッドロック発生数 | 1/hour | 5/hour |
| lock_wait_time_ms | ロック待機時間 | 1000ms | 5000ms |

### レプリケーションメトリクス（該当する場合）

| メトリクス | 説明 | 閾値（Warning） | 閾値（Critical） |
|-----------|------|-----------------|------------------|
| replication_lag_sec | レプリケーション遅延 | 10s | 60s |
| wal_sender_state | WAL送信状態 | - | not streaming |

## Neon 固有のメトリクス

```yaml
neon_metrics:
  compute_active_time_sec:
    description: コンピュートアクティブ時間
    warning: 長時間連続稼働

  compute_cold_starts:
    description: コールドスタート回数
    warning: 頻繁なコールドスタート

  storage_size_bytes:
    description: ストレージ使用量
    warning: 急激な増加

  branching_lag:
    description: ブランチ同期遅延
    warning: 大きな遅延
```

## Supabase 固有のメトリクス

```yaml
supabase_metrics:
  realtime_connections:
    description: Realtime接続数
    warning: 制限の80%
    critical: 制限の95%

  storage_used_bytes:
    description: Storage使用量
    warning: 制限の80%

  edge_function_invocations:
    description: Edge Function実行数
    note: 請求に影響

  api_requests_per_sec:
    description: API リクエスト数
    warning: レート制限接近
```

## SLI/SLO 設計ガイド

### 推奨SLI

1. **可用性 SLI**
   - 定義: 成功したクエリ / 全クエリ
   - 目標SLO: 99.9%

2. **レイテンシ SLI**
   - 定義: p99 クエリレイテンシ
   - 目標SLO: < 200ms

3. **エラー率 SLI**
   - 定義: エラークエリ / 全クエリ
   - 目標SLO: < 0.1%

### エラーバジェット計算

```
月間エラーバジェット = 43,200分 × (1 - SLO)

例: SLO 99.9% の場合
  = 43,200 × 0.001
  = 43.2分/月 の許容ダウンタイム
```

## 監視クエリ集

### 接続数確認

```sql
SELECT
  COUNT(*) FILTER (WHERE state = 'active') AS active,
  COUNT(*) FILTER (WHERE state = 'idle') AS idle,
  COUNT(*) FILTER (WHERE state = 'idle in transaction') AS idle_in_tx,
  COUNT(*) AS total,
  (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') AS max_conn
FROM pg_stat_activity;
```

### スロークエリカウント

```sql
-- 過去5分間のスロークエリ数（5秒以上）
SELECT COUNT(*)
FROM pg_stat_activity
WHERE state = 'active'
  AND query_start < NOW() - INTERVAL '5 seconds';
```

### キャッシュヒット率

```sql
SELECT
  ROUND(100.0 * SUM(heap_blks_hit) /
    NULLIF(SUM(heap_blks_hit) + SUM(heap_blks_read), 0), 2) AS cache_hit_pct
FROM pg_statio_user_tables;
```

### ディスク使用量

```sql
SELECT
  pg_size_pretty(pg_database_size(current_database())) AS db_size,
  pg_size_pretty(
    (SELECT SUM(pg_total_relation_size(relid)) FROM pg_stat_user_tables)
  ) AS tables_size;
```

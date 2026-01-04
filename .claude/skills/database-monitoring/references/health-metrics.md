# 健全性メトリクスと閾値設計

## 主要監視メトリクス

### 接続数メトリクス

| メトリクス           | 説明             | 閾値（Warning） | 閾値（Critical） |
| -------------------- | ---------------- | --------------- | ---------------- |
| active_connections   | アクティブ接続数 | max \* 80%      | max \* 95%       |
| idle_connections     | アイドル接続数   | max \* 50%      | max \* 70%       |
| waiting_connections  | 待機中接続数     | 5               | 20               |
| connections_by_state | 状態別接続数     | -               | -                |

### クエリパフォーマンスメトリクス

| メトリクス           | 説明              | 閾値（Warning） | 閾値（Critical） |
| -------------------- | ----------------- | --------------- | ---------------- |
| slow_queries_per_min | スロークエリ数/分 | 10              | 50               |
| avg_query_time_ms    | 平均クエリ時間    | 100ms           | 500ms            |
| max_query_time_sec   | 最大クエリ時間    | 5s              | 30s              |
| queries_per_sec      | QPS               | -               | -                |

### リソースメトリクス

| メトリクス           | 説明               | 閾値（Warning） | 閾値（Critical） |
| -------------------- | ------------------ | --------------- | ---------------- |
| disk_usage_pct       | ディスク使用率     | 80%             | 90%              |
| database_size_growth | DB成長率/日        | 5%              | 10%              |
| cache_hit_ratio      | キャッシュヒット率 | < 95%           | < 90%            |
| dead_tuples_ratio    | デッド行比率       | 10%             | 30%              |

### ロック・デッドロックメトリクス

| メトリクス        | 説明               | 閾値（Warning） | 閾値（Critical） |
| ----------------- | ------------------ | --------------- | ---------------- |
| lock_waits        | ロック待機数       | 5               | 20               |
| deadlocks         | デッドロック発生数 | 1/hour          | 5/hour           |
| lock_wait_time_ms | ロック待機時間     | 1000ms          | 5000ms           |

### レプリケーションメトリクス（該当する場合）

| メトリクス          | 説明                 | 閾値（Warning） | 閾値（Critical） |
| ------------------- | -------------------- | --------------- | ---------------- |
| replication_lag_sec | レプリケーション遅延 | 10s             | 60s              |
| wal_sender_state    | WAL送信状態          | -               | not streaming    |

## Turso 固有のメトリクス

```yaml
turso_metrics:
  http_connection_count:
    description: HTTP接続数
    warning: 制限の80%
    critical: 制限の95%

  websocket_connection_count:
    description: WebSocket接続数
    warning: 制限の80%
    critical: 制限の95%

  replication_lag_ms:
    description: レプリケーション遅延（ミリ秒）
    warning: 1000ms
    critical: 5000ms

  edge_location_latency:
    description: エッジロケーション別レイテンシ
    warning: p95 > 200ms
    critical: p95 > 500ms

  database_size_bytes:
    description: データベースサイズ
    warning: 急激な増加
    note: プラン制限確認

  read_ops_per_sec:
    description: 読み取り操作/秒
    warning: レート制限接近

  write_ops_per_sec:
    description: 書き込み操作/秒
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

### 接続数確認（アプリケーションレベル）

```javascript
// libSQL/Tursoクライアントでの接続プール監視
import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// アプリケーションレベルでの接続統計
const stats = {
  activeConnections: connectionPool.activeCount,
  idleConnections: connectionPool.idleCount,
  totalConnections: connectionPool.totalCount,
  maxConnections: connectionPool.max,
};
```

### スロークエリカウント（アプリケーションレベル）

```javascript
// クエリ実行時間の記録
const startTime = Date.now();
const result = await client.execute(query);
const duration = Date.now() - startTime;

if (duration > 5000) {
  logger.warn("Slow query detected", { query, duration });
}
```

### データベースサイズ

```sql
-- データベースサイズ（バイト）
SELECT
  (SELECT page_count FROM pragma_page_count()) *
  (SELECT page_size FROM pragma_page_size()) AS size_bytes;

-- 人間が読みやすい形式
SELECT
  CASE
    WHEN size_bytes < 1024 THEN size_bytes || ' B'
    WHEN size_bytes < 1024*1024 THEN ROUND(size_bytes/1024.0, 2) || ' KB'
    WHEN size_bytes < 1024*1024*1024 THEN ROUND(size_bytes/(1024.0*1024), 2) || ' MB'
    ELSE ROUND(size_bytes/(1024.0*1024*1024), 2) || ' GB'
  END AS db_size
FROM (
  SELECT
    (SELECT page_count FROM pragma_page_count()) *
    (SELECT page_size FROM pragma_page_size()) AS size_bytes
);
```

### 断片化チェック

```sql
-- 断片化率の確認
SELECT
  ROUND((SELECT freelist_count FROM pragma_freelist_count()) * 100.0 /
    (SELECT page_count FROM pragma_page_count()), 2) AS fragmentation_pct;
```

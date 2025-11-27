# スロークエリログ設定と分析

## PostgreSQL スロークエリログ設定

### 基本設定

```sql
-- postgresql.conf または ALTER SYSTEM で設定
ALTER SYSTEM SET log_min_duration_statement = '1000';  -- 1秒以上
ALTER SYSTEM SET log_statement = 'none';  -- ddl, mod, all から選択
ALTER SYSTEM SET log_duration = 'off';
ALTER SYSTEM SET log_lock_waits = 'on';
ALTER SYSTEM SET deadlock_timeout = '1s';

-- 設定を反映
SELECT pg_reload_conf();
```

### 推奨設定値

| 環境 | log_min_duration_statement | 説明 |
|------|---------------------------|------|
| 開発 | 100ms | 積極的に検出 |
| ステージング | 500ms | 本番に近い設定 |
| 本番 | 1000ms | ノイズを抑制 |
| 調査時 | 0（全クエリ） | 一時的に有効化 |

## Neon での設定

Neon はマネージドサービスのため、設定方法が異なります。

```sql
-- プロジェクト設定で log_min_duration_statement を設定
-- Neon Console > Project Settings > Database から設定

-- 現在の設定確認
SHOW log_min_duration_statement;
```

**Neon での注意点**:
- コンピュートが自動スケールするため、コールドスタート時間も考慮
- ログは Neon Console のメトリクスで確認
- pg_stat_statements で詳細分析可能

## Supabase での設定

```sql
-- Supabase Dashboard > Database > Extensions
-- pg_stat_statements を有効化

-- スロークエリの確認
SELECT
  query,
  calls,
  mean_exec_time,
  total_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 1000  -- 1秒以上
ORDER BY mean_exec_time DESC;
```

**Supabase での注意点**:
- PostgreSQL ログは Database > Logs で確認
- 詳細設定は Connection Pooler 経由の場合、制限あり
- Edge Functions からの DB アクセスも監視対象

## ログ分析パターン

### 頻出スロークエリの特定

```sql
-- pg_stat_statements から分析
SELECT
  substring(query, 1, 100) AS query_short,
  calls,
  round(total_exec_time::numeric, 2) AS total_ms,
  round(mean_exec_time::numeric, 2) AS mean_ms,
  round(stddev_exec_time::numeric, 2) AS stddev_ms,
  rows
FROM pg_stat_statements
WHERE mean_exec_time > 100  -- 100ms以上
ORDER BY total_exec_time DESC
LIMIT 20;
```

### 時間帯別分析

```sql
-- 時間帯別のスロークエリ傾向（ログから）
SELECT
  date_trunc('hour', log_time) AS hour,
  COUNT(*) AS slow_query_count,
  AVG(duration_ms) AS avg_duration
FROM slow_query_log  -- カスタムログテーブル
GROUP BY date_trunc('hour', log_time)
ORDER BY hour;
```

### クエリパターン分類

```sql
-- クエリタイプ別の分析
SELECT
  CASE
    WHEN query ILIKE 'SELECT%' THEN 'SELECT'
    WHEN query ILIKE 'INSERT%' THEN 'INSERT'
    WHEN query ILIKE 'UPDATE%' THEN 'UPDATE'
    WHEN query ILIKE 'DELETE%' THEN 'DELETE'
    ELSE 'OTHER'
  END AS query_type,
  COUNT(*) AS count,
  round(AVG(mean_exec_time)::numeric, 2) AS avg_ms
FROM pg_stat_statements
GROUP BY query_type
ORDER BY avg_ms DESC;
```

## アラート連携

### スロークエリ検出スクリプト

```javascript
// scripts/detect-slow-queries.mjs
async function detectSlowQueries(client, thresholdMs = 1000) {
  const result = await client.query(`
    SELECT
      pid,
      usename,
      query,
      EXTRACT(EPOCH FROM (NOW() - query_start)) * 1000 AS duration_ms
    FROM pg_stat_activity
    WHERE state = 'active'
      AND query NOT LIKE '%pg_stat_activity%'
      AND query_start < NOW() - INTERVAL '${thresholdMs} milliseconds'
  `);

  return result.rows.map(row => ({
    pid: row.pid,
    user: row.usename,
    query: row.query.substring(0, 200),
    durationMs: Math.round(row.duration_ms)
  }));
}
```

### Webhook 通知例

```javascript
async function notifySlowQuery(slowQueries) {
  if (slowQueries.length === 0) return;

  await fetch(process.env.WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      alert: 'slow_queries_detected',
      count: slowQueries.length,
      queries: slowQueries,
      timestamp: new Date().toISOString()
    })
  });
}
```

## 最適化へのエスカレーション

スロークエリを検出したら:

1. **即座の対応**
   - クエリがまだ実行中なら、影響を評価
   - 必要に応じて `pg_cancel_backend(pid)` で停止

2. **分析**
   - `EXPLAIN ANALYZE` で実行計画を確認
   - インデックス不足、統計情報の古さをチェック

3. **最適化**
   - query-performance-tuning スキルを参照
   - インデックス追加、クエリ書き換えを検討

4. **予防**
   - 類似パターンのクエリを検索
   - アプリケーションコードのレビュー

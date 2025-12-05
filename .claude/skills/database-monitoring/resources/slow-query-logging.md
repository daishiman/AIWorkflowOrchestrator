# スロークエリログ設定と分析

## SQLite/Turso スロークエリログ設定

### アプリケーションレベルでのログ設定

SQLiteにはPostgreSQLのような組み込みスロークエリログがないため、
アプリケーションレベルでクエリ実行時間を記録します。

```javascript
// libSQL/Tursoクライアントでのスロークエリログ実装例
import { createClient } from "@libsql/client";

class MonitoredClient {
  constructor(config, slowQueryThreshold = 1000) {
    this.client = createClient(config);
    this.slowQueryThreshold = slowQueryThreshold;
  }

  async execute(query, params) {
    const startTime = Date.now();
    try {
      const result = await this.client.execute(query, params);
      const duration = Date.now() - startTime;

      if (duration > this.slowQueryThreshold) {
        this.logSlowQuery(query, duration, params);
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logQueryError(query, duration, error);
      throw error;
    }
  }

  logSlowQuery(query, duration, params) {
    console.warn("Slow query detected", {
      query: query.substring(0, 200),
      duration_ms: duration,
      params,
      timestamp: new Date().toISOString(),
    });
  }
}
```

### 推奨閾値

| 環境         | スロークエリ閾値 | 説明           |
| ------------ | ---------------- | -------------- |
| 開発         | 100ms            | 積極的に検出   |
| ステージング | 500ms            | 本番に近い設定 |
| 本番         | 1000ms           | ノイズを抑制   |
| 調査時       | 0（全クエリ）    | 一時的に有効化 |

## Turso での設定

Tursoはマネージドサービスのため、アプリケーションレベルでの監視が主となります。

```javascript
// Tursoクライアントでの監視実装
import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// クエリラッパーでのロギング
async function monitoredQuery(sql, params = []) {
  const start = performance.now();
  try {
    const result = await client.execute(sql, params);
    const duration = performance.now() - start;

    if (duration > 1000) {
      // Turso Analytics APIまたはログサービスへ送信
      await sendMetrics({
        type: "slow_query",
        duration,
        query: sql.substring(0, 200),
        timestamp: Date.now(),
      });
    }

    return result;
  } catch (error) {
    // エラーログも記録
    throw error;
  }
}
```

**Turso での注意点**:

- エッジロケーションによるレイテンシの違いを考慮
- レプリケーション遅延がクエリパフォーマンスに影響する場合がある
- Turso Analyticsダッシュボードで全体的な傾向を確認可能

## ログ分析パターン

### 頻出スロークエリの特定（アプリケーションレベル）

```javascript
// スロークエリ統計の集計
class QueryAnalyzer {
  constructor() {
    this.queryStats = new Map();
  }

  recordQuery(query, duration) {
    const key = query.substring(0, 100);
    const stats = this.queryStats.get(key) || {
      query: key,
      calls: 0,
      totalDuration: 0,
      maxDuration: 0,
      durations: [],
    };

    stats.calls++;
    stats.totalDuration += duration;
    stats.maxDuration = Math.max(stats.maxDuration, duration);
    stats.durations.push(duration);

    this.queryStats.set(key, stats);
  }

  getSlowQueries(threshold = 100) {
    return Array.from(this.queryStats.values())
      .filter((s) => s.totalDuration / s.calls > threshold)
      .sort((a, b) => b.totalDuration - a.totalDuration)
      .slice(0, 20);
  }
}
```

### 時間帯別分析

```sql
-- 時間帯別のスロークエリ傾向（ログから）
SELECT
  strftime('%Y-%m-%d %H:00:00', log_time) AS hour,
  COUNT(*) AS slow_query_count,
  AVG(duration_ms) AS avg_duration
FROM slow_query_log  -- カスタムログテーブル
GROUP BY strftime('%Y-%m-%d %H:00:00', log_time)
ORDER BY hour;
```

### クエリパターン分類

```sql
-- クエリタイプ別の分析(カスタムログテーブルから)
SELECT
  CASE
    WHEN query LIKE 'SELECT%' THEN 'SELECT'
    WHEN query LIKE 'INSERT%' THEN 'INSERT'
    WHEN query LIKE 'UPDATE%' THEN 'UPDATE'
    WHEN query LIKE 'DELETE%' THEN 'DELETE'
    ELSE 'OTHER'
  END AS query_type,
  COUNT(*) AS count,
  ROUND(AVG(duration_ms), 2) AS avg_ms
FROM slow_query_log
GROUP BY query_type
ORDER BY avg_ms DESC;
```

## アラート連携

### スロークエリ検出スクリプト

```javascript
// scripts/detect-slow-queries.mjs
// SQLite/Tursoではアプリケーションレベルでの監視が必要
async function detectSlowQueries(db, thresholdMs = 1000) {
  // カスタムログテーブルから取得
  const stmt = db.prepare(`
    SELECT
      query,
      duration_ms,
      timestamp
    FROM slow_query_log
    WHERE duration_ms > ?
      AND timestamp > datetime('now', '-1 hour')
    ORDER BY duration_ms DESC
    LIMIT 20
  `);

  return stmt.all(thresholdMs).map((row) => ({
    query: row.query.substring(0, 200),
    durationMs: row.duration_ms,
    timestamp: row.timestamp,
  }));
}
```

### Webhook 通知例

```javascript
async function notifySlowQuery(slowQueries) {
  if (slowQueries.length === 0) return;

  await fetch(process.env.WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      alert: "slow_queries_detected",
      count: slowQueries.length,
      queries: slowQueries,
      timestamp: new Date().toISOString(),
    }),
  });
}
```

## 最適化へのエスカレーション

スロークエリを検出したら:

1. **即座の対応**
   - クエリの影響範囲を評価
   - 必要に応じてアプリケーション再起動で対処

2. **分析**
   - `EXPLAIN QUERY PLAN` で実行計画を確認
   - インデックス不足、テーブルスキャンをチェック

3. **最適化**
   - query-performance-tuning スキルを参照
   - インデックス追加、クエリ書き換えを検討

4. **予防**
   - 類似パターンのクエリを検索
   - アプリケーションコードのレビュー

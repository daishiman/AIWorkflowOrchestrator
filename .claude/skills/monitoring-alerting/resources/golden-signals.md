# ゴールデンシグナル

## 概要

ゴールデンシグナルは、Google SREが提唱する4つの基本的な監視指標です。
これらを監視することで、システムの健全性を効果的に把握できます。

## 4つのシグナル

### 1. レイテンシー（Latency）

**定義**: リクエストの処理にかかる時間

**重要なポイント**:
- 成功したリクエストと失敗したリクエストを分けて測定
- パーセンタイル（p50, p95, p99）で測定
- 平均値だけでは不十分

**測定例**:

```typescript
// Express middleware example
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;

    // メトリクス記録
    metrics.histogram('http_request_duration_ms', duration, {
      method: req.method,
      path: req.route?.path || req.path,
      status: String(status),
    });
  });

  next();
});
```

**閾値の例**:

| パーセンタイル | 警告 | 重大 |
|--------------|------|------|
| p50 | > 100ms | > 200ms |
| p95 | > 500ms | > 1000ms |
| p99 | > 1000ms | > 2000ms |

### 2. トラフィック（Traffic）

**定義**: システムへの需要量

**測定対象**:
- HTTPリクエスト数（RPS）
- 同時接続数
- トランザクション数
- データ転送量

**測定例**:

```typescript
// リクエストカウンター
let requestCount = 0;

app.use((req, res, next) => {
  requestCount++;

  metrics.counter('http_requests_total', 1, {
    method: req.method,
    path: req.route?.path || req.path,
  });

  next();
});

// 1分ごとにRPSを計算
setInterval(() => {
  const rps = requestCount / 60;
  metrics.gauge('http_requests_per_second', rps);
  requestCount = 0;
}, 60000);
```

**閾値の例**:

| 指標 | 警告 | 重大 |
|------|------|------|
| RPS増加率 | > 50%/5min | > 100%/5min |
| 同時接続数 | > 80%キャパシティ | > 95%キャパシティ |

### 3. エラー（Errors）

**定義**: 失敗したリクエストの割合

**測定対象**:
- HTTPエラー率（5xx）
- アプリケーション例外
- タイムアウト
- 不正なレスポンス

**測定例**:

```typescript
// エラーカウンター
app.use((req, res, next) => {
  res.on('finish', () => {
    if (res.statusCode >= 500) {
      metrics.counter('http_errors_total', 1, {
        status: String(res.statusCode),
        path: req.route?.path || req.path,
      });
    }
  });

  next();
});

// エラーハンドラー
app.use((err, req, res, next) => {
  metrics.counter('application_errors_total', 1, {
    error_type: err.name,
    path: req.route?.path || req.path,
  });

  next(err);
});
```

**閾値の例**:

| 指標 | 警告 | 重大 |
|------|------|------|
| エラー率 | > 1% | > 5% |
| 5xx/分 | > 10 | > 50 |

### 4. 飽和度（Saturation）

**定義**: リソースの使用率

**測定対象**:
- CPU使用率
- メモリ使用率
- ディスク使用率
- データベース接続プール
- キュー長

**測定例**:

```typescript
// Node.js メモリ/CPU監視
function collectResourceMetrics() {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

  metrics.gauge('nodejs_memory_heap_used_bytes', memUsage.heapUsed);
  metrics.gauge('nodejs_memory_heap_total_bytes', memUsage.heapTotal);
  metrics.gauge('nodejs_memory_rss_bytes', memUsage.rss);

  // ヒープ使用率
  const heapUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
  metrics.gauge('nodejs_memory_heap_usage_percent', heapUsagePercent);
}

setInterval(collectResourceMetrics, 10000);
```

**閾値の例**:

| リソース | 警告 | 重大 |
|---------|------|------|
| CPU | > 70% | > 90% |
| メモリ | > 75% | > 90% |
| ディスク | > 80% | > 95% |
| DB接続 | > 70% | > 90% |

## ダッシュボード設計

### 推奨レイアウト

```
┌─────────────────────────────────────────────────────┐
│                   Service Health                     │
├─────────────────┬─────────────────┬─────────────────┤
│   Latency       │   Traffic       │   Errors        │
│   p50: 45ms     │   RPS: 1.2k     │   Rate: 0.1%    │
│   p95: 120ms    │   Peak: 2.5k    │   5xx: 3        │
│   p99: 250ms    │   Avg: 1.0k     │   4xx: 25       │
├─────────────────┴─────────────────┴─────────────────┤
│                   Saturation                         │
│   CPU: 45%  │  Memory: 62%  │  Disk: 35%  │  DB: 20%│
├─────────────────────────────────────────────────────┤
│                   Trends (24h)                       │
│   [グラフ: レイテンシー推移]                           │
│   [グラフ: トラフィック推移]                           │
│   [グラフ: エラー率推移]                               │
└─────────────────────────────────────────────────────┘
```

## SLI/SLOへの適用

### SLI定義例

```yaml
# レイテンシー SLI
latency_sli:
  description: "API応答時間の99パーセンタイル"
  metric: http_request_duration_ms_p99
  target: < 500ms

# 可用性 SLI
availability_sli:
  description: "成功したリクエストの割合"
  formula: (1 - error_rate) * 100
  target: > 99.9%

# スループット SLI
throughput_sli:
  description: "処理可能なRPS"
  metric: requests_per_second
  target: > 1000
```

### SLO設定例

```yaml
slos:
  - name: api_latency
    sli: latency_sli
    target: 99.9%
    window: 30d
    alert_threshold: 99.5%

  - name: api_availability
    sli: availability_sli
    target: 99.95%
    window: 30d
    alert_threshold: 99.9%
```

## 実装パターン

### Express.js での実装

```typescript
import express from 'express';

const app = express();

// メトリクス収集ミドルウェア
app.use((req, res, next) => {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1_000_000;

    // 全メトリクスを記録
    recordMetrics({
      method: req.method,
      path: req.route?.path || 'unknown',
      status: res.statusCode,
      duration: durationMs,
    });
  });

  next();
});

function recordMetrics(data: {
  method: string;
  path: string;
  status: number;
  duration: number;
}) {
  // レイテンシー
  console.log(`[METRIC] latency_ms=${data.duration.toFixed(2)} path=${data.path}`);

  // エラー
  if (data.status >= 500) {
    console.log(`[METRIC] error_5xx=1 path=${data.path}`);
  }

  // トラフィック（カウンター）
  console.log(`[METRIC] request_count=1 path=${data.path}`);
}
```

### Next.js での実装

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // リクエスト開始時刻をヘッダーに記録
  response.headers.set('X-Request-Start', Date.now().toString());

  return response;
}
```

## ベストプラクティス

### すべきこと

1. **パーセンタイルを使用**
   - 平均だけでなくp50/p95/p99を監視
   - 外れ値の影響を把握

2. **ラベルを適切に使用**
   - エンドポイント別
   - HTTPメソッド別
   - ステータスコード別

3. **ベースラインを確立**
   - 正常時の値を把握
   - 季節変動を考慮

### 避けるべきこと

1. **高カーディナリティのラベル**
   - ❌ ユーザーIDをラベルに
   - ❌ リクエストIDをラベルに

2. **過度な粒度**
   - ❌ 1秒ごとの詳細データ保持
   - ✅ 適切な集約間隔

## Railway/Vercel での監視

### Railway

```bash
# ログでメトリクスを出力
railway logs | grep METRIC

# ダッシュボードでメトリクス確認
Railway Dashboard → Service → Metrics
```

### Vercel

```
Vercel Dashboard → Project → Analytics
- Web Vitals
- Function Duration
- Edge Function Invocations
```

## 参考

- [Google SRE Book - Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/)
- [USE Method](http://www.brendangregg.com/usemethod.html)
- [RED Method](https://grafana.com/blog/2018/08/02/the-red-method-how-to-instrument-your-services/)

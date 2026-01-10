# 監視・アラート 実装パターン

> 相対パス: `references/patterns.md`
> 読込条件: 設計・実装時

---

## USE/REDメソッド

### USEメソッド（リソース向け）

| 指標        | 説明           | 例               |
| ----------- | -------------- | ---------------- |
| Utilization | リソース使用率 | CPU 70%          |
| Saturation  | 待ち行列の深さ | キュー長 100     |
| Errors      | エラー発生数   | I/Oエラー 5件/分 |

### REDメソッド（サービス向け）

| 指標     | 説明            | 例          |
| -------- | --------------- | ----------- |
| Rate     | リクエスト数/秒 | 1000 RPS    |
| Errors   | エラー率        | 0.1%        |
| Duration | 処理時間        | p99 = 200ms |

---

## メトリクス収集パターン

### Express.jsミドルウェア

```typescript
app.use((req, res, next) => {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;

    metrics.histogram("http_request_duration_ms", durationMs, {
      method: req.method,
      path: req.route?.path || "unknown",
      status: String(res.statusCode),
    });

    if (res.statusCode >= 500) {
      metrics.counter("http_errors_total", 1, {
        status: String(res.statusCode),
      });
    }
  });

  next();
});
```

### Next.js Middleware

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const correlationId =
    request.headers.get("x-correlation-id") || crypto.randomUUID();

  response.headers.set("x-correlation-id", correlationId);
  response.headers.set("x-request-start", Date.now().toString());

  return response;
}
```

---

## アラートルール設計パターン

### 多重閾値パターン

```yaml
groups:
  - name: latency_alerts
    rules:
      # Warning: 軽微な遅延
      - alert: HighLatencyWarning
        expr: histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m])) > 0.5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "p99 latency > 500ms"

      # Critical: 重大な遅延
      - alert: HighLatencyCritical
        expr: histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m])) > 1.0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "p99 latency > 1s"
```

### エラーバジェットベースアラート

```yaml
# 月間エラーバジェットの消費速度をアラート
- alert: ErrorBudgetBurnRate
  expr: |
    (
      sum(rate(http_requests_total{status=~"5.."}[1h]))
      / sum(rate(http_requests_total[1h]))
    ) > 0.001 * 14.4
  for: 1h
  labels:
    severity: critical
  annotations:
    summary: "Error budget burning 14.4x faster than sustainable"
```

---

## 構造化ログパターン

### リクエストログ

```typescript
// リクエスト開始
logger.info("Request started", {
  correlationId: req.correlationId,
  method: req.method,
  path: req.path,
  userAgent: req.headers["user-agent"],
});

// リクエスト完了
logger.info("Request completed", {
  correlationId: req.correlationId,
  method: req.method,
  path: req.path,
  status: res.statusCode,
  duration: Date.now() - startTime,
});
```

### エラーログ

```typescript
try {
  await someOperation();
} catch (error) {
  logger.error("Operation failed", {
    correlationId: req.correlationId,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    operation: "someOperation",
    input: sanitizeInput(input),
  });
}
```

### 機密情報サニタイズ

```typescript
function sanitizeForLogging(
  obj: Record<string, unknown>,
): Record<string, unknown> {
  const sensitiveKeys = [
    "password",
    "token",
    "apiKey",
    "secret",
    "authorization",
  ];
  const result = { ...obj };

  for (const key of Object.keys(result)) {
    if (sensitiveKeys.some((k) => key.toLowerCase().includes(k))) {
      result[key] = "[REDACTED]";
    }
  }

  return result;
}
```

---

## 通知パターン

### Discord Webhook

```typescript
async function sendDiscordAlert(alert: Alert) {
  const color = alert.severity === "critical" ? 0xff0000 : 0xffa500;

  await fetch(process.env.DISCORD_WEBHOOK_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embeds: [
        {
          title: `🚨 ${alert.name}`,
          description: alert.summary,
          color,
          fields: [
            { name: "Severity", value: alert.severity, inline: true },
            { name: "Service", value: alert.service, inline: true },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    }),
  });
}
```

### 重大度別ルーティング

| 重大度   | 通知先              | 応答時間目標 |
| -------- | ------------------- | ------------ |
| Critical | Discord + PagerDuty | 5分以内      |
| Warning  | Discord             | 1時間以内    |
| Info     | ログのみ            | -            |

---

## ダッシュボードパターン

### レイアウト構成

```
┌─────────────────────────────────────────────────┐
│              Service Health Overview             │
├─────────────┬─────────────┬─────────────────────┤
│   Latency   │   Traffic   │      Errors         │
│   p50: 45ms │   RPS: 1.2k │      Rate: 0.1%     │
│   p95: 120ms│   Peak: 2.5k│      5xx: 3         │
├─────────────┴─────────────┴─────────────────────┤
│                  Saturation                      │
│   CPU: 45%   Memory: 62%   Disk: 35%   DB: 20% │
├─────────────────────────────────────────────────┤
│              24h Trend Graphs                    │
│   [Latency Graph] [Traffic Graph] [Error Graph] │
└─────────────────────────────────────────────────┘
```

### Grafana変数

```json
{
  "templating": {
    "list": [
      { "name": "environment", "type": "query", "query": "label_values(env)" },
      { "name": "service", "type": "query", "query": "label_values(service)" }
    ]
  }
}
```

---

## チェックリスト

- [ ] USE/REDメソッドを適用している
- [ ] メトリクス収集ミドルウェアが実装されている
- [ ] 多重閾値アラートが設定されている
- [ ] 構造化ログに機密情報が含まれていない
- [ ] ダッシュボードでゴールデンシグナルが可視化されている

---

## 参照

- **基本概念**: See [basics.md](basics.md)
- **ゴールデンシグナル**: See [golden-signals.md](golden-signals.md)
- **アラートルール**: See [alerting-rules.md](alerting-rules.md)

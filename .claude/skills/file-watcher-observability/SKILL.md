---
name: file-watcher-observability
description: |
  ファイル監視システムの可観測性（Observability）設計と実装。
  Metrics、Logs、Tracesの3本柱に基づくPrometheus/Grafana統合パターンを提供。

  専門分野:
  - Prometheusメトリクス: Counter, Gauge, Histogram設計
  - 構造化ログ: JSON形式、ログレベル管理、トレースID
  - アラート設計: 閾値設定、アラートマネージャー、通知チャネル
  - ダッシュボード: Grafana可視化、パネル設計

  使用タイミング:
  - 本番環境でのファイル監視のパフォーマンス監視が必要な時
  - SLA遵守のための定量的測定が必要な時
  - 障害の根本原因分析（RCA）を実施する時
  - キャパシティプランニングのデータ収集時

  Use when monitoring file watcher performance in production,
  measuring SLA compliance, or conducting root cause analysis.
version: 1.0.0
---

# file-watcher-observability

> ファイル監視システムの可観測性：メトリクス収集、パフォーマンス監視、アラート設計

## 概要

### このスキルが解決する問題

ファイル監視システムを本番運用する際、以下の課題に直面する：

1. **パフォーマンス劣化の検出**: いつ、なぜ遅くなったのか特定できない
2. **リソース使用量の把握**: メモリリーク、CPU過負荷の早期検出
3. **障害の根本原因分析**: イベントドロップ、処理遅延の原因特定
4. **キャパシティプランニング**: スケーリング判断のためのデータ不足
5. **SLA遵守の証明**: 処理遅延、可用性の定量的な測定

### 可観測性の3本柱

```
Metrics（メトリクス）: 数値データの時系列収集
    ↓
Logs（ログ）: 構造化イベント記録
    ↓
Traces（トレース）: 処理フローの追跡
```

---

## クイックリファレンス

### 主要メトリクス一覧

| メトリクス | 型 | 単位 | アラート閾値 |
|-----------|-----|------|------------|
| `watcher.events.rate` | Gauge | events/sec | > 1000/s |
| `watcher.events.total` | Counter | count | - |
| `watcher.latency.p99` | Histogram | ms | > 500ms |
| `watcher.memory.heap` | Gauge | bytes | > 80% of limit |
| `watcher.queue.size` | Gauge | count | > 10000 |
| `watcher.errors.rate` | Counter | errors/min | > 10/min |

### Prometheusメトリクス例

```typescript
// Prometheusフォーマット出力
import { Registry, Counter, Gauge, Histogram } from 'prom-client';

const registry = new Registry();

const eventsTotal = new Counter({
  name: 'file_watcher_events_total',
  help: 'Total file events processed',
  labelNames: ['event_type', 'status'],
  registers: [registry],
});

const eventLatency = new Histogram({
  name: 'file_watcher_event_latency_seconds',
  help: 'Event processing latency',
  labelNames: ['event_type'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
  registers: [registry],
});
```

---

## コアパターン

### パターン1: メトリクス収集システム

```typescript
import { EventEmitter } from 'events';

// ============================================================
// 型定義
// ============================================================

interface MetricValue {
  value: number;
  timestamp: number;
  labels?: Record<string, string>;
}

interface MetricDefinition {
  name: string;
  type: 'counter' | 'gauge' | 'histogram';
  help: string;
  labels?: string[];
  buckets?: number[]; // histogram用
}

// ============================================================
// カウンター
// ============================================================

class Counter {
  private value = 0;
  private labels = new Map<string, number>();

  constructor(private definition: MetricDefinition) {}

  inc(labels?: Record<string, string>, value: number = 1): void {
    if (labels) {
      const key = this.labelsToKey(labels);
      this.labels.set(key, (this.labels.get(key) || 0) + value);
    } else {
      this.value += value;
    }
  }

  get(labels?: Record<string, string>): number {
    if (labels) {
      return this.labels.get(this.labelsToKey(labels)) || 0;
    }
    return this.value;
  }

  private labelsToKey(labels: Record<string, string>): string {
    return Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
  }

  toPrometheus(): string {
    const lines: string[] = [];
    lines.push(`# HELP ${this.definition.name} ${this.definition.help}`);
    lines.push(`# TYPE ${this.definition.name} counter`);

    if (this.labels.size > 0) {
      for (const [key, value] of this.labels) {
        lines.push(`${this.definition.name}{${key}} ${value}`);
      }
    } else {
      lines.push(`${this.definition.name} ${this.value}`);
    }

    return lines.join('\n');
  }
}

// ============================================================
// ゲージ
// ============================================================

class Gauge {
  private value = 0;
  private labels = new Map<string, number>();

  constructor(private definition: MetricDefinition) {}

  set(value: number, labels?: Record<string, string>): void {
    if (labels) {
      this.labels.set(this.labelsToKey(labels), value);
    } else {
      this.value = value;
    }
  }

  inc(labels?: Record<string, string>, value: number = 1): void {
    if (labels) {
      const key = this.labelsToKey(labels);
      this.labels.set(key, (this.labels.get(key) || 0) + value);
    } else {
      this.value += value;
    }
  }

  dec(labels?: Record<string, string>, value: number = 1): void {
    this.inc(labels, -value);
  }

  get(labels?: Record<string, string>): number {
    if (labels) {
      return this.labels.get(this.labelsToKey(labels)) || 0;
    }
    return this.value;
  }

  private labelsToKey(labels: Record<string, string>): string {
    return Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
  }

  toPrometheus(): string {
    const lines: string[] = [];
    lines.push(`# HELP ${this.definition.name} ${this.definition.help}`);
    lines.push(`# TYPE ${this.definition.name} gauge`);

    if (this.labels.size > 0) {
      for (const [key, value] of this.labels) {
        lines.push(`${this.definition.name}{${key}} ${value}`);
      }
    } else {
      lines.push(`${this.definition.name} ${this.value}`);
    }

    return lines.join('\n');
  }
}

// ============================================================
// ヒストグラム
// ============================================================

class Histogram {
  private buckets: Map<number, number> = new Map();
  private sum = 0;
  private count = 0;

  constructor(private definition: MetricDefinition) {
    const defaultBuckets = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];
    const buckets = definition.buckets || defaultBuckets;

    for (const b of buckets) {
      this.buckets.set(b, 0);
    }
    this.buckets.set(Infinity, 0); // +Inf bucket
  }

  observe(value: number): void {
    this.sum += value;
    this.count++;

    for (const [bucket] of this.buckets) {
      if (value <= bucket) {
        this.buckets.set(bucket, (this.buckets.get(bucket) || 0) + 1);
      }
    }
  }

  getPercentile(p: number): number {
    const target = this.count * (p / 100);
    const sortedBuckets = Array.from(this.buckets.entries())
      .filter(([b]) => b !== Infinity)
      .sort(([a], [b]) => a - b);

    let cumulative = 0;
    for (const [bucket, count] of sortedBuckets) {
      cumulative += count;
      if (cumulative >= target) {
        return bucket;
      }
    }
    return sortedBuckets[sortedBuckets.length - 1]?.[0] || 0;
  }

  toPrometheus(): string {
    const lines: string[] = [];
    lines.push(`# HELP ${this.definition.name} ${this.definition.help}`);
    lines.push(`# TYPE ${this.definition.name} histogram`);

    const sortedBuckets = Array.from(this.buckets.entries())
      .sort(([a], [b]) => a - b);

    let cumulative = 0;
    for (const [bucket, count] of sortedBuckets) {
      cumulative += count;
      const le = bucket === Infinity ? '+Inf' : bucket.toString();
      lines.push(`${this.definition.name}_bucket{le="${le}"} ${cumulative}`);
    }

    lines.push(`${this.definition.name}_sum ${this.sum}`);
    lines.push(`${this.definition.name}_count ${this.count}`);

    return lines.join('\n');
  }
}
```

### パターン2: ファイル監視メトリクスコレクター

```typescript
/**
 * ファイル監視専用のメトリクスコレクター
 */
class FileWatcherMetrics {
  // イベントカウンター
  private eventsTotal = new Counter({
    name: 'file_watcher_events_total',
    help: 'Total number of file events',
    type: 'counter',
    labels: ['event_type', 'status'],
  });

  // 処理レイテンシ
  private eventLatency = new Histogram({
    name: 'file_watcher_event_latency_seconds',
    help: 'Event processing latency in seconds',
    type: 'histogram',
    buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1],
  });

  // キューサイズ
  private queueSize = new Gauge({
    name: 'file_watcher_queue_size',
    help: 'Current event queue size',
    type: 'gauge',
  });

  // メモリ使用量
  private memoryUsage = new Gauge({
    name: 'file_watcher_memory_bytes',
    help: 'Memory usage in bytes',
    type: 'gauge',
    labels: ['type'],
  });

  // アクティブウォッチャー数
  private activeWatchers = new Gauge({
    name: 'file_watcher_active_watchers',
    help: 'Number of active file watchers',
    type: 'gauge',
  });

  // エラーカウンター
  private errorsTotal = new Counter({
    name: 'file_watcher_errors_total',
    help: 'Total number of errors',
    type: 'counter',
    labels: ['error_type'],
  });

  // イベントレート計算用
  private recentEvents: number[] = [];
  private rateWindow = 60000; // 1分

  /**
   * イベント処理を記録
   */
  recordEvent(
    eventType: 'add' | 'change' | 'unlink',
    status: 'success' | 'error' | 'dropped',
    latencyMs?: number
  ): void {
    this.eventsTotal.inc({ event_type: eventType, status });

    if (latencyMs !== undefined && status === 'success') {
      this.eventLatency.observe(latencyMs / 1000); // 秒に変換
    }

    // レート計算用
    this.recentEvents.push(Date.now());
    this.cleanupOldEvents();
  }

  /**
   * キューサイズを更新
   */
  updateQueueSize(size: number): void {
    this.queueSize.set(size);
  }

  /**
   * メモリ使用量を更新
   */
  updateMemoryUsage(): void {
    const usage = process.memoryUsage();
    this.memoryUsage.set(usage.heapUsed, { type: 'heap_used' });
    this.memoryUsage.set(usage.heapTotal, { type: 'heap_total' });
    this.memoryUsage.set(usage.rss, { type: 'rss' });
    this.memoryUsage.set(usage.external, { type: 'external' });
  }

  /**
   * アクティブウォッチャー数を更新
   */
  updateActiveWatchers(count: number): void {
    this.activeWatchers.set(count);
  }

  /**
   * エラーを記録
   */
  recordError(errorType: string): void {
    this.errorsTotal.inc({ error_type: errorType });
  }

  /**
   * イベントレートを取得（events/sec）
   */
  getEventRate(): number {
    this.cleanupOldEvents();
    return this.recentEvents.length / (this.rateWindow / 1000);
  }

  /**
   * P99レイテンシを取得
   */
  getP99Latency(): number {
    return this.eventLatency.getPercentile(99);
  }

  /**
   * Prometheusフォーマットでエクスポート
   */
  toPrometheus(): string {
    return [
      this.eventsTotal.toPrometheus(),
      this.eventLatency.toPrometheus(),
      this.queueSize.toPrometheus(),
      this.memoryUsage.toPrometheus(),
      this.activeWatchers.toPrometheus(),
      this.errorsTotal.toPrometheus(),
    ].join('\n\n');
  }

  /**
   * JSON形式でエクスポート
   */
  toJSON(): Record<string, unknown> {
    this.updateMemoryUsage();
    return {
      timestamp: new Date().toISOString(),
      events: {
        rate: this.getEventRate(),
        total: this.eventsTotal.get(),
      },
      latency: {
        p50: this.eventLatency.getPercentile(50),
        p95: this.eventLatency.getPercentile(95),
        p99: this.eventLatency.getPercentile(99),
      },
      queue: {
        size: this.queueSize.get(),
      },
      memory: {
        heapUsed: this.memoryUsage.get({ type: 'heap_used' }),
        heapTotal: this.memoryUsage.get({ type: 'heap_total' }),
        rss: this.memoryUsage.get({ type: 'rss' }),
      },
      watchers: {
        active: this.activeWatchers.get(),
      },
      errors: {
        total: this.errorsTotal.get(),
      },
    };
  }

  private cleanupOldEvents(): void {
    const cutoff = Date.now() - this.rateWindow;
    this.recentEvents = this.recentEvents.filter((t) => t > cutoff);
  }
}
```

### パターン3: 構造化ログシステム

```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  traceId?: string;
  spanId?: string;
}

interface LoggerConfig {
  level: LogLevel;
  format: 'json' | 'text';
  output: 'console' | 'file' | 'both';
  filePath?: string;
}

class StructuredLogger {
  private static instance: StructuredLogger;
  private logLevels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  private config: LoggerConfig = {
    level: 'info',
    format: 'json',
    output: 'console',
  };

  private currentTraceId?: string;
  private currentSpanId?: string;

  static getInstance(): StructuredLogger {
    if (!StructuredLogger.instance) {
      StructuredLogger.instance = new StructuredLogger();
    }
    return StructuredLogger.instance;
  }

  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * トレースコンテキストを設定
   */
  setTraceContext(traceId: string, spanId: string): void {
    this.currentTraceId = traceId;
    this.currentSpanId = spanId;
  }

  /**
   * トレースコンテキストをクリア
   */
  clearTraceContext(): void {
    this.currentTraceId = undefined;
    this.currentSpanId = undefined;
  }

  /**
   * ログを出力
   */
  log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    if (this.logLevels[level] < this.logLevels[this.config.level]) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      traceId: this.currentTraceId,
      spanId: this.currentSpanId,
    };

    this.output(entry);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.log('error', message, context);
  }

  /**
   * ファイルイベント用ログ
   */
  fileEvent(
    eventType: string,
    filePath: string,
    details?: Record<string, unknown>
  ): void {
    this.info(`File ${eventType}`, {
      event_type: eventType,
      file_path: filePath,
      ...details,
    });
  }

  /**
   * パフォーマンスログ
   */
  performance(
    operation: string,
    durationMs: number,
    details?: Record<string, unknown>
  ): void {
    const level = durationMs > 1000 ? 'warn' : 'debug';
    this.log(level, `Performance: ${operation}`, {
      operation,
      duration_ms: durationMs,
      ...details,
    });
  }

  private output(entry: LogEntry): void {
    const formatted =
      this.config.format === 'json'
        ? JSON.stringify(entry)
        : this.formatText(entry);

    if (this.config.output === 'console' || this.config.output === 'both') {
      if (entry.level === 'error') {
        console.error(formatted);
      } else if (entry.level === 'warn') {
        console.warn(formatted);
      } else {
        console.log(formatted);
      }
    }

    // ファイル出力は非同期で別途実装
  }

  private formatText(entry: LogEntry): string {
    const context = entry.context
      ? ' ' + JSON.stringify(entry.context)
      : '';
    const trace = entry.traceId ? ` [${entry.traceId}]` : '';
    return `${entry.timestamp} [${entry.level.toUpperCase()}]${trace} ${entry.message}${context}`;
  }
}

// グローバルロガー
export const logger = StructuredLogger.getInstance();
```

### パターン4: アラートシステム

```typescript
interface AlertRule {
  name: string;
  condition: () => boolean;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  cooldownMs: number;
}

interface Alert {
  rule: AlertRule;
  triggeredAt: Date;
  resolvedAt?: Date;
  count: number;
}

interface AlertHandler {
  name: string;
  handle: (alert: Alert) => Promise<void>;
}

class AlertManager {
  private rules: AlertRule[] = [];
  private handlers: AlertHandler[] = [];
  private activeAlerts = new Map<string, Alert>();
  private lastTriggered = new Map<string, number>();
  private checkInterval?: NodeJS.Timeout;

  /**
   * アラートルールを追加
   */
  addRule(rule: AlertRule): void {
    this.rules.push(rule);
  }

  /**
   * アラートハンドラーを追加
   */
  addHandler(handler: AlertHandler): void {
    this.handlers.push(handler);
  }

  /**
   * 定期チェックを開始
   */
  startChecking(intervalMs: number = 10000): void {
    this.checkInterval = setInterval(() => this.checkRules(), intervalMs);
  }

  /**
   * 定期チェックを停止
   */
  stopChecking(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = undefined;
    }
  }

  /**
   * すべてのルールをチェック
   */
  private async checkRules(): Promise<void> {
    for (const rule of this.rules) {
      try {
        const triggered = rule.condition();
        const existing = this.activeAlerts.get(rule.name);
        const lastTrigger = this.lastTriggered.get(rule.name) || 0;
        const now = Date.now();

        if (triggered) {
          // クールダウン中はスキップ
          if (now - lastTrigger < rule.cooldownMs) {
            continue;
          }

          if (existing) {
            // 既存アラートのカウントを増加
            existing.count++;
          } else {
            // 新規アラート
            const alert: Alert = {
              rule,
              triggeredAt: new Date(),
              count: 1,
            };
            this.activeAlerts.set(rule.name, alert);
            await this.notifyHandlers(alert);
          }

          this.lastTriggered.set(rule.name, now);
        } else if (existing && !existing.resolvedAt) {
          // アラート解消
          existing.resolvedAt = new Date();
          await this.notifyResolved(existing);
          this.activeAlerts.delete(rule.name);
        }
      } catch (error) {
        logger.error('Alert check failed', {
          rule: rule.name,
          error: (error as Error).message,
        });
      }
    }
  }

  private async notifyHandlers(alert: Alert): Promise<void> {
    for (const handler of this.handlers) {
      try {
        await handler.handle(alert);
      } catch (error) {
        logger.error('Alert handler failed', {
          handler: handler.name,
          error: (error as Error).message,
        });
      }
    }
  }

  private async notifyResolved(alert: Alert): Promise<void> {
    for (const handler of this.handlers) {
      try {
        await handler.handle({ ...alert, resolvedAt: new Date() });
      } catch (error) {
        logger.error('Alert resolution handler failed', {
          handler: handler.name,
          error: (error as Error).message,
        });
      }
    }
  }

  /**
   * アクティブなアラートを取得
   */
  getActiveAlerts(): Alert[] {
    return Array.from(this.activeAlerts.values());
  }
}

// ============================================================
// 使用例: ファイル監視用アラートルール
// ============================================================

function setupWatcherAlerts(
  metrics: FileWatcherMetrics,
  alertManager: AlertManager
): void {
  // イベントレート過負荷
  alertManager.addRule({
    name: 'high_event_rate',
    condition: () => metrics.getEventRate() > 1000,
    severity: 'warning',
    message: 'File watcher event rate exceeded 1000/sec',
    cooldownMs: 60000,
  });

  // 処理レイテンシ異常
  alertManager.addRule({
    name: 'high_latency',
    condition: () => metrics.getP99Latency() > 0.5, // 500ms
    severity: 'warning',
    message: 'Event processing latency P99 exceeded 500ms',
    cooldownMs: 60000,
  });

  // メモリ使用量過多
  alertManager.addRule({
    name: 'high_memory',
    condition: () => {
      const usage = process.memoryUsage();
      return usage.heapUsed / usage.heapTotal > 0.9;
    },
    severity: 'critical',
    message: 'Heap memory usage exceeded 90%',
    cooldownMs: 300000,
  });

  // Slackハンドラー例
  alertManager.addHandler({
    name: 'slack',
    handle: async (alert) => {
      if (alert.resolvedAt) {
        logger.info('Alert resolved', { rule: alert.rule.name });
      } else {
        logger.warn('Alert triggered', {
          rule: alert.rule.name,
          severity: alert.rule.severity,
          message: alert.rule.message,
        });
      }
      // 実際のSlack送信処理
    },
  });

  alertManager.startChecking(10000);
}
```

---

## 実装ガイドライン

### メトリクスエンドポイントの設定

```typescript
import * as http from 'http';

function createMetricsServer(metrics: FileWatcherMetrics, port: number = 9090): http.Server {
  return http.createServer((req, res) => {
    if (req.url === '/metrics') {
      res.setHeader('Content-Type', 'text/plain');
      res.end(metrics.toPrometheus());
    } else if (req.url === '/health') {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ status: 'healthy' }));
    } else if (req.url === '/stats') {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(metrics.toJSON()));
    } else {
      res.statusCode = 404;
      res.end('Not Found');
    }
  }).listen(port, () => {
    console.log(`Metrics server listening on port ${port}`);
  });
}
```

### ダッシュボード推奨項目

| パネル | メトリクス | 可視化タイプ |
|--------|----------|-------------|
| イベントレート | `rate(file_watcher_events_total[5m])` | 折れ線グラフ |
| レイテンシ分布 | `file_watcher_event_latency_seconds` | ヒートマップ |
| キューサイズ | `file_watcher_queue_size` | ゲージ |
| メモリ使用量 | `file_watcher_memory_bytes` | スタックエリア |
| エラーレート | `rate(file_watcher_errors_total[5m])` | 折れ線グラフ |
| アクティブウォッチャー | `file_watcher_active_watchers` | 単一値 |

---

## トラブルシューティング

### よくある問題

| 問題 | メトリクス兆候 | 対処法 |
|------|--------------|--------|
| イベントドロップ | queue_size急増、events_dropped増加 | バッファサイズ増加、処理並列化 |
| メモリリーク | heap_used持続増加 | ヒープダンプ分析、参照リーク調査 |
| 処理遅延 | latency_p99増加 | 処理ロジック最適化、非同期化 |
| ウォッチャー停止 | active_watchers=0 | エラーログ確認、再起動 |

---

## 関連リソース

- `resources/prometheus-config.yml` - Prometheus設定例
- `resources/grafana-dashboard.json` - Grafanaダッシュボードテンプレート
- `templates/metrics-collector.ts` - メトリクスコレクター完全実装
- `scripts/health-check.sh` - ヘルスチェックスクリプト

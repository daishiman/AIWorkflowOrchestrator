/**
 * ファイル監視メトリクスコレクター
 *
 * Prometheus互換のメトリクス収集とエクスポート機能を提供
 */

import * as http from "http";
import { EventEmitter } from "events";

// ============================================================
// 型定義
// ============================================================

export interface MetricsConfig {
  /** メトリクスエンドポイントのポート */
  port: number;
  /** メトリクスプレフィックス */
  prefix: string;
  /** デフォルトラベル */
  defaultLabels?: Record<string, string>;
  /** ヒストグラムバケット */
  histogramBuckets?: number[];
  /** メモリ使用量の自動収集間隔（ミリ秒） */
  memoryCollectionInterval?: number;
}

export interface MetricSample {
  name: string;
  value: number;
  timestamp: number;
  labels?: Record<string, string>;
}

// ============================================================
// デフォルト設定
// ============================================================

const DEFAULT_CONFIG: MetricsConfig = {
  port: 9090,
  prefix: "file_watcher",
  histogramBuckets: [
    0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10,
  ],
  memoryCollectionInterval: 15000,
};

// ============================================================
// カウンター実装
// ============================================================

class Counter {
  private values = new Map<string, number>();

  constructor(
    private name: string,
    private help: string,
    private labelNames: string[] = [],
  ) {}

  inc(labels?: Record<string, string>, value: number = 1): void {
    const key = this.getKey(labels);
    this.values.set(key, (this.values.get(key) || 0) + value);
  }

  get(labels?: Record<string, string>): number {
    return this.values.get(this.getKey(labels)) || 0;
  }

  reset(): void {
    this.values.clear();
  }

  private getKey(labels?: Record<string, string>): string {
    if (!labels || this.labelNames.length === 0) return "";
    return this.labelNames.map((n) => labels[n] || "").join("|");
  }

  toPrometheus(prefix: string): string {
    const fullName = `${prefix}_${this.name}`;
    const lines: string[] = [
      `# HELP ${fullName} ${this.help}`,
      `# TYPE ${fullName} counter`,
    ];

    if (this.values.size === 0) {
      lines.push(`${fullName} 0`);
    } else {
      for (const [key, value] of this.values) {
        if (key === "") {
          lines.push(`${fullName} ${value}`);
        } else {
          const labelPairs = this.labelNames
            .map((n, i) => `${n}="${key.split("|")[i]}"`)
            .join(",");
          lines.push(`${fullName}{${labelPairs}} ${value}`);
        }
      }
    }

    return lines.join("\n");
  }
}

// ============================================================
// ゲージ実装
// ============================================================

class Gauge {
  private values = new Map<string, number>();

  constructor(
    private name: string,
    private help: string,
    private labelNames: string[] = [],
  ) {}

  set(value: number, labels?: Record<string, string>): void {
    this.values.set(this.getKey(labels), value);
  }

  inc(labels?: Record<string, string>, value: number = 1): void {
    const key = this.getKey(labels);
    this.values.set(key, (this.values.get(key) || 0) + value);
  }

  dec(labels?: Record<string, string>, value: number = 1): void {
    this.inc(labels, -value);
  }

  get(labels?: Record<string, string>): number {
    return this.values.get(this.getKey(labels)) || 0;
  }

  private getKey(labels?: Record<string, string>): string {
    if (!labels || this.labelNames.length === 0) return "";
    return this.labelNames.map((n) => labels[n] || "").join("|");
  }

  toPrometheus(prefix: string): string {
    const fullName = `${prefix}_${this.name}`;
    const lines: string[] = [
      `# HELP ${fullName} ${this.help}`,
      `# TYPE ${fullName} gauge`,
    ];

    if (this.values.size === 0) {
      lines.push(`${fullName} 0`);
    } else {
      for (const [key, value] of this.values) {
        if (key === "") {
          lines.push(`${fullName} ${value}`);
        } else {
          const labelPairs = this.labelNames
            .map((n, i) => `${n}="${key.split("|")[i]}"`)
            .join(",");
          lines.push(`${fullName}{${labelPairs}} ${value}`);
        }
      }
    }

    return lines.join("\n");
  }
}

// ============================================================
// ヒストグラム実装
// ============================================================

class Histogram {
  private buckets: Map<number, number> = new Map();
  private sum = 0;
  private count = 0;

  constructor(
    private name: string,
    private help: string,
    buckets: number[] = [
      0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10,
    ],
  ) {
    for (const b of buckets) {
      this.buckets.set(b, 0);
    }
    this.buckets.set(Infinity, 0);
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

  reset(): void {
    for (const key of this.buckets.keys()) {
      this.buckets.set(key, 0);
    }
    this.sum = 0;
    this.count = 0;
  }

  toPrometheus(prefix: string): string {
    const fullName = `${prefix}_${this.name}`;
    const lines: string[] = [
      `# HELP ${fullName} ${this.help}`,
      `# TYPE ${fullName} histogram`,
    ];

    const sortedBuckets = Array.from(this.buckets.entries()).sort(([a], [b]) =>
      a === Infinity ? 1 : b === Infinity ? -1 : a - b,
    );

    let cumulative = 0;
    for (const [bucket, count] of sortedBuckets) {
      cumulative += count;
      const le = bucket === Infinity ? "+Inf" : bucket.toString();
      lines.push(`${fullName}_bucket{le="${le}"} ${cumulative}`);
    }

    lines.push(`${fullName}_sum ${this.sum}`);
    lines.push(`${fullName}_count ${this.count}`);

    return lines.join("\n");
  }
}

// ============================================================
// メトリクスコレクター
// ============================================================

export class FileWatcherMetricsCollector extends EventEmitter {
  private config: MetricsConfig;
  private server?: http.Server;
  private memoryInterval?: NodeJS.Timeout;

  // メトリクス定義
  private eventsTotal: Counter;
  private eventLatency: Histogram;
  private queueSize: Gauge;
  private memoryBytes: Gauge;
  private activeWatchers: Gauge;
  private errorsTotal: Counter;
  private uptime: Gauge;
  private startTime: number;

  // レート計算用
  private recentEvents: number[] = [];
  private rateWindow = 60000;

  constructor(config: Partial<MetricsConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.startTime = Date.now();

    // メトリクス初期化
    this.eventsTotal = new Counter(
      "events_total",
      "Total number of file events processed",
      ["event_type", "status"],
    );

    this.eventLatency = new Histogram(
      "event_latency_seconds",
      "Event processing latency in seconds",
      this.config.histogramBuckets,
    );

    this.queueSize = new Gauge("queue_size", "Current event queue size");

    this.memoryBytes = new Gauge("memory_bytes", "Memory usage in bytes", [
      "type",
    ]);

    this.activeWatchers = new Gauge(
      "active_watchers",
      "Number of active file watchers",
    );

    this.errorsTotal = new Counter("errors_total", "Total number of errors", [
      "error_type",
    ]);

    this.uptime = new Gauge("uptime_seconds", "Uptime in seconds");
  }

  // ----------------------------------------------------------
  // イベント記録
  // ----------------------------------------------------------

  /**
   * ファイルイベントを記録
   */
  recordEvent(
    eventType: "add" | "change" | "unlink" | "addDir" | "unlinkDir",
    status: "success" | "error" | "dropped",
    latencyMs?: number,
  ): void {
    this.eventsTotal.inc({ event_type: eventType, status });

    if (latencyMs !== undefined && status === "success") {
      this.eventLatency.observe(latencyMs / 1000);
    }

    this.recentEvents.push(Date.now());
    this.cleanupOldEvents();

    this.emit("event", { eventType, status, latencyMs });
  }

  /**
   * エラーを記録
   */
  recordError(errorType: string): void {
    this.errorsTotal.inc({ error_type: errorType });
    this.emit("error", { errorType });
  }

  /**
   * キューサイズを更新
   */
  updateQueueSize(size: number): void {
    this.queueSize.set(size);
  }

  /**
   * アクティブウォッチャー数を更新
   */
  updateActiveWatchers(count: number): void {
    this.activeWatchers.set(count);
  }

  // ----------------------------------------------------------
  // メトリクス取得
  // ----------------------------------------------------------

  /**
   * イベントレートを取得（events/sec）
   */
  getEventRate(): number {
    this.cleanupOldEvents();
    return this.recentEvents.length / (this.rateWindow / 1000);
  }

  /**
   * P99レイテンシを取得（秒）
   */
  getP99Latency(): number {
    return this.eventLatency.getPercentile(99);
  }

  /**
   * P50レイテンシを取得（秒）
   */
  getP50Latency(): number {
    return this.eventLatency.getPercentile(50);
  }

  /**
   * 統計サマリを取得
   */
  getSummary(): Record<string, unknown> {
    this.collectMemory();
    return {
      timestamp: new Date().toISOString(),
      uptime_seconds: (Date.now() - this.startTime) / 1000,
      events: {
        rate_per_sec: this.getEventRate(),
        total:
          this.eventsTotal.get({ event_type: "add", status: "success" }) +
          this.eventsTotal.get({ event_type: "change", status: "success" }) +
          this.eventsTotal.get({ event_type: "unlink", status: "success" }),
      },
      latency: {
        p50_seconds: this.getP50Latency(),
        p99_seconds: this.getP99Latency(),
      },
      queue: {
        size: this.queueSize.get(),
      },
      memory: {
        heap_used_bytes: this.memoryBytes.get({ type: "heap_used" }),
        heap_total_bytes: this.memoryBytes.get({ type: "heap_total" }),
        rss_bytes: this.memoryBytes.get({ type: "rss" }),
      },
      watchers: {
        active: this.activeWatchers.get(),
      },
      errors: {
        total: this.errorsTotal.get(),
      },
    };
  }

  // ----------------------------------------------------------
  // Prometheusエクスポート
  // ----------------------------------------------------------

  /**
   * Prometheusフォーマットでエクスポート
   */
  toPrometheus(): string {
    this.collectMemory();
    this.uptime.set((Date.now() - this.startTime) / 1000);

    const sections = [
      this.eventsTotal.toPrometheus(this.config.prefix),
      this.eventLatency.toPrometheus(this.config.prefix),
      this.queueSize.toPrometheus(this.config.prefix),
      this.memoryBytes.toPrometheus(this.config.prefix),
      this.activeWatchers.toPrometheus(this.config.prefix),
      this.errorsTotal.toPrometheus(this.config.prefix),
      this.uptime.toPrometheus(this.config.prefix),
    ];

    return sections.join("\n\n") + "\n";
  }

  // ----------------------------------------------------------
  // HTTPサーバー
  // ----------------------------------------------------------

  /**
   * メトリクスサーバーを起動
   */
  startServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        if (req.url === "/metrics") {
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.end(this.toPrometheus());
        } else if (req.url === "/health") {
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              status: "healthy",
              uptime: Date.now() - this.startTime,
            }),
          );
        } else if (req.url === "/stats") {
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(this.getSummary(), null, 2));
        } else {
          res.statusCode = 404;
          res.end("Not Found");
        }
      });

      this.server.on("error", reject);

      this.server.listen(this.config.port, () => {
        console.log(
          `Metrics server listening on http://localhost:${this.config.port}`,
        );
        console.log(`  /metrics - Prometheus format`);
        console.log(`  /health  - Health check`);
        console.log(`  /stats   - JSON summary`);
        resolve();
      });

      // メモリ収集を開始
      if (this.config.memoryCollectionInterval) {
        this.memoryInterval = setInterval(
          () => this.collectMemory(),
          this.config.memoryCollectionInterval,
        );
      }
    });
  }

  /**
   * メトリクスサーバーを停止
   */
  stopServer(): Promise<void> {
    return new Promise((resolve) => {
      if (this.memoryInterval) {
        clearInterval(this.memoryInterval);
        this.memoryInterval = undefined;
      }

      if (this.server) {
        this.server.close(() => {
          this.server = undefined;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  // ----------------------------------------------------------
  // 内部ユーティリティ
  // ----------------------------------------------------------

  private collectMemory(): void {
    const usage = process.memoryUsage();
    this.memoryBytes.set(usage.heapUsed, { type: "heap_used" });
    this.memoryBytes.set(usage.heapTotal, { type: "heap_total" });
    this.memoryBytes.set(usage.rss, { type: "rss" });
    this.memoryBytes.set(usage.external, { type: "external" });
  }

  private cleanupOldEvents(): void {
    const cutoff = Date.now() - this.rateWindow;
    this.recentEvents = this.recentEvents.filter((t) => t > cutoff);
  }
}

// ============================================================
// シングルトンインスタンス
// ============================================================

let defaultCollector: FileWatcherMetricsCollector | null = null;

/**
 * デフォルトのメトリクスコレクターを取得
 */
export function getMetricsCollector(
  config?: Partial<MetricsConfig>,
): FileWatcherMetricsCollector {
  if (!defaultCollector) {
    defaultCollector = new FileWatcherMetricsCollector(config);
  }
  return defaultCollector;
}

// ============================================================
// 使用例
// ============================================================

/*
import { getMetricsCollector } from './metrics-collector';

const metrics = getMetricsCollector({ port: 9090 });

// サーバー起動
await metrics.startServer();

// ファイルイベントを記録
const startTime = Date.now();
// ... ファイル処理 ...
const latency = Date.now() - startTime;
metrics.recordEvent('change', 'success', latency);

// エラーを記録
metrics.recordError('permission_denied');

// キューサイズを更新
metrics.updateQueueSize(150);

// アクティブウォッチャー数を更新
metrics.updateActiveWatchers(3);

// 統計を取得
console.log(metrics.getSummary());

// クリーンアップ
await metrics.stopServer();
*/

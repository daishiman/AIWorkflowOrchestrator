/**
 * Memory Tracker Template
 *
 * Node.jsアプリケーションのメモリ監視テンプレート。
 * ヒープ使用量、リーク検出、アラート機能を提供。
 *
 * 使用方法:
 *   1. このファイルをプロジェクトにコピー
 *   2. 監視設定をカスタマイズ
 *   3. アプリケーション起動時にinitialize()を呼び出し
 *
 * @example
 * const tracker = new MemoryTracker({
 *   threshold: { heapUsed: 500 * 1024 * 1024 },
 *   onAlert: (alert) => console.error('Memory alert:', alert)
 * });
 * tracker.start();
 */

import { EventEmitter } from 'events';
import v8 from 'v8';

// ============================================================
// 型定義
// ============================================================

interface MemoryTrackerOptions {
  /** 監視間隔（ms） */
  interval?: number;
  /** アラート閾値 */
  threshold?: MemoryThreshold;
  /** サンプル保持数 */
  sampleCount?: number;
  /** アラートコールバック */
  onAlert?: (alert: MemoryAlert) => void;
  /** PM2カスタムメトリクスを有効化 */
  pm2Metrics?: boolean;
}

interface MemoryThreshold {
  /** ヒープ使用量（バイト） */
  heapUsed?: number;
  /** ヒープ使用率（%） */
  heapUsagePercent?: number;
  /** RSS（バイト） */
  rss?: number;
  /** 増加率（バイト/分） */
  growthRate?: number;
}

interface MemorySample {
  timestamp: number;
  rss: number;
  heapTotal: number;
  heapUsed: number;
  external: number;
  arrayBuffers: number;
  heapUsagePercent: number;
}

interface MemoryAlert {
  type: 'threshold' | 'leak' | 'gc_ineffective';
  metric: string;
  value: number;
  threshold: number;
  message: string;
  timestamp: number;
}

interface LeakAnalysis {
  isLeak: boolean;
  confidence: number;
  totalGrowth: number;
  growthRate: number;
  samples: number;
  duration: number;
}

// ============================================================
// デフォルト設定
// ============================================================

const MB = 1024 * 1024;

const defaults: Required<MemoryTrackerOptions> = {
  interval: 30000, // 30秒
  threshold: {
    heapUsed: 500 * MB,
    heapUsagePercent: 85,
    rss: 1024 * MB,
    growthRate: 10 * MB, // 10MB/分
  },
  sampleCount: 20,
  onAlert: () => {},
  pm2Metrics: false,
};

// ============================================================
// MemoryTrackerクラス
// ============================================================

export class MemoryTracker extends EventEmitter {
  private options: Required<MemoryTrackerOptions>;
  private samples: MemorySample[] = [];
  private timer: NodeJS.Timeout | null = null;
  private alertCooldown: Map<string, number> = new Map();
  private lastGCHeapUsed: number = 0;

  constructor(options: MemoryTrackerOptions = {}) {
    super();
    this.options = {
      ...defaults,
      ...options,
      threshold: {
        ...defaults.threshold,
        ...options.threshold,
      },
    };
  }

  // ============================================================
  // パブリックAPI
  // ============================================================

  /**
   * 監視を開始
   */
  start(): this {
    if (this.timer) {
      return this;
    }

    // 初回サンプル取得
    this.collectSample();

    // 定期監視
    this.timer = setInterval(() => {
      this.collectSample();
      this.analyzeAndAlert();
    }, this.options.interval);

    // PM2メトリクス設定
    if (this.options.pm2Metrics) {
      this.setupPM2Metrics();
    }

    this.emit('started');
    return this;
  }

  /**
   * 監視を停止
   */
  stop(): this {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.emit('stopped');
    return this;
  }

  /**
   * 現在のメモリ使用量を取得
   */
  getCurrentUsage(): MemorySample {
    const usage = process.memoryUsage();
    return {
      timestamp: Date.now(),
      rss: usage.rss,
      heapTotal: usage.heapTotal,
      heapUsed: usage.heapUsed,
      external: usage.external,
      arrayBuffers: usage.arrayBuffers || 0,
      heapUsagePercent: (usage.heapUsed / usage.heapTotal) * 100,
    };
  }

  /**
   * サンプル履歴を取得
   */
  getSamples(): MemorySample[] {
    return [...this.samples];
  }

  /**
   * リーク分析を実行
   */
  analyzeForLeaks(): LeakAnalysis {
    if (this.samples.length < 5) {
      return {
        isLeak: false,
        confidence: 0,
        totalGrowth: 0,
        growthRate: 0,
        samples: this.samples.length,
        duration: 0,
      };
    }

    const first = this.samples[0];
    const last = this.samples[this.samples.length - 1];
    const duration = (last.timestamp - first.timestamp) / 60000; // 分

    // 増加傾向の分析
    let increases = 0;
    for (let i = 1; i < this.samples.length; i++) {
      if (this.samples[i].heapUsed > this.samples[i - 1].heapUsed) {
        increases++;
      }
    }

    const totalGrowth = last.heapUsed - first.heapUsed;
    const growthRate = duration > 0 ? totalGrowth / duration : 0;
    const confidence = increases / (this.samples.length - 1);

    // リーク判定: 70%以上増加傾向 && 閾値を超える増加率
    const isLeak =
      confidence > 0.7 &&
      growthRate > (this.options.threshold.growthRate || 10 * MB);

    return {
      isLeak,
      confidence,
      totalGrowth,
      growthRate,
      samples: this.samples.length,
      duration,
    };
  }

  /**
   * GC効果を分析
   */
  analyzeGCEffectiveness(): { effective: boolean; freedPercent: number } {
    if (!global.gc) {
      return { effective: true, freedPercent: 0 };
    }

    const before = process.memoryUsage().heapUsed;
    global.gc();
    const after = process.memoryUsage().heapUsed;

    const freedPercent = ((before - after) / before) * 100;

    return {
      effective: freedPercent > 10, // 10%以上解放されれば有効
      freedPercent,
    };
  }

  /**
   * 統計情報を取得
   */
  getStatistics(): {
    current: MemorySample;
    average: Partial<MemorySample>;
    max: Partial<MemorySample>;
    leakAnalysis: LeakAnalysis;
  } {
    const current = this.getCurrentUsage();

    if (this.samples.length === 0) {
      return {
        current,
        average: {},
        max: {},
        leakAnalysis: this.analyzeForLeaks(),
      };
    }

    // 平均値計算
    const sum = this.samples.reduce(
      (acc, s) => ({
        rss: acc.rss + s.rss,
        heapUsed: acc.heapUsed + s.heapUsed,
        heapTotal: acc.heapTotal + s.heapTotal,
      }),
      { rss: 0, heapUsed: 0, heapTotal: 0 }
    );

    const average = {
      rss: sum.rss / this.samples.length,
      heapUsed: sum.heapUsed / this.samples.length,
      heapTotal: sum.heapTotal / this.samples.length,
    };

    // 最大値計算
    const max = this.samples.reduce(
      (acc, s) => ({
        rss: Math.max(acc.rss, s.rss),
        heapUsed: Math.max(acc.heapUsed, s.heapUsed),
        heapTotal: Math.max(acc.heapTotal, s.heapTotal),
      }),
      { rss: 0, heapUsed: 0, heapTotal: 0 }
    );

    return {
      current,
      average,
      max,
      leakAnalysis: this.analyzeForLeaks(),
    };
  }

  // ============================================================
  // プライベートメソッド
  // ============================================================

  private collectSample(): void {
    const sample = this.getCurrentUsage();
    this.samples.push(sample);

    if (this.samples.length > this.options.sampleCount) {
      this.samples.shift();
    }

    this.emit('sample', sample);
  }

  private analyzeAndAlert(): void {
    const current = this.getCurrentUsage();
    const threshold = this.options.threshold;

    // ヒープ使用量チェック
    if (threshold.heapUsed && current.heapUsed > threshold.heapUsed) {
      this.sendAlert({
        type: 'threshold',
        metric: 'heapUsed',
        value: current.heapUsed,
        threshold: threshold.heapUsed,
        message: `Heap used (${this.formatBytes(current.heapUsed)}) exceeds threshold`,
        timestamp: Date.now(),
      });
    }

    // ヒープ使用率チェック
    if (
      threshold.heapUsagePercent &&
      current.heapUsagePercent > threshold.heapUsagePercent
    ) {
      this.sendAlert({
        type: 'threshold',
        metric: 'heapUsagePercent',
        value: current.heapUsagePercent,
        threshold: threshold.heapUsagePercent,
        message: `Heap usage (${current.heapUsagePercent.toFixed(1)}%) exceeds threshold`,
        timestamp: Date.now(),
      });
    }

    // RSSチェック
    if (threshold.rss && current.rss > threshold.rss) {
      this.sendAlert({
        type: 'threshold',
        metric: 'rss',
        value: current.rss,
        threshold: threshold.rss,
        message: `RSS (${this.formatBytes(current.rss)}) exceeds threshold`,
        timestamp: Date.now(),
      });
    }

    // リーク検出
    const leakAnalysis = this.analyzeForLeaks();
    if (leakAnalysis.isLeak) {
      this.sendAlert({
        type: 'leak',
        metric: 'growthRate',
        value: leakAnalysis.growthRate,
        threshold: threshold.growthRate || 10 * MB,
        message: `Potential memory leak detected (${this.formatBytes(leakAnalysis.growthRate)}/min)`,
        timestamp: Date.now(),
      });
    }
  }

  private sendAlert(alert: MemoryAlert): void {
    // クールダウンチェック（同じアラートを5分以内に繰り返さない）
    const key = `${alert.type}:${alert.metric}`;
    const lastAlert = this.alertCooldown.get(key);
    const cooldownMs = 5 * 60 * 1000;

    if (lastAlert && Date.now() - lastAlert < cooldownMs) {
      return;
    }

    this.alertCooldown.set(key, Date.now());
    this.options.onAlert(alert);
    this.emit('alert', alert);
  }

  private setupPM2Metrics(): void {
    try {
      // PM2 IOモジュールを動的にロード
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const io = require('@pm2/io');

      io.metric({
        name: 'Heap Used (MB)',
        value: () => Math.round(process.memoryUsage().heapUsed / MB),
      });

      io.metric({
        name: 'Heap Usage (%)',
        value: () => {
          const usage = process.memoryUsage();
          return Math.round((usage.heapUsed / usage.heapTotal) * 100);
        },
      });

      io.metric({
        name: 'RSS (MB)',
        value: () => Math.round(process.memoryUsage().rss / MB),
      });
    } catch {
      // PM2 IOが利用できない場合は無視
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes >= MB) return `${(bytes / MB).toFixed(2)} MB`;
    return `${(bytes / 1024).toFixed(2)} KB`;
  }
}

// ============================================================
// ヘルパー関数
// ============================================================

/**
 * V8ヒープ統計を取得
 */
export function getHeapStatistics(): v8.HeapInfo {
  return v8.getHeapStatistics();
}

/**
 * ヒープスナップショットをトリガー（heapdumpモジュールが必要）
 */
export async function triggerHeapSnapshot(
  filename?: string
): Promise<string | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const heapdump = require('heapdump');
    const path = filename || `/tmp/heap-${Date.now()}.heapsnapshot`;

    return new Promise((resolve) => {
      heapdump.writeSnapshot(path, (err: Error | null, finalPath: string) => {
        if (err) {
          console.error('Heap snapshot error:', err);
          resolve(null);
        } else {
          resolve(finalPath);
        }
      });
    });
  } catch {
    console.warn('heapdump module not available');
    return null;
  }
}

/**
 * メモリ使用量をフォーマット
 */
export function formatMemoryUsage(): Record<string, string> {
  const usage = process.memoryUsage();
  const format = (bytes: number) => `${(bytes / MB).toFixed(2)} MB`;

  return {
    rss: format(usage.rss),
    heapTotal: format(usage.heapTotal),
    heapUsed: format(usage.heapUsed),
    external: format(usage.external),
    heapUsage: `${((usage.heapUsed / usage.heapTotal) * 100).toFixed(1)}%`,
  };
}

// ============================================================
// 使用例
// ============================================================

/*
import { MemoryTracker, formatMemoryUsage, triggerHeapSnapshot } from './memory-tracker';

// トラッカー作成
const tracker = new MemoryTracker({
  interval: 30000,
  threshold: {
    heapUsed: 500 * 1024 * 1024,
    heapUsagePercent: 85,
    growthRate: 10 * 1024 * 1024,
  },
  pm2Metrics: true,
  onAlert: (alert) => {
    console.error('Memory alert:', alert.message);

    // Slackなどに通知
    // notifySlack(alert);

    // リークの場合はヒープダンプ
    if (alert.type === 'leak') {
      triggerHeapSnapshot();
    }
  },
});

// イベントリスナー
tracker.on('sample', (sample) => {
  console.log('Memory sample:', formatMemoryUsage());
});

tracker.on('alert', (alert) => {
  console.error(`[${alert.type}] ${alert.message}`);
});

// 監視開始
tracker.start();

// 統計情報取得
setInterval(() => {
  const stats = tracker.getStatistics();
  console.log('Memory statistics:', stats);
}, 60000);

// シャットダウン時
process.on('SIGTERM', () => {
  tracker.stop();
});
*/

export default MemoryTracker;

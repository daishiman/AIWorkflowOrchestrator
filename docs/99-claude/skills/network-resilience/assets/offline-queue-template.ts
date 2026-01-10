/**
 * オフラインキューテンプレート
 *
 * 用途:
 *   ネットワーク切断時のタスク蓄積と
 *   接続復旧後の自動処理を管理
 *
 * カスタマイズポイント:
 *   - {{QUEUE_FILE}}: キューファイルパス (デフォルト: .claude/sync-queue.jsonl)
 *   - {{MAX_TASKS}}: 最大タスク数 (デフォルト: 1000)
 *   - {{MAX_AGE_HOURS}}: 最大保持時間 (デフォルト: 168時間)
 */

import { readFileSync, writeFileSync, appendFileSync, existsSync } from "fs";
import { randomUUID } from "crypto";

// ========================================
// 型定義
// ========================================

export type TaskType = "upload" | "download" | "sync";
export type TaskPriority = "high" | "normal" | "low";

export interface QueuedTask {
  id: string;
  type: TaskType;
  payload: {
    filePath?: string;
    url?: string;
    data?: unknown;
  };
  priority: TaskPriority;
  createdAt: string;
  retries: number;
  lastAttempt?: string;
  nextRetryAt?: string;
  error?: string;
}

export interface QueueConfig {
  queueFile: string;
  deadLetterFile: string;
  maxTasks: number;
  maxAgeHours: number;
  maxRetries: number;
}

export interface QueueStats {
  totalTasks: number;
  byPriority: Record<TaskPriority, number>;
  byType: Record<TaskType, number>;
  oldestTask?: Date;
  newestTask?: Date;
}

// ========================================
// デフォルト設定
// ========================================

const DEFAULT_CONFIG: QueueConfig = {
  queueFile: ".claude/sync-queue.jsonl",
  deadLetterFile: ".claude/dead-letter-queue.jsonl",
  maxTasks: 1000,
  maxAgeHours: 168, // 7日
  maxRetries: 5,
};

// ========================================
// オフラインキュークラス
// ========================================

export class OfflineQueue {
  private config: QueueConfig;

  constructor(config: Partial<QueueConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * タスクをキューに追加する
   */
  async enqueue(
    task: Omit<QueuedTask, "id" | "createdAt" | "retries">,
  ): Promise<string> {
    const entry: QueuedTask = {
      ...task,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      retries: 0,
    };

    // キューサイズをチェック
    const currentTasks = await this.readQueue();
    if (currentTasks.length >= this.config.maxTasks) {
      await this.enforceQueueLimits();
    }

    // ファイルに追記
    appendFileSync(this.config.queueFile, JSON.stringify(entry) + "\n");

    return entry.id;
  }

  /**
   * キューから次のタスクを取得して削除する
   */
  async dequeue(): Promise<QueuedTask | null> {
    const tasks = await this.readQueue();
    if (tasks.length === 0) return null;

    // 優先度順にソート（high > normal > low）
    tasks.sort(
      (a, b) => this.priorityOrder(a.priority) - this.priorityOrder(b.priority),
    );

    const task = tasks[0];
    const remaining = tasks.slice(1);

    await this.writeQueue(remaining);

    return task;
  }

  /**
   * キューの先頭を確認する（削除しない）
   */
  async peek(): Promise<QueuedTask | null> {
    const tasks = await this.readQueue();
    if (tasks.length === 0) return null;

    tasks.sort(
      (a, b) => this.priorityOrder(a.priority) - this.priorityOrder(b.priority),
    );
    return tasks[0];
  }

  /**
   * 失敗したタスクを再キューイングする
   */
  async requeue(task: QueuedTask, error: string): Promise<void> {
    const updated: QueuedTask = {
      ...task,
      retries: task.retries + 1,
      lastAttempt: new Date().toISOString(),
      nextRetryAt: this.calculateNextRetry(task.retries + 1),
      error,
    };

    if (updated.retries > this.config.maxRetries) {
      await this.moveToDeadLetter(updated);
    } else {
      appendFileSync(this.config.queueFile, JSON.stringify(updated) + "\n");
    }
  }

  /**
   * キューの統計情報を取得する
   */
  async getStats(): Promise<QueueStats> {
    const tasks = await this.readQueue();

    const stats: QueueStats = {
      totalTasks: tasks.length,
      byPriority: { high: 0, normal: 0, low: 0 },
      byType: { upload: 0, download: 0, sync: 0 },
    };

    for (const task of tasks) {
      stats.byPriority[task.priority]++;
      stats.byType[task.type]++;
    }

    if (tasks.length > 0) {
      const sorted = tasks.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
      stats.oldestTask = new Date(sorted[0].createdAt);
      stats.newestTask = new Date(sorted[sorted.length - 1].createdAt);
    }

    return stats;
  }

  /**
   * キューをすべてクリアする
   */
  async clear(): Promise<number> {
    const tasks = await this.readQueue();
    const count = tasks.length;
    writeFileSync(this.config.queueFile, "");
    return count;
  }

  /**
   * キューからタスクを読み取る
   */
  private async readQueue(): Promise<QueuedTask[]> {
    if (!existsSync(this.config.queueFile)) {
      return [];
    }

    const content = readFileSync(this.config.queueFile, "utf-8");
    const lines = content.split("\n").filter(Boolean);

    const tasks: QueuedTask[] = [];
    for (const line of lines) {
      try {
        tasks.push(JSON.parse(line));
      } catch {
        // 破損した行をスキップ
        console.warn("破損したキューエントリをスキップ");
      }
    }

    return tasks;
  }

  /**
   * キューをファイルに書き込む
   */
  private async writeQueue(tasks: QueuedTask[]): Promise<void> {
    const content = tasks.map((t) => JSON.stringify(t)).join("\n");
    writeFileSync(this.config.queueFile, content ? content + "\n" : "");
  }

  /**
   * キューサイズ制限を適用する
   */
  private async enforceQueueLimits(): Promise<void> {
    let tasks = await this.readQueue();
    const now = new Date();

    // 古いタスクを削除
    tasks = tasks.filter((task) => {
      const age = now.getTime() - new Date(task.createdAt).getTime();
      return age < this.config.maxAgeHours * 60 * 60 * 1000;
    });

    // サイズ超過時は古い順に削除
    if (tasks.length > this.config.maxTasks) {
      tasks.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
      tasks = tasks.slice(-this.config.maxTasks);
    }

    await this.writeQueue(tasks);
  }

  /**
   * デッドレターキューに移動する
   */
  private async moveToDeadLetter(task: QueuedTask): Promise<void> {
    const entry = {
      ...task,
      movedAt: new Date().toISOString(),
      reason: `最大リトライ回数 (${this.config.maxRetries}) を超過`,
    };

    appendFileSync(this.config.deadLetterFile, JSON.stringify(entry) + "\n");
  }

  /**
   * 次のリトライ時刻を計算する
   */
  private calculateNextRetry(retries: number): string {
    const delay = 1000 * Math.pow(2, retries - 1);
    const capped = Math.min(delay, 64000);
    return new Date(Date.now() + capped).toISOString();
  }

  /**
   * 優先度の順序値を取得する
   */
  private priorityOrder(priority: TaskPriority): number {
    const order = { high: 0, normal: 1, low: 2 };
    return order[priority];
  }
}

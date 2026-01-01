# オフラインキュー設計パターン

## 概要

ネットワーク切断時にタスクを蓄積し、接続復旧後に自動処理するための
オフラインキュー設計パターン。

## キューデータ構造

### タスクエントリ

```typescript
interface QueuedTask {
  id: string; // 一意識別子（UUID推奨）
  type: "upload" | "download" | "sync";
  payload: {
    filePath?: string; // ファイルパス
    url?: string; // API URL
    data?: unknown; // 追加データ
  };
  priority: "high" | "normal" | "low";
  createdAt: string; // ISO8601形式
  retries: number; // リトライ回数
  lastAttempt?: string; // 最終試行時刻
  nextRetryAt?: string; // 次回リトライ予定
  error?: string; // 最終エラー
}
```

### キューファイル形式（JSONL）

```jsonl
{"id":"abc-123","type":"upload","payload":{"filePath":"/doc.pdf"},"priority":"normal","createdAt":"2025-11-26T10:00:00Z","retries":0}
{"id":"def-456","type":"upload","payload":{"filePath":"/img.png"},"priority":"high","createdAt":"2025-11-26T10:01:00Z","retries":0}
```

**メリット**:

- 行単位で追記可能
- 部分的な破損時も他の行は読める
- ストリーム処理が容易

## キュー操作

### 1. エンキュー（追加）

```typescript
async function enqueue(
  task: Omit<QueuedTask, "id" | "createdAt" | "retries">,
): Promise<string> {
  const entry: QueuedTask = {
    ...task,
    id: generateUUID(),
    createdAt: new Date().toISOString(),
    retries: 0,
  };

  // ファイルに追記
  await appendFile(QUEUE_FILE, JSON.stringify(entry) + "\n");
  return entry.id;
}
```

### 2. デキュー（取得と削除）

```typescript
async function dequeue(): Promise<QueuedTask | null> {
  const tasks = await readQueue();
  if (tasks.length === 0) return null;

  // 優先度順にソート
  tasks.sort((a, b) => priorityOrder(a.priority) - priorityOrder(b.priority));

  const task = tasks[0];

  // キューから削除
  await rewriteQueue(tasks.slice(1));

  return task;
}
```

### 3. ピーク（確認のみ）

```typescript
async function peek(): Promise<QueuedTask | null> {
  const tasks = await readQueue();
  if (tasks.length === 0) return null;

  tasks.sort((a, b) => priorityOrder(a.priority) - priorityOrder(b.priority));
  return tasks[0];
}
```

### 4. 再キューイング（失敗時）

```typescript
async function requeue(task: QueuedTask, error: string): Promise<void> {
  const updated: QueuedTask = {
    ...task,
    retries: task.retries + 1,
    lastAttempt: new Date().toISOString(),
    nextRetryAt: calculateNextRetry(task.retries + 1),
    error,
  };

  if (updated.retries > MAX_RETRIES) {
    // 最大リトライ到達、デッドレターキューへ
    await moveToDeadLetter(updated);
  } else {
    await enqueue(updated);
  }
}
```

## サイズ制限とクリーンアップ

### サイズ制限

```typescript
const QUEUE_LIMITS = {
  maxTasks: 1000, // 最大タスク数
  maxAgeHours: 168, // 最大保持時間（7日）
  maxFileSizeMB: 10, // 最大ファイルサイズ
};

async function enforceQueueLimits(): Promise<void> {
  let tasks = await readQueue();
  const now = new Date();

  // 古いタスクを削除
  tasks = tasks.filter((task) => {
    const age = now.getTime() - new Date(task.createdAt).getTime();
    return age < QUEUE_LIMITS.maxAgeHours * 60 * 60 * 1000;
  });

  // サイズ超過時は古い順に削除
  if (tasks.length > QUEUE_LIMITS.maxTasks) {
    tasks.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    tasks = tasks.slice(-QUEUE_LIMITS.maxTasks);
  }

  await rewriteQueue(tasks);
}
```

### 定期クリーンアップ

- **間隔**: 1時間ごと
- **処理**: サイズ制限の適用、期限切れタスクの削除
- **ログ**: 削除されたタスク数を記録

## デッドレターキュー

最大リトライ回数を超えたタスクを保存し、手動での確認を可能にする。

```typescript
interface DeadLetterEntry extends QueuedTask {
  movedAt: string; // デッドレターへ移動した時刻
  reason: string; // 移動理由
}
```

**ファイル**: `.claude/dead-letter-queue.jsonl`

## 整合性保証

### 原子的書き込み

```typescript
async function atomicWrite(filePath: string, content: string): Promise<void> {
  const tempPath = `${filePath}.tmp`;

  // 一時ファイルに書き込み
  await writeFile(tempPath, content);

  // 同期を確認
  await fsync(tempPath);

  // 原子的にリネーム
  await rename(tempPath, filePath);
}
```

### 破損検出と復旧

```typescript
async function readQueueSafely(): Promise<QueuedTask[]> {
  const content = await readFile(QUEUE_FILE, "utf-8");
  const lines = content.split("\n").filter(Boolean);

  const tasks: QueuedTask[] = [];
  const corrupted: string[] = [];

  for (const line of lines) {
    try {
      tasks.push(JSON.parse(line));
    } catch {
      corrupted.push(line);
    }
  }

  if (corrupted.length > 0) {
    console.warn(`破損した行を検出: ${corrupted.length}件`);
    // 破損行をログに記録
  }

  return tasks;
}
```

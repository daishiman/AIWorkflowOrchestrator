# ネットワーク耐性 - 基礎概念

## 概要

ネットワーク耐性（Network Resilience）は、ネットワーク障害が発生しても
アプリケーションが継続して動作し、データを失わないようにする設計アプローチ。

## 核心概念

### 接続状態

```typescript
type ConnectionState =
  | "online" // オンライン
  | "offline" // オフライン
  | "reconnecting" // 再接続中
  | "degraded"; // 劣化（部分的な接続）

interface ConnectionInfo {
  state: ConnectionState;
  lastOnline: Date;
  reconnectAttempts: number;
  latencyMs?: number;
}
```

### オフライン検出

```typescript
// ブラウザAPI
const isOnline = navigator.onLine;

window.addEventListener("online", () => {
  console.log("ネットワーク復旧");
});

window.addEventListener("offline", () => {
  console.log("ネットワーク切断");
});
```

- `navigator.onLine` は参考値（実際の接続性は保証しない）
- ヘルスチェックリクエストで実際の接続性を確認

### 障害の種類

| 種類       | 説明                 | 対応策               |
| ---------- | -------------------- | -------------------- |
| 完全切断   | ネットワーク接続なし | オフラインキュー     |
| 一時的障害 | 短時間の接続断       | リトライ             |
| 遅延増大   | レスポンス時間の増加 | タイムアウト調整     |
| 部分障害   | 特定サービスのみ障害 | サーキットブレーカー |

## 再接続パターン

### 指数バックオフ

```typescript
function calculateBackoff(
  attempt: number,
  baseDelayMs: number = 1000,
  maxDelayMs: number = 30000,
): number {
  const delay = baseDelayMs * Math.pow(2, attempt);
  const jitter = Math.random() * 1000;
  return Math.min(delay + jitter, maxDelayMs);
}

// 使用例
// 1回目: 1s + jitter
// 2回目: 2s + jitter
// 3回目: 4s + jitter
// 4回目: 8s + jitter
// ...
// 上限: 30s + jitter
```

### ヘルスチェック

```typescript
interface HealthCheckConfig {
  endpoint: string;
  intervalMs: number;
  timeoutMs: number;
}

async function checkHealth(config: HealthCheckConfig): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs);

    const response = await fetch(config.endpoint, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}
```

## オフラインキュー

### 基本構造

```typescript
interface QueuedOperation {
  id: string;
  type: string;
  payload: any;
  createdAt: Date;
  retryCount: number;
  idempotencyKey: string;
}

interface OfflineQueue {
  enqueue(operation: QueuedOperation): Promise<void>;
  dequeue(): Promise<QueuedOperation | null>;
  peek(): Promise<QueuedOperation | null>;
  size(): Promise<number>;
}
```

### 永続化

| 方式           | 容量     | 永続性     | 用途             |
| -------------- | -------- | ---------- | ---------------- |
| localStorage   | ~5MB     | 高         | 小規模データ     |
| IndexedDB      | 制限なし | 高         | 大規模データ     |
| SessionStorage | ~5MB     | セッション | 一時データ       |
| メモリ         | 制限なし | なし       | 揮発性でよい場合 |

## べき等性

### 概念

同じ操作を複数回実行しても、1回実行した結果と同じになる性質。

```typescript
// べき等な操作
PUT /users/123 { name: "田中" }  // 何度実行しても同じ結果

// べき等でない操作
POST /orders { item: "商品A" }  // 実行のたびに新しい注文が作成される
```

### べき等キー

```typescript
interface IdempotentRequest {
  idempotencyKey: string; // クライアント生成のユニークID
  operation: string;
  payload: any;
}

// サーバー側
const processedKeys = new Set<string>();

function processRequest(req: IdempotentRequest): Response {
  if (processedKeys.has(req.idempotencyKey)) {
    return getCachedResponse(req.idempotencyKey);
  }

  const result = executeOperation(req);
  processedKeys.add(req.idempotencyKey);
  cacheResponse(req.idempotencyKey, result);

  return result;
}
```

## 状態同期

### 競合解決戦略

| 戦略            | 説明                   | 用途               |
| --------------- | ---------------------- | ------------------ |
| Last-Write-Wins | 最後の書き込みが勝つ   | シンプルなデータ   |
| Server-Wins     | サーバーのデータを優先 | マスターデータ     |
| Client-Wins     | クライアントを優先     | ローカル優先アプリ |
| Merge           | 両方をマージ           | 複雑なデータ構造   |
| Manual          | ユーザーに選択させる   | 重要なデータ       |

### バージョン管理

```typescript
interface VersionedData {
  id: string;
  data: any;
  version: number;
  updatedAt: Date;
}

// 楽観的ロック
function updateData(
  id: string,
  newData: any,
  expectedVersion: number,
): boolean {
  const current = getData(id);
  if (current.version !== expectedVersion) {
    return false; // 競合発生
  }

  saveData(id, newData, expectedVersion + 1);
  return true;
}
```

## 判断基準

### スキル適用タイミング

- オフライン時にもタスクを蓄積したい時
- ネットワーク復旧後の自動再同期が必要な時
- 接続状態に応じた動的な動作切り替えが必要な時
- ローカルとリモートのデータ整合性を保証したい時

### 前提条件

- ネットワーク状態の変化を検知できる
- ローカルストレージが利用可能
- サーバー側がべき等な操作をサポート（推奨）

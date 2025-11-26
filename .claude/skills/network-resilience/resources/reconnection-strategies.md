# 再接続戦略

## 概要

ネットワーク切断からの自動復旧のための再接続戦略。
指数バックオフ、ジッター、状態管理を組み合わせた堅牢な設計。

## 指数バックオフ

### 基本計算

```typescript
function calculateBackoff(attempt: number, config: BackoffConfig): number {
  const exponential = config.baseDelay * Math.pow(2, attempt - 1);
  const capped = Math.min(exponential, config.maxDelay);

  // ジッターを追加
  const jitterRange = capped * config.jitterFactor;
  const jitter = (Math.random() - 0.5) * 2 * jitterRange;

  return Math.floor(capped + jitter);
}

interface BackoffConfig {
  baseDelay: number;     // 基本遅延（ミリ秒）
  maxDelay: number;      // 最大遅延（ミリ秒）
  jitterFactor: number;  // ジッター係数（0-1）
}
```

### 推奨設定

| 設定項目 | 推奨値 | 説明 |
|---------|-------|------|
| baseDelay | 1000ms | 初回リトライの待機時間 |
| maxDelay | 64000ms | 最大待機時間（約1分） |
| jitterFactor | 0.25 | ±25%のランダム変動 |
| maxAttempts | 無制限 | 接続が回復するまで継続 |

### バックオフ系列の例

```
試行1: 1秒 ± 0.25秒 → 0.75-1.25秒
試行2: 2秒 ± 0.5秒  → 1.5-2.5秒
試行3: 4秒 ± 1秒   → 3-5秒
試行4: 8秒 ± 2秒   → 6-10秒
試行5: 16秒 ± 4秒  → 12-20秒
試行6: 32秒 ± 8秒  → 24-40秒
試行7: 64秒 ± 16秒 → 48-80秒（上限適用で48-64秒）
```

## ジッターの重要性

### サンダリングハード問題

多数のクライアントが同時にリトライすると、サーバーに負荷が集中する問題。

**解決策**: ジッターを追加してリトライタイミングを分散

```
ジッターなし:
Client1: ─●───●───●───●───●───>
Client2: ─●───●───●───●───●───>
Client3: ─●───●───●───●───●───>
           ↑   ↑   ↑（同時にサーバーへ負荷）

ジッターあり:
Client1: ─●────●───●─────●──●───>
Client2: ──●──●────●────●───●──>
Client3: ─●───●──●────●───●────>
           （負荷が分散）
```

## ヘルスチェック設計

### エンドポイント要件

```typescript
interface HealthCheckConfig {
  url: string;           // ヘルスチェックURL
  timeout: number;       // タイムアウト（ミリ秒）
  interval: number;      // チェック間隔（ミリ秒）
  method: 'GET' | 'HEAD';
}

const DEFAULT_HEALTH_CHECK: HealthCheckConfig = {
  url: '/api/health',
  timeout: 5000,         // 5秒
  interval: 30000,       // 30秒
  method: 'HEAD'         // 軽量なリクエスト
};
```

### 成功判定

```typescript
function isHealthy(response: Response): boolean {
  // 2xx系は成功
  if (response.status >= 200 && response.status < 300) {
    return true;
  }

  // 一部の4xxは「サーバーは動作中」と判断
  if (response.status === 401 || response.status === 403) {
    return true; // 認証問題だがサーバーは応答
  }

  return false;
}
```

## 状態遷移

### 状態定義

```typescript
type ConnectionState = 'online' | 'offline' | 'reconnecting';

interface ConnectionStatus {
  state: ConnectionState;
  lastOnline?: Date;
  lastOffline?: Date;
  reconnectAttempt: number;
  nextReconnectAt?: Date;
}
```

### 遷移ルール

```
Online
  │
  │ ヘルスチェック失敗
  │ または リクエストエラー
  ▼
Offline
  │
  │ 即座に再接続試行
  ▼
Reconnecting
  │
  ├─ 成功 → Online
  │
  └─ 失敗 → Offline（バックオフ後に再試行）
```

## イベント通知

### イベント種類

```typescript
interface ConnectionEvents {
  online: { timestamp: Date };
  offline: { timestamp: Date; reason: string };
  reconnecting: { attempt: number; nextTryIn: number };
  error: { error: Error };
}
```

### 使用例

```typescript
connectionManager.on('offline', (event) => {
  console.log(`接続が切断されました: ${event.reason}`);
  ui.showOfflineBanner();
});

connectionManager.on('online', (event) => {
  console.log('接続が回復しました');
  ui.hideOfflineBanner();
  queue.processAll();
});

connectionManager.on('reconnecting', (event) => {
  console.log(`再接続中 (${event.attempt}回目)...`);
});
```

## ベストプラクティス

### すべきこと

1. **常にジッターを使用**: 負荷集中を防ぐ
2. **最大遅延を設定**: 無限に増加しない
3. **状態をユーザーに通知**: オフライン状態を明示

### 避けるべきこと

1. **固定間隔リトライ**: サンダリングハード問題
2. **即時連続リトライ**: サーバー負荷増大
3. **無限リトライ（バックオフなし）**: リソース枯渇

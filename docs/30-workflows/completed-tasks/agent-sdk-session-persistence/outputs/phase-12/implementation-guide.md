# Session Persistence 実装ガイド

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| 文書種別   | 実装ガイド                    |
| Phase      | 12                            |
| 作成日     | 2026-01-17                    |
| 機能名     | agent-sdk-session-persistence |
| ステータス | 完了                          |

---

## 1. 概要

セッション永続化機能は、Agent SDKのセッション履歴をelectron-storeを使用してローカルに永続化する機能です。アプリケーション再起動後も過去のセッションを参照・再開できます。

---

## 2. アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                     Renderer Process                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │               AgentSDKPage                           │   │
│  │  - セッション一覧表示                                │   │
│  │  - セッション選択・作成・削除                        │   │
│  └────────────────────────┬────────────────────────────┘   │
│                           │ IPC                             │
└───────────────────────────┼─────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────┐
│                     Main Process                            │
│                           │                                 │
│  ┌────────────────────────▼────────────────────────────┐   │
│  │         session-persistence-handler                  │   │
│  │  - IPC チャンネル登録                                │   │
│  │  - リクエスト→サービス呼び出し                       │   │
│  │  - エラーハンドリング                                │   │
│  └────────────────────────┬────────────────────────────┘   │
│                           │                                 │
│  ┌────────────────────────▼────────────────────────────┐   │
│  │           SessionPersistenceService                  │   │
│  │  - ビジネスロジック                                  │   │
│  │  - Zodバリデーション                                 │   │
│  │  - LRU削除                                           │   │
│  └────────────────────────┬────────────────────────────┘   │
│                           │                                 │
│  ┌────────────────────────▼────────────────────────────┐   │
│  │               SessionStorage                         │   │
│  │  - electron-store ラッパー                           │   │
│  │  - 低レベルCRUD操作                                  │   │
│  └────────────────────────┬────────────────────────────┘   │
│                           │                                 │
│                           ▼                                 │
│               ┌──────────────────────┐                     │
│               │   electron-store     │                     │
│               │   (JSONファイル)     │                     │
│               └──────────────────────┘                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. ファイル構成

```
packages/shared/src/
├── types/
│   └── agent.ts          # PersistedSession, PersistedMessage 等の型定義
└── agent/
    └── validation.ts     # Zod スキーマ定義

apps/desktop/src/main/
├── services/session/
│   ├── index.ts                    # モジュールエクスポート
│   ├── SessionStorage.ts           # electron-store ラッパー
│   ├── SessionPersistenceService.ts # ビジネスロジック
│   └── __tests__/
│       ├── SessionStorage.test.ts
│       ├── SessionPersistenceService.test.ts
│       └── session-ipc.integration.test.ts
└── ipc/
    └── session-persistence-handler.ts  # IPC ハンドラー
```

---

## 4. 型定義

### PersistedSession

```typescript
interface PersistedSession {
  id: string; // UUID
  createdAt: number; // タイムスタンプ
  lastAccessedAt: number; // 最終アクセス日時
  isActive: boolean; // アクティブ状態
  messageCount: number; // メッセージ数
  title?: string; // セッションタイトル
}
```

### PersistedMessage

```typescript
interface PersistedMessage {
  id: string; // UUID
  sessionId: string; // 所属セッションID
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}
```

### IPCResponse

```typescript
type IPCResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };
```

---

## 5. IPC チャンネル

| チャンネル                     | 説明               | パラメータ                      |
| ------------------------------ | ------------------ | ------------------------------- |
| `session:persist:load`         | セッション一覧取得 | なし                            |
| `session:persist:save`         | セッション保存     | `{ session: PersistedSession }` |
| `session:persist:delete`       | セッション削除     | `{ sessionId: string }`         |
| `session:persist:update`       | セッション更新     | `{ sessionId, updates }`        |
| `session:persist:loadMessages` | メッセージ取得     | `{ sessionId, options? }`       |
| `session:persist:saveMessage`  | メッセージ保存     | `{ message: PersistedMessage }` |
| `session:persist:clearAll`     | 全データ削除       | `{ confirm: boolean }`          |
| `session:persist:getStats`     | 統計情報取得       | なし                            |
| `session:persist:cleanup`      | LRU削除実行        | `{ targetUsageRatio?: number }` |

---

## 6. 使用方法

### main.ts での登録

```typescript
import { app } from "electron";
import {
  registerSessionPersistenceHandlers,
  unregisterSessionPersistenceHandlers,
} from "./ipc/session-persistence-handler";
import { SessionPersistenceService } from "./services/session/SessionPersistenceService";

// アプリ起動時
const sessionService = new SessionPersistenceService();
registerSessionPersistenceHandlers(sessionService);

// アプリ終了時
app.on("before-quit", () => {
  unregisterSessionPersistenceHandlers();
});
```

### Renderer からの呼び出し例

```typescript
// preload.ts で公開
contextBridge.exposeInMainWorld("sessionPersistence", {
  load: () => ipcRenderer.invoke("session:persist:load"),
  save: (session) => ipcRenderer.invoke("session:persist:save", { session }),
  delete: (sessionId) =>
    ipcRenderer.invoke("session:persist:delete", { sessionId }),
  // ...
});

// React コンポーネントでの使用
const { data: sessions } = await window.sessionPersistence.load();
```

---

## 7. 設定

### DEFAULT_PERSISTENCE_CONFIG

```typescript
const DEFAULT_PERSISTENCE_CONFIG = {
  maxSessions: 100, // 最大セッション数
  maxStorageSize: 50 * 1024 * 1024, // 50MB
  maxMessagesPerSession: 1000, // セッションあたり最大メッセージ数
  enableAutoBackup: true, // 自動バックアップ
  backupRetentionCount: 3, // バックアップ保持数
  lruWarningThreshold: 0.9, // LRU警告閾値
};
```

カスタマイズ例:

```typescript
const service = new SessionPersistenceService({
  maxSessions: 50,
  maxStorageSize: 10 * 1024 * 1024, // 10MB
});
```

---

## 8. ストレージファイル

### 保存場所

- **macOS**: `~/Library/Application Support/AIWorkflowOrchestrator/agent-sessions.json`
- **Windows**: `%APPDATA%/AIWorkflowOrchestrator/agent-sessions.json`
- **Linux**: `~/.config/AIWorkflowOrchestrator/agent-sessions.json`

### ファイル構造

```json
{
  "sessions": [
    {
      "id": "uuid-xxx",
      "createdAt": 1234567890,
      "lastAccessedAt": 1234567890,
      "isActive": false,
      "messageCount": 5,
      "title": "Session Title"
    }
  ],
  "messages": {
    "uuid-xxx": [
      {
        "id": "msg-uuid",
        "sessionId": "uuid-xxx",
        "role": "user",
        "content": "Hello",
        "timestamp": 1234567890
      }
    ]
  },
  "metadata": {
    "version": "1.0.0",
    "lastUpdated": 1234567890,
    "totalSize": 1234
  }
}
```

---

## 9. エラーハンドリング

### エラーコード

| コード                | 説明                         |
| --------------------- | ---------------------------- |
| `VALIDATION_ERROR`    | 入力データバリデーション失敗 |
| `SESSION_NOT_FOUND`   | セッションが見つからない     |
| `STORAGE_READ_ERROR`  | ストレージ読み取りエラー     |
| `STORAGE_WRITE_ERROR` | ストレージ書き込みエラー     |
| `INTERNAL_ERROR`      | 予期しないエラー             |

### 使用例

```typescript
const response = await window.sessionPersistence.save(session);
if (!response.success) {
  console.error(`Error: ${response.error.code} - ${response.error.message}`);
}
```

---

## 10. テスト

### テスト実行

```bash
# 全テスト実行
pnpm --filter @repo/desktop exec vitest run src/main/services/session/__tests__

# カバレッジ付き
pnpm --filter @repo/desktop exec vitest run src/main/services/session/__tests__ --coverage
```

### テスト結果

- テスト数: 63
- カバレッジ: ~83%
- 全テストパス

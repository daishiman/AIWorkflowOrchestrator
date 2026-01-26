# Phase 2: アーキテクチャ設計書

## メタ情報

| 項目       | 値                              |
| ---------- | ------------------------------- |
| タスクID   | TASK-4-2                        |
| フェーズ   | Phase 2                         |
| 作成日     | 2026-01-25                      |
| 機能名     | PermissionResolver IPC Handlers |
| ステータス | 完了                            |

---

## 1. システム構成

### 1.1 全体アーキテクチャ

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Main Process                                    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        SkillExecutor                                 │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │              PermissionResolver (TASK-3-2)                  │   │   │
│  │  │                                                             │   │   │
│  │  │  • waitForResponse(requestId, signal?)                      │   │   │
│  │  │  • resolveRequest(response)                                 │   │   │
│  │  │  • cancelRequest(requestId, reason?)                        │   │   │
│  │  │  • cancelAll()                                              │   │   │
│  │  │  • pendingCount                                             │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│                                      │ sendPermissionRequest()              │
│                                      ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                   permission-handlers.ts (NEW)                      │   │
│  │                                                                     │   │
│  │  • registerPermissionHandlers(mainWindow, permissionResolver)      │   │
│  │  • sendPermissionRequest(mainWindow, request)                      │   │
│  │  • unregisterPermissionHandlers()                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
└──────────────────────────────────────┼──────────────────────────────────────┘
                                       │
                                       │ skill:permission-request (send)
                                       │ skill:permission-response (handle)
                                       ▼
┌──────────────────────────────────────┴──────────────────────────────────────┐
│                            Preload Script                                    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    skill-api.ts (UPDATED)                           │   │
│  │                                                                     │   │
│  │  • execute(request)                     [existing]                  │   │
│  │  • onStream(callback)                   [existing]                  │   │
│  │  • abort(executionId)                   [existing]                  │   │
│  │  • getExecutionStatus(executionId)      [existing]                  │   │
│  │  • onPermissionRequest(callback)        [NEW]                       │   │
│  │  • sendPermissionResponse(response)     [NEW]                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       │ contextBridge.exposeInMainWorld
                                       ▼
┌──────────────────────────────────────┴──────────────────────────────────────┐
│                           Renderer Process                                   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                  usePermissionDialog.ts (NEW)                       │   │
│  │                                                                     │   │
│  │  • pendingRequest: SkillPermissionRequest | null                   │   │
│  │  • requestQueue: SkillPermissionRequest[]                          │   │
│  │  • isOpen: boolean                                                  │   │
│  │  • respond(approved, rememberChoice?)                              │   │
│  │  • close()                                                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│                                      │ uses                                 │
│                                      ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                  PermissionDialog.tsx (NEW)                         │   │
│  │                                                                     │   │
│  │  ┌───────────────────────────────────────────────────────────────┐ │   │
│  │  │                     権限の確認                                 │ │   │
│  │  │                                                               │ │   │
│  │  │  以下のツールを実行してもよろしいですか？                      │ │   │
│  │  │                                                               │ │   │
│  │  │  ┌───────────────────────────────────────────────────────┐   │ │   │
│  │  │  │  Bash                                                 │   │ │   │
│  │  │  │  args: { "command": "ls -la" }                        │   │ │   │
│  │  │  │  reason: ファイル一覧を取得します                      │   │ │   │
│  │  │  └───────────────────────────────────────────────────────┘   │ │   │
│  │  │                                                               │ │   │
│  │  │                         [拒否]  [許可]                        │ │   │
│  │  └───────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 モジュール構成

| レイヤー     | モジュール             | 責務                            |
| ------------ | ---------------------- | ------------------------------- |
| Main Process | PermissionResolver     | 権限確認の待機・解決管理        |
| Main Process | permission-handlers.ts | IPC通信のハンドラー登録・解除   |
| Main Process | SkillExecutor          | スキル実行・権限確認リクエスト  |
| Preload      | skill-api.ts           | Renderer向けAPI公開             |
| Preload      | channels.ts            | IPCチャネル定義・ホワイトリスト |
| Renderer     | usePermissionDialog.ts | ダイアログ状態管理・キュー処理  |
| Renderer     | PermissionDialog.tsx   | UI表示・ユーザー操作            |

---

## 2. データフロー

### 2.1 権限確認リクエストフロー

```
┌─────────────────┐
│  SkillExecutor  │
│                 │
│  1. ツール使用  │
│     許可が必要  │
└────────┬────────┘
         │
         │ 2. waitForResponse(requestId)
         ▼
┌─────────────────┐
│PermissionResolver│
│                 │
│ pendingRequests │
│    に登録       │
└────────┬────────┘
         │
         │ 3. IPC経由でRendererに通知
         ▼
┌─────────────────────────────────────────────────┐
│               permission-handlers.ts             │
│                                                  │
│  sendPermissionRequest(mainWindow, request) {   │
│    mainWindow.webContents.send(                 │
│      'skill:permission-request',                │
│      request                                    │
│    );                                           │
│  }                                              │
└─────────────────────┬───────────────────────────┘
                      │
                      │ skill:permission-request
                      ▼
┌─────────────────────────────────────────────────┐
│                 skill-api.ts                     │
│                                                  │
│  onPermissionRequest(callback) {                │
│    ipcRenderer.on('skill:permission-request',   │
│      (_, request) => callback(request)          │
│    );                                           │
│  }                                              │
└─────────────────────┬───────────────────────────┘
                      │
                      │ callback(request)
                      ▼
┌─────────────────────────────────────────────────┐
│             usePermissionDialog                  │
│                                                  │
│  • requestQueueに追加                           │
│  • isOpen = true                                │
│  • currentRequest = queue[0]                    │
└─────────────────────┬───────────────────────────┘
                      │
                      │ render
                      ▼
┌─────────────────────────────────────────────────┐
│              PermissionDialog                    │
│                                                  │
│  ユーザーに表示                                 │
│  [拒否] [許可]                                  │
└─────────────────────────────────────────────────┘
```

### 2.2 権限確認レスポンスフロー

```
┌─────────────────────────────────────────────────┐
│              PermissionDialog                    │
│                                                  │
│  ユーザーが [許可] をクリック                   │
└─────────────────────┬───────────────────────────┘
                      │
                      │ onAllow()
                      ▼
┌─────────────────────────────────────────────────┐
│             usePermissionDialog                  │
│                                                  │
│  respond(true) {                                │
│    const response = {                           │
│      requestId: currentRequest.requestId,       │
│      approved: true,                            │
│      rememberChoice: false                      │
│    };                                           │
│    await skillAPI.sendPermissionResponse(res);  │
│    setIsOpen(false);                            │
│    processNextInQueue();                        │
│  }                                              │
└─────────────────────┬───────────────────────────┘
                      │
                      │ sendPermissionResponse(response)
                      ▼
┌─────────────────────────────────────────────────┐
│                 skill-api.ts                     │
│                                                  │
│  sendPermissionResponse(response) {             │
│    return ipcRenderer.invoke(                   │
│      'skill:permission-response',               │
│      response                                   │
│    );                                           │
│  }                                              │
└─────────────────────┬───────────────────────────┘
                      │
                      │ skill:permission-response
                      ▼
┌─────────────────────────────────────────────────┐
│               permission-handlers.ts             │
│                                                  │
│  ipcMain.handle('skill:permission-response',    │
│    async (event, response) => {                 │
│      validateIpcSender(event, mainWindow);      │
│      permissionResolver.resolveRequest(res);    │
│      return { success: true };                  │
│    }                                            │
│  );                                             │
└─────────────────────┬───────────────────────────┘
                      │
                      │ resolveRequest(response)
                      ▼
┌─────────────────────────────────────────────────┐
│              PermissionResolver                  │
│                                                  │
│  • pendingRequestsから削除                      │
│  • タイムアウトタイマーをクリア                  │
│  • Promiseを解決（resolve or reject）           │
└─────────────────────┬───────────────────────────┘
                      │
                      │ Promise resolved
                      ▼
┌─────────────────────────────────────────────────┐
│               SkillExecutor                      │
│                                                  │
│  waitForResponse()のPromiseが解決               │
│  → approved: true → ツール実行続行              │
│  → approved: false → ツール実行中止             │
└─────────────────────────────────────────────────┘
```

---

## 3. IPC通信設計

### 3.1 チャネル定義

| チャネル名                  | 方向            | メソッド | 用途               |
| --------------------------- | --------------- | -------- | ------------------ |
| `skill:permission-request`  | Main → Renderer | send     | 権限確認リクエスト |
| `skill:permission-response` | Renderer → Main | invoke   | 権限確認応答       |

### 3.2 セキュリティ設計

```typescript
// channels.ts への追加
export const IPC_CHANNELS = {
  // ... 既存チャネル
  SKILL_PERMISSION_REQUEST: "skill:permission-request",
  SKILL_PERMISSION_RESPONSE: "skill:permission-response",
} as const;

// ホワイトリスト
export const ALLOWED_ON_CHANNELS: readonly string[] = [
  // ... 既存
  IPC_CHANNELS.SKILL_PERMISSION_REQUEST, // NEW
];

export const ALLOWED_INVOKE_CHANNELS: readonly string[] = [
  // ... 既存
  IPC_CHANNELS.SKILL_PERMISSION_RESPONSE, // NEW
];
```

### 3.3 sender検証

```typescript
// permission-handlers.ts
import {
  validateIpcSender,
  toIPCValidationError,
} from "../infrastructure/security/ipc-validator";

ipcMain.handle(
  IPC_CHANNELS.SKILL_PERMISSION_RESPONSE,
  async (event, response) => {
    const validation = validateIpcSender(
      event,
      IPC_CHANNELS.SKILL_PERMISSION_RESPONSE,
      { getAllowedWindows: () => [mainWindow] },
    );
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }
    // ... 処理
  },
);
```

---

## 4. エラーハンドリング設計

### 4.1 エラーケース

| エラーケース    | 発生箇所              | 対処                             |
| --------------- | --------------------- | -------------------------------- |
| タイムアウト    | PermissionResolver    | Error throw（既存実装）          |
| AbortSignal     | PermissionResolver    | Error throw（既存実装）          |
| IPC通信エラー   | permission-handlers   | エラーログ出力、適切なエラー返却 |
| ウィンドウ破棄  | sendPermissionRequest | 送信スキップ                     |
| 不正なsender    | permission-handlers   | IPC_VALIDATION_ERROR throw       |
| 不明なrequestId | PermissionResolver    | 無視（resolveRequestの仕様）     |

### 4.2 エラーハンドリングフロー

```typescript
// permission-handlers.ts
export function sendPermissionRequest(
  mainWindow: BrowserWindow,
  request: SkillPermissionRequest,
): void {
  // ウィンドウ破棄チェック
  if (mainWindow.isDestroyed()) {
    console.warn("[Permission] Window is destroyed, skipping request");
    return;
  }

  try {
    mainWindow.webContents.send(IPC_CHANNELS.SKILL_PERMISSION_REQUEST, request);
  } catch (error) {
    console.error("[Permission] Failed to send request:", error);
  }
}
```

---

## 5. 状態管理設計

### 5.1 usePermissionDialog状態

```typescript
interface PermissionDialogState {
  /** 現在表示中のリクエスト */
  currentRequest: SkillPermissionRequest | null;

  /** 待機中のリクエストキュー */
  requestQueue: SkillPermissionRequest[];

  /** ダイアログ表示状態 */
  isOpen: boolean;

  /** 応答処理中フラグ */
  isResponding: boolean;
}
```

### 5.2 状態遷移

```
[初期状態]
  currentRequest: null
  requestQueue: []
  isOpen: false
  isResponding: false

[リクエスト受信]
  → キューに追加
  → currentRequestが null ならダイアログ表示
     currentRequest: リクエスト
     isOpen: true

[応答送信]
  isResponding: true
  → API呼び出し
  → キューから削除
  → 次のリクエストを処理
     次がある → currentRequest更新、isOpen維持
     次がない → currentRequest: null, isOpen: false
  isResponding: false
```

---

## 6. テスト戦略

### 6.1 単体テスト

| 対象                   | テスト内容                                   |
| ---------------------- | -------------------------------------------- |
| permission-handlers.ts | IPC登録/解除、sender検証、レスポンス処理     |
| skill-api.ts           | onPermissionRequest購読/解除、レスポンス送信 |
| usePermissionDialog.ts | 状態管理、キュー処理、応答送信               |
| PermissionDialog.tsx   | レンダリング、ボタンクリック、キーボード操作 |

### 6.2 統合テスト

| テストシナリオ             | 検証内容                                        |
| -------------------------- | ----------------------------------------------- |
| Main → Renderer リクエスト | webContents.send → onPermissionRequest callback |
| Renderer → Main レスポンス | sendPermissionResponse → resolveRequest         |
| タイムアウト               | 応答なし → PermissionResolver timeout           |
| 複数リクエスト             | キュー順序保持、順次表示                        |
| キャンセル                 | Escキー/閉じるボタン → deny として処理          |

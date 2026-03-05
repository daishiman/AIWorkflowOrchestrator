# Phase 2 成果物: API仕様

## 1. Notification IPC

### 1.1 `notification:get-history` (invoke)

- Request
  - `{ limit?: number; offset?: number }`
- Response
  - `{ success: true, data: { notifications: Notification[]; totalCount: number } }`
  - `{ success: false, error: { code: string; message: string } }`

### 1.2 `notification:mark-read` (invoke)

- Request
  - `{ notificationId: string }`
- Validation (P42)
  - string型 / 空文字 / trim空文字
- Response
  - `{ success: true, data: { updated: boolean } }`

### 1.3 `notification:mark-all-read` (invoke)

- Request: `void`
- Response
  - `{ success: true, data: { updatedCount: number } }`

### 1.4 `notification:clear` (invoke)

- Request: `void`
- Response
  - `{ success: true, data: { deletedCount: number } }`

### 1.5 `notification:new` (on)

- Payload
  - `{ notification: Notification }`

## 2. History Search IPC

### 2.1 `history:search` (invoke)

- Request
  - `{ query: string; filter: "all" | "chat" | "file" | "skill"; limit: number; offset: number }`
- Validation (P42)
  - `query`: string型 / 空文字許容（ただしtrim検証は必要）
- Response
  - `{ success: true, data: { items: HistoryItem[]; totalCount: number; hasMore: boolean } }`

### 2.2 `history:get-stats` (invoke)

- Request: `void`
- Response
  - `{ success: true, data: { chat: number; file: number; skill: number; total: number } }`

## 3. Preload API

### 3.1 `window.electronAPI.notification`

- `getHistory(params?)`
- `markRead(request)`
- `markAllRead()`
- `clear()`
- `onNew(callback)`

### 3.2 `window.electronAPI.historySearch`

- `search(request)`
- `getStats()`

## 4. 共有型

- `packages/shared/src/types/history.ts`
  - `HistoryItemType`
  - `HistoryItem`
  - `HistorySearchRequest`
  - `HistorySearchResult`
  - `HistorySearchStats`

## 5. エラーコード規約

- `VALIDATION_ERROR`: リクエスト形式不正
- `NOT_FOUND`: 該当IDが存在しない
- `UNKNOWN_ERROR`: 予期せぬ例外

## 6. セキュリティ契約（aiworkflow-requirements抽出）

- `security-electron-ipc.md` 適用
  - invokeハンドラは `sender検証 -> 入力検証 -> 業務処理 -> エラー整形` の順序で実行する
  - sender未許可時は処理を継続せずにエラー応答する
- `security-api-electron.md` 適用
  - Preloadは最小公開面（notification/historySearchのみ）を維持する
  - チャネルは `IPC_CHANNELS` 定数経由で参照し、文字列直書きを禁止する
- `security-input-validation.md` 適用
  - 文字列入力は P42 の三段検証（`typeof` / `=== ""` / `trim() === ""`）を適用する

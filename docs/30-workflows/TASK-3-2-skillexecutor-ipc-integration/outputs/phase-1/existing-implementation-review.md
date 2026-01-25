# 既存実装レビュー - TASK-3-2 Phase 1

## メタ情報

| 項目       | 内容           |
| ---------- | -------------- |
| 作成日     | 2026-01-25     |
| Phase      | 1              |
| タスク     | 既存実装の確認 |
| ステータス | 完了           |

---

## 1. SkillExecutor 実装確認

### ファイルパス

`apps/desktop/src/main/services/skill/SkillExecutor.ts`

### 概要

TASK-3-1-A で実装された SDK query() 基本実装。Main Process で動作し、スキル実行とストリーミング配信を担当。

### IPC 送信 API

#### `skill:stream` チャンネル

```typescript
// 送信メソッド
private sendStream(message: SkillStreamMessage): void {
  if (this.mainWindow.isDestroyed()) {
    return;
  }
  this.mainWindow.webContents.send("skill:stream", message);
}
```

#### 送信タイミング

| タイミング           | メッセージタイプ | isComplete |
| -------------------- | ---------------- | ---------- |
| テキスト受信時       | `text`           | false      |
| ツール使用時         | `tool_use`       | false      |
| エラー発生時         | `error`          | true       |
| 完了時               | `complete`       | true       |
| 中断時（abort 呼出） | `error`          | true       |

### メッセージ形式

```typescript
interface SkillStreamMessage {
  executionId: string; // UUID v4
  id: string; // メッセージID (UUID v4)
  type: "text" | "tool_use" | "error" | "complete";
  content: string; // メッセージ内容
  timestamp: number; // UNIX ミリ秒
  isComplete: boolean; // 完了フラグ
}
```

### 公開メソッド

| メソッド                 | 戻り値                            | 説明               |
| ------------------------ | --------------------------------- | ------------------ |
| `execute(request,skill)` | `Promise<SkillExecutionResponse>` | スキル実行         |
| `abort(executionId)`     | `boolean`                         | 実行中断           |
| `getActiveExecutions()`  | `ExecutionInfo[]`                 | アクティブ実行一覧 |
| `getExecutionStatus(id)` | `ExecutionInfo \| undefined`      | 実行状態取得       |

### 実装済み機能

- [x] AbortController による中断制御
- [x] 同時実行数制限（最大 5）
- [x] タイムアウト制御（デフォルト 30 秒）
- [x] エラーハンドリング（複数エラーコード対応）
- [x] 履歴保持（60 秒後に自動クリーンアップ）

---

## 2. Preload API 実装確認

### ファイルパス

`apps/desktop/src/preload/index.ts`

### 現状

- `skillAPI` は **未定義**
- 類似機能として `agentAPI` と `agentSDKAPI` が存在

### 既存の類似 API パターン

#### agentAPI（参考）

```typescript
const agentAPI: AgentExecutionAPI = {
  start: (request) => safeInvoke(IPC_CHANNELS.AGENT_EXECUTE, request),
  stop: () => safeInvoke(IPC_CHANNELS.AGENT_ABORT),
  respondPermission: (response) =>
    safeInvoke(IPC_CHANNELS.AGENT_PERMISSION_RESPOND, response),
  onStream: (callback) =>
    safeOn<AgentStreamPayload>(IPC_CHANNELS.AGENT_STREAM_CHUNK, callback),
  onStatus: (callback) =>
    safeOn<AgentStatusPayload>(IPC_CHANNELS.AGENT_STATUS_CHANGED, callback),
  onPermission: (callback) =>
    safeOn<AgentPermissionRequest>(
      IPC_CHANNELS.AGENT_PERMISSION_REQUEST,
      callback,
    ),
};
```

### 必要な実装

| API                   | 実装状況 | 説明                       |
| --------------------- | -------- | -------------------------- |
| `skillAPI.execute()`  | 未実装   | スキル実行リクエスト       |
| `skillAPI.onStream()` | 未実装   | ストリーム受信コールバック |
| `skillAPI.abort()`    | 未実装   | 実行中断                   |

---

## 3. IPC チャンネル定義確認

### ファイルパス

`apps/desktop/src/preload/channels.ts`

### 現状

#### 定義済みチャンネル

| チャンネル             | 定義 | ALLOWED_INVOKE | ALLOWED_ON |
| ---------------------- | ---- | -------------- | ---------- |
| `skill:execute`        | あり | あり           | -          |
| `skill:list-available` | あり | あり           | -          |
| `skill:list-imported`  | あり | あり           | -          |
| `skill:import`         | あり | あり           | -          |
| `skill:remove`         | あり | あり           | -          |
| `skill:get-detail`     | あり | あり           | -          |
| **`skill:stream`**     | なし | -              | なし       |
| **`skill:abort`**      | なし | なし           | -          |

### 必要な追加

```typescript
// IPC_CHANNELS に追加
SKILL_STREAM: "skill:stream",
SKILL_ABORT: "skill:abort",

// ALLOWED_INVOKE_CHANNELS に追加
IPC_CHANNELS.SKILL_ABORT,

// ALLOWED_ON_CHANNELS に追加
IPC_CHANNELS.SKILL_STREAM,
```

---

## 4. 型定義確認

### ファイルパス

`packages/shared/src/types/skill-execution.ts`

### 定義済み型

| 型                        | 説明                     | 状態   |
| ------------------------- | ------------------------ | ------ |
| `ExecutionState`          | 実行状態                 | 定義済 |
| `SkillExecutionRequest`   | 実行リクエスト           | 定義済 |
| `SkillExecutionResponse`  | 実行レスポンス           | 定義済 |
| `ExecutionInfo`           | 実行情報                 | 定義済 |
| `SkillStreamMessageType`  | メッセージタイプ         | 定義済 |
| `SkillStreamMessage`      | ストリームメッセージ     | 定義済 |
| `SkillExecutionErrorCode` | エラーコード             | 定義済 |
| `SkillExecutionError`     | エラー詳細               | 定義済 |
| `ExecutionContext`        | 実行コンテキスト（内部） | 定義済 |

### 定数定義

```typescript
export const SKILL_EXECUTION_DEFAULTS = {
  DEFAULT_TIMEOUT: 30000,
  MAX_CONCURRENT_EXECUTIONS: 5,
  MAX_RETRIES: 3,
  INITIAL_RETRY_DELAY: 1000,
  MAX_RETRY_DELAY: 4000,
} as const;
```

### 追加が必要な型

なし（既存の型で十分）

---

## 5. 実装ギャップ分析

### Main Process（完了）

- [x] SkillExecutor クラス実装
- [x] `skill:stream` 送信機能
- [x] 中断（abort）機能
- [x] エラーハンドリング

### Preload API（未実装）

- [ ] `skillAPI` 名前空間
- [ ] `skillAPI.execute()` メソッド
- [ ] `skillAPI.onStream()` メソッド
- [ ] `skillAPI.abort()` メソッド

### IPC チャンネル（部分的）

- [ ] `skill:stream` チャンネル定義
- [ ] `skill:abort` チャンネル定義
- [ ] ALLOWED_ON_CHANNELS への追加

### Renderer Process（未実装）

- [ ] React Hook（useSkillExecution）
- [ ] ストリーミング表示コンポーネント
- [ ] 中断 UI（Abort ボタン）
- [ ] エラー表示 UI
- [ ] 完了表示 UI

---

## 6. 結論

### 実装範囲の明確化

本タスク（TASK-3-2）で実装すべき範囲：

1. **Preload API 拡張**
   - `skillAPI.onStream(callback)`: ストリームリスナー登録
   - `skillAPI.abort(executionId)`: 実行中断

2. **IPC チャンネル追加**
   - `skill:stream`: ALLOWED_ON_CHANNELS に追加
   - `skill:abort`: ALLOWED_INVOKE_CHANNELS に追加

3. **Renderer コンポーネント**
   - `useSkillExecution` Hook
   - `SkillStreamDisplay` コンポーネント
   - 中断ボタン・エラー表示・完了表示

### 実装不要（TASK-3-1-A で完了済み）

- SkillExecutor 本体
- `skill:execute` IPC Handler
- 型定義（@repo/shared）

---

## 参照

- SkillExecutor: `apps/desktop/src/main/services/skill/SkillExecutor.ts`
- Preload API: `apps/desktop/src/preload/index.ts`
- チャンネル定義: `apps/desktop/src/preload/channels.ts`
- 型定義: `packages/shared/src/types/skill-execution.ts`

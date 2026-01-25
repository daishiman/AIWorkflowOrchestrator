# Preload API 設計 - TASK-3-2 Phase 2

## メタ情報

| 項目       | 内容             |
| ---------- | ---------------- |
| 作成日     | 2026-01-25       |
| Phase      | 2                |
| タスク     | Preload API 設計 |
| ステータス | 完了             |

---

## 1. インターフェース設計

### 1.1 SkillAPI 型定義

```typescript
// apps/desktop/src/preload/types.ts に追加

import type {
  SkillStreamMessage,
  SkillExecutionRequest,
  SkillExecutionResponse,
  ExecutionInfo,
} from "@repo/shared/types/skill-execution";

/**
 * Skill API - Preload から Renderer に公開する skillAPI インターフェース
 */
export interface SkillAPI {
  /**
   * スキルを実行する
   * @param request - 実行リクエスト
   * @returns 実行レスポンス（executionId を含む）
   */
  execute: (request: SkillExecutionRequest) => Promise<SkillExecutionResponse>;

  /**
   * ストリームメッセージを受信するコールバックを登録する
   * @param callback - メッセージ受信時のコールバック関数
   * @returns クリーンアップ関数（リスナー解除用）
   */
  onStream: (callback: (message: SkillStreamMessage) => void) => () => void;

  /**
   * 実行中のスキルを中断する
   * @param executionId - 中断対象の実行ID
   * @returns 中断成功の場合 true
   */
  abort: (executionId: string) => Promise<boolean>;

  /**
   * 実行状態を取得する
   * @param executionId - 実行ID
   * @returns 実行情報（見つからない場合 null）
   */
  getExecutionStatus: (executionId: string) => Promise<ExecutionInfo | null>;
}
```

### 1.2 Window 型拡張

```typescript
// apps/desktop/src/preload/types.ts に追加

declare global {
  interface Window {
    skillAPI: SkillAPI;
  }
}
```

---

## 2. 実装設計

### 2.1 skill-api.ts

```typescript
// apps/desktop/src/preload/skill-api.ts

import { ipcRenderer, IpcRendererEvent } from "electron";
import {
  IPC_CHANNELS,
  ALLOWED_ON_CHANNELS,
  ALLOWED_INVOKE_CHANNELS,
} from "./channels";
import type { SkillAPI } from "./types";
import type {
  SkillStreamMessage,
  SkillExecutionRequest,
  SkillExecutionResponse,
  ExecutionInfo,
} from "@repo/shared/types/skill-execution";

/**
 * safeInvoke - 許可されたチャンネルのみ invoke を実行
 */
function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  if (!ALLOWED_INVOKE_CHANNELS.includes(channel)) {
    return Promise.reject(new Error(`Channel ${channel} is not allowed`));
  }
  return ipcRenderer.invoke(channel, ...args);
}

/**
 * safeOn - 許可されたチャンネルのみリスナーを登録
 */
function safeOn<T>(channel: string, callback: (data: T) => void): () => void {
  if (!ALLOWED_ON_CHANNELS.includes(channel)) {
    console.error(`Channel ${channel} is not allowed`);
    return () => {};
  }

  const listener = (_event: IpcRendererEvent, data: T) => {
    callback(data);
  };

  ipcRenderer.on(channel, listener);

  return () => {
    ipcRenderer.removeListener(channel, listener);
  };
}

/**
 * skillAPI - Skill 実行関連の Preload API
 */
export const skillAPI: SkillAPI = {
  execute: (request: SkillExecutionRequest): Promise<SkillExecutionResponse> =>
    safeInvoke(IPC_CHANNELS.SKILL_EXECUTE, request),

  onStream: (callback: (message: SkillStreamMessage) => void): (() => void) =>
    safeOn<SkillStreamMessage>(IPC_CHANNELS.SKILL_STREAM, callback),

  abort: (executionId: string): Promise<boolean> =>
    safeInvoke(IPC_CHANNELS.SKILL_ABORT, executionId),

  getExecutionStatus: (executionId: string): Promise<ExecutionInfo | null> =>
    safeInvoke(IPC_CHANNELS.SKILL_GET_STATUS, executionId),
};
```

### 2.2 channels.ts 追加

```typescript
// apps/desktop/src/preload/channels.ts に追加

// IPC_CHANNELS オブジェクトに追加
SKILL_STREAM: "skill:stream",
SKILL_ABORT: "skill:abort",
SKILL_GET_STATUS: "skill:get-status",

// ALLOWED_INVOKE_CHANNELS に追加
IPC_CHANNELS.SKILL_ABORT,
IPC_CHANNELS.SKILL_GET_STATUS,

// ALLOWED_ON_CHANNELS に追加
IPC_CHANNELS.SKILL_STREAM,
```

### 2.3 index.ts への統合

```typescript
// apps/desktop/src/preload/index.ts に追加

import { skillAPI } from "./skill-api";

// contextBridge.exposeInMainWorld に追加
contextBridge.exposeInMainWorld("skillAPI", skillAPI);
```

---

## 3. IPC Handler 設計

### 3.1 skill:abort Handler

```typescript
// apps/desktop/src/main/ipc/skill-handlers.ts

import { ipcMain } from "electron";
import { getSkillExecutor } from "../services/skill/SkillExecutorProvider";

/**
 * skill:abort - スキル実行の中断
 */
ipcMain.handle(
  "skill:abort",
  async (_event, executionId: string): Promise<boolean> => {
    const executor = getSkillExecutor();
    if (!executor) {
      return false;
    }
    return executor.abort(executionId);
  },
);

/**
 * skill:get-status - 実行状態の取得
 */
ipcMain.handle(
  "skill:get-status",
  async (_event, executionId: string): Promise<ExecutionInfo | null> => {
    const executor = getSkillExecutor();
    if (!executor) {
      return null;
    }
    const status = executor.getExecutionStatus(executionId);
    return status ?? null;
  },
);
```

---

## 4. 型エクスポート

### 4.1 @repo/shared からのエクスポート

`packages/shared/src/types/skill-execution.ts` から以下の型をエクスポート：

| 型                      | 用途                 |
| ----------------------- | -------------------- |
| SkillStreamMessage      | ストリームメッセージ |
| SkillStreamMessageType  | メッセージタイプ     |
| SkillExecutionRequest   | 実行リクエスト       |
| SkillExecutionResponse  | 実行レスポンス       |
| ExecutionInfo           | 実行情報             |
| SkillExecutionError     | エラー情報           |
| SkillExecutionErrorCode | エラーコード         |
| ExecutionState          | 実行状態             |

### 4.2 packages/shared/src/index.ts

```typescript
// 既存エクスポートに追加
export * from "./types/skill-execution";
```

---

## 5. セキュリティ考慮事項

### 5.1 チャンネル許可リスト

| チャンネル       | 許可リスト     | 理由               |
| ---------------- | -------------- | ------------------ |
| skill:execute    | ALLOWED_INVOKE | 既存（変更なし）   |
| skill:abort      | ALLOWED_INVOKE | 新規追加           |
| skill:get-status | ALLOWED_INVOKE | 新規追加           |
| skill:stream     | ALLOWED_ON     | 新規追加（受信用） |

### 5.2 入力検証

```typescript
// executionId の UUID v4 検証
function isValidExecutionId(id: string): boolean {
  const uuidV4Regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Regex.test(id);
}

// abort handler での検証
ipcMain.handle("skill:abort", async (_event, executionId: string) => {
  if (!isValidExecutionId(executionId)) {
    return false;
  }
  // ... 処理
});
```

---

## 6. テスト設計

### 6.1 ユニットテスト対象

| テスト対象        | テスト内容                          |
| ----------------- | ----------------------------------- |
| skillAPI.execute  | invoke が正しく呼ばれる             |
| skillAPI.onStream | リスナー登録・解除が正しく動作      |
| skillAPI.abort    | invoke が正しく呼ばれる             |
| safeInvoke        | 許可されていないチャンネルで reject |
| safeOn            | 許可されていないチャンネルで空関数  |

### 6.2 モック戦略

```typescript
// ipcRenderer のモック
vi.mock("electron", () => ({
  ipcRenderer: {
    invoke: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn(),
  },
}));
```

---

## 7. 参照

- 既存 Preload API: `apps/desktop/src/preload/index.ts`
- 型定義: `packages/shared/src/types/skill-execution.ts`
- Phase 1 IPC 要件: `outputs/phase-1/ipc-integration-requirements.md`

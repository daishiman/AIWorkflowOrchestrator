# Phase 2: インターフェース設計書

## メタ情報

| 項目       | 値                              |
| ---------- | ------------------------------- |
| タスクID   | TASK-4-2                        |
| フェーズ   | Phase 2                         |
| 作成日     | 2026-01-25                      |
| 機能名     | PermissionResolver IPC Handlers |
| ステータス | 完了                            |

---

## 1. 型定義（既存 - @repo/shared）

### 1.1 SkillPermissionRequest

```typescript
// packages/shared/src/types/skill.ts （既存）
/**
 * スキル実行時の権限確認リクエスト（Main → Renderer）
 */
export interface SkillPermissionRequest {
  /** 実行ID */
  executionId: string;

  /** リクエストID（応答のマッチング用） */
  requestId: string;

  /** ツール名 */
  toolName: string;

  /** ツール引数 */
  args: Record<string, unknown>;

  /** 確認を求める理由（オプション） */
  reason?: string;
}
```

### 1.2 SkillPermissionResponse

```typescript
// packages/shared/src/types/skill.ts （既存）
/**
 * スキル実行時の権限確認レスポンス（Renderer → Main）
 */
export interface SkillPermissionResponse {
  /** リクエストID（リクエストとのマッチング用） */
  requestId: string;

  /** 承認されたかどうか */
  approved: boolean;

  /** この選択を記憶するか（オプション） */
  rememberChoice?: boolean;

  /** 拒否理由（オプション） */
  rejectReason?: string;
}
```

---

## 2. IPC Handler インターフェース

### 2.1 permission-handlers.ts

```typescript
// apps/desktop/src/main/ipc/permission-handlers.ts

import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from "electron";
import type { PermissionResolver } from "../services/skill/PermissionResolver";
import type {
  SkillPermissionRequest,
  SkillPermissionResponse,
} from "@repo/shared";
import { IPC_CHANNELS } from "../../preload/channels";
import {
  validateIpcSender,
  toIPCValidationError,
} from "../infrastructure/security/ipc-validator";

/**
 * 権限確認関連のIPCハンドラを登録
 *
 * @param mainWindow - メインウィンドウインスタンス
 * @param permissionResolver - PermissionResolverインスタンス
 */
export function registerPermissionHandlers(
  mainWindow: BrowserWindow,
  permissionResolver: PermissionResolver,
): void;

/**
 * 権限確認関連のIPCハンドラを解除
 */
export function unregisterPermissionHandlers(): void;

/**
 * 権限確認リクエストをRendererに送信
 *
 * @param mainWindow - メインウィンドウインスタンス
 * @param request - 権限確認リクエスト
 */
export function sendPermissionRequest(
  mainWindow: BrowserWindow,
  request: SkillPermissionRequest,
): void;
```

### 2.2 実装詳細

```typescript
// 実装例
export function registerPermissionHandlers(
  mainWindow: BrowserWindow,
  permissionResolver: PermissionResolver,
): void {
  // Renderer側からのレスポンスを受信
  ipcMain.handle(
    IPC_CHANNELS.SKILL_PERMISSION_RESPONSE,
    async (
      event: IpcMainInvokeEvent,
      response: SkillPermissionResponse,
    ): Promise<{ success: boolean }> => {
      // sender検証
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_PERMISSION_RESPONSE,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }

      // PermissionResolverに応答を渡す
      permissionResolver.resolveRequest(response);

      return { success: true };
    },
  );
}

export function unregisterPermissionHandlers(): void {
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_PERMISSION_RESPONSE);
}

export function sendPermissionRequest(
  mainWindow: BrowserWindow,
  request: SkillPermissionRequest,
): void {
  if (mainWindow.isDestroyed()) {
    console.warn(
      "[PermissionHandlers] Window is destroyed, skipping request:",
      request.requestId,
    );
    return;
  }

  mainWindow.webContents.send(IPC_CHANNELS.SKILL_PERMISSION_REQUEST, request);
}
```

---

## 3. Preload API インターフェース

### 3.1 skill-api.ts 拡張

```typescript
// apps/desktop/src/preload/skill-api.ts

import { ipcRenderer, IpcRendererEvent } from "electron";
import type {
  SkillPermissionRequest,
  SkillPermissionResponse,
  SkillStreamMessage,
  SkillExecutionRequest,
  SkillExecutionResponse,
  ExecutionInfo,
} from "@repo/shared";
import {
  IPC_CHANNELS,
  ALLOWED_ON_CHANNELS,
  ALLOWED_INVOKE_CHANNELS,
} from "./channels";

/**
 * SkillAPI - Skill 実行関連の Preload API インターフェース
 */
export interface SkillAPI {
  // === 既存 API ===

  /**
   * スキルを実行する
   */
  execute: (request: SkillExecutionRequest) => Promise<SkillExecutionResponse>;

  /**
   * ストリームメッセージを受信するコールバックを登録する
   */
  onStream: (callback: (message: SkillStreamMessage) => void) => () => void;

  /**
   * 実行中のスキルを中断する
   */
  abort: (executionId: string) => Promise<boolean>;

  /**
   * 実行状態を取得する
   */
  getExecutionStatus: (executionId: string) => Promise<ExecutionInfo | null>;

  // === 新規 API ===

  /**
   * 権限確認リクエストを購読する
   *
   * @param callback - リクエスト受信時のコールバック関数
   * @returns クリーンアップ関数（購読解除用）
   */
  onPermissionRequest: (
    callback: (request: SkillPermissionRequest) => void,
  ) => () => void;

  /**
   * 権限確認応答を送信する
   *
   * @param response - 権限確認応答
   * @returns 送信結果
   */
  sendPermissionResponse: (
    response: SkillPermissionResponse,
  ) => Promise<{ success: boolean }>;
}
```

### 3.2 実装詳細

```typescript
// 実装例
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

function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  if (!ALLOWED_INVOKE_CHANNELS.includes(channel)) {
    return Promise.reject(new Error(`Channel ${channel} is not allowed`));
  }
  return ipcRenderer.invoke(channel, ...args);
}

export const skillAPI: SkillAPI = {
  // ... 既存API

  onPermissionRequest: (
    callback: (request: SkillPermissionRequest) => void,
  ): (() => void) =>
    safeOn<SkillPermissionRequest>(
      IPC_CHANNELS.SKILL_PERMISSION_REQUEST,
      callback,
    ),

  sendPermissionResponse: (
    response: SkillPermissionResponse,
  ): Promise<{ success: boolean }> =>
    safeInvoke(IPC_CHANNELS.SKILL_PERMISSION_RESPONSE, response),
};
```

---

## 4. React Hook インターフェース

### 4.1 usePermissionDialog

````typescript
// apps/desktop/src/renderer/hooks/usePermissionDialog.ts

import { useState, useEffect, useCallback } from "react";
import type {
  SkillPermissionRequest,
  SkillPermissionResponse,
} from "@repo/shared";

/**
 * usePermissionDialog の戻り値
 */
export interface UsePermissionDialogReturn {
  /** 現在表示中のリクエスト（nullの場合はリクエストなし） */
  currentRequest: SkillPermissionRequest | null;

  /** 待機中のリクエストキュー */
  requestQueue: SkillPermissionRequest[];

  /** ダイアログが開いているか */
  isOpen: boolean;

  /** 応答処理中か */
  isResponding: boolean;

  /**
   * 応答を送信
   * @param approved - 許可するか
   * @param rememberChoice - 選択を記憶するか（将来的な拡張用）
   */
  respond: (approved: boolean, rememberChoice?: boolean) => Promise<void>;

  /**
   * ダイアログを閉じる（拒否扱い）
   */
  close: () => Promise<void>;
}

/**
 * 権限確認ダイアログの状態管理フック
 *
 * @returns ダイアログ状態と操作関数
 *
 * @example
 * ```tsx
 * function App() {
 *   const { currentRequest, isOpen, respond, close } = usePermissionDialog();
 *
 *   return (
 *     <PermissionDialog
 *       request={currentRequest}
 *       isOpen={isOpen}
 *       onAllow={() => respond(true)}
 *       onDeny={() => respond(false)}
 *       onClose={close}
 *     />
 *   );
 * }
 * ```
 */
export function usePermissionDialog(): UsePermissionDialogReturn;
````

### 4.2 実装詳細

```typescript
export function usePermissionDialog(): UsePermissionDialogReturn {
  const [requestQueue, setRequestQueue] = useState<SkillPermissionRequest[]>(
    [],
  );
  const [isResponding, setIsResponding] = useState(false);

  // 現在のリクエスト = キューの先頭
  const currentRequest = requestQueue[0] ?? null;
  const isOpen = currentRequest !== null;

  // リクエスト購読
  useEffect(() => {
    const unsubscribe = window.skillAPI.onPermissionRequest((request) => {
      setRequestQueue((prev) => [...prev, request]);
    });
    return unsubscribe;
  }, []);

  // 応答送信
  const respond = useCallback(
    async (approved: boolean, rememberChoice?: boolean) => {
      if (!currentRequest || isResponding) return;

      setIsResponding(true);

      try {
        const response: SkillPermissionResponse = {
          requestId: currentRequest.requestId,
          approved,
          rememberChoice,
        };

        await window.skillAPI.sendPermissionResponse(response);

        // キューから削除
        setRequestQueue((prev) => prev.slice(1));
      } finally {
        setIsResponding(false);
      }
    },
    [currentRequest, isResponding],
  );

  // 閉じる（拒否扱い）
  const close = useCallback(async () => {
    await respond(false);
  }, [respond]);

  return {
    currentRequest,
    requestQueue,
    isOpen,
    isResponding,
    respond,
    close,
  };
}
```

---

## 5. channels.ts 更新

### 5.1 チャネル定義追加

```typescript
// apps/desktop/src/preload/channels.ts

export const IPC_CHANNELS = {
  // ... 既存チャネル

  // Skill permission operations
  SKILL_PERMISSION_REQUEST: "skill:permission-request",
  SKILL_PERMISSION_RESPONSE: "skill:permission-response",
} as const;
```

### 5.2 ホワイトリスト更新

```typescript
// ALLOWED_ON_CHANNELS に追加（Main → Renderer）
export const ALLOWED_ON_CHANNELS: readonly string[] = [
  // ... 既存
  IPC_CHANNELS.SKILL_PERMISSION_REQUEST,
];

// ALLOWED_INVOKE_CHANNELS に追加（Renderer → Main）
export const ALLOWED_INVOKE_CHANNELS: readonly string[] = [
  // ... 既存
  IPC_CHANNELS.SKILL_PERMISSION_RESPONSE,
];
```

---

## 6. Window型拡張

### 6.1 global.d.ts

```typescript
// apps/desktop/src/renderer/global.d.ts

import type { SkillAPI } from "../preload/skill-api";

declare global {
  interface Window {
    skillAPI: SkillAPI;
    // ... 他の既存定義
  }
}
```

---

## 7. IPC契約サマリー

| 契約項目           | 内容                                                |
| ------------------ | --------------------------------------------------- |
| チャネル数         | 2（request, response）                              |
| データ形式         | `SkillPermissionRequest`, `SkillPermissionResponse` |
| 通信方式           | request: send（一方向）、response: invoke（双方向） |
| セキュリティ       | ホワイトリスト検証、sender検証                      |
| エラーハンドリング | IPC_VALIDATION_ERROR、ウィンドウ破棄チェック        |
| 購読解除           | クリーンアップ関数パターン                          |

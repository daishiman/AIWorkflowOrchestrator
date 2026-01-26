# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値                                        |
| ------ | ----------------------------------------- |
| Phase  | 5                                         |
| 機能名 | TASK-4-2-permission-resolver-ipc-handlers |
| 作成日 | 2026-01-25                                |

## 目的

Phase 4で作成したテストを通すための最小限の実装を行う。IPC Handler、Preload API、React Hook、UIコンポーネントを実装する。

## 実行タスク

### Task 5-1: IPC Handler実装

**ファイル**: `apps/desktop/src/main/ipc/permission-handlers.ts`

```typescript
import { ipcMain, BrowserWindow, IpcMainInvokeEvent } from "electron";
import type { PermissionResolver } from "../services/skill/PermissionResolver";
import type {
  SkillPermissionRequest,
  SkillPermissionResponse,
} from "@repo/shared";
import { validateIpcSender } from "../security/ipcSecurity";

/**
 * 権限確認関連のIPCハンドラを登録
 */
export function registerPermissionHandlers(
  mainWindow: BrowserWindow,
  permissionResolver: PermissionResolver,
): void {
  // Renderer側からのレスポンスを受信
  ipcMain.handle(
    "skill:permission-response",
    async (event: IpcMainInvokeEvent, response: SkillPermissionResponse) => {
      validateIpcSender(event, mainWindow);
      permissionResolver.resolveRequest(response);
      return { success: true };
    },
  );
}

/**
 * 権限確認リクエストをRendererに転送する関数を作成
 */
export function createPermissionRequestForwarder(
  mainWindow: BrowserWindow,
): (request: SkillPermissionRequest) => void {
  return (request: SkillPermissionRequest) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("skill:permission-request", request);
    }
  };
}

/**
 * IPCハンドラの登録解除
 */
export function unregisterPermissionHandlers(): void {
  ipcMain.removeHandler("skill:permission-response");
}
```

### Task 5-2: Preload API実装

**ファイル**: `apps/desktop/src/preload/skill-api.ts`（更新）

```typescript
import { ipcRenderer, IpcRendererEvent } from "electron";
import type {
  SkillPermissionRequest,
  SkillPermissionResponse,
} from "@repo/shared";

// 権限確認用チャンネル定数
export const PERMISSION_CHANNELS = {
  REQUEST: "skill:permission-request",
  RESPONSE: "skill:permission-response",
} as const;

// ホワイトリストに追加
export const ALLOWED_ON_CHANNELS = [
  // 既存のチャンネル...
  PERMISSION_CHANNELS.REQUEST,
];

export const ALLOWED_INVOKE_CHANNELS = [
  // 既存のチャンネル...
  PERMISSION_CHANNELS.RESPONSE,
];

export const skillPermissionAPI = {
  /**
   * 権限確認リクエストを購読
   * @param callback リクエスト受信時のコールバック
   * @returns 購読解除関数
   */
  onPermissionRequest: (
    callback: (request: SkillPermissionRequest) => void,
  ): (() => void) => {
    const handler = (
      _event: IpcRendererEvent,
      request: SkillPermissionRequest,
    ) => {
      callback(request);
    };
    ipcRenderer.on(PERMISSION_CHANNELS.REQUEST, handler);
    return () => {
      ipcRenderer.removeListener(PERMISSION_CHANNELS.REQUEST, handler);
    };
  },

  /**
   * 権限確認応答を送信
   * @param response 権限確認応答
   * @returns 成功/失敗
   */
  sendPermissionResponse: async (
    response: SkillPermissionResponse,
  ): Promise<{ success: boolean }> => {
    return ipcRenderer.invoke(PERMISSION_CHANNELS.RESPONSE, response);
  },
};
```

### Task 5-3: 型定義の追加（必要に応じて）

**ファイル**: `apps/desktop/src/preload/types.ts`（更新）

```typescript
import type {
  SkillPermissionRequest,
  SkillPermissionResponse,
} from "@repo/shared";

export interface SkillPermissionAPI {
  onPermissionRequest: (
    callback: (request: SkillPermissionRequest) => void,
  ) => () => void;
  sendPermissionResponse: (
    response: SkillPermissionResponse,
  ) => Promise<{ success: boolean }>;
}

// Window型拡張
declare global {
  interface Window {
    skillPermissionAPI: SkillPermissionAPI;
  }
}
```

### Task 5-4: usePermissionDialog Hook実装

**ファイル**: `apps/desktop/src/renderer/hooks/usePermissionDialog.ts`

```typescript
import { useState, useEffect, useCallback } from "react";
import type {
  SkillPermissionRequest,
  SkillPermissionResponse,
} from "@repo/shared";

interface UsePermissionDialogReturn {
  /** 待機中のリクエスト */
  pendingRequest: SkillPermissionRequest | null;
  /** ダイアログが開いているか */
  isOpen: boolean;
  /** 応答を送信 */
  respond: (approved: boolean, rememberChoice?: boolean) => Promise<void>;
  /** ダイアログを閉じる（拒否扱い） */
  close: () => Promise<void>;
}

/**
 * 権限確認ダイアログを管理するカスタムフック
 */
export function usePermissionDialog(): UsePermissionDialogReturn {
  const [pendingRequest, setPendingRequest] =
    useState<SkillPermissionRequest | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = window.skillPermissionAPI.onPermissionRequest(
      (request) => {
        setPendingRequest(request);
        setIsOpen(true);
      },
    );
    return unsubscribe;
  }, []);

  const respond = useCallback(
    async (approved: boolean, rememberChoice?: boolean): Promise<void> => {
      if (!pendingRequest) return;

      const response: SkillPermissionResponse = {
        requestId: pendingRequest.requestId,
        approved,
        rememberChoice,
      };

      await window.skillPermissionAPI.sendPermissionResponse(response);
      setIsOpen(false);
      setPendingRequest(null);
    },
    [pendingRequest],
  );

  const close = useCallback(async (): Promise<void> => {
    await respond(false);
  }, [respond]);

  return { pendingRequest, isOpen, respond, close };
}
```

### Task 5-5: PermissionDialogコンポーネント実装

**ファイル**: `apps/desktop/src/renderer/components/Permission/PermissionDialog.tsx`

```typescript
import React, { useEffect, useRef } from 'react';
import type { SkillPermissionRequest } from '@repo/shared';

interface PermissionDialogProps {
  /** 権限確認リクエスト */
  request: SkillPermissionRequest;
  /** ダイアログが開いているか */
  isOpen: boolean;
  /** 許可ボタンクリック時のコールバック */
  onAllow: () => void;
  /** 拒否ボタンクリック時のコールバック */
  onDeny: () => void;
}

/**
 * 権限確認ダイアログコンポーネント
 */
export const PermissionDialog: React.FC<PermissionDialogProps> = ({
  request,
  isOpen,
  onAllow,
  onDeny,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const allowButtonRef = useRef<HTMLButtonElement>(null);

  // Escapeキーでダイアログを閉じる
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onDeny();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onDeny]);

  // ダイアログが開いたら許可ボタンにフォーカス
  useEffect(() => {
    if (isOpen && allowButtonRef.current) {
      allowButtonRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="permission-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div className="bg-background rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        <h2
          id="permission-dialog-title"
          className="text-lg font-semibold mb-4"
        >
          権限の確認
        </h2>

        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">
            以下のツールを実行してもよろしいですか？
          </p>
          <div className="bg-muted rounded p-3">
            <p className="font-mono text-sm font-medium">{request.toolName}</p>
            {request.reason && (
              <p className="text-sm text-muted-foreground mt-2">
                {request.reason}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onDeny}
            className="px-4 py-2 rounded border border-border hover:bg-muted transition-colors"
          >
            拒否
          </button>
          <button
            ref={allowButtonRef}
            onClick={onAllow}
            className="px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            許可
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionDialog;
```

### Task 5-6: index.tsにIPC Handler登録を追加

**ファイル**: `apps/desktop/src/main/ipc/index.ts`（更新）

```typescript
import {
  registerPermissionHandlers,
  createPermissionRequestForwarder,
} from "./permission-handlers";
import type { PermissionResolver } from "../services/skill/PermissionResolver";

export function registerAllIpcHandlers(
  mainWindow: BrowserWindow,
  store: Store,
  permissionResolver: PermissionResolver,
): void {
  // 既存のハンドラ登録...

  // Permission handlers (TASK-4-2)
  registerPermissionHandlers(mainWindow, permissionResolver);
}

export { createPermissionRequestForwarder };
```

## 参照資料

| 資料名        | パス                                                                        | 説明          |
| ------------- | --------------------------------------------------------------------------- | ------------- |
| テスト仕様書  | `outputs/phase-4/test-specification.md`                                     | Phase 4成果物 |
| 設計書        | `outputs/phase-2/architecture-design.md`                                    | Phase 2成果物 |
| Agent SDK仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | 型定義参照    |

## 統合テスト連携【必須】

IPC Handler・Preload API・UIの実装と統合:

| 実装項目    | 内容                                               |
| ----------- | -------------------------------------------------- |
| IPC送信     | `webContents.send('skill:permission-request')`     |
| IPC受信     | `ipcMain.handle('skill:permission-response')`      |
| Preload購読 | `ipcRenderer.on(PERMISSION_CHANNELS.REQUEST)`      |
| Preload送信 | `ipcRenderer.invoke(PERMISSION_CHANNELS.RESPONSE)` |

## 成果物

| 成果物           | パス                                                     | 説明            |
| ---------------- | -------------------------------------------------------- | --------------- |
| IPC Handler      | `apps/desktop/src/main/ipc/permission-handlers.ts`       | IPCハンドラ     |
| Preload API      | `apps/desktop/src/preload/skill-api.ts`                  | Preload API拡張 |
| React Hook       | `apps/desktop/src/renderer/hooks/usePermissionDialog.ts` | カスタムフック  |
| UIコンポーネント | `apps/desktop/src/renderer/components/Permission/`       | ダイアログ      |

## 完了条件

- [ ] IPC Handlerが実装されている
- [ ] Preload APIが実装されている
- [ ] usePermissionDialog Hookが実装されている
- [ ] PermissionDialogコンポーネントが実装されている
- [ ] すべてのテストが成功状態（Green）
- [ ] 実装が最小限に抑えられている
- [ ] IPC Handler登録がindex.tsに追加されている
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
```

## 次のPhase

Phase 6: テスト拡充

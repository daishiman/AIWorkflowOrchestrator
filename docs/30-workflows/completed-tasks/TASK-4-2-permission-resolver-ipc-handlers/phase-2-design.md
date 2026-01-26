# Phase 2: 設計

## メタ情報

| 項目   | 値                                        |
| ------ | ----------------------------------------- |
| Phase  | 2                                         |
| 機能名 | TASK-4-2-permission-resolver-ipc-handlers |
| 作成日 | 2026-01-25                                |

## 目的

要件を実現可能な構造に落とし込み、IPC Handler・Preload API・UI連携の設計を行う。

## 実行タスク

### Task 2-1: アーキテクチャ設計

**システム構成:**

```
Main Process (Electron)
├── PermissionResolver (既存: TASK-3-2で実装済み)
│   ├── waitForResponse(requestId, signal?)
│   ├── resolveRequest(response)
│   ├── cancelRequest(requestId, reason?)
│   └── cancelAll()
│
├── IPC Handlers (新規: permission-handlers.ts)
│   ├── registerPermissionHandlers()
│   └── setupPermissionRequestForwarder()
│
└── SkillExecutor (既存: TASK-3-1で実装済み)
    └── sendPermissionRequest() → IPC経由でRenderer送信

Preload Script
└── skillAPI (更新)
    ├── onPermissionRequest(callback)    # 新規
    └── sendPermissionResponse(response) # 新規

Renderer Process
├── usePermissionDialog Hook (新規)
│   ├── pendingRequest state
│   ├── isOpen state
│   └── respond(decision)
│
└── PermissionDialog Component (新規)
    ├── ToolInfo display
    ├── AllowButton
    └── DenyButton
```

**データフロー:**

```
1. SkillExecutor: ツール使用許可が必要
   ↓
2. SkillExecutor: PermissionResolver.waitForResponse(requestId) を呼び出し
   ↓
3. IPC Handler: window.webContents.send('skill:permission-request', request)
   ↓
4. Preload: skillAPI.onPermissionRequest callback発火
   ↓
5. usePermissionDialog: setPendingRequest(request), setIsOpen(true)
   ↓
6. PermissionDialog: ユーザーに表示
   ↓
7. ユーザー: 許可/拒否を選択
   ↓
8. usePermissionDialog: respond(decision)
   ↓
9. Preload: skillAPI.sendPermissionResponse(response)
   ↓
10. IPC Handler: ipcMain.handle('skill:permission-response')
    ↓
11. PermissionResolver: resolveRequest(response)
    ↓
12. SkillExecutor: waitForResponse() のPromiseが解決 → 処理続行/中止
```

### Task 2-2: IPC Handler設計

**permission-handlers.ts:**

```typescript
// apps/desktop/src/main/ipc/permission-handlers.ts
import { ipcMain, BrowserWindow } from "electron";
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
    async (event, response: SkillPermissionResponse) => {
      validateIpcSender(event, mainWindow);
      permissionResolver.resolveRequest(response);
      return { success: true };
    },
  );
}

/**
 * PermissionResolverのコールバックでRendererへリクエストを転送
 */
export function setupPermissionRequestForwarder(
  mainWindow: BrowserWindow,
  onRequest: (handler: (request: SkillPermissionRequest) => void) => void,
): void {
  onRequest((request: SkillPermissionRequest) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("skill:permission-request", request);
    }
  });
}
```

### Task 2-3: Preload API設計

**skillAPI拡張:**

```typescript
// apps/desktop/src/preload/skill-api.ts (更新)
import { ipcRenderer, IpcRendererEvent } from "electron";
import type {
  SkillPermissionRequest,
  SkillPermissionResponse,
} from "@repo/shared";

// ホワイトリストに追加
const PERMISSION_CHANNELS = {
  REQUEST: "skill:permission-request",
  RESPONSE: "skill:permission-response",
} as const;

export const skillAPI = {
  // 既存のAPI...

  /**
   * 権限確認リクエストを購読
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
    return () =>
      ipcRenderer.removeListener(PERMISSION_CHANNELS.REQUEST, handler);
  },

  /**
   * 権限確認応答を送信
   */
  sendPermissionResponse: (
    response: SkillPermissionResponse,
  ): Promise<{ success: boolean }> =>
    ipcRenderer.invoke(PERMISSION_CHANNELS.RESPONSE, response),
};
```

### Task 2-4: React Hook設計

**usePermissionDialog:**

```typescript
// apps/desktop/src/renderer/hooks/usePermissionDialog.ts
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

export function usePermissionDialog(): UsePermissionDialogReturn {
  const [pendingRequest, setPendingRequest] =
    useState<SkillPermissionRequest | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = window.skillAPI.onPermissionRequest((request) => {
      setPendingRequest(request);
      setIsOpen(true);
    });
    return unsubscribe;
  }, []);

  const respond = useCallback(
    async (approved: boolean, rememberChoice?: boolean) => {
      if (!pendingRequest) return;

      const response: SkillPermissionResponse = {
        requestId: pendingRequest.requestId,
        approved,
        rememberChoice,
      };

      await window.skillAPI.sendPermissionResponse(response);
      setIsOpen(false);
      setPendingRequest(null);
    },
    [pendingRequest],
  );

  const close = useCallback(async () => {
    await respond(false);
  }, [respond]);

  return { pendingRequest, isOpen, respond, close };
}
```

### Task 2-5: UIコンポーネント設計

**PermissionDialog:**

```typescript
// apps/desktop/src/renderer/components/Permission/PermissionDialog.tsx
import React from 'react';
import type { SkillPermissionRequest } from '@repo/shared';

interface PermissionDialogProps {
  request: SkillPermissionRequest;
  isOpen: boolean;
  onAllow: () => void;
  onDeny: () => void;
}

export const PermissionDialog: React.FC<PermissionDialogProps> = ({
  request,
  isOpen,
  onAllow,
  onDeny,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="permission-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div className="bg-background rounded-lg shadow-lg p-6 max-w-md w-full">
        <h2 id="permission-dialog-title" className="text-lg font-semibold mb-4">
          権限の確認
        </h2>

        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">
            以下のツールを実行してもよろしいですか？
          </p>
          <div className="bg-muted rounded p-3">
            <p className="font-mono text-sm font-medium">{request.toolName}</p>
            {request.reason && (
              <p className="text-sm text-muted-foreground mt-2">{request.reason}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onDeny}
            className="px-4 py-2 rounded border hover:bg-muted"
          >
            拒否
          </button>
          <button
            onClick={onAllow}
            className="px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90"
          >
            許可
          </button>
        </div>
      </div>
    </div>
  );
};
```

## 参照資料

| 資料名         | パス                                                                         | 説明          |
| -------------- | ---------------------------------------------------------------------------- | ------------- |
| 要件定義書     | `outputs/phase-1/requirements-definition.md`                                 | Phase 1成果物 |
| 受け入れ基準   | `outputs/phase-1/acceptance-criteria.md`                                     | Phase 1成果物 |
| Agent SDK仕様  | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`  | 型定義参照    |
| アーキテクチャ | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | IPCパターン   |

## 統合テスト連携【必須】

IPC契約（Main↔Renderer）を設計に反映する:

| 統合ポイント    | 契約定義                                               |
| --------------- | ------------------------------------------------------ |
| Main → Renderer | `webContents.send('skill:permission-request', req)`    |
| Renderer → Main | `ipcRenderer.invoke('skill:permission-response', res)` |
| セキュリティ    | `validateIpcSender`による送信元検証                    |
| ホワイトリスト  | `ALLOWED_ON_CHANNELS`, `ALLOWED_INVOKE_CHANNELS`       |

## 成果物

| 成果物           | パス                                     | 説明             |
| ---------------- | ---------------------------------------- | ---------------- |
| アーキテクチャ   | `outputs/phase-2/architecture-design.md` | システム構造     |
| インターフェース | `outputs/phase-2/interface-design.md`    | API設計          |
| コンポーネント   | `outputs/phase-2/component-design.md`    | UIコンポーネント |

## 完了条件

- [ ] アーキテクチャが定義されている（データフロー図含む）
- [ ] IPC Handler設計が完了している
- [ ] Preload API設計が完了している
- [ ] React Hook設計が完了している
- [ ] UIコンポーネント設計が完了している
- [ ] 要件との整合性が確認されている
- [ ] IPC契約が設計に反映されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 3: 設計レビューゲート

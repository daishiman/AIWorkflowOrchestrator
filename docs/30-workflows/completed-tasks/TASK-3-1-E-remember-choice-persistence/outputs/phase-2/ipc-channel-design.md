# IPCチャネル設計

## メタ情報

| 項目     | 内容                                   |
| -------- | -------------------------------------- |
| タスクID | TASK-3-1-E                             |
| Phase    | 2                                      |
| 作成日   | 2026-01-25                             |
| 機能名   | task-3-1-e-remember-choice-persistence |

---

## 概要

Renderer-Main間の権限設定管理用IPCチャネルを定義します。設定画面から許可済みツールの一覧取得・削除・全クリアを行うためのチャネルです。

---

## チャネル一覧

| チャネル名                   | 方向            | 用途                   |
| ---------------------------- | --------------- | ---------------------- |
| `permission:getAllowedTools` | Renderer → Main | 許可済みツール一覧取得 |
| `permission:revokeTool`      | Renderer → Main | ツール許可取り消し     |
| `permission:clearAll`        | Renderer → Main | 全許可設定クリア       |

---

## チャネル定義

### PERMISSION_CHANNELS 定数

```typescript
// packages/shared/src/ipc/channels.ts

export const PERMISSION_CHANNELS = {
  /** 許可済みツール一覧取得 */
  GET_ALLOWED_TOOLS: "permission:getAllowedTools",

  /** ツール許可取り消し */
  REVOKE_TOOL: "permission:revokeTool",

  /** 全許可設定クリア */
  CLEAR_ALL: "permission:clearAll",
} as const;

export type PermissionChannel =
  (typeof PERMISSION_CHANNELS)[keyof typeof PERMISSION_CHANNELS];
```

---

## チャネル詳細

### permission:getAllowedTools

許可済みツールの詳細情報一覧を取得します。

#### リクエスト

```typescript
// Renderer → Main
ipcRenderer.invoke(PERMISSION_CHANNELS.GET_ALLOWED_TOOLS);
```

#### レスポンス

```typescript
// Main → Renderer
interface GetAllowedToolsResponse {
  tools: AllowedToolEntry[];
}

interface AllowedToolEntry {
  toolName: string;
  allowedAt: string; // ISO8601
}
```

#### 使用例

```typescript
// Renderer側
const response = await window.electron.invoke(
  PERMISSION_CHANNELS.GET_ALLOWED_TOOLS,
);
console.log(response.tools);
// => [{ toolName: "Read", allowedAt: "2026-01-25T12:00:00.000Z" }, ...]
```

---

### permission:revokeTool

指定したツールの許可を取り消します。

#### リクエスト

```typescript
// Renderer → Main
interface RevokeToolRequest {
  toolName: string;
}

ipcRenderer.invoke(PERMISSION_CHANNELS.REVOKE_TOOL, { toolName: "Bash" });
```

#### レスポンス

```typescript
// Main → Renderer
interface RevokeToolResponse {
  success: boolean;
}
```

#### 使用例

```typescript
// Renderer側
const response = await window.electron.invoke(PERMISSION_CHANNELS.REVOKE_TOOL, {
  toolName: "Bash",
});
if (response.success) {
  console.log("Tool permission revoked");
}
```

---

### permission:clearAll

全ての許可設定をクリアします。

#### リクエスト

```typescript
// Renderer → Main
ipcRenderer.invoke(PERMISSION_CHANNELS.CLEAR_ALL);
```

#### レスポンス

```typescript
// Main → Renderer
interface ClearAllResponse {
  success: boolean;
  clearedCount: number;
}
```

#### 使用例

```typescript
// Renderer側
const response = await window.electron.invoke(PERMISSION_CHANNELS.CLEAR_ALL);
console.log(`Cleared ${response.clearedCount} tools`);
```

---

## Main Process ハンドラー実装

### permission-handlers.ts

```typescript
// apps/desktop/src/main/ipc/permission-handlers.ts

import { ipcMain } from "electron";
import { PERMISSION_CHANNELS } from "@repo/shared/src/ipc/channels";
import type { IPermissionStore } from "@repo/shared";

/**
 * Permission関連のIPCハンドラーを登録
 */
export function registerPermissionHandlers(
  permissionStore: IPermissionStore,
): void {
  // 許可済みツール一覧取得
  ipcMain.handle(PERMISSION_CHANNELS.GET_ALLOWED_TOOLS, () => {
    return {
      tools: permissionStore.getAllowedToolEntries(),
    };
  });

  // ツール許可取り消し
  ipcMain.handle(
    PERMISSION_CHANNELS.REVOKE_TOOL,
    (_event, request: { toolName: string }) => {
      permissionStore.revokeTool(request.toolName);
      return { success: true };
    },
  );

  // 全許可設定クリア
  ipcMain.handle(PERMISSION_CHANNELS.CLEAR_ALL, () => {
    const count = permissionStore.getAllowedTools().length;
    permissionStore.clearAll();
    return { success: true, clearedCount: count };
  });
}
```

---

## Renderer Process API

### preload.ts への追加

```typescript
// apps/desktop/src/preload/preload.ts

import { contextBridge, ipcRenderer } from "electron";
import { PERMISSION_CHANNELS } from "@repo/shared/src/ipc/channels";

const permissionAPI = {
  getAllowedTools: () =>
    ipcRenderer.invoke(PERMISSION_CHANNELS.GET_ALLOWED_TOOLS),

  revokeTool: (toolName: string) =>
    ipcRenderer.invoke(PERMISSION_CHANNELS.REVOKE_TOOL, { toolName }),

  clearAllPermissions: () => ipcRenderer.invoke(PERMISSION_CHANNELS.CLEAR_ALL),
};

contextBridge.exposeInMainWorld("electronPermission", permissionAPI);
```

### 型定義

```typescript
// apps/desktop/src/renderer/types/electron.d.ts

interface AllowedToolEntry {
  toolName: string;
  allowedAt: string;
}

interface ElectronPermissionAPI {
  getAllowedTools: () => Promise<{ tools: AllowedToolEntry[] }>;
  revokeTool: (toolName: string) => Promise<{ success: boolean }>;
  clearAllPermissions: () => Promise<{
    success: boolean;
    clearedCount: number;
  }>;
}

declare global {
  interface Window {
    electronPermission: ElectronPermissionAPI;
  }
}
```

---

## エラーハンドリング

### Main Process

```typescript
ipcMain.handle(PERMISSION_CHANNELS.GET_ALLOWED_TOOLS, () => {
  try {
    return {
      tools: permissionStore.getAllowedToolEntries(),
    };
  } catch (error) {
    console.error("[PermissionHandler] Failed to get allowed tools:", error);
    return { tools: [] };
  }
});
```

### Renderer Process

```typescript
// hooks/usePermissionSettings.ts
const fetchAllowedTools = async () => {
  try {
    const response = await window.electronPermission.getAllowedTools();
    setTools(response.tools);
  } catch (error) {
    console.error("Failed to fetch allowed tools:", error);
    setError("許可済みツールの取得に失敗しました");
  }
};
```

---

## 既存IPCパターンとの整合性

### 命名規則

既存パターンに従い、`[domain]:[action]` 形式を採用:

| 既存チャネル例             | 新規チャネル                 |
| -------------------------- | ---------------------------- |
| `skill:execute`            | `permission:getAllowedTools` |
| `skill:stream`             | `permission:revokeTool`      |
| `skill:permission-request` | `permission:clearAll`        |

### ハンドラー登録パターン

既存の `registerSkillHandlers` パターンに従い、`registerPermissionHandlers` を追加:

```typescript
// apps/desktop/src/main/index.ts

import { registerSkillHandlers } from "./ipc/skill-handlers";
import { registerPermissionHandlers } from "./ipc/permission-handlers";

// アプリ初期化時
const permissionStore = new PermissionStore();
const skillExecutor = new SkillExecutor(mainWindow, permissionStore);

registerSkillHandlers(skillExecutor);
registerPermissionHandlers(permissionStore);
```

---

## 関連ドキュメント

- [PermissionStore設計](./permission-store-design.md)
- [設定UI設計](./permission-settings-ui-design.md)
- [Phase 1: インターフェース定義](../phase-1/interface-definition.md)

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-25 | 初版作成 |

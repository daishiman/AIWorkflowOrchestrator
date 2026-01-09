# API仕様書（IPC通信仕様） - スライド依存関係管理システム

## 1. ドキュメント情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | task-feat-slide-dependency-management-003 |
| バージョン | 1.0.0                                     |
| 作成日     | 2026-01-09                                |
| 作成者     | Claude (dependency-analysis skill)        |

---

## 2. IPC通信概要

### 2.1 通信方式

| 方式    | 用途                    | 方向            |
| ------- | ----------------------- | --------------- |
| invoke  | リクエスト/レスポンス型 | Renderer → Main |
| on/send | イベント通知型          | Main → Renderer |

### 2.2 チャネル命名規則

| パターン              | 用途           | 例                        |
| --------------------- | -------------- | ------------------------- |
| `slide:{action}`      | アクション実行 | `slide:executePhase`      |
| `slide:{noun}Changed` | 状態変更通知   | `slide:syncStatusChanged` |

---

## 3. IPC Handlers（Renderer → Main）

### 3.1 slide:executePhase

スキルフェーズを実行する。

#### リクエスト

```typescript
interface ExecutePhaseRequest {
  phase: SkillPhase;
  projectPath: string;
}

type SkillPhase = "hearing" | "structure" | "html" | "modifier";
```

#### レスポンス

```typescript
interface ExecutePhaseResponse {
  success: boolean;
  result?: SkillExecutionResult;
  error?: SlideError;
}

interface SkillExecutionResult {
  phase: SkillPhase;
  success: boolean;
  output?: string;
  error?: string;
  duration: number;
  timestamp: string; // ISO 8601
}
```

#### バリデーション

| パラメータ  | 必須 | 型         | 検証ルール                                 |
| ----------- | ---- | ---------- | ------------------------------------------ |
| phase       | ○    | SkillPhase | hearing/structure/html/modifier のいずれか |
| projectPath | ○    | string     | 空文字不可、存在するディレクトリ           |

#### エラーコード

| コード     | 条件                     | メッセージ                 |
| ---------- | ------------------------ | -------------------------- |
| SLIDE_E001 | パラメータ不正           | Invalid parameters         |
| SLIDE_E002 | プロジェクトが存在しない | Project not found          |
| SLIDE_E003 | 他のスキル実行中         | Another skill is executing |
| SLIDE_E004 | スキル実行エラー         | Skill execution failed     |

#### 使用例

```typescript
// Renderer側
const result = await window.slideApi.executePhase("html", "/path/to/project");
if (result.success) {
  console.log("Completed:", result.result);
} else {
  console.error("Error:", result.error);
}
```

---

### 3.2 slide:startWatching

ファイルウォッチャーを起動する。

#### リクエスト

```typescript
interface StartWatchingRequest {
  projectPath: string;
}
```

#### レスポンス

```typescript
interface StartWatchingResponse {
  success: boolean;
  error?: SlideError;
}
```

#### バリデーション

| パラメータ  | 必須 | 型     | 検証ルール                     |
| ----------- | ---- | ------ | ------------------------------ |
| projectPath | ○    | string | 空文字不可、structure.mdが存在 |

#### エラーコード

| コード     | 条件                     | メッセージ             |
| ---------- | ------------------------ | ---------------------- |
| SLIDE_E001 | パラメータ不正           | Invalid parameters     |
| SLIDE_E002 | structure.mdが存在しない | structure.md not found |
| SLIDE_E005 | 既に監視中               | Already watching       |

---

### 3.3 slide:stopWatching

ファイルウォッチャーを停止する。

#### リクエスト

なし（パラメータ不要）

#### レスポンス

```typescript
interface StopWatchingResponse {
  success: boolean;
  error?: SlideError;
}
```

#### エラーコード

| コード     | 条件         | メッセージ   |
| ---------- | ------------ | ------------ |
| SLIDE_E006 | 監視中でない | Not watching |

---

### 3.4 slide:getSyncStatus

同期状態を取得する。

#### リクエスト

```typescript
interface GetSyncStatusRequest {
  projectPath: string;
}
```

#### レスポンス

```typescript
interface GetSyncStatusResponse {
  status: SyncStatus;
  lastSyncAt: string | null; // ISO 8601
}

type SyncStatus = "synced" | "out-of-sync" | "syncing" | "error";
```

#### バリデーション

| パラメータ  | 必須 | 型     | 検証ルール |
| ----------- | ---- | ------ | ---------- |
| projectPath | ○    | string | 空文字不可 |

---

### 3.5 slide:manualSync

手動同期を実行する。

#### リクエスト

```typescript
interface ManualSyncRequest {
  projectPath: string;
}
```

#### レスポンス

```typescript
interface ManualSyncResponse {
  success: boolean;
  result?: SkillExecutionResult;
  error?: SlideError;
}
```

#### バリデーション

| パラメータ  | 必須 | 型     | 検証ルール                   |
| ----------- | ---- | ------ | ---------------------------- |
| projectPath | ○    | string | 空文字不可、監視中であること |

---

### 3.6 slide:cancelExecution

実行中のスキルをキャンセルする。

#### リクエスト

なし（パラメータ不要）

#### レスポンス

```typescript
interface CancelExecutionResponse {
  success: boolean;
  error?: SlideError;
}
```

#### エラーコード

| コード     | 条件                 | メッセージ            |
| ---------- | -------------------- | --------------------- |
| SLIDE_E007 | 実行中のスキルがない | No skill is executing |

---

## 4. IPC Events（Main → Renderer）

### 4.1 slide:structureChanged

structure.mdファイルの変更を通知する。

#### イベントペイロード

```typescript
interface StructureChangedEvent {
  path: string;
  timestamp: number;
  changeType: "change" | "add" | "unlink";
}
```

#### 発火条件

- structure.mdファイルが変更された
- 変更元が「user」である（スキルによる変更は除外）

---

### 4.2 slide:syncStatusChanged

同期状態の変更を通知する。

#### イベントペイロード

```typescript
interface SyncStatusChangedEvent {
  status: SyncStatus;
  previousStatus: SyncStatus;
  timestamp: number;
}
```

#### 発火条件

- 同期状態が変更された
- synced → out-of-sync、syncing → synced など

---

### 4.3 slide:executionProgress

スキル実行の進捗を通知する。

#### イベントペイロード

```typescript
interface ExecutionProgressEvent {
  phase: SkillPhase;
  progress: number; // 0-100
  message?: string;
}
```

#### 発火条件

- スキル実行中に進捗が更新された

---

### 4.4 slide:executionComplete

スキル実行の完了を通知する。

#### イベントペイロード

```typescript
interface ExecutionCompleteEvent {
  result: SkillExecutionResult;
}
```

#### 発火条件

- スキル実行が正常に完了した

---

### 4.5 slide:executionError

スキル実行のエラーを通知する。

#### イベントペイロード

```typescript
interface ExecutionErrorEvent {
  error: SlideError;
  phase: SkillPhase;
  recoverable: boolean;
}

interface SlideError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
```

#### 発火条件

- スキル実行中にエラーが発生した

---

## 5. Preload API定義

### 5.1 slideApi

```typescript
// apps/desktop/src/preload/slide-api.ts

import { contextBridge, ipcRenderer } from "electron";
import type {
  SkillPhase,
  SyncStatus,
  SkillExecutionResult,
} from "@repo/shared/slide";

export interface SlideApi {
  // Actions
  executePhase: (
    phase: SkillPhase,
    projectPath: string,
  ) => Promise<{
    success: boolean;
    result?: SkillExecutionResult;
    error?: any;
  }>;

  startWatching: (
    projectPath: string,
  ) => Promise<{ success: boolean; error?: any }>;

  stopWatching: () => Promise<{ success: boolean; error?: any }>;

  getSyncStatus: (
    projectPath: string,
  ) => Promise<{ status: SyncStatus; lastSyncAt: string | null }>;

  manualSync: (projectPath: string) => Promise<{
    success: boolean;
    result?: SkillExecutionResult;
    error?: any;
  }>;

  cancelExecution: () => Promise<{ success: boolean; error?: any }>;

  // Event Listeners
  onStructureChange: (
    callback: (event: { path: string; timestamp: number }) => void,
  ) => () => void;

  onSyncStatusChange: (callback: (status: SyncStatus) => void) => () => void;

  onExecutionProgress: (
    callback: (progress: number, phase: SkillPhase) => void,
  ) => () => void;

  onExecutionComplete: (
    callback: (result: SkillExecutionResult) => void,
  ) => () => void;

  onExecutionError: (
    callback: (error: { code: string; message: string }) => void,
  ) => () => void;
}

contextBridge.exposeInMainWorld("slideApi", {
  // Actions
  executePhase: (phase: SkillPhase, projectPath: string) =>
    ipcRenderer.invoke("slide:executePhase", { phase, projectPath }),

  startWatching: (projectPath: string) =>
    ipcRenderer.invoke("slide:startWatching", { projectPath }),

  stopWatching: () => ipcRenderer.invoke("slide:stopWatching"),

  getSyncStatus: (projectPath: string) =>
    ipcRenderer.invoke("slide:getSyncStatus", { projectPath }),

  manualSync: (projectPath: string) =>
    ipcRenderer.invoke("slide:manualSync", { projectPath }),

  cancelExecution: () => ipcRenderer.invoke("slide:cancelExecution"),

  // Event Listeners
  onStructureChange: (callback) => {
    const handler = (_: any, event: any) => callback(event);
    ipcRenderer.on("slide:structureChanged", handler);
    return () => ipcRenderer.removeListener("slide:structureChanged", handler);
  },

  onSyncStatusChange: (callback) => {
    const handler = (_: any, status: SyncStatus) => callback(status);
    ipcRenderer.on("slide:syncStatusChanged", handler);
    return () => ipcRenderer.removeListener("slide:syncStatusChanged", handler);
  },

  onExecutionProgress: (callback) => {
    const handler = (_: any, { progress, phase }: any) =>
      callback(progress, phase);
    ipcRenderer.on("slide:executionProgress", handler);
    return () => ipcRenderer.removeListener("slide:executionProgress", handler);
  },

  onExecutionComplete: (callback) => {
    const handler = (_: any, result: SkillExecutionResult) => callback(result);
    ipcRenderer.on("slide:executionComplete", handler);
    return () => ipcRenderer.removeListener("slide:executionComplete", handler);
  },

  onExecutionError: (callback) => {
    const handler = (_: any, error: any) => callback(error);
    ipcRenderer.on("slide:executionError", handler);
    return () => ipcRenderer.removeListener("slide:executionError", handler);
  },
} as SlideApi);
```

### 5.2 型定義（Window拡張）

```typescript
// apps/desktop/src/types/global.d.ts

import type { SlideApi } from "../preload/slide-api";

declare global {
  interface Window {
    slideApi: SlideApi;
  }
}
```

---

## 6. Main Process Handler実装

```typescript
// apps/desktop/src/main/slide/ipc-handlers.ts

import { ipcMain, BrowserWindow } from "electron";
import { z } from "zod";
import { SlideFileWatcher } from "./file-watcher";
import { SkillExecutor } from "./skill-executor";
import { SyncManager } from "./sync-manager";

// Validation Schemas
const executePhaseSchema = z.object({
  phase: z.enum(["hearing", "structure", "html", "modifier"]),
  projectPath: z.string().min(1),
});

const projectPathSchema = z.object({
  projectPath: z.string().min(1),
});

export const registerSlideHandlers = (mainWindow: BrowserWindow) => {
  const fileWatcher = new SlideFileWatcher();
  const skillExecutor = new SkillExecutor();
  const syncManager = new SyncManager();

  // slide:executePhase
  ipcMain.handle("slide:executePhase", async (_, args) => {
    try {
      const { phase, projectPath } = executePhaseSchema.parse(args);
      const result = await skillExecutor.execute(phase, projectPath);
      return { success: true, result };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "SLIDE_E004",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  });

  // slide:startWatching
  ipcMain.handle("slide:startWatching", async (_, args) => {
    try {
      const { projectPath } = projectPathSchema.parse(args);
      fileWatcher.start(projectPath);

      // 変更イベントをRendererに転送
      fileWatcher.onStructureChange((event) => {
        mainWindow.webContents.send("slide:structureChanged", event);
        mainWindow.webContents.send("slide:syncStatusChanged", "out-of-sync");
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "SLIDE_E001",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  });

  // slide:stopWatching
  ipcMain.handle("slide:stopWatching", async () => {
    try {
      fileWatcher.stop();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "SLIDE_E006",
          message: "Failed to stop watching",
        },
      };
    }
  });

  // slide:getSyncStatus
  ipcMain.handle("slide:getSyncStatus", async (_, args) => {
    const { projectPath } = projectPathSchema.parse(args);
    const status = await syncManager.getStatus(projectPath);
    return status;
  });

  // slide:manualSync
  ipcMain.handle("slide:manualSync", async (_, args) => {
    try {
      const { projectPath } = projectPathSchema.parse(args);
      mainWindow.webContents.send("slide:syncStatusChanged", "syncing");

      fileWatcher.markAsSkillChange(`${projectPath}/index.html`, "html");
      const result = await skillExecutor.execute("html", projectPath);

      mainWindow.webContents.send("slide:syncStatusChanged", "synced");
      return { success: true, result };
    } catch (error) {
      mainWindow.webContents.send("slide:syncStatusChanged", "error");
      return {
        success: false,
        error: {
          code: "SLIDE_E004",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  });

  // slide:cancelExecution
  ipcMain.handle("slide:cancelExecution", async () => {
    try {
      skillExecutor.cancel();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "SLIDE_E007",
          message: "No skill is executing",
        },
      };
    }
  });

  // Progress events
  skillExecutor.onProgress((progress) => {
    mainWindow.webContents.send("slide:executionProgress", {
      progress,
      phase: skillExecutor.currentPhase,
    });
  });
};
```

---

## 7. エラーコード一覧

| コード     | カテゴリ   | 説明                   | HTTP相当 |
| ---------- | ---------- | ---------------------- | -------- |
| SLIDE_E001 | Validation | パラメータが不正       | 400      |
| SLIDE_E002 | NotFound   | リソースが見つからない | 404      |
| SLIDE_E003 | Conflict   | 競合状態（実行中など） | 409      |
| SLIDE_E004 | Execution  | スキル実行エラー       | 500      |
| SLIDE_E005 | Conflict   | 既に監視中             | 409      |
| SLIDE_E006 | State      | 不正な状態             | 400      |
| SLIDE_E007 | State      | 実行中のスキルがない   | 400      |
| SLIDE_E999 | Internal   | 内部エラー             | 500      |

---

## 8. 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-09 | 初版作成 |

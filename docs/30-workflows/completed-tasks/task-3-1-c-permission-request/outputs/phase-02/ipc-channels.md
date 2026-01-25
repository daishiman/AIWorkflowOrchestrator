# IPC チャネル追加仕様 - PermissionRequest Hook 統合

## メタ情報

| 項目     | 内容                        |
| -------- | --------------------------- |
| タスクID | TASK-3-1-C                  |
| Phase    | 2 - 設計                    |
| 作成日   | 2026-01-25                  |
| 機能名   | PermissionRequest Hook 統合 |

---

## 概要

スキル権限確認のための IPC チャネルを定義する。
既存の `packages/shared/src/ipc/channels.ts` に新しいチャネル定数を追加する。

---

## 追加チャネル定義

### SKILL_CHANNELS（新規追加）

```typescript
// packages/shared/src/ipc/channels.ts

/**
 * スキル関連のIPCチャネル
 */
export const SKILL_CHANNELS = {
  /** スキル一覧取得 */
  SKILL_LIST: "skill:list",

  /** スキルインポート */
  SKILL_IMPORT: "skill:import",

  /** スキル削除 */
  SKILL_REMOVE: "skill:remove",

  /** スキル実行 */
  SKILL_EXECUTE: "skill:execute",

  /** スキル実行中断 */
  SKILL_ABORT: "skill:abort",

  /** スキルストリーム（Main → Renderer） */
  SKILL_STREAM: "skill:stream",

  /** 権限リクエスト（Main → Renderer） */
  SKILL_PERMISSION_REQUEST: "skill:permission:request",

  /** 権限レスポンス（Renderer → Main） */
  SKILL_PERMISSION_RESPONSE: "skill:permission:response",
} as const;

/**
 * スキルチャネル型
 */
export type SkillChannel = (typeof SKILL_CHANNELS)[keyof typeof SKILL_CHANNELS];
```

---

## チャネル詳細

### skill:permission:request

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| チャネル名 | `skill:permission:request`             |
| 方向       | Main Process → Renderer Process        |
| 通信方式   | `webContents.send()`                   |
| 用途       | ツール実行前にユーザーへ権限確認を要求 |

**ペイロード型**:

```typescript
interface SkillPermissionRequest {
  /** スキル実行ID */
  executionId: string;

  /** 権限リクエストID（一意） */
  requestId: string;

  /** ツール名（Bash, Write, Edit 等） */
  toolName: string;

  /** サニタイズ済みツール引数 */
  args: Record<string, unknown>;

  /** 人間可読な理由文 */
  reason: string;
}
```

**送信例**:

```typescript
// Main Process
mainWindow.webContents.send(SKILL_CHANNELS.SKILL_PERMISSION_REQUEST, {
  executionId: "exec_550e8400-e29b-41d4-a716-446655440000",
  requestId: "perm_7c9e6679-7425-40de-944b-e07fc1f90ae7",
  toolName: "Bash",
  args: { command: "npm install" },
  reason: "コマンドを実行: npm install",
});
```

**Renderer での受信**:

```typescript
// Renderer Process (Preload API)
window.api.onPermissionRequest((request: SkillPermissionRequest) => {
  // 権限確認ダイアログを表示
  showPermissionDialog(request);
});
```

---

### skill:permission:response

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| チャネル名 | `skill:permission:response`                  |
| 方向       | Renderer Process → Main Process              |
| 通信方式   | `ipcRenderer.invoke()`                       |
| 用途       | ユーザーの権限確認結果を Main Process に送信 |

**ペイロード型**:

```typescript
interface SkillPermissionResponse {
  /** 対応する権限リクエストID */
  requestId: string;

  /** 承認=true, 拒否=false */
  approved: boolean;

  /** 同じツールの今後のリクエストを自動承認 */
  rememberChoice?: boolean;

  /** 拒否時の理由（任意） */
  rejectReason?: string;
}
```

**送信例**:

```typescript
// Renderer Process
await window.api.sendPermissionResponse({
  requestId: "perm_7c9e6679-7425-40de-944b-e07fc1f90ae7",
  approved: true,
  rememberChoice: false,
});
```

**Main Process での受信**:

```typescript
// Main Process (IPC Handler)
ipcMain.handle(
  SKILL_CHANNELS.SKILL_PERMISSION_RESPONSE,
  async (_event, response: SkillPermissionResponse) => {
    skillExecutor.handlePermissionResponse(
      response.requestId,
      response.approved,
      response.rememberChoice,
      response.rejectReason,
    );
    return { success: true };
  },
);
```

---

## 更新後の channels.ts

```typescript
/**
 * Electron IPC チャネル定数
 *
 * レンダラープロセスとメインプロセス間の通信チャネルを定義する。
 * 文字列リテラルの代わりに定数を使用することで、Typoによるランタイムエラーを防止する。
 */

/**
 * チャット履歴エクスポート関連のIPCチャネル
 */
export const CHAT_EXPORT_CHANNELS = {
  EXPORT_SESSION: "chat:exportSession",
  PREVIEW_EXPORT: "chat:previewExport",
} as const;

/**
 * ファイルシステム操作関連のIPCチャネル
 */
export const FILE_SYSTEM_CHANNELS = {
  SHOW_SAVE_DIALOG: "dialog:showSaveDialog",
  WRITE_FILE: "fs:writeFile",
  READ_FILE: "fs:readFile",
} as const;

/**
 * スキル関連のIPCチャネル
 */
export const SKILL_CHANNELS = {
  SKILL_LIST: "skill:list",
  SKILL_IMPORT: "skill:import",
  SKILL_REMOVE: "skill:remove",
  SKILL_EXECUTE: "skill:execute",
  SKILL_ABORT: "skill:abort",
  SKILL_STREAM: "skill:stream",
  SKILL_PERMISSION_REQUEST: "skill:permission:request",
  SKILL_PERMISSION_RESPONSE: "skill:permission:response",
} as const;

/**
 * すべてのIPCチャネル定数
 */
export const IPC_CHANNELS = {
  ...CHAT_EXPORT_CHANNELS,
  ...FILE_SYSTEM_CHANNELS,
  ...SKILL_CHANNELS,
} as const;

/**
 * IPCチャネル型（型安全性確保）
 */
export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];

/**
 * スキルチャネル型
 */
export type SkillChannel = (typeof SKILL_CHANNELS)[keyof typeof SKILL_CHANNELS];
```

---

## Preload API 拡張

### contextBridge 追加

```typescript
// apps/desktop/electron/preload/index.ts

contextBridge.exposeInMainWorld("api", {
  // ... 既存の API ...

  // 権限リクエスト受信
  onPermissionRequest: (
    callback: (request: SkillPermissionRequest) => void,
  ): (() => void) => {
    const handler = (
      _event: IpcRendererEvent,
      request: SkillPermissionRequest,
    ) => callback(request);
    ipcRenderer.on(SKILL_CHANNELS.SKILL_PERMISSION_REQUEST, handler);
    return () =>
      ipcRenderer.removeListener(
        SKILL_CHANNELS.SKILL_PERMISSION_REQUEST,
        handler,
      );
  },

  // 権限レスポンス送信
  sendPermissionResponse: (
    response: SkillPermissionResponse,
  ): Promise<{ success: boolean }> => {
    return ipcRenderer.invoke(
      SKILL_CHANNELS.SKILL_PERMISSION_RESPONSE,
      response,
    );
  },
});
```

---

## 型エクスポート

```typescript
// packages/shared/src/types/skill.ts

export interface SkillPermissionRequest {
  executionId: string;
  requestId: string;
  toolName: string;
  args: Record<string, unknown>;
  reason: string;
}

export interface SkillPermissionResponse {
  requestId: string;
  approved: boolean;
  rememberChoice?: boolean;
  rejectReason?: string;
}
```

---

## シーケンス図

```
┌──────────┐           ┌──────────┐           ┌──────────┐
│   SDK    │           │   Main   │           │ Renderer │
│  query() │           │ Process  │           │ Process  │
└────┬─────┘           └────┬─────┘           └────┬─────┘
     │                      │                      │
     │ Hook 呼び出し        │                      │
     │─────────────────────>│                      │
     │                      │                      │
     │                      │ skill:permission:    │
     │                      │ request              │
     │                      │─────────────────────>│
     │                      │                      │
     │                      │                      │ ダイアログ
     │                      │                      │ 表示
     │                      │                      │
     │                      │                      │ ユーザー
     │                      │                      │ 操作
     │                      │                      │
     │                      │ skill:permission:    │
     │                      │ response             │
     │                      │<─────────────────────│
     │                      │                      │
     │ Hook 結果            │                      │
     │<─────────────────────│                      │
     │                      │                      │
```

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-25 | 初版作成 |

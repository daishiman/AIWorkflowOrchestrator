---
id: TASK-5-1
tier: 1
title: SkillAPI 実装（Preload）
phase: 5
depends_on: [TASK-4-1, TASK-4-2]
parallel_with: []
blocks: [TASK-6-1]
status: pending
priority: high
estimated_complexity: medium
tags: [preload, renderer, api]
---

# SkillAPI 実装（Preload）

## 概要

Renderer プロセスから安全に IPC 通信を行うための Preload API を実装する。
既存の `safeInvoke` / `safeOn` パターンに準拠する。

## 入力

- TASK-4-1 で定義した IPC チャネル
- TASK-1-1 で定義した型
- 既存の Preload API パターン

## 出力

- `apps/desktop/src/preload/skillAPI.ts`
- `window.electronAPI.skill` への公開

## 実装詳細

### インターフェース定義

```typescript
// apps/desktop/src/preload/skillAPI.ts

import { ipcRenderer } from "electron";
import { SKILL_CHANNELS } from "./channels";
import type {
  SkillMetadata,
  ImportedSkill,
  SkillExecutionRequest,
  SkillExecutionResponse,
  SkillStreamMessage,
  PermissionRequest,
  PermissionResponse,
} from "@repo/shared";

export interface SkillAPI {
  /** 全スキル一覧取得（キャッシュあり） */
  list(): Promise<SkillMetadata[]>;

  /** スキル再スキャン（キャッシュ無効化） */
  rescan(): Promise<SkillMetadata[]>;

  /** スキルをインポート */
  import(skillName: string): Promise<ImportedSkill>;

  /** インポート済みスキル取得 */
  getImported(): Promise<ImportedSkill[]>;

  /** スキルを削除（アンインポート） */
  remove(skillName: string): Promise<void>;

  /** スキルを使用して実行 */
  execute(request: SkillExecutionRequest): Promise<SkillExecutionResponse>;

  /** 実行を中止 */
  abort(executionId: string): Promise<void>;

  /** 権限応答を送信 */
  respondToPermission(response: PermissionResponse): void;

  /** ストリーミングイベントリスナー */
  onStream(callback: (data: SkillStreamMessage) => void): () => void;

  /** 実行完了イベントリスナー */
  onComplete(callback: (data: { executionId: string }) => void): () => void;

  /** エラーイベントリスナー */
  onError(
    callback: (data: { executionId: string; error: string }) => void,
  ): () => void;

  /** 権限確認リクエストリスナー */
  onPermissionRequest(callback: (data: PermissionRequest) => void): () => void;
}
```

### 実装

```typescript
// 既存の safeInvoke / safeOn パターンに準拠

function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  return ipcRenderer.invoke(channel, ...args);
}

function safeOn<T>(channel: string, callback: (data: T) => void): () => void {
  const listener = (_event: Electron.IpcRendererEvent, data: T) => {
    callback(data);
  };
  ipcRenderer.on(channel, listener);
  return () => {
    ipcRenderer.removeListener(channel, listener);
  };
}

export const skillAPI: SkillAPI = {
  list: () => safeInvoke<SkillMetadata[]>(SKILL_CHANNELS.SKILL_LIST),

  rescan: () => safeInvoke<SkillMetadata[]>(SKILL_CHANNELS.SKILL_SCAN),

  import: (skillName) =>
    safeInvoke<ImportedSkill>(SKILL_CHANNELS.SKILL_IMPORT, skillName),

  getImported: () =>
    safeInvoke<ImportedSkill[]>(SKILL_CHANNELS.SKILL_GET_IMPORTED),

  remove: (skillName) =>
    safeInvoke<void>(SKILL_CHANNELS.SKILL_REMOVE, skillName),

  execute: (request) =>
    safeInvoke<SkillExecutionResponse>(SKILL_CHANNELS.SKILL_EXECUTE, request),

  abort: (executionId) =>
    safeInvoke<void>(SKILL_CHANNELS.SKILL_ABORT, executionId),

  respondToPermission: (response) => {
    ipcRenderer.send(SKILL_CHANNELS.SKILL_PERMISSION_RESPONSE, response);
  },

  onStream: (callback) =>
    safeOn<SkillStreamMessage>(SKILL_CHANNELS.SKILL_STREAM, callback),

  onComplete: (callback) =>
    safeOn<{ executionId: string }>(SKILL_CHANNELS.SKILL_COMPLETE, callback),

  onError: (callback) =>
    safeOn<{ executionId: string; error: string }>(
      SKILL_CHANNELS.SKILL_ERROR,
      callback,
    ),

  onPermissionRequest: (callback) =>
    safeOn<PermissionRequest>(
      SKILL_CHANNELS.SKILL_PERMISSION_REQUEST,
      callback,
    ),
};
```

### window.electronAPI への公開

```typescript
// apps/desktop/src/preload/index.ts に追加

import { skillAPI } from "./skillAPI";

contextBridge.exposeInMainWorld("electronAPI", {
  // 既存API...
  skill: skillAPI,
});
```

### 型定義の拡張

```typescript
// apps/desktop/src/renderer/types/electron.d.ts に追加

import type { SkillAPI } from "../../preload/skillAPI";

declare global {
  interface Window {
    electronAPI: {
      // 既存の型定義...
      skill: SkillAPI;
    };
  }
}
```

## ファイル

| 操作 | パス                                            |
| ---- | ----------------------------------------------- |
| 作成 | `apps/desktop/src/preload/skillAPI.ts`          |
| 修正 | `apps/desktop/src/preload/index.ts`             |
| 修正 | `apps/desktop/src/renderer/types/electron.d.ts` |

## 依存パッケージ

なし（既存パッケージのみ使用）

## 完了条件

- [ ] `SkillAPI` インターフェースが定義されている
- [ ] 全APIメソッドが実装されている
- [ ] `window.electronAPI.skill` に公開されている
- [ ] 型定義が `electron.d.ts` に追加されている
- [ ] `safeInvoke` / `safeOn` パターンに準拠している
- [ ] TypeScript コンパイルエラーがない
- [ ] Renderer からの呼び出しが動作する

## テスト要件

- Preload API は統合テストで検証
- 型定義の静的解析

## 参考資料

- [specification.md - 5.4 Renderer側インターフェース](../specification.md)
- 既存パターン: `apps/desktop/src/preload/index.ts`

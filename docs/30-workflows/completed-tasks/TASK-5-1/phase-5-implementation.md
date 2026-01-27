# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目     | 値                        |
| -------- | ------------------------- |
| Phase    | 5                         |
| タスクID | TASK-5-1                  |
| タスク名 | SkillAPI 実装（Preload）  |
| 機能名   | skill-import-agent-system |
| 作成日   | 2026-01-27                |

## 目的

Phase 4で作成したテストを通すための最小限の実装を行う。

## 実行タスク

- クリーンコード実装: 可読性・保守性の高いコード作成
- セキュリティ実装: safeInvoke/safeOnパターンの適用
- 型安全性確保: TypeScriptの型システム活用

## 参照資料

| 資料名       | パス                                         | 説明          |
| ------------ | -------------------------------------------- | ------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| 設計書       | `outputs/phase-2/architecture-design.md`     | Phase 2成果物 |
| テスト仕様書 | `outputs/phase-4/test-specification.md`      | Phase 4成果物 |
| 既存Preload  | `apps/desktop/src/preload/index.ts`          | 既存パターン  |

---

## 実装手順

### Step 1: skill-api.ts の作成

**ファイル**: `apps/desktop/src/preload/skill-api.ts`

**実装内容**:

```typescript
/**
 * Skill API - Preload から Renderer に公開する skillAPI
 *
 * TASK-5-1: SkillAPI 実装（Preload）
 *
 * @module @repo/desktop/preload/skill-api
 */

import { ipcRenderer, IpcRendererEvent } from "electron";
import {
  IPC_CHANNELS,
  ALLOWED_ON_CHANNELS,
  ALLOWED_INVOKE_CHANNELS,
} from "./channels";
import type {
  SkillStreamMessage,
  SkillExecutionRequest,
  SkillExecutionResponse,
  ExecutionInfo,
} from "@repo/shared/types/skill-execution";
import type {
  SkillPermissionRequest,
  SkillPermissionResponse,
} from "@repo/shared";

/**
 * SkillAPI - Skill 実行関連の Preload API インターフェース
 */
export interface SkillAPI {
  execute: (request: SkillExecutionRequest) => Promise<SkillExecutionResponse>;
  abort: (executionId: string) => Promise<boolean>;
  getExecutionStatus: (executionId: string) => Promise<ExecutionInfo | null>;
  onStream: (callback: (message: SkillStreamMessage) => void) => () => void;
  onPermissionRequest: (
    callback: (request: SkillPermissionRequest) => void,
  ) => () => void;
  sendPermissionResponse: (
    response: SkillPermissionResponse,
  ) => Promise<{ success: boolean }>;
}

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
 * skillAPI - Skill 実行関連の Preload API 実装
 */
export const skillAPI: SkillAPI = {
  execute: (request: SkillExecutionRequest): Promise<SkillExecutionResponse> =>
    safeInvoke(IPC_CHANNELS.SKILL_EXECUTE, request),

  abort: (executionId: string): Promise<boolean> =>
    safeInvoke(IPC_CHANNELS.SKILL_ABORT, executionId),

  getExecutionStatus: (executionId: string): Promise<ExecutionInfo | null> =>
    safeInvoke(IPC_CHANNELS.SKILL_GET_STATUS, executionId),

  onStream: (callback: (message: SkillStreamMessage) => void): (() => void) =>
    safeOn<SkillStreamMessage>(IPC_CHANNELS.SKILL_STREAM, callback),

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

### Step 2: index.ts への公開追加

**ファイル**: `apps/desktop/src/preload/index.ts`

**追加内容**:

```typescript
import { skillAPI, type SkillAPI } from "./skill-api";

// contextBridge.exposeInMainWorld 内に追加
contextBridge.exposeInMainWorld("skillAPI", skillAPI);

// Fallback 内にも追加
(window as unknown as { skillAPI: SkillAPI }).skillAPI = skillAPI;
```

### Step 3: 型定義の追加（必要な場合）

**ファイル**: `apps/desktop/src/renderer/types/electron.d.ts`

**追加内容**:

```typescript
import type { SkillAPI } from "../../preload/skill-api";

declare global {
  interface Window {
    skillAPI: SkillAPI;
  }
}
```

---

## アーキテクチャ層別実装

| 層       | 実装観点                               | 実装ファイル                                    | 仕様参照先                |
| -------- | -------------------------------------- | ----------------------------------------------- | ------------------------- |
| Preload  | SkillAPI実装、safeInvoke/safeOn        | `apps/desktop/src/preload/skill-api.ts`         | `arch-ipc-persistence.md` |
| IPC通信  | チャネル定義への追加（TASK-4-1で完了） | `apps/desktop/src/preload/channels.ts`          | `interfaces-*.md`         |
| Renderer | 型定義の追加                           | `apps/desktop/src/renderer/types/electron.d.ts` | -                         |

---

## 統合テスト連携

### 実装項目

| 実装項目           | 内容                                            |
| ------------------ | ----------------------------------------------- |
| IPC接続            | `safeInvoke` / `safeOn` を使用した安全なIPC通信 |
| エラーハンドリング | 不正チャネルアクセス時のエラー返却              |
| 型安全             | TypeScript の型定義による安全性確保             |

### データフロー確認

```
[Renderer]                    [Preload]                    [Main]
    │                             │                           │
    │ window.skillAPI.execute()   │                           │
    │────────────────────────────>│                           │
    │                             │ safeInvoke                │
    │                             │──────────────────────────>│
    │                             │                           │
    │                             │<──────────────────────────│
    │<────────────────────────────│                           │
    │                             │                           │
```

---

## チェックリスト

### 実装完了確認

- [ ] `skill-api.ts` が作成されている
- [ ] `SkillAPI` インターフェースが定義されている
- [ ] 全APIメソッドが実装されている
- [ ] `safeInvoke` パターンが適用されている
- [ ] `safeOn` パターンが適用されている
- [ ] `index.ts` で `skillAPI` が公開されている
- [ ] 型定義が追加されている（必要な場合）

### 品質確認

- [ ] TypeScript コンパイルエラーがない
- [ ] 既存のPreload APIパターンに準拠している
- [ ] コード内にコメント・ドキュメントがある

---

## 成果物

| 成果物       | パス                                    | 説明            |
| ------------ | --------------------------------------- | --------------- |
| SkillAPI実装 | `apps/desktop/src/preload/skill-api.ts` | Preload API実装 |
| index.ts更新 | `apps/desktop/src/preload/index.ts`     | 公開設定        |

---

## 完了条件

- [ ] すべてのテストが成功状態（Green）
- [ ] 実装が最小限に抑えられている
- [ ] `safeInvoke` / `safeOn` パターンが適用されている
- [ ] `window.skillAPI` として公開されている
- [ ] TypeScript コンパイルエラーがない
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- skill-api

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
```

---

## 次のPhase

Phase 6: テスト拡充

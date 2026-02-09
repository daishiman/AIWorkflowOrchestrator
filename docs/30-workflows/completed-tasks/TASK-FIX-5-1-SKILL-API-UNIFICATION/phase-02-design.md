# Phase 2: 設計

## メタ情報

| 項目     | 値                                 |
| -------- | ---------------------------------- |
| Phase    | 2                                  |
| タスクID | TASK-FIX-5-1-SKILL-API-UNIFICATION |
| タスク名 | SkillAPI二重定義の解消             |
| 分類     | リファクタリング                   |
| 対象機能 | Preload SkillAPI                   |
| 作成日   | 2026-02-08                         |

## 目的

Phase 1で特定した要件を実現するための設計を行い、`window.electronAPI.skill` への統一方針を確定する。

## 実行タスク

### Task 1: 統一APIインターフェース設計

#### 1.1 維持するインターフェース構造

`skill-api.ts` の `SkillAPI` インターフェースは変更せず、そのまま維持する。

```typescript
// apps/desktop/src/preload/skill-api.ts
export interface SkillAPI {
  // 一覧・管理系（5メソッド）
  list: () => Promise<SkillMetadata[]>;
  getImported: () => Promise<ImportedSkill[]>;
  import: (skillName: string) => Promise<ImportedSkill>;
  remove: (skillName: string) => Promise<void>;
  rescan: () => Promise<SkillMetadata[]>;

  // 実行系（3メソッド）
  execute: (request: SkillExecutionRequest) => Promise<SkillExecutionResponse>;
  abort: (executionId: string) => Promise<void>;
  getExecutionStatus: (executionId: string) => Promise<ExecutionInfo | null>;

  // イベント系（3メソッド）
  onStream: (callback: (message: SkillStreamMessage) => void) => () => void;
  onComplete: (callback: (data: { executionId: string }) => void) => () => void;
  onError: (
    callback: (data: { executionId: string; error: string }) => void,
  ) => () => void;

  // 権限系（2メソッド）
  onPermissionRequest: (
    callback: (request: SkillPermissionRequest) => void,
  ) => () => void;
  sendPermissionResponse: (
    response: SkillPermissionResponse,
  ) => Promise<{ success: boolean }>;
}
```

#### 1.2 公開構造

```
window.electronAPI.skill  // SkillAPI型
├── list()
├── getImported()
├── import()
├── remove()
├── rescan()
├── execute()
├── abort()
├── getExecutionStatus()
├── onStream()
├── onComplete()
├── onError()
├── onPermissionRequest()
└── sendPermissionResponse()
```

### Task 2: safeInvoke/safeOnパターンの確認

#### 2.1 現行パターン（維持）

```typescript
// safeInvoke - 許可されたチャンネルのみ invoke を実行
function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  if (!ALLOWED_INVOKE_CHANNELS.includes(channel)) {
    return Promise.reject(new Error(`Channel ${channel} is not allowed`));
  }
  return ipcRenderer.invoke(channel, ...args);
}

// safeOn - 許可されたチャンネルのみリスナーを登録
function safeOn<T>(channel: string, callback: (data: T) => void): () => void {
  if (!ALLOWED_ON_CHANNELS.includes(channel)) {
    console.error(`Channel ${channel} is not allowed`);
    return () => {};
  }
  const listener = (_event: IpcRendererEvent, data: T) => callback(data);
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.removeListener(channel, listener);
}
```

#### 2.2 セキュリティ原則の遵守

| 原則                     | 実装方法                                                                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| チャンネルホワイトリスト | `security-skill-ipc.md` 行92-96参照。ALLOWED_INVOKE_CHANNELS（5チャンネル: skill:list, skill:execute等）、ALLOWED_ON_CHANNELS（3チャンネル: skill:stream等） |
| 型安全                   | TypeScript ジェネリクスで型を保証                                                                                                                            |
| エラーハンドリング       | 不正チャンネルは即座にリジェクト                                                                                                                             |
| クリーンアップ           | `safeOn` は unsubscribe 関数を返却                                                                                                                           |

### Task 3: 型宣言ファイルの修正設計

#### 3.1 修正対象: `types.d.ts`

**Before:**

```typescript
declare global {
  interface Window {
    electronAPI: typeof electronAPI;
    conversationAPI: ConversationAPI;
    skillAPI: SkillAPI; // 削除対象
  }
}
```

**After:**

```typescript
declare global {
  interface Window {
    electronAPI: typeof electronAPI;
    conversationAPI: ConversationAPI;
    // skillAPI は削除（electronAPI.skill 経由でアクセス）
  }
}
```

#### 3.2 ElectronAPI型の確認

`electronAPI` の型定義で `skill: SkillAPI` が含まれていることを確認する。

```typescript
// preload/types.ts
export interface ElectronAPI {
  // ... other APIs
  skill: SkillAPI;
  // ... other APIs
}
```

### Task 4: 移行影響なしの確認

Phase 1の分析結果に基づき、すべての呼び出し元が既に `window.electronAPI.skill` を使用しているため、コード変更は型宣言ファイルのみで完了する。

#### 4.1 変更ファイル一覧

| ファイル             | 変更内容                     | 変更量  |
| -------------------- | ---------------------------- | ------- |
| `preload/types.d.ts` | `window.skillAPI` 宣言を削除 | 1行削除 |

#### 4.2 変更不要ファイル

| ファイル               | 理由                                   |
| ---------------------- | -------------------------------------- |
| `preload/skill-api.ts` | インターフェースと実装はそのまま維持   |
| `preload/index.ts`     | `electronAPI.skill = skillAPI` は維持  |
| `renderer/hooks/*`     | 既に `window.electronAPI.skill` を使用 |
| `renderer/store/*`     | 既に `window.electronAPI.skill` を使用 |

## 参照資料

| 資料名               | パス                                                                       | 説明                                     |
| -------------------- | -------------------------------------------------------------------------- | ---------------------------------------- |
| Phase 1成果物        | `outputs/phase-1/requirements-definition.md`                               | 要件定義                                 |
| セキュリティ仕様     | `.claude/rules/04-electron-security.md`                                    | IPC原則                                  |
| 型定義               | `apps/desktop/src/preload/types.ts`                                        | ElectronAPI型                            |
| セキュリティ設計原則 | `.claude/skills/aiworkflow-requirements/references/security-principles.md` | 最小権限、多層防御、フェイルセキュア原則 |

### システム仕様（aiworkflow-requirements）

> 設計前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                    | パス                                                                                        | 内容                                           |
| --------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| スキルAPI仕様（13メソッド） | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | Preload API仕様（window.electronAPI.skill）    |
| IPCセキュリティパターン     | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | safeInvoke/safeOnパターン定義                  |
| 実装パターン集              | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | SkillAPI統一パターン（TASK-FIX-5-1セクション） |
| IPCチャンネル仕様           | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | IPCチャンネル一覧                              |

## 統合テスト連携

| 統合ポイント       | 契約定義                                         |
| ------------------ | ------------------------------------------------ |
| Renderer → Preload | `window.electronAPI.skill.*` を通じたAPI呼び出し |
| Preload → IPC      | `safeInvoke`/`safeOn` によるチャンネル制限       |
| IPC → Main         | 既存のIPCハンドラ（変更なし）                    |

## アーキテクチャ層別設計

| 層                         | 設計観点                                              | 仕様参照先                |
| -------------------------- | ----------------------------------------------------- | ------------------------- |
| フロントエンド（Renderer） | `window.electronAPI.skill` を一貫して使用（変更なし） | -                         |
| バックエンド（Main）       | 変更なし                                              | -                         |
| IPC通信                    | チャンネル定義は変更なし                              | `preload/channels.ts`     |
| Preload                    | `types.d.ts` の型宣言を整理                           | `04-electron-security.md` |
| データ                     | 変更なし                                              | -                         |

## 成果物

| 成果物      | パス                                     | 説明               |
| ----------- | ---------------------------------------- | ------------------ |
| 設計書      | `outputs/phase-2/architecture-design.md` | アーキテクチャ設計 |
| 統一API設計 | `outputs/phase-2/unified-api-design.md`  | 統一API仕様        |
| 型変更設計  | `outputs/phase-2/type-change-design.md`  | 型宣言の変更内容   |
| 移行計画    | `outputs/phase-2/migration-plan.md`      | 移行手順           |

## 完了条件

- [x] 統一APIインターフェース（13メソッド）が設計されている
- [x] safeInvoke/safeOnパターンの適用が確認されている
- [x] `window.electronAPI.skill` のみでの公開設計が完了している
- [x] 型宣言ファイルの修正方針が決定されている
- [x] 移行影響がないことが確認されている
- [x] 統合ポイント/契約が設計に反映されている
- [x] アーキテクチャ層別の設計が完了している
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 3: 設計レビューゲート

# IPC 4層パターン 横断リファレンス

> 読み込み条件: 新規 IPC チャネル追加・既存チャネル修正・セッション復元 API 参照時
> 関連: `ipc-contract-checklist.md`, `api-ipc-system-core.md`, `security-electron-ipc.md`

---

## メタ情報

| 項目     | 値                                                                              |
| -------- | ------------------------------------------------------------------------------- |
| 正本     | `.claude/skills/aiworkflow-requirements/references/ipc-4-layer-pattern.md`     |
| 目的     | Electron IPC 4層パターンの共通リファレンス（TASK-P0-08 の実装から抽出）        |
| スコープ | channels 定義 → preload ホワイトリスト → ipcMain ハンドラ → contextBridge API  |
| 初版     | TASK-P0-08（セッション復元 renderer 統合）の skill-feedback-report 改善要求から |

---

## 概要

AIWorkflowOrchestrator の Electron アプリは、Renderer プロセスから Main プロセスへの通信を **4層** で構成する。各層は責務が明確に分離されており、新規 IPC チャネルを追加する際は必ず 4層すべてを同時に更新する（IPC 契約ドリフト防止）。

```
Renderer (React)
    ↓  window.skillCreatorAPI.xxx()
Layer 4: contextBridge API     apps/desktop/src/preload/skill-creator-api.ts
    ↓  safeInvoke(channel, args)
Layer 2: ホワイトリスト検証    apps/desktop/src/preload/channels.ts (ALLOWED_INVOKE_CHANNELS)
    ↓  ipcRenderer.invoke(channel, args)
Layer 3: ipcMain ハンドラ      apps/desktop/src/main/ipc/creatorHandlers.ts
    ↓  runtimeSkillCreatorService.xxx()
Layer 1: チャネル定数 (SSoT)   apps/desktop/src/preload/channels.ts (IPC_CHANNELS)
                               ← packages/shared/src/ipc/channels.ts をインポート
```

---

## Layer 1: チャネル定数

**ファイル**: `apps/desktop/src/preload/channels.ts`（`IPC_CHANNELS` オブジェクト）

チャネル文字列の Single Source of Truth。`packages/shared/src/ipc/channels.ts` からインポートした共有チャネルと、desktop 固有のチャネルを `IPC_CHANNELS` に集約する。

### Session Resume チャネル（TASK-P0-08）

```typescript
// apps/desktop/src/preload/channels.ts
export const IPC_CHANNELS = {
  // ... 既存チャネル ...

  // Session Resume channels (TASK-P0-08)
  SKILL_CREATOR_LIST_SESSIONS: "skill-creator:list-sessions",
  SKILL_CREATOR_GET_SESSION_DETAIL: "skill-creator:get-session-detail",
  SKILL_CREATOR_RESUME_SESSION: "skill-creator:resume-session",
  SKILL_CREATOR_DELETE_SESSION: "skill-creator:delete-session",
  SKILL_CREATOR_CLEANUP_EXPIRED_SESSIONS: "skill-creator:cleanup-expired-sessions",
} as const;
```

### 命名規則

| 種別        | 形式                              | 例                                    |
| ----------- | --------------------------------- | ------------------------------------- |
| invoke 系   | `"domain:action"`                 | `"skill-creator:list-sessions"`       |
| push 系     | `"domain:event-name"`             | `"skill-creator:workflow-state-changed"` |
| 定数名      | `DOMAIN_ACTION` (UPPER_SNAKE)     | `SKILL_CREATOR_LIST_SESSIONS`         |

---

## Layer 2: ホワイトリスト

**ファイル**: `apps/desktop/src/preload/channels.ts`（`ALLOWED_INVOKE_CHANNELS` / `ALLOWED_ON_CHANNELS`）

Renderer から呼び出せるチャネルをホワイトリストで制限するセキュリティ層。新規チャネルを追加した場合、必ずこのリストへの追加が必要。

```typescript
// ALLOWED_INVOKE_CHANNELS に invoke 系を追加
export const ALLOWED_INVOKE_CHANNELS: readonly string[] = [
  // ... 既存 ...
  // Session Resume channels (TASK-P0-08)
  IPC_CHANNELS.SKILL_CREATOR_LIST_SESSIONS,
  IPC_CHANNELS.SKILL_CREATOR_GET_SESSION_DETAIL,
  IPC_CHANNELS.SKILL_CREATOR_RESUME_SESSION,
  IPC_CHANNELS.SKILL_CREATOR_DELETE_SESSION,
  IPC_CHANNELS.SKILL_CREATOR_CLEANUP_EXPIRED_SESSIONS,
];

// ALLOWED_ON_CHANNELS に push 系を追加（push 型チャネルの場合）
export const ALLOWED_ON_CHANNELS: readonly string[] = [
  // ... 既存 ...
];
```

**注意**: `ALLOWED_INVOKE_CHANNELS` に含まれていないチャネルへの `safeInvoke` は `console.error` を出力して空の Promise を返す（`invokeWithTimeout` の実装による）。

---

## Layer 3: ipcMain ハンドラ

**ファイル**: `apps/desktop/src/main/ipc/creatorHandlers.ts`

`ipcMain.handle(channel, async (event, args) => { ... })` パターンで Main プロセスの処理を定義する。`safeInvoke` / `safeOn` は Preload 側のユーティリティであり、ハンドラ側は直接 `ipcMain.handle` を使用する。

### Session Resume ハンドラパターン（TASK-P0-08）

```typescript
// ── Session Resume handlers (TASK-P0-08) ──

ipcMain.handle(
  IPC_CHANNELS.SKILL_CREATOR_LIST_SESSIONS,
  async (event: IpcMainInvokeEvent) => {
    validateSender(event, IPC_CHANNELS.SKILL_CREATOR_LIST_SESSIONS, mainWindow);
    if (!runtimeSkillCreatorService) {
      return { success: false, error: RUNTIME_SKILL_CREATOR_UNAVAILABLE };
    }
    return { success: true, data: runtimeSkillCreatorService.listSessions() };
  },
);

ipcMain.handle(
  IPC_CHANNELS.SKILL_CREATOR_RESUME_SESSION,
  async (
    event: IpcMainInvokeEvent,
    args: { checkpointId: string },
  ): Promise<SkillCreatorSessionResumeResult> => {
    validateSender(event, IPC_CHANNELS.SKILL_CREATOR_RESUME_SESSION, mainWindow);
    if (!args?.checkpointId?.trim()) {
      return { success: false, error: "checkpointId が指定されていません" };
    }
    // ...
  },
);
```

### ハンドラ実装の必須パターン

| チェック項目             | コード例                                                               |
| ------------------------ | ---------------------------------------------------------------------- |
| sender 検証              | `validateSender(event, channel, mainWindow)`                           |
| サービス存在確認         | `if (!runtimeSkillCreatorService) return { success: false, error: ... }` |
| 文字列引数バリデーション | `if (!args?.checkpointId?.trim()) return { ... }`                      |
| 解除登録                 | `ipcMain.removeHandler(channel)` を cleanup 関数に追加                 |

### cleanup の必須化

ハンドラを登録した場合、`unregisterXxxHandlers()` 関数にも `ipcMain.removeHandler` を追加する。

```typescript
export function unregisterRuntimeSkillCreatorHandlers(): void {
  // ... 既存 ...
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_LIST_SESSIONS);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_RESUME_SESSION);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_DELETE_SESSION);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_GET_SESSION_DETAIL);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_CLEANUP_EXPIRED_SESSIONS);
}
```

---

## Layer 4: contextBridge API

**ファイル**: `apps/desktop/src/preload/skill-creator-api.ts`

`contextBridge.exposeInMainWorld` で `window.skillCreatorAPI` として公開する。Renderer はこのオブジェクトを通じて IPC を呼び出す。`safeInvoke` ヘルパーがホワイトリスト検証とタイムアウトを担う。

### Session Resume API 定義（型 + 実装）

```typescript
// SkillCreatorAPI インターフェース（型定義）
interface SkillCreatorAPI {
  // --- TASK-P0-08: Session Resume API ---
  listSessions: () => Promise<IpcResult<SkillCreatorSessionListItem[]>>;
  resumeSession: (checkpointId: string) => Promise<SkillCreatorSessionResumeResult>;
  getSessionDetail: (checkpointId: string) => Promise<IpcResult<SkillCreatorWorkflowUiSnapshot>>;
  deleteSession: (checkpointId: string) => Promise<void>;
  cleanupExpiredSessions: () => Promise<number>;
}

// skillCreatorAPI 実装
export const skillCreatorAPI: SkillCreatorAPI = {
  listSessions: (): Promise<IpcResult<SkillCreatorSessionListItem[]>> =>
    safeInvoke(IPC_CHANNELS.SKILL_CREATOR_LIST_SESSIONS),

  resumeSession: (checkpointId: string): Promise<SkillCreatorSessionResumeResult> =>
    safeInvoke(IPC_CHANNELS.SKILL_CREATOR_RESUME_SESSION, { checkpointId }),

  getSessionDetail: (checkpointId: string): Promise<IpcResult<SkillCreatorWorkflowUiSnapshot>> =>
    safeInvoke(IPC_CHANNELS.SKILL_CREATOR_GET_SESSION_DETAIL, { checkpointId }),

  deleteSession: (checkpointId: string): Promise<void> =>
    safeInvoke(IPC_CHANNELS.SKILL_CREATOR_DELETE_SESSION, { checkpointId }),

  cleanupExpiredSessions: (): Promise<number> =>
    safeInvoke(IPC_CHANNELS.SKILL_CREATOR_CLEANUP_EXPIRED_SESSIONS),
};
```

### Renderer からの呼び出し方

```typescript
// apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx 等
const result = await window.skillCreatorAPI.listSessions();
if (result.success) {
  setSessions(result.data);
}

const resumeResult = await window.skillCreatorAPI.resumeSession(checkpointId);
if (resumeResult.success) {
  // resumeResult.workflowSnapshot を使って UI を更新
}
```

---

## 4層 チェックリスト（新規チャネル追加時）

新規 IPC チャネルを追加する際は以下を順に実施する。詳細は `ipc-contract-checklist.md` を参照。

- [ ] **L1**: `IPC_CHANNELS` にチャネル定数を追加（`apps/desktop/src/preload/channels.ts`）
- [ ] **L2**: `ALLOWED_INVOKE_CHANNELS` または `ALLOWED_ON_CHANNELS` にチャネルを追加（同ファイル）
- [ ] **L3**: `ipcMain.handle(...)` でハンドラを実装（`apps/desktop/src/main/ipc/creatorHandlers.ts`）
- [ ] **L3**: `unregisterXxxHandlers()` に `ipcMain.removeHandler(...)` を追加
- [ ] **L4**: `SkillCreatorAPI` インターフェースにメソッド型を追加
- [ ] **L4**: `skillCreatorAPI` 実装オブジェクトにメソッドを追加
- [ ] **型**: `packages/shared/src/types/` に共有型（Request/Response）を追加（必要な場合）
- [ ] **テスト**: `apps/desktop/src/main/ipc/__tests__/` にハンドラテストを追加
- [ ] **テスト**: `apps/desktop/src/__tests__/session-resume-ipc.test.ts` 等に統合テストを追加

---

## P0-06 / P0-08 状態境界ガイドライン

TASK-P0-06 と TASK-P0-08 は扱う「状態のスコープ」が明確に異なる。混在させると永続化すべきでないデータが漏れたり、逆に ephemeral であるべきデータが永続化されてしまう。

### 境界の定義

| 区分           | TASK-P0-06: ephemeral UI state                      | TASK-P0-08: persistent session                        |
| -------------- | --------------------------------------------------- | ----------------------------------------------------- |
| 状態の寿命     | ページリロード / コンポーネントアンマウントで消える | Main プロセス再起動後も24時間 TTL 内で復元可能        |
| 保存場所       | React state（`useState` / `useReducer`）            | Main プロセスの checkpoint ストレージ                 |
| 禁止事項       | `localStorage` / `sessionStorage` への書き込み禁止 | Renderer 側での直接状態管理禁止                       |
| 主要コンポーネント | `ConversationalInterview`, `useInterviewState`  | `SkillCreatorWorkflowEngine`, `RuntimeSkillCreatorFacade` |
| 代表ファイル   | `apps/desktop/src/renderer/components/skill/hooks/useInterviewState.ts` | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` |

### ephemeral state（P0-06）の設計原則

- **React state のみ**: `useInterviewState` フックが管理する `messages`, `proficiency`, `currentStepIndex` は React state として保持する。
- **ストレージ禁止**: `localStorage.setItem` / `sessionStorage.setItem` への書き込みは行わない。
- **リセット可能**: コンポーネントアンマウント時に自然に破棄される設計にする。
- **用途**: インタビューフローの進行状態（質問メッセージ一覧・undo 履歴・現在ステップ）を管理する。

### persistent session（P0-08）の設計原則

- **Main プロセス管理**: セッション checkpoint は `SkillCreatorWorkflowEngine` の `checkpoints` Map に保持し、オプションで `sessionRepository` に永続化する。
- **TTL 管理**: `SESSION_TTL_MS`（`packages/shared/src/types`）で定義された24時間 TTL を超えたセッションはフィルタリングおよびクリーンアップする。
- **Renderer は snapshot host**: Renderer は `SkillCreatorWorkflowUiSnapshot` を受け取って表示するだけで、状態の正本は Main プロセスが保持する。
- **IPC 経由のみ**: セッション操作（list / resume / delete / cleanup）は必ず IPC 4層経由で行う。直接 import して呼び出すことは禁止。

### 境界を判断するフローチャート

```
Q: この状態はアプリ再起動後も復元が必要か?
    ├─ No  → ephemeral state（P0-06 スコープ）
    │         → React state で管理。localStorage 禁止。
    └─ Yes → persistent session（P0-08 スコープ）
              → IPC 4層経由で Main プロセスに委譲。
              → SESSION_TTL_MS 以内に限定。

Q: この処理は Renderer から直接呼び出せるか?
    ├─ Yes → Preload API（contextBridge）経由でのみ公開
    └─ No  → Main プロセス内部 API（IPC 不要）
```

---

## 関連ファイル一覧

| ファイル                                                                              | 役割                                |
| ------------------------------------------------------------------------------------- | ----------------------------------- |
| `apps/desktop/src/preload/channels.ts`                                                | L1 チャネル定数 + L2 ホワイトリスト |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`                                        | L3 ipcMain ハンドラ実装             |
| `apps/desktop/src/preload/skill-creator-api.ts`                                       | L4 contextBridge API 実装           |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                 | セッション操作のビジネスロジック    |
| `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`                | checkpoint 管理・TTL 処理           |
| `apps/desktop/src/renderer/components/skill/hooks/useInterviewState.ts`               | ephemeral UI state（P0-06）         |
| `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`              | インタビュー UI コンポーネント      |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                  | セッション検出 + 復元 UI 統合       |
| `packages/shared/src/types/`                                                          | 共有型定義（SessionListItem 等）    |
| `ipc-contract-checklist.md`                                                           | IPC 変更時の品質ゲートチェックリスト |
| `api-ipc-system-core.md`                                                              | Skill Creator Workflow IPC 仕様     |

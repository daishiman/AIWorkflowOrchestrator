# Phase 2: 設計

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 2                        |
| タスクID   | TASK-RALLY-003           |
| 機能名     | undo-server-rollback-api |
| 前提Phase  | Phase 1                  |
| 後続Phase  | Phase 3                  |
| 作成日     | 2026-04-21               |
| ステータス | pending                  |

## 目的

IPC 4層整合を含む全変更箇所の設計を確定する。

## IPC 4層整合性チェック

| 層                | ファイル                                        | 追加内容                                                                                                    |
| ----------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 1. 定数定義       | `packages/shared/src/ipc/channels.ts`           | `SKILL_CREATOR_UNDO_USER_INPUT: "skill-creator:undo-user-input"` を `SKILL_CREATOR_RUNTIME_CHANNELS` に追加 |
| 2. ホワイトリスト | `apps/desktop/src/preload/channels.ts`          | `"skill-creator:undo-user-input"` を allowedChannels に追加                                                 |
| 3. ハンドラ登録   | `apps/desktop/src/main/ipc/creatorHandlers.ts`  | `ipcMain.handle(IPC_CHANNELS.SKILL_CREATOR_UNDO_USER_INPUT, ...)` を追加                                    |
| 4. Preload API    | `apps/desktop/src/preload/skill-creator-api.ts` | `undoUserInput: (planId: string) => Promise<IpcResult<SkillCreatorWorkflowUiSnapshot>>` を追加              |

## 変更箇所詳細

### 変更1: `packages/shared/src/ipc/channels.ts`

```typescript
export const SKILL_CREATOR_RUNTIME_CHANNELS = {
  SKILL_CREATOR_PROGRESS: "skill-creator:progress",
  SKILL_CREATOR_WORKFLOW_STATE_CHANGED: "skill-creator:workflow-state-changed",
  SKILL_CREATOR_ADAPTER_STATUS_CHANGED: "skill-creator:adapter-status-changed",
  SKILL_CREATOR_CANCEL: "skill-creator:cancel",
  // TASK-RALLY-003: Undo サーバー rollback API
  SKILL_CREATOR_UNDO_USER_INPUT: "skill-creator:undo-user-input",
} as const;
```

### 変更2: `packages/shared/src/types/skillCreator.ts`

```typescript
/** TASK-RALLY-003: Undo rollback リクエスト */
export interface UndoUserInputRequest {
  planId: string;
}

/** TASK-RALLY-003: Undo rollback 結果 */
export interface UndoUserInputResult {
  snapshot: SkillCreatorWorkflowUiSnapshot;
}
```

### 変更3: `RuntimeSkillCreatorFacade.ts`

```typescript
/**
 * TASK-RALLY-003: 最後に送信したユーザー入力を巻き戻す。
 * awaitingUserInput を前の質問状態に戻し、最新の workflowSnapshot を返す。
 */
async rollbackLastInput(
  planId: string,
): Promise<SkillCreatorWorkflowUiSnapshot> {
  const planSnapshot = this.getWorkflowStateSnapshot(planId);
  if (!planSnapshot) {
    throw new Error(`planId ${planId} の workflow state が見つかりません`);
  }
  // stepHistory から最後のステップを削除し、前の awaitingUserInput を復元する
  // 具体的な実装はワークフローエンジンの内部仕様に依存するため、実装前に確認する
  // （rally-phase-3-review.md リスク2参照）
  return this.getWorkflowStateSnapshot(planId)!;
}
```

### 変更4: `creatorHandlers.ts`

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_CREATOR_UNDO_USER_INPUT,
  async (
    event: IpcMainInvokeEvent,
    args: UndoUserInputRequest,
  ): Promise<IpcResult<SkillCreatorWorkflowUiSnapshot>> => {
    validateSender(
      event,
      IPC_CHANNELS.SKILL_CREATOR_UNDO_USER_INPUT,
      mainWindow,
    );

    if (isBlank(args?.planId)) {
      return validationError("planId が指定されていません");
    }
    if (!runtimeSkillCreatorService) {
      return validationError(RUNTIME_SKILL_CREATOR_UNAVAILABLE);
    }

    try {
      const snapshot = await runtimeSkillCreatorService.rollbackLastInput(
        args.planId.trim(),
      );
      emitWorkflowStateChanged(mainWindow, snapshot);
      return { success: true, data: snapshot };
    } catch (error) {
      return {
        success: false,
        error: sanitizeErrorMessage(error, "Undo の実行に失敗しました"),
      };
    }
  },
);
```

### 変更5: `preload/skill-creator-api.ts`

型定義部分:

```typescript
/**
 * 最後のユーザー入力をサーバー側で巻き戻す（Undo rollback）
 */
undoUserInput: (planId: string) =>
  Promise<IpcResult<SkillCreatorWorkflowUiSnapshot>>;
```

実装部分:

```typescript
undoUserInput: (
  planId: string,
): Promise<IpcResult<SkillCreatorWorkflowUiSnapshot>> =>
  safeInvoke(IPC_CHANNELS.SKILL_CREATOR_UNDO_USER_INPUT, { planId }),
```

### 変更6: `ConversationalInterview.tsx`（handleUndo 更新）

```typescript
const handleUndo = useCallback(async () => {
  if (!workflowSnapshot?.planId || isSubmitting) return;

  // UI のローカル状態を巻き戻す
  const { restoredRequest } = interview.undo();

  // サーバー側の状態も巻き戻す（TASK-RALLY-003）
  const api = getSkillCreatorApi();
  const result = await api.undoUserInput(workflowSnapshot.planId);
  if (result.success) {
    // RALLY-005 の「invoke を正規ソース」方針に従いスナップショットを更新
    setWorkflowSnapshot(result.data);
  } else {
    setError(result.error ?? "Undo に失敗しました");
  }
}, [workflowSnapshot?.planId, isSubmitting, interview]);
```

## 設計の根拠

RALLY-005 で確立した「invoke を正規ソース」方針に従い、rollback 完了後は invoke 戻り値として最新 `workflowSnapshot` を返す。これにより、rollback 後の UI 状態がサーバー状態と一致することが保証される。

## 検証方法

```bash
# 型チェック（shared・desktopの両方）
pnpm --filter @repo/shared typecheck
pnpm --filter @repo/desktop typecheck

# lint チェック
pnpm --filter @repo/desktop lint

# テスト実行
pnpm --filter @repo/desktop test
pnpm --filter @repo/shared test
```

## 参照資料

| 資料名          | パス                                                          | 用途                 |
| --------------- | ------------------------------------------------------------- | -------------------- |
| 要件定義書      | `outputs/phase-1/requirements-definition.md`                  | Phase 1 成果物       |
| IPC4層整合計画  | `outputs/phase-1/ipc-4layer-plan.md`                          | Phase 1 成果物       |
| RALLY-005成果物 | `docs/30-workflows/skill-create-flow-gaps/p05-seq-RALLY-005/` | invoke正規ソース方針 |

## 成果物

| 成果物               | パス                                               | 説明                          |
| -------------------- | -------------------------------------------------- | ----------------------------- |
| IPC4層設計書         | `outputs/phase-2/ipc-4layer-design.md`             | 4層それぞれの詳細設計         |
| Facade設計書         | `outputs/phase-2/facade-design.md`                 | rollbackLastInputメソッド設計 |
| handleUndo更新設計書 | `outputs/phase-2/handle-undo-design.md`            | Renderer側の変更設計          |
| 依存整合マトリクス   | `outputs/phase-2/dependency-consistency-matrix.md` | 7ファイル変更の依存関係表     |

## 完了条件

- [ ] IPC 4層（定数・ホワイトリスト・ハンドラ・Preload API）の設計を確定した
- [ ] Facade の rollbackLastInput メソッド設計を確定した
- [ ] handleUndo の async 化と IPC 呼び出し設計を確定した
- [ ] 7ファイルの変更順序（依存関係）を確定した
- [ ] 成果物テーブル記載のファイルを全件生成した

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] IPC 4層整合確認済み
- [ ] 成果物テーブル記載のファイルを全件生成

## 次のPhase

Phase 3: 設計レビューゲート

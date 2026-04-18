# Phase 1: current facts 調査メモ

> 調査日: 2026-04-18
> タスクID: TASK-EXECUTE-ASYNC-SNAPSHOT-ERROR-PROPAGATION-001

## 調査結果サマリー

**判定: Phase 5 は no-op（差分確認のみ）**

current branch の実装は既に AC を満たしており、`executeAsync()` の error 伝搬契約は成立している。

---

## Task 1-1: current facts 調査

### RuntimeSkillCreatorFacade.ts — executeAsync() error パス

**ファイル**: `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`

#### onWorkflowStateSnapshot コールバック定義（L1250〜1252）

```typescript
onWorkflowStateSnapshot?: (
  planId: string,
  snapshot: SkillCreatorWorkflowUiSnapshot | null,
  error?: string,
) => void;
```

- 第3引数: `error?: string` — errorMessage を optional string として受け取る
- 型: `SkillCreatorWorkflowUiSnapshot | null`（StateSnapshot ではなく UiSnapshot）

#### executeAsync() error パス（structured error）（L1306〜1315）

```typescript
case "error": {
  this.workflowEngine.triggerPhaseTransition(planId, "error", 0);
  const snapshot = this.workflowEngine.getWorkflowState(planId);
  this.onWorkflowStateSnapshot?.(
    planId,
    snapshot ?? null,
    extractExecuteErrorMessage(executeResult),  // 第3引数
  );
  break;
}
```

- `snapshot ?? null` で null 正規化済み
- `extractExecuteErrorMessage(executeResult)` が第3引数

#### executeAsync() catch パス（L1320〜1327）

```typescript
} catch (error) {
  this.workflowEngine.triggerPhaseTransition(planId, "error", 0);
  const errorMessage = error instanceof Error ? error.message : String(error);
  const snapshot = this.workflowEngine.getWorkflowState(planId);
  this.onWorkflowStateSnapshot?.(planId, snapshot ?? null, errorMessage);
  ...
}
```

- `snapshot ?? null` で null 正規化済み
- `errorMessage` を第3引数に渡している

#### success / terminal_handoff パス（L1302〜1305）

```typescript
case "terminal_handoff":
case "success":
  this.workflowEngine.triggerPhaseTransition(planId, "complete", 100);
  break;
```

- `onWorkflowStateSnapshot` を呼ばない（第3引数は undefined）

---

### SkillCreatorWorkflowEngine.ts — state 型確認

**ファイル**: `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`

#### SkillCreatorWorkflowStateSnapshot 型（L69〜）

```typescript
export interface SkillCreatorWorkflowStateSnapshot extends SkillCreatorWorkflowUiSnapshot {
  planId: string;
  currentPhase: SkillCreatorWorkflowPhase;
  awaitingUserInput: SkillCreatorAwaitingUserInput | null;
  verifyResult: SkillCreatorVerifyResult | null;
  phaseArtifacts: SkillCreatorWorkflowArtifact[];
  resumeTokenEnvelope: SkillCreatorResumeTokenEnvelope;
  routeSnapshot?: SkillCreatorRouteSnapshot;
  sourceProvenance?: SkillCreatorWorkflowSourceProvenance;
  handoffBundle?: TerminalHandoffBundle | null;
}
```

**`errorCode` / `errorMessage` フィールドは存在しない。**

→ エラー情報は callback 第3引数（`error?: string`）で渡す契約が正本。型変更は不要。

---

### creatorHandlers.ts — IPC relay 確認

**ファイル**: `apps/desktop/src/main/ipc/creatorHandlers.ts`

#### emitWorkflowStateChanged 関数（L109〜L131）

```typescript
function emitWorkflowStateChanged(
  mainWindow: BrowserWindow,
  snapshot: SkillCreatorWorkflowUiSnapshot | null,
  errorMessage?: string,
): void {
  if (mainWindow.isDestroyed()) return;
  if (errorMessage !== undefined) {
    mainWindow.webContents.send(
      IPC_CHANNELS.SKILL_CREATOR_WORKFLOW_STATE_CHANGED,
      snapshot,
      errorMessage,
    );
    return;
  }
  if (snapshot) {
    mainWindow.webContents.send(
      IPC_CHANNELS.SKILL_CREATOR_WORKFLOW_STATE_CHANGED,
      snapshot,
    );
  }
}
```

- `errorMessage !== undefined` の分岐で snapshot が null でも relay 可能
- snapshot 不在でも errorMessage があれば IPC イベントを送信する

#### onWorkflowStateSnapshot ワイヤリング（L204〜L210）

```typescript
runtimeSkillCreatorService.onWorkflowStateSnapshot = (
  _planId,
  snapshot,
  errorMessage,
) => {
  if (snapshot || errorMessage !== undefined) {
    emitWorkflowStateChanged(mainWindow, snapshot, errorMessage);
  }
};
```

- `snapshot || errorMessage !== undefined` でガード
- snapshot が null かつ errorMessage がある場合も relay 成立

---

### RuntimeSkillCreatorFacade.executeAsync.test.ts — 証跡確認

**ファイル**: `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts`

既存テスト（T-01〜T-06）:

- T-01: structured error パス — snapshot が存在する場合も error.message が第3引数
- T-02: catch パス — snapshot が存在する場合も error.message が第3引数
- T-03: terminal_handoff パス — 第3引数は undefined
- T-04: success パス — 第3引数は undefined
- T-05: structured error、snapshot undefined → null として第2引数
- T-05b: success false の string error も error.message を伝搬
- T-06: catch パス、Error 以外を throw した場合も String(error) が第3引数

**全てのシナリオが既にテストされている。**

---

### 近縁完了タスク 確認

`TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001` は 2026-04-06 完了記録あり。

本タスク `TASK-EXECUTE-ASYNC-SNAPSHOT-ERROR-PROPAGATION-001` は:

- 上記完了タスクの verification task 兼 close-out 整備
- 実装再現ではなく、current facts の記録と証跡整備が目的

---

## Task 1-2: 要件整理

| ID   | 要件                                                                         | 状態              |
| ---- | ---------------------------------------------------------------------------- | ----------------- |
| FR-1 | current facts を基準に調査結果を固定する                                     | ✅ 完了（本文書） |
| FR-2 | `errorCode` の snapshot 拡張は必要性が確認できた場合に限る                   | ✅ 不要確定       |
| FR-3 | Phase 5 は「差分確認・最小修正」を原則とし、既存 branch 実装の再実装を避ける | ✅ no-op 確定     |
| FR-4 | Phase 11 は NON_VISUAL 証跡、Phase 12 は必須6成果物と parity を要求する      | ✅ 設計反映済み   |

---

## Task 1-3: リスク・4条件評価

| ケース | 判定     | 内容                                                                                          |
| ------ | -------- | --------------------------------------------------------------------------------------------- |
| E-1    | **該当** | 実装は既に充足済みで docs だけが古い → Phase 5 を no-op 記録へ切り替える                      |
| E-2    | **該当** | callback 第3引数で十分なのに snapshot 拡張は不要 → 型変更禁止                                 |
| E-3    | 非該当   | state 型は shared/public contract に露出しているが、変更は不要と判定                          |
| E-4    | 注意要   | completed ledger の TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001 と区別して記録する |

### 4条件評価

| 条件         | 評価 | 根拠                                                 |
| ------------ | ---- | ---------------------------------------------------- |
| 矛盾なし     | ✅   | current facts で全AC充足を確認                       |
| 漏れなし     | ✅   | テストT-01〜T-06が全シナリオをカバー                 |
| 整合性あり   | ✅   | callback第3引数パターンが runtime / IPC 一貫している |
| 依存関係整合 | ✅   | runtime → IPC relay → consumer が成立                |

---

## Phase 2 引き継ぎ論点

1. `errorCode` 拡張 → 不要（callback第3引数で要件充足）
2. Phase 5 モード → no-op（差分なし）
3. 型変更 → なし
4. verification task と completed ledger の区別 → Phase 12 で整理

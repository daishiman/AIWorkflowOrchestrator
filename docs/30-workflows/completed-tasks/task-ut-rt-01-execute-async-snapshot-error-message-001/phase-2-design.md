# Phase 2: 設計

## メタ情報

| 項目       | 内容                                                   |
| ---------- | ------------------------------------------------------ |
| Phase      | 2                                                      |
| Phase 名   | 設計                                                   |
| 前提 Phase | Phase 1（要件定義）完了                                |
| 後続 Phase | Phase 3（設計レビューゲート）                          |
| ステータス | 完了                                                   |
| 作成日     | 2026-04-06                                             |
| 機能名     | task-ut-rt-01-execute-async-snapshot-error-message-001 |

---

## 目的

`executeAsync()` のエラー伝搬パス統一に向けた修正方針・topology・validation matrix を設計し、Phase 4 実装開始の根拠を確立する。

---

## Concern 一覧

本タスクの concern は **1つ**のみ。

| Concern ID | 内容                                  | 対象層      |
| ---------- | ------------------------------------- | ----------- |
| C-01       | `executeAsync()` のエラー伝搬パス統一 | Main 層のみ |

concern が 1 つであるため、単一 `phase-2-design.md` に全て記述する。

---

## 修正 Topology

### 対象ファイル

| 層              | ファイルパス                                                                                                                  | 変更種別             |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| Main 層（実装） | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                                                         | 修正                 |
| テスト          | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts`（または既存テストファイル） | 新規追加 または 修正 |

### 変更しないファイル

| ファイルパス                                   | 理由                                                           |
| ---------------------------------------------- | -------------------------------------------------------------- |
| `packages/shared/src/types/skillCreator.ts`    | 型変更なし（`RuntimeSkillCreatorExecuteErrorResponse` は既存） |
| `apps/desktop/src/main/ipc/creatorHandlers.ts` | IPC チャンネル変更なし                                         |
| Renderer 側 UI コンポーネント                  | スコープ外                                                     |
| `SkillCreatorWorkflowEngine`                   | スコープ外                                                     |

---

## IPC チャンネル変更

**変更なし。**

既存の `onWorkflowStateSnapshot` コールバックシグネチャ（`(planId: string, snapshot: SkillCreatorWorkflowUiSnapshot | null, error?: string) => void`）は変更しない。第3引数 `error?` は既に optional で定義済みであり、今回の修正は「呼び出さないケースを除去する」だけで型変更は不要。

---

## 型変更

**変更なし。**

`RuntimeSkillCreatorExecuteErrorResponse` 型は `packages/shared/src/types/skillCreator.ts` に既に定義済み。型ガード判定は既存の inline 条件式（`"success" in executeResult && executeResult.success === false`）で行う。

---

## 修正方針（3 パス）

### 現状の問題コード（行 1032-1057）

```typescript
// structured error パス（問題あり）
if (isStructuredError) {
  const errorResponse = executeResult as RuntimeSkillCreatorExecuteErrorResponse;
  const snapshot = this.workflowEngine.getWorkflowState(planId);
  if (!snapshot) {   // ← この条件が問題: snapshot があるとエラーが伝搬されない
    this.onWorkflowStateSnapshot?.(planId, null, errorResponse.error.message);
  }
}

// catch パス（問題あり）
} catch (error) {
  this.workflowEngine.triggerPhaseTransition(planId, "error", 0);
  const errorMessage = error instanceof Error ? error.message : String(error);
  const snapshot = this.workflowEngine.getWorkflowState(planId);
  if (!snapshot) {   // ← この条件が問題: snapshot があるとエラーが伝搬されない
    this.onWorkflowStateSnapshot?.(planId, null, errorMessage);
  }
```

### パス 1: structured error パス（修正対象）

**Before**:

```typescript
if (isStructuredError) {
  const errorResponse =
    executeResult as RuntimeSkillCreatorExecuteErrorResponse;
  const snapshot = this.workflowEngine.getWorkflowState(planId);
  if (!snapshot) {
    this.onWorkflowStateSnapshot?.(planId, null, errorResponse.error.message);
  }
}
```

**After**:

```typescript
if (isStructuredError) {
  const errorResponse =
    executeResult as RuntimeSkillCreatorExecuteErrorResponse;
  const snapshot = this.workflowEngine.getWorkflowState(planId);
  this.onWorkflowStateSnapshot?.(
    planId,
    snapshot ?? null,
    errorResponse.error.message,
  );
}
```

変更点:

- `if (!snapshot)` 条件ブロックを削除
- `null` → `snapshot ?? null` に変更（snapshot が存在する場合はそれを渡す）
- `onWorkflowStateSnapshot` を常に呼び出す

### パス 2: catch パス（修正対象）

**Before**:

```typescript
} catch (error) {
  this.workflowEngine.triggerPhaseTransition(planId, "error", 0);
  const errorMessage = error instanceof Error ? error.message : String(error);
  const snapshot = this.workflowEngine.getWorkflowState(planId);
  if (!snapshot) {
    this.onWorkflowStateSnapshot?.(planId, null, errorMessage);
  }
  console.error(
    "[RuntimeSkillCreatorFacade] executeAsync failed",
    planId,
    errorMessage,
  );
}
```

**After**:

```typescript
} catch (error) {
  this.workflowEngine.triggerPhaseTransition(planId, "error", 0);
  const errorMessage = error instanceof Error ? error.message : String(error);
  const snapshot = this.workflowEngine.getWorkflowState(planId);
  this.onWorkflowStateSnapshot?.(planId, snapshot ?? null, errorMessage);
  console.error(
    "[RuntimeSkillCreatorFacade] executeAsync failed",
    planId,
    errorMessage,
  );
}
```

変更点:

- `if (!snapshot)` 条件ブロックを削除
- `null` → `snapshot ?? null` に変更
- `onWorkflowStateSnapshot` を常に呼び出す

### パス 3: terminal_handoff / success パス（変更なし）

`isStructuredError` が `false` の場合（terminal_handoff または成功）のパスは変更しない。これらのパスでは `triggerPhaseTransition(planId, "complete", 100)` が呼び出されており、エラーメッセージの伝搬は不要。

---

## 修正後の全体イメージ（executeAsync の try/catch 部分）

```typescript
// try ブロック末尾（行 1021 付近から）
const isStructuredError =
  typeof executeResult === "object" &&
  executeResult !== null &&
  "success" in executeResult &&
  executeResult.success === false;
const phase = isStructuredError ? "error" : "complete";
this.workflowEngine.triggerPhaseTransition(
  planId,
  phase,
  phase === "complete" ? 100 : 0,
);

// 修正後: structured error パス
if (isStructuredError) {
  const errorResponse = executeResult as RuntimeSkillCreatorExecuteErrorResponse;
  const snapshot = this.workflowEngine.getWorkflowState(planId);
  this.onWorkflowStateSnapshot?.(planId, snapshot ?? null, errorResponse.error.message);
}

// catch ブロック
} catch (error) {
  this.workflowEngine.triggerPhaseTransition(planId, "error", 0);
  const errorMessage = error instanceof Error ? error.message : String(error);
  const snapshot = this.workflowEngine.getWorkflowState(planId);
  this.onWorkflowStateSnapshot?.(planId, snapshot ?? null, errorMessage);
  console.error(
    "[RuntimeSkillCreatorFacade] executeAsync failed",
    planId,
    errorMessage,
  );
}
```

---

## DI 境界の型配置

本タスクでは新規 DI 依存型の追加はなし。既存の `RuntimeSkillCreatorExecuteErrorResponse` 型（`packages/shared/src/types/skillCreator.ts`）と `SkillCreatorWorkflowUiSnapshot` 型（既存）をそのまま使用する。

---

## Validation Matrix

| コマンド                                                                            | 目的                  | 期待結果      |
| ----------------------------------------------------------------------------------- | --------------------- | ------------- |
| `pnpm --filter @repo/desktop typecheck`                                             | TypeScript 型チェック | エラー 0 件   |
| `pnpm --filter @repo/desktop lint`                                                  | ESLint チェック       | エラー 0 件   |
| `pnpm --filter @repo/desktop test -- --testPathPattern "RuntimeSkillCreatorFacade"` | 対象テスト実行        | 全テスト PASS |

---

## リスク評価

| リスク                                                                                     | 影響度 | 発生確率 | 対策                                                                                                       |
| ------------------------------------------------------------------------------------------ | ------ | -------- | ---------------------------------------------------------------------------------------------------------- |
| `onWorkflowStateSnapshot` が常に呼ばれることで Renderer 側が二重更新を受ける               | 低     | 低       | `onWorkflowStateSnapshot` の `error?` は元から optional のため、既存コードへの破壊的変更は発生しない       |
| `RuntimeSkillCreatorExecuteResponse` の union が将来拡張された場合に網羅性チェックが漏れる | 中     | 中       | 現時点では inline 条件式で十分。将来拡張時は exhaustive check パターンを導入する（未タスク候補として記録） |
| Renderer 側の consumer が `error` 引数の増加に対応できていない場合                         | 低     | 低       | `error?` が optional のため、既存 Renderer コードは引数を受け取らなくても動作する                          |

---

## 成果物

| 成果物         | パス                                                                                         | 内容           |
| -------------- | -------------------------------------------------------------------------------------------- | -------------- |
| Phase 2 設計書 | `docs/30-workflows/task-ut-rt-01-execute-async-snapshot-error-message-001/phase-2-design.md` | 本ドキュメント |

---

## 統合テスト連携

Phase 2 設計の統合ポイント確認:

- `onWorkflowStateSnapshot` コールバックは `creatorHandlers.ts` で `mainWindow.webContents.send(SKILL_CREATOR_WORKFLOW_STATE_CHANGED, snapshot)` にワイヤリングされている
- 修正後のコードは既存の IPC ワイヤリングをそのまま使用する（IPC チャンネル変更なし）
- Renderer 側が `error` 引数を受け取る実装はスコープ外だが、引数が `undefined` から実際の値に変わるだけなので既存コードの動作は壊れない

---

## 完了条件

- [x] concern が 1 つであることを明記した
- [x] 修正 topology（Main 層のみ）を定義した
- [x] IPC チャンネル変更なしを明記した
- [x] 型変更なしを明記した
- [x] 3 パス（structured error / catch / terminal_handoff+success）の修正方針を Before/After 形式で明示した
- [x] Validation matrix（typecheck / lint / test コマンド）を定義した
- [x] リスク評価を記載した

---

## Phase 末端アクション【必須】

- [x] Phase 2 内の全タスクを 100% 実行完了
- [x] concern 数・topology・validation matrix を確定し、完了を明記
- [x] 成果物（本ドキュメント）が生成されていることを確認

---

## 次 Phase

Phase 2 完了。次は **Phase 3（設計レビューゲート）** へ進む。

`docs/30-workflows/task-ut-rt-01-execute-async-snapshot-error-message-001/phase-3-design-review.md`

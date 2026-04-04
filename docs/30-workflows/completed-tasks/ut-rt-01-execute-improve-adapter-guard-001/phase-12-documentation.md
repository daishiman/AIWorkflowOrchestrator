# Phase 12: ドキュメント更新 — TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001

## メタ情報

| 項目     | 値                                              |
| -------- | ----------------------------------------------- |
| Phase    | 12                                              |
| タスクID | TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001 |
| 機能名   | ut-rt-01-execute-improve-adapter-guard-001      |
| 作成日   | 2026-04-04                                      |
| 依存     | Phase 11 完了                                   |

## 目的

実装ガイド・仕様書同期・未タスク検出・スキルフィードバックの 5 成果物を完成させる。

## Task 12-1: 実装ガイド作成（2パート）

成果物: `outputs/phase-12/implementation-guide.md`

### Part 1（中学生レベル）

**なぜこれが必要か？**

AI スキルを作るアプリを想像してください。このアプリは AI（LLM）と話して、スキルを自動生成します。でも AI と話す準備（アダプターの初期化）ができていない状態で「スキルを実行して！」と頼まれたとき、今まではアプリが混乱してよくわからないエラーを出していました。

今回の変更で、「まだ準備中だよ」「設定に問題があるよ」という**わかりやすいメッセージ**を返せるようになりました。料理する前に「材料が揃っているか確認する」ような感じです。

**何が変わったか？**

- `execute()`（スキル実行）を呼ぶ前に「AI との接続状態」を確認するようになった
- `improve()`（スキル改善）を呼ぶ前も同様に確認するようになった
- 問題がある場合は即座に「これが問題です」と教えてくれる

### Part 2（技術者レベル）

**変更ファイル**:

| ファイル                                                                                            | 変更内容                                                                                          |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `packages/shared/src/types/skillCreator.ts`                                                         | `RuntimeSkillCreatorExecuteErrorResponse` 型追加、`RuntimeSkillCreatorExecuteResponse` union 拡張 |
| `packages/shared/src/types/index.ts`                                                                | 新型エクスポート追加                                                                              |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                               | `_executeInternal()` / `improve()` 先頭にアダプターステータスガード追加                           |
| `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.adapter-status.test.ts` | T-EX-01〜06、T-IM-01〜05、T-REG-01〜02 追加、T-COMPAT-02 更新                                     |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                                  | execute ack 後に `getWorkflowState()` で failure snapshot を再取得                                |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                | `executePlan` の structured error を message へ正規化、`rawExecuteDetail` の型整合                |
| `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`                              | improve 失敗時の `recordImproveFailure()` を追加                                                  |
| `packages/shared/src/types/__tests__/skillCreator.contract-parity.test.ts`                          | `RuntimeSkillCreatorExecuteResponse` の契約期待値を拡張                                           |

**追加された型**:

```typescript
export interface RuntimeSkillCreatorExecuteErrorResponse {
  success: false;
  error: { code: RuntimeSkillCreatorDegradedReason; message: string };
}

export type RuntimeSkillCreatorExecuteResponse =
  | RuntimeSkillCreatorExecuteResult
  | { type: "terminal_handoff"; bundle: TerminalHandoffBundle }
  | RuntimeSkillCreatorExecuteErrorResponse; // 追加
```

**ガードのパターン（plan/execute/improve 共通）**:

```typescript
if (this._llmAdapterStatus === "failed") {
  return {
    success: false,
    error: {
      code: "llm_adapter_unavailable",
      message: toActionableMessage(this._llmAdapterFailureReason),
    },
  };
}
if (this._llmAdapterStatus === "initializing") {
  return {
    success: false,
    error: {
      code: "llm_adapter_unavailable",
      message: "LLMAdapter の初期化中です。しばらくお待ちください",
    },
  };
}
```

**利用側での discriminant**:

```typescript
const result = await facade.execute(planResult, authMode, apiKey);

if ("success" in result && result.success === false) {
  // RuntimeSkillCreatorExecuteErrorResponse
  console.error(result.error.code, result.error.message);
} else if ("type" in result && result.type === "terminal_handoff") {
  // terminal_handoff
} else {
  // RuntimeSkillCreatorExecuteResult
  console.log("success:", result.success);
}
```

## Task 12-2: システム仕様書更新

### Step 1-A: タスク完了記録

- `task-workflow-completed.md` に TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001 の完了記録を追加
- `aiworkflow-requirements/LOGS.md` を更新
- `task-specification-creator/LOGS.md` を更新

### Step 1-B: 実装状況テーブル更新

`task-workflow-completed.md` / `task-workflow-backlog.md` の current facts と、`task-workflow.md` の index summary を本タスクの完了状態に更新。

### Step 1-C: 関連タスクテーブル更新

TASK-RT-01 の「関連タスク」テーブルで、本タスクのステータスを更新。

### Step 2: 新規インターフェース追加（条件付き）

`RuntimeSkillCreatorExecuteErrorResponse` は新規インターフェースのため **Step 2 が必要**。

`aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md` を主対象に、必要に応じて `api-ipc-system-core.md` / `arch-electron-services-details-part2.md` へ追記。

## Task 12-3: ドキュメント更新履歴

成果物: `outputs/phase-12/documentation-changelog.md`

| Step     | 内容                                                     | 結果      |
| -------- | -------------------------------------------------------- | --------- |
| Step 1-A | task-workflow-completed.md 完了記録追加                  | completed |
| Step 1-A | LOGS.md ×2 更新                                          | completed |
| Step 1-B | 実装状況テーブル更新                                     | completed |
| Step 1-C | 関連タスクテーブル更新                                   | completed |
| Step 2   | `RuntimeSkillCreatorExecuteErrorResponse` を仕様書に追記 | completed |

## Task 12-4: 未タスク検出レポート

成果物: `outputs/phase-12/unassigned-task-detection.md`

Phase 10 で洗い出した MINOR 指摘事項:

1. `verifyAndImproveLoop()` 内の `improve()` adapter エラー時のユーザー通知改善
2. `executeAsync()` の adapter エラーを `onWorkflowStateSnapshot` に伝搬する際のメッセージフォーマット統一

## Task 12-5: スキルフィードバックレポート

成果物: `outputs/phase-12/skill-feedback-report.md`

| 観点         | フィードバック                                                                                                                                              |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テンプレート | Phase 4 のテストマトリクスに `mockPlanResult` 定義の共有化を明示するテンプレート追加を検討                                                                  |
| ワークフロー | adapter ガードの同一パターンが 3 箇所（plan/execute/improve）に存在する場合、Phase 8 で共通化 vs インライン維持の判断ルールを template に追加することを提案 |
| ドキュメント | 改善なし                                                                                                                                                    |

## 成果物チェックリスト（Phase 12 ハードゲート）

| 成果物                                | パス                                                     | 必須 |
| ------------------------------------- | -------------------------------------------------------- | ---- |
| implementation-guide.md               | `outputs/phase-12/implementation-guide.md`               | ✅   |
| system-spec-update-summary.md         | `outputs/phase-12/system-spec-update-summary.md`         | ✅   |
| documentation-changelog.md            | `outputs/phase-12/documentation-changelog.md`            | ✅   |
| unassigned-task-detection.md          | `outputs/phase-12/unassigned-task-detection.md`          | ✅   |
| skill-feedback-report.md              | `outputs/phase-12/skill-feedback-report.md`              | ✅   |
| phase12-task-spec-compliance-check.md | `outputs/phase-12/phase12-task-spec-compliance-check.md` | ✅   |

## 完了条件

- [x] `implementation-guide.md` が Part 1/2 を満たす
- [x] `system-spec-update-summary.md` が Step 1-A〜1-C / Step 2 結果を記録する
- [x] `documentation-changelog.md` が全 Step を記録する
- [x] `unassigned-task-detection.md` が 2 件の MINOR 未タスクを記録する
- [x] `skill-feedback-report.md` が観点ごとに記録する
- [x] `phase12-task-spec-compliance-check.md` が作成される
- [x] 計画語（「予定」「TODO」「will be」）が成果物に残っていない

## 次のPhase

Phase 13: PR 作成（user 指示待ち / blocked）

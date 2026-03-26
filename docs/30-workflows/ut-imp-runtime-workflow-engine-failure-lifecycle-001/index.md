# UT-IMP-RUNTIME-WORKFLOW-ENGINE-FAILURE-LIFECYCLE-001: Runtime workflow engine の失敗系 state lifecycle 是正

## メタ情報

| 項目         | 内容                                                                                          |
| ------------ | --------------------------------------------------------------------------------------------- |
| タスクID     | UT-IMP-RUNTIME-WORKFLOW-ENGINE-FAILURE-LIFECYCLE-001                                          |
| タスク種別   | バグ修正                                                                                      |
| 優先度       | 高                                                                                            |
| 複雑度       | medium                                                                                        |
| ステータス   | spec_created                                                                                  |
| 親タスク     | TASK-SDK-02                                                                                   |
| 関連下流     | TASK-SDK-04, TASK-SDK-08                                                                      |
| 元タスク     | `docs/30-workflows/unassigned-task/task-fix-runtime-workflow-engine-failure-lifecycle-001.md` |
| GitHub Issue | #1646                                                                                         |
| Issue確認日  | 2026-03-26                                                                                    |
| Issue状態    | CLOSED                                                                                        |
| 作成日       | 2026-03-26                                                                                    |

## 概要

`SkillCreatorWorkflowEngine` と `RuntimeSkillCreatorFacade.execute()` の失敗系遷移を、実装者がそのまま着手できる 13 Phase 仕様へ分解した task spec である。

主題は単なる例外処理追加ではない。reject、`success:false`、verify fail review の 3 経路で `currentPhase`、`awaitingUserInput`、`verifyResult`、phase artifact 履歴を矛盾なく保存し、Task04 / Task08 が前提にする resume・review 契約を壊さないことにある。

## この task で固定すること

- execute 失敗系 3 経路の canonical transition
- invalid transition guard の導入方針
- `verification_review` prompt / reason の成立条件
- phase artifact 履歴戦略を append 正本へ揃える判断
- code / docs / tests を同一 wave で更新する順序

## 非対象

- Task04 の UI 実装本体
- session persistence の永続化機構
- terminal handoff surface のデザイン改善
- Skill Creator lane 全体の再設計

## 受入基準

| ID   | 基準                                                                                     |
| ---- | ---------------------------------------------------------------------------------------- |
| AC-1 | `skillExecutor.execute()` reject 時も workflow snapshot が失敗系の正しい状態で保存される |
| AC-2 | `success:false` の execute 結果で `verify/pending` に遷移しない                          |
| AC-3 | verify fail review 時に `awaitingUserInput.reason === "verification_review"` が成立する  |
| AC-4 | invalid transition が拒否され、`plan -> verify` などの飛び越し遷移が通らない             |
| AC-5 | phase artifact 履歴戦略が code / tests / ownership 文書で一致する                        |
| AC-6 | Task04 / Task08 の前提契約を破壊しない                                                   |

## 依存関係

| 種別        | 参照先                                                                                                    | 役割                                 |
| ----------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| predecessor | `../../step-02-seq-task-02-workflow-engine-runtime-orchestration/index.md`                                | workflow engine 導入時の基礎契約     |
| downstream  | `../../skill-creator-agent-sdk-lane/step-03-par-task-04-user-interaction-bridge-and-phase-ui/index.md`    | `awaitingUserInput` / review UI 前提 |
| downstream  | `../../skill-creator-agent-sdk-lane/step-06-seq-task-08-session-persistence-and-resume-contract/index.md` | `resumeTokenEnvelope` と互換性契約   |
| source      | `../../unassigned-task/task-fix-runtime-workflow-engine-failure-lifecycle-001.md`                         | 元の問題定義とスコープ               |

## 現行コードアンカー

| ファイル                                                                                                    | 観察点                                                |
| ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                                       | execute reject / result handling の入口               |
| `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`                                      | transition / artifact / review state owner            |
| `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts`                       | engine 遷移テスト                                     |
| `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.workflow-orchestration.test.ts` | facade と engine の統合遷移テスト                     |
| `packages/shared/src/types/skillCreator.ts`                                                                 | `awaitingUserInput` / `verifyResult` 契約の shared 型 |

## 要件レビュー一次結論

| 観点                 | 結論                                                                                                |
| -------------------- | --------------------------------------------------------------------------------------------------- |
| 真の論点             | 正常系が通ることではなく、失敗系でも engine が source of truth であり続けること                     |
| 依存関係・責務境界   | facade は外部呼び出しの捕捉と public response 形成、engine は phase/state/artifact owner に限定する |
| 価値とコストの不均衡 | UI 改修や persistence まで抱えると膨張するため、失敗系 lifecycle の閉包だけに絞る                   |
| 改善優先順位         | 1. transition 契約 2. artifact 戦略 3. tests 4. docs sync                                           |
| 4条件評価            | 価値性・実現性・整合性・運用性の 4 条件を、失敗系 path 固定と downstream 保護で満たす               |

## ディレクトリ構成

```text
ut-imp-runtime-workflow-engine-failure-lifecycle-001/
├── index.md
├── artifacts.json
├── phase-1-requirements.md
├── phase-2-design.md
├── phase-3-design-review.md
├── phase-4-test-creation.md
├── phase-5-implementation.md
├── phase-6-test-expansion.md
├── phase-7-coverage-check.md
├── phase-8-refactoring.md
├── phase-9-quality-assurance.md
├── phase-10-final-review.md
├── phase-11-manual-test.md
├── phase-12-documentation.md
├── phase-13-pr-creation.md
└── outputs/
    ├── artifacts.json
    ├── verification-report.md
    ├── phase-1/spec-extraction-map.md
    ├── phase-2/failure-transition-matrix.md
    ├── phase-2/artifact-history-decision.md
    ├── phase-3/design-review-gate.md
    ├── phase-4/test-matrix.md
    ├── phase-11/manual-test-checklist.md
    ├── phase-11/manual-test-result.md
    ├── phase-11/discovered-issues.md
    ├── phase-12/implementation-guide.md
    ├── phase-12/system-spec-update-summary.md
    ├── phase-12/documentation-changelog.md
    ├── phase-12/unassigned-task-detection.md
    ├── phase-12/skill-feedback-report.md
    ├── phase-12/phase12-task-spec-compliance-check.md
    └── phase-13/
        ├── local-check-result.md
        └── change-summary.md
```

## 実装者向けクイックガイド

### 着手条件

- `TASK-SDK-02` の Phase 1-3 を読了している
- Task04 が `verification_review` と `awaitingUserInput` を UI 契約として使う前提を理解している
- phase artifact 履歴を append 正本へ統一する判断に合意している

### 想定変更ポイント

- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`
- `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts`
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.workflow-orchestration.test.ts`
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`
- `docs/30-workflows/step-02-seq-task-02-workflow-engine-runtime-orchestration/outputs/phase-2/ownership-matrix.md`
- `docs/30-workflows/step-02-seq-task-02-workflow-engine-runtime-orchestration/phase-6-test-expansion.md`

### Phase 一覧

| Phase | 名称             | 仕様書                                                         | ステータス   |
| ----- | ---------------- | -------------------------------------------------------------- | ------------ |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | spec_created |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | spec_created |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | spec_created |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | spec_created |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | spec_created |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | spec_created |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | spec_created |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | spec_created |
| 9     | 品質保証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | spec_created |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | spec_created |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | spec_created |
| 12    | ドキュメント更新 | [phase-12-documentation.md](./phase-12-documentation.md)       | spec_created |
| 13    | PR作成           | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | blocked      |

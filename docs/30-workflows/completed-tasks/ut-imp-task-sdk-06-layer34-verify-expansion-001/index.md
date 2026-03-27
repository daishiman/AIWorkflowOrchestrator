# UT-IMP-TASK-SDK-06-LAYER34-VERIFY-EXPANSION-001: TASK-SDK-06 の Layer 3 / Layer 4 verify 拡張

## メタ情報

| 項目         | 内容                                                                                                     |
| ------------ | -------------------------------------------------------------------------------------------------------- |
| タスクID     | UT-IMP-TASK-SDK-06-LAYER34-VERIFY-EXPANSION-001                                                          |
| タスク種別   | 設計 / contract-first improvement                                                                        |
| 優先度       | 高                                                                                                       |
| 複雑度       | medium                                                                                                   |
| ステータス   | spec_created                                                                                             |
| 親タスク     | TASK-SDK-06                                                                                              |
| 依存タスク   | TASK-SDK-06, TASK-SDK-07, TASK-SDK-08                                                                    |
| 元タスク     | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task-sdk-06-layer34-verify-expansion-001.md` |
| GitHub Issue | #1655                                                                                                    |
| Issue確認日  | 2026-03-27                                                                                               |
| Issue状態    | CLOSED                                                                                                   |
| 作成日       | 2026-03-27                                                                                               |

## 概要

`TASK-SDK-06` が Layer 1 / Layer 2 verify に限定して残した deferred scope を、Layer 3 / Layer 4 verify 専用の 13 Phase 実行仕様へ分解した task spec である。

主題は verify 情報を増やすこと自体ではない。`verifyResult` / provenance / route snapshot / re-verify action を deeper surface へ拡張しつつ、Task07 の governance owner と Task08 の session compatibility owner を壊さない責務境界を固定することにある。

## この task で固定すること

- Layer 3 / Layer 4 verify の canonical concern set
- shared types / IPC / preload / facade / renderer の貫通 field set
- provenance detail、route snapshot、hash evidence、re-verify action の接続順
- Task07 / Task08 へ委譲する governance / session 項目の明示
- validation matrix、manual walkthrough、Phase 12 close-out の閉じ方

## 非対象

- Task07 の approval / disclosure / manual boundary hardening
- Task08 の persistence / resume invalidation 実装
- terminal handoff UX の再設計
- create mainline の遷移変更
- verify 用の別実行エンジン新設

## 依存関係

| 種別        | 参照先                                                                                                           | 役割                                       |
| ----------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| predecessor | `docs/30-workflows/step-04-par-task-06-verify-and-improve-lifecycle-surface/`                                    | Layer 1 / 2 verify と deferred gap の正本  |
| sibling     | `docs/30-workflows/skill-creator-agent-sdk-lane/step-05-seq-task-07-execution-governance-and-handoff-alignment/` | governance / handoff / disclosure owner    |
| sibling     | `docs/30-workflows/skill-creator-agent-sdk-lane/step-06-seq-task-08-session-persistence-and-resume-contract/`    | session persistence / resume compatibility |
| source      | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task-sdk-06-layer34-verify-expansion-001.md`         | 元の問題定義、Why/What/How、完了条件       |

## 現行コードアンカー

| ファイル                                                                  | 現状の役割                                                     | 本 task での扱い                                          |
| ------------------------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------- |
| `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`    | `verifyResult` / `routeSnapshot` / `sourceProvenance` の owner | owner は維持し、Layer 3 / 4 DTO を読む側へ拡張する        |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`     | verify / improve / apply / route decision の public bridge     | Layer 3 / 4 verify の bridge と re-verify contract を整理 |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`                            | runtime public surface の IPC 入口                             | DTO 追加時の validation / response shape を固定する       |
| `apps/desktop/src/preload/skill-creator-api.ts`                           | renderer からの呼び出し面                                      | Layer 3 / 4 verify detail API の exposure を定義する      |
| `apps/desktop/src/renderer/components/skill/ImprovementProposalPanel.tsx` | Task06 の improve / apply host                                 | deeper verify section と re-verify action の host 候補    |
| `packages/shared/src/types/skillCreator.ts`                               | runtime workflow shared DTO の配置先                           | Layer 3 / 4 verify detail DTO の canonical 追加先         |

## Current Canonical Facts From Branch

- Task06 は Layer 1 / Layer 2 verify までを初回 scope とし、Layer 3 / Layer 4 verify を future scope として明示済みである。
- `verifyResult`、`routeSnapshot`、`sourceProvenance` の truth owner は `SkillCreatorWorkflowEngine` のまま維持する前提である。
- Task07 は route priority、approval、disclosure、manual boundary を owner とし、Task06/本 task は governance owner にならない。
- Task08 は persistence / compatibility / checkpoint を owner とし、本 task は session semantics を参照するが所有しない。
- 未タスク原票と GitHub Issue #1655 は、genuine gap を Layer 3 / Layer 4 verify だけへ絞る方針で一致している。

## 要件レビュー一次結論

| 観点                 | 結論                                                                                               |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| 真の論点             | deeper verify を増やしても owner 境界を増やさず、Layer 3 / Layer 4 contract を説明可能にすること   |
| 依存関係・責務境界   | governance は Task07、session semantics は Task08 に固定し、本 task は verify surface だけを閉じる |
| 価値とコストの不均衡 | 実装より先に DTO / IPC / renderer / validation の対応表を固定する方が再作業防止価値が高い          |
| 改善優先順位         | 1. concern inventory 2. contract matrix 3. sibling boundary 4. test matrix 5. close-out            |
| 4条件評価            | 価値性・実現性・整合性・運用性を、verify depth の分離と evidence 設計で満たす                      |

## ディレクトリ構成

```text
ut-imp-task-sdk-06-layer34-verify-expansion-001/
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
    ├── phase-2/layer34-contract-matrix.md
    ├── phase-2/sibling-boundary-decision.md
    ├── phase-3/design-review-gate.md
    ├── phase-3/skill-compliance-and-elegance-review.md
    ├── phase-4/test-matrix.md
    ├── phase-5/implementation-sequencing.md
    ├── phase-6/test-expansion-summary.md
    ├── phase-7/coverage-summary.md
    ├── phase-8/refactoring-summary.md
    ├── phase-9/qa-summary.md
    ├── phase-10/final-review-summary.md
    ├── phase-11/manual-test-checklist.md
    ├── phase-11/manual-test-result.md
    ├── phase-11/discovered-issues.md
    ├── phase-11/screenshot-plan.json
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

- Task06 の `outputs/phase-1/spec-extraction-map.md`、`outputs/phase-2/verify-improve-surface-matrix.md`、`outputs/phase-2/validation-matrix.md` を読了している
- Task07 が governance owner、Task08 が session compatibility owner であることを理解している
- 初回 scope を Layer 3 / Layer 4 verify の contract expansion に限定することへ合意している

### 想定変更ポイント

- `packages/shared/src/types/skillCreator.ts`
- `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `apps/desktop/src/main/ipc/creatorHandlers.ts`
- `apps/desktop/src/preload/skill-creator-api.ts`
- `apps/desktop/src/renderer/components/skill/ImprovementProposalPanel.tsx`

### 完了イメージ

- Layer 3 / Layer 4 verify で何を表示し、何を表示しても owner が変わらないかを 1 枚で説明できる
- Task07 / Task08 へ委譲する境界が DTO / UI / manual test の全てで一致している
- unit / integration / docs QA / manual walkthrough の検証観点が implementation 前に固定されている

## Phase 一覧

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

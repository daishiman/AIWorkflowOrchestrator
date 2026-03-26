# TASK-SDK-02: workflow-engine-runtime-orchestration

## 概要

`RuntimeSkillCreatorFacade` を public runtime surface に固定し、未実装の `SkillCreatorWorkflowEngine` へ phase 遷移、成果物管理、`resumeToken` envelope、`verifyResult` を集約する task 仕様書である。

この task は「実装を増やすこと」ではなく、**state owner の曖昧さを消すこと**を主目的に置く。Task03 / Task04 / Task07 / Task08 が依存する基準点をここで閉じる。

## この task で固定すること

- facade / engine / renderer の責務境界
- `currentPhase` / `awaitingUserInput` / `verifyResult` / phase artifacts / `resumeToken` envelope の owner
- `integrated_api` / `terminal_handoff` の lane response baseline
- `execute()` の workflow engine 経由化に向けた中間段階
- dynamic source root / manifest snapshot を engine input として扱う境界
- Task03 / Task04 / Task07 / Task08 へ引き渡す dependency contract

## 非対象

- selective loading と context budget 最適化
- 主導線 UI の一本化
- verify / improve surface の詳細実装
- `resumeToken` invalidation semantics と checkpoint 破棄条件の最終確定

## 依存関係

| 種別        | 参照先                                                                         | 役割                                                  |
| ----------- | ------------------------------------------------------------------------------ | ----------------------------------------------------- |
| predecessor | `../completed-tasks/step-01-seq-task-01-manifest-contract-foundation/index.md` | manifest scope / non-scope の基礎契約                 |
| downstream  | `../step-03-par-task-03-context-budget-and-resource-selection/index.md`        | source discovery、resource selection、degrade trigger |
| downstream  | `../step-03-par-task-04-user-interaction-bridge-and-phase-ui/index.md`         | `awaitingUserInput` と interaction bridge             |
| downstream  | `../step-05-seq-task-07-execution-governance-and-handoff-alignment/index.md`   | governance / handoff / approval hardening             |
| downstream  | `../step-06-seq-task-08-session-persistence-and-resume-contract/index.md`      | `resumeToken` compatibility / invalidation            |

## 現行コードアンカー

| ファイル                                                               | 現状の責務                                                              | Task02 での扱い                                          |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------- |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`  | public runtime service、auth 分岐、handoff 生成、executor/improver 委譲 | facade の責務を固定し、workflow state owner を持たせない |
| `apps/desktop/src/main/services/skill/constants.ts`                    | `DEFAULT_SKILL_CREATOR_PATH` を含む candidate path 解決                 | 単一正本とみなさず engine input へ落とし込む             |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`                         | `skill-creator:*` runtime invoke handler                                | facade の public entrypoint として維持                   |
| `apps/desktop/src/preload/skill-creator-api.ts`                        | renderer へ公開する API surface                                         | public method 名を維持しつつ response contract を揃える  |
| `packages/shared/src/types/skillCreator.ts`                            | runtime plan / execute / improve の shared contract                     | public union 型を正本化し drift を止める                 |
| `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` | 未存在                                                                  | Task02 で新設対象として責務を確定する                    |

## 完了イメージ

- facade / engine / renderer state の owner 表がある
- `integrated_api` / `terminal_handoff` の戻り方を Task07 が前提にできる
- Task03 / Task04 が `currentPhase` と `awaitingUserInput` を参照して設計できる
- Task03 が source discovery を設計できるよう、engine が source provenance snapshot を持てる
- Task08 が `resumeToken` envelope を受け取り、互換性論点だけに集中できる

## 要件レビュー一次結論

| 観点                 | 結論                                                                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 真の論点             | workflow state owner を `RuntimeSkillCreatorFacade` から切り離し、engine に閉じること                                                |
| 依存関係・責務境界   | manifest 契約と loader 境界は Task01 で固定済みであり、Task02 はその上に phase/state owner を積む                                    |
| 価値とコストの不均衡 | route baseline と owner 固定は初回価値が高い一方、verify 詳細・UI 全面統合・session persistence 本実装は高コストなので後続へ分離する |
| 改善優先順位         | 1) owner 分離 2) public contract parity 3) downstream handoff 明文化 4) verify / governance / resume の委譲                          |
| 4条件評価            | 価値性・実現性・整合性・運用性の 4 条件を満たすよう、Task01 の foundation contract を再利用しつつ scope を絞る                       |

## ディレクトリ構成

```text
step-02-seq-task-02-workflow-engine-runtime-orchestration/
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
    ├── phase-1/spec-extraction-map.md
    ├── phase-2/ownership-matrix.md
    ├── phase-3/design-review-gate.md
    ├── phase-4/test-matrix.md
    ├── phase-5/implementation-summary.md
    ├── phase-6/test-expansion-summary.md
    ├── phase-7/coverage-summary.md
    ├── phase-8/refactoring-summary.md
    ├── phase-9/qa-summary.md
    ├── phase-10/final-review-summary.md
    ├── phase-11/manual-test-checklist.md
    ├── phase-11/manual-test-result.md
    ├── phase-11/screenshot-plan.json
    ├── phase-11/screenshots/placeholder.png
    └── phase-12/
        ├── implementation-guide.md
        ├── system-spec-update-summary.md
        ├── documentation-changelog.md
        ├── unassigned-task-detection.md
        ├── skill-feedback-report.md
        └── phase12-task-spec-compliance-check.md
```

## Phase 一覧

- [phase-1-requirements.md](./phase-1-requirements.md)
- [phase-2-design.md](./phase-2-design.md)
- [phase-3-design-review.md](./phase-3-design-review.md)
- [phase-4-test-creation.md](./phase-4-test-creation.md)
- [phase-5-implementation.md](./phase-5-implementation.md)
- [phase-6-test-expansion.md](./phase-6-test-expansion.md)
- [phase-7-coverage-check.md](./phase-7-coverage-check.md)
- [phase-8-refactoring.md](./phase-8-refactoring.md)
- [phase-9-quality-assurance.md](./phase-9-quality-assurance.md)
- [phase-10-final-review.md](./phase-10-final-review.md)
- [phase-11-manual-test.md](./phase-11-manual-test.md)
- [phase-12-documentation.md](./phase-12-documentation.md)
- [phase-13-pr-creation.md](./phase-13-pr-creation.md)

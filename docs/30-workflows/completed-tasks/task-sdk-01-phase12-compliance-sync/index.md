# task-sdk-01-phase12-compliance-sync - タスク実行仕様書

## ユーザーからの元の指示

```text
@docs/30-workflows/completed-tasks/unassigned-task/task-imp-task-sdk-01-phase12-compliance-sync-001.md
```

## 概要

本 workflow は、[task-imp-task-sdk-01-phase12-compliance-sync-001.md](../unassigned-task/task-imp-task-sdk-01-phase12-compliance-sync-001.md) を実行するための spec-first workflow である。親 task `TASK-SDK-01` は `completed-tasks` 配下に存在するが、Issue #1643 の対象は「close-out 済みに見える Phase 12 の監査証跡を current facts へ揃え直す」点にあるため、follow-up workflow として独立管理する。

## 目的

- TASK-SDK-01 の Phase 12 4点同期と本文証跡のずれを是正する
- `implementation-guide.md` / `system-spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `phase12-task-spec-compliance-check.md` の品質基準を fixed order で満たす
- `task-workflow-completed.md` と `task-workflow-backlog.md`、lessons、index 再生成までを 1 つの workflow として実行できる状態にする

## Phase 1-3 設計結果

| Phase | 成果                                                  | 参照                                                   |
| ----- | ----------------------------------------------------- | ------------------------------------------------------ |
| 1     | 要件、スコープ、受入基準、spec extraction map を確定  | [phase-1-requirements.md](./phase-1-requirements.md)   |
| 2     | 変更面、実行順、3 lane 設計、validation matrix を確定 | [phase-2-design.md](./phase-2-design.md)               |
| 3     | Phase 4 着手可否を PASS 判定し、戻り条件を固定        | [phase-3-design-review.md](./phase-3-design-review.md) |

## 実行対象

| 区分           | パス                                                                                                    | 役割           |
| -------------- | ------------------------------------------------------------------------------------------------------- | -------------- |
| 元 task 指示書 | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task-sdk-01-phase12-compliance-sync-001.md` | follow-up 正本 |
| 親 workflow    | `docs/30-workflows/completed-tasks/step-01-seq-task-01-manifest-contract-foundation/`                   | 是正対象       |
| ledger         | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`                          | 完了記録の根拠 |
| backlog        | `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`                            | 未タスク正本   |
| lessons        | `.claude/skills/aiworkflow-requirements/references/lessons-learned-phase12-workflow-lifecycle.md`       | 再発防止ルール |

## Phase一覧

| Phase | 名称             | 仕様書                                                         | ステータス |
| ----- | ---------------- | -------------------------------------------------------------- | ---------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | completed  |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | completed  |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | completed  |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | completed  |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | completed  |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | completed  |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | completed  |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | completed  |
| 9     | 品質保証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | completed  |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | completed  |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | completed  |
| 12    | ドキュメント更新 | [phase-12-documentation.md](./phase-12-documentation.md)       | completed  |
| 13    | PR作成           | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | blocked    |

## 実行順

1. Phase 1-3 で固定した file inventory と validation matrix を崩さない
2. Phase 4 で command suite を確定する
3. Phase 5 で親 workflow と aiworkflow-requirements 正本を更新する
4. Phase 6-10 で drift 再発を防ぐ
5. Phase 11-12 で non-visual manual review と Phase 12 成果物同期を閉じる
6. Phase 13 はユーザー指示があるまで blocked のまま維持する

## 実行結果

| 項目                                                                                   | 結果                          |
| -------------------------------------------------------------------------------------- | ----------------------------- |
| parent workflow Phase 12 outputs 是正                                                  | 完了                          |
| `generate-index.js` Phase status drift 修正                                            | 完了                          |
| `verify-all-specs` / `validate-phase-output` / `validate-phase12-implementation-guide` | PASS                          |
| `audit-unassigned-tasks --target-file`                                                 | `currentViolations.total = 0` |

## 受入基準

- AC-1: `index.md` / `phase-12-documentation.md` / `artifacts.json` / `outputs/artifacts.json` の status 同期手順が定義されている
- AC-2: Step 1-A〜1-C と Step 2 の更新対象、no-op 判定基準、証跡出力先が定義されている
- AC-3: `task-workflow-completed.md` に既にある follow-up 参照と `task-workflow-backlog.md` の canonical path が接続されている
- AC-4: commit / PR / push を実行しない運用が Phase 13 まで維持されている

## 完了定義

| 状態                   | 意味                                                                |
| ---------------------- | ------------------------------------------------------------------- |
| `spec_created`         | workflow と Phase 1-13 仕様書が揃い、実行順と検証方法が確定した状態 |
| `implementation_ready` | Phase 1-3 gate が閉じ、実行担当者が Phase 4 へ進める状態            |
| `completed`            | 親 workflow と aiworkflow-requirements 正本の是正が閉じた状態       |

## 注意事項

- 本 workflow は parent workflow / ledger / tooling の是正を主対象にしつつ、ユーザー指示で `packages/shared` / `apps/desktop` の manifest hardening も同一ターンで扱う。コミット、PR 作成、push は行わない
- `completed-tasks` 配下の親 workflow を対象にしていても、Issue #1643 の follow-up は独立 task として進める
- 未タスク正本は `docs/30-workflows/unassigned-task/` を使い、workflow 個別の unassigned-task path は増やさない

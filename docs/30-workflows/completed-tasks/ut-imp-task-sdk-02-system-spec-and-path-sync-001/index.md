# UT-IMP-TASK-SDK-02-SYSTEM-SPEC-AND-PATH-SYNC-001 ワークフロー

## 概要

`TASK-SDK-02` の Phase 12 再監査で露出した `system spec same-wave sync` 漏れと workflow path drift を、docs-only の remediation workflow として是正するための task 仕様書である。

主問題は「実装済み current fact が canonical set と workflow inventory に閉じていないこと」であり、コード追加ではなく、仕様正本・台帳・link/path・artifact parity を同一 wave で閉じることを目的にする。

## メタ情報

| 項目         | 値                                                                                                        |
| ------------ | --------------------------------------------------------------------------------------------------------- |
| タスクID     | UT-IMP-TASK-SDK-02-SYSTEM-SPEC-AND-PATH-SYNC-001                                                          |
| タスク名     | TASK-SDK-02 の system spec same-wave 同期と path drift 是正                                               |
| ステータス   | `spec_created`                                                                                            |
| 分類         | docs-only improvement                                                                                     |
| 優先度       | 高                                                                                                        |
| 見積もり規模 | 大規模                                                                                                    |
| 親 workflow  | `docs/30-workflows/completed-tasks/step-02-seq-task-02-workflow-engine-runtime-orchestration/`            |
| 入力 task    | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task-sdk-02-system-spec-and-path-sync-001.md` |
| 関連 Issue   | #1647                                                                                                     |
| 作成日       | 2026-03-26                                                                                                |

## 目的

1. `TASK-SDK-02` の current facts を canonical system spec へ同期する
2. `task-workflow` / `lessons` / index 導線へ完了事実を same-wave で閉じる
3. workflow 本文 / `artifacts.json` / `outputs/artifacts.json` / downstream link の path drift を解消する
4. 未完了表現や pending memo を残さず、docs-only remediation の完了判定を機械検証可能にする

## この workflow で固定すること

- current canonical set の確定
- same-wave 更新対象の順番
- `parentWorkflow` / relative link / artifact inventory の正規化
- 未完了表現 0 件、旧 path 0 件、validator PASS を完了条件にする運用
- follow-up を新設しない場合の no-op 根拠の残し方

## 非対象

- `SkillCreatorWorkflowEngine` や runtime 実装の追加修正
- Task03 / Task04 以降の downstream 実装
- commit、PR 作成、push

## 依存関係

| 種別        | 参照先                                                                                                    | 役割                                |
| ----------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| predecessor | `docs/30-workflows/completed-tasks/step-02-seq-task-02-workflow-engine-runtime-orchestration/index.md`    | current fact と drift 発生源        |
| input       | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task-sdk-02-system-spec-and-path-sync-001.md` | 是正要求の原票                      |
| canonical   | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`                            | TASK-SDK-02 完了記録の current fact |
| canonical   | `.claude/skills/aiworkflow-requirements/references/lessons-learned-phase12-workflow-lifecycle.md`         | Phase 12 same-wave 運用ルール       |

## current canonical set

| 区分             | 対象                                                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| system spec      | `architecture-overview-core.md`, `arch-electron-services-details-part2.md`, `api-ipc-system-core.md`                            |
| ledger / lessons | `task-workflow.md`, `task-workflow-completed.md`, `lessons-learned-current.md`, `lessons-learned-phase12-workflow-lifecycle.md` |
| index 導線       | `indexes/resource-map.md`, `indexes/quick-reference.md`, `indexes/topic-map.md`, `indexes/keywords.json`                        |
| workflow local   | `index.md`, `phase-*.md`, `artifacts.json`, `outputs/artifacts.json`, `outputs/phase-12/*`                                      |
| logs / mirror    | `.claude` canonical と `.agents` mirror parity                                                                                  |

## 完了イメージ

- canonical spec が `SkillCreatorWorkflowEngine` を future ではなく current owner として扱う
- `TASK-SDK-02` の完了事実が ledger / lessons / index から辿れる
- `step-02-seq-task-02-workflow-engine-runtime-orchestration/` 配下の旧相対 path と stale `parentWorkflow` が消える
- `verify-all-specs` と grep 観点で未完了表現 / old path / parity drift が 0 件になる

## ディレクトリ構成

```text
ut-imp-task-sdk-02-system-spec-and-path-sync-001/
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
    ├── phase-2/canonical-sync-target-matrix.md
    ├── phase-3/design-review-gate.md
    ├── phase-4/test-matrix.md
    ├── phase-5/implementation-sequencing.md
    ├── phase-6/test-expansion-summary.md
    ├── phase-7/coverage-summary.md
    ├── phase-8/refactoring-summary.md
    ├── phase-9/qa-summary.md
    ├── phase-10/final-review-summary.md
    ├── phase-11/manual-test-checklist.md
    ├── phase-11/manual-test-result.md
    ├── phase-12/implementation-guide.md
    ├── phase-12/system-spec-update-summary.md
    ├── phase-12/documentation-changelog.md
    ├── phase-12/unassigned-task-detection.md
    ├── phase-12/skill-feedback-report.md
    ├── phase-12/phase12-task-spec-compliance-check.md
    └── phase-13/pr-preparation.md
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

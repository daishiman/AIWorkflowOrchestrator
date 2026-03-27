# UT-IMP-TASK-SDK-04-PHASE12-CANONICAL-PATH-RESYNC-001 ワークフロー

## 概要

`TASK-SDK-04` の Phase 12/13 close-out に残った stale evidence と canonical path drift を、docs-only remediation workflow として是正するための task 仕様書である。

主問題は「Task04 の current facts が completed-tasks 配下の実体、follow-up 導線、verification evidence に閉じていないこと」であり、コード追加ではなく、親 workflow の証跡と説明責務を同一 wave で再同期することを目的にする。

## メタ情報

| 項目         | 値                                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------------------- |
| タスクID     | UT-IMP-TASK-SDK-04-PHASE12-CANONICAL-PATH-RESYNC-001                                                          |
| タスク名     | TASK-SDK-04 の Phase 12/13 証跡と canonical path を最新実装へ再同期する                                       |
| ステータス   | `spec_created`                                                                                                |
| 分類         | docs-only remediation                                                                                         |
| 優先度       | 高                                                                                                            |
| 見積もり規模 | 小規模                                                                                                        |
| 親 workflow  | `docs/30-workflows/completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui/`                 |
| 入力 task    | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task-sdk-04-phase12-canonical-path-resync-001.md` |
| 関連 Issue   | #1662                                                                                                         |
| Issue状態    | CLOSED                                                                                                        |
| Issue確認日  | 2026-03-27                                                                                                    |
| 作成日       | 2026-03-27                                                                                                    |
| 作業 branch  | `task/1662-task-sdk-04-phase12-canonical-path-resync`                                                         |

## 目的

1. `TASK-SDK-04` の Phase 12/13 証跡から旧 canonical path を除去する
2. `spec_created` 維持か completed 昇格かの判断根拠を current code wave に合わせて説明可能にする
3. `UT-SC-02-006` 吸収済み、`TASK-SDK-04-U1..U3` formalize 済み、Task05/07/08 downstream 維持という事実を 1 つの close-out に閉じる
4. validator 実行記録と verification report を current path へそろえる

## この workflow で固定すること

- 親 workflow の current canonical path
- stale evidence の洗い出し順
- `spec_created` 維持判断の基準
- Phase 12 six artifacts と Phase 13 local check の再同期順
- backlog / follow-up / completed-tasks 導線の一貫性

## 非対象

- Task05 / Task07 / Task08 の機能実装
- `esbuild` host/binary mismatch 自体の解消
- 新規 IPC / preload / renderer 契約の追加設計
- commit、PR 作成、push

## 依存関係

| 種別        | 参照先                                                                                                        | 役割                                |
| ----------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| predecessor | `docs/30-workflows/completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui/index.md`         | stale evidence の発生源             |
| input       | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task-sdk-04-phase12-canonical-path-resync-001.md` | 是正要求の原票                      |
| canonical   | `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`                                  | follow-up / backlog の current fact |
| canonical   | `.claude/skills/aiworkflow-requirements/references/lessons-learned-phase12-workflow-lifecycle.md`             | Phase 12 same-wave close-out ルール |
| sibling     | `docs/30-workflows/unassigned-task/task-imp-task-sdk-04-user-input-transition-semantics-001.md`               | `TASK-SDK-04-U1` の責務分離         |
| sibling     | `docs/30-workflows/unassigned-task/task-imp-task-sdk-04-plan-execute-canonical-binding-001.md`                | `TASK-SDK-04-U2` の責務分離         |

## current canonical set

| 区分             | 対象                                                                                                                                               |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| workflow local   | `index.md`, `phase-*.md`, `artifacts.json`, `outputs/artifacts.json`, `outputs/verification-report.md`, `outputs/phase-12/*`, `outputs/phase-13/*` |
| parent workflow  | `docs/30-workflows/completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui/`                                                      |
| ledger / backlog | `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`, `lessons-learned-current.md`, `task-workflow-completed.md`           |
| current facts    | `UT-SC-02-006` 吸収済み、`TASK-SDK-04-U1..U3` formalize 済み、Task04 は `spec_created` 維持                                                        |

## 完了イメージ

- parent workflow の `system-spec-update-summary.md`、`unassigned-task-detection.md`、`local-check-result.md`、`verification-report.md` が current fact へ閉じる
- 旧 path `skill-creator-agent-sdk-lane/.../step-03-par-task-04-user-interaction-bridge-and-phase-ui` が close-out 証跡から消える
- `spec_created` 維持理由が「docs-only だったから」ではなく「Task04 は設計 task であり、current code wave を close-out 証跡へ同期したから」と説明される
- validator 実行コマンドが completed-tasks 配下の current path を指す

## ディレクトリ構成

```text
ut-imp-task-sdk-04-phase12-canonical-path-resync-001/
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
    ├── phase-2/stale-evidence-audit-matrix.md
    ├── phase-2/completed-judgement-decision.md
    ├── phase-3/design-review-gate.md
    ├── phase-4/test-matrix.md
    ├── phase-11/manual-test-checklist.md
    ├── phase-11/manual-test-result.md
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

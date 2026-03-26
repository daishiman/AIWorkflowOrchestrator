# Phase 2: 設計

## メタ情報

| 項目     | 値                                             |
| -------- | ---------------------------------------------- |
| Phase    | 2                                              |
| 機能名   | task-sdk-01-phase12-compliance-sync            |
| 作成日   | 2026-03-26                                     |
| タスクID | UT-IMP-TASK-SDK-01-PHASE12-COMPLIANCE-SYNC-001 |

## 目的

Phase 5 実装でどのファイルをどの順で更新するか、どの validator で閉じるかを設計として固定する。

## 実行タスク

- target topology 設計: 親 workflow、ledger、domain spec、index 再生成の変更面を 3 lane へ分解する
- change surface 設計: 各ファイルの更新理由、更新順、同期条件を table 化する
- validation matrix 設計: command と pass 条件を Phase 単位で固定する

## 参照資料

| 資料名               | パス                                                                                                           | 説明                             |
| -------------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| phase-1 requirements | `phase-1-requirements.md`                                                                                      | FR / NFR / AC                    |
| 要件定義書           | `outputs/phase-1/requirements-definition.md`                                                                   | Phase 1 summary                  |
| spec extraction map  | `outputs/phase-1/spec-extraction-map.md`                                                                       | 対象 spec 対応表                 |
| 親 Phase 12          | `docs/30-workflows/completed-tasks/step-01-seq-task-01-manifest-contract-foundation/phase-12-documentation.md` | 既存 task 12 手順                |
| Step workflow        | `../../../.claude/skills/task-specification-creator/references/spec-update-workflow.md`                        | Step 1 / Step 2 index            |
| manifest foundation  | `../../../.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md`           | parent handoff と authority 境界 |
| lessons              | `../../../.claude/skills/aiworkflow-requirements/references/lessons-learned-phase12-workflow-lifecycle.md`     | no-op 根拠と blocker 重複防止    |

## 設計方針

### 3 lane topology

| lane   | 役割                   | 対象                                                                                                           |
| ------ | ---------------------- | -------------------------------------------------------------------------------------------------------------- |
| Lane A | workflow evidence lane | 親 workflow の `index.md`、`phase-12-documentation.md`、`artifacts.json`、`outputs/artifacts.json`             |
| Lane B | system spec lane       | `task-workflow-completed.md`、`task-workflow-backlog.md`、lessons、domain spec no-op 判定                      |
| Lane C | validation lane        | `verify-all-specs`、`validate-phase-output`、`validate-phase12-implementation-guide`、`audit-unassigned-tasks` |

### change surface

| 区分               | ファイル                                                                                                                                           | 更新内容                                                                   | 実行順 |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------ |
| workflow body      | `index.md`, `phase-12-documentation.md`                                                                                                            | status と完了条件の同期                                                    | 1      |
| artifact inventory | `artifacts.json`, `outputs/artifacts.json`                                                                                                         | root / outputs parity                                                      | 2      |
| phase12 outputs    | `outputs/phase-12/*.md`                                                                                                                            | implementation guide、summary、changelog、detection、compliance の証跡是正 | 3      |
| ledger             | `task-workflow.md`, `task-workflow-completed.md`, `task-workflow-backlog.md`                                                                       | follow-up と canonical path の整合                                         | 4      |
| skill records      | `aiworkflow-requirements/LOGS.md`, `task-specification-creator/LOGS.md`, `aiworkflow-requirements/SKILL.md`, `task-specification-creator/SKILL.md` | Step 1-A same-wave 記録                                                    | 5      |
| lessons / index    | lessons、`topic-map.md`, `keywords.json`                                                                                                           | same-wave 記録と再生成                                                     | 6      |

### validation matrix

| command                                                                                                                                                                                                       | 目的                                       | pass 条件           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ------------------- |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/step-01-seq-task-01-manifest-contract-foundation --strict`                           | workflow 全体の構造検証                    | error 0             |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/step-01-seq-task-01-manifest-contract-foundation`                                          | Phase file / outputs parity 検証           | error 0             |
| `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/completed-tasks/step-01-seq-task-01-manifest-contract-foundation`               | Part 1 / Part 2 準拠確認                   | PASS                |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/completed-tasks/unassigned-task/task-imp-task-sdk-01-phase12-compliance-sync-001.md` | canonical path 品質監査                    | currentViolations 0 |
| `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`                                                                                                                                       | topic-map / keywords / resource-map 再生成 | error 0             |

## 実行手順

### ステップ1: Lane A を先に閉じる

4点同期対象と Phase 12 outputs の本文差分をなくし、後続 lane の入力を 1 つに揃える。

### ステップ2: Lane B で ledger と no-op 根拠を記録する

親 `task-workflow.md`、completed ledger、backlog、LOGS 2ファイル、SKILL 2ファイルの整合を取り、Step 2 が no-op の時は理由を summary と changelog に固定する。

### ステップ3: Lane C で validator をまとめて実行する

構造検証、Phase 12 guide 検証、unassigned-task 監査を流し、Phase 10 / 11 / 12 の証跡へ転記する。

## 統合テスト連携

| 観点           | 実施内容                                                             |
| -------------- | -------------------------------------------------------------------- |
| command parity | root workflow と execution workflow の command 差分をなくす          |
| doc parity     | summary / changelog / compliance-check の主張を一致させる            |
| ledger parity  | backlog / completed ledger / lessons の task ID と path を一致させる |
| blocker reuse  | `esbuild` blocker を重複起票しない                                   |

## 多角的チェック観点

| 観点         | この Phase で確認する内容                                      |
| ------------ | -------------------------------------------------------------- |
| MECE         | Lane A / B / C の責務が混ざっていないか                        |
| 依存関係     | validator が stale input を見ない順番になっているか            |
| リスク最小化 | close-out 是正と manifest hardening の責務境界が崩れていないか |

## サブタスク管理

1. 3 lane topology の固定
2. change surface matrix の作成
3. validation matrix の作成
4. Phase 3 へ渡すレビュー観点の整理

## 成果物

| 成果物                | パス                                       | 説明                   |
| --------------------- | ------------------------------------------ | ---------------------- |
| design summary        | `outputs/phase-2/design-summary.md`        | 実行順と lane 設計     |
| change surface matrix | `outputs/phase-2/change-surface-matrix.md` | ファイル単位の更新設計 |
| validation matrix     | `outputs/phase-2/validation-matrix.md`     | command と pass 条件   |

## 完了条件

- [ ] 3 lane topology が table で定義されている
- [ ] change surface が file 単位で整理されている
- [ ] validation matrix が command 単位で定義されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] Phase 1 の FR / NFR / AC を参照した
- [ ] Lane A / B / C を定義した
- [ ] change surface を整理した
- [ ] validation matrix を定義した

## 次のPhase

Phase 3: 設計レビュー

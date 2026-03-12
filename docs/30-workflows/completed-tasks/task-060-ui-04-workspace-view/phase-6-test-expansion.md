# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| タスクID   | TASK-UI-04-WORKSPACE-VIEW |
| Phase      | 6                         |
| Phase名    | テスト拡充                |
| ステータス | completed                 |
| 前提Phase  | Phase 5                   |
| 後続Phase  | Phase 7                   |

## 目的

contract test を child workflow status、system spec path drift、parent pointer 接続まで拡張し、文書監査の抜けを減らす。

## 実行タスク

- タスク1: cross-doc audit を追加する
- タスク2: path drift の負例検証を追加する
- タスク3: evidence inheritance 検証を追加する

### タスク1: cross-doc audit

| 対象           | 追加検証                                              |
| -------------- | ----------------------------------------------------- |
| parent pointer | workflow root 入口があること                          |
| master index   | Step 6-D の parent role が維持されていること          |
| task-workflow  | child 完了状態と parent spec_created が矛盾しないこと |

### タスク2: path drift 負例検証

- current path と completed path の混在を grep で検出する。
- 04B path が stale な場合は Phase 5 へ戻す。
- parent spec が child status を自前で実装した場合は Phase 5 へ戻す。

### タスク3: evidence inheritance 検証

| child workflow | 継承確認項目                     |
| -------------- | -------------------------------- |
| 04A            | Phase 11 screenshot 8件への入口  |
| 04B            | Phase 11 screenshot 8件への入口  |
| 04C            | Phase 11 screenshot 11件への入口 |

## 参照資料

| 参照資料                     | パス                                                                                               | 説明            |
| ---------------------------- | -------------------------------------------------------------------------------------------------- | --------------- |
| Phase 4 成果物               | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-4/`                 | command set     |
| Phase 5 成果物               | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-5/`                 | 実装内容        |
| child linkage matrix         | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/child-workflow-linkage-matrix.md` | child path 台帳 |
| test-case-matrix             | `outputs/phase-4/test-case-matrix.md`                                                              | Phase 4 成果物  |
| red-test-report              | `outputs/phase-4/red-test-report.md`                                                               | Phase 4 成果物  |
| validator-command-list       | `outputs/phase-4/validator-command-list.md`                                                        | Phase 4 成果物  |
| implementation-summary       | `outputs/phase-5/implementation-summary.md`                                                        | Phase 5 成果物  |
| pointer-doc-update-plan      | `outputs/phase-5/pointer-doc-update-plan.md`                                                       | Phase 5 成果物  |
| canonical-path-normalization | `outputs/phase-5/canonical-path-normalization.md`                                                  | Phase 5 成果物  |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                            | 内容               |
| ------------------ | ------------------------------------------------------------------------------- | ------------------ |
| task workflow      | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`            | child 完了台帳     |
| feature components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | child feature path |
| lessons learned    | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`          | path drift 防止    |

## 実行手順

### ステップ1: parent / child / system spec の3面監査を設計する

pointer、master index、task-workflow の相互参照が崩れないよう cross-doc audit を追加する。

### ステップ2: path drift と stale path の負例を定義する

current path 混入や親による child status 再実装を失敗条件として追加する。

### ステップ3: Phase 11 証跡継承の前倒し検証を追加する

3 child の manual test 入口が生きていることを Phase 6 で先に確認できるようにする。

## 統合テスト連携

| 観点            | 連携内容                                                 |
| --------------- | -------------------------------------------------------- |
| cross-doc guard | parent / child / system spec の 3面で path を検証する    |
| evidence guard  | Phase 11 で使う child evidence 入口を Phase 6 で固定する |
| return path     | drift が見つかった場合は Phase 5 へ戻る                  |

## 多角的チェック観点

| 観点                  | 適用判断 | 確認内容                                                              |
| --------------------- | -------- | --------------------------------------------------------------------- |
| cross-doc consistency | 適用     | parent / child / system spec の path が一致していること               |
| path drift            | 適用     | stale な current path や legacy path を負例に入れていること           |
| evidence inheritance  | 適用     | child screenshot 入口が Phase 11 以前に確認できること                 |
| lessons reuse         | 適用     | path drift / current build capture の教訓を検証観点へ落としていること |

## 成果物

| 成果物                | パス                                                                                                       |
| --------------------- | ---------------------------------------------------------------------------------------------------------- |
| additional-test-cases | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-6/additional-test-cases.md` |
| cross-doc-audit-plan  | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-6/cross-doc-audit-plan.md`  |
| test-expansion-report | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-6/test-expansion-report.md` |

## 完了条件

- [ ] cross-doc audit が追加されている
- [ ] path drift の負例検証が追加されている
- [ ] evidence inheritance 検証が追加されている
- [ ] return path が明記されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

- cross-doc audit 設計
- path drift 負例の追加
- evidence inheritance 検証の追加
- 戻り先の整理

## タスク100%実行確認【必須】

- [ ] parent / child / system spec の3面監査が本文にある
- [ ] stale path を失敗条件として扱っている
- [ ] child evidence 入口が 04A / 04B / 04C 全件分ある
- [ ] drift 発生時の戻り先が Phase 5 として定義されている

## 次Phase

Phase 7: テストカバレッジ確認

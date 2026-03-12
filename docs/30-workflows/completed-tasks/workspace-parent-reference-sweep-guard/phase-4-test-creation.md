# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                                                     |
| ---------- | ------------------------------------------------------------------------ |
| タスクID   | UT-IMP-WORKSPACE-PARENT-REFERENCE-SWEEP-GUARD-001                        |
| Phase      | 4                                                                        |
| Phase名    | テスト作成                                                               |
| カテゴリ   | 改善                                                                     |
| 優先度     | 中                                                                       |
| ステータス | completed                                                                |
| 前提Phase  | Phase 3                                                                  |
| 後続Phase  | Phase 5                                                                  |
| Issue      | [#1173](https://github.com/daishiman/AIWorkflowOrchestrator/issues/1173) |

## 目的

sweep manifest と drift guard 契約を red case へ変換し、実装前に失敗条件を固定する。path drift、status drift、mirror drift、Phase 12 sync drift の 4 系統を混ぜずに検証できるテスト計画を作る。

## 実行タスク

- SubAgent-A: path drift 用の grep ベース red case を作る
- SubAgent-B: status drift / ledger sync 用の red case を作る
- SubAgent-C: mirror drift と dual root 用の red case を作る
- Lead: テストケース、実行コマンド、期待失敗結果を統合する

## 参照資料

| 参照資料             | パス                                       | 説明                 |
| -------------------- | ------------------------------------------ | -------------------- |
| Phase 1成果物        | `outputs/phase-1/acceptance-criteria.md`   | 受入基準の起点       |
| Phase 2              | `phase-2-design.md`                        | 設計本文             |
| Phase 3              | `phase-3-design-review.md`                 | ゲート結果           |
| sweep manifest 設計  | `outputs/phase-2/sweep-manifest-design.md` | テスト入力           |
| drift guard 契約     | `outputs/phase-2/drift-guard-contract.md`  | テスト入力           |
| concern boundary map | `outputs/phase-2/concern-boundary-map.md`  | 責務分離の確認       |
| review findings      | `outputs/phase-3/review-findings.md`       | MINOR / MAJOR の反映 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料              | パス                                                                         | 内容                                 |
| --------------------- | ---------------------------------------------------------------------------- | ------------------------------------ |
| quality-requirements  | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | テスト品質基準                       |
| task-workflow         | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`         | ledger sync の期待状態               |
| lessons-learned       | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`       | 再発条件の洗い出し                   |
| security-electron-ipc | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | capture script root 扱いの安全側基準 |

## 統合テスト連携

- path drift は `rg` ベースの検出ケースにする
- status drift は台帳 / pointer metadata / task id の一致確認にする
- mirror drift は `diff -qr` の fail case にする

## 成果物

| 成果物         | パス                                                                                                             |
| -------------- | ---------------------------------------------------------------------------------------------------------------- |
| テスト仕様書   | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-4/test-specification.md` |
| 回帰ケース     | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-4/regression-cases.md`   |
| 実行コマンド集 | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-4/test-commands.md`      |

## 完了条件

- [x] path drift / status drift / mirror drift / sync drift の red case が分離されている
- [x] 各ケースに入力、期待失敗結果、確認コマンドがある
- [x] Phase 5 がテストケースをそのまま実装検証へ使える
- [x] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 5: 実装へ進む。

# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 値                         |
| ---------- | -------------------------- |
| タスクID   | TASK-UI-04B-WORKSPACE-CHAT |
| Phase      | 10                         |
| Phase名    | 最終レビューゲート         |
| カテゴリ   | ゲート                     |
| 優先度     | high                       |
| ステータス | completed                  |
| 前提Phase  | Phase 9                    |
| 後続Phase  | Phase 11                   |

## 目的

実装、テスト、品質監査の結果を統合レビューし、手動テストへ進めるかを判定する。

## 実行タスク

- 機能レビュー: FR / NFR の充足を確認する
- 品質レビュー: coverage、error handling、cleanup を確認する
- 手動テスト準備レビュー: screenshot 対象と preflight を確定する
- 判定記録: PASS / MINOR / MAJOR / CRITICAL を記録する

## 参照資料

| 参照資料                | パス                                        | 説明           |
| ----------------------- | ------------------------------------------- | -------------- |
| 受け入れ基準            | `outputs/phase-1/acceptance-criteria.md`    | Phase 1 成果物 |
| 状態 / データフロー設計 | `outputs/phase-2/state-dataflow-design.md`  | Phase 2 成果物 |
| 実装サマリー            | `outputs/phase-5/implementation-summary.md` | Phase 5 成果物 |
| 品質レポート            | `outputs/phase-9/quality-report.md`         | Phase 9 成果物 |
| IPC 品質チェック        | `outputs/phase-9/ipc-quality-check.md`      | Phase 9 成果物 |
| カバレッジレポート      | `outputs/phase-7/coverage-report.md`        | Phase 7 成果物 |
| 回帰マトリクス          | `outputs/phase-6/regression-matrix.md`      | Phase 6 成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料              | パス                                                                         | 内容                        |
| --------------------- | ---------------------------------------------------------------------------- | --------------------------- |
| quality               | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | 最終品質基準                |
| testing accessibility | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md` | Phase 11 入力の正本         |
| task workflow         | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`         | current workflow 同期の正本 |

## 実行手順

### ステップ1: 判定を行う

| 判定     | 条件                                                   | 戻り先                 |
| -------- | ------------------------------------------------------ | ---------------------- |
| PASS     | 受け入れ基準、coverage、品質監査の blocking issue 0 件 | Phase 11               |
| MINOR    | manual test に進めるが追補が残る                       | Phase 11               |
| MAJOR    | 実装、テスト、品質のどこかに再作業が必要               | Phase 4-9 の該当 Phase |
| CRITICAL | 要件か設計の再整理が必要                               | Phase 1 または Phase 2 |

## 統合テスト連携

| 観点             | 内容                                                       |
| ---------------- | ---------------------------------------------------------- |
| readiness        | Phase 11 に渡す build、test、coverage の整合を確認する     |
| screenshot input | manual test の TC と integration test の差分を確認する     |
| rollback         | MAJOR / CRITICAL 時の戻り先を integration 観点から確定する |

## 多角的チェック観点

| 観点             | このPhaseでの確認内容                                     | 仕様参照先                                                                   |
| ---------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------- |
| 品質             | coverage / regression / visual readiness を束ねて判定する | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  |
| アクセシビリティ | Phase 11 の視覚・操作確認項目が十分か確認する             | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md` |
| 運用             | current workflow へ残す証跡の不足を確認する               | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`         |

## 成果物

| 成果物            | パス                                      | 説明                     |
| ----------------- | ----------------------------------------- | ------------------------ |
| 最終レビュー結果  | `outputs/phase-10/final-review-result.md` | 判定と根拠               |
| release readiness | `outputs/phase-10/release-readiness.md`   | 手動テスト移行条件       |
| open items        | `outputs/phase-10/open-items.md`          | MINOR / MAJOR / CRITICAL |

## 完了条件

- [x] 最終判定を記録している
- [x] 戻り先を記録している
- [x] Phase 11 に必要な screenshot 観点を整理している
- [x] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 機能レビュー
2. 品質レビュー
3. 手動テスト準備レビュー
4. 判定記録
5. 完了条件確認

## タスク100%実行確認

- [x] 本Phase内の全タスクを100%実行完了
- [x] `outputs/phase-10/` に作成すべき成果物を定義済み
- [x] `artifacts.json` へ登録すべき成果物を確認済み
- [x] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-059a-ui-04b-workspace-chat-panel` を再実行できる状態

## 次のPhase

[Phase 11: 手動テスト検証](./phase-11-manual-test.md)

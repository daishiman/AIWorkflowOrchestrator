# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                                                     |
| ---------- | ------------------------------------------------------------------------ |
| タスクID   | UT-IMP-WORKSPACE-PARENT-REFERENCE-SWEEP-GUARD-001                        |
| Phase      | 5                                                                        |
| Phase名    | 実装                                                                     |
| カテゴリ   | 改善                                                                     |
| 優先度     | 中                                                                       |
| ステータス | completed                                                                |
| 前提Phase  | Phase 4                                                                  |
| 後続Phase  | Phase 6                                                                  |
| Issue      | [#1173](https://github.com/daishiman/AIWorkflowOrchestrator/issues/1173) |

## 目的

Phase 4 の red case を green にする実装を行う。manifest 追加、guard 実装、task-060 root 説明の整理、Phase 12 同期準備を、責務単位で段階的に進める。

## 実行タスク

- SubAgent-A: manifest 定義と pointer / index sweep の基盤を実装する
- SubAgent-B: `rg` ベース path drift、status drift の検出処理を実装する
- SubAgent-C: canonical root 固定、mirror sync、`diff -qr` 契約を実装する
- SubAgent-D: task-060 parent pointer と child workflow の説明、Phase 12 sync 用の更新ポイントを実装する
- Lead: 実装順を `manifest -> guard -> mirror -> sync wiring` で固定し、差分を整理する

## 参照資料

| 参照資料            | パス                                                                                                          | 説明               |
| ------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------ |
| Phase 4             | `phase-4-test-creation.md`                                                                                    | テスト仕様         |
| テスト仕様書        | `outputs/phase-4/test-specification.md`                                                                       | green 化の入力     |
| 回帰ケース          | `outputs/phase-4/regression-cases.md`                                                                         | 実装後の確認ケース |
| 実行コマンド集      | `outputs/phase-4/test-commands.md`                                                                            | 実行順序           |
| dual root precedent | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-dual-skill-root-mirror-sync-guard-001.md` | mirror sync の前例 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                 | パス                                                                            | 内容                |
| ------------------------ | ------------------------------------------------------------------------------- | ------------------- |
| task-workflow            | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`            | 台帳更新の整合      |
| ui-ux-feature-components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | feature spec 参照先 |
| interfaces-llm           | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`           | stale path 是正対象 |
| interfaces-chat-history  | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md`  | stale path 是正対象 |
| error-handling           | `.claude/skills/aiworkflow-requirements/references/error-handling.md`           | validator fail 条件 |

## 統合テスト連携

- Phase 4 の red case を green にした結果を記録する
- manifest 実装後に guard を差し込む順序を固定する
- Phase 6 で false negative / false positive の洗い出しへつなぐ

## 成果物

| 成果物       | パス                                                                                                             |
| ------------ | ---------------------------------------------------------------------------------------------------------------- |
| 実装ログ     | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-5/implementation-log.md` |
| 差分サマリー | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-5/diff-summary.md`       |
| 影響分析     | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-5/impact-analysis.md`    |

## 完了条件

- [x] manifest 実装、guard 実装、mirror sync 実装、sync wiring の順に差分が整理されている
- [x] Phase 4 の red case を green にできる実装順が記録されている
- [x] child workflow の UI 実装変更へ scope が広がっていない
- [x] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 6: テスト拡充へ進む。

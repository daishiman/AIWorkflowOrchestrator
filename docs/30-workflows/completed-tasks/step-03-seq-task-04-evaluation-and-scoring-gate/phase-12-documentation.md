# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                                                                                                                                                        |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase      | 12                                                                                                                                                                                                                          |
| Phase名    | ドキュメント更新                                                                                                                                                                                                            |
| タスクID   | TASK-SKILL-LIFECYCLE-04                                                                                                                                                                                                     |
| 前提Phase  | Phase 1（要件定義）, Phase 2（設計）, Phase 5（実装）, Phase 6（テスト拡充）, Phase 7（テストカバレッジ確認）, Phase 8（リファクタリング）, Phase 9（品質保証）, Phase 10（最終レビューゲート）, Phase 11（手動テスト検証） |
| 後続Phase  | Phase 13（PR作成）                                                                                                                                                                                                          |
| ステータス | completed                                                                                                                                                                                                                   |
| 作成日     | 2026-03-12                                                                                                                                                                                                                  |
| 機能名     | skill-lifecycle-evaluation-gate                                                                                                                                                                                             |

## 目的

Task04 の評価モデル、gate 条件、manual test 証跡、未タスク、再利用ルールを system spec と workflow 正本へ同期する。

## 実行タスク

- 実装ガイド作成: Part 1（中学生レベル）と Part 2（技術者向け）の 2 部構成で実装ガイドを作成する
- system spec 同期: ui-ux-feature-components / arch-state-management / api-ipc-agent / interfaces-agent-sdk-skill / task-workflow / lessons-learned を更新する
- changelog 作成: Task04 のドキュメント更新履歴を出力する
- 未タスク検出: 残課題が 0 件でも `outputs/phase-12/unassigned-task-detection.md` を出力する
- スキルフィードバック記録: 改善点が 0 件でも `skill-feedback-report.md` を出力する
- 準拠チェック記録: `outputs/phase-12/phase12-task-spec-compliance-check.md` に Phase 12 の証跡を集約する

### Part 1 / Part 2 の必須内容

| パート | 対象読者             | 必須内容                                                              |
| ------ | -------------------- | --------------------------------------------------------------------- |
| Part 1 | 初学者・中学生レベル | 先に「なぜ必要か」を説明し、日常の例えを 1 つ以上含める               |
| Part 2 | 開発者・技術者       | 型定義、gate ルール、API / state / UI 接続、error handling を記載する |

### 同期対象

| ファイル                                                                          | 更新内容                                                                                   |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   | `SkillAnalysisView` `ScoreDisplay` と Task04 の gate badge / delta / recommendation を同期 |
| `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | `skillEvaluationSlice` と Task03 / Task05 の state ownership を同期                        |
| `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | Task03 から Task04 に渡る event 契約と Task05 の再評価契約を同期                           |
| `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | `window.electronAPI.skill.evaluatePrompt()` と共有型 export を同期                         |
| `.claude/skills/aiworkflow-requirements/references/task-workflow.md`              | Task04 完了記録、Phase 11 証跡、残課題導線を同期                                           |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`            | hard block、history sync、cross-surface 表示差異の教訓を同期                               |

## 参照資料

| 参照資料                 | パス                                       | 説明                |
| ------------------------ | ------------------------------------------ | ------------------- |
| Phase 2 設計             | `phase-2-design.md`                        | 同期対象の設計正本  |
| Phase 5 実装             | `phase-5-implementation.md`                | 実装済み範囲        |
| Phase 6 テスト拡充       | `phase-6-test-expansion.md`                | regression 反映項目 |
| Phase 7 coverage         | `phase-7-coverage-check.md`                | gap の最終状態      |
| Phase 8 リファクタリング | `phase-8-refactoring.md`                   | 集約後の責務        |
| Phase 11 manual test     | `phase-11-manual-test.md`                  | 証跡入力の正本      |
| Phase 10 final review    | `phase-10-final-review.md`                 | 完了条件の正本      |
| gate engine 設計         | `outputs/phase-2/gate-decision-design.md`  | 閾値と block の正本 |
| implementation plan      | `outputs/phase-5/implementation-plan.md`   | 実装責務一覧        |
| regression plan          | `outputs/phase-6/regression-plan.md`       | 回帰観点            |
| coverage gap             | `outputs/phase-7/coverage-gap-analysis.md` | 未検証残件          |
| refactor plan            | `outputs/phase-8/refactor-plan.md`         | 最終責務整理        |
| manual test result       | `outputs/phase-11/manual-test-result.md`   | Phase 11 実測結果   |
| screenshot plan          | `outputs/phase-11/screenshot-plan.md`      | 画像一覧            |
| quality gate report      | `outputs/phase-9/quality-gate-report.md`   | QA 結果             |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                              | 内容                                |
| -------------------------- | --------------------------------------------------------------------------------- | ----------------------------------- |
| ui-ux-feature-components   | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   | UI 同期先                           |
| arch-state-management      | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | state 同期先                        |
| api-ipc-agent              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | IPC 同期先                          |
| interfaces-agent-sdk-skill | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | public preload / shared type 同期先 |
| task-workflow              | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`              | workflow 台帳                       |
| lessons-learned            | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`            | 再利用ルール                        |

## 実行手順

### ステップ1: 実装ガイドを作成する

Part 1 と Part 2 を同一ドキュメントへ記述する。

### ステップ2: system spec を同期する

6 つの正本仕様へ Task04 の内容を反映し、見出し変更が入る場合は index を再生成する。

### ステップ3: changelog と未タスクを出力する

更新履歴、未タスク、スキルフィードバックを必ず出力する。

### ステップ4: 証跡と同期完了を確認する

manual test、QA、system spec 更新の参照先を確認する。

## 成果物

| 成果物                    | パス                                                     | 内容                        |
| ------------------------- | -------------------------------------------------------- | --------------------------- |
| implementation guide      | `outputs/phase-12/implementation-guide.md`               | Part 1 / Part 2 の 2 部構成 |
| system spec sync plan     | `outputs/phase-12/system-spec-sync-plan.md`              | 更新対象と変更点            |
| documentation changelog   | `outputs/phase-12/documentation-changelog.md`            | 更新履歴                    |
| unassigned task detection | `outputs/phase-12/unassigned-task-detection.md`          | 残課題一覧                  |
| skill feedback report     | `outputs/phase-12/skill-feedback-report.md`              | スキル改善提案              |
| compliance check          | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 準拠証跡           |

## 完了条件

- [x] implementation guide が Part 1 / Part 2 の 2 部構成で出力されている
- [x] 6 つの system spec 更新先が明記されている
- [x] documentation changelog が出力されている
- [x] 未タスクが 0 件でも detection レポートが出力されている
- [x] 改善点が 0 件でも skill feedback report が出力されている
- [x] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 13: PR作成](./phase-13-pr-creation.md) に進む

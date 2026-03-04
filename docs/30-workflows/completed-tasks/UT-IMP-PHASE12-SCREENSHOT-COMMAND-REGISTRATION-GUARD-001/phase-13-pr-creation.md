# Phase 13: PR作成

## メタ情報

| 項目       | 値                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------- |
| Phase      | 13                                                                                          |
| 名称       | PR作成                                                                                      |
| タスクID   | UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001                                    |
| 作成日     | 2026-03-04                                                                                  |
| 依存       | Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Phase 10, Phase 11, Phase 12 |
| ステータス | Draft                                                                                       |

## 目的

実装差分と証跡を PR 形式へ整理し、レビュー可能な提出物を作る。

## 実行タスク

- PR本文作成: 変更概要、背景、検証結果を整理する。
- 添付証跡整理: screenshot、検証ログ、監査ログを添付一覧へ整理する。
- レビュー観点整理: reviewers が確認する項目を固定する。

## 参照資料

| 資料                 | パス                                                                 | 用途            |
| -------------------- | -------------------------------------------------------------------- | --------------- |
| Phase 12             | `phase-12-documentation.md`                                          | 最終入力        |
| Phase 2成果物        | `outputs/phase-2/document-sync-matrix.md`                            | 設計根拠        |
| Phase 5成果物        | `outputs/phase-5/implementation-summary.md`                          | 実装根拠        |
| Phase 6成果物        | `outputs/phase-6/regression-matrix.md`                               | 回帰根拠        |
| Phase 7成果物        | `outputs/phase-7/coverage-report.md`                                 | カバレッジ根拠  |
| Phase 8成果物        | `outputs/phase-8/refactoring-log.md`                                 | 改善根拠        |
| Phase 9成果物        | `outputs/phase-9/quality-report.md`                                  | 品質根拠        |
| Phase 10成果物       | `outputs/phase-10/final-review-result.md`                            | ゲート根拠      |
| Phase 11成果物       | `outputs/phase-11/manual-test-result.md`                             | 手動検証根拠    |
| Phase 12成果物       | `outputs/phase-12/spec-update-summary.md`                            | 実行証跡        |
| Phase 12成果物       | `outputs/phase-12/documentation-changelog.md`                        | 変更履歴        |
| Phase 12成果物       | `outputs/phase-12/unassigned-task-detection.md`                      | 監査結果        |
| aiworkflow台帳       | `.claude/skills/aiworkflow-requirements/references/task-workflow.md` | 完了情報同期    |
| 最終レビューコメント | `outputs/phase-10/final-review-comments.md`                          | Phase 10 成果物 |
| 発見課題             | `outputs/phase-11/discovered-issues.md`                              | Phase 11 成果物 |
| 証跡一覧             | `outputs/phase-11/screenshot-index.md`                               | Phase 11 成果物 |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`                           | Phase 12 成果物 |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`                          | Phase 12 成果物 |
| スキル準拠監査       | `outputs/phase-12/skill-compliance-audit.md`                         | Phase 12 成果物 |
| エレガント性レビュー | `outputs/phase-12/elegant-solution-review.md`                        | Phase 12 成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料   | パス                                                                          | 内容         |
| ---------- | ----------------------------------------------------------------------------- | ------------ |
| 開発ガイド | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md` | PR記載方針   |
| 品質要件   | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`   | 合格基準記載 |

## 実行手順

### Step 1: PRドラフト作成

- 背景: Issue #968 と未タスク指示書を記載する。
- 変更点: scripts 登録、文書同期、検証ログ整備を記載する。
- 検証: 実行コマンドと判定結果を記載する。

### Step 2: 証跡添付

- screenshot 再取得結果
- run 一覧結果
- coverage validator 判定
- unassigned 監査判定

### Step 3: レビュー観点明示

- scripts 命名が規約へ一致するか
- Phase 11/12 文書が同一コマンド記法か
- current/baseline 判定が分離記録されているか

## 成果物

| 成果物   | パス                                 | 説明                   |
| -------- | ------------------------------------ | ---------------------- |
| PR情報   | `outputs/phase-13/pr-info.md`        | PR本文とチェックリスト |
| 証跡一覧 | `outputs/phase-13/evidence-index.md` | 添付証跡対応表         |

## 完了条件

- [ ] PR本文テンプレートが作成されている
- [ ] 証跡一覧が作成されている
- [ ] レビュー観点が 3 項目以上記載されている
- [ ] Phase 12 成果物への参照が記載されている
- [ ] 台帳同期対象が記載されている
- [ ] 本Phase内の全タスクを100%実行完了

## 備考

このタスク仕様書作成ターンではコミットとPR作成を実行しない。Phase 13 は将来実行時の手順を定義する。

## 多角的チェック観点

| 観点           | 適用内容                                                | 参照仕様                                                                                    |
| -------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| セキュリティ   | 実行コマンドの公開範囲が限定されているか                | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                |
| UI/UX証跡      | Phase 11 の証跡取得コマンドが一意か                     | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             |
| アーキテクチャ | スクリプト実体と公開コマンドの責務が分離されているか    | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` |
| 品質           | verify/validate/coverage/audit の検証順序が維持されるか | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 |

## 統合テスト連携

| 連携対象      | 内容                                                            |
| ------------- | --------------------------------------------------------------- |
| Phase 11 証跡 | screenshot 実行と coverage 判定を同期して記録する               |
| Phase 12 更新 | 検証結果を task-workflow / lessons-learned へ同一ターン同期する |

## サブタスク管理

| サブタスク         | 状態    |
| ------------------ | ------- |
| 参照資料確認       | pending |
| 実行タスク実施     | pending |
| 統合テスト連携確認 | pending |
| 成果物定義確認     | pending |
| 完了条件確認       | pending |

## タスク100%実行確認【必須】

- [ ] 本Phaseの実行タスクをすべて実行した
- [ ] 本Phaseの成果物定義と参照資料を照合した
- [ ] 本Phaseの完了条件を全て満たした
- [ ] 次Phaseへ渡す入力を明記した

## 次のPhase

完了（本ワークフローの最終Phase）。

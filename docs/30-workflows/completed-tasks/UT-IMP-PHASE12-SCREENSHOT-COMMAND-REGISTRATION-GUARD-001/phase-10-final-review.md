# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 値                                                       |
| ---------- | -------------------------------------------------------- |
| Phase      | 10                                                       |
| 名称       | 最終レビューゲート                                       |
| タスクID   | UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001 |
| 作成日     | 2026-03-04                                               |
| 依存       | Phase 1, Phase 2, Phase 5                                |
| ステータス | Draft                                                    |

## 目的

機能要件、設計、実装結果を最終照合し、Phase 11 手動テストへ進む可否を決定する。

## 実行タスク

- 要件照合レビュー: Phase 1 の FR/NFR と実装結果を照合する。
- 実装照合レビュー: Phase 2 の設計と実装差分を照合する。
- ゲート判定: PASS/MINOR/MAJOR を判定する。

## 参照資料

| 資料                   | パス                                                                                        | 用途           |
| ---------------------- | ------------------------------------------------------------------------------------------- | -------------- |
| Phase 1                | `phase-1-requirements.md`                                                                   | 要件照合       |
| Phase 2                | `phase-2-design.md`                                                                         | 設計照合       |
| Phase 5                | `phase-5-implementation.md`                                                                 | 実装照合       |
| Phase 9                | `phase-9-quality-assurance.md`                                                              | 品質判定入力   |
| Phase 1成果物          | `outputs/phase-1/acceptance-criteria.md`                                                    | 受入判定       |
| Phase 2成果物          | `outputs/phase-2/document-sync-matrix.md`                                                   | 設計判定       |
| Phase 5成果物          | `outputs/phase-5/changed-files.md`                                                          | 実装判定       |
| Phase 9成果物          | `outputs/phase-9/quality-report.md`                                                         | 品質判定       |
| aiworkflow実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | レビュー観点   |
| 要件定義書             | `outputs/phase-1/requirements-definition.md`                                                | Phase 1 成果物 |
| スコープ定義           | `outputs/phase-1/scope-definition.md`                                                       | Phase 1 成果物 |
| 設計書                 | `outputs/phase-2/architecture-design.md`                                                    | Phase 2 成果物 |
| 検証コマンド設計       | `outputs/phase-2/verification-commands.md`                                                  | Phase 2 成果物 |
| 仕様抽出マトリクス     | `outputs/phase-2/aiworkflow-spec-extraction.md`                                             | Phase 2 成果物 |
| 実装サマリー           | `outputs/phase-5/implementation-summary.md`                                                 | Phase 5 成果物 |
| 実行ログ               | `outputs/phase-5/command-run-log.md`                                                        | Phase 5 成果物 |
| カバレッジレポート     | `outputs/phase-7/coverage-report.md`                                                        | Phase 7 成果物 |
| 欠落分析               | `outputs/phase-7/gap-analysis.md`                                                           | Phase 7 成果物 |
| リファクタログ         | `outputs/phase-8/refactoring-log.md`                                                        | Phase 8 成果物 |
| 命名規約表             | `outputs/phase-8/naming-convention.md`                                                      | Phase 8 成果物 |
| 監査テンプレート       | `outputs/phase-8/audit-template.md`                                                         | Phase 8 成果物 |
| リスク評価             | `outputs/phase-9/risk-review.md`                                                            | Phase 9 成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料    | パス                                                                        | 内容         |
| ----------- | --------------------------------------------------------------------------- | ------------ |
| task台帳    | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`        | 判定記録形式 |
| quality要件 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | ゲート基準   |

## 実行手順

### Step 1: チェック項目判定

| 項目     | 判定条件                          |
| -------- | --------------------------------- |
| FR照合   | FR-1〜FR-3 が実装差分と一致       |
| NFR照合  | NFR-1〜NFR-3 が検証ログで確認可能 |
| 設計照合 | 設計マトリクスと文書更新が一致    |
| 品質照合 | Phase 9 の品質判定が PASS         |

### Step 2: ゲート判定ルール

- PASS: 4 項目すべて PASS。
- MINOR: 軽微差分があるが手動テストで吸収可能。
- MAJOR: 要件不一致か監査不能項目がある。

### Step 3: 戻り先定義

| 判定        | 戻り先   |
| ----------- | -------- |
| PASS        | Phase 11 |
| MINOR       | Phase 11 |
| MAJOR(要件) | Phase 1  |
| MAJOR(設計) | Phase 2  |
| MAJOR(実装) | Phase 5  |

## 統合テスト連携

| 連携対象 | 連携内容                             |
| -------- | ------------------------------------ |
| Phase 11 | 手動テストケース TC-01〜TC-06 を確定 |
| Phase 12 | Phase 11 証跡を文書更新入力へ渡す    |

## 成果物

| 成果物           | パス                                        | 説明     |
| ---------------- | ------------------------------------------- | -------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`   | 判定ログ |
| 指摘一覧         | `outputs/phase-10/final-review-comments.md` | 指摘記録 |

## 完了条件

- [ ] チェック項目 4 件の判定が記録されている
- [ ] ゲート判定が明記されている
- [ ] 戻り先ルールが明記されている
- [ ] Phase 11 へ渡すケースが確定している
- [ ] 判定根拠の成果物パスが明記されている
- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 11 で手動テスト検証を実施する。

## 多角的チェック観点

| 観点           | 適用内容                                                | 参照仕様                                                                                    |
| -------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| セキュリティ   | 実行コマンドの公開範囲が限定されているか                | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                |
| UI/UX証跡      | Phase 11 の証跡取得コマンドが一意か                     | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             |
| アーキテクチャ | スクリプト実体と公開コマンドの責務が分離されているか    | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` |
| 品質           | verify/validate/coverage/audit の検証順序が維持されるか | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 |

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

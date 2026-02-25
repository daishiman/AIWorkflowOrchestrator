# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 値                                                                     |
| ---------- | ---------------------------------------------------------------------- |
| Phase      | 11                                                                     |
| タスクID   | UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001                              |
| 機能名     | ut-imp-unassigned-audit-scope-control-001                              |
| 前提Phase  | Phase 10                                                               |
| 後続Phase  | Phase 12                                                               |
| ステータス | 未実施                                                                 |
| Issue      | [#898](https://github.com/daishiman/AIWorkflowOrchestrator/issues/898) |
| 作成日     | 2026-02-25                                                             |

## 目的

運用担当者視点で監査コマンドを実行し、判定フローが実作業で成立することを確認する。

## 背景

Phase 10でPASS/MINOR判定された実装を、手動テストで実際の運用シナリオに沿って検証する。対象監査（`--target-file`）と全体監査の実行、current/baseline分離の目視確認、既存コマンド互換性の手動確認を行う。

## 実行タスク

- SubAgent-A（対象監査手動確認）: `--target-file` 実行時の出力と判定を確認する。
- SubAgent-B（全体監査手動確認）: baseline 表示と件数の扱いを確認する。
- Lead（運用判定）: 「対象→全体」の手順で実務判断が可能か検証する。

## 参照資料

| 参照資料          | パス                                                                                 | 内容               |
| ----------------- | ------------------------------------------------------------------------------------ | ------------------ |
| Phase 2           | `phase-2-design.md`                                                                  | 手動判定観点の確認 |
| Phase 5           | `phase-5-implementation.md`                                                          | 実装挙動の確認     |
| Phase 6           | `phase-6-test-expansion.md`                                                          | 追加ケースの確認   |
| Phase 7           | `phase-7-coverage-check.md`                                                          | 網羅状況の確認     |
| Phase 8           | `phase-8-refactoring.md`                                                             | 構造変更の確認     |
| Phase 9           | `phase-9-quality-assurance.md`                                                       | 品質判定の確認     |
| Phase 10          | `phase-10-final-review.md`                                                           | 最終レビュー結果   |
| 最終レビュー結果  | `outputs/phase-10/final-review-result.md`                                            | 判定条件           |
| Phase 11/12ガイド | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`          | 手動検証の進め方   |
| 未タスクガイド    | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md` | 検出記録ルール     |
| 指摘一覧          | `outputs/phase-10/final-review-findings.md`                                          | Phase 10 成果物    |
| 是正計画          | `outputs/phase-10/remediation-plan.md`                                               | Phase 10 成果物    |

### システム仕様（aiworkflow-requirements）

> 実装前に以下のシステム仕様を確認し、既存運用との整合を確保してください。

| 参照資料             | パス                                                                        | 内容                           |
| -------------------- | --------------------------------------------------------------------------- | ------------------------------ |
| quality-requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 手動テストシナリオの網羅性基準 |

## 実行手順

1. 対象1ファイル監査を実行し current 判定を確認する。
2. 全体監査を実行し baseline 判定を確認する。
3. 期待どおりの判断ができるか運用者視点でレビューする。

## 統合テスト連携

| 観点       | 連携内容                                     |
| ---------- | -------------------------------------------- |
| 実操作性   | 手順書のみで実行可能であること               |
| 判定明瞭性 | current と baseline の意味が混同されないこと |
| 記録性     | Phase 12 の記録に直接接続できること          |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                                            | 仕様参照先                                                                                                                        |
| ------------------ | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| セキュリティ       | 手動操作でのパストラバーサル入力テスト              | `.claude/skills/aiworkflow-requirements/references/security-*.md`                                                                 |
| アーキテクチャ     | 適用外（手動テストのため）                          | `.claude/skills/aiworkflow-requirements/references/architecture-*.md`                                                             |
| API/IPC契約        | 適用外（CLIスクリプト改修のため）                   | `.claude/skills/aiworkflow-requirements/references/api-*.md`, `.claude/skills/aiworkflow-requirements/references/interfaces-*.md` |
| エラーハンドリング | 不正入力時のエラーメッセージ可読性を手動確認        | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                             |
| 品質保証           | 運用シナリオに沿った対象監査→全体監査の手順実行確認 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                                       |

## 成果物

| 成果物         | パス                                     | 説明             |
| -------------- | ---------------------------------------- | ---------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | 実行ログと判定   |
| 発見事項       | `outputs/phase-11/manual-findings.md`    | 改善点と課題     |
| 実行証跡       | `outputs/phase-11/command-transcript.md` | 実行コマンド証跡 |

## 完了条件

- [ ] 対象監査と全体監査の両方を手動確認している
- [ ] 判定フローが運用者視点で成立している
- [ ] 発見事項がPhase 12に引き継ぎ可能な形式で記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物が所定パスに生成済み
- [ ] 実行結果と完了条件の一致を確認済み

## 依存関係

- **前提**: Phase 10
- **後続**: Phase 12

## サブタスク管理

- [ ] 参照資料の確認を完了
- [ ] 実行タスク（SubAgent担当）を完了
- [ ] 成果物作成と配置を完了
- [ ] 完了条件の自己検証を完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスク成果物が生成済み
- [ ] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/ut-imp-unassigned-audit-scope-control-001 --phase 11` 実行で問題なし

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録する。

- 実行タスク別の完了可否
- 発見事項（良かった点 / 問題点 / 改善提案）
- 次Phaseへの引き継ぎ事項

## 次のPhase

Phase 12: ドキュメント更新（phase-12-documentation.md）

# Phase 8: リファクタリング

## メタ情報

| 項目       | 値                                                                     |
| ---------- | ---------------------------------------------------------------------- |
| Phase      | 8                                                                      |
| タスクID   | UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001                              |
| 機能名     | ut-imp-unassigned-audit-scope-control-001                              |
| 前提Phase  | Phase 7                                                                |
| 後続Phase  | Phase 9                                                                |
| ステータス | 未実施                                                                 |
| Issue      | [#898](https://github.com/daishiman/AIWorkflowOrchestrator/issues/898) |
| 作成日     | 2026-02-25                                                             |

## 目的

実装ロジックの可読性・保守性を向上させ、将来の未タスク監査拡張で再利用しやすい構造へ整理する。

## 背景

Phase 5-7で機能的に正しく動作するコードをリファクタリングし、可読性・保守性・再利用性を向上させる。分類ロジックの関数分離、CLIオプション解析の構造化、テストヘルパーの抽出を行う。TDDのRefactor段階。

## 実行タスク

- SubAgent-A（構造整理）: 対象抽出・分類・出力を関数分割し責務を明確化する。
- SubAgent-B（命名統一）: current/baseline 周辺の命名とコメントを統一する。
- Lead（回帰確認）: リファクタ後に Phase 6/7 の検証が維持されることを確認する。

## 参照資料

| 参照資料       | パス                                                                   | 内容             |
| -------------- | ---------------------------------------------------------------------- | ---------------- |
| Phase 1        | `phase-1-requirements.md`                                              | 要件境界の確認   |
| Phase 2        | `phase-2-design.md`                                                    | 設計意図の確認   |
| Phase 5        | `phase-5-implementation.md`                                            | リファクタ対象   |
| Phase 6        | `phase-6-test-expansion.md`                                            | 回帰対象ケース   |
| Phase 7        | `phase-7-coverage-check.md`                                            | 網羅維持条件     |
| カバレッジ報告 | `outputs/phase-7/coverage-report.md`                                   | 回帰判定の基準   |
| 教訓集         | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` | 可読性向上の知見 |
| 実装ログ       | `outputs/phase-5/implementation-log.md`                                | Phase 5 成果物   |
| 差分サマリー   | `outputs/phase-5/diff-summary.md`                                      | Phase 5 成果物   |
| 影響分析       | `outputs/phase-5/impact-analysis.md`                                   | Phase 5 成果物   |
| Green証跡      | `outputs/phase-5/post-implementation-green.log`                        | Phase 5 成果物   |
| 未網羅一覧     | `outputs/phase-7/uncovered-items.md`                                   | Phase 7 成果物   |
| 要件追跡表     | `outputs/phase-7/requirements-traceability.md`                         | Phase 7 成果物   |

### システム仕様（aiworkflow-requirements）

> 実装前に以下のシステム仕様を確認し、既存運用との整合を確保してください。

| 参照資料             | パス                                                                        | 内容                               |
| -------------------- | --------------------------------------------------------------------------- | ---------------------------------- |
| quality-requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | リファクタリング後のコード品質基準 |
| lessons-learned      | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`      | 構造改善時の教訓と再発防止         |

## 実行手順

1. 依存関係と責務が混在しているコード箇所を特定する。
2. 関数分割・命名統一・コメント整備を実施する。
3. Phase 6/7 の検証コマンドを再実行して回帰がないことを確認する。

## 統合テスト連携

| 観点     | 連携内容                                     |
| -------- | -------------------------------------------- |
| 回帰抑止 | 既存テストが全て通ること                     |
| 保守性   | 分類ロジック変更時の影響範囲が限定されること |
| 読解性   | 後続担当がコード意図を追跡できること         |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                                           | 仕様参照先                                                                                                                        |
| ------------------ | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| セキュリティ       | リファクタリングでセキュリティ劣化がないことを確認 | `.claude/skills/aiworkflow-requirements/references/security-*.md`                                                                 |
| アーキテクチャ     | 関数分離・モジュール構造の改善                     | `.claude/skills/aiworkflow-requirements/references/architecture-*.md`                                                             |
| API/IPC契約        | 適用外（CLIスクリプト改修のため）                  | `.claude/skills/aiworkflow-requirements/references/api-*.md`, `.claude/skills/aiworkflow-requirements/references/interfaces-*.md` |
| エラーハンドリング | 適用外（機能変更なしのため）                       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                             |
| 品質保証           | リファクタリング前後でテスト結果が一致             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                                       |

## 成果物

| 成果物         | パス                                    | 説明           |
| -------------- | --------------------------------------- | -------------- |
| リファクタログ | `outputs/phase-8/refactoring-log.md`    | 実施内容       |
| 回帰確認       | `outputs/phase-8/regression-check.md`   | 再検証結果     |
| 責務分割図     | `outputs/phase-8/responsibility-map.md` | 関数責務マップ |

## 完了条件

- [ ] 責務混在箇所が分離されている
- [ ] 命名とコメントが一貫している
- [ ] リファクタ後の回帰がないことを確認している
- [ ] 本Phase内の全タスクを100%実行完了

## TDD検証（Phase 4, 5, 8 の場合）

- [ ] 想定TDD状態（Phase 8）に一致する検証を実施した
- [ ] 失敗/成功の証跡を成果物に記録した
- [ ] 後続Phaseで再現可能なコマンドを残した

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物が所定パスに生成済み
- [ ] 実行結果と完了条件の一致を確認済み

## 依存関係

- **前提**: Phase 7
- **後続**: Phase 9

## サブタスク管理

- [ ] 参照資料の確認を完了
- [ ] 実行タスク（SubAgent担当）を完了
- [ ] 成果物作成と配置を完了
- [ ] 完了条件の自己検証を完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスク成果物が生成済み
- [ ] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/ut-imp-unassigned-audit-scope-control-001 --phase 8` 実行で問題なし

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録する。

- 実行タスク別の完了可否
- 発見事項（良かった点 / 問題点 / 改善提案）
- 次Phaseへの引き継ぎ事項

## 次のPhase

Phase 9: 品質保証（phase-9-quality-assurance.md）

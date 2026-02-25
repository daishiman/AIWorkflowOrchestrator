# Phase 9: 品質保証

## メタ情報

| 項目       | 値                                                                     |
| ---------- | ---------------------------------------------------------------------- |
| Phase      | 9                                                                      |
| タスクID   | UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001                              |
| 機能名     | ut-imp-unassigned-audit-scope-control-001                              |
| 前提Phase  | Phase 8                                                                |
| 後続Phase  | Phase 10                                                               |
| ステータス | 未実施                                                                 |
| Issue      | [#898](https://github.com/daishiman/AIWorkflowOrchestrator/issues/898) |
| 作成日     | 2026-02-25                                                             |

## 目的

機能品質・文書品質・運用品質の3観点で成果を総合確認し、最終レビューゲートに進める状態にする。

## 背景

Phase 8のリファクタリング後に、Lint・型チェック・全テスト実行の品質パイプラインを通し、プロダクション品質を確認する。Phase 10の最終レビューに進む前の品質ゲート。

## 実行タスク

- SubAgent-A（機能品質）: 監査結果分類、exit code、互換性を検証する。
- SubAgent-B（文書品質）: 運用ガイドと実行コマンドの整合を検証する。
- Lead（運用品質）: 現場運用での判定フロー（対象→全体）を検証する。

## 参照資料

| 参照資料       | パス                                                                        | 内容             |
| -------------- | --------------------------------------------------------------------------- | ---------------- |
| Phase 5        | `phase-5-implementation.md`                                                 | 実装品質の再確認 |
| Phase 6        | `phase-6-test-expansion.md`                                                 | 実行結果の再確認 |
| Phase 8        | `phase-8-refactoring.md`                                                    | 構造変更の確認   |
| 回帰確認       | `outputs/phase-8/regression-check.md`                                       | 品質判定の入力   |
| 品質要件       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 品質ゲート       |
| 運用ガイド     | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md` | Phase 11/12 接続 |
| 実装ログ       | `outputs/phase-5/implementation-log.md`                                     | Phase 5 成果物   |
| 差分サマリー   | `outputs/phase-5/diff-summary.md`                                           | Phase 5 成果物   |
| 影響分析       | `outputs/phase-5/impact-analysis.md`                                        | Phase 5 成果物   |
| Green証跡      | `outputs/phase-5/post-implementation-green.log`                             | Phase 5 成果物   |
| リファクタログ | `outputs/phase-8/refactoring-log.md`                                        | Phase 8 成果物   |
| 責務分割図     | `outputs/phase-8/responsibility-map.md`                                     | Phase 8 成果物   |

### システム仕様（aiworkflow-requirements）

> 実装前に以下のシステム仕様を確認し、既存運用との整合を確保してください。

| 参照資料             | パス                                                                        | 内容                                        |
| -------------------- | --------------------------------------------------------------------------- | ------------------------------------------- |
| quality-requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 品質パイプライン基準（Lint/TypeCheck/Test） |
| task-workflow-rules  | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`  | 品質ゲート判定ルールと通過条件              |

## 実行手順

1. 実装品質・テスト品質・運用品質の評価軸を固定する。
2. すべての評価軸で合否を判定し、未達があれば対処計画を作成する。
3. Phase 10 に渡す品質サマリーを作成する。

## 統合テスト連携

| 観点       | 連携内容                              |
| ---------- | ------------------------------------- |
| 品質一貫性 | 要件→設計→実装→検証が一貫していること |
| 実運用性   | 監査フローが担当者間で再現できること  |
| 引き継ぎ性 | Phase 10/11 がそのまま実行可能なこと  |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                                          | 仕様参照先                                                                                                                        |
| ------------------ | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| セキュリティ       | 適用外（品質検証のため）                          | `.claude/skills/aiworkflow-requirements/references/security-*.md`                                                                 |
| アーキテクチャ     | 適用外（品質検証のため）                          | `.claude/skills/aiworkflow-requirements/references/architecture-*.md`                                                             |
| API/IPC契約        | 適用外（品質検証のため）                          | `.claude/skills/aiworkflow-requirements/references/api-*.md`, `.claude/skills/aiworkflow-requirements/references/interfaces-*.md` |
| エラーハンドリング | 適用外（品質検証のため）                          | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                             |
| 品質保証           | Lint/TypeCheck/全テスト実行の品質パイプライン通過 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                                       |

## 成果物

| 成果物       | パス                                     | 説明           |
| ------------ | ---------------------------------------- | -------------- |
| 品質レポート | `outputs/phase-9/quality-report.md`      | 総合品質判定   |
| 再現性ログ   | `outputs/phase-9/reproducibility-log.md` | 再現検証記録   |
| 運用評価     | `outputs/phase-9/operation-readiness.md` | 運用適用性評価 |

## 完了条件

- [ ] 品質判定の観点と結果が記録されている
- [ ] 未達項目の対処計画がある
- [ ] Phase 10 に渡す品質サマリーが完成している
- [ ] 本Phase内の全タスクを100%実行完了

## 品質ゲート（Phase 9 の場合）

### 品質チェックリスト

- [ ] 機能検証（対象監査/全体監査）が完了
- [ ] コード/スクリプト品質（互換性・可読性）が確認済み
- [ ] テスト網羅性（要件追跡）が確認済み
- [ ] 運用時の判定誤りリスクが許容範囲内

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物が所定パスに生成済み
- [ ] 実行結果と完了条件の一致を確認済み

## 依存関係

- **前提**: Phase 8
- **後続**: Phase 10

## サブタスク管理

- [ ] 参照資料の確認を完了
- [ ] 実行タスク（SubAgent担当）を完了
- [ ] 成果物作成と配置を完了
- [ ] 完了条件の自己検証を完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスク成果物が生成済み
- [ ] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/ut-imp-unassigned-audit-scope-control-001 --phase 9` 実行で問題なし

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録する。

- 実行タスク別の完了可否
- 発見事項（良かった点 / 問題点 / 改善提案）
- 次Phaseへの引き継ぎ事項

## 次のPhase

Phase 10: 最終レビューゲート（phase-10-final-review.md）

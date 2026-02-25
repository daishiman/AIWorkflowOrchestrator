# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 値                                                                     |
| ---------- | ---------------------------------------------------------------------- |
| Phase      | 10                                                                     |
| タスクID   | UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001                              |
| 機能名     | ut-imp-unassigned-audit-scope-control-001                              |
| 前提Phase  | Phase 9                                                                |
| 後続Phase  | Phase 11                                                               |
| ステータス | 未実施                                                                 |
| Issue      | [#898](https://github.com/daishiman/AIWorkflowOrchestrator/issues/898) |
| 作成日     | 2026-02-25                                                             |

## 目的

Phase 1〜9 の成果を最終レビューし、ドキュメント更新前にリリース品質を満たしているかを判定する。

## 背景

Phase 1-9の全成果（要件定義・設計・テスト・実装・品質保証）を統合的にレビューし、リリース品質を判定する最終ゲート。MINOR指摘は未タスク仕様書に変換してPhase 11へ進む。MAJOR/CRITICALの場合は該当Phaseへ戻る。

## 実行タスク

- SubAgent-A（機能レビュー）: 監査機能と分類精度を最終確認する。
- SubAgent-B（品質レビュー）: 互換性、再現性、可読性を最終確認する。
- Lead（ゲート判定）: レビュー判定と戻り先を確定する。

## 参照資料

| 参照資料           | パス                                                                       | 内容           |
| ------------------ | -------------------------------------------------------------------------- | -------------- |
| Phase 1            | `phase-1-requirements.md`                                                  | 受入基準の原本 |
| Phase 2            | `phase-2-design.md`                                                        | 設計整合の確認 |
| Phase 5            | `phase-5-implementation.md`                                                | 実装差分の確認 |
| Phase 9            | `phase-9-quality-assurance.md`                                             | 品質判定の確認 |
| 品質レポート       | `outputs/phase-9/quality-report.md`                                        | レビュー入力   |
| task-workflow 規則 | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md` | MINOR 管理規則 |
| 要件定義           | `outputs/phase-1/requirements-definition.md`                               | Phase 1 成果物 |
| 受入基準           | `outputs/phase-1/acceptance-criteria.md`                                   | Phase 1 成果物 |
| SubAgent責務分担   | `outputs/phase-1/subagent-responsibilities.md`                             | Phase 1 成果物 |
| 仕様参照抽出       | `outputs/phase-1/aiworkflow-spec-extraction.md`                            | Phase 1 成果物 |
| 設計書             | `outputs/phase-2/scope-control-design.md`                                  | Phase 2 成果物 |
| 入出力仕様         | `outputs/phase-2/cli-contract.md`                                          | Phase 2 成果物 |
| テストマッピング   | `outputs/phase-2/design-test-mapping.md`                                   | Phase 2 成果物 |
| リスク分析         | `outputs/phase-2/risk-analysis.md`                                         | Phase 2 成果物 |
| 実装ログ           | `outputs/phase-5/implementation-log.md`                                    | Phase 5 成果物 |
| 差分サマリー       | `outputs/phase-5/diff-summary.md`                                          | Phase 5 成果物 |
| 影響分析           | `outputs/phase-5/impact-analysis.md`                                       | Phase 5 成果物 |
| Green証跡          | `outputs/phase-5/post-implementation-green.log`                            | Phase 5 成果物 |
| カバレッジ報告     | `outputs/phase-7/coverage-report.md`                                       | Phase 7 成果物 |
| 未網羅一覧         | `outputs/phase-7/uncovered-items.md`                                       | Phase 7 成果物 |
| 要件追跡表         | `outputs/phase-7/requirements-traceability.md`                             | Phase 7 成果物 |
| リファクタログ     | `outputs/phase-8/refactoring-log.md`                                       | Phase 8 成果物 |
| 回帰確認           | `outputs/phase-8/regression-check.md`                                      | Phase 8 成果物 |
| 責務分割図         | `outputs/phase-8/responsibility-map.md`                                    | Phase 8 成果物 |
| 再現性ログ         | `outputs/phase-9/reproducibility-log.md`                                   | Phase 9 成果物 |
| 運用評価           | `outputs/phase-9/operation-readiness.md`                                   | Phase 9 成果物 |

### システム仕様（aiworkflow-requirements）

> 実装前に以下のシステム仕様を確認し、既存運用との整合を確保してください。

| 参照資料             | パス                                                                        | 内容                             |
| -------------------- | --------------------------------------------------------------------------- | -------------------------------- |
| task-workflow-rules  | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`  | 最終レビュー品質ゲート判定ルール |
| quality-requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | リリース品質基準                 |
| lessons-learned      | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`      | 過去のレビュー教訓と再発防止     |

## 実行手順

1. 受入基準に対して達成状況を照合する。
2. 機能・品質・運用の3区分で指摘を記録する。
3. 指摘の重大度を判定し、戻り先Phaseを決定する。

## 統合テスト連携

| 観点       | 連携内容                                     |
| ---------- | -------------------------------------------- |
| 判定再現性 | 同一条件で同一レビュー判定になること         |
| 仕様整合性 | 受入基準・設計・実装の判定根拠が一致すること |
| 監査可能性 | 指摘と戻り先が記録され、追跡可能であること   |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                                   | 仕様参照先                                                                                                                        |
| ------------------ | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| セキュリティ       | 入力バリデーション実装の網羅性を最終確認   | `.claude/skills/aiworkflow-requirements/references/security-*.md`                                                                 |
| アーキテクチャ     | 関数分離とモジュール構造の妥当性を最終確認 | `.claude/skills/aiworkflow-requirements/references/architecture-*.md`                                                             |
| API/IPC契約        | 適用外（CLIスクリプト改修のため）          | `.claude/skills/aiworkflow-requirements/references/api-*.md`, `.claude/skills/aiworkflow-requirements/references/interfaces-*.md` |
| エラーハンドリング | 異常系の網羅性とexit code一貫性を最終確認  | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                             |
| 品質保証           | 受入基準の全項目達成を最終判定             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                                       |

## 成果物

| 成果物           | パス                                        | 説明         |
| ---------------- | ------------------------------------------- | ------------ |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`   | ゲート判定   |
| 指摘一覧         | `outputs/phase-10/final-review-findings.md` | 指摘と重大度 |
| 是正計画         | `outputs/phase-10/remediation-plan.md`      | 戻り対応計画 |

## 完了条件

- [ ] 最終レビュー判定が記録されている
- [ ] 指摘の重大度と戻り先Phaseが明示されている
- [ ] Phase 11 開始条件が満たされている
- [ ] 本Phase内の全タスクを100%実行完了

## レビューゲート（Phase 3, 10 の場合）

### レビュー結果判定

| 判定     | 条件               | 次アクション                             |
| -------- | ------------------ | ---------------------------------------- |
| PASS     | 重大指摘なし       | Phase 11 へ進む                          |
| MINOR    | 軽微指摘のみ       | 指摘を未タスク候補化して Phase 11 へ進む |
| MAJOR    | 実装品質に重大影響 | Phase 5 または Phase 8 へ戻る            |
| CRITICAL | 要件再定義が必要   | Phase 1 へ戻る                           |

### 戻り先決定基準

| 問題の種類     | 戻り先  |
| -------------- | ------- |
| 要件定義の欠落 | Phase 1 |
| 設計整合の欠落 | Phase 2 |
| 実装不整合     | Phase 5 |
| 品質・構造問題 | Phase 8 |

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物が所定パスに生成済み
- [ ] 実行結果と完了条件の一致を確認済み

## 依存関係

- **前提**: Phase 9
- **後続**: Phase 11

## サブタスク管理

- [ ] 参照資料の確認を完了
- [ ] 実行タスク（SubAgent担当）を完了
- [ ] 成果物作成と配置を完了
- [ ] 完了条件の自己検証を完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスク成果物が生成済み
- [ ] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/ut-imp-unassigned-audit-scope-control-001 --phase 10` 実行で問題なし

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録する。

- 実行タスク別の完了可否
- 発見事項（良かった点 / 問題点 / 改善提案）
- 次Phaseへの引き継ぎ事項

## 次のPhase

Phase 11: 手動テスト検証（phase-11-manual-test.md）

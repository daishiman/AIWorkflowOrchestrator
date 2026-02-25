# Phase 7: テストカバレッジ確認

## メタ情報

| 項目       | 値                                                                     |
| ---------- | ---------------------------------------------------------------------- |
| Phase      | 7                                                                      |
| タスクID   | UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001                              |
| 機能名     | ut-imp-unassigned-audit-scope-control-001                              |
| 前提Phase  | Phase 6                                                                |
| 後続Phase  | Phase 8                                                                |
| ステータス | 未実施                                                                 |
| Issue      | [#898](https://github.com/daishiman/AIWorkflowOrchestrator/issues/898) |
| 作成日     | 2026-02-25                                                             |

## 目的

追加した監査分離機能に対し、分岐網羅と要件網羅が達成されていることを確認する。

## 背景

Phase 4-6で作成・拡充したテストのカバレッジが基準（Line 80%/Branch 60%/Function 80%）を満たしているかを計測し、不足箇所を特定する。未達の場合はPhase 6へ戻りケースを追加する。

## 実行タスク

- SubAgent-A（網羅率確認）: 分岐・条件・エラー処理の網羅状況を確認する。
- SubAgent-B（要件追跡）: Phase 1 受入基準とテストケースの対応表を確認する。
- Lead（判定）: 未網羅項目を特定し Phase 6 戻りの要否を判定する。

## 参照資料

| 参照資料       | パス                                                                         | 内容             |
| -------------- | ---------------------------------------------------------------------------- | ---------------- |
| Phase 1        | `phase-1-requirements.md`                                                    | 受入基準との照合 |
| Phase 5        | `phase-5-implementation.md`                                                  | 実装分岐の確認   |
| Phase 6        | `phase-6-test-expansion.md`                                                  | テスト拡充結果   |
| 受入基準       | `outputs/phase-1/acceptance-criteria.md`                                     | 網羅判定基準     |
| 拡張結果       | `outputs/phase-6/test-expansion-result.md`                                   | 実行結果         |
| カバレッジ基準 | `.claude/skills/task-specification-creator/references/coverage-standards.md` | しきい値         |
| 差分レポート   | `outputs/phase-6/delta-report.md`                                            | Phase 6 成果物   |
| 失敗ケース分析 | `outputs/phase-6/failure-cases.md`                                           | Phase 6 成果物   |

### システム仕様（aiworkflow-requirements）

> 実装前に以下のシステム仕様を確認し、既存運用との整合を確保してください。

| 参照資料             | パス                                                                        | 内容                                               |
| -------------------- | --------------------------------------------------------------------------- | -------------------------------------------------- |
| quality-requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | Line/Branch/Functionカバレッジの最低基準と推奨基準 |

## 実行手順

1. 要件IDごとに対応テストケースを割り当てる。
2. 実行結果から未検証の要件・分岐を抽出する。
3. 未網羅がある場合は Phase 6 へ戻す項目を決定する。

## 統合テスト連携

| 観点     | 連携内容                                   |
| -------- | ------------------------------------------ |
| 要件追跡 | 受入基準の全項目が検証済みであること       |
| 分岐網羅 | 新規ロジックの主要分岐が網羅されていること |
| 戻り判断 | 未網羅時に戻り先Phaseを明示できること      |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                                     | 仕様参照先                                                                                                                        |
| ------------------ | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| セキュリティ       | 適用外（カバレッジ計測のため）               | `.claude/skills/aiworkflow-requirements/references/security-*.md`                                                                 |
| アーキテクチャ     | 適用外（カバレッジ計測のため）               | `.claude/skills/aiworkflow-requirements/references/architecture-*.md`                                                             |
| API/IPC契約        | 適用外（カバレッジ計測のため）               | `.claude/skills/aiworkflow-requirements/references/api-*.md`, `.claude/skills/aiworkflow-requirements/references/interfaces-*.md` |
| エラーハンドリング | 異常系パスのカバレッジ計測                   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                             |
| 品質保証           | Line/Branch/Functionカバレッジの基準達成判定 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                                       |

## 成果物

| 成果物         | パス                                           | 説明             |
| -------------- | ---------------------------------------------- | ---------------- |
| カバレッジ報告 | `outputs/phase-7/coverage-report.md`           | 網羅状況         |
| 未網羅一覧     | `outputs/phase-7/uncovered-items.md`           | 不足項目         |
| 要件追跡表     | `outputs/phase-7/requirements-traceability.md` | 要件とテスト対応 |

## 完了条件

- [ ] 受入基準の全項目について検証状況が示されている
- [ ] 未網羅項目の有無が判定されている
- [ ] 未網羅がある場合の戻り先Phaseが特定されている
- [ ] 本Phase内の全タスクを100%実行完了

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物が所定パスに生成済み
- [ ] 実行結果と完了条件の一致を確認済み

## 依存関係

- **前提**: Phase 6
- **後続**: Phase 8

## サブタスク管理

- [ ] 参照資料の確認を完了
- [ ] 実行タスク（SubAgent担当）を完了
- [ ] 成果物作成と配置を完了
- [ ] 完了条件の自己検証を完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスク成果物が生成済み
- [ ] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/ut-imp-unassigned-audit-scope-control-001 --phase 7` 実行で問題なし

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録する。

- 実行タスク別の完了可否
- 発見事項（良かった点 / 問題点 / 改善提案）
- 次Phaseへの引き継ぎ事項

## 次のPhase

Phase 8: リファクタリング（phase-8-refactoring.md）

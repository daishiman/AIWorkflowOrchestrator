# Phase 6: テスト拡充

## メタ情報

| 項目       | 値                                                                     |
| ---------- | ---------------------------------------------------------------------- |
| Phase      | 6                                                                      |
| タスクID   | UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001                              |
| 機能名     | ut-imp-unassigned-audit-scope-control-001                              |
| 前提Phase  | Phase 5                                                                |
| 後続Phase  | Phase 7                                                                |
| ステータス | 未実施                                                                 |
| Issue      | [#898](https://github.com/daishiman/AIWorkflowOrchestrator/issues/898) |
| 作成日     | 2026-02-25                                                             |

## 目的

Phase 4 で作成した基礎テストに加え、運用上の失敗パターンを検証対象へ追加して回帰耐性を高める。

## 背景

Phase 5の実装で基礎テストはGreen化したが、運用上の失敗パターン（差分なし入力、対象外ファイルの混入、組み合わせ異常）は未検証。回帰耐性を高めるために追加ケースでカバレッジを拡充する。

## 実行タスク

- SubAgent-A（拡張ケース）: 差分監査と全体監査の組み合わせケースを追加する。
- SubAgent-B（失敗パターン）: パス不正・入力欠落・無効組み合わせのケースを追加する。
- Lead（結果整理）: テスト結果の失敗原因を分類し是正方針を整理する。

## 参照資料

| 参照資料       | パス                                                                        | 内容           |
| -------------- | --------------------------------------------------------------------------- | -------------- |
| Phase 5        | `phase-5-implementation.md`                                                 | 実装結果       |
| Phase 4成果物  | `outputs/phase-4/test-specification.md`                                     | 追加対象ケース |
| 実装ログ       | `outputs/phase-5/implementation-log.md`                                     | 分岐条件確認   |
| 品質要件       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | テスト品質基準 |
| 実行コマンド集 | `outputs/phase-4/test-commands.md`                                          | Phase 4 成果物 |
| 回帰ケース     | `outputs/phase-4/regression-cases.md`                                       | Phase 4 成果物 |
| Red証跡        | `outputs/phase-4/pre-implementation-red.log`                                | Phase 4 成果物 |
| 差分サマリー   | `outputs/phase-5/diff-summary.md`                                           | Phase 5 成果物 |
| 影響分析       | `outputs/phase-5/impact-analysis.md`                                        | Phase 5 成果物 |
| Green証跡      | `outputs/phase-5/post-implementation-green.log`                             | Phase 5 成果物 |

### システム仕様（aiworkflow-requirements）

> 実装前に以下のシステム仕様を確認し、既存運用との整合を確保してください。

| 参照資料             | パス                                                                        | 内容                             |
| -------------------- | --------------------------------------------------------------------------- | -------------------------------- |
| quality-requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | テスト拡充の品質基準と網羅性要件 |
| error-handling       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`       | 異常系テスト追加の根拠           |

## 実行手順

1. Phase 4 テスト仕様に不足するシナリオを特定する。
2. 追加ケースを実行し、失敗時に原因を分類する。
3. 実装修正が必要な項目と仕様追記で解決できる項目を分離する。

## 統合テスト連携

| 観点     | 連携内容                                            |
| -------- | --------------------------------------------------- |
| 回帰耐性 | 既存機能への影響を追加ケースで検証する              |
| 例外処理 | 異常入力で終了コードとメッセージが一貫すること      |
| 監査運用 | current/baseline の使い分けが運用想定に一致すること |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                             | 仕様参照先                                                                                                                        |
| ------------------ | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| セキュリティ       | 境界値入力テストでのセキュリティ検証 | `.claude/skills/aiworkflow-requirements/references/security-*.md`                                                                 |
| アーキテクチャ     | 適用外（テスト拡充のため）           | `.claude/skills/aiworkflow-requirements/references/architecture-*.md`                                                             |
| API/IPC契約        | 適用外（CLIスクリプト改修のため）    | `.claude/skills/aiworkflow-requirements/references/api-*.md`, `.claude/skills/aiworkflow-requirements/references/interfaces-*.md` |
| エラーハンドリング | 異常入力の組み合わせテスト追加       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                             |
| 品質保証           | 回帰テストの網羅率向上               | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                                       |

## 成果物

| 成果物         | パス                                       | 説明           |
| -------------- | ------------------------------------------ | -------------- |
| 拡張結果       | `outputs/phase-6/test-expansion-result.md` | 実行結果一覧   |
| 差分レポート   | `outputs/phase-6/delta-report.md`          | 追加ケース差分 |
| 失敗ケース分析 | `outputs/phase-6/failure-cases.md`         | 失敗と対処     |

## 完了条件

- [ ] 拡張ケースが追加され実行されている
- [ ] 失敗ケースの分類と対処方針が記録されている
- [ ] current/baseline 判定の回帰がないことを確認している
- [ ] 本Phase内の全タスクを100%実行完了

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物が所定パスに生成済み
- [ ] 実行結果と完了条件の一致を確認済み

## 依存関係

- **前提**: Phase 5
- **後続**: Phase 7

## サブタスク管理

- [ ] 参照資料の確認を完了
- [ ] 実行タスク（SubAgent担当）を完了
- [ ] 成果物作成と配置を完了
- [ ] 完了条件の自己検証を完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスク成果物が生成済み
- [ ] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/ut-imp-unassigned-audit-scope-control-001 --phase 6` 実行で問題なし

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録する。

- 実行タスク別の完了可否
- 発見事項（良かった点 / 問題点 / 改善提案）
- 次Phaseへの引き継ぎ事項

## 次のPhase

Phase 7: テストカバレッジ確認（phase-7-coverage-check.md）

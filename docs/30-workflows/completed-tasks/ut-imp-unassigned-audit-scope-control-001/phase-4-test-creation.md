# Phase 4: テスト作成

## メタ情報

| 項目       | 値                                                                     |
| ---------- | ---------------------------------------------------------------------- |
| Phase      | 4                                                                      |
| タスクID   | UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001                              |
| 機能名     | ut-imp-unassigned-audit-scope-control-001                              |
| 前提Phase  | Phase 3                                                                |
| 後続Phase  | Phase 5                                                                |
| ステータス | 未実施                                                                 |
| 作成日     | 2026-02-25                                                             |
| Issue      | [#898](https://github.com/daishiman/AIWorkflowOrchestrator/issues/898) |

## 目的

対象監査・全体監査の分離仕様を担保する検証ケースと検証コマンドを先に定義し、実装前に期待挙動を固定する。

## 背景

Phase 3でPASS/MINOR判定された設計に基づき、対象監査・全体監査・分類精度の検証ケースをTDDのRed段階として先に定義する。期待挙動を実装前に固定することで、Phase 5の実装品質を担保する。

## 実行タスク

- SubAgent-A（正常系）: `--target-file` と `--diff-from` の正常系テストケースを設計する。
- SubAgent-B（異常系）: 無効引数・未存在ファイル・差分なしケースのテストを設計する。
- Lead（判定設計）: current/baseline と exit code の期待値を固定する。

## 参照資料

| 参照資料         | パス                                                                          | 内容             |
| ---------------- | ----------------------------------------------------------------------------- | ---------------- |
| Phase 1          | `phase-1-requirements.md`                                                     | 要件と受入基準   |
| Phase 2          | `phase-2-design.md`                                                           | テスト対象設計   |
| Phase 3          | `phase-3-design-review.md`                                                    | レビュー指摘反映 |
| 設計マッピング   | `outputs/phase-2/design-test-mapping.md`                                      | ケース設計入力   |
| 監査スクリプト   | `.claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js` | テスト対象       |
| 品質基準         | `.claude/skills/task-specification-creator/references/coverage-standards.md`  | 網羅性基準       |
| 要件定義         | `outputs/phase-1/requirements-definition.md`                                  | Phase 1 成果物   |
| 受入基準         | `outputs/phase-1/acceptance-criteria.md`                                      | Phase 1 成果物   |
| SubAgent責務分担 | `outputs/phase-1/subagent-responsibilities.md`                                | Phase 1 成果物   |
| 仕様参照抽出     | `outputs/phase-1/aiworkflow-spec-extraction.md`                               | Phase 1 成果物   |
| 設計書           | `outputs/phase-2/scope-control-design.md`                                     | Phase 2 成果物   |
| 入出力仕様       | `outputs/phase-2/cli-contract.md`                                             | Phase 2 成果物   |
| リスク分析       | `outputs/phase-2/risk-analysis.md`                                            | Phase 2 成果物   |
| レビュー結果     | `outputs/phase-3/design-review-result.md`                                     | Phase 3 成果物   |
| 指摘一覧         | `outputs/phase-3/review-findings.md`                                          | Phase 3 成果物   |
| 是正計画         | `outputs/phase-3/remediation-plan.md`                                         | Phase 3 成果物   |

### システム仕様（aiworkflow-requirements）

> 実装前に以下のシステム仕様を確認し、既存運用との整合を確保してください。

| 参照資料             | パス                                                                        | 内容                           |
| -------------------- | --------------------------------------------------------------------------- | ------------------------------ |
| quality-requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | テストケースの網羅性・品質基準 |
| error-handling       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`       | 異常系テストケースの設計方針   |
| lessons-learned      | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`      | テスト設計時の教訓             |

## 実行手順

1. 主要シナリオを `normal / edge / invalid` に分類する。
2. 期待値（violations分類、件数、exit code）をケースごとに定義する。
3. 再現手順をコマンド化し、Phase 5 で即実行可能にする。

## 統合テスト連携

| 観点           | 連携内容                             |
| -------------- | ------------------------------------ |
| スクリプト回帰 | 既存監査の出力構造が壊れていないこと |
| 仕様準拠       | Phase 2 で定義した契約と一致すること |
| 再現性         | 同じ入力で同じ分類結果になること     |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                                     | 仕様参照先                                                                                                                        |
| ------------------ | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| セキュリティ       | 無効入力テストケースでセキュリティ境界を検証 | `.claude/skills/aiworkflow-requirements/references/security-*.md`                                                                 |
| アーキテクチャ     | 適用外（テスト設計のため）                   | `.claude/skills/aiworkflow-requirements/references/architecture-*.md`                                                             |
| API/IPC契約        | 適用外（CLIスクリプト内部改修のため）        | `.claude/skills/aiworkflow-requirements/references/api-*.md`, `.claude/skills/aiworkflow-requirements/references/interfaces-*.md` |
| エラーハンドリング | 異常系テストで期待エラー出力を定義           | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                             |
| 品質保証           | 正常/異常/境界の網羅性を評価                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                                       |

## 成果物

| 成果物         | パス                                    | 説明               |
| -------------- | --------------------------------------- | ------------------ |
| テスト仕様     | `outputs/phase-4/test-specification.md` | テストケース一覧   |
| 実行コマンド集 | `outputs/phase-4/test-commands.md`      | 実行手順           |
| 回帰ケース     | `outputs/phase-4/regression-cases.md`   | 既存互換の検証項目 |

## 完了条件

- [ ] 正常系・異常系・境界系がケース化されている
- [ ] すべてのケースに期待値が定義されている
- [ ] Phase 5 でそのまま実行可能なコマンドが定義されている
- [ ] 本Phase内の全タスクを100%実行完了

## TDD検証（Phase 4, 5, 8 の場合）

- [ ] 想定TDD状態（Phase 4）に一致する検証を実施した
- [ ] 失敗/成功の証跡を成果物に記録した
- [ ] 後続Phaseで再現可能なコマンドを残した

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物が所定パスに生成済み
- [ ] 実行結果と完了条件の一致を確認済み

## 依存関係

- **前提**: Phase 3
- **後続**: Phase 5

## サブタスク管理

- [ ] 参照資料の確認を完了
- [ ] 実行タスク（SubAgent担当）を完了
- [ ] 成果物作成と配置を完了
- [ ] 完了条件の自己検証を完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスク成果物が生成済み
- [ ] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/ut-imp-unassigned-audit-scope-control-001 --phase 4` 実行で問題なし

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録する。

- 実行タスク別の完了可否
- 発見事項（良かった点 / 問題点 / 改善提案）
- 次Phaseへの引き継ぎ事項

## 次のPhase

Phase 5: 実装（phase-5-implementation.md）

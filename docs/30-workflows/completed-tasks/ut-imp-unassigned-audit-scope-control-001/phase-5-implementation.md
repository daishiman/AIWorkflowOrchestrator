# Phase 5: 実装

## メタ情報

| 項目       | 値                                                                     |
| ---------- | ---------------------------------------------------------------------- |
| Phase      | 5                                                                      |
| タスクID   | UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001                              |
| 機能名     | ut-imp-unassigned-audit-scope-control-001                              |
| 前提Phase  | Phase 4                                                                |
| 後続Phase  | Phase 6                                                                |
| ステータス | 未実施                                                                 |
| Issue      | [#898](https://github.com/daishiman/AIWorkflowOrchestrator/issues/898) |
| 作成日     | 2026-02-25                                                             |

## 目的

設計とテスト仕様に従って `audit-unassigned-tasks.js` に対象監査機能と結果分類機能を実装する。

## 背景

Phase 4で定義したテストケースが全て失敗する（Red）状態から、`audit-unassigned-tasks.js` に対象スコープ制御機能を実装してテストを通す（Green）段階。TDDサイクルに従い、設計通りのCLIオプション・分類ロジック・exit code判定を最小限のコードで実装する。

## 実行タスク

- SubAgent-A（CLI実装）: 新規オプションと入力検証を実装する。
- SubAgent-B（分類実装）: current/baseline 分類ロジックと出力拡張を実装する。
- Lead（統合）: exit code 方針・互換性・ログ出力を統合する。

## 参照資料

| 参照資料       | パス                                                                          | 内容                 |
| -------------- | ----------------------------------------------------------------------------- | -------------------- |
| Phase 4        | `phase-4-test-creation.md`                                                    | 実装前提のテスト仕様 |
| テストコマンド | `outputs/phase-4/test-commands.md`                                            | 実装後の確認手順     |
| 監査スクリプト | `.claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js` | 実装対象             |
| 品質要件       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`   | 実装品質基準         |
| 教訓集         | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`        | 同種不具合回避       |
| テスト仕様     | `outputs/phase-4/test-specification.md`                                       | Phase 4 成果物       |
| 回帰ケース     | `outputs/phase-4/regression-cases.md`                                         | Phase 4 成果物       |
| Red証跡        | `outputs/phase-4/pre-implementation-red.log`                                  | Phase 4 成果物       |

### システム仕様（aiworkflow-requirements）

> 実装前に以下のシステム仕様を確認し、既存運用との整合を確保してください。

| 参照資料             | パス                                                                        | 内容                                       |
| -------------------- | --------------------------------------------------------------------------- | ------------------------------------------ |
| quality-requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 実装コードの品質基準                       |
| error-handling       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`       | 不正入力・ファイル未検出時の異常系実装方針 |
| lessons-learned      | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`      | 同種実装不具合の回避知見                   |

## 実行手順

1. CLIオプション追加と入力バリデーションを実装する。
2. 対象ファイルリスト構築ロジックを実装する。
3. current/baseline への分類ロジックを実装する。
4. JSON出力拡張と互換維持を実装する。
5. current基準の exit code とログメッセージを実装する。

## 統合テスト連携

| 観点           | 連携内容                                  |
| -------------- | ----------------------------------------- |
| 既存利用者影響 | 既存引数の出力が維持されること            |
| 判定品質       | current/baseline が意図通り分離されること |
| 運用接続       | Phase 12 のドキュメントに接続できること   |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                                    | 仕様参照先                                                                                                                        |
| ------------------ | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| セキュリティ       | CLIの入力パスバリデーション実装を含む       | `.claude/skills/aiworkflow-requirements/references/security-*.md`                                                                 |
| アーキテクチャ     | 分類ロジックの関数構造と既存コードへの影響  | `.claude/skills/aiworkflow-requirements/references/architecture-*.md`                                                             |
| API/IPC契約        | 適用外（CLIスクリプト改修のため）           | `.claude/skills/aiworkflow-requirements/references/api-*.md`, `.claude/skills/aiworkflow-requirements/references/interfaces-*.md` |
| エラーハンドリング | 不正入力時のエラーメッセージとexit code実装 | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                             |
| 品質保証           | Phase 4テストケースの全件Green化を確認      | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                                       |

## 成果物

| 成果物       | パス                                    | 説明               |
| ------------ | --------------------------------------- | ------------------ |
| 実装ログ     | `outputs/phase-5/implementation-log.md` | 実装内容と判断理由 |
| 差分サマリー | `outputs/phase-5/diff-summary.md`       | 変更点一覧         |
| 影響分析     | `outputs/phase-5/impact-analysis.md`    | 互換性と運用影響   |

## 完了条件

- [ ] 新規オプションが実装されている
- [ ] current/baseline 出力が実装されている
- [ ] current 基準の exit code が実装されている
- [ ] 既存オプション互換が維持されている
- [ ] 本Phase内の全タスクを100%実行完了

## TDD検証（Phase 4, 5, 8 の場合）

- [ ] 想定TDD状態（Phase 5）に一致する検証を実施した
- [ ] 失敗/成功の証跡を成果物に記録した
- [ ] 後続Phaseで再現可能なコマンドを残した

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物が所定パスに生成済み
- [ ] 実行結果と完了条件の一致を確認済み

## 依存関係

- **前提**: Phase 4
- **後続**: Phase 6

## サブタスク管理

- [ ] 参照資料の確認を完了
- [ ] 実行タスク（SubAgent担当）を完了
- [ ] 成果物作成と配置を完了
- [ ] 完了条件の自己検証を完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスク成果物が生成済み
- [ ] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/ut-imp-unassigned-audit-scope-control-001 --phase 5` 実行で問題なし

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録する。

- 実行タスク別の完了可否
- 発見事項（良かった点 / 問題点 / 改善提案）
- 次Phaseへの引き継ぎ事項

## 次のPhase

Phase 6: テスト拡充（phase-6-test-expansion.md）

# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                                   |
| ---------- | ------------------------------------------------------ |
| Phase      | 12                                                     |
| 機能名     | TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001             |
| タスク名   | auth-key IPCハンドラ登録漏れとライフサイクル整合の修正 |
| 前提Phase  | Phase 11                                               |
| 後続Phase  | Phase 13                                               |
| 作成日     | 2026-03-05                                             |
| ステータス | completed                                              |

## 目的

Phase 12必須5タスクを完了可能な形で固定する。

## 背景

`auth-key:exists` で `No handler registered` が発生し、実行前認証確認が停止する。

## SubAgentチーム編成

| SubAgent   | 関心ごと        | 主担当                     |
| ---------- | --------------- | -------------------------- |
| SubAgent-A | Main/IPC責務    | 登録順序・ライフサイクル   |
| SubAgent-B | Preload/API契約 | 型契約・公開境界           |
| SubAgent-C | Renderer/UX契約 | 状態遷移・表示整合         |
| SubAgent-D | 統合監査        | 矛盾・漏れ・整合・依存判定 |

## 実行タスク

- Task 12-1 実装ガイド作成: Part 1(中学生向け)とPart 2(技術者向け)の2部構成を定義する
- Task 12-2 システム仕様更新: Step 1-A/1-B/1-C を必須で実行し、Step 2は条件判定を記録する
- Task 12-3 更新履歴作成: documentation-changelogを生成し全Step結果を記録する
- Task 12-4 未タスク検出: 0件でも unassigned-task-detection を出力する
- Task 12-5 フィードバック作成: 改善点が0件でも skill-feedback-report を出力する

## 参照資料

| 参照資料               | パス                                                         | 説明            |
| ---------------------- | ------------------------------------------------------------ | --------------- |
| 要件定義書             | `outputs/phase-1/requirements-definition.md`                 | Phase 1 成果物  |
| 受け入れ基準           | `outputs/phase-1/acceptance-criteria.md`                     | Phase 1 成果物  |
| 仕様抽出結果           | `outputs/phase-1/aiworkflow-requirements-extraction.md`      | Phase 1 成果物  |
| 差分カバレッジ         | `outputs/phase-1/branch-diff-coverage.md`                    | Phase 1 成果物  |
| トレーサビリティ行列   | `outputs/phase-1/implementation-spec-traceability-matrix.md` | Phase 1 成果物  |
| アーキテクチャ設計     | `outputs/phase-2/architecture-design.md`                     | Phase 2 成果物  |
| IPC契約設計            | `outputs/phase-2/ipc-contract-design.md`                     | Phase 2 成果物  |
| テスト戦略             | `outputs/phase-2/test-strategy.md`                           | Phase 2 成果物  |
| 依存整合マトリクス     | `outputs/phase-2/dependency-consistency-matrix.md`           | Phase 2 成果物  |
| 実装サマリー           | `outputs/phase-5/implementation-summary.md`                  | Phase 5 成果物  |
| 変更ファイル一覧       | `outputs/phase-5/changed-files.md`                           | Phase 5 成果物  |
| 契約差分               | `outputs/phase-5/contract-diff.md`                           | Phase 5 成果物  |
| 拡張テストケース       | `outputs/phase-6/expanded-test-cases.md`                     | Phase 6 成果物  |
| 回帰テスト結果         | `outputs/phase-6/regression-test-result.md`                  | Phase 6 成果物  |
| 異常系結果             | `outputs/phase-6/edge-case-result.md`                        | Phase 6 成果物  |
| カバレッジ計画         | `outputs/phase-7/coverage-plan.md`                           | Phase 7 成果物  |
| 未到達分析             | `outputs/phase-7/uncovered-analysis-plan.md`                 | Phase 7 成果物  |
| トレーサビリティ網羅率 | `outputs/phase-7/traceability-coverage-report.md`            | Phase 7 成果物  |
| リファクタ計画         | `outputs/phase-8/refactoring-plan.md`                        | Phase 8 成果物  |
| 再テスト計画           | `outputs/phase-8/post-refactor-test-plan.md`                 | Phase 8 成果物  |
| 責務境界マップ         | `outputs/phase-8/responsibility-boundary-map.md`             | Phase 8 成果物  |
| 品質レポート           | `outputs/phase-9/quality-report.md`                          | Phase 9 成果物  |
| リスク台帳             | `outputs/phase-9/risk-register.md`                           | Phase 9 成果物  |
| 因果ループ監査         | `outputs/phase-9/causal-loop-check.md`                       | Phase 9 成果物  |
| 最終レビュー結果       | `outputs/phase-10/final-review-result.md`                    | Phase 10 成果物 |
| 是正計画               | `outputs/phase-10/corrective-action-plan.md`                 | Phase 10 成果物 |
| 出荷準備チェック       | `outputs/phase-10/release-readiness-checklist.md`            | Phase 10 成果物 |
| 手動テスト結果         | `outputs/phase-11/manual-test-result.md`                     | Phase 11 成果物 |
| 証跡インデックス       | `outputs/phase-11/evidence-index.md`                         | Phase 11 成果物 |
| スクリーンショット計画 | `outputs/phase-11/screenshot-plan.md`                        | Phase 11 成果物 |

## 実行手順

1. Task 12-1: implementation-guide.md を Part 1/Part 2 で作成する。
2. Task 12-2 Step 1-A: 完了タスク記録、関連リンク、LOGS.md(2ファイル)、topic-map.md を更新する。
3. Task 12-2 Step 1-B: 実装状況テーブルを `completed` または `spec_created` へ更新する。
4. Task 12-2 Step 1-C: 関連タスクテーブルのステータスを更新する。
5. Task 12-2 Step 2: 新規I/F追加有無を判定し、必要時だけ仕様更新を実施する。
6. Task 12-3/12-4/12-5: changelog、未タスク検出、skill-feedback を出力する。

## 多角的チェック観点

| 観点     | 確認内容                                          |
| -------- | ------------------------------------------------- |
| 矛盾     | 仕様と成果物の矛盾がないか確認する                |
| 漏れ     | 要件から成果物への未反映項目がないか確認する      |
| 整合性   | Main/Preload/Renderer契約が一致しているか確認する |
| 依存関係 | 依存Phaseとの入力出力が整合しているか確認する     |

## 成果物

| 成果物               | パス                                            | 説明                        |
| -------------------- | ----------------------------------------------- | --------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | Part1/Part2構成             |
| 仕様更新サマリー     | `outputs/phase-12/spec-update-summary.md`       | Step 1-A/1-B/1-C/Step 2記録 |
| 更新履歴             | `outputs/phase-12/documentation-changelog.md`   | ドキュメント更新履歴        |
| 未タスク検出         | `outputs/phase-12/unassigned-task-detection.md` | 検出結果(0件でも作成)       |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`     | 改善点(0件でも作成)         |
| Task2実行ログ        | `outputs/phase-12/phase12-task2-step-log.md`    | Step 1-A/1-B/1-C/Step 2記録 |

## 完了条件

- [x] 実行タスクで定義した成果物を全件作成
- [x] 矛盾がないことを確認
- [x] 漏れがないことを確認
- [x] 整合性が取れていることを確認
- [x] 依存関係が取れていることを確認
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. SubAgent-A/B/C の並列作業
3. SubAgent-D の統合判定
4. 成果物出力
5. 完了条件判定

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブル記載のファイルを全件生成
- [x] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [x] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/01-TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001
```

## Phase 12 Task 2 判定基準

| 判定項目 | 実行条件                       | 完了条件                                        |
| -------- | ------------------------------ | ----------------------------------------------- |
| Step 1-A | 全タスクで必須                 | 完了記録 + LOGS.md(2) + topic-map 更新          |
| Step 1-B | 全タスクで必須                 | 実装状況を completed または spec_created へ更新 |
| Step 1-C | 関連タスク記載がある場合は必須 | 関連タスク表ステータス更新                      |
| Step 2   | 新規I/F追加がある場合          | 対象仕様を更新し変更履歴へ記録                  |

## Phase 12 実装ガイド要件

- Part 1: 中学生向け説明、日常例、専門用語の即時説明。
- Part 2: TypeScript型、APIシグネチャ、エッジケース、設定値一覧。
- 未タスク検出レポートは0件でも必ず出力する。
- スキルフィードバックは改善点0件でも必ず出力する。

## 次のPhase

Phase 13: PR作成

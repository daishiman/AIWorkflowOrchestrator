# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 10                                     |
| タスクID   | TASK-RALLY-002                         |
| 機能名     | restored-pending-request-clarification |
| 前提Phase  | Phase 9                                |
| 後続Phase  | Phase 11                               |
| 作成日     | 2026-04-21                             |
| ステータス | completed                              |

## 目的

全 Phase の成果物を総合的にレビューし、PR 作成に進める状態かを最終判定する。

## 実行タスク

1. AC、品質、後続タスク影響を横断レビューする
2. PASS / MINOR / MAJOR の最終ゲートを決定する
3. Phase 11 と Phase 12 の前提条件を固定する

## 最終レビューチェックリスト

### 受け入れ基準確認

- [ ] AC-1: `pendingRequest` 合成式の直上に優先ルール説明コメントが追加されている
- [ ] AC-2: `workflowSnapshot?.awaitingUserInput` が非 null になったとき `restoredPendingRequest` がクリアされるロジックが存在する
- [ ] AC-3: コードを読んだ開発者が切り替わり条件を理解できる
- [ ] AC-4: `pnpm typecheck` がエラーなしで通過する
- [ ] AC-5: `pnpm lint` がエラーなしで通過する（exhaustive-deps 含む）

### 品質ゲート

- [ ] シナリオテスト（正常系・異常系・境界値）が全通過している
- [ ] カバレッジが維持または向上している
- [ ] コードレビューで問題なし

### 後続タスクへの影響確認

- [ ] RALLY-010（ラリー完了状態UI追加）の前提条件が満たされている
- [ ] ConversationalInterview.tsx が次の変更（RALLY-010）を受け入れられる状態になっている

## ゲート判定基準

| 判定                   | 条件                                                    |
| ---------------------- | ------------------------------------------------------- |
| PASS（Phase 11に進む） | AC-1〜AC-5 全PASS、全テスト通過、後続タスクへの影響なし |
| MINOR（Phase 8に戻る） | 軽微な問題あり、修正後に再レビュー                      |
| MAJOR（Phase 2に戻る） | 設計上の問題あり、再設計が必要                          |

## 参照資料

| 資料名               | パス                                              | 用途           |
| -------------------- | ------------------------------------------------- | -------------- |
| 品質レポート         | `outputs/phase-9/quality-report.md`               | Phase 9 成果物 |
| リスク台帳           | `outputs/phase-9/risk-register.md`                | Phase 9 成果物 |
| P50チェック結果      | `outputs/phase-1/p50-check-result.md`             | Phase 1 成果物 |
| 変更設計書           | `outputs/phase-2/change-design.md`                | Phase 2 成果物 |
| 実装サマリー         | `outputs/phase-5/implementation-summary.md`       | Phase 5 成果物 |
| カバレッジ確認結果   | `outputs/phase-7/coverage-check-result.md`        | Phase 7 成果物 |
| トレーサビリティ確認 | `outputs/phase-7/traceability-coverage-report.md` | Phase 7 成果物 |
| 未カバー分析         | `outputs/phase-7/uncovered-analysis.md`           | Phase 7 成果物 |
| リファクタリング計画 | `outputs/phase-8/refactoring-plan.md`             | Phase 8 成果物 |
| 責務境界マップ       | `outputs/phase-8/responsibility-boundary-map.md`  | Phase 8 成果物 |
| 因果ループ監査       | `outputs/phase-9/causal-loop-check.md`            | Phase 9 成果物 |

## 統合テスト連携

- Phase 11 は UI task として手動シナリオ + screenshot evidence を要求する
- Phase 12 は canonical 6成果物で close-out し、PR の可否は user approval に切り離す

## 多角的チェック観点（AIが判断）

- ダブル・ループ思考: 個別修正だけでなく後続 RALLY wave で再発しない条件を残せているか
- 戦略的思考: 今回の変更が Wave 1 の直列実行を滑らかにするか
- アブダクション: 万一不具合が残るなら最もありそうな原因は何か

## サブタスク管理

- G-1: AC 監査
- G-2: 品質ゲート判定
- G-3: 次Phase前提固定

## 成果物

| 成果物           | パス                                              | 説明                             |
| ---------------- | ------------------------------------------------- | -------------------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`         | AC確認・品質ゲート結果のサマリー |
| ゲート判定       | `outputs/phase-10/gate-decision.md`               | PASS/MINOR/MAJOR の判定と根拠    |
| 出荷準備チェック | `outputs/phase-10/release-readiness-checklist.md` | PR作成前の最終チェックリスト     |

## 完了条件

- [ ] AC-1〜AC-5 を全て確認した
- [ ] ゲート判定（PASS）を決定した
- [ ] 成果物テーブル記載のファイルを全件生成した

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] ゲート判定が PASS であることを確認
- [ ] 成果物テーブル記載のファイルを全件生成

## 次のPhase

Phase 11: 手動テスト検証（ゲート PASS の場合）

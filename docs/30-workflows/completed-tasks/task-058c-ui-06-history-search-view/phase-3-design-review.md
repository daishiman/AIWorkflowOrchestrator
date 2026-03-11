# Phase 3: 設計レビューゲート - タスク仕様書

## メタ情報

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| タスクID     | TASK-UI-06-HISTORY-SEARCH-VIEW |
| Phase        | 3                              |
| Phase名      | 設計レビューゲート             |
| カテゴリ     | UI改善                         |
| ステータス   | completed                      |
| 前提Phase    | Phase 2                        |
| 後続Phase    | Phase 4                        |
| 担当SubAgent | SubAgent-A, SubAgent-D         |

## 目的

Phase 1-2 の成果物が、058c の要求、現行実装、system spec、依存 task と矛盾しないことを確認し、Phase 4 以降へ進むかを判定する。

## 実行タスク

- トレーサビリティ監査: 要件、設計、成果物パスの対応を確認する
- 契約ドリフト監査: Store、shared types、IPC、preload の差分漏れを確認する
- UX監査: timeline 主役化、文言、操作量、a11y 条件を確認する
- リスク評価: 実装戻りの原因になる箇所を登録する
- Gate 判定: PASS、MINOR、MAJOR、CRITICAL を決定する

## 参照資料

| 参照資料       | パス                                                                       | 内容                      |
| -------------- | -------------------------------------------------------------------------- | ------------------------- |
| Phase 1 仕様   | `phase-1-requirements.md`                                                  | 要件                      |
| Phase 2 仕様   | `phase-2-design.md`                                                        | 設計                      |
| Phase 1 成果物 | `outputs/phase-1/`                                                         | 要件詳細                  |
| Phase 2 成果物 | `outputs/phase-2/`                                                         | 設計詳細                  |
| 現行 workflow  | `docs/30-workflows/completed-tasks/task-056c-notification-history-domain/` | 既存 HistorySearch の証跡 |

### システム仕様（aiworkflow-requirements）

| 参照資料      | パス                                                                            | 内容                   |
| ------------- | ------------------------------------------------------------------------------- | ---------------------- |
| UI実装正本    | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | 現行との差分確認       |
| 状態管理      | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`    | slice 契約監査         |
| 画面一覧      | `.claude/skills/aiworkflow-requirements/references/master-design.md`            | 画面名と位置づけ       |
| lessons       | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`          | 再発しやすい失敗の確認 |
| task workflow | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`            | 後続同期先の確認       |

## 実行手順

### ステップ1: 要件対設計の突合

AC-01〜AC-06 を行単位で点検し、設計成果物内の対応箇所を記録する。

### ステップ2: 契約ドリフト監査

Store、IPC、shared type、navigation link の変更予定がそれぞれ別の成果物へ書かれているかを確認する。

### ステップ3: リスク登録

filter 廃止に伴う既存 test 破壊、`history:get-stats` の扱い変更、ChatHistoryView 遷移ミス、IntersectionObserver テスト不安定化を登録する。

### ステップ4: Gate 判定

重大欠落がある場合は Phase 2 へ戻し、要件漏れがある場合は Phase 1 へ戻す。

## 統合テスト連携

- Phase 4 で作る UI、hook、slice、IPC test の対象が Phase 2 設計と一致しているかを監査する
- ChatHistoryView / EditorView 導線の integration case が test 計画へ含まれるかを確認する
- screenshot が必要な UI状態を Phase 11 まで遡れるよう、TC 起点で確認する

## 成果物

| 成果物               | パス                                      | 説明                            |
| -------------------- | ----------------------------------------- | ------------------------------- |
| 設計レビュー結果     | `outputs/phase-3/design-review-report.md` | PASS / MINOR / MAJOR / CRITICAL |
| リスク登録簿         | `outputs/phase-3/risk-register.md`        | 実装リスク一覧                  |
| トレーサビリティ表   | `outputs/phase-3/traceability-matrix.md`  | AC と成果物対応                 |
| spec drift checklist | `outputs/phase-3/spec-drift-checklist.md` | system spec との整合確認        |

## レビューゲート

### レビュー結果判定

| 判定     | 条件                                   | 次のアクション          |
| -------- | -------------------------------------- | ----------------------- |
| PASS     | 要件、設計、system spec 抽出に欠落なし | Phase 4 へ進行          |
| MINOR    | 文言や成果物名の軽微な修正で解消可能   | 修正後に Phase 4 へ進行 |
| MAJOR    | UI、state、IPC の設計欠落がある        | Phase 2 に戻る          |
| CRITICAL | 要件誤読または対象範囲誤りがある       | Phase 1 に戻る          |

## 完了条件

- [x] AC ごとの対応設計箇所が追跡可能である
- [x] Store、IPC、shared type、navigation の drift 候補が監査済みである
- [x] 実装前に潰すべきリスクが登録されている
- [x] Gate 判定と戻り先条件が明記されている
- [x] Phase 4 が参照する test 対象一覧が固定されている
- [x] 本Phase内の全タスクを100%実行完了

## Phase実行記録

### 実行タスク

| タスク               | 結果      | 備考                                |
| -------------------- | --------- | ----------------------------------- |
| トレーサビリティ監査 | completed | `traceability-matrix.md` に記録     |
| 契約ドリフト監査     | completed | `spec-drift-checklist.md` に記録    |
| UX監査               | completed | timeline 主役化 / sticky 条件を確認 |
| リスク評価           | completed | `risk-register.md` に登録           |
| Gate 判定            | completed | PASS 判定で Phase 4 へ進行          |

### 発見事項

- 良かった点: 実装前に preload/types と sourceTask drift を可視化できた
- 問題点: workflow docs の参照パスが実体とズレていた
- 改善提案: workflow 生成直後に drift guardian を掛けたい

### 次Phaseへの引き継ぎ事項

- Phase 4 では trim、dedupe、observer、manual screenshot TC を失敗条件へ固定する

## 次のPhase

Phase 4: テスト作成へ進む。

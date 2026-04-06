# Phase 13: PR作成

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 13                              |
| Phase名    | PR作成                          |
| 機能名     | ipc-session-runtime-unification |
| 対象機能   | TASK-UI-03 IPC 二重経路統合     |
| 前提Phase  | Phase 12: ドキュメント更新      |
| 次Phase    | -                               |
| ステータス | blocked                         |
| 作成日     | 2026-04-06                      |

## 目的

ユーザー承認がある場合のみ change summary と local check をまとめる。現時点では blocked を維持する。

## 実行タスク

### Task 1: 変更要約準備

- 変更点を整理する:
  - IPC 統合方針の策定と実装
  - preload API surface の整理
  - channels.ts のチャネル定義更新
  - creatorHandlers.ts のハンドラー構成整合化
  - 型定義の整理
  - セキュリティ要件の均一適用
- validator 結果を `outputs/phase-12/phase12-task-spec-compliance-check.md` と `outputs/phase-12/documentation-changelog.md` に集約する
- 残リスク（TASK-UI-01 依存、既存 UI コンポーネントとの互換性）を記録する

### Task 2: PR 実行条件の確認

- ユーザー承認がない限り commit / push / PR を実行しない
- TASK-UI-01 の完了状況を PR 前提条件として記録する

### Task 3: PR 作成手順

- `/ai:diff-to-pr` スキルを使用して PR を作成する
- PR 本文に関連 Issue を含める
- PR 本文のテンプレート:

  ```
  ## Summary
  - TASK-UI-03: IPC 二重経路統合（Session IPC / Runtime IPC）
  - preload API surface の整理、creatorHandlers の構成統合、チャネル命名規則の統一

  ## Related Issue
  - (関連 Issue 番号)

  ## Test plan
  - [ ] UT: IPC チャネルルーティングテスト
  - [ ] UT: セキュリティ均一性テスト
  - [ ] UT: チャネルホワイトリスト整合性テスト
  - [ ] 手動テスト: Session IPC / Runtime IPC の動作確認
  - [ ] 手動テスト: DevTools での IPC 通信監視
  ```

### Task 4: タスクディレクトリの完了時移動

- PR マージ後、タスクディレクトリを以下に移動する:
  - 移動元: `docs/30-workflows/step-12-par-task-ui-03-ipc-session-runtime-unification/`
  - 移動先: `docs/30-workflows/completed-tasks/`

## 参照資料

| 資料名                   | パス                                                     | 説明            |
| ------------------------ | -------------------------------------------------------- | --------------- |
| 設計成果物               | `outputs/phase-2/design-document.md`                     | 背景要約        |
| 統合戦略書               | `outputs/phase-2/ipc-unification-strategy.md`            | 方針選択根拠    |
| 実装記録                 | `outputs/phase-5/implementation-record.md`               | 修正内容        |
| テスト拡充記録           | `outputs/phase-6/test-expansion.md`                      | テスト差分      |
| カバレッジレポート       | `outputs/phase-7/coverage-report.md`                     | coverage 要約   |
| リファクタリングログ     | `outputs/phase-8/refactoring-log.md`                     | 整理内容        |
| QA レポート              | `outputs/phase-9/qa-report.md`                           | 品質ゲート      |
| 最終レビュー結果         | `outputs/phase-10/final-review-result.md`                | 判定            |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`                 | evidence 状態   |
| Phase 12 準拠確認        | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 直前成果物      |
| 変更履歴                 | `outputs/phase-12/documentation-changelog.md`            | 変更一覧        |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md`              | Phase 11 成果物 |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`               | Phase 12 成果物 |
| スキルフィードバック     | `outputs/phase-12/skill-feedback-report.md`              | Phase 12 成果物 |
| システム仕様更新サマリー | `outputs/phase-12/system-spec-update-summary.md`         | Phase 12 成果物 |
| 未割り当てタスク検出     | `outputs/phase-12/unassigned-task-detection.md`          | Phase 12 成果物 |

## 成果物

| 成果物               | パス                                     | 説明          |
| -------------------- | ---------------------------------------- | ------------- |
| PR作成記録           | `outputs/phase-13/pr-creation-record.md` | PR 説明の素案 |
| ローカルチェック結果 | `outputs/phase-13/local-check-result.md` | 実行ログ要約  |

## 完了条件

- [ ] ユーザー承認の有無が明記されている
- [ ] blocked 条件が明記されている
- [ ] commit / push / PR を未実行であることが記録されている
- [ ] TASK-UI-01 の依存状況が記録されている
- [ ] 承認後に必要な成果物が定義されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

- blocked: ユーザー承認待ち

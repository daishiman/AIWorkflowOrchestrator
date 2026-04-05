# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 13                                    |
| Phase名    | PR作成                                |
| 対象機能   | TASK-UI-02 ConversationPanel 孤立解消 |
| 前提Phase  | Phase 12: ドキュメント更新            |
| 次Phase    | -                                     |
| ステータス | blocked                               |
| 作成日     | 2026-04-06                            |
| 更新日     | 2026-04-06                            |

## 目的

ユーザー承認がある場合のみ change summary と local check をまとめる。現時点では blocked を維持する。

## 実行タスク

### Task 1: 変更要約準備

- 変更点を整理する:
  - ConversationPanel の統合/ルート追加の内容
  - IPC 経路の明確化内容
  - 共有コンポーネントの整理内容
  - デモ HTML のクリーンアップ内容
  - 削除したファイル一覧
- テスト結果を記録する
- 残リスク（TASK-UI-01 依存、TASK-UI-03 との並行影響）を記録する

### Task 2: PR 実行条件の確認

- ユーザー承認がない限り commit / push / PR を実行しない
- TASK-UI-01 の完了状況を PR 前提条件として記録する

### Task 3: PR 作成手順

- `/ai:diff-to-pr` スキルを使用して PR を作成する
- PR 本文に関連 Issue を含める（存在する場合）
- PR 本文のテンプレート:

  ```
  ## Summary
  - TASK-UI-02: ConversationPanel 孤立解消
  - SkillCreatorConversationPanel のルート追加 or ConversationalInterview との統合
  - session IPC / runtime IPC の使い分け明確化
  - QuestionCard 等の共有コンポーネント整理
  - デモ HTML のクリーンアップ

  ## Related Issue
  - (関連 Issue があれば記載)

  ## Test plan
  - [ ] UT: コンポーネント描画テスト
  - [ ] UT: IPC 経路テスト
  - [ ] UT: QuestionCard 全 UserInputKind テスト
  - [ ] 統合テスト: ルーティング到達性
  - [ ] 手動テスト: 会話フロー動作確認
  - [ ] 回帰テスト: 既存テスト pass 確認
  ```

### Task 4: タスクディレクトリの完了時移動

- PR マージ後、タスクディレクトリを以下に移動する:
  - 移動元: `docs/30-workflows/skill-creator-agent-sdk-lane/step-12-par-task-ui-02-conversation-panel-orphan-resolution/`
  - 移動先: `docs/30-workflows/completed-tasks/`

## 参照資料

| 資料名               | パス                                       | 説明          |
| -------------------- | ------------------------------------------ | ------------- |
| 設計書               | `outputs/phase-2/design-document.md`       | 背景要約      |
| 実装記録             | `outputs/phase-5/implementation-record.md` | 修正内容      |
| テスト拡充記録       | `outputs/phase-6/test-expansion.md`        | テスト差分    |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md`       | coverage 要約 |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md`       | 整理内容      |
| 品質保証レポート     | `outputs/phase-9/qa-report.md`             | 品質ゲート    |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md`  | 判定          |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`   | evidence      |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md` | 直前成果物    |

## 成果物

| 成果物     | パス                                     | 説明          |
| ---------- | ---------------------------------------- | ------------- |
| PR作成記録 | `outputs/phase-13/pr-creation-record.md` | PR 説明の素案 |

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

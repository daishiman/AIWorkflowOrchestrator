# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 13                                      |
| Phase名    | PR作成                                  |
| 対象機能   | lifecycle-panel-primary-route-promotion |
| 前提Phase  | Phase 12: ドキュメント更新              |
| 次Phase    | -（最終Phase）                          |
| ステータス | pending                                 |
| 作成日     | 2026-04-06                              |

## 目的

全 Phase の成果物を含む Pull Request を作成し、レビューに提出する。変更サマリ、テスト結果、AC 充足状況を PR 本文にまとめる。

## 実行タスク

### Task 1: 変更サマリ作成

- 変更対象ファイル一覧
- 各ファイルの変更概要
- 変更の目的と背景の要約

### Task 2: PR 本文作成

- タイトル: `feat(ui): TASK-UI-01 LifecyclePanel 一次導線昇格`
- Summary セクション:
  - SkillLifecyclePanel を一次導線に昇格
  - メインナビゲーション「スキル作成」からの直接アクセスを実現
  - 既存 SkillCreateWizard の後方互換を維持
- AC 充足セクション:
  - AC-1〜AC-6 の充足状況チェックリスト
- テスト結果セクション:
  - ユニットテスト結果
  - カバレッジ結果
  - 手動テスト結果（スクリーンショットリンク）
- 後続タスクセクション:
  - TASK-UI-02, TASK-UI-03 へ��影響

### Task 3: コミット整理

- コミットメッセージの整理
- 不要なコミットの squash（必要に応じて）
- コミット履歴の確認

### Task 4: PR 作成・提出

- `gh pr create` で PR を作成
- レビュアーを設定
- ラベルを設定（`ui`, `routing`, `TASK-UI-01`）

### Task 5: PR 作成記録

- PR URL を記録
- 変更サマリを `outputs/phase-13/pr-creation-record.md` にまとめる

## 参照資料

| 資料名                  | パス                                       | 説明            |
| ----------------------- | ------------------------------------------ | --------------- |
| Phase 10 最終レビュー   | `outputs/phase-10/final-review-result.md`  | AC 充足確認結果 |
| Phase 11 手動テスト結果 | `outputs/phase-11/manual-test-result.md`   | 手動テスト結果  |
| Phase 12 実装ガイド     | `outputs/phase-12/implementation-guide.md` | 変更サマリ      |
| Phase 9 QA レポート     | `outputs/phase-9/qa-report.md`             | 品質保証結果    |

## 成果物

| 成果物      | パス                                     | 説明                                      |
| ----------- | ---------------------------------------- | ----------------------------------------- |
| PR 作成記録 | `outputs/phase-13/pr-creation-record.md` | PR URL、変更サマリ、AC 充足チェックリスト |

## 完了条件

- [ ] 変更サマリが作成されている
- [ ] PR 本文が作成されている
- [ ] コミットが整理されている
- [ ] PR が作成・提出されている
- [ ] PR 作成記録が作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## タスク完了

TASK-UI-01 の全 Phase が完了。artifacts.json の status を `completed` に更新すること。

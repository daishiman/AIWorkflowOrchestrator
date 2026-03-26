# Phase 13: PR作成

## メタ情報

| 項目     | 値                                 |
| -------- | ---------------------------------- |
| Phase    | 13                                 |
| 機能名   | permission-store-sender-validation |
| タスクID | UT-06-002-UT-1                     |
| Issue    | #1527                              |
| 作成日   | 2026-03-24                         |

## 目的

ユーザー明示承認後にPR作成を実施する。

## 参照資料

| 資料名         | パス                                               | 説明                      |
| -------------- | -------------------------------------------------- | ------------------------- |
| PR作成ルール   | `.claude/rules/07-git-and-tooling.md#PR作成ルール` | PR命名・本文ルール        |
| /ai:diff-to-pr | スキル                                             | 差分→PR自動化ワークフロー |

## Phase 12 完了根拠

Phase 13 開始前に Phase 12 までの完了を確認する:

| Phase      | 完了根拠                                      | 確認 |
| ---------- | --------------------------------------------- | ---- |
| Phase 1-11 | 各 Phase の完了条件が全チェック済み           | [ ]  |
| Phase 12   | documentation-changelog.md の全 Step 記録完了 | [ ]  |
| Phase 12   | 未タスク検出レポート作成済み                  | [ ]  |
| Phase 12   | スキルフィードバックレポート作成済み          | [ ]  |

## 実行タスク

### Task 1: ユーザー承認確認

- ユーザーに PR 作成の承認を求める
- 承認なしでは絶対に実行しない

### Task 2: PR 作成

- `/ai:diff-to-pr` スキルを使用
- ブランチ名: `fix/UT-06-002-UT-1-permission-store-sender-validation`
- PR タイトル: `fix(security): permission-store-handlers に sender 検証追加 (#1527)`
- PR 本文に Summary + Test Plan を含める
- PR 本文の Summary には Phase 1 の受け入れ基準（AC-1~AC-8）の充足状況を記載
- PR 本文の Test Plan には Phase 4-7 のテスト結果サマリーを記載
- Issue #1527 を関連付け

### Task 3: CI 確認

- CI/CD パイプラインの結果を確認
- 全チェックが PASS することを確認

## 実行手順

### ステップ1: ユーザー承認

AskUserQuestion で承認を取得。

### ステップ2: コミット・PR 作成

`/ai:diff-to-pr` を実行。

### ステップ3: CI 確認

`gh pr checks` で結果を確認。

## 統合テスト連携

- CI/CD パイプラインの全チェックが PASS すること
- `gh pr checks` で結果を確認

## 成果物

| 成果物 | パス          |
| ------ | ------------- |
| PR     | GitHub PR URL |

## 完了条件

- [ ] ユーザー承認取得済み
- [ ] PR 作成完了
- [ ] CI 全チェック PASS
- [ ] Issue #1527 が関連付けられている
- [ ] ローカルで全テストが PASS していること（`cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/permission-store-handlers.test.ts`）

## タスク完了処理【必須】

PR がマージされた後、以下の完了処理を実施する:

- [ ] タスク仕様書ディレクトリを `docs/30-workflows/completed-tasks/` に移動
- [ ] `artifacts.json` の全 Phase ステータスを `completed` に更新
- [ ] GitHub Issue #1527 を Close

## 次のPhase

なし（タスク完了）

## タスク100%実行確認【必須】

- [ ] 全ての実行タスクが完了している
- [ ] 完了条件の全項目がチェック済み
- [ ] 成果物が全て生成されている

## サブタスク管理

本Phaseのサブタスク:

- なし（単一タスクとして実行）

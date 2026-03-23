# Phase 13: PR作成

## メタ情報

| 項目     | 値                        |
| -------- | ------------------------- |
| Phase    | 13                        |
| タスクID | TASK-SC-01-IPC-WIRING-FIX |
| 作成日   | 2026-03-22                |

## 目的

全 Phase の成果物を確認した上で Pull Request を作成する。PR 作成はユーザー承認後にのみ実行する。

## 実行タスク

1. ユーザーに PR 作成の承認を求める（承認なしに PR を作成しない）
2. `git status` で変更ファイルの一覧を確認する
3. `git diff --stat` でステージング前の変更内容を確認する
4. 変更ファイルをステージングする（`git add` に特定ファイルを指定する。`git add -A` は避ける）
5. コミットメッセージを作成する（`fix(ipc): P65 dead-end namespace解消 - creatorHandlers統合` 形式）
6. PR を作成する:
   - タイトル: `fix(ipc): skill-creator IPC配線統合・P65パターン解消 (#TASK-SC-01-IPC-WIRING-FIX)`（70文字以内）
   - 本文: Summary（3箇条）+ Test Plan（チェックリスト）を含める
7. PR URL をユーザーに報告する

## 参照資料

- `.claude/rules/07-git-and-tooling.md#PR 作成ルール`
- `.claude/rules/07-git-and-tooling.md#コミット前チェックリスト`
- `.claude/CLAUDE.md#Git操作の禁止事項`（`--no-verify` 禁止）

## 成果物

- Pull Request（GitHub）
- PR URL

## 完了条件

- [ ] ユーザーから PR 作成の承認を得ている
- [ ] 全 Phase（1-12）の完了条件が満たされていることを最終確認している
- [ ] `pnpm lint` と `pnpm typecheck` が PASS している（最終確認）
- [ ] コミットに `--no-verify` が使用されていない
- [ ] PR タイトルが70文字以内である
- [ ] PR 本文に Summary と Test Plan が含まれている
- [ ] PR URL がユーザーに報告されている

## タスク完了

TASK-SC-01-IPC-WIRING-FIX 完了

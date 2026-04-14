# Phase 13: PR 作成

## メタ情報

| 項目       | 値                                 |
| ---------- | ---------------------------------- |
| Phase      | 13                                 |
| 機能名     | skill-name-pattern-shared-constant |
| 作成日     | 2026-04-14                         |
| ステータス | blocked（ユーザー承認待ち）        |

## 目的

ユーザーの明示的承認があるときだけ PR を作成する。承認がない間はローカル確認と差分要約のみを作る。

## 実行

1. build / typecheck / lint / targeted test の結果を確認する
2. 変更ファイルと影響範囲を要約する
3. ユーザーに PR 作成の可否を確認する
4. 承認後のみ `gh pr create` を実行する

## PR タイトル案

`docs(skill): current-state-aware spec for SKILL_NAME_PATTERN sync`

## 完了条件

- [ ] `outputs/phase-13/local-check-result.md` が作成されている
- [ ] `outputs/phase-13/change-summary.md` が作成されている
- [ ] ユーザー承認後のみ PR 作成へ進む

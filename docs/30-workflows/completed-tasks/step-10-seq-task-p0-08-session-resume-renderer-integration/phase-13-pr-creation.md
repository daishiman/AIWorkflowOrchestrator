# Phase 13: PR 作成

## メタ情報

| 項目       | 値                                  |
| ---------- | ----------------------------------- |
| Phase      | 13                                  |
| 機能名     | session-resume-renderer-integration |
| 作成日     | 2026-03-29                          |
| ステータス | blocked                             |

## 目的

Phase 12 までの成果と検証根拠をまとめ、ユーザー承認を得た場合のみ PR を作成する。

## ブロック理由

ユーザー承認が未取得のため、Phase 13 は blocked。

## 承認状況

| 項目          | 値     |
| ------------- | ------ |
| user approval | 未取得 |
| 取得日時      | -      |
| 記録者        | -      |

## 最低限の記録

- なぜ blocked か: user approval 未取得のため
- Phase 12 までの完了根拠: `outputs/phase-12/` の 6 成果物が揃っていること
- local check の結果要約: `outputs/phase-13/local-check-result.md` に記録
- change summary の作成有無: `outputs/phase-13/change-summary.md` に記録
- PR 作成可能状態か: user approval 取得後のみ可

## 実行タスク

- ローカルチェック（lint, typecheck, test）の実行
- コミットの整理
- PR 作成（user approval 取得後のみ）

## 参照資料

| 資料名   | パス                                 | 説明         |
| -------- | ------------------------------------ | ------------ |
| index.md | `index.md`                           | タスク概要   |
| ガイド   | `references/review-gate-criteria.md` | レビュー基準 |

## 実行手順

### ステップ1: ローカルチェックを実行する

`pnpm lint && pnpm typecheck && pnpm vitest run`

### ステップ2: コミットを整理する

意味のあるコミット単位にまとめる。

### ステップ3: PR を作成する

user approval 取得後にのみ実行する。

## 成果物

| 成果物         | パス                                     | 説明         |
| -------------- | ---------------------------------------- | ------------ |
| local check    | `outputs/phase-13/local-check-result.md` | チェック結果 |
| change summary | `outputs/phase-13/change-summary.md`     | 変更サマリー |
| pr info        | `outputs/phase-13/pr-info.md`            | PR 情報      |
| pr result      | `outputs/phase-13/pr-creation-result.md` | 作成結果     |

## 完了条件

- [ ] user approval を取得している
- [ ] ローカルチェックが全て pass している
- [ ] PR が作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

なし

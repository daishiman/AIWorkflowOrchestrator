# Phase 13: PR 作成 - タスク仕様書

## メタ情報

| 項目         | 内容                                                     |
| ------------ | -------------------------------------------------------- |
| Phase        | 13                                                       |
| タスクID     | UNASSIGNED-EMB-005-A                                     |
| タスク名     | XenovaTransformerEncoder 実装（IEncoder 具体実装クラス） |
| タスク種別   | NON_VISUAL                                               |
| ステータス   | blocked（ユーザー承認待ち）                              |
| 作成日       | 2026-04-20                                               |
| 前Phase      | 12: ドキュメント更新                                     |
| GitHub Issue | #2312（CLOSED。reopen 不要）                             |

## 目的

Phase 1〜12 の成果物を前提に、実装ブランチを PR 化できる状態を確認する。
この Phase は user approval があるまで blocked のままとし、commit / push / PR 作成は実行しない。

## 実行条件

- ユーザーの明示承認がある
- Phase 10 が PASS / MINOR
- Phase 11 の `manual-test-result.md` が揃っている
- Phase 12 の required 6 artifacts が揃っている

## ブロック理由

ユーザー承認前のため blocked。
承認が無い状態では、PR 本文の確定、push、review request を行わない。

## 最低限の記録

- blocked の理由
- user approval の有無
- Phase 12 までの完了根拠
- local check の結果要約
- `outputs/phase-13/local-check-result.md` と `outputs/phase-13/change-summary.md` の作成有無
- `pr-info.md` / `pr-creation-result.md` を作成できる状態か

## 承認後の作業

### 1. ローカル確認

```bash
pnpm lint
pnpm --filter @repo/shared typecheck
pnpm --filter @repo/shared test -- --run
pnpm --filter @repo/shared build
```

結果を `outputs/phase-13/local-check-result.md` に要約する。

### 2. PR 情報の整理

`outputs/phase-13/pr-info.md` に以下を記録する。

- base: `main`
- head: `feat/UNASSIGNED-EMB-005-A-xenova-encoder`
- タイトル案
- 概要
- Test plan
- `Issue #2312 は CLOSED のまま / task spec ベースで実装` の注記

### 3. PR 作成

承認後にのみ `gh pr create` を実行する。
本文は `outputs/phase-13/pr-info.md` を正本として組み立て、生成フッターや自動署名は入れない。

## 成果物

| 成果物               | パス                                     | 内容                                      |
| -------------------- | ---------------------------------------- | ----------------------------------------- |
| ローカルチェック結果 | `outputs/phase-13/local-check-result.md` | lint / typecheck / test / build の要約    |
| 変更サマリー         | `outputs/phase-13/change-summary.md`     | 変更ファイルと意図の要約                  |
| PR 情報              | `outputs/phase-13/pr-info.md`            | title / body / base / head / blocked 理由 |
| PR 作成結果          | `outputs/phase-13/pr-creation-result.md` | 未作成理由または作成結果                  |

## 完了条件

- [ ] ユーザーの明示承認を得た
- [ ] `local-check-result.md` にローカル確認結果が記録されている
- [ ] `pr-info.md` にタイトル・本文・base/head・Issue 注記がある
- [ ] 承認前は `pr-creation-result.md` に blocked 理由のみを記録している
- [ ] 承認後のみ PR を作成している

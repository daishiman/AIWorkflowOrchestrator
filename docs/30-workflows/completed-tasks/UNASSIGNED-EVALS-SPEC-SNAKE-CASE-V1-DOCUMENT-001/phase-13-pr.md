# Phase 13: PR 作成

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 13                                               |
| タスクID   | UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001 |
| タスク種別 | NON_VISUAL / docs-only                           |
| ステータス | blocked                                          |
| 前提Phase  | Phase 12                                         |
| 後続Phase  | なし                                             |
| 作成日     | 2026-04-21                                       |

## 目的

user の明示承認がある場合にのみ PR 作成へ進む。承認が無い間は blocked 理由と準備情報だけを残す。

## 実行タスク

### タスク1: blocked 理由記録

- commit、push、PR 作成は user 承認が前提であることを記録する

### タスク2: ローカル確認手順の定義

- `outputs/phase-13/local-check-result.md` に承認後に実行する確認手順を書く
- `git status`、`git diff --stat`、`diff -qr` を含める

### タスク3: 変更サマリーと PR 情報の定義

- `outputs/phase-13/change-summary.md` に対象ファイル群と要約を書く
- `outputs/phase-13/pr-info.md` に想定タイトル、本文、関連 issue、blocked 理由を書く

## 参照資料

| 資料名             | パス                                                     | 用途            |
| ------------------ | -------------------------------------------------------- | --------------- |
| Phase 10 結果      | `outputs/phase-10/final-review-result.md`                | 受入基準確認    |
| Phase 11 結果      | `outputs/phase-11/manual-test-result.md`                 | manual evidence |
| Phase 12 結果      | `outputs/phase-12/phase12-task-spec-compliance-check.md` | close-out 根拠  |
| workflow artifacts | `artifacts.json` / `outputs/artifacts.json`              | parity 再確認   |

## 実行手順

1. user 承認の有無を確認する
2. 承認前は 3 成果物を定義して blocked を維持する
3. 承認後にだけローカル確認を実施する
4. 承認後にだけ PR 作成へ進む

## 統合テスト連携

- 承認前は情報整理に留める
- parity と Phase 12 root evidence が閉じていない場合は PR 作成へ進まない

## 多角的チェック観点

- **批判的思考**: 承認前に実作業へ踏み込んでいないか
- **戦略的思考**: blocked と ready-to-create の差分が明確か
- **改善思考**: PR 本文に task の価値と境界が短く整理されているか

## サブタスク管理

| サブタスクID | 内容                    | ステータス |
| ------------ | ----------------------- | ---------- |
| ST-13-01     | blocked 理由記録        | pending    |
| ST-13-02     | local-check-result 定義 | pending    |
| ST-13-03     | change-summary 定義     | pending    |
| ST-13-04     | pr-info 定義            | pending    |

## 成果物

- `outputs/phase-13/local-check-result.md`
- `outputs/phase-13/change-summary.md`
- `outputs/phase-13/pr-info.md`

## 完了条件

- [ ] blocked 理由を明記している
- [ ] 3 成果物を定義している
- [ ] 承認後手順を分離している

## タスク100%実行確認【必須】

- [ ] 本 Phase で定義すべき情報を全て記録
- [ ] user 承認前に PR 作成を実行していない
- [ ] 成果物テーブルと本文が一致している

## 次Phase

なし。user の明示承認後にのみ PR 作成へ進む。

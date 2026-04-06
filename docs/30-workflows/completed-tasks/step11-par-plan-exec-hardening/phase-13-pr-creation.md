# Phase 13: PR 作成

## メタ情報

| 項目   | 値                                        |
| ------ | ----------------------------------------- |
| Phase  | 13                                        |
| 機能名 | step-11-par-task-plan-execution-hardening |
| 作成日 | 2026-03-31                                |

## 目的

Phase 12 までの成果を PR にまとめる。ただしこのタスクは user approval があるまで blocked とする。

## 実行タスク

- 変更サマリーを作る
- PR 本文を準備する
- ユーザー承認後にのみ PR を作成する

## 参照資料

| 資料名              | パス                                                     | 参照理由       |
| ------------------- | -------------------------------------------------------- | -------------- |
| Phase 12 成果物     | `outputs/phase-12/`                                      | PR 本文の根拠  |
| Phase 5 実装        | `phase-5-implementation.md`                              | 変更内容の要約 |
| Phase 12 compliance | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 完了確認       |

## 実行手順

### ステップ1: ローカルチェックを実行する

1. 型チェック
2. lint
3. テスト
4. build

### ステップ2: 変更サマリーを作成する

1. P0-07 と U2 を 1 本の説明にまとめる
2. source of truth と snapshot semantics を明記する
3. commit / PR は user approval 後のみと書く

### ステップ3: PR を作成する

1. `gh pr create` を使う
2. ただし user approval が得られた場合に限る
3. approval がない間は blocked を維持する

## PR 準備内容

### PR タイトル案

`feat(skill-creator): plan agent source-of-truth hardening + approved snapshot guard`

### PR 概要案

- P0-07: `PLAN_RESOURCE_REQUESTS` を source of truth として agent 名導出を整理
- U2: `approvedSkillSpec` を plan 承認時の snapshot として保持
- 2 つの drift を独立に解消し、並列実装のまま閉じる

## 成果物

| 成果物       | パス                                 | 説明               |
| ------------ | ------------------------------------ | ------------------ |
| PR 草案      | `phase-13-pr-creation.md`            | blocked 中の PR 案 |
| 変更サマリー | `outputs/phase-13/change-summary.md` | 承認後に使う要約   |

## 完了条件

- [ ] ローカルチェックの結果が揃っている
- [ ] PR 本文の下書きがある
- [ ] user approval がない限り blocked のまま維持する

## サブタスク管理

1. ローカルチェック
2. 変更サマリー作成
3. PR 下書き作成
4. approval 待機

## タスク100%実行確認【必須】

- [ ] 本 Phase のタスクを 100% 実行完了
- [ ] approval なしで PR を作成しない
- [ ] blocked / ready の状態が明示されている

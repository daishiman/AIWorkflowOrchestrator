# Phase 13: PR作成

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 13                              |
| タスクID   | TASK-SC-IMPROVE-PROMPT-IMPL-001 |
| ステータス | blocked                         |
| 作成日     | 2026-04-21                      |

## 目的

ユーザー承認がある場合に限り、変更サマリとローカルチェック結果を整理し、commit / push / PR の実行準備を整える。承認前は blocked 状態を維持する。

## 実行タスク

### Task 1: 承認条件の確認

- ユーザーが PR 作成を明示承認しているか確認する
- 承認がない場合は未実行のまま blocked と記録する

### Task 2: change summary 整理

- 変更ファイル一覧
- 主要設計ポイント
- テスト結果
- 残リスク

### Task 3: ローカルチェック結果の整理

- `git diff --stat`
- test / typecheck / lint 結果
- 依存関係と blocked 条件

## 参照資料

- [Phase 12: ドキュメント更新](phase-12-documentation.md)
- `outputs/phase-12/phase12-task-spec-compliance-check.md`

## 実行手順

1. 承認条件を確認する
2. 承認済みなら change summary と local check を整理する
3. 未承認なら blocked として終了する

## 成果物

- `outputs/phase-13/change-summary.md`
- `outputs/phase-13/local-check-result.md`

## 完了条件

- [ ] ユーザー承認の有無が記録されていること
- [ ] blocked 条件が明文化されていること
- [ ] 承認前は commit / push / PR を実行しないこと
- [ ] 承認後に必要な成果物が定義されていること

## タスク 100% 実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] blocked または実行済みのどちらかが明記されていること
- [ ] 成果物の出力条件が明確であること

## 次 Phase

- blocked: ユーザー承認待ち

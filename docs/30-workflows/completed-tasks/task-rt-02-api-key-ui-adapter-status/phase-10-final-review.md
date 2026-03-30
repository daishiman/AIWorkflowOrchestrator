# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 値                                   |
| ---------- | ------------------------------------ |
| Phase      | 10                                   |
| Phase名    | 最終レビューゲート                   |
| 前提Phase  | Phase 9                              |
| 後続Phase  | Phase 11                             |
| ステータス | spec_created                         |
| 作成日     | 2026-03-29                           |
| 機能名     | task-rt-02-api-key-ui-adapter-status |

## 目的

AC-1〜AC-9 と「新規 public 契約を増やしていないこと」を最終確認する。

## 実行タスク

- 受け入れ基準判定
- 契約増分監査
- 未タスク化要否の判定

## 受け入れ基準の最終判定

| AC   | 基準                                        | 検証方法       | 判定 |
| ---- | ------------------------------------------- | -------------- | ---- |
| AC-1 | provider 一覧が表示される                   | automated-test | [ ]  |
| AC-2 | health check 中に `initializing` 表示が出る | automated-test | [ ]  |
| AC-3 | `connected` が `ready` に正規化される       | automated-test | [ ]  |
| AC-4 | failure 時に retry CTA が出る               | automated-test | [ ]  |
| AC-5 | retry 後に対象行のみ更新される              | automated-test | [ ]  |
| AC-6 | failure reason を確認できる                 | manual-test    | [ ]  |
| AC-7 | 未登録 provider は health 対象外            | automated-test | [ ]  |
| AC-8 | a11y / theme 要件を満たす                   | manual-test    | [ ]  |
| AC-9 | 既存 API key フローに回帰がない             | automated-test | [ ]  |

## 統合テスト連携【必須】

最終レビューで自動/手動結果を集約確認する。

## 参照資料

| 参照資料     | パス                                                                                 | 内容           |
| ------------ | ------------------------------------------------------------------------------------ | -------------- |
| レビュー基準 | `.claude/skills/task-specification-creator/references/review-gate-criteria.md`       | ゲート基準     |
| 未タスク指針 | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md` | follow-up 判断 |

## 成果物

| 成果物         | パス                                      | 説明     |
| -------------- | ----------------------------------------- | -------- |
| レビュー結果書 | `outputs/phase-10/final-review-result.md` | 最終判定 |

## 完了条件

- [ ] AC-1〜AC-9 の判定が記録されている
- [ ] public 契約増分なしの確認が取れている
- [ ] 未タスク化要否が判定されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 11: 手動テスト

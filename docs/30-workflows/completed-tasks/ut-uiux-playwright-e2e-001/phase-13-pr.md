# Phase 13: PR作成

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 13                                      |
| 機能名 | Playwright E2E 動的テストフレームワーク |
| 作成日 | 2026-03-31                              |

## 目的

Phase 12 までの結果を PR へまとめる。ただし、ユーザー承認があるまで blocked を維持する。

## 実行タスク

- ブランチの差分を整理する
- ローカル確認結果を集約する
- PR 本文の要点を整理する
- ユーザー承認後にのみ PR を作成する
- `outputs/phase-13/local-check-result.md` を作成する
- `outputs/phase-13/change-summary.md` を作成する
- 承認後に `outputs/phase-13/pr-info.md` と `outputs/phase-13/pr-creation-result.md` を作成可能な状態にする
- blocked の理由と user approval の有無を記録する

## 参照資料

| 資料名                    | パス                                                                           | 説明           |
| ------------------------- | ------------------------------------------------------------------------------ | -------------- |
| Phase 12 ドキュメント更新 | [phase-12-closeout.md](phase-12-closeout.md)                                   | 完了根拠       |
| review gate ルール        | `.claude/skills/task-specification-creator/references/review-gate-criteria.md` | blocked の条件 |

## 実行手順

1. Phase 12 の成果物を確認する。
2. ローカル確認の結果を整理する。
3. user approval がない場合は blocked のままにする。
4. 承認後に PR を作成する。

## 統合テスト連携

- Phase 12（ドキュメント更新）の完了を前提にする
- PR 前チェックが終わるまで公開しない

## 多角的チェック観点（AIが判断）

| 観点       | 確認内容                                  |
| ---------- | ----------------------------------------- |
| 戦略・価値 | PR に載せるべき変更だけが集約されているか |
| システム   | Phase 12 の根拠と PR 内容が一致しているか |
| 問題解決   | blocked の理由が説明できるか              |

## サブタスク管理

1. 差分整理
2. ローカル確認
3. PR 本文整理
4. 承認待ち

## 成果物

| 成果物           | パス                                     | 説明                   |
| ---------------- | ---------------------------------------- | ---------------------- |
| 変更サマリー     | `outputs/phase-13/change-summary.md`     | 差分の要点             |
| ローカル確認記録 | `outputs/phase-13/local-check-result.md` | 事前確認・blocked 理由 |
| PR 情報          | `outputs/phase-13/pr-info.md`            | 承認後に作成           |
| PR 作成結果      | `outputs/phase-13/pr-creation-result.md` | 承認後に作成           |

## 完了条件

- [ ] user approval がある場合にのみ PR 作成へ進める
- [ ] blocked の理由が明記されている
- [ ] Phase 12 の成果物が参照できる
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] commit / PR を自動作成していない
- [ ] 承認ゲートが記録されている
- [ ] 事前確認の結果が残っている
- [ ] `change-summary.md` と `local-check-result.md` が揃っている

## 次のPhase

なし

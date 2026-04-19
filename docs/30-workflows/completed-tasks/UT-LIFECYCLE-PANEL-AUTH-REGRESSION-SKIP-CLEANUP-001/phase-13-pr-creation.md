# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                                            |
| ---------- | --------------------------------------------------------------- |
| Phase      | 13                                                              |
| 機能名     | UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001             |
| タスク名   | SkillLifecyclePanel auth回帰テスト describe.skip クリーンアップ |
| 前提Phase  | Phase 12                                                        |
| 後続Phase  | なし                                                            |
| 作成日     | 2026-04-18                                                      |
| ステータス | blocked                                                         |

## 目的

ユーザー承認後にのみ PR 作成へ進めるよう、提出前情報を整理して保留する。

## 背景

本タスクのスコープにはコミット・PR作成が含まれない。
したがって本 Phase は、承認前の準備メモと引き継ぎ情報を定義する段階に留める。

## 実行タスク

- 差分要約を準備する
- 引き継ぎ情報を整理する
- ユーザー承認が来るまで PR 作成を実行しない

## 参照資料

| 資料名         | パス                                            | 説明            |
| -------------- | ----------------------------------------------- | --------------- |
| 実装サマリー   | `outputs/phase-5/implementation-summary.md`     | 処置内容        |
| 品質レポート   | `outputs/phase-9/quality-report.md`             | 品質ゲート結果  |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md`        | NON_VISUAL 証跡 |
| 実装ガイド     | `outputs/phase-12/implementation-guide.md`      | close-out 要約  |
| 未タスク検出   | `outputs/phase-12/unassigned-task-detection.md` | 残課題確認      |

## 実行手順

1. change summary を作成する。
2. local check result をまとめる。
3. ユーザー承認がない場合はここで停止する。
4. 承認後にのみ PR 作成手順へ進む。

## 成果物

| 成果物           | パス                                     | 説明                         |
| ---------------- | ---------------------------------------- | ---------------------------- |
| 変更要約         | `outputs/phase-13/change-summary.md`     | PR説明の下書き               |
| ローカル確認結果 | `outputs/phase-13/local-check-result.md` | test / typecheck / lint 要約 |

## 完了条件

- [ ] Phase 13 が blocked であることを明記している
- [ ] ユーザー承認前に PR 作成を実行しない方針になっている
- [ ] 成果物を change summary / local check result に限定している
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001
```

## PR作成制約

- ユーザーの明示承認があるまで PR は作成しない
- コミット、push、PR作成はこの Phase では実行しない

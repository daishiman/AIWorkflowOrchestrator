# Phase 4: テストマトリクス

## 実行日時

2026-04-13

## テストケース一覧

| テストID | テスト内容                                       | AC対応 | 状態（Phase4時点） | 失敗原因                 |
| -------- | ------------------------------------------------ | ------ | ------------------ | ------------------------ |
| TC-04-01 | trackSkillStart で send が1回呼び出される        | AC-1   | Red                | analyticsSlice.ts 未作成 |
| TC-04-02 | trackSkillStart の skillId が payload に含まれる | AC-1   | Red                | analyticsSlice.ts 未作成 |
| TC-04-03 | イベント名が skill_start                         | AC-1   | Red                | analyticsSlice.ts 未作成 |
| TC-04-04 | trackSkillComplete で send が1回呼び出される     | AC-1   | Red                | analyticsSlice.ts 未作成 |
| TC-04-05 | duration が payload に含まれる                   | AC-1   | Red                | analyticsSlice.ts 未作成 |
| TC-04-06 | イベント名が skill_complete                      | AC-1   | Red                | analyticsSlice.ts 未作成 |
| TC-04-07 | trackSkillError で send が1回呼び出される        | AC-1   | Red                | analyticsSlice.ts 未作成 |
| TC-04-08 | error 情報が payload に含まれる                  | AC-1   | Red                | analyticsSlice.ts 未作成 |
| TC-04-09 | イベント名が skill_error                         | AC-1   | Red                | analyticsSlice.ts 未作成 |
| TC-04-10 | trackEvent がシグネチャを維持している            | AC-3   | Red                | analyticsSlice.ts 未作成 |
| TC-04-11 | trackEvent の引数型が変更されていない            | AC-3   | Red                | analyticsSlice.ts 未作成 |
| TC-04-12 | 複数の trackSkillStart が全て送信される          | AC-1   | Red                | analyticsSlice.ts 未作成 |
| TC-04-13 | 異なる skillId が正しく分離される                | AC-1   | Red                | analyticsSlice.ts 未作成 |

## 注記

Phase 6 で追加するテスト（TC-06-01〜TC-06-15）は同じテストファイルに最初から記載済み（Phase 4・6を統合）

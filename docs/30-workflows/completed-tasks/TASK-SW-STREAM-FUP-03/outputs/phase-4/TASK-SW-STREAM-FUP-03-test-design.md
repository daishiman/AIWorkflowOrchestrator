# TASK-SW-STREAM-FUP-03 テスト設計

## テストファイル

`apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.progress.test.ts`

既存ファイルに FUP-03 テストスイートを追加（既存 14 件は維持）。

## 追加テストスイート

| Suite   | 対象モード     | TC 番号   |
| ------- | -------------- | --------- |
| Suite 1 | collaborative  | TC-01〜04 |
| Suite 2 | orchestrate    | TC-05〜07 |
| Suite 3 | update         | TC-08〜10 |
| Suite 4 | improve-prompt | TC-11〜13 |
| Suite 5 | create（回帰） | TC-14     |

## TC-12（STREAM-001）の更新

旧: collaborative でも `planning` フェーズが呼ばれること
新: collaborative で `interview` フェーズが最初に通知される（FUP-03 挙動）

`planning` が NOT 呼ばれることも検証追加。

## TDD Red/Green 確認

- TC-01〜13: 実装前は FAIL（planning が先頭 → interview/engine-selection/loading-skill が期待値不一致）
- TC-14: 実装前も PASS（create モードは変わらない）
- 実装後 TC-01〜14 全件 PASS 確認済み

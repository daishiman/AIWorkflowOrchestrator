# テスト仕様書

## メタ情報

| 項目     | 内容                              |
| -------- | --------------------------------- |
| Phase    | 4                                 |
| タスクID | TASK-CRON-SEMANTIC-VALIDATION-001 |
| 作成日   | 2026-04-12                        |

---

## テスト方針

- **テストファイル**: `apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts`
- **テスト対象**: `validateCronExpression`（public API 経由）
- **private method テスト方針**: `validateCronSemantics` は内部関数のため直接テストしない。public API 経由で振る舞いをテストする

---

## テストケース一覧

| TC番号   | cron式        | 期待結果               | 備考                             | TDD状態 |
| -------- | ------------- | ---------------------- | -------------------------------- | ------- |
| TC-SV-01 | `0 9 31 2 *`  | エラー（null でない）  | 2月31日は存在しない（AC-1）      | Red     |
| TC-SV-02 | `0 9 30 2 *`  | エラー（null でない）  | 2月30日は存在しない（AC-2）      | Red     |
| TC-SV-03 | `0 9 29 2 *`  | null（正常通過）       | 2月29日は cron 上は有効（AC-3）  | Green   |
| TC-SV-04 | `0 9 1 2 *`   | null（正常通過）       | 2月1日は有効（AC-4）             | Green   |
| TC-SV-05 | `0 9 * * *`   | null（正常通過）       | 毎日9時は有効（AC-4）            | Green   |
| TC-SV-06 | `0 9 * * 1-5` | null（正常通過）       | 平日毎日は有効（AC-4）           | Green   |
| TC-SV-07 | `invalid`     | エラー（null でない）  | 不正な構文（構文チェックで検出） | Green   |
| AC-5     | `0 9 31 2 *`  | 日本語エラーメッセージ | 日本語文字（Unicode）を含む      | Red     |

---

## TDD Red 確認結果

実装前にテストを実行した結果:

- **Red（失敗）**: TC-SV-01, TC-SV-02, AC-5 の 3 テスト
- **Green（通過）**: TC-SV-03〜07 の 5 テスト（既存チェックで正常動作）
- **既存テスト**: 全て Green（回帰なし）

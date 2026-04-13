# UIエラー表示テスト結果

## メタ情報

| 項目     | 内容                              |
| -------- | --------------------------------- |
| Phase    | 6                                 |
| タスクID | TASK-CRON-SEMANTIC-VALIDATION-001 |
| 作成日   | 2026-04-12                        |

---

## 自動テスト

`ScheduleDialog` / `ConversationRoundStep` の React コンポーネントテストは
`@testing-library/react` の設定環境確認が必要なため、自動テストは Phase 11 で確認。

---

## バリデーション連鎖の静的確認

`validateCronExpression("0 9 31 2 *")` の戻り値は `string` 型（`null` でない）。

**ScheduleDialog の消費コード**:
`validateCronExpression` の返却値が `string` であれば、既存のエラー表示ロジックが
cronExpression フィールドのエラーとして UI に表示する。実装変更不要。

**ConversationRoundStep の消費コード**:
`validateSkillWizardScheduleConfig` → `validateCronExpression` の戻り値が `string` であれば
`result.cronExpression` にエラーが設定される。実装変更不要。

---

## Phase 11 への委託事項

- ScheduleDialog に `"0 9 31 2 *"` を入力したとき、`"指定した日付は存在しません（例: 2月31日）"` が表示されること
- ConversationRoundStep に同入力をしたとき、同様のエラーメッセージが表示されること
- `"0 9 * * *"` では両コンポーネントにエラーが表示されないこと

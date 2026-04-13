# Phase 11 Manual Test Checklist

## メタ情報

| 項目     | 内容                              |
| -------- | --------------------------------- |
| Phase    | 11                                |
| タスクID | TASK-CRON-SEMANTIC-VALIDATION-001 |
| 種別     | NON_VISUAL                        |
| 作成日   | 2026-04-12                        |

---

## チェック方針

- 主証跡は `manual-test-report.md` と `manual-test-result.md`
- 視覚証跡は不要
- `discovered-issues.md` と `ui-sanity-visual-review.md` は既存 UI 契約の確認記録として参照する

## チェック項目

- [x] `validateCronExpression("0 9 31 2 *")` のエラー文言を確認した
- [x] `validateCronExpression("0 9 29 2 *")` が有効扱いであることを確認した
- [x] `validateSkillWizardScheduleConfig` が cronExpression のエラーを引き継ぐことを確認した
- [x] `ScheduleDialog` の既存エラー表示が文字列エラーに追従することを確認した
- [x] `ConversationRoundStep` の既存エラー表示が文字列エラーに追従することを確認した

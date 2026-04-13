# 手動テスト シナリオ別結果

## メタ情報

| 項目     | 内容                              |
| -------- | --------------------------------- |
| Phase    | 11                                |
| タスクID | TASK-CRON-SEMANTIC-VALIDATION-001 |
| 実行日   | 2026-04-12                        |

---

| シナリオID | 説明                                | ステータス | 備考                                           |
| ---------- | ----------------------------------- | ---------- | ---------------------------------------------- |
| scenario-1 | 2月31日エラー表示（ScheduleDialog） | PASS       | TC-SV-01 Green・エラーメッセージ文字列確認済み |
| scenario-2 | 2月29日有効通過                     | PASS       | TC-SV-03 / TC-LEAP-01 Green                    |
| scenario-3 | 2月30日エラー表示                   | PASS       | TC-SV-02 / TC-LEAP-02 Green                    |
| scenario-4 | ConversationRoundStep エラー表示    | PASS       | validateSkillWizardScheduleConfig ロジック確認 |

# トレーサビリティ行列

## メタ情報

| 項目     | 内容                              |
| -------- | --------------------------------- |
| Phase    | 1                                 |
| タスクID | TASK-CRON-SEMANTIC-VALIDATION-001 |
| 作成日   | 2026-04-12                        |

---

## AC と対象コードの対応

| AC番号 | 受け入れ基準                     | 対象ファイル                                       | 対象関数/箇所                            | テストケース |
| ------ | -------------------------------- | -------------------------------------------------- | ---------------------------------------- | ------------ |
| AC-1   | 2月31日はエラーを返す            | `scheduleConfigValidator.ts`                       | `validateCronExpression` Stage 3 (新規)  | TC-SV-01     |
| AC-2   | 2月30日はエラーを返す            | `scheduleConfigValidator.ts`                       | `validateCronExpression` Stage 3 (新規)  | TC-SV-02     |
| AC-3   | 2月29日は正常通過する            | `scheduleConfigValidator.ts`                       | `validateCronSemantics` (新規)           | TC-SV-03     |
| AC-4   | その他の有効な式は正常通過する   | `scheduleConfigValidator.ts`                       | `validateCronExpression` 全体            | TC-SV-04〜06 |
| AC-5   | UIにエラーメッセージが表示される | `ScheduleDialog.tsx` / `ConversationRoundStep.tsx` | 既存の cronExpression エラー表示ロジック | Phase 11     |

---

## 実装タスク対応

| タスク種別   | 対象ファイル                                                            | 変更内容                       |
| ------------ | ----------------------------------------------------------------------- | ------------------------------ |
| 実装タスク   | `apps/desktop/src/renderer/utils/scheduleConfigValidator.ts`            | `validateCronSemantics` 追加   |
| テストタスク | `apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts`      | TC-SV-01〜07 追加              |
| テストタスク | `apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts` | TC-EDGE/LEAP/COMP/REG 追加     |
| UI回帰タスク | `ScheduleDialog.tsx` / `ConversationRoundStep.tsx`                      | 変更なし（既存ロジックで対応） |

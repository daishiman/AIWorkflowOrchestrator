# 変更ファイル一覧

## メタ情報

| 項目     | 内容                              |
| -------- | --------------------------------- |
| Phase    | 5                                 |
| タスクID | TASK-CRON-SEMANTIC-VALIDATION-001 |
| 作成日   | 2026-04-12                        |

---

## 変更ファイル

| ファイル                                                           | 変更種別 | 変更内容                                                                                          |
| ------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/utils/scheduleConfigValidator.ts`       | 修正     | `MAX_DAYS_PER_MONTH` 定数・`validateCronSemantics` 追加、`validateCronExpression` に Stage 3 組込 |
| `apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts` | 修正     | TC-SV-01〜07・AC-5 テストを追加（Phase 4 で実施済み）                                             |

## 未変更ファイル（変更不要を確認）

| ファイル                                                                        | 理由                                           |
| ------------------------------------------------------------------------------- | ---------------------------------------------- |
| `apps/desktop/src/renderer/views/ScheduleManager/components/ScheduleDialog.tsx` | 既存の string エラー表示ロジックで自動対応     |
| `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`   | `validateSkillWizardScheduleConfig` 経由で対応 |
| `apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts`         | Phase 6 で拡充予定                             |

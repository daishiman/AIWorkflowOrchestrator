# 受け入れ基準 - TASK-UI-SCHEDULE-CRON-SEMANTIC-001

| AC番号 | 基準                                                                                           | 検証方法                                   | 優先度 |
| ------ | ---------------------------------------------------------------------------------------------- | ------------------------------------------ | ------ |
| AC-1   | `validateCronExpression("0 0 31 2 *", { semantic: true })` がエラー文字列（非 null）を返す     | テスト TC-01 PASS                          | 最高   |
| AC-2   | `validateCronExpression("0 0 * * *", { semantic: true })` 等の正常ケースは引き続き null を返す | テスト TC-04 PASS                          | 高     |
| AC-3   | 既存テスト SCV-01〜SCV-12 が全件 PASS する                                                     | `pnpm test` 全件 PASS                      | 最高   |
| AC-4   | 意味論的不正ケースのテストが追加されカバレッジが向上している                                   | テスト PASS + coverage Line≥90% Branch≥85% | 高     |
| AC-5   | `scheduleConfigValidator.ts` のJSDocが更新され semantic オプションの説明が含まれる             | コードレビュー                             | 中     |

## Phase 4〜11 引き継ぎ事項

- `"0 0 31 2 *"` シナリオを Phase 4（テスト作成）のTDDケースとして予約
- ライブラリ評価計画（`cron-parser` 推奨）を Phase 2 設計のインプットとして提供
- NON_VISUAL 評価方針を Phase 11 に引き継ぐ（スクリーンショット不要・ロジックテストのみ）

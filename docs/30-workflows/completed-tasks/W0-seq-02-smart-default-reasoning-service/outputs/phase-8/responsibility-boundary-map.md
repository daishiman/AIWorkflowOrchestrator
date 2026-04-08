# 責務境界マップ

## タスク情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 |
| Phase    | 8                                              |

## ファイル責務一覧

| ファイル                                         | 責務                                                      |
| ------------------------------------------------ | --------------------------------------------------------- |
| `smartDefaultReasoningService.ts`                | 推論定数・内部ヘルパー関数・公開 API `inferSmartDefaults` |
| `__tests__/smartDefaultReasoningService.test.ts` | 全推論ルール・フォールバック・組み合わせのユニットテスト  |
| `services/skillCreator/index.ts`                 | `inferSmartDefaults` の barrel export                     |
| `packages/shared/index.ts`                       | `@repo/shared` root への再 export                         |

## 内部関数責務

| 関数                        | 責務                                     |
| --------------------------- | ---------------------------------------- |
| `inferTool(purpose)`        | ツール推論のみ（TOOL_KEYWORDS を走査）   |
| `inferTiming(purpose)`      | タイミング推論のみ（正規表現マッチング） |
| `inferFormat(category)`     | フォーマット推論のみ（カテゴリ完全一致） |
| `inferSmartDefaults(input)` | 3 ヘルパー呼び出しと結果統合（公開 API） |

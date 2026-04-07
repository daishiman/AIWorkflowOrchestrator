# 受け入れ基準（AC-1〜AC-4）

## タスク情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 |
| Phase    | 1                                              |

## 受け入れ基準一覧

| AC番号 | 内容                                                                                             | 検証方法                          |
| ------ | ------------------------------------------------------------------------------------------------ | --------------------------------- |
| AC-1   | `inferSmartDefaults(input: SkillInfoFormData): SmartDefaultResult` 関数が実装されること          | 関数シグネチャ確認・型チェック    |
| AC-2   | スキル名・目的から適切なカテゴリ・ツール・タイミング・フォーマットのデフォルト値が提案されること | ユニットテスト                    |
| AC-3   | ユニットテストが全件 PASS すること                                                               | `pnpm --filter @repo/shared test` |
| AC-4   | 推論不能時のフォールバック挙動が定義・実装されること（null フィールド・空 inferenceLog）         | ユニットテスト                    |

## AC 検証詳細

### AC-1: 関数実装

- `packages/shared/src/services/skillCreator/smartDefaultReasoningService.ts` に `inferSmartDefaults` が存在すること
- TypeScript 型チェック（`pnpm --filter @repo/shared typecheck`）が通ること

### AC-2: 推論精度

- purpose に "Slack" → `tool = "slack"` が返ること
- purpose に "GitHub" → `tool = "github"` が返ること
- purpose に "Notion" → `tool = "notion"` が返ること
- purpose に "毎日" → `timing = "scheduled"` が返ること
- purpose に "リアルタイム" → `timing = "realtime"` が返ること
- category が "code-support" → `format = "code"` が返ること
- category が "data-analysis" → `format = "structured"` が返ること

### AC-3: テスト全件 PASS

- `pnpm --filter @repo/shared test -- smartDefaultReasoningService` が 0 failures であること

### AC-4: フォールバック

- purpose が空文字 / undefined → tool・timing は null
- category が有効な場合は format 推論を継続すること
- category が未選択のときのみ format = null になること
- tool/timing/format のいずれも推論できない場合のみ inferenceLog = [] になること
- inferenceLog が0件でもエラーにならないこと

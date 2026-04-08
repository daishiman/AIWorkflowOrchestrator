# Phase 5: 変更ファイル一覧 — UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001

## 変更ファイル一覧

| ファイルパス                                                                | 変更種別 | 行数  | 内容                                         |
| --------------------------------------------------------------------------- | -------- | ----- | -------------------------------------------- |
| `packages/shared/src/services/skillCreator/smartDefaultReasoningService.ts` | 新規作成 | 142行 | 推論サービス本体                             |
| `packages/shared/src/services/skillCreator/index.ts`                        | 更新     | +1行  | `inferSmartDefaults` を barrel export に追加 |

## 変更の詳細

### smartDefaultReasoningService.ts（新規作成）

```
packages/shared/src/services/skillCreator/smartDefaultReasoningService.ts
```

- `TOOL_KEYWORDS` 定数（Slack / GitHub / Notion）
- `SCHEDULED_PATTERN` 正規表現定数
- `REALTIME_PATTERN` 正規表現定数
- `inferTool(purpose)` 内部ヘルパー関数
- `inferTiming(purpose)` 内部ヘルパー関数
- `inferFormat(category)` 内部ヘルパー関数
- `createEmptyResult()` 内部ヘルパー関数
- `normalizePurpose(value)` 内部ヘルパー関数
- `inferSmartDefaults(input)` 公開 API（export）

### index.ts（更新）

```
packages/shared/src/services/skillCreator/index.ts
```

追加行:

```typescript
export { inferSmartDefaults } from "./smartDefaultReasoningService";
```

## 変更なしのファイル

| ファイルパス                                | 理由                                                          |
| ------------------------------------------- | ------------------------------------------------------------- |
| `packages/shared/src/types/skillCreator.ts` | `SkillInfoFormData` / `SmartDefaultResult` 型は既存定義を利用 |
| テスト以外の既存ファイル                    | 本タスクの影響範囲外                                          |

## 新規テストファイル

| ファイルパス                                                                               | 変更種別 | 件数 |
| ------------------------------------------------------------------------------------------ | -------- | ---- |
| `packages/shared/src/services/skillCreator/__tests__/smartDefaultReasoningService.test.ts` | 新規作成 | 33件 |

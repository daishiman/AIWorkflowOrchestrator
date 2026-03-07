# Phase 7: カバレッジ結果

## タスク ID

06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001

## カバレッジ計測結果

### ApiKeysSection (Renderer)

| 指標       | 値     | 最低基準 | 推奨基準 | 判定          |
| ---------- | ------ | -------- | -------- | ------------- |
| Statements | 93.17% | 80%      | 90%      | PASS (推奨超) |
| Branches   | 86.23% | 60%      | 70%      | PASS (推奨超) |
| Functions  | 91.66% | 80%      | 90%      | PASS (推奨超) |
| Lines      | 93.17% | 80%      | 90%      | PASS (推奨超) |

### 未カバー行

- 462-464行, 525-528行: エッジケース分岐（UI操作の特殊パス）

### テスト数サマリー

| テストファイル                                    | テスト数 | 結果         |
| ------------------------------------------------- | -------- | ------------ |
| ApiKeysSection.test.tsx                           | 46       | ALL PASS     |
| apiKeyHandlers.test.ts                            | 28       | ALL PASS     |
| profileHandlers.test.ts                           | 35       | ALL PASS     |
| apiKeyHandlers.list.test.ts (Phase 6 新規)        | 7        | ALL PASS     |
| profileHandlers.identities.test.ts (Phase 6 新規) | 6        | ALL PASS     |
| **合計**                                          | **122**  | **ALL PASS** |

## 計測コマンド

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/organisms/ApiKeysSection/__tests__/ApiKeysSection.test.tsx --coverage --coverage.reporter=text
```

## 計測日時

2026-03-07

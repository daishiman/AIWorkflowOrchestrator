# カバレッジ計画

## タスク情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 |
| Phase    | 7                                              |

## 目標

| 対象ファイル                      | 目標カバレッジ | 達成カバレッジ |
| --------------------------------- | -------------- | -------------- |
| `smartDefaultReasoningService.ts` | 90% 以上       | **100%** ✅    |

## 実行コマンド

```bash
pnpm --filter @repo/shared exec vitest run --coverage \
  --coverage.include="**/services/skillCreator/smartDefaultReasoningService.ts" \
  "smartDefaultReasoningService"
```

## 計測結果

```
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
All files          |     100 |      100 |     100 |     100 |
 ...ningService.ts |     100 |      100 |     100 |     100 |
-------------------|---------|----------|---------|---------|-------------------
```

**行・分岐・関数・文 全て 100% カバレッジ達成**

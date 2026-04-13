# カバレッジレポート - TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001

## 実行コマンド

```bash
pnpm vitest run apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts \
  --coverage --coverage.include="apps/desktop/src/renderer/utils/cronConverter.ts"
```

## カバレッジ結果

| ファイル           | Statements | Branch | Functions | Lines | 未カバー行 |
| ------------------ | ---------- | ------ | --------- | ----- | ---------- |
| `cronConverter.ts` | 93.1%      | 75%    | 100%      | 93.1% | 28, 55     |

## monthly 分岐のカバレッジ確認

| パス                                                    | テストケース        | カバレッジ状態 |
| ------------------------------------------------------- | ------------------- | -------------- |
| 範囲外パス（`dayOfMonth < 1` または `dayOfMonth > 31`） | TC-11, TC-12, TC-13 | ✅ カバー済み  |
| 非整数パス（`Number.isInteger()` が false）             | TC-16, TC-17, TC-19 | ✅ カバー済み  |
| 正常パス（ガード条件が false）                          | TC-14, TC-15, TC-18 | ✅ カバー済み  |

## 未カバー行の内容

| 行番号 | 内容                                       | 理由                                                      |
| ------ | ------------------------------------------ | --------------------------------------------------------- |
| 28     | `case "every-minute": return "* * * * *";` | `cronConverter.edge.test.ts` に `every-minute` テストなし |
| 55     | `default: return "";`                      | 不正な `frequency` を渡すテストなし                       |

→ 両行とも **本タスクのスコープ外**（`monthly` ガード処理とは無関係）

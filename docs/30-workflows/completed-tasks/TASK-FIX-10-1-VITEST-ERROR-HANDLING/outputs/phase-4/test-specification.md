# Phase 4: テスト仕様書

## タスク: TASK-FIX-10-1-VITEST-ERROR-HANDLING

## テスト戦略

### 検証対象

1. **vitest.config.ts 設定の正当性**: `dangerouslyIgnoreUnhandledErrors` が設定に含まれていないこと
2. **非同期エラーハンドリング**: テスト内の非同期処理が正しくクリーンアップされること

### テストファイル一覧

| ファイル                                | テスト数 | カテゴリ                         |
| --------------------------------------- | -------- | -------------------------------- |
| `src/test/vitest-config.test.ts`        | 5        | 設定検証（リグレッション防止）   |
| `src/test/async-error-handling.test.ts` | 8        | 非同期エラーハンドリングパターン |

### テストカバレッジ

- **設定検証**: vitest.config.ts にフラグが存在しないことを文字列検索で検証
- **非同期パターン**: Promise rejection, mockRejectedValue, タイマー, try-catch の各パターンを検証

## テスト実行方法

```bash
cd apps/desktop
pnpm vitest run src/test/vitest-config.test.ts src/test/async-error-handling.test.ts
```

# Phase 7 成果物: カバレッジ確認

## テスト実行コマンド

```bash
cd apps/desktop && vitest run --reporter=verbose src/main/ipc/__tests__/advancedConsoleIpc.test.ts
cd apps/desktop && vitest run --reporter=verbose src/main/claude-cli/__tests__/ipc-handler.test.ts
cd apps/desktop && vitest run --reporter=verbose src/main/ipc/__tests__/index.integration.test.ts
```

## 実行結果

| ファイル                   | テスト数 | 結果 |
| -------------------------- | -------- | ---- |
| advancedConsoleIpc.test.ts | 18       | PASS |
| ipc-handler.test.ts        | 42       | PASS |
| index.integration.test.ts  | 12       | PASS |

## 対象機能カバレッジ

| 機能                          | カバー状況                  |
| ----------------------------- | --------------------------- |
| `getClaudeCliManager()`       | ADV-19 ✓                    |
| `getTerminalLog` 実実装       | ADV-16 ✓                    |
| `getCopyCommand` 実実装       | ADV-17 ✓                    |
| SESSION_NOT_FOUND エラー      | ADV-18 ✓                    |
| COPY_COMMAND_ERROR サニタイズ | ADV-25 ✓                    |
| output 空配列                 | ADV-20 ✓                    |
| args なし                     | ADV-21 ✓                    |
| 複数 args                     | ADV-22 ✓                    |
| manager null fallback         | index.integration.test.ts ✓ |
| launch command fidelity       | index.integration.test.ts ✓ |

## 型チェック

```bash
pnpm --filter @repo/desktop typecheck  → PASS (エラーなし)
```

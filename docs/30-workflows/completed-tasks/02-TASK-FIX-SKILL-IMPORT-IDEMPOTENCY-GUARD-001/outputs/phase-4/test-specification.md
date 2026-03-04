# Phase 4 テスト仕様

## テスト戦略

- 既知不具合の再現テストを先に固定し、修正後の回帰で守る。
- 境界値（null/undefined/0件）を優先して追加。

## 対象ファイル

- `apps/desktop/src/main/ipc/skillHandlers.ts`
- `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`
- `apps/desktop/src/renderer/store/slices/agentSlice.ts`
- `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-integration.test.ts`

## 実行コマンド

- `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/skillHandlers.test.ts src/renderer/store/slices/__tests__/agentSlice.skill-integration.test.ts`

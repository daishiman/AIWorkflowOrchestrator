# Phase 12 実装ガイド

## Part 1: 概要

- タスク: スキル再インポート時の冪等化ガード
- 解決方針: Main IPCで importedCount=0 でも成功扱いを許容し、Rendererで事前ガードして二重呼び出しを抑止。

## Part 2: 実装詳細

### 変更ファイル

- `apps/desktop/src/main/ipc/skillHandlers.ts`
- `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`
- `apps/desktop/src/renderer/store/slices/agentSlice.ts`
- `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-integration.test.ts`

### テスト

- 実行コマンド: `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/skillHandlers.test.ts src/renderer/store/slices/__tests__/agentSlice.skill-integration.test.ts`
- 結果: 2 files / 129 tests PASS

### 再現手順（要点）

1. 既存不具合シナリオを実行する。
2. 修正後挙動が安定することを確認する。
3. 回帰テストを実行して固定する。

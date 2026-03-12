# カバレッジレポート

## 実行コマンド

- `pnpm --filter @repo/desktop typecheck`
- `pnpm --filter @repo/desktop test:run src/renderer/store/slices/chatSlice.test.ts src/renderer/views/ChatView/ChatView.test.tsx src/renderer/views/SkillCenterView/__tests__/SkillCenterView.test.tsx src/renderer/views/WorkspaceView/WorkspaceView.test.tsx`
- `pnpm --filter @repo/desktop build`

## 結果

- targeted test files: 4
- targeted tests: 28
- pass: 28
- typecheck: PASS
- build: PASS

## 注記

- `test:coverage` は package script 上、対象ファイル限定ではなく広い suite を起動したため、本タスクの正本は targeted functional coverage とした。

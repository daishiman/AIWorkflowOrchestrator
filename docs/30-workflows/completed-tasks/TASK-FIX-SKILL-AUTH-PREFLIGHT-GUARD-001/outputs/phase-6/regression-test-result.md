# Phase 6 回帰テスト結果

## 実行コマンド

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/preload/__tests__/skill-api.contract.test.ts \
  src/main/ipc/__tests__/skillHandlers.execute.test.ts \
  src/main/ipc/__tests__/skillHandlers.delegate.test.ts \
  src/main/ipc/__tests__/authKeyHandlers.test.ts \
  src/renderer/hooks/__tests__/useSkillExecution.test.ts \
  src/renderer/views/AgentView/__tests__/AgentView.test.tsx \
  src/renderer/store/slices/__tests__/agentSlice.test.ts \
  src/renderer/store/slices/__tests__/agentSlice.executeSkill.preflight.test.ts
```

## 結果

- Test Files: 8 passed
- Tests: 267 passed
- 重大回帰: 0件

## 備考

- ログ警告（`PermissionStore Invalid schema`）は既知テスト環境ノイズで、FAIL要因なし。

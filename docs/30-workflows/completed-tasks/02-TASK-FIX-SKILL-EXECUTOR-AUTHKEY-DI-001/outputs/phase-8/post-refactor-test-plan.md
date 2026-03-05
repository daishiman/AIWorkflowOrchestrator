# Phase 8 リファクタ後再テスト計画

## 回帰固定テスト（必須）

1. `src/main/ipc/__tests__/ipc-double-registration.test.ts`
2. `src/main/ipc/__tests__/skillHandlers.execute.test.ts`
3. `src/preload/__tests__/skill-api.contract.test.ts`
4. `src/renderer/hooks/__tests__/useSkillExecution.test.ts`
5. `src/main/services/skill/__tests__/SkillExecutor.auth.test.ts`

## 実施順序

1. SubAgent-A: Main/IPCの配線・エラー契約
2. SubAgent-B: Preload API契約
3. SubAgent-C: Renderer preflight契約
4. SubAgent-D: 失敗契約（`AUTHENTICATION_ERROR`）統合確認

## 合格基準

- 全テストPASS
- `AUTHENTICATION_ERROR` の `errorCode` 伝搬維持
- `registerSkillHandlers(..., authKeyService)` 注入回帰0件
- `registerAuthKeyHandlers` と同一インスタンス保証

## 実行コマンド

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/main/ipc/__tests__/ipc-double-registration.test.ts \
  src/main/ipc/__tests__/skillHandlers.execute.test.ts \
  src/preload/__tests__/skill-api.contract.test.ts \
  src/renderer/hooks/__tests__/useSkillExecution.test.ts \
  src/main/services/skill/__tests__/SkillExecutor.auth.test.ts
```

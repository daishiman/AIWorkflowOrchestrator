# Phase 4 テスト設計

## テスト戦略

- Team-A: 保存経路とアダプタキャッシュの契約テスト
- Team-B: `ai.chat` request優先と片指定エラーの契約テスト
- Team-C: AuthKey表示と `source` 優先判定のUIテスト

## 追加・更新対象

- `apps/desktop/src/main/ipc/__tests__/aiHandlers.llm.test.ts`
- `apps/desktop/src/main/handlers/__tests__/llm.test.ts`
- `apps/desktop/src/main/ipc/__tests__/authKeyHandlers.test.ts`
- `apps/desktop/src/renderer/components/settings/AuthKeySection/AuthKeySection.test.tsx`

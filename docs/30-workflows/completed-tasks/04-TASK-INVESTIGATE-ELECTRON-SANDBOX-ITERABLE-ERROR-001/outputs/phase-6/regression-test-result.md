# Phase 6 回帰テスト結果

## 実行コマンド

- `pnpm --filter @repo/desktop test:run src/renderer/store/slices/authSlice.test.ts src/main/ipc/profileHandlers.test.ts src/renderer/components/organisms/AccountSection/AccountSection.portal.test.tsx`

## 結果

- Test Files: 3 passed
- Tests: 169 passed
- 判定: PASS

## 回帰判定

- AccountSection系挙動の退行なし。
- 認証/プロフィール契約系テストは追加分を含めて安定。

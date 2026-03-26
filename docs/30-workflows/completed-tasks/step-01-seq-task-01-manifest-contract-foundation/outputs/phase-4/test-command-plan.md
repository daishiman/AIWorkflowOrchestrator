# Test Command Plan

## 計画

- `pnpm --filter @repo/desktop test:run -- src/main/services/runtime/__tests__/ManifestLoader.test.ts`
- `pnpm --filter @repo/desktop typecheck`
- `pnpm --filter @repo/shared typecheck`

## 実行結果

- desktop typecheck: PASS
- shared typecheck: PASS
- vitest: 環境ブロッカー
  - `Host version "0.21.5" does not match binary version "0.27.4"`

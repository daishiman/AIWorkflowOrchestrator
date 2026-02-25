# Phase 4 テストコマンド

## 実行コマンド

```bash
# 対象テスト（認証ハンドラ）
pnpm --filter @repo/desktop vitest run apps/desktop/src/main/ipc/authHandlers.test.ts

# 追加予定テスト（fallback）
pnpm --filter @repo/desktop vitest run apps/desktop/src/main/ipc/__tests__/index.auth-fallback.test.ts

# 回帰（IPC二重登録防止）
pnpm --filter @repo/desktop vitest run apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts

# 品質ゲート（後続Phase用）
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint
```

## 記録方針

- 実行日時、対象、結果（PASS/FAIL）をPhase 6/9成果物へ転記

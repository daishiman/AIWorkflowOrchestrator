# Phase 4 Preload Bridge Red テスト

## 対象

想定 test file: `apps/desktop/src/preload/__tests__/authModeApi.contract.test.ts`

## Red ケース

1. `authMode.get passes through IPC_CHANNELS.AUTH_MODE_GET and exposes { mode } response`
2. `authMode.status exposes shared AuthModeStatus payload`
3. `authMode.validate accepts optional request and exposes shared AuthModeStatus payload`
4. `authMode.onModeChanged subscribes to AUTH_MODE_CHANGED with shared event payload`
5. `AUTH_MODE_GET/SET/STATUS/VALIDATE remain in invoke whitelist and AUTH_MODE_CHANGED remains in on whitelist`

## 現状 fail 理由

- `validate` の request signature が shared 設計と揃っていない。
- auth-mode DTO が `preload/types.ts` に独自定義されている。

# Phase 4 Renderer Slice Red テスト

## 追加 / 更新するテスト名

1. `fetchMode reads response.data.mode from shared transport dto`
2. `fetchStatus stores message errorCode guidance lastCheckedAt`
3. `validate returns the same dto shape as fetchStatus`
4. `mode change listener applies event.status without relying on legacy fields`
5. `selector stability remains intact with individual selectors`

## 関連 test file

| ファイル                            | 役割                                     |
| ----------------------------------- | ---------------------------------------- |
| `authModeSlice.test.ts`             | fetch / status / validate / listener     |
| `authModeSlice.error.test.ts`       | fallback DTO                             |
| `authModeSlice.selectors.test.ts`   | renderHook と個別 selector               |
| `SettingsView.test.tsx`             | mount, message, errorCode, guidance 表示 |
| `infinite-loop-prevention.test.tsx` | P31 防止回帰                             |

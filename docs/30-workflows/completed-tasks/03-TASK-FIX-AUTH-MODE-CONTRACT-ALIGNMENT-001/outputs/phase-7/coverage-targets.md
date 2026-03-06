# Phase 7: coverage 目標と実測

## 目標

| 指標      | 目標    |
| --------- | ------- |
| Lines     | 90%以上 |
| Branches  | 85%以上 |
| Functions | 100%    |

## 実測

| ファイル                                                                   | Lines  | Functions | Branches | 判定 |
| -------------------------------------------------------------------------- | ------ | --------- | -------- | ---- |
| `apps/desktop/src/main/ipc/authModeHandlers.ts`                            | 93.62  | 100.00    | 94.29    | PASS |
| `apps/desktop/src/renderer/store/slices/authModeSlice.ts`                  | 98.19  | 100.00    | 90.12    | PASS |
| `apps/desktop/src/renderer/views/SettingsView/index.tsx`                   | 98.06  | 100.00    | 92.86    | PASS |
| `apps/desktop/src/renderer/components/settings/AuthModeSelector/index.tsx` | 100.00 | 100.00    | 95.65    | PASS |
| `apps/desktop/src/preload/channels.ts`                                     | 100.00 | N/A       | N/A      | PASS |

## 測定条件

- 実行コマンド:

```bash
pnpm --filter @repo/desktop exec vitest run --coverage \
  src/main/ipc/__tests__/authModeHandlers.test.ts \
  src/main/ipc/__tests__/authModeHandlers.error.test.ts \
  src/preload/__tests__/authModeApi.contract.test.ts \
  src/preload/channels.test.ts \
  src/renderer/store/slices/__tests__/authModeSlice.test.ts \
  src/renderer/store/slices/__tests__/authModeSlice.error.test.ts \
  src/renderer/store/slices/__tests__/authModeSlice.selectors.test.ts \
  src/renderer/components/settings/AuthModeSelector/__tests__/AuthModeSelector.test.tsx \
  src/renderer/views/SettingsView/SettingsView.test.tsx \
  src/renderer/__tests__/infinite-loop-prevention.test.tsx
```

- 備考:
  - global threshold は workspace 全体を含むため command 自体は失敗扱いになった
  - 本 Phase では `coverage-final.json` から touched file の実測値のみ抽出した

## coverage 対象外の扱い

| ファイル                                   | 扱い                      | 根拠                                                                            |
| ------------------------------------------ | ------------------------- | ------------------------------------------------------------------------------- |
| `apps/desktop/src/preload/index.ts`        | numerical coverage 対象外 | `authModeApi.contract.test.ts` で invoke/on contract を監査                     |
| `apps/desktop/src/preload/types.ts`        | numerical coverage 対象外 | TypeScript compile と contract import/export で担保                             |
| `apps/desktop/src/renderer/store/index.ts` | numerical coverage 対象外 | `authModeSlice.selectors.test.ts` と `infinite-loop-prevention.test.tsx` で担保 |

## 結論

- touched file の数値目標は全件達成
- numerical coverage だけで拾えない event / envelope / selector 安定性は contract matrix で補完する

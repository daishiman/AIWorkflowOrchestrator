# Phase 6: cross-layer test result

## 実行結果サマリ

| レイヤ         | 対象                                         | 結果 |
| -------------- | -------------------------------------------- | ---- |
| Main           | IPC handler 正常系 / 異常系                  | PASS |
| Preload        | invoke / on bridge 契約                      | PASS |
| Renderer State | slice fetch / validate / listener / fallback | PASS |
| Renderer UI    | SettingsView / AuthModeSelector / no-loop    | PASS |

## レイヤ別詳細

### Main

| テストファイル                                          | 主要確認項目                                  | 結果 |
| ------------------------------------------------------- | --------------------------------------------- | ---- |
| `src/main/ipc/__tests__/authModeHandlers.test.ts`       | `get`, `set`, `status`, `validate`, `changed` | PASS |
| `src/main/ipc/__tests__/authModeHandlers.error.test.ts` | sanitize, sender validation, storage failure  | PASS |

### Preload

| テストファイル                                       | 主要確認項目                                 | 結果 |
| ---------------------------------------------------- | -------------------------------------------- | ---- |
| `src/preload/__tests__/authModeApi.contract.test.ts` | `get`, `validate(request?)`, `onModeChanged` | PASS |
| `src/preload/channels.test.ts`                       | whitelist, invoke/on 許可チャネル            | PASS |

### Renderer State

| テストファイル                                                        | 主要確認項目                                    | 結果 |
| --------------------------------------------------------------------- | ----------------------------------------------- | ---- |
| `src/renderer/store/slices/__tests__/authModeSlice.test.ts`           | fetch, set, validate, listener, fetchStatus     | PASS |
| `src/renderer/store/slices/__tests__/authModeSlice.error.test.ts`     | fallback, runtime error mapping, listener guard | PASS |
| `src/renderer/store/slices/__tests__/authModeSlice.selectors.test.ts` | selector stability, export contract, no-loop    | PASS |

### Renderer UI

| テストファイル                                                                          | 主要確認項目                                                 | 結果 |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ---- |
| `src/renderer/views/SettingsView/SettingsView.test.tsx`                                 | mount, status message/code/guidance, initializeAuthMode 1 回 | PASS |
| `src/renderer/components/settings/AuthModeSelector/__tests__/AuthModeSelector.test.tsx` | click, keyboard, aria, disabled                              | PASS |
| `src/renderer/__tests__/infinite-loop-prevention.test.tsx`                              | SettingsView パターンの P31 回避                             | PASS |

## cross-layer 判定

1. `get`, `status`, `validate`, `changed` の canonical DTO は 3 層で整合した。
2. `set` は event payload 更新と UI status 更新の両方を維持した。
3. sender failure、credential missing、storage failure を別経路で監査できる状態になった。
4. selector 系 regression を取り込んだため、契約 drift と no-loop 再発を同時に検出できる。

## Phase 7 へ渡す論点

- numerical coverage を touched file 単位で整理する
- coverage 除外ファイルの扱いを contract / regression 根拠で補足する

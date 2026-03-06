# Phase 7: contract coverage matrix

## channel × case 行列

| channel              | 正常系 | 異常系 | event | integration 相当 | 備考                                              |
| -------------------- | ------ | ------ | ----- | ---------------- | ------------------------------------------------- |
| `auth-mode:get`      | PASS   | PASS   | N/A   | PASS             | `data: { mode }` を固定                           |
| `auth-mode:set`      | PASS   | PASS   | PASS  | PASS             | success 後 `changed` event を検証                 |
| `auth-mode:status`   | PASS   | PASS   | N/A   | PASS             | `AuthModeStatus` transport DTO                    |
| `auth-mode:validate` | PASS   | PASS   | N/A   | PASS             | `validate()` と `validate({ mode })` の両方を検証 |
| `auth-mode:changed`  | PASS   | N/A    | PASS  | PASS             | Renderer listener と UI 表示更新を検証            |

## 異常系の詳細

| ケース                 | get  | set  | status | validate | 判定 |
| ---------------------- | ---- | ---- | ------ | -------- | ---- |
| invalid sender         | PASS | PASS | PASS   | PASS     | PASS |
| invalid mode           | N/A  | PASS | N/A    | PASS     | PASS |
| credential missing     | N/A  | N/A  | PASS   | PASS     | PASS |
| storage error          | PASS | PASS | N/A    | N/A      | PASS |
| sanitize error message | PASS | PASS | PASS   | PASS     | PASS |

## UI / selector coverage

| 観点                                  | 自動テスト                                                             | 判定 |
| ------------------------------------- | ---------------------------------------------------------------------- | ---- |
| SettingsView mount                    | `SettingsView.test.tsx`                                                | PASS |
| status message / code / guidance 表示 | `SettingsView.test.tsx`                                                | PASS |
| AuthModeSelector interaction          | `AuthModeSelector.test.tsx`                                            | PASS |
| listener 反映                         | `authModeSlice.test.ts`                                                | PASS |
| no-loop / selector stability          | `authModeSlice.selectors.test.ts`, `infinite-loop-prevention.test.tsx` | PASS |

## contract 未検証扱いにしなかった理由

1. `set` の response body は `success: true` のみで、event payload を別テストで固定している。
2. `preload/types.ts` は runtime 経路を持たないため、compile と bridge test をもって contract 担保とする。
3. `store/index.ts` は selector export の公開面であり、renderHook 系 regression で公開契約を監査している。

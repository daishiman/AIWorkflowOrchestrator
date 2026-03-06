# Phase 2 テスト戦略

## unit

| 対象                          | 目的                                                                    |
| ----------------------------- | ----------------------------------------------------------------------- |
| `authModeHandlers.test.ts`    | get / status / validate / changed の transport shape 固定               |
| `authModeSlice.test.ts`       | `fetchMode`, `fetchStatus`, `validate`, listener の shared DTO 反映確認 |
| `authModeSlice.error.test.ts` | fallback DTO と error handling 確認                                     |
| `AuthModeSelector.test.tsx`   | `AuthMode` 型参照切替後も操作契約が維持されることを確認                 |

## integration

| 対象                                | 目的                                                                                          |
| ----------------------------------- | --------------------------------------------------------------------------------------------- |
| 新規 preload contract test          | `window.electronAPI.authMode` の `get/set/status/validate/onModeChanged` を bridge 実装で固定 |
| `SettingsView.test.tsx`             | status message / error code / guidance 表示と mount 初期化の確認                              |
| `infinite-loop-prevention.test.tsx` | 個別 selector と `useEffect([initializeAuthMode])` の維持確認                                 |

## manual

| TC       | 目的                                                         |
| -------- | ------------------------------------------------------------ |
| TC-11-01 | 起動直後の `get -> status` 整合確認                          |
| TC-11-02 | API key 欠落時の `message` / `errorCode` 表示確認            |
| TC-11-03 | subscription token 欠落時の `message` / `errorCode` 表示確認 |
| TC-11-04 | `set -> changed` による画面即時反映確認                      |
| TC-11-05 | 再起動後 restore 確認                                        |

## テスト実装ルール

1. `window.electronAPI.authMode` mock は shared DTO shape を返す。
2. renderHook 系は個別 selector を直接確認し、`useAuthModeStore` は非推奨のまま残す。
3. Main / Preload / Renderer で fixture 名を統一する。
4. `invalid sender`, `invalid mode`, `credential missing` の3異常系を必須にする。

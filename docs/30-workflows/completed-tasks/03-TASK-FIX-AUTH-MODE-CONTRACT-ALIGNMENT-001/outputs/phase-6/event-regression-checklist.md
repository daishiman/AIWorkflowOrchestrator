# Phase 6: event 回帰 checklist

## 対象フロー

- `set -> changed -> fetchStatus`
- `get -> status`
- `validate(mode?)`

## checklist

| #   | 確認項目                                                                  | 根拠                                                       | 結果 |
| --- | ------------------------------------------------------------------------- | ---------------------------------------------------------- | ---- |
| 1   | `set` 成功時に `changed` event が 1 回だけ送信される                      | `authModeHandlers.test.ts`                                 | PASS |
| 2   | `changed.previousMode` が切替前 mode を保持する                           | `authModeHandlers.test.ts`                                 | PASS |
| 3   | `changed.mode` が切替後 mode を保持する                                   | `authModeHandlers.test.ts`                                 | PASS |
| 4   | `changed.status.mode` と `changed.mode` が一致する                        | `authModeHandlers.test.ts`, `authModeSlice.test.ts`        | PASS |
| 5   | `changedAt` が event payload に存在する                                   | `authModeHandlers.test.ts`                                 | PASS |
| 6   | Renderer listener が `event.status` を再計算せず state に反映する         | `authModeSlice.test.ts`                                    | PASS |
| 7   | `fetchMode` 成功後に `fetchStatus` が呼ばれる                             | `authModeSlice.test.ts`                                    | PASS |
| 8   | `setMode` 成功後に `fetchStatus` が呼ばれる                               | `authModeSlice.test.ts`                                    | PASS |
| 9   | `validate()` は current mode、`validate({ mode })` は指定 mode を検証する | `authModeHandlers.test.ts`, `authModeApi.contract.test.ts` | PASS |
| 10  | invalid sender が invalid mode より先に遮断される                         | `authModeHandlers.test.ts`                                 | PASS |

## event consistency の結論

- event payload と status DTO の shape は一致した
- Renderer 側で `mode/status` を別々に組み立てる経路は残していない
- `changed` event だけで UI 表示更新が可能で、追加リロードは不要

## 追加監視ポイント

- `AuthModeChangedEvent` に旧 `newMode` / `timestamp` を復活させない
- `authModeSlice` で listener 登録を二重化しない
- `SettingsView` で mount 時の selector / `useEffect` パターンを崩さない

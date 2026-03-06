# Phase 5 移行順序

## 手順

| 順  | 作業               | 入口条件           | 出口条件                                                                     |
| --- | ------------------ | ------------------ | ---------------------------------------------------------------------------- |
| 1   | shared DTO 更新    | Phase 2 設計確定   | `AuthModeStatus`, `AuthModeChangedEvent`, `IPCResponse<T>` が shared に揃う  |
| 2   | main adapter 更新  | shared export 確定 | `get/status/validate/changed` が新契約を返す                                 |
| 3   | preload 公開面更新 | main 契約 green    | `preload/types.ts` の重複型が消え、`validate(request?)` が shared 契約になる |
| 4   | renderer 更新      | preload 契約 green | slice / SettingsView / listener が shared DTO を読む                         |
| 5   | テスト更新         | renderer 契約確定  | Main / Preload / Renderer / no-loop テストが green                           |

## Red テストとの対応

| Red 項目                     | 実装手順         |
| ---------------------------- | ---------------- |
| get raw string drift         | 1 -> 2           |
| status old DTO drift         | 1 -> 2 -> 4      |
| validate old DTO drift       | 1 -> 2 -> 3 -> 4 |
| changed legacy event drift   | 1 -> 2 -> 4      |
| SettingsView mount / no-loop | 4 -> 5           |

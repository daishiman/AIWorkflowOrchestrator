# Phase 5 契約差分

## IPC契約観点

| 項目                        | 変更前                          | 変更後                           |
| --------------------------- | ------------------------------- | -------------------------------- |
| `AUTH_STATE_CHANGED.user`   | Supabase Userが混入する経路あり | `AuthUser` 形状へ統一            |
| `linkedProviders` state前提 | 配列前提で処理                  | 非配列を `[]` 正規化             |
| invalid entry 混入時        | 暗黙に処理、例外化リスク        | `isLinkedProvider` で除外 + warn |

## 非変更項目

- IPCチャンネル追加/削除: なし
- Preload API公開面: 変更なし

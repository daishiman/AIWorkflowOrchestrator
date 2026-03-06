# Phase 8: refactoring plan

## 目的

- public contract の owner を shared に固定した状態を維持する
- Main handler の transport mapping と event path を再発しにくい形で整理する
- refactor 後も Phase 6 の regression case を崩さない

## 実施結果

| 項目                   | 実施内容                                                                                     | 結果 |
| ---------------------- | -------------------------------------------------------------------------------------------- | ---- |
| shared DTO 集約        | `AuthModeStatus`, `IPCResponse`, `AuthModeChangedEvent` を shared 起点へ統一                 | 完了 |
| Main adapter 集約      | handler 内に `buildErrorResponse`, `buildTransportStatus`, `mapAuthStatusToTransport` を配置 | 完了 |
| Preload re-export 整理 | auth-mode 型を shared import / re-export に統一                                              | 完了 |
| Renderer contract 整理 | slice / selector / SettingsView が shared DTO 前提で動作                                     | 完了 |

## 削除対象として確認した重複

| ファイル                                                  | 重複/散在                                 | 判断                      |
| --------------------------------------------------------- | ----------------------------------------- | ------------------------- |
| `apps/desktop/src/preload/types.ts`                       | public auth-mode 型のローカル再定義       | 削除済み                  |
| `apps/desktop/src/renderer/store/slices/authModeSlice.ts` | public validation result の独自 interface | `type alias` 化で解消済み |
| `apps/desktop/src/main/ipc/authModeHandlers.ts`           | response / event shape のローカル定義     | shared import に統一済み  |

## 今回は残す internal type

| ファイル                                       | 理由                                                                                        |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/services/auth/types.ts` | service 内部契約であり public transport ではない                                            |
| `AuthModeService` の `AuthModeChangeEvent`     | service listener 用 internal event。Phase 12 で public DTO と混同しないよう spec に明記する |

## 回帰維持条件

1. `get`, `status`, `validate`, `changed` の DTO 名を変更しない。
2. invalid sender の判定順序を `mode` validation より前に置いたままにする。
3. Renderer listener は `event.status` を再マップしない。
4. SettingsView は個別 selector + `useEffect([initializeAuthMode])` を維持する。

# Phase 8: adapter review

## Main mapping helper

| helper                     | 役割                                                | 判定 |
| -------------------------- | --------------------------------------------------- | ---- |
| `buildErrorResponse`       | 公開 error envelope を一箇所で生成                  | 維持 |
| `mapAuthStatusToTransport` | internal `AuthStatus` を `AuthModeStatus` へ変換    | 維持 |
| `buildTransportStatus`     | current mode / request mode の両経路を transport 化 | 維持 |
| `getFailureStatus`         | credential missing を mode 別 DTO に変換            | 維持 |

## event path review

| 観点                     | 現状                                          | 判定 |
| ------------------------ | --------------------------------------------- | ---- |
| Main -> Renderer payload | `previousMode`, `mode`, `status`, `changedAt` | PASS |
| Preload                  | payload をそのまま `safeOn` で透過            | PASS |
| Renderer                 | `setupAuthModeListener` が単一受信経路        | PASS |
| UI                       | `SettingsView` は store `status` を直接描画   | PASS |

## sender 順序 review

1. `validateSender(event)` を最初に実行している。
2. その後に request 構造・mode 値を検証している。
3. したがって invalid sender と invalid mode は分類が混ざらない。

## refactor 後に public contract を変えていない点

- channel 名は変更していない
- response envelope のキーは `success`, `data`, `error` のまま
- UI 表示の入力ソースは `status.message`, `status.errorCode`, `status.guidance` に固定

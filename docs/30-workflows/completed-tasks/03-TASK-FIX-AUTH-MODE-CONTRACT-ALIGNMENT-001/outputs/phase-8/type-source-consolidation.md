# Phase 8: type source consolidation

## public type owner

| 型                         | owner                                    | 参照先                    |
| -------------------------- | ---------------------------------------- | ------------------------- |
| `AuthMode`                 | `packages/shared/src/types/auth-mode.ts` | Main / Preload / Renderer |
| `AuthModeStatus`           | `packages/shared/src/types/auth-mode.ts` | Main / Renderer           |
| `IPCResponse<T>`           | `packages/shared/src/types/auth-mode.ts` | Main / Preload            |
| `AuthModeGetResponse`      | `packages/shared/src/types/auth-mode.ts` | Preload / Renderer        |
| `AuthModeSetRequest`       | `packages/shared/src/types/auth-mode.ts` | Main / Preload / Renderer |
| `AuthModeStatusResponse`   | `packages/shared/src/types/auth-mode.ts` | Preload / Renderer        |
| `AuthModeValidateRequest`  | `packages/shared/src/types/auth-mode.ts` | Main / Preload / Renderer |
| `AuthModeValidateResponse` | `packages/shared/src/types/auth-mode.ts` | Preload / Renderer        |
| `AuthModeChangedEvent`     | `packages/shared/src/types/auth-mode.ts` | Main / Preload / Renderer |
| `AUTH_MODE_ERROR_CODES`    | `packages/shared/src/types/auth-mode.ts` | Main / Renderer           |

## internal type owner

| 型                         | owner                                          | 備考                                                        |
| -------------------------- | ---------------------------------------------- | ----------------------------------------------------------- |
| `AuthStatus`               | `apps/desktop/src/main/services/auth/types.ts` | service 内部状態。Main handler で transport へ変換          |
| `AuthModeValidationResult` | `apps/desktop/src/main/services/auth/types.ts` | service 用 internal validation result                       |
| `AuthModeChangeEvent`      | `apps/desktop/src/main/services/auth/types.ts` | service listener 用。public `AuthModeChangedEvent` とは別物 |

## 所有境界の結論

1. Renderer は public transport 型だけを見る。
2. Preload は public transport の透過と whitelist 管理だけを持つ。
3. Main handler は internal service shape と public transport shape の境界になる。
4. service は public DTO を直接返さない。

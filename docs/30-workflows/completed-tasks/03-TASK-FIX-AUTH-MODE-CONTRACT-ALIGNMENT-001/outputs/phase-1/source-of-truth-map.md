# Phase 1 公開型正本マップ

## 正本候補評価

| ファイル                                                  | 役割                             | 現状課題                                      | Phase 1 判定                                                  |
| --------------------------------------------------------- | -------------------------------- | --------------------------------------------- | ------------------------------------------------------------- |
| `packages/shared/src/types/auth-mode.ts`                  | shared transport / provider 契約 | IPC DTO が旧 shape                            | 正本に採用。Phase 2 で DTO を再設計する                       |
| `apps/desktop/src/main/services/auth/types.ts`            | Main 内部 service 型             | public transport と内部型が混在               | internal type のみ保持。公開 DTO の正本にはしない             |
| `apps/desktop/src/preload/types.ts`                       | Renderer 公開 API 型             | UI 都合の独自 DTO が重複                      | shared import / re-export のみに縮小する                      |
| `apps/desktop/src/renderer/store/slices/authModeSlice.ts` | store 状態 / action 型           | AuthMode / Status / ValidationResult を再定義 | shared transport を参照し、slice 独自 state/action 型だけ残す |

## ownership ルール

1. `AuthMode`, transport DTO, error code union, changed event は shared が所有する。
2. Main は `AuthStatus` など内部 service 型を保持してよいが、IPC 境界では adapter で shared DTO に変換する。
3. Preload は `ElectronAPI` の公開面だけを持ち、DTO 自体は shared を参照する。
4. Renderer は state/action と UI 文脈のみを保持し、transport DTO の再定義を禁止する。

## 置換対象

| 置換対象                                                                       | 置換後                                       |
| ------------------------------------------------------------------------------ | -------------------------------------------- |
| `preload/types.ts` の `AuthMode`, `AuthModeStatus`, `AuthModeChangedEvent`     | shared import へ置換                         |
| `authModeSlice.ts` の `AuthMode`, `AuthModeStatus`, `AuthModeValidationResult` | shared transport DTO / alias へ置換          |
| `AuthModeSelector` の `AuthMode` import                                        | slice ではなく shared or store export へ置換 |

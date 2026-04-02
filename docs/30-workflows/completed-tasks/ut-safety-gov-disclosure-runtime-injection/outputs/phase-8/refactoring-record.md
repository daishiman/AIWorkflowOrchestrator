# Phase 8: リファクタリング記録

## 実行日時

2026-04-02

## Before/After/理由テーブル

| 対象                                               | Before             | After                                                 | 理由                                       |
| -------------------------------------------------- | ------------------ | ----------------------------------------------------- | ------------------------------------------ |
| `apps/desktop/src/main/ipc/index.ts` disclosure DI | static placeholder | `buildDisclosureInfo()` + `authModeServiceForRuntime` | runtime 状態へ接続し、固定値ドリフトを解消 |
| disclosure 型参照                                  | inline object 想定 | `IAuthModeService` / `DisclosureInfo` を import type  | 型境界を明示し、関数責務を固定             |

## 判定

- 過剰な抽象化は追加していない
- `disclosureHandlers.ts` 本体は変えず、DI 境界だけを更新した
- 将来課題は `modelName` 動的化に限定される

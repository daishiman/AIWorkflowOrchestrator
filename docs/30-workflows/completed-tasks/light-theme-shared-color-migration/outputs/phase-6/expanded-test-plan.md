# Phase 6 Output: Expanded Test Plan

## 追加した回帰観点

| 観点                        | 具体化                                                                  |
| --------------------------- | ----------------------------------------------------------------------- |
| verification blind spot     | `SettingsView` auth-mode status を guard 対象へ追加                     |
| authenticated surface       | `SettingsView.integration.test.tsx` を代表 regression に組み込み        |
| manual evidence bridge      | TC-01〜TC-13 を screenshot plan と同期                                  |
| destructive flow visibility | `AccountSection` / `ApiKeysSection` の delete dialog を Phase 11 で撮影 |
| workspace shell             | success / error の 2 状態を Phase 11 で固定                             |

## 実行対象の拡張

- `SettingsView.test.tsx`
- `SettingsView.integration.test.tsx`
- `light-theme-shared-color-migration.guard.test.ts`

## 目的

- 当初 inventory から漏れていた `SettingsView` status panel を coverage に含める
- UI state ごとの visual evidence を TC ベースで固定し、Phase 11 validator と直結させる

# Phase 2 Output: Batch Plan

## Batch execution matrix

| Batch | 所有 concern                   | 対象ファイル                                         | Done 条件                                                                      |
| ----- | ------------------------------ | ---------------------------------------------------- | ------------------------------------------------------------------------------ |
| A     | shared selector control        | `ThemeSelector`, `AuthModeSelector`                  | selector / option state の local neutral / accent hardcode が消える            |
| B     | settings authenticated surface | `AuthKeySection`, `AccountSection`, `ApiKeysSection` | settings/auth surface の hardcode が消え、既存 state / fallback 契約が保たれる |
| C     | auth entry                     | `AuthView`                                           | light login surface の readability が token と整合                             |
| D     | search surface                 | `WorkspaceSearchPanel`                               | slate / blue / white panel 契約が token 化される                               |
| E     | verification                   | `SettingsView`, `SettingsCard`, `DashboardView`      | regression なしを確認                                                          |

## 並列化計画

| 直列/並列 | 内容                                          |
| --------- | --------------------------------------------- |
| 直列      | Batch A を先行し shared control 契約を固める  |
| 並列      | Batch B と Batch C を並列実行可能             |
| 直列      | Batch D は review コストが高いため単独        |
| 直列      | Batch E は最後に verification-only として実施 |

## 既存 backlog への影響

- timeout fallback は Batch C に混ぜない
- regression guard は Batch D の後続タスクとして残す
- token secondary text は Batch E の verification で再発有無のみを見る
- linked-provider warning は Batch B に混ぜない

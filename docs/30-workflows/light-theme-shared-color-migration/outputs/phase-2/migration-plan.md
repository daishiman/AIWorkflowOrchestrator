# Phase 2 Output: Migration Plan

## 設計原則

1. neutral hardcode は既存 text / bg / border token へ寄せる
2. accent hardcode は shared Button / CTA 契約を優先し、local hex を撤去する
3. token baseline の再設計は行わない
4. state / IPC / preload は変更対象に含めない

## 対象別設計

| 対象                                 | 設計方針                                                                             | 備考                     |
| ------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------ |
| `ThemeSelector`                      | selector container の `bg-white/5` / `border-white/10` / `text-white/60` を token 化 | shared control の基準点  |
| `AuthModeSelector`, `AuthKeySection` | `#007AFF` / `#0066D6` を shared CTA 契約へ移行                                       | local hex を撤去         |
| `AccountSection`, `ApiKeysSection`   | white glass / text hardcode を glass token / text token に寄せる                     | Settings domain 主残件   |
| `AuthView`                           | login card の white text 前提を light token と両立させる                             | Auth form 基準に合わせる |
| `WorkspaceSearchPanel`               | panel / input / result list の slate / blue hardcode を token 化                     | 単独 batch               |
| verification-only                    | `SettingsView`, `SettingsCard`, `DashboardView` は regression チェックのみ           | 改修対象から外す         |

## テストアンカー設計

| バッチ | テストアンカー                                                                                                          |
| ------ | ----------------------------------------------------------------------------------------------------------------------- |
| A      | `ThemeSelector.test.tsx`, `AuthModeSelector.test.tsx`, `AuthKeySection.test.tsx`                                        |
| B      | `SettingsView.integration.test.tsx`, `settings-test-harness.ts`, `AccountSection*.test.tsx`, `ApiKeysSection*.test.tsx` |
| C      | `AuthView.test.tsx`, `AuthView.keyboard.test.tsx`                                                                       |
| D      | `WorkspaceSearchPanel.test.tsx`                                                                                         |
| E      | existing dashboard/settings regression                                                                                  |

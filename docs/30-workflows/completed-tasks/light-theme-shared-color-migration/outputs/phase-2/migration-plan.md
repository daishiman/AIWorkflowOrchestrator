# Phase 2 Output: Migration Plan

## 設計原則

1. neutral hardcode は既存 text / bg / border token へ寄せる
2. accent hardcode は shared Button / CTA 契約を優先し、local hex を撤去する
3. token baseline の再設計は行わない
4. compatibility bridge は token foundation 側の責務として扱い、本 task では component migration に限定する
5. state / IPC / preload は変更対象に含めない
6. batch ごとの public contract は `aiworkflow-requirements` を input-only で参照し、style diff で壊さない

## 対象別設計

| 対象                                | 設計方針                                                                                     | 備考                     |
| ----------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------ |
| `ThemeSelector`, `AuthModeSelector` | selector container / option state の neutral / accent hardcode を token 化                   | Batch A                  |
| `AuthKeySection`                    | CTA / status badge / input 周辺の hex / gray hardcode を settings contract を守って token 化 | Batch B                  |
| `AccountSection`, `ApiKeysSection`  | white glass / text hardcode を glass token / text token に寄せる                             | Batch B 主残件           |
| `AuthView`                          | login card の white text 前提を light token と両立させる                                     | Auth form 基準に合わせる |
| `WorkspaceSearchPanel`              | panel / input / result list の slate / blue hardcode を token 化                             | 単独 batch               |
| verification-only                   | `SettingsView`, `SettingsCard`, `DashboardView` は regression チェックのみ                   | 改修対象から外す         |

## Batch contract matrix

| Batch | 主要仕様                                                                                                                                             | 設計で守る契約                                                                         |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| A     | `rag-desktop-state.md`, `ui-ux-design-system.md`                                                                                                     | theme state ownership と selector widget contract を壊さない                           |
| B     | `ui-ux-settings.md`, `architecture-auth-security.md`, `api-ipc-system.md`, `error-handling.md`, `workflow-apikey-chat-tool-integration-alignment.md` | settings/authenticated surface、auth-key visibility、fallback/error surface を壊さない |
| C     | `ui-ux-forms.md`, `api-ipc-auth.md`, `architecture-auth-security.md`                                                                                 | auth state → UI の表示マッピングを壊さない                                             |
| D     | `ui-ux-search-panel.md`, `ui-ux-design-principles.md`                                                                                                | search panel hierarchy / contrast / result layout を壊さない                           |
| E     | `ui-ux-feature-components.md`, `task-workflow.md`, `lessons-learned.md`                                                                              | regression-only として representative evidence を確認する                              |

## Phase 11/12 前提

- screenshot 証跡は current worktree build を capture source に固定する
- Phase 12 では `ui-ux-design-system.md` / `workflow-light-theme-global-remediation.md` / `ui-ux-settings.md` / `architecture-auth-security.md` / `api-ipc-auth.md` / `api-ipc-system.md` / `error-handling.md` を同期対象候補として判定する

## テストアンカー設計

| バッチ | テストアンカー                                                                                                                                     |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| A      | `ThemeSelector.test.tsx`, `AuthModeSelector.test.tsx`                                                                                              |
| B      | `AuthKeySection.test.tsx`, `SettingsView.integration.test.tsx`, `settings-test-harness.ts`, `AccountSection*.test.tsx`, `ApiKeysSection*.test.tsx` |
| C      | `AuthView.test.tsx`, `AuthView.keyboard.test.tsx`                                                                                                  |
| D      | `WorkspaceSearchPanel.test.tsx`                                                                                                                    |
| E      | existing dashboard/settings regression                                                                                                             |

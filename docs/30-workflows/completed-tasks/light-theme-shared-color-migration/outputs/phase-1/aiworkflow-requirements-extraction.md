# Phase 1 Output: aiworkflow-requirements Extraction

## 抽出方針

- `resource-map.md` を起点にし、必要な keyword search だけを追加して direct reference を特定する
- `.claude/skills` を canonical root とし、`.agents/skills` は mirror として扱う
- token baseline / compatibility bridge / IPC / preload は本タスクの変更対象に含めず、input-only contract として読む

## Cross-cutting 必須仕様

| 仕様                                         | 用途                                                          |
| -------------------------------------------- | ------------------------------------------------------------- |
| `workflow-light-theme-global-remediation.md` | token / bridge / component の責務分離を守る                   |
| `ui-ux-design-system.md`                     | light baseline と semantic token 契約を守る                   |
| `ui-ux-design-principles.md`                 | contrast / hierarchy / Apple HIG の判定基準にする             |
| `task-workflow.md`                           | screenshot / backlog / Phase 12 台帳同期先を固定する          |
| `lessons-learned.md`                         | current build capture と token/component 分離の教訓を引き継ぐ |

## Batch別 必須仕様

| Batch | 対象ファイル                                         | 必須仕様                                                                                                                                             | 理由                                                                                   |
| ----- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| A     | `ThemeSelector`, `AuthModeSelector`                  | `rag-desktop-state.md`, `ui-ux-design-system.md`, `ui-ux-components.md`                                                                              | theme state ownership と shared selector contract を壊さない                           |
| B     | `AuthKeySection`, `AccountSection`, `ApiKeysSection` | `ui-ux-settings.md`, `architecture-auth-security.md`, `api-ipc-system.md`, `error-handling.md`, `workflow-apikey-chat-tool-integration-alignment.md` | settings/authenticated surface、auth-key visibility、fallback/error surface を壊さない |
| C     | `AuthView`                                           | `ui-ux-forms.md`, `api-ipc-auth.md`, `architecture-auth-security.md`                                                                                 | auth state → UI マッピングと readable text 契約を壊さない                              |
| D     | `WorkspaceSearchPanel`                               | `ui-ux-search-panel.md`, `ui-ux-design-principles.md`                                                                                                | panel hierarchy / contrast / interaction surface を壊さない                            |
| E     | `SettingsView`, `SettingsCard`, `DashboardView`      | `ui-ux-feature-components.md`, `task-workflow.md`, `lessons-learned.md`                                                                              | verification-only の representative evidence を固定する                                |

## 条件付き仕様

| 条件                                                        | 仕様                                                                               | 理由                                           |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------- |
| `AccountSection` の dropdown / menu overlay の style を触る | `ui-ux-portal-patterns.md`                                                         | portal menu の layering / focus 契約を壊さない |
| shared component の分解や helper 抽出を行う                 | `development-guidelines.md`                                                        | helper 化と責務分離の基準を揃える              |
| test harness / fixture を追加する                           | `testing-fixtures.md`, `testing-component-patterns.md`, `testing-accessibility.md` | Phase 4-11 の test anchor と a11y を揃える     |

## 抽出結論

- 本タスクは style migration task であり、token baseline 再設計や新規 IPC 契約追加は行わない
- `AuthKeySection` は shared control ではなく settings authenticated surface として Batch B に置く方が system spec と実コードの境界に合う
- `SettingsView` / `SettingsCard` / `DashboardView` は主改修対象ではなく verification-only とする
- Phase 12 の同期候補は `ui-ux-design-system.md` / `workflow-light-theme-global-remediation.md` / `ui-ux-settings.md` / `architecture-auth-security.md` / `api-ipc-auth.md` / `api-ipc-system.md` / `error-handling.md` / `task-workflow.md` / `lessons-learned.md`

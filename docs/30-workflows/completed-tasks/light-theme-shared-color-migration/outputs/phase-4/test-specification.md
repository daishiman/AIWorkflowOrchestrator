# Phase 4 Output: Test Specification

## 方針

- Red/Green の起点は `light-theme-shared-color-migration.guard.test.ts` とし、対象 UI に hardcoded color class / hex が残っていれば失敗させる
- 既存 component / integration test は batch ごとの挙動回帰を守る anchor として再利用する
- Phase 11 の目視 TC-ID をここで固定し、自動テストと manual evidence の対応を崩さない

## Red/Green 設計

| ステップ   | 内容                                                               | 実行コマンド                                                                                                       |
| ---------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Red        | guard test を追加し、hardcoded color が残る 8 ファイルを失敗させる | `pnpm --filter @repo/desktop exec vitest run src/renderer/styles/light-theme-shared-color-migration.guard.test.ts` |
| Green      | semantic token へ置換し、guard test を通す                         | 同上                                                                                                               |
| Regression | representative component test を batch 単位で再実行する            | `pnpm --filter @repo/desktop exec vitest run ...`                                                                  |

## 自動テスト対象

| Batch | 対象                                                                 | 自動テスト                                                                                                                                           |
| ----- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| A     | `ThemeSelector`, `AuthModeSelector`                                  | `ThemeSelector.test.tsx`, `AuthModeSelector.test.tsx`, guard                                                                                         |
| B     | `AuthKeySection`, `AccountSection`, `ApiKeysSection`, `SettingsView` | `AuthKeySection.test.tsx`, `AccountSection.test.tsx`, `ApiKeysSection.test.tsx`, `SettingsView.test.tsx`, `SettingsView.integration.test.tsx`, guard |
| C     | `AuthView`                                                           | `AuthView.test.tsx`, guard                                                                                                                           |
| D     | `WorkspaceSearchPanel`                                               | `WorkspaceSearchPanel.test.tsx`, guard                                                                                                               |
| E     | `SettingsView`, `DashboardView`                                      | `SettingsView.*`, Phase 11 screenshot TC                                                                                                             |

## Phase 11 連携 TC

| TC-ID | 対象                 | 観点                               |
| ----- | -------------------- | ---------------------------------- |
| TC-01 | ThemeSelector        | selected/unselected token contrast |
| TC-02 | AuthModeSelector     | warning status readability         |
| TC-03 | AuthKeySection       | saved badge / input / CTA          |
| TC-04 | AccountSection       | authenticated surface              |
| TC-05 | AccountSection       | delete confirm dialog              |
| TC-06 | ApiKeysSection       | provider list surface              |
| TC-07 | ApiKeysSection       | delete confirm dialog              |
| TC-08 | AuthView             | error banner readability           |
| TC-09 | WorkspaceSearchPanel | result list / highlight            |
| TC-10 | WorkspaceSearchPanel | error banner / input border        |
| TC-11 | SettingsView         | representative shell               |
| TC-12 | DashboardView        | light shell smoke                  |
| TC-13 | DashboardView        | dark shell smoke                   |

## 完了結果

- guard test は Red から開始し、Green 後は 8/8 files で PASS
- blind spot として `SettingsView` auth-mode status の green/amber hardcode を検出し、guard 対象へ追加した

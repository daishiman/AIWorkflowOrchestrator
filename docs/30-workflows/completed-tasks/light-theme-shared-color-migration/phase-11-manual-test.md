# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| タスクID   | TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001 |
| Phase      | 11                                              |
| Phase名    | 手動テスト                                      |
| ステータス | not_started                                     |
| 前提Phase  | Phase 10                                        |
| 後続Phase  | Phase 12                                        |

## 目的

Batch A-E の representative surface で light theme の見え方を確認し、主改修対象と verification-only を切り分ける。

## 実行タスク

- タスク1: Batch A/B/C/D/E の representative surface を目視確認する
- タスク2: 文字可読性、背景の強さ、境界線、status badge、dropdown、panel hierarchy を確認する
- タスク3: token task だけでは残った問題か、component migration 固有問題かを切り分ける
- タスク4: current build 由来の証跡だけを採用する

## 参照資料

| 参照資料                          | パス                                                                                                     | 説明                                     |
| --------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Phase 11/12 guide                 | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                              | representative screenshot と記録方式     |
| Screenshot verification procedure | `.claude/skills/task-specification-creator/references/screenshot-verification-procedure.md`              | screenshot 実行手順                      |
| Phase 2 成果物                    | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-2/`                  | batch 設計                               |
| Phase 5 成果物                    | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-5/`                  | 実装差分                                 |
| Phase 6 成果物                    | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-6/`                  | テスト拡張結果                           |
| Phase 7 成果物                    | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-7/`                  | coverage                                 |
| Phase 8 成果物                    | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-8/`                  | refactoring 結果                         |
| Phase 10 成果物                   | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-10/`                 | 最終レビュー結果                         |
| ui-ux-design-system               | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                               | light baseline / token 契約              |
| ui-ux-design-principles           | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`                           | Apple HIG / contrast 判定                |
| global workflow                   | `.claude/skills/aiworkflow-requirements/references/workflow-light-theme-global-remediation.md`           | capture / remediation 標準手順           |
| ui-ux-settings                    | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                                    | Settings の正本                          |
| ui-ux-forms                       | `.claude/skills/aiworkflow-requirements/references/ui-ux-forms.md`                                       | Auth entry の正本                        |
| architecture-auth-security        | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md`                        | `AccountSection` / `AuthView` の正本     |
| api-ipc-auth                      | `.claude/skills/aiworkflow-requirements/references/api-ipc-auth.md`                                      | auth state → UI 契約                     |
| api-ipc-system                    | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                                    | `ApiKeysSection` / `AuthKeySection` 契約 |
| error-handling                    | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                    | fallback / error state の確認基準        |
| ui-ux-search-panel                | `.claude/skills/aiworkflow-requirements/references/ui-ux-search-panel.md`                                | WorkspaceSearch の正本                   |
| quality report                    | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-9/quality-report.md` | 手動テスト観点の入力                     |

## 実行手順

1. preview preflight と current worktree build / asset hash / capture metadata を確認し、stale evidence を排除する。
2. `manual-test-checklist.md` と `screenshot-plan.json` を作成し、representative screens を selector 基準で撮影して `screenshot-coverage.md` を更新する。
3. `manual-test-result.md` と `discovered-issues.md` に結果を記録し、`validate-phase11-screenshot-coverage.js` の結果を Phase 12 へ引き継ぐ。

## 統合テスト連携

| 観点                   | 連携内容                                                                                 |
| ---------------------- | ---------------------------------------------------------------------------------------- |
| Representative screens | Settings / Dashboard / Auth / WorkspaceSearch の light theme を current build で確認する |
| Token split            | token foundation で扱う課題と component migration 課題を切り分ける                       |
| Evidence               | `manual-test-result.md` と発見事項を Phase 12 未タスク検出へ渡す                         |
| Screenshot source      | current worktree build 由来 asset hash を確認し、stale capture を棄却する                |

## 成果物

| 成果物                | パス                                                                                                             |
| --------------------- | ---------------------------------------------------------------------------------------------------------------- |
| manual-test-checklist | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-11/manual-test-checklist.md` |
| manual-test-plan      | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-11/manual-test-plan.md`      |
| screenshot-plan       | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-11/screenshot-plan.json`     |
| screenshot-coverage   | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-11/screenshot-coverage.md`   |
| manual-test-result    | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-11/manual-test-result.md`    |
| discovered-issues     | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-11/discovered-issues.md`     |
| screenshots           | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-11/screenshots/`             |

## 完了条件

- [ ] representative screen の確認結果がある
- [ ] 残問題の切り分けができている
- [ ] current build 由来の screenshot 証跡だけが採用されている
- [ ] `validate-phase11-screenshot-coverage.js` の実行結果を Phase 12 へ渡せる

## 次Phase

Phase 12: ドキュメント

## テストケース

| テストケース | 対象                 | 観点                            | 優先度 | 期待結果                                                               |
| ------------ | -------------------- | ------------------------------- | ------ | ---------------------------------------------------------------------- |
| TC-01        | ThemeSelector        | ライトテーマ selected state     | A      | `theme-settings-heading` 配下で token 背景・文字色・境界線が一貫する   |
| TC-02        | AuthModeSelector     | warning status surface          | A      | `auth-mode-status` が warning token で表示され、可読性が維持される     |
| TC-03        | AuthKeySection       | saved state                     | A      | status badge / input / CTA が light token で視認できる                 |
| TC-04        | AccountSection       | authenticated surface           | A      | profile / provider / danger action が light theme で読みやすい         |
| TC-05        | AccountSection       | delete confirm dialog           | B      | danger dialog の背景・本文・CTA が light theme で破綻しない            |
| TC-06        | ApiKeysSection       | provider list surface           | A      | provider rows / badges / security note が light token で揃う           |
| TC-07        | ApiKeysSection       | delete confirm dialog           | B      | delete dialog の danger CTA と本文 contrast が維持される               |
| TC-08        | AuthView             | error surface                   | A      | login card / error panel / provider button が light theme で視認できる |
| TC-09        | WorkspaceSearchPanel | results surface                 | A      | panel / input / result highlight / counter が light theme で読みやすい |
| TC-10        | WorkspaceSearchPanel | error surface                   | B      | error banner と入力境界線が light theme で明確に見える                 |
| TC-11        | SettingsView         | representative full shell       | A      | Settings shell 全体で section hierarchy と余白が破綻しない             |
| TC-12        | DashboardView        | representative light shell      | B      | downstream shell regression がない                                     |
| TC-13        | DashboardView        | representative dark shell smoke | C      | dark smoke で theme 切替回帰がない                                     |

## 画面カバレッジマトリクス

| テストケース | 画面/状態                            | ルート                                                                                                              | 証跡                                                 | 備考                                                           |
| ------------ | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------- |
| TC-01        | ThemeSelector / light selected       | `/phase11-light-theme-shared-color-migration.html?surface=settings&authMode=api-key&authStatus=valid&theme=light`   | `screenshots/TC-01-theme-selector-light.png`         | `section[aria-labelledby="theme-settings-heading"]` を撮影     |
| TC-02        | AuthModeSelector / invalid warning   | `/phase11-light-theme-shared-color-migration.html?surface=settings&authMode=api-key&authStatus=invalid&theme=light` | `screenshots/TC-02-auth-mode-warning-light.png`      | `section[aria-labelledby="auth-mode-settings-heading"]` を撮影 |
| TC-03        | AuthKeySection / saved               | `/phase11-light-theme-shared-color-migration.html?surface=settings&authMode=api-key&authStatus=valid&theme=light`   | `screenshots/TC-03-auth-key-saved-light.png`         | `section[aria-labelledby="auth-key-settings-heading"]` を撮影  |
| TC-04        | AccountSection / authenticated       | `/phase11-light-theme-shared-color-migration.html?surface=settings&authMode=api-key&authStatus=valid&theme=light`   | `screenshots/TC-04-account-surface-light.png`        | `section[aria-labelledby="account-settings-heading"]` を撮影   |
| TC-05        | AccountSection / delete dialog       | `/phase11-light-theme-shared-color-migration.html?surface=settings&authMode=api-key&authStatus=valid&theme=light`   | `screenshots/TC-05-account-delete-dialog-light.png`  | delete button click 後に `account-confirm-dialog` を撮影       |
| TC-06        | ApiKeysSection / provider list       | `/phase11-light-theme-shared-color-migration.html?surface=settings&authMode=api-key&authStatus=valid&theme=light`   | `screenshots/TC-06-api-keys-surface-light.png`       | `[aria-label="APIキー設定"]` を撮影                            |
| TC-07        | ApiKeysSection / delete dialog       | `/phase11-light-theme-shared-color-migration.html?surface=settings&authMode=api-key&authStatus=valid&theme=light`   | `screenshots/TC-07-api-keys-delete-dialog-light.png` | provider delete click 後に dialog を撮影                       |
| TC-08        | AuthView / error surface             | `/phase11-light-theme-shared-color-migration.html?surface=auth&authError=1&theme=light`                             | `screenshots/TC-08-auth-error-light.png`             | `phase11-auth-surface` を撮影                                  |
| TC-09        | WorkspaceSearchPanel / results       | `/phase11-light-theme-shared-color-migration.html?surface=workspace&workspaceScenario=success&theme=light`          | `screenshots/TC-09-workspace-results-light.png`      | `workspace-search-panel` を撮影                                |
| TC-10        | WorkspaceSearchPanel / error         | `/phase11-light-theme-shared-color-migration.html?surface=workspace&workspaceScenario=error&theme=light`            | `screenshots/TC-10-workspace-error-light.png`        | `workspace-search-panel` を撮影                                |
| TC-11        | SettingsView / representative shell  | `/phase11-light-theme-shared-color-migration.html?surface=settings&authMode=api-key&authStatus=valid&theme=light`   | `screenshots/TC-11-settings-shell-light.png`         | `phase11-light-theme-settings` を撮影                          |
| TC-12        | DashboardView / light representative | `/phase11-dashboard-home.html?theme=light&state=normal`                                                             | `screenshots/TC-12-dashboard-light-light.png`        | `phase11-dashboard-home` を撮影                                |
| TC-13        | DashboardView / dark smoke           | `/phase11-dashboard-home.html?theme=dark&state=normal`                                                              | `screenshots/TC-13-dashboard-dark-dark.png`          | theme coverage 用 dark smoke                                   |

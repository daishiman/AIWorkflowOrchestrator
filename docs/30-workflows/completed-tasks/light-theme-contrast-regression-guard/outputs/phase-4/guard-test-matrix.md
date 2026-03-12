# Phase 4 Guard Test Matrix

## TC / テスト対応表

| 区分      | ID        | 対象                    | 期待                                                | 実装 / 証跡                                                         |
| --------- | --------- | ----------------------- | --------------------------------------------------- | ------------------------------------------------------------------- |
| Audit     | T4-AUD-01 | ThemeSelector           | baseline 6 件                                       | `scripts/light-theme-contrast-guard.test.ts`                        |
| Audit     | T4-AUD-02 | AuthView                | baseline 4 件                                       | `scripts/light-theme-contrast-guard.test.ts`                        |
| Audit     | T4-AUD-03 | Settings / Dashboard    | current 0 件                                        | `scripts/light-theme-contrast-guard.test.ts`                        |
| Audit     | T4-AUD-04 | Phase11 harness files   | exclusion                                           | `scripts/light-theme-contrast-guard.test.ts`                        |
| Readiness | T4-SEL-01 | ThemeSelector root      | `data-testid="theme-selector"` が存在               | `ThemeSelector.test.tsx`                                            |
| Readiness | T4-SEL-02 | ThemeSelector option    | `data-testid="theme-option-kanagawa-dragon"` が存在 | `ThemeSelector.test.tsx`                                            |
| Readiness | T4-SEL-03 | Auth root               | `data-testid="auth-view"` が存在                    | `AuthView.test.tsx`                                                 |
| Readiness | T4-SEL-04 | Auth panel / helper     | `auth-view-panel`, `auth-view-helper-text` が存在   | `AuthView.test.tsx`                                                 |
| Visual    | TC-11-01  | Settings light          | theme selector / helper text                        | `outputs/phase-11/screenshots/TC-11-01-settings-light.png`          |
| Visual    | TC-11-02  | Dashboard light         | hierarchy / border / readability                    | `outputs/phase-11/screenshots/TC-11-02-dashboard-light.png`         |
| Visual    | TC-11-03  | Auth light              | glass panel / CTA / helper text                     | `outputs/phase-11/screenshots/TC-11-03-auth-light.png`              |
| Visual    | TC-11-04  | WorkspaceSearch light   | input / result row / panel contrast                 | `outputs/phase-11/screenshots/TC-11-04-workspace-search-light.png`  |
| Visual    | TC-11-05  | Dashboard dark baseline | light 比較基準                                      | `outputs/phase-11/screenshots/TC-11-05-dashboard-dark-baseline.png` |
| Doc       | T4-DOC-01 | screenshot coverage     | 5/5 PASS                                            | `validate-phase11-screenshot-coverage.js`                           |
| Doc       | T4-DOC-02 | implementation guide    | guide validator PASS                                | `validate-phase12-implementation-guide.js`                          |

## drift coverage 対応

| Drift 種別            | 監視方法                               | 備考                                             |
| --------------------- | -------------------------------------- | ------------------------------------------------ | ----- | ------------ |
| Hardcoded Color Drift | audit script                           | `bg/text/border-white                            | slate | zinc` を監査 |
| Screenshot Drift      | Phase 11 screenshot plan               | current build static serve + selector capture    |
| Evidence Drift        | manual-test-result / discovered-issues | current / baseline を分離                        |
| Mirror Drift          | Phase 12 drift record                  | `.claude` canonical, `.agents` mirror として記録 |

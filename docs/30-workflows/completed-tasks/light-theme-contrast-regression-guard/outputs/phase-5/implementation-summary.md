# Phase 5 実装サマリー

## 実装方針

本 Phase では UI remediation を混ぜず、guard のための config / audit / capture / readiness 契約だけを追加した。

## 追加ファイル

| ファイル                                                                         | 役割                                                                    |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `apps/desktop/scripts/light-theme-contrast-guard.config.mjs`                     | representative screen と audit 対象を一元管理                           |
| `apps/desktop/scripts/light-theme-contrast-guard.mjs`                            | hardcoded color audit helper / summary / JSON export                    |
| `apps/desktop/scripts/light-theme-contrast-guard.test.ts`                        | audit helper の unit test                                               |
| `apps/desktop/scripts/phase11-static-server.mjs`                                 | Phase 11 capture 用の localhost static server fallback                  |
| `apps/desktop/scripts/phase11-static-server.test.ts`                             | static server fallback の unit test                                     |
| `apps/desktop/scripts/capture-light-theme-contrast-regression-guard-phase11.mjs` | Phase 11 screenshot 5件の capture script                                |
| `apps/desktop/src/renderer/phase11-light-theme-contrast-guard.html`              | current build から配信する harness HTML                                 |
| `apps/desktop/src/renderer/phase11-light-theme-contrast-guard.tsx`               | Settings / Dashboard / Auth / WorkspaceSearch の representative harness |

## 変更ファイル

| ファイル                                                    | 変更内容                                                                          |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `apps/desktop/electron.vite.config.ts`                      | renderer build input に `phase11-light-theme-contrast-guard.html` を追加          |
| `apps/desktop/package.json`                                 | `guard:light-theme-contrast`, `screenshot:light-theme-contrast-guard` を追加      |
| `GlassPanel/index.tsx`                                      | `React.HTMLAttributes<HTMLDivElement>` 継承で `data-testid` を透過                |
| `ThemeSelector/index.tsx`                                   | root / option に `data-testid` を追加                                             |
| `AuthView/index.tsx`                                        | root / panel / helper text に `data-testid` を追加                                |
| `ThemeSelector.test.tsx`                                    | selector readiness assertion を追加                                               |
| `AuthView.test.tsx`                                         | panel / helper readiness assertion を追加                                         |
| `capture-light-theme-contrast-regression-guard-phase11.mjs` | 4173 未起動時に `out/renderer` を auto static serve してから capture するよう改善 |

## 実測結果

| 項目               | 結果                                           |
| ------------------ | ---------------------------------------------- |
| typecheck          | PASS                                           |
| targeted vitest    | 4 files / 48 tests PASS                        |
| build              | PASS                                           |
| audit summary      | `currentViolations=0`, `baselineViolations=64` |
| screenshot capture | 5/5 取得完了                                   |

## supporting artifact

- `outputs/phase-5/light-theme-contrast-audit-report.json`

## スコープ境界

- 実施したこと: guard script、build harness、test id、validator 前提の outputs 導線、Phase 11 static serve fallback
- 実施していないこと: ThemeSelector / AuthView / WorkspaceSearchPanel の配色 remediation
- routing 先: remediation 自体は `task-fix-light-theme-shared-color-migration-001` に委譲

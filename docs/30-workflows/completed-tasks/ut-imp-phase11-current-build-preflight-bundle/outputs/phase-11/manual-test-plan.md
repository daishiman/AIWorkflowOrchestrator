# Phase 11 手動テスト計画

## 実行順

1. `pnpm --filter @repo/desktop build`
2. `node apps/desktop/scripts/phase11-current-build-preflight.mjs --json --write docs/30-workflows/completed-tasks/ut-imp-phase11-current-build-preflight-bundle/outputs/phase-11/preflight-report.json`
3. `pnpm --filter @repo/desktop screenshot:light-theme-contrast-guard`
4. current workflow へ source evidence を集約
5. representative failure path を直列で再現

## 観測点

| 項目             | 合格条件                                  |
| ---------------- | ----------------------------------------- |
| preflight result | 4 bucket pass、`autoServed=true`          |
| metadata         | screenshot metadata に `preflight` がある |
| screenshot       | `TC-11-01`〜`TC-11-05` が存在する         |
| baseUrl fail     | `--no-auto-serve` 時に exit 40            |
| harness fail     | harness 退避時に exit 30                  |
| build fail       | `out/renderer` 退避時に exit 20           |

## テストケース

| テストケース | 種別    | 実行内容                          | 証跡                                                            |
| ------------ | ------- | --------------------------------- | --------------------------------------------------------------- |
| TC-MAN-11-01 | success | build + preflight + screenshot    | `preflight-report.json`, `source-phase11-capture-metadata.json` |
| TC-MAN-11-02 | failure | `--no-auto-serve` で baseUrl fail | `failure-baseurl-unreachable.json`                              |
| TC-MAN-11-03 | failure | harness file 一時退避             | `failure-harness-missing.json`                                  |
| TC-MAN-11-04 | failure | `out/renderer` 一時退避           | `failure-build-missing.json`                                    |

## 画面観測対象

| 画面                  | 目的                                           | 証跡                                               |
| --------------------- | ---------------------------------------------- | -------------------------------------------------- |
| Settings light        | preflight 実装で UI regress が出ていないか確認 | `screenshots/TC-11-01-settings-light.png`          |
| Dashboard light       | representative shell hierarchy 確認            | `screenshots/TC-11-02-dashboard-light.png`         |
| Auth light            | helper text / CTA readability 確認             | `screenshots/TC-11-03-auth-light.png`              |
| WorkspaceSearch light | contrast baseline note 確認                    | `screenshots/TC-11-04-workspace-search-light.png`  |
| Dashboard dark        | baseline comparison                            | `screenshots/TC-11-05-dashboard-dark-baseline.png` |

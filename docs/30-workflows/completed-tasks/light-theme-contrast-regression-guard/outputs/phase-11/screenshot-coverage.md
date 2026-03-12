# Phase 11 Screenshot Coverage

## coverage summary

| 項目                  | 値  |
| --------------------- | --- |
| planned TC            | 5   |
| captured png          | 5   |
| metadata              | 1   |
| validator expectation | 5/5 |

## TC ↔ png 対応

| TC-ID    | png                                                | selector                 | metadata status | 判定 |
| -------- | -------------------------------------------------- | ------------------------ | --------------- | ---- |
| TC-11-01 | `screenshots/TC-11-01-settings-light.png`          | `settings-view`          | recorded        | PASS |
| TC-11-02 | `screenshots/TC-11-02-dashboard-light.png`         | `dashboard-view`         | recorded        | PASS |
| TC-11-03 | `screenshots/TC-11-03-auth-light.png`              | `auth-view-panel`        | recorded        | PASS |
| TC-11-04 | `screenshots/TC-11-04-workspace-search-light.png`  | `workspace-search-panel` | recorded        | PASS |
| TC-11-05 | `screenshots/TC-11-05-dashboard-dark-baseline.png` | `dashboard-view`         | recorded        | PASS |

## source pinning

- metadata file: `screenshots/phase11-capture-metadata.json`
- screenshot plan: `screenshot-plan.json`
- assetEntries は 4 件で metadata に保存済み

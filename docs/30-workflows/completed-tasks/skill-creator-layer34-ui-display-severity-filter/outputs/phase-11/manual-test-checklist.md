# Manual Test Checklist — UT-SDK-L34-UI-DISPLAY-SEVERITY-FILTER-001 (Phase 11)

| テストケース | 観点                              | 実施結果                     | 証跡                                                                           |
| ------------ | --------------------------------- | ---------------------------- | ------------------------------------------------------------------------------ |
| TC-11-01     | Default all state in light theme. | PASS (current build capture) | `outputs/phase-11/screenshots/TC-11-01-severity-filter-all-light.png`          |
| TC-11-02     | warning+ state in light theme.    | PASS (current build capture) | `outputs/phase-11/screenshots/TC-11-02-severity-filter-warning-plus-light.png` |
| TC-11-03     | error-only state in light theme.  | PASS (current build capture) | `outputs/phase-11/screenshots/TC-11-03-severity-filter-error-light.png`        |
| TC-11-04     | Default all state in dark theme.  | PASS (current build capture) | `outputs/phase-11/screenshots/TC-11-04-severity-filter-all-dark.png`           |

## 備考

- current build の visual capture を entry-point route から取得した。
- 4 ケースとも verify detail の severity フィルタが期待通りに表示された。

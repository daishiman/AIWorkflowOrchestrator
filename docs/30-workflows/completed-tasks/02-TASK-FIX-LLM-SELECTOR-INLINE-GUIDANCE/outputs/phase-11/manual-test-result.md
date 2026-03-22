# Phase 11 Manual Test Result

| TC-ID    | 結果 | 証跡                                                                                | 自動確認                                                       | 備考                                           |
| -------- | ---- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------- |
| TC-11-01 | PASS | `outputs/phase-11/screenshots/TC-11-01-chatview-inline-guidance-light.png`          | `phase11-capture-metadata.json` の `navigationToSettings=true` | ChatView で banner 文言と CTA を確認           |
| TC-11-02 | PASS | `outputs/phase-11/screenshots/TC-11-02-workspace-guidance-blocked-light.png`        | `phase11-capture-metadata.json` の `navigationToSettings=true` | Workspace blocked guidance の CTA を確認       |
| TC-11-03 | PASS | `outputs/phase-11/screenshots/TC-11-03-chatview-inline-guidance-dark.png`           | `phase11-capture-metadata.json` の `navigationToSettings=true` | dark theme の representative screenshot を保存 |
| TC-11-04 | PASS | `outputs/phase-11/screenshots/TC-11-04-chatview-inline-guidance-keyboard-focus.png` | `phase11-capture-metadata.json` の `keyboardFocus=true`        | CTA の keyboard focus を確認                   |

## 補助証跡

- screenshot plan: `docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/outputs/phase-11/screenshot-plan.json`
- metadata: `docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/outputs/phase-11/screenshots/phase11-capture-metadata.json`

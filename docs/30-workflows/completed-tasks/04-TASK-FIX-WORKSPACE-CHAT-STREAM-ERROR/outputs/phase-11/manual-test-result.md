# Phase 11 Manual Test Result

| TC-ID    | 結果 | 証跡                                                                         | 自動確認                                                        | 備考                                            |
| -------- | ---- | ---------------------------------------------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------- |
| TC-11-01 | PASS | `outputs/phase-11/screenshots/TC-11-01-settings-cta-light.png`               | `phase11-capture-metadata.json` の `errorCode=API_KEY_MISSING`  | Settings CTA 表示、retry CTA 非表示を確認       |
| TC-11-02 | PASS | `outputs/phase-11/screenshots/TC-11-02-retry-cta-light.png`                  | `phase11-capture-metadata.json` の `errorCode=NETWORK_ERROR`    | Retry CTA 表示を確認                            |
| TC-11-03 | PASS | `outputs/phase-11/screenshots/TC-11-03-rate-limit-hint-dark.png`             | `phase11-capture-metadata.json` の `errorCode=RATE_LIMIT`       | hint と Retry CTA の同時表示を確認              |
| TC-11-04 | PASS | `outputs/phase-11/screenshots/TC-11-04-dismissed-error-light.png`            | `phase11-capture-metadata.json` の `errorCode=NETWORK_ERROR`    | dismiss 後に alert が消え、入力面が回復している |
| TC-11-05 | PASS | `outputs/phase-11/screenshots/TC-11-05-validation-error-no-actions-dark.png` | `phase11-capture-metadata.json` の `errorCode=VALIDATION_ERROR` | CTA なしの non-action error を確認              |

## 補助証跡

- screenshot plan: `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/outputs/phase-11/screenshot-plan.json`
- metadata: `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/outputs/phase-11/screenshots/phase11-capture-metadata.json`

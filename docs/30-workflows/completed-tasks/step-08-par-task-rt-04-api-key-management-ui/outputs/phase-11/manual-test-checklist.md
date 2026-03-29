# Manual Test Checklist — TASK-RT-04 (Phase 11)

| テストケース | 観点                        | 実施結果                     | 証跡                                              |
| ------------ | --------------------------- | ---------------------------- | ------------------------------------------------- |
| TC-11-01     | 初期表示                    | PASS (current build capture) | `screenshots/TC-11-01-skill-authkey-initial.png`  |
| TC-11-02     | 保存成功または Settings CTA | PASS (current build capture) | `screenshots/TC-11-02-skill-authkey-action.png`   |
| TC-11-03     | env-fallback または error   | PASS (current build capture) | `screenshots/TC-11-03-skill-authkey-fallback.png` |

## 備考

- `apps/desktop/scripts/capture-task-rt-04-api-key-management-ui-phase11.mjs` により current build 再撮影を固定化した。

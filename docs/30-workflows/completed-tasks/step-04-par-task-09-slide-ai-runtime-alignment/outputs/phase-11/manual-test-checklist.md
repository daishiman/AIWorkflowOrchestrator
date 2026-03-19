# Phase 11: 手動テストチェックリスト

## メタ情報

| 項目     | 内容                                      |
| -------- | ----------------------------------------- |
| タスクID | TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001   |
| Phase    | 11                                        |
| 実施日   | 2026-03-19                                |
| 実施方式 | static fallback capture + code/spec audit |

## チェックリスト

| TC-ID    | シナリオ            | 判定    | 証跡                                                        | 備考                                                                    |
| -------- | ------------------- | ------- | ----------------------------------------------------------- | ----------------------------------------------------------------------- |
| TC-11-01 | empty state         | PASS    | `screenshots/TC-11-01-slide-workspace-empty-state.png`      | open CTA と empty surface は確認できた                                  |
| TC-11-02 | synced state        | PARTIAL | `screenshots/TC-11-02-slide-workspace-synced-state.png`     | project path と sync badge はあるが runtime/auth/watch surface は未反映 |
| TC-11-03 | out-of-sync CTA     | PARTIAL | `screenshots/TC-11-03-slide-workspace-manual-sync-cta.png`  | manual sync button はあるが reverse-sync 命名・guidance は未反映        |
| TC-11-04 | running progress    | PARTIAL | `screenshots/TC-11-04-slide-workspace-running-progress.png` | progress/cancel は確認できたが direction/watch/runtime の補助情報はない |
| TC-11-05 | degraded / guidance | PARTIAL | `screenshots/TC-11-05-slide-workspace-sync-error.png`       | error alert はあるが degraded guidance / terminal launcher は未反映     |

## 補助情報

- screenshot plan: `outputs/phase-11/screenshot-plan.json`
- capture metadata: `outputs/phase-11/screenshots/phase11-capture-metadata.json`
- fallback reason: esbuild native binary mismatch により live preview capture を断念し、current code 由来の static harness で代替

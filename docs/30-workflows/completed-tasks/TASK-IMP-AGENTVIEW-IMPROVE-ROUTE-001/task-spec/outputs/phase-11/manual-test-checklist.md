# Phase 11: 手動テストチェックリスト

## メタ情報

| 項目     | 内容                                    |
| -------- | --------------------------------------- |
| タスクID | TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001    |
| Phase    | 11                                      |
| 実施日   | 2026-03-20                              |
| 実施方式 | Playwright harness + App 実画面 capture |

## チェックリスト

| TC-ID    | シナリオ      | 判定 | 証跡                                                        | 備考                                     |
| -------- | ------------- | ---- | ----------------------------------------------------------- | ---------------------------------------- |
| TC-11-01 | CTA visible   | PASS | `screenshots/TC-11-01-agent-cta-visible-light.png`          | selected skill と CTA が同時に視認できる |
| TC-11-02 | CTA hidden    | PASS | `screenshots/TC-11-02-agent-cta-hidden-light.png`           | 未選択時に CTA が出ない                  |
| TC-11-03 | CTA handoff   | PASS | `screenshots/TC-11-03-skill-analysis-from-agent-light.png`  | `skill-alpha` heading と戻る導線を確認   |
| TC-11-04 | navigate back | PASS | `screenshots/TC-11-04-agent-return-from-analysis-light.png` | Agent 復帰後も `skill-alpha` 選択維持    |
| TC-11-05 | rerun handoff | PASS | `screenshots/TC-11-05-agent-rerun-from-analysis-light.png`  | Agent 復帰後も CTA と再実行状態を維持    |
| TC-11-06 | dark theme    | PASS | `screenshots/TC-11-06-agent-cta-visible-dark.png`           | dark token で視認性維持                  |

## 補助情報

- screenshot plan: `outputs/phase-11/screenshot-plan.json`
- capture metadata: `outputs/phase-11/screenshots/phase11-capture-metadata.json`
- visual review: `outputs/phase-11/ui-sanity-visual-review.md`

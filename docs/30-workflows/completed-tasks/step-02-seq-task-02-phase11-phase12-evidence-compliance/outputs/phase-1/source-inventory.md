# Source Inventory

| ソース                  | パス                                                                                                                | 観測した問題                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| issue 原票              | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task-sdk-02-phase11-phase12-evidence-compliance-001.md` | implementation guide と manual test evidence の欠落を明示         |
| parent Phase 11         | `docs/30-workflows/step-02-seq-task-02-workflow-engine-runtime-orchestration/phase-11-manual-test.md`               | TC-ID と coverage matrix が存在しない                             |
| parent outputs phase-11 | `docs/30-workflows/step-02-seq-task-02-workflow-engine-runtime-orchestration/outputs/phase-11/`                     | checklist / result が証跡追跡に不十分、placeholder PNG 依存       |
| parent Phase 12         | `docs/30-workflows/step-02-seq-task-02-workflow-engine-runtime-orchestration/phase-12-documentation.md`             | 6成果物の役割分離と Task 12-1〜12-5 判定が弱い                    |
| parent outputs phase-12 | `docs/30-workflows/step-02-seq-task-02-workflow-engine-runtime-orchestration/outputs/phase-12/`                     | implementation guide が validator 未達、compliance が存在確認寄り |

## 一次結論

- 主問題は「validator PASS」と「human-authored evidence 完了」の混同
- 最小修正は runtime code ではなく parent workflow の Phase 11 / 12 docs と outputs の是正

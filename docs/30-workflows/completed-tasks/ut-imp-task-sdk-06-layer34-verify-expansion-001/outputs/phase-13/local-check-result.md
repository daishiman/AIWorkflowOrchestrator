# Local Check Result

| チェック                                                                            | 結果 | 備考                                                  |
| ----------------------------------------------------------------------------------- | ---- | ----------------------------------------------------- |
| `validate-phase-output.js`                                                          | PASS | 32項目パス、0エラー、0警告                            |
| `verify-all-specs.js --json`                                                        | PASS | 13/13 phase pass、warnings 0、info 2                  |
| `verify-unassigned-links.js --source outputs/phase-12/unassigned-task-detection.md` | PASS | task-local links なし                                 |
| `verify-unassigned-links.js --source task-workflow-backlog.md`                      | FAIL | missing 23。baseline 既存不整合で今回差分起因ではない |

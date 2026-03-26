# QA Summary

| risk                    | mitigation                                              |
| ----------------------- | ------------------------------------------------------- |
| canonical target 漏れ   | current canonical set を先に固定                        |
| ledger / lessons 片落ち | same-wave lane を分離しない                             |
| parentWorkflow stale    | `artifacts.json` と `outputs/artifacts.json` を同時更新 |
| mirror parity 漏れ      | validator 後に parity 確認                              |

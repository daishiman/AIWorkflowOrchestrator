# Phase 6 Blocker Handling Cases

| ケース                              | 判定                | 対応                          |
| ----------------------------------- | ------------------- | ----------------------------- |
| `esbuild` mismatch                  | 既存 blocker 再利用 | 新規 formalize しない         |
| repo baseline unassigned violations | baseline 扱い       | current fail と混同しない     |
| parent status drift                 | current 修正対象    | follow-up workflow で即時是正 |

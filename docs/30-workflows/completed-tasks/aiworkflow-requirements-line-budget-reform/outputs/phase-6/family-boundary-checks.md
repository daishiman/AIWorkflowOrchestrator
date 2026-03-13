# Phase 6 Output: Family Boundary Checks

## 実測

| 観点                                   |  値 | 判定 |
| -------------------------------------- | --: | ---- |
| parent files with `仕様書インデックス` |  34 | PASS |
| child files with backlink              | 178 | PASS |
| `task-workflow` child count            |  14 | PASS |
| `lessons-learned` child count          |  24 | PASS |

## family boundary 判定

| family | 判定 | 根拠                                                                          |
| ------ | ---- | ----------------------------------------------------------------------------- |
| F1     | PASS | `LOGS` / `lessons` / `task-workflow` が parent index + archive / child へ分離 |
| F2     | PASS | rulebook docs が companion 化され、parent は index 役へ縮退                   |
| F3     | PASS | architecture parent と surface / reference / history が分離                   |
| F4     | PASS | contract parent と IPC/type/history child が分離                              |
| F5     | PASS | UI parent と surface / history child が分離                                   |
| F6     | PASS | support parent と target / history child が分離                               |

## 補足

- single H2 section が 500 行を超える場合は child 側で追加分割した
- history / archive の責務は parent から 1 段で到達できる形を維持した

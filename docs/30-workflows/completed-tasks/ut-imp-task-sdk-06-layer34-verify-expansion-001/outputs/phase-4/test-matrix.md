# Test Matrix

| ID   | 種別        | 対象                | コマンド / 確認方法                                              | 期待結果                                                 |
| ---- | ----------- | ------------------- | ---------------------------------------------------------------- | -------------------------------------------------------- |
| T-01 | unit        | shared DTO          | `pnpm vitest packages/shared/src/types`                          | Layer 3 / Layer 4 verify DTO が型として成立する          |
| T-02 | unit        | renderer section    | `pnpm vitest apps/desktop/src/renderer/components/skill`         | section host と action disabled 条件が確認できる         |
| T-03 | integration | main IPC / preload  | `pnpm vitest apps/desktop/src/main/ipc apps/desktop/src/preload` | payload / response / preload method が一致する           |
| T-04 | integration | runtime service     | `pnpm vitest apps/desktop/src/main/services/runtime`             | facade / engine mapping と re-verify bridge が確認できる |
| T-05 | docs QA     | sibling boundary    | 文書レビュー                                                     | Task07 / Task08 owner 侵食がない                         |
| T-06 | manual      | detail traceability | `outputs/phase-11/manual-test-checklist.md` に基づく walkthrough | Layer 3 / Layer 4 section を trace できる                |

## regression focus

- approval / disclosure を verify DTO へ混入させない
- persistence / resume invalidation を re-verify action へ混入させない
- route priority を renderer local rule にしない

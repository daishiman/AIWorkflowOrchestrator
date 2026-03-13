# Phase 1 受入基準

| AC   | 判定内容                                                                                     | 実装/検証方針                               |
| ---- | -------------------------------------------------------------------------------------------- | ------------------------------------------- |
| AC-1 | preflight bundle 名、CLI 入口、JSON 出力先が 1 つに固定される                                | shared core + thin wrapper + package script |
| AC-2 | `native` / `build` / `harness` / `baseUrl` を機械判定できる                                  | core unit test と CLI smoke                 |
| AC-3 | capture script が preflight 結果を消費し、失敗時に guidance を表示する                       | metadata 連携 + fail fast                   |
| AC-4 | success、native mismatch、build missing、harness missing、baseUrl unreachable のテストが揃う | Phase 4 / 6 で固定                          |
| AC-5 | workflow 文書と system spec が同じ bundle 名を参照する                                       | Phase 12 同期                               |
| AC-6 | Phase 12 の未タスク監査で current と baseline を分離記録する                                 | `audit-unassigned-tasks` を二軸記録         |

## 完了判定コマンド

| コマンド                                                                                                                                                                         | 目的                        |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| `pnpm --filter @repo/desktop exec vitest run scripts/phase11-current-build-preflight-core.test.ts scripts/phase11-current-build-preflight.test.ts`                               | targeted test               |
| `pnpm --filter @repo/desktop build`                                                                                                                                              | current build artifact 確認 |
| `node apps/desktop/scripts/phase11-current-build-preflight.mjs --json`                                                                                                           | preflight 実行確認          |
| `pnpm --filter @repo/desktop screenshot:light-theme-contrast-guard`                                                                                                              | capture 連携確認            |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/ut-imp-phase11-current-build-preflight-bundle --strict` | workflow 仕様検証           |

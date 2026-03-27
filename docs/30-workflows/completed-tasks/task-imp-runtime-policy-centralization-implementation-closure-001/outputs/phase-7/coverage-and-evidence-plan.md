# Phase 7 Coverage And Evidence Plan

## AC と証跡の対応

| AC   | 主証跡                                                  | 補助証跡                                    |
| ---- | ------------------------------------------------------- | ------------------------------------------- |
| AC-1 | `index.ts`, `agentHandlers.ts`, `skillHandlers.ts` diff | `typecheck` PASS                            |
| AC-2 | runtime tests 2本                                       | existing baseline suites                    |
| AC-3 | shared/preload no-op 判定                               | `shared-contract-sync-plan.md`, code review |
| AC-4 | `cleanup-sequencing.md`                                 | backlog / completed ledger sync             |
| AC-5 | targeted vitest commands                                | regression matrix                           |
| AC-6 | final review decision / phase12 outputs                 | canonical workflow sync                     |

## 実行コマンド

| コマンド                                                                                                                                                 | 役割                             |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `pnpm install --force`                                                                                                                                   | 検証環境の esbuild 復旧          |
| `pnpm --filter @repo/shared build`                                                                                                                       | `@repo/shared` dist 復旧         |
| `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/agentHandlers.runtime.test.ts src/main/ipc/__tests__/skillHandlers.runtime.test.ts`  | main diff の runtime branch 検証 |
| `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/agentHandlers.test.ts`                                                               | agent baseline regression        |
| `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/skillHandlers.execute.test.ts src/main/ipc/__tests__/skillHandlers.contract.test.ts` | skill baseline regression        |
| `pnpm --filter @repo/desktop typecheck`                                                                                                                  | DI / import / 型整合             |

## 未検証として残すもの

- `AI_CHECK_CONNECTION` の削除後挙動
- slide / chat-edit lane の deprecated `RuntimeResolver` 移行
- sanitize helper の配置最終判断

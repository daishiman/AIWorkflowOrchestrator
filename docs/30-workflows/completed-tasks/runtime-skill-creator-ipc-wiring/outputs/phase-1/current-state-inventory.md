# Phase 1 現状棚卸し

## 着手時に確認した差分

| 項目                | 着手時の観測                                                | 改善対象                                                              |
| ------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------- |
| public channel 定義 | runtime 3 操作が `IPC_CHANNELS` と whitelist に未反映       | `apps/desktop/src/preload/channels.ts`                                |
| preload API         | runtime 3 操作の Renderer API が未公開                      | `apps/desktop/src/preload/skill-creator-api.ts`                       |
| shared contract     | runtime request / response DTO が不足                       | `packages/shared/src/types/skillCreator.ts`                           |
| public entrypoint   | runtime handler が `skillCreatorHandlers.ts` から分離       | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                   |
| DI 経路             | runtime facade を main process から public に渡す経路が不足 | `apps/desktop/src/main/ipc/index.ts`                                  |
| fallback            | service 不在時に handler 消失へ寄りやすい                   | `apps/desktop/src/main/ipc/creatorHandlers.ts`                        |
| auth fallback       | `api-key` mode で `apiKey` 未指定時の扱いが不安定           | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` |

## 主要ファイル一覧

| ファイル                                            | 役割                             |
| --------------------------------------------------- | -------------------------------- |
| `apps/desktop/src/preload/channels.ts`              | public channel / whitelist 定義  |
| `apps/desktop/src/preload/skill-creator-api.ts`     | Renderer 向け public preload API |
| `packages/shared/src/types/skillCreator.ts`         | main / preload 共通型            |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`      | runtime public helper            |
| `apps/desktop/src/main/ipc/skillCreatorHandlers.ts` | public skill-creator entrypoint  |
| `apps/desktop/src/main/ipc/index.ts`                | handler registration / DI        |

## 依存関係メモ

- runtime public IPC は `SkillExecutor` と `authKeyService` に依存する
- `RuntimeSkillCreatorFacade` は `integrated_api` と `terminal_handoff` の両分岐を持つ
- public namespace の正本は `api-ipc-agent-core.md` と `security-electron-ipc-details.md`

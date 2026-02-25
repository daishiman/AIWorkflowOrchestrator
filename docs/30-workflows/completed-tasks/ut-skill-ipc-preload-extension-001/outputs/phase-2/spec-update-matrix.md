# Phase 2 仕様更新マトリクス

## task-9更新ルール（Task 2-4）

| task | artifacts.modifies に追加                                                                                            | artifacts.creates に追加                       |
| ---- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| 9D   | `apps/desktop/src/preload/channels.ts`, `apps/desktop/src/preload/skill-api.ts`, `apps/desktop/src/preload/types.ts` | `packages/shared/src/types/skill/chain.ts`     |
| 9E   | 同上3ファイル                                                                                                        | `packages/shared/src/types/skill/fork.ts`      |
| 9F   | 同上3ファイル                                                                                                        | `packages/shared/src/types/skill/share.ts`     |
| 9G   | 同上3ファイル                                                                                                        | `packages/shared/src/types/skill/schedule.ts`  |
| 9H   | 同上3ファイル                                                                                                        | `packages/shared/src/types/skill/debug.ts`     |
| 9I   | 同上3ファイル                                                                                                        | `packages/shared/src/types/skill/docs.ts`      |
| 9J   | 同上3ファイル                                                                                                        | `packages/shared/src/types/skill/analytics.ts` |

## 実装順序（依存順）

1. 9D（基礎契約）
2. 9E（独立機能）
3. 9F（import競合解消済み前提）
4. 9G（スケジューラ）
5. 9H（唯一onチャネルを含む）
6. 9I（ドキュメント出力）
7. 9J（分析）

## 注意事項

- 一部旧仕様は `apps/desktop/src/main/ipc/channels.ts` を参照しているが、現行実体は `apps/desktop/src/preload/channels.ts`。
- パス差分は Phase 3 でギャップ管理し、Phase 5 更新手順で是正する。

## SubAgentレビュー

- SubAgent-D主担当: 更新方針統合。
- SubAgent-A/B/C: task別対象の妥当性をレビューし承認。

## 完了状態

- Phase 2 Task 2-4: Completed

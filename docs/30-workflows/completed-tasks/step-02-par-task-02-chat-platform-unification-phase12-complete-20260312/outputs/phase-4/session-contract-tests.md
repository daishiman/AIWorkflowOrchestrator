# Session Contract Tests

| テストファイル                                                       | 確認内容                                                       |
| -------------------------------------------------------------------- | -------------------------------------------------------------- |
| `packages/shared/src/types/__tests__/chat-platform.test.ts`          | mode enum, title helper, non-persist key, handoff/revive shape |
| `apps/desktop/src/renderer/features/chat-platform/contracts.test.ts` | Workspace attachments, request build, revive snapshot          |
| `apps/desktop/src/renderer/navigation/skillLifecycleJourney.test.ts` | lifecycle handoff helper, allowed source surface               |

## 期待

- shared contract が renderer 層に依存せず成立する。
- Workspace / Lifecycle が別々の payload 生成規則を持っても同じ型へ着地する。

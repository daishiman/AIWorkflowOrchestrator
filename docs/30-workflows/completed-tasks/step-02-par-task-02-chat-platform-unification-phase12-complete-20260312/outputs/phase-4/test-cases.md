# Test Cases

| TC-ID    | 対象                    | 種別              | 期待結果                                                         |
| -------- | ----------------------- | ----------------- | ---------------------------------------------------------------- |
| TC-11-01 | general chat            | contract + manual | `chat-view` が current UX を維持し、shared mode 語彙と矛盾しない |
| TC-11-02 | workspace handoff       | unit + manual     | attachments / summary / title が payload 化される                |
| TC-11-03 | skill-lifecycle handoff | unit + manual     | allowed surface のみ handoff 可、skill attachment が残る         |
| TC-11-04 | revive                  | unit + manual     | revive snapshot は会話 metadata のみを復元する                   |
| TC-11-05 | streaming cancel        | unit + manual     | overlay reset 後に非永続 state が空になる                        |

## 実行コマンド

- `pnpm --filter @repo/desktop typecheck`
- `pnpm --filter @repo/desktop exec vitest run src/renderer/features/chat-platform/contracts.test.ts src/renderer/navigation/skillLifecycleJourney.test.ts src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx src/renderer/store/slices/chatSlice.test.ts`
- `pnpm --filter @repo/shared exec vitest run src/types/__tests__/chat-platform.test.ts`

# Mode Transition Tests

| 遷移                                      | 自動テスト                                                       | 手動確認   |
| ----------------------------------------- | ---------------------------------------------------------------- | ---------- |
| `general -> executing`                    | `chatSlice.test.ts`                                              | `TC-11-01` |
| `workspace -> handoff-built -> persisted` | `contracts.test.ts` + workspace controller integration           | `TC-11-02` |
| `skill-lifecycle -> handoff-built`        | `skillLifecycleJourney.test.ts` / `SkillLifecyclePanel.test.tsx` | `TC-11-03` |
| `persisted -> revived`                    | `contracts.test.ts` / shared revive test                         | `TC-11-04` |
| `executing -> overlay-reset`              | `chatSlice.test.ts`                                              | `TC-11-05` |

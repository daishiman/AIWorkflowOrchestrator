# Phase 11 証跡インデックス

| ID    | 種別           | 証跡                                                                                                                                                                                                    | 要点                                         |
| ----- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| EV-01 | テスト         | `pnpm --filter @repo/desktop test:run src/renderer/store/slices/authSlice.test.ts src/main/ipc/profileHandlers.test.ts src/renderer/components/organisms/AccountSection/AccountSection.portal.test.tsx` | 3 files / 169 tests PASS                     |
| EV-02 | 型検証         | `pnpm --filter @repo/desktop typecheck`                                                                                                                                                                 | 型整合 PASS                                  |
| EV-03 | Main契約       | `apps/desktop/src/main/ipc/profileHandlers.ts`                                                                                                                                                          | `getProviders` が配列契約を返す              |
| EV-04 | Renderer契約   | `apps/desktop/src/renderer/store/slices/authSlice.ts`                                                                                                                                                   | malformed `linkedProviders` を防御的に正規化 |
| EV-05 | 画面証跡       | `outputs/phase-11/screenshots/TC-11-UI-01-root-navigation.png`                                                                                                                                          | ルート画面の導線と情報階層確認               |
| EV-06 | 画面証跡       | `outputs/phase-11/screenshots/TC-11-UI-02-skill-center-view.png`                                                                                                                                        | Skill Center 一覧の可読性確認                |
| EV-07 | 画面証跡       | `outputs/phase-11/screenshots/TC-11-UI-03-ui-design-foundation.png`                                                                                                                                     | UI Foundation 画面の視認性確認               |
| EV-08 | カバレッジ検証 | `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/04-TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001`                   | PASS（expected TC=3 / covered TC=3）         |

## 補足

- 本タスクは契約修正中心だが、ユーザー要求に合わせて視覚証跡を追加し回帰を確認した。
- 画面証跡は `apps/desktop/scripts/capture-electron-sandbox-iterable-phase11.mjs` で再生成可能。

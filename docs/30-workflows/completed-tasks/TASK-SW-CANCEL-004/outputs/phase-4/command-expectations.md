# Phase 4: コマンド期待値

## タスクID: TASK-SW-CANCEL-004

## 依存関係整合チェック

```bash
pnpm install --frozen-lockfile
pnpm --filter @repo/shared build
pnpm --filter @repo/desktop test -- useCancelGeneration
```

## コマンド期待値

| コマンド                                                      | 期待結果                           |
| ------------------------------------------------------------- | ---------------------------------- |
| `pnpm --filter @repo/desktop test -- useCancelGeneration`     | 既存 4 件 + E2E 4 件 = 8 件全 pass |
| `pnpm --filter @repo/desktop test -- useCancelGeneration.e2e` | E2E 4 件全 pass                    |
| `pnpm --filter @repo/desktop typecheck`                       | エラー 0 件                        |

## Red/Green 進行条件

- E2E テストが Green → Phase 5 で SkillCreateWizard.tsx の Pattern B 修正のみ実施
- E2E テストが Red → 原因調査後に Phase 5 で修正

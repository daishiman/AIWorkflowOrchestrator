# Phase 6: Expanded Test Result

## 回帰観点

| concern                  | guard                                 |
| ------------------------ | ------------------------------------- |
| shared dual output 崩れ  | `build-verification.test.ts`          |
| preload externalize 再発 | `preload-bundle-verification.test.ts` |
| Electron ABI 導線欠落    | `native-module-verification.test.ts`  |
| lint / type drift        | `pnpm lint`, `pnpm typecheck`         |

## 結果

- shared guard: PASS (8/8)
- desktop guard: PASS (19/19)
- static checks: PASS

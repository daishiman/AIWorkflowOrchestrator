# Phase 1 受け入れ基準

## 判定基準

| AC    | 受け入れ基準                                                  | 検証方法                      | 結果 |
| ----- | ------------------------------------------------------------- | ----------------------------- | ---- |
| AC-01 | `skill:import` で空文字/空白/型不正を拒否し `ERR_1001` を返す | `skillHandlers.share.test.ts` | PASS |
| AC-02 | 未許可 sender 呼び出しを拒否し `ERR_2004` を返す              | `skillHandlers.share.test.ts` | PASS |
| AC-03 | 内部例外を `INTERNAL_ERROR` + `ERR_5001` に正規化             | `skillHandlers.share.test.ts` | PASS |
| AC-04 | `import()` 導線で `importFromSource` を呼ばない               | `skill-api.contract.test.ts`  | PASS |
| AC-05 | share 3チャネルが preload whitelist に含まれる                | `skill-api.contract.test.ts`  | PASS |
| AC-06 | 主要対象テストが全件成功（94 tests）                          | Vitest 実行                   | PASS |
| AC-07 | 型検査が成功する                                              | `pnpm typecheck`              | PASS |

## 実行証跡（2026-03-05）

- `pnpm vitest run src/main/ipc/__tests__/skillHandlers.share.test.ts` → 34/34 PASS
- `pnpm vitest run src/preload/__tests__/skill-api.contract.test.ts` → 60/60 PASS
- `pnpm typecheck` → PASS

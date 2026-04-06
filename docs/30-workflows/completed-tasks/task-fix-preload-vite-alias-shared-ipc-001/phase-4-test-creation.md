# Phase 4: テスト作成

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 4                                          |
| 機能名 | TASK-FIX-PRELOAD-VITE-ALIAS-SHARED-IPC-001 |
| 作成日 | 2026-03-31                                 |

## テスト観点

| テストID | 観点                                                                  | 修正前 | 修正後 |
| -------- | --------------------------------------------------------------------- | ------ | ------ |
| T-01     | `out/preload/index.js` に shared channel の `require()` が残らない    | FAIL   | PASS   |
| T-02     | `out/preload/index.js` に `skill:list` が残る                         | PASS   | PASS   |
| T-03     | `pnpm --filter @repo/desktop build`                                   | PASS   | PASS   |
| T-04     | targeted vitest（`skill-api.getDetail-update` / `governance-bundle`） | FAIL   | PASS   |

## Red 条件

- build 側は shared require 残存が Red
- test 側は `@repo/shared/src/ipc/channels` を Vitest が解決できないことが Red

## 成果物

| 成果物       | パス                                    |
| ------------ | --------------------------------------- |
| テスト仕様書 | `outputs/phase-4/test-specification.md` |

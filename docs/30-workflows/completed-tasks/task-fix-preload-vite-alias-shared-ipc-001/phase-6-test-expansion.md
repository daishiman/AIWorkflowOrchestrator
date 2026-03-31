# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 6                                          |
| 機能名 | TASK-FIX-PRELOAD-VITE-ALIAS-SHARED-IPC-001 |
| 作成日 | 2026-03-31                                 |

## 目的

preload build と Vitest alias の両方が shared IPC 正本へ収束していることを確認する。

## 確認観点

- `out/preload/index.js` に shared channel の `require()` が残らない
- `out/preload/index.js` に `skill:list` が残る
- targeted vitest が PASS する
- `governance-bundle.test.ts` に relative path workaround が残らない

## 成果物

| 成果物         | パス                                        |
| -------------- | ------------------------------------------- |
| テスト拡充結果 | `outputs/phase-6/regression-test-result.md` |

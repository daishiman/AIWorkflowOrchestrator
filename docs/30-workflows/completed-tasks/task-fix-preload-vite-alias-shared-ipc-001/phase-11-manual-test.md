# Phase 11: 手動テスト

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 11                                         |
| 機能名 | TASK-FIX-PRELOAD-VITE-ALIAS-SHARED-IPC-001 |
| 作成日 | 2026-03-31                                 |

## 方針

本タスクは UI/UX 変更を含まないため、Phase 11 は NON_VISUAL walkthrough と build/test 実測で確認する。

## 確認項目

- `pnpm --filter @repo/desktop build`
- `rg -c -F "@repo/shared/src/ipc/channels" apps/desktop/out/preload/index.js`
- `rg -c -F "skill:list" apps/desktop/out/preload/index.js`
- `pnpm exec vitest run src/preload/__tests__/skill-api.getDetail-update.test.ts src/main/services/runtime/__tests__/governance-bundle.test.ts`
- `rg -n "../../../../../../../packages/shared/src/ipc/channels" apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts`

## 成果物

| 成果物         | パス                                        |
| -------------- | ------------------------------------------- |
| 手動確認表     | `outputs/phase-11/manual-test-checklist.md` |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md`    |
| 検出課題一覧   | `outputs/phase-11/discovered-issues.md`     |

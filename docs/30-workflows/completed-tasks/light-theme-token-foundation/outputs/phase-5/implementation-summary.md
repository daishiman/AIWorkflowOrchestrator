# Phase 5 成果物: implementation-summary

## 実装サマリー

| 項目       | 内容                                                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 実装対象   | `apps/desktop/src/renderer/styles/tokens.css`                                                                                  |
| 追加テスト | `apps/desktop/src/renderer/styles/tokens.light-theme.contract.test.ts`                                                         |
| 補助実装   | Phase 11 用 harness（`phase11-dashboard.tsx` / `phase11-dashboard.html`）、query theme 対応（`phase11-authguard-timeout.tsx`） |
| 実装日     | 2026-03-11                                                                                                                     |

## 変更内容（token 基盤）

- light theme の `--bg-primary` / `--bg-secondary` / `--bg-tertiary` / `--bg-elevated` を white surface 基準へ変更し、`--text-primary` を black 基準へ固定。
- `--text-tertiary` / `--border-primary` / `--border-color` / `--accent-primary` を light・dark・kanagawa で定義。
- `--bg-hover`、`--status-success-subtle`、`--status-warning-subtle`、`--status-info-subtle`、`--syntax-operator`、`--syntax-punctuation` を追加。
- `globals.css` に light mode compatibility bridge を追加し、renderer 全画面の legacy neutral utility を white / black 基準へ補正。
- fallback なし未定義 token 参照を契約テストで検出できるようにした。

## 実装差分ファイル

| 区分               | ファイル                                                                |
| ------------------ | ----------------------------------------------------------------------- |
| token 実装         | `apps/desktop/src/renderer/styles/tokens.css`                           |
| token 契約テスト   | `apps/desktop/src/renderer/styles/tokens.light-theme.contract.test.ts`  |
| light bridge       | `apps/desktop/src/renderer/styles/globals.css`                          |
| Phase 11 支援      | `apps/desktop/src/renderer/phase11-authguard-timeout.tsx`               |
| Phase 11 支援      | `apps/desktop/src/renderer/phase11-dashboard.tsx`                       |
| Phase 11 支援      | `apps/desktop/src/renderer/phase11-dashboard.html`                      |
| screenshot capture | `apps/desktop/scripts/capture-light-theme-token-foundation-phase11.mjs` |

## 実行結果

| コマンド                                                                                              | 結果            |
| ----------------------------------------------------------------------------------------------------- | --------------- |
| `pnpm --filter @repo/desktop exec vitest run src/renderer/styles/tokens.light-theme.contract.test.ts` | PASS（4 tests） |
| `pnpm --filter @repo/desktop typecheck`                                                               | PASS            |

## スコープ確認

- token 基盤修正に責務を限定し、component 単位の色直書き置換は本タスクに含めない。
- commit / PR は未実施（ユーザー方針を順守）。

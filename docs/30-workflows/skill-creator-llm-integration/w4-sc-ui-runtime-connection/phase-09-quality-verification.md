# Phase 9: 品質検証

## メタ情報

| 項目     | 値                               |
| -------- | -------------------------------- |
| Phase    | 9                                |
| タスクID | TASK-SC-06-UI-RUNTIME-CONNECTION |
| 作成日   | 2026-03-22                       |

## 目的

Lint・TypeScript 型チェック・全テスト実行を行い、UI とバックエンド連携の品質基準を満たしていることを確認する。

## 実行タスク

1. ESLint 実行
   ```bash
   pnpm --filter @repo/desktop lint
   pnpm --filter @repo/shared lint
   ```
2. TypeScript 型チェック実行
   ```bash
   pnpm --filter @repo/desktop typecheck
   pnpm --filter @repo/shared typecheck
   ```
3. 全テスト実行
   ```bash
   pnpm --filter @repo/desktop test
   ```
4. React 固有の問題確認
   - `useEffect` の依存配列に合成 Hook の戻り値関数が含まれていないか（P31対策）
   - 派生セレクタに `useShallow` が適用されているか（P48対策）
5. エラー・警告の修正
   - Lint エラーを全て修正する
   - TypeScript エラーを全て修正する（`any` 型、非 null assertion `!` に注意）
   - テスト失敗を全て修正する
6. 修正後に再度全チェックを実行して PASS を確認

## 参照資料

- Phase 8 リファクタリング済みコード
- `.claude/rules/02-code-quality.md`（TypeScript 型安全）
- `.claude/rules/03-state-management.md`（Zustand 設計原則）
- `CLAUDE.md`（lint, typecheck の実行方法）

## 成果物

- 品質検証結果サマリー
  - Lint: PASS / FAIL（エラー数）
  - TypeCheck: PASS / FAIL（エラー数）
  - Tests: PASS / FAIL（失敗数）

## 完了条件

- [ ] `pnpm --filter @repo/desktop lint` が PASS した
- [ ] `pnpm --filter @repo/shared lint` が PASS した
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS した
- [ ] `pnpm --filter @repo/shared typecheck` が PASS した
- [ ] `pnpm --filter @repo/desktop test` が全テスト PASS した
- [ ] `useEffect` 依存配列に合成 Hook 戻り値関数が含まれていないことを確認した（P31対策）
- [ ] 派生セレクタに `useShallow` が適用されていることを確認した（P48対策）
- [ ] `any` 型が残存していないことを確認した
- [ ] non-null assertion (`!`) の不当使用がないことを確認した

## 次のPhase

Phase 10: 最終レビュー

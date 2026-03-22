# Phase 9: 品質検証

## メタ情報

| 項目     | 値                              |
| -------- | ------------------------------- |
| Phase    | 9                               |
| タスクID | TASK-SC-08-E2E-TERMINAL-HANDOFF |
| 作成日   | 2026-03-22                      |

## 目的

Lint・型チェック・全テスト一括実行・パフォーマンス基準確認の4点で品質を最終検証する。Phase 10 最終レビューに進める状態であることを確認する。

## 実行タスク

1. **ESLint 実行**
   - コマンド: `pnpm --filter @repo/desktop lint`
   - エラー・警告が 0 件であることを確認する

2. **TypeScript 型チェック**
   - コマンド: `pnpm --filter @repo/desktop typecheck`
   - エラー 0 件であることを確認する

3. **全テスト一括実行**
   - コマンド: `cd apps/desktop && pnpm vitest run`（P40対策）
   - E2Eテスト（シナリオA〜E）が全て PASS であることを確認する
   - 拡充テスト（同時実行・大量入力・タイムアウト・セキュリティ）が PASS であることを確認する
   - 既存テストへのリグレッションがないことを確認する

4. **パフォーマンス基準確認**
   - plan 実行時間が 30,000ms 以内であること（モックを使用した場合）
   - execute 実行時間が 120,000ms 以内であること（モックを使用した場合）
   - タイムアウトテストが期待通りに動作すること

5. **セキュリティ品質確認**（NFR-1）
   - エラーメッセージに内部情報が含まれていないこと
   - `suggestedCommand` の文字列形式が安全であること

## 参照資料

- `.claude/rules/02-code-quality.md`
- `.claude/rules/06-known-pitfalls.md` (P40)

## 成果物

- 品質検証結果レポート（Lint / TypeCheck / Test / Performance の各実行結果）

## 完了条件

- [ ] `pnpm --filter @repo/desktop lint` がエラー 0 件で完了している
- [ ] `pnpm --filter @repo/desktop typecheck` がエラー 0 件で完了している
- [ ] 全E2Eテスト（シナリオA〜E + 拡充テスト）が PASS している
- [ ] 既存テストへのリグレッションがないことが確認されている
- [ ] パフォーマンス基準（plan 30秒 / execute 120秒）が確認されている
- [ ] NFR-1（セキュリティ）の確認が完了している

## 次のPhase

Phase 10: 最終レビュー

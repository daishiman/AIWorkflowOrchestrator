# Phase 9: 品質検証

## メタ情報

| 項目     | 値                               |
| -------- | -------------------------------- |
| Phase    | 9                                |
| タスクID | TASK-SC-07-STREAMING-PROGRESS-UI |
| 作成日   | 2026-03-22                       |

## 目的

Lint・型チェック・全テスト実行の3点セットで品質を最終検証し、Phase 10 最終レビューに進める状態であることを確認する。

## 実行タスク

1. **ESLint 実行**
   - コマンド: `pnpm --filter @repo/desktop lint`
   - エラー・警告が 0 件であることを確認する
   - 未使用 import の排除（`no-unused-vars` ルール）

2. **TypeScript 型チェック**
   - コマンド: `pnpm --filter @repo/desktop typecheck`
   - `any` 型・型アサーション（`as`）の不適切な使用がないことを確認する
   - エラー 0 件であることを確認する

3. **全テスト実行**
   - コマンド: `cd apps/desktop && pnpm vitest run` （P40対策: パッケージディレクトリから実行）
   - 新規追加テストが全て PASS であることを確認する
   - 既存テストへの影響がないことを確認する（リグレッション確認）

4. **品質チェックリスト確認**
   - `any` 型が使われていないこと
   - `@ts-ignore` / `@ts-expect-error` が使われていないこと（使う場合は理由コメント必須）
   - 未使用 import がないこと
   - boolean 変数名に `is` / `has` / `can` / `should` プレフィックスが使われていること

## 参照資料

- `.claude/rules/02-code-quality.md`
- `.claude/rules/06-known-pitfalls.md` (P40)

## 成果物

- 品質検証結果レポート（Lint / TypeCheck / Test の各実行結果）

## 完了条件

- [ ] `pnpm --filter @repo/desktop lint` がエラー 0 件で完了している
- [ ] `pnpm --filter @repo/desktop typecheck` がエラー 0 件で完了している
- [ ] 全テストが PASS している（新規・既存ともに）
- [ ] `any` 型・不適切な型アサーションが使われていないことが確認されている
- [ ] 未使用 import が排除されていることが確認されている

## 次のPhase

Phase 10: 最終レビュー

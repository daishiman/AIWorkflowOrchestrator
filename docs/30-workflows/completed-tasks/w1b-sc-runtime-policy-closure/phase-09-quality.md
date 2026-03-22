# Phase 9: 品質検証

## メタ情報

| 項目     | 値                                |
| -------- | --------------------------------- |
| Phase    | 9                                 |
| タスクID | TASK-SC-02-RUNTIME-POLICY-CLOSURE |
| 機能名   | w1b-sc-runtime-policy-closure     |
| 作成日   | 2026-03-22                        |

## 目的

Lint・型チェック・全テスト実行の3セットで品質ゲートを通過する。`RuntimePolicyResolver` の実装が `DEFAULT_CONFIG` への暗黙 fallback を含まないことを静的解析レベルでも確認する。

## 実行タスク

1. `pnpm --filter @repo/desktop lint` を実行し ESLint エラーがないことを確認する
2. `pnpm --filter @repo/desktop typecheck` を実行し TypeScript 型エラーがないことを確認する
3. `pnpm --filter @repo/desktop test` を実行し全テストが PASS することを確認する
4. `pnpm --filter @repo/shared build` を実行し共有パッケージのビルドが通ることを確認する
5. `grep -rn "DEFAULT_CONFIG" apps/desktop/src/main/services/runtime/` を実行し P62 違反がないことを確認する
6. `grep -n "!" apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts` を実行し non-null assertion の残存がないことを確認する（P52対策）
7. 上記いずれかが失敗した場合は原因を特定し修正する

## 参照資料

- `.claude/rules/07-git-and-tooling.md#コミット前チェックリスト`
- `.claude/rules/06-known-pitfalls.md#P62`（DEFAULT_CONFIG fallback 禁止）
- `.claude/rules/06-known-pitfalls.md#P52`（non-null assertion 残存）

## 成果物

- 品質検証結果ログ（各コマンドの実行結果）
- 発見したエラーと修正内容の記録

## 完了条件

- [ ] `pnpm lint` が PASS している
- [ ] `pnpm typecheck` が PASS している
- [ ] 全テストが PASS している
- [ ] `grep -rn "DEFAULT_CONFIG"` で P62 違反がないことが確認されている
- [ ] `grep -n "!"` で non-null assertion の残存がないことが確認されている

## 次のPhase

Phase 10: 最終レビュー

# Phase 9: 品質検証

## メタ情報

| 項目     | 値                        |
| -------- | ------------------------- |
| Phase    | 9                         |
| タスクID | TASK-SC-01-IPC-WIRING-FIX |
| 作成日   | 2026-03-22                |

## 目的

Lint・型チェック・全テスト実行の3セットで品質ゲートを通過する。CI と同一の検証コマンドを手動実行し、コミット前の品質を保証する。

## 実行タスク

1. `pnpm --filter @repo/desktop lint` を実行し ESLint エラーがないことを確認する
2. `pnpm --filter @repo/desktop typecheck` を実行し TypeScript 型エラーがないことを確認する
3. `pnpm --filter @repo/desktop test` を実行し全テストが PASS することを確認する
4. `pnpm --filter @repo/shared build` を実行し共有パッケージのビルドが通ることを確認する
5. 上記いずれかが失敗した場合は原因を特定し修正する
6. `grep -rn "safeInvoke\|safeOn" apps/desktop/src/preload/ | grep -v "IPC_CHANNELS"` を実行し文字列リテラル使用箇所がないことを確認する（P27対策）
7. `grep -rn "creator:" apps/desktop/src/main/ipc/` を実行し dead-end namespace の残存がないことを確認する

## 参照資料

- `.claude/rules/07-git-and-tooling.md#コミット前チェックリスト`
- `.claude/rules/06-known-pitfalls.md#P27`（ハードコード文字列検出）

## 成果物

- 品質検証結果ログ（各コマンドの実行結果）
- 発見したエラーと修正内容の記録

## 完了条件

- [ ] `pnpm lint` が PASS している
- [ ] `pnpm typecheck` が PASS している
- [ ] 全テストが PASS している
- [ ] `grep -rn "creator:"` で dead-end namespace の残存がないことが確認されている
- [ ] 文字列リテラルによるチャネル名指定がないことが確認されている

## 次のPhase

Phase 10: 最終レビュー

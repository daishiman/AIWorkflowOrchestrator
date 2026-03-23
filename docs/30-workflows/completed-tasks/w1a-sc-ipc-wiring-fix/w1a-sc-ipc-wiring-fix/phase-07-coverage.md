# Phase 7: カバレッジ確認

## メタ情報

| 項目     | 値                        |
| -------- | ------------------------- |
| Phase    | 7                         |
| タスクID | TASK-SC-01-IPC-WIRING-FIX |
| 作成日   | 2026-03-22                |

## 目的

`skillCreatorHandlers.ts` 及び `creatorHandlers.ts` のカバレッジが基準値（Line 80%、Branch 60%、Function 80%）を充足していることを確認する。特にハンドラ登録/解除パスのカバレッジを重点的に確認する。

## 実行タスク

1. `pnpm --filter @repo/desktop exec vitest run --coverage src/main/ipc/` を実行する
2. Line Coverage が 80% 以上であることを確認する
3. Branch Coverage が 60% 以上であることを確認する
4. Function Coverage が 80% 以上であることを確認する
5. カバレッジ不足の場合は Phase 6 に戻りテストを追加する
6. カバレッジレポートをスクリーンショット相当のテキストで記録する

## 参照資料

- `docs/30-workflows/skill-creator-llm-integration/01-sc-ipc-wiring-fix/phase-06-test-expansion.md`
- `.claude/rules/02-code-quality.md#カバレッジ基準`
- `.claude/rules/06-known-pitfalls.md#P40`（テスト実行ディレクトリ依存）

## 成果物

- カバレッジ計測結果（数値記録）
- 未達箇所があった場合の Phase 6 へのフィードバックリスト

## 完了条件

- [ ] Line Coverage が 80% 以上である
- [ ] Branch Coverage が 60% 以上である
- [ ] Function Coverage が 80% 以上である
- [ ] カバレッジ計測結果が本ファイルに記録されている
- [ ] 未達の場合は Phase 6 へ戻ることが明示されている

## 次のPhase

Phase 8: リファクタリング（基準達成の場合）
Phase 6: テスト拡充（未達の場合）

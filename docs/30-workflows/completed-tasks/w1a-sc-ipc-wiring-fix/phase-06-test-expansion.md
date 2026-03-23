# Phase 6: テスト拡充

## メタ情報

| 項目     | 値                        |
| -------- | ------------------------- |
| Phase    | 6                         |
| タスクID | TASK-SC-01-IPC-WIRING-FIX |
| 作成日   | 2026-03-22                |

## 目的

Phase 4 で作成したテストのカバレッジ不足箇所を補完する。特にエラーケース（二重登録、未登録チャネル呼び出し）と境界値テストを追加し、Phase 7 のカバレッジ基準（Line 80%、Branch 60%、Function 80%）を達成する。

## 実行タスク

1. 現在のカバレッジを計測し不足箇所を特定する（`pnpm vitest run --coverage`）
2. `ipcMain.handle()` 二重登録時のエラーハンドリングテストを追加する（P5対策）
3. 未登録チャネルを Renderer から呼び出した場合の graceful degradation テストを追加する
4. `unregisterAllIpcHandlers()` が全16チャネルを正確に解除することを確認するテストを追加する
5. 空文字列・スペースのみ・null・undefined など境界値の入力に対するバリデーションテストを追加する
6. `IPC_CHANNELS` 定数が allowlist と完全一致することの回帰テストを追加する
7. v8 カバレッジでインライン arrow function がカウントされる点を考慮したテスト設計を行う（P41対策）

## 参照資料

- `docs/30-workflows/skill-creator-llm-integration/01-sc-ipc-wiring-fix/phase-04-test-creation.md`
- `.claude/rules/06-known-pitfalls.md#P5`（リスナー二重登録）
- `.claude/rules/06-known-pitfalls.md#P41`（v8 カバレッジ）
- `.claude/rules/02-code-quality.md#カバレッジ基準`

## 成果物

- `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.test.ts`（テスト追加）
- カバレッジレポート（追加前後の比較）

## 完了条件

- [ ] 二重登録エラーのテストが追加されている
- [ ] 未登録チャネル呼び出しの graceful degradation テストが追加されている
- [ ] `unregisterAllIpcHandlers()` の解除テストが追加されている
- [ ] 境界値入力（空文字/スペース/null/undefined）のテストが追加されている
- [ ] `pnpm vitest run --coverage` でカバレッジが向上していることが確認されている

## 次のPhase

Phase 7: カバレッジ確認

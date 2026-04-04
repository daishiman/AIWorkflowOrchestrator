# Phase 7: カバレッジ確認

## メタ情報

| 項目     | 値                                                |
| -------- | ------------------------------------------------- |
| Phase    | 7                                                 |
| 機能名   | Advanced Console 実セッションログ接続             |
| タスクID | UT-SAFETY-GOV-SESSION-LOG-SERVICE-INTEGRATION-001 |
| 作成日   | 2026-04-02                                        |

## 目的

変更ファイルのテストカバレッジが基準を満たしていることを確認する。

## カバレッジ基準

| 対象ファイル                                     | Line              | Branch | Function |
| ------------------------------------------------ | ----------------- | ------ | -------- |
| `main/ipc/advancedConsoleHandlers.ts`            | 80%+              | 60%+   | 80%+     |
| `main/claude-cli/ipc-handler.ts`（新規追加部分） | 80%+              | 60%+   | 80%+     |
| `main/ipc/index.ts`（callback 差し替え部分）     | 新規追加行の 70%+ | -      | -        |

## 確認コマンド

```bash
pnpm --filter @repo/desktop test -- --coverage \
  apps/desktop/src/main/ipc/__tests__/advancedConsoleIpc.test.ts

# カバレッジレポートを確認
open apps/desktop/coverage/index.html
```

## カバレッジ確認ポイント

- `getClaudeCliManager()` の null パス（manager = null 時）がカバーされているか
- SESSION_NOT_FOUND を throw するブランチがカバーされているか
- `getCopyCommand` の args なし・あり両方のブランチがカバーされているか

## 完了条件チェックリスト

- [ ] カバレッジ基準を全て満たしていることを確認した
- [ ] 未カバー行がある場合はテストを追加した
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 実行タスク

- coverage を取得する。
- null path と error path の分岐を確認する。

## 参照資料

- `phase-6-test-expansion.md`
- `apps/desktop/src/main/ipc/__tests__/advancedConsoleIpc.test.ts`

## 成果物/実行手順

- coverage report を確認する。
- 未カバー行が残る場合は追加テストを追加し、未カバー行を 0 にする。

## 統合テスト連携

- `apps/desktop/src/main/ipc/__tests__/advancedConsoleIpc.test.ts`

# Phase 7: カバレッジ確認

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 7                                          |
| 機能名 | auth:login IPCハンドラーの非ブロッキング化 |
| 作成日 | 2026-04-01                                 |

## 目的

テストカバレッジを確認し、`auth:login` ハンドラーの修正に対して十分なテストが存在することを検証する。

## 実行タスク

- handler の response time を 500ms 前提で確認する
- provider validation と fire-and-forget 起動のカバレッジを確認する
- orchestrator 側の `AUTH_STATE_CHANGED` は既存 suite で担保する
- `authHandlers.ts` の `auth:login` ハンドラー部分のカバレッジ確認
- 正常パス・異常パスの両方がカバーされていることを確認
- 未カバーのブランチがあれば Phase 6 のテスト拡充に戻る

## カバレッジ確認コマンド

```bash
pnpm --filter @repo/desktop exec vitest run --coverage src/main/ipc/authHandlers.test.ts
pnpm --filter @repo/desktop exec vitest run --coverage src/main/auth/__tests__/authFlowOrchestrator.test.ts
```

## カバレッジ観点チェックリスト

| ブランチ                        | テストケース | カバレッジ状態 |
| ------------------------------- | ------------ | -------------- |
| `auth:login` ハンドラー呼び出し | TC-03        | 確認対象       |
| `startOAuthFlow` が解決される   | TC-03        | 確認対象       |
| `startOAuthFlow` が reject する | TC-08        | 確認対象       |
| `provider` が無効               | TC-02, TC-09 | 確認対象       |
| `{ success: true }` の即時返却  | TC-01, TC-07 | 確認対象       |

## カバレッジ目標

| 指標                    | 目標値   |
| ----------------------- | -------- |
| 行カバレッジ            | 90% 以上 |
| ブランチカバレッジ      | 85% 以上 |
| `auth:login` ハンドラー | 100%     |

## トレーサビリティ

| 要件ID                           | テストケース                   | カバレッジ状態 |
| -------------------------------- | ------------------------------ | -------------- |
| FR-01 (500ms 以内レスポンス)     | TC-01, TC-07                   | 確認対象       |
| FR-02 (fire-and-forget 起動)     | TC-03, TC-05                   | 確認対象       |
| FR-03 (AUTH_STATE_CHANGED 継続)  | `authFlowOrchestrator.test.ts` | 確認対象       |
| FR-04 (handler での重複送信なし) | TC-04, TC-05                   | 確認対象       |
| FR-05 (provider validation)      | TC-02, TC-09                   | 確認対象       |

## 統合テスト連携

| テスト対象                                                          | 役割                     |
| ------------------------------------------------------------------- | ------------------------ |
| `apps/desktop/src/main/ipc/authHandlers.test.ts`                    | handler の範囲を確認     |
| `apps/desktop/src/main/auth/__tests__/authFlowOrchestrator.test.ts` | 成功・失敗イベントを確認 |
| `apps/desktop/src/renderer/store/slices/authSlice.test.ts`          | listener 互換を確認      |

## 参照資料

| 資料名     | パス                          | 説明           |
| ---------- | ----------------------------- | -------------- |
| 要件定義   | `./phase-1-requirements.md`   | FR / AC の対応 |
| テスト作成 | `./phase-4-test-creation.md`  | TC-01 〜 TC-05 |
| テスト拡充 | `./phase-6-test-expansion.md` | TC-06 〜 TC-09 |

## 成果物

| 成果物         | パス                        | 説明       |
| -------------- | --------------------------- | ---------- |
| カバレッジ確認 | `phase-7-coverage-check.md` | 本ファイル |

## 完了条件

- [ ] `auth:login` ハンドラーの行カバレッジが 90% 以上
- [ ] `auth:login` ハンドラーのブランチカバレッジが 85% 以上
- [ ] 全 FR / AC がいずれかのテストケースでカバーされている
- [ ] 未カバーブランチがある場合は Phase 6 に戻りテストを追加している
- [ ] **本Phase内の全タスクを100%実行完了**

# Phase 4 テスト仕様書

## 目的

Main IPC登録フローにおける auth-key ハンドラ登録漏れと、解除連携漏れを Red で検出する。

## Redテスト追加内容

- 対象ファイル: `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts`
- 追加観点:
  - `registerAllIpcHandlers` が `registerAuthKeyHandlers` を呼ぶこと
  - `unregisterAllIpcHandlers` が `unregisterAuthKeyHandlers` を呼ぶこと

## トレーサビリティ

| 要件  | テストケース                                                       | 期待結果    |
| ----- | ------------------------------------------------------------------ | ----------- |
| FR-01 | `registerAllIpcHandlers が registerAuthKeyHandlers を呼び出す`     | 1回呼び出し |
| FR-02 | `unregisterAllIpcHandlers が unregisterAuthKeyHandlers を呼び出す` | 1回呼び出し |

## 実行コマンド

- `pnpm --filter @repo/desktop test:run src/main/ipc/__tests__/ipc-double-registration.test.ts`

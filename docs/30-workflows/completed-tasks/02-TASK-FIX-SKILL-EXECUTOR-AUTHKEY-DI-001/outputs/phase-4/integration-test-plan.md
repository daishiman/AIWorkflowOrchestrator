# Phase 4 統合テスト計画

## テスト軸

- Main配線: `registerAllIpcHandlers` の依存注入
- Skill実行契約: `skill:execute` のレスポンス形状
- 認証境界: preflight契約との整合（errorCode伝搬維持）

## 実施順序

1. `ipc-double-registration.test.ts`（新規Red->Green対象）
2. `skillHandlers.delegate.test.ts`（委譲回帰）
3. `skillHandlers.execute.test.ts`（契約回帰）

## 合格条件

- 1の新規ケースが Green
- 2,3 が既存期待通り PASS
- `AUTHENTICATION_ERROR` 契約を壊さない

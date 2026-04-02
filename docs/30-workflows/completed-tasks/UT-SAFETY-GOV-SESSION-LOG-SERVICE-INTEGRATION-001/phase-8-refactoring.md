# Phase 8: リファクタリング

## メタ情報

| 項目     | 値                                                |
| -------- | ------------------------------------------------- |
| Phase    | 8                                                 |
| 機能名   | Advanced Console 実セッションログ接続             |
| タスクID | UT-SAFETY-GOV-SESSION-LOG-SERVICE-INTEGRATION-001 |
| 作成日   | 2026-04-02                                        |

## 目的

Phase 5 の実装を review し、重複・可読性・型安全性の観点で改善が必要な箇所を修正する。

## リファクタリング対象

### R-1: SESSION_NOT_FOUND エラー生成の重複排除

`getTerminalLog` と `getCopyCommand` の両方に同じエラー生成コードが重複している場合、
ヘルパー関数に抽出する:

```typescript
function sessionNotFoundError(sessionId: string): Error {
  const err = new Error(`Session not found: ${sessionId}`);
  (err as NodeJS.ErrnoException).code = "SESSION_NOT_FOUND";
  return err;
}
```

### R-2: `ClaudeCliResult` 型の利用確認

`mgr.getSession()` の戻り値型が `ClaudeCliResult<SessionDetail>` であることを確認し、
`result.success` と `result.data` の型ガードが正しく機能しているか検証する。

### R-3: コメント整理

実装後に残存する不要なコメント（旧 TODO、仮置きコメント等）を削除する。

## 確認コマンド

```bash
# リファクタリング後もテストが全 PASS であることを確認
pnpm --filter @repo/desktop test -- --reporter=verbose \
  apps/desktop/src/main/ipc/__tests__/advancedConsoleIpc.test.ts

# 型チェック
pnpm --filter @repo/desktop typecheck
```

## 完了条件チェックリスト

- [ ] 重複コードを排除した（またはリファクタリング不要と判断した）
- [ ] 型安全性を確認した
- [ ] 不要コメントを削除した
- [ ] リファクタリング後のテストが全 PASS
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 実行タスク

- 重複する error 生成を関数化する。
- 不要な仮コメントを削除する。

## 参照資料

- `phase-5-implementation.md`
- `phase-6-test-expansion.md`
- `phase-7-coverage-check.md`

## 成果物/実行手順

- `pnpm --filter @repo/desktop test -- --reporter=verbose apps/desktop/src/main/ipc/__tests__/advancedConsoleIpc.test.ts`
- `pnpm --filter @repo/desktop typecheck`

## 統合テスト連携

- `apps/desktop/src/main/ipc/__tests__/advancedConsoleIpc.test.ts`

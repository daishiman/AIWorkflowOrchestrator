# Phase 9: 品質保証

## メタ情報

| 項目     | 値                                                |
| -------- | ------------------------------------------------- |
| Phase    | 9                                                 |
| 機能名   | Advanced Console 実セッションログ接続             |
| タスクID | UT-SAFETY-GOV-SESSION-LOG-SERVICE-INTEGRATION-001 |
| 作成日   | 2026-04-02                                        |

## 品質チェックリスト

### Lint / Format

```bash
pnpm --filter @repo/desktop lint
pnpm --filter @repo/desktop format
```

### 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

### テスト全実行

```bash
pnpm --filter @repo/desktop test
```

期待: 全テスト PASS（既存テスト + ADV-16〜ADV-25）

### セキュリティ確認

| 確認項目                                                  | 判定 |
| --------------------------------------------------------- | ---- |
| DENY-6: sanitizeForApiKeys が全レスポンスに適用           | 確認 |
| SESSION_NOT_FOUND エラーメッセージに API キーが含まれない | 確認 |
| `getClaudeCliManager()` の null チェックが漏れていない    | 確認 |

## 完了条件チェックリスト

- [ ] lint エラーなし
- [ ] typecheck エラーなし
- [ ] 全テスト PASS
- [ ] セキュリティ確認項目が全て PASS
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 目的

lint / typecheck / test / security の 4 軸をまとめて確認する。

## 実行タスク

- lint を確認する。
- typecheck を確認する。
- 全テストを確認する。
- sanitize と error contract を確認する。

## 参照資料

- `phase-5-implementation.md`
- `phase-8-refactoring.md`
- `phase-11-manual-test.md`

## 成果物/実行手順

- `pnpm --filter @repo/desktop lint`
- `pnpm --filter @repo/desktop typecheck`
- `pnpm --filter @repo/desktop test`

## 統合テスト連携

- `apps/desktop/src/main/ipc/__tests__/advancedConsoleIpc.test.ts`

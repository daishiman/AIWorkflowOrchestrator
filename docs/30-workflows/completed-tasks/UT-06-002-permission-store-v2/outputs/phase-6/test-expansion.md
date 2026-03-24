# Phase 6: テスト拡充

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 6                             |
| 機能名   | UT-06-002-permission-store-v2 |
| 作成日   | 2026-03-23                    |
| タスクID | UT-06-002                     |

## 目的

Phase 5 実装後のカバレッジ不足箇所を特定し、追加テストを実装する。

## 参照資料

| 資料名     | パス                                | 説明               |
| ---------- | ----------------------------------- | ------------------ |
| テスト設計 | `outputs/phase-4/test-design.md`    | Phase 4 テスト設計 |
| 実装仕様   | `outputs/phase-5/implementation.md` | Phase 5 実装       |

## 実行タスク

### Task 6-1: カバレッジ測定

```bash
pnpm --filter @repo/desktop test --coverage src/main/services/skill/__tests__/PermissionStore.test.ts
pnpm --filter @repo/shared test --coverage src/types/__tests__/calcExpiresAt.test.ts
```

### Task 6-2: 不足テスト追加候補

| カテゴリ         | テストケース                                                 | 優先度 |
| ---------------- | ------------------------------------------------------------ | ------ |
| エッジケース     | `isToolAllowed` に undefined/null を渡す                     | 高     |
| エッジケース     | `allowToolV2` に expiryPolicy 未指定のエントリ               | 高     |
| 組合せ           | session + time_24h + permanent 混在時の revokeSessionEntries | 高     |
| 並行性           | 連続した allowTool/revokeTool 操作                           | 中     |
| エラー系         | electron-store 書き込み失敗時の graceful degradation         | 中     |
| マイグレーション | 空の allowedTools 配列のマイグレーション                     | 中     |
| V1互換           | V1 の allowTool(string) シグネチャが引き続き動作             | 高     |

## 統合テスト連携

カバレッジ測定結果:

| 指標              | Phase 5 時点 | Phase 6 後目標 |
| ----------------- | ------------ | -------------- |
| Line Coverage     | {{MEASURE}}  | 80%+           |
| Branch Coverage   | {{MEASURE}}  | 60%+           |
| Function Coverage | {{MEASURE}}  | 80%+           |

## 成果物

| 成果物         | パス                                | 説明           |
| -------------- | ----------------------------------- | -------------- |
| テスト拡充仕様 | `outputs/phase-6/test-expansion.md` | 本ドキュメント |

## 完了条件

- [ ] カバレッジが測定されている
- [ ] 不足箇所が特定されている
- [ ] 追加テストが実装されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 7: カバレッジ確認

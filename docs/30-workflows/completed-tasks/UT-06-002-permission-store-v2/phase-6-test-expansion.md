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

## 実行タスク

- Task 6-1: カバレッジ測定 — 現在のカバレッジを測定し、不足箇所を特定
- Task 6-2: エッジケーステスト追加 — isToolAllowed に undefined/null を渡すテスト、expiryPolicy 未指定のエントリテスト
- Task 6-3: 組合せテスト追加 — session + time_24h + permanent 混在時の revokeSessionEntries テスト
- Task 6-4: エラー系テスト追加 — electron-store 書き込み失敗時の graceful degradation テスト
- Task 6-5: V1互換テスト追加 — V1 の allowTool(string) シグネチャが引き続き動作するテスト

## 参照資料

| 資料名     | パス                                | 説明               |
| ---------- | ----------------------------------- | ------------------ |
| テスト設計 | `outputs/phase-4/test-design.md`    | Phase 4 テスト設計 |
| 実装仕様   | `outputs/phase-5/implementation.md` | Phase 5 実装       |

## 実行手順

### ステップ1: カバレッジ測定

```bash
pnpm --filter @repo/desktop test --coverage src/main/services/skill/__tests__/PermissionStore.test.ts
pnpm --filter @repo/shared test --coverage src/types/__tests__/calcExpiresAt.test.ts
```

### ステップ2: 不足箇所の特定と追加テスト実装

カバレッジレポートを分析し、Branch Coverage が 60% 未満の箇所を優先的にテスト追加する。

## 統合テスト連携

カバレッジ測定結果:

| 指標              | Phase 5 時点 | Phase 6 後目標 |
| ----------------- | ------------ | -------------- |
| Line Coverage     | (測定値)     | 80%+           |
| Branch Coverage   | (測定値)     | 60%+           |
| Function Coverage | (測定値)     | 80%+           |

## 多角的チェック観点

| 観点               | 適用 | 確認内容                                   |
| ------------------ | ---- | ------------------------------------------ |
| セキュリティ       | 適用 | 異常入力に対する防御テスト                 |
| データ整合性       | 適用 | 境界値テスト（タイムスタンプ精度、空配列） |
| エラーハンドリング | 適用 | electron-store 障害時のテスト              |

## 成果物

| 成果物         | パス                                | 説明           |
| -------------- | ----------------------------------- | -------------- |
| テスト拡充仕様 | `outputs/phase-6/test-expansion.md` | テスト拡充結果 |

## 完了条件

- [ ] カバレッジが測定されている
- [ ] 不足箇所が特定されている
- [ ] 追加テストが実装されている
- [ ] 全テストが PASS している
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 7: カバレッジ確認

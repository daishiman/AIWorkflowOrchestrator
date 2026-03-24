# Phase 7: カバレッジ確認

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 7                             |
| 機能名   | UT-06-002-permission-store-v2 |
| 作成日   | 2026-03-23                    |
| タスクID | UT-06-002                     |

## 目的

カバレッジ基準の充足を確認し、未達の場合は Phase 6 に戻る。

## カバレッジ基準

| 指標              | 最低基準 | 推奨基準 | 実測値      |
| ----------------- | -------- | -------- | ----------- |
| Line Coverage     | 80%      | 90%      | {{MEASURE}} |
| Branch Coverage   | 60%      | 70%      | {{MEASURE}} |
| Function Coverage | 80%      | 90%      | {{MEASURE}} |

## 検証コマンド

```bash
# PermissionStore V2
pnpm --filter @repo/desktop test --coverage src/main/services/skill/__tests__/PermissionStore.test.ts

# calcExpiresAt
pnpm --filter @repo/shared test --coverage src/types/__tests__/calcExpiresAt.test.ts

# IPC ハンドラ
pnpm --filter @repo/desktop test --coverage src/main/ipc/__tests__/permission-store-handlers.test.ts
```

## 統合テスト連携

| 判定項目                | 基準 | 結果       |
| ----------------------- | ---- | ---------- |
| ユニットテスト Line     | 80%+ | {{RESULT}} |
| ユニットテスト Branch   | 60%+ | {{RESULT}} |
| ユニットテスト Function | 80%+ | {{RESULT}} |

## ゲート判定

| 判定 | 条件         | 対応           |
| ---- | ------------ | -------------- |
| PASS | 全基準達成   | Phase 8 へ     |
| FAIL | いずれか未達 | Phase 6 に戻る |

## 成果物

| 成果物             | パス                                 | 説明           |
| ------------------ | ------------------------------------ | -------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | 本ドキュメント |

## 完了条件

- [ ] カバレッジが測定されている
- [ ] 全基準を達成している（未達の場合は Phase 6 に戻る）
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 8: リファクタリング

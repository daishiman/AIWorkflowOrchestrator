# Phase 7: カバレッジレポート

## メタ情報

| 項目   | 内容                                  |
| ------ | ------------------------------------- |
| Phase  | 7                                     |
| 機能名 | task-imp-permission-tool-metadata-001 |
| Issue  | #606                                  |
| 作成日 | 2026-01-31                            |

---

## カバレッジ計測結果

### toolMetadata.ts

| 指標       | 目標値 | 実測値 | 判定 |
| ---------- | ------ | ------ | ---- |
| Lines      | 95%+   | 100%   | PASS |
| Branches   | 60%+   | 100%   | PASS |
| Functions  | 80%+   | 100%   | PASS |
| Statements | 80%+   | 100%   | PASS |

### 計測コマンド

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/__tests__/toolMetadata.test.ts \
  src/renderer/components/skill/__tests__/PermissionDialog.metadata.test.tsx \
  --coverage
```

---

## カバレッジ判定

| 条件                                              | 結果 | アクション    |
| ------------------------------------------------- | ---- | ------------- |
| toolMetadata.ts Lines 95%以上かつ全指標が目標以上 | PASS | Phase 8へ進行 |

---

## 未カバー行

なし。toolMetadata.tsの全行・全分岐・全関数がテストでカバーされている。

---

## テスト実行結果

全258テストがPASS（8テストファイル）

---

## 完了条件チェック

- [x] toolMetadata.tsのLine Coverageが95%以上を達成している（100%）
- [x] toolMetadata.tsのBranch Coverageが60%以上を達成している（100%）
- [x] toolMetadata.tsのFunction Coverageが80%以上を達成している（100%）
- [x] 全テストがPASSしている
- [x] カバレッジレポートが作成されている
- [x] 未カバー行: なし

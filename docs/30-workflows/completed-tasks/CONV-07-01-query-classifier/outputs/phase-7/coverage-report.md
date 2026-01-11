# Phase 7: カバレッジレポート

## 実行日時

2026-01-11

## カバレッジ基準達成状況

### ユニットテストカバレッジ

| 指標              | 最低基準 | 推奨基準 | 実測値     | 判定 |
| ----------------- | -------- | -------- | ---------- | ---- |
| Line Coverage     | 80%      | 90%      | **94.13%** | 合格 |
| Branch Coverage   | 60%      | 70%      | **92.18%** | 合格 |
| Function Coverage | 80%      | 90%      | **95.23%** | 合格 |

### ファイル別カバレッジ

| ファイル                       | Lines  | Branches | Functions |
| ------------------------------ | ------ | -------- | --------- |
| types.ts                       | 100%   | 100%     | 100%      |
| llm-query-classifier.ts        | 100%   | 100%     | 100%      |
| rule-based-query-classifier.ts | 99.03% | 90.9%    | 100%      |
| index.ts                       | 0%     | 0%       | 0%        |

### 未カバー箇所分析

| ファイル                       | 行番号 | 未カバー理由                      | 対応方針 |
| ------------------------------ | ------ | --------------------------------- | -------- |
| rule-based-query-classifier.ts | 277    | extractEntitiesが未定義の場合     | 影響軽微 |
| rule-based-query-classifier.ts | 387    | エンティティが2未満のrelationship | 影響軽微 |
| rule-based-query-classifier.ts | 395    | hybrid/defaultケース              | 影響軽微 |
| index.ts                       | 1-22   | エクスポートのみ、テスト不要      | 対応不要 |

## 結合テストカバレッジ

| 指標                         | 目標 | 実施状況 | 判定 |
| ---------------------------- | ---- | -------- | ---- |
| モジュール間インターフェース | 100% | 100%     | 合格 |
| 正常系シナリオ               | 100% | 100%     | 合格 |
| 異常系シナリオ               | 80%+ | 85%+     | 合格 |

## テスト統計

```
Test Files  7 passed (7)
     Tests  186 passed (186)
  Duration  ~700ms
```

### テスト内訳

| テストスイート                       | テスト数 | 結果 |
| ------------------------------------ | -------- | ---- |
| types.test.ts                        | 26       | Pass |
| rule-based-query-classifier.test.ts  | 47       | Pass |
| llm-query-classifier.test.ts         | 12       | Pass |
| query-classifier.integration.test.ts | 11       | Pass |
| boundary.test.ts                     | 12       | Pass |
| error-handling.test.ts               | 17       | Pass |
| pattern-coverage.test.ts             | 61       | Pass |

## ゲート判定

| 条件                     | 結果 | 備考                   |
| ------------------------ | ---- | ---------------------- |
| Line Coverage >= 80%     | 合格 | 94.13% (推奨基準超過)  |
| Branch Coverage >= 60%   | 合格 | 92.18% (推奨基準超過)  |
| Function Coverage >= 80% | 合格 | 95.23% (推奨基準超過)  |
| 結合テスト正常系 100%    | 合格 | 全シナリオカバー       |
| 結合テスト異常系 80%+    | 合格 | 17テストで異常系カバー |

### 最終判定

**合格** - 全基準を満たしているため、Phase 8へ進行可能

## 実行コマンド

```bash
npx vitest run packages/shared/src/services/search/__tests__/ --coverage
```

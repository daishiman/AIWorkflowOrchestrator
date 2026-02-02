# テスト仕様書: 権限履歴の期間別フィルタリング

## メタ情報

| 項目     | 値                              |
| -------- | ------------------------------- |
| タスクID | TASK-IMP-permission-date-filter |
| Phase    | 4                               |
| 作成日   | 2026-02-02                      |

## テスト戦略

TDDアプローチに基づき、実装前にテストを作成（Red Phase）。

## テストファイル配置

| テストファイル                                          | テスト対象               |
| ------------------------------------------------------- | ------------------------ |
| `__tests__/dateFilterUtils.test.ts`                     | 日付フィルタロジック     |
| `__tests__/PermissionHistoryFilter.test.tsx`            | 期間フィルタUI           |
| `__tests__/PermissionHistoryPanel.test.tsx`（既存拡張） | パネルの日付フィルタ統合 |

## テストカバレッジ目標

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

## テストカテゴリ

1. **フィルタロジックテスト**: getDateRangeStartDate, filterByDateRange の全プリセット・カスタム範囲テスト
2. **UIコンポーネントテスト**: 期間セレクト表示、カスタム日付入力の表示/非表示切替、onFilterChange発火
3. **境界値テスト**: 日付境界（00:00:00 / 23:59:59）、7日/30日境界
4. **複合フィルタテスト**: ツール名+期間、判断結果+期間の組み合わせ
5. **定数テスト**: DAYS_IN_WEEK, DAYS_IN_MONTH の値検証

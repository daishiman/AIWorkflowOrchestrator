# スコープ定義: 権限履歴の期間別フィルタリング

## メタ情報

| 項目     | 値                              |
| -------- | ------------------------------- |
| タスクID | TASK-IMP-permission-date-filter |
| Phase    | 1                               |
| 作成日   | 2026-02-02                      |

## スコープ内（In Scope）

| #   | 対象                              | 詳細                                           |
| --- | --------------------------------- | ---------------------------------------------- |
| 1   | PermissionHistoryFilter型の拡張   | dateRangeフィールドの追加（optional）          |
| 2   | DateRangeFilter型の新規定義       | preset, start?, end?                           |
| 3   | DatePreset型の新規定義            | "all" / "today" / "week" / "month" / "custom"  |
| 4   | dateFilterUtils.tsの新規作成      | getDateRangeStartDate, filterByDateRange       |
| 5   | PermissionHistoryFilter.tsxの拡張 | 期間セレクトボックス + カスタム日付入力UI      |
| 6   | PermissionHistoryPanel.tsxの拡張  | フィルタチェーンにdateRange対応を追加          |
| 7   | ユニットテスト                    | 型定義テスト、フィルタロジックテスト、UIテスト |

## スコープ外（Out of Scope）

| #   | 対象                                            | 理由                             |
| --- | ----------------------------------------------- | -------------------------------- |
| 1   | カレンダーピッカーUIの新規作成                  | ネイティブdate inputで対応       |
| 2   | バックエンド/Main Processでの日付フィルタリング | フロントエンド完結のため対象外   |
| 3   | 期間フィルタの永続化（persist）                 | 非永続化（セッション内のみ有効） |
| 4   | 国際化（i18n）対応                              | 現時点では日本語のみ             |
| 5   | ダークモード対応                                | 既存のCSS変数で自動対応          |
| 6   | レスポンシブデザイン                            | デスクトップアプリのため対象外   |

## 影響範囲

### 変更対象ファイル

| ファイル                      | 変更内容                      |
| ----------------------------- | ----------------------------- |
| `permissionHistory.ts`        | 型拡張（DateRangeFilter追加） |
| `PermissionHistoryFilter.tsx` | 期間セレクトUI追加            |
| `PermissionHistoryPanel.tsx`  | フィルタロジック拡張          |

### 新規作成ファイル

| ファイル                  | 内容                   |
| ------------------------- | ---------------------- |
| `dateFilterUtils.ts`      | 日付フィルタヘルパー   |
| `dateFilterUtils.test.ts` | フィルタロジックテスト |

### 影響なしの既存機能

- 履歴クリア機能: 影響なし
- 仮想スクロール: 影響なし（filteredEntriesの配列が変わるだけ）
- 履歴追加（addHistoryEntry）: 影響なし
- Zustand store永続化: dateRangeは非永続化フィルタなので影響なし

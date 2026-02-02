# ドメインモデル: 権限履歴の期間別フィルタリング

## メタ情報

| 項目     | 値                              |
| -------- | ------------------------------- |
| タスクID | TASK-IMP-permission-date-filter |
| Phase    | 2                               |
| 作成日   | 2026-02-02                      |

## ドメインモデル図

```
PermissionHistoryFilter (既存拡張)
├── toolName?: string
├── decision?: PermissionDecision
└── dateRange?: DateRangeFilter (新規)
    ├── preset: DatePreset
    ├── start?: string (ISO8601)
    └── end?: string (ISO8601)

DatePreset (新規)
= "all" | "today" | "week" | "month" | "custom"

PermissionDecision (既存)
= "approved" | "denied" | "approved_once"
```

## 型定義

### DatePreset

| 値       | 意味         | フィルタ動作                   |
| -------- | ------------ | ------------------------------ |
| `all`    | 全期間       | フィルタなし（全エントリ通過） |
| `today`  | 今日         | 本日00:00:00以降のみ           |
| `week`   | 過去7日      | 7日前00:00:00以降のみ          |
| `month`  | 過去30日     | 30日前00:00:00以降のみ         |
| `custom` | カスタム範囲 | start/endで指定された範囲のみ  |

### DateRangeFilter

| フィールド | 型         | 必須 | 説明                     |
| ---------- | ---------- | ---- | ------------------------ |
| preset     | DatePreset | 必須 | プリセット選択値         |
| start      | string     | 任意 | 開始日（YYYY-MM-DD形式） |
| end        | string     | 任意 | 終了日（YYYY-MM-DD形式） |

### PermissionHistoryFilter（拡張後）

| フィールド | 型                 | 必須 | 説明                 |
| ---------- | ------------------ | ---- | -------------------- |
| toolName   | string             | 任意 | ツール名フィルタ     |
| decision   | PermissionDecision | 任意 | 判断結果フィルタ     |
| dateRange  | DateRangeFilter    | 任意 | 期間フィルタ（新規） |

## ユーティリティ関数

### getDateRangeStartDate

- 入力: `DatePreset`
- 出力: `Date | null`
- 責務: プリセットから比較用の開始日を算出

### filterByDateRange

- 入力: `PermissionHistoryEntry[]`, `DateRangeFilter`
- 出力: `PermissionHistoryEntry[]`
- 責務: 日付範囲でエントリをフィルタリング

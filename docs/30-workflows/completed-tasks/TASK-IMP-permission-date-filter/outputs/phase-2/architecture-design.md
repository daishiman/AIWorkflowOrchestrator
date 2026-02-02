# 設計書: 権限履歴の期間別フィルタリング

## メタ情報

| 項目     | 値                              |
| -------- | ------------------------------- |
| タスクID | TASK-IMP-permission-date-filter |
| Phase    | 2                               |
| 作成日   | 2026-02-02                      |

## 1. インターフェース設計

### 1.1 既存 PermissionHistoryFilter 型の拡張

```typescript
/** フィルタ条件 */
export interface PermissionHistoryFilter {
  /** ツール名フィルタ（undefinedで全件） */
  toolName?: string;
  /** 判断結果フィルタ（undefinedで全件） */
  decision?: PermissionDecision;
  /** 期間フィルタ（undefinedで全件） - 新規追加 */
  dateRange?: DateRangeFilter;
}
```

- `dateRange`は**optional**であり、既存のフィルタ利用箇所は後方互換

### 1.2 新規型: DatePreset

```typescript
/** 期間プリセット */
export type DatePreset = "all" | "today" | "week" | "month" | "custom";
```

| 値       | 説明         |
| -------- | ------------ |
| `all`    | 全期間       |
| `today`  | 今日         |
| `week`   | 過去7日      |
| `month`  | 過去30日     |
| `custom` | カスタム範囲 |

### 1.3 新規型: DateRangeFilter

```typescript
/** 期間フィルタ条件 */
export interface DateRangeFilter {
  /** プリセット選択値 */
  preset: DatePreset;
  /** カスタム範囲の開始日（ISO8601形式、YYYY-MM-DD） */
  start?: string;
  /** カスタム範囲の終了日（ISO8601形式、YYYY-MM-DD） */
  end?: string;
}
```

## 2. UIコンポーネント設計

### 2.1 レイアウト

```
┌─────────────────────────────────────────────┐
│ [ツール名 ▼]  [判断結果 ▼]  [期間 ▼]       │
│                                             │
│ （「カスタム範囲」選択時のみ表示）          │
│ [開始日 📅]  ～  [終了日 📅]               │
└─────────────────────────────────────────────┘
```

### 2.2 期間セレクトボックス

| 表示テキスト | 値       |
| ------------ | -------- |
| 全期間       | `all`    |
| 今日         | `today`  |
| 過去7日      | `week`   |
| 過去30日     | `month`  |
| カスタム範囲 | `custom` |

### 2.3 日付入力の仕様

| 項目               | 仕様                                                    |
| ------------------ | ------------------------------------------------------- |
| 入力タイプ         | `<input type="date" />`（ネイティブ日付ピッカー）       |
| 表示条件           | preset === "custom" の場合のみ表示                      |
| start のデフォルト | 空（指定なし = 制限なし）                               |
| end のデフォルト   | 空（指定なし = 制限なし）                               |
| バリデーション     | start <= end（start と end の両方が指定されている場合） |

### 2.4 スタイル一貫性

- 期間セレクトは既存のツール名/判断結果セレクトと同一のCSSスタイルを使用
- `aria-label="期間フィルタ"`を付与
- flex: 1 でレスポンシブに幅を調整

## 3. フィルタロジック設計

### 3.1 ヘルパー関数（dateFilterUtils.ts）

#### getDateRangeStartDate

```typescript
function getDateRangeStartDate(preset: DatePreset): Date | null;
```

| preset   | 処理                                                    |
| -------- | ------------------------------------------------------- |
| `all`    | `null`を返す（フィルタなし）                            |
| `today`  | `new Date()`で今日を取得し`setHours(0,0,0,0)`で日の開始 |
| `week`   | 今日から7日前の`setHours(0,0,0,0)`                      |
| `month`  | 今日から30日前の`setHours(0,0,0,0)`                     |
| `custom` | `null`を返す（start/endで個別判定）                     |

#### filterByDateRange

```typescript
function filterByDateRange(
  entries: PermissionHistoryEntry[],
  dateRange: DateRangeFilter,
): PermissionHistoryEntry[];
```

1. `dateRange.preset === "all"` → 全件返却
2. プリセット（today/week/month）→ `getDateRangeStartDate`で開始日取得、`entry.timestamp >= startDate`でフィルタ
3. custom → start指定時は`>= start日00:00:00`、end指定時は`<= end日の翌日00:00:00未満`でフィルタ

### 3.2 日付比較方式

- `entry.timestamp`はISO8601形式文字列（例: `2026-02-01T10:30:00.000Z`）
- `new Date(entry.timestamp).getTime()`でミリ秒比較
- プリセット日付は`setHours(0,0,0,0)`でローカル日付の開始に設定

### 3.3 フィルタ適用順序（PermissionHistoryPanel.tsx）

1. toolName フィルタ（既存）
2. decision フィルタ（既存）
3. dateRange フィルタ（新規追加）

## 4. 統合ポイント

| 接続先            | 契約                                                           |
| ----------------- | -------------------------------------------------------------- |
| Store → Filter UI | `historyFilter`状態の購読（既存）                              |
| Filter UI → Store | `setHistoryFilter(filter: PermissionHistoryFilter)` 既存IF利用 |
| Panel内部         | `filterByDateRange`をuseMemo内のフィルタチェーンに追加         |

## 5. 非永続化方針

- `dateRange`はZustand storeの非永続化フィールド
- ページリロード時にフィルタはリセット（デフォルト: "all"）

# 実装ガイド: 権限履歴の期間別フィルタリング

## メタ情報

| 項目     | 値                              |
| -------- | ------------------------------- |
| タスクID | TASK-IMP-permission-date-filter |
| Phase    | 12                              |
| 作成日   | 2026-02-02                      |

---

# Part 1: 概念的説明（中学生レベル）

## この機能は何？

スマホの写真アプリで「先月の写真だけ表示」したり、「今日撮った写真だけ見る」ということができますよね。この機能はそれと同じ仕組みです。

AIが作業するとき、「この操作をしていいですか？」とユーザーに確認をとります。その確認の記録（履歴）がどんどん溜まっていくと、大量のリストから必要な情報を探すのが大変になります。

## なぜ必要なの？

図書館をイメージしてください。1000冊の本が時系列で並んでいるとき、「今週入荷した本だけ見たい」と思ったら、フィルタがないと全部の本を一つずつ確認しなければなりません。

この機能を使えば：

- 「今日の記録だけ見たい」→ 今日のものだけがパッと表示される
- 「この1週間の記録を確認したい」→ 過去7日分だけ表示される
- 「特定の期間を指定して探したい」→ カレンダーで日付を選んで絞り込める

## どうやって使うの？

1. 設定画面の「権限要求履歴」パネルを開く
2. 「期間フィルタ」のドロップダウンから選ぶ
   - 全期間（初期状態、すべて表示）
   - 今日
   - 過去7日
   - 過去30日
   - カスタム範囲（自分で開始日と終了日を指定）
3. 選んだ瞬間にリストが絞り込まれる

これは「ツール名フィルタ」や「判断結果フィルタ」と組み合わせることもできます。例えば「今日のBashコマンドで拒否されたもの」だけを表示する、といった使い方ができます。

---

# Part 2: 技術的詳細

## 型定義

### DatePreset（期間プリセット）

```typescript
type DatePreset = "all" | "today" | "week" | "month" | "custom";
```

| 値       | 説明                   |
| -------- | ---------------------- |
| `all`    | 全期間（フィルタなし） |
| `today`  | 今日（当日00:00:00〜） |
| `week`   | 過去7日間              |
| `month`  | 過去30日間             |
| `custom` | ユーザー指定範囲       |

### DateRangeFilter（期間フィルタ条件）

```typescript
interface DateRangeFilter {
  /** プリセット選択値 */
  preset: DatePreset;
  /** カスタム範囲の開始日（YYYY-MM-DD形式） */
  start?: string;
  /** カスタム範囲の終了日（YYYY-MM-DD形式） */
  end?: string;
}
```

### PermissionHistoryFilter（拡張後）

```typescript
interface PermissionHistoryFilter {
  toolName?: string;
  decision?: PermissionDecision;
  dateRange?: DateRangeFilter; // 新規追加
}
```

`dateRange`はoptionalフィールドであり、既存のフィルタ利用箇所への後方互換性を維持。

## APIシグネチャと使用例

### getDateRangeStartDate

```typescript
function getDateRangeStartDate(preset: DatePreset): Date | null;
```

プリセットから比較用の開始日を算出する。

| preset   | 戻り値                           |
| -------- | -------------------------------- |
| `all`    | `null`                           |
| `today`  | 今日の00:00:00.000（ローカル）   |
| `week`   | 7日前の00:00:00.000（ローカル）  |
| `month`  | 30日前の00:00:00.000（ローカル） |
| `custom` | `null`                           |

使用例:

```typescript
const startDate = getDateRangeStartDate("week");
// → 7日前の00:00:00.000を返すDateオブジェクト
```

### filterByDateRange

```typescript
function filterByDateRange(
  entries: PermissionHistoryEntry[],
  dateRange: DateRangeFilter,
): PermissionHistoryEntry[];
```

日付範囲でエントリをフィルタリングする。

処理フロー:

1. `preset === "all"` → 全件返却
2. `preset === "custom"` → start/endで個別にフィルタ
   - start指定時: `entryTime >= start日のT00:00:00`
   - end指定時: `entryTime < end日の翌日T00:00:00`（end日を含む）
3. プリセット（today/week/month）→ `getDateRangeStartDate`で開始日取得、`entryTime >= startTime`でフィルタ

使用例:

```typescript
// プリセットで今日のエントリのみ取得
const todayEntries = filterByDateRange(entries, { preset: "today" });

// カスタム範囲
const customEntries = filterByDateRange(entries, {
  preset: "custom",
  start: "2026-02-01",
  end: "2026-02-02",
});
```

## エラーハンドリングとエッジケース

### 無効な日付文字列

`new Date(entry.timestamp).getTime()`が`NaN`を返す場合、そのエントリはフィルタ結果から除外される。`isNaN()`チェックにより安全にスキップ。

### start > end の場合

start/endは各独立にフィルタ適用されるため、`start > end`の場合は空の結果が返る。アプリケーションレベルでのバリデーションは行わず、結果が空であることで自然にフィードバックされる。

### タイムゾーン処理

- プリセット日付は`setHours(0, 0, 0, 0)`でローカルタイムゾーンの日の開始に設定
- カスタム範囲は`new Date(dateString + "T00:00:00")`でローカルタイムゾーンとして解釈
- `entry.timestamp`はISO8601形式（UTC）だが、比較時にDateオブジェクト経由でミリ秒に変換されるため、ローカル時刻との比較が正しく動作

## 設定可能なパラメータと定数

| 定数名          | 値  | 説明               | ファイル           |
| --------------- | --- | ------------------ | ------------------ |
| `DAYS_IN_WEEK`  | 7   | 「過去7日」の日数  | dateFilterUtils.ts |
| `DAYS_IN_MONTH` | 30  | 「過去30日」の日数 | dateFilterUtils.ts |

## ファイル構成

| ファイル                      | 役割                                                               |
| ----------------------------- | ------------------------------------------------------------------ |
| `permissionHistory.ts`        | 型定義（DatePreset, DateRangeFilter, PermissionHistoryFilter拡張） |
| `dateFilterUtils.ts`          | フィルタロジック（getDateRangeStartDate, filterByDateRange）       |
| `PermissionHistoryFilter.tsx` | 期間セレクトUI + カスタム日付入力UI                                |
| `PermissionHistoryPanel.tsx`  | フィルタチェーンにdateRange統合                                    |

## テスト結果

| テストファイル                   | テスト数 | カテゴリ                                 |
| -------------------------------- | -------- | ---------------------------------------- |
| dateFilterUtils.test.ts          | 22       | ロジック（プリセット、カスタム、境界値） |
| PermissionHistoryFilter.test.tsx | 8        | UIコンポーネント                         |
| PermissionHistoryPanel.test.tsx  | 25       | パネル統合                               |
| PermissionSettings.test.tsx      | 17       | 既存リグレッション                       |
| **合計**                         | **72**   |                                          |

カバレッジ: Statement 98.50% / Branch 87.82% / Function 100% / Line 98.50%

# Phase 3 タスク6: ISO 8601 シリアライズ整合性レビュー

## メタ情報

| 項目   | 内容                                                            |
| ------ | --------------------------------------------------------------- |
| タスク | タスク6: ISO 8601 シリアライズ整合性                            |
| 作成日 | 2026-02-28                                                      |
| 入力   | Phase 2 ドメインモデル設計、IPCチャネル設計、アーキテクチャ設計 |

## 日時フィールド全レイヤー横断レビュー

| 型名/契約           | フィールド  | Main Process内       | IPC境界（送受信）    | 永続化（electron-store） | 判定 |
| ------------------- | ----------- | -------------------- | -------------------- | ------------------------ | ---- |
| `SkillUsageEvent`   | `timestamp` | `string`（ISO 8601） | `string`（ISO 8601） | `string`（ISO 8601）     | OK   |
| `SkillStatistics`   | `lastUsed`  | `string \| null`     | `string \| null`     | N/A（集計値のみ）        | OK   |
| `AnalyticsPeriod`   | `start`     | `string`（ISO 8601） | `string`（ISO 8601） | N/A（引数のみ）          | OK   |
| `AnalyticsPeriod`   | `end`       | `string`（ISO 8601） | `string`（ISO 8601） | N/A（引数のみ）          | OK   |
| `TrendDataPoint`    | `timestamp` | `string`（ISO 8601） | `string`（ISO 8601） | N/A（集計値のみ）        | OK   |
| `SkillUsageSummary` | `lastUsed`  | `string \| null`     | `string \| null`     | N/A（集計値のみ）        | OK   |

## ルール確認

### ルール1: IPC入力日時の ISO 8601 妥当性検証

| チャネル                     | 日時引数               | 検証方法                       | 検証あり |
| ---------------------------- | ---------------------- | ------------------------------ | -------- |
| `skill:analytics:record`     | `timestamp`（任意）    | `isNaN(Date.parse(timestamp))` | OK       |
| `skill:analytics:trend`      | `period.start`         | `isNaN(Date.parse(start))`     | OK       |
| `skill:analytics:trend`      | `period.end`           | `isNaN(Date.parse(end))`       | OK       |
| `skill:analytics:export`     | `period.start`（任意） | `isNaN(Date.parse(start))`     | OK       |
| `skill:analytics:export`     | `period.end`（任意）   | `isNaN(Date.parse(end))`       | OK       |
| `skill:analytics:statistics` | N/A                    | N/A                            | N/A      |
| `skill:analytics:summary`    | N/A                    | N/A                            | N/A      |

全日時引数に対して ISO 8601 妥当性検証が設計されている。

### ルール2: `period.start <= period.end` の強制

| チャネル                 | 検証条件                          | 検証あり |
| ------------------------ | --------------------------------- | -------- |
| `skill:analytics:trend`  | `new Date(start) > new Date(end)` | OK       |
| `skill:analytics:export` | `new Date(start) > new Date(end)` | OK       |

両チャネルで期間の整合検証が設計されている。

### ルール3: 永続化データに `Date` オブジェクトを混在させない

| 確認項目                                     | 結果 | 備考                                                                  |
| -------------------------------------------- | ---- | --------------------------------------------------------------------- |
| `SkillUsageEvent.timestamp` が `string` 型   | OK   | ドメインモデル設計で `string`（ISO 8601）として定義                   |
| 永続化時に `Date` オブジェクトが入らない     | OK   | `AnalyticsStore.addEvent` は `Omit<SkillUsageEvent, "id">` を受け取る |
| `SkillAnalytics.recordEvent` で ISO 変換     | OK   | `new Date().toISOString()` で文字列化してから永続化                   |
| `AnalyticsStore.clearBefore` の引数は `Date` | OK   | 内部API引数は `Date` 型。永続化データの比較に `getTime()` を使用      |

## 型定義内の日時フィールド総点検

### Phase 2 ドメインモデル設計の全日時フィールド

| インターフェース    | フィールド  | 型               | ISO 8601 コメント | 判定 |
| ------------------- | ----------- | ---------------- | ----------------- | ---- |
| `SkillUsageEvent`   | `timestamp` | `string`         | あり              | OK   |
| `SkillStatistics`   | `lastUsed`  | `string \| null` | あり              | OK   |
| `AnalyticsPeriod`   | `start`     | `string`         | あり              | OK   |
| `AnalyticsPeriod`   | `end`       | `string`         | あり              | OK   |
| `TrendDataPoint`    | `timestamp` | `string`         | あり              | OK   |
| `SkillUsageSummary` | `lastUsed`  | `string \| null` | あり              | OK   |

全日時フィールドが `string` 型（`Date` 型なし）で定義されており、JSDoc に ISO 8601 であることが明記されている。

### ファイル先頭コメント

Phase 2 ドメインモデル設計で以下のファイル先頭コメントが定義されている:

```
IPC シリアライズ方針:
- 日時フィールド（timestamp, lastUsed, start, end）は全て string（ISO 8601）で定義
- Main Process 内部では Date オブジェクトを使用し、IPC 境界で .toISOString() に変換する
```

TASK-9G（`skill-schedule.ts`）のパターンに準拠している。

## Date.parse() による ISO 8601 検証の制限事項

`Date.parse()` は RFC 2822 形式や他の日付文字列も受け付けるため、厳密な ISO 8601 検証にはならない。ただし TASK-9G でも同じ `Date.parse()` ベースの検証を使用しており、既存パターンとの整合性を維持するために同方式を採用するのは妥当。

より厳密な検証が必要な場合は、正規表現による ISO 8601 パターンマッチを追加できるが、初期実装では `Date.parse()` で十分と評価する。

## 特記事項

### `SkillStatistics.lastUsed` と `SkillUsageSummary.lastUsed` のオプショナル修飾子

Phase 2 ドメインモデル設計で `lastUsed` フィールドが `lastUsed?: string | null` と定義されている（`?` 修飾子付き）。`?` 修飾子があると `undefined` と `null` の両方が許容される。

`JSON.stringify` は `undefined` を省略するが、`null` は JSON で `null` として保持される。ただし、`lastUsed` は IPC レスポンスの一部として `{ success: true, data: SkillStatistics }` のネストされたフィールドであり、`safeInvokeUnwrap` が `data` 全体を返すため、`undefined` と `null` の区別はフィールド存在チェック（`"lastUsed" in statistics`）で判定可能。

Phase 2 設計では `lastUsed` はイベントが0件の場合に `null` を返す設計であり、`undefined`（フィールド未定義）が発生するケースは存在しない。したがって `?` 修飾子は型の柔軟性を確保するための防御的記述であり、実運用上の問題はない。

## 指摘事項

指摘なし。

## 集計

| 重大度   | 件数 | 詳細 |
| -------- | ---- | ---- |
| CRITICAL | 0    |      |
| MAJOR    | 0    |      |
| MINOR    | 0    |      |

## 結論

日時データの扱いは全レイヤーで一貫しており、ISO 8601 シリアライズ方針は TASK-9G パターンに準拠している。全日時フィールドが `string` 型で定義され、`Date` オブジェクトの混在はない。IPC 入力の日時検証と期間整合検証も全チャネルで設計されている。全項目 PASS であり、Phase 4 進行を妨げる問題は検出されなかった。

# スキル使用統計・分析機能 実装ガイド ## メタ情報 | 項目 | 値 | | -------- | ------------------------------- | | タスクID | TASK-9J | | Phase | 12 (ドキュメント) | | 実行日 | 2026-02-28 | | 機能名 | スキル使用統計・分析（Backend） | ---

## Part 1: 概念的説明（中学生レベル） ### スキル使用統計とは？ スキル使用統計は、**スマートフォンのアプリ使用時間レポート（スクリーンタイム）** のようなものです。 iPhoneの「スクリーンタイム」機能を知っていますか？ どのアプリを何回開いたか、どれくらいの時間使ったか、 自動で記録してグラフで見せてくれますよね。 スキル使用統計も同じで、「どのスキルを何回使ったか」 「うまくいったか失敗したか」「どれくらい時間がかかったか」を 自動で記録して、レポートにまとめる機能です。 ### AnalyticsStore とは？ これは**使用記録を書き込むノート**のようなものです。 学校の出席簿を思い浮かべてください。毎朝、先生が「出席」「欠席」を記録しますよね。 AnalyticsStore も同じように、スキルが実行されるたびに、ノートに 1 行ずつ記録が追加されます。 このノートには以下の情報が書かれます: **いつ**: 実行した日時

- **何を**: どのスキルを使ったか
- **結果**: 成功したか失敗したか
- **時間**: どれくらいかかったか
- **道具**: どんなツール（Read, Write など）を使ったか

アプリを閉じてもノートの記録は消えません（electron-store に保存されるため）。
いつでも過去の使用状況を振り返ることができます。

### SkillAnalytics とは？

これは**記録されたデータを集計して分かりやすくする電卓**のようなものです。

テストの点数が 100 個あったとき、全部を見るのは大変ですよね。
でも「平均点」「最高点」「合格率」を計算すれば、一目で状況がわかります。

SkillAnalytics はノート（AnalyticsStore）に書かれた記録を読んで、
以下のような計算をします:

- スキルごとの使用回数を数える
- 成功率を計算する（10 回中 8 回成功 = 80%）
- 平均実行時間を算出する
- 日別・週別・月別のグラフ用データを作る
- CSV や JSON で記録をダウンロードできるようにする

### IPC ハンドラとは？

レストランの**注文窓口**のようなものです。

お客さん（画面側 = Renderer）は「統計を見せて」と窓口に注文します。
窓口のスタッフ（IPC ハンドラ）は注文内容を確認し、
厨房（SkillAnalytics サービス）に伝えます。
料理（統計データ）ができたら、窓口からお客さんに渡します。

窓口では以下のチェックをします:

1. お客さんが本物かどうか確認する（セキュリティチェック）
2. 注文内容が正しいか確認する（バリデーション）
3. 厨房でエラーが起きても、内部の詳細はお客さんに見せない

---

## Part 2: 技術者向け実装詳細

### 実装概要

| 項目             | 値                                                                                       |
| ---------------- | ---------------------------------------------------------------------------------------- |
| IPC チャンネル数 | 5                                                                                        |
| 新規ファイル数   | 4（SkillAnalytics.ts, AnalyticsStore.ts, skillAnalyticsHandlers.ts, skill-analytics.ts） |
| 修正ファイル数   | 5（ipc/index.ts, channels.ts, skill-api.ts, types/index.ts, packages/shared/index.ts）   |
| 型定義数         | 8 インターフェース                                                                       |
| テスト数         | 97（型定義 8 + AnalyticsStore 15 + SkillAnalytics 37 + IPC ハンドラ 37）                 |

### アーキテクチャ

```
Renderer (React UI)
    ↓ window.electronAPI.skill.analyticsRecord(...)
Preload (skill-api.ts)
    ↓ safeInvokeUnwrap(IPC_CHANNELS.SKILL_ANALYTICS_RECORD, ...)
Main Process (skillAnalyticsHandlers.ts)
    ↓ validateIpcSender → P42バリデーション → try/catch
SkillAnalytics (SkillAnalytics.ts)
    ↓ 集計ロジック
AnalyticsStore (AnalyticsStore.ts)
    ↓ CRUD + electron-store 永続化
```

### AnalyticsStore API

永続化ストア。electron-store をバックエンドに使用し、メモリキャッシュと永続化の二層構成。

| メソッド          | 引数                  | 戻り値            | 説明                            |
| ----------------- | --------------------- | ----------------- | ------------------------------- |
| constructor       | store?: ElectronStore | -                 | electron-store からイベント復元 |
| getAllEvents()    | -                     | SkillUsageEvent[] | 全イベント取得（コピー返却）    |
| addEvent(event)   | Omit<Event, "id">     | SkillUsageEvent   | UUID 自動生成してイベント追加   |
| getEventsBySkill  | skillName: string     | SkillUsageEvent[] | スキル名フィルタ                |
| getEventsByPeriod | start, end: string    | SkillUsageEvent[] | 期間フィルタ（inclusive）       |
| clearBefore       | before: string        | void              | 指定日時前のイベント削除        |
| clearAll()        | -                     | void              | 全イベント削除                  |

**設計ポイント**:

- **P19 準拠**: コンストラクタで `Array.isArray()` + `.filter()` による実行時バリデーション
- **P9 準拠**: `getAllEvents()` は `[...this.events]` でコピーを返却（外部変更不可）
- **永続化キー**: `"skill-analytics-events"`
- **UUID 生成**: `crypto.randomUUID()` を使用

### SkillAnalytics API

集計・分析サービス。AnalyticsStore を DI で注入。

| メソッド      | 引数                                | 戻り値           | 説明                           |
| ------------- | ----------------------------------- | ---------------- | ------------------------------ |
| constructor   | analyticsStore: AnalyticsStore      | -                | DI パターンでストア注入        |
| recordEvent   | event (id/timestamp 省略可)         | SkillUsageEvent  | イベント記録（timestamp 自動） |
| getStatistics | skillName, period?                  | SkillStatistics  | スキル統計計算                 |
| getSummary    | limit = 10                          | AnalyticsSummary | 全体サマリー取得               |
| getUsageTrend | period: AnalyticsPeriod, skillName? | UsageTrend       | 時系列トレンド生成             |
| exportData    | format: "json" \| "csv", period?    | string           | データエクスポート             |
| clearData     | before?: string                     | void             | データ削除                     |

**集計ロジック詳細**:

- `successRate`: 成功数 / 総実行数（0 件時は 0）
- `errorRate`: eventType === "error" の件数 / 総実行数（0 件時は 0）
- `averageDuration`: duration 定義済みイベントのみ平均（0 件時は 0）
- `totalTokens`: tokenCount の合計（undefined は 0 扱い）
- `mostUsedTools`: Map で集計後、count 降順ソート、percentage は `Math.round((count/total) * 10000) / 100`
- `mostUsedSkills`: 実行回数降順ソート
- `recentActivity`: タイムスタンプ降順で上位 N 件
- CSV: toolsUsed はセミコロン区切り、ヘッダー行付き

**時系列データ生成**:

- `generateDataPoints`: granularity (hour/day/week/month) に基づいて期間をバケットに分割
- 各バケットで executions, errors, avgDuration を集計
- イベントがないバケットは 0 値

### IPC チャンネル仕様

#### 5 チャンネル一覧

| チャンネル名               | 引数                                                                                  | 戻り値                                      | 説明               |
| -------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------- | ------------------ |
| skill:analytics:record     | `{ skillName, eventType, duration?, success, errorMessage?, toolsUsed, tokenCount? }` | `{ success: true, data: SkillUsageEvent }`  | 使用イベント記録   |
| skill:analytics:statistics | `{ skillName: string, period?: { start, end } }`                                      | `{ success: true, data: SkillStatistics }`  | スキル別統計取得   |
| skill:analytics:summary    | なし（引数不要）                                                                      | `{ success: true, data: AnalyticsSummary }` | 全体サマリー取得   |
| skill:analytics:trend      | `{ period: { start, end, granularity }, skillName? }`                                 | `{ success: true, data: UsageTrend }`       | 使用トレンド取得   |
| skill:analytics:export     | `{ format: "csv" \| "json", period?: { start, end } }`                                | `{ success: true, data: string }`           | データエクスポート |

#### 引数バリデーション

全ハンドラで以下のセキュリティ検証を実施:

1. **validateIpcSender**: 送信元ウィンドウの検証（失敗時 throw）
2. **isPlainObject**: 引数がプレーンオブジェクトであることを検証
3. **P42 準拠 3 段バリデーション**: 文字列引数の型・空文字・トリム空文字チェック

**バリデーション定数**:

- `ALLOWED_EVENT_TYPES`: `["execution", "error", "cancellation"]`
- `ALLOWED_GRANULARITIES`: `["hour", "day", "week", "month"]`
- `ALLOWED_FORMATS`: `["json", "csv"]`

#### エラーレスポンス

```typescript
// バリデーションエラー
{ success: false, error: "skillName must be a non-empty string" }

// 内部エラー（情報漏洩防止）
{ success: false, error: "Internal error" }

// sender 検証失敗（throw）
throw toIPCValidationError(validation)
```

### 8 型定義（skill-analytics.ts）

| 型名              | 用途                              |
| ----------------- | --------------------------------- |
| SkillUsageEvent   | 使用イベントの記録単位            |
| ToolUsageStat     | ツール別使用統計                  |
| SkillStatistics   | スキル別の集計統計                |
| AnalyticsPeriod   | 集計期間（start/end/granularity） |
| TrendDataPoint    | トレンドの 1 データポイント       |
| UsageTrend        | 時系列トレンドデータ              |
| SkillUsageSummary | スキル別集計サマリー              |
| AnalyticsSummary  | 全スキルの総合サマリー            |

### Preload API（skill-api.ts 追加メソッド）

| メソッド            | チャンネル定数             | 説明                   |
| ------------------- | -------------------------- | ---------------------- |
| analyticsRecord     | SKILL_ANALYTICS_RECORD     | スキル利用イベント記録 |
| analyticsStatistics | SKILL_ANALYTICS_STATISTICS | スキル統計取得         |
| analyticsSummary    | SKILL_ANALYTICS_SUMMARY    | 全体サマリー取得       |
| analyticsTrend      | SKILL_ANALYTICS_TREND      | 利用トレンド取得       |
| analyticsExport     | SKILL_ANALYTICS_EXPORT     | データエクスポート     |

全メソッドが `safeInvokeUnwrap` パターンを使用。

### セキュリティ検証フロー

```
1. validateIpcSender(event, IPC_CHANNELS.XXX, { getAllowedWindows: () => [mainWindow] })
   → 失敗: throw toIPCValidationError(validation)

2. isPlainObject(args) チェック
   → 失敗: return { success: false, error: "args must be a non-null object" }

3. P42 準拠 3 段バリデーション（validateStringArg ヘルパー）
   → typeof !== "string" → "must be a non-empty string"
   → === "" → "must be a non-empty string"
   → .trim() === "" → "must be a non-empty string"

4. ビジネスロジック実行（try/catch）
   → 例外: return { success: false, error: "Internal error" }
```

### 準拠パターン一覧

| パターン | 内容                                                    | 適用箇所                   |
| -------- | ------------------------------------------------------- | -------------------------- |
| P9       | テスト間状態共有なし（beforeEach でリセット）           | 全テストファイル           |
| P19      | 復元時の Array.isArray + filter バリデーション          | AnalyticsStore constructor |
| P41      | validateIpcSender の getAllowedWindows コールバック検証 | IPC ハンドラテスト         |
| P42      | 3 段バリデーション（型/空文字列/トリム空文字列）        | IPC ハンドラ全チャンネル   |
| P44      | IPC ハンドラと Preload のインターフェース整合           | 全チャンネル               |
| P45      | 引数名はセマンティクスに一致（skillName）               | 全 API メソッド            |

### 非機能要件（NFR）準拠

| NFR   | 要件                                       | 対応状況                |
| ----- | ------------------------------------------ | ----------------------- |
| NFR-1 | 10,000 件以下の集計を 1 秒以内             | O(n) アルゴリズム採用   |
| NFR-2 | メモリキャッシュ + electron-store 永続化   | AnalyticsStore 実装済み |
| NFR-3 | エラーメッセージの "Internal error" 正規化 | 全ハンドラで統一        |
| NFR-4 | validateIpcSender による送信元検証         | 全チャンネルで実施      |

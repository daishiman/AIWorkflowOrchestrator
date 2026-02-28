# Phase 1 Task 5: TASK-9J 要件仕様書

## メタ情報

| 項目       | 内容                                                                     |
| ---------- | ------------------------------------------------------------------------ |
| タスクID   | TASK-9J                                                                  |
| タスク名   | スキル使用分析（Skill Analytics）                                        |
| Phase      | 1（要件定義）                                                            |
| 作成日     | 2026-02-28                                                               |
| 入力成果物 | Task 1-4 成果物（既存パターン分析、仕様書整合性、型整合性、IPC連携要件） |
| 出力       | 本ドキュメント（統合要件仕様書）                                         |

---

## 1. 概要

TASK-9J は、AIWorkflowOrchestrator のスキル実行に関する使用統計・分析機能を提供する。スキル実行時の使用イベントを自動記録し、スキル別統計情報・全スキル横断サマリー・使用トレンド分析・データエクスポートの4つの分析機能を IPC 経由で Renderer に公開する。

本タスクは **バックエンドサービス（Main Process）+ IPC 契約 + 共有型定義** の実装に限定し、UI コンポーネント（ダッシュボード画面）は task-031b に移管済みである。

---

## 2. スコープ定義

### 2.1 スコープ内

| カテゴリ       | 内容                                                                                    |
| -------------- | --------------------------------------------------------------------------------------- |
| サービスクラス | `SkillAnalytics`（Main Process サービス、`apps/desktop/src/main/services/skill/` 配下） |
| 永続化ストア   | `AnalyticsStore`（electron-store ベース、`apps/desktop/src/main/services/skill/` 配下） |
| IPC ハンドラ   | `registerSkillAnalyticsHandlers()` / `unregisterSkillAnalyticsHandlers()`（5チャネル）  |
| チャネル定義   | `channels.ts` への5チャネル追加 + `ALLOWED_INVOKE_CHANNELS` ホワイトリスト登録          |
| Preload API    | `skill-api.ts` への5メソッド追加（`safeInvokeUnwrap` パターン）                         |
| 共有型定義     | `packages/shared/src/types/skill-analytics.ts`（8インターフェース + 1型エイリアス）     |
| テスト         | サービス・ストア・IPC ハンドラの単体テスト + 統合テスト                                 |

### 2.2 スコープ外

| カテゴリ                    | 理由                                                                                |
| --------------------------- | ----------------------------------------------------------------------------------- |
| UI コンポーネント           | task-031b に移管済み。Renderer 側のダッシュボード画面は別タスク                     |
| リアルタイムストリーミング  | Main -> Renderer のイベント Push は不要。Renderer はポーリングまたは手動取得で対応  |
| 外部サービス連携            | 分析データの外部送信・クラウド同期は対象外                                          |
| `UsageStats` 型の統合・廃止 | `skillCreator.ts` の既存 `UsageStats` 型との統合は未タスク化（Phase 12 で検出予定） |

---

## 3. 機能要件

### FR-1: スキル実行時の使用イベント自動記録

**目的**: スキル実行のライフサイクルイベント（開始・成功・エラー・キャンセル）を `AnalyticsStore` に永続化する。

**記録方式**:

- **IPC 経由**: Renderer からの明示的な記録要求（`skill:analytics:record` チャネル）
- **Main Process 直接呼び出し**: `SkillAnalytics.recordEvent()` メソッドによる内部呼び出し（SkillExecutor 等からの直接連携）

**記録対象フィールド**:

| フィールド     | 型          | 必須 | 説明                                                                                           |
| -------------- | ----------- | ---- | ---------------------------------------------------------------------------------------------- |
| `skillName`    | `SkillName` | 必須 | 使用したスキル名（Branded Type）                                                               |
| `eventType`    | `string`    | 必須 | `"execution_start"` / `"execution_success"` / `"execution_error"` / `"execution_cancel"` の4値 |
| `timestamp`    | `string`    | 必須 | 記録日時（ISO 8601）。未指定時は Main 側で `new Date().toISOString()` で自動補完               |
| `durationMs`   | `number`    | 任意 | 実行時間（ミリ秒、非負整数、完了時のみ）                                                       |
| `tokenUsage`   | `number`    | 任意 | トークン使用量（非負整数、取得可能な場合のみ）                                                 |
| `errorMessage` | `string`    | 任意 | エラーメッセージ（`execution_error` 時のみ）                                                   |
| `toolsUsed`    | `string[]`  | 任意 | 使用されたツール名の配列                                                                       |

**IPC ハンドラでの引数バリデーション**:

| フィールド   | バリデーション                                | エラーメッセージ                                                                                    |
| ------------ | --------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `args`       | `isPlainObject(args)`                         | `"args must be a non-null object"`                                                                  |
| `skillName`  | P42準拠3段バリデーション                      | `"skillName must be a non-empty string"`                                                            |
| `eventType`  | 許可値リスト照合                              | `"eventType must be one of: execution_start, execution_success, execution_error, execution_cancel"` |
| `toolsUsed`  | 定義時: `Array.isArray()` + 各要素が `string` | `"toolsUsed must be an array of strings"`                                                           |
| `durationMs` | 定義時: `typeof === "number"` かつ `>= 0`     | `"durationMs must be a non-negative number"`                                                        |
| `tokenUsage` | 定義時: `typeof === "number"` かつ `>= 0`     | `"tokenUsage must be a non-negative number"`                                                        |
| `timestamp`  | 定義時: `isValidISO8601()`                    | `"timestamp must be a valid ISO 8601 date string"`                                                  |

---

### FR-2: スキル別統計情報の取得（SkillStatistics）

**目的**: 指定スキルの累積統計情報を集計して返却する。

**取得フィールド**:

| フィールド        | 型                | 説明                                        |
| ----------------- | ----------------- | ------------------------------------------- |
| `skillName`       | `SkillName`       | 対象スキル名                                |
| `totalExecutions` | `number`          | 総実行回数（`execution_start` イベント数）  |
| `successRate`     | `number`          | 成功率（0.0 - 1.0）                         |
| `avgDuration`     | `number`          | 平均実行時間（ミリ秒）                      |
| `errorRate`       | `number`          | エラー率（0.0 - 1.0）                       |
| `totalTokens`     | `number`          | 累積トークン使用量                          |
| `lastExecutedAt`  | `string \| null`  | 最終実行日時（ISO 8601）、未実行時は `null` |
| `toolUsageStats`  | `ToolUsageStat[]` | ツール別使用統計（使用回数・平均実行時間）  |

**IPC チャネル**: `skill:analytics:statistics`

**引数**: `skillName: string`（P42準拠3段バリデーション対象）

**戻り値**: `{ success: true, data: SkillStatistics }` / `{ success: false, error: string }`

---

### FR-3: 全スキル横断サマリーの取得（AnalyticsSummary）

**目的**: 全スキルの使用状況を俯瞰するサマリー情報を返却する。

**取得フィールド**:

| フィールド            | 型                    | 説明                                           |
| --------------------- | --------------------- | ---------------------------------------------- |
| `totalSkills`         | `number`              | 統計対象のスキル総数                           |
| `totalExecutions`     | `number`              | 全スキルの総実行回数                           |
| `overallSuccessRate`  | `number`              | 全体の成功率（0.0 - 1.0）                      |
| `skillUsageSummaries` | `SkillUsageSummary[]` | スキル別サマリー一覧                           |
| `recentActivity`      | `SkillUsageEvent[]`   | 最近の実行イベント（最新が先頭、件数上限あり） |

**IPC チャネル**: `skill:analytics:summary`

**引数**: なし

**戻り値**: `{ success: true, data: AnalyticsSummary }` / `{ success: false, error: string }`

---

### FR-4: 使用トレンド分析（UsageTrend）

**目的**: 指定スキルの使用傾向を時系列データとして返却する。

**取得フィールド**:

| フィールド   | 型                 | 説明                                |
| ------------ | ------------------ | ----------------------------------- |
| `skillName`  | `SkillName`        | 対象スキル名                        |
| `period`     | `AnalyticsPeriod`  | 集計期間（start, end, granularity） |
| `dataPoints` | `TrendDataPoint[]` | 時系列データポイント一覧            |

**`TrendDataPoint` の各フィールド**:

| フィールド       | 型       | 説明                   |
| ---------------- | -------- | ---------------------- |
| `label`          | `string` | データポイントのラベル |
| `executionCount` | `number` | 実行回数               |
| `successCount`   | `number` | 成功回数               |
| `errorCount`     | `number` | エラー回数             |
| `avgDuration`    | `number` | 平均実行時間（ミリ秒） |
| `tokenUsage`     | `number` | トークン使用量         |

**`AnalyticsPeriod` の定義**:

| フィールド    | 型                     | 説明                                                |
| ------------- | ---------------------- | --------------------------------------------------- |
| `start`       | `string`               | 集計開始日時（ISO 8601）                            |
| `end`         | `string`               | 集計終了日時（ISO 8601）                            |
| `granularity` | `AnalyticsGranularity` | 集計粒度: `"hour"` / `"day"` / `"week"` / `"month"` |

**IPC チャネル**: `skill:analytics:trend`

**引数**: `{ skillName: string, period: AnalyticsPeriod }`（オブジェクト形式）

**引数バリデーション**:

| フィールド           | バリデーション                                   | エラーメッセージ                                          |
| -------------------- | ------------------------------------------------ | --------------------------------------------------------- |
| `args`               | `isPlainObject(args)`                            | `"args must be a non-null object"`                        |
| `skillName`          | P42準拠3段バリデーション                         | `"skillName must be a non-empty string"`                  |
| `period`             | `isPlainObject(args.period)`                     | `"period must be a valid object"`                         |
| `period.start`       | `typeof === "string"` かつ `isValidISO8601()`    | `"start must be a valid ISO 8601 date string"`            |
| `period.end`         | `typeof === "string"` かつ `isValidISO8601()`    | `"end must be a valid ISO 8601 date string"`              |
| `start <= end`       | `new Date(start) <= new Date(end)`               | `"period.start must be less than or equal to period.end"` |
| `period.granularity` | 許可値リスト: `["hour", "day", "week", "month"]` | `"granularity must be one of: hour, day, week, month"`    |

**戻り値**: `{ success: true, data: UsageTrend }` / `{ success: false, error: string }`

---

### FR-5: CSV/JSON フォーマットでのデータエクスポート

**目的**: 記録済みの使用イベントデータを CSV または JSON フォーマットで文字列として返却する。

**フォーマット仕様**:

| フォーマット | 仕様                                               |
| ------------ | -------------------------------------------------- |
| CSV          | ヘッダ行を含む。カンマ区切り。日時は ISO 8601 形式 |
| JSON         | インデント2スペースの整形済み JSON 文字列          |

**IPC チャネル**: `skill:analytics:export`

**引数**: `{ format: "csv" | "json", period?: AnalyticsPeriod }`（オブジェクト形式）

- `period` は任意。省略時は全期間のデータをエクスポートする
- `period` 指定時は FR-4 と同じ `AnalyticsPeriod` バリデーションを適用する

**引数バリデーション**:

| フィールド               | バリデーション                                   | エラーメッセージ                                          |
| ------------------------ | ------------------------------------------------ | --------------------------------------------------------- |
| `args`                   | `isPlainObject(args)`                            | `"args must be a non-null object"`                        |
| `format`                 | 許可値リスト: `["json", "csv"]`                  | `"format must be one of: json, csv"`                      |
| `period`（指定時）       | `isPlainObject(args.period)`                     | `"period must be a valid object"`                         |
| `period.start`（指定時） | `typeof === "string"` かつ `isValidISO8601()`    | `"start must be a valid ISO 8601 date string"`            |
| `period.end`（指定時）   | `typeof === "string"` かつ `isValidISO8601()`    | `"end must be a valid ISO 8601 date string"`              |
| `start <= end`（指定時） | `new Date(start) <= new Date(end)`               | `"period.start must be less than or equal to period.end"` |
| `granularity`（指定時）  | 許可値リスト: `["hour", "day", "week", "month"]` | `"granularity must be one of: hour, day, week, month"`    |

**戻り値**: `{ success: true, data: string }` / `{ success: false, error: string }`

---

### FR-6: 指定日時以前のデータクリア

**目的**: 指定日時（ISO 8601）以前の使用イベントデータを `AnalyticsStore` から削除する。

**アクセス方式**: Main Process 内部 API のみ。`SkillAnalytics.clearData(before: string)` メソッドとして提供する。

**IPC スコープ**: 対象外。Renderer からの直接呼び出しは許可しない。

**バリデーション**: `before` 引数が有効な ISO 8601 文字列であること。

---

## 4. 非機能要件

### NFR-1: electron-store によるローカル永続化

- ストアキー: `"skill-analytics-events"`
- ストアファイル名: `"skill-analytics"` （`new ElectronStore({ name: "skill-analytics" })`）
- `AnalyticsStoreSchema` インターフェースで型安全なスキーマを定義する
- デフォルト値: `{ events: [] }`
- P19 対策: コンストラクタでの復元時に `unknown` 型で受け取り、`Array.isArray()` + `.filter()` でバリデーションする
- DI 対応: コンストラクタで `store?` をオプショナル引数として受け取り、テスト時にモック注入可能とする
- メモリキャッシュ: `private events` でインメモリコピーを保持し、CRUD はメモリ上で実行後に `persist()` で書き込む
- 上限管理: `MAX_EVENTS` 定数でイベント件数の上限を設定し、ストレージ肥大化を防止する

### NFR-2: IPC 境界での ISO 8601 文字列シリアライズ

- 共有型定義（`skill-analytics.ts`）では全ての日時フィールドを `string`（ISO 8601）として定義する
- `Date` オブジェクトは共有型に含めない
- Main Process 内部では `Date` オブジェクトを使用し、IPC 境界で `.toISOString()` に変換する
- TASK-9G（`skill-schedule.ts`）のパターンに準拠する
- ファイル先頭にシリアライズ方針コメントを記載する

### NFR-3: P42 準拠 3 段バリデーション

全 IPC ハンドラの文字列引数に対して以下の3段階バリデーションを実施する:

1. **型チェック**: `typeof value !== "string"` で型を検証
2. **空文字列チェック**: `value === ""` で空文字列を拒否
3. **トリム空文字列チェック**: `value.trim() === ""` でスペースのみの入力を拒否

`validateStringArg()` 共通関数（TASK-9G で導入済み）を再利用する。

### NFR-4: 大量データでの集計パフォーマンス

- 10,000 件以上の使用イベントに対して、統計集計（FR-2）・サマリー取得（FR-3）・トレンド分析（FR-4）を 1 秒以内に完了する
- メモリキャッシュを活用し、electron-store への直接アクセスを最小化する
- `quality-requirements.md` の応答時間基準（UI 操作 95 パーセンタイル 500ms 以内）よりも緩い基準を採用する（バックエンド集計処理のため）

---

## 5. IPC チャネル一覧（5チャネル）

| #   | 定数名                       | チャネル文字列               | 方向             | 引数                                                                                        | 戻り値                                                                    |
| --- | ---------------------------- | ---------------------------- | ---------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 1   | `SKILL_ANALYTICS_RECORD`     | `skill:analytics:record`     | Renderer -> Main | `{ skillName, eventType, toolsUsed?, durationMs?, tokenUsage?, errorMessage?, timestamp? }` | `{ success: true }` / `{ success: false, error }`                         |
| 2   | `SKILL_ANALYTICS_STATISTICS` | `skill:analytics:statistics` | Renderer -> Main | `skillName: string`                                                                         | `{ success: true, data: SkillStatistics }` / `{ success: false, error }`  |
| 3   | `SKILL_ANALYTICS_SUMMARY`    | `skill:analytics:summary`    | Renderer -> Main | なし                                                                                        | `{ success: true, data: AnalyticsSummary }` / `{ success: false, error }` |
| 4   | `SKILL_ANALYTICS_TREND`      | `skill:analytics:trend`      | Renderer -> Main | `{ skillName, period: AnalyticsPeriod }`                                                    | `{ success: true, data: UsageTrend }` / `{ success: false, error }`       |
| 5   | `SKILL_ANALYTICS_EXPORT`     | `skill:analytics:export`     | Renderer -> Main | `{ format: "csv" \| "json", period?: AnalyticsPeriod }`                                     | `{ success: true, data: string }` / `{ success: false, error }`           |

**命名規則**: `skill:schedule:*`（TASK-9G）の3階層パターンに準拠。

**ホワイトリスト**: 5チャネル全てを `ALLOWED_INVOKE_CHANNELS` に追加する。`ALLOWED_ON_CHANNELS` への追加は不要（Main -> Renderer のイベント Push チャネルがないため）。

**レスポンス方式**: `return` パターン（`{ success: true/false, ... }`）を統一採用する。TASK-9G の最新パターンに準拠。Preload 側は `safeInvokeUnwrap` で呼び出し、`success === false` を `throw new Error(error)` に変換する。

**セキュリティ**: 全5チャネルのハンドラ先頭で `validateIpcSender()` を実行し、`getAllowedWindows: () => [mainWindow]` で mainWindow のみを許可する。検証失敗時は `throw toIPCValidationError(validation)` で即座に拒否する。

---

## 6. 共有型定義一覧（8インターフェース + 1型エイリアス）

配置先: `packages/shared/src/types/skill-analytics.ts`

エクスポート: `index.ts` に `export * from "./skill-analytics"` を追加（`skill-schedule.ts` の直後）。

### 6.1 SkillUsageEvent

```typescript
export interface SkillUsageEvent {
  skillName: SkillName;
  eventType:
    | "execution_start"
    | "execution_success"
    | "execution_error"
    | "execution_cancel";
  timestamp: string; // ISO 8601
  durationMs?: number;
  tokenUsage?: number;
  errorMessage?: string;
  toolsUsed?: string[];
}
```

### 6.2 ToolUsageStat

```typescript
export interface ToolUsageStat {
  toolName: string;
  usageCount: number;
  avgDuration: number; // ミリ秒
}
```

### 6.3 SkillStatistics

```typescript
export interface SkillStatistics {
  skillName: SkillName;
  totalExecutions: number;
  successRate: number; // 0.0 - 1.0
  avgDuration: number; // ミリ秒
  errorRate: number; // 0.0 - 1.0
  totalTokens: number;
  lastExecutedAt: string | null; // ISO 8601
  toolUsageStats: ToolUsageStat[];
}
```

### 6.4 AnalyticsGranularity（型エイリアス）

```typescript
export type AnalyticsGranularity = "hour" | "day" | "week" | "month";
```

### 6.5 AnalyticsPeriod

```typescript
export interface AnalyticsPeriod {
  start: string; // ISO 8601
  end: string; // ISO 8601
  granularity: AnalyticsGranularity;
}
```

### 6.6 TrendDataPoint

```typescript
export interface TrendDataPoint {
  label: string;
  executionCount: number;
  successCount: number;
  errorCount: number;
  avgDuration: number; // ミリ秒
  tokenUsage: number;
}
```

### 6.7 UsageTrend

```typescript
export interface UsageTrend {
  skillName: SkillName;
  period: AnalyticsPeriod;
  dataPoints: TrendDataPoint[];
}
```

### 6.8 SkillUsageSummary

```typescript
export interface SkillUsageSummary {
  skillName: SkillName;
  executionCount: number;
  successRate: number; // 0.0 - 1.0
  lastExecutedAt: string | null; // ISO 8601
}
```

### 6.9 AnalyticsSummary

```typescript
export interface AnalyticsSummary {
  totalSkills: number;
  totalExecutions: number;
  overallSuccessRate: number; // 0.0 - 1.0
  skillUsageSummaries: SkillUsageSummary[];
  recentActivity: SkillUsageEvent[];
}
```

---

## 7. 踏襲する既存パターン

### 7.1 サービスクラス設計

| パターン                 | 踏襲元                                    | TASK-9J での適用                                                                   |
| ------------------------ | ----------------------------------------- | ---------------------------------------------------------------------------------- |
| Constructor Injection    | `SkillShareManager`, `SkillScheduler`     | `SkillAnalytics` のコンストラクタで `AnalyticsStore` を注入                        |
| 依存インターフェース定義 | `SkillShareManager` の `interface XxxDep` | サービスクラス上部に依存インターフェースを定義                                     |
| エラー定義 const object  | `SkillShareManager` の `SHARE_ERRORS`     | `ANALYTICS_ERRORS` を定義（Validation: 1000-1999, Infrastructure: 4000-4999 範囲） |
| Result 型パターン        | `createSuccess<T>()` / `createError<T>()` | 明示的なエラーハンドリング                                                         |

### 7.2 IPC ハンドラ

| パターン                       | 踏襲元                                      | TASK-9J での適用                                                          |
| ------------------------------ | ------------------------------------------- | ------------------------------------------------------------------------- |
| register/unregister 関数ペア   | `registerSkillScheduleHandlers()` (TASK-9G) | `registerSkillAnalyticsHandlers()` / `unregisterSkillAnalyticsHandlers()` |
| 5ステップハンドラ構造          | TASK-9G スケジュール系                      | Sender検証 -> バリデーション -> ビジネスロジック -> 成功 -> エラー        |
| `validateStringArg()` 共通関数 | TASK-9G で導入                              | 文字列引数のP42準拠3段バリデーション                                      |
| `return` 方式                  | TASK-9G の最新パターン                      | バリデーションエラー・ビジネスエラーとも `return` で返却                  |
| `sanitizeErrorMessage()`       | TASK-9F（skill-share）                      | catch ブロック内でエラー情報をサニタイズ                                  |

### 7.3 チャネル定義

| パターン                                   | 踏襲元                                   | TASK-9J での適用                          |
| ------------------------------------------ | ---------------------------------------- | ----------------------------------------- |
| 3階層命名 `skill:{subdomain}:{action}`     | `skill:schedule:*` (TASK-9G)             | `skill:analytics:*` の5チャネル           |
| `SKILL_` プレフィックス + UPPER_SNAKE_CASE | 全スキルチャネル                         | `SKILL_ANALYTICS_RECORD` 等               |
| TASK ID コメントでグループ分け             | `// Skill schedule operations (TASK-9G)` | `// Skill analytics operations (TASK-9J)` |
| `ALLOWED_INVOKE_CHANNELS` への追加         | TASK-9G                                  | 5チャネルを追加                           |

### 7.4 Preload API

| パターン                            | 踏襲元                                     | TASK-9J での適用                                       |
| ----------------------------------- | ------------------------------------------ | ------------------------------------------------------ |
| `SkillAPI` インターフェースへの追加 | `scheduleList`, `scheduleAdd` 等 (TASK-9G) | `analyticsRecord`, `analyticsStatistics` 等の5メソッド |
| `safeInvokeUnwrap<T>()`             | TASK-9G スケジュール系                     | 全5メソッドで使用                                      |
| JSDoc 付きメソッド定義              | 全既存メソッド                             | API 仕様の明示                                         |
| オブジェクト引数 `{ ... }`          | `{ id, updates }` (TASK-9G)                | `{ skillName, period }` 等の複数引数まとめ渡し         |

### 7.5 永続化ストア

| パターン                             | 踏襲元                          | TASK-9J での適用                               |
| ------------------------------------ | ------------------------------- | ---------------------------------------------- |
| `ElectronStore<XxxStoreSchema>`      | `ScheduleStore` (TASK-9G)       | `AnalyticsStore<AnalyticsStoreSchema>`         |
| 機能別ストアファイル分離             | `name: "skill-schedules"`       | `name: "skill-analytics"`                      |
| P19 対策バリデーション               | `ScheduleStore` コンストラクタ  | `unknown` 型 + `Array.isArray()` + `.filter()` |
| DI 対応（`store?` オプショナル引数） | `ScheduleStore`                 | テスト時のモック注入                           |
| メモリキャッシュ + `persist()`       | `ScheduleStore`                 | インメモリ CRUD 後に永続化                     |
| `MAX_*` 定数による上限管理           | `ScheduleStore.MAX_RUN_HISTORY` | `MAX_EVENTS` 定数でイベント件数上限を管理      |

### 7.6 セキュリティ

| パターン                                         | 踏襲元             | TASK-9J での適用                     |
| ------------------------------------------------ | ------------------ | ------------------------------------ |
| `validateIpcSender()` + `toIPCValidationError()` | 全既存ハンドラ     | 全5チャネルで Sender 検証            |
| `sanitizeErrorMessage()`                         | `skillHandlers.ts` | エラーレスポンス生成時に情報漏洩防止 |
| `getAllowedWindows: () => [mainWindow]`          | 全既存ハンドラ     | mainWindow のみ許可                  |

---

## 8. 受け入れ基準

### 8.1 機能要件の受け入れ基準

- [ ] **AC-1**: `SkillAnalytics.recordEvent()` を呼び出すと、`AnalyticsStore` にイベントが永続化される
- [ ] **AC-2**: `skill:analytics:record` IPC チャネル経由でイベント記録が正常に動作する
- [ ] **AC-3**: `skill:analytics:statistics` で指定スキルの `SkillStatistics` が正確に集計される（totalExecutions, successRate, avgDuration, errorRate, totalTokens, lastExecutedAt, toolUsageStats）
- [ ] **AC-4**: `skill:analytics:summary` で全スキル横断の `AnalyticsSummary` が正確に集計される
- [ ] **AC-5**: `skill:analytics:trend` で指定スキル・期間・粒度のトレンドデータが返却される
- [ ] **AC-6**: `skill:analytics:export` で CSV フォーマット出力が正常に動作する（ヘッダ行含む、ISO 8601日時）
- [ ] **AC-7**: `skill:analytics:export` で JSON フォーマット出力が正常に動作する（インデント2スペース）
- [ ] **AC-8**: `SkillAnalytics.clearData()` で指定日時以前のデータが削除される
- [ ] **AC-9**: 期間フィルタ（`AnalyticsPeriod`）によるデータ絞り込みが正確に動作する

### 8.2 非機能要件の受け入れ基準

- [ ] **AC-10**: `AnalyticsStore` が electron-store（`name: "skill-analytics"`）でデータを永続化する
- [ ] **AC-11**: アプリ再起動後にデータが復元される（P19対策バリデーション含む）
- [ ] **AC-12**: 全 IPC レスポンスの日時フィールドが ISO 8601 文字列として返却される
- [ ] **AC-13**: 全 IPC ハンドラの文字列引数に P42 準拠 3 段バリデーションが適用されている
- [ ] **AC-14**: 10,000 件のイベントに対して統計集計が 1 秒以内に完了する

### 8.3 セキュリティ受け入れ基準

- [ ] **AC-15**: 全5チャネルで `validateIpcSender()` が実行されている
- [ ] **AC-16**: 不正なウィンドウからの IPC 呼び出しが拒否される
- [ ] **AC-17**: エラーレスポンスに内部情報（ファイルパス、スタックトレース等）が漏洩しない
- [ ] **AC-18**: 全チャネル名が `IPC_CHANNELS` 定数から参照されている（ハードコード文字列なし）
- [ ] **AC-19**: 5チャネルが `ALLOWED_INVOKE_CHANNELS` ホワイトリストに登録されている

### 8.4 テスト受け入れ基準

- [ ] **AC-20**: `SkillAnalytics` サービスの単体テスト: Line Coverage 90%+, Branch Coverage 70%+, Function Coverage 90%+
- [ ] **AC-21**: `AnalyticsStore` の単体テスト: CRUD 操作 + P19 バリデーション + 上限管理
- [ ] **AC-22**: IPC ハンドラテスト: 正常系 + P42 バリデーション異常系 + Sender 検証テスト
- [ ] **AC-23**: Preload API テスト: `safeInvokeUnwrap` 経由の呼び出し確認

### 8.5 コード品質受け入れ基準

- [ ] **AC-24**: `pnpm lint` が警告なしでパスする
- [ ] **AC-25**: `pnpm typecheck` が型エラーなしでパスする
- [ ] **AC-26**: `any` 型を使用していない
- [ ] **AC-27**: 共有型定義が `packages/shared/src/types/skill-analytics.ts` に配置されている

---

## 9. 仕様書整合性確認結果サマリー

### 9.1 調査対象仕様書と判定結果

| #   | 仕様書                          | 判定           | 抵触 | 備考                                                |
| --- | ------------------------------- | -------------- | ---- | --------------------------------------------------- |
| 1   | `architecture-overview.md`      | 整合           | なし | レイヤー依存方向・Facade パターン遵守               |
| 2   | `arch-electron-services.md`     | 整合           | なし | サービス配置規約（L2コンポーネント）に準拠          |
| 3   | `api-ipc-agent.md`              | 整合           | なし | チャネル命名・方向・型定義パターンに準拠            |
| 4   | `security-electron-ipc.md`      | 整合           | なし | Sender 検証・P42 バリデーション・CSP 準拠           |
| 5   | `security-skill-ipc.md`         | 整合（要追記） | なし | Phase 12 で IPC チャネル検証テーブルに5チャネル追記 |
| 6   | `interfaces-agent-sdk-skill.md` | 整合（要追記） | なし | Phase 12 で skillAnalyticsAPI セクション追記        |
| 7   | `ipc-contract-checklist.md`     | 整合           | なし | Phase 1-6 チェックリストに完全準拠可能              |
| 8   | `error-handling.md`             | 整合           | なし | Validation Error（1000-1999）カテゴリ準拠           |
| 9   | `quality-requirements.md`       | 整合           | なし | カバレッジ基準・TDD 原則準拠                        |
| 10  | `development-guidelines.md`     | 整合           | なし | テスト方針・ログ運用・命名規約準拠                  |

**総合判定**: 全10仕様書に対して抵触なし。

### 9.2 Phase 12 で追記が必要な仕様書

| 仕様書                          | 追記内容                                                                       |
| ------------------------------- | ------------------------------------------------------------------------------ |
| `security-skill-ipc.md`         | IPC チャネル検証テーブルに5チャネル追加、完了タスク記録追加                    |
| `interfaces-agent-sdk-skill.md` | skillAnalyticsAPI メソッド一覧追加、新規型定義テーブル追加、完了タスク記録追加 |
| `arch-electron-services.md`     | コンポーネント構成テーブルに SkillAnalytics / AnalyticsStore 追加              |
| `api-ipc-agent.md`              | `skill:analytics:*` 5チャネルの一覧テーブル追加                                |

### 9.3 型定義の整合性

| 確認項目                            | 結果 | 詳細                                                              |
| ----------------------------------- | ---- | ----------------------------------------------------------------- |
| Branded Type 連携                   | 整合 | `SkillName` を `skillName` フィールドに使用                       |
| IPC シリアライズ方針                | 整合 | `skill-schedule.ts` (TASK-9G) パターンに準拠。日時は全て `string` |
| エクスポート方針                    | 整合 | `export *` パターンで `index.ts` に追加                           |
| `UsageStats` (skillCreator.ts) 重複 | 独立 | 設計意図が異なるため独立定義。統合は未タスク化                    |
| nullable フィールド                 | 整合 | `string \| null` パターン準拠                                     |

### 9.4 既存タスクとの一貫性

| 踏襲元タスク              | 踏襲パターン                                                                             |
| ------------------------- | ---------------------------------------------------------------------------------------- |
| TASK-9G（skill-schedule） | `skill:schedule:*` 階層的チャネル命名、electron-store 永続化、ScheduleStore 分離パターン |
| TASK-9F（skill-share）    | `validateIpcSender` + P42 3段バリデーション + `sanitizeErrorMessage` の多層防御          |
| TASK-9A-B（skill-file）   | `skillHandlers.ts` へのハンドラ追加、`ALLOWED_INVOKE_CHANNELS` へのホワイトリスト登録    |
| TASK-9B（skill-creator）  | Preload API メソッド追加、`safeInvoke` パターン、型定義の `packages/shared` 配置         |

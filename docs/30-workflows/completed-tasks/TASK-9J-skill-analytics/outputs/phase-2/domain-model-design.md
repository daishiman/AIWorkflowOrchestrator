# Phase 2 タスク1: ドメインモデル設計（型定義）

## メタ情報

| 項目         | 内容                                           |
| ------------ | ---------------------------------------------- |
| タスク       | タスク1: ドメインモデル設計                    |
| ファイルパス | `packages/shared/src/types/skill-analytics.ts` |
| 前提         | Phase 1 Task 3（型定義整合性確認）             |
| 作成日       | 2026-02-28                                     |

## 目的

`packages/shared/src/types/skill-analytics.ts` に配置する共有型8インターフェースを確定し、IPC境界で型変換コードが不要となる設計を定義する。

## IPC シリアライズ方針

Phase 1 Task 3 で確定した方針に従い、`skill-schedule.ts`（TASK-9G）のパターンに準拠する。

- 日時フィールドは全て `string`（ISO 8601）で定義する
- Main Process 内部では `Date` オブジェクトを使用し、IPC 境界で `.toISOString()` に変換する
- `Date` 型は共有型ファイル内で使用しない

## 8インターフェースの完全な型定義

### 1. SkillUsageEvent（使用イベント記録）

スキル実行時に記録される個別イベント。永続化ストアの基本単位となる。

```typescript
/**
 * スキル使用イベント
 *
 * スキル実行時に記録される個別イベント。
 * AnalyticsStore の基本永続化単位。
 */
export interface SkillUsageEvent {
  /** イベントの一意識別子（UUID v4） */
  id: string;
  /** 使用したスキル名 */
  skillName: string;
  /** イベント種別 */
  eventType: "execution" | "error" | "cancellation";
  /** 記録日時（ISO 8601） */
  timestamp: string;
  /** 実行成功フラグ */
  success: boolean;
  /** 使用されたツール名の配列（空配列許可） */
  toolsUsed: string[];
  /** 実行時間（ミリ秒、完了時のみ） */
  duration?: number;
  /** エラーメッセージ（eventType === "error" 時のみ） */
  errorMessage?: string;
  /** トークン消費量（取得可能な場合のみ） */
  tokenCount?: number;
}
```

**フィールド仕様:**

| フィールド     | 型                                         | 必須 | 制約                                          |
| -------------- | ------------------------------------------ | ---- | --------------------------------------------- |
| `id`           | `string`                                   | 必須 | UUID v4。AnalyticsStore.addEvent() で自動付与 |
| `skillName`    | `string`                                   | 必須 | P42準拠: 空文字列・トリム空文字列を禁止       |
| `eventType`    | `"execution" \| "error" \| "cancellation"` | 必須 | 3値のいずれか                                 |
| `timestamp`    | `string`                                   | 必須 | ISO 8601形式。未指定時はMain側で自動補完      |
| `success`      | `boolean`                                  | 必須 | 実行成功フラグ                                |
| `toolsUsed`    | `string[]`                                 | 必須 | 空配列許可。各要素は文字列                    |
| `duration`     | `number \| undefined`                      | 任意 | 非負整数（ミリ秒）                            |
| `errorMessage` | `string \| undefined`                      | 任意 | エラー時のメッセージ                          |
| `tokenCount`   | `number \| undefined`                      | 任意 | 非負整数                                      |

### 2. ToolUsageStat（ツール別使用統計）

特定スキルで使用されたツールの統計情報。`SkillStatistics.mostUsedTools` の要素型。

```typescript
/**
 * ツール別使用統計
 *
 * 特定スキルにおけるツールの使用頻度を表す。
 */
export interface ToolUsageStat {
  /** ツール名 */
  toolName: string;
  /** 使用回数 */
  count: number;
  /** 全ツール使用回数に対する割合（0.0〜1.0） */
  percentage: number;
}
```

**フィールド仕様:**

| フィールド   | 型       | 必須 | 制約                         |
| ------------ | -------- | ---- | ---------------------------- |
| `toolName`   | `string` | 必須 | ツール名（スキル名ではない） |
| `count`      | `number` | 必須 | 非負整数                     |
| `percentage` | `number` | 必須 | 0.0〜1.0 の浮動小数点数      |

### 3. SkillStatistics（スキル別統計情報）

特定スキルの集計統計。`SkillAnalytics.getStatistics()` の戻り値型。

```typescript
/**
 * スキル別統計情報
 *
 * 特定スキルの全期間にわたる集計統計を表す。
 */
export interface SkillStatistics {
  /** スキル名 */
  skillName: string;
  /** 総実行回数 */
  totalExecutions: number;
  /** 成功率（0.0〜1.0。0件時は 0） */
  successRate: number;
  /** 平均実行時間（ミリ秒。duration定義イベントのみ対象。0件時は 0） */
  averageDuration: number;
  /** エラー率（0.0〜1.0。0件時は 0） */
  errorRate: number;
  /** 総トークン消費量（tokenCount未定義は 0 として合算） */
  totalTokens: number;
  /** 最終実行日時（ISO 8601。未実行時は null） */
  lastUsed?: string | null;
  /** ツール別使用統計（使用回数降順） */
  mostUsedTools: ToolUsageStat[];
}
```

**統計計算ルール:**

| 指標              | 計算式                                                          | 0件時 |
| ----------------- | --------------------------------------------------------------- | ----- |
| `successRate`     | `totalExecutions === 0 ? 0 : successCount / totalExecutions`    | `0`   |
| `averageDuration` | duration定義イベントのみの平均値                                | `0`   |
| `errorRate`       | `totalExecutions === 0 ? 0 : errorCount / totalExecutions`      | `0`   |
| `totalTokens`     | 全イベントの `tokenCount` 合計（`undefined` は `0` として扱う） | `0`   |

### 4. AnalyticsPeriod（集計期間）

トレンドデータやエクスポートの期間指定に使用する。

```typescript
/**
 * 集計期間
 *
 * トレンドデータの取得やエクスポートの期間指定に使用する。
 */
export interface AnalyticsPeriod {
  /** 集計開始日時（ISO 8601） */
  start: string;
  /** 集計終了日時（ISO 8601） */
  end: string;
  /** 集計粒度 */
  granularity: "hour" | "day" | "week" | "month";
}
```

**フィールド仕様:**

| フィールド    | 型                                     | 必須 | 制約                                          |
| ------------- | -------------------------------------- | ---- | --------------------------------------------- |
| `start`       | `string`                               | 必須 | ISO 8601形式。`start <= end` の関係を維持する |
| `end`         | `string`                               | 必須 | ISO 8601形式                                  |
| `granularity` | `"hour" \| "day" \| "week" \| "month"` | 必須 | 4値のいずれか                                 |

### 5. TrendDataPoint（トレンドデータポイント）

時系列上の1データポイント。`UsageTrend.dataPoints` の要素型。

```typescript
/**
 * トレンドデータポイント
 *
 * 指定粒度の1区間における集計値を表す。
 */
export interface TrendDataPoint {
  /** データポイントの日時（ISO 8601。区間の開始時刻） */
  timestamp: string;
  /** 実行回数 */
  executions: number;
  /** エラー回数 */
  errors: number;
  /** 平均実行時間（ミリ秒。duration定義イベントのみ対象。0件時は 0） */
  avgDuration: number;
}
```

**フィールド仕様:**

| フィールド    | 型       | 必須 | 制約                         |
| ------------- | -------- | ---- | ---------------------------- |
| `timestamp`   | `string` | 必須 | ISO 8601形式。区間の開始時刻 |
| `executions`  | `number` | 必須 | 非負整数                     |
| `errors`      | `number` | 必須 | 非負整数                     |
| `avgDuration` | `number` | 必須 | 非負浮動小数点数。0件時は 0  |

### 6. UsageTrend（使用トレンドデータ）

指定スキルの時系列トレンド。`SkillAnalytics.getUsageTrend()` の戻り値型。

```typescript
/**
 * 使用トレンドデータ
 *
 * 指定スキルの指定期間における時系列データを表す。
 */
export interface UsageTrend {
  /** 集計期間 */
  period: AnalyticsPeriod;
  /** データポイント一覧（時系列順） */
  dataPoints: TrendDataPoint[];
}
```

### 7. SkillUsageSummary（スキル別サマリー）

全体サマリーにおける個別スキルの概要情報。`AnalyticsSummary.mostUsedSkills` の要素型。

```typescript
/**
 * スキル別サマリー
 *
 * AnalyticsSummary 内の個別スキルの概要情報。
 */
export interface SkillUsageSummary {
  /** スキル名 */
  skillName: string;
  /** 実行回数 */
  executionCount: number;
  /** 最終実行日時（ISO 8601。未実行時は null） */
  lastUsed?: string | null;
}
```

### 8. AnalyticsSummary（全体サマリー）

全スキル横断のダッシュボード用サマリー。`SkillAnalytics.getSummary()` の戻り値型。

```typescript
/**
 * 全体サマリー
 *
 * 全スキル横断のダッシュボード用集計データ。
 */
export interface AnalyticsSummary {
  /** 統計対象のスキル総数（1回以上イベント記録があるスキル数） */
  totalSkills: number;
  /** 全スキルの総実行回数 */
  totalExecutions: number;
  /** 全体の成功率（0.0〜1.0。0件時は 0） */
  overallSuccessRate: number;
  /** スキル別サマリー一覧（実行回数降順） */
  mostUsedSkills: SkillUsageSummary[];
  /** 最近の実行イベント（最新が先頭、上限あり） */
  recentActivity: SkillUsageEvent[];
}
```

**補足:**

- `mostUsedSkills` は実行回数降順でソートする
- `recentActivity` は最新イベントが先頭。最大件数は実装定数 `MAX_RECENT_ACTIVITY`（Phase 5 で定義）で制限する

## index.ts re-export 方針

`packages/shared/src/types/index.ts` に以下の1行を追加する。

```typescript
// スキル分析型定義 (TASK-9J)
export * from "./skill-analytics.js";
```

**配置場所**: 既存の `export * from "./skill-schedule";` の直後。

**根拠**: 既存のスキル関連ファイル（`skill.ts`, `skill-share.ts`, `skill-schedule.ts`, `skill-improver.ts`）が全て `export *` パターンを使用しているため、同一パターンを踏襲する。

## ファイル先頭コメント

```typescript
/**
 * Skill Analytics Types - スキル使用統計・分析機能の型定義
 *
 * TASK-9J: スキル使用統計・分析機能
 *
 * IPC シリアライズ方針:
 * - 日時フィールド（timestamp, lastUsed, start, end）は全て string（ISO 8601）で定義
 * - Main Process 内部では Date オブジェクトを使用し、IPC 境界で .toISOString() に変換する
 *
 * @see docs/30-workflows/TASK-9J-skill-analytics/phase-2-design.md
 */
```

## skillCreator.ts の UsageStats との関係

Phase 1 Task 3 で分析した通り、`skillCreator.ts` の `UsageStats` は SkillCreator サービス固有の簡易統計であり、本タスクの `SkillStatistics` とは設計意図が異なる。独立して新規定義し、将来的な統合は Phase 12 の未タスク検出で対応する。

## 完了条件

- [x] 8インターフェース（SkillUsageEvent, ToolUsageStat, SkillStatistics, AnalyticsPeriod, TrendDataPoint, UsageTrend, SkillUsageSummary, AnalyticsSummary）が確定している
- [x] 全日時フィールドが `string`（ISO 8601）で統一されている
- [x] 各フィールドの型・必須/任意・制約が明示されている
- [x] 統計計算ルール（successRate, averageDuration, errorRate, totalTokens）の0件時挙動が定義されている
- [x] index.ts の re-export 方針が確定している
- [x] ファイル先頭コメントの方針が確定している

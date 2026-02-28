# Phase 1 Task 3: 型定義整合性確認

## 1. 既存型定義の調査結果

### skill.ts の既存型

`packages/shared/src/types/skill.ts` には以下の型が定義されている:

#### Branded Type

```typescript
declare const __skillBrand: unique symbol;
export type SkillBrand<B extends string> = string & {
  readonly [__skillBrand]?: B;
};

export type SkillId = SkillBrand<"SkillId">; // ハッシュ値
export type SkillName = SkillBrand<"SkillName">; // ディレクトリ名/表示名

export const toSkillId = (value: string): SkillId => value as SkillId;
export const toSkillName = (value: string): SkillName => value as SkillName;
```

- `SkillId`: スキルの一意識別子（パスのハッシュ値）
- `SkillName`: スキルの表示名/ディレクトリ名
- Branded Type により `SkillId` と `SkillName` の相互代入を型レベルで禁止
- `string` とは互換性あり（`string & { ... }` 型のため）

#### 主要インターフェース

| 型名                | 用途                     | 日時フィールド                                                   |
| ------------------- | ------------------------ | ---------------------------------------------------------------- |
| `Skill`             | スキル基本情報           | `lastModified: Date`                                             |
| `SkillDetail`       | スキル詳細（Skill拡張）  | (Skill継承)                                                      |
| `SkillMetadata`     | SKILL.md frontmatter     | `updatedAt: Date`                                                |
| `ImportedSkill`     | インポート済みスキル     | `importedAt: Date`                                               |
| `SkillImportConfig` | インポート設定（永続化） | `lastUpdated: string`                                            |
| `SkillRunResult`    | 実行結果                 | `startedAt: Date`, `completedAt: Date`                           |
| `SkillScanResult`   | スキャン結果             | `scannedAt: Date`                                                |
| `ExecutionInfo`     | 実行情報                 | `startedAt: number`, `completedAt?: number` (UNIXタイムスタンプ) |

**注目点**: 日時の表現方法が混在している:

- `Date` オブジェクト: `Skill.lastModified`, `SkillMetadata.updatedAt`, `ImportedSkill.importedAt`, `SkillRunResult.startedAt/completedAt`
- `string` (ISO 8601): `SkillImportConfig.lastUpdated`
- `number` (UNIXタイムスタンプ): `ExecutionInfo.startedAt/completedAt`, `BaseStreamMessage.timestamp`

### index.ts のエクスポート構成

```typescript
// パターン1: export * (全量re-export)
export * from "./skill";
export * from "./skill-improver";
export * from "./auth-mode";
export * from "./skill-share";
export * from "./skill-schedule";

// パターン2: export type { ... } (選択的re-export)
export type { AgentMessage, AgentExecutionState, ... } from "./agent";
export type { PermissionMode, ... } from "./agent-execution";

// パターン3: 値のエクスポート
export { AGENT_DEFAULTS, DANGEROUS_PATTERNS } from "./agent-execution";
export { DEFAULT_SLIDE_SETTINGS } from "./slideSettings";
```

**スキル関連ファイルの傾向**: `skill.ts`, `skill-improver.ts`, `skill-share.ts`, `skill-schedule.ts` は全て `export *` パターンを使用。

### 他の型定義ファイルのパターン

#### skill-share.ts (TASK-9F)

- モジュールドキュメントコメント: `/** スキル共有・インポート機能の型定義 */` + `@see` 参照
- 日時フィールド: `importedAt: string` (ISO 8601形式、コメントで明記)
- エラー型: 独自の `ShareError` / `ShareResult<T>` パターン
- ファイル先頭のモジュールコメントあり

#### skill-schedule.ts (TASK-9G)

- ファイル先頭に IPC シリアライズ方針を明記:
  > 日時フィールドは全て string（ISO 8601）で定義。Main Process 内部では Date オブジェクトを使用し、IPC 境界で .toISOString() に変換する
- 全日時フィールドが `string` 型（ISO 8601）
- `| null` を nullable フィールドに使用: `lastRun?: string | null`

#### skill-improver.ts (TASK-9C)

- セクションコメントでカテゴリ分け: `// ========================================`
- `@module` タグ使用
- 日時フィールド: `analyzedAt?: Date`, `executedAt: Date` (Date オブジェクト)
- IPC リクエスト/レスポンス型を同ファイル内に定義

#### skillCreator.ts (TASK-9B-G)

- **既存の `UsageStats` 型が存在**:

```typescript
export interface UsageStats {
  skillName: string;
  period: string;
  executionCount: number;
  successCount: number;
  failureCount: number;
  averageDuration: number;
  topTools: Array<{ tool: string; count: number }>;
  hourlyDistribution: Record<string, number>;
  errorTrends: Array<{ date: string; count: number }>;
}
```

- TASK-9J の `SkillStatistics` / `AnalyticsSummary` と機能的に重複する可能性がある
- `skillName` は `string` 型で定義（Branded Type未使用）

#### auth-mode.ts

- セクション区切り: `// =============================================================================`
- 定数を同ファイル内で定義（`as const`）
- IPC 型もファイル内に配置
- エラーコード体系: 数値コード + Record<Code, Message> パターン

## 2. 新規型定義の設計方針

### Branded Type との連携

#### 方針: `SkillName` Branded Type を積極的に使用する

新規型定義では、スキル名を参照するフィールドに `SkillName` Branded Type を使用する。

**理由**:

1. `skill.ts` の `SkillExecutionRequest.skillName` は `SkillName` 型を使用している
2. analytics 型はスキル実行のイベント記録が主用途であり、実行パスと型の一貫性を保つべき
3. Branded Type は `string` 互換のため、IPC シリアライズ時に変換不要

**適用箇所**:

- `SkillUsageEvent.skillName: SkillName`
- `SkillStatistics` のキー（スキル名でインデックスする場合）
- `UsageTrend.skillName: SkillName`
- `SkillUsageSummary.skillName: SkillName`

**例外**:

- `ToolUsageStat.toolName: string` — ツール名はスキル名ではないため `string` のまま

### IPC 境界の Date 型シリアライズ方針

#### 方針: `skill-schedule.ts` (TASK-9G) のパターンに準拠する

TASK-9G で確立されたパターンに従い、IPC 境界を越える型では日時フィールドを **`string` (ISO 8601)** で統一する。

```typescript
// ✅ 採用パターン（skill-schedule.ts 準拠）
export interface SkillUsageEvent {
  /** 記録日時（ISO 8601） */
  timestamp: string;
  /** 最終実行日時（ISO 8601） */
  lastExecutedAt?: string;
}
```

**理由**:

1. `skill-schedule.ts` のファイル先頭コメントで方針が明文化されている
2. JSON シリアライズで `Date` → `string` の暗黙変換に依存するとバグの原因になる
3. IPC境界（Main ↔ Renderer）を越えるデータは必ず文字列化されるため、型定義でそれを明示すべき
4. `skill-share.ts` の `ShareImportResult.importedAt: string` も同じパターン

**ファイル先頭に方針コメントを記載**:

```typescript
/**
 * Skill Analytics Types - スキル使用分析の型定義
 *
 * TASK-9J: スキル使用分析機能
 *
 * IPC シリアライズ方針:
 * - 日時フィールド（timestamp, lastExecutedAt 等）は全て string（ISO 8601）で定義
 * - Main Process 内部では Date オブジェクトを使用し、IPC 境界で .toISOString() に変換する
 */
```

### エクスポート方針

#### 方針: `export *` パターンで index.ts に追加

既存のスキル関連ファイル（`skill-share.ts`, `skill-schedule.ts`, `skill-improver.ts`）と同様に:

```typescript
// index.ts に追加
// スキル分析型定義 (TASK-9J)
export * from "./skill-analytics";
```

**配置場所**: `// スキルスケジュール型定義 (TASK-9G)` の直後に追加。

### skillCreator.ts の UsageStats との関係

#### 方針: 独立して新規定義し、将来的な統合は未タスク化する

`skillCreator.ts` の `UsageStats` は SkillCreator サービス（TASK-9B）のスタブ型として定義されており、以下の相違がある:

| 項目         | `UsageStats` (skillCreator.ts)               | `SkillStatistics` (新規)                          |
| ------------ | -------------------------------------------- | ------------------------------------------------- |
| スキル名の型 | `string`                                     | `SkillName` (Branded Type)                        |
| 期間の表現   | `period: string`                             | `AnalyticsPeriod` (構造化)                        |
| トークン情報 | なし                                         | `totalTokens: number`                             |
| ツール統計   | `topTools: Array<{tool, count}>`             | `toolUsageStats: ToolUsageStat[]` (avg含む)       |
| 時間分布     | `hourlyDistribution: Record<string, number>` | `TrendDataPoint[]` (構造化)                       |
| エラー傾向   | `errorTrends: Array<{date, count}>`          | `errorRate: number` + `TrendDataPoint.errorCount` |
| 日時の型     | なし                                         | `string` (ISO 8601)                               |

**理由**:

1. `UsageStats` は SkillCreator 固有の簡易統計であり、analytics の詳細統計とは設計意図が異なる
2. Branded Type の使用有無が異なる
3. 現時点で `UsageStats` を変更すると、既存の SkillCreator テストに影響する

**将来課題**: `UsageStats` を `SkillStatistics` に統合・廃止するタスクを Phase 12 で未タスク化する。

## 3. 新規型リスト（確定版）

### ファイル: `packages/shared/src/types/skill-analytics.ts`

#### 3.1 SkillUsageEvent（使用イベント記録）

```typescript
export interface SkillUsageEvent {
  /** 使用したスキル名 */
  skillName: SkillName;
  /** イベント種別 */
  eventType:
    | "execution_start"
    | "execution_success"
    | "execution_error"
    | "execution_cancel";
  /** 記録日時（ISO 8601） */
  timestamp: string;
  /** 実行時間（ミリ秒、完了時のみ） */
  durationMs?: number;
  /** トークン使用量（取得可能な場合のみ） */
  tokenUsage?: number;
  /** エラーメッセージ（エラー時のみ） */
  errorMessage?: string;
  /** 使用されたツール一覧 */
  toolsUsed?: string[];
}
```

#### 3.2 ToolUsageStat（ツール別使用統計）

```typescript
export interface ToolUsageStat {
  /** ツール名 */
  toolName: string;
  /** 使用回数 */
  usageCount: number;
  /** 平均実行時間（ミリ秒） */
  avgDuration: number;
}
```

#### 3.3 SkillStatistics（スキル別統計情報）

```typescript
export interface SkillStatistics {
  /** スキル名 */
  skillName: SkillName;
  /** 総実行回数 */
  totalExecutions: number;
  /** 成功率（0.0〜1.0） */
  successRate: number;
  /** 平均実行時間（ミリ秒） */
  avgDuration: number;
  /** エラー率（0.0〜1.0） */
  errorRate: number;
  /** 総トークン使用量 */
  totalTokens: number;
  /** 最終実行日時（ISO 8601、未実行時は null） */
  lastExecutedAt: string | null;
  /** ツール別使用統計 */
  toolUsageStats: ToolUsageStat[];
}
```

#### 3.4 AnalyticsPeriod（集計期間）

```typescript
export type AnalyticsGranularity = "hour" | "day" | "week" | "month";

export interface AnalyticsPeriod {
  /** 集計開始日時（ISO 8601） */
  start: string;
  /** 集計終了日時（ISO 8601） */
  end: string;
  /** 集計粒度 */
  granularity: AnalyticsGranularity;
}
```

#### 3.5 TrendDataPoint（トレンドデータポイント）

```typescript
export interface TrendDataPoint {
  /** データポイントのラベル（日付文字列、時刻等） */
  label: string;
  /** 実行回数 */
  executionCount: number;
  /** 成功回数 */
  successCount: number;
  /** エラー回数 */
  errorCount: number;
  /** 平均実行時間（ミリ秒） */
  avgDuration: number;
  /** トークン使用量 */
  tokenUsage: number;
}
```

#### 3.6 UsageTrend（使用トレンドデータ）

```typescript
export interface UsageTrend {
  /** スキル名 */
  skillName: SkillName;
  /** 集計期間 */
  period: AnalyticsPeriod;
  /** データポイント一覧 */
  dataPoints: TrendDataPoint[];
}
```

#### 3.7 SkillUsageSummary（スキル別サマリー）

```typescript
export interface SkillUsageSummary {
  /** スキル名 */
  skillName: SkillName;
  /** 実行回数 */
  executionCount: number;
  /** 成功率（0.0〜1.0） */
  successRate: number;
  /** 最終実行日時（ISO 8601、未実行時は null） */
  lastExecutedAt: string | null;
}
```

#### 3.8 AnalyticsSummary（全体サマリー）

```typescript
export interface AnalyticsSummary {
  /** 統計対象のスキル総数 */
  totalSkills: number;
  /** 全体の総実行回数 */
  totalExecutions: number;
  /** 全体の成功率（0.0〜1.0） */
  overallSuccessRate: number;
  /** スキル別サマリー一覧 */
  skillUsageSummaries: SkillUsageSummary[];
  /** 最近の実行イベント（最新が先頭） */
  recentActivity: SkillUsageEvent[];
}
```

## 4. 整合性確認の結論

### 整合性が確認された項目

| 確認項目             | 結果 | 詳細                                                                                                           |
| -------------------- | ---- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | -------------- |
| Branded Type 連携    | 整合 | `SkillName` を `skillName` フィールドに使用。`skill.ts` の `SkillExecutionRequest.skillName: SkillName` と一致 |
| IPC シリアライズ方針 | 整合 | `skill-schedule.ts` (TASK-9G) パターンに準拠。日時は全て `string` (ISO 8601)                                   |
| ドキュメントコメント | 整合 | `skill-schedule.ts`, `skill-improver.ts` と同じ JSDoc スタイル                                                 |
| エクスポート方針     | 整合 | `export *` パターンで `index.ts` に追加                                                                        |
| セクション区切り     | 整合 | `// ========` パターンを使用                                                                                   |
| nullable フィールド  | 整合 | `string                                                                                                        | null` パターン（`skill-schedule.ts`の`lastRun?: string | null` と同様） |

### 潜在的な懸念点

| 懸念                                        | リスク | 対策                                                                     |
| ------------------------------------------- | ------ | ------------------------------------------------------------------------ |
| `UsageStats` (skillCreator.ts) との機能重複 | 低     | 設計意図が異なるため独立定義。Phase 12 で統合タスクを未タスク化          |
| `SkillName` Branded Type が `string` 互換   | なし   | IPC シリアライズで追加変換不要。JSON.stringify/parse で透過的            |
| `successRate` / `errorRate` が 0.0〜1.0     | 低     | コメントで範囲を明記。バリデーションは実装層（Phase 5）で対応            |
| `recentActivity` の上限                     | 低     | 実装層で最大件数を定数化（Phase 5 で ANALYTICS_DEFAULTS として定義予定） |

### 型ファイルの命名規則

| 既存ファイル                   | 命名パターン                             |
| ------------------------------ | ---------------------------------------- |
| `skill-share.ts`               | `skill-{機能名}.ts`                      |
| `skill-schedule.ts`            | `skill-{機能名}.ts`                      |
| `skill-improver.ts`            | `skill-{機能名}.ts`                      |
| **新規: `skill-analytics.ts`** | `skill-{機能名}.ts` — 既存パターンに準拠 |

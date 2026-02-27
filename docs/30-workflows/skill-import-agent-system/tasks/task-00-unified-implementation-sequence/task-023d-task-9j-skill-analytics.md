---
id: TASK-9J
title: スキル使用統計・分析機能実装
tier: 3
phase: 9
depends_on: [TASK-9B]
parallel_with: [TASK-9D, TASK-9E, TASK-9F, TASK-9G, TASK-9H, TASK-9I]
blocks: []
status: pending
priority: low
estimated_complexity: medium
tags:
  [backend, main, skill-management, analytics, statistics, dashboard, future]

execution:
  mode: sequential
  timeout_minutes: 60
  retry_count: 1
  allow_partial: false

verification:
  auto_verify: true
  require_tests: true
  require_typecheck: true

artifacts:
  creates:
    - apps/desktop/src/main/services/skill/SkillAnalytics.ts
    - apps/desktop/src/main/services/skill/AnalyticsStore.ts
    - packages/shared/src/types/skill-analytics.ts
  # UI成果物は ./task-031b-ui-05b-skill-advanced-views.md#3D で定義
  modifies:
    - packages/shared/src/types/index.ts
    - apps/desktop/src/main/ipc/skillHandlers.ts
    - apps/desktop/src/preload/channels.ts
    - apps/desktop/src/preload/skill-api.ts
    - apps/desktop/src/preload/types.ts
---

# スキル使用統計・分析機能実装

## 概要

スキルの使用状況を記録・集計し、ダッシュボードで可視化する機能。

## 入力

- TASK-9B: skill-creator スキル（statsコマンド追加済み）
- specification.md §24: 使用統計・分析機能仕様
- technical-decisions.md §25: 設計判断

## 出力

- SkillAnalytics サービス
- AnalyticsStore 永続化
- AnalyticsDashboard UI コンポーネント

## 実装手順

### Step 1: 型定義追加

**ファイル**: `packages/shared/src/types/skill-analytics.ts`

```typescript
export interface SkillUsageEvent {
  id: string;
  skillName: string;
  eventType: "execution" | "error" | "cancellation";
  /** @format ISO 8601 — IPC経由では string として送受信 */
  timestamp: string; // ISO 8601
  duration?: number;
  success: boolean;
  errorMessage?: string;
  toolsUsed: string[];
  tokenCount?: number;
}

export interface SkillStatistics {
  skillName: string;
  totalExecutions: number;
  successRate: number;
  averageDuration: number;
  /** @format ISO 8601 */
  lastUsed?: string | null; // ISO 8601
  mostUsedTools: ToolUsageStat[];
  errorRate: number;
  totalTokens: number;
}

export interface ToolUsageStat {
  toolName: string;
  count: number;
  percentage: number;
}

export interface AnalyticsPeriod {
  /** @format ISO 8601 — Renderer から送信時も ISO 8601 文字列を使用 */
  start: string; // ISO 8601
  /** @format ISO 8601 */
  end: string; // ISO 8601
  granularity: "hour" | "day" | "week" | "month";
}

export interface UsageTrend {
  period: AnalyticsPeriod;
  dataPoints: TrendDataPoint[];
}

export interface TrendDataPoint {
  /** @format ISO 8601 */
  timestamp: string; // ISO 8601
  executions: number;
  errors: number;
  avgDuration: number;
}

export interface AnalyticsSummary {
  totalSkills: number;
  totalExecutions: number;
  overallSuccessRate: number;
  mostUsedSkills: SkillUsageSummary[];
  recentActivity: SkillUsageEvent[];
}

export interface SkillUsageSummary {
  skillName: string;
  executionCount: number;
  /** @format ISO 8601 */
  lastUsed?: string | null; // ISO 8601
}
```

### IPC シリアライズ方針（Date 型）

本タスクの Date 型フィールドは IPC 経由で ISO 8601 文字列（`string`）として送受信する。

- **バックエンド（Main Process）内部**: `Date` オブジェクトを使用
- **IPC 境界（ハンドラ戻り値）**: `.toISOString()` で ISO 8601 文字列に変換
- **Renderer 側**: `string` として受け取り、表示時に `new Date(isoString)` で復元

この方針は以下の理由に基づく:

1. contextBridge の Structured Clone は Date を保持するが、JSON API（Web版）では string に変換される
2. ISO 8601 文字列であれば `new Date()` で確実に復元可能
3. IPC 型とドメイン型の混在を避け、型安全性を維持

### Step 2: AnalyticsStore 実装

**ファイル**: `apps/desktop/src/main/services/skill/AnalyticsStore.ts`

- electron-store による使用データ永続化
- イベント記録
- 集計クエリ
- データエクスポート

### Step 3: SkillAnalytics 実装

**ファイル**: `apps/desktop/src/main/services/skill/SkillAnalytics.ts`

```typescript
export class SkillAnalytics {
  async recordEvent(event: Omit<SkillUsageEvent, "id">): Promise<void>;

  async getStatistics(skillName: string): Promise<SkillStatistics>;

  async getSummary(): Promise<AnalyticsSummary>;

  async getUsageTrend(
    skillName: string,
    period: AnalyticsPeriod,
  ): Promise<UsageTrend>;

  async getAllSkillsStatistics(): Promise<SkillStatistics[]>;

  async exportData(
    format: "json" | "csv",
    period?: AnalyticsPeriod,
  ): Promise<string>;

  async clearData(before?: Date): Promise<void>;

  private calculateStatistics(events: SkillUsageEvent[]): SkillStatistics;
  private aggregateByPeriod(
    events: SkillUsageEvent[],
    granularity: string,
  ): TrendDataPoint[];
}
```

### Step 4: IPC拡張

**チャネル追加**:

- `skill:analytics:record` - イベント記録
- `skill:analytics:statistics` - 統計取得
- `skill:analytics:summary` - サマリー取得
- `skill:analytics:trend` - トレンド取得
- `skill:analytics:export` - データエクスポート

### Step 5: AnalyticsDashboard 実装

> **📐 UI仕様は本ディレクトリの UI タスク（task-030/031/032）に移管済み**
>
> Apple HIG 準拠の UI 仕様: [05B-skill-advanced-views.md#3d-analyticsdashboard](./task-031b-ui-05b-skill-advanced-views.md#3d-analyticsdashboard)
>
> 本ファイルはバックエンドサービス・IPC 契約・型定義のみを定義します。

### Step 6: UsageChart 実装

> **📐 UI仕様は本ディレクトリの UI タスク（task-030/031/032）に移管済み**
>
> Apple HIG 準拠の UI 仕様: [05B-skill-advanced-views.md#3d-analyticsdashboard](./task-031b-ui-05b-skill-advanced-views.md#3d-analyticsdashboard)
>
> 本ファイルはバックエンドサービス・IPC 契約・型定義のみを定義します。

## 依存パッケージ

```bash
# チャートライブラリ
pnpm --filter @repo/desktop add recharts
```

## スキル実行時の自動記録

スキル実行時に自動的に使用イベントを記録:

```typescript
// SkillInvoker内での統合
async executeSkill(skillName: string, prompt: string) {
  const startTime = Date.now();
  const toolsUsed: string[] = [];

  try {
    const result = await this.runSkill(skillName, prompt, {
      onToolUse: (toolName) => toolsUsed.push(toolName),
    });

    await this.analytics.recordEvent({
      skillName,
      eventType: "execution",
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime,
      success: true,
      toolsUsed,
      tokenCount: result.tokenUsage?.total,
    });

    return result;
  } catch (error) {
    await this.analytics.recordEvent({
      skillName,
      eventType: "error",
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime,
      success: false,
      errorMessage: error.message,
      toolsUsed,
    });
    throw error;
  }
}
```

## 検証条件

### 必須条件

- [ ] スキル実行時に使用イベントが記録される
- [ ] スキル別の統計が取得できる
- [ ] ダッシュボードにサマリーが表示される
- [ ] 使用トレンドグラフが表示される
- [ ] CSV/JSONエクスポートが機能する

### 自動検証コマンド

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop test -- --grep "SkillAnalytics"
```

## 関連仕様

- specification.md §24: 使用統計・分析機能
- technical-decisions.md §25: 設計判断

# Phase 2: 設計 — TASK-9J スキル使用統計・分析機能

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 2                       |
| Phase名    | 設計                    |
| 前提Phase  | Phase 1（要件定義）     |
| 後続Phase  | Phase 3（設計レビュー） |
| ステータス | 未実施                  |
| 作成日     | 2026-02-28              |
| 機能名     | TASK-9J-skill-analytics |

## 目的

Phase 1 で定義した要件（FR-1〜FR-6、NFR-1〜NFR-4）を、実装可能な設計へ具体化する。特に以下を単一契約へ統一する。

- 共有型（`packages/shared/src/types/skill-analytics.ts`）の8インターフェース
- IPC契約（5チャンネル）とPreload API（`window.electronAPI.skill.analytics*`）
- レイヤー依存方向（Renderer → Preload → Main → Store）

## 背景

TASK-9J は UI スコープ外であり、Main Process の統計サービス・IPC境界・共有型が主対象となる。既存の skill 系実装パターン（`window.electronAPI.skill` 統一、`validateIpcSender`、`safeInvokeUnwrap`、P42 バリデーション）に合わせて、契約ドリフトが起きない設計を最優先とする。

## 関心ごと分離（SubAgent分担）

| SubAgent | 担当タスク | 関心ごと（責務）                  |
| -------- | ---------- | --------------------------------- |
| A        | タスク1, 4 | 型契約・Preload公開契約           |
| B        | タスク2    | サービス責務・依存方向            |
| C        | タスク3, 5 | IPC契約・セキュリティ・エラー契約 |
| D        | タスク6    | テスト戦略・品質ゲート整合        |
| E        | 全体統合   | Phase 1/3/4/5との整合確認         |

## 実行タスク

### タスク1: ドメインモデル設計（型定義）

**目的**: `packages/shared/src/types/skill-analytics.ts` に配置する共有型を確定する。

**実行手順**:

1. 以下の8インターフェースを定義する（`Date` は IPC境界で ISO 8601 文字列として扱う）。

```typescript
export interface SkillUsageEvent {
  id: string;
  skillName: string;
  eventType: "execution" | "error" | "cancellation";
  timestamp: string; // ISO 8601
  success: boolean;
  toolsUsed: string[];
  duration?: number;
  errorMessage?: string;
  tokenCount?: number;
}

export interface ToolUsageStat {
  toolName: string;
  count: number;
  percentage: number;
}

export interface SkillStatistics {
  skillName: string;
  totalExecutions: number;
  successRate: number;
  averageDuration: number;
  errorRate: number;
  totalTokens: number;
  lastUsed?: string | null; // ISO 8601
  mostUsedTools: ToolUsageStat[];
}

export interface AnalyticsPeriod {
  start: string; // ISO 8601
  end: string; // ISO 8601
  granularity: "hour" | "day" | "week" | "month";
}

export interface TrendDataPoint {
  timestamp: string; // ISO 8601
  executions: number;
  errors: number;
  avgDuration: number;
}

export interface UsageTrend {
  period: AnalyticsPeriod;
  dataPoints: TrendDataPoint[];
}

export interface SkillUsageSummary {
  skillName: string;
  executionCount: number;
  lastUsed?: string | null; // ISO 8601
}

export interface AnalyticsSummary {
  totalSkills: number;
  totalExecutions: number;
  overallSuccessRate: number;
  mostUsedSkills: SkillUsageSummary[];
  recentActivity: SkillUsageEvent[];
}
```

2. `packages/shared/src/types/index.ts` に `export * from "./skill-analytics.js";` を追加する。
3. `SkillUsageEvent.timestamp`, `SkillStatistics.lastUsed`, `AnalyticsPeriod.start/end`, `TrendDataPoint.timestamp` を ISO 8601 文字列で統一する。

**期待される成果物**:

- `outputs/phase-2/domain-model-design.md`

### タスク2: アーキテクチャ設計

**目的**: 永続化層と集計ロジック層の責務を分離し、変更影響を局所化する。

#### AnalyticsStore（永続化層）

**ファイルパス**: `apps/desktop/src/main/services/skill/AnalyticsStore.ts`

| メソッド            | 引数                                 | 戻り値              | 責務                          |
| ------------------- | ------------------------------------ | ------------------- | ----------------------------- |
| `getAllEvents`      | なし                                 | `SkillUsageEvent[]` | 全件取得                      |
| `getEventsBySkill`  | `skillName: string`                  | `SkillUsageEvent[]` | スキル名フィルタ              |
| `getEventsByPeriod` | `period: AnalyticsPeriod`            | `SkillUsageEvent[]` | 期間フィルタ（start/end含む） |
| `addEvent`          | `event: Omit<SkillUsageEvent, "id">` | `SkillUsageEvent`   | UUID付与して保存              |
| `clearBefore`       | `before: Date`                       | `void`              | 指定日時以前を削除            |
| `clearAll`          | なし                                 | `void`              | 全削除                        |

内部実装方針:

- `electron-store` キー: `skill-analytics-events`
- 永続化形式: `SkillUsageEvent[]`（日時は ISO 8601 文字列）
- 復元時は `Array.isArray` + 要素バリデーションで破損データを除外（P19対策）

#### SkillAnalytics（ビジネスロジック層）

**ファイルパス**: `apps/desktop/src/main/services/skill/SkillAnalytics.ts`

| メソッド                 | 引数                                                          | 戻り値                       | 責務                                        |
| ------------------------ | ------------------------------------------------------------- | ---------------------------- | ------------------------------------------- |
| `recordEvent`            | `event: Omit<SkillUsageEvent, "id"> & { timestamp?: string }` | `Promise<void>`              | イベント記録（timestamp未指定時は自動補完） |
| `getStatistics`          | `skillName: string`                                           | `Promise<SkillStatistics>`   | スキル別統計                                |
| `getSummary`             | なし                                                          | `Promise<AnalyticsSummary>`  | 全体サマリー                                |
| `getUsageTrend`          | `skillName: string, period: AnalyticsPeriod`                  | `Promise<UsageTrend>`        | 粒度別トレンド                              |
| `exportData`             | `format: "json" \| "csv", period?: AnalyticsPeriod`           | `Promise<string>`            | JSON/CSV エクスポート                       |
| `clearData`              | `before?: Date`                                               | `Promise<void>`              | 指定日時以前削除 / 全削除                   |
| `getAllSkillsStatistics` | なし                                                          | `Promise<SkillStatistics[]>` | 補助統計（必要時）                          |

統計計算ルール:

- `successRate = totalExecutions === 0 ? 0 : successCount / totalExecutions`
- `averageDuration = duration定義イベントのみ平均（0件なら0）`
- `errorRate = totalExecutions === 0 ? 0 : errorCount / totalExecutions`
- `totalTokens = tokenCount の合計（未定義は0）`

依存方向:

```text
Renderer
  -> Preload (window.electronAPI.skill.analytics*)
    -> IPC Handler (skillHandlers.ts)
      -> SkillAnalytics
        -> AnalyticsStore
          -> electron-store
```

**期待される成果物**:

- `outputs/phase-2/architecture-design.md`

### タスク3: IPCチャネル設計

**目的**: 5チャンネルの引数・戻り値・バリデーションを単一契約に統一する。

**実行手順**:

1. `apps/desktop/src/preload/channels.ts` に5定数を追加する。

```typescript
SKILL_ANALYTICS_RECORD: "skill:analytics:record",
SKILL_ANALYTICS_STATISTICS: "skill:analytics:statistics",
SKILL_ANALYTICS_SUMMARY: "skill:analytics:summary",
SKILL_ANALYTICS_TREND: "skill:analytics:trend",
SKILL_ANALYTICS_EXPORT: "skill:analytics:export",
```

2. `ALLOWED_INVOKE_CHANNELS` に上記5チャネルを追加する（`ALLOWED_ON_CHANNELS` 追加不要）。
3. 5チャンネルの契約を以下で固定する。

| チャネル                     | 引数                                                                                              | 成功レスポンス                              | 失敗レスポンス                      | バリデーション要点                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------ |
| `skill:analytics:record`     | `{ skillName, eventType, success, duration?, errorMessage?, toolsUsed, tokenCount?, timestamp? }` | `{ success: true }`                         | `{ success: false, error: string }` | `skillName` P42、`eventType` 3値、`duration/tokenCount` 非負、`toolsUsed` 文字列配列 |
| `skill:analytics:statistics` | `skillName: string`                                                                               | `{ success: true, data: SkillStatistics }`  | 同左                                | `skillName` P42                                                                      |
| `skill:analytics:summary`    | なし                                                                                              | `{ success: true, data: AnalyticsSummary }` | 同左                                | なし                                                                                 |
| `skill:analytics:trend`      | `{ skillName: string, period: AnalyticsPeriod }`                                                  | `{ success: true, data: UsageTrend }`       | 同左                                | `skillName` P42、`period.start/end` ISO 8601、`start <= end`、`granularity` 4値      |
| `skill:analytics:export`     | `{ format: "json" \| "csv", period?: AnalyticsPeriod }`                                           | `{ success: true, data: string }`           | 同左                                | `format` 2値、`period` 指定時は trend と同条件                                       |

共通セキュリティ契約:

- 全ハンドラで `validateIpcSender` を先頭実行
- 文字列引数は P42（型チェック -> 空文字列 -> trim空文字列）
- 予期しない例外は `"Internal error"` に正規化して返す

**期待される成果物**:

- `outputs/phase-2/ipc-channel-design.md`

### タスク4: Preload API設計

**目的**: Renderer 側公開面を既存 skill API と同一面に統合する。

**実行手順**:

1. `apps/desktop/src/preload/types.ts` の `SkillAPI` に5メソッドを追加する。

```typescript
analyticsRecord: (
  event: Omit<SkillUsageEvent, "id" | "timestamp"> & { timestamp?: string },
) => Promise<void>;
analyticsStatistics: (skillName: string) => Promise<SkillStatistics>;
analyticsSummary: () => Promise<AnalyticsSummary>;
analyticsTrend: (skillName: string, period: AnalyticsPeriod) =>
  Promise<UsageTrend>;
analyticsExport: (format: "json" | "csv", period?: AnalyticsPeriod) =>
  Promise<string>;
```

2. `apps/desktop/src/preload/skill-api.ts` では `window.electronAPI.skill` 配下に公開する。
3. ハンドラが `{ success, data }` ラッパーを返す契約に合わせ、`safeInvokeUnwrap` を使用する。

```typescript
analyticsRecord: (event) =>
  safeInvokeUnwrap<void>(IPC_CHANNELS.SKILL_ANALYTICS_RECORD, event),
analyticsStatistics: (skillName) =>
  safeInvokeUnwrap<SkillStatistics>(IPC_CHANNELS.SKILL_ANALYTICS_STATISTICS, skillName),
analyticsSummary: () =>
  safeInvokeUnwrap<AnalyticsSummary>(IPC_CHANNELS.SKILL_ANALYTICS_SUMMARY),
analyticsTrend: (skillName, period) =>
  safeInvokeUnwrap<UsageTrend>(IPC_CHANNELS.SKILL_ANALYTICS_TREND, { skillName, period }),
analyticsExport: (format, period) =>
  safeInvokeUnwrap<string>(IPC_CHANNELS.SKILL_ANALYTICS_EXPORT, { format, period }),
```

**期待される成果物**:

- `outputs/phase-2/preload-api-design.md`

### タスク5: エラーハンドリング設計

**目的**: バリデーションエラーと内部エラーを明確に分離し、情報漏えいを防止する。

**実行手順**:

1. エラーパターンを定義する。

| エラーパターン                   | 返却内容                                                                                | 発生箇所   |
| -------------------------------- | --------------------------------------------------------------------------------------- | ---------- |
| `skillName` 不正（型/空/trim空） | `{ success: false, error: "skillName must be a non-empty string" }`                     | IPC        |
| `eventType` 不正                 | `{ success: false, error: "eventType must be one of: execution, error, cancellation" }` | IPC        |
| `period` 不正                    | `{ success: false, error: "period must be a valid object" }`                            | IPC        |
| `period.start/end` 不正          | `{ success: false, error: "start/end must be valid ISO 8601 date strings" }`            | IPC        |
| `start > end`                    | `{ success: false, error: "period.start must be less than or equal to period.end" }`    | IPC        |
| `granularity` 不正               | `{ success: false, error: "granularity must be one of: hour, day, week, month" }`       | IPC        |
| `format` 不正                    | `{ success: false, error: "format must be one of: json, csv" }`                         | IPC        |
| `duration` 負数                  | `{ success: false, error: "duration must be a non-negative number" }`                   | IPC        |
| `tokenCount` 負数                | `{ success: false, error: "tokenCount must be a non-negative number" }`                 | IPC        |
| Sender検証失敗                   | IPCバリデータ既定エラー                                                                 | IPC        |
| 予期しない例外                   | `{ success: false, error: "Internal error" }`                                           | 全レイヤー |

2. 内部例外詳細（スタックトレース・内部パス）は Renderer に返さない。

**期待される成果物**:

- `outputs/phase-2/error-handling-design.md`

### タスク6: テスト設計（概要）

**目的**: Phase 4 のテスト実装へ直接引き継げる粒度でテスト観点を固定する。

**実行手順**:

1. テストファイル構成を以下で確定する。

| テストファイル                                                          | 対象                                           | 目安件数 |
| ----------------------------------------------------------------------- | ---------------------------------------------- | -------- |
| `packages/shared/src/types/__tests__/skill-analytics.test.ts`           | 型定義                                         | 8        |
| `apps/desktop/src/main/services/skill/__tests__/AnalyticsStore.test.ts` | 永続化・期間フィルタ・削除                     | 15       |
| `apps/desktop/src/main/services/skill/__tests__/SkillAnalytics.test.ts` | 統計・サマリー・トレンド・エクスポート・クリア | 29       |
| `apps/desktop/src/main/ipc/__tests__/skillAnalyticsHandlers.test.ts`    | IPC正常系/異常系/セキュリティ                  | 27       |

2. テスト観点を定義する。

- 正常系: 5チャンネルの成功パス
- 異常系: P42、period/format 不正、内部例外
- 境界値: 0件、1件、期間境界、10,000件
- セキュリティ: `validateIpcSender`、ハードコード禁止、エラー露出防止

**期待される成果物**:

- `outputs/phase-2/test-design.md`

## 参照資料

| 資料名                | パス                                                                                        | 用途                                   |
| --------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------- |
| Phase 1 要件仕様      | `outputs/phase-1/requirements-definition.md`                                                | FR/NFR の正本参照                      |
| IPC Agent仕様         | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | チャネル命名・契約                     |
| Skill SDK IF          | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | `window.electronAPI.skill` 契約        |
| 実装パターン          | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | `safeInvoke/safeInvokeUnwrap` 使い分け |
| IPC セキュリティ      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | sender検証・境界防御                   |
| Skill IPCセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | preload公開面の統一                    |
| IPC 契約チェック      | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | 契約検証手順                           |
| 品質要件              | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | カバレッジ基準                         |
| 開発ガイドライン      | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`               | テスト運用                             |
| エラーハンドリング    | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラー分類                             |

## 成果物

| 成果物                 | パス                                       | 形式     |
| ---------------------- | ------------------------------------------ | -------- |
| ドメインモデル設計     | `outputs/phase-2/domain-model-design.md`   | Markdown |
| アーキテクチャ設計     | `outputs/phase-2/architecture-design.md`   | Markdown |
| IPCチャネル設計        | `outputs/phase-2/ipc-channel-design.md`    | Markdown |
| Preload API設計        | `outputs/phase-2/preload-api-design.md`    | Markdown |
| エラーハンドリング設計 | `outputs/phase-2/error-handling-design.md` | Markdown |
| テスト設計             | `outputs/phase-2/test-design.md`           | Markdown |

## 統合テスト連携

| レイヤー       | テスト方針                                  |
| -------------- | ------------------------------------------- |
| AnalyticsStore | 永続化・期間フィルタ・削除を単体検証        |
| SkillAnalytics | 集計ロジックとゼロ件境界を単体検証          |
| IPCハンドラ    | 契約・P42・sender検証を単体検証             |
| Preload API    | `safeInvokeUnwrap` 経由の呼び出し契約を検証 |

## 完了条件

- [ ] タスク1: 8インターフェースが確定している
- [ ] タスク2: AnalyticsStore / SkillAnalytics の責務分離が定義されている
- [ ] タスク3: 5チャネルの引数・戻り値・バリデーション契約が定義されている
- [ ] タスク4: `window.electronAPI.skill.analytics*` 公開契約が定義されている
- [ ] タスク5: エラー分類と返却方針が定義されている
- [ ] タスク6: Phase 4 に直結するテスト設計が定義されている
- [ ] 全成果物が `outputs/phase-2/` に配置されている
- [ ] 曖昧な抽象語を使わず、判定条件が具体的に記述されている

## Phase末端アクション【必須】

1. 全成果物の存在を確認する
2. 完了条件チェックリストを全項目チェックする
3. Phase 3（設計レビュー）に進む

## 依存関係

- **前提**: Phase 1（要件定義）が完了していること

## 次のPhase

→ `phase-3-design-review.md`

# Phase 5: 実装（TDD: Green）— TASK-9J スキル使用統計・分析機能

## メタ情報

| 項目       | 値                                               |
| ---------- | ------------------------------------------------ |
| Phase      | 5                                                |
| 機能名     | TASK-9J-skill-analytics                          |
| 作成日     | 2026-02-28                                       |
| 前提Phase  | Phase 4（テスト作成・Red状態確認）               |
| 依存タスク | TASK-9B（SkillService / SkillExecutor 実装済み） |

## 目的

Phase 4 で作成した全テスト（79テスト）を通すための**最小限のプロダクションコード**を実装し、全テストが **Green 状態**（成功）であることを確認する。

## 実行タスク

### Task 1: 型定義実装

#### 1.1 スキル使用統計型定義

**対象ファイル**: `packages/shared/src/types/skill-analytics.ts`（新規作成）

以下の8インターフェースを定義する:

| 型名                | 説明                   | 必須フィールド                                                                   |
| ------------------- | ---------------------- | -------------------------------------------------------------------------------- |
| `SkillUsageEvent`   | 使用イベント           | id, skillName, eventType, timestamp, success, toolsUsed                          |
| `SkillStatistics`   | スキル別統計           | skillName, totalExecutions, successRate, averageDuration, errorRate, totalTokens |
| `ToolUsageStat`     | ツール使用統計         | toolName, count, percentage                                                      |
| `AnalyticsPeriod`   | 分析期間               | start, end, granularity                                                          |
| `UsageTrend`        | 使用トレンド           | period, dataPoints                                                               |
| `TrendDataPoint`    | トレンドデータポイント | timestamp, executions, errors, avgDuration                                       |
| `AnalyticsSummary`  | 全体サマリー           | totalSkills, totalExecutions, overallSuccessRate, mostUsedSkills, recentActivity |
| `SkillUsageSummary` | スキル使用サマリー     | skillName, executionCount                                                        |

**オプショナルフィールド**:

| 型名                | オプショナルフィールド                                           |
| ------------------- | ---------------------------------------------------------------- |
| `SkillUsageEvent`   | duration（number）、errorMessage（string）、tokenCount（number） |
| `SkillStatistics`   | lastUsed（`string \| null`）、mostUsedTools（ToolUsageStat[]）   |
| `SkillUsageSummary` | lastUsed（`string \| null`）                                     |

**ユニオン型定義**:

| 型名              | フィールド  | 値                                         |
| ----------------- | ----------- | ------------------------------------------ |
| `SkillUsageEvent` | eventType   | `"execution" \| "error" \| "cancellation"` |
| `AnalyticsPeriod` | granularity | `"hour" \| "day" \| "week" \| "month"`     |

**IPC シリアライズ方針**:

- 日時フィールド（timestamp, lastUsed, start, end）は全て `string`（ISO 8601）で定義する
- Main Process 内部では Date オブジェクトを使用し、IPC 境界で `.toISOString()` に変換する

#### 1.2 re-export 追加

**対象ファイル**: `packages/shared/src/types/index.ts`

```typescript
export * from "./skill-analytics.js";
```

---

### Task 2: AnalyticsStore 実装

**対象ファイル**: `apps/desktop/src/main/services/skill/AnalyticsStore.ts`（新規作成）

#### 2.1 クラス構成

```
AnalyticsStore
├── constructor(): electron-store からデータ復元
├── getAllEvents(): SkillUsageEvent[]
├── getEventsBySkill(skillName: string): SkillUsageEvent[]
├── getEventsByPeriod(period: AnalyticsPeriod): SkillUsageEvent[]
├── addEvent(event: Omit<SkillUsageEvent, "id">): SkillUsageEvent
├── clearBefore(date: Date): void
├── clearAll(): void
└── private persist(): void  // electron-store への書き込み
```

#### 2.2 実装仕様

| メソッド            | 仕様                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------- |
| `constructor`       | electron-store から `"skill-analytics-events"` キーで復元。不正データ（非配列）は空配列にフォールバック |
| `getAllEvents`      | 全イベントを配列として返す                                                                              |
| `getEventsBySkill`  | `skillName` が一致するイベントのみをフィルタして返す                                                    |
| `getEventsByPeriod` | `period.start` 以降 `period.end` 以前のイベントをフィルタして返す（境界値を含む）                       |
| `addEvent`          | `crypto.randomUUID()` でID生成、persist() 呼び出し、生成したイベントを返す                              |
| `clearBefore`       | 指定日時以前のイベントを削除、persist() 呼び出し                                                        |
| `clearAll`          | 全イベントを削除（空配列に置換）、persist() 呼び出し                                                    |
| `persist`           | `this.store.set("skill-analytics-events", this.events)` で永続化                                        |

#### 2.3 データ復元のバリデーション（P19対策）

```typescript
constructor() {
  const raw: unknown = this.store.get("skill-analytics-events");
  this.events = Array.isArray(raw)
    ? raw.filter((item): item is SkillUsageEvent =>
        typeof item === "object" && item !== null && typeof item.id === "string"
      )
    : [];
}
```

---

### Task 3: SkillAnalytics 実装

**対象ファイル**: `apps/desktop/src/main/services/skill/SkillAnalytics.ts`（新規作成）

#### 3.1 クラス構成

```
SkillAnalytics
├── constructor(analyticsStore: AnalyticsStore)
├── async recordEvent(event: Omit<SkillUsageEvent, "id">): Promise<void>
├── async getStatistics(skillName: string): Promise<SkillStatistics>
├── async getSummary(): Promise<AnalyticsSummary>
├── async getUsageTrend(skillName: string, period: AnalyticsPeriod): Promise<UsageTrend>
├── async getAllSkillsStatistics(): Promise<SkillStatistics[]>
├── async exportData(format: "json" | "csv", period?: AnalyticsPeriod): Promise<string>
├── async clearData(before?: Date): Promise<void>
├── private calculateStatistics(events: SkillUsageEvent[]): SkillStatistics
└── private aggregateByPeriod(events: SkillUsageEvent[], granularity: string): TrendDataPoint[]
```

#### 3.2 各メソッドの実装仕様

##### recordEvent

| 項目      | 仕様                                                                         |
| --------- | ---------------------------------------------------------------------------- |
| 処理      | `analyticsStore.addEvent(event)` でイベントを永続化する                      |
| timestamp | 呼び出し元で設定されていない場合は `new Date().toISOString()` を自動設定する |

##### getStatistics

| 項目         | 仕様                                                                  |
| ------------ | --------------------------------------------------------------------- |
| イベント取得 | `analyticsStore.getEventsBySkill(skillName)` でスキル別イベントを取得 |
| 計算委譲     | `calculateStatistics(events)` に委譲                                  |

##### calculateStatistics（private）

| 計算項目        | 計算ロジック                                                                            |
| --------------- | --------------------------------------------------------------------------------------- |
| totalExecutions | `events.length`                                                                         |
| successRate     | `events.filter(e => e.success).length / events.length`（0件の場合は `0`）               |
| averageDuration | duration が定義されたイベントのみの平均値（0件の場合は `0`）                            |
| lastUsed        | タイムスタンプの最大値（0件の場合は `null`）                                            |
| mostUsedTools   | `toolsUsed` をフラット化し、ツール名ごとに出現回数をカウント、頻度降順でソート          |
| errorRate       | `events.filter(e => e.eventType === "error").length / events.length`（0件の場合は `0`） |
| totalTokens     | `events.reduce((sum, e) => sum + (e.tokenCount ?? 0), 0)`                               |

##### getSummary

| 計算項目           | 計算ロジック                                                              |
| ------------------ | ------------------------------------------------------------------------- |
| totalSkills        | `new Set(events.map(e => e.skillName)).size`                              |
| totalExecutions    | `events.length`                                                           |
| overallSuccessRate | `events.filter(e => e.success).length / events.length`（0件の場合は `0`） |
| mostUsedSkills     | スキル名ごとの実行回数を集計、頻度降順でソート                            |
| recentActivity     | タイムスタンプ降順でソートした最新イベント（最大10件）                    |

##### getUsageTrend

| 項目         | 仕様                                                                                                |
| ------------ | --------------------------------------------------------------------------------------------------- |
| イベント取得 | `analyticsStore.getEventsBySkill(skillName)` でスキル別、`getEventsByPeriod(period)` で期間フィルタ |
| データ集計   | `aggregateByPeriod(events, period.granularity)` に委譲                                              |
| 戻り値       | `{ period, dataPoints }` を返す                                                                     |

##### aggregateByPeriod（private）

| granularity | 集計単位                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------ |
| `"hour"`    | 1時間単位でイベントをグルーピングし、各グループの executions / errors / avgDuration を計算 |
| `"day"`     | 1日単位で同様にグルーピング                                                                |
| `"week"`    | 1週間単位で同様にグルーピング                                                              |
| `"month"`   | 1ヶ月単位で同様にグルーピング                                                              |

各 TrendDataPoint:

| フィールド  | 計算ロジック                                                      |
| ----------- | ----------------------------------------------------------------- |
| timestamp   | グループの開始時刻（ISO 8601文字列）                              |
| executions  | グループ内のイベント総数                                          |
| errors      | グループ内の `eventType === "error"` のイベント数                 |
| avgDuration | グループ内の duration 定義済みイベントの平均値（0件の場合は `0`） |

##### exportData

| format   | 処理                                                                                                    |
| -------- | ------------------------------------------------------------------------------------------------------- |
| `"json"` | `JSON.stringify(events, null, 2)` で整形済みJSON文字列を返す                                            |
| `"csv"`  | ヘッダー行（id,skillName,eventType,timestamp,duration,success,errorMessage,toolsUsed,tokenCount）+ 各行 |

- `period` が指定された場合: `analyticsStore.getEventsByPeriod(period)` でフィルタしたイベントを対象とする
- `period` が省略された場合: `analyticsStore.getAllEvents()` で全イベントを対象とする

##### clearData

| 条件            | 処理                                            |
| --------------- | ----------------------------------------------- |
| `before` が指定 | `analyticsStore.clearBefore(before)` を呼び出す |
| `before` が省略 | `analyticsStore.clearAll()` を呼び出す          |

---

### Task 4: チャンネル定数追加

#### 4.1 Preload チャンネル定数

**対象ファイル**: `apps/desktop/src/preload/channels.ts`

`IPC_CHANNELS` オブジェクトの Skill schedule operations セクション後に以下の5定数を追加する:

```typescript
// Skill analytics operations (TASK-9J)
SKILL_ANALYTICS_RECORD: "skill:analytics:record",
SKILL_ANALYTICS_STATISTICS: "skill:analytics:statistics",
SKILL_ANALYTICS_SUMMARY: "skill:analytics:summary",
SKILL_ANALYTICS_TREND: "skill:analytics:trend",
SKILL_ANALYTICS_EXPORT: "skill:analytics:export",
```

`ALLOWED_INVOKE_CHANNELS` 配列の Skill schedule channels セクション後に以下を追加する:

```typescript
// Skill analytics channels (TASK-9J)
IPC_CHANNELS.SKILL_ANALYTICS_RECORD,
IPC_CHANNELS.SKILL_ANALYTICS_STATISTICS,
IPC_CHANNELS.SKILL_ANALYTICS_SUMMARY,
IPC_CHANNELS.SKILL_ANALYTICS_TREND,
IPC_CHANNELS.SKILL_ANALYTICS_EXPORT,
```

**注意**: `ALLOWED_ON_CHANNELS` への追加は不要（全て invoke パターンのため）。

---

### Task 5: IPCハンドラー実装

**対象ファイル**: `apps/desktop/src/main/ipc/skillHandlers.ts`（既存ファイルへ追記）

#### 5.1 ファイル構成

```
apps/desktop/src/main/ipc/skillHandlers.ts
├── import 宣言
├── registerSkillAnalyticsHandlers(mainWindow, skillAnalytics)
│   ├── skill:analytics:record ハンドラー
│   ├── skill:analytics:statistics ハンドラー
│   ├── skill:analytics:summary ハンドラー
│   ├── skill:analytics:trend ハンドラー
│   └── skill:analytics:export ハンドラー
└── unregisterSkillAnalyticsHandlers()
```

#### 5.2 関数シグネチャ

```typescript
import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from "electron";
import { IPC_CHANNELS } from "../../preload/channels.js";
import {
  validateIpcSender,
  toIPCValidationError,
} from "../infrastructure/security/ipc-validator.js";
import type { SkillAnalytics } from "../services/skill/SkillAnalytics.js";

export function registerSkillAnalyticsHandlers(
  mainWindow: BrowserWindow,
  skillAnalytics: SkillAnalytics,
): void;

export function unregisterSkillAnalyticsHandlers(): void;
```

#### 5.3 各ハンドラーの実装仕様

全ハンドラーは以下の共通パターンに従う:

```
1. validateIpcSender(event, channel, { getAllowedWindows: () => [mainWindow] })
2. validation.valid === false → throw toIPCValidationError(validation)
3. 引数バリデーション（P42準拠: 型チェック → 空文字列 → .trim() 空文字列）
4. サービスメソッド呼び出し
5. { success: true, data? } を返却
6. 予期しないエラー → { success: false, error: "Internal error" }
```

##### skill:analytics:record

| 項目           | 値                                                                                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| チャンネル     | `IPC_CHANNELS.SKILL_ANALYTICS_RECORD`                                                                                                                  |
| 引数           | `{ skillName: string, eventType: string, duration?: number, success: boolean, errorMessage?: string, toolsUsed: string[], tokenCount?: number }`       |
| バリデーション | skillName: P42準拠3段、eventType: `"execution" \| "error" \| "cancellation"` のいずれか、success: boolean型チェック、toolsUsed: Array.isArray チェック |
| 呼び出し       | `skillAnalytics.recordEvent(args)`                                                                                                                     |
| 成功レスポンス | `{ success: true }`                                                                                                                                    |

##### skill:analytics:statistics

| 項目           | 値                                         |
| -------------- | ------------------------------------------ |
| チャンネル     | `IPC_CHANNELS.SKILL_ANALYTICS_STATISTICS`  |
| 引数           | `skillName: string`                        |
| バリデーション | skillName: P42準拠3段                      |
| 呼び出し       | `skillAnalytics.getStatistics(skillName)`  |
| 成功レスポンス | `{ success: true, data: SkillStatistics }` |

##### skill:analytics:summary

| 項目           | 値                                          |
| -------------- | ------------------------------------------- |
| チャンネル     | `IPC_CHANNELS.SKILL_ANALYTICS_SUMMARY`      |
| 引数           | なし                                        |
| バリデーション | なし                                        |
| 呼び出し       | `skillAnalytics.getSummary()`               |
| 成功レスポンス | `{ success: true, data: AnalyticsSummary }` |

##### skill:analytics:trend

| 項目           | 値                                                                                                                                             |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| チャンネル     | `IPC_CHANNELS.SKILL_ANALYTICS_TREND`                                                                                                           |
| 引数           | `{ skillName: string, period: AnalyticsPeriod }`                                                                                               |
| バリデーション | skillName: P42準拠3段、period: 非nullオブジェクト、period.start: ISO 8601文字列、period.end: ISO 8601文字列、period.granularity: 4値のいずれか |
| 呼び出し       | `skillAnalytics.getUsageTrend(skillName, period)`                                                                                              |
| 成功レスポンス | `{ success: true, data: UsageTrend }`                                                                                                          |

##### skill:analytics:export

| 項目           | 値                                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------------------ |
| チャンネル     | `IPC_CHANNELS.SKILL_ANALYTICS_EXPORT`                                                                  |
| 引数           | `{ format: "json" \| "csv", period?: AnalyticsPeriod }`                                                |
| バリデーション | format: `"json"` または `"csv"` のいずれか。period が指定された場合は trend と同じバリデーションを適用 |
| 呼び出し       | `skillAnalytics.exportData(format, period)`                                                            |
| 成功レスポンス | `{ success: true, data: string }`                                                                      |

#### 5.4 エラーハンドリング

```typescript
catch (error) {
  // 予期しないエラー: 内部情報を漏洩しない
  return { success: false, error: "Internal error" };
}
```

#### 5.5 unregisterSkillAnalyticsHandlers

```typescript
export function unregisterSkillAnalyticsHandlers(): void {
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_ANALYTICS_RECORD);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_ANALYTICS_STATISTICS);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_ANALYTICS_SUMMARY);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_ANALYTICS_TREND);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_ANALYTICS_EXPORT);
}
```

---

### Task 6: Preload API 拡張

**対象ファイル**: `apps/desktop/src/preload/skill-api.ts`

#### 6.1 analytics メソッド追加

```typescript
// Skill analytics operations (TASK-9J)
analyticsRecord: (event: Omit<SkillUsageEvent, "id">) =>
  safeInvokeUnwrap<void>(IPC_CHANNELS.SKILL_ANALYTICS_RECORD, event),

analyticsStatistics: (skillName: string) =>
  safeInvokeUnwrap<SkillStatistics>(IPC_CHANNELS.SKILL_ANALYTICS_STATISTICS, skillName),

analyticsSummary: () =>
  safeInvokeUnwrap<AnalyticsSummary>(IPC_CHANNELS.SKILL_ANALYTICS_SUMMARY),

analyticsTrend: (skillName: string, period: AnalyticsPeriod) =>
  safeInvokeUnwrap<UsageTrend>(IPC_CHANNELS.SKILL_ANALYTICS_TREND, { skillName, period }),

analyticsExport: (format: "json" | "csv", period?: AnalyticsPeriod) =>
  safeInvokeUnwrap<string>(IPC_CHANNELS.SKILL_ANALYTICS_EXPORT, { format, period }),
```

#### 6.2 型定義追加

**対象ファイル**: `apps/desktop/src/preload/types.ts`

SkillAPI インターフェースに以下のメソッドを追加する:

```typescript
// Skill analytics operations (TASK-9J)
analyticsRecord: (event: Omit<SkillUsageEvent, "id">) => Promise<void>;
analyticsStatistics: (skillName: string) => Promise<SkillStatistics>;
analyticsSummary: () => Promise<AnalyticsSummary>;
analyticsTrend: (skillName: string, period: AnalyticsPeriod) =>
  Promise<UsageTrend>;
analyticsExport: (format: "json" | "csv", period?: AnalyticsPeriod) =>
  Promise<string>;
```

**注意**: `SkillUsageEvent`, `SkillStatistics`, `AnalyticsSummary`, `AnalyticsPeriod`, `UsageTrend` は `@repo/shared` からインポートする。型の二重定義を避ける（P23対策）。

---

### Task 7: スキル実行時の自動記録統合

**対象ファイル**: `apps/desktop/src/main/services/skill/SkillExecutor.ts`（既存ファイルを変更）または同等のスキル実行層

#### 7.1 統合仕様

スキル実行（execute メソッド）の前後に analytics イベントを自動記録する:

| タイミング | 記録内容                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------ |
| 実行成功後 | `{ skillName, eventType: "execution", success: true, duration, toolsUsed, tokenCount }`    |
| 実行失敗後 | `{ skillName, eventType: "error", success: false, duration, errorMessage, toolsUsed: [] }` |
| キャンセル | `{ skillName, eventType: "cancellation", success: false, duration, toolsUsed: [] }`        |

- `duration` は実行開始から完了までの経過ミリ秒（`Date.now() - startTime`）
- SkillAnalytics は SkillService 経由で Setter Injection パターン（P34準拠）で注入する

---

### Task 8: アプリ初期化統合

**対象ファイル**: `apps/desktop/src/main/ipc/index.ts`

#### 8.1 SkillAnalytics インスタンス生成

アプリ初期化時（BrowserWindow 生成後）に以下を追加する:

```typescript
// SkillAnalytics 初期化 (TASK-9J)
const analyticsStore = new AnalyticsStore();
const skillAnalytics = new SkillAnalytics(analyticsStore);
```

#### 8.2 IPCハンドラー登録

既存の `registerAllIpcHandlers` 関数に以下を追加する:

```typescript
registerSkillAnalyticsHandlers(mainWindow, skillAnalytics);
```

#### 8.3 IPCハンドラー解除

既存の `unregisterAllIpcHandlers` 関数に以下を追加する:

```typescript
unregisterSkillAnalyticsHandlers();
```

---

## 既知のPitfall対策

| Pitfall ID | 内容                         | 対策                                                                                                          |
| ---------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------- |
| P5         | リスナー二重登録             | `unregisterSkillAnalyticsHandlers` で確実に全解除                                                             |
| P19        | 型キャストによる検証バイパス | electron-store 復元時に `Array.isArray()` + `.filter()` でバリデーション                                      |
| P23        | 型二重定義の管理             | `SkillUsageEvent` を `@repo/shared` に配置し Preload と Main で同一参照                                       |
| P27        | ハードコード文字列の見落とし | 全チャンネル名に `IPC_CHANNELS` 定数を使用。実装後に grep で検証                                              |
| P34        | 遅延初期化が必要な DI        | SkillAnalytics は Constructor Injection で AnalyticsStore を受け取る。スキル実行層との統合は Setter Injection |
| P42        | .trim() バリデーション漏れ   | 全文字列引数に3段バリデーション（型チェック → 空文字列 → .trim() 空文字列）                                   |
| P44        | IPC インターフェース不整合   | ハンドラー引数形式と Preload 呼び出し形式を仕様書レベルで一致させる                                           |
| P45        | IPC引数命名の契約ドリフト    | 引数名をセマンティクスに一致させる（skillName は名前、periodは期間オブジェクト）                              |

## アーキテクチャ層別実装テーブル

| レイヤー | ファイル                                                 | 変更内容                                    |
| -------- | -------------------------------------------------------- | ------------------------------------------- |
| 共有型   | `packages/shared/src/types/skill-analytics.ts`           | 新規: 8インターフェース定義                 |
| 共有型   | `packages/shared/src/types/index.ts`                     | re-export 追加                              |
| Main     | `apps/desktop/src/main/services/skill/AnalyticsStore.ts` | 新規: electron-store CRUD                   |
| Main     | `apps/desktop/src/main/services/skill/SkillAnalytics.ts` | 新規: 統計・分析サービス                    |
| Main     | `apps/desktop/src/main/ipc/skillHandlers.ts`             | 既存拡張: 5ハンドラー + register/unregister |
| Main     | `apps/desktop/src/main/ipc/index.ts`                     | 初期化統合                                  |
| Preload  | `apps/desktop/src/preload/channels.ts`                   | 5チャンネル定数 + ホワイトリスト追加        |
| Preload  | `apps/desktop/src/preload/skill-api.ts`                  | 5メソッド追加（safeInvokeUnwrap パターン）  |
| Preload  | `apps/desktop/src/preload/types.ts`                      | SkillAPI 型に5メソッド追加                  |

## 設計変更記録

| 変更No | 変更内容 | 変更理由 | 影響範囲 |
| ------ | -------- | -------- | -------- |
| -      | -        | -        | -        |

## 参照資料

| 資料                                                             | 用途                            |
| ---------------------------------------------------------------- | ------------------------------- |
| Phase 4 成果物（テストファイル4件）                              | テストが Green になることを確認 |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                     | 既存ハンドラーの実装パターン    |
| `apps/desktop/src/main/services/skill/SkillExecutor.ts`          | スキル実行メソッドシグネチャ    |
| `apps/desktop/src/main/infrastructure/security/ipc-validator.ts` | IPC 検証関数                    |
| `apps/desktop/src/preload/channels.ts`                           | チャンネル定数追加位置          |
| `.claude/rules/04-electron-security.md`                          | セキュリティ原則                |

## 統合テスト連携

| 連携先                | 内容                                                         |
| --------------------- | ------------------------------------------------------------ |
| Phase 4（テスト作成） | 79件のテスト仕様を満たす最小実装を追加する                   |
| Phase 6（テスト拡充） | 実装後の不足分岐・境界値ケースを追加してカバレッジを拡張する |
| Phase 9（品質保証）   | lint/typecheck/coverage を通じて実装品質を確定する           |

## 成果物

| 成果物                                                   | 説明                              |
| -------------------------------------------------------- | --------------------------------- |
| `packages/shared/src/types/skill-analytics.ts`           | 新規: 型定義（8インターフェース） |
| `packages/shared/src/types/index.ts`                     | re-export 追加                    |
| `apps/desktop/src/main/services/skill/AnalyticsStore.ts` | 新規: 永続化ストア                |
| `apps/desktop/src/main/services/skill/SkillAnalytics.ts` | 新規: 統計・分析サービス          |
| `apps/desktop/src/main/ipc/skillHandlers.ts`             | 既存拡張: IPCハンドラー           |
| `apps/desktop/src/preload/channels.ts`                   | 5定数 + ホワイトリスト追加        |
| `apps/desktop/src/preload/skill-api.ts`                  | 5メソッド追加                     |
| `apps/desktop/src/preload/types.ts`                      | SkillAPI 型拡張                   |
| `apps/desktop/src/main/ipc/index.ts`                     | 初期化統合                        |

## 完了条件

- [ ] 5チャンネル定数が `preload/channels.ts` に定義されている
- [ ] `ALLOWED_INVOKE_CHANNELS` に5チャンネルが追加されている
- [ ] 8インターフェースが `packages/shared/src/types/skill-analytics.ts` に定義され、`index.ts` から re-export されている
- [ ] `AnalyticsStore` が electron-store ベースの CRUD + 期間フィルタ + データクリアを実装している
- [ ] `SkillAnalytics` が recordEvent / getStatistics / getSummary / getUsageTrend / exportData / clearData を実装している
- [ ] 5つのIPCハンドラーが `skillHandlers.ts` に実装されている
- [ ] 各ハンドラーで `validateIpcSender` による送信元検証が実施されている
- [ ] 各ハンドラーの引数バリデーションが P42 準拠3段バリデーションを実装している
- [ ] 予期しないエラーは `"Internal error"` を返す（内部情報漏洩防止）
- [ ] Preload API に5メソッドが追加されている（`safeInvokeUnwrap` パターン）
- [ ] `unregisterSkillAnalyticsHandlers` で5チャンネル全てが解除される
- [ ] ハードコード文字列のチャンネル名が存在しない（`IPC_CHANNELS` 定数のみ使用）
- [ ] `apps/desktop/src/main/ipc/index.ts` で SkillAnalytics の初期化が統合されている
- [ ] Phase 4 の全テスト（79テスト）が **Green 状態**（成功）である
- [ ] `cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillAnalytics` が全PASS
- [ ] `cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/AnalyticsStore` が全PASS
- [ ] `cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillAnalyticsHandlers` が全PASS

## 次のPhase

Phase 6（テスト拡充）へ進む。カバレッジ不足箇所のテストを追加する。

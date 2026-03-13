# Agent Dashboard・Workspace Chat Edit IPC / advanced specification

> 親仕様書: [api-ipc-agent.md](api-ipc-agent.md)
> 役割: advanced specification

## スキル分析・統計 IPC チャネル（TASK-9J）

> 完了タスク: TASK-9J（2026-02-28）

### チャネル一覧

| チャネル名 | メソッド | 引数 | 戻り値 | 説明 |
| --- | --- | --- | --- | --- |
| `skill:analytics:record` | invoke | `{ skillName, eventType, duration?, success, errorMessage?, toolsUsed, tokenCount? }` | `{ success: true, data: SkillUsageEvent }` | 使用イベント記録 |
| `skill:analytics:statistics` | invoke | `{ skillName: string, period?: { start, end } }` | `{ success: true, data: SkillStatistics }` | スキル別統計取得 |
| `skill:analytics:summary` | invoke | なし | `{ success: true, data: AnalyticsSummary }` | 全体サマリー取得 |
| `skill:analytics:trend` | invoke | `{ period: { start, end, granularity }, skillName? }` | `{ success: true, data: UsageTrend }` | 使用トレンド取得 |
| `skill:analytics:export` | invoke | `{ format: "csv" | "json", period? }` | `{ success: true, data: string }` | データエクスポート |

### 型定義

8インターフェースを `@repo/shared` の `packages/shared/src/types/skill-analytics.ts` で定義:
SkillUsageEvent, ToolUsageStat, SkillStatistics, AnalyticsPeriod, TrendDataPoint, UsageTrend, SkillUsageSummary, AnalyticsSummary

### 実装状況

| チャネル | ハンドラ | Preload API | テスト | ステータス |
| --- | --- | --- | --- | --- |
| skill:analytics:record | skillAnalyticsHandlers.ts | skill-api.ts analyticsRecord | 37テスト | 完了 |
| skill:analytics:statistics | skillAnalyticsHandlers.ts | skill-api.ts analyticsStatistics | (上記に含む) | 完了 |
| skill:analytics:summary | skillAnalyticsHandlers.ts | skill-api.ts analyticsSummary | (上記に含む) | 完了 |
| skill:analytics:trend | skillAnalyticsHandlers.ts | skill-api.ts analyticsTrend | (上記に含む) | 完了 |
| skill:analytics:export | skillAnalyticsHandlers.ts | skill-api.ts analyticsExport | (上記に含む) | 完了 |

### セキュリティ

- 全5ハンドラに validateIpcSender 適用
- P42準拠3段バリデーション（validateStringArg ヘルパー）
- エラーサニタイズ: toIpcErrorResponse → "Internal error"
- 許可値リスト: ALLOWED_EVENT_TYPES, ALLOWED_GRANULARITIES, ALLOWED_FORMATS

### 実装時の苦戦箇所（TASK-9J）

| 苦戦箇所 | 課題 | 対処 | 標準ルール |
| --- | --- | --- | --- |
| IPC登録配線漏れ | ハンドラ実装済みでも `ipc/index.ts` 未登録だと機能が起動しない | `registerSkillAnalyticsHandlers` を `registerAllIpcHandlers` に組み込み | IPC追加時は `handler/register/preload` 3点を同時完了条件にする |
| analytics責務の重複 | `skillHandlers.ts` と `skillAnalyticsHandlers.ts` に実装が分散 | analytics責務を `skillAnalyticsHandlers.ts` に一本化 | 同一チャネル群は1ファイル1責務を徹底する |
| API命名の契約ドリフト | 仕様記述と実装メソッド名が乖離しやすい | Preload実装名（`analyticsRecord` など）を正本に統一 | IPC契約ドキュメントは実装名から逆算して更新する |

---


# Phase 2 タスク4: Preload API設計

## メタ情報

| 項目   | 内容                                          |
| ------ | --------------------------------------------- |
| タスク | タスク4: Preload API設計                      |
| 前提   | タスク1（型定義）、タスク3（IPCチャネル設計） |
| 作成日 | 2026-02-28                                    |

## 目的

Renderer 側公開面を既存 `window.electronAPI.skill` API と同一面に統合し、`safeInvokeUnwrap` パターンで IPC ハンドラの `{ success, data }` ラッパーを展開する設計を定義する。

## 設計方針

### P23 対策: @repo/shared からの型インポート

共有型は `@repo/shared` から一元的にインポートする。`apps/desktop/src/preload/types.ts` にローカル型定義を重複させない。

```typescript
import type {
  SkillUsageEvent,
  SkillStatistics,
  AnalyticsSummary,
  AnalyticsPeriod,
  UsageTrend,
} from "@repo/shared";
```

### safeInvokeUnwrap 使用パターン

全5メソッドで `safeInvokeUnwrap<T>` を使用する。これは IPC ハンドラが `{ success: true, data: T }` 形式で返す契約に合わせたものである。`safeInvokeUnwrap` は `result.success === false` を検出して `throw new Error(result.error)` に変換するため、Renderer 側では例外として受け取る。

### 既存パターンとの整合

TASK-9G のスケジュール系 API（`scheduleList`, `scheduleAdd` 等）と同一パターンを踏襲する。

- メソッド名は camelCase で `analytics` プレフィックス
- 複数引数はオブジェクト `{ skillName, period }` にまとめて渡す
- 戻り値の型パラメータを `safeInvokeUnwrap<T>` に明示する
- JSDoc 付きメソッド定義

---

## SkillAPI 型への5メソッド追加

### types.ts への変更

`apps/desktop/src/preload/types.ts` の `ElectronAPI` インターフェース内の `skill` プロパティは `import("./skill-api").SkillAPI` を参照しているため、`SkillAPI` インターフェースへの追加のみで型が反映される。

### SkillAPI インターフェースへの追加

`apps/desktop/src/preload/skill-api.ts` の `SkillAPI` インターフェースに以下の5メソッドを追加する。

```typescript
// === Skill Analytics Operations (TASK-9J) ===

/**
 * スキル使用イベントを記録する
 * @param event - 記録するイベントデータ（id と timestamp はMain側で自動付与/補完）
 */
analyticsRecord: (
  event: Omit<SkillUsageEvent, "id" | "timestamp"> & { timestamp?: string },
) => Promise<void>;

/**
 * 指定スキルの統計情報を取得する
 * @param skillName - 統計対象のスキル名
 * @returns スキル別統計情報
 */
analyticsStatistics: (skillName: string) => Promise<SkillStatistics>;

/**
 * 全スキル横断のサマリー情報を取得する
 * @returns 全体サマリー
 */
analyticsSummary: () => Promise<AnalyticsSummary>;

/**
 * 指定スキルの使用トレンドデータを取得する
 * @param skillName - トレンド対象のスキル名
 * @param period - 集計期間（開始/終了/粒度）
 * @returns 使用トレンドデータ
 */
analyticsTrend: (skillName: string, period: AnalyticsPeriod) =>
  Promise<UsageTrend>;

/**
 * イベントデータをエクスポートする
 * @param format - 出力形式（"json" または "csv"）
 * @param period - 期間指定（省略時は全期間）
 * @returns エクスポート文字列（JSON またはCSV）
 */
analyticsExport: (format: "json" | "csv", period?: AnalyticsPeriod) =>
  Promise<string>;
```

---

## skill-api.ts 実装

### import 追加

```typescript
import type {
  SkillUsageEvent,
  SkillStatistics,
  AnalyticsSummary,
  AnalyticsPeriod,
  UsageTrend,
} from "@repo/shared";
```

**配置場所**: 既存の `@repo/shared` import ブロックにマージする。

### skillAPI オブジェクトへの実装追加

```typescript
// === Skill Analytics Operations (TASK-9J) ===

analyticsRecord: (
  event: Omit<SkillUsageEvent, "id" | "timestamp"> & { timestamp?: string },
): Promise<void> =>
  safeInvokeUnwrap<void>(IPC_CHANNELS.SKILL_ANALYTICS_RECORD, event),

analyticsStatistics: (skillName: string): Promise<SkillStatistics> =>
  safeInvokeUnwrap<SkillStatistics>(
    IPC_CHANNELS.SKILL_ANALYTICS_STATISTICS,
    skillName,
  ),

analyticsSummary: (): Promise<AnalyticsSummary> =>
  safeInvokeUnwrap<AnalyticsSummary>(IPC_CHANNELS.SKILL_ANALYTICS_SUMMARY),

analyticsTrend: (
  skillName: string,
  period: AnalyticsPeriod,
): Promise<UsageTrend> =>
  safeInvokeUnwrap<UsageTrend>(IPC_CHANNELS.SKILL_ANALYTICS_TREND, {
    skillName,
    period,
  }),

analyticsExport: (
  format: "json" | "csv",
  period?: AnalyticsPeriod,
): Promise<string> =>
  safeInvokeUnwrap<string>(IPC_CHANNELS.SKILL_ANALYTICS_EXPORT, {
    format,
    period,
  }),
```

---

## IPC 呼び出しパターン対応表

| Preload メソッド      | IPC チャネル                 | 引数形式                              | safeInvokeUnwrap 型パラメータ |
| --------------------- | ---------------------------- | ------------------------------------- | ----------------------------- |
| `analyticsRecord`     | `SKILL_ANALYTICS_RECORD`     | オブジェクト（event）                 | `void`                        |
| `analyticsStatistics` | `SKILL_ANALYTICS_STATISTICS` | 単一文字列（skillName）               | `SkillStatistics`             |
| `analyticsSummary`    | `SKILL_ANALYTICS_SUMMARY`    | なし                                  | `AnalyticsSummary`            |
| `analyticsTrend`      | `SKILL_ANALYTICS_TREND`      | オブジェクト（{ skillName, period }） | `UsageTrend`                  |
| `analyticsExport`     | `SKILL_ANALYTICS_EXPORT`     | オブジェクト（{ format, period }）    | `string`                      |

---

## Renderer 側からの呼び出し例

```typescript
// イベント記録
await window.electronAPI.skill.analyticsRecord({
  skillName: "my-skill",
  eventType: "execution",
  success: true,
  toolsUsed: ["Read", "Write"],
  duration: 1500,
  tokenCount: 250,
});

// 統計取得
const stats = await window.electronAPI.skill.analyticsStatistics("my-skill");
console.log(stats.successRate, stats.averageDuration);

// サマリー取得
const summary = await window.electronAPI.skill.analyticsSummary();
console.log(summary.totalSkills, summary.totalExecutions);

// トレンド取得
const trend = await window.electronAPI.skill.analyticsTrend("my-skill", {
  start: "2026-02-01T00:00:00.000Z",
  end: "2026-02-28T23:59:59.999Z",
  granularity: "day",
});
console.log(trend.dataPoints);

// エクスポート
const csvData = await window.electronAPI.skill.analyticsExport("csv", {
  start: "2026-02-01T00:00:00.000Z",
  end: "2026-02-28T23:59:59.999Z",
  granularity: "day",
});
```

---

## エラーハンドリング（Renderer 側）

`safeInvokeUnwrap` は `result.success === false` のレスポンスを `throw new Error(result.error)` に変換する。Renderer 側では try-catch で補足する。

```typescript
try {
  const stats = await window.electronAPI.skill.analyticsStatistics("my-skill");
} catch (error) {
  // error.message にはバリデーションエラーまたは "Internal error" が入る
  console.error("統計取得に失敗:", error.message);
}
```

---

## 完了条件

- [x] SkillAPI インターフェースに5メソッド（analyticsRecord, analyticsStatistics, analyticsSummary, analyticsTrend, analyticsExport）が定義されている
- [x] 全メソッドで `safeInvokeUnwrap` を使用している
- [x] `@repo/shared` からの型インポート方針が定義されている（P23対策）
- [x] 複数引数はオブジェクトにまとめて渡すパターンを踏襲している
- [x] JSDoc が全メソッドに付与されている
- [x] Renderer 側の呼び出し例とエラーハンドリングが示されている

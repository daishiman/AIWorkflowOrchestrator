# Phase 2 タスク2: アーキテクチャ設計

## メタ情報

| 項目   | 内容                          |
| ------ | ----------------------------- |
| タスク | タスク2: アーキテクチャ設計   |
| 前提   | タスク1（ドメインモデル設計） |
| 作成日 | 2026-02-28                    |

## 目的

永続化層（AnalyticsStore）とビジネスロジック層（SkillAnalytics）の責務を分離し、変更影響を局所化する設計を定義する。

## 依存方向

```text
Renderer
  -> Preload (window.electronAPI.skill.analytics*)
    -> IPC Handler (skillAnalyticsHandlers.ts)
      -> SkillAnalytics
        -> AnalyticsStore
          -> electron-store
```

全レイヤーで上位から下位への一方向依存を厳守する。逆方向の import は禁止する。

## レイヤー構成

### レイヤー責務マトリクス

| レイヤー         | ファイル                                                 | 責務                                                    |
| ---------------- | -------------------------------------------------------- | ------------------------------------------------------- |
| Preload API      | `apps/desktop/src/preload/skill-api.ts`                  | Renderer への公開面。`safeInvokeUnwrap` で IPC 呼び出し |
| IPC Handler      | `apps/desktop/src/main/ipc/skillAnalyticsHandlers.ts`    | Sender検証、引数バリデーション、レスポンス整形          |
| ビジネスロジック | `apps/desktop/src/main/services/skill/SkillAnalytics.ts` | 統計計算、集計、エクスポート変換                        |
| 永続化           | `apps/desktop/src/main/services/skill/AnalyticsStore.ts` | electron-store CRUD、期間フィルタ、メモリキャッシュ     |

---

## AnalyticsStore（永続化層）

### ファイルパス

`apps/desktop/src/main/services/skill/AnalyticsStore.ts`

### 設計パターン

`ScheduleStore`（TASK-9G）のパターンに準拠する。

- `ElectronStore<AnalyticsStoreSchema>` でスキーマ型安全を確保する
- メモリキャッシュ（`private events: SkillUsageEvent[]`）を保持し、読み取り性能を最適化する
- CRUD 操作後に `persist()` で永続化する
- コンストラクタで DI 対応（`store?: ElectronStore<AnalyticsStoreSchema>`）する

### スキーマ

```typescript
/** ストアスキーマ */
interface AnalyticsStoreSchema {
  "skill-analytics-events": SkillUsageEvent[];
}
```

### electron-store 設定

```typescript
new ElectronStore<AnalyticsStoreSchema>({
  name: "skill-analytics",
  defaults: {
    "skill-analytics-events": [],
  },
});
```

### メソッド一覧

| メソッド            | 引数                                 | 戻り値              | 責務                                         |
| ------------------- | ------------------------------------ | ------------------- | -------------------------------------------- |
| `getAllEvents`      | なし                                 | `SkillUsageEvent[]` | メモリキャッシュのコピーを返す               |
| `getEventsBySkill`  | `skillName: string`                  | `SkillUsageEvent[]` | スキル名でフィルタしたイベントを返す         |
| `getEventsByPeriod` | `period: AnalyticsPeriod`            | `SkillUsageEvent[]` | `start <= timestamp <= end` のイベントを返す |
| `addEvent`          | `event: Omit<SkillUsageEvent, "id">` | `SkillUsageEvent`   | UUID v4 を付与してメモリに追加し永続化する   |
| `clearBefore`       | `before: Date`                       | `void`              | 指定日時以前のイベントを削除し永続化する     |
| `clearAll`          | なし                                 | `void`              | 全イベントを削除し永続化する                 |

### コンストラクタ（P19対策）

```typescript
constructor(store?: ElectronStore<AnalyticsStoreSchema>) {
  this.store = store ?? new ElectronStore<AnalyticsStoreSchema>({
    name: "skill-analytics",
    defaults: { "skill-analytics-events": [] },
  });

  // P19対策: electron-store から復元時にバリデーション
  const raw: unknown = this.store.get("skill-analytics-events");
  this.events = Array.isArray(raw)
    ? raw.filter(
        (item): item is SkillUsageEvent =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as Record<string, unknown>).id === "string" &&
          typeof (item as Record<string, unknown>).skillName === "string" &&
          typeof (item as Record<string, unknown>).timestamp === "string",
      )
    : [];
}
```

**復元時バリデーション（P19対策）:**

1. `Array.isArray(raw)` で配列であることを確認する
2. 各要素が `object` かつ `null` でないことを確認する
3. `id`（string）、`skillName`（string）、`timestamp`（string）の存在を確認する
4. 条件を満たさない要素は除外する

### メソッド詳細

#### getAllEvents()

```typescript
getAllEvents(): SkillUsageEvent[] {
  return [...this.events];
}
```

コピーを返すことで、外部からの直接変更を防止する。

#### getEventsBySkill(skillName)

```typescript
getEventsBySkill(skillName: string): SkillUsageEvent[] {
  return this.events.filter((e) => e.skillName === skillName);
}
```

#### getEventsByPeriod(period)

```typescript
getEventsByPeriod(period: AnalyticsPeriod): SkillUsageEvent[] {
  const startTime = new Date(period.start).getTime();
  const endTime = new Date(period.end).getTime();
  return this.events.filter((e) => {
    const eventTime = new Date(e.timestamp).getTime();
    return eventTime >= startTime && eventTime <= endTime;
  });
}
```

`start` と `end` はいずれも含む（inclusive）。

#### addEvent(event)

```typescript
addEvent(event: Omit<SkillUsageEvent, "id">): SkillUsageEvent {
  const newEvent: SkillUsageEvent = {
    ...event,
    id: randomUUID(),
  };
  this.events.push(newEvent);
  this.persist();
  return newEvent;
}
```

UUID v4 を `randomUUID()`（`crypto` モジュール）で生成する。

#### clearBefore(before)

```typescript
clearBefore(before: Date): void {
  const beforeTime = before.getTime();
  this.events = this.events.filter(
    (e) => new Date(e.timestamp).getTime() > beforeTime,
  );
  this.persist();
}
```

`before` の時刻以前（`<=`）のイベントを削除する。

#### clearAll()

```typescript
clearAll(): void {
  this.events = [];
  this.persist();
}
```

### 永続化メソッド

```typescript
private persist(): void {
  this.store.set("skill-analytics-events", this.events);
}
```

---

## SkillAnalytics（ビジネスロジック層）

### ファイルパス

`apps/desktop/src/main/services/skill/SkillAnalytics.ts`

### 設計パターン

Constructor Injection で AnalyticsStore を受け取る。テスタビリティ確保のため、インターフェースを介して依存を注入する。

```typescript
export class SkillAnalytics {
  constructor(private readonly analyticsStore: AnalyticsStore) {}
}
```

### メソッド一覧

| メソッド        | 引数                                                          | 戻り値                      | 責務                                                |
| --------------- | ------------------------------------------------------------- | --------------------------- | --------------------------------------------------- |
| `recordEvent`   | `event: Omit<SkillUsageEvent, "id"> & { timestamp?: string }` | `Promise<void>`             | イベント記録。timestamp 未指定時は自動補完          |
| `getStatistics` | `skillName: string`                                           | `Promise<SkillStatistics>`  | スキル別統計を計算して返す                          |
| `getSummary`    | なし                                                          | `Promise<AnalyticsSummary>` | 全体サマリーを計算して返す                          |
| `getUsageTrend` | `skillName: string, period: AnalyticsPeriod`                  | `Promise<UsageTrend>`       | 粒度別トレンドデータを計算して返す                  |
| `exportData`    | `format: "json" \| "csv", period?: AnalyticsPeriod`           | `Promise<string>`           | JSON/CSV フォーマットでエクスポート文字列を生成する |
| `clearData`     | `before?: Date`                                               | `Promise<void>`             | 指定日時以前を削除。未指定時は全削除                |

### メソッド詳細

#### recordEvent(event)

```typescript
async recordEvent(
  event: Omit<SkillUsageEvent, "id"> & { timestamp?: string },
): Promise<void> {
  const fullEvent: Omit<SkillUsageEvent, "id"> = {
    ...event,
    timestamp: event.timestamp ?? new Date().toISOString(),
  };
  this.analyticsStore.addEvent(fullEvent);
}
```

- `timestamp` が未指定の場合、`new Date().toISOString()` で自動補完する
- `id` は `AnalyticsStore.addEvent()` 内で UUID v4 を付与する

#### getStatistics(skillName)

```typescript
async getStatistics(skillName: string): Promise<SkillStatistics> {
  const events = this.analyticsStore.getEventsBySkill(skillName);
  return this.calculateStatistics(skillName, events);
}
```

**統計計算ルール（`calculateStatistics` 内部メソッド）:**

| 指標              | 計算式                                                                                             |
| ----------------- | -------------------------------------------------------------------------------------------------- |
| `totalExecutions` | `events.length`                                                                                    |
| `successRate`     | `totalExecutions === 0 ? 0 : events.filter(e => e.success).length / totalExecutions`               |
| `averageDuration` | duration 定義イベントのみの平均値（0件なら 0）                                                     |
| `errorRate`       | `totalExecutions === 0 ? 0 : events.filter(e => e.eventType === "error").length / totalExecutions` |
| `totalTokens`     | `events.reduce((sum, e) => sum + (e.tokenCount ?? 0), 0)`                                          |
| `lastUsed`        | `events.length === 0 ? null : 最新の timestamp`                                                    |
| `mostUsedTools`   | `toolsUsed` を集計し、使用回数降順でソート。`percentage` は総ツール使用回数に対する割合            |

#### getSummary()

```typescript
async getSummary(): Promise<AnalyticsSummary> {
  const allEvents = this.analyticsStore.getAllEvents();
  // スキル名でグループ化
  const skillNames = [...new Set(allEvents.map((e) => e.skillName))];
  // 各スキルのサマリーを生成
  const mostUsedSkills: SkillUsageSummary[] = skillNames
    .map((name) => {
      const skillEvents = allEvents.filter((e) => e.skillName === name);
      return {
        skillName: name,
        executionCount: skillEvents.length,
        lastUsed: skillEvents.length > 0
          ? skillEvents.sort((a, b) => /* timestamp 降順 */)[0].timestamp
          : null,
      };
    })
    .sort((a, b) => b.executionCount - a.executionCount);

  return {
    totalSkills: skillNames.length,
    totalExecutions: allEvents.length,
    overallSuccessRate: allEvents.length === 0
      ? 0
      : allEvents.filter((e) => e.success).length / allEvents.length,
    mostUsedSkills,
    recentActivity: allEvents
      .sort((a, b) => /* timestamp 降順 */)
      .slice(0, MAX_RECENT_ACTIVITY),
  };
}
```

- `MAX_RECENT_ACTIVITY` は実装定数として Phase 5 で定義する（推奨値: 50）
- `mostUsedSkills` は実行回数降順でソートする
- `recentActivity` は最新イベントが先頭

#### getUsageTrend(skillName, period)

```typescript
async getUsageTrend(
  skillName: string,
  period: AnalyticsPeriod,
): Promise<UsageTrend> {
  const events = this.analyticsStore.getEventsBySkill(skillName)
    .filter((e) => /* period 内のイベント */);
  const dataPoints = this.aggregateByGranularity(events, period);
  return { period, dataPoints };
}
```

**粒度別集計（`aggregateByGranularity` 内部メソッド）:**

1. `period.start` から `period.end` まで `granularity` 単位の区間を生成する
2. 各区間に含まれるイベントを集計する
3. 区間にイベントが0件の場合は `{ timestamp, executions: 0, errors: 0, avgDuration: 0 }` を返す

| 粒度    | 区間の生成方法               |
| ------- | ---------------------------- |
| `hour`  | 1時間ごとに区間を生成        |
| `day`   | 1日ごとに区間を生成          |
| `week`  | 7日ごとに区間を生成          |
| `month` | 月初から翌月初まで区間を生成 |

#### exportData(format, period?)

```typescript
async exportData(
  format: "json" | "csv",
  period?: AnalyticsPeriod,
): Promise<string> {
  const events = period
    ? this.analyticsStore.getEventsByPeriod(period)
    : this.analyticsStore.getAllEvents();

  if (format === "json") {
    return JSON.stringify(events, null, 2);
  }
  // CSV: ヘッダー + 行データ
  return this.convertToCSV(events);
}
```

**CSV フォーマット:**

- ヘッダー: `id,skillName,eventType,timestamp,success,toolsUsed,duration,errorMessage,tokenCount`
- 各行: フィールドをカンマ区切りで出力する
- `toolsUsed` は `"tool1;tool2"` のようにセミコロン区切りで結合する
- `undefined` フィールドは空文字列として出力する

**JSON フォーマット:**

- `JSON.stringify(events, null, 2)` でインデント2スペースの整形済み JSON を出力する

#### clearData(before?)

```typescript
async clearData(before?: Date): Promise<void> {
  if (before) {
    this.analyticsStore.clearBefore(before);
  } else {
    this.analyticsStore.clearAll();
  }
}
```

- `before` 指定時: 指定日時以前のイベントを削除する
- `before` 未指定時: 全イベントを削除する

---

## DI（依存性注入）パターン

### サービス生成

```typescript
// Main Process 起動時
const analyticsStore = new AnalyticsStore();
const skillAnalytics = new SkillAnalytics(analyticsStore);
```

### ハンドラ登録

```typescript
// IPC ハンドラ登録
registerSkillAnalyticsHandlers(mainWindow, skillAnalytics);
```

### テスト時

```typescript
// テスト時はモックストアを注入
const mockStore = new AnalyticsStore(mockElectronStore);
const analytics = new SkillAnalytics(mockStore);
```

---

## ファイル構成

```
apps/desktop/src/main/
  services/skill/
    AnalyticsStore.ts          # 永続化層
    SkillAnalytics.ts          # ビジネスロジック層
  ipc/
    skillAnalyticsHandlers.ts  # IPCハンドラ（新規ファイル）
```

**新規ファイルを分離する理由:**

- `skillHandlers.ts` は既に600行以上あり、追加すると保守性が低下する
- TASK-9G の `registerSkillScheduleHandlers` は `skillHandlers.ts` 内に定義されているが、アナリティクスは独立したドメインであるためファイル分離が適切

---

## 完了条件

- [x] AnalyticsStore の6メソッド（getAllEvents, getEventsBySkill, getEventsByPeriod, addEvent, clearBefore, clearAll）が定義されている
- [x] SkillAnalytics の6メソッド（recordEvent, getStatistics, getSummary, getUsageTrend, exportData, clearData）が定義されている
- [x] 統計計算ルール（successRate, averageDuration, errorRate, totalTokens）が定義されている
- [x] 依存方向（Renderer -> Preload -> IPC Handler -> SkillAnalytics -> AnalyticsStore -> electron-store）が定義されている
- [x] ScheduleStore パターン（P19対策、メモリキャッシュ、persist()、DI 対応）に準拠している

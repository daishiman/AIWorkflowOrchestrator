# Phase 4: テスト作成（TDD: Red）— TASK-9J スキル使用統計・分析機能

## メタ情報

| 項目       | 値                                               |
| ---------- | ------------------------------------------------ |
| Phase      | 4                                                |
| 機能名     | TASK-9J-skill-analytics                          |
| 作成日     | 2026-02-28                                       |
| 前提Phase  | Phase 1-3（要件定義・設計・設計レビュー）        |
| 依存タスク | TASK-9B（SkillService / SkillExecutor 実装済み） |

## 目的

スキル使用統計・分析機能（SkillAnalytics・AnalyticsStore・IPCハンドラー・型定義）のテストを**実装より先に作成**し、全テストが **Red 状態**（失敗）であることを確認する。TDD の Red フェーズとして、テストが実装の仕様書となる。

## 実行タスク

### Task 1: 型定義テスト作成（`skill-analytics.test.ts`）

**配置先**: `packages/shared/src/types/__tests__/skill-analytics.test.ts`

#### 1.1 テストケース一覧

| No   | テスト項目                                                                                                                    | 期待結果                          |
| ---- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| T-01 | SkillUsageEvent 型が必須フィールド（id, skillName, eventType, timestamp, success, toolsUsed）を持つ                           | TypeScript コンパイルが通る       |
| T-02 | SkillUsageEvent の eventType が `"execution" \| "error" \| "cancellation"` の3種類を受け入れる                                | 各 eventType で型チェックが通る   |
| T-03 | SkillUsageEvent の duration / errorMessage / tokenCount がオプショナルである                                                  | undefined の代入が可能            |
| T-04 | SkillStatistics 型が必須フィールド（skillName, totalExecutions, successRate, averageDuration, errorRate, totalTokens）を持つ  | TypeScript コンパイルが通る       |
| T-05 | SkillStatistics の lastUsed がオプショナル（`string \| null \| undefined`）である                                             | null / undefined の両方が代入可能 |
| T-06 | AnalyticsPeriod の granularity が `"hour" \| "day" \| "week" \| "month"` の4種類を受け入れる                                  | 各 granularity で型チェックが通る |
| T-07 | AnalyticsSummary 型が必須フィールド（totalSkills, totalExecutions, overallSuccessRate, mostUsedSkills, recentActivity）を持つ | TypeScript コンパイルが通る       |
| T-08 | ToolUsageStat 型が必須フィールド（toolName, count, percentage）を持つ                                                         | TypeScript コンパイルが通る       |

---

### Task 2: AnalyticsStore テスト作成（`AnalyticsStore.test.ts`）

**配置先**: `apps/desktop/src/main/services/skill/__tests__/AnalyticsStore.test.ts`

#### 2.1 テスト基盤セットアップ

```typescript
// electron-store モック
vi.mock("electron-store", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      get: vi.fn().mockReturnValue([]),
      set: vi.fn(),
    })),
  };
});
```

**beforeEach でのリセット（P9対策）**:

```typescript
let store: AnalyticsStore;

beforeEach(() => {
  vi.clearAllMocks();
  store = new AnalyticsStore();
});
```

#### 2.2 テストケース一覧（CRUD操作）

| No   | テスト項目                                             | 期待結果                                                      |
| ---- | ------------------------------------------------------ | ------------------------------------------------------------- |
| A-01 | 初期状態でイベント一覧が空配列を返す                   | `getAllEvents()` が `[]` を返す                               |
| A-02 | イベントを追加すると一覧に含まれる                     | `addEvent()` 後に `getAllEvents()` が1件を含む                |
| A-03 | 追加されたイベントに自動生成されたIDが付与される       | `id` が UUID v4 形式の文字列である                            |
| A-04 | skillName でフィルタしてイベントを取得できる           | `getEventsBySkill("test-skill")` が該当イベントのみを返す     |
| A-05 | 存在しないskillName でフィルタすると空配列を返す       | `getEventsBySkill("non-existent")` が `[]` を返す             |
| A-06 | 期間（start/end）を指定してイベントをフィルタできる    | `getEventsByPeriod(period)` が期間内のイベントのみを返す      |
| A-07 | 指定日時以前のイベントを削除できる                     | `clearBefore(date)` 後に古いイベントが除外される              |
| A-08 | 全イベントを削除できる                                 | `clearAll()` 後に `getAllEvents()` が `[]` を返す             |
| A-09 | electron-store の `set` がイベント変更時に呼び出される | `addEvent` / `clearBefore` / `clearAll` 後に `set` が呼ばれる |

#### 2.3 テストケース一覧（永続化復元）

| No   | テスト項目                                                          | 期待結果                                       |
| ---- | ------------------------------------------------------------------- | ---------------------------------------------- |
| A-10 | コンストラクタで electron-store からイベントが復元される            | `get("skill-analytics-events")` が呼び出される |
| A-11 | 保存データが不正（配列でない）場合に空配列にフォールバックする      | 破損データでもクラッシュしない                 |
| A-12 | 保存データの各要素が不正（id フィールド欠損）な場合にフィルタされる | 不正要素がフィルタされ正常要素のみ復元         |

#### 2.4 テストケース一覧（データ整合性）

| No   | テスト項目                                                         | 期待結果                                                |
| ---- | ------------------------------------------------------------------ | ------------------------------------------------------- |
| A-13 | 10,000件のイベント追加後にgetAllEventsが全件を返す                 | `getAllEvents().length === 10000`                       |
| A-14 | getEventsBySkill で複数スキルのイベントが混在しない                | skillNameフィルタで他スキルイベントが含まれない         |
| A-15 | getEventsByPeriod で境界値（start/end と同一タイムスタンプ）を含む | 期間の start/end と完全一致するイベントが結果に含まれる |

---

### Task 3: SkillAnalytics テスト作成（`SkillAnalytics.test.ts`）

**配置先**: `apps/desktop/src/main/services/skill/__tests__/SkillAnalytics.test.ts`

#### 3.1 テスト基盤セットアップ

```typescript
// AnalyticsStore モック
const mockAnalyticsStore = {
  getAllEvents: vi.fn().mockReturnValue([]),
  getEventsBySkill: vi.fn().mockReturnValue([]),
  getEventsByPeriod: vi.fn().mockReturnValue([]),
  addEvent: vi.fn(),
  clearBefore: vi.fn(),
  clearAll: vi.fn(),
};
```

**beforeEach でのリセット（P9対策）**:

```typescript
let analytics: SkillAnalytics;

beforeEach(() => {
  vi.clearAllMocks();
  analytics = new SkillAnalytics(mockAnalyticsStore);
});
```

#### 3.2 テストケース一覧（recordEvent）

| No    | テスト項目                                                            | 期待結果                                                 |
| ----- | --------------------------------------------------------------------- | -------------------------------------------------------- |
| SA-01 | recordEvent でストアに execution イベントが保存される                 | `mockAnalyticsStore.addEvent` が1回呼び出される          |
| SA-02 | recordEvent で error イベントに errorMessage が含まれる               | 保存されたイベントの errorMessage が指定値と一致         |
| SA-03 | recordEvent で cancellation イベントが保存される                      | eventType が `"cancellation"` のイベントが保存される     |
| SA-04 | recordEvent で timestamp が ISO 8601 形式の文字列として自動設定される | `new Date(timestamp).toISOString() === timestamp` が成立 |

#### 3.3 テストケース一覧（getStatistics）

| No    | テスト項目                                                         | 期待結果                                               |
| ----- | ------------------------------------------------------------------ | ------------------------------------------------------ |
| SA-05 | getStatistics で指定スキルの実行回数を返す                         | totalExecutions がイベント数と一致                     |
| SA-06 | getStatistics で成功率を計算する（成功3件/全5件 = 0.6）            | successRate が `0.6` である                            |
| SA-07 | getStatistics で平均所要時間を計算する                             | averageDuration が duration の平均値と一致             |
| SA-08 | getStatistics で duration が未設定のイベントを平均計算から除外する | duration が undefined のイベントを除いた平均値が返る   |
| SA-09 | getStatistics で lastUsed が最新イベントのタイムスタンプを返す     | lastUsed が最新の timestamp と一致                     |
| SA-10 | getStatistics でイベント0件の場合にデフォルト値を返す              | totalExecutions: 0, successRate: 0, averageDuration: 0 |
| SA-11 | getStatistics で mostUsedTools が使用頻度順にソートされる          | 最も使用頻度の高いツールが配列先頭に位置する           |
| SA-12 | getStatistics で errorRate を計算する（エラー2件/全10件 = 0.2）    | errorRate が `0.2` である                              |
| SA-13 | getStatistics で totalTokens がtokenCountの合計を返す              | totalTokens が全イベントの tokenCount 合計と一致       |

#### 3.4 テストケース一覧（getSummary）

| No    | テスト項目                                               | 期待結果                                                  |
| ----- | -------------------------------------------------------- | --------------------------------------------------------- |
| SA-14 | getSummary で totalSkills がユニークなスキル名の数を返す | 3スキル分のイベントがある場合 totalSkills が `3`          |
| SA-15 | getSummary で totalExecutions が全イベント数を返す       | totalExecutions が全イベントの合計と一致                  |
| SA-16 | getSummary で overallSuccessRate が全体の成功率を返す    | 成功イベント数 / 全イベント数 と一致                      |
| SA-17 | getSummary で mostUsedSkills が使用頻度順にソートされる  | 最も使用頻度の高いスキルが配列先頭に位置する              |
| SA-18 | getSummary で recentActivity が最新のイベントを含む      | タイムスタンプの降順で最新イベントが先頭                  |
| SA-19 | getSummary でイベント0件の場合にデフォルト値を返す       | totalSkills: 0, totalExecutions: 0, overallSuccessRate: 0 |

#### 3.5 テストケース一覧（getUsageTrend）

| No    | テスト項目                                                                  | 期待結果                                                        |
| ----- | --------------------------------------------------------------------------- | --------------------------------------------------------------- |
| SA-20 | getUsageTrend で granularity: "day" のデータポイントを返す                  | 期間内の各日にデータポイントが生成される                        |
| SA-21 | getUsageTrend で各データポイントに executions / errors / avgDuration を含む | 各 TrendDataPoint の必須フィールドが全て存在する                |
| SA-22 | getUsageTrend で指定スキルのイベントのみ集計される                          | 他スキルのイベントが集計に含まれない                            |
| SA-23 | getUsageTrend でイベント0件の期間はデータポイントが0値を持つ                | executions: 0, errors: 0, avgDuration: 0 のデータポイントが返る |

#### 3.6 テストケース一覧（exportData）

| No    | テスト項目                                                | 期待結果                                         |
| ----- | --------------------------------------------------------- | ------------------------------------------------ |
| SA-24 | exportData で format: "json" の場合にJSON文字列を返す     | `JSON.parse(result)` が例外をスローしない        |
| SA-25 | exportData で format: "csv" の場合にCSV文字列を返す       | ヘッダー行とデータ行を含むCSV形式の文字列が返る  |
| SA-26 | exportData で period を指定した場合に期間内データのみ含む | 期間外のイベントがエクスポートデータに含まれない |
| SA-27 | exportData で period を省略した場合に全データを含む       | 全イベントがエクスポートデータに含まれる         |

#### 3.7 テストケース一覧（clearData）

| No    | テスト項目                                                     | 期待結果                                              |
| ----- | -------------------------------------------------------------- | ----------------------------------------------------- |
| SA-28 | clearData で before を指定すると指定日時以前のデータを削除する | `mockAnalyticsStore.clearBefore` が指定日時で呼ばれる |
| SA-29 | clearData で before を省略すると全データを削除する             | `mockAnalyticsStore.clearAll` が呼び出される          |

---

### Task 4: IPCハンドラーテスト作成（`skillAnalyticsHandlers.test.ts`）

**配置先**: `apps/desktop/src/main/ipc/__tests__/skillAnalyticsHandlers.test.ts`

#### 4.1 テスト基盤セットアップ

```typescript
// electron モック
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn((channel: string, handler: Function) => {
      handlerMap.set(channel, handler);
    }),
    removeHandler: vi.fn((channel: string) => {
      handlerMap.delete(channel);
    }),
  },
  BrowserWindow: {
    fromWebContents: vi.fn(),
  },
}));

// ipc-validator モック
vi.mock("../../infrastructure/security/ipc-validator.js", () => ({
  validateIpcSender: vi.fn().mockReturnValue({ valid: true }),
  toIPCValidationError: vi.fn().mockImplementation((result) => ({
    success: false,
    error: {
      code: result.errorCode ?? "IPC_UNAUTHORIZED",
      message: result.errorMessage ?? "Unauthorized IPC call",
    },
  })),
}));
```

**SkillAnalytics モック**:

```typescript
const mockSkillAnalytics = {
  recordEvent: vi.fn(),
  getStatistics: vi.fn().mockResolvedValue({
    skillName: "test-skill",
    totalExecutions: 10,
    successRate: 0.8,
    averageDuration: 1500,
    lastUsed: "2026-02-28T00:00:00.000Z",
    mostUsedTools: [],
    errorRate: 0.2,
    totalTokens: 5000,
  }),
  getSummary: vi.fn().mockResolvedValue({
    totalSkills: 3,
    totalExecutions: 30,
    overallSuccessRate: 0.85,
    mostUsedSkills: [],
    recentActivity: [],
  }),
  getUsageTrend: vi.fn().mockResolvedValue({
    period: { start: "", end: "", granularity: "day" },
    dataPoints: [],
  }),
  exportData: vi.fn().mockResolvedValue("{}"),
};
```

#### 4.2 テストケース一覧（正常系）

| No   | チャンネル                   | テスト項目                         | 期待結果                                          |
| ---- | ---------------------------- | ---------------------------------- | ------------------------------------------------- |
| H-01 | `skill:analytics:record`     | イベントを記録する                 | `{ success: true }` かつ `recordEvent` が呼ばれる |
| H-02 | `skill:analytics:statistics` | 指定スキルの統計を取得する         | `{ success: true, data: SkillStatistics }`        |
| H-03 | `skill:analytics:summary`    | 全スキルサマリーを取得する         | `{ success: true, data: AnalyticsSummary }`       |
| H-04 | `skill:analytics:trend`      | 指定スキルのトレンドを取得する     | `{ success: true, data: UsageTrend }`             |
| H-05 | `skill:analytics:export`     | JSON形式でデータをエクスポートする | `{ success: true, data: string }`                 |
| H-06 | `skill:analytics:export`     | CSV形式でデータをエクスポートする  | `{ success: true, data: string }`                 |

#### 4.3 テストケース一覧（バリデーションエラー — P42準拠3段バリデーション）

| No   | チャンネル                   | テスト項目                                | 期待結果                                                                                |
| ---- | ---------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------- |
| H-07 | `skill:analytics:record`     | skillName が空文字列                      | `{ success: false, error: "skillName must be a non-empty string" }`                     |
| H-08 | `skill:analytics:record`     | skillName がスペースのみ `"   "`          | `{ success: false, error: "skillName must be a non-empty string" }`                     |
| H-09 | `skill:analytics:record`     | skillName が文字列以外（数値）            | `{ success: false, error: "skillName must be a non-empty string" }`                     |
| H-10 | `skill:analytics:record`     | eventType が不正な値（`"unknown"`）       | `{ success: false, error: "eventType must be one of: execution, error, cancellation" }` |
| H-11 | `skill:analytics:record`     | success が boolean 以外                   | `{ success: false, error: "success must be a boolean" }`                                |
| H-12 | `skill:analytics:record`     | toolsUsed が配列以外                      | `{ success: false, error: "toolsUsed must be an array of strings" }`                    |
| H-13 | `skill:analytics:statistics` | skillName が空文字列                      | `{ success: false, error: "skillName must be a non-empty string" }`                     |
| H-14 | `skill:analytics:statistics` | skillName がスペースのみ                  | `{ success: false, error: "skillName must be a non-empty string" }`                     |
| H-15 | `skill:analytics:trend`      | skillName が空文字列                      | `{ success: false, error: "skillName must be a non-empty string" }`                     |
| H-16 | `skill:analytics:trend`      | period が未指定（undefined）              | `{ success: false, error: "period must be a valid object" }`                            |
| H-17 | `skill:analytics:trend`      | period.granularity が不正な値（`"year"`） | `{ success: false, error: "granularity must be one of: hour, day, week, month" }`       |
| H-18 | `skill:analytics:trend`      | period.start が不正な日時文字列           | `{ success: false, error: "start must be a valid ISO 8601 date string" }`               |
| H-19 | `skill:analytics:export`     | format が不正な値（`"xml"`）              | `{ success: false, error: "format must be one of: json, csv" }`                         |

#### 4.4 テストケース一覧（サービスエラー）

| No   | チャンネル               | テスト項目             | 期待結果                                                                |
| ---- | ------------------------ | ---------------------- | ----------------------------------------------------------------------- |
| H-20 | `skill:analytics:record` | サービスが例外をスロー | `{ success: false, error: "Internal error" }`（内部情報を漏洩しない）   |
| H-21 | 全チャンネル共通         | 予期しない Error       | `{ success: false, error: "Internal error" }`（スタックトレース非公開） |

#### 4.5 テストケース一覧（セキュリティ）

| No   | テスト項目                                                          | 期待結果                                             |
| ---- | ------------------------------------------------------------------- | ---------------------------------------------------- |
| H-22 | validateIpcSender が `{ valid: false }` を返す場合                  | `toIPCValidationError` の結果が throw される         |
| H-23 | 全5チャンネルで validateIpcSender が呼び出される                    | 各ハンドラーで `validateIpcSender` が1回呼び出される |
| H-24 | validateIpcSender に正しい引数（event, channel, options）が渡される | `getAllowedWindows` が `[mainWindow]` を返す         |

#### 4.6 テストケース一覧（登録・解除）

| No   | テスト項目                                                       | 期待結果                                  |
| ---- | ---------------------------------------------------------------- | ----------------------------------------- |
| H-25 | `registerSkillAnalyticsHandlers` で5チャンネル全てが登録される   | `ipcMain.handle` が5回呼び出される        |
| H-26 | `unregisterSkillAnalyticsHandlers` で5チャンネル全てが解除される | `ipcMain.removeHandler` が5回呼び出される |
| H-27 | 登録されるチャンネル名が全て `IPC_CHANNELS` 定数を使用           | ハードコード文字列が存在しない            |

---

## 参照資料

| 資料                                                                        | 用途                       |
| --------------------------------------------------------------------------- | -------------------------- |
| Phase 1 成果物（phase-1-requirements.md）                                   | 要件・受け入れ基準         |
| Phase 2 成果物（phase-2-design.md）                                         | 設計成果物                 |
| Phase 3 成果物（phase-3-design-review.md）                                  | レビュー結果               |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                                | 既存IPCハンドラーパターン  |
| `apps/desktop/src/main/ipc/__tests__/skillScheduleHandlers.test.ts`         | テストパターン参考         |
| `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.security.test.ts` | セキュリティテストパターン |
| `.claude/rules/04-electron-security.md`                                     | IPCセキュリティ原則        |
| `.claude/rules/06-known-pitfalls.md#P42`                                    | .trim() 3段バリデーション  |
| `.claude/rules/06-known-pitfalls.md#P9`                                     | テスト間状態リーク防止     |
| `.claude/rules/06-known-pitfalls.md#P39`                                    | happy-dom userEvent 非互換 |

## 統合テスト連携

| 連携先                | 内容                                                          |
| --------------------- | ------------------------------------------------------------- |
| Phase 5（実装）       | Phase 4で定義したテスト仕様を満たす実装を追加する             |
| Phase 6（テスト拡充） | Phase 4で不足する境界値・エッジケース・組合せテストを拡張する |

## 成果物

| 成果物                                                                  | 説明                              |
| ----------------------------------------------------------------------- | --------------------------------- |
| `packages/shared/src/types/__tests__/skill-analytics.test.ts`           | 型定義テスト（8テスト）           |
| `apps/desktop/src/main/services/skill/__tests__/AnalyticsStore.test.ts` | AnalyticsStore テスト（15テスト） |
| `apps/desktop/src/main/services/skill/__tests__/SkillAnalytics.test.ts` | SkillAnalytics テスト（29テスト） |
| `apps/desktop/src/main/ipc/__tests__/skillAnalyticsHandlers.test.ts`    | IPCハンドラーテスト（27テスト）   |

## 完了条件

- [ ] 4つのテストファイルが作成されている
- [ ] 全テストケース（79テスト）が記述されている
- [ ] テスト実行時に全テストが **Red 状態**（失敗）である（実装が存在しないため）
- [ ] テストファイル内にハードコード文字列のチャンネル名が存在しない（`IPC_CHANNELS` 定数を使用）
- [ ] `beforeEach` で全モックがリセットされている（P9対策）
- [ ] IPCバリデーションテストが P42 準拠3段バリデーション（型チェック → 空文字列 → トリム空文字列）を検証している
- [ ] happy-dom 環境で `userEvent` を使用していない（P39対策: `fireEvent` を使用）

## 次のPhase

Phase 5（実装）へ進む。テストを通すための最小限のプロダクションコードを実装する。

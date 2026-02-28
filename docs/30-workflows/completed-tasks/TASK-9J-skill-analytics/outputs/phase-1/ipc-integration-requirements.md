# Phase 1 Task 4: IPC連携要件定義

## 1. 既存チャネル命名パターンの分析

### 1.1 チャネル命名規則

`channels.ts` の既存チャネルは以下の階層的命名パターンを使用している:

| パターン                                 | 例                                                   | 定数名規則                                           |
| ---------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------- |
| `{domain}:{action}`                      | `skill:import`, `skill:remove`                       | `SKILL_IMPORT`, `SKILL_REMOVE`                       |
| `{domain}:{subdomain}:{action}`          | `skill:schedule:list`, `skill:schedule:add`          | `SKILL_SCHEDULE_LIST`, `SKILL_SCHEDULE_ADD`          |
| `{domain}:{camelCase}`                   | `skill:readFile`, `skill:getImported`                | `SKILL_READ_FILE`, `SKILL_GET_IMPORTED`              |
| `{domain}:{subdomain}:{action}` (ネスト) | `skill:optimize:variants`, `skill:optimize:evaluate` | `SKILL_OPTIMIZE_VARIANTS`, `SKILL_OPTIMIZE_EVALUATE` |

**TASK-9Jでの命名方針**:

`skill:schedule:*` パターンに準拠し、`skill:analytics:*` の3階層命名を採用する。これは TASK-9G（`skill:schedule:list`, `skill:schedule:add` 等）と同一パターンであり、命名規則の一貫性を維持する。

### 1.2 定数名マッピング

| チャネル文字列               | 定数名                       |
| ---------------------------- | ---------------------------- |
| `skill:analytics:record`     | `SKILL_ANALYTICS_RECORD`     |
| `skill:analytics:statistics` | `SKILL_ANALYTICS_STATISTICS` |
| `skill:analytics:summary`    | `SKILL_ANALYTICS_SUMMARY`    |
| `skill:analytics:trend`      | `SKILL_ANALYTICS_TREND`      |
| `skill:analytics:export`     | `SKILL_ANALYTICS_EXPORT`     |

### 1.3 ホワイトリスト登録

5チャネルは全て Renderer -> Main 方向の `ipcMain.handle` であるため:

- `ALLOWED_INVOKE_CHANNELS` に5チャネルを追加する
- `ALLOWED_ON_CHANNELS` への追加は不要（Main -> Renderer のイベント送信チャネルがないため）

### 1.4 既存ハンドラ登録パターン

`skillHandlers.ts` の `registerSkillScheduleHandlers` パターンに準拠する:

```typescript
export function registerSkillAnalyticsHandlers(
  mainWindow: BrowserWindow,
  skillAnalytics: SkillAnalytics,
): void {
  ipcMain.handle(
    IPC_CHANNELS.SKILL_ANALYTICS_RECORD,
    async (event: IpcMainInvokeEvent, args: ...) => {
      // 1. validateIpcSender() — Sender検証
      // 2. 引数バリデーション — P42準拠3段バリデーション
      // 3. ビジネスロジック呼び出し
      // 4. 成功: { success: true, data: ... } / 失敗: { success: false, error: string }
    },
  );
  // ... 他4チャネル
}
```

解除関数:

```typescript
export function unregisterSkillAnalyticsHandlers(): void {
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_ANALYTICS_RECORD);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_ANALYTICS_STATISTICS);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_ANALYTICS_SUMMARY);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_ANALYTICS_TREND);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_ANALYTICS_EXPORT);
}
```

## 2. チャネル別要件定義

### 2.1 skill:analytics:record

- **方向**: Renderer -> Main (`ipcMain.handle`)
- **定数名**: `SKILL_ANALYTICS_RECORD`
- **用途**: スキル実行時の使用イベントを記録する

#### 引数

オブジェクト形式で受信（`safeInvokeUnwrap` 経由）。

```typescript
interface RecordArgs {
  skillName: string; // 必須 — P42バリデーション対象
  eventType: string; // 必須 — "execution" | "error" | "cancellation" の3値
  success: boolean; // 必須 — 実行成功フラグ
  toolsUsed: string[]; // 必須 — 使用ツール名の文字列配列（空配列許可）
  duration?: number; // 任意 — 所要時間（ミリ秒、非負整数）
  errorMessage?: string; // 任意 — エラーメッセージ（eventType === "error" 時のみ）
  tokenCount?: number; // 任意 — トークン消費量（非負整数）
  timestamp?: string; // 任意 — ISO 8601文字列（省略時はMain側で自動補完）
}
```

#### 戻り値

```typescript
// 成功時
{ success: true }

// 失敗時
{ success: false, error: string }
```

#### バリデーション

| フィールド   | バリデーション                                                | エラーメッセージ                                             |
| ------------ | ------------------------------------------------------------- | ------------------------------------------------------------ |
| `args`       | `isPlainObject(args)`                                         | `"args must be a non-null object"`                           |
| `skillName`  | P42: `typeof !== "string"` or `trim() === ""`                 | `"skillName must be a non-empty string"`                     |
| `eventType`  | `!["execution", "error", "cancellation"].includes(eventType)` | `"eventType must be one of: execution, error, cancellation"` |
| `success`    | `typeof !== "boolean"`                                        | `"success must be a boolean"`                                |
| `toolsUsed`  | `!Array.isArray(toolsUsed)` or 要素が文字列でない             | `"toolsUsed must be an array of strings"`                    |
| `duration`   | 定義時: `typeof !== "number"` or `< 0`                        | `"duration must be a non-negative number"`                   |
| `tokenCount` | 定義時: `typeof !== "number"` or `< 0`                        | `"tokenCount must be a non-negative number"`                 |
| `timestamp`  | 定義時: `isNaN(Date.parse(timestamp))`                        | `"timestamp must be a valid ISO 8601 date string"`           |

#### セキュリティ

- `validateIpcSender(event, IPC_CHANNELS.SKILL_ANALYTICS_RECORD, { getAllowedWindows: () => [mainWindow] })` を先頭で実行
- 検証失敗時は `throw toIPCValidationError(validation)` で即座に拒否

#### ISO 8601変換

- **Renderer -> Main**: `timestamp` が ISO 8601 文字列として渡される。Main側でそのまま `SkillUsageEvent.timestamp` に格納。未指定時は `new Date().toISOString()` で自動補完
- **Main -> Renderer**: 戻り値に日時フィールドを含まないため変換不要

---

### 2.2 skill:analytics:statistics

- **方向**: Renderer -> Main (`ipcMain.handle`)
- **定数名**: `SKILL_ANALYTICS_STATISTICS`
- **用途**: 指定スキルの統計情報を取得する

#### 引数

単一の文字列引数（Preload側で `safeInvokeUnwrap(channel, skillName)` として送信）。

```typescript
skillName: string; // 必須 — P42バリデーション対象
```

#### 戻り値

```typescript
// 成功時
{
  success: true,
  data: SkillStatistics  // { skillName, totalExecutions, successRate, averageDuration, errorRate, totalTokens, lastUsed?, mostUsedTools }
}

// 失敗時
{ success: false, error: string }
```

`SkillStatistics.lastUsed` は ISO 8601 文字列（`string | null`）で返却する。

#### バリデーション

| フィールド  | バリデーション                                | エラーメッセージ                         |
| ----------- | --------------------------------------------- | ---------------------------------------- |
| `skillName` | P42: `typeof !== "string"` or `trim() === ""` | `"skillName must be a non-empty string"` |

#### セキュリティ

- `validateIpcSender(event, IPC_CHANNELS.SKILL_ANALYTICS_STATISTICS, { getAllowedWindows: () => [mainWindow] })` を先頭で実行

#### ISO 8601変換

- **Main -> Renderer**: `SkillStatistics.lastUsed` を ISO 8601 文字列（`string | null`）として返却。内部の `Date` オブジェクトは `.toISOString()` で変換

---

### 2.3 skill:analytics:summary

- **方向**: Renderer -> Main (`ipcMain.handle`)
- **定数名**: `SKILL_ANALYTICS_SUMMARY`
- **用途**: 全スキル横断のサマリー情報を取得する

#### 引数

なし。引数を受け取らない。

#### 戻り値

```typescript
// 成功時
{
  success: true,
  data: AnalyticsSummary  // { totalSkills, totalExecutions, overallSuccessRate, mostUsedSkills, recentActivity }
}

// 失敗時
{ success: false, error: string }
```

`AnalyticsSummary.mostUsedSkills[].lastUsed` と `AnalyticsSummary.recentActivity[].timestamp` は ISO 8601 文字列で返却する。

#### バリデーション

引数がないためフィールドバリデーションは不要。

#### セキュリティ

- `validateIpcSender(event, IPC_CHANNELS.SKILL_ANALYTICS_SUMMARY, { getAllowedWindows: () => [mainWindow] })` を先頭で実行

#### ISO 8601変換

- **Main -> Renderer**: `recentActivity[].timestamp` と `mostUsedSkills[].lastUsed` は ISO 8601 文字列として返却

---

### 2.4 skill:analytics:trend

- **方向**: Renderer -> Main (`ipcMain.handle`)
- **定数名**: `SKILL_ANALYTICS_TREND`
- **用途**: 指定スキルの使用トレンドデータを取得する

#### 引数

オブジェクト形式で受信。

```typescript
interface TrendArgs {
  skillName: string; // 必須 — P42バリデーション対象
  period: {
    start: string; // 必須 — ISO 8601文字列
    end: string; // 必須 — ISO 8601文字列
    granularity: string; // 必須 — "hour" | "day" | "week" | "month" の4値
  };
}
```

#### 戻り値

```typescript
// 成功時
{
  success: true,
  data: UsageTrend  // { period: AnalyticsPeriod, dataPoints: TrendDataPoint[] }
}

// 失敗時
{ success: false, error: string }
```

`UsageTrend.period.start/end` と `UsageTrend.dataPoints[].timestamp` は ISO 8601 文字列で返却する。

#### バリデーション

| フィールド     | バリデーション                                            | エラーメッセージ                                          |
| -------------- | --------------------------------------------------------- | --------------------------------------------------------- |
| `args`         | `isPlainObject(args)`                                     | `"args must be a non-null object"`                        |
| `skillName`    | P42: `typeof !== "string"` or `trim() === ""`             | `"skillName must be a non-empty string"`                  |
| `period`       | `isPlainObject(args.period)`                              | `"period must be a valid object"`                         |
| `period.start` | `typeof !== "string"` or `isNaN(Date.parse(start))`       | `"start must be a valid ISO 8601 date string"`            |
| `period.end`   | `typeof !== "string"` or `isNaN(Date.parse(end))`         | `"end must be a valid ISO 8601 date string"`              |
| start <= end   | `new Date(start) > new Date(end)`                         | `"period.start must be less than or equal to period.end"` |
| `granularity`  | `!["hour", "day", "week", "month"].includes(granularity)` | `"granularity must be one of: hour, day, week, month"`    |

#### セキュリティ

- `validateIpcSender(event, IPC_CHANNELS.SKILL_ANALYTICS_TREND, { getAllowedWindows: () => [mainWindow] })` を先頭で実行

#### ISO 8601変換

- **Renderer -> Main**: `period.start` / `period.end` は ISO 8601 文字列として受信。Main側で `new Date(start)` / `new Date(end)` に変換して期間フィルタに使用
- **Main -> Renderer**: `UsageTrend.dataPoints[].timestamp` と `UsageTrend.period.start/end` を ISO 8601 文字列として返却

---

### 2.5 skill:analytics:export

- **方向**: Renderer -> Main (`ipcMain.handle`)
- **定数名**: `SKILL_ANALYTICS_EXPORT`
- **用途**: イベントデータを CSV/JSON フォーマットでエクスポートする

#### 引数

オブジェクト形式で受信。

```typescript
interface ExportArgs {
  format: string; // 必須 — "json" | "csv" の2値
  period?: {
    // 任意 — 期間指定（省略時は全期間）
    start: string; // ISO 8601文字列
    end: string; // ISO 8601文字列
    granularity: string; // "hour" | "day" | "week" | "month"
  };
}
```

#### 戻り値

```typescript
// 成功時
{
  success: true,
  data: string  // CSV またはインデント2スペースの整形済みJSON文字列
}

// 失敗時
{ success: false, error: string }
```

#### バリデーション

| フィールド               | バリデーション                                            | エラーメッセージ                                          |
| ------------------------ | --------------------------------------------------------- | --------------------------------------------------------- |
| `args`                   | `isPlainObject(args)`                                     | `"args must be a non-null object"`                        |
| `format`                 | `!["json", "csv"].includes(format)`                       | `"format must be one of: json, csv"`                      |
| `period`（指定時）       | `isPlainObject(args.period)`                              | `"period must be a valid object"`                         |
| `period.start`（指定時） | `typeof !== "string"` or `isNaN(Date.parse(start))`       | `"start must be a valid ISO 8601 date string"`            |
| `period.end`（指定時）   | `typeof !== "string"` or `isNaN(Date.parse(end))`         | `"end must be a valid ISO 8601 date string"`              |
| start <= end（指定時）   | `new Date(start) > new Date(end)`                         | `"period.start must be less than or equal to period.end"` |
| `granularity`（指定時）  | `!["hour", "day", "week", "month"].includes(granularity)` | `"granularity must be one of: hour, day, week, month"`    |

#### セキュリティ

- `validateIpcSender(event, IPC_CHANNELS.SKILL_ANALYTICS_EXPORT, { getAllowedWindows: () => [mainWindow] })` を先頭で実行

#### ISO 8601変換

- **Renderer -> Main**: `period.start` / `period.end` は ISO 8601 文字列として受信
- **Main -> Renderer**: エクスポート結果の文字列内に含まれる日時はISO 8601形式を維持

---

## 3. 共通セキュリティ要件

### 3.1 Sender検証

全5チャネルのハンドラは、ビジネスロジック実行前に以下の検証を必須で実行する:

```typescript
const validation = validateIpcSender(event, channelName, {
  getAllowedWindows: () => [mainWindow],
});
if (!validation.valid) {
  throw toIPCValidationError(validation);
}
```

- `validateIpcSender` は `apps/desktop/src/main/infrastructure/security/ipc-validator.ts` から import する
- `toIPCValidationError` も同ファイルから import する
- 検証失敗時は `throw` で即座に処理を中断する（`return` ではない）

### 3.2 エラーサニタイズ

予期しない例外が発生した場合、内部情報（スタックトレース、ファイルパス、IPアドレス等）をRenderer側に漏洩しない:

```typescript
try {
  // ビジネスロジック
} catch (error) {
  return { success: false, error: "Internal error" };
}
```

`skillHandlers.ts` の `sanitizeErrorMessage()` 関数を使用するか、単純に `"Internal error"` を返す。既知のビジネスエラー（例: スキル未検出）のみ具体的なメッセージを返す。

### 3.3 チャネル名の定数参照

全チャネル名は `IPC_CHANNELS` 定数から参照し、ハードコード文字列を使用しない（P27対策）。

### 3.4 ホワイトリスト管理

`ALLOWED_INVOKE_CHANNELS` への5チャネル追加を必須とする。ホワイトリストに含まれないチャネルは `safeInvoke` / `safeInvokeUnwrap` がPreload層で拒否する。

## 4. 共通バリデーション要件

### 4.1 P42準拠3段バリデーション（文字列引数）

全文字列引数に対して以下の3段階バリデーションを実施する:

```typescript
// P42準拠: 3段バリデーション
function validateStringArg(value: unknown, argName: string): string | null {
  // Step 1: 型チェック
  if (typeof value !== "string") {
    return `${argName} must be a non-empty string`;
  }
  // Step 2 + 3: 空文字列 + トリム後空文字列（統合）
  if (value.trim() === "") {
    return `${argName} must be a non-empty string`;
  }
  return null;
}
```

### 4.2 列挙値バリデーション

許可リストによる列挙値チェック:

```typescript
const VALID_EVENT_TYPES = ["execution", "error", "cancellation"] as const;
const VALID_GRANULARITIES = ["hour", "day", "week", "month"] as const;
const VALID_FORMATS = ["json", "csv"] as const;
```

### 4.3 数値バリデーション

任意の数値引数（`duration`, `tokenCount`）は定義されている場合のみ検証:

```typescript
if (args.duration !== undefined) {
  if (typeof args.duration !== "number" || args.duration < 0) {
    return { success: false, error: "duration must be a non-negative number" };
  }
}
```

### 4.4 ISO 8601日時バリデーション

```typescript
function isValidISO8601(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const parsed = Date.parse(value);
  return !isNaN(parsed);
}
```

### 4.5 AnalyticsPeriodバリデーション（共通関数）

`skill:analytics:trend` と `skill:analytics:export`（`period` 指定時）で共有する:

```typescript
function validatePeriod(period: unknown): string | null {
  if (typeof period !== "object" || period === null || Array.isArray(period)) {
    return "period must be a valid object";
  }
  const p = period as Record<string, unknown>;

  if (!isValidISO8601(p.start)) {
    return "start must be a valid ISO 8601 date string";
  }
  if (!isValidISO8601(p.end)) {
    return "end must be a valid ISO 8601 date string";
  }
  if (new Date(p.start as string) > new Date(p.end as string)) {
    return "period.start must be less than or equal to period.end";
  }
  if (
    !VALID_GRANULARITIES.includes(
      p.granularity as (typeof VALID_GRANULARITIES)[number],
    )
  ) {
    return "granularity must be one of: hour, day, week, month";
  }
  return null;
}
```

### 4.6 バリデーションエラーの返却パターン

2つのパターンが既存コードに存在する:

1. **throwパターン**: `throw { code: "VALIDATION_ERROR", message: "..." }` — `safeInvoke` 系で直接呼ばれるハンドラ向け
2. **returnパターン**: `return { success: false, error: "..." }` — `safeInvokeUnwrap` 系で呼ばれるハンドラ向け

TASK-9Jでは、`safeInvokeUnwrap` を使用するため、`{ success: false, error: string }` の **return パターン** を統一採用する。`safeInvokeUnwrap` は `result.success === false` を検出して `throw new Error(result.error)` に変換するため、Renderer側では例外として受け取る。

## 5. ISO 8601シリアライズ方針

### 5.1 基本方針

IPC境界（Renderer <-> Main）を越える全ての日時データは ISO 8601 文字列（`string`）で送受信する。`Date` オブジェクトはシリアライゼーション時に自動変換されないため、明示的な変換が必要。

### 5.2 変換方向

| 方向             | 変換                                                                               | 変換箇所                            |
| ---------------- | ---------------------------------------------------------------------------------- | ----------------------------------- |
| Renderer -> Main | ISO 8601 文字列をそのまま使用（内部で `new Date(isoString)` が必要な場合のみ変換） | IPCハンドラ内部                     |
| Main -> Renderer | `Date` -> `.toISOString()`                                                         | `SkillAnalytics` の各メソッド返却時 |

### 5.3 対象フィールド

| 型                  | フィールド     | シリアライズ形式             |
| ------------------- | -------------- | ---------------------------- |
| `SkillUsageEvent`   | `timestamp`    | `string`（ISO 8601）         |
| `SkillStatistics`   | `lastUsed`     | `string \| null`（ISO 8601） |
| `AnalyticsPeriod`   | `start`, `end` | `string`（ISO 8601）         |
| `TrendDataPoint`    | `timestamp`    | `string`（ISO 8601）         |
| `SkillUsageSummary` | `lastUsed`     | `string \| null`（ISO 8601） |

### 5.4 共有型での型定義

`packages/shared/src/types/skill-analytics.ts` では全ての日時フィールドを `string`（ISO 8601文字列）として定義する。`Date` 型は使用しない。これにより、IPC境界での型変換コードが不要となり、契約ドリフトリスクを排除する。

## 6. 既存パターンとの整合性確認結果

| 確認項目               | 整合パターン                                                       | 確認結果                                                                                                      |
| ---------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| チャネル命名           | `skill:schedule:*` の3階層パターン                                 | `skill:analytics:*` で完全準拠                                                                                |
| 定数名規則             | `SKILL_SCHEDULE_LIST` -> `SKILL_ANALYTICS_RECORD`                  | アンダースコア区切りの大文字で準拠                                                                            |
| ホワイトリスト         | `ALLOWED_INVOKE_CHANNELS` への追加                                 | 5チャネルを追加。`ALLOWED_ON_CHANNELS` は不要                                                                 |
| Sender検証             | `validateIpcSender` + `toIPCValidationError`                       | 全5チャネルで使用                                                                                             |
| バリデーション         | P42準拠3段バリデーション                                           | `skillName` 等の文字列引数に適用                                                                              |
| エラーサニタイズ       | 内部例外は `"Internal error"` に正規化                             | `sanitizeErrorMessage` または定数文字列で準拠                                                                 |
| レスポンス形式         | `{ success: true, data: T }` / `{ success: false, error: string }` | 全5チャネルで準拠                                                                                             |
| Preload API            | `safeInvokeUnwrap` 使用、`window.electronAPI.skill.*` 配下に公開   | `analyticsRecord`, `analyticsStatistics`, `analyticsSummary`, `analyticsTrend`, `analyticsExport` の5メソッド |
| ハンドラ登録/解除      | `registerXxxHandlers` / `unregisterXxxHandlers` 関数パターン       | `registerSkillAnalyticsHandlers` / `unregisterSkillAnalyticsHandlers` で準拠                                  |
| バリデーション共通関数 | `validateStringArg` パターン（TASK-9Gで導入済み）                  | 再利用または同一パターンで実装                                                                                |
| ISO 8601統一           | 共有型で `string` 型に統一（`Date` 型不使用）                      | NFR-2 準拠                                                                                                    |
| ハードコード文字列禁止 | `IPC_CHANNELS` 定数からの参照                                      | P27対策として全チャネルで定数参照                                                                             |

### 6.1 TASK-9G（skill-schedule）との対比

| 観点                    | TASK-9G (schedule)                                    | TASK-9J (analytics)                                         |
| ----------------------- | ----------------------------------------------------- | ----------------------------------------------------------- |
| チャネル数              | 5 (`list`, `add`, `update`, `delete`, `toggle`)       | 5 (`record`, `statistics`, `summary`, `trend`, `export`)    |
| 命名パターン            | `skill:schedule:{action}`                             | `skill:analytics:{action}`                                  |
| ハンドラファイル        | `skillHandlers.ts` 内 `registerSkillScheduleHandlers` | 新規 `skillAnalyticsHandlers.ts` に分離（コード量に応じて） |
| Preload API             | `skillAPI` 内 `scheduleList`, `scheduleAdd` 等        | `skillAPI` 内 `analyticsRecord`, `analyticsStatistics` 等   |
| ストア                  | `ScheduleStore`（electron-store）                     | `AnalyticsStore`（electron-store）                          |
| バリデーション共通関数  | `validateStringArg`                                   | 同パターンで共用                                            |
| `safeInvokeUnwrap` 使用 | 全チャネルで使用                                      | 全チャネルで使用                                            |

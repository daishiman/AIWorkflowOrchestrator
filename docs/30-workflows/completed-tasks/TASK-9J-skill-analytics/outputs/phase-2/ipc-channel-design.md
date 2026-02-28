# Phase 2 タスク3: IPCチャネル設計

## メタ情報

| 項目   | 内容                                                         |
| ------ | ------------------------------------------------------------ |
| タスク | タスク3: IPCチャネル設計                                     |
| 前提   | タスク1（ドメインモデル設計）、タスク2（アーキテクチャ設計） |
| 作成日 | 2026-02-28                                                   |

## 目的

5チャンネルの引数・戻り値・バリデーションを単一契約に統一する。全チャネルで `validateIpcSender` を先頭実行し、P42準拠3段バリデーションを適用し、予期しない例外は `"Internal error"` に正規化する。

## チャネル定数定義

`apps/desktop/src/preload/channels.ts` に以下の5定数を追加する。

```typescript
// Skill analytics operations (TASK-9J)
SKILL_ANALYTICS_RECORD: "skill:analytics:record",
SKILL_ANALYTICS_STATISTICS: "skill:analytics:statistics",
SKILL_ANALYTICS_SUMMARY: "skill:analytics:summary",
SKILL_ANALYTICS_TREND: "skill:analytics:trend",
SKILL_ANALYTICS_EXPORT: "skill:analytics:export",
```

**配置場所**: 既存の `// Skill schedule operations (TASK-9G)` ブロックの直後。

### ホワイトリスト登録

`ALLOWED_INVOKE_CHANNELS` に5チャネルを追加する。

```typescript
// Skill analytics channels (TASK-9J)
IPC_CHANNELS.SKILL_ANALYTICS_RECORD,
IPC_CHANNELS.SKILL_ANALYTICS_STATISTICS,
IPC_CHANNELS.SKILL_ANALYTICS_SUMMARY,
IPC_CHANNELS.SKILL_ANALYTICS_TREND,
IPC_CHANNELS.SKILL_ANALYTICS_EXPORT,
```

`ALLOWED_ON_CHANNELS` への追加は不要（Main -> Renderer のイベント送信チャネルがないため）。

---

## 5チャネル契約テーブル

### 契約一覧

| チャネル                     | 引数                                                                                              | 成功レスポンス                              | 失敗レスポンス                      | バリデーション要点                                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `skill:analytics:record`     | `{ skillName, eventType, success, toolsUsed, duration?, errorMessage?, tokenCount?, timestamp? }` | `{ success: true }`                         | `{ success: false, error: string }` | `skillName` P42、`eventType` 3値、`success` boolean、`toolsUsed` string[]、`duration/tokenCount` 非負 |
| `skill:analytics:statistics` | `skillName: string`                                                                               | `{ success: true, data: SkillStatistics }`  | `{ success: false, error: string }` | `skillName` P42                                                                                       |
| `skill:analytics:summary`    | なし                                                                                              | `{ success: true, data: AnalyticsSummary }` | `{ success: false, error: string }` | なし（引数なし）                                                                                      |
| `skill:analytics:trend`      | `{ skillName: string, period: AnalyticsPeriod }`                                                  | `{ success: true, data: UsageTrend }`       | `{ success: false, error: string }` | `skillName` P42、`period` オブジェクト検証、`start/end` ISO 8601、`start <= end`、`granularity` 4値   |
| `skill:analytics:export`     | `{ format: "json" \| "csv", period?: AnalyticsPeriod }`                                           | `{ success: true, data: string }`           | `{ success: false, error: string }` | `format` 2値、`period` 指定時は trend と同条件                                                        |

---

## チャネル別詳細

### 1. skill:analytics:record

**定数名**: `SKILL_ANALYTICS_RECORD`

**方向**: Renderer -> Main (`ipcMain.handle`)

**用途**: スキル実行時の使用イベントを記録する

#### 引数

```typescript
interface RecordArgs {
  skillName: string; // 必須 — P42バリデーション対象
  eventType: string; // 必須 — "execution" | "error" | "cancellation" の3値
  success: boolean; // 必須 — 実行成功フラグ
  toolsUsed: string[]; // 必須 — 使用ツール名の文字列配列（空配列許可）
  duration?: number; // 任意 — 所要時間（ミリ秒、非負）
  errorMessage?: string; // 任意 — エラーメッセージ
  tokenCount?: number; // 任意 — トークン消費量（非負）
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

| フィールド   | バリデーション                                                         | エラーメッセージ                                             |
| ------------ | ---------------------------------------------------------------------- | ------------------------------------------------------------ |
| `args`       | `typeof args !== "object" \|\| args === null \|\| Array.isArray(args)` | `"args must be a non-null object"`                           |
| `skillName`  | P42: `typeof !== "string"` or `trim() === ""`                          | `"skillName must be a non-empty string"`                     |
| `eventType`  | `!["execution", "error", "cancellation"].includes(eventType)`          | `"eventType must be one of: execution, error, cancellation"` |
| `success`    | `typeof !== "boolean"`                                                 | `"success must be a boolean"`                                |
| `toolsUsed`  | `!Array.isArray(toolsUsed)` or 要素が文字列でない                      | `"toolsUsed must be an array of strings"`                    |
| `duration`   | 定義時: `typeof !== "number"` or `< 0`                                 | `"duration must be a non-negative number"`                   |
| `tokenCount` | 定義時: `typeof !== "number"` or `< 0`                                 | `"tokenCount must be a non-negative number"`                 |
| `timestamp`  | 定義時: `isNaN(Date.parse(timestamp))`                                 | `"timestamp must be a valid ISO 8601 date string"`           |

---

### 2. skill:analytics:statistics

**定数名**: `SKILL_ANALYTICS_STATISTICS`

**方向**: Renderer -> Main (`ipcMain.handle`)

**用途**: 指定スキルの統計情報を取得する

#### 引数

```typescript
skillName: string; // 単一文字列引数 — P42バリデーション対象
```

Preload 側で `safeInvokeUnwrap(channel, skillName)` として送信する。

#### 戻り値

```typescript
// 成功時
{
  success: true,
  data: SkillStatistics
}

// 失敗時
{ success: false, error: string }
```

#### バリデーション

| フィールド  | バリデーション                                | エラーメッセージ                         |
| ----------- | --------------------------------------------- | ---------------------------------------- |
| `skillName` | P42: `typeof !== "string"` or `trim() === ""` | `"skillName must be a non-empty string"` |

---

### 3. skill:analytics:summary

**定数名**: `SKILL_ANALYTICS_SUMMARY`

**方向**: Renderer -> Main (`ipcMain.handle`)

**用途**: 全スキル横断のサマリー情報を取得する

#### 引数

なし。

#### 戻り値

```typescript
// 成功時
{
  success: true,
  data: AnalyticsSummary
}

// 失敗時
{ success: false, error: string }
```

#### バリデーション

引数がないためフィールドバリデーションは不要。

---

### 4. skill:analytics:trend

**定数名**: `SKILL_ANALYTICS_TREND`

**方向**: Renderer -> Main (`ipcMain.handle`)

**用途**: 指定スキルの使用トレンドデータを取得する

#### 引数

```typescript
interface TrendArgs {
  skillName: string;
  period: {
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
  data: UsageTrend
}

// 失敗時
{ success: false, error: string }
```

#### バリデーション

| フィールド     | バリデーション                                            | エラーメッセージ                                          |
| -------------- | --------------------------------------------------------- | --------------------------------------------------------- |
| `args`         | `typeof args !== "object" \|\| args === null`             | `"args must be a non-null object"`                        |
| `skillName`    | P42: `typeof !== "string"` or `trim() === ""`             | `"skillName must be a non-empty string"`                  |
| `period`       | `typeof period !== "object" \|\| period === null`         | `"period must be a valid object"`                         |
| `period.start` | `typeof !== "string"` or `isNaN(Date.parse(start))`       | `"start must be a valid ISO 8601 date string"`            |
| `period.end`   | `typeof !== "string"` or `isNaN(Date.parse(end))`         | `"end must be a valid ISO 8601 date string"`              |
| start <= end   | `new Date(start) > new Date(end)`                         | `"period.start must be less than or equal to period.end"` |
| `granularity`  | `!["hour", "day", "week", "month"].includes(granularity)` | `"granularity must be one of: hour, day, week, month"`    |

---

### 5. skill:analytics:export

**定数名**: `SKILL_ANALYTICS_EXPORT`

**方向**: Renderer -> Main (`ipcMain.handle`)

**用途**: イベントデータを CSV/JSON フォーマットでエクスポートする

#### 引数

```typescript
interface ExportArgs {
  format: string; // "json" | "csv"
  period?: {
    // 任意 — 期間指定（省略時は全期間）
    start: string;
    end: string;
    granularity: string;
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
| `args`                   | `typeof args !== "object" \|\| args === null`             | `"args must be a non-null object"`                        |
| `format`                 | `!["json", "csv"].includes(format)`                       | `"format must be one of: json, csv"`                      |
| `period`（指定時）       | `typeof period !== "object" \|\| period === null`         | `"period must be a valid object"`                         |
| `period.start`（指定時） | `typeof !== "string"` or `isNaN(Date.parse(start))`       | `"start must be a valid ISO 8601 date string"`            |
| `period.end`（指定時）   | `typeof !== "string"` or `isNaN(Date.parse(end))`         | `"end must be a valid ISO 8601 date string"`              |
| start <= end（指定時）   | `new Date(start) > new Date(end)`                         | `"period.start must be less than or equal to period.end"` |
| `granularity`（指定時）  | `!["hour", "day", "week", "month"].includes(granularity)` | `"granularity must be one of: hour, day, week, month"`    |

---

## 共通セキュリティ契約

### Sender 検証

全5チャネルのハンドラは、ビジネスロジック実行前に以下の検証を必須で実行する。

```typescript
const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_ANALYTICS_*, {
  getAllowedWindows: () => [mainWindow],
});
if (!validation.valid) {
  return toIPCValidationError(validation);
}
```

- `validateIpcSender` は `apps/desktop/src/main/infrastructure/security/ipc-validator.ts` から import する
- `toIPCValidationError` も同ファイルから import する
- 検証失敗時は `return toIPCValidationError(validation)` でレスポンスを返す（TASK-9G の return 方式に準拠）

### エラーサニタイズ

予期しない例外が発生した場合、内部情報（スタックトレース、ファイルパス、IPアドレス）を Renderer 側に漏洩しない。

```typescript
try {
  // ビジネスロジック
  const result = await skillAnalytics.xxx();
  return { success: true, data: result };
} catch (error) {
  log.error("[skillAnalyticsHandlers] skill:analytics:xxx failed:", error);
  return { success: false, error: "Internal error" };
}
```

### チャネル名の定数参照

全チャネル名は `IPC_CHANNELS` 定数から参照し、ハードコード文字列を使用しない（P27対策）。

---

## ハンドラ登録/解除関数

### 登録関数

```typescript
export function registerSkillAnalyticsHandlers(
  mainWindow: BrowserWindow,
  skillAnalytics: SkillAnalytics,
): void {
  // 5チャネルのハンドラを登録
  ipcMain.handle(IPC_CHANNELS.SKILL_ANALYTICS_RECORD, ...);
  ipcMain.handle(IPC_CHANNELS.SKILL_ANALYTICS_STATISTICS, ...);
  ipcMain.handle(IPC_CHANNELS.SKILL_ANALYTICS_SUMMARY, ...);
  ipcMain.handle(IPC_CHANNELS.SKILL_ANALYTICS_TREND, ...);
  ipcMain.handle(IPC_CHANNELS.SKILL_ANALYTICS_EXPORT, ...);
}
```

### 解除関数

```typescript
export function unregisterSkillAnalyticsHandlers(): void {
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_ANALYTICS_RECORD);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_ANALYTICS_STATISTICS);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_ANALYTICS_SUMMARY);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_ANALYTICS_TREND);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_ANALYTICS_EXPORT);
}
```

P5対策として、二重登録防止のため `unregister` 後に `register` する運用を行う。

---

## バリデーション共通関数

### validateStringArg（既存再利用）

TASK-9G で導入済みの `validateStringArg` パターンを再利用する。

```typescript
function validateStringArg(
  value: unknown,
  argName: string,
): { success: false; error: string } | null {
  if (typeof value !== "string" || value.trim() === "") {
    return {
      success: false,
      error: `${argName} must be a non-empty string`,
    };
  }
  return null;
}
```

### validatePeriod（新規共通関数）

`skill:analytics:trend` と `skill:analytics:export`（period 指定時）で共有する。

```typescript
const VALID_GRANULARITIES = ["hour", "day", "week", "month"] as const;

function validatePeriod(
  period: unknown,
): { success: false; error: string } | null {
  if (typeof period !== "object" || period === null || Array.isArray(period)) {
    return { success: false, error: "period must be a valid object" };
  }
  const p = period as Record<string, unknown>;

  if (typeof p.start !== "string" || isNaN(Date.parse(p.start))) {
    return {
      success: false,
      error: "start must be a valid ISO 8601 date string",
    };
  }
  if (typeof p.end !== "string" || isNaN(Date.parse(p.end))) {
    return {
      success: false,
      error: "end must be a valid ISO 8601 date string",
    };
  }
  if (new Date(p.start) > new Date(p.end)) {
    return {
      success: false,
      error: "period.start must be less than or equal to period.end",
    };
  }
  if (
    !VALID_GRANULARITIES.includes(
      p.granularity as (typeof VALID_GRANULARITIES)[number],
    )
  ) {
    return {
      success: false,
      error: "granularity must be one of: hour, day, week, month",
    };
  }
  return null;
}
```

### 列挙値定数

```typescript
const VALID_EVENT_TYPES = ["execution", "error", "cancellation"] as const;
const VALID_GRANULARITIES = ["hour", "day", "week", "month"] as const;
const VALID_FORMATS = ["json", "csv"] as const;
```

---

## 完了条件

- [x] 5チャネルの定数名と文字列値が確定している
- [x] ALLOWED_INVOKE_CHANNELS への5チャネル追加が定義されている
- [x] 5チャネルの引数・戻り値・バリデーション契約テーブルが定義されている
- [x] 共通セキュリティ契約（validateIpcSender、エラーサニタイズ、定数参照）が定義されている
- [x] ハンドラ登録/解除関数の署名が定義されている
- [x] バリデーション共通関数（validateStringArg、validatePeriod）が定義されている

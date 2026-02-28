# Phase 2 タスク5: エラーハンドリング設計

## メタ情報

| 項目   | 内容                            |
| ------ | ------------------------------- |
| タスク | タスク5: エラーハンドリング設計 |
| 前提   | タスク3（IPCチャネル設計）      |
| 作成日 | 2026-02-28                      |

## 目的

バリデーションエラーと内部エラーを明確に分離し、情報漏えいを防止するエラーハンドリング設計を定義する。

## エラー分類方針

### 2カテゴリの分離

| カテゴリ             | 発生箇所              | Renderer への返却内容            | ログ出力 |
| -------------------- | --------------------- | -------------------------------- | -------- |
| バリデーションエラー | IPC ハンドラ層        | 具体的なエラーメッセージ         | なし     |
| 内部エラー           | 全レイヤー（catch節） | `"Internal error"`（固定文字列） | あり     |

**バリデーションエラー**: 引数の型・値・制約の不整合。Renderer 側の開発者が修正可能な情報を返す。

**内部エラー**: ビジネスロジックや永続化層の予期しない例外。内部情報（スタックトレース、ファイルパス、IP アドレス）を漏洩しない。

---

## 11エラーパターンの定義

### エラーパターン一覧

| #   | エラーパターン          | 返却内容                                                                                | 発生箇所   | 発生チャネル                  |
| --- | ----------------------- | --------------------------------------------------------------------------------------- | ---------- | ----------------------------- |
| 1   | `skillName` 不正        | `{ success: false, error: "skillName must be a non-empty string" }`                     | IPC        | record, statistics, trend     |
| 2   | `eventType` 不正        | `{ success: false, error: "eventType must be one of: execution, error, cancellation" }` | IPC        | record                        |
| 3   | `period` 不正           | `{ success: false, error: "period must be a valid object" }`                            | IPC        | trend, export（period指定時） |
| 4   | `period.start/end` 不正 | `{ success: false, error: "start/end must be a valid ISO 8601 date string" }`           | IPC        | trend, export（period指定時） |
| 5   | `start > end`           | `{ success: false, error: "period.start must be less than or equal to period.end" }`    | IPC        | trend, export（period指定時） |
| 6   | `granularity` 不正      | `{ success: false, error: "granularity must be one of: hour, day, week, month" }`       | IPC        | trend, export（period指定時） |
| 7   | `format` 不正           | `{ success: false, error: "format must be one of: json, csv" }`                         | IPC        | export                        |
| 8   | `duration` 負数         | `{ success: false, error: "duration must be a non-negative number" }`                   | IPC        | record                        |
| 9   | `tokenCount` 負数       | `{ success: false, error: "tokenCount must be a non-negative number" }`                 | IPC        | record                        |
| 10  | Sender検証失敗          | `toIPCValidationError(validation)` の既定エラー                                         | IPC        | 全5チャネル                   |
| 11  | 予期しない例外          | `{ success: false, error: "Internal error" }`                                           | 全レイヤー | 全5チャネル                   |

---

## エラーパターン詳細

### パターン1: skillName 不正（型/空/trim空）

**P42準拠3段バリデーション**

```typescript
// 検出条件
typeof skillName !== "string" || skillName.trim() === ""

// 返却
{ success: false, error: "skillName must be a non-empty string" }
```

**発生するケース:**

- `skillName` が `undefined` / `null` / `number` / `boolean` 型
- `skillName` が空文字列 `""`
- `skillName` がスペースのみ `"   "`

**対象チャネル:** `skill:analytics:record`, `skill:analytics:statistics`, `skill:analytics:trend`

---

### パターン2: eventType 不正

```typescript
// 検出条件
const VALID_EVENT_TYPES = ["execution", "error", "cancellation"] as const;
!VALID_EVENT_TYPES.includes(eventType as typeof VALID_EVENT_TYPES[number])

// 返却
{ success: false, error: "eventType must be one of: execution, error, cancellation" }
```

**発生するケース:**

- `eventType` が許可リスト外の文字列
- `eventType` が `undefined` / `null` / 数値

**対象チャネル:** `skill:analytics:record`

---

### パターン3: period 不正

```typescript
// 検出条件
typeof period !== "object" || period === null || Array.isArray(period)

// 返却
{ success: false, error: "period must be a valid object" }
```

**発生するケース:**

- `period` が `null` / `undefined` / 配列 / 文字列 / 数値

**対象チャネル:** `skill:analytics:trend`, `skill:analytics:export`（period 指定時）

---

### パターン4: period.start/end 不正

```typescript
// 検出条件（start の例）
typeof period.start !== "string" || isNaN(Date.parse(period.start))

// 返却
{ success: false, error: "start must be a valid ISO 8601 date string" }
// または
{ success: false, error: "end must be a valid ISO 8601 date string" }
```

**発生するケース:**

- `start` / `end` が `undefined` / `null` / 数値
- `start` / `end` が不正な日付文字列（例: `"not-a-date"`）

**対象チャネル:** `skill:analytics:trend`, `skill:analytics:export`（period 指定時）

---

### パターン5: start > end

```typescript
// 検出条件
new Date(period.start) > new Date(period.end)

// 返却
{ success: false, error: "period.start must be less than or equal to period.end" }
```

**発生するケース:**

- `start` が `end` より未来の日時

**対象チャネル:** `skill:analytics:trend`, `skill:analytics:export`（period 指定時）

---

### パターン6: granularity 不正

```typescript
// 検出条件
const VALID_GRANULARITIES = ["hour", "day", "week", "month"] as const;
!VALID_GRANULARITIES.includes(granularity as typeof VALID_GRANULARITIES[number])

// 返却
{ success: false, error: "granularity must be one of: hour, day, week, month" }
```

**発生するケース:**

- `granularity` が許可リスト外の文字列（例: `"minute"`, `"year"`）
- `granularity` が `undefined` / `null`

**対象チャネル:** `skill:analytics:trend`, `skill:analytics:export`（period 指定時）

---

### パターン7: format 不正

```typescript
// 検出条件
const VALID_FORMATS = ["json", "csv"] as const;
!VALID_FORMATS.includes(format as typeof VALID_FORMATS[number])

// 返却
{ success: false, error: "format must be one of: json, csv" }
```

**発生するケース:**

- `format` が許可リスト外の文字列（例: `"xml"`, `"yaml"`）
- `format` が `undefined` / `null`

**対象チャネル:** `skill:analytics:export`

---

### パターン8: duration 負数

```typescript
// 検出条件（duration が定義されている場合のみ）
args.duration !== undefined &&
  (typeof args.duration !== "number" || args.duration < 0)

// 返却
{ success: false, error: "duration must be a non-negative number" }
```

**発生するケース:**

- `duration` が負の数値（例: `-100`）
- `duration` が文字列や boolean

**対象チャネル:** `skill:analytics:record`

**注意:** `duration` は任意フィールドのため、`undefined` の場合はバリデーションをスキップする。

---

### パターン9: tokenCount 負数

```typescript
// 検出条件（tokenCount が定義されている場合のみ）
args.tokenCount !== undefined &&
  (typeof args.tokenCount !== "number" || args.tokenCount < 0)

// 返却
{ success: false, error: "tokenCount must be a non-negative number" }
```

**発生するケース:**

- `tokenCount` が負の数値（例: `-50`）
- `tokenCount` が文字列や boolean

**対象チャネル:** `skill:analytics:record`

**注意:** `tokenCount` は任意フィールドのため、`undefined` の場合はバリデーションをスキップする。

---

### パターン10: Sender 検証失敗

```typescript
// 検出条件
const validation = validateIpcSender(event, channelName, {
  getAllowedWindows: () => [mainWindow],
});
if (!validation.valid) {
  return toIPCValidationError(validation);
}
```

**返却内容:** `toIPCValidationError()` が生成する既定のエラーオブジェクト。

```typescript
{
  success: false,
  error: {
    code: "IPC_UNAUTHORIZED" | "IPC_FORBIDDEN",
    message: "Unauthorized IPC call: ..."
  }
}
```

**発生するケース:**

- DevTools からの直接 IPC 呼び出し
- 許可されていないウィンドウからの呼び出し
- BrowserWindow が取得できない送信元

**対象チャネル:** 全5チャネル

---

### パターン11: 予期しない例外

```typescript
// ハンドラ内の try-catch
try {
  // ビジネスロジック呼び出し
  const result = await skillAnalytics.xxx();
  return { success: true, data: result };
} catch (error) {
  log.error("[skillAnalyticsHandlers] skill:analytics:xxx failed:", error);
  return { success: false, error: "Internal error" };
}
```

**返却内容:** `{ success: false, error: "Internal error" }`（固定文字列）

**ログ出力:** `electron-log` で完全なエラー情報（スタックトレース含む）を出力する。

**Renderer に返さない情報:**

- スタックトレース
- Unix / Windows ファイルパス
- IP アドレス
- 機密情報（token, key, password, secret）
- JavaScript ランタイムエラーの詳細（`Cannot read properties of undefined` 等）

**発生するケース:**

- electron-store の読み書き失敗
- UUID 生成失敗
- メモリ不足
- その他の想定外例外

**対象チャネル:** 全5チャネル

---

## バリデーション実行順序

各ハンドラ内のバリデーションは以下の順序で実行する。先に検出されたエラーが優先される（early return）。

### skill:analytics:record の実行順序

1. Sender 検証（`validateIpcSender`）
2. `args` がオブジェクトであること
3. `skillName` の P42 バリデーション
4. `eventType` の列挙値バリデーション
5. `success` の型バリデーション
6. `toolsUsed` の配列バリデーション
7. `duration` の非負数バリデーション（定義時のみ）
8. `tokenCount` の非負数バリデーション（定義時のみ）
9. `timestamp` の ISO 8601 バリデーション（定義時のみ）

### skill:analytics:statistics の実行順序

1. Sender 検証
2. `skillName` の P42 バリデーション

### skill:analytics:summary の実行順序

1. Sender 検証

### skill:analytics:trend の実行順序

1. Sender 検証
2. `args` がオブジェクトであること
3. `skillName` の P42 バリデーション
4. `period` のオブジェクトバリデーション
5. `period.start` の ISO 8601 バリデーション
6. `period.end` の ISO 8601 バリデーション
7. `start <= end` の範囲バリデーション
8. `granularity` の列挙値バリデーション

### skill:analytics:export の実行順序

1. Sender 検証
2. `args` がオブジェクトであること
3. `format` の列挙値バリデーション
4. `period`（指定時）のオブジェクトバリデーション
5. `period.start`（指定時）の ISO 8601 バリデーション
6. `period.end`（指定時）の ISO 8601 バリデーション
7. `start <= end`（指定時）の範囲バリデーション
8. `granularity`（指定時）の列挙値バリデーション

---

## エラーレスポンス形式の統一

全エラーレスポンスは `{ success: false, error: string }` 形式で統一する（TASK-9G の return 方式に準拠）。

```typescript
// バリデーションエラー
{ success: false, error: "具体的なエラーメッセージ" }

// 内部エラー
{ success: false, error: "Internal error" }

// Sender 検証失敗
toIPCValidationError(validation)  // 既定のエラーオブジェクト
```

`throw` 方式は使用しない。`safeInvokeUnwrap` が `result.success === false` を検出して Renderer 側で例外に変換する。

---

## 完了条件

- [x] 11エラーパターンが定義されている
- [x] 各パターンの返却内容が具体的に定義されている
- [x] 各パターンの発生条件が具体的に定義されている
- [x] バリデーション実行順序が全5チャネルで定義されている
- [x] バリデーションエラーと内部エラーが明確に分離されている
- [x] 内部例外詳細（スタックトレース・内部パス）が Renderer に返されない設計になっている

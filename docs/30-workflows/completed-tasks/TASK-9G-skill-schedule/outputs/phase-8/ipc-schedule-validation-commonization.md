# Phase 8 IPC バリデーション共通化分析

## 分析対象

- `apps/desktop/src/main/ipc/skillHandlers.ts` のスケジュール関連部分（L544-784）

## 分析日時

2026-02-27（Phase 8-9 統合検証時に再分析）

## 分析結果

### P42準拠 3段バリデーションの重複

| ハンドラー      | バリデーション対象          | 重複パターン |
| --------------- | --------------------------- | ------------ |
| schedule:list   | なし（引数不要）            | -            |
| schedule:add    | skillName, prompt, schedule | 文字列3段    |
| schedule:update | id                          | 文字列3段    |
| schedule:delete | id                          | 文字列3段    |
| schedule:toggle | id                          | 文字列3段    |

`args?.id` の3段バリデーション（型チェック + 空文字列 + trim空文字列）が update/delete/toggle の3箇所で完全に同一。

### エラーレスポンス構築の重複

`{ success: false, error: ... }` のエラーレスポンス構築が5ハンドラーの catch ブロックで完全同一。

## 実施済みリファクタリング

### 1. validateStringArg 共通関数の抽出（L555-566）

P42準拠の3段バリデーションを共通関数として skillHandlers.ts のスケジュールセクションに定義。

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

各ハンドラーでの使用:

```typescript
// schedule:add
const skillNameError = validateStringArg(args?.skillName, "skillName");
if (skillNameError) return skillNameError;

const promptError = validateStringArg(args?.prompt, "prompt");
if (promptError) return promptError;

// schedule:update / delete / toggle
const idError = validateStringArg(args?.id, "id");
if (idError) return idError;
```

### 2. toIpcErrorResponse 共通関数の抽出（L574-582）

catch ブロックのエラーレスポンス構築を共通関数に抽出。

```typescript
function toIpcErrorResponse(error: unknown): {
  success: false;
  error: string;
} {
  return {
    success: false,
    error: error instanceof Error ? error.message : "Internal error",
  };
}
```

### 適用箇所

| ハンドラー      | validateStringArg 適用 | toIpcErrorResponse 適用 |
| --------------- | ---------------------- | ----------------------- |
| schedule:list   | -                      | 適用                    |
| schedule:add    | skillName, prompt      | 適用                    |
| schedule:update | id                     | 適用                    |
| schedule:delete | id                     | 適用                    |
| schedule:toggle | id                     | 適用                    |

### 共通化の効果

- validateStringArg: 3段バリデーション 5行 x 5箇所 = 25行 を 関数定義10行 + 呼び出し2行 x 5 = 20行に削減
- toIpcErrorResponse: catch ブロック 4行 x 5箇所 = 20行 を 関数定義7行 + 呼び出し1行 x 5 = 12行に削減
- エラーメッセージフォーマットの一貫性を保証

### schedule:add の方式別バリデーション（インライン維持）

以下のバリデーションはインラインで維持（各5行以下のため共通化のメリットが低い）:

```typescript
// スケジュール種別ごとのバリデーション
if (!args.schedule || typeof args.schedule.type !== "string") {
  return { success: false, error: "schedule.type is required" };
}
if (args.schedule.type === "cron" && ...) {
  return { success: false, error: "cronExpression is required for cron schedule type" };
}
if (args.schedule.type === "interval") {
  if (typeof args.schedule.interval !== "number" || args.schedule.interval <= 0) {
    return { success: false, error: "interval must be a positive number" };
  }
}
```

## 既存ハンドラー（TASK-9A等）との比較

| 項目                 | 既存ハンドラー（skill:import等） | スケジュールハンドラー             |
| -------------------- | -------------------------------- | ---------------------------------- |
| バリデーション方式   | インラインの3段チェック          | validateStringArg 共通関数         |
| エラーレスポンス形式 | `throw { code, message }`        | `return { success: false, error }` |
| sender検証失敗時     | `throw toIPCValidationError()`   | `return toIPCValidationError()`    |

既存ハンドラーとスケジュールハンドラーで sender 検証失敗時のレスポンス方式が異なる（throw vs return）。これは P44 対策で既存ハンドラーが `throw` を使用する一方、スケジュールハンドラーは `return` で統一しているため。統一化は TASK-9G のスコープ外。

## 見送りとした項目

| 項目                                    | 見送り理由                                                                    |
| --------------------------------------- | ----------------------------------------------------------------------------- |
| validateIpcSender 呼び出しの共通化      | 各ハンドラーでチャンネル名が異なるため、ラッパー化すると可読性が低下する      |
| schedule:add の方式別バリデーション抽出 | cron/interval 固有の条件分岐は短く（各5行以下）、インラインの方が可読性が高い |
| 既存ハンドラー（TASK-9A等）への遡及適用 | スコープ外。TASK-9G のスケジュールハンドラーに限定して共通化を実施            |

## テスト結果

- IPC ハンドラーテスト: 12/12 PASS
- バリデーションエラーの検証テスト（空 skillName、interval<=0）が引き続き PASS
- sender 検証失敗テストが引き続き PASS

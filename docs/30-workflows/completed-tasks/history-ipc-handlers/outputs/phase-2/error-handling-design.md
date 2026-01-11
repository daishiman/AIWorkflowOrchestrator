# Phase 2 タスク3: エラーハンドリング設計

## 実行日時

2026-01-11

---

## 設計方針

1. **Result型パターン**: 全IPCハンドラーでResult型を使用し、成功/失敗を明示的に返却
2. **例外捕捉**: try-catchで全例外を捕捉し、ErrorResultに変換
3. **バリデーション**: Main側で入力検証を実施し、不正入力は早期にエラー返却
4. **ログ出力**: エラー発生時はconsole.errorで詳細をログ出力

---

## Result型パターン

### 型定義

```typescript
/**
 * 成功結果
 */
interface SuccessResult<T> {
  success: true;
  data: T;
}

/**
 * 失敗結果
 */
interface ErrorResult {
  success: false;
  error: Error;
}

/**
 * API結果型
 */
type Result<T> = SuccessResult<T> | ErrorResult;
```

### 使用パターン

```typescript
// 成功時
return { success: true, data: result };

// 失敗時
return { success: false, error: new Error("エラーメッセージ") };
```

---

## エラー分類

### 1. バリデーションエラー

入力パラメータの検証エラー。HistoryServiceを呼び出す前に発生。

| エラー内容     | メッセージ例                             |
| -------------- | ---------------------------------------- |
| 必須項目の欠落 | `fileId is required and cannot be empty` |
| 型不正         | `Invalid parameter type`                 |
| 値の範囲外     | `limit must be a positive number`        |

### 2. ビジネスロジックエラー

HistoryService内で発生するエラー。

| エラー内容       | メッセージ例               |
| ---------------- | -------------------------- |
| データ未発見     | `File not found`           |
| バージョン未発見 | `Version not found`        |
| 復元失敗         | `Restore operation failed` |

### 3. システムエラー

予期しないエラー。DB接続障害など。

| エラー内容   | メッセージ例                 |
| ------------ | ---------------------------- |
| DB接続エラー | `Database connection failed` |
| タイムアウト | `Operation timed out`        |
| 不明なエラー | `Unknown error`              |

---

## エラーハンドリングフロー

```
┌─────────────────────────────────────────────────────────────────┐
│                    IPC Handler Flow                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. IPC受信                                                      │
│      │                                                           │
│      ▼                                                           │
│  2. バリデーション ──── 失敗 ──→ ErrorResult返却                │
│      │                                                           │
│      │ 成功                                                      │
│      ▼                                                           │
│  3. try {                                                        │
│        HistoryService呼び出し                                    │
│      }                                                           │
│      │                                                           │
│      │ 成功                                                      │
│      ▼                                                           │
│  4. SuccessResult返却                                            │
│                                                                  │
│      │ 例外発生                                                  │
│      ▼                                                           │
│  5. catch {                                                      │
│        normalizeError()                                          │
│        console.error()                                           │
│        ErrorResult返却                                           │
│      }                                                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 実装パターン

### 標準パターン（既存実装）

```typescript
ipcMain.handle(
  IPC_CHANNELS.HISTORY_GET_FILE_HISTORY,
  async (
    _event,
    fileId: string,
    options?: PaginationOptions,
  ): Promise<Result<PaginatedResult<VersionHistoryItem>>> => {
    try {
      // 1. バリデーション
      validateNotEmpty(fileId, "fileId");

      // 2. サービス呼び出し
      const result = await historyService.getFileHistory(fileId, options);

      // 3. 成功返却
      return success(result);
    } catch (err) {
      // 4. エラー処理
      return error(normalizeError(err));
    }
  },
);
```

### バリデーション関数

```typescript
/**
 * 空文字チェック
 * @throws Error 値が空の場合
 */
function validateNotEmpty(value: string, fieldName: string): void {
  if (!value || value.trim() === "") {
    throw new Error(`${fieldName} is required and cannot be empty`);
  }
}
```

### エラー正規化関数

```typescript
/**
 * 任意のエラーをErrorオブジェクトに正規化
 */
function normalizeError(err: unknown): Error {
  if (err instanceof Error) {
    return err;
  }
  return new Error(String(err) || "Unknown error");
}
```

---

## ログ出力方針

### ログレベル

| レベル          | 用途                 | 例                     |
| --------------- | -------------------- | ---------------------- |
| `console.log`   | 正常処理の開始・完了 | ハンドラー呼び出し開始 |
| `console.warn`  | 警告（処理は継続）   | 非推奨パラメータの使用 |
| `console.error` | エラー発生           | 例外キャッチ時         |
| `console.debug` | デバッグ情報         | パラメータ詳細         |

### ログフォーマット

```typescript
// 開始ログ
console.log("[IPC] history:getFileHistory - Start", { fileId, options });

// 成功ログ
console.log("[IPC] history:getFileHistory - Success", {
  count: result.items.length,
});

// エラーログ
console.error("[IPC] history:getFileHistory - Error:", error);
```

### ログ出力タイミング

| タイミング         | ログレベル | 内容             |
| ------------------ | ---------- | ---------------- |
| ハンドラー開始     | info       | パラメータ情報   |
| 成功完了           | info       | 結果のサマリー   |
| エラー発生         | error      | エラー詳細       |
| バリデーション失敗 | warn       | 無効なパラメータ |

---

## エラーメッセージ設計

### ユーザー向けメッセージ

技術的詳細を含まない、分かりやすいメッセージを使用。

| エラー種別       | メッセージ                                    |
| ---------------- | --------------------------------------------- |
| 必須項目欠落     | `{fieldName} is required and cannot be empty` |
| データ未発見     | `File not found`                              |
| バージョン未発見 | `Version not found`                           |
| 復元失敗         | `Failed to restore version`                   |
| 不明なエラー     | `An unexpected error occurred`                |

### 開発者向け詳細

console.errorで詳細なスタックトレースを出力。

```typescript
catch (err) {
  console.error("[IPC] history:getFileHistory - Error:", err);
  return error(normalizeError(err));
}
```

---

## Renderer側でのエラー処理

### 型ガード使用例

```typescript
const result = await window.historyAPI.getFileHistory(fileId);

if (result.success) {
  // 成功: result.data を使用
  const items = result.data.items;
} else {
  // 失敗: result.error を使用
  console.error("Error:", result.error.message);
  showErrorToast(result.error.message);
}
```

### エラー表示パターン

```typescript
// UIでのエラー表示
function handleHistoryError(error: Error): void {
  // トースト通知
  toast.error(error.message);

  // ログ出力
  console.error("[History] Operation failed:", error);
}
```

---

## エッジケース対応

### 1. 空の結果

```typescript
// 履歴が0件の場合も成功として返却
return success({
  items: [],
  total: 0,
  hasMore: false,
});
```

### 2. 部分的な失敗

```typescript
// 一部データの取得に失敗した場合は、取得できたデータを返却
// ただし、クリティカルな失敗はErrorResultで返却
```

### 3. タイムアウト

```typescript
// 将来的にタイムアウト処理を追加する場合
const TIMEOUT_MS = 30000;
const result = await Promise.race([
  historyService.getFileHistory(fileId, options),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Operation timed out")), TIMEOUT_MS),
  ),
]);
```

---

## セキュリティ考慮

### エラー情報の漏洩防止

```typescript
// 内部エラーの詳細をRendererに漏らさない
function sanitizeError(err: Error): Error {
  // DB接続文字列などの機密情報が含まれる可能性がある場合は汎用メッセージに置換
  if (err.message.includes("connection")) {
    return new Error("Database operation failed");
  }
  return err;
}
```

### スタックトレースの扱い

- **Main側**: 開発時はスタックトレースをログ出力
- **Renderer側**: エラーメッセージのみを表示（スタックトレースは非公開）

---

## 結論

エラーハンドリング設計が完了した。
Result型パターンを採用し、以下を実現：

1. 明示的な成功/失敗の判定
2. 型安全なエラーハンドリング
3. ユーザーフレンドリーなエラーメッセージ
4. 開発者向けの詳細ログ出力

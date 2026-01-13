# API設計書

## メタ情報

| 項目       | 値                    |
| ---------- | --------------------- |
| Phase      | 2                     |
| タスク名   | history-preload-setup |
| 作成日     | 2026-01-13            |
| ステータス | 完了                  |

---

## 概要

本ドキュメントはhistoryAPIの4つのメソッドの詳細設計を定義する。

---

## API一覧

| メソッド名        | 説明                 | 実装ファイル       | 行番号  |
| ----------------- | -------------------- | ------------------ | ------- |
| getFileHistory    | ファイル履歴一覧取得 | `preload/index.ts` | 320-321 |
| getVersionDetail  | バージョン詳細取得   | `preload/index.ts` | 322-323 |
| getConversionLogs | 変換ログ取得         | `preload/index.ts` | 324-325 |
| restoreVersion    | バージョン復元       | `preload/index.ts` | 326-327 |

---

## API詳細

### 1. getFileHistory

#### シグネチャ

```typescript
getFileHistory(
  fileId: string,
  options?: PaginationOptions
): Promise<Result<PaginatedResult<VersionHistoryItem>>>
```

#### パラメータ

| 名前           | 型     | 必須 | 説明                        |
| -------------- | ------ | ---- | --------------------------- |
| fileId         | string | Yes  | 対象ファイルのID            |
| options.limit  | number | No   | 取得件数（デフォルト: 20）  |
| options.offset | number | No   | オフセット（デフォルト: 0） |

#### 戻り値

```typescript
// 成功時
{
  success: true,
  data: {
    items: VersionHistoryItem[],
    total: number,
    hasMore: boolean
  }
}

// 失敗時
{
  success: false,
  error: Error
}
```

#### 実装済みコード

```typescript
// apps/desktop/src/preload/index.ts:320-321
getFileHistory: (fileId: string, options?: PaginationOptions) =>
  safeInvoke(IPC_CHANNELS.HISTORY_GET_FILE_HISTORY, fileId, options),
```

---

### 2. getVersionDetail

#### シグネチャ

```typescript
getVersionDetail(
  conversionId: string
): Promise<Result<VersionDetailData>>
```

#### パラメータ

| 名前         | 型     | 必須 | 説明   |
| ------------ | ------ | ---- | ------ |
| conversionId | string | Yes  | 変換ID |

#### 戻り値

```typescript
// 成功時
{
  success: true,
  data: {
    version: VersionHistoryItem,
    logs: ConversionLog[]
  }
}

// 失敗時
{
  success: false,
  error: Error
}
```

#### 実装済みコード

```typescript
// apps/desktop/src/preload/index.ts:322-323
getVersionDetail: (conversionId: string) =>
  safeInvoke(IPC_CHANNELS.HISTORY_GET_VERSION_DETAIL, conversionId),
```

---

### 3. getConversionLogs

#### シグネチャ

```typescript
getConversionLogs(
  conversionId: string,
  options?: LogFilterOptions
): Promise<Result<PaginatedResult<ConversionLog>>>
```

#### パラメータ

| 名前           | 型                                     | 必須 | 説明                        |
| -------------- | -------------------------------------- | ---- | --------------------------- |
| conversionId   | string                                 | Yes  | 変換ID                      |
| options.limit  | number                                 | No   | 取得件数（デフォルト: 20）  |
| options.offset | number                                 | No   | オフセット（デフォルト: 0） |
| options.level  | "info" \| "warn" \| "error" \| "debug" | No   | ログレベルフィルタ          |

#### 戻り値

```typescript
// 成功時
{
  success: true,
  data: {
    items: ConversionLog[],
    total: number,
    hasMore: boolean
  }
}

// 失敗時
{
  success: false,
  error: Error
}
```

#### 実装済みコード

```typescript
// apps/desktop/src/preload/index.ts:324-325
getConversionLogs: (conversionId: string, options?: LogFilterOptions) =>
  safeInvoke(IPC_CHANNELS.HISTORY_GET_CONVERSION_LOGS, conversionId, options),
```

---

### 4. restoreVersion

#### シグネチャ

```typescript
restoreVersion(
  fileId: string,
  conversionId: string
): Promise<Result<VersionHistoryItem>>
```

#### パラメータ

| 名前         | 型     | 必須 | 説明                         |
| ------------ | ------ | ---- | ---------------------------- |
| fileId       | string | Yes  | 対象ファイルのID             |
| conversionId | string | Yes  | 復元対象のバージョンの変換ID |

#### 戻り値

```typescript
// 成功時
{
  success: true,
  data: VersionHistoryItem  // 復元後の新バージョン
}

// 失敗時
{
  success: false,
  error: Error
}
```

#### 実装済みコード

```typescript
// apps/desktop/src/preload/index.ts:326-327
restoreVersion: (fileId: string, conversionId: string) =>
  safeInvoke(IPC_CHANNELS.HISTORY_RESTORE_VERSION, fileId, conversionId),
```

---

## IPCチャンネル定義

### チャンネル名

```typescript
// apps/desktop/src/preload/channels.ts:156-159
HISTORY_GET_FILE_HISTORY: "history:getFileHistory",
HISTORY_GET_VERSION_DETAIL: "history:getVersionDetail",
HISTORY_GET_CONVERSION_LOGS: "history:getConversionLogs",
HISTORY_RESTORE_VERSION: "history:restoreVersion",
```

### ホワイトリスト

```typescript
// apps/desktop/src/preload/channels.ts:270-274
export const ALLOWED_INVOKE_CHANNELS: readonly string[] = [
  // ... 他のチャンネル
  IPC_CHANNELS.HISTORY_GET_FILE_HISTORY,
  IPC_CHANNELS.HISTORY_GET_VERSION_DETAIL,
  IPC_CHANNELS.HISTORY_GET_CONVERSION_LOGS,
  IPC_CHANNELS.HISTORY_RESTORE_VERSION,
];
```

---

## エラーハンドリング

### safeInvoke wrapper

```typescript
// apps/desktop/src/preload/index.ts:77-82
function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  if (!ALLOWED_INVOKE_CHANNELS.includes(channel)) {
    return Promise.reject(new Error(`Channel ${channel} is not allowed`));
  }
  return ipcRenderer.invoke(channel, ...args);
}
```

### エラーパターン

| エラータイプ             | 原因                     | 対処                    |
| ------------------------ | ------------------------ | ----------------------- |
| Channel not allowed      | ホワイトリスト未登録     | channels.ts確認         |
| IPC timeout              | Main Processが応答しない | ハンドラー登録確認      |
| Result.success === false | ビジネスロジックエラー   | error.messageで詳細確認 |

---

## 使用例

### ファイル履歴取得

```typescript
const historyAPI = window.historyAPI;
if (!historyAPI) {
  console.error("historyAPI is not available");
  return;
}

const result = await historyAPI.getFileHistory(fileId, {
  limit: 10,
  offset: 0,
});
if (result.success) {
  console.log(`Total: ${result.data.total}`);
  result.data.items.forEach((item) => {
    console.log(`Version ${item.version}: ${item.createdAt}`);
  });
} else {
  console.error("Failed to get history:", result.error);
}
```

### バージョン復元

```typescript
const result = await window.historyAPI?.restoreVersion(fileId, conversionId);
if (result?.success) {
  console.log("Restored to version:", result.data.version);
}
```

---

## 完了確認

- [x] 4つのAPIメソッドが設計されている
- [x] パラメータ・戻り値が明確である
- [x] IPCチャンネルが定義されている
- [x] エラーハンドリングが考慮されている
- [x] 使用例が提供されている
- [x] **本Phase内の全タスクを100%実行完了**

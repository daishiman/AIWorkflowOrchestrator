# API仕様書

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| タスクID   | CONV-05-03                    |
| 機能名     | 履歴/ログ表示UIコンポーネント |
| バージョン | 1.0                           |
| 作成日     | 2026-01-10                    |

---

## 概要

本ドキュメントは、履歴/ログ表示UIコンポーネントが使用するAPI仕様を定義します。

---

## API エンドポイント

### getFileHistory

ファイルのバージョン履歴一覧を取得します。

#### リクエスト

```typescript
window.historyAPI.getFileHistory(fileId: string, options: GetFileHistoryOptions)
```

#### パラメータ

| パラメータ | 型                    | 必須 | 説明           |
| ---------- | --------------------- | ---- | -------------- |
| fileId     | string                | ✅   | 対象ファイルID |
| options    | GetFileHistoryOptions | ✅   | 取得オプション |

```typescript
interface GetFileHistoryOptions {
  limit: number; // 取得件数（デフォルト: 20）
  offset: number; // オフセット（デフォルト: 0）
}
```

#### レスポンス

```typescript
interface APIResult<PaginatedResult<VersionHistoryItem>> {
  success: boolean;
  data?: {
    items: VersionHistoryItem[];
    total: number;
    hasMore: boolean;
  };
  error?: Error;
}
```

#### 使用例

```typescript
const result = await window.historyAPI.getFileHistory("file-123", {
  limit: 20,
  offset: 0,
});

if (result.success) {
  console.log(result.data.items);
} else {
  console.error(result.error);
}
```

---

### getVersionDetail

特定バージョンの詳細情報を取得します。

#### リクエスト

```typescript
window.historyAPI.getVersionDetail(conversionId: string)
```

#### パラメータ

| パラメータ   | 型     | 必須 | 説明   |
| ------------ | ------ | ---- | ------ |
| conversionId | string | ✅   | 変換ID |

#### レスポンス

```typescript
interface APIResult<VersionDetailData> {
  success: boolean;
  data?: {
    version: VersionHistoryItem;
    logs: ConversionLog[];
  };
  error?: Error;
}
```

#### 使用例

```typescript
const result = await window.historyAPI.getVersionDetail("conv-001");

if (result.success) {
  console.log(result.data.version);
  console.log(result.data.logs);
} else {
  console.error(result.error);
}
```

---

### getConversionLogs

変換ログを取得します。

#### リクエスト

```typescript
window.historyAPI.getConversionLogs(conversionId: string, options: GetConversionLogsOptions)
```

#### パラメータ

| パラメータ   | 型                       | 必須 | 説明           |
| ------------ | ------------------------ | ---- | -------------- |
| conversionId | string                   | ✅   | 変換ID         |
| options      | GetConversionLogsOptions | ✅   | 取得オプション |

```typescript
interface GetConversionLogsOptions {
  limit: number; // 取得件数（デフォルト: 20）
  offset: number; // オフセット（デフォルト: 0）
  level?: LogLevel; // フィルタするログレベル（省略時は全レベル）
}
```

#### レスポンス

```typescript
interface APIResult<PaginatedResult<ConversionLog>> {
  success: boolean;
  data?: {
    items: ConversionLog[];
    total: number;
    hasMore: boolean;
  };
  error?: Error;
}
```

#### 使用例

```typescript
const result = await window.historyAPI.getConversionLogs("conv-001", {
  limit: 20,
  offset: 0,
  level: "error",
});

if (result.success) {
  console.log(result.data.items);
} else {
  console.error(result.error);
}
```

---

### restoreVersion

指定バージョンへ復元します。

#### リクエスト

```typescript
window.historyAPI.restoreVersion(conversionId: string)
```

#### パラメータ

| パラメータ   | 型     | 必須 | 説明             |
| ------------ | ------ | ---- | ---------------- |
| conversionId | string | ✅   | 復元対象の変換ID |

#### レスポンス

```typescript
interface APIResult<void> {
  success: boolean;
  error?: Error;
}
```

#### 使用例

```typescript
const result = await window.historyAPI.restoreVersion("conv-001");

if (result.success) {
  console.log("復元完了");
} else {
  console.error(result.error);
}
```

---

## データ型定義

### VersionHistoryItem

```typescript
interface VersionHistoryItem {
  conversionId: string; // 変換ID（一意識別子）
  fileId: string; // ファイルID
  version: number; // バージョン番号（1から始まる連番）
  createdAt: string; // 作成日時（ISO 8601形式）
  size: number; // ファイルサイズ（バイト）
  mimeType: string; // MIMEタイプ
  hash: string; // ファイルハッシュ値
  isLatest: boolean; // 最新バージョンかどうか
  metadata?: Record<string, unknown>; // 追加メタデータ
}
```

### ConversionLog

```typescript
interface ConversionLog {
  timestamp: string; // タイムスタンプ（ISO 8601形式）
  level: LogLevel; // ログレベル
  message: string; // ログメッセージ
  details?: Record<string, unknown>; // 詳細情報
}

type LogLevel = "info" | "warn" | "error" | "debug";
```

### PaginatedResult

```typescript
interface PaginatedResult<T> {
  items: T[]; // データ配列
  total: number; // 総件数
  hasMore: boolean; // 追加データ有無
}
```

### APIResult

```typescript
interface APIResult<T> {
  success: boolean; // 成功フラグ
  data?: T; // レスポンスデータ（成功時）
  error?: Error; // エラー情報（失敗時）
}
```

---

## エラーコード

| エラーコード   | 説明                           |
| -------------- | ------------------------------ |
| NOT_FOUND      | 指定されたリソースが存在しない |
| INVALID_ID     | 無効なID形式                   |
| DB_ERROR       | データベースエラー             |
| RESTORE_FAILED | 復元処理に失敗                 |

---

## IPCチャンネル

| チャンネル名                | 説明               |
| --------------------------- | ------------------ |
| `history:getFileHistory`    | 履歴一覧取得       |
| `history:getVersionDetail`  | バージョン詳細取得 |
| `history:getConversionLogs` | ログ取得           |
| `history:restoreVersion`    | バージョン復元     |

---

## 備考

- 全APIは非同期（Promise）で動作します
- エラー時は `success: false` と `error` プロパティが設定されます
- 日時は全てISO 8601形式（例: `2026-01-10T12:00:00Z`）で返されます

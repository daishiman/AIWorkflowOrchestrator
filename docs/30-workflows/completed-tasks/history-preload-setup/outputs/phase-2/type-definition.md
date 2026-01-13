# 型定義設計書

## メタ情報

| 項目       | 値                    |
| ---------- | --------------------- |
| Phase      | 2                     |
| タスク名   | history-preload-setup |
| 作成日     | 2026-01-13            |
| ステータス | 完了                  |

---

## 概要

本ドキュメントはhistoryAPIに関連する型定義の設計を文書化する。すべての型定義は `apps/desktop/src/renderer/components/history/types.ts` に実装済みである。

---

## 型定義ファイル

### 実装ファイル

| ファイル                                                | 説明     | ステータス  |
| ------------------------------------------------------- | -------- | ----------- |
| `apps/desktop/src/renderer/components/history/types.ts` | 全型定義 | ✅ 実装済み |

---

## 型定義一覧

### バージョン履歴関連

#### VersionHistoryItem

```typescript
// lines 14-33
export interface VersionHistoryItem {
  /** 変換ID */
  conversionId: string;
  /** ファイルID */
  fileId: string;
  /** バージョン番号 */
  version: number;
  /** 作成日時 (ISO 8601形式) */
  createdAt: string;
  /** ファイルサイズ (bytes) */
  size: number;
  /** MIMEタイプ */
  mimeType: string;
  /** コンテンツハッシュ */
  hash: string;
  /** 最新バージョンフラグ */
  isLatest: boolean;
  /** メタデータ (オプション) */
  metadata?: Record<string, unknown>;
}
```

#### VersionDetailData

```typescript
// lines 128-131
export interface VersionDetailData {
  version: VersionHistoryItem;
  logs: ConversionLog[];
}
```

---

### 変換ログ関連

#### LogLevel

```typescript
// line 42
export type LogLevel = "info" | "warn" | "error" | "debug";
```

#### ConversionLog

```typescript
// lines 47-56
export interface ConversionLog {
  /** タイムスタンプ (ISO 8601形式) */
  timestamp: string;
  /** ログレベル */
  level: LogLevel;
  /** ログメッセージ */
  message: string;
  /** 詳細情報 (オプション) */
  details?: Record<string, unknown>;
}
```

---

### ページネーション関連

#### PaginatedResult<T>

```typescript
// lines 65-72
export interface PaginatedResult<T> {
  /** アイテム配列 */
  items: T[];
  /** 総件数 */
  total: number;
  /** 追加データの有無 */
  hasMore: boolean;
}
```

#### PaginationOptions

```typescript
// lines 77-82
export interface PaginationOptions {
  /** 取得件数 (デフォルト: 20) */
  limit?: number;
  /** オフセット (デフォルト: 0) */
  offset?: number;
}
```

#### LogFilterOptions

```typescript
// lines 91-94
export interface LogFilterOptions extends PaginationOptions {
  /** ログレベルフィルタ */
  level?: LogLevel;
}
```

---

### API結果型

#### Result<T>

```typescript
// lines 103-119
export interface SuccessResult<T> {
  success: true;
  data: T;
}

export interface ErrorResult {
  success: false;
  error: Error;
}

export type Result<T> = SuccessResult<T> | ErrorResult;
```

---

### HistoryAPI インターフェース

```typescript
// lines 140-161
export interface HistoryAPI {
  /** 履歴一覧取得 */
  getFileHistory(
    fileId: string,
    options?: PaginationOptions,
  ): Promise<Result<PaginatedResult<VersionHistoryItem>>>;

  /** バージョン詳細取得 */
  getVersionDetail(conversionId: string): Promise<Result<VersionDetailData>>;

  /** 変換ログ取得 */
  getConversionLogs(
    conversionId: string,
    options?: LogFilterOptions,
  ): Promise<Result<PaginatedResult<ConversionLog>>>;

  /** バージョン復元 */
  restoreVersion(
    fileId: string,
    conversionId: string,
  ): Promise<Result<VersionHistoryItem>>;
}
```

---

### Window型拡張

```typescript
// lines 167-171
declare global {
  interface Window {
    historyAPI?: HistoryAPI;
  }
}
```

---

## 型定義の使用箇所

### preload/index.ts でのimport

```typescript
// apps/desktop/src/preload/index.ts:71-74
import type {
  HistoryAPI,
  PaginationOptions,
  LogFilterOptions,
} from "../renderer/components/history/types";
```

### historyAPIオブジェクト定義

```typescript
// apps/desktop/src/preload/index.ts:319-328
const historyAPI: HistoryAPI = {
  getFileHistory: (fileId: string, options?: PaginationOptions) =>
    safeInvoke(IPC_CHANNELS.HISTORY_GET_FILE_HISTORY, fileId, options),
  getVersionDetail: (conversionId: string) =>
    safeInvoke(IPC_CHANNELS.HISTORY_GET_VERSION_DETAIL, conversionId),
  getConversionLogs: (conversionId: string, options?: LogFilterOptions) =>
    safeInvoke(IPC_CHANNELS.HISTORY_GET_CONVERSION_LOGS, conversionId, options),
  restoreVersion: (fileId: string, conversionId: string) =>
    safeInvoke(IPC_CHANNELS.HISTORY_RESTORE_VERSION, fileId, conversionId),
};
```

---

## 型安全性

### オプショナルチェーン

historyAPIはオプショナル（`historyAPI?: HistoryAPI`）として定義されているため、使用時にはオプショナルチェーンが必要:

```typescript
// 正しい使用法
const result = await window.historyAPI?.getFileHistory(fileId);

// 型ガード使用
if (window.historyAPI) {
  const result = await window.historyAPI.getFileHistory(fileId);
}
```

### Result型の型ガード

```typescript
// 型ガードパターン
const result = await window.historyAPI?.getFileHistory(fileId);
if (result?.success) {
  // result.data は PaginatedResult<VersionHistoryItem>
  const { items, total, hasMore } = result.data;
} else if (result) {
  // result.error は Error
  console.error(result.error.message);
}
```

---

## 完了確認

- [x] すべての型定義がtypes.tsに実装されている
- [x] HistoryAPIインターフェースが定義されている
- [x] Window型拡張が定義されている
- [x] preload/index.tsで正しくimportされている
- [x] 型安全な使用パターンが文書化されている
- [x] **本Phase内の全タスクを100%実行完了**

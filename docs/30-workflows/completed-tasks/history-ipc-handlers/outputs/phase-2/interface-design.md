# Phase 2 タスク2: インターフェース設計

## 実行日時

2026-01-11

---

## 設計概要

IPCハンドラーのインターフェースは、依存性注入(DI)パターンを採用し、
テスタビリティと保守性を確保する設計とする。

---

## 関数インターフェース

### 1. registerHistoryHandlers 関数

```typescript
/**
 * 履歴IPCハンドラーを登録する
 *
 * @param mainWindow - Electronのメインウィンドウ（将来の拡張用）
 * @param historyService - HistoryServiceのインスタンス
 */
export function registerHistoryHandlers(
  mainWindow: BrowserWindow,
  historyService: HistoryService,
): void;
```

**設計方針**:

- `historyService` を引数で受け取ることでDIパターンを実現
- テスト時にモックサービスを注入可能
- `mainWindow` は将来の拡張（イベント送信等）に備えて保持

---

### 2. HistoryService インターフェース

```typescript
/**
 * History Service Interface
 *
 * Main プロセスからDBにアクセスするためのサービスインターフェース
 */
export interface HistoryService {
  /**
   * 指定ファイルのバージョン履歴を取得
   *
   * @param fileId - 対象ファイルのID
   * @param options - ページネーションオプション
   * @returns ページネーションされたバージョン履歴
   * @throws Error - 無効なfileIdまたはDB接続エラー時
   */
  getFileHistory(
    fileId: string,
    options?: PaginationOptions,
  ): Promise<PaginatedResult<VersionHistoryItem>>;

  /**
   * 指定バージョンの詳細情報を取得
   *
   * @param conversionId - 対象変換のID
   * @returns バージョン詳細とログ
   * @throws Error - バージョンが見つからない場合
   */
  getVersionDetail(conversionId: string): Promise<VersionDetailData>;

  /**
   * 指定変換のログを取得
   *
   * @param conversionId - 対象変換のID
   * @param options - フィルタ・ページネーションオプション
   * @returns ページネーションされたログ
   */
  getConversionLogs(
    conversionId: string,
    options?: LogFilterOptions,
  ): Promise<PaginatedResult<ConversionLog>>;

  /**
   * 指定バージョンに復元
   *
   * @param fileId - 対象ファイルのID
   * @param conversionId - 復元先バージョンの変換ID
   * @returns 復元後の新バージョン情報
   * @throws Error - 復元に失敗した場合
   */
  restoreVersion(
    fileId: string,
    conversionId: string,
  ): Promise<VersionHistoryItem>;
}
```

---

## IPCチャンネル契約

### チャンネル一覧

| チャンネル名                | 定数                                       | 方向            |
| --------------------------- | ------------------------------------------ | --------------- |
| `history:getFileHistory`    | `IPC_CHANNELS.HISTORY_GET_FILE_HISTORY`    | Renderer → Main |
| `history:getVersionDetail`  | `IPC_CHANNELS.HISTORY_GET_VERSION_DETAIL`  | Renderer → Main |
| `history:getConversionLogs` | `IPC_CHANNELS.HISTORY_GET_CONVERSION_LOGS` | Renderer → Main |
| `history:restoreVersion`    | `IPC_CHANNELS.HISTORY_RESTORE_VERSION`     | Renderer → Main |

---

### パラメータ・戻り値型

#### history:getFileHistory

```typescript
// パラメータ
type GetFileHistoryParams = [fileId: string, options?: PaginationOptions];

// 戻り値
type GetFileHistoryResult = Result<PaginatedResult<VersionHistoryItem>>;
```

#### history:getVersionDetail

```typescript
// パラメータ
type GetVersionDetailParams = [conversionId: string];

// 戻り値
type GetVersionDetailResult = Result<VersionDetailData>;
```

#### history:getConversionLogs

```typescript
// パラメータ
type GetConversionLogsParams = [
  conversionId: string,
  options?: LogFilterOptions,
];

// 戻り値
type GetConversionLogsResult = Result<PaginatedResult<ConversionLog>>;
```

#### history:restoreVersion

```typescript
// パラメータ
type RestoreVersionParams = [fileId: string, conversionId: string];

// 戻り値
type RestoreVersionResult = Result<VersionHistoryItem>;
```

---

## 共有型定義

### Result型パターン

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
 * API結果型（Union型）
 */
type Result<T> = SuccessResult<T> | ErrorResult;
```

### PaginationOptions

```typescript
interface PaginationOptions {
  limit?: number; // デフォルト: 20
  offset?: number; // デフォルト: 0
}
```

### LogFilterOptions

```typescript
interface LogFilterOptions extends PaginationOptions {
  level?: LogLevel; // "info" | "warn" | "error" | "debug"
}
```

### PaginatedResult

```typescript
interface PaginatedResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}
```

---

## 依存性注入パターン

### ファクトリ関数

```typescript
// apps/desktop/src/main/services/HistoryService.ts
export function createHistoryService(): HistoryService {
  return new HistoryService();
}
```

### 登録時の呼び出し

```typescript
// apps/desktop/src/main/ipc/index.ts
import { registerHistoryHandlers } from "./historyHandlers";
import { createHistoryService } from "../services/HistoryService";

export function registerAllIpcHandlers(mainWindow: BrowserWindow): void {
  // ... 他のハンドラー登録

  // History handlers
  const historyService = createHistoryService();
  registerHistoryHandlers(mainWindow, historyService);
}
```

---

## ユーティリティ関数

### success<T>

```typescript
/**
 * 成功結果を生成
 * @param data - 返却データ
 * @returns SuccessResult<T>
 */
function success<T>(data: T): Result<T> {
  return { success: true, data };
}
```

### error<T>

```typescript
/**
 * エラー結果を生成
 * @param err - エラーオブジェクト
 * @returns ErrorResult
 */
function error<T>(err: Error): Result<T> {
  return { success: false, error: err };
}
```

### normalizeError

```typescript
/**
 * エラーを正規化
 * @param err - 任意のエラー
 * @returns Error オブジェクト
 */
function normalizeError(err: unknown): Error {
  if (err instanceof Error) {
    return err;
  }
  return new Error(String(err) || "Unknown error");
}
```

### validateNotEmpty

```typescript
/**
 * 文字列が空でないことを検証
 * @param value - 検証対象の値
 * @param fieldName - フィールド名（エラーメッセージ用）
 * @throws Error - 値が空の場合
 */
function validateNotEmpty(value: string, fieldName: string): void {
  if (!value || value.trim() === "") {
    throw new Error(`${fieldName} is required and cannot be empty`);
  }
}
```

---

## 型のエクスポート関係

```
renderer/components/history/types.ts
    ├── VersionHistoryItem
    ├── VersionDetailData
    ├── ConversionLog
    ├── LogLevel
    ├── PaginatedResult<T>
    ├── PaginationOptions
    ├── LogFilterOptions
    ├── Result<T>
    ├── SuccessResult<T>
    └── ErrorResult

        ↓ import

main/ipc/historyHandlers.ts
    └── HistoryService (interface)

        ↓ implements

main/services/HistoryService.ts
    └── HistoryService (class)
```

---

## セキュリティ考慮

### ホワイトリスト登録

```typescript
// preload/channels.ts
export const ALLOWED_INVOKE_CHANNELS: readonly string[] = [
  // ... 他のチャンネル
  IPC_CHANNELS.HISTORY_GET_FILE_HISTORY,
  IPC_CHANNELS.HISTORY_GET_VERSION_DETAIL,
  IPC_CHANNELS.HISTORY_GET_CONVERSION_LOGS,
  IPC_CHANNELS.HISTORY_RESTORE_VERSION,
];
```

### バリデーション実行箇所

| チェック項目   | 実行箇所           | 内容                         |
| -------------- | ------------------ | ---------------------------- |
| チャンネル名   | preload            | ホワイトリストで許可確認     |
| 必須パラメータ | historyHandlers.ts | validateNotEmpty で検証      |
| 型変換         | historyHandlers.ts | TypeScriptの型アノテーション |

---

## 結論

インターフェース設計が完了した。
DIパターンとResult型を採用し、テスタビリティとセキュリティを確保した設計となっている。

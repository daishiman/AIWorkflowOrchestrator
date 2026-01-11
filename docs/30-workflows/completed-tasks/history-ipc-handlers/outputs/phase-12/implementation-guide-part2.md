# IPCハンドラー実装ガイド - Part 2: 技術的詳細

## ファイル構成

| ファイル                                     | 役割              | 行数 |
| -------------------------------------------- | ----------------- | ---- |
| `main/ipc/historyHandlers.ts`                | IPCハンドラー定義 | 166  |
| `main/ipc/__tests__/historyHandlers.test.ts` | ユニットテスト    | 600+ |
| `main/ipc/index.ts`                          | ハンドラー登録    | -    |
| `preload/channels.ts`                        | チャンネル定義    | -    |

---

## 関数インターフェース

### registerHistoryHandlers

```typescript
export function registerHistoryHandlers(
  mainWindow: BrowserWindow,
  historyService: HistoryService,
): void;
```

**引数**:
| パラメータ | 型 | 説明 |
| -------------- | -------------- | ---------------------- |
| mainWindow | BrowserWindow | Electronウィンドウ参照 |
| historyService | HistoryService | 履歴サービスインスタンス |

**戻り値**: void（なし）

**役割**: 4つのIPCハンドラーを`ipcMain.handle`で登録する

---

### HistoryService インターフェース

```typescript
export interface HistoryService {
  getFileHistory(
    fileId: string,
    options?: PaginationOptions,
  ): Promise<PaginatedResult<VersionHistoryItem>>;

  getVersionDetail(conversionId: string): Promise<VersionDetailData>;

  getConversionLogs(
    conversionId: string,
    options?: LogFilterOptions,
  ): Promise<PaginatedResult<ConversionLog>>;

  restoreVersion(
    fileId: string,
    conversionId: string,
  ): Promise<VersionHistoryItem>;
}
```

---

## IPCチャンネル仕様

| チャンネル                  | 用途               | パラメータ             | 戻り値                       |
| --------------------------- | ------------------ | ---------------------- | ---------------------------- |
| `history:getFileHistory`    | 履歴一覧取得       | fileId, options?       | Result<PaginatedResult<...>> |
| `history:getVersionDetail`  | バージョン詳細取得 | conversionId           | Result<VersionDetailData>    |
| `history:getConversionLogs` | 変換ログ取得       | conversionId, options? | Result<PaginatedResult<...>> |
| `history:restoreVersion`    | バージョン復元     | fileId, conversionId   | Result<VersionHistoryItem>   |

---

## 使用例

### 履歴一覧の取得

```typescript
// Renderer側での呼び出し
const result = await window.historyAPI.getFileHistory("file-123", {
  page: 1,
  limit: 10,
});

if (result.success) {
  const { items, totalCount, hasMore } = result.data;
  // items を画面に表示
} else {
  showError(result.error.message);
}
```

### バージョン詳細の取得

```typescript
const result = await window.historyAPI.getVersionDetail("conv-456");

if (result.success) {
  const detail = result.data;
  // detail.timestamp, detail.fileSize などを表示
} else {
  showError(result.error.message);
}
```

### 変換ログの取得

```typescript
const result = await window.historyAPI.getConversionLogs("conv-456", {
  level: "error", // エラーログのみ
});

if (result.success) {
  const { items } = result.data;
  // ログを表示
} else {
  showError(result.error.message);
}
```

### バージョンの復元

```typescript
const result = await window.historyAPI.restoreVersion("file-123", "conv-456");

if (result.success) {
  const newVersion = result.data;
  showSuccess(`バージョン ${newVersion.version} に復元しました`);
} else {
  showError(result.error.message);
}
```

---

## Result型

```typescript
type Result<T> = SuccessResult<T> | ErrorResult;

interface SuccessResult<T> {
  success: true;
  data: T;
}

interface ErrorResult {
  success: false;
  error: Error;
}
```

### ヘルパー関数

```typescript
// 成功Result生成
function success<T>(data: T): Result<T> {
  return { success: true, data };
}

// エラーResult生成
function error<T>(err: Error): Result<T> {
  return { success: false, error: err };
}
```

---

## エラーハンドリング

### 処理フロー

```
1. IPC受信
    ↓
2. バリデーション
    ├─ 失敗 → ErrorResult返却
    ↓ 成功
3. try { HistoryService呼び出し }
    ├─ 成功 → SuccessResult返却
    ↓ 例外
4. catch { normalizeError() → ErrorResult返却 }
```

### バリデーション

```typescript
function validateNotEmpty(value: string, fieldName: string): void {
  if (!value || value.trim() === "") {
    throw new Error(`${fieldName} is required`);
  }
}

// 使用例
validateNotEmpty(fileId, "fileId");
// → fileIdが空なら Error("fileId is required") をthrow
```

### エラー正規化

```typescript
function normalizeError(err: unknown): Error {
  if (err instanceof Error) {
    return err;
  }
  return new Error(String(err));
}

// どんな型の例外もErrorオブジェクトに変換
```

---

## セキュリティ設計

### チャンネルホワイトリスト

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

### Electronセキュリティ設定

| 設定             | 値    | 理由                           |
| ---------------- | ----- | ------------------------------ |
| contextIsolation | true  | preloadスクリプト分離          |
| nodeIntegration  | false | Rendererからの直接アクセス防止 |
| sandbox          | true  | Chromiumサンドボックス         |

---

## テスト設計

### モック戦略

```typescript
// HistoryServiceをモック
const mockHistoryService: HistoryService = {
  getFileHistory: vi.fn(),
  getVersionDetail: vi.fn(),
  getConversionLogs: vi.fn(),
  restoreVersion: vi.fn(),
};

// ipcMain.handleをモック
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
  },
}));
```

### テストカバレッジ

| 指標              | 達成値 | 目標値 |
| ----------------- | ------ | ------ |
| Line Coverage     | 100%   | 80%    |
| Branch Coverage   | 95%    | 60%    |
| Function Coverage | 100%   | 80%    |

---

## 依存関係

### 外部依存

| パッケージ   | 用途                 |
| ------------ | -------------------- |
| electron     | ipcMain.handle       |
| @repo/shared | Result型、共通型定義 |

### 内部依存

```
historyHandlers.ts
    ├── electron (ipcMain)
    ├── preload/channels.ts (IPC_CHANNELS)
    └── @repo/shared (Result, PaginatedResult, etc.)
```

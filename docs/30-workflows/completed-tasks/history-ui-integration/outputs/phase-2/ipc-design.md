# IPC設計書 - preload/handler設計

## メタ情報

| 項目       | 内容       |
| ---------- | ---------- |
| 作成日     | 2026-01-11 |
| Phase      | 2          |
| ステータス | 完了       |

---

## 1. IPCチャンネル設計

### 1.1 チャンネル定義

| チャンネル名                | 方向            | 用途               |
| --------------------------- | --------------- | ------------------ |
| `history:getFileHistory`    | Renderer → Main | 履歴一覧取得       |
| `history:getVersionDetail`  | Renderer → Main | バージョン詳細取得 |
| `history:getConversionLogs` | Renderer → Main | 変換ログ取得       |
| `history:restoreVersion`    | Renderer → Main | バージョン復元     |

### 1.2 channels.ts追加

```typescript
// apps/desktop/src/preload/channels.ts

export const IPC_CHANNELS = {
  // ...existing channels

  // History operations
  HISTORY_GET_FILE_HISTORY: "history:getFileHistory",
  HISTORY_GET_VERSION_DETAIL: "history:getVersionDetail",
  HISTORY_GET_CONVERSION_LOGS: "history:getConversionLogs",
  HISTORY_RESTORE_VERSION: "history:restoreVersion",
} as const;

// ALLOWED_INVOKE_CHANNELSへの追加
export const ALLOWED_INVOKE_CHANNELS: readonly string[] = [
  // ...existing channels
  IPC_CHANNELS.HISTORY_GET_FILE_HISTORY,
  IPC_CHANNELS.HISTORY_GET_VERSION_DETAIL,
  IPC_CHANNELS.HISTORY_GET_CONVERSION_LOGS,
  IPC_CHANNELS.HISTORY_RESTORE_VERSION,
];
```

---

## 2. preloadスクリプト設計

### 2.1 historyAPI公開設計

```typescript
// apps/desktop/src/preload/index.ts への追加

import type {
  HistoryAPI,
  PaginationOptions,
  LogFilterOptions,
  Result,
  PaginatedResult,
  VersionHistoryItem,
  VersionDetailData,
  ConversionLog,
} from "./types";

// historyAPI定義
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

// contextBridge公開
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electronAPI", electronAPI);
    contextBridge.exposeInMainWorld("slideApi", slideApi);
    contextBridge.exposeInMainWorld("historyAPI", historyAPI); // 追加
  } catch (error) {
    console.error("Failed to expose APIs:", error);
  }
} else {
  // Fallback for non-isolated context (development)
  (window as unknown as { electronAPI: ElectronAPI }).electronAPI = electronAPI;
  (window as unknown as { slideApi: SlideApi }).slideApi = slideApi;
  (window as unknown as { historyAPI: HistoryAPI }).historyAPI = historyAPI; // 追加
}
```

### 2.2 型定義（既存types.tsからimport）

```typescript
// apps/desktop/src/renderer/components/history/types.ts からの型（既存）

export interface HistoryAPI {
  getFileHistory(
    fileId: string,
    options?: PaginationOptions,
  ): Promise<Result<PaginatedResult<VersionHistoryItem>>>;

  getVersionDetail(conversionId: string): Promise<Result<VersionDetailData>>;

  getConversionLogs(
    conversionId: string,
    options?: LogFilterOptions,
  ): Promise<Result<PaginatedResult<ConversionLog>>>;

  restoreVersion(
    fileId: string,
    conversionId: string,
  ): Promise<Result<VersionHistoryItem>>;
}
```

---

## 3. IPCハンドラー設計

### 3.1 historyHandlers.ts

```typescript
// apps/desktop/src/main/ipc/historyHandlers.ts

/**
 * 履歴 IPC ハンドラー
 *
 * Main Process で履歴関連のIPC通信を処理する
 */

import { ipcMain, BrowserWindow } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";
import { withValidation } from "../infrastructure/security/ipc-validator";
import type { HistoryService } from "../services/HistoryService";
import type {
  Result,
  PaginatedResult,
  VersionHistoryItem,
  VersionDetailData,
  ConversionLog,
  PaginationOptions,
  LogFilterOptions,
} from "../../renderer/components/history/types";

/**
 * 履歴関連IPCハンドラーを登録
 */
export function registerHistoryHandlers(
  mainWindow: BrowserWindow,
  historyService: HistoryService,
): void {
  // history:getFileHistory - 履歴一覧取得
  ipcMain.handle(
    IPC_CHANNELS.HISTORY_GET_FILE_HISTORY,
    withValidation(
      IPC_CHANNELS.HISTORY_GET_FILE_HISTORY,
      async (
        _event,
        fileId: string,
        options?: PaginationOptions,
      ): Promise<Result<PaginatedResult<VersionHistoryItem>>> => {
        try {
          // 入力検証
          if (!fileId || typeof fileId !== "string") {
            return {
              success: false,
              error: new Error("Invalid fileId: must be a non-empty string"),
            };
          }

          const result = await historyService.getFileHistory(fileId, options);
          return { success: true, data: result };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error : new Error(String(error)),
          };
        }
      },
      { getAllowedWindows: () => [mainWindow] },
    ),
  );

  // history:getVersionDetail - バージョン詳細取得
  ipcMain.handle(
    IPC_CHANNELS.HISTORY_GET_VERSION_DETAIL,
    withValidation(
      IPC_CHANNELS.HISTORY_GET_VERSION_DETAIL,
      async (
        _event,
        conversionId: string,
      ): Promise<Result<VersionDetailData>> => {
        try {
          // 入力検証
          if (!conversionId || typeof conversionId !== "string") {
            return {
              success: false,
              error: new Error(
                "Invalid conversionId: must be a non-empty string",
              ),
            };
          }

          const result = await historyService.getVersionDetail(conversionId);
          return { success: true, data: result };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error : new Error(String(error)),
          };
        }
      },
      { getAllowedWindows: () => [mainWindow] },
    ),
  );

  // history:getConversionLogs - 変換ログ取得
  ipcMain.handle(
    IPC_CHANNELS.HISTORY_GET_CONVERSION_LOGS,
    withValidation(
      IPC_CHANNELS.HISTORY_GET_CONVERSION_LOGS,
      async (
        _event,
        conversionId: string,
        options?: LogFilterOptions,
      ): Promise<Result<PaginatedResult<ConversionLog>>> => {
        try {
          // 入力検証
          if (!conversionId || typeof conversionId !== "string") {
            return {
              success: false,
              error: new Error(
                "Invalid conversionId: must be a non-empty string",
              ),
            };
          }

          const result = await historyService.getConversionLogs(
            conversionId,
            options,
          );
          return { success: true, data: result };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error : new Error(String(error)),
          };
        }
      },
      { getAllowedWindows: () => [mainWindow] },
    ),
  );

  // history:restoreVersion - バージョン復元
  ipcMain.handle(
    IPC_CHANNELS.HISTORY_RESTORE_VERSION,
    withValidation(
      IPC_CHANNELS.HISTORY_RESTORE_VERSION,
      async (
        _event,
        fileId: string,
        conversionId: string,
      ): Promise<Result<VersionHistoryItem>> => {
        try {
          // 入力検証
          if (!fileId || typeof fileId !== "string") {
            return {
              success: false,
              error: new Error("Invalid fileId: must be a non-empty string"),
            };
          }
          if (!conversionId || typeof conversionId !== "string") {
            return {
              success: false,
              error: new Error(
                "Invalid conversionId: must be a non-empty string",
              ),
            };
          }

          const result = await historyService.restoreVersion(
            fileId,
            conversionId,
          );
          return { success: true, data: result };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error : new Error(String(error)),
          };
        }
      },
      { getAllowedWindows: () => [mainWindow] },
    ),
  );
}
```

### 3.2 ipc/index.ts変更

```typescript
// apps/desktop/src/main/ipc/index.ts への追加

import { registerHistoryHandlers } from "./historyHandlers";
import { getHistoryService } from "../services"; // 要確認

export function registerAllIpcHandlers(mainWindow: BrowserWindow): void {
  // ...existing registrations

  // History handlers
  const historyService = getHistoryService();
  if (historyService) {
    registerHistoryHandlers(mainWindow, historyService);
  } else {
    console.warn(
      "[IPC] History handlers not registered - HistoryService not available",
    );
  }
}
```

---

## 4. HistoryService連携

### 4.1 サービスインターフェース

```typescript
// HistoryService（CONV-05-02で実装済み）のインターフェース

interface HistoryService {
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

### 4.2 サービス取得

```typescript
// apps/desktop/src/main/services/index.ts（要確認）

import { HistoryService } from "./HistoryService";

let historyServiceInstance: HistoryService | null = null;

export function getHistoryService(): HistoryService | null {
  if (!historyServiceInstance) {
    // 初期化ロジック
    // CONV-05-02で実装済みのため、そのパターンに従う
  }
  return historyServiceInstance;
}
```

---

## 5. エラーハンドリング設計

### 5.1 エラー種別

| エラー種別         | 発生箇所           | 対応                         |
| ------------------ | ------------------ | ---------------------------- |
| 入力検証エラー     | historyHandlers    | Result.success=false         |
| サービスエラー     | HistoryService     | catch → Result.success=false |
| IPC通信エラー      | ipcRenderer.invoke | Promise.reject               |
| データベースエラー | HistoryService内部 | サービスがthrow              |

### 5.2 エラーレスポンス形式

```typescript
// 成功時
{
  success: true,
  data: { ... }
}

// 失敗時
{
  success: false,
  error: {
    message: "エラーメッセージ",
    // code: "ERROR_CODE" // 将来拡張
  }
}
```

---

## 6. セキュリティ考慮事項

### 6.1 チャンネルホワイトリスト

- 4つのhistory:\*チャンネルをALLOWED_INVOKE_CHANNELSに追加
- safeInvoke()でホワイトリストチェック実施

### 6.2 ウィンドウ検証

- withValidation()でmainWindowからのリクエストのみ許可
- getAllowedWindows: () => [mainWindow]で制限

### 6.3 入力検証

- fileId: string型、空文字チェック
- conversionId: string型、空文字チェック
- options: オブジェクト型（オプショナル）

---

## 確認結果

- [x] IPCチャンネルが定義されている
- [x] preloadスクリプト設計が完了している
- [x] IPCハンドラー設計が完了している
- [x] HistoryService連携が設計されている
- [x] エラーハンドリングが設計されている
- [x] セキュリティ考慮事項が明記されている

---

## 変更履歴

| Version | Date       | Changes       |
| ------- | ---------- | ------------- |
| 1.0.0   | 2026-01-11 | Phase 2で作成 |

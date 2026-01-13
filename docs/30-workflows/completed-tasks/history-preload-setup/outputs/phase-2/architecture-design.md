# アーキテクチャ設計書

## メタ情報

| 項目       | 値                    |
| ---------- | --------------------- |
| Phase      | 2                     |
| タスク名   | history-preload-setup |
| 作成日     | 2026-01-13            |
| ステータス | 完了                  |

---

## 概要

本ドキュメントはElectronアプリケーションにおけるhistoryAPI preloadスクリプトのアーキテクチャ設計を定義する。

---

## アーキテクチャ全体像

```
┌─────────────────────────────────────────────────────────────────┐
│                     Renderer Process                             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    React Component                        │    │
│  │  HistoryPanel / VersionHistoryList / LogViewer            │    │
│  └───────────────────────────┬───────────────────────────────┘    │
│                              │ window.historyAPI?.method()        │
│  ┌───────────────────────────▼───────────────────────────────┐    │
│  │                    Window Interface                        │    │
│  │  historyAPI: HistoryAPI (型安全)                           │    │
│  └───────────────────────────┬───────────────────────────────┘    │
└──────────────────────────────┼──────────────────────────────────┘
                               │ contextBridge (isolated context)
┌──────────────────────────────┼──────────────────────────────────┐
│                    Preload Script                                │
│  ┌───────────────────────────▼───────────────────────────────┐   │
│  │              historyAPI Object                             │   │
│  │  - getFileHistory()                                        │   │
│  │  - getVersionDetail()                                      │   │
│  │  - getConversionLogs()                                     │   │
│  │  - restoreVersion()                                        │   │
│  └───────────────────────────┬───────────────────────────────┘   │
│                              │ safeInvoke(channel, args)         │
│  ┌───────────────────────────▼───────────────────────────────┐   │
│  │              Channel Whitelist                             │   │
│  │  ALLOWED_INVOKE_CHANNELS includes HISTORY_CHANNELS         │   │
│  └───────────────────────────┬───────────────────────────────┘   │
└──────────────────────────────┼──────────────────────────────────┘
                               │ ipcRenderer.invoke()
┌──────────────────────────────┼──────────────────────────────────┐
│                     Main Process                                 │
│  ┌───────────────────────────▼───────────────────────────────┐   │
│  │              IPC Handlers                                  │   │
│  │  history:getFileHistory → HistoryService.getFileHistory   │   │
│  │  history:getVersionDetail → HistoryService.getVersionDetail│   │
│  │  history:getConversionLogs → HistoryService.getConversionLogs│ │
│  │  history:restoreVersion → HistoryService.restoreVersion   │   │
│  └───────────────────────────┬───────────────────────────────┘   │
│                              │                                    │
│  ┌───────────────────────────▼───────────────────────────────┐   │
│  │              HistoryService                                │   │
│  │  libSQL Database Access                                    │   │
│  └───────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 実装済みファイル構成

### 変更対象ファイル（確認済み）

| ファイル                                                | 役割              | ステータス  |
| ------------------------------------------------------- | ----------------- | ----------- |
| `apps/desktop/src/preload/index.ts`                     | historyAPI公開    | ✅ 実装済み |
| `apps/desktop/src/preload/channels.ts`                  | IPCチャンネル定義 | ✅ 実装済み |
| `apps/desktop/src/renderer/components/history/types.ts` | HistoryAPI型定義  | ✅ 実装済み |

### 確認済み実装箇所

| 実装内容               | ファイル              | 行番号  |
| ---------------------- | --------------------- | ------- |
| HISTORY_CHANNELS定義   | `preload/channels.ts` | 156-159 |
| ホワイトリスト登録     | `preload/channels.ts` | 270-274 |
| historyAPIオブジェクト | `preload/index.ts`    | 319-328 |
| contextBridge公開      | `preload/index.ts`    | 353     |
| HistoryAPI interface   | `history/types.ts`    | 140-161 |
| Window型拡張           | `history/types.ts`    | 167-171 |

---

## セキュリティ設計

### contextIsolation有効化

```typescript
// BrowserWindowの設定
webPreferences: {
  contextIsolation: true,  // セキュリティ必須
  nodeIntegration: false,  // Node.jsアクセス無効化
  sandbox: true,           // サンドボックス有効化
}
```

### チャンネルホワイトリスト

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

---

## 統合ポイント

### preload → Main Process

| チャンネル名                | リクエスト                 | レスポンス                                    |
| --------------------------- | -------------------------- | --------------------------------------------- |
| `history:getFileHistory`    | `(fileId, options?)`       | `Result<PaginatedResult<VersionHistoryItem>>` |
| `history:getVersionDetail`  | `(conversionId)`           | `Result<VersionDetailData>`                   |
| `history:getConversionLogs` | `(conversionId, options?)` | `Result<PaginatedResult<ConversionLog>>`      |
| `history:restoreVersion`    | `(fileId, conversionId)`   | `Result<VersionHistoryItem>`                  |

### Window → React Component

```typescript
// 使用例
const result = await window.historyAPI?.getFileHistory(fileId, { limit: 20 });
if (result?.success) {
  const { items, total, hasMore } = result.data;
}
```

---

## 完了確認

- [x] アーキテクチャ全体像が図示されている
- [x] 実装済みファイル構成が明確である
- [x] セキュリティ設計が確認されている
- [x] 統合ポイントが明確である
- [x] **本Phase内の全タスクを100%実行完了**

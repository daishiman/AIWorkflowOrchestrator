# 要件定義書

## メタ情報

| 項目       | 値                    |
| ---------- | --------------------- |
| Phase      | 1                     |
| タスク名   | history-preload-setup |
| 作成日     | 2026-01-13            |
| ステータス | 完了                  |

---

## 概要

ElectronアプリケーションでcontextIsolationが有効な環境において、レンダラープロセスからメインプロセスの履歴関連APIにアクセスできるようにするため、preloadスクリプトでhistoryAPIをwindowオブジェクトに公開する。

---

## 既存実装状況

**確認結果**: historyAPIは既に実装・公開されている。

| 項目               | ファイル                                                        | 状態        |
| ------------------ | --------------------------------------------------------------- | ----------- |
| historyAPI定義     | `apps/desktop/src/preload/index.ts:319-328`                     | ✅ 実装済み |
| contextBridge公開  | `apps/desktop/src/preload/index.ts:353`                         | ✅ 実装済み |
| IPCチャンネル定義  | `apps/desktop/src/preload/channels.ts:156-159`                  | ✅ 実装済み |
| ホワイトリスト登録 | `apps/desktop/src/preload/channels.ts:270-274`                  | ✅ 実装済み |
| Window型拡張       | `apps/desktop/src/renderer/components/history/types.ts:167-171` | ✅ 実装済み |

---

## HistoryAPI メソッド仕様

### 抽出した要件

| メソッド          | IPCチャンネル               | 引数                                             | 戻り値                                               |
| ----------------- | --------------------------- | ------------------------------------------------ | ---------------------------------------------------- |
| getFileHistory    | `history:getFileHistory`    | fileId: string, options?: PaginationOptions      | Promise<Result<PaginatedResult<VersionHistoryItem>>> |
| getVersionDetail  | `history:getVersionDetail`  | conversionId: string                             | Promise<Result<VersionDetailData>>                   |
| getConversionLogs | `history:getConversionLogs` | conversionId: string, options?: LogFilterOptions | Promise<Result<PaginatedResult<ConversionLog>>>      |
| restoreVersion    | `history:restoreVersion`    | fileId: string, conversionId: string             | Promise<Result<VersionHistoryItem>>                  |

### IPCチャンネル定義（channels.ts）

```typescript
// History operations
HISTORY_GET_FILE_HISTORY: "history:getFileHistory",
HISTORY_GET_VERSION_DETAIL: "history:getVersionDetail",
HISTORY_GET_CONVERSION_LOGS: "history:getConversionLogs",
HISTORY_RESTORE_VERSION: "history:restoreVersion",
```

---

## 型定義

### PaginationOptions

```typescript
interface PaginationOptions {
  limit?: number; // 取得件数（デフォルト: 20）
  offset?: number; // オフセット（デフォルト: 0）
}
```

### LogFilterOptions

```typescript
interface LogFilterOptions extends PaginationOptions {
  level?: LogLevel; // "info" | "warn" | "error" | "debug"
}
```

### Result<T>

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

---

## IPC接続要件

| カテゴリ      | 内容                                                                                                |
| ------------- | --------------------------------------------------------------------------------------------------- |
| IPCチャンネル | history:getFileHistory, history:getVersionDetail, history:getConversionLogs, history:restoreVersion |
| 型定義        | HistoryAPI interface, Result<T>, PaginatedResult<T>                                                 |
| 認証フロー    | N/A（履歴APIは認証不要）                                                                            |

---

## 参照システム仕様

| 仕様書                    | パス                                                                         |
| ------------------------- | ---------------------------------------------------------------------------- |
| 履歴/ログ表示UI仕様       | `.claude/skills/aiworkflow-requirements/references/ui-ux-history-panel.md`   |
| APIセキュリティ・Electron | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` |

---

## 完了確認

- [x] HistoryAPIの4メソッドが抽出されている
- [x] 各メソッドのIPCチャンネル名が特定されている
- [x] 既存実装の状況が確認されている
- [x] IPC接続要件が明記されている
- [x] **本Phase内の全タスクを100%実行完了**

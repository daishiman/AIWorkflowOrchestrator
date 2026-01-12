# Phase 1 タスク2: IPCチャンネル仕様

## 実行日時

2026-01-11

---

## IPCチャンネル一覧

### 1. history:getFileHistory

**目的**: 指定ファイルのバージョン履歴一覧を取得する

**パラメータ**:

| 引数    | 型                | 必須 | 説明                       |
| ------- | ----------------- | ---- | -------------------------- |
| fileId  | string            | ✅   | 対象ファイルのID           |
| options | PaginationOptions | -    | ページネーションオプション |

**PaginationOptions**:

```typescript
interface PaginationOptions {
  limit?: number; // 取得件数（デフォルト: 20）
  offset?: number; // オフセット（デフォルト: 0）
}
```

**戻り値**: `Result<PaginatedResult<VersionHistoryItem>>`

**正常系レスポンス**:

```typescript
{
  success: true,
  data: {
    items: VersionHistoryItem[],
    total: number,
    hasMore: boolean
  }
}
```

**異常系レスポンス**:

```typescript
{
  success: false,
  error: {
    message: string,
    code?: string
  }
}
```

---

### 2. history:getVersionDetail

**目的**: 指定バージョンの詳細情報を取得する

**パラメータ**:

| 引数         | 型     | 必須 | 説明         |
| ------------ | ------ | ---- | ------------ |
| conversionId | string | ✅   | 対象変換のID |

**戻り値**: `Result<VersionDetailData>`

**VersionDetailData**:

```typescript
interface VersionDetailData {
  version: VersionHistoryItem;
  logs: ConversionLog[];
}
```

**正常系レスポンス**:

```typescript
{
  success: true,
  data: {
    version: VersionHistoryItem,
    logs: ConversionLog[]
  }
}
```

---

### 3. history:getConversionLogs

**目的**: 指定変換のログ一覧を取得する

**パラメータ**:

| 引数         | 型               | 必須 | 説明               |
| ------------ | ---------------- | ---- | ------------------ |
| conversionId | string           | ✅   | 対象変換のID       |
| options      | LogFilterOptions | -    | フィルタオプション |

**LogFilterOptions**:

```typescript
interface LogFilterOptions {
  level?: LogLevel; // ログレベルフィルタ
  limit?: number; // 取得件数
  offset?: number; // オフセット
}
```

**戻り値**: `Result<PaginatedResult<ConversionLog>>`

---

### 4. history:restoreVersion

**目的**: 指定バージョンに復元する

**パラメータ**:

| 引数         | 型     | 必須 | 説明                     |
| ------------ | ------ | ---- | ------------------------ |
| fileId       | string | ✅   | 対象ファイルのID         |
| conversionId | string | ✅   | 復元先バージョンの変換ID |

**戻り値**: `Result<VersionHistoryItem>`

**正常系レスポンス**:

```typescript
{
  success: true,
  data: VersionHistoryItem  // 復元後の新バージョン情報
}
```

---

## Result型パターン

### 定義

```typescript
interface SuccessResult<T> {
  success: true;
  data: T;
}

interface ErrorResult {
  success: false;
  error: {
    message: string;
    code?: string;
  };
}

type Result<T> = SuccessResult<T> | ErrorResult;
```

### 適用方針

1. **全チャンネル共通**: 全てのIPCハンドラーはResult型で返却する
2. **成功時**: `{ success: true, data: T }` 形式で返却
3. **失敗時**: `{ success: false, error: { message, code? } }` 形式で返却
4. **例外捕捉**: try-catchで例外を捕捉しErrorResultに変換

### 実装例

```typescript
ipcMain.handle(
  "history:getFileHistory",
  async (_event, fileId: string, options?: PaginationOptions) => {
    try {
      const result = await historyService.getFileHistory(fileId, options);
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : String(error),
        },
      };
    }
  },
);
```

---

## エラーコード体系

### エラーコード一覧

| コード                  | 意味                     | 発生条件                         |
| ----------------------- | ------------------------ | -------------------------------- |
| `INVALID_FILE_ID`       | 無効なファイルID         | fileIdが空または不正な形式       |
| `INVALID_CONVERSION_ID` | 無効な変換ID             | conversionIdが空または不正な形式 |
| `FILE_NOT_FOUND`        | ファイルが見つからない   | 指定IDのファイルが存在しない     |
| `VERSION_NOT_FOUND`     | バージョンが見つからない | 指定IDのバージョンが存在しない   |
| `RESTORE_FAILED`        | 復元に失敗               | 復元処理中にエラーが発生         |
| `DB_ERROR`              | データベースエラー       | DB操作でエラーが発生             |
| `UNKNOWN_ERROR`         | 不明なエラー             | 予期しないエラー                 |

### エラーメッセージ方針

1. **ユーザー向け**: 技術的詳細を含まない平易な説明
2. **ログ出力**: 詳細なエラー情報をコンソールに出力
3. **コード付与**: 可能な場合はエラーコードを付与

---

## ログ出力方針

### ログレベル

| レベル | 用途               |
| ------ | ------------------ |
| info   | 正常な処理完了     |
| warn   | 警告（処理は継続） |
| error  | エラー発生         |
| debug  | デバッグ情報       |

### ログフォーマット

```typescript
console.log("[IPC] history:getFileHistory - Start", { fileId, options });
console.log("[IPC] history:getFileHistory - Success", {
  count: result.items.length,
});
console.error("[IPC] history:getFileHistory - Error:", error);
```

---

## バリデーション要件

### 入力検証

| チャンネル        | パラメータ           | 検証内容           |
| ----------------- | -------------------- | ------------------ |
| getFileHistory    | fileId               | 非空文字列         |
| getVersionDetail  | conversionId         | 非空文字列         |
| getConversionLogs | conversionId         | 非空文字列         |
| restoreVersion    | fileId, conversionId | 両方とも非空文字列 |

### バリデーション実装例

```typescript
if (!fileId || typeof fileId !== "string") {
  return {
    success: false,
    error: {
      message: "Invalid file ID",
      code: "INVALID_FILE_ID",
    },
  };
}
```

---

## 統合テスト連携

### IPC契約（Phase 1定義）

| 項目           | 内容                                          |
| -------------- | --------------------------------------------- |
| チャンネル数   | 4                                             |
| 戻り値形式     | Result<T>で統一                               |
| エラー形式     | { success: false, error: { message, code? } } |
| バリデーション | Main側で入力検証                              |

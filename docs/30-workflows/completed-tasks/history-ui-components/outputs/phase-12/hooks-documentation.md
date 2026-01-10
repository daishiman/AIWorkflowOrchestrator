# カスタムフック ドキュメント

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| タスクID   | CONV-05-03                    |
| 機能名     | 履歴/ログ表示UIコンポーネント |
| バージョン | 1.0                           |
| 作成日     | 2026-01-10                    |

---

## 概要

履歴/ログ表示機能で使用するカスタムフックの詳細仕様です。

---

## useVersionHistory

バージョン履歴一覧を取得・管理するフック。

### シグネチャ

```typescript
function useVersionHistory(fileId: string): UseVersionHistoryReturn;

interface UseVersionHistoryReturn {
  items: VersionHistoryItem[];
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
}
```

### パラメータ

| パラメータ | 型     | 説明           |
| ---------- | ------ | -------------- |
| fileId     | string | 対象ファイルID |

### 戻り値

| プロパティ | 型                   | 説明               |
| ---------- | -------------------- | ------------------ |
| items      | VersionHistoryItem[] | 履歴アイテム配列   |
| isLoading  | boolean              | 読み込み中フラグ   |
| error      | Error \| null        | エラーオブジェクト |
| hasMore    | boolean              | 追加データ有無     |
| loadMore   | () => void           | 追加読み込み関数   |
| refresh    | () => void           | データ再取得関数   |

### 使用例

```tsx
function HistoryList({ fileId }: { fileId: string }) {
  const { items, isLoading, error, hasMore, loadMore, refresh } =
    useVersionHistory(fileId);

  if (isLoading && items.length === 0) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={refresh} />;
  }

  return (
    <div>
      <ul>
        {items.map((item) => (
          <li key={item.conversionId}>{item.version}</li>
        ))}
      </ul>
      {hasMore && (
        <button onClick={loadMore} disabled={isLoading}>
          さらに読み込む
        </button>
      )}
    </div>
  );
}
```

### 内部動作

1. マウント時に初期データを取得（limit=20, offset=0）
2. `loadMore`呼び出しで追加データを既存配列に追加
3. `refresh`呼び出しでoffset=0からリセット取得
4. fileId変更時に自動的にデータを再取得

---

## useVersionDetail

バージョン詳細情報を取得するフック。

### シグネチャ

```typescript
function useVersionDetail(conversionId: string): UseVersionDetailReturn;

interface UseVersionDetailReturn {
  version: VersionHistoryItem | null;
  logs: ConversionLog[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}
```

### パラメータ

| パラメータ   | 型     | 説明   |
| ------------ | ------ | ------ |
| conversionId | string | 変換ID |

### 戻り値

| プロパティ | 型                         | 説明               |
| ---------- | -------------------------- | ------------------ |
| version    | VersionHistoryItem \| null | バージョン情報     |
| logs       | ConversionLog[]            | 変換ログ配列       |
| isLoading  | boolean                    | 読み込み中フラグ   |
| error      | Error \| null              | エラーオブジェクト |
| refresh    | () => void                 | データ再取得関数   |

### 使用例

```tsx
function VersionPanel({ conversionId }: { conversionId: string }) {
  const { version, logs, isLoading, error, refresh } =
    useVersionDetail(conversionId);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={refresh} />;
  }

  if (!version) {
    return <p>バージョンが見つかりません</p>;
  }

  return (
    <div>
      <h2>バージョン {version.version}</h2>
      <p>作成日: {version.createdAt}</p>
      <p>サイズ: {version.size} bytes</p>
      <ul>
        {logs.map((log, i) => (
          <li key={i}>{log.message}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 内部動作

1. マウント時にバージョン詳細とログを同時取得
2. conversionId変更時に自動的にデータを再取得
3. `refresh`呼び出しで手動再取得

---

## useConversionLogs

変換ログを取得・管理するフック。

### シグネチャ

```typescript
function useConversionLogs(
  conversionId: string,
  options?: UseConversionLogsOptions,
): UseConversionLogsReturn;

interface UseConversionLogsOptions {
  level?: LogLevel | "all";
  limit?: number;
}

interface UseConversionLogsReturn {
  logs: ConversionLog[];
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  filter: LogLevel | "all";
  setFilter: (level: LogLevel | "all") => void;
  loadMore: () => void;
  refresh: () => void;
}
```

### パラメータ

| パラメータ   | 型                       | 説明           |
| ------------ | ------------------------ | -------------- |
| conversionId | string                   | 変換ID         |
| options      | UseConversionLogsOptions | オプション設定 |

### オプション

| オプション | 型                | デフォルト | 説明          |
| ---------- | ----------------- | ---------- | ------------- |
| level      | LogLevel \| 'all' | 'all'      | 初期フィルタ  |
| limit      | number            | 20         | 1回の取得件数 |

### 戻り値

| プロパティ | 型                                 | 説明               |
| ---------- | ---------------------------------- | ------------------ |
| logs       | ConversionLog[]                    | ログ配列           |
| isLoading  | boolean                            | 読み込み中フラグ   |
| error      | Error \| null                      | エラーオブジェクト |
| hasMore    | boolean                            | 追加データ有無     |
| filter     | LogLevel \| 'all'                  | 現在のフィルタ     |
| setFilter  | (level: LogLevel \| 'all') => void | フィルタ変更関数   |
| loadMore   | () => void                         | 追加読み込み関数   |
| refresh    | () => void                         | データ再取得関数   |

### 使用例

```tsx
function LogViewer({ conversionId }: { conversionId: string }) {
  const {
    logs,
    isLoading,
    error,
    hasMore,
    filter,
    setFilter,
    loadMore,
    refresh,
  } = useConversionLogs(conversionId);

  return (
    <div>
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value as LogLevel | "all")}
      >
        <option value="all">すべて</option>
        <option value="info">Info</option>
        <option value="warn">Warning</option>
        <option value="error">Error</option>
        <option value="debug">Debug</option>
      </select>

      {error && <ErrorDisplay error={error} onRetry={refresh} />}

      <ul>
        {logs.map((log, i) => (
          <li key={i} data-level={log.level}>
            [{log.level}] {log.message}
          </li>
        ))}
      </ul>

      {hasMore && (
        <button onClick={loadMore} disabled={isLoading}>
          さらに読み込む
        </button>
      )}
    </div>
  );
}
```

### 内部動作

1. マウント時に初期データを取得
2. `setFilter`呼び出しでフィルタ変更し、データをリセット取得
3. `loadMore`呼び出しで追加データを既存配列に追加
4. conversionId変更時に自動的にデータをリセット取得

---

## useRestore

バージョン復元処理を管理するフック。

### シグネチャ

```typescript
function useRestore(): UseRestoreReturn;

interface UseRestoreReturn {
  restore: (conversionId: string) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
}
```

### 戻り値

| プロパティ | 型                                      | 説明               |
| ---------- | --------------------------------------- | ------------------ |
| restore    | (conversionId: string) => Promise<void> | 復元実行関数       |
| isLoading  | boolean                                 | 処理中フラグ       |
| error      | Error \| null                           | エラーオブジェクト |
| reset      | () => void                              | エラー状態リセット |

### 使用例

```tsx
function RestoreButton({ conversionId }: { conversionId: string }) {
  const { restore, isLoading, error, reset } = useRestore();
  const [showDialog, setShowDialog] = useState(false);

  const handleConfirm = async () => {
    try {
      await restore(conversionId);
      setShowDialog(false);
      // 成功通知を表示
    } catch {
      // エラーはフック内で管理される
    }
  };

  return (
    <>
      <button onClick={() => setShowDialog(true)}>このバージョンに復元</button>

      <RestoreDialog
        isOpen={showDialog}
        onConfirm={handleConfirm}
        onCancel={() => {
          setShowDialog(false);
          reset();
        }}
        isLoading={isLoading}
        error={error}
      />
    </>
  );
}
```

### 内部動作

1. `restore`呼び出しで復元APIを実行
2. 成功時はPromiseがresolve
3. 失敗時はerror状態を設定しPromiseがreject
4. `reset`呼び出しでerror状態をクリア

---

## 型定義

### VersionHistoryItem

```typescript
interface VersionHistoryItem {
  conversionId: string;
  fileId: string;
  version: number;
  createdAt: string;
  size: number;
  mimeType: string;
  hash: string;
  isLatest: boolean;
  metadata?: Record<string, unknown>;
}
```

### ConversionLog

```typescript
interface ConversionLog {
  timestamp: string;
  level: LogLevel;
  message: string;
  details?: Record<string, unknown>;
}

type LogLevel = "info" | "warn" | "error" | "debug";
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

## API依存関係

すべてのフックは `window.historyAPI` に依存しています。

### 必要なAPI

```typescript
interface HistoryAPI {
  getFileHistory(
    fileId: string,
    options: { limit: number; offset: number },
  ): Promise<APIResult<PaginatedResult<VersionHistoryItem>>>;

  getVersionDetail(
    conversionId: string,
  ): Promise<APIResult<{ version: VersionHistoryItem; logs: ConversionLog[] }>>;

  getConversionLogs(
    conversionId: string,
    options: { limit: number; offset: number; level?: LogLevel },
  ): Promise<APIResult<PaginatedResult<ConversionLog>>>;

  restoreVersion(conversionId: string): Promise<APIResult<void>>;
}

interface APIResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
}
```

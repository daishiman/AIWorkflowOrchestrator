# カスタムフック設計書

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| タスクID   | CONV-05-03                    |
| 機能名     | 履歴/ログ表示UIコンポーネント |
| バージョン | 1.0                           |
| 作成日     | 2026-01-10                    |
| Phase      | 2                             |

---

## 設計原則

### カスタムフックの責務

1. **データ取得**: IPC経由でMainプロセスからデータを取得
2. **状態管理**: ローカルuseState/useReducerで状態を管理
3. **エラーハンドリング**: Result型を使用したエラー処理
4. **ページネーション**: オフセットベースのページネーション管理

### 外部ストア不使用

- Zustand、Redux等の外部ストアは使用しない
- コンポーネント単位で状態を完結させる
- 必要に応じてpropsで状態を受け渡す

---

## useVersionHistory

### 概要

ファイルの変換履歴一覧を取得・管理するフック。

### インターフェース

```typescript
interface UseVersionHistoryOptions {
  /** 1回の取得件数 */
  limit?: number;
  /** 自動フェッチを無効化 */
  skip?: boolean;
}

interface UseVersionHistoryReturn {
  /** 履歴データ配列 */
  history: VersionHistoryItem[];
  /** 読み込み中フラグ */
  isLoading: boolean;
  /** エラー情報 */
  error: Error | null;
  /** 追加データがあるか */
  hasMore: boolean;
  /** 追加読み込み関数 */
  loadMore: () => Promise<void>;
  /** 再取得関数 */
  refresh: () => Promise<void>;
}

function useVersionHistory(
  fileId: string,
  options?: UseVersionHistoryOptions,
): UseVersionHistoryReturn;
```

### 状態設計

```typescript
interface VersionHistoryState {
  history: VersionHistoryItem[];
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  offset: number;
}

const initialState: VersionHistoryState = {
  history: [],
  isLoading: false,
  error: null,
  hasMore: true,
  offset: 0,
};
```

### 実装フロー

```
mount/fileId変更
    │
    ▼
setIsLoading(true)
    │
    ▼
window.historyAPI.getFileHistory(fileId, { limit, offset: 0 })
    │
    ├─── 成功 ───▶ setHistory(items), setHasMore(hasMore), setOffset(items.length)
    │
    └─── 失敗 ───▶ setError(error)
    │
    ▼
setIsLoading(false)


loadMore()
    │
    ▼
setIsLoadingMore(true)
    │
    ▼
window.historyAPI.getFileHistory(fileId, { limit, offset })
    │
    ├─── 成功 ───▶ appendHistory(items), setHasMore(hasMore), setOffset(offset + items.length)
    │
    └─── 失敗 ───▶ setError(error)
    │
    ▼
setIsLoadingMore(false)
```

### 使用例

```tsx
function VersionHistoryPanel({ fileId }: { fileId: string }) {
  const { history, isLoading, error, hasMore, loadMore, refresh } =
    useVersionHistory(fileId, { limit: 20 });

  if (isLoading && history.length === 0) {
    return <Spinner />;
  }

  if (error) {
    return <ErrorMessage message={error.message} onRetry={refresh} />;
  }

  return (
    <div>
      {history.map((item) => (
        <VersionHistoryItemComponent key={item.conversionId} item={item} />
      ))}
      {hasMore && <LoadMoreButton onClick={loadMore} />}
    </div>
  );
}
```

---

## useVersionDetail

### 概要

特定バージョンの詳細情報を取得するフック。

### インターフェース

```typescript
interface UseVersionDetailOptions {
  /** 自動フェッチを無効化 */
  skip?: boolean;
}

interface UseVersionDetailReturn {
  /** 詳細データ */
  detail: VersionHistoryItem | null;
  /** 読み込み中フラグ */
  isLoading: boolean;
  /** エラー情報 */
  error: Error | null;
  /** 再取得関数 */
  refresh: () => Promise<void>;
}

function useVersionDetail(
  conversionId: string | null,
  options?: UseVersionDetailOptions,
): UseVersionDetailReturn;
```

### 状態設計

```typescript
interface VersionDetailState {
  detail: VersionHistoryItem | null;
  isLoading: boolean;
  error: Error | null;
}

const initialState: VersionDetailState = {
  detail: null,
  isLoading: false,
  error: null,
};
```

### 実装フロー

```
mount/conversionId変更
    │
    ├─── conversionId === null ───▶ setDetail(null), return
    │
    ▼
setIsLoading(true)
    │
    ▼
window.historyAPI.getVersionDetail(conversionId)
    │
    ├─── 成功 ───▶ setDetail(item)
    │
    └─── 失敗 ───▶ setError(error)
    │
    ▼
setIsLoading(false)
```

### 使用例

```tsx
function VersionDetailPanel({ conversionId }: { conversionId: string | null }) {
  const { detail, isLoading, error, refresh } = useVersionDetail(conversionId);

  if (!conversionId) {
    return <div>バージョンを選択してください</div>;
  }

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return <ErrorMessage message={error.message} onRetry={refresh} />;
  }

  if (!detail) {
    return <div>詳細が見つかりません</div>;
  }

  return (
    <div>
      <h2>バージョン {detail.version}</h2>
      <p>作成日時: {detail.createdAt}</p>
      <p>サイズ: {detail.size} bytes</p>
      <p>MIME: {detail.mimeType}</p>
    </div>
  );
}
```

---

## useConversionLogs

### 概要

変換ログ一覧を取得・フィルタリングするフック。

### インターフェース

```typescript
interface UseConversionLogsOptions {
  /** 対象ファイルID（省略時は全ログ） */
  fileId?: string;
  /** ログレベルフィルタ */
  levelFilter?: LogLevel[];
  /** 1回の取得件数 */
  limit?: number;
  /** 自動フェッチを無効化 */
  skip?: boolean;
}

interface UseConversionLogsReturn {
  /** ログデータ配列 */
  logs: ConversionLog[];
  /** 読み込み中フラグ */
  isLoading: boolean;
  /** エラー情報 */
  error: Error | null;
  /** 追加データがあるか */
  hasMore: boolean;
  /** 追加読み込み関数 */
  loadMore: () => Promise<void>;
  /** 再取得関数 */
  refresh: () => Promise<void>;
  /** フィルタ変更関数 */
  setLevelFilter: (levels: LogLevel[]) => void;
}

function useConversionLogs(
  options?: UseConversionLogsOptions,
): UseConversionLogsReturn;
```

### 状態設計

```typescript
interface ConversionLogsState {
  logs: ConversionLog[];
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  offset: number;
  levelFilter: LogLevel[];
}

const initialState: ConversionLogsState = {
  logs: [],
  isLoading: false,
  error: null,
  hasMore: true,
  offset: 0,
  levelFilter: ["info", "warn", "error"],
};
```

### 実装フロー

```
mount/options変更
    │
    ▼
setIsLoading(true), setOffset(0), setLogs([])
    │
    ▼
window.historyAPI.getConversionLogs({ fileId, levelFilter, limit, offset: 0 })
    │
    ├─── 成功 ───▶ setLogs(items), setHasMore(hasMore), setOffset(items.length)
    │
    └─── 失敗 ───▶ setError(error)
    │
    ▼
setIsLoading(false)


setLevelFilter(levels)
    │
    ▼
setLevelFilter(levels)
    │
    ▼
refresh() // 自動再取得
```

### 使用例

```tsx
function ConversionLogsPanel({ fileId }: { fileId?: string }) {
  const { logs, isLoading, error, hasMore, loadMore, refresh, setLevelFilter } =
    useConversionLogs({ fileId, limit: 20 });

  const handleFilterChange = (level: LogLevel | "all") => {
    if (level === "all") {
      setLevelFilter(["info", "warn", "error"]);
    } else {
      setLevelFilter([level]);
    }
  };

  return (
    <div>
      <Select onChange={(e) => handleFilterChange(e.target.value as LogLevel)}>
        <option value="all">すべて</option>
        <option value="info">Info</option>
        <option value="warn">Warning</option>
        <option value="error">Error</option>
      </Select>

      {logs.map((log) => (
        <LogEntry key={log.id} log={log} />
      ))}

      {hasMore && <LoadMoreButton onClick={loadMore} isLoading={isLoading} />}
    </div>
  );
}
```

---

## useRestore

### 概要

バージョン復元操作を実行するフック。

### インターフェース

```typescript
interface UseRestoreOptions {
  /** 復元成功時のコールバック */
  onSuccess?: (restored: VersionHistoryItem) => void;
  /** 復元失敗時のコールバック */
  onError?: (error: Error) => void;
}

interface UseRestoreReturn {
  /** 復元実行関数 */
  restore: (fileId: string, conversionId: string) => Promise<void>;
  /** 復元処理中フラグ */
  isRestoring: boolean;
  /** エラー情報 */
  error: Error | null;
  /** エラークリア関数 */
  clearError: () => void;
}

function useRestore(options?: UseRestoreOptions): UseRestoreReturn;
```

### 状態設計

```typescript
interface RestoreState {
  isRestoring: boolean;
  error: Error | null;
}

const initialState: RestoreState = {
  isRestoring: false,
  error: null,
};
```

### 実装フロー

```
restore(fileId, conversionId)
    │
    ▼
setIsRestoring(true), setError(null)
    │
    ▼
window.historyAPI.restoreVersion(fileId, conversionId)
    │
    ├─── 成功 ───▶ onSuccess?.(restored)
    │
    └─── 失敗 ───▶ setError(error), onError?.(error)
    │
    ▼
setIsRestoring(false)
```

### 使用例

```tsx
function RestoreDialogContainer({
  version,
  isOpen,
  onClose,
  onRestoreComplete,
}: {
  version: VersionHistoryItem;
  isOpen: boolean;
  onClose: () => void;
  onRestoreComplete: () => void;
}) {
  const { restore, isRestoring, error, clearError } = useRestore({
    onSuccess: () => {
      onClose();
      onRestoreComplete();
    },
  });

  const handleConfirm = async () => {
    await restore(version.fileId, version.conversionId);
  };

  const handleCancel = () => {
    clearError();
    onClose();
  };

  return (
    <RestoreDialog
      isOpen={isOpen}
      version={version}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      isRestoring={isRestoring}
    />
  );
}
```

---

## 共通パターン

### エラーハンドリング

```typescript
// Result型を使用したエラー処理パターン
async function fetchWithErrorHandling<T>(
  fetchFn: () => Promise<Result<T, Error>>,
  setData: (data: T) => void,
  setError: (error: Error | null) => void,
  setIsLoading: (loading: boolean) => void,
): Promise<void> {
  setIsLoading(true);
  setError(null);

  try {
    const result = await fetchFn();
    if (result.success) {
      setData(result.data);
    } else {
      setError(result.error);
    }
  } catch (e) {
    setError(e instanceof Error ? e : new Error("Unknown error"));
  } finally {
    setIsLoading(false);
  }
}
```

### クリーンアップ

```typescript
// useEffectでのクリーンアップパターン
useEffect(() => {
  let isMounted = true;

  const fetchData = async () => {
    const result = await window.historyAPI.getFileHistory(fileId);
    if (isMounted && result.success) {
      setHistory(result.data.items);
    }
  };

  fetchData();

  return () => {
    isMounted = false;
  };
}, [fileId]);
```

### 依存配列の管理

```typescript
// useCallbackでの依存最適化
const loadMore = useCallback(async () => {
  if (isLoading || !hasMore) return;

  setIsLoading(true);
  const result = await window.historyAPI.getFileHistory(fileId, {
    limit,
    offset,
  });
  // ...
}, [fileId, limit, offset, isLoading, hasMore]);
```

---

## テスト戦略

### モック対象

```typescript
// window.historyAPIのモック
const mockHistoryAPI: typeof window.historyAPI = {
  getFileHistory: vi.fn(),
  getVersionDetail: vi.fn(),
  getConversionLogs: vi.fn(),
  restoreVersion: vi.fn(),
};

beforeEach(() => {
  vi.stubGlobal("window", { historyAPI: mockHistoryAPI });
});
```

### テストケース

| フック            | テストケース                                   |
| ----------------- | ---------------------------------------------- |
| useVersionHistory | 初期読み込み、loadMore、refresh、エラー時      |
| useVersionDetail  | 初期読み込み、null conversionId、エラー時      |
| useConversionLogs | 初期読み込み、フィルタ変更、loadMore、エラー時 |
| useRestore        | 復元成功、復元失敗、isRestoringフラグ          |

---

## Preload API連携

### window.historyAPI 型定義

```typescript
// apps/desktop/src/preload/historyAPI.d.ts
interface HistoryAPI {
  getFileHistory(
    fileId: string,
    options?: HistoryOptions,
  ): Promise<Result<PaginatedResult<VersionHistoryItem>, Error>>;

  getVersionDetail(
    conversionId: string,
  ): Promise<Result<VersionHistoryItem, Error>>;

  getConversionLogs(
    options?: LogsOptions,
  ): Promise<Result<PaginatedResult<ConversionLog>, Error>>;

  restoreVersion(
    fileId: string,
    conversionId: string,
  ): Promise<Result<VersionHistoryItem, Error>>;
}

interface HistoryOptions {
  limit?: number;
  offset?: number;
}

interface LogsOptions {
  fileId?: string;
  levelFilter?: LogLevel[];
  limit?: number;
  offset?: number;
}

declare global {
  interface Window {
    historyAPI: HistoryAPI;
  }
}
```

---

## 関連ドキュメント

| 資料名           | パス                                                                        |
| ---------------- | --------------------------------------------------------------------------- |
| アーキテクチャ   | `outputs/phase-2/architecture-design.md`                                    |
| データフロー     | `outputs/phase-2/data-flow.md`                                              |
| Props設計        | `outputs/phase-2/props-design.md`                                           |
| インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-converter.md` |

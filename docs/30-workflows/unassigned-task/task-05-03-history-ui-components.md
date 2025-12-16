# 履歴/ログ表示UIコンポーネント - タスク指示書

## メタ情報

| 項目         | 内容                          |
| ------------ | ----------------------------- |
| タスクID     | CONV-05-03                    |
| タスク名     | 履歴/ログ表示UIコンポーネント |
| 親タスク     | CONV-05 (履歴/ログ管理)       |
| 依存タスク   | CONV-05-01, CONV-05-02        |
| 規模         | 中                            |
| 見積もり工数 | 1日                           |
| ステータス   | 未実施                        |

---

## 1. 目的

ファイルのバージョン履歴一覧、詳細表示、復元操作、ログ表示のUIコンポーネントを実装する。

---

## 2. 成果物

- `apps/desktop/src/renderer/components/history/VersionHistory.tsx`
- `apps/desktop/src/renderer/components/history/VersionDetail.tsx`
- `apps/desktop/src/renderer/components/history/ConversionLogs.tsx`
- `apps/desktop/src/renderer/components/history/RestoreDialog.tsx`
- `apps/desktop/src/renderer/hooks/useVersionHistory.ts`
- `apps/desktop/src/renderer/hooks/useConversionLogs.ts`
- 各コンポーネントのテストファイル

---

## 3. コンポーネント仕様

### 3.1 VersionHistory - 履歴一覧

```tsx
// apps/desktop/src/renderer/components/history/VersionHistory.tsx
import type { VersionHistoryItem } from "@repo/shared/services/history/types";

interface VersionHistoryProps {
  fileId: string;
  onVersionSelect?: (item: VersionHistoryItem) => void;
  onRestore?: (item: VersionHistoryItem) => void;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({
  fileId,
  onVersionSelect,
  onRestore,
}) => {
  const { history, isLoading, error, hasMore, loadMore } =
    useVersionHistory(fileId);

  if (isLoading && !history.length) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error.message} />;
  }

  return (
    <div className="version-history">
      <h3 className="text-lg font-semibold mb-4">バージョン履歴</h3>

      <ul className="space-y-2">
        {history.map((item) => (
          <VersionHistoryItem
            key={item.conversionId}
            item={item}
            onSelect={() => onVersionSelect?.(item)}
            onRestore={() => onRestore?.(item)}
          />
        ))}
      </ul>

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={isLoading}
          className="mt-4 w-full py-2 text-center text-sm text-gray-500 hover:text-gray-700"
        >
          {isLoading ? "読み込み中..." : "さらに読み込む"}
        </button>
      )}
    </div>
  );
};

// 履歴アイテムコンポーネント
const VersionHistoryItem: React.FC<{
  item: VersionHistoryItem;
  onSelect: () => void;
  onRestore: () => void;
}> = ({ item, onSelect, onRestore }) => (
  <li
    className={`
      p-3 rounded-lg border cursor-pointer
      ${item.isCurrentVersion ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}
    `}
    onClick={onSelect}
  >
    <div className="flex items-center justify-between">
      <div>
        <span className="font-medium">v{item.version}</span>
        {item.isCurrentVersion && (
          <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
            現在
          </span>
        )}
      </div>
      <time className="text-sm text-gray-500">
        {formatDate(item.createdAt)}
      </time>
    </div>

    <div className="mt-1 text-sm text-gray-600">
      {formatBytes(item.sizeBytes)}
    </div>

    {!item.isCurrentVersion && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRestore();
        }}
        className="mt-2 text-sm text-blue-600 hover:text-blue-800"
      >
        このバージョンに復元
      </button>
    )}
  </li>
);
```

### 3.2 VersionDetail - バージョン詳細

```tsx
// apps/desktop/src/renderer/components/history/VersionDetail.tsx
interface VersionDetailProps {
  conversionId: string;
  onClose?: () => void;
  onRestore?: () => void;
}

export const VersionDetail: React.FC<VersionDetailProps> = ({
  conversionId,
  onClose,
  onRestore,
}) => {
  const { detail, isLoading, error } = useVersionDetail(conversionId);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !detail) {
    return (
      <ErrorMessage message={error?.message ?? "詳細を取得できませんでした"} />
    );
  }

  return (
    <div className="version-detail p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">バージョン詳細</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      <dl className="space-y-3">
        <div>
          <dt className="text-sm text-gray-500">バージョンID</dt>
          <dd className="font-mono text-sm">{detail.conversionId}</dd>
        </div>

        <div>
          <dt className="text-sm text-gray-500">作成日時</dt>
          <dd>{formatDateTime(detail.createdAt)}</dd>
        </div>

        <div>
          <dt className="text-sm text-gray-500">ファイル形式</dt>
          <dd>{detail.mimeType}</dd>
        </div>

        <div>
          <dt className="text-sm text-gray-500">サイズ</dt>
          <dd>{formatBytes(detail.sizeBytes)}</dd>
        </div>

        <div>
          <dt className="text-sm text-gray-500">コンテンツハッシュ</dt>
          <dd className="font-mono text-xs truncate">{detail.contentHash}</dd>
        </div>

        {detail.metadata && Object.keys(detail.metadata).length > 0 && (
          <div>
            <dt className="text-sm text-gray-500 mb-1">メタデータ</dt>
            <dd>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                {JSON.stringify(detail.metadata, null, 2)}
              </pre>
            </dd>
          </div>
        )}
      </dl>

      {!detail.isCurrentVersion && onRestore && (
        <button
          onClick={onRestore}
          className="mt-4 w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          このバージョンに復元
        </button>
      )}
    </div>
  );
};
```

### 3.3 ConversionLogs - ログ表示

```tsx
// apps/desktop/src/renderer/components/history/ConversionLogs.tsx
import type {
  ConversionLog,
  LogLevel,
} from "@repo/shared/services/logging/types";

interface ConversionLogsProps {
  fileId?: string;
  levelFilter?: LogLevel[];
  limit?: number;
}

export const ConversionLogs: React.FC<ConversionLogsProps> = ({
  fileId,
  levelFilter,
  limit = 50,
}) => {
  const { logs, isLoading, error, hasMore, loadMore, refresh } =
    useConversionLogs({ fileId, levelFilter, limit });

  const [selectedLevel, setSelectedLevel] = useState<LogLevel | "all">("all");

  const filteredLogs =
    selectedLevel === "all"
      ? logs
      : logs.filter((log) => log.level === selectedLevel);

  return (
    <div className="conversion-logs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">変換ログ</h3>

        <div className="flex items-center gap-2">
          <select
            value={selectedLevel}
            onChange={(e) =>
              setSelectedLevel(e.target.value as LogLevel | "all")
            }
            className="text-sm border rounded px-2 py-1"
          >
            <option value="all">すべて</option>
            <option value="info">Info</option>
            <option value="warn">Warning</option>
            <option value="error">Error</option>
          </select>

          <button
            onClick={refresh}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            <RefreshIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isLoading && !logs.length ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage message={error.message} />
      ) : filteredLogs.length === 0 ? (
        <p className="text-sm text-gray-500">ログがありません</p>
      ) : (
        <>
          <ul className="space-y-1">
            {filteredLogs.map((log) => (
              <LogEntry key={log.id} log={log} />
            ))}
          </ul>

          {hasMore && (
            <button
              onClick={loadMore}
              disabled={isLoading}
              className="mt-4 w-full py-2 text-center text-sm text-gray-500 hover:text-gray-700"
            >
              {isLoading ? "読み込み中..." : "さらに読み込む"}
            </button>
          )}
        </>
      )}
    </div>
  );
};

// ログエントリコンポーネント
const LogEntry: React.FC<{ log: ConversionLog }> = ({ log }) => {
  const levelStyles = {
    info: "bg-blue-100 text-blue-800",
    warn: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
  };

  return (
    <li className="py-2 border-b border-gray-100 last:border-0">
      <div className="flex items-start gap-2">
        <span
          className={`text-xs px-1.5 py-0.5 rounded ${levelStyles[log.level]}`}
        >
          {log.level.toUpperCase()}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-sm">{log.message}</p>

          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
            <time>{formatDateTime(log.timestamp)}</time>
            <span>•</span>
            <span>{log.action}</span>
            {log.durationMs && (
              <>
                <span>•</span>
                <span>{log.durationMs}ms</span>
              </>
            )}
          </div>

          {log.details && (
            <details className="mt-1">
              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                詳細を表示
              </summary>
              <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-auto">
                {JSON.stringify(log.details, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    </li>
  );
};
```

### 3.4 RestoreDialog - 復元確認ダイアログ

```tsx
// apps/desktop/src/renderer/components/history/RestoreDialog.tsx
interface RestoreDialogProps {
  isOpen: boolean;
  version: VersionHistoryItem;
  onConfirm: () => void;
  onCancel: () => void;
  isRestoring: boolean;
}

export const RestoreDialog: React.FC<RestoreDialogProps> = ({
  isOpen,
  version,
  onConfirm,
  onCancel,
  isRestoring,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h3 className="text-lg font-semibold mb-2">バージョンを復元</h3>

        <p className="text-gray-600 mb-4">
          v{version.version}（{formatDate(version.createdAt)}）に復元しますか？
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
          <p className="text-sm text-yellow-800">
            現在のバージョンは履歴として保存されます。
            この操作は履歴から復元できます。
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isRestoring}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            disabled={isRestoring}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isRestoring ? "復元中..." : "復元する"}
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

## 4. カスタムフック

### 4.1 useVersionHistory

```typescript
// apps/desktop/src/renderer/hooks/useVersionHistory.ts
export function useVersionHistory(fileId: string) {
  const [history, setHistory] = useState<VersionHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const load = useCallback(
    async (reset = false) => {
      setIsLoading(true);
      setError(null);

      try {
        const currentOffset = reset ? 0 : offset;
        const result = await historyService.getFileHistory(fileId, {
          pagination: { limit: 20, offset: currentOffset },
        });

        if (result.success) {
          setHistory((prev) =>
            reset ? result.data.items : [...prev, ...result.data.items],
          );
          setHasMore(result.data.hasMore);
          setOffset(currentOffset + result.data.items.length);
        } else {
          setError(result.error);
        }
      } catch (e) {
        setError(e instanceof Error ? e : new Error("Unknown error"));
      } finally {
        setIsLoading(false);
      }
    },
    [fileId, offset],
  );

  useEffect(() => {
    load(true);
  }, [fileId]);

  return {
    history,
    isLoading,
    error,
    hasMore,
    loadMore: () => load(false),
    refresh: () => load(true),
  };
}
```

### 4.2 useConversionLogs

```typescript
// apps/desktop/src/renderer/hooks/useConversionLogs.ts
export function useConversionLogs(options: {
  fileId?: string;
  levelFilter?: LogLevel[];
  limit?: number;
}) {
  const [logs, setLogs] = useState<ConversionLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const load = useCallback(
    async (reset = false) => {
      setIsLoading(true);
      setError(null);

      try {
        const currentOffset = reset ? 0 : offset;
        const result = await logRepository.findByFileId(options.fileId, {
          limit: options.limit ?? 50,
          offset: currentOffset,
        });

        if (result.success) {
          setLogs((prev) => (reset ? result.data : [...prev, ...result.data]));
          setHasMore(result.data.length === (options.limit ?? 50));
          setOffset(currentOffset + result.data.length);
        } else {
          setError(result.error);
        }
      } catch (e) {
        setError(e instanceof Error ? e : new Error("Unknown error"));
      } finally {
        setIsLoading(false);
      }
    },
    [options.fileId, options.limit, offset],
  );

  useEffect(() => {
    load(true);
  }, [options.fileId]);

  return {
    logs,
    isLoading,
    error,
    hasMore,
    loadMore: () => load(false),
    refresh: () => load(true),
  };
}
```

---

## 5. テストケース

```typescript
describe("VersionHistory", () => {
  it("履歴一覧を表示する", async () => {
    render(<VersionHistory fileId="file-123" />);
    await waitFor(() => {
      expect(screen.getByText(/v1/)).toBeInTheDocument();
    });
  });

  it("現在のバージョンにラベルが表示される", async () => {
    render(<VersionHistory fileId="file-123" />);
    await waitFor(() => {
      expect(screen.getByText("現在")).toBeInTheDocument();
    });
  });

  it("復元ボタンクリックでコールバックが呼ばれる", async () => {
    const onRestore = vi.fn();
    render(<VersionHistory fileId="file-123" onRestore={onRestore} />);

    await waitFor(() => {
      const restoreButton = screen.getAllByText("このバージョンに復元")[0];
      fireEvent.click(restoreButton);
    });

    expect(onRestore).toHaveBeenCalled();
  });
});

describe("ConversionLogs", () => {
  it("ログ一覧を表示する", async () => {
    render(<ConversionLogs fileId="file-123" />);
    await waitFor(() => {
      expect(screen.getByText(/変換開始/)).toBeInTheDocument();
    });
  });

  it("レベルでフィルタリングできる", async () => {
    render(<ConversionLogs fileId="file-123" />);

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "error" } });

    await waitFor(() => {
      expect(screen.queryByText(/INFO/)).not.toBeInTheDocument();
    });
  });
});

describe("RestoreDialog", () => {
  it("復元確認ダイアログが表示される", () => {
    render(
      <RestoreDialog
        isOpen={true}
        version={mockVersion}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        isRestoring={false}
      />
    );
    expect(screen.getByText("バージョンを復元")).toBeInTheDocument();
  });

  it("復元中は復元ボタンが無効になる", () => {
    render(
      <RestoreDialog
        isOpen={true}
        version={mockVersion}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        isRestoring={true}
      />
    );
    expect(screen.getByText("復元中...")).toBeDisabled();
  });
});
```

---

## 6. 完了条件

- [ ] `VersionHistory`コンポーネントが実装済み
- [ ] `VersionDetail`コンポーネントが実装済み
- [ ] `ConversionLogs`コンポーネントが実装済み
- [ ] `RestoreDialog`コンポーネントが実装済み
- [ ] `useVersionHistory`フックが実装済み
- [ ] `useConversionLogs`フックが実装済み
- [ ] 履歴一覧表示が動作する
- [ ] ページネーションが動作する
- [ ] バージョン詳細表示が動作する
- [ ] 復元操作が動作する（確認ダイアログ付き）
- [ ] ログ一覧表示が動作する
- [ ] ログのフィルタリングが動作する
- [ ] 全テストがパス
- [ ] TypeScript型エラーなし
- [ ] ESLint警告なし
- [ ] アクセシビリティ対応（キーボード操作、ARIA属性）

---

## 7. 次のタスク

- CONV-06-01: チャンキング戦略実装

---

## 8. 参照情報

- CONV-05-01: ログ記録サービス
- CONV-05-02: 履歴取得サービス
- CONV-05: 履歴/ログ管理（親タスク）

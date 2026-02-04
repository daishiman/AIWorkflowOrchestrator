# Phase 2: IPC統合設計書

## メタ情報

| 項目      | 値                     |
| --------- | ---------------------- |
| Phase     | 2                      |
| 機能名    | search-replace-ui      |
| タスクID  | task-imp-search-ui-001 |
| 関連Issue | #366                   |
| 作成日    | 2026-02-04             |

## 概要

WorkspaceSearchPanelとMain ProcessのSearchEngine間のIPC通信設計。

## 現状分析

### 現在の実装（プレースホルダー）

`WorkspaceSearchPanel.tsx`内:

```typescript
// デフォルト検索関数 - 実際にはIPC経由で呼び出す
async function* defaultSearchProvider(
  _workspacePath: string,
  _query: string,
  _options: SearchProviderOptions,
): AsyncGenerator<FileSearchResult> {
  // This will be replaced with actual IPC call
  yield* [];
}
```

### 課題

1. IPC経由でのストリーミング検索が未実装
2. Main ProcessのSearchEngineとの接続が未完了
3. エラーハンドリングのIPC対応が必要

## IPC チャンネル設計

### チャンネル定義

| チャンネル                | 方向          | 用途                     |
| ------------------------- | ------------- | ------------------------ |
| `search:workspace`        | Renderer→Main | 検索リクエスト送信       |
| `search:workspace:result` | Main→Renderer | 検索結果ストリーミング   |
| `search:workspace:done`   | Main→Renderer | 検索完了通知             |
| `search:workspace:error`  | Main→Renderer | エラー通知               |
| `search:workspace:cancel` | Renderer→Main | 検索キャンセルリクエスト |

### リクエストスキーマ

```typescript
// Renderer → Main
interface WorkspaceSearchRequest {
  requestId: string; // ユニークID（キャンセル用）
  workspacePath: string; // 検索対象ディレクトリ
  query: string; // 検索クエリ
  options: {
    caseSensitive: boolean; // 大文字小文字区別
    regex: boolean; // 正規表現モード
    wholeWord: boolean; // 単語単位マッチ
    includePattern?: string; // ファイルパターン（例: *.ts）
    excludePattern?: string; // 除外パターン（例: node_modules）
    maxResults?: number; // 最大結果数（デフォルト: 1000）
  };
}
```

### レスポンススキーマ

```typescript
// Main → Renderer（ストリーミング）
interface WorkspaceSearchResult {
  requestId: string;
  type: "result" | "done" | "error";
  data?: FileSearchResult;
  summary?: {
    totalFiles: number;
    totalMatches: number;
    searchDuration: number; // ms
  };
  error?: {
    code: "INVALID_PATTERN" | "TIMEOUT" | "PATH_TRAVERSAL" | "FILE_READ_ERROR";
    message: string;
  };
}

interface FileSearchResult {
  filePath: string;
  matches: SearchMatch[];
}

interface SearchMatch {
  line: number;
  column: number;
  length: number;
  lineText: string;
  context?: {
    before: string[];
    after: string[];
  };
}
```

## アーキテクチャ

### シーケンス図

```
Renderer (WorkspaceSearchPanel)          Main Process (SearchService)
         |                                        |
         |  search:workspace (request)            |
         |--------------------------------------->|
         |                                        |  検索開始
         |                                        |
         |  search:workspace:result (file1)       |
         |<---------------------------------------|  ファイル1の結果
         |                                        |
         |  search:workspace:result (file2)       |
         |<---------------------------------------|  ファイル2の結果
         |                                        |
         |  ...                                   |
         |                                        |
         |  search:workspace:done (summary)       |
         |<---------------------------------------|  検索完了
         |                                        |
```

### キャンセルフロー

```
Renderer                                  Main Process
         |                                        |
         |  search:workspace (request)            |
         |--------------------------------------->|
         |                                        |
         |  search:workspace:result               |
         |<---------------------------------------|
         |                                        |
         |  search:workspace:cancel               |
         |--------------------------------------->|  検索中断
         |                                        |
         |  (no more results)                     |
         |                                        |
```

## Preload API 設計

### contextBridge 経由のAPI

```typescript
// preload/index.ts
const searchApi = {
  // ワークスペース検索
  searchWorkspace: (
    request: WorkspaceSearchRequest,
    callbacks: {
      onResult: (result: FileSearchResult) => void;
      onDone: (summary: SearchSummary) => void;
      onError: (error: SearchError) => void;
    },
  ) => {
    // IPCリスナー登録
    const handleResult = (_: unknown, data: WorkspaceSearchResult) => {
      if (data.requestId !== request.requestId) return;
      if (data.type === "result" && data.data) {
        callbacks.onResult(data.data);
      } else if (data.type === "done" && data.summary) {
        callbacks.onDone(data.summary);
        cleanup();
      } else if (data.type === "error" && data.error) {
        callbacks.onError(data.error);
        cleanup();
      }
    };

    ipcRenderer.on("search:workspace:result", handleResult);
    ipcRenderer.send("search:workspace", request);

    const cleanup = () => {
      ipcRenderer.removeListener("search:workspace:result", handleResult);
    };

    // キャンセル関数を返す
    return () => {
      ipcRenderer.send("search:workspace:cancel", {
        requestId: request.requestId,
      });
      cleanup();
    };
  },
};

contextBridge.exposeInMainWorld("searchApi", searchApi);
```

## Main Process 実装設計

### IPCハンドラー

```typescript
// main/ipc/searchHandlers.ts
import { ipcMain, BrowserWindow } from "electron";
import { WorkspaceSearchEngine } from "../services/WorkspaceSearchEngine";

const activeSearches = new Map<string, AbortController>();

ipcMain.on(
  "search:workspace",
  async (event, request: WorkspaceSearchRequest) => {
    const { requestId, workspacePath, query, options } = request;

    // 既存の検索をキャンセル
    const existing = activeSearches.get(requestId);
    if (existing) {
      existing.abort();
    }

    const abortController = new AbortController();
    activeSearches.set(requestId, abortController);

    try {
      // セキュリティチェック: パストラバーサル防止
      const normalizedPath = path.normalize(workspacePath);
      if (!isPathWithinWorkspace(normalizedPath)) {
        throw { code: "PATH_TRAVERSAL", message: "Invalid workspace path" };
      }

      // 検索実行
      for await (const result of WorkspaceSearchEngine.search(
        normalizedPath,
        query,
        options,
        abortController.signal,
      )) {
        if (abortController.signal.aborted) break;

        event.sender.send("search:workspace:result", {
          requestId,
          type: "result",
          data: result,
        });
      }

      // 完了通知
      event.sender.send("search:workspace:result", {
        requestId,
        type: "done",
        summary: {
          /* ... */
        },
      });
    } catch (error) {
      event.sender.send("search:workspace:result", {
        requestId,
        type: "error",
        error: formatSearchError(error),
      });
    } finally {
      activeSearches.delete(requestId);
    }
  },
);

ipcMain.on("search:workspace:cancel", (event, { requestId }) => {
  const controller = activeSearches.get(requestId);
  if (controller) {
    controller.abort();
    activeSearches.delete(requestId);
  }
});
```

## セキュリティ考慮

### ReDoS対策

```typescript
function validateRegexPattern(pattern: string): void {
  // 後方参照の検出
  if (/\\[1-9]/.test(pattern)) {
    throw { code: "INVALID_PATTERN", message: "後方参照は使用できません" };
  }

  // ネスト量指定子の検出
  if (/\([^)]*[+*][^)]*\)[+*]/.test(pattern)) {
    throw { code: "INVALID_PATTERN", message: "危険なパターンです" };
  }

  // タイムアウト付きで検証
  const testRegex = () => new RegExp(pattern);
  const result = runWithTimeout(testRegex, 1000);
  if (!result.success) {
    throw {
      code: "INVALID_PATTERN",
      message: "正規表現の検証がタイムアウトしました",
    };
  }
}
```

### パストラバーサル防止

```typescript
function isPathWithinWorkspace(
  targetPath: string,
  workspacePath: string,
): boolean {
  const normalizedTarget = path.normalize(path.resolve(targetPath));
  const normalizedWorkspace = path.normalize(path.resolve(workspacePath));

  return (
    normalizedTarget.startsWith(normalizedWorkspace + path.sep) ||
    normalizedTarget === normalizedWorkspace
  );
}
```

## エラーハンドリング

| エラーコード    | 原因                            | ユーザー表示                             |
| --------------- | ------------------------------- | ---------------------------------------- |
| INVALID_PATTERN | 正規表現が無効またはReDoSリスク | 「無効な正規表現です」                   |
| TIMEOUT         | 検索が5秒以内に完了しない       | 「検索がタイムアウトしました」           |
| PATH_TRAVERSAL  | ワークスペース外アクセス        | 「無効なパスです」                       |
| FILE_READ_ERROR | ファイル読み取りエラー          | 「一部のファイルを読み取れませんでした」 |

## 統合ポイント

| 統合ポイント        | コンポーネント        | 契約                                 |
| ------------------- | --------------------- | ------------------------------------ |
| Renderer → Preload  | WorkspaceSearchPanel  | `window.searchApi.searchWorkspace()` |
| Preload → Main IPC  | preload/index.ts      | `search:workspace` チャンネル        |
| Main → SearchEngine | searchHandlers.ts     | `WorkspaceSearchEngine.search()`     |
| SearchEngine → FS   | WorkspaceSearchEngine | `fs.readFile()`, `glob`              |

# Phase 12 実装ガイド

## Part 1

### なぜ必要か

Workspace 04C は、「ファイルを選んだらその場で読む」「目的のファイルをすぐ探す」を 1 画面で終わらせるために必要だった。チャット中心の 04A だけでは、選択したファイルの中身を毎回別ビューへ見に行く必要があり、作業の流れが切れやすい。そこで 04C では preview と quick search を追加し、読解の往復回数を減らした。

### たとえば

図書室で本を探すときに、棚の一覧だけあって中身を開けないと不便である。逆に、本の中身だけ見えても、どの棚に何があるか分からないと探しにくい。今回の `WorkspaceView` は「棚一覧」「作業机」「開いた本」の 3 つを 1 画面に並べ、さらに「本の名前で一気に探す」小さな検索窓を足したイメージである。

### 何をしたか

1. `PreviewPanel` を追加し、`コード表示` と `プレビュー` を切り替えられるようにした。
2. `QuickFileSearch` を追加し、Cmd/Ctrl+P で 10 件まで候補を絞り込めるようにした。
3. HTML は sanitize + CSP + sandbox、`file:read` は timeout + retry を入れて、安全側へ倒した。
4. current build から screenshot を 11 件撮り、手動検証と文書同期まで同一ターンで完了した。

## Part 2

### 実装境界

| 層               | ファイル                                                                       | 役割                                        |
| ---------------- | ------------------------------------------------------------------------------ | ------------------------------------------- |
| Renderer view    | `apps/desktop/src/renderer/views/WorkspaceView/index.tsx`                      | file read / watch / preview / search の統合 |
| Renderer UI      | `apps/desktop/src/renderer/views/WorkspaceView/components/PreviewPanel/*`      | preview renderer 群                         |
| Renderer UI      | `apps/desktop/src/renderer/views/WorkspaceView/components/QuickFileSearch.tsx` | dialog / listbox / focus trap               |
| Renderer hook    | `apps/desktop/src/renderer/views/WorkspaceView/hooks/useQuickFileSearch.ts`    | scoring / keyboard / open-close             |
| Renderer hook    | `apps/desktop/src/renderer/views/WorkspaceView/hooks/useFileWatcher.ts`        | watch guard / debounce                      |
| Phase 11 harness | `apps/desktop/scripts/capture-task-059b-phase11-screenshots.mjs`               | current build static serve + capture        |

### 型定義

```ts
export interface QuickFileSearchResult {
  path: string;
  fileName: string;
  relativePath: string;
  score: number;
}

export interface UseQuickFileSearchArgs {
  filePaths: string[];
  onSelectFile: (path: string) => void;
  maxResults?: number;
}

export type PreviewMode = "source" | "preview";
```

### API シグネチャ

```ts
function buildSearchResults(
  filePaths: string[],
  query: string,
  maxResults: number,
): QuickFileSearchResult[];

async function readFileWithTimeout(filePath: string): Promise<{
  success: boolean;
  data?: {
    content: string;
    metadata: {
      size: number;
      lastModified: Date;
      encoding: string;
    };
  };
  error?: string;
}>;
```

### 使用例

```ts
const quickSearch = useQuickFileSearch({
  filePaths: allFilePaths,
  onSelectFile: (path) => {
    void handleSelectFile(path);
    if (!layout.isPreviewOpen) {
      layout.togglePreviewPanel();
    }
  },
});

<QuickFileSearch
  isOpen={quickSearch.isOpen}
  query={quickSearch.query}
  results={quickSearch.results}
  selectedIndex={quickSearch.selectedIndex}
  onClose={quickSearch.close}
  onQueryChange={quickSearch.setQuery}
  onHighlight={quickSearch.highlightResult}
  onSubmit={quickSearch.selectResult}
  onKeyDown={quickSearch.handleKeyDown}
/>;
```

### エラーハンドリング

| ケース                  | 実装                                         |
| ----------------------- | -------------------------------------------- |
| `file:read` reject      | status bar / preview alert に surfacing      |
| timeout                 | 5 秒で reject、1 秒間隔 3 回 retry           |
| JSON/YAML parse failure | alert banner を出して SourceView へ fallback |
| render crash            | `PreviewErrorBoundary` で reset 導線を表示   |

### エッジケース

| ケース            | 対応                                  |
| ----------------- | ------------------------------------- |
| query 不一致      | 0 件を返し、誤って全件候補化しない    |
| 同 score 候補     | `path.localeCompare()` で安定順にする |
| image content     | `data:` URL と base64 の両方を許容    |
| no preview 拡張子 | Preview tab を disabled に固定        |

### 設定と定数

| 項目                       | 値      |
| -------------------------- | ------- |
| `FILE_READ_TIMEOUT_MS`     | `5000`  |
| `FILE_READ_RETRY_DELAY_MS` | `1000`  |
| `FILE_READ_MAX_RETRIES`    | `3`     |
| `maxResults`               | `10`    |
| modal width                | `480px` |
| modal radius               | `12px`  |

### テストと検証

| 種別                | 結果                            |
| ------------------- | ------------------------------- |
| task-scope tests    | 52 PASS                         |
| coverage            | `89.47 / 79.43 / 93.87 / 89.47` |
| typecheck           | PASS                            |
| build               | PASS                            |
| Phase 11 screenshot | 11 件取得                       |

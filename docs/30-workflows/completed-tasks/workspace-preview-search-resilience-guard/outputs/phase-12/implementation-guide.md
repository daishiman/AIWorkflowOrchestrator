# Phase 12 Output: Implementation Guide

## Part 1: なぜ必要かと何をするか

このガードが必要なのは、Workspace の quick search と preview が「少し壊れた入力」や「遅い file read」に弱いままだと、UI 全体は生きていても操作感だけが急に不安定になるからです。特に `TASK-UI-04C-WORKSPACE-PREVIEW` で出た 3 つの難所、つまり no-match の扱い、renderer 側 timeout/retry、parse failure と transport failure の混線は、同じ View 内で毎回その場しのぎに直すと再発します。

たとえば教室の本棚で本を探す場面を考えると分かりやすいです。探した本が見つからないときは「棚が空なのか」「探し方が悪いのか」を分けて伝えないと次の行動が決まりません。さらに、司書に本を取りに行ってもらう処理が遅いときは、棚そのものを壊れた扱いにするのではなく、「少し待ったが取れなかったので再試行した」と分けて扱う方が自然です。

この機能でやることは 2 つです。1 つ目は `quickFileSearchResilience.ts` に fuzzy ranking と empty state 判定を寄せ、`QuickFileSearch` を表示責務へ戻すことです。2 つ目は `previewResilience.ts` に timeout/retry と typed taxonomy を寄せ、`PreviewPanel` / `PreviewErrorBoundary` が「どの種類の失敗か」を描画だけで判断できるようにすることです。

## Part 2: 実装者向け詳細

### 対象ファイル

- `apps/desktop/src/renderer/views/WorkspaceView/utils/quickFileSearchResilience.ts`
- `apps/desktop/src/renderer/views/WorkspaceView/utils/previewResilience.ts`
- `apps/desktop/src/renderer/views/WorkspaceView/hooks/useQuickFileSearch.ts`
- `apps/desktop/src/renderer/views/WorkspaceView/components/QuickFileSearch.tsx`
- `apps/desktop/src/renderer/views/WorkspaceView/components/PreviewPanel/PreviewPanel.tsx`
- `apps/desktop/src/renderer/views/WorkspaceView/components/PreviewPanel/PreviewErrorBoundary.tsx`
- `apps/desktop/src/renderer/views/WorkspaceView/index.tsx`

### 主要な型

```ts
export interface QuickFileSearchResult {
  path: string;
  fileName: string;
  relativePath: string;
  score: number;
}

export interface QuickFileSearchViewState {
  kind: "idle" | "results" | "no-match";
  liveRegionText: string;
  emptyMessage: string;
}

export interface PreviewSurfaceError {
  category: "transport" | "parse" | "crash" | "no-match";
  code:
    | "file-api-unavailable"
    | "file-read-timeout"
    | "file-read-failure"
    | "structured-preview-parse"
    | "preview-render-crash"
    | "quick-search-no-match";
  summary: string;
  detail: string;
  retryable: boolean;
  attempts?: number;
  timeoutMs?: number;
}

export type PreviewReadResult =
  | { success: true; data: { content: string; size: number } }
  | { success: false; error: PreviewSurfaceError };
```

### APIシグネチャ

- `scoreFilePath(filePath: string, query: string): number`
- `buildSearchResults(filePaths: string[], query: string, maxResults: number): QuickFileSearchResult[]`
- `resolveQuickFileSearchViewState(query: string, resultCount: number): QuickFileSearchViewState`
- `readPreviewFileWithResilience(options: { filePath: string; readFile: FileReadFn; timeoutMs?: number; retryDelayMs?: number; maxRetries?: number; wait?: (ms: number) => Promise<void>; }): Promise<PreviewReadResult>`
- `createStructuredPreviewParseError(message: string): PreviewSurfaceError`
- `createPreviewRenderCrashError(message: string): PreviewSurfaceError`
- `getPreviewErrorHeading(error: PreviewSurfaceError): string`
- `formatPreviewStatusText(error: PreviewSurfaceError): string`

### 依存関係

- `useQuickFileSearch()` は `buildSearchResults()` を使って top 10 の候補と keyboard selection を管理する
- `QuickFileSearch.tsx` は `resolveQuickFileSearchViewState()` を使って idle / no-match / results の表示文言を切り替える
- `WorkspaceView` は file selection のたびに local state を reset した上で `readPreviewFileWithResilience()` を呼ぶ
- `PreviewPanel` と `PreviewErrorBoundary` は `PreviewSurfaceError` の category / code を見て heading と detail を描画する

### 使用例

```ts
import {
  buildSearchResults,
  resolveQuickFileSearchViewState,
} from "./utils/quickFileSearchResilience";
import { readPreviewFileWithResilience } from "./utils/previewResilience";

const results = buildSearchResults(filePaths, query, 10);
const viewState = resolveQuickFileSearchViewState(query, results.length);

const previewResult = await readPreviewFileWithResilience({
  filePath,
  readFile: window.electronAPI.file.read,
});

if (previewResult.success) {
  setSelectedFileContent(previewResult.data.content);
} else {
  setSelectedFileError(previewResult.error);
}
```

### エラーハンドリング

- `transport`: `file.read` が使えない、timeout、read failure をここへ集約する
- `parse`: JSON / YAML の整形失敗。fatal にせず source fallback を維持する
- `crash`: preview render 中の React error。`PreviewErrorBoundary` で reset 可能にする
- `no-match`: quick search の zero result を transport error と混ぜない
- `getPreviewErrorHeading()` で UI 見出しを統一し、status bar では `formatPreviewStatusText()` を使って summary と detail を 1 行化する

### エッジケース

- query が空文字や空白だけなら `scoreFilePath()` は `0` を返し、dialog は idle state を表示する
- 同点スコアは `path.localeCompare()` で stable sort して順序揺れを防ぐ
- `file.read` が失敗レスポンスを返しても throw しても、最終的には `PreviewSurfaceError` に正規化する
- JSON/YAML の parse 失敗時も preview panel 全体は落とさず、alert と source view を同時に残す
- file 切替時は stale content を見せないため、`content`、`size`、`extension`、`error` を先に reset してから read helper を実行する

### 設定と定数

| 定数                       | 値        | 意味                    |
| -------------------------- | --------- | ----------------------- |
| `FILE_READ_TIMEOUT_MS`     | `5000`    | 1回の read を待つ上限   |
| `FILE_READ_RETRY_DELAY_MS` | `1000`    | retry 間隔              |
| `FILE_READ_MAX_RETRIES`    | `3`       | retry 回数              |
| `maxResults`               | 既定 `10` | quick search の表示上限 |

### テスト観点

- `quickFileSearchResilience.test.ts`: score gate、stable sort、view state
- `previewResilience.test.ts`: timeout、retry、error normalization
- `useQuickFileSearch.test.ts`: keyboard navigation、selection、close reset
- `QuickFileSearch.test.tsx`: empty state helper text、結果表示
- `PreviewPanel.test.tsx`: taxonomy alert、structured fallback、retry action
- `PreviewErrorBoundary.test.tsx`: crash reset
- `WorkspaceView.test.tsx`: selection と preview refresh の統合

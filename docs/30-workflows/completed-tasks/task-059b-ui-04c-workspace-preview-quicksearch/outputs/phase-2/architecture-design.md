# Phase 2 アーキテクチャ設計

## 構成図

```text
WorkspaceView
├─ FileBrowserPanel (04A)
├─ Chat area (04A/04B boundary)
├─ PreviewPanel
│  ├─ PreviewToolbar
│  ├─ SourceView
│  ├─ HtmlPreview
│  ├─ MarkdownPreview
│  ├─ StructuredPreview
│  ├─ ImagePreview
│  └─ PreviewErrorBoundary
└─ QuickFileSearch
   └─ useQuickFileSearch
```

## データフロー

1. FileBrowser または QuickSearch で `selectedFilePath` を更新する
2. `WorkspaceView` が `file:read` を timeout / retry 付きで実行する
3. content / size / extension を local state に保持する
4. `PreviewPanel` が extension に応じて Source / Preview を切り替える
5. `useFileWatcher` が `file:changed` を 300ms debounce し、再読込を起動する

## 設計判断

- 読み込み責務は `WorkspaceView` に集約し、Preview component は描画専用に寄せた
- QuickSearch は pure function `buildSearchResults()` と hook state を分離した
- preview 失敗時は full crash にせず、ErrorBoundary または alert で局所復帰させる

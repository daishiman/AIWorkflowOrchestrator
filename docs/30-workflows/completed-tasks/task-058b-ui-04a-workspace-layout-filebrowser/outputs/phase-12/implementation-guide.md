# 実装ガイド

## Part 1: 中学生向けの説明

### なぜ必要か

この変更は、机の上に本を広げるときの並べ方を整えるのと同じです。真ん中にノートを置いて、必要なときだけ左に資料、右に見本を置けるようにすると、作業しやすくなります。

前の `WorkspaceView` は「ここに何か入る予定です」という仮の箱でした。これだと、どのファイルを見ているのか、あとで何をつなぐのかが分かりにくく、次の開発も進めにくい状態でした。

### 何を作ったか

- 真ん中の作業エリアを主役にした
- 左にファイル一覧を開けるようにした
- 右にプレビューを開けるようにした
- 画面が広いときは3つを同時に見られるようにした
- 選んだファイルが変わったら、自動で見直す仕組みを付けた

### たとえ話

図書館の自習机を想像すると分かりやすいです。

- 真ん中: 今まさに書いているノート
- 左: 取り出した参考書の目次
- 右: 参考書の開いているページ

机が狭いときは参考書を片方だけ開き、机が広いときだけ両方を開く。それを画面でやっているイメージです。

## Part 2: 技術者向けの説明

### 実装の中心

| 要素                 | 役割                                             |
| -------------------- | ------------------------------------------------ |
| `WorkspaceView`      | store selector と preload API を束ねる container |
| `WorkspaceShell`     | inline / overlay / status bar のレイアウト       |
| `useWorkspaceLayout` | breakpoint、persist、overlay close、panel width  |
| `usePanelResize`     | drag / keyboard / reset、preview reverse drag    |
| `useFileWatcher`     | watch start / stop / `file:changed` debounce     |
| `fileHandlers.ts`    | Main の watch lifecycle 実装                     |
| `renderer/main.tsx`  | `?phase11Harness=workspace-layout` 専用 harness  |

### 型 / 契約

```ts
export type WorkspaceLayoutMode =
  | "chat-only"
  | "chat+files"
  | "chat+preview"
  | "3-pane";

export interface WorkspacePanelSizes {
  filePanelWidth: number;
  previewPanelWidth: number;
}

export interface UseFileWatcherArgs {
  filePath: string | null;
  enabled: boolean;
  onFileChanged: (filePath: string) => Promise<void> | void;
}
```

### IPC シグネチャ

```ts
window.electronAPI.file.watchStart({ watchPath: string })
window.electronAPI.file.watchStop(watchId: string)
window.electronAPI.file.onChanged((event) => {
  // { watchId, eventType, filePath, timestamp }
})
```

### 使用例

```ts
const { watchState, watchError } = useFileWatcher({
  filePath: selectedFilePath,
  enabled: Boolean(selectedFilePath),
  onFileChanged: refreshSelectedFile,
});
```

### 設定項目

| 定数                                                       | 値            |
| ---------------------------------------------------------- | ------------- |
| `WORKSPACE_MOBILE_BREAKPOINT`                              | `1024`        |
| `WORKSPACE_THREE_PANE_BREAKPOINT`                          | `1440`        |
| `MIN_FILE_PANEL_WIDTH` / `MAX_FILE_PANEL_WIDTH`            | `180` / `400` |
| `MIN_PREVIEW_PANEL_WIDTH` / `MAX_PREVIEW_PANEL_WIDTH`      | `280` / `560` |
| `DEFAULT_FILE_PANEL_WIDTH` / `DEFAULT_PREVIEW_PANEL_WIDTH` | `260` / `360` |

### エラーハンドリング

| ケース                 | 振る舞い                                                    |
| ---------------------- | ----------------------------------------------------------- |
| `file.read` 失敗       | `selectedFileError` を status bar / body に反映             |
| `watchStart` 失敗      | `watchError` を status bar に反映                           |
| 壊れた persist 値      | default layout / width にフォールバック                     |
| callback identity 変更 | `useFileWatcher` は `ref` 更新だけ行い watch を再作成しない |

### エッジケース

- preview panel は右側なので resize 計算を reverse にする。
- mobile / tablet は overlay または single sidebar に落とす。
- current worktree screenshot は `out/renderer` の static 配信を優先する。

### 検証コマンド

```bash
cd apps/desktop
pnpm exec vitest run \
  src/renderer/views/WorkspaceView/PanelToggleBar.test.tsx \
  src/renderer/views/WorkspaceView/WorkspaceStatusBar.test.tsx \
  src/renderer/views/WorkspaceView/FileBrowserPanel.test.tsx \
  src/renderer/views/WorkspaceView/FileTreeNode.test.tsx \
  src/renderer/views/WorkspaceView/FileContextMenu.test.tsx \
  src/renderer/views/WorkspaceView/PanelResizeHandle.test.tsx \
  src/renderer/views/WorkspaceView/WorkspaceShell.test.tsx \
  src/renderer/views/WorkspaceView/WorkspaceView.test.tsx \
  src/renderer/views/WorkspaceView/hooks/useWorkspaceLayout.test.ts \
  src/renderer/views/WorkspaceView/hooks/usePanelResize.test.ts \
  src/renderer/views/WorkspaceView/hooks/useFileWatcher.test.ts \
  src/main/ipc/fileHandlers.test.ts
pnpm exec tsc --noEmit
pnpm exec eslint src/renderer/views/WorkspaceView src/main/ipc/fileHandlers.ts src/main/ipc/fileHandlers.test.ts
cd ../..
pnpm build
node apps/desktop/scripts/capture-task-058b-workspace-layout-phase11.mjs
```

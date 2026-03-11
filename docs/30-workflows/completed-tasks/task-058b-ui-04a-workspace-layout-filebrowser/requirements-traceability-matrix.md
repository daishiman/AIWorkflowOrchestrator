# 要件トレーサビリティマトリクス

| 要件ID | 元仕様の根拠                                      | 実装対象                                  | 主担当 Phase   | 参照する正本仕様                                               |
| ------ | ------------------------------------------------- | ----------------------------------------- | -------------- | -------------------------------------------------------------- |
| FR-01  | 1 ペイン起点の chat-only レイアウト               | `WorkspaceView`, `useWorkspaceLayout`     | 1, 2, 5, 11    | `ui-ux-feature-components.md`, `ui-ux-navigation.md`           |
| FR-02  | 上部トグルバーで file / preview を開閉            | `PanelToggleBar`                          | 1, 2, 4, 5     | `ui-ux-components.md`, `ui-ux-design-principles.md`            |
| FR-03  | 1440px 以上で 3-pane                              | `useWorkspaceLayout`, `PanelResizeHandle` | 1, 2, 4, 5, 6  | `ui-ux-design-principles.md`, `arch-state-management.md`       |
| FR-04  | `workspaceSlice` 既存資産の再利用                 | `WorkspaceView`, `useStore` selectors     | 1, 2, 5, 9     | `arch-state-management.md`                                     |
| FR-05  | `fileSelectionSlice` 既存資産の再利用             | ファイル添付連携                          | 1, 2, 5, 6     | `arch-state-management.md`, `ui-ux-feature-components.md`      |
| FR-06  | ファイルツリー表示とキーボード操作                | `FileBrowserPanel`, `FileTreeNode`        | 1, 2, 4, 5, 11 | `ui-ux-feature-components.md`, `testing-component-patterns.md` |
| FR-07  | `WorkspaceStatusBar` にファイル情報表示           | `WorkspaceStatusBar`                      | 1, 2, 4, 5     | `ui-ux-components.md`                                          |
| FR-08  | `file:watch-start` / `file:watch-stop` を使う監視 | `useFileWatcher`                          | 1, 2, 5, 6, 9  | `task-workflow.md`, `security-electron-ipc.md`                 |
| FR-09  | P5 二重登録防止                                   | `useFileWatcher` とテスト補助関数         | 1, 2, 4, 5, 6  | `task-workflow.md`, `lessons-learned.md`                       |
| FR-10  | Phase 11 の preview preflight                     | 手動検証手順                              | 2, 11, 12      | `task-workflow.md`, `lessons-learned.md`                       |
| NFR-01 | WCAG 2.1 AA                                       | tree / toggle / status bar ARIA           | 1, 2, 3, 5, 11 | `ui-ux-components.md`, `testing-component-patterns.md`         |
| NFR-02 | P31 対策                                          | 個別セレクタのみ使用                      | 1, 2, 3, 5, 6  | `arch-state-management.md`                                     |
| NFR-03 | P39 / P40 対策                                    | `fireEvent`, `cd apps/desktop`            | 1, 4, 6, 7     | `testing-component-patterns.md`                                |

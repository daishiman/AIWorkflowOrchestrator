# 要件定義書: TASK-WCE-WORKSPACE-001

## 概要

workspace-chat-edit機能において、ワークスペースパスの取得とファイル一覧の取得が仮実装のままになっている問題を解決する。

## 機能要件（FR）

| ID    | 要件                                                                 | 優先度 | 検証方法           |
| ----- | -------------------------------------------------------------------- | ------ | ------------------ |
| FR-01 | Main Processで現在のワークスペースパスを取得できること               | 高     | ユニットテスト     |
| FR-02 | Renderer ProcessでWorkspaceのファイル一覧を取得できること            | 高     | ユニットテスト     |
| FR-03 | ワークスペース外のファイルへのアクセスが拒否されること               | 高     | セキュリティテスト |
| FR-04 | ワークスペースが未設定の場合、適切なデフォルト値またはnullを返すこと | 中     | ユニットテスト     |

## 非機能要件（NFR）

| ID     | 要件                                                      | 優先度 | 検証方法             |
| ------ | --------------------------------------------------------- | ------ | -------------------- |
| NFR-01 | ワークスペースパス取得は同期的に行えること（10ms以内）    | 高     | パフォーマンステスト |
| NFR-02 | ファイル一覧取得はWorkspace Sliceの状態を即時反映すること | 高     | 統合テスト           |
| NFR-03 | 既存のchat-edit APIとの互換性を維持すること               | 高     | 既存テスト維持       |

## 現状分析

### TODO箇所

1. **chatEditHandlers.ts:77**

   ```typescript
   const getWorkspacePath = (): string | null => {
     // TODO: 実際のワークスペース管理から取得
     return process.cwd();
   };
   ```

2. **useFileContext.ts:96-97**
   ```typescript
   // workspaceSliceからファイル一覧を取得
   // TODO: Workspace型にopenFilesプロパティを追加するか、別の方法でファイル一覧を取得する
   const openFiles: Array<{ path: string; name?: string }> = [];
   ```

### 利用可能なデータソース

- `workspaceSlice.workspace.folders`: FolderEntry配列（id, path, displayName等）
- `workspaceSlice.folderFileTrees`: Map<FolderId, FileNode[]>

## 設計方針

### 方式A: Renderer経由でworkspacePathを取得（採用）

Main ProcessはRendererからのIPC呼び出し時に`workspacePath`を引数として受け取る方式。

**理由**:

- Main ProcessはRenderer Processの状態（Zustand Store）に直接アクセス不可
- 既存のIPCパターンと整合性が取れる
- workspaceSliceは既にRenderer側で管理されている

## 作成日

2026-02-02

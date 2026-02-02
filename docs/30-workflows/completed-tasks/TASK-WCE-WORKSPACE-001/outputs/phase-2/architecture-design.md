# アーキテクチャ設計書: TASK-WCE-WORKSPACE-001

## 連携方式

### 方式A: Renderer経由でWorkspace情報を取得（採用）

Main ProcessはRenderer ProcessからのIPC呼び出し時に`workspacePath`を引数として受け取る方式。

```
Renderer Process                    Main Process
     │                                   │
     │  chat-edit:read-file              │
     │  { filePath, workspacePath }      │
     ├──────────────────────────────────>│
     │                                   │ workspacePathでアクセス検証
     │  FileReadResult                   │
     │<──────────────────────────────────┤
```

**採用理由**:

- Main ProcessはRenderer Processの状態（Zustand Store）に直接アクセス不可
- 既存のIPCパターンと整合性が取れる
- workspaceSliceは既にRenderer側で管理されている

## コンポーネント設計

### 1. chatEditHandlers.ts修正

**修正箇所**:

- `handleReadFile`: workspacePathパラメータ追加
- `handleWriteFile`: workspacePathパラメータ追加
- `getWorkspacePath()`: 引数ベースに変更

```typescript
// Before
const handleReadFile = async (
  _event: IpcMainInvokeEvent,
  filePath: string,
): Promise<FileReadResult> => { ... }

// After
const handleReadFile = async (
  _event: IpcMainInvokeEvent,
  filePath: string,
  workspacePath?: string | null,
): Promise<FileReadResult> => { ... }
```

### 2. useFileContext.ts修正

**修正箇所**:

- `getAvailableFiles()`: folderFileTreesからファイル抽出
- `attachFile()`: workspacePathを取得してIPCに渡す

```
useFileContext Hook
     │
     ├─ useStore(state => state.workspace)
     ├─ useStore(state => state.folderFileTrees)
     │
     └─ getAvailableFiles()
           │
           └─ folderFileTreesからファイルパス一覧を抽出
                 └─ extractFilesFromTree()で再帰的に収集
```

### 3. fileTreeUtils.ts新規作成

| 関数名               | 引数                             | 戻り値                           | 説明                           |
| -------------------- | -------------------------------- | -------------------------------- | ------------------------------ |
| extractFilesFromTree | nodes: FileNode[]                | { path: string; name: string }[] | ツリーからファイル一覧を抽出   |
| flattenFileTrees     | trees: Map<FolderId, FileNode[]> | { path: string; name: string }[] | 複数ツリーを統合してフラット化 |
| isFileNode           | node: FileNode                   | boolean                          | ファイルノードかどうか判定     |

## データフロー

```
┌─────────────────────────────────────────────────────────────────┐
│                     Renderer Process                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐     ┌─────────────────────────────────┐   │
│  │  workspaceSlice  │────>│  useFileContext                 │   │
│  │  - workspace     │     │  - getAvailableFiles()          │   │
│  │  - folderFileTrees│    │  - attachFile(filePath)         │   │
│  └──────────────────┘     └─────────────────────────────────┘   │
│                                     │                            │
│                                     │ workspacePath =            │
│                                     │   workspace.folders[0]?.path│
│                                     ▼                            │
│                           ┌─────────────────────────────────┐   │
│                           │  chatEditAPI.readFile()         │   │
│                           │  (filePath, workspacePath)      │   │
│                           └─────────────────────────────────┘   │
└─────────────────────────────────────│───────────────────────────┘
                                      │ IPC
                                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Main Process                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  chatEditHandlers                                         │   │
│  │  - handleReadFile(event, filePath, workspacePath)         │   │
│  │  - isWithinWorkspace(filePath, workspacePath)             │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 型定義変更

### 拡張（後方互換性維持）

```typescript
// ChatEditAPI（Preload）
interface ChatEditAPI {
  readFile: (
    filePath: string,
    workspacePath?: string | null,
  ) => Promise<FileReadResult>;
  writeFile: (
    filePath: string,
    content: string,
    workspacePath?: string | null,
    options?: FileWriteOptions,
  ) => Promise<FileWriteResult>;
}
```

## セキュリティ考慮

| 項目                  | 対応                               |
| --------------------- | ---------------------------------- |
| パストラバーサル防止  | 既存の`hasPathTraversal()`を維持   |
| ワークスペース外制限  | workspacePath指定時のみ検証を実施  |
| workspacePath未指定時 | 検証をスキップ（後方互換性のため） |
| 不正なworkspacePath   | path.resolve()で正規化して比較     |

## 作成日

2026-02-02

# 実装ガイド: TASK-WCE-WORKSPACE-001

## Part 1: 概念的説明（中学生でもわかる版）

### なぜ必要か

パソコンで作業するとき、私たちはフォルダを使ってファイルを整理します。例えば、「宿題」フォルダの中に数学や国語のファイルを入れるように。

AIも同じように、「どのフォルダで作業するか」を知る必要があります。これを「ワークスペース」と呼びます。

### 日常の例え

学校の先生が「教室の外のものには触らないでね」と言うのと同じです。

- **ワークスペース** = 教室
- **ワークスペース内のファイル** = 教室の中にあるもの
- **ワークスペース外のファイル** = 教室の外にあるもの（触ってはいけない）

### 何ができるか

この機能により：

1. AIは指定されたフォルダ内のファイルだけを読み書きできます
2. 間違って大切なファイルを変更してしまうことを防げます
3. 複数のフォルダを追加して、それぞれのファイルを見られます

---

## Part 2: 技術的詳細（開発者向け）

### アーキテクチャ

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

### インターフェース

#### FileReadRequest（拡張）

```typescript
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

#### FileInfo（新規）

```typescript
interface FileInfo {
  path: string; // ファイルの絶対パス
  name: string; // ファイル名
}
```

### API仕様

#### chat-edit:read-file

| パラメータ    | 型             | 必須 | 説明                         |
| ------------- | -------------- | ---- | ---------------------------- |
| filePath      | string         | Yes  | 読み込むファイルの絶対パス   |
| workspacePath | string \| null | No   | ワークスペースパス（検証用） |

#### chat-edit:write-file

| パラメータ    | 型               | 必須 | 説明                         |
| ------------- | ---------------- | ---- | ---------------------------- |
| filePath      | string           | Yes  | 書き込むファイルの絶対パス   |
| content       | string           | Yes  | 書き込む内容                 |
| workspacePath | string \| null   | No   | ワークスペースパス（検証用） |
| options       | FileWriteOptions | No   | 書き込みオプション           |

### ユーティリティ関数

#### extractFilesFromTree

FileNodeツリーからファイル一覧を再帰的に抽出します。

```typescript
function extractFilesFromTree(nodes: FileNode[]): FileInfo[];
```

#### flattenFileTrees

複数のファイルツリー（Map）を統合してフラットな配列に変換します。

```typescript
function flattenFileTrees(trees: Map<FolderId, FileNode[]>): FileInfo[];
```

#### isFileNode

ノードがファイルかどうかを判定します。

```typescript
function isFileNode(node: FileNode): boolean;
```

### エラーハンドリング

#### PERMISSION_DENIED

ワークスペース外のファイルにアクセスしようとした場合：

```typescript
{
  success: false,
  error: {
    code: "PERMISSION_DENIED",
    message: "Access outside workspace is not allowed"
  }
}
```

### 後方互換性

- `workspacePath`が未指定（null/undefined/空文字）の場合、検証をスキップ
- 既存のAPI呼び出しは引数追加なしで動作継続
- レスポンス形式は変更なし

### 使用例

```typescript
// Renderer Process
const { getAvailableFiles, attachFile } = useFileContext();

// ワークスペース内のファイル一覧を取得
const files = getAvailableFiles();
console.log(files); // [{ path: "/workspace/src/index.ts", name: "index.ts" }, ...]

// ファイルを添付（workspacePathは自動的に取得される）
await attachFile("/workspace/src/index.ts");
```

## 作成日

2026-02-02

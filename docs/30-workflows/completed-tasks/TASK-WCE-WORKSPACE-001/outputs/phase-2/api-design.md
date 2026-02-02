# API設計書: TASK-WCE-WORKSPACE-001

## IPC API変更

### chat-edit:read-file

**Before**:

```typescript
ipcMain.handle('chat-edit:read-file', async (event, filePath: string))
```

**After**:

```typescript
ipcMain.handle('chat-edit:read-file', async (
  event,
  filePath: string,
  workspacePath?: string | null
))
```

| パラメータ    | 型             | 必須 | 説明                         |
| ------------- | -------------- | ---- | ---------------------------- |
| filePath      | string         | Yes  | 読み込むファイルの絶対パス   |
| workspacePath | string \| null | No   | ワークスペースパス（検証用） |

### chat-edit:write-file

**Before**:

```typescript
ipcMain.handle('chat-edit:write-file', async (
  event,
  filePath: string,
  content: string,
  options?: FileWriteOptions
))
```

**After**:

```typescript
ipcMain.handle('chat-edit:write-file', async (
  event,
  filePath: string,
  content: string,
  workspacePath?: string | null,
  options?: FileWriteOptions
))
```

| パラメータ    | 型               | 必須 | 説明                         |
| ------------- | ---------------- | ---- | ---------------------------- |
| filePath      | string           | Yes  | 書き込むファイルの絶対パス   |
| content       | string           | Yes  | 書き込む内容                 |
| workspacePath | string \| null   | No   | ワークスペースパス（検証用） |
| options       | FileWriteOptions | No   | 書き込みオプション           |

## Preload API変更

### chatEditAPI

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

  // 変更なし
  detectLanguage: (filePath: string) => Promise<string>;
  getEditorSelection: () => Promise<TextSelection | null>;
}
```

## ユーティリティ関数

### extractFilesFromTree

```typescript
/**
 * FileNodeツリーからファイル一覧を抽出
 * @param nodes FileNodeの配列
 * @returns ファイル情報の配列
 */
function extractFilesFromTree(
  nodes: FileNode[],
): Array<{ path: string; name: string }>;
```

### flattenFileTrees

```typescript
/**
 * 複数のファイルツリーを統合してフラット化
 * @param trees FolderIdをキーとするファイルツリーのMap
 * @returns 全ファイル情報の配列
 */
function flattenFileTrees(
  trees: Map<FolderId, FileNode[]>,
): Array<{ path: string; name: string }>;
```

### isFileNode

```typescript
/**
 * ノードがファイルかどうかを判定
 * @param node FileNode
 * @returns ファイルの場合true
 */
function isFileNode(node: FileNode): boolean;
```

## エラーレスポンス

### PERMISSION_DENIED（ワークスペース外アクセス）

```typescript
{
  success: false,
  error: {
    code: "PERMISSION_DENIED",
    message: "Access outside workspace is not allowed"
  }
}
```

## 後方互換性

| 項目                  | 対応                         |
| --------------------- | ---------------------------- |
| workspacePath未指定時 | 検証をスキップし従来通り動作 |
| 既存のAPI呼び出し     | 引数追加なしで動作継続       |
| レスポンス形式        | 変更なし                     |

## 作成日

2026-02-02

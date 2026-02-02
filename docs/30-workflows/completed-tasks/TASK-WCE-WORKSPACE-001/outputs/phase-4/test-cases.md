# テストケース詳細: TASK-WCE-WORKSPACE-001

## chatEditHandlers テストケース

### TC-CH-001: workspacePathが指定された場合のファイル読み込み

- **前提条件**: ワークスペースパス内にテストファイルが存在
- **入力**: filePath=/workspace/test.ts, workspacePath=/workspace
- **期待結果**: success=true, ファイル内容が返される
- **検証ポイント**: isWithinWorkspace()が呼ばれている

### TC-CH-002: workspacePathがnullの場合

- **前提条件**: ファイルが存在
- **入力**: filePath=/any/path/test.ts, workspacePath=null
- **期待結果**: success=true（検証スキップ）
- **検証ポイント**: isWithinWorkspace()が呼ばれていない

### TC-CH-003: ワークスペース外アクセス

- **前提条件**: workspacePathが指定されている
- **入力**: filePath=/outside/test.ts, workspacePath=/workspace
- **期待結果**: success=false, error.code=PERMISSION_DENIED
- **検証ポイント**: ファイル読み込みが実行されていない

## useFileContext テストケース

### TC-UFC-001: 空のfolderFileTrees

- **前提条件**: folderFileTreesが空Map
- **入力**: getAvailableFiles()呼び出し
- **期待結果**: 空配列が返される

### TC-UFC-002: 単一フォルダ

- **前提条件**: 1フォルダに3ファイル
- **入力**: getAvailableFiles()呼び出し
- **期待結果**: 3件のファイル情報が返される

### TC-UFC-003: 複数フォルダ

- **前提条件**: 2フォルダに計5ファイル
- **入力**: getAvailableFiles()呼び出し
- **期待結果**: 5件のファイル情報が返される

## fileTreeUtils テストケース

### TC-FTU-001: extractFilesFromTree空配列

- **入力**: extractFilesFromTree([])
- **期待結果**: []

### TC-FTU-002: ファイルのみ

- **入力**: [{type:"file", path:"/a.ts", name:"a.ts"}]
- **期待結果**: [{path:"/a.ts", name:"a.ts"}]

### TC-FTU-003: ネストされたディレクトリ

- **入力**:
  ```
  [{type:"folder", children:[
    {type:"file", path:"/src/a.ts"},
    {type:"folder", children:[{type:"file", path:"/src/lib/b.ts"}]}
  ]}]
  ```
- **期待結果**: [{path:"/src/a.ts",...}, {path:"/src/lib/b.ts",...}]

## 作成日

2026-02-02

# 統合テスト設計: TASK-WCE-WORKSPACE-001

## 統合テストシナリオ

### シナリオ1: API接続テスト

| No  | テスト名                      | 検証内容                               |
| --- | ----------------------------- | -------------------------------------- |
| 1   | workspacePathありでread-file  | IPCリクエストにworkspacePathが含まれる |
| 2   | workspacePathなしでread-file  | 後方互換性維持、正常動作               |
| 3   | workspacePathありでwrite-file | IPCリクエストにworkspacePathが含まれる |

### シナリオ2: データフローテスト

| No  | テスト名                             | 検証内容                                        |
| --- | ------------------------------------ | ----------------------------------------------- |
| 1   | Workspace Slice更新→ファイル一覧更新 | フォルダ追加後、getAvailableFiles()が更新される |
| 2   | フォルダ削除→ファイル一覧更新        | フォルダ削除後、該当ファイルが一覧から消える    |

### シナリオ3: エラーハンドリングテスト

| No  | テスト名              | 検証内容                               |
| --- | --------------------- | -------------------------------------- |
| 1   | PERMISSION_DENIED表示 | ワークスペース外アクセス時のエラー表示 |
| 2   | ファイル未検出エラー  | FILE_NOT_FOUND時のエラー表示           |

## 統合ポイント

```
Renderer Process
     │
     ├─ workspaceSlice (Zustand)
     │       │
     │       └─ folderFileTrees
     │               │
     └─ useFileContext ◄────────┘
             │
             ├─ getAvailableFiles() ← folderFileTrees参照
             │
             └─ attachFile()
                     │
                     └─ chatEditAPI.readFile(filePath, workspacePath)
                             │
                             └─ IPC → Main Process
                                       │
                                       └─ chatEditHandlers
                                               │
                                               └─ isWithinWorkspace(filePath, workspacePath)
```

## テスト環境

| 項目       | 設定           |
| ---------- | -------------- |
| テストFW   | Vitest         |
| モック     | vi.mock, vi.fn |
| 非同期処理 | async/await    |

## 作成日

2026-02-02

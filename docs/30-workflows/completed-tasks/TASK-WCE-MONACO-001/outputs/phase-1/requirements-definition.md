# 要件定義書 - TASK-WCE-MONACO-001

## メタ情報

| 項目   | 値                  |
| ------ | ------------------- |
| Phase  | 1                   |
| 機能名 | TASK-WCE-MONACO-001 |
| 作成日 | 2026-02-03          |
| 更新日 | 2026-02-03          |

## 機能要件（FR）

| FR-ID | 要件                                             | 優先度 | 対象ファイル                                           |
| ----- | ------------------------------------------------ | ------ | ------------------------------------------------------ |
| FR-1  | エディタの選択範囲を取得できる                   | 必須   | `editorSelection.ts`, `chatEditHandlers.ts`            |
| FR-2  | 選択範囲がない場合はnullを返す                   | 必須   | `editorSelection.ts`, `chatEditHandlers.ts`            |
| FR-3  | TextSelection型で構造化データを返す              | 必須   | `types/index.ts`（既存）                               |
| FR-4  | IPC経由でMain Processに情報を送信できる          | 必須   | `chatEditApi.ts`, `chatEditHandlers.ts`                |
| FR-5  | chatEditHandlersがIPCに登録されている            | 必須   | `main/ipc/index.ts`                                    |
| FR-6  | Renderer側でMonaco Editor選択範囲を取得できる    | 必須   | `editorSelection.ts`（新規）                           |
| FR-7  | Main ProcessからRenderer側に選択範囲を問い合わせ | 必須   | `chatEditHandlers.ts`（webContents.executeJavaScript） |

## 非機能要件（NFR）

| NFR-ID | 要件                          | 優先度 | 検証方法             |
| ------ | ----------------------------- | ------ | -------------------- |
| NFR-1  | IPC通信レイテンシ 100ms以下   | 推奨   | パフォーマンス計測   |
| NFR-2  | TypeScript strict mode準拠    | 必須   | `pnpm typecheck`     |
| NFR-3  | テストカバレッジ Line 80%以上 | 必須   | `pnpm test:coverage` |
| NFR-4  | Electron contextIsolation準拠 | 必須   | セキュリティレビュー |
| NFR-5  | validateIpcSender()による検証 | 必須   | セキュリティレビュー |
| NFR-6  | ESLint/Prettierエラー0件      | 必須   | `pnpm lint`          |

## 調査結果

### 現在の実装状況

| 項目                    | 状況                                          |
| ----------------------- | --------------------------------------------- |
| IPCチャンネル定義       | ✅ `CHAT_EDIT_GET_SELECTION`定義済み          |
| ALLOWED_INVOKE_CHANNELS | ✅ 追加済み                                   |
| Preload API定義         | ✅ `chatEditAPI.getEditorSelection()`定義済み |
| Main Processハンドラー  | ⚠️ 未実装（nullを返す仮実装）                 |
| IPCハンドラー登録       | ❌ `registerAllIpcHandlers()`に未登録         |
| Renderer選択範囲取得    | ❌ 未実装                                     |
| TextSelection型         | ✅ 定義済み                                   |

### 重複実装の問題

2つの`chatEditHandlers.ts`が存在：

1. `apps/desktop/src/main/handlers/chatEditHandlers.ts`
   - 古い実装（L331-333にTODOあり）
   - 単純な構造

2. `apps/desktop/src/main/ipc/chatEditHandlers.ts`
   - 新しい構造化された実装
   - validateIpcSender()使用
   - ChatEditService, FileService依存

**結論**: `ipc/chatEditHandlers.ts`を使用し、依存関係を整備して登録する

## 接続要件（IPC/データフロー）

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Monaco Editor │    │    Preload      │    │  Main Process   │
│   (Renderer)    │    │  (contextBridge)│    │                 │
└────────┬────────┘    └────────┬────────┘    └────────┬────────┘
         │                      │                      │
         │ getEditorSelection() │                      │
         ├─────────────────────►│                      │
         │                      │ ipcRenderer.invoke() │
         │                      ├─────────────────────►│
         │                      │                      │ handleGetSelection()
         │                      │                      ├─────┐
         │                      │                      │     │ webContents.executeJavaScript
         │◄─────────────────────┤◄─────────────────────┤◄────┘
         │   TextSelection      │                      │
```

| 接続ポイント  | 詳細                                                |
| ------------- | --------------------------------------------------- |
| IPCチャンネル | `chat-edit:get-selection`                           |
| データフロー  | Renderer(Monaco) → Preload → Main → Renderer → Main |
| 型契約        | `TextSelection \| null`                             |

## アーキテクチャ層別要件

| 層                         | 要件                                                        |
| -------------------------- | ----------------------------------------------------------- |
| フロントエンド（Renderer） | Monaco Editorインスタンスへのアクセス、選択範囲取得         |
| バックエンド（Main）       | handleGetSelection実装、webContents経由でRenderer問い合わせ |
| IPC通信                    | chat-edit:get-selectionチャンネル                           |
| Preload                    | chatEditAPI.getEditorSelection()（既存）                    |
| セキュリティ               | validateIpcSender()、contextBridge経由のみ                  |

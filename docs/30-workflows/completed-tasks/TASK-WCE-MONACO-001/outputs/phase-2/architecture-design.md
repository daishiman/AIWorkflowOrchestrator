# アーキテクチャ設計書 - TASK-WCE-MONACO-001

## メタ情報

| 項目   | 値                  |
| ------ | ------------------- |
| Phase  | 2                   |
| 機能名 | TASK-WCE-MONACO-001 |
| 作成日 | 2026-02-03          |
| 更新日 | 2026-02-03          |

## アーキテクチャ概要

### 選択パターン: Renderer側選択範囲保持 + IPC問い合わせ方式

**理由**:

- Monaco Editorインスタンスへの直接アクセスはRenderer Process側でのみ可能
- Main Processからは`webContents.executeJavaScript`でRenderer側の関数を呼び出す
- contextBridge制約（Serializableデータのみ）を満たすため、プレーンオブジェクトで送信

### システム構成図

```
┌──────────────────────────────────────────────────────────────────────┐
│                         Renderer Process                              │
├──────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────────────────────────────┐  │
│  │  Monaco Editor  │───►│ editorSelection.ts                      │  │
│  │  (DiffEditor)   │    │ - setActiveEditor(editor)               │  │
│  └─────────────────┘    │ - getEditorSelection(): TextSelection   │  │
│                         └──────────────────┬──────────────────────┘  │
│                                            │                          │
│                                            ▼                          │
│                         ┌─────────────────────────────────────────┐  │
│                         │ window.__editorSelection                 │  │
│                         │ - グローバル公開されたユーティリティ      │  │
│                         └─────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
                                     │
                                     │ executeJavaScript
                                     ▼
┌──────────────────────────────────────────────────────────────────────┐
│                           Main Process                                │
├──────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ chatEditHandlers.ts                                              │ │
│  │ - handleGetSelection()                                           │ │
│  │   1. validateIpcSender()で送信元検証                              │ │
│  │   2. BrowserWindow.getFocusedWindow()                            │ │
│  │   3. webContents.executeJavaScript()でRenderer側呼び出し         │ │
│  │   4. TextSelection | null を返却                                 │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                     │                                 │
│                                     │ ipcMain.handle                  │
│                                     ▼                                 │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ index.ts                                                         │ │
│  │ - registerAllIpcHandlers()                                       │ │
│  │   - registerChatEditHandlers() ← 新規追加                        │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
                                     │
                                     │ ipcRenderer.invoke
                                     ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         Preload Process                               │
├──────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ chatEditApi.ts                                                   │ │
│  │ - chatEditAPI.getEditorSelection()                               │ │
│  │   → ipcRenderer.invoke('chat-edit:get-selection')                │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

## コンポーネント設計

### 1. editorSelection.ts（新規作成）

**場所**: `apps/desktop/src/renderer/utils/editorSelection.ts`

**責務**:

- Monaco Editorインスタンスの参照管理
- 選択範囲をTextSelection型に変換
- グローバル公開（window.\_\_editorSelection）

```typescript
interface EditorSelectionUtils {
  setActiveEditor: (editor: monaco.editor.IStandaloneCodeEditor | null) => void;
  getActiveEditor: () => monaco.editor.IStandaloneCodeEditor | null;
  getEditorSelection: () => TextSelection | null;
}
```

### 2. chatEditHandlers.ts（修正）

**場所**: `apps/desktop/src/main/ipc/chatEditHandlers.ts`

**変更内容**:

- handleGetSelection()の実装完成
- webContents.executeJavaScript()でRenderer側関数呼び出し
- エラーハンドリング強化

### 3. index.ts（修正）

**場所**: `apps/desktop/src/main/ipc/index.ts`

**変更内容**:

- registerChatEditHandlers()の呼び出し追加
- 依存サービス（ChatEditService, FileService）のインスタンス化

## セキュリティ設計

### IPC通信セキュリティ

| セキュリティ項目     | 対策                                |
| -------------------- | ----------------------------------- |
| 送信元検証           | validateIpcSender()でウィンドウ検証 |
| チャンネル許可リスト | ALLOWED_INVOKE_CHANNELSに登録済み   |
| contextIsolation     | contextBridge経由のみでAPI公開      |
| 入力検証             | 返却値のnullチェック、型検証        |

### エラーハンドリング

| エラーケース        | 対応                                |
| ------------------- | ----------------------------------- |
| エディタ未初期化    | null返却                            |
| 選択範囲なし        | null返却                            |
| webContents失敗     | try-catchでnull返却、エラーログ出力 |
| BrowserWindow未取得 | null返却                            |

## 依存関係

### 新規依存

| 依存元              | 依存先          | 種類     |
| ------------------- | --------------- | -------- |
| chatEditHandlers.ts | BrowserWindow   | Electron |
| editorSelection.ts  | monaco.editor   | Monaco   |
| index.ts            | ChatEditService | Service  |
| index.ts            | FileService     | Service  |

### 既存依存（変更なし）

| コンポーネント | 依存                     |
| -------------- | ------------------------ |
| chatEditApi.ts | ipcRenderer, channels.ts |
| types/index.ts | なし（型定義のみ）       |

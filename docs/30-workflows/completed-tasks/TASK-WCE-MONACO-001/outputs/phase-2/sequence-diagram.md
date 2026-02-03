# シーケンス図 - TASK-WCE-MONACO-001

## メタ情報

| 項目   | 値                  |
| ------ | ------------------- |
| Phase  | 2                   |
| 機能名 | TASK-WCE-MONACO-001 |
| 作成日 | 2026-02-03          |
| 更新日 | 2026-02-03          |

## 正常系シーケンス

### 選択範囲取得フロー

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant Monaco as Monaco Editor
    participant EditorUtil as editorSelection.ts
    participant Preload as chatEditApi.ts
    participant Main as chatEditHandlers.ts
    participant Window as BrowserWindow

    Note over User, Window: 1. エディタ初期化時
    Monaco->>EditorUtil: setActiveEditor(editor)
    EditorUtil->>EditorUtil: activeEditor = editor
    EditorUtil->>EditorUtil: window.__editorSelection に公開

    Note over User, Window: 2. ユーザーがテキストを選択
    User->>Monaco: テキスト選択

    Note over User, Window: 3. 選択範囲取得リクエスト
    Preload->>Main: ipcRenderer.invoke('chat-edit:get-selection')
    Main->>Main: validateIpcSender(event)
    Main->>Window: BrowserWindow.getFocusedWindow()
    Window-->>Main: focusedWindow
    Main->>EditorUtil: webContents.executeJavaScript()
    EditorUtil->>Monaco: editor.getSelection()
    Monaco-->>EditorUtil: Selection
    EditorUtil->>Monaco: editor.getModel()
    Monaco-->>EditorUtil: ITextModel
    EditorUtil->>EditorUtil: model.getValueInRange(selection)
    EditorUtil-->>Main: TextSelection
    Main-->>Preload: { success: true, data: TextSelection }
```

### 詳細フロー（文字列形式）

```
1. エディタ初期化時
   Monaco Editor → editorSelection.ts: setActiveEditor(editor)
   editorSelection.ts: activeEditor に保存
   editorSelection.ts: window.__editorSelection に公開

2. ユーザーがテキストを選択
   ユーザー → Monaco Editor: テキストをドラッグ選択

3. 選択範囲取得リクエスト
   呼び出し元 → chatEditApi.ts: getEditorSelection()
   chatEditApi.ts → Main Process: ipcRenderer.invoke('chat-edit:get-selection')

4. Main Process処理
   chatEditHandlers.ts: validateIpcSender(event) で検証
   chatEditHandlers.ts → BrowserWindow: getFocusedWindow()
   BrowserWindow → chatEditHandlers.ts: focusedWindow

5. Renderer側への問い合わせ
   chatEditHandlers.ts → webContents: executeJavaScript(...)
   webContents → editorSelection.ts: getEditorSelection()

6. Monaco API呼び出し
   editorSelection.ts → Monaco: editor.getSelection()
   Monaco → editorSelection.ts: Selection { startLineNumber, endLineNumber, ... }
   editorSelection.ts → Monaco: editor.getModel().getValueInRange(selection)
   Monaco → editorSelection.ts: selectedText

7. レスポンス返却
   editorSelection.ts → chatEditHandlers.ts: TextSelection
   chatEditHandlers.ts → chatEditApi.ts: { success: true, data: TextSelection }
   chatEditApi.ts → 呼び出し元: TextSelection
```

## 異常系シーケンス

### エディタ未初期化

```mermaid
sequenceDiagram
    participant Preload as chatEditApi.ts
    participant Main as chatEditHandlers.ts
    participant Window as BrowserWindow
    participant EditorUtil as editorSelection.ts

    Preload->>Main: ipcRenderer.invoke('chat-edit:get-selection')
    Main->>Main: validateIpcSender(event)
    Main->>Window: BrowserWindow.getFocusedWindow()
    Window-->>Main: focusedWindow
    Main->>EditorUtil: webContents.executeJavaScript()
    EditorUtil->>EditorUtil: activeEditor === null
    EditorUtil-->>Main: null
    Main-->>Preload: { success: true, data: null }
```

### 選択範囲なし（カーソルのみ）

```mermaid
sequenceDiagram
    participant Monaco as Monaco Editor
    participant EditorUtil as editorSelection.ts
    participant Main as chatEditHandlers.ts

    Main->>EditorUtil: webContents.executeJavaScript()
    EditorUtil->>Monaco: editor.getSelection()
    Monaco-->>EditorUtil: Selection { startLineNumber === endLineNumber, startColumn === endColumn }
    EditorUtil->>EditorUtil: selection.isEmpty() === true
    EditorUtil-->>Main: null
    Main-->>Preload: { success: true, data: null }
```

### BrowserWindow未取得

```mermaid
sequenceDiagram
    participant Preload as chatEditApi.ts
    participant Main as chatEditHandlers.ts
    participant Window as BrowserWindow

    Preload->>Main: ipcRenderer.invoke('chat-edit:get-selection')
    Main->>Main: validateIpcSender(event)
    Main->>Window: BrowserWindow.getFocusedWindow()
    Window-->>Main: null
    Main-->>Preload: { success: true, data: null }
```

### executeJavaScript失敗

```mermaid
sequenceDiagram
    participant Preload as chatEditApi.ts
    participant Main as chatEditHandlers.ts
    participant Window as BrowserWindow

    Preload->>Main: ipcRenderer.invoke('chat-edit:get-selection')
    Main->>Main: validateIpcSender(event)
    Main->>Window: BrowserWindow.getFocusedWindow()
    Window-->>Main: focusedWindow
    Main->>Window: webContents.executeJavaScript()
    Window-->>Main: Error thrown
    Main->>Main: catch(error) → console.error
    Main-->>Preload: { success: true, data: null }
```

## 状態遷移

### エディタ状態

```
[未初期化] --setActiveEditor(editor)--> [アクティブ]
[アクティブ] --setActiveEditor(null)--> [未初期化]
[アクティブ] --editor破棄--> [未初期化]
```

### 選択状態

```
[選択なし] --ユーザー選択--> [選択あり]
[選択あり] --ユーザークリック--> [選択なし]
[選択あり] --別位置クリック--> [選択なし]
```

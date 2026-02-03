# API設計書 - TASK-WCE-MONACO-001

## メタ情報

| 項目   | 値                  |
| ------ | ------------------- |
| Phase  | 2                   |
| 機能名 | TASK-WCE-MONACO-001 |
| 作成日 | 2026-02-03          |
| 更新日 | 2026-02-03          |

## IPCチャンネル定義

### chat-edit:get-selection

| 項目         | 内容                                             |
| ------------ | ------------------------------------------------ |
| チャンネル名 | `chat-edit:get-selection`                        |
| 方向         | Renderer → Main                                  |
| リクエスト   | なし（引数なし）                                 |
| レスポンス   | `{ success: true, data: TextSelection \| null }` |
| エラー       | IPC検証エラー時は例外スロー                      |

### 既存チャンネル（参考）

| チャンネル名                  | 状態     |
| ----------------------------- | -------- |
| `chat-edit:read-file`         | 実装済み |
| `chat-edit:write-file`        | 実装済み |
| `chat-edit:send-with-context` | 実装済み |

## 型定義

### TextSelection（既存・変更なし）

```typescript
/**
 * テキスト選択範囲
 * @file apps/desktop/src/renderer/features/workspace-chat-edit/types/index.ts
 */
export interface TextSelection {
  /** 開始行（1始まり） */
  startLine: number;
  /** 開始列（1始まり） */
  startColumn: number;
  /** 終了行（1始まり） */
  endLine: number;
  /** 終了列（1始まり） */
  endColumn: number;
  /** 選択されたテキスト */
  selectedText: string;
}
```

### GetSelectionResponse（新規）

```typescript
/**
 * chat-edit:get-selection レスポンス型
 */
export interface GetSelectionResponse {
  success: true;
  data: TextSelection | null;
}
```

## Preload API

### ChatEditAPI.getEditorSelection()（既存・変更なし）

```typescript
/**
 * エディタの選択範囲を取得
 * @returns 選択範囲（選択なしの場合はnull）
 */
getEditorSelection: () => Promise<TextSelection | null>;
```

**実装**:

```typescript
getEditorSelection: (): Promise<TextSelection | null> => {
  return ipcRenderer.invoke(CHANNELS.GET_SELECTION);
};
```

## Renderer API

### EditorSelectionUtils（新規）

```typescript
/**
 * Monaco Editor選択範囲取得ユーティリティ
 * @file apps/desktop/src/renderer/utils/editorSelection.ts
 */

/**
 * アクティブエディタを設定
 * @param editor Monaco Editorインスタンス（nullで解除）
 */
export const setActiveEditor = (
  editor: monaco.editor.IStandaloneCodeEditor | null
): void;

/**
 * アクティブエディタを取得
 * @returns Monaco Editorインスタンス（未設定時はnull）
 */
export const getActiveEditor = (): monaco.editor.IStandaloneCodeEditor | null;

/**
 * エディタの選択範囲を取得
 * @returns TextSelection（選択なし/エディタなしの場合はnull）
 */
export const getEditorSelection = (): TextSelection | null;
```

### グローバル公開

```typescript
/**
 * window.__editorSelection として公開
 * Main ProcessからexecuteJavaScriptで呼び出し可能
 */
declare global {
  interface Window {
    __editorSelection?: {
      getEditorSelection: () => TextSelection | null;
    };
  }
}
```

## Main Process API

### handleGetSelection()

```typescript
/**
 * chat-edit:get-selection ハンドラー
 * @param event IPCイベント
 * @returns GetSelectionResponse
 */
async function handleGetSelection(
  event: IpcMainInvokeEvent,
): Promise<GetSelectionResponse>;
```

**実装フロー**:

1. `validateIpcSender()`で送信元検証
2. `BrowserWindow.getFocusedWindow()`でアクティブウィンドウ取得
3. `webContents.executeJavaScript()`でRenderer側関数呼び出し
4. 結果を`{ success: true, data: selection }`形式で返却

## エラーレスポンス

| エラーケース          | レスポンス                      |
| --------------------- | ------------------------------- |
| 送信元検証失敗        | `throw IPCValidationError`      |
| ウィンドウ未取得      | `{ success: true, data: null }` |
| executeJavaScript失敗 | `{ success: true, data: null }` |
| エディタ未初期化      | `{ success: true, data: null }` |
| 選択範囲なし          | `{ success: true, data: null }` |

## 使用例

### Renderer側での使用

```typescript
// エディタコンポーネント内
import { setActiveEditor } from "../utils/editorSelection";

const onEditorMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
  setActiveEditor(editor);
};

const onEditorDispose = () => {
  setActiveEditor(null);
};
```

### Preload API経由での使用

```typescript
// チャット送信時
const selection = await window.chatEditAPI.getEditorSelection();
if (selection) {
  console.log(
    `選択範囲: ${selection.startLine}:${selection.startColumn} - ${selection.endLine}:${selection.endColumn}`,
  );
  console.log(`選択テキスト: ${selection.selectedText}`);
}
```

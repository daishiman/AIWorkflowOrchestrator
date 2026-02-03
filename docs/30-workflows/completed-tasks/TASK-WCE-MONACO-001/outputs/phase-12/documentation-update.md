# ドキュメント更新 - TASK-WCE-MONACO-001

## メタ情報

| 項目   | 値                  |
| ------ | ------------------- |
| Phase  | 12                  |
| 機能名 | TASK-WCE-MONACO-001 |
| 作成日 | 2026-02-03          |
| 更新日 | 2026-02-03          |

## 更新されたドキュメント

### 技術ドキュメント

| ドキュメント                         | 説明                 |
| ------------------------------------ | -------------------- |
| `phase-1/requirements-definition.md` | 要件定義書           |
| `phase-2/architecture-design.md`     | アーキテクチャ設計書 |
| `phase-2/api-design.md`              | API設計書            |
| `phase-4/test-specification.md`      | テスト仕様書         |
| `phase-5/implementation-summary.md`  | 実装サマリー         |

## API リファレンス

### chatEditAPI.getEditorSelection()

Monaco Editorの現在の選択範囲を取得します。

```typescript
interface TextSelection {
  startLine: number; // 開始行（1始まり）
  startColumn: number; // 開始列（1始まり）
  endLine: number; // 終了行（1始まり）
  endColumn: number; // 終了列（1始まり）
  selectedText: string; // 選択されたテキスト
}

// 戻り値
type GetSelectionResult = {
  success: true;
  data: TextSelection | null;
};

// 使用例
const result = await window.chatEditAPI.getEditorSelection();
if (result.success && result.data) {
  console.log(
    `選択範囲: ${result.data.startLine}行目から${result.data.endLine}行目`,
  );
  console.log(`テキスト: ${result.data.selectedText}`);
}
```

### editorSelection ユーティリティ

Renderer側でMonaco Editorの選択範囲を管理するユーティリティです。

```typescript
import {
  setActiveEditor,
  getActiveEditor,
  getEditorSelection,
} from "@/renderer/utils/editorSelection";

// エディタを設定（Monaco EditorのonDidCreateEditor時）
setActiveEditor(editorInstance);

// エディタを取得
const editor = getActiveEditor();

// 選択範囲を取得
const selection = getEditorSelection();
```

## 使用方法

### 1. Monaco Editorコンポーネントでの統合

```tsx
import { setActiveEditor } from "@/renderer/utils/editorSelection";
import * as monaco from "monaco-editor";

function MonacoEditorComponent() {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount = (
    editor: monaco.editor.IStandaloneCodeEditor,
  ) => {
    editorRef.current = editor;
    setActiveEditor(editor);
  };

  useEffect(() => {
    return () => {
      setActiveEditor(null);
    };
  }, []);

  return (
    <Editor
      onMount={handleEditorDidMount}
      // ... other props
    />
  );
}
```

### 2. チャット機能での選択範囲取得

```tsx
async function handleGetSelection() {
  const result = await window.chatEditAPI.getEditorSelection();

  if (result.success && result.data) {
    // 選択範囲をチャットコンテキストに追加
    addFileContext({
      filePath: currentFilePath,
      content: fileContent,
      selection: result.data,
      language: detectedLanguage,
    });
  }
}
```

## 中学生向け概念説明

### 「エディタの選択範囲取得」ってなに？

**たとえ話で説明すると...**

学校のノートで友達に「ここ見て！」と指さす場面を想像してください。

- あなた = **Monaco Editor**（コードを書く場所）
- 「ここ」の範囲 = **選択範囲**（どこからどこまで）
- 友達 = **Main Process**（アプリの頭脳）

普通なら指さすだけで伝わりますが、コンピュータでは
「何行目の何文字目から何行目の何文字目まで」と
数字で正確に伝える必要があります。

### なぜ2つのプロセスが必要？

**ブラウザ（Renderer）と本体（Main）の関係**

スマホのアプリを想像してください：

- 画面に表示されているもの = **Renderer Process**
- バッテリーやWi-Fiを管理する部分 = **Main Process**

エディタの画面（Renderer）から「ここを選んでるよ！」という
情報を、アプリの頭脳（Main）に伝える仕組みが必要です。
これが**IPC（プロセス間通信）**です。

### どうやって伝えているの？

1. **準備**: エディタが起動したら「私がエディタです」と登録
2. **要求**: Main Processが「今どこ選んでる？」と聞く
3. **応答**: エディタが「5行目の10文字目から8行目の20文字目だよ」と答える

### プログラムで書くと

```javascript
// 1. 準備（エディタ側）
window.__editorSelection = {
  getEditorSelection: () => {
    return {
      startLine: 5, // 5行目から
      startColumn: 10, // 10文字目から
      endLine: 8, // 8行目の
      endColumn: 20, // 20文字目まで
      selectedText: "選んだ文字", // 選んだ内容
    };
  },
};

// 2. 要求と3. 応答（Main側からRenderer側を呼び出し）
const 選択範囲 = await window.chatEditAPI.getEditorSelection();
console.log(選択範囲.data.selectedText); // "選んだ文字"
```

### まとめ

| 概念          | 日常の例え               |
| ------------- | ------------------------ |
| Monaco Editor | ノートの紙面             |
| 選択範囲      | 蛍光ペンで引いた線       |
| Main Process  | 先生（情報をまとめる人） |
| IPC           | 先生に「ここ」と報告     |
| TextSelection | 「何ページの何行目」     |

この仕組みのおかげで、AIにコードの一部分だけを
「ここを直して！」と伝えることができるようになります。

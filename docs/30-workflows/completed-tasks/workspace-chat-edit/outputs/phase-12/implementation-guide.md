# workspace-chat-edit 実装ガイド

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| 機能名     | workspace-chat-edit  |
| バージョン | 1.0.0                |
| 作成日     | 2026-01-23           |
| ステータス | コアロジック実装完了 |

---

# Part 1: 概念的説明（初学者・非技術者向け）

## この機能は何をするの?

**workspace-chat-edit**は、AIアシスタントと一緒にコードを編集できる機能です。

普段プログラミングをしていて、こんな経験はありませんか?

- 「このコードの続きを書いてほしい」
- 「このコードをもっときれいにしてほしい」
- 「このコードのテストを作ってほしい」

この機能を使えば、ファイルをAIアシスタントに渡して、上のようなお願いをすることができます。AIが提案した変更は、すぐにファイルに反映するか、やめるかを選べます。

## どんな場面で役立つ?

### 1. コードの続きを書いてもらう

途中まで書いたコードをAIに渡して「続きを書いて」とお願いすると、AIが残りの部分を考えて提案してくれます。

### 2. コードをきれいにしてもらう

動くけど読みにくいコードを、AIに「リファクタリングして」とお願いすると、より読みやすいコードに書き換えてくれます。

### 3. テストを作ってもらう

作ったコードのテストを、AIに「テストを生成して」とお願いすると、自動でテストコードを作ってくれます。

### 4. コメントを追加してもらう

コードの説明を追加したいとき、「コメントを追加して」とお願いすると、AIが適切な説明を付け加えてくれます。

## 基本的な使い方

### Step 1: ファイルを添付する

編集したいファイルをチャット画面にドラッグ&ドロップするか、添付ボタンをクリックしてファイルを選びます。

### Step 2: お願いを入力する

「続きを書いて」「リファクタリングして」など、やってほしいことを入力して送信します。

### Step 3: 提案を確認する

AIが変更を提案すると、「どこが変わるか」が画面に表示されます。緑の部分が追加される行、赤の部分が削除される行です。

### Step 4: 適用か却下を選ぶ

- **適用**: 提案された変更をファイルに反映します
- **却下**: 提案を破棄して、元のファイルのままにします

## よくある質問

### Q: 一度にいくつのファイルを添付できる?

A: 最大10ファイルまで添付できます。

### Q: 大きなファイルも添付できる?

A: 10MB以下のファイルであれば添付できます。10MBを超えるファイルは、必要な部分だけを選択して添付してください。

### Q: 間違えて適用してしまったら?

A: 適用時に自動でバックアップが作成されるので、元に戻すことができます。

### Q: AIが作った変更は信頼できる?

A: AIの提案は参考として活用してください。重要な変更は、内容を確認してから適用することをおすすめします。

---

# Part 2: 技術的詳細（開発者・技術者向け）

## アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────────────────┐
│                         UI Layer (React)                             │
│  ┌─────────────┐  ┌────────────────┐  ┌───────────────────────────┐ │
│  │ ChatPanel   │  │ DiffPreview    │  │ FileContextBadge          │ │
│  │ (拡張)      │  │ (予定)         │  │ (予定)                    │ │
│  └─────────────┘  └────────────────┘  └───────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│                    Application Layer (Hooks)                         │
│  ┌──────────────────┐  ┌─────────────────┐  ┌────────────────────┐  │
│  │ useFileContext   │  │ useChatWithCtx  │  │ useDiffApply       │  │
│  │ (実装済み)       │  │ (予定)          │  │ (実装済み)         │  │
│  └──────────────────┘  └─────────────────┘  └────────────────────┘  │
├─────────────────────────────────────────────────────────────────────┤
│                      State Layer (Zustand)                           │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ chatEditSlice (実装済み)                                      │   │
│  │ - fileContexts, generatedResults, UI状態                      │   │
│  └──────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────┤
│                   Infrastructure Layer (IPC)                         │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Preload API: window.chatEditAPI (型定義済み)                  │   │
│  │ - readFile, writeFile, getSelection, sendWithContext          │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## ディレクトリ構造

```
apps/desktop/src/renderer/features/workspace-chat-edit/
├── types/
│   └── index.ts           # 型定義（エンティティ、IPC、Store）
├── hooks/
│   ├── index.ts           # エクスポート
│   ├── useFileContext.ts  # ファイルコンテキスト管理
│   └── useDiffApply.ts    # 差分適用ロジック
├── store/
│   ├── index.ts           # エクスポート
│   ├── chatEditSlice.ts   # Zustand Slice
│   └── __tests__/
│       └── chatEditSlice.test.ts
├── __tests__/
│   ├── boundary.test.ts   # 境界値テスト
│   └── integration/
│       ├── dataflow.test.ts
│       ├── error.test.ts
│       ├── ipc.test.ts
│       └── state-sync.test.ts
└── index.ts               # フィーチャーエクスポート
```

## 型定義

### エンティティ

```typescript
// ファイルコンテキスト
interface FileContext {
  id: string; // UUID v4
  filePath: string; // 絶対パス
  fileName: string; // 表示用ファイル名
  content: string; // ファイル内容
  selection?: TextSelection; // 選択範囲（オプション）
  language: string; // プログラミング言語
  addedAt: Date; // 添付日時
  fileSize: number; // バイト数
}

// テキスト選択範囲
interface TextSelection {
  startLine: number; // 開始行（1始まり）
  startColumn: number; // 開始列（1始まり）
  endLine: number; // 終了行（1始まり）
  endColumn: number; // 終了列（1始まり）
  selectedText: string; // 選択テキスト
}

// 編集コマンド
type EditCommandType =
  | "continue"
  | "refactor"
  | "generate-test"
  | "add-comment"
  | "custom";

interface EditCommand {
  type: EditCommandType;
  targetContextId: string;
  instruction?: string;
  options?: EditCommandOptions;
}

// LLM生成結果
interface GeneratedResult {
  id: string;
  contextId: string;
  originalContent: string;
  generatedContent: string;
  diffHunks: DiffHunk[];
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  targetFilePath: string;
  command: EditCommand;
  llmMetadata?: LLMMetadata;
}

// 差分
type DiffHunkType = "add" | "remove" | "modify";

interface DiffHunk {
  type: DiffHunkType;
  originalStartLine: number;
  originalEndLine: number;
  newStartLine: number;
  newEndLine: number;
  originalLines: string[];
  newLines: string[];
}
```

### 定数

```typescript
// 最大ファイルコンテキスト数
const MAX_FILE_CONTEXTS = 10;

// ファイルサイズ上限（10MB）
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// コンテキスト合計サイズ上限（100KB）
const MAX_CONTEXT_SIZE = 100 * 1024;
```

## Zustand Slice

### 状態

```typescript
interface ChatEditState {
  fileContexts: FileContext[]; // 添付ファイル一覧
  activeContextId: string | null; // アクティブなコンテキストID
  generatedResults: GeneratedResult[]; // 生成結果一覧
  currentResultId: string | null; // 現在表示中の結果ID
  isLoading: boolean; // ローディング中
  isDiffPreviewOpen: boolean; // 差分プレビュー表示中
  error: string | null; // エラーメッセージ
  isDragging: boolean; // ドラッグ中
}
```

### アクション

```typescript
interface ChatEditActions {
  // ファイルコンテキスト操作
  addFileContext: (context: Omit<FileContext, "id" | "addedAt">) => void;
  removeFileContext: (id: string) => void;
  clearAllContexts: () => void;
  setActiveContext: (id: string | null) => void;

  // 生成結果操作
  setGeneratedResult: (result: GeneratedResult) => void;
  approveResult: (resultId: string) => Promise<ApplyResult>;
  rejectResult: (resultId: string) => void;
  clearResults: () => void;

  // UI状態操作
  openDiffPreview: (resultId: string) => void;
  closeDiffPreview: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setDragging: (dragging: boolean) => void;
  reset: () => void;
}
```

### 使用例

```typescript
import { useStore } from "@/renderer/store";

// ファイルコンテキストの取得
const fileContexts = useStore((state) => state.chatEdit?.fileContexts ?? []);

// アクションの取得
const addFileContext = useStore((state) => state.chatEdit?.addFileContext);

// ファイル追加
addFileContext?.({
  filePath: "/path/to/file.ts",
  fileName: "file.ts",
  content: "// code here",
  language: "typescript",
  fileSize: 1024,
});
```

## IPC API（型定義のみ・実装予定）

### チャンネル一覧

| チャンネル                    | 方向          | 説明                          |
| ----------------------------- | ------------- | ----------------------------- |
| `chat-edit:read-file`         | Renderer→Main | ファイル読み込み              |
| `chat-edit:write-file`        | Renderer→Main | ファイル書き込み              |
| `chat-edit:get-selection`     | Renderer→Main | エディタ選択範囲取得          |
| `chat-edit:send-with-context` | Renderer→Main | コンテキスト付きLLMリクエスト |

### 型定義

```typescript
// ファイル読み取り結果
interface FileReadResult {
  success: boolean;
  content?: string;
  language?: string;
  fileSize?: number;
  error?: {
    code: "FILE_NOT_FOUND" | "PERMISSION_DENIED" | "READ_ERROR" | "TOO_LARGE";
    message: string;
  };
}

// ファイル書き込み結果
interface FileWriteResult {
  success: boolean;
  backupPath?: string;
  error?: {
    code: "PERMISSION_DENIED" | "WRITE_ERROR" | "INVALID_PATH";
    message: string;
  };
}

// コンテキスト付き送信リクエスト
interface SendWithContextRequest {
  contexts: FileContextInput[];
  command: EditCommand;
  message: string;
  options?: SendOptions;
}

// コンテキスト付き送信レスポンス
interface SendWithContextResponse {
  success: boolean;
  result?: GeneratedResult;
  error?: {
    code:
      | "CONTEXT_TOO_LARGE"
      | "LLM_ERROR"
      | "TIMEOUT"
      | "RATE_LIMIT"
      | "INVALID_COMMAND";
    message: string;
    retryable: boolean;
  };
}
```

## Hooks

### useFileContext

ファイルコンテキストの管理を行うカスタムフック。

```typescript
const {
  fileContexts, // 添付ファイル一覧
  activeContextId, // アクティブなコンテキストID
  isDragging, // ドラッグ中フラグ
  error, // エラーメッセージ
  attachFile, // ファイル添付
  removeFileContext, // コンテキスト削除
  clearAllContexts, // 全クリア
  canAddContext, // 追加可能か
  totalContextSize, // 合計サイズ
} = useFileContext();
```

### useDiffApply

差分計算と適用を行うカスタムフック。

```typescript
const {
  currentResult, // 現在の生成結果
  isLoading, // ローディング中
  isDiffPreviewOpen, // プレビュー表示中
  approveResult, // 適用
  rejectResult, // 却下
  computeDiff, // 差分計算
} = useDiffApply();
```

## テスト

### テスト構成

| ファイル               | テスト数 | 内容                       |
| ---------------------- | -------- | -------------------------- |
| chatEditSlice.test.ts  | 21       | Slice単体テスト            |
| useFileContext.test.ts | 9        | ファイルコンテキストフック |
| useDiffApply.test.ts   | 14       | 差分適用フック             |
| boundary.test.ts       | 24       | 境界値テスト               |
| ipc.test.ts            | 21       | IPC通信モック              |
| state-sync.test.ts     | 11       | 状態同期                   |
| error.test.ts          | 14       | エラーハンドリング         |
| dataflow.test.ts       | 8        | データフロー統合           |
| **合計**               | **122**  |                            |

### テスト実行

```bash
# 全テスト実行
pnpm vitest run apps/desktop/src/renderer/features/workspace-chat-edit

# ウォッチモード
pnpm vitest apps/desktop/src/renderer/features/workspace-chat-edit
```

## 統合パターン

### AppStoreへの統合（予定）

```typescript
// apps/desktop/src/renderer/store/index.ts
import {
  createChatEditSlice,
  ChatEditSlice,
} from "@/renderer/features/workspace-chat-edit";

interface AppStore extends ChatEditSlice {
  // 他のSlice...
}

export const useStore = create<AppStore>()((set, get) => ({
  ...createChatEditSlice(set, get),
  // 他のSlice...
}));
```

### 既存機能との連携

| 連携先         | 連携方法               | 状態       |
| -------------- | ---------------------- | ---------- |
| workspaceSlice | 開いているファイル参照 | 型定義済み |
| chatSlice      | チャット履歴統合       | 型定義済み |
| LLM Adapters   | 既存アダプター経由送信 | 型定義済み |
| Monaco Editor  | Diff Editorとして使用  | 予定       |

## 未実装項目

### UIコンポーネント

- `DiffPreview.tsx` - 差分プレビューパネル
- `DiffEditor.tsx` - Monaco Diff Editor統合
- `ApplyControls.tsx` - 適用/却下ボタン
- `FileContextBadge.tsx` - 添付ファイルバッジ
- `FileContextDropZone.tsx` - D&Dドロップゾーン

### Main Processサービス

- `FileService.ts` - ファイルI/O
- `ChatEditService.ts` - LLM連携
- `chatEditHandlers.ts` - IPCハンドラ
- `chatEditApi.ts` - Preload API

## 関連ドキュメント

- 要件定義: `outputs/phase-1/requirements-definition.md`
- 設計書: `outputs/phase-2/architecture-design.md`
- ドメインモデル: `outputs/phase-2/domain-model.md`
- IPC API設計: `outputs/phase-2/ipc-api-design.md`

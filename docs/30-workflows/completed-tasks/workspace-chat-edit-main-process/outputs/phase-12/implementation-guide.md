# Chat Edit Main Process 実装ガイド

## Part 1: 概念的説明（初学者・非技術者向け）

### チャット編集機能とは？

チャット編集機能は、AIとの対話を通じてコードを編集できる機能です。ファイルの内容をAIに見せて、「続きを書いて」「リファクタリングして」「テストを作って」などの指示を出すと、AIが提案を生成してくれます。

### どのような場面で役立つ？

1. **コードの続きを書きたいとき**
   - 途中まで書いたコードの続きをAIに書いてもらう

2. **コードをきれいにしたいとき**
   - 動くけど読みにくいコードを、整理されたコードに改善

3. **テストを書きたいとき**
   - 関数やクラスに対するテストコードを自動生成

4. **コメントを追加したいとき**
   - 何をしているか分かりにくいコードに説明を追加

### 基本的な使い方

```
1. 編集したいファイルを選択
2. 「続きを書いて」「リファクタリングして」などの指示を入力
3. AIが生成した変更案を確認
4. 良ければ「適用」、気に入らなければ「却下」
```

### よくある質問

**Q: 大きなファイルでも使える？**
A: はい。ただし、10MBを超えるファイルは制限があります。

**Q: 複数のファイルを同時に編集できる？**
A: はい。最大10ファイルまで同時にコンテキストとして添付できます。

**Q: 元に戻せる？**
A: はい。変更を適用する前にプレビューで確認でき、却下すれば元のままです。

---

## Part 2: 技術的詳細（開発者・技術者向け）

### アーキテクチャ概要

```
┌─────────────────┐     IPC      ┌─────────────────┐
│ Renderer Process │◄──────────►│  Main Process   │
│                 │             │                 │
│ - UI Components │             │ - FileService   │
│ - chatEditSlice │             │ - ContextBuilder│
│ - DiffPreview   │             │ - ChatEditService│
└─────────────────┘             └─────────────────┘
                                        │
                                        ▼
                                ┌─────────────────┐
                                │   LLM Provider  │
                                └─────────────────┘
```

### IPC APIリファレンス

#### chat-edit:read-file

ファイルの内容を読み取る。

```typescript
// Request
interface ReadFileRequest {
  filePath: string;
}

// Response
interface FileReadResult {
  success: true;
  content: string;
  language: string;
  fileSize: number;
} | {
  success: false;
  error: FileReadError;
}

// Error codes
type FileReadError = {
  code: 'FILE_NOT_FOUND' | 'TOO_LARGE' | 'PERMISSION_DENIED' | 'INVALID_PATH' | 'UNKNOWN';
  message: string;
};
```

#### chat-edit:write-file

ファイルに内容を書き込む。

```typescript
// Request
interface WriteFileRequest {
  filePath: string;
  content: string;
  options?: {
    createBackup?: boolean;
  };
}

// Response
interface FileWriteResult {
  success: true;
  backupPath?: string;
} | {
  success: false;
  error: FileWriteError;
}
```

#### chat-edit:send-with-context

コンテキスト付きでLLMにリクエストを送信。

```typescript
// Request
interface SendWithContextRequest {
  contexts: FileContextInput[];
  command: EditCommand;
  message: string;
  options?: SendOptions;
}

// FileContextInput
interface FileContextInput {
  filePath: string;
  content: string;
  selection?: TextSelection;
  language: string;
}

// EditCommand
interface EditCommand {
  type: 'continue' | 'refactor' | 'generate-test' | 'add-comment' | 'custom';
  targetContextId: string;
  instruction?: string;  // customの場合に使用
}

// Response
interface SendWithContextResponse {
  success: true;
  result: GeneratedResult;
} | {
  success: false;
  error: SendError;
}

// GeneratedResult
interface GeneratedResult {
  id: string;
  contextId: string;
  originalContent: string;
  generatedContent: string;
  diffHunks: DiffHunk[];
  status: 'pending' | 'applied' | 'rejected';
  createdAt: Date;
  targetFilePath: string;
  command: EditCommand;
}
```

#### chat-edit:get-selection

現在の選択範囲を取得（Renderer側で実装予定）。

```typescript
// Response
interface GetSelectionResult {
  success: true;
  selection: TextSelection | null;
}
```

### サービス構成

#### FileService

ファイルI/O操作を担当。

```typescript
class FileService {
  async readFile(filePath: string): Promise<FileReadResult>;
  async writeFile(
    filePath: string,
    content: string,
    options?: FileWriteOptions,
  ): Promise<FileWriteResult>;
  detectLanguage(filePath: string): string;
  async createBackup(filePath: string): Promise<string>;
}
```

#### ContextBuilder

コンテキスト文字列の構築を担当。

```typescript
class ContextBuilder {
  build(contexts: FileContextInput[]): string;
  calculateSize(contexts: FileContextInput[]): number;
  validateSize(contexts: FileContextInput[]): boolean;
}

// Constants
const MAX_CONTEXT_SIZE = 100 * 1024; // 100KB
```

#### ChatEditService

LLM統合のFacadeサービス。

```typescript
class ChatEditService {
  constructor(llmAdapter: LLMAdapter, contextBuilder: ContextBuilder);
  async sendWithContext(
    request: SendWithContextRequest,
  ): Promise<SendWithContextResponse>;
  buildPrompt(command: EditCommand, context: string): string;
  parseResponse(
    response: string,
    command: EditCommand,
    originalContent: string,
    filePath: string,
  ): GeneratedResult;
}

interface LLMAdapter {
  sendMessage(prompt: string): Promise<{
    success: boolean;
    data?: { message: string };
    error?: { message: string };
  }>;
}
```

### プロンプトテンプレート

```typescript
// prompts.ts
export const EDIT_PROMPTS = {
  continue: {
    template: "以下のコードの続きを書いてください...",
    description: "コードの続きを生成",
  },
  refactor: {
    template: "以下のコードをリファクタリングしてください...",
    description: "リファクタリング",
  },
  "generate-test": {
    template: "以下のコードに対するテストを生成してください...",
    description: "テスト生成",
  },
  "add-comment": {
    template: "以下のコードにコメントを追加してください...",
    description: "コメント追加",
  },
  custom: {
    template: "{instruction}",
    description: "カスタム指示",
  },
};
```

### セキュリティ

#### IPC Sender検証

```typescript
import {
  validateIpcSender,
  toIPCValidationError,
} from "../../utils/ipc-validation";

// 各ハンドラで検証
const validation = validateIpcSender(
  event.sender,
  event.senderFrame,
  "chat-edit:read-file",
);
if (!validation.valid) {
  throw toIPCValidationError(validation);
}
```

#### パストラバーサル防止

```typescript
import { detectTraversal, validateFilePath } from "./utils/PathValidator";

// 使用例
if (detectTraversal(filePath)) {
  throw new Error("Path traversal detected");
}
```

### エラーコード一覧

| コード            | 説明                       | Retryable |
| ----------------- | -------------------------- | --------- |
| FILE_NOT_FOUND    | ファイルが存在しない       | No        |
| TOO_LARGE         | ファイルサイズ超過（10MB） | No        |
| PERMISSION_DENIED | 読み書き権限なし           | No        |
| INVALID_PATH      | 無効なパス                 | No        |
| CONTEXT_TOO_LARGE | コンテキストサイズ超過     | No        |
| INVALID_COMMAND   | 無効なコマンドタイプ       | No        |
| LLM_ERROR         | LLM APIエラー              | Yes       |
| TIMEOUT           | タイムアウト               | Yes       |
| RATE_LIMIT        | レート制限                 | Yes       |

### 使用例

```typescript
// Renderer側での使用例
const result = await window.electron.invoke("chat-edit:send-with-context", {
  contexts: [
    {
      filePath: "/path/to/file.ts",
      content: "const x = 1;",
      language: "typescript",
    },
  ],
  command: {
    type: "refactor",
    targetContextId: "/path/to/file.ts",
  },
  message: "TypeScriptの型を追加してください",
});

if (result.success) {
  console.log("Generated:", result.result.generatedContent);
  console.log("Diff hunks:", result.result.diffHunks);
}
```

### ディレクトリ構成

```
apps/desktop/src/main/services/chat-edit/
├── __tests__/
│   ├── ChatEditService.test.ts
│   ├── ChatEditService.edge.test.ts
│   ├── ContextBuilder.test.ts
│   ├── ContextBuilder.edge.test.ts
│   ├── FileService.test.ts
│   ├── FileService.edge.test.ts
│   └── integration.test.ts
├── utils/
│   ├── PathValidator.ts
│   ├── ErrorMapper.ts
│   └── index.ts
├── ChatEditService.ts
├── ContextBuilder.ts
├── FileService.ts
├── prompts.ts
├── types.ts
└── index.ts
```

---

**作成日**: 2026-01-25
**バージョン**: 1.0.0

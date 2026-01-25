# Workspace Chat Edit Main Process インターフェース設計書

## 概要

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| 作成日     | 2026-01-24                       |
| 対象       | Workspace Chat Edit Main Process |
| 関連Issue  | #469                             |
| 前提Phase  | Phase 1（要件定義）              |
| ステータス | 完了                             |

---

## 1. FileService インターフェース

### 1.1 インターフェース定義

```typescript
// apps/desktop/src/main/services/chat-edit/FileService.ts

import {
  FileReadResult,
  FileWriteResult,
  FileWriteOptions,
} from "@/renderer/features/workspace-chat-edit/types";

export interface IFileService {
  /**
   * ファイル内容を読み取る
   * @param filePath 絶対パス
   * @returns FileReadResult
   * @throws パストラバーサル検出時はエラー
   */
  readFile(filePath: string): Promise<FileReadResult>;

  /**
   * ファイルに内容を書き込む
   * @param filePath 絶対パス
   * @param content 書き込む内容
   * @param options 書き込みオプション
   * @returns FileWriteResult
   */
  writeFile(
    filePath: string,
    content: string,
    options?: FileWriteOptions,
  ): Promise<FileWriteResult>;

  /**
   * ファイルパスから言語を検出
   * @param filePath ファイルパス
   * @returns 言語識別子（例: 'typescript', 'javascript'）
   */
  detectLanguage(filePath: string): string;

  /**
   * ファイルのバックアップを作成
   * @param filePath 元ファイルのパス
   * @returns バックアップファイルのパス
   */
  createBackup(filePath: string): Promise<string>;
}
```

### 1.2 実装クラス

```typescript
// apps/desktop/src/main/services/chat-edit/FileService.ts

import * as fs from "fs/promises";
import * as path from "path";
import { MAX_FILE_SIZE } from "./constants";

export class FileService implements IFileService {
  private readonly maxFileSize: number;

  constructor(maxFileSize: number = MAX_FILE_SIZE) {
    this.maxFileSize = maxFileSize;
  }

  async readFile(filePath: string): Promise<FileReadResult> {
    // パス検証
    const normalizedPath = this.validatePath(filePath);

    try {
      const stats = await fs.stat(normalizedPath);

      // サイズチェック
      if (stats.size > this.maxFileSize) {
        return {
          success: false,
          error: {
            code: "TOO_LARGE",
            message: `File size ${stats.size} exceeds maximum ${this.maxFileSize}`,
          },
        };
      }

      const content = await fs.readFile(normalizedPath, "utf-8");
      const language = this.detectLanguage(normalizedPath);

      return {
        success: true,
        content,
        language,
        fileSize: stats.size,
      };
    } catch (error: unknown) {
      return this.handleReadError(error);
    }
  }

  async writeFile(
    filePath: string,
    content: string,
    options?: FileWriteOptions,
  ): Promise<FileWriteResult> {
    const normalizedPath = this.validatePath(filePath);

    try {
      let backupPath: string | undefined;

      if (options?.createBackup) {
        backupPath = await this.createBackup(normalizedPath);
      }

      await fs.writeFile(normalizedPath, content, {
        encoding: options?.encoding ?? "utf-8",
      });

      return {
        success: true,
        backupPath,
      };
    } catch (error: unknown) {
      return this.handleWriteError(error);
    }
  }

  detectLanguage(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    return EXTENSION_MAP[ext] ?? "plaintext";
  }

  async createBackup(filePath: string): Promise<string> {
    const timestamp = Date.now();
    const backupPath = `${filePath}.${timestamp}.bak`;
    await fs.copyFile(filePath, backupPath);
    return backupPath;
  }

  private validatePath(filePath: string): string {
    const normalized = path.resolve(filePath);

    // パストラバーサル検出
    if (normalized.includes("..")) {
      throw new Error("Path traversal detected");
    }

    return normalized;
  }

  private handleReadError(error: unknown): FileReadResult {
    if (error instanceof Error && "code" in error) {
      const nodeError = error as NodeJS.ErrnoException;
      switch (nodeError.code) {
        case "ENOENT":
          return {
            success: false,
            error: { code: "FILE_NOT_FOUND", message: error.message },
          };
        case "EACCES":
        case "EPERM":
          return {
            success: false,
            error: { code: "PERMISSION_DENIED", message: error.message },
          };
        default:
          return {
            success: false,
            error: { code: "READ_ERROR", message: error.message },
          };
      }
    }
    return {
      success: false,
      error: { code: "READ_ERROR", message: String(error) },
    };
  }

  private handleWriteError(error: unknown): FileWriteResult {
    if (error instanceof Error && "code" in error) {
      const nodeError = error as NodeJS.ErrnoException;
      switch (nodeError.code) {
        case "EACCES":
        case "EPERM":
          return {
            success: false,
            error: { code: "PERMISSION_DENIED", message: error.message },
          };
        default:
          return {
            success: false,
            error: { code: "WRITE_ERROR", message: error.message },
          };
      }
    }
    return {
      success: false,
      error: { code: "WRITE_ERROR", message: String(error) },
    };
  }
}

// 言語マッピング
const EXTENSION_MAP: Record<string, string> = {
  ".ts": "typescript",
  ".tsx": "typescript",
  ".js": "javascript",
  ".jsx": "javascript",
  ".py": "python",
  ".md": "markdown",
  ".json": "json",
  ".css": "css",
  ".scss": "scss",
  ".html": "html",
  ".vue": "vue",
  ".go": "go",
  ".rs": "rust",
  ".java": "java",
  ".rb": "ruby",
  ".php": "php",
  ".sh": "shell",
  ".bash": "shell",
  ".zsh": "shell",
  ".yaml": "yaml",
  ".yml": "yaml",
  ".sql": "sql",
  ".graphql": "graphql",
  ".gql": "graphql",
  ".c": "c",
  ".cpp": "cpp",
  ".h": "c",
  ".hpp": "cpp",
  ".swift": "swift",
  ".kt": "kotlin",
  ".scala": "scala",
  ".r": "r",
  ".lua": "lua",
  ".dart": "dart",
  ".ex": "elixir",
  ".exs": "elixir",
  ".erl": "erlang",
  ".hs": "haskell",
  ".clj": "clojure",
  ".fs": "fsharp",
  ".ml": "ocaml",
};
```

---

## 2. ContextBuilder インターフェース

### 2.1 インターフェース定義

```typescript
// apps/desktop/src/main/services/chat-edit/ContextBuilder.ts

import { FileContextInput } from "@/renderer/features/workspace-chat-edit/types";

export interface IContextBuilder {
  /**
   * FileContextからLLMプロンプト用文字列を構築
   * @param contexts ファイルコンテキスト配列
   * @returns Markdown形式のコンテキスト文字列
   */
  build(contexts: FileContextInput[]): string;

  /**
   * コンテキスト合計サイズを計算
   * @param contexts ファイルコンテキスト配列
   * @returns バイト数
   */
  calculateSize(contexts: FileContextInput[]): number;

  /**
   * サイズ制限チェック
   * @param contexts ファイルコンテキスト配列
   * @returns 制限内ならtrue
   */
  validateSize(contexts: FileContextInput[]): boolean;
}
```

### 2.2 実装クラス

```typescript
// apps/desktop/src/main/services/chat-edit/ContextBuilder.ts

import { MAX_CONTEXT_SIZE } from "./constants";

export class ContextBuilder implements IContextBuilder {
  private readonly maxContextSize: number;

  constructor(maxContextSize: number = MAX_CONTEXT_SIZE) {
    this.maxContextSize = maxContextSize;
  }

  build(contexts: FileContextInput[]): string {
    if (contexts.length === 0) {
      return "";
    }

    const sections = contexts.map((ctx) => this.buildSection(ctx));
    return `## ファイルコンテキスト\n\n${sections.join("\n\n")}`;
  }

  calculateSize(contexts: FileContextInput[]): number {
    return contexts.reduce((total, ctx) => {
      const contentSize = new TextEncoder().encode(ctx.content).length;
      const pathSize = new TextEncoder().encode(ctx.filePath).length;
      return total + contentSize + pathSize;
    }, 0);
  }

  validateSize(contexts: FileContextInput[]): boolean {
    return this.calculateSize(contexts) <= this.maxContextSize;
  }

  private buildSection(ctx: FileContextInput): string {
    const header = this.buildHeader(ctx);
    const codeBlock = this.buildCodeBlock(ctx);
    return `${header}\n${codeBlock}`;
  }

  private buildHeader(ctx: FileContextInput): string {
    const fileName = ctx.filePath.split("/").pop() ?? ctx.filePath;

    if (ctx.selection) {
      const { startLine, endLine } = ctx.selection;
      return `### File: ${fileName} (選択範囲: L${startLine}-L${endLine})`;
    }

    return `### File: ${fileName}`;
  }

  private buildCodeBlock(ctx: FileContextInput): string {
    const content = ctx.selection ? ctx.selection.selectedText : ctx.content;
    return `\`\`\`${ctx.language}\n${content}\n\`\`\``;
  }
}
```

---

## 3. ChatEditService インターフェース

### 3.1 インターフェース定義

```typescript
// apps/desktop/src/main/services/chat-edit/ChatEditService.ts

import {
  SendWithContextRequest,
  SendWithContextResponse,
  EditCommand,
  GeneratedResult,
} from "@/renderer/features/workspace-chat-edit/types";

export interface IChatEditService {
  /**
   * コンテキスト付きでLLMにリクエストを送信
   * @param request リクエスト
   * @returns レスポンス
   */
  sendWithContext(
    request: SendWithContextRequest,
  ): Promise<SendWithContextResponse>;
}
```

### 3.2 実装クラス

````typescript
// apps/desktop/src/main/services/chat-edit/ChatEditService.ts

import { v4 as uuidv4 } from "uuid";
import { LLMAdapter } from "../adapters/llm";
import { FileService } from "./FileService";
import { ContextBuilder } from "./ContextBuilder";
import { PROMPT_TEMPLATES, LLM_TIMEOUT } from "./constants";

export class ChatEditService implements IChatEditService {
  private readonly fileService: FileService;
  private readonly contextBuilder: ContextBuilder;
  private readonly llmAdapter: LLMAdapter;
  private readonly timeout: number;

  constructor(
    fileService: FileService,
    contextBuilder: ContextBuilder,
    llmAdapter: LLMAdapter,
    timeout: number = LLM_TIMEOUT,
  ) {
    this.fileService = fileService;
    this.contextBuilder = contextBuilder;
    this.llmAdapter = llmAdapter;
    this.timeout = timeout;
  }

  async sendWithContext(
    request: SendWithContextRequest,
  ): Promise<SendWithContextResponse> {
    try {
      // サイズ検証
      if (!this.contextBuilder.validateSize(request.contexts)) {
        return {
          success: false,
          error: {
            code: "CONTEXT_TOO_LARGE",
            message: "Context size exceeds maximum limit",
            retryable: false,
          },
        };
      }

      // コマンド検証
      if (!this.isValidCommand(request.command)) {
        return {
          success: false,
          error: {
            code: "INVALID_COMMAND",
            message: `Unknown command type: ${request.command.type}`,
            retryable: false,
          },
        };
      }

      // コンテキスト構築
      const contextString = this.contextBuilder.build(request.contexts);

      // プロンプト構築
      const prompt = this.buildPrompt(request.command, contextString);

      // LLMリクエスト
      const llmResponse = await this.sendToLLM(prompt, request.options);

      // レスポンスパース
      const targetContext = request.contexts.find(
        (ctx) => ctx.filePath === request.command.targetContextId,
      );
      const originalContent = targetContext?.content ?? "";

      const result = this.parseResponse(
        llmResponse,
        request.command,
        originalContent,
      );

      return {
        success: true,
        result,
      };
    } catch (error: unknown) {
      return this.handleError(error);
    }
  }

  private buildPrompt(command: EditCommand, context: string): string {
    const template = PROMPT_TEMPLATES[command.type];

    if (command.type === "custom" && command.instruction) {
      return template
        .replace("{instruction}", command.instruction)
        .replace("{context}", context);
    }

    return template.replace("{context}", context);
  }

  private async sendToLLM(
    prompt: string,
    options?: SendOptions,
  ): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await this.llmAdapter.send({
        messages: [{ role: "user", content: prompt }],
        modelId: options?.modelId,
        maxTokens: options?.maxTokens,
        signal: controller.signal,
      });

      return response.content;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private parseResponse(
    response: string,
    command: EditCommand,
    originalContent: string,
  ): GeneratedResult {
    // コードブロック抽出
    const generatedContent = this.extractCodeBlock(response) ?? response;

    // 差分計算
    const diffHunks = this.calculateDiff(originalContent, generatedContent);

    return {
      id: uuidv4(),
      contextId: command.targetContextId,
      originalContent,
      generatedContent,
      diffHunks,
      status: "pending",
      createdAt: new Date(),
      targetFilePath: command.targetContextId,
      command,
      llmMetadata: {
        model: "unknown", // LLMAdapterから取得予定
        tokensUsed: 0,
        generationTimeMs: 0,
      },
    };
  }

  private extractCodeBlock(text: string): string | null {
    const codeBlockRegex = /```[\w]*\n([\s\S]*?)\n```/;
    const match = text.match(codeBlockRegex);
    return match ? match[1] : null;
  }

  private calculateDiff(original: string, generated: string): DiffHunk[] {
    // 簡易差分計算（全置換）
    // 将来的にはLCSアルゴリズムを使用
    if (original === generated) {
      return [];
    }

    const originalLines = original.split("\n");
    const generatedLines = generated.split("\n");

    return [
      {
        type: "modify",
        originalStartLine: 1,
        originalEndLine: originalLines.length,
        newStartLine: 1,
        newEndLine: generatedLines.length,
        originalLines,
        newLines: generatedLines,
      },
    ];
  }

  private isValidCommand(command: EditCommand): boolean {
    const validTypes = [
      "continue",
      "refactor",
      "generate-test",
      "add-comment",
      "custom",
    ];
    return validTypes.includes(command.type);
  }

  private handleError(error: unknown): SendWithContextResponse {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return {
          success: false,
          error: {
            code: "TIMEOUT",
            message: "LLM request timed out",
            retryable: true,
          },
        };
      }

      // レート制限エラー
      if (error.message.includes("rate limit")) {
        return {
          success: false,
          error: {
            code: "RATE_LIMIT",
            message: error.message,
            retryable: true,
            retryAfterMs: 60000,
          },
        };
      }

      return {
        success: false,
        error: {
          code: "LLM_ERROR",
          message: error.message,
          retryable: true,
        },
      };
    }

    return {
      success: false,
      error: {
        code: "LLM_ERROR",
        message: String(error),
        retryable: false,
      },
    };
  }
}
````

---

## 4. IPCハンドラ設計

### 4.1 ハンドラ登録関数

```typescript
// apps/desktop/src/main/ipc/chatEditHandlers.ts

import { ipcMain, IpcMainInvokeEvent, BrowserWindow } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";
import { ChatEditService } from "../services/chat-edit/ChatEditService";
import { FileService } from "../services/chat-edit/FileService";
import {
  validateIpcSender,
  toIPCValidationError,
} from "../infrastructure/security/ipc-validator";
import {
  FileWriteOptions,
  SendWithContextRequest,
} from "@/renderer/features/workspace-chat-edit/types";

export function registerChatEditHandlers(
  mainWindow: BrowserWindow,
  chatEditService: ChatEditService,
  fileService: FileService,
): void {
  // chat-edit:read-file
  ipcMain.handle(
    IPC_CHANNELS.CHAT_EDIT_READ_FILE,
    async (event: IpcMainInvokeEvent, args: { filePath: string }) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.CHAT_EDIT_READ_FILE,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }

      return fileService.readFile(args.filePath);
    },
  );

  // chat-edit:write-file
  ipcMain.handle(
    IPC_CHANNELS.CHAT_EDIT_WRITE_FILE,
    async (
      event: IpcMainInvokeEvent,
      args: { filePath: string; content: string; options?: FileWriteOptions },
    ) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.CHAT_EDIT_WRITE_FILE,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }

      return fileService.writeFile(args.filePath, args.content, args.options);
    },
  );

  // chat-edit:get-selection
  ipcMain.handle(
    IPC_CHANNELS.CHAT_EDIT_GET_SELECTION,
    async (event: IpcMainInvokeEvent) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.CHAT_EDIT_GET_SELECTION,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }

      // 現在の選択範囲をRendererから取得する必要がある
      // この実装はRenderer側のエディタ状態に依存
      return null;
    },
  );

  // chat-edit:send-with-context
  ipcMain.handle(
    IPC_CHANNELS.CHAT_EDIT_SEND_WITH_CONTEXT,
    async (event: IpcMainInvokeEvent, args: SendWithContextRequest) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.CHAT_EDIT_SEND_WITH_CONTEXT,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }

      return chatEditService.sendWithContext(args);
    },
  );
}
```

---

## 5. チャンネル定義

### 5.1 IPC_CHANNELS追加

```typescript
// apps/desktop/src/preload/channels.ts に追加

export const IPC_CHANNELS = {
  // ... 既存チャンネル ...

  // Chat Edit operations
  CHAT_EDIT_READ_FILE: "chat-edit:read-file",
  CHAT_EDIT_WRITE_FILE: "chat-edit:write-file",
  CHAT_EDIT_GET_SELECTION: "chat-edit:get-selection",
  CHAT_EDIT_SEND_WITH_CONTEXT: "chat-edit:send-with-context",
} as const;
```

### 5.2 ホワイトリスト追加

```typescript
// ALLOWED_INVOKE_CHANNELS に追加
export const ALLOWED_INVOKE_CHANNELS: readonly string[] = [
  // ... 既存チャンネル ...

  // Chat Edit channels
  IPC_CHANNELS.CHAT_EDIT_READ_FILE,
  IPC_CHANNELS.CHAT_EDIT_WRITE_FILE,
  IPC_CHANNELS.CHAT_EDIT_GET_SELECTION,
  IPC_CHANNELS.CHAT_EDIT_SEND_WITH_CONTEXT,
];
```

---

## 6. 定数定義

### 6.1 constants.ts

```typescript
// apps/desktop/src/main/services/chat-edit/constants.ts

import { EditCommandType } from "@/renderer/features/workspace-chat-edit/types";

/** ファイルサイズ上限（10MB） */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** コンテキスト合計サイズ上限（100KB） */
export const MAX_CONTEXT_SIZE = 100 * 1024;

/** LLMリクエストタイムアウト（30秒） */
export const LLM_TIMEOUT = 30 * 1000;

/** プロンプトテンプレート */
export const PROMPT_TEMPLATES: Record<EditCommandType, string> = {
  continue: `以下のコードの続きを書いてください。
コンテキストを参考に、適切なコードを生成してください。

{context}

続きを書いてください:`,

  refactor: `以下のコードをリファクタリングしてください。
可読性、保守性、パフォーマンスを改善してください。

{context}

リファクタリング結果:`,

  "generate-test": `以下のコードのテストを生成してください。
カバレッジを意識し、主要なケースをカバーしてください。

{context}

テストコード:`,

  "add-comment": `以下のコードにコメントを追加してください。
関数の目的、引数、戻り値を説明するコメントを追加してください。

{context}

コメント付きコード:`,

  custom: `{instruction}

{context}`,
};
```

---

## 7. Preload API設計

### 7.1 ChatEditAPI 型定義

```typescript
// apps/desktop/src/preload/types/chatEdit.ts

import {
  FileReadResult,
  FileWriteResult,
  FileWriteOptions,
  TextSelection,
  SendWithContextRequest,
  SendWithContextResponse,
} from "@/renderer/features/workspace-chat-edit/types";

export interface ChatEditAPI {
  readFile(filePath: string): Promise<FileReadResult>;
  writeFile(
    filePath: string,
    content: string,
    options?: FileWriteOptions,
  ): Promise<FileWriteResult>;
  getSelection(): Promise<TextSelection | null>;
  sendWithContext(
    request: SendWithContextRequest,
  ): Promise<SendWithContextResponse>;
}
```

### 7.2 Preload実装

```typescript
// apps/desktop/src/preload/index.ts に追加

import { contextBridge } from "electron";
import { IPC_CHANNELS } from "./channels";
import { safeInvoke } from "./safeInvoke";
import { ChatEditAPI } from "./types/chatEdit";

const chatEditAPI: ChatEditAPI = {
  readFile: (filePath: string) =>
    safeInvoke<FileReadResult>(IPC_CHANNELS.CHAT_EDIT_READ_FILE, { filePath }),

  writeFile: (filePath: string, content: string, options?: FileWriteOptions) =>
    safeInvoke<FileWriteResult>(IPC_CHANNELS.CHAT_EDIT_WRITE_FILE, {
      filePath,
      content,
      options,
    }),

  getSelection: () =>
    safeInvoke<TextSelection | null>(IPC_CHANNELS.CHAT_EDIT_GET_SELECTION),

  sendWithContext: (request: SendWithContextRequest) =>
    safeInvoke<SendWithContextResponse>(
      IPC_CHANNELS.CHAT_EDIT_SEND_WITH_CONTEXT,
      request,
    ),
};

contextBridge.exposeInMainWorld("chatEditAPI", chatEditAPI);
```

---

## 8. 型エクスポート

### 8.1 index.ts

```typescript
// apps/desktop/src/main/services/chat-edit/index.ts

export { FileService, type IFileService } from "./FileService";
export { ContextBuilder, type IContextBuilder } from "./ContextBuilder";
export { ChatEditService, type IChatEditService } from "./ChatEditService";
export * from "./constants";
```

---

## 9. 完了確認

- [x] FileServiceインターフェースが定義されている
- [x] ContextBuilderインターフェースが定義されている
- [x] ChatEditServiceインターフェースが定義されている
- [x] IPCハンドラ設計が完了している
- [x] チャンネル定義が設計されている
- [x] Preload API設計が完了している
- [x] 定数定義が設計されている
- [x] 型エクスポートが設計されている

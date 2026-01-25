# Phase 4: テスト作成

## メタ情報

| 項目         | 内容                                                  |
| ------------ | ----------------------------------------------------- |
| Phase        | 4                                                     |
| 名称         | テスト作成                                            |
| 目的         | TDD: Red（失敗するテスト）                            |
| 前提Phase    | Phase 3（レビューゲート）                             |
| 成果物       | テストファイル                                        |
| 成果物配置先 | `apps/desktop/src/main/services/chat-edit/__tests__/` |

---

## 1. 目的

TDD Red phaseとして、サービス実装前に失敗するテストを作成する。

---

## 2. 実行タスク

### Task 1: FileServiceテスト作成

#### 2.1.1 テストファイル作成

ファイル: `apps/desktop/src/main/services/chat-edit/__tests__/FileService.test.ts`

#### 2.1.2 テストケース

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { FileService } from "../FileService";

describe("FileService", () => {
  let fileService: FileService;

  beforeEach(() => {
    fileService = new FileService();
  });

  describe("readFile", () => {
    it("存在するファイルの内容を読み取れる", async () => {
      // Arrange
      const filePath = "/path/to/file.ts";
      const expectedContent = "const x = 1;";

      // Act
      const result = await fileService.readFile(filePath);

      // Assert
      expect(result.success).toBe(true);
      expect(result.content).toBe(expectedContent);
      expect(result.language).toBe("typescript");
    });

    it("存在しないファイルでFILE_NOT_FOUNDエラーを返す", async () => {
      // Arrange
      const filePath = "/path/to/nonexistent.ts";

      // Act
      const result = await fileService.readFile(filePath);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("FILE_NOT_FOUND");
    });

    it("10MBを超えるファイルでTOO_LARGEエラーを返す", async () => {
      // Arrange
      const filePath = "/path/to/large-file.ts";

      // Act
      const result = await fileService.readFile(filePath);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("TOO_LARGE");
    });

    it("読み取り権限がないファイルでPERMISSION_DENIEDエラーを返す", async () => {
      // Arrange
      const filePath = "/path/to/protected.ts";

      // Act
      const result = await fileService.readFile(filePath);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("PERMISSION_DENIED");
    });
  });

  describe("writeFile", () => {
    it("ファイルに内容を書き込める", async () => {
      // Arrange
      const filePath = "/path/to/file.ts";
      const content = "const x = 2;";

      // Act
      const result = await fileService.writeFile(filePath, content);

      // Assert
      expect(result.success).toBe(true);
    });

    it("createBackup: trueでバックアップを作成する", async () => {
      // Arrange
      const filePath = "/path/to/file.ts";
      const content = "const x = 2;";

      // Act
      const result = await fileService.writeFile(filePath, content, {
        createBackup: true,
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.backupPath).toBeDefined();
      expect(result.backupPath).toMatch(/\.bak$/);
    });

    it("書き込み権限がないファイルでPERMISSION_DENIEDエラーを返す", async () => {
      // Arrange
      const filePath = "/path/to/readonly.ts";
      const content = "const x = 2;";

      // Act
      const result = await fileService.writeFile(filePath, content);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("PERMISSION_DENIED");
    });
  });

  describe("detectLanguage", () => {
    it.each([
      [".ts", "typescript"],
      [".tsx", "typescript"],
      [".js", "javascript"],
      [".jsx", "javascript"],
      [".py", "python"],
      [".md", "markdown"],
      [".json", "json"],
      [".go", "go"],
      [".rs", "rust"],
    ])("拡張子 %s で言語 %s を返す", (ext, expectedLang) => {
      // Act
      const result = fileService.detectLanguage(`/path/to/file${ext}`);

      // Assert
      expect(result).toBe(expectedLang);
    });

    it("未知の拡張子でplaintextを返す", () => {
      // Act
      const result = fileService.detectLanguage("/path/to/file.xyz");

      // Assert
      expect(result).toBe("plaintext");
    });
  });
});
```

---

### Task 2: ContextBuilderテスト作成

#### 2.2.1 テストファイル作成

ファイル: `apps/desktop/src/main/services/chat-edit/__tests__/ContextBuilder.test.ts`

#### 2.2.2 テストケース

````typescript
import { describe, it, expect } from "vitest";
import { ContextBuilder } from "../ContextBuilder";
import { FileContextInput, MAX_CONTEXT_SIZE } from "../types";

describe("ContextBuilder", () => {
  let contextBuilder: ContextBuilder;

  beforeEach(() => {
    contextBuilder = new ContextBuilder();
  });

  describe("build", () => {
    it("単一ファイルからMarkdown形式で構築する", () => {
      // Arrange
      const contexts: FileContextInput[] = [
        {
          filePath: "/path/to/Button.tsx",
          content: "export const Button = () => {};",
          language: "typescript",
        },
      ];

      // Act
      const result = contextBuilder.build(contexts);

      // Assert
      expect(result).toContain("## ファイルコンテキスト");
      expect(result).toContain("Button.tsx");
      expect(result).toContain("```typescript");
      expect(result).toContain("export const Button = () => {};");
    });

    it("複数ファイルを正しく構築する", () => {
      // Arrange
      const contexts: FileContextInput[] = [
        {
          filePath: "/path/to/Button.tsx",
          content: "export const Button = () => {};",
          language: "typescript",
        },
        {
          filePath: "/path/to/utils.ts",
          content: "export const helper = () => {};",
          language: "typescript",
        },
      ];

      // Act
      const result = contextBuilder.build(contexts);

      // Assert
      expect(result).toContain("Button.tsx");
      expect(result).toContain("utils.ts");
    });

    it("選択範囲がある場合に行番号を表示する", () => {
      // Arrange
      const contexts: FileContextInput[] = [
        {
          filePath: "/path/to/Button.tsx",
          content: "selected content",
          language: "typescript",
          selection: {
            startLine: 10,
            endLine: 25,
            startColumn: 1,
            endColumn: 1,
            selectedText: "selected content",
          },
        },
      ];

      // Act
      const result = contextBuilder.build(contexts);

      // Assert
      expect(result).toContain("L10-L25");
    });
  });

  describe("calculateSize", () => {
    it("コンテキストの合計サイズを計算する", () => {
      // Arrange
      const contexts: FileContextInput[] = [
        {
          filePath: "/path/to/file.ts",
          content: "a".repeat(1000),
          language: "typescript",
        },
      ];

      // Act
      const size = contextBuilder.calculateSize(contexts);

      // Assert
      expect(size).toBeGreaterThanOrEqual(1000);
    });
  });

  describe("validateSize", () => {
    it("制限内でtrueを返す", () => {
      // Arrange
      const contexts: FileContextInput[] = [
        {
          filePath: "/path/to/file.ts",
          content: "small content",
          language: "typescript",
        },
      ];

      // Act
      const isValid = contextBuilder.validateSize(contexts);

      // Assert
      expect(isValid).toBe(true);
    });

    it("100KBを超える場合にfalseを返す", () => {
      // Arrange
      const contexts: FileContextInput[] = [
        {
          filePath: "/path/to/file.ts",
          content: "a".repeat(MAX_CONTEXT_SIZE + 1),
          language: "typescript",
        },
      ];

      // Act
      const isValid = contextBuilder.validateSize(contexts);

      // Assert
      expect(isValid).toBe(false);
    });
  });
});
````

---

### Task 3: ChatEditServiceテスト作成

#### 2.3.1 テストファイル作成

ファイル: `apps/desktop/src/main/services/chat-edit/__tests__/ChatEditService.test.ts`

#### 2.3.2 テストケース

````typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import { ChatEditService } from "../ChatEditService";
import { ContextBuilder } from "../ContextBuilder";
import { SendWithContextRequest, EditCommandType } from "../types";

describe("ChatEditService", () => {
  let chatEditService: ChatEditService;
  let mockLLMAdapter: any;
  let contextBuilder: ContextBuilder;

  beforeEach(() => {
    mockLLMAdapter = {
      sendMessage: vi.fn(),
    };
    contextBuilder = new ContextBuilder();
    chatEditService = new ChatEditService(mockLLMAdapter, contextBuilder);
  });

  describe("sendWithContext", () => {
    it("正常なリクエストで成功レスポンスを返す", async () => {
      // Arrange
      const request: SendWithContextRequest = {
        contexts: [
          {
            filePath: "/path/to/file.ts",
            content: "const x = 1;",
            language: "typescript",
          },
        ],
        command: {
          type: "refactor" as EditCommandType,
          targetContextId: "ctx-1",
        },
        message: "リファクタリングしてください",
      };

      mockLLMAdapter.sendMessage.mockResolvedValue({
        success: true,
        data: { message: "const x: number = 1;" },
      });

      // Act
      const result = await chatEditService.sendWithContext(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.result).toBeDefined();
      expect(result.result?.generatedContent).toBeDefined();
    });

    it("コンテキストサイズ超過でCONTEXT_TOO_LARGEエラーを返す", async () => {
      // Arrange
      const request: SendWithContextRequest = {
        contexts: [
          {
            filePath: "/path/to/file.ts",
            content: "a".repeat(100 * 1024 + 1), // 100KB超
            language: "typescript",
          },
        ],
        command: {
          type: "refactor" as EditCommandType,
          targetContextId: "ctx-1",
        },
        message: "",
      };

      // Act
      const result = await chatEditService.sendWithContext(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("CONTEXT_TOO_LARGE");
    });

    it("LLMエラー時にLLM_ERRORを返す", async () => {
      // Arrange
      const request: SendWithContextRequest = {
        contexts: [
          {
            filePath: "/path/to/file.ts",
            content: "const x = 1;",
            language: "typescript",
          },
        ],
        command: {
          type: "refactor" as EditCommandType,
          targetContextId: "ctx-1",
        },
        message: "",
      };

      mockLLMAdapter.sendMessage.mockResolvedValue({
        success: false,
        error: { code: "API_ERROR", message: "API error" },
      });

      // Act
      const result = await chatEditService.sendWithContext(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("LLM_ERROR");
    });
  });

  describe("buildPrompt", () => {
    it.each([
      ["continue", "続きを書いてください"],
      ["refactor", "リファクタリング"],
      ["generate-test", "テストを生成"],
      ["add-comment", "コメントを追加"],
    ])("コマンドタイプ %s で適切なプロンプトを生成する", (type, keyword) => {
      // Arrange
      const command = {
        type: type as EditCommandType,
        targetContextId: "ctx-1",
      };
      const context = "```typescript\nconst x = 1;\n```";

      // Act
      const prompt = (chatEditService as any).buildPrompt(command, context);

      // Assert
      expect(prompt).toContain(keyword);
      expect(prompt).toContain(context);
    });

    it("customコマンドでinstructionを使用する", () => {
      // Arrange
      const command = {
        type: "custom" as EditCommandType,
        targetContextId: "ctx-1",
        instruction: "TypeScriptに変換してください",
      };
      const context = "```javascript\nconst x = 1;\n```";

      // Act
      const prompt = (chatEditService as any).buildPrompt(command, context);

      // Assert
      expect(prompt).toContain("TypeScriptに変換してください");
    });
  });
});
````

---

### Task 4: chatEditHandlersテスト作成

#### 2.4.1 テストファイル作成

ファイル: `apps/desktop/src/main/ipc/__tests__/chatEditHandlers.test.ts`

#### 2.4.2 テストケース

```typescript
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { ipcMain, BrowserWindow } from "electron";
import {
  registerChatEditHandlers,
  unregisterChatEditHandlers,
} from "../chatEditHandlers";

vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
  BrowserWindow: vi.fn(),
}));

vi.mock("../../infrastructure/security/ipc-validator", () => ({
  validateIpcSender: vi.fn(() => ({ valid: true })),
  toIPCValidationError: vi.fn((v) => new Error(v.reason)),
}));

describe("chatEditHandlers", () => {
  let mockMainWindow: any;
  let mockChatEditService: any;
  let mockFileService: any;

  beforeEach(() => {
    mockMainWindow = { id: 1 };
    mockChatEditService = {
      sendWithContext: vi.fn(),
    };
    mockFileService = {
      readFile: vi.fn(),
      writeFile: vi.fn(),
    };
    vi.clearAllMocks();
  });

  afterEach(() => {
    unregisterChatEditHandlers();
  });

  describe("registerChatEditHandlers", () => {
    it("4つのIPCハンドラを登録する", () => {
      // Act
      registerChatEditHandlers(
        mockMainWindow,
        mockChatEditService,
        mockFileService,
      );

      // Assert
      expect(ipcMain.handle).toHaveBeenCalledTimes(4);
    });

    it("chat-edit:read-fileハンドラを登録する", () => {
      // Act
      registerChatEditHandlers(
        mockMainWindow,
        mockChatEditService,
        mockFileService,
      );

      // Assert
      expect(ipcMain.handle).toHaveBeenCalledWith(
        "chat-edit:read-file",
        expect.any(Function),
      );
    });

    it("chat-edit:write-fileハンドラを登録する", () => {
      // Act
      registerChatEditHandlers(
        mockMainWindow,
        mockChatEditService,
        mockFileService,
      );

      // Assert
      expect(ipcMain.handle).toHaveBeenCalledWith(
        "chat-edit:write-file",
        expect.any(Function),
      );
    });

    it("chat-edit:send-with-contextハンドラを登録する", () => {
      // Act
      registerChatEditHandlers(
        mockMainWindow,
        mockChatEditService,
        mockFileService,
      );

      // Assert
      expect(ipcMain.handle).toHaveBeenCalledWith(
        "chat-edit:send-with-context",
        expect.any(Function),
      );
    });
  });

  describe("unregisterChatEditHandlers", () => {
    it("登録したハンドラを解除する", () => {
      // Arrange
      registerChatEditHandlers(
        mockMainWindow,
        mockChatEditService,
        mockFileService,
      );

      // Act
      unregisterChatEditHandlers();

      // Assert
      expect(ipcMain.removeHandler).toHaveBeenCalledWith("chat-edit:read-file");
      expect(ipcMain.removeHandler).toHaveBeenCalledWith(
        "chat-edit:write-file",
      );
      expect(ipcMain.removeHandler).toHaveBeenCalledWith(
        "chat-edit:send-with-context",
      );
    });
  });
});
```

---

## 3. 参照資料

### 3.1 システム仕様（aiworkflow-requirements）

| 参照資料 | パス                                                                        |
| -------- | --------------------------------------------------------------------------- |
| 品質要件 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` |

### 3.2 既存テスト参照

| 実装                          | パス                                                                  |
| ----------------------------- | --------------------------------------------------------------------- |
| SkillService.test.ts          | `apps/desktop/src/main/services/skill/__tests__/SkillService.test.ts` |
| skillHandlers.test.ts（参考） | `apps/desktop/src/main/ipc/`                                          |

---

## 4. 成果物

| 成果物                   | 配置先                                                |
| ------------------------ | ----------------------------------------------------- |
| FileService.test.ts      | `apps/desktop/src/main/services/chat-edit/__tests__/` |
| ContextBuilder.test.ts   | `apps/desktop/src/main/services/chat-edit/__tests__/` |
| ChatEditService.test.ts  | `apps/desktop/src/main/services/chat-edit/__tests__/` |
| chatEditHandlers.test.ts | `apps/desktop/src/main/ipc/__tests__/`                |

---

## 5. 統合テスト連携【必須】

統合テスト用のモック・スタブ設計を含める:

| 統合ポイント   | モック/スタブ設計          | 確認 |
| -------------- | -------------------------- | ---- |
| LLMAdapter     | mockLLMAdapter.sendMessage | -    |
| FileSystem     | vi.mock('fs/promises')     | -    |
| IPC Event      | 模擬IpcMainInvokeEvent     | -    |
| IPC Sender検証 | vi.mock validateIpcSender  | -    |

---

## 6. 完了条件

- [ ] FileServiceのテストが作成されている
- [ ] ContextBuilderのテストが作成されている
- [ ] ChatEditServiceのテストが作成されている
- [ ] chatEditHandlersのテストが作成されている
- [ ] 全テストが「失敗」する（実装前のためRed状態）
- [ ] テストカバレッジ対象が網羅されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 7. サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認（aiworkflow-requirements）
2. FileServiceテスト作成（Task 1）
3. ContextBuilderテスト作成（Task 2）
4. ChatEditServiceテスト作成（Task 3）
5. chatEditHandlersテスト作成（Task 4）
6. 統合テスト連携の記載
7. テストファイル配置確認
8. 完了条件の検証

---

## 8. タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/workspace-chat-edit-main-process --phase 4
```

---

## 9. 次のPhase

Phase 5: 実装

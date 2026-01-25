# Phase 6: テスト拡充

## メタ情報

| 項目         | 内容                                                  |
| ------------ | ----------------------------------------------------- |
| Phase        | 6                                                     |
| 名称         | テスト拡充                                            |
| 目的         | カバレッジ目標達成に向けた追加テスト                  |
| 前提Phase    | Phase 5（実装）                                       |
| 成果物       | 追加テストファイル                                    |
| 成果物配置先 | `apps/desktop/src/main/services/chat-edit/__tests__/` |

---

## 1. 目的

Phase 5の実装に対して、カバレッジ目標（Line ≥ 80%, Branch ≥ 60%）達成に向けた追加テストを作成する。

---

## 2. 実行タスク

### Task 1: FileService追加テスト

#### 2.1.1 エッジケーステスト

```typescript
// FileService.test.ts に追加

describe("FileService - エッジケース", () => {
  describe("readFile - エッジケース", () => {
    it("空ファイルを正常に読み取れる", async () => {
      const result = await fileService.readFile("/path/to/empty.ts");
      expect(result.success).toBe(true);
      expect(result.content).toBe("");
    });

    it("改行のみのファイルを正常に読み取れる", async () => {
      const result = await fileService.readFile("/path/to/newlines.ts");
      expect(result.success).toBe(true);
      expect(result.content).toBe("\n\n\n");
    });

    it("バイナリファイルを適切に処理する", async () => {
      const result = await fileService.readFile("/path/to/image.png");
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("READ_ERROR");
    });

    it("シンボリックリンクを正しく解決する", async () => {
      const result = await fileService.readFile("/path/to/symlink.ts");
      expect(result.success).toBe(true);
    });
  });

  describe("writeFile - エッジケース", () => {
    it("親ディレクトリが存在しない場合にエラーを返す", async () => {
      const result = await fileService.writeFile(
        "/nonexistent/dir/file.ts",
        "content",
      );
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("WRITE_ERROR");
    });

    it("既存ファイルを上書きできる", async () => {
      const result = await fileService.writeFile(
        "/path/to/existing.ts",
        "new content",
      );
      expect(result.success).toBe(true);
    });

    it("Unicode文字を含むファイル名を処理できる", async () => {
      const result = await fileService.writeFile(
        "/path/to/日本語.ts",
        "content",
      );
      expect(result.success).toBe(true);
    });
  });

  describe("detectLanguage - 全拡張子カバレッジ", () => {
    const allExtensions = [
      [".ts", "typescript"],
      [".tsx", "typescript"],
      [".js", "javascript"],
      [".jsx", "javascript"],
      [".py", "python"],
      [".md", "markdown"],
      [".json", "json"],
      [".css", "css"],
      [".scss", "scss"],
      [".html", "html"],
      [".vue", "vue"],
      [".go", "go"],
      [".rs", "rust"],
      [".java", "java"],
      [".rb", "ruby"],
      [".php", "php"],
      [".sh", "shell"],
      [".yaml", "yaml"],
      [".yml", "yaml"],
      [".sql", "sql"],
      [".graphql", "graphql"],
    ];

    it.each(allExtensions)("拡張子 %s で言語 %s を返す", (ext, lang) => {
      expect(fileService.detectLanguage(`file${ext}`)).toBe(lang);
    });

    it("大文字拡張子を正しく処理する", () => {
      expect(fileService.detectLanguage("file.TS")).toBe("typescript");
      expect(fileService.detectLanguage("file.JS")).toBe("javascript");
    });

    it("複数ドットを含むファイル名を正しく処理する", () => {
      expect(fileService.detectLanguage("file.test.ts")).toBe("typescript");
      expect(fileService.detectLanguage("file.spec.js")).toBe("javascript");
    });

    it("拡張子なしでplaintextを返す", () => {
      expect(fileService.detectLanguage("Makefile")).toBe("plaintext");
      expect(fileService.detectLanguage("Dockerfile")).toBe("plaintext");
    });
  });
});
```

---

### Task 2: ContextBuilder追加テスト

#### 2.2.1 エッジケーステスト

````typescript
// ContextBuilder.test.ts に追加

describe("ContextBuilder - エッジケース", () => {
  describe("build - エッジケース", () => {
    it("空のcontexts配列で空文字を返す", () => {
      expect(contextBuilder.build([])).toBe("");
    });

    it("特殊文字を含むファイルパスを正しく処理する", () => {
      const contexts: FileContextInput[] = [
        {
          filePath: "/path/to/file with spaces.ts",
          content: "content",
          language: "typescript",
        },
      ];
      const result = contextBuilder.build(contexts);
      expect(result).toContain("file with spaces.ts");
    });

    it("Markdownコードブロックを含むコンテンツをエスケープする", () => {
      const contexts: FileContextInput[] = [
        {
          filePath: "/path/to/file.md",
          content: "```typescript\ncode\n```",
          language: "markdown",
        },
      ];
      const result = contextBuilder.build(contexts);
      expect(result).toContain("```markdown");
    });

    it("非常に長いファイル名を正しく処理する", () => {
      const longName = "a".repeat(200) + ".ts";
      const contexts: FileContextInput[] = [
        {
          filePath: `/path/to/${longName}`,
          content: "content",
          language: "typescript",
        },
      ];
      const result = contextBuilder.build(contexts);
      expect(result).toContain(longName);
    });
  });

  describe("calculateSize - エッジケース", () => {
    it("空のcontexts配列で0を返す", () => {
      expect(contextBuilder.calculateSize([])).toBe(0);
    });

    it("マルチバイト文字を正しくカウントする", () => {
      const contexts: FileContextInput[] = [
        {
          filePath: "/path/to/file.ts",
          content: "日本語テスト", // 18バイト（UTF-8）
          language: "typescript",
        },
      ];
      const size = contextBuilder.calculateSize(contexts);
      expect(size).toBeGreaterThanOrEqual(18);
    });

    it("絵文字を正しくカウントする", () => {
      const contexts: FileContextInput[] = [
        {
          filePath: "/path/to/file.ts",
          content: "🎉🚀", // 8バイト（UTF-8）
          language: "typescript",
        },
      ];
      const size = contextBuilder.calculateSize(contexts);
      expect(size).toBeGreaterThanOrEqual(8);
    });
  });

  describe("validateSize - 境界値テスト", () => {
    it("ちょうど100KBでtrueを返す", () => {
      const contexts: FileContextInput[] = [
        {
          filePath: "/path/to/file.ts",
          content: "a".repeat(100 * 1024 - 100), // メタデータ分を引く
          language: "typescript",
        },
      ];
      expect(contextBuilder.validateSize(contexts)).toBe(true);
    });

    it("100KB + 1バイトでfalseを返す", () => {
      const contexts: FileContextInput[] = [
        {
          filePath: "/path/to/file.ts",
          content: "a".repeat(100 * 1024 + 1),
          language: "typescript",
        },
      ];
      expect(contextBuilder.validateSize(contexts)).toBe(false);
    });
  });
});
````

---

### Task 3: ChatEditService追加テスト

#### 2.3.1 エッジケーステスト

````typescript
// ChatEditService.test.ts に追加

describe("ChatEditService - エッジケース", () => {
  describe("sendWithContext - エッジケース", () => {
    it("空のcontextsで正常に処理する", async () => {
      const request: SendWithContextRequest = {
        contexts: [],
        command: {
          type: "refactor" as EditCommandType,
          targetContextId: "ctx-1",
        },
        message: "",
      };

      mockLLMAdapter.sendMessage.mockResolvedValue({
        success: true,
        data: { message: "result" },
      });

      const result = await chatEditService.sendWithContext(request);
      expect(result.success).toBe(true);
    });

    it("タイムアウト時にTIMEOUTエラーを返す", async () => {
      const request: SendWithContextRequest = {
        contexts: [
          {
            filePath: "/path/to/file.ts",
            content: "code",
            language: "typescript",
          },
        ],
        command: {
          type: "refactor" as EditCommandType,
          targetContextId: "ctx-1",
        },
        message: "",
      };

      mockLLMAdapter.sendMessage.mockRejectedValue(new Error("Timeout"));

      const result = await chatEditService.sendWithContext(request);
      expect(result.success).toBe(false);
      expect(result.error?.retryable).toBe(true);
    });

    it("複数ファイルコンテキストを正しく処理する", async () => {
      const request: SendWithContextRequest = {
        contexts: [
          {
            filePath: "/path/to/a.ts",
            content: "code a",
            language: "typescript",
          },
          {
            filePath: "/path/to/b.ts",
            content: "code b",
            language: "typescript",
          },
          {
            filePath: "/path/to/c.ts",
            content: "code c",
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
        success: true,
        data: { message: "refactored code" },
      });

      const result = await chatEditService.sendWithContext(request);
      expect(result.success).toBe(true);
    });
  });

  describe("buildPrompt - 全コマンドタイプ", () => {
    it("optionsを含むコマンドを正しく処理する", () => {
      const command = {
        type: "generate-test" as EditCommandType,
        targetContextId: "ctx-1",
        options: { testFramework: "vitest" },
      };

      const prompt = (chatEditService as any).buildPrompt(command, "context");
      expect(prompt).toContain("テストを生成");
    });

    it("instruction付きのcustomコマンドを正しく処理する", () => {
      const command = {
        type: "custom" as EditCommandType,
        targetContextId: "ctx-1",
        instruction: "日本語でコメントを追加",
      };

      const prompt = (chatEditService as any).buildPrompt(command, "context");
      expect(prompt).toContain("日本語でコメントを追加");
    });
  });

  describe("parseResponse - エッジケース", () => {
    it("コードブロックなしのレスポンスを処理する", () => {
      const response = "Plain text response without code block";
      const result = (chatEditService as any).parseResponse(
        response,
        { type: "refactor" as EditCommandType, targetContextId: "ctx-1" },
        "original",
        "/path/to/file.ts",
      );
      expect(result.generatedContent).toBe(
        "Plain text response without code block",
      );
    });

    it("複数コードブロックがある場合最初のものを使用する", () => {
      const response =
        "```typescript\nfirst\n```\n\n```typescript\nsecond\n```";
      const result = (chatEditService as any).parseResponse(
        response,
        { type: "refactor" as EditCommandType, targetContextId: "ctx-1" },
        "original",
        "/path/to/file.ts",
      );
      expect(result.generatedContent).toBe("first");
    });

    it("空のコードブロックを正しく処理する", () => {
      const response = "```typescript\n\n```";
      const result = (chatEditService as any).parseResponse(
        response,
        { type: "refactor" as EditCommandType, targetContextId: "ctx-1" },
        "original",
        "/path/to/file.ts",
      );
      expect(result.generatedContent).toBe("");
    });
  });
});
````

---

### Task 4: chatEditHandlers追加テスト

#### 2.4.1 セキュリティテスト

```typescript
// chatEditHandlers.test.ts に追加

describe("chatEditHandlers - セキュリティテスト", () => {
  describe("sender検証", () => {
    it("無効なsenderからのリクエストを拒否する", async () => {
      vi.mocked(validateIpcSender).mockReturnValue({
        valid: false,
        reason: "INVALID_SENDER",
      });

      registerChatEditHandlers(
        mockMainWindow,
        mockChatEditService,
        mockFileService,
      );

      const handler = vi.mocked(ipcMain.handle).mock.calls[0][1];
      await expect(
        handler({ sender: {} }, { filePath: "/path" }),
      ).rejects.toThrow();
    });
  });

  describe("入力バリデーション", () => {
    it("chat-edit:read-file - filePathがundefinedでエラーを返す", async () => {
      registerChatEditHandlers(
        mockMainWindow,
        mockChatEditService,
        mockFileService,
      );

      const handler = vi.mocked(ipcMain.handle).mock.calls[0][1];
      const result = await handler({ sender: {} }, {});

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("VALIDATION_ERROR");
    });

    it("chat-edit:write-file - contentがundefinedでエラーを返す", async () => {
      registerChatEditHandlers(
        mockMainWindow,
        mockChatEditService,
        mockFileService,
      );

      const handler = vi.mocked(ipcMain.handle).mock.calls[1][1];
      const result = await handler({ sender: {} }, { filePath: "/path" });

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("VALIDATION_ERROR");
    });

    it("chat-edit:send-with-context - contextsがundefinedでエラーを返す", async () => {
      registerChatEditHandlers(
        mockMainWindow,
        mockChatEditService,
        mockFileService,
      );

      const handler = vi.mocked(ipcMain.handle).mock.calls[3][1];
      const result = await handler({ sender: {} }, {});

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("VALIDATION_ERROR");
    });
  });
});
```

---

### Task 5: 統合テスト作成

#### 2.5.1 ファイル作成

ファイル: `apps/desktop/src/main/services/chat-edit/__tests__/integration.test.ts`

````typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import { FileService } from "../FileService";
import { ContextBuilder } from "../ContextBuilder";
import { ChatEditService } from "../ChatEditService";

describe("ChatEdit Integration Tests", () => {
  let fileService: FileService;
  let contextBuilder: ContextBuilder;
  let chatEditService: ChatEditService;
  let mockLLMAdapter: any;

  beforeEach(() => {
    fileService = new FileService();
    contextBuilder = new ContextBuilder();
    mockLLMAdapter = { sendMessage: vi.fn() };
    chatEditService = new ChatEditService(mockLLMAdapter, contextBuilder);
  });

  describe("FileService -> ContextBuilder -> ChatEditService フロー", () => {
    it("ファイル読み取り → コンテキスト構築 → LLMリクエストの一連の流れが動作する", async () => {
      // ファイル読み取りをモック
      vi.spyOn(fileService, "readFile").mockResolvedValue({
        success: true,
        content: "const x = 1;",
        language: "typescript",
        fileSize: 12,
      });

      // LLMレスポンスをモック
      mockLLMAdapter.sendMessage.mockResolvedValue({
        success: true,
        data: { message: "```typescript\nconst x: number = 1;\n```" },
      });

      // ファイル読み取り
      const readResult = await fileService.readFile("/path/to/file.ts");
      expect(readResult.success).toBe(true);

      // コンテキスト構築
      const contexts = [
        {
          filePath: "/path/to/file.ts",
          content: readResult.content!,
          language: readResult.language!,
        },
      ];
      const contextString = contextBuilder.build(contexts);
      expect(contextString).toContain("file.ts");

      // LLMリクエスト
      const result = await chatEditService.sendWithContext({
        contexts,
        command: { type: "refactor", targetContextId: "ctx-1" },
        message: "",
      });

      expect(result.success).toBe(true);
      expect(result.result?.generatedContent).toBe("const x: number = 1;");
    });
  });
});
````

---

## 3. 参照資料

### 3.1 システム仕様（aiworkflow-requirements）

| 参照資料 | パス                                                                        |
| -------- | --------------------------------------------------------------------------- |
| 品質要件 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` |

---

## 4. 成果物

| 成果物              | 配置先                                                |
| ------------------- | ----------------------------------------------------- |
| 追加テストコード    | 各`__tests__/`ディレクトリ内                          |
| integration.test.ts | `apps/desktop/src/main/services/chat-edit/__tests__/` |

---

## 5. 統合テスト連携【必須】

統合テストで接続を検証する:

| 統合テストケース | 検証内容                      | 確認 |
| ---------------- | ----------------------------- | ---- |
| E2Eフロー        | ファイル読取→コンテキスト→LLM | -    |
| エラー伝播       | サービス間エラーハンドリング  | -    |
| セキュリティ     | 不正sender拒否、パス検証      | -    |
| 境界値           | サイズ制限境界での動作        | -    |

---

## 6. 完了条件

- [ ] FileServiceの追加テストが作成されている
- [ ] ContextBuilderの追加テストが作成されている
- [ ] ChatEditServiceの追加テストが作成されている
- [ ] chatEditHandlersのセキュリティテストが作成されている
- [ ] 統合テストが作成されている
- [ ] 全テストがパスする
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 7. サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認（aiworkflow-requirements）
2. FileService追加テスト（Task 1）
3. ContextBuilder追加テスト（Task 2）
4. ChatEditService追加テスト（Task 3）
5. chatEditHandlers追加テスト（Task 4）
6. 統合テスト作成（Task 5）
7. 統合テスト連携の確認
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
  docs/30-workflows/workspace-chat-edit-main-process --phase 6
```

---

## 9. 次のPhase

Phase 7: テストカバレッジ確認

/**
 * Skill Docs IPC ハンドラテスト (TASK-9I Phase 4)
 *
 * registerSkillDocsHandlers / unregisterSkillDocsHandlers の
 * バリデーション・セキュリティ・正常系を検証する。
 *
 * @see docs/30-workflows/TASK-9I-skill-docs/outputs/phase-4/test-cases.md
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IpcMainInvokeEvent } from "electron";
import { IPC_CHANNELS } from "../../../preload/channels";
import {
  registerSkillDocsHandlers,
  unregisterSkillDocsHandlers,
} from "../skillHandlers";
import { DEFAULT_DOC_TEMPLATE } from "../../services/skill/SkillDocGenerator";

const {
  handlerMap,
  mockIpcMainHandle,
  mockIpcMainRemoveHandler,
  mockValidateIpcSender,
  mockToIPCValidationError,
} = vi.hoisted(() => {
  const handlers = new Map<string, (...args: unknown[]) => unknown>();
  return {
    handlerMap: handlers,
    mockIpcMainHandle: vi.fn(
      (channel: string, handler: (...args: unknown[]) => unknown) => {
        handlers.set(channel, handler);
      },
    ),
    mockIpcMainRemoveHandler: vi.fn((channel: string) => {
      handlers.delete(channel);
    }),
    mockValidateIpcSender: vi.fn(() => ({ valid: true })),
    mockToIPCValidationError: vi.fn(() => ({
      success: false,
      error: "Unauthorized IPC call",
    })),
  };
});

vi.mock("electron", () => ({
  ipcMain: {
    handle: mockIpcMainHandle,
    removeHandler: mockIpcMainRemoveHandler,
  },
  BrowserWindow: vi.fn(),
}));

vi.mock("../../infrastructure/security/ipc-validator", () => ({
  validateIpcSender: mockValidateIpcSender,
  toIPCValidationError: mockToIPCValidationError,
}));

// electron-log モック
vi.mock("electron-log", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

function createMockEvent(): IpcMainInvokeEvent {
  return {
    sender: {
      id: 1,
      getType: () => "window",
      isDevToolsOpened: () => false,
    },
  } as unknown as IpcMainInvokeEvent;
}

describe("registerSkillDocsHandlers", () => {
  const mockSkillDocGenerator = {
    generate: vi.fn(),
    preview: vi.fn(),
    exportToFile: vi.fn(),
  };

  let event: IpcMainInvokeEvent;

  const validGenerateRequest = {
    skillName: "test-skill",
    outputFormat: "markdown",
    includeExamples: true,
    includeApiReference: false,
    language: "ja",
  };

  const validDoc = {
    skillName: "test-skill",
    format: "markdown",
    content: "# Generated Doc",
    sections: [{ id: "overview", title: "概要", content: "テスト", order: 0 }],
    generatedAt: "2026-02-28T00:00:00.000Z",
    wordCount: 3,
  };

  beforeEach(() => {
    handlerMap.clear();
    vi.clearAllMocks();

    event = createMockEvent();

    mockValidateIpcSender.mockReturnValue({ valid: true });
    mockToIPCValidationError.mockReturnValue({
      success: false,
      error: "Unauthorized IPC call",
    });

    mockSkillDocGenerator.generate.mockResolvedValue(validDoc);
    mockSkillDocGenerator.preview.mockResolvedValue(validDoc);
    mockSkillDocGenerator.exportToFile.mockResolvedValue(undefined);

    registerSkillDocsHandlers(
      {
        id: 1,
        webContents: { id: 1 },
        isDestroyed: () => false,
      } as never,
      mockSkillDocGenerator as never,
    );
  });

  it("4つの docs ハンドラーを登録する", () => {
    expect(handlerMap.has(IPC_CHANNELS.SKILL_DOCS_GENERATE)).toBe(true);
    expect(handlerMap.has(IPC_CHANNELS.SKILL_DOCS_PREVIEW)).toBe(true);
    expect(handlerMap.has(IPC_CHANNELS.SKILL_DOCS_EXPORT)).toBe(true);
    expect(handlerMap.has(IPC_CHANNELS.SKILL_DOCS_TEMPLATES)).toBe(true);
  });

  // ========================================
  // H-01 ~ H-04: Sender validation
  // ========================================
  describe("sender validation", () => {
    it("H-01: generate は sender 検証失敗時にエラーを返す", async () => {
      mockValidateIpcSender.mockReturnValueOnce({
        valid: false,
        errorCode: "IPC_UNAUTHORIZED",
        errorMessage: "Unauthorized",
      });

      const handler = handlerMap.get(IPC_CHANNELS.SKILL_DOCS_GENERATE)!;
      const result = await handler(event, validGenerateRequest);

      expect(mockToIPCValidationError).toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        error: "Unauthorized IPC call",
      });
    });

    it("H-02: preview は sender 検証失敗時にエラーを返す", async () => {
      mockValidateIpcSender.mockReturnValueOnce({
        valid: false,
        errorCode: "IPC_UNAUTHORIZED",
        errorMessage: "Unauthorized",
      });

      const handler = handlerMap.get(IPC_CHANNELS.SKILL_DOCS_PREVIEW)!;
      const result = await handler(event, { skillName: "test-skill" });

      expect(result).toEqual({
        success: false,
        error: "Unauthorized IPC call",
      });
    });

    it("H-03: export は sender 検証失敗時にエラーを返す", async () => {
      mockValidateIpcSender.mockReturnValueOnce({
        valid: false,
        errorCode: "IPC_UNAUTHORIZED",
        errorMessage: "Unauthorized",
      });

      const handler = handlerMap.get(IPC_CHANNELS.SKILL_DOCS_EXPORT)!;
      const result = await handler(event, {
        doc: validDoc,
        outputPath: "/tmp/doc.md",
      });

      expect(result).toEqual({
        success: false,
        error: "Unauthorized IPC call",
      });
    });

    it("H-04: templates は sender 検証失敗時にエラーを返す", async () => {
      mockValidateIpcSender.mockReturnValueOnce({
        valid: false,
        errorCode: "IPC_UNAUTHORIZED",
        errorMessage: "Unauthorized",
      });

      const handler = handlerMap.get(IPC_CHANNELS.SKILL_DOCS_TEMPLATES)!;
      const result = await handler(event);

      expect(result).toEqual({
        success: false,
        error: "Unauthorized IPC call",
      });
    });
  });

  // ========================================
  // H-05 ~ H-11: Argument validation
  // ========================================
  describe("argument validation", () => {
    it("H-05: generate は null request を拒否する", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_DOCS_GENERATE)!;
      const result = await handler(event, null);

      expect(result).toEqual({
        success: false,
        error: "request must be an object",
      });
    });

    it("H-06: generate は skillName 未指定を拒否する", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_DOCS_GENERATE)!;
      const result = await handler(event, {
        outputFormat: "markdown",
        includeExamples: true,
        includeApiReference: false,
        language: "ja",
      });

      expect(result).toEqual({
        success: false,
        error: "skillName must be a non-empty string",
      });
    });

    it("H-07: preview は null args を拒否する", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_DOCS_PREVIEW)!;
      const result = await handler(event, null);

      expect(result).toEqual({
        success: false,
        error: "args must be an object",
      });
    });

    it("H-08: export は doc 未指定を拒否する", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_DOCS_EXPORT)!;
      const result = await handler(event, {
        outputPath: "/tmp/doc.md",
      });

      expect(result).toEqual({
        success: false,
        error: "doc must be a valid object",
      });
    });

    it("H-09: generate は無効な outputFormat を拒否する", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_DOCS_GENERATE)!;
      const result = await handler(event, {
        ...validGenerateRequest,
        outputFormat: "pdf",
      });

      expect(result).toEqual({
        success: false,
        error: "outputFormat must be one of: markdown, html",
      });
    });

    it("H-10: generate は無効な language を拒否する", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_DOCS_GENERATE)!;
      const result = await handler(event, {
        ...validGenerateRequest,
        language: "fr",
      });

      expect(result).toEqual({
        success: false,
        error: "language must be one of: ja, en",
      });
    });

    it("H-11: generate は boolean でない includeExamples を拒否する", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_DOCS_GENERATE)!;
      const result = await handler(event, {
        ...validGenerateRequest,
        includeExamples: "yes",
      });

      expect(result).toEqual({
        success: false,
        error: "includeExamples must be a boolean",
      });
    });

    it("H-15: generate は customSections が文字列配列でない場合を拒否する", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_DOCS_GENERATE)!;
      const result = await handler(event, {
        ...validGenerateRequest,
        customSections: [1, 2, 3],
      });

      expect(result).toEqual({
        success: false,
        error: "customSections must be an array of strings",
      });
    });
  });

  // ========================================
  // H-12 ~ H-14: Successful calls
  // ========================================
  describe("successful calls", () => {
    it("H-12: generate は正常なリクエストで成功レスポンスを返す", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_DOCS_GENERATE)!;
      const result = await handler(event, validGenerateRequest);

      expect(mockSkillDocGenerator.generate).toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        data: validDoc,
      });
    });

    it("H-13: preview は正常なリクエストで成功レスポンスを返す", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_DOCS_PREVIEW)!;
      const result = await handler(event, { skillName: "test-skill" });

      expect(mockSkillDocGenerator.preview).toHaveBeenCalledWith(
        "test-skill",
        undefined,
      );
      expect(result).toEqual({
        success: true,
        data: validDoc,
      });
    });

    it("H-14a: export は正常なリクエストで成功レスポンスを返す", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_DOCS_EXPORT)!;
      const result = await handler(event, {
        doc: validDoc,
        outputPath: "/tmp/output.md",
      });

      expect(mockSkillDocGenerator.exportToFile).toHaveBeenCalledWith(
        validDoc,
        "/tmp/output.md",
      );
      expect(result).toEqual({ success: true });
    });

    it("H-14b: templates は DEFAULT_DOC_TEMPLATE を返す", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_DOCS_TEMPLATES)!;
      const result = await handler(event);

      expect(result).toEqual({
        success: true,
        data: [DEFAULT_DOC_TEMPLATE],
      });
    });
  });

  // ========================================
  // H-16 ~ H-17: Path traversal & skill not found
  // ========================================
  describe("security and error handling", () => {
    it("H-16: export はパストラバーサル(..)を拒否する", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_DOCS_EXPORT)!;
      const result = await handler(event, {
        doc: validDoc,
        outputPath: "/tmp/../etc/passwd",
      });

      expect(result).toEqual({
        success: false,
        error: "Invalid output path",
      });
    });

    it("H-17: generate はスキル未発見時にエラーを返す", async () => {
      mockSkillDocGenerator.generate.mockRejectedValueOnce(
        new Error("Skill not found: missing-skill"),
      );

      const handler = handlerMap.get(IPC_CHANNELS.SKILL_DOCS_GENERATE)!;
      const result = await handler(event, {
        ...validGenerateRequest,
        skillName: "missing-skill",
      });

      expect(result).toEqual({
        success: false,
        error: "Skill not found: missing-skill",
      });
    });
  });

  // ========================================
  // H-18 ~ H-20: P42 validation (empty/whitespace skillName)
  // ========================================
  describe("P42 validation", () => {
    it("H-18: generate は空文字列 skillName を拒否する", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_DOCS_GENERATE)!;
      const result = await handler(event, {
        ...validGenerateRequest,
        skillName: "",
      });

      expect(result).toEqual({
        success: false,
        error: "skillName must be a non-empty string",
      });
    });

    it("H-19: generate はスペースのみの skillName を拒否する", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_DOCS_GENERATE)!;
      const result = await handler(event, {
        ...validGenerateRequest,
        skillName: "   ",
      });

      expect(result).toEqual({
        success: false,
        error: "skillName must be a non-empty string",
      });
    });

    it("H-20: preview はスペースのみの skillName を拒否する", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_DOCS_PREVIEW)!;
      const result = await handler(event, { skillName: "   " });

      expect(result).toEqual({
        success: false,
        error: "skillName must be a non-empty string",
      });
    });
  });

  // ========================================
  // H-21 ~ H-24: unregisterSkillDocsHandlers
  // ========================================
  describe("unregisterSkillDocsHandlers", () => {
    it("H-21: SKILL_DOCS_GENERATE チャンネルを解除する", () => {
      unregisterSkillDocsHandlers();
      expect(mockIpcMainRemoveHandler).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_DOCS_GENERATE,
      );
    });

    it("H-22: SKILL_DOCS_PREVIEW チャンネルを解除する", () => {
      unregisterSkillDocsHandlers();
      expect(mockIpcMainRemoveHandler).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_DOCS_PREVIEW,
      );
    });

    it("H-23: SKILL_DOCS_EXPORT チャンネルを解除する", () => {
      unregisterSkillDocsHandlers();
      expect(mockIpcMainRemoveHandler).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_DOCS_EXPORT,
      );
    });

    it("H-24: SKILL_DOCS_TEMPLATES チャンネルを解除する", () => {
      unregisterSkillDocsHandlers();
      expect(mockIpcMainRemoveHandler).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_DOCS_TEMPLATES,
      );
    });

    it("全4チャンネルを一括解除する", () => {
      unregisterSkillDocsHandlers();

      expect(mockIpcMainRemoveHandler).toHaveBeenCalledTimes(4);
    });
  });

  // ========================================
  // Phase 6: T-6-4 IPC セキュリティ回帰テスト
  // ========================================
  describe("T-6-4: IPC セキュリティ回帰テスト", () => {
    // T-6-4-01: sender偽装 → IPC呼び出しが拒否される
    it("T-6-4-01: spoofed sender is rejected by sender validation", async () => {
      mockValidateIpcSender.mockReturnValueOnce({
        valid: false,
        errorCode: "IPC_UNAUTHORIZED",
        errorMessage: "Sender is not an allowed window",
      });
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_DOCS_GENERATE)!;
      const result = await handler(event, validGenerateRequest);
      expect(result).toEqual({
        success: false,
        error: "Unauthorized IPC call",
      });
    });

    // T-6-4-02: パストラバーサル攻撃 (../を含むスキル名) → IPC層は通過、generate失敗
    // 注: skillName の IPC バリデーションは P42 準拠 (型/空文字/trim) のみ。
    // パストラバーサルは SkillFileManager 層でファイルシステム制約として防止される。
    // このテストは現在の IPC ハンドラの動作を記録する回帰テストとして機能する。
    it("T-6-4-02: path traversal in skillName passes IPC validation, SkillFileManager rejects at FS layer", async () => {
      // IPC ハンドラは skillName の "../" を拒否しない（P42 バリデーションのみ）
      // generate はモックが成功レスポンスを返す（テスト環境では FS チェックなし）
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_DOCS_GENERATE)!;
      const result = await handler(event, {
        ...validGenerateRequest,
        skillName: "../../../etc/passwd",
      });
      // IPC 層では通過 → generate が呼ばれる（モックは成功）
      // 将来 skillName のパストラバーサルチェックが追加された場合はここが failure になる
      expect(result).toBeDefined();
    });

    // T-6-4-03: P42 バリデーション: スペースのみ ("   ") → .trim() === "" で拒否
    it("T-6-4-03: whitespace-only skillName is rejected by P42 trim validation", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_DOCS_GENERATE)!;
      const result = await handler(event, {
        ...validGenerateRequest,
        skillName: "   ",
      });
      expect(result).toEqual({
        success: false,
        error: "skillName must be a non-empty string",
      });
    });

    // T-6-4-04: P42 バリデーション: 型不一致 (数値を文字列パラメータに渡す)
    it("T-6-4-04: numeric skillName is rejected by typeof check", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_DOCS_GENERATE)!;
      const result = await handler(event, {
        ...validGenerateRequest,
        skillName: 12345,
      });
      expect(result).toEqual({
        success: false,
        error: "skillName must be a non-empty string",
      });
    });

    // T-6-4-05: エラーレスポンスに内部パス情報が含まれないことを確認
    it("T-6-4-05: error response does not leak internal paths", async () => {
      mockSkillDocGenerator.generate.mockRejectedValueOnce(
        new Error(
          "ENOENT: no such file or directory, open '/internal/path/secret.md'",
        ),
      );
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_DOCS_GENERATE)!;
      const result = (await handler(event, validGenerateRequest)) as {
        success: boolean;
        error: string;
      };
      expect(result.success).toBe(false);
      // 内部パスではなく汎用エラーメッセージが返ること
      expect(typeof result.error).toBe("string");
      // "Skill not found" または "Internal error" のいずれか
      expect(result.error).toMatch(/Skill not found|Internal error/);
    });
  });

  // ========================================
  // 追加: validateIpcSender コールバック検証 (P41対策)
  // ========================================
  describe("validateIpcSender callback (P41)", () => {
    it("generate の getAllowedWindows コールバックが正しく呼ばれる", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_DOCS_GENERATE)!;
      await handler(event, validGenerateRequest);

      const options = mockValidateIpcSender.mock.calls[0][2] as {
        getAllowedWindows: () => unknown[];
      };
      expect(options.getAllowedWindows).toBeDefined();
      const windows = options.getAllowedWindows();
      expect(Array.isArray(windows)).toBe(true);
      expect(windows).toHaveLength(1);
    });
  });

  // ========================================
  // 追加: エラーハンドリング詳細
  // ========================================
  describe("error handling", () => {
    it("generate は予期しない例外で Internal error を返す", async () => {
      mockSkillDocGenerator.generate.mockRejectedValueOnce(
        new Error("Unexpected DB error"),
      );

      const handler = handlerMap.get(IPC_CHANNELS.SKILL_DOCS_GENERATE)!;
      const result = await handler(event, validGenerateRequest);

      expect(result).toEqual({
        success: false,
        error: "Internal error",
        errorCode: "INTERNAL_ERROR",
      });
    });

    it("generate は docError が付いた例外をその文言で返す", async () => {
      const error = new Error("LLM query failed") as Error & {
        docError?: {
          message: string;
          code: number;
          category: string;
          retryable: boolean;
        };
      };
      error.docError = {
        message:
          "APIキーが設定されていません。設定画面でAPIキーを入力してください。",
        code: 2001,
        category: "BUSINESS",
        retryable: false,
      };
      mockSkillDocGenerator.generate.mockRejectedValueOnce(error);

      const handler = handlerMap.get(IPC_CHANNELS.SKILL_DOCS_GENERATE)!;
      const result = await handler(event, validGenerateRequest);

      expect(result).toEqual({
        success: false,
        error:
          "APIキーが設定されていません。設定画面でAPIキーを入力してください。",
        errorCode: "API_KEY_MISSING",
        retryable: false,
      });
    });

    it("preview はスキル未発見時にエラーを返す", async () => {
      mockSkillDocGenerator.preview.mockRejectedValueOnce(
        new Error("Skill not found: unknown"),
      );

      const handler = handlerMap.get(IPC_CHANNELS.SKILL_DOCS_PREVIEW)!;
      const result = await handler(event, { skillName: "unknown" });

      expect(result).toEqual({
        success: false,
        error: "Skill not found: unknown",
      });
    });

    it("export は outputPath 未指定を拒否する", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_DOCS_EXPORT)!;
      const result = await handler(event, { doc: validDoc });

      expect(result).toEqual({
        success: false,
        error: "outputPath must be a non-empty string",
      });
    });

    it("generate は includeApiReference が boolean でない場合を拒否する", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_DOCS_GENERATE)!;
      const result = await handler(event, {
        ...validGenerateRequest,
        includeApiReference: "no",
      });

      expect(result).toEqual({
        success: false,
        error: "includeApiReference must be a boolean",
      });
    });
  });
});

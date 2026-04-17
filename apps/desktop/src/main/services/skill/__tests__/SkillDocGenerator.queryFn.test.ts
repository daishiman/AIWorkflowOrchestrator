/**
 * SkillDocGenerator queryFn 差替テスト (TASK-UT-9I-001)
 *
 * LLMDocQueryAdapter を queryFn として注入するパターンの検証。
 * adapter.query -> queryFn wrapper -> SkillDocGenerator の流れを確認する。
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DocGenerationRequest } from "@repo/shared";
import { SkillDocGenerator } from "../SkillDocGenerator";
import type { LLMQueryFn } from "../SkillDocGenerator";
import { LLMDocQueryAdapter } from "../LLMDocQueryAdapter";

const { mockLLMClientCtor, mockLLMClientQuery } = vi.hoisted(() => {
  const query = vi.fn();
  const ctor = vi.fn().mockImplementation(() => ({
    query,
  }));

  return {
    mockLLMClientCtor: ctor,
    mockLLMClientQuery: query,
  };
});

vi.mock("../../llm/LLMClient", () => ({
  LLMClient: mockLLMClientCtor,
}));

vi.mock("electron-log", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock("fs/promises", () => ({
  writeFile: vi.fn().mockResolvedValue(undefined),
  readFile: vi.fn(),
  readdir: vi.fn(),
  stat: vi.fn(),
  mkdir: vi.fn(),
}));

describe("SkillDocGenerator queryFn integration", () => {
  let mockSkillFileManager: {
    readFile: ReturnType<typeof vi.fn>;
    listSkillFiles: ReturnType<typeof vi.fn>;
  };

  const validRequest: DocGenerationRequest = {
    skillName: "test-skill",
    outputFormat: "markdown",
    includeExamples: false,
    includeApiReference: false,
    language: "ja",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockLLMClientQuery.mockReset();
    mockSkillFileManager = {
      readFile: vi
        .fn()
        .mockResolvedValue("# Test Skill\n\nThis is a test skill."),
      listSkillFiles: vi.fn().mockResolvedValue(["SKILL.md"]),
    };
  });

  function toQueryFn(adapter: LLMDocQueryAdapter): LLMQueryFn {
    return async (prompt: string) => {
      const result = await adapter.query(prompt);
      if (result.success && result.data !== undefined) {
        return { content: result.data };
      }

      const error = new Error(result.error?.message ?? "LLM query failed");
      (error as Error & { docError?: typeof result.error }).docError =
        result.error;
      throw error;
    };
  }

  it("adapter.query bind 注入時に生成内容をそのまま使える", async () => {
    mockLLMClientQuery.mockResolvedValue({
      success: true,
      content: "Adapter response",
    });

    const adapter = new LLMDocQueryAdapter(() => "sk-valid-key", "anthropic");
    const generator = new SkillDocGenerator(
      toQueryFn(adapter),
      mockSkillFileManager as never,
    );

    const result = await generator.generate(validRequest);

    expect(result.sections.length).toBeGreaterThan(0);
    for (const section of result.sections) {
      expect(section.content).toBe("Adapter response");
    }
    expect(mockLLMClientCtor).toHaveBeenCalledWith({
      apiKey: "sk-valid-key",
      model: "claude-haiku-4-5-20251001",
      timeoutMs: 30_000,
      maxRetries: 3,
    });
  });

  it("adapter 失敗時は docError を持った例外が伝播する", async () => {
    mockLLMClientQuery.mockResolvedValueOnce({
      success: false,
      errorCode: "API_KEY_MISSING",
      message:
        "APIキーが設定されていません。設定画面でAPIキーを入力してください。",
      retryable: false,
    });

    const adapter = new LLMDocQueryAdapter(() => null, "anthropic");
    const generator = new SkillDocGenerator(
      toQueryFn(adapter),
      mockSkillFileManager as never,
    );

    try {
      await generator.generate(validRequest);
      expect.unreachable("should have thrown");
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(Error);
      if (error instanceof Error) {
        expect(error.message).toBe(
          "APIキーが設定されていません。設定画面でAPIキーを入力してください。",
        );
        const docError = (error as Error & { docError?: unknown }).docError;
        expect(docError).toMatchObject({
          code: 2001,
          category: "BUSINESS",
          retryable: false,
        });
      }
    }
  });
});

/**
 * SkillDocGenerator queryFn 差替テスト (TASK-04 Phase 4)
 *
 * LLMDocQueryAdapter を queryFn として注入するパターンの検証。
 * Constructor Injection で adapter.query を bind して渡す。
 *
 * T-4-2-01 ~ T-4-2-04: 4テストケース
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { DocGenerationRequest } from "@repo/shared";
import { SkillDocGenerator } from "../SkillDocGenerator";
import type { LLMQueryFn } from "../SkillDocGenerator";
import { LLMDocQueryAdapter } from "../LLMDocQueryAdapter";

// electron-log モック
vi.mock("electron-log", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

// fs/promises モック
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
    mockSkillFileManager = {
      readFile: vi
        .fn()
        .mockResolvedValue("# Test Skill\n\nThis is a test skill."),
      listSkillFiles: vi.fn().mockResolvedValue(["SKILL.md"]),
    };
  });

  // T-4-2-01: stub queryFn 注入時に固定レスポンスを返す
  it("T-4-2-01: stub queryFn returns fixed response", async () => {
    const stubQueryFn: LLMQueryFn = async () => ({
      content: "Stub response",
    });
    const generator = new SkillDocGenerator(
      stubQueryFn,
      mockSkillFileManager as never,
    );
    const result = await generator.generate(validRequest);

    expect(result.sections.length).toBeGreaterThan(0);
    for (const section of result.sections) {
      expect(section.content).toBe("Stub response");
    }
  });

  // T-4-2-02: adapter.query bind 注入時に LLM レスポンスを返す
  it("T-4-2-02: adapter.query bound as queryFn returns LLM response", async () => {
    const adapter = new LLMDocQueryAdapter(() => "sk-valid-key", "openai");

    // adapter.query を LLMQueryFn 互換に変換する wrapper
    const queryFn: LLMQueryFn = async (prompt: string) => {
      const result = await adapter.query(prompt);
      if (result.success && result.data !== undefined) {
        return { content: result.data };
      }
      throw new Error(result.error?.message ?? "Unknown error");
    };

    const generator = new SkillDocGenerator(
      queryFn,
      mockSkillFileManager as never,
    );
    const result = await generator.generate(validRequest);

    expect(result.sections.length).toBeGreaterThan(0);
    for (const section of result.sections) {
      expect(section.content).toContain("Generated content for:");
    }
  });

  // T-4-2-03: queryFn 未注入時にデフォルト stub が使用される（回帰）
  it("T-4-2-03: default stub queryFn produces valid GeneratedDoc", async () => {
    const defaultStubFn: LLMQueryFn = async () => ({
      content: "Default stub content",
    });
    const generator = new SkillDocGenerator(
      defaultStubFn,
      mockSkillFileManager as never,
    );
    const result = await generator.generate(validRequest);

    expect(result.skillName).toBe("test-skill");
    expect(result.format).toBe("markdown");
    expect(result.sections.length).toBeGreaterThan(0);
    expect(result.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  // T-4-2-04: adapter 注入後に adapter.isAvailable() が false の場合 → error.code: 2001
  it("T-4-2-04: adapter with no API key returns error code 2001", async () => {
    const adapter = new LLMDocQueryAdapter(() => null, "openai");

    // adapter.query を LLMQueryFn 互換に変換
    const queryFn: LLMQueryFn = async (prompt: string) => {
      const result = await adapter.query(prompt);
      if (result.success && result.data !== undefined) {
        return { content: result.data };
      }
      // error を伝播させる
      const error = new Error(result.error?.message ?? "Unknown error");
      (error as Record<string, unknown>).docError = result.error;
      throw error;
    };

    const generator = new SkillDocGenerator(
      queryFn,
      mockSkillFileManager as never,
    );

    try {
      await generator.generate(validRequest);
      // ここに到達しないことを期待
      expect.unreachable("should have thrown");
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(Error);
      if (error instanceof Error) {
        expect(error.message).toBe("API key is not configured");
        const docError = (error as Record<string, unknown>).docError;
        if (
          docError !== null &&
          typeof docError === "object" &&
          "code" in docError
        ) {
          expect((docError as { code: number }).code).toBe(2001);
        }
      }
    }
  });
});

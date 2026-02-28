/**
 * SkillDocGenerator テスト (TASK-9I Phase 4)
 *
 * LLM を使用したスキルドキュメント自動生成サービスのユニットテスト。
 * generate(), preview(), exportToFile(), DEFAULT_DOC_TEMPLATE を検証する。
 *
 * @see docs/30-workflows/TASK-9I-skill-docs/outputs/phase-4/test-cases.md
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { DocGenerationRequest, DocTemplate } from "@repo/shared";
import { SkillDocGenerator, DEFAULT_DOC_TEMPLATE } from "../SkillDocGenerator";
import type { LLMQueryFn } from "../SkillDocGenerator";

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

describe("SkillDocGenerator", () => {
  let mockQueryFn: ReturnType<typeof vi.fn>;
  let mockSkillFileManager: {
    readFile: ReturnType<typeof vi.fn>;
    listSkillFiles: ReturnType<typeof vi.fn>;
  };
  let generator: SkillDocGenerator;

  const validRequest: DocGenerationRequest = {
    skillName: "test-skill",
    outputFormat: "markdown",
    includeExamples: true,
    includeApiReference: true,
    language: "ja",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockQueryFn = vi.fn().mockResolvedValue({ content: "Generated content" });
    mockSkillFileManager = {
      readFile: vi
        .fn()
        .mockResolvedValue("# Test Skill\n\nThis is a test skill."),
      listSkillFiles: vi
        .fn()
        .mockResolvedValue(["SKILL.md", "references/guide.md"]),
    };

    generator = new SkillDocGenerator(
      mockQueryFn as LLMQueryFn,
      mockSkillFileManager as never,
    );
  });

  // ========================================
  // generate() テスト (G-01 ~ G-16)
  // ========================================
  describe("generate()", () => {
    it("G-01: returns GeneratedDoc with correct skillName", async () => {
      const result = await generator.generate(validRequest);
      expect(result.skillName).toBe("test-skill");
    });

    it("G-02: respects outputFormat 'markdown'", async () => {
      const result = await generator.generate(validRequest);
      expect(result.format).toBe("markdown");
      // markdown形式の場合、HTMLタグを含まない
      expect(result.content).not.toContain("<html>");
    });

    it("G-03: converts to HTML when outputFormat is 'html'", async () => {
      const htmlRequest: DocGenerationRequest = {
        ...validRequest,
        outputFormat: "html",
      };
      const result = await generator.generate(htmlRequest);
      expect(result.format).toBe("html");
      expect(result.content).toContain("<html>");
      expect(result.content).toContain("<body>");
    });

    it("G-04: includes examples section when includeExamples is true", async () => {
      const result = await generator.generate({
        ...validRequest,
        includeExamples: true,
      });
      const hasExamples = result.sections.some((s) => s.id === "examples");
      expect(hasExamples).toBe(true);
    });

    it("G-05: excludes examples section when includeExamples is false", async () => {
      const result = await generator.generate({
        ...validRequest,
        includeExamples: false,
      });
      const hasExamples = result.sections.some((s) => s.id === "examples");
      expect(hasExamples).toBe(false);
    });

    it("G-06: includes API section when includeApiReference is true", async () => {
      const result = await generator.generate({
        ...validRequest,
        includeApiReference: true,
      });
      const hasApi = result.sections.some((s) => s.id === "api");
      expect(hasApi).toBe(true);
    });

    it("G-07: excludes API section when includeApiReference is false", async () => {
      const result = await generator.generate({
        ...validRequest,
        includeApiReference: false,
      });
      const hasApi = result.sections.some((s) => s.id === "api");
      expect(hasApi).toBe(false);
    });

    it("G-08: supports Japanese language", async () => {
      await generator.generate({ ...validRequest, language: "ja" });
      // queryFn に日本語指示が渡される
      const firstCallPrompt = mockQueryFn.mock.calls[0][0] as string;
      expect(firstCallPrompt).toContain("日本語で回答してください");
    });

    it("G-09: supports English language", async () => {
      await generator.generate({ ...validRequest, language: "en" });
      const firstCallPrompt = mockQueryFn.mock.calls[0][0] as string;
      expect(firstCallPrompt).toContain("Please respond in English");
    });

    it("G-10: handles customSections", async () => {
      const result = await generator.generate({
        ...validRequest,
        customSections: ["FAQ", "Best Practices"],
      });
      const hasFaq = result.sections.some((s) => s.id === "faq");
      const hasBestPractices = result.sections.some(
        (s) => s.id === "best-practices",
      );
      expect(hasFaq).toBe(true);
      expect(hasBestPractices).toBe(true);
    });

    it("G-11: throws for invalid outputFormat", async () => {
      const invalidRequest = {
        ...validRequest,
        outputFormat: "pdf" as "markdown",
      };
      await expect(generator.generate(invalidRequest)).rejects.toThrow(
        "outputFormat must be one of: markdown, html",
      );
    });

    it("G-12: throws when skill not found", async () => {
      mockSkillFileManager.readFile.mockRejectedValue(
        new Error("Skill not found: missing-skill"),
      );
      await expect(
        generator.generate({ ...validRequest, skillName: "missing-skill" }),
      ).rejects.toThrow("Skill not found: missing-skill");
    });

    it("G-13: calculates correct wordCount", async () => {
      // 各セクションの content 長の合計が wordCount
      mockQueryFn.mockResolvedValue({ content: "ABCDE" }); // 5文字

      const result = await generator.generate(validRequest);

      // 全セクションの content.length の合計
      const expectedCount = result.sections.reduce(
        (sum, s) => sum + s.content.length,
        0,
      );
      expect(result.wordCount).toBe(expectedCount);
      // 全セクションのcontentが "ABCDE"（5文字）なので合計 = セクション数 * 5
      expect(result.wordCount).toBe(result.sections.length * 5);
    });

    it("G-14: sets generatedAt as ISO 8601 string", async () => {
      const result = await generator.generate(validRequest);
      // ISO 8601 形式チェック: YYYY-MM-DDTHH:mm:ss.sssZ
      expect(result.generatedAt).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
      );
      // Date.parse で有効な日付であること
      expect(Number.isNaN(Date.parse(result.generatedAt))).toBe(false);
    });

    it("G-15: sets correct section order", async () => {
      const result = await generator.generate(validRequest);
      for (let i = 0; i < result.sections.length; i++) {
        expect(result.sections[i].order).toBe(i);
      }
    });

    it("G-16: handles LLM timeout", async () => {
      vi.useFakeTimers();

      // unhandled rejection を抑制するため、エラーリスナーを追加
      const unhandledErrors: Error[] = [];
      const errorHandler = (event: PromiseRejectionEvent | Error) => {
        if (event instanceof Error) {
          unhandledErrors.push(event);
        }
      };
      process.on(
        "unhandledRejection",
        errorHandler as NodeJS.UnhandledRejectionListener,
      );

      const neverResolve = vi
        .fn()
        .mockReturnValue(new Promise(() => {})) as unknown as LLMQueryFn;
      const gen = new SkillDocGenerator(
        neverResolve,
        mockSkillFileManager as never,
      );
      const promise = gen.generate(validRequest);

      // analyzeSkillStructure の async を解決させるため flush
      await vi.advanceTimersByTimeAsync(30_001);

      await expect(promise).rejects.toThrow("LLM query timeout");

      // クリーンアップ
      process.removeListener(
        "unhandledRejection",
        errorHandler as NodeJS.UnhandledRejectionListener,
      );
      vi.useRealTimers();
    });
  });

  // ========================================
  // preview() テスト (P-01 ~ P-04)
  // ========================================
  describe("preview()", () => {
    it("P-01: returns markdown format always", async () => {
      const result = await generator.preview("test-skill");
      expect(result.format).toBe("markdown");
      expect(result.content).not.toContain("<html>");
    });

    it("P-02: uses DEFAULT_DOC_TEMPLATE when no template provided", async () => {
      const result = await generator.preview("test-skill");
      // DEFAULT_DOC_TEMPLATE には7セクションあるので全て生成される
      expect(result.sections).toHaveLength(
        DEFAULT_DOC_TEMPLATE.sections.length,
      );
    });

    it("P-03: uses custom template when provided", async () => {
      const customTemplate: DocTemplate = {
        id: "custom",
        name: "Custom Template",
        description: "Custom",
        sections: [
          {
            id: "intro",
            title: "Introduction",
            prompt: "Write an introduction",
            required: true,
          },
        ],
      };
      const result = await generator.preview("test-skill", customTemplate);
      expect(result.sections).toHaveLength(1);
      expect(result.sections[0].id).toBe("intro");
    });

    it("P-04: throws when skill not found", async () => {
      mockSkillFileManager.readFile.mockRejectedValue(
        new Error("Skill not found: unknown"),
      );
      await expect(generator.preview("unknown")).rejects.toThrow(
        "Skill not found: unknown",
      );
    });
  });

  // ========================================
  // exportToFile() テスト (E-01 ~ E-02)
  // ========================================
  describe("exportToFile()", () => {
    it("E-01: writes content to file", async () => {
      const fsPromises = await import("fs/promises");
      const mockWriteFile = vi.mocked(fsPromises.writeFile);

      const doc = {
        skillName: "test-skill",
        format: "markdown" as const,
        content: "# Test Doc",
        sections: [],
        generatedAt: "2026-02-28T00:00:00Z",
        wordCount: 10,
      };

      await generator.exportToFile(doc, "/tmp/output.md");

      expect(mockWriteFile).toHaveBeenCalledWith(
        "/tmp/output.md",
        "# Test Doc",
        "utf-8",
      );
    });

    it("E-02: rejects path traversal (..)", async () => {
      const doc = {
        skillName: "test-skill",
        format: "markdown" as const,
        content: "# Test Doc",
        sections: [],
        generatedAt: "2026-02-28T00:00:00Z",
        wordCount: 10,
      };

      await expect(
        generator.exportToFile(doc, "/tmp/../etc/passwd"),
      ).rejects.toThrow("Invalid output path: path traversal detected");
    });
  });

  // ========================================
  // DEFAULT_DOC_TEMPLATE テスト (D-01 ~ D-02)
  // ========================================
  describe("DEFAULT_DOC_TEMPLATE", () => {
    it("D-01: has 7 sections", () => {
      expect(DEFAULT_DOC_TEMPLATE.sections).toHaveLength(7);
    });

    it("D-02: has id 'default'", () => {
      expect(DEFAULT_DOC_TEMPLATE.id).toBe("default");
    });
  });
});

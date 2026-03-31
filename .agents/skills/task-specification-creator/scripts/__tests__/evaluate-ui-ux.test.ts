import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fs from "fs";
import type { UXEvaluationResult } from "../evaluate-ui-ux-types";
import { loadPrompt } from "../evaluate-ui-ux-prompt-loader.js";

// Anthropic SDK をモック
const mockCreate = vi.fn();
vi.mock("@anthropic-ai/sdk", () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: mockCreate,
    },
  })),
}));

// fs モジュールをモック
vi.mock("fs", async () => {
  const actual = await vi.importActual<typeof import("fs")>("fs");
  const mocked = {
    ...actual,
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
    existsSync: vi.fn().mockReturnValue(false),
  };
  return { ...mocked, default: mocked };
});

// glob モジュールをモック
vi.mock("glob", () => ({
  glob: vi.fn().mockResolvedValue([]),
}));

// prompt-loader をモック
vi.mock("../evaluate-ui-ux-prompt-loader.js", () => ({
  loadPrompt: vi.fn().mockReturnValue("mocked evaluation prompt"),
}));

describe("evaluate-ui-ux", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===== evaluateUIWithClaude テスト =====
  describe("evaluateUIWithClaude", () => {
    // API-001: 正常な JSON レスポンスのパース
    it("API-001: 正常な JSON レスポンスを UXEvaluationResult にパースできる", async () => {
      const mockResult: UXEvaluationResult = {
        usabilityIssues: [
          { id: "UX-001", description: "ボタンが小さすぎる", severity: "HIGH" },
        ],
        accessibilityConcerns: [
          {
            id: "A11Y-001",
            concern: "コントラスト不足",
            wcagCriteria: "1.4.3",
            severity: "MEDIUM",
          },
        ],
        improvements: [
          { priority: 1, suggestion: "ボタンサイズ拡大", effort: "LOW" },
        ],
      };

      mockCreate.mockResolvedValueOnce({
        content: [
          {
            type: "text",
            text: JSON.stringify(mockResult),
          },
        ],
      });

      const mockPngBuffer = Buffer.from(
        "89504e470d0a1a0a0000000d49484452",
        "hex",
      );
      vi.mocked(fs.readFileSync).mockReturnValueOnce(mockPngBuffer);

      const { evaluateUIWithClaude } = await import("../evaluate-ui-ux");
      const result = await evaluateUIWithClaude(["test.png"]);

      expect(result.usabilityIssues).toHaveLength(1);
      expect(result.usabilityIssues[0].id).toBe("UX-001");
      expect(result.usabilityIssues[0].severity).toBe("HIGH");
      expect(result.accessibilityConcerns).toHaveLength(1);
      expect(result.improvements).toHaveLength(1);
    });

    // API-002: コードブロック付き JSON のパース
    it("API-002: コードブロック付き JSON を正常にパースできる", async () => {
      const innerJson: UXEvaluationResult = {
        usabilityIssues: [],
        accessibilityConcerns: [],
        improvements: [],
      };
      const mockText = `\`\`\`json\n${JSON.stringify(innerJson)}\n\`\`\``;

      mockCreate.mockResolvedValueOnce({
        content: [
          {
            type: "text",
            text: mockText,
          },
        ],
      });

      const mockPngBuffer = Buffer.from(
        "89504e470d0a1a0a0000000d49484452",
        "hex",
      );
      vi.mocked(fs.readFileSync).mockReturnValueOnce(mockPngBuffer);

      const { evaluateUIWithClaude } = await import("../evaluate-ui-ux");
      const result = await evaluateUIWithClaude(["test.png"]);

      expect(result.usabilityIssues).toEqual([]);
      expect(result.accessibilityConcerns).toEqual([]);
      expect(result.improvements).toEqual([]);
    });

    // API-003: API エラー時の例外処理
    it("API-003: API エラー時にエラーがそのまま伝播する", async () => {
      const apiError = new Error("API rate limit exceeded");
      mockCreate.mockRejectedValueOnce(apiError);

      const mockPngBuffer = Buffer.from(
        "89504e470d0a1a0a0000000d49484452",
        "hex",
      );
      vi.mocked(fs.readFileSync).mockReturnValueOnce(mockPngBuffer);

      const { evaluateUIWithClaude } = await import("../evaluate-ui-ux");

      await expect(evaluateUIWithClaude(["test.png"])).rejects.toThrow(
        "API rate limit exceeded",
      );
    });

    // API-004: 不正 JSON レスポンスの処理
    it("API-004: content[0].type が text でない場合に Error を投げる", async () => {
      mockCreate.mockResolvedValueOnce({
        content: [
          {
            type: "image",
            source: { type: "base64", data: "xxx" },
          },
        ],
      });

      const mockPngBuffer = Buffer.from(
        "89504e470d0a1a0a0000000d49484452",
        "hex",
      );
      vi.mocked(fs.readFileSync).mockReturnValueOnce(mockPngBuffer);

      const { evaluateUIWithClaude } = await import("../evaluate-ui-ux");

      await expect(evaluateUIWithClaude(["test.png"])).rejects.toThrow(
        "Unexpected response type from Claude API",
      );
    });

    // API-005: スクリーンショット base64 エンコード
    it("API-005: スクリーンショットを正しく base64 エンコードできる", async () => {
      const pngHeader = Buffer.from("89504e470d0a1a0a0000000d49484452", "hex");
      vi.mocked(fs.readFileSync).mockReturnValueOnce(pngHeader);

      const { encodeScreenshot } = await import("../evaluate-ui-ux");
      const encoded = encodeScreenshot("test.png");

      expect(typeof encoded).toBe("string");
      expect(encoded.length).toBeGreaterThan(0);

      const decoded = Buffer.from(encoded, "base64");
      expect(decoded.equals(pngHeader)).toBe(true);
    });

    it("API-006: taskContext をプロンプトローダーへ渡す", async () => {
      mockCreate.mockResolvedValueOnce({
        content: [
          {
            type: "text",
            text: JSON.stringify({
              usabilityIssues: [],
              accessibilityConcerns: [],
              improvements: [],
            }),
          },
        ],
      });

      const mockPngBuffer = Buffer.from(
        "89504e470d0a1a0a0000000d49484452",
        "hex",
      );
      vi.mocked(fs.readFileSync).mockReturnValueOnce(mockPngBuffer);

      const { evaluateUIWithClaude } = await import("../evaluate-ui-ux");
      await evaluateUIWithClaude(["test.png"], "TASK-CUSTOM-CONTEXT");

      expect(loadPrompt).toHaveBeenCalledWith(
        "evaluate-ui-ux.md",
        { taskContext: "TASK-CUSTOM-CONTEXT" },
        ["評価プロンプト", "重要度基準"],
      );
    });

    it("API-007: スクリーンショット 0 件ではエラーを投げる", async () => {
      const { evaluateUIWithClaude } = await import("../evaluate-ui-ux");

      await expect(evaluateUIWithClaude([])).rejects.toThrow(
        "評価対象のスクリーンショットが 0 件です",
      );
    });
  });

  // ===== saveEvaluationReport テスト =====
  describe("saveEvaluationReport", () => {
    const mockResult: UXEvaluationResult = {
      usabilityIssues: [
        { id: "UX-001", description: "ボタンが小さすぎる", severity: "HIGH" },
      ],
      accessibilityConcerns: [
        {
          id: "A11Y-001",
          concern: "コントラスト不足",
          wcagCriteria: "1.4.3",
          severity: "MEDIUM",
        },
      ],
      improvements: [
        { priority: 1, suggestion: "ボタンサイズ拡大", effort: "LOW" },
      ],
    };

    it("SAVE-001: Markdown ファイルが生成される（writeFileSync が呼ばれる）", async () => {
      const { saveEvaluationReport } = await import("../evaluate-ui-ux");

      await saveEvaluationReport(
        mockResult,
        "/tmp/output/ai-ux-evaluation.md",
        "TASK-TEST-001",
      );

      expect(fs.writeFileSync).toHaveBeenCalledOnce();
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        "/tmp/output/ai-ux-evaluation.md",
        expect.any(String),
        "utf-8",
      );
    });

    it("SAVE-002: 出力ディレクトリが recursive: true で自動作成される", async () => {
      const { saveEvaluationReport } = await import("../evaluate-ui-ux");

      await saveEvaluationReport(
        mockResult,
        "/tmp/deep/nested/output/ai-ux-evaluation.md",
        "TASK-TEST-001",
      );

      expect(fs.mkdirSync).toHaveBeenCalledWith("/tmp/deep/nested/output", {
        recursive: true,
      });
    });

    it("SAVE-003: 生成 Markdown に「ユーザビリティ問題」セクションが含まれる", async () => {
      const { saveEvaluationReport } = await import("../evaluate-ui-ux");

      await saveEvaluationReport(
        mockResult,
        "/tmp/output/ai-ux-evaluation.md",
        "TASK-TEST-001",
      );

      const writtenContent = vi.mocked(fs.writeFileSync).mock
        .calls[0][1] as string;
      expect(writtenContent).toContain("## ユーザビリティ問題");
      expect(writtenContent).toContain("## アクセシビリティ懸念");
      expect(writtenContent).toContain("## 改善提案");
      expect(writtenContent).toContain("## 次ステップ");
      expect(writtenContent).toContain("## 評価メタ情報");
    });

    it("SAVE-004: 引数の taskId がレポート内に含まれる", async () => {
      const { saveEvaluationReport } = await import("../evaluate-ui-ux");

      await saveEvaluationReport(
        mockResult,
        "/tmp/output/ai-ux-evaluation.md",
        "TASK-CUSTOM-ID-999",
      );

      const writtenContent = vi.mocked(fs.writeFileSync).mock
        .calls[0][1] as string;
      expect(writtenContent).toContain("TASK-CUSTOM-ID-999");
    });
  });

  // ===== generateUnassignedTasks テスト =====
  describe("generateUnassignedTasks", () => {
    it("TASK-001: HIGH 重要度の問題からのみ unassigned-task が生成される（2件）", async () => {
      const mockResult: UXEvaluationResult = {
        usabilityIssues: [
          { id: "UX-001", description: "ボタンが小さすぎる", severity: "HIGH" },
          { id: "UX-002", description: "色コントラスト不足", severity: "HIGH" },
        ],
        accessibilityConcerns: [],
        improvements: [],
      };

      const { generateUnassignedTasks } = await import("../evaluate-ui-ux");
      const files = await generateUnassignedTasks(
        mockResult,
        "/tmp/unassigned",
        "TASK-TEST-001",
      );

      expect(files).toHaveLength(2);
      expect(fs.writeFileSync).toHaveBeenCalledTimes(2);
    });

    it("TASK-002: MEDIUM/LOW 重要度の問題からは unassigned-task を生成しない", async () => {
      const mockResult: UXEvaluationResult = {
        usabilityIssues: [
          { id: "UX-001", description: "軽微な問題", severity: "MEDIUM" },
        ],
        accessibilityConcerns: [
          {
            id: "A11Y-001",
            concern: "低リスク",
            wcagCriteria: "1.1.1",
            severity: "LOW",
          },
        ],
        improvements: [],
      };

      const { generateUnassignedTasks } = await import("../evaluate-ui-ux");
      const files = await generateUnassignedTasks(
        mockResult,
        "/tmp/unassigned",
        "TASK-TEST-001",
      );

      expect(files).toHaveLength(0);
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });

    it("TASK-003: 生成ファイルが ui-ux-issue-YYYYMMDD-NNN.md 形式の命名規則に従う", async () => {
      const mockResult: UXEvaluationResult = {
        usabilityIssues: [
          { id: "UX-001", description: "テスト問題", severity: "HIGH" },
        ],
        accessibilityConcerns: [],
        improvements: [],
      };

      const { generateUnassignedTasks } = await import("../evaluate-ui-ux");
      const files = await generateUnassignedTasks(
        mockResult,
        "/tmp/unassigned",
        "TASK-TEST-001",
      );

      expect(files).toHaveLength(1);
      expect(files[0]).toMatch(/ui-ux-issue-\d{8}-001\.md$/);
    });

    it("TASK-004: 問題 0 件の場合は空配列を返す", async () => {
      const emptyResult: UXEvaluationResult = {
        usabilityIssues: [],
        accessibilityConcerns: [],
        improvements: [],
      };

      const { generateUnassignedTasks } = await import("../evaluate-ui-ux");
      const files = await generateUnassignedTasks(
        emptyResult,
        "/tmp/unassigned",
        "TASK-TEST-001",
      );

      expect(files).toHaveLength(0);
    });
  });

  // ===== Phase 6: エッジケーステスト =====
  describe("Edge Cases: AI UX エラーハンドリング", () => {
    it("EDGE-A001: API タイムアウト時にエラーが伝播する", async () => {
      const timeoutError = new Error("Request timed out");
      timeoutError.name = "APIConnectionTimeoutError";
      mockCreate.mockRejectedValueOnce(timeoutError);

      const mockPngBuffer = Buffer.from(
        "89504e470d0a1a0a0000000d49484452",
        "hex",
      );
      vi.mocked(fs.readFileSync).mockReturnValueOnce(mockPngBuffer);

      const { evaluateUIWithClaude } = await import("../evaluate-ui-ux");

      await expect(evaluateUIWithClaude(["test.png"])).rejects.toThrow(
        "Request timed out",
      );
    });

    it("EDGE-A002: content 配列が空の場合にエラーを投げる", async () => {
      mockCreate.mockResolvedValueOnce({
        content: [],
      });

      const mockPngBuffer = Buffer.from(
        "89504e470d0a1a0a0000000d49484452",
        "hex",
      );
      vi.mocked(fs.readFileSync).mockReturnValueOnce(mockPngBuffer);

      const { evaluateUIWithClaude } = await import("../evaluate-ui-ux");

      await expect(evaluateUIWithClaude(["test.png"])).rejects.toThrow();
    });

    it("EDGE-A003: 不正な JSON レスポンスで SyntaxError を投げる", async () => {
      mockCreate.mockResolvedValueOnce({
        content: [
          {
            type: "text",
            text: "This is not valid JSON at all {{{",
          },
        ],
      });

      const mockPngBuffer = Buffer.from(
        "89504e470d0a1a0a0000000d49484452",
        "hex",
      );
      vi.mocked(fs.readFileSync).mockReturnValueOnce(mockPngBuffer);

      const { evaluateUIWithClaude } = await import("../evaluate-ui-ux");

      await expect(evaluateUIWithClaude(["test.png"])).rejects.toThrow(
        SyntaxError,
      );
    });

    it("EDGE-A004: 同一結果を2回呼んでも日付ベースの連番で生成される", async () => {
      const mockResult: UXEvaluationResult = {
        usabilityIssues: [
          { id: "UX-001", description: "テスト問題", severity: "HIGH" },
        ],
        accessibilityConcerns: [],
        improvements: [],
      };

      const { generateUnassignedTasks } = await import("../evaluate-ui-ux");

      const files1 = await generateUnassignedTasks(
        mockResult,
        "/tmp/unassigned",
        "TASK-TEST-001",
      );
      const files2 = await generateUnassignedTasks(
        mockResult,
        "/tmp/unassigned",
        "TASK-TEST-001",
      );

      expect(files1).toHaveLength(1);
      expect(files2).toHaveLength(1);
      expect(files1[0]).toBe(files2[0]);
    });
  });

  describe("Edge Cases: フィードバックループ回帰", () => {
    it("EDGE-F001: HIGH 問題が解消された結果では unassigned-task が生成されない", async () => {
      const resolvedResult: UXEvaluationResult = {
        usabilityIssues: [
          {
            id: "UX-001",
            description: "以前の問題（解消済み）",
            severity: "LOW",
          },
        ],
        accessibilityConcerns: [],
        improvements: [],
      };

      const { generateUnassignedTasks } = await import("../evaluate-ui-ux");
      const files = await generateUnassignedTasks(
        resolvedResult,
        "/tmp/unassigned",
        "TASK-TEST-001",
      );

      expect(files).toHaveLength(0);
    });

    it("EDGE-F002: 生成された unassigned-task に必須フィールドが全て含まれる", async () => {
      const mockResult: UXEvaluationResult = {
        usabilityIssues: [
          { id: "UX-001", description: "重大な問題", severity: "HIGH" },
        ],
        accessibilityConcerns: [],
        improvements: [],
      };

      const { generateUnassignedTasks } = await import("../evaluate-ui-ux");
      await generateUnassignedTasks(
        mockResult,
        "/tmp/unassigned",
        "TASK-TEST-001",
      );

      const writtenContent = vi.mocked(fs.writeFileSync).mock
        .calls[0][1] as string;

      expect(writtenContent).toContain("## メタ情報");
      expect(writtenContent).toContain("タスク ID");
      expect(writtenContent).toContain("発見元");
      expect(writtenContent).toContain("重要度");
      expect(writtenContent).toContain("HIGH");
      expect(writtenContent).toContain("## 問題の説明");
      expect(writtenContent).toContain("## 受入条件");
      expect(writtenContent).toContain("TASK-TEST-001");
    });
  });
});

/**
 * ModifierSkillのユニットテスト
 * @module main/slide/__tests__/modifier-skill.test
 *
 * TDD Red Phase - Phase 4
 * テストID: MS-01 ~ MS-06
 *
 * このテストファイルは逆同期機能（index.html → structure.md）の
 * ModifierSkillコンポーネントをテストします。
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Agent SDKのモック
const mockAgentAPI = {
  query: vi.fn(),
  abort: vi.fn(),
  getStatus: vi.fn(),
  onMessage: vi.fn(),
};

vi.mock("../agent-client", () => ({
  getAgentAPI: () => mockAgentAPI,
}));

// fs/promisesのモック
vi.mock("fs/promises", () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  stat: vi.fn(),
}));

import { readFile } from "fs/promises";
import {
  createModifierSkill,
  buildModifierPrompt,
  parseModifierResponse,
  type ModifierContext,
  type StructureChange,
} from "../modifier-skill";

describe("ModifierSkill", () => {
  const testProjectPath = "/test/project";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // ==========================================================================
  // MS-01: プロンプト構築テスト
  // ==========================================================================
  describe("prompt building", () => {
    it("MS-01: should build correct prompt from context", async () => {
      const context: ModifierContext = {
        projectPath: testProjectPath,
        htmlContent: "<html><body><h1>Modified Title</h1></body></html>",
        structureContent: "# Original Title\n\n内容",
      };

      // buildModifierPrompt関数が存在することを確認
      expect(typeof buildModifierPrompt).toBe("function");

      const prompt = buildModifierPrompt(context);

      // プロンプトにHTML内容が含まれること
      expect(prompt).toContain(context.htmlContent);

      // プロンプトにstructure.md内容が含まれること
      expect(prompt).toContain(context.structureContent);

      // プロンプトにJSON形式の出力指示が含まれること
      expect(prompt).toMatch(/JSON|json/);

      // プロンプトに差分解析の指示が含まれること
      expect(prompt).toMatch(/diff|変更|差分/i);
    });

    it("should include system prompt for JSON output format", () => {
      const context: ModifierContext = {
        projectPath: testProjectPath,
        htmlContent: "<html></html>",
        structureContent: "# Title",
      };

      const prompt = buildModifierPrompt(context);

      // 構造化された出力形式の指示があること
      expect(prompt).toMatch(/changes|変更箇所/i);
    });
  });

  // ==========================================================================
  // MS-02 ~ MS-04: レスポンスパーステスト
  // ==========================================================================
  describe("response parsing", () => {
    it("MS-02: should parse valid JSON response", () => {
      const validResponse = JSON.stringify({
        changes: [
          {
            type: "modify",
            section: "# スライド1",
            before: "旧タイトル",
            after: "新タイトル",
          },
        ],
      });

      // parseModifierResponse関数が存在することを確認
      expect(typeof parseModifierResponse).toBe("function");

      const result = parseModifierResponse(validResponse);

      expect(result.success).toBe(true);
      expect(result.changes).toHaveLength(1);
      expect(result.changes![0]).toEqual({
        type: "modify",
        section: "# スライド1",
        before: "旧タイトル",
        after: "新タイトル",
      });
    });

    it("MS-03: should extract JSON from markdown block", () => {
      const markdownResponse = `
分析結果を以下に示します。

\`\`\`json
{
  "changes": [
    {
      "type": "add",
      "section": "# 新スライド",
      "after": "新しい内容"
    }
  ]
}
\`\`\`

以上が検出された変更です。
`;

      const result = parseModifierResponse(markdownResponse);

      expect(result.success).toBe(true);
      expect(result.changes).toHaveLength(1);
      expect(result.changes![0].type).toBe("add");
    });

    it("MS-04: should return error on invalid response", () => {
      const invalidResponses = [
        "これは有効なJSONではありません",
        "{ invalid json }",
        '{"changes": "not an array"}',
        "",
        "null",
      ];

      invalidResponses.forEach((response) => {
        const result = parseModifierResponse(response);

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });
    });
  });

  // ==========================================================================
  // MS-05 ~ MS-06: バリデーションテスト
  // ==========================================================================
  describe("validation", () => {
    it("MS-05: should validate structure changes format", () => {
      const validChange: StructureChange = {
        type: "modify",
        section: "# セクション",
        before: "変更前",
        after: "変更後",
      };

      const invalidChanges = [
        { type: "invalid", section: "# セクション" }, // 無効なtype
        { type: "modify" }, // sectionがない
        { type: "modify", section: "" }, // 空のsection
        { type: "add" }, // afterがない
        { type: "delete" }, // beforeがない
      ];

      // 有効な変更は成功すること
      const validResponse = JSON.stringify({ changes: [validChange] });
      const validResult = parseModifierResponse(validResponse);
      expect(validResult.success).toBe(true);

      // 無効な変更はエラーになること
      invalidChanges.forEach((change) => {
        const response = JSON.stringify({ changes: [change] });
        const result = parseModifierResponse(response);

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    it("MS-06: should handle empty changes array", () => {
      const emptyChangesResponse = JSON.stringify({ changes: [] });

      const result = parseModifierResponse(emptyChangesResponse);

      // 空の変更配列は有効（変更なしを意味する）
      expect(result.success).toBe(true);
      expect(result.changes).toHaveLength(0);
    });
  });

  // ==========================================================================
  // createModifierSkill統合テスト
  // ==========================================================================
  describe("createModifierSkill", () => {
    it("should create modifier skill instance", () => {
      // createModifierSkill関数が存在することを確認
      expect(typeof createModifierSkill).toBe("function");

      const skill = createModifierSkill();

      expect(skill).toBeDefined();
      expect(typeof skill.execute).toBe("function");
      expect(typeof skill.abort).toBe("function");
    });

    it("should execute modifier skill with correct context", async () => {
      const htmlContent = "<html><body>Updated content</body></html>";
      const structureContent = "# Original\n\nContent";

      (readFile as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(htmlContent)
        .mockResolvedValueOnce(structureContent);

      mockAgentAPI.query.mockResolvedValue({
        content: JSON.stringify({ changes: [] }),
      });

      const skill = createModifierSkill();
      const result = await skill.execute(testProjectPath);

      // Agent APIが正しいプロンプトで呼ばれること
      expect(mockAgentAPI.query).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: expect.stringContaining(htmlContent),
        }),
      );

      expect(result.success).toBe(true);
    });

    it("should handle Agent SDK timeout", async () => {
      const htmlContent = "<html></html>";
      const structureContent = "# Title";

      (readFile as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(htmlContent)
        .mockResolvedValueOnce(structureContent);

      // タイムアウトエラーをシミュレート
      mockAgentAPI.query.mockRejectedValue(new Error("Request timeout"));

      const skill = createModifierSkill();
      const result = await skill.execute(testProjectPath);

      expect(result.success).toBe(false);
      expect(result.error).toContain("timeout");
    });

    it("should handle abort during execution", async () => {
      const htmlContent = "<html></html>";
      const structureContent = "# Title";

      (readFile as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(htmlContent)
        .mockResolvedValueOnce(structureContent);

      // abort時にすぐリジェクトするモック
      let rejectFn: (reason?: unknown) => void;
      mockAgentAPI.query.mockImplementation(
        () =>
          new Promise((_, reject) => {
            rejectFn = reject;
          }),
      );

      // abort時にPromiseをリジェクトする
      mockAgentAPI.abort.mockImplementation(() => {
        if (rejectFn) {
          rejectFn(new Error("Aborted"));
        }
      });

      const skill = createModifierSkill();

      // 実行開始（完了を待たない）
      const executePromise = skill.execute(testProjectPath);

      // 少し待ってから中断（Promiseが開始されるのを待つ）
      await new Promise((resolve) => setTimeout(resolve, 10));

      // 中断
      skill.abort();

      expect(mockAgentAPI.abort).toHaveBeenCalled();

      // abort後、Promiseがリジェクトされること
      const result = await executePromise;
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  // ==========================================================================
  // 境界値テスト
  // ==========================================================================
  describe("boundary values", () => {
    it("should handle large HTML content", async () => {
      // 10MB近い大きなHTMLコンテンツ
      const largeHtml =
        "<html>" + "a".repeat(10 * 1024 * 1024 - 100) + "</html>";
      const structureContent = "# Title";

      (readFile as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(largeHtml)
        .mockResolvedValueOnce(structureContent);

      mockAgentAPI.query.mockResolvedValue({
        content: JSON.stringify({ changes: [] }),
      });

      const skill = createModifierSkill();
      const result = await skill.execute(testProjectPath);

      expect(result.success).toBe(true);
    });

    it("should reject HTML content over size limit", async () => {
      // 10MBを超えるHTMLコンテンツ
      const oversizedHtml =
        "<html>" + "a".repeat(10 * 1024 * 1024 + 100) + "</html>";
      const structureContent = "# Title";

      (readFile as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(oversizedHtml)
        .mockResolvedValueOnce(structureContent);

      const skill = createModifierSkill();
      const result = await skill.execute(testProjectPath);

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/size|limit|サイズ/i);
    });

    it("should handle multiple changes in response", () => {
      const multipleChanges = JSON.stringify({
        changes: [
          { type: "modify", section: "# セクション1", before: "a", after: "b" },
          { type: "add", section: "# セクション2", after: "新規" },
          { type: "delete", section: "# セクション3", before: "削除対象" },
        ],
      });

      const result = parseModifierResponse(multipleChanges);

      expect(result.success).toBe(true);
      expect(result.changes).toHaveLength(3);
    });
  });
});

/**
 * CodeGenerator ユニットテスト
 * Phase 6: テスト拡充 — 実クラスを使用
 * テストID: CG-001 ~ CG-005, CG-EX-001, CG-EX-002
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CodeGenerator } from "../CodeGenerator";
import type { ScriptExecutor } from "../ScriptExecutor";

describe("CodeGenerator", () => {
  let generator: CodeGenerator;

  const mockScriptExecutor = {
    execute: vi.fn(),
    executeJson: vi.fn(),
  } as unknown as ScriptExecutor;

  beforeEach(() => {
    vi.clearAllMocks();
    generator = new CodeGenerator();
  });

  describe("generateFromTemplate()", () => {
    it("CG-001: テンプレートから変数置換でスキルコードを生成する", () => {
      const template = "# {{name}}\n\n{{description}}";
      const variables = [
        { name: "name", value: "test-skill" },
        { name: "description", value: "A test skill" },
      ];

      const result = generator.generateFromTemplate(template, variables);

      expect(result).toContain("test-skill");
      expect(result).toContain("A test skill");
      expect(result).not.toContain("{{name}}");
      expect(result).not.toContain("{{description}}");
      expect(result).toBe("# test-skill\n\nA test skill");
    });

    it("CG-004: 空のテンプレートに対してエラーをスローする", () => {
      expect(() => generator.generateFromTemplate("", [])).toThrow(
        "Template must not be empty",
      );
      expect(() => generator.generateFromTemplate("   ", [])).toThrow(
        "Template must not be empty",
      );
    });

    it("CG-EX-002: 未定義変数が残る場合にそのまま出力する", () => {
      const template = "Hello {{name}}, your role is {{unknown}}";
      const variables = [{ name: "name", value: "Alice" }];

      const result = generator.generateFromTemplate(template, variables);

      expect(result).toBe("Hello Alice, your role is {{unknown}}");
      expect(result).toContain("{{unknown}}");
    });
  });

  describe("generateWithSDK()", () => {
    it("CG-002: ScriptExecutor を通じてコードを生成する", async () => {
      generator.setScriptExecutor(mockScriptExecutor);
      (
        mockScriptExecutor.execute as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: true,
        stdout: "generated code content",
        stderr: "",
        exitCode: 0,
      });

      const result = await generator.generateWithSDK(
        "Generate a file manager skill",
      );

      expect(result).toBe("generated code content");
      expect(mockScriptExecutor.execute).toHaveBeenCalledWith(
        "generate_code.js",
        ["--prompt", "Generate a file manager skill"],
      );
    });

    it("CG-002b: ScriptExecutor 未設定時にエラーをスローする", async () => {
      await expect(generator.generateWithSDK("Generate code")).rejects.toThrow(
        "ScriptExecutor is not configured",
      );
    });

    it("CG-EX-001: SDK タイムアウト時にエラーを返す", async () => {
      generator.setScriptExecutor(mockScriptExecutor);
      (
        mockScriptExecutor.execute as ReturnType<typeof vi.fn>
      ).mockRejectedValue(new Error("Script execution timed out"));

      await expect(
        generator.generateWithSDK("Generate a complex skill"),
      ).rejects.toThrow("Script execution timed out");
    });
  });

  describe("checkTypes()", () => {
    it("CG-003: 生成されたコードに対して型チェックを実行する", async () => {
      generator.setScriptExecutor(mockScriptExecutor);
      const typeCheckResult = {
        hasErrors: true,
        errors: [
          {
            file: "index.ts",
            line: 1,
            message: "Type 'string' is not assignable to type 'number'",
          },
        ],
      };
      (
        mockScriptExecutor.executeJson as ReturnType<typeof vi.fn>
      ).mockResolvedValue(typeCheckResult);

      const code = 'const x: number = "string";';
      const result = await generator.checkTypes(code);

      expect(result.hasErrors).toBe(true);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain("not assignable");
      expect(mockScriptExecutor.executeJson).toHaveBeenCalledWith(
        "check_types.js",
        ["--code", code],
      );
    });

    it("CG-003b: ScriptExecutor 未設定時にエラーをスローする", async () => {
      await expect(generator.checkTypes("const x = 1;")).rejects.toThrow(
        "ScriptExecutor is not configured",
      );
    });
  });

  describe("generateMultiFile()", () => {
    it("CG-005: マルチファイルのスキル構造を生成する", async () => {
      generator.setScriptExecutor(mockScriptExecutor);
      (
        mockScriptExecutor.execute as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: true,
        stdout: "SKILL.md\nagents/agent-1.md\nreferences/ref-1.md",
        stderr: "",
        exitCode: 0,
      });

      const result = await generator.generateMultiFile("multi-skill", {
        agents: ["agent-1"],
        references: ["ref-1"],
      });

      expect(result.files.length).toBe(3);
      expect(result.files.some((f: string) => f === "SKILL.md")).toBe(true);
      expect(result.files.some((f: string) => f.startsWith("agents/"))).toBe(
        true,
      );
      expect(
        result.files.some((f: string) => f.startsWith("references/")),
      ).toBe(true);
      expect(mockScriptExecutor.execute).toHaveBeenCalledWith(
        "generate_multi_file.js",
        [
          "--name",
          "multi-skill",
          "--agents",
          "agent-1",
          "--references",
          "ref-1",
        ],
      );
    });

    it("CG-005b: ScriptExecutor 未設定時にエラーをスローする", async () => {
      await expect(
        generator.generateMultiFile("test", { agents: [] }),
      ).rejects.toThrow("ScriptExecutor is not configured");
    });

    it("CG-005c: スクリプト実行失敗時にエラーをスローする", async () => {
      generator.setScriptExecutor(mockScriptExecutor);
      (
        mockScriptExecutor.execute as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: false,
        stdout: "",
        stderr: "Generation error",
        exitCode: 1,
      });

      await expect(
        generator.generateMultiFile("fail-skill", { agents: ["a"] }),
      ).rejects.toThrow("Multi-file generation failed: Generation error");
    });
  });
});

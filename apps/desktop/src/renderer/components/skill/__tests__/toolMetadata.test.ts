/**
 * toolMetadata.ts ユニットテスト
 *
 * TASK: task-imp-permission-tool-metadata-001
 * Phase 4: TDD Red - toolMetadata.tsの公開APIテスト
 */

import { describe, it, expect } from "vitest";
import {
  getRiskLevel,
  getSecurityImpact,
  getToolMetadata,
  type RiskLevel,
  type ToolMetadata,
} from "../toolMetadata";

describe("toolMetadata", () => {
  describe("getRiskLevel", () => {
    it("Bash → 'High' を返す", () => {
      expect(getRiskLevel("Bash")).toBe("High");
    });

    it("Read → 'Low' を返す", () => {
      expect(getRiskLevel("Read")).toBe("Low");
    });

    it("Write → 'Medium' を返す", () => {
      expect(getRiskLevel("Write")).toBe("Medium");
    });

    it("Edit → 'Medium' を返す", () => {
      expect(getRiskLevel("Edit")).toBe("Medium");
    });

    it("Glob → 'Low' を返す", () => {
      expect(getRiskLevel("Glob")).toBe("Low");
    });

    it("Grep → 'Low' を返す", () => {
      expect(getRiskLevel("Grep")).toBe("Low");
    });

    it("WebSearch → 'Low' を返す", () => {
      expect(getRiskLevel("WebSearch")).toBe("Low");
    });

    it("Task → 'Medium' を返す", () => {
      expect(getRiskLevel("Task")).toBe("Medium");
    });

    it("NotebookEdit → 'Medium' を返す", () => {
      expect(getRiskLevel("NotebookEdit")).toBe("Medium");
    });

    it("WebFetch → 'Medium' を返す", () => {
      expect(getRiskLevel("WebFetch")).toBe("Medium");
    });

    it("Skill → 'Medium' を返す", () => {
      expect(getRiskLevel("Skill")).toBe("Medium");
    });

    it("AskUser → 'Low' を返す", () => {
      expect(getRiskLevel("AskUser")).toBe("Low");
    });

    it("未定義ツール → 'Medium' を返す（デフォルト）", () => {
      expect(getRiskLevel("UnknownTool")).toBe("Medium");
    });

    it("空文字列 → 'Medium' を返す（デフォルト）", () => {
      expect(getRiskLevel("")).toBe("Medium");
    });
  });

  describe("getSecurityImpact", () => {
    it.each([
      ["Bash", "システムコマンドを実行します。任意のコード実行が可能です"],
      ["Read", "ファイルの内容を読み取ります"],
      ["Write", "ファイルに新しい内容を書き込みます"],
      ["Edit", "既存ファイルの内容を変更します"],
      ["Glob", "ファイルパターンで検索します"],
      ["Grep", "テキスト内容を検索します"],
      ["WebSearch", "Web検索を実行します"],
      ["Task", "サブタスクを実行します"],
      ["NotebookEdit", "Jupyterノートブックを編集します"],
      ["WebFetch", "Webコンテンツを取得します"],
      ["Skill", "スキルを実行します"],
      ["AskUser", "ユーザーに確認を行います"],
    ])("%s: 正しいセキュリティ影響テキストを返す", (toolName, expected) => {
      expect(getSecurityImpact(toolName)).toBe(expected);
    });

    it("各ツールのセキュリティ影響テキストが空でない", () => {
      const tools = [
        "Bash",
        "Read",
        "Write",
        "Edit",
        "Glob",
        "Grep",
        "WebSearch",
        "Task",
        "NotebookEdit",
        "WebFetch",
        "Skill",
        "AskUser",
      ];
      for (const tool of tools) {
        expect(getSecurityImpact(tool).length).toBeGreaterThan(0);
      }
    });

    it("セキュリティ影響テキストが1行（改行を含まない）", () => {
      const tools = [
        "Bash",
        "Read",
        "Write",
        "Edit",
        "Glob",
        "Grep",
        "WebSearch",
        "Task",
        "NotebookEdit",
        "WebFetch",
        "Skill",
        "AskUser",
      ];
      for (const tool of tools) {
        expect(getSecurityImpact(tool)).not.toContain("\n");
      }
    });

    it("未定義ツール → デフォルトテキストを返す", () => {
      expect(getSecurityImpact("UnknownTool")).toBe("ツールを実行します");
    });

    it("空文字列 → デフォルトテキストを返す", () => {
      expect(getSecurityImpact("")).toBe("ツールを実行します");
    });
  });

  describe("getToolMetadata", () => {
    it("各ツールに対してriskLevelとsecurityImpactを含むオブジェクトが返る", () => {
      const tools = [
        "Bash",
        "Read",
        "Write",
        "Edit",
        "Glob",
        "Grep",
        "WebSearch",
        "Task",
        "NotebookEdit",
        "WebFetch",
        "Skill",
        "AskUser",
      ];
      for (const tool of tools) {
        const metadata = getToolMetadata(tool);
        expect(metadata).toHaveProperty("riskLevel");
        expect(metadata).toHaveProperty("securityImpact");
        expect(typeof metadata.riskLevel).toBe("string");
        expect(typeof metadata.securityImpact).toBe("string");
      }
    });

    it("未定義ツール → デフォルト値が返る", () => {
      const metadata = getToolMetadata("UnknownTool");
      expect(metadata.riskLevel).toBe("Medium");
      expect(metadata.securityImpact).toBe("ツールを実行します");
    });

    it("BashのメタデータがriskLevel='High'を含む", () => {
      const metadata = getToolMetadata("Bash");
      expect(metadata.riskLevel).toBe("High");
      expect(metadata.securityImpact).toBe(
        "システムコマンドを実行します。任意のコード実行が可能です",
      );
    });

    it("ReadのメタデータがriskLevel='Low'を含む", () => {
      const metadata = getToolMetadata("Read");
      expect(metadata.riskLevel).toBe("Low");
      expect(metadata.securityImpact).toBe("ファイルの内容を読み取ります");
    });
  });

  describe("エッジケース", () => {
    it("getRiskLevelの返り値がRiskLevel型の値のいずれかである", () => {
      const validLevels: RiskLevel[] = ["Low", "Medium", "High", "Critical"];
      const tools = [
        "Bash",
        "Read",
        "Write",
        "Edit",
        "Glob",
        "Grep",
        "WebSearch",
        "Task",
        "NotebookEdit",
        "WebFetch",
        "Skill",
        "AskUser",
        "UnknownTool",
      ];
      for (const tool of tools) {
        expect(validLevels).toContain(getRiskLevel(tool));
      }
    });

    it("getToolMetadataの返り値がToolMetadata型に合致する", () => {
      const metadata: ToolMetadata = getToolMetadata("Bash");
      expect(metadata).toBeDefined();
      expect(typeof metadata.riskLevel).toBe("string");
      expect(typeof metadata.securityImpact).toBe("string");
    });

    it("非常に長いツール名に対してデフォルト値を返す", () => {
      const longName = "A".repeat(200);
      expect(getRiskLevel(longName)).toBe("Medium");
    });
  });
});

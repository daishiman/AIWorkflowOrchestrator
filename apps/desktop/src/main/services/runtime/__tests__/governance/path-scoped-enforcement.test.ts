/**
 * path-scoped-enforcement テスト
 * TASK-P0-09-U1: path-scoped-governance-runtime-enforcement
 *
 * RuntimeSkillCreatorFacade の createExecuteGovernanceCanUseTool / createImproveGovernanceCanUseTool が
 * canUseTool context（targetPath / allowedSkillRoot）を evaluateGovernanceToolUse に正しく渡し、
 * skill root 外の Write/Edit を deny することを検証する。
 */

import { describe, it, expect, beforeEach } from "vitest";
import { RuntimeSkillCreatorFacade } from "../../RuntimeSkillCreatorFacade";
import type { RuntimeSkillCreatorFacadeDeps } from "../../RuntimeSkillCreatorFacade";

// テスト用の最小限のモック SkillExecutor
const mockSkillExecutor = {
  execute: async () => ({
    executionId: "test-exec-id",
    success: true,
    sdkMessages: [],
  }),
};

function createTestFacade(): RuntimeSkillCreatorFacade {
  const deps: RuntimeSkillCreatorFacadeDeps = {
    skillExecutor: mockSkillExecutor as never,
  };
  return new RuntimeSkillCreatorFacade(deps);
}

// プライベートメソッドへのアクセス用型
type FacadePrivate = {
  createExecuteGovernanceCanUseTool: (skillRoot: string) => (
    toolName: string,
    input: Record<string, unknown>,
    options: { toolUseID: string },
  ) => Promise<{
    behavior: "allow" | "deny";
    toolUseID: string;
    message?: string;
  }>;
  createImproveGovernanceCanUseTool: (skillRoot: string) => (
    toolName: string,
    input: Record<string, unknown>,
    options: { toolUseID: string },
  ) => Promise<{
    behavior: "allow" | "deny";
    toolUseID: string;
    message?: string;
  }>;
  extractTargetPath: (input: Record<string, unknown>) => string | undefined;
};

const SKILL_ROOT = "/allowed/skills";
const OUTSIDE_PATH = "/outside/dangerous/path/file.ts";
const INSIDE_PATH = "/allowed/skills/my-skill/SKILL.md";
const TOOL_USE_ID = "test-tool-use-id";

describe("path-scoped governance enforcement", () => {
  let facade: RuntimeSkillCreatorFacade;
  let privateAccess: FacadePrivate;

  beforeEach(() => {
    facade = createTestFacade();
    privateAccess = facade as unknown as FacadePrivate;
  });

  describe("createExecuteGovernanceCanUseTool", () => {
    // TC-PATH-01: skill root 外の Write → deny
    it("TC-PATH-01: skill root 外の Write は deny される", async () => {
      const callback =
        privateAccess.createExecuteGovernanceCanUseTool(SKILL_ROOT);
      const result = await callback(
        "Write",
        { file_path: OUTSIDE_PATH },
        { toolUseID: TOOL_USE_ID },
      );
      expect(result.behavior).toBe("deny");
      expect(result.message).toContain(OUTSIDE_PATH);
    });

    // TC-PATH-02: skill root 内の Write → allow
    it("TC-PATH-02: skill root 内の Write は allow される", async () => {
      const callback =
        privateAccess.createExecuteGovernanceCanUseTool(SKILL_ROOT);
      const result = await callback(
        "Write",
        { file_path: INSIDE_PATH },
        { toolUseID: TOOL_USE_ID },
      );
      expect(result.behavior).toBe("allow");
    });

    // TC-PATH-03: context なし（input にパスがない）→ tool-level 判定（Write は execute で allow）
    it("TC-PATH-03: input にパスがない場合は tool-level 判定のみ（Write は execute で allow）", async () => {
      const callback =
        privateAccess.createExecuteGovernanceCanUseTool(SKILL_ROOT);
      const result = await callback("Write", {}, { toolUseID: TOOL_USE_ID });
      expect(result.behavior).toBe("allow");
    });

    // TC-PATH-04: input.path キー（file_path なし）からの targetPath 抽出
    it("TC-PATH-04: input.path キーのみの場合も targetPath として抽出し deny される", async () => {
      const callback =
        privateAccess.createExecuteGovernanceCanUseTool(SKILL_ROOT);
      const result = await callback(
        "Write",
        { path: OUTSIDE_PATH }, // file_path なし、path のみ
        { toolUseID: TOOL_USE_ID },
      );
      expect(result.behavior).toBe("deny");
      expect(result.message).toContain(OUTSIDE_PATH);
    });

    // TC-PATH-06: skillRoot が空文字列の場合は context なし扱い（後方互換）
    it("TC-PATH-06: skillRoot が空文字列の場合は tool-level 判定のみ（context なし扱い）", async () => {
      const callback = privateAccess.createExecuteGovernanceCanUseTool(""); // 空文字列
      const result = await callback(
        "Write",
        { file_path: OUTSIDE_PATH }, // root 外のパスでも
        { toolUseID: TOOL_USE_ID },
      );
      // allowedSkillRoot が falsy → path-scoped チェックをスキップ → tool-level 判定（Write は execute で allow）
      expect(result.behavior).toBe("allow");
    });
  });

  describe("createImproveGovernanceCanUseTool", () => {
    // TC-PATH-05: improve phase での path-scoped deny
    it("TC-PATH-05: improve phase で skill root 外への Edit は deny される", async () => {
      const callback =
        privateAccess.createImproveGovernanceCanUseTool(SKILL_ROOT);
      const result = await callback(
        "Edit",
        { file_path: OUTSIDE_PATH },
        { toolUseID: TOOL_USE_ID },
      );
      expect(result.behavior).toBe("deny");
      expect(result.message).toContain(OUTSIDE_PATH);
    });

    // improve: skill root 内は allow
    it("improve phase で skill root 内への Edit は allow される", async () => {
      const callback =
        privateAccess.createImproveGovernanceCanUseTool(SKILL_ROOT);
      const result = await callback(
        "Edit",
        { file_path: INSIDE_PATH },
        { toolUseID: TOOL_USE_ID },
      );
      expect(result.behavior).toBe("allow");
    });
  });

  describe("extractTargetPath", () => {
    it("file_path を優先して返す", () => {
      const result = privateAccess.extractTargetPath({
        file_path: "/path/via/file_path",
        path: "/path/via/path",
      });
      expect(result).toBe("/path/via/file_path");
    });

    it("file_path がない場合は path にフォールバック", () => {
      const result = privateAccess.extractTargetPath({
        path: "/path/via/path",
      });
      expect(result).toBe("/path/via/path");
    });

    it("どちらもない場合は undefined を返す", () => {
      const result = privateAccess.extractTargetPath({});
      expect(result).toBeUndefined();
    });

    it("file_path が string 以外の場合は無視する", () => {
      const result = privateAccess.extractTargetPath({
        file_path: 123,
        path: "/fallback/path",
      });
      expect(result).toBe("/fallback/path");
    });
  });
});

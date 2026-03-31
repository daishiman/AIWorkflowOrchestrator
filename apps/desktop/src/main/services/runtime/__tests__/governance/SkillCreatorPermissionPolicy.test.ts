/**
 * SkillCreatorPermissionPolicy テスト
 * TASK-P0-09: Phase 4 - テスト作成
 */
import { describe, it, expect } from "vitest";
import {
  getPolicy,
  canUseTool,
  getAllPolicies,
} from "../../governance/SkillCreatorPermissionPolicy";
import type { SkillCreatorGovernancePhase } from "@repo/shared/types";

describe("SkillCreatorPermissionPolicy", () => {
  describe("getPolicy", () => {
    it("plan phase は default permissionMode を返す", () => {
      const policy = getPolicy("plan");
      expect(policy.phase).toBe("plan");
      expect(policy.permissionMode).toBe("default");
    });

    it("execute phase は acceptEdits permissionMode を返す", () => {
      const policy = getPolicy("execute");
      expect(policy.phase).toBe("execute");
      expect(policy.permissionMode).toBe("acceptEdits");
    });

    it("verify phase は default permissionMode を返す", () => {
      const policy = getPolicy("verify");
      expect(policy.phase).toBe("verify");
      expect(policy.permissionMode).toBe("default");
    });

    it("improve phase は acceptEdits permissionMode を返す", () => {
      const policy = getPolicy("improve");
      expect(policy.phase).toBe("improve");
      expect(policy.permissionMode).toBe("acceptEdits");
    });

    it("plan phase は Write/Edit を disallow する", () => {
      const policy = getPolicy("plan");
      expect(policy.disallowedTools).toContain("Write");
      expect(policy.disallowedTools).toContain("Edit");
    });

    it("execute phase は Write/Edit を allow する", () => {
      const policy = getPolicy("execute");
      expect(policy.allowedTools).toContain("Write");
      expect(policy.allowedTools).toContain("Edit");
    });

    it("verify phase は Write/Edit を disallow する", () => {
      const policy = getPolicy("verify");
      expect(policy.disallowedTools).toContain("Write");
      expect(policy.disallowedTools).toContain("Edit");
    });

    it("improve phase は Edit を allow し Write を disallow する", () => {
      const policy = getPolicy("improve");
      expect(policy.allowedTools).toContain("Edit");
      expect(policy.disallowedTools).toContain("Write");
    });

    it("全 phase で Read を allow する", () => {
      const phases: SkillCreatorGovernancePhase[] = [
        "plan",
        "execute",
        "verify",
        "improve",
      ];
      for (const phase of phases) {
        expect(getPolicy(phase).allowedTools).toContain("Read");
      }
    });

    it("全 phase で NotebookEdit を disallow する", () => {
      const phases: SkillCreatorGovernancePhase[] = [
        "plan",
        "execute",
        "verify",
        "improve",
      ];
      for (const phase of phases) {
        expect(getPolicy(phase).disallowedTools).toContain("NotebookEdit");
      }
    });
  });

  describe("canUseTool", () => {
    it("plan phase で Read は allowed", () => {
      const result = canUseTool("Read", "plan");
      expect(result.allowed).toBe(true);
      expect(result.phase).toBe("plan");
      expect(result.toolName).toBe("Read");
    });

    it("plan phase で Write は denied", () => {
      const result = canUseTool("Write", "plan");
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("disallowed");
      expect(result.phase).toBe("plan");
    });

    it("plan phase で Edit は denied", () => {
      const result = canUseTool("Edit", "plan");
      expect(result.allowed).toBe(false);
    });

    it("execute phase で Write は allowed", () => {
      const result = canUseTool("Write", "execute");
      expect(result.allowed).toBe(true);
    });

    it("execute phase で Edit は allowed", () => {
      const result = canUseTool("Edit", "execute");
      expect(result.allowed).toBe(true);
    });

    it("verify phase で Bash は allowed (テスト実行用)", () => {
      const result = canUseTool("Bash", "verify");
      expect(result.allowed).toBe(true);
    });

    it("verify phase で Write は denied", () => {
      const result = canUseTool("Write", "verify");
      expect(result.allowed).toBe(false);
    });

    it("improve phase で Edit は allowed", () => {
      const result = canUseTool("Edit", "improve");
      expect(result.allowed).toBe(true);
    });

    it("improve phase で Write は denied", () => {
      const result = canUseTool("Write", "improve");
      expect(result.allowed).toBe(false);
    });

    it("全 phase で NotebookEdit は denied", () => {
      const phases: SkillCreatorGovernancePhase[] = [
        "plan",
        "execute",
        "verify",
        "improve",
      ];
      for (const phase of phases) {
        const result = canUseTool("NotebookEdit", phase);
        expect(result.allowed).toBe(false);
        expect(result.reason).toContain("disallowed");
      }
    });

    it("allowedTools に含まれない未知ツールは denied", () => {
      const result = canUseTool("UnknownTool", "plan");
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("not in allowedTools");
    });

    it("denied の場合は reason が非空文字列", () => {
      const result = canUseTool("Write", "plan");
      expect(result.reason).toBeTruthy();
      expect(typeof result.reason).toBe("string");
    });

    describe("context-aware 判定", () => {
      it("execute phase で skill root 内の Write は allowed", () => {
        const result = canUseTool("Write", "execute", {
          targetPath: "/skills/my-skill/SKILL.md",
          allowedSkillRoot: "/skills/my-skill",
        });
        expect(result.allowed).toBe(true);
      });

      it("execute phase で skill root 外の Write は denied", () => {
        const result = canUseTool("Write", "execute", {
          targetPath: "/other/file.ts",
          allowedSkillRoot: "/skills/my-skill",
        });
        expect(result.allowed).toBe(false);
        expect(result.reason).toContain("outside allowed skill root");
      });

      it("improve phase で skill root 外の Edit は denied", () => {
        const result = canUseTool("Edit", "improve", {
          targetPath: "/etc/config",
          allowedSkillRoot: "/skills/target",
        });
        expect(result.allowed).toBe(false);
      });

      it("context なしの場合は基本判定のみ", () => {
        const result = canUseTool("Write", "execute");
        expect(result.allowed).toBe(true);
      });

      it("plan phase では context があっても write 系は disallow で先に拒否", () => {
        const result = canUseTool("Write", "plan", {
          targetPath: "/skills/my-skill/SKILL.md",
          allowedSkillRoot: "/skills/my-skill",
        });
        expect(result.allowed).toBe(false);
        expect(result.reason).toContain("disallowed");
      });
    });
  });

  describe("getAllPolicies", () => {
    it("4 phase 分の policy を返す", () => {
      const policies = getAllPolicies();
      expect(Object.keys(policies)).toHaveLength(4);
      expect(policies).toHaveProperty("plan");
      expect(policies).toHaveProperty("execute");
      expect(policies).toHaveProperty("verify");
      expect(policies).toHaveProperty("improve");
    });

    it("返却オブジェクトは frozen", () => {
      const policies = getAllPolicies();
      expect(Object.isFrozen(policies)).toBe(true);
    });
  });
});

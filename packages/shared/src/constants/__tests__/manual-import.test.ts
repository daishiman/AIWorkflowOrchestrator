/**
 * 手動テスト: インポート動作確認
 * Phase 11: 手動テスト検証
 */
import { describe, it, expect } from "vitest";
import {
  DANGEROUS_PATTERNS,
  ALLOWED_TOOLS_WHITELIST,
  MAX_SKILL_NAME_LENGTH,
  SKILL_NAME_PATTERN,
  isDangerousCommand,
  isProtectedPath,
  matchGlobPattern,
  validateAllowedTools,
  filterAllowedTools,
  type AllowedTool,
} from "../index";

describe("Phase 11: Manual Import Verification", () => {
  describe("Task 11-2: Import from @repo/shared/constants", () => {
    it("should export skill name constants", () => {
      expect(MAX_SKILL_NAME_LENGTH).toBe(64);
      expect(Number.isInteger(MAX_SKILL_NAME_LENGTH)).toBe(true);
      expect(SKILL_NAME_PATTERN).toBeInstanceOf(RegExp);
      expect(SKILL_NAME_PATTERN.source).toBe("^[a-z0-9]+(-[a-z0-9]+)*$");
      expect(SKILL_NAME_PATTERN.test("my-skill")).toBe(true);
      expect(SKILL_NAME_PATTERN.test("My_Skill")).toBe(false);
    });

    it("should export DANGEROUS_PATTERNS with correct counts", () => {
      expect(DANGEROUS_PATTERNS.BASH_COMMANDS.length).toBe(24);
      expect(DANGEROUS_PATTERNS.PROTECTED_PATHS.length).toBe(25);
    });

    it("should export ALLOWED_TOOLS_WHITELIST with 11 tools", () => {
      expect(ALLOWED_TOOLS_WHITELIST.length).toBe(11);
    });

    it("should export isDangerousCommand function", () => {
      expect(typeof isDangerousCommand).toBe("function");
      expect(isDangerousCommand("rm -rf /")).toBe(true);
      expect(isDangerousCommand("ls")).toBe(false);
    });

    it("should export isProtectedPath function", () => {
      expect(typeof isProtectedPath).toBe("function");
      expect(isProtectedPath("/etc/passwd")).toBe(true);
      expect(isProtectedPath("/tmp/test")).toBe(false);
    });

    it("should export matchGlobPattern function", () => {
      expect(typeof matchGlobPattern).toBe("function");
      expect(matchGlobPattern("/etc/passwd", "/etc/**")).toBe(true);
    });

    it("should export validateAllowedTools function", () => {
      expect(typeof validateAllowedTools).toBe("function");
      expect(validateAllowedTools(["Read"])).toBe(true);
      expect(validateAllowedTools(["Unknown"])).toBe(false);
    });

    it("should export filterAllowedTools function", () => {
      expect(typeof filterAllowedTools).toBe("function");
      const filtered: AllowedTool[] = filterAllowedTools(["Read", "Invalid"]);
      expect(filtered).toEqual(["Read"]);
    });

    it("should correctly type AllowedTool", () => {
      const tool: AllowedTool = "Read";
      expect(ALLOWED_TOOLS_WHITELIST.includes(tool)).toBe(true);
    });
  });

  describe("Task 11-3: Edge Cases", () => {
    it("should handle HOME path expansion", () => {
      const homeDir = process.env.HOME || "";
      if (homeDir) {
        expect(isProtectedPath(`${homeDir}/.ssh/id_rsa`)).toBe(true);
      }
    });

    it("should return false for empty command string", () => {
      expect(isDangerousCommand("")).toBe(false);
    });

    it("should return true for empty tools array", () => {
      expect(validateAllowedTools([])).toBe(true);
    });

    it("should be case-sensitive for tool names", () => {
      expect(validateAllowedTools(["read"])).toBe(false); // lowercase
      expect(validateAllowedTools(["Read"])).toBe(true); // correct case
    });

    it("should return empty array for all invalid tools", () => {
      expect(filterAllowedTools(["invalid", "unknown"])).toEqual([]);
    });
  });
});

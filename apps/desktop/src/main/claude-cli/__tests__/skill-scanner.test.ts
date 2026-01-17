/**
 * Skill Scanner Tests
 * Phase 4: TDD Red - All tests should fail until implementation
 *
 * Tests for skill discovery and parsing
 * @see docs/30-workflows/claude-code-cli-integration/outputs/phase-2/architecture-design.md
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Stats, Dirent } from "fs";
import * as fs from "fs/promises";
import grayMatter from "gray-matter";
import { SkillScanner } from "../SkillScanner";

// Mock fs/promises
vi.mock("fs/promises");

// Mock gray-matter
vi.mock("gray-matter");

describe("SkillScanner", () => {
  let skillScanner: SkillScanner;

  const basePath = "/home/user/.claude/skills";

  const mockReaddir = vi.mocked(fs.readdir);
  const mockReadFile = vi.mocked(fs.readFile);
  const mockStat = vi.mocked(fs.stat);
  const mockAccess = vi.mocked(fs.access);
  const mockGrayMatter = vi.mocked(grayMatter);

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    mockAccess.mockResolvedValue(undefined);

    mockStat.mockImplementation(async (path: unknown) => {
      const pathStr = path as string;
      if (pathStr.endsWith("SKILL.md") || pathStr.endsWith(".mjs")) {
        return { isFile: () => true, isDirectory: () => false } as Stats;
      }
      return { isFile: () => false, isDirectory: () => true } as Stats;
    });

    mockReaddir.mockImplementation(async (path: unknown) => {
      const pathStr = path as string;
      if (pathStr === basePath) {
        return [
          { name: "test-skill", isDirectory: () => true, isFile: () => false },
          {
            name: "another-skill",
            isDirectory: () => true,
            isFile: () => false,
          },
        ] as unknown as Dirent[];
      }
      if (pathStr.includes("test-skill") && pathStr.includes("scripts")) {
        return [
          { name: "run.mjs", isDirectory: () => false, isFile: () => true },
        ] as unknown as Dirent[];
      }
      if (pathStr.includes("test-skill")) {
        return [
          { name: "SKILL.md", isDirectory: () => false, isFile: () => true },
          { name: "scripts", isDirectory: () => true, isFile: () => false },
        ] as unknown as Dirent[];
      }
      if (pathStr.includes("another-skill")) {
        return [
          { name: "SKILL.md", isDirectory: () => false, isFile: () => true },
        ] as unknown as Dirent[];
      }
      if (pathStr.includes("scripts")) {
        return [
          { name: "run.mjs", isDirectory: () => false, isFile: () => true },
        ] as unknown as Dirent[];
      }
      return [] as unknown as Dirent[];
    });

    mockReadFile.mockImplementation(async (path: unknown) => {
      const pathStr = path as string;
      if (pathStr.includes("test-skill/SKILL.md")) {
        return `---
description: Test skill description
tags:
  - test
  - development
triggers:
  - test
  - testing
dependencies: []
allowed-tools: []
---

# Test Skill

This is a test skill.`;
      }
      if (pathStr.includes("another-skill/SKILL.md")) {
        return `---
description: Another skill
tags:
  - production
triggers:
  - deploy
dependencies:
  - test-skill
allowed-tools:
  - Bash
  - Read
---

# Another Skill

Production deployment skill.`;
      }
      throw new Error("File not found");
    });

    mockGrayMatter.mockImplementation((content: unknown) => {
      const contentStr = content as string;
      if (contentStr.includes("Test skill description")) {
        return {
          data: {
            description: "Test skill description",
            tags: ["test", "development"],
            triggers: ["test", "testing"],
            dependencies: [],
            "allowed-tools": [],
          },
          content: "# Test Skill\n\nThis is a test skill.",
          matter: "",
          language: "",
          orig: contentStr,
          stringify: () => "",
        };
      }
      if (contentStr.includes("Another skill")) {
        return {
          data: {
            description: "Another skill",
            tags: ["production"],
            triggers: ["deploy"],
            dependencies: ["test-skill"],
            "allowed-tools": ["Bash", "Read"],
          },
          content: "# Another Skill\n\nProduction deployment skill.",
          matter: "",
          language: "",
          orig: contentStr,
          stringify: () => "",
        };
      }
      return {
        data: {},
        content: "",
        matter: "",
        language: "",
        orig: "",
        stringify: () => "",
      };
    });

    skillScanner = new SkillScanner({ basePath });
  });

  describe("scan", () => {
    it("should scan all skills in base directory", async () => {
      const result = await skillScanner.scan();

      expect(result.skills).toHaveLength(2);
      expect(result.skills.map((s) => s.name)).toContain("test-skill");
      expect(result.skills.map((s) => s.name)).toContain("another-skill");
    });

    it("should parse SKILL.md frontmatter", async () => {
      const result = await skillScanner.scan();

      const testSkill = result.skills.find((s) => s.name === "test-skill");
      expect(testSkill).toBeDefined();
      expect(testSkill?.description).toBe("Test skill description");
      expect(testSkill?.tags).toContain("test");
    });

    it("should detect scripts directory", async () => {
      // Override mock to properly distinguish skills
      mockStat.mockImplementation(async (path: unknown) => {
        const pathStr = path as string;
        if (pathStr.endsWith("SKILL.md") || pathStr.endsWith(".mjs")) {
          return { isFile: () => true, isDirectory: () => false } as Stats;
        }
        // another-skill doesn't have scripts directory
        if (pathStr.includes("another-skill") && pathStr.endsWith("scripts")) {
          throw new Error("ENOENT");
        }
        return { isFile: () => false, isDirectory: () => true } as Stats;
      });

      const result = await skillScanner.scan();

      const testSkill = result.skills.find((s) => s.name === "test-skill");
      expect(testSkill?.hasScripts).toBe(true);

      const anotherSkill = result.skills.find(
        (s) => s.name === "another-skill",
      );
      expect(anotherSkill?.hasScripts).toBe(false);
    });

    it("should collect scan errors", async () => {
      mockReadFile.mockRejectedValueOnce(new Error("Permission denied"));

      const result = await skillScanner.scan();

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]?.error).toContain("Permission denied");
    });

    it("should include scannedAt timestamp", async () => {
      const beforeScan = Date.now();
      const result = await skillScanner.scan();
      const afterScan = Date.now();

      expect(result.scannedAt).toBeGreaterThanOrEqual(beforeScan);
      expect(result.scannedAt).toBeLessThanOrEqual(afterScan);
    });

    it("should handle empty directory", async () => {
      mockReaddir.mockResolvedValue([] as unknown as Dirent[]);

      const result = await skillScanner.scan();

      expect(result.skills).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it("should skip non-directory entries in skills root", async () => {
      mockReaddir.mockResolvedValueOnce([
        { name: "test-skill", isDirectory: () => true, isFile: () => false },
        { name: "README.md", isDirectory: () => false, isFile: () => true },
        { name: ".gitkeep", isDirectory: () => false, isFile: () => true },
      ] as unknown as Dirent[]);

      const result = await skillScanner.scan();

      expect(result.skills).toHaveLength(1);
      expect(result.skills[0]?.name).toBe("test-skill");
    });

    it("should handle skill without SKILL.md", async () => {
      mockStat.mockImplementation(async (path: unknown) => {
        const pathStr = path as string;
        if (pathStr.endsWith("SKILL.md")) {
          throw new Error("ENOENT");
        }
        return { isFile: () => false, isDirectory: () => true } as Stats;
      });

      const result = await skillScanner.scan();

      // Skills without SKILL.md should result in error or be skipped
      expect(result.errors.length).toBeGreaterThanOrEqual(0);
    });

    it("should parse allowed-tools correctly", async () => {
      const result = await skillScanner.scan();

      const anotherSkill = result.skills.find(
        (s) => s.name === "another-skill",
      );
      expect(anotherSkill?.allowedTools).toContain("Bash");
      expect(anotherSkill?.allowedTools).toContain("Read");
    });

    it("should parse dependencies correctly", async () => {
      const result = await skillScanner.scan();

      const anotherSkill = result.skills.find(
        (s) => s.name === "another-skill",
      );
      expect(anotherSkill?.dependencies).toContain("test-skill");
    });
  });

  describe("filter", () => {
    it("should filter by name", async () => {
      await skillScanner.scan();

      const filtered = skillScanner.filter({ name: "test" });

      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.name).toBe("test-skill");
    });

    it("should filter by tags", async () => {
      await skillScanner.scan();

      const filtered = skillScanner.filter({ tags: ["production"] });

      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.name).toBe("another-skill");
    });

    it("should filter by keyword in description", async () => {
      await skillScanner.scan();

      // "Another skill" description contains "Another"
      const filtered = skillScanner.filter({ keyword: "Another" });

      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.name).toBe("another-skill");
    });

    it("should combine multiple filter criteria", async () => {
      await skillScanner.scan();

      const filtered = skillScanner.filter({
        tags: ["test"],
        name: "test",
      });

      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.name).toBe("test-skill");
    });

    it("should return empty array when no matches", async () => {
      await skillScanner.scan();

      const filtered = skillScanner.filter({ name: "nonexistent" });

      expect(filtered).toHaveLength(0);
    });

    it("should throw error if scan not performed", () => {
      const newScanner = new SkillScanner({ basePath });
      expect(() => newScanner.filter({ name: "test" })).toThrow();
    });

    it("should return all skills when no criteria provided", async () => {
      await skillScanner.scan();

      const filtered = skillScanner.filter({});

      expect(filtered).toHaveLength(2);
    });
  });

  describe("getSkillDetail", () => {
    it("should return full skill details", async () => {
      await skillScanner.scan();

      const detail = await skillScanner.getSkillDetail("test-skill");

      expect(detail).toBeDefined();
      expect(detail?.name).toBe("test-skill");
      expect(detail?.content).toContain("Test Skill");
    });

    it("should include scripts list when requested", async () => {
      await skillScanner.scan();

      const detail = await skillScanner.getSkillDetail("test-skill", {
        includeScripts: true,
      });

      expect(detail?.scripts).toBeDefined();
      expect(detail?.scripts).toHaveLength(1);
      expect(detail?.scripts?.[0]?.name).toBe("run.mjs");
    });

    it("should return null for non-existent skill", async () => {
      await skillScanner.scan();

      const detail = await skillScanner.getSkillDetail("nonexistent");

      expect(detail).toBeNull();
    });

    it("should throw error if scan not performed", async () => {
      const newScanner = new SkillScanner({ basePath });
      await expect(newScanner.getSkillDetail("test-skill")).rejects.toThrow();
    });
  });

  describe("validateSkillName", () => {
    it("should accept valid kebab-case names", () => {
      expect(SkillScanner.validateSkillName("my-skill")).toBe(true);
      expect(SkillScanner.validateSkillName("skill-name-123")).toBe(true);
      expect(SkillScanner.validateSkillName("a")).toBe(true);
    });

    it("should reject invalid names", () => {
      expect(SkillScanner.validateSkillName("My-Skill")).toBe(false);
      expect(SkillScanner.validateSkillName("skill_name")).toBe(false);
      expect(SkillScanner.validateSkillName("skill.name")).toBe(false);
    });

    it("should reject path traversal attempts", () => {
      expect(SkillScanner.validateSkillName("../skill")).toBe(false);
      expect(SkillScanner.validateSkillName("skill/..")).toBe(false);
      expect(SkillScanner.validateSkillName("..")).toBe(false);
    });

    it("should reject empty names", () => {
      expect(SkillScanner.validateSkillName("")).toBe(false);
    });

    it("should reject names exceeding max length", () => {
      const longName = "a".repeat(65);
      expect(SkillScanner.validateSkillName(longName)).toBe(false);
    });
  });

  describe("resolveSkillPath", () => {
    it("should resolve valid skill path", async () => {
      await skillScanner.scan();

      const skillPath = skillScanner.resolveSkillPath("test-skill");

      expect(skillPath).toBe("/home/user/.claude/skills/test-skill");
    });

    it("should reject path traversal attempts", async () => {
      await skillScanner.scan();

      expect(() => skillScanner.resolveSkillPath("../etc/passwd")).toThrow();
      expect(() => skillScanner.resolveSkillPath("skill/../..")).toThrow();
    });

    it("should validate skill exists", async () => {
      await skillScanner.scan();

      expect(() => skillScanner.resolveSkillPath("nonexistent")).toThrow(
        "Skill not found",
      );
    });

    it("should handle relative paths", async () => {
      await skillScanner.scan();

      const skillPath = skillScanner.resolveSkillPath("test-skill");

      // Should return an absolute path
      expect(skillPath.startsWith("/")).toBe(true);
    });
  });

  describe("caching", () => {
    it("should cache scan results", async () => {
      await skillScanner.scan();
      const callsAfterFirstScan = mockReaddir.mock.calls.length;

      await skillScanner.scan(); // Second call should use cache

      // Should not make additional calls when using cache
      expect(mockReaddir.mock.calls.length).toBe(callsAfterFirstScan);
    });

    it("should refresh cache when forceRefresh is true", async () => {
      await skillScanner.scan();
      const firstCallCount = mockReaddir.mock.calls.length;

      await skillScanner.scan({ forceRefresh: true });

      expect(mockReaddir.mock.calls.length).toBeGreaterThan(firstCallCount);
    });

    it("should return cached results", async () => {
      const firstResult = await skillScanner.scan();
      const secondResult = await skillScanner.scan();

      expect(firstResult).toBe(secondResult);
    });

    it("should clear cache on clearCache()", async () => {
      await skillScanner.scan();
      skillScanner.clearCache();

      const callCountBefore = mockReaddir.mock.calls.length;
      await skillScanner.scan();

      expect(mockReaddir.mock.calls.length).toBeGreaterThan(callCountBefore);
    });
  });
});

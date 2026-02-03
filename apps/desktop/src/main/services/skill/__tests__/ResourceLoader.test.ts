/**
 * ResourceLoader Unit Tests
 * Phase 4: TDD Red State - Tests created before implementation
 *
 * Test Coverage:
 * - RL-001〜RL-008: load(), loadAgent(), loadSchema(), clearCache() methods
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock fs/promises before importing
vi.mock("fs/promises", () => {
  const readFile = vi.fn();
  return {
    default: { readFile },
    readFile,
  };
});

// Import after mocking
import fs from "fs/promises";
import { ResourceLoader } from "../ResourceLoader";
import type { ResourceCategory } from "../ResourceLoader";

describe("ResourceLoader", () => {
  const mockSkillCreatorPath = "/mock/skill-creator";
  let loader: ResourceLoader;
  let mockReadFile: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    loader = new ResourceLoader(mockSkillCreatorPath);
    mockReadFile = vi.mocked(fs.readFile);
    mockReadFile.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("load()", () => {
    it("RL-001: should read file content successfully", async () => {
      // Arrange
      const expectedContent = "# Agent Prompt\nThis is the agent content.";
      mockReadFile.mockResolvedValue(expectedContent);

      // Act
      const result = await loader.load("agents", "test-agent.md");

      // Assert
      expect(result).toBe(expectedContent);
      expect(mockReadFile).toHaveBeenCalledWith(
        `${mockSkillCreatorPath}/agents/test-agent.md`,
        "utf-8",
      );
    });

    it("RL-002: should throw error for non-existent file", async () => {
      // Arrange
      mockReadFile.mockRejectedValue(
        new Error("ENOENT: no such file or directory"),
      );

      // Act & Assert
      await expect(loader.load("agents", "nonexistent.md")).rejects.toThrow(
        "ENOENT",
      );
    });

    it("RL-003: should return cached content on second read", async () => {
      // Arrange
      const expectedContent = "cached content";
      mockReadFile.mockResolvedValue(expectedContent);

      // Act - first read
      const result1 = await loader.load("agents", "cached-agent.md");
      // Act - second read
      const result2 = await loader.load("agents", "cached-agent.md");

      // Assert
      expect(result1).toBe(expectedContent);
      expect(result2).toBe(expectedContent);
      expect(mockReadFile).toHaveBeenCalledTimes(1); // Only called once due to cache
    });

    it("RL-004: should construct path correctly for different categories", async () => {
      // Arrange
      mockReadFile.mockResolvedValue("content");
      const categories: ResourceCategory[] = [
        "agents",
        "references",
        "assets",
        "schemas",
      ];

      // Act
      for (const category of categories) {
        await loader.load(
          category,
          `test.${category === "schemas" ? "json" : "md"}`,
        );
      }

      // Assert
      expect(mockReadFile).toHaveBeenCalledWith(
        `${mockSkillCreatorPath}/agents/test.md`,
        "utf-8",
      );
      expect(mockReadFile).toHaveBeenCalledWith(
        `${mockSkillCreatorPath}/references/test.md`,
        "utf-8",
      );
      expect(mockReadFile).toHaveBeenCalledWith(
        `${mockSkillCreatorPath}/assets/test.md`,
        "utf-8",
      );
      expect(mockReadFile).toHaveBeenCalledWith(
        `${mockSkillCreatorPath}/schemas/test.json`,
        "utf-8",
      );
    });
  });

  describe("loadAgent()", () => {
    it("RL-005: should load agent from agents directory with .md extension", async () => {
      // Arrange
      const agentContent = "# Hearing Agent\nThis agent conducts interviews.";
      mockReadFile.mockResolvedValue(agentContent);

      // Act
      const result = await loader.loadAgent("hearing");

      // Assert
      expect(result).toBe(agentContent);
      expect(mockReadFile).toHaveBeenCalledWith(
        `${mockSkillCreatorPath}/agents/hearing.md`,
        "utf-8",
      );
    });
  });

  describe("loadSchema()", () => {
    it("RL-006: should load and parse JSON schema", async () => {
      // Arrange
      const schemaContent = {
        type: "object",
        properties: { name: { type: "string" } },
      };
      mockReadFile.mockResolvedValue(JSON.stringify(schemaContent));

      // Act
      const result = await loader.loadSchema("skill");

      // Assert
      expect(result).toEqual(schemaContent);
      expect(mockReadFile).toHaveBeenCalledWith(
        `${mockSkillCreatorPath}/schemas/skill.json`,
        "utf-8",
      );
    });

    it("RL-007: should throw SyntaxError for invalid JSON schema", async () => {
      // Arrange
      const invalidJson = "{ invalid json }";
      mockReadFile.mockResolvedValue(invalidJson);

      // Act & Assert
      await expect(loader.loadSchema("invalid")).rejects.toThrow(SyntaxError);
    });
  });

  describe("clearCache()", () => {
    it("RL-008: should clear cache and re-read file on next load", async () => {
      // Arrange
      const content1 = "original content";
      const content2 = "updated content";
      mockReadFile
        .mockResolvedValueOnce(content1)
        .mockResolvedValueOnce(content2);

      // Act - first read
      const result1 = await loader.load("agents", "changing-agent.md");
      // Clear cache
      loader.clearCache();
      // Act - read after cache clear
      const result2 = await loader.load("agents", "changing-agent.md");

      // Assert
      expect(result1).toBe(content1);
      expect(result2).toBe(content2);
      expect(mockReadFile).toHaveBeenCalledTimes(2); // Called twice after cache clear
    });
  });

  describe("Cache isolation", () => {
    it("should cache separately for different category/name combinations", async () => {
      // Arrange
      mockReadFile
        .mockResolvedValueOnce("content1")
        .mockResolvedValueOnce("content2");

      // Act
      const result1 = await loader.load("agents", "test.md");
      const result2 = await loader.load("references", "test.md");

      // Assert
      expect(result1).toBe("content1");
      expect(result2).toBe("content2");
      expect(mockReadFile).toHaveBeenCalledTimes(2);
    });
  });
});

/**
 * SkillFileWriter Unit Tests
 *
 * TASK-SC-04-OUTPUT-PERSISTENCE
 * Phase 4: 基本機能テスト / Phase 6: テスト拡充
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import * as fs from "fs/promises";
import * as path from "path";

vi.mock("fs/promises");

import { SkillFileWriter } from "../SkillFileWriter";
import type { SkillGeneratedContent } from "@repo/shared/types";

const mockedFs = vi.mocked(fs);

describe("SkillFileWriter", () => {
  const basePath = "/mock/project/.claude/skills";
  let writer: SkillFileWriter;

  const minimalContent: SkillGeneratedContent = {
    skillMd: "# My Skill\n\nDescription",
    agents: [],
    scripts: [],
    references: [],
  };

  const fullContent: SkillGeneratedContent = {
    skillMd: "# Full Skill\n\nFull description",
    agents: [{ name: "analyze", content: "# Analyze Agent" }],
    scripts: [{ name: "build.js", content: "console.log('build')" }],
    references: [{ name: "patterns", content: "# Patterns" }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    writer = new SkillFileWriter(basePath);

    // Default: directory does not exist (ENOENT)
    mockedFs.access.mockRejectedValue(
      Object.assign(new Error("ENOENT"), { code: "ENOENT" }),
    );
    mockedFs.mkdir.mockResolvedValue(undefined);
    mockedFs.writeFile.mockResolvedValue(undefined);
    mockedFs.readdir.mockResolvedValue([]);
    mockedFs.rmdir.mockResolvedValue(undefined);
    mockedFs.unlink.mockResolvedValue(undefined);
  });

  // ==============================
  // Phase 4: 基本機能テスト
  // ==============================

  describe("persist() - basic functionality", () => {
    it("should write SKILL.md to the correct path", async () => {
      await writer.persist("my-skill", minimalContent);

      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        path.join(basePath, "my-skill", "SKILL.md"),
        minimalContent.skillMd,
        "utf-8",
      );
    });

    it("should write agents/*.md files", async () => {
      await writer.persist("my-skill", fullContent);

      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        path.join(basePath, "my-skill", "agents", "analyze.md"),
        "# Analyze Agent",
        "utf-8",
      );
    });

    it("should write scripts/ files (with extension)", async () => {
      await writer.persist("my-skill", fullContent);

      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        path.join(basePath, "my-skill", "scripts", "build.js"),
        "console.log('build')",
        "utf-8",
      );
    });

    it("should write references/*.md files", async () => {
      await writer.persist("my-skill", fullContent);

      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        path.join(basePath, "my-skill", "references", "patterns.md"),
        "# Patterns",
        "utf-8",
      );
    });

    it("should return correct skillPath and files list", async () => {
      const result = await writer.persist("my-skill", fullContent);

      expect(result.skillPath).toBe(path.join(basePath, "my-skill"));
      expect(result.files).toHaveLength(4); // SKILL.md + 1 agent + 1 script + 1 reference
      expect(result.files[0]).toContain("SKILL.md");
    });
  });

  // ==============================
  // Phase 4: ディレクトリ構造生成テスト
  // ==============================

  describe("persist() - directory structure", () => {
    it("should create subdirectories for agents/scripts/references", async () => {
      await writer.persist("my-skill", fullContent);

      expect(mockedFs.mkdir).toHaveBeenCalledWith(
        path.join(basePath, "my-skill", "agents"),
        { recursive: true },
      );
      expect(mockedFs.mkdir).toHaveBeenCalledWith(
        path.join(basePath, "my-skill", "scripts"),
        { recursive: true },
      );
      expect(mockedFs.mkdir).toHaveBeenCalledWith(
        path.join(basePath, "my-skill", "references"),
        { recursive: true },
      );
    });

    it("should not create subdirectories when arrays are empty", async () => {
      await writer.persist("my-skill", minimalContent);

      // Only the skill root dir should be created
      expect(mockedFs.mkdir).toHaveBeenCalledTimes(1);
      expect(mockedFs.mkdir).toHaveBeenCalledWith(
        path.join(basePath, "my-skill"),
        { recursive: true },
      );
    });

    it("should handle multiple agents/scripts/references", async () => {
      const multiContent: SkillGeneratedContent = {
        skillMd: "# Multi",
        agents: [
          { name: "agent-a", content: "A" },
          { name: "agent-b", content: "B" },
        ],
        scripts: [
          { name: "s1.js", content: "1" },
          { name: "s2.sh", content: "2" },
        ],
        references: [
          { name: "ref-a", content: "RA" },
          { name: "ref-b", content: "RB" },
        ],
      };

      const result = await writer.persist("my-skill", multiContent);

      // SKILL.md + 2 agents + 2 scripts + 2 references = 7
      expect(result.files).toHaveLength(7);
    });
  });

  // ==============================
  // Phase 4: 既存ファイル上書きガードテスト
  // ==============================

  describe("persist() - overwrite guard", () => {
    it("should throw SKILL_ALREADY_EXISTS when skill directory exists", async () => {
      mockedFs.access.mockResolvedValue(undefined); // directory exists

      await expect(
        writer.persist("existing-skill", minimalContent),
      ).rejects.toEqual(
        expect.objectContaining({
          code: "SKILL_ALREADY_EXISTS",
        }),
      );
    });

    it("should allow overwrite when overwrite option is true", async () => {
      mockedFs.access.mockResolvedValue(undefined); // directory exists

      const result = await writer.persist("existing-skill", minimalContent, {
        overwrite: true,
      });

      expect(result.skillPath).toBe(path.join(basePath, "existing-skill"));
    });
  });

  // ==============================
  // Phase 6+: skillMd 空文字列バリデーション
  // ==============================

  describe("persist() - skillMd validation", () => {
    it("should reject empty skillMd", async () => {
      const emptyContent: SkillGeneratedContent = {
        ...minimalContent,
        skillMd: "",
      };
      await expect(writer.persist("valid-skill", emptyContent)).rejects.toEqual(
        expect.objectContaining({ code: "VALIDATION_ERROR" }),
      );
    });

    it("should reject whitespace-only skillMd", async () => {
      const wsContent: SkillGeneratedContent = {
        ...minimalContent,
        skillMd: "   \n\t  ",
      };
      await expect(writer.persist("valid-skill", wsContent)).rejects.toEqual(
        expect.objectContaining({ code: "VALIDATION_ERROR" }),
      );
    });
  });

  // ==============================
  // Phase 6: パストラバーサル防止テスト
  // ==============================

  describe("persist() - path traversal prevention", () => {
    it('should reject "../malicious" (parent directory)', async () => {
      await expect(
        writer.persist("../malicious", minimalContent),
      ).rejects.toEqual(expect.objectContaining({ code: "PATH_TRAVERSAL" }));
    });

    it('should reject "/absolute/path" (absolute path)', async () => {
      await expect(
        writer.persist("/absolute/path", minimalContent),
      ).rejects.toEqual(expect.objectContaining({ code: "PATH_TRAVERSAL" }));
    });

    it('should reject "a/b" (subdirectory)', async () => {
      await expect(writer.persist("a/b", minimalContent)).rejects.toEqual(
        expect.objectContaining({ code: "PATH_TRAVERSAL" }),
      );
    });

    it('should reject "   " (whitespace only, P42)', async () => {
      await expect(writer.persist("   ", minimalContent)).rejects.toEqual(
        expect.objectContaining({ code: "VALIDATION_ERROR" }),
      );
    });

    it('should reject "./relative" (current directory reference)', async () => {
      await expect(
        writer.persist("./relative", minimalContent),
      ).rejects.toEqual(expect.objectContaining({ code: "PATH_TRAVERSAL" }));
    });

    it('should reject "a\\\\b" (Windows path separator)', async () => {
      await expect(writer.persist("a\\b", minimalContent)).rejects.toEqual(
        expect.objectContaining({ code: "PATH_TRAVERSAL" }),
      );
    });

    it('should reject "" (empty string)', async () => {
      await expect(writer.persist("", minimalContent)).rejects.toEqual(
        expect.objectContaining({ code: "VALIDATION_ERROR" }),
      );
    });

    it("should accept valid skill names", async () => {
      await expect(
        writer.persist("my-skill", minimalContent),
      ).resolves.toBeDefined();
    });

    it("should accept skill names with underscores and numbers", async () => {
      await expect(
        writer.persist("my_skill_01", minimalContent),
      ).resolves.toBeDefined();
    });
  });

  // ==============================
  // Phase 6: 不正ファイル名テスト
  // ==============================

  describe("validateFileName()", () => {
    it("should reject empty file name", async () => {
      const content: SkillGeneratedContent = {
        skillMd: "# Test",
        agents: [{ name: "", content: "Agent" }],
        scripts: [],
        references: [],
      };

      await expect(writer.persist("my-skill", content)).rejects.toEqual(
        expect.objectContaining({ code: "VALIDATION_ERROR" }),
      );
    });

    it("should reject whitespace-only file name", async () => {
      const content: SkillGeneratedContent = {
        skillMd: "# Test",
        agents: [{ name: "   ", content: "Agent" }],
        scripts: [],
        references: [],
      };

      await expect(writer.persist("my-skill", content)).rejects.toEqual(
        expect.objectContaining({ code: "VALIDATION_ERROR" }),
      );
    });

    it("should reject file name with path traversal (../)", async () => {
      const content: SkillGeneratedContent = {
        skillMd: "# Test",
        agents: [{ name: "../secret", content: "Agent" }],
        scripts: [],
        references: [],
      };

      await expect(writer.persist("my-skill", content)).rejects.toEqual(
        expect.objectContaining({ code: "PATH_TRAVERSAL" }),
      );
    });

    it("should reject file name with forward slash", async () => {
      const content: SkillGeneratedContent = {
        skillMd: "# Test",
        references: [{ name: "sub/file", content: "content" }],
        agents: [],
        scripts: [],
      };

      await expect(writer.persist("my-skill", content)).rejects.toEqual(
        expect.objectContaining({ code: "PATH_TRAVERSAL" }),
      );
    });
  });

  // ==============================
  // Phase 6: ロールバックテスト
  // ==============================

  describe("persist() - rollback on failure", () => {
    it("should rollback written files when agents write fails", async () => {
      let writeCount = 0;
      mockedFs.writeFile.mockImplementation(async () => {
        writeCount++;
        if (writeCount === 2) {
          throw new Error("ENOSPC: no space left on device");
        }
      });

      const contentWithAgent: SkillGeneratedContent = {
        skillMd: "# Test",
        agents: [{ name: "my-agent", content: "Agent content" }],
        scripts: [],
        references: [],
      };

      await expect(
        writer.persist("my-skill", contentWithAgent),
      ).rejects.toThrow("ENOSPC");

      // SKILL.md was written first, should be rolled back
      expect(mockedFs.unlink).toHaveBeenCalledWith(
        path.join(basePath, "my-skill", "SKILL.md"),
      );
    });

    it("should attempt to remove empty directories during rollback", async () => {
      let writeCount = 0;
      mockedFs.writeFile.mockImplementation(async () => {
        writeCount++;
        if (writeCount === 2) {
          throw new Error("Write failed");
        }
      });

      const content: SkillGeneratedContent = {
        skillMd: "# Test",
        agents: [{ name: "my-agent", content: "Agent" }],
        scripts: [],
        references: [],
      };

      await expect(writer.persist("my-skill", content)).rejects.toThrow();

      // Should try to clean up empty directories
      expect(mockedFs.readdir).toHaveBeenCalled();
    });
  });

  // ==============================
  // Phase 6: ENOSPC テスト
  // ==============================

  describe("persist() - disk space error", () => {
    it("should handle ENOSPC and trigger rollback", async () => {
      mockedFs.writeFile.mockRejectedValueOnce(
        Object.assign(new Error("ENOSPC"), { code: "ENOSPC" }),
      );

      await expect(writer.persist("my-skill", minimalContent)).rejects.toThrow(
        "ENOSPC",
      );
    });
  });
});

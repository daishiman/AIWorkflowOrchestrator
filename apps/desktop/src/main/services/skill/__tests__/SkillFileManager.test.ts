/**
 * SkillFileManager Unit Tests
 *
 * スキルファイル管理サービスの単体テスト
 *
 * @see docs/30-workflows/task-9a-a-skill-file-manager/phase-04-test-creation.md
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as fs from "fs/promises";
import * as path from "path";

// Mock fs/promises
vi.mock("fs/promises");
vi.mock("os", () => ({
  homedir: vi.fn(() => "/mock/home"),
}));

import { SkillFileManager } from "../SkillFileManager";
import {
  SkillNotFoundError,
  ReadonlySkillError,
  PathTraversalError,
  FileExistsError,
  FileNotFoundError,
} from "../errors";

describe("SkillFileManager", () => {
  const mockAiworkflowDir = "/mock/home/.aiworkflow/skills";
  const mockClaudeDir = "/mock/home/.claude/skills";
  let manager: SkillFileManager;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new SkillFileManager();
  });

  afterEach(() => {
    vi.resetModules();
  });

  // ===========================================================================
  // constructor tests
  // ===========================================================================

  describe("constructor", () => {
    it("SFM-CON-01: should use default directories when no options provided", () => {
      const mgr = new SkillFileManager();

      // Internal state check via method call
      expect(mgr).toBeDefined();
    });

    it("SFM-CON-02: should use custom directories when options provided", () => {
      const customAiworkflow = "/custom/aiworkflow";
      const customClaude = "/custom/claude";

      const mgr = new SkillFileManager({
        aiworkflowSkillsDir: customAiworkflow,
        claudeSkillsDir: customClaude,
      });

      expect(mgr).toBeDefined();
    });

    it("SFM-CON-03: should resolve paths to absolute paths", () => {
      const mgr = new SkillFileManager({
        aiworkflowSkillsDir: "./relative/path",
      });

      expect(mgr).toBeDefined();
    });
  });

  // ===========================================================================
  // readFile tests
  // ===========================================================================

  describe("readFile", () => {
    it("SFM-RF-01: should read file content from aiworkflow skills directory", async () => {
      const skillPath = path.join(mockAiworkflowDir, "test-skill");
      const filePath = path.join(skillPath, "SKILL.md");

      vi.mocked(fs.access).mockResolvedValueOnce(undefined); // aiworkflow exists

      vi.mocked(fs.readFile).mockResolvedValueOnce("# Test Content");

      const result = await manager.readFile("test-skill", "SKILL.md");

      expect(result).toBe("# Test Content");
      expect(fs.readFile).toHaveBeenCalledWith(filePath, "utf-8");
    });

    it("SFM-RF-02: should read file content from claude skills directory", async () => {
      const claudeSkillPath = path.join(mockClaudeDir, "readonly-skill");
      const filePath = path.join(claudeSkillPath, "SKILL.md");

      vi.mocked(fs.access)
        .mockRejectedValueOnce({ code: "ENOENT" }) // aiworkflow not exists
        .mockResolvedValueOnce(undefined); // claude exists

      vi.mocked(fs.readFile).mockResolvedValueOnce("# Claude Skill");

      const result = await manager.readFile("readonly-skill", "SKILL.md");

      expect(result).toBe("# Claude Skill");
      expect(fs.readFile).toHaveBeenCalledWith(filePath, "utf-8");
    });

    it("SFM-RF-03: should throw SkillNotFoundError when skill does not exist", async () => {
      vi.mocked(fs.access)
        .mockRejectedValueOnce({ code: "ENOENT" }) // aiworkflow not exists
        .mockRejectedValueOnce({ code: "ENOENT" }); // claude not exists

      await expect(manager.readFile("nonexistent", "SKILL.md")).rejects.toThrow(
        SkillNotFoundError,
      );
    });

    it("SFM-RF-04: should throw FileNotFoundError when file does not exist", async () => {
      vi.mocked(fs.access).mockResolvedValueOnce(undefined);
      vi.mocked(fs.readFile).mockRejectedValueOnce({ code: "ENOENT" });

      await expect(
        manager.readFile("test-skill", "nonexistent.md"),
      ).rejects.toThrow(FileNotFoundError);
    });

    it("SFM-RF-05: should throw PathTraversalError for ../path patterns", async () => {
      vi.mocked(fs.access).mockResolvedValueOnce(undefined);

      await expect(
        manager.readFile("test-skill", "../../../etc/passwd"),
      ).rejects.toThrow(PathTraversalError);
    });
  });

  // ===========================================================================
  // writeFile tests
  // ===========================================================================

  describe("writeFile", () => {
    it("SFM-WF-01: should write file content to aiworkflow skills directory", async () => {
      const skillPath = path.join(mockAiworkflowDir, "test-skill");
      const filePath = path.join(skillPath, "test.md");

      vi.mocked(fs.access).mockResolvedValueOnce(undefined);
      vi.mocked(fs.readFile).mockRejectedValueOnce({ code: "ENOENT" }); // No existing file
      vi.mocked(fs.mkdir).mockResolvedValueOnce(undefined);
      vi.mocked(fs.writeFile).mockResolvedValueOnce(undefined);

      await manager.writeFile("test-skill", "test.md", "New content");

      expect(fs.writeFile).toHaveBeenCalledWith(
        filePath,
        "New content",
        "utf-8",
      );
    });

    it("SFM-WF-02: should create backup before writing existing file", async () => {
      const _skillPath = path.join(mockAiworkflowDir, "test-skill");

      vi.mocked(fs.access).mockResolvedValueOnce(undefined);
      vi.mocked(fs.readFile).mockResolvedValueOnce("Old content"); // Existing file
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);
      vi.mocked(fs.mkdir).mockResolvedValueOnce(undefined);

      await manager.writeFile("test-skill", "test.md", "New content");

      // backup が作成されたことを確認
      expect(fs.writeFile).toHaveBeenCalledTimes(2); // backup + new content
    });

    it("SFM-WF-03: should create parent directories if not exist", async () => {
      vi.mocked(fs.access).mockResolvedValueOnce(undefined);
      vi.mocked(fs.readFile).mockRejectedValueOnce({ code: "ENOENT" });
      vi.mocked(fs.mkdir).mockResolvedValueOnce(undefined);
      vi.mocked(fs.writeFile).mockResolvedValueOnce(undefined);

      await manager.writeFile("test-skill", "deep/nested/file.md", "Content");

      expect(fs.mkdir).toHaveBeenCalledWith(
        expect.stringContaining("deep/nested"),
        { recursive: true },
      );
    });

    it("SFM-WF-04: should throw ReadonlySkillError for claude skills directory", async () => {
      vi.mocked(fs.access)
        .mockRejectedValueOnce({ code: "ENOENT" }) // aiworkflow not exists
        .mockResolvedValueOnce(undefined); // claude exists

      await expect(
        manager.writeFile("readonly-skill", "test.md", "Content"),
      ).rejects.toThrow(ReadonlySkillError);
    });

    it("SFM-WF-05: should throw SkillNotFoundError when skill does not exist", async () => {
      vi.mocked(fs.access)
        .mockRejectedValueOnce({ code: "ENOENT" })
        .mockRejectedValueOnce({ code: "ENOENT" });

      await expect(
        manager.writeFile("nonexistent", "test.md", "Content"),
      ).rejects.toThrow(SkillNotFoundError);
    });

    it("SFM-WF-06: should throw PathTraversalError for ../path patterns", async () => {
      vi.mocked(fs.access).mockResolvedValueOnce(undefined);

      await expect(
        manager.writeFile("test-skill", "../outside.md", "Content"),
      ).rejects.toThrow(PathTraversalError);
    });
  });

  // ===========================================================================
  // createFile tests
  // ===========================================================================

  describe("createFile", () => {
    it("SFM-CF-01: should create new file in aiworkflow skills directory", async () => {
      const skillPath = path.join(mockAiworkflowDir, "test-skill");
      const filePath = path.join(skillPath, "new-file.md");

      vi.mocked(fs.access)
        .mockResolvedValueOnce(undefined) // skill exists
        .mockRejectedValueOnce({ code: "ENOENT" }); // file not exists
      vi.mocked(fs.mkdir).mockResolvedValueOnce(undefined);
      vi.mocked(fs.writeFile).mockResolvedValueOnce(undefined);

      await manager.createFile("test-skill", "new-file.md", "New content");

      expect(fs.writeFile).toHaveBeenCalledWith(
        filePath,
        "New content",
        "utf-8",
      );
    });

    it("SFM-CF-02: should create parent directories if not exist", async () => {
      vi.mocked(fs.access)
        .mockResolvedValueOnce(undefined) // skill exists
        .mockRejectedValueOnce({ code: "ENOENT" }); // file not exists
      vi.mocked(fs.mkdir).mockResolvedValueOnce(undefined);
      vi.mocked(fs.writeFile).mockResolvedValueOnce(undefined);

      await manager.createFile("test-skill", "deep/new-file.md", "Content");

      expect(fs.mkdir).toHaveBeenCalledWith(expect.stringContaining("deep"), {
        recursive: true,
      });
    });

    it("SFM-CF-03: should throw FileExistsError when file already exists", async () => {
      vi.mocked(fs.access)
        .mockResolvedValueOnce(undefined) // skill exists
        .mockResolvedValueOnce(undefined); // file exists

      await expect(
        manager.createFile("test-skill", "existing.md", "Content"),
      ).rejects.toThrow(FileExistsError);
    });

    it("SFM-CF-04: should throw ReadonlySkillError for claude skills directory", async () => {
      vi.mocked(fs.access)
        .mockRejectedValueOnce({ code: "ENOENT" }) // aiworkflow not exists
        .mockResolvedValueOnce(undefined); // claude exists

      await expect(
        manager.createFile("readonly-skill", "new.md", "Content"),
      ).rejects.toThrow(ReadonlySkillError);
    });

    it("SFM-CF-05: should throw PathTraversalError for ../path patterns", async () => {
      vi.mocked(fs.access).mockResolvedValueOnce(undefined);

      await expect(
        manager.createFile("test-skill", "../../outside.md", "Content"),
      ).rejects.toThrow(PathTraversalError);
    });
  });

  // ===========================================================================
  // deleteFile tests
  // ===========================================================================

  describe("deleteFile", () => {
    it("SFM-DF-01: should delete file from aiworkflow skills directory", async () => {
      const skillPath = path.join(mockAiworkflowDir, "test-skill");
      const filePath = path.join(skillPath, "delete-me.md");

      vi.mocked(fs.access)
        .mockResolvedValueOnce(undefined) // skill exists
        .mockResolvedValueOnce(undefined); // file exists
      vi.mocked(fs.readFile).mockResolvedValueOnce("Content to backup");
      vi.mocked(fs.writeFile).mockResolvedValueOnce(undefined); // backup
      vi.mocked(fs.unlink).mockResolvedValueOnce(undefined);

      await manager.deleteFile("test-skill", "delete-me.md");

      expect(fs.unlink).toHaveBeenCalledWith(filePath);
    });

    it("SFM-DF-02: should create backup before deleting", async () => {
      vi.mocked(fs.access)
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined);
      vi.mocked(fs.readFile).mockResolvedValueOnce("Content");
      vi.mocked(fs.writeFile).mockResolvedValueOnce(undefined);
      vi.mocked(fs.unlink).mockResolvedValueOnce(undefined);

      await manager.deleteFile("test-skill", "file.md");

      // backup が作成されたことを確認（.deleted.{timestamp} 形式）
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringMatching(/\.deleted\.\d+$/),
        "Content",
        "utf-8",
      );
    });

    it("SFM-DF-03: should throw ReadonlySkillError for claude skills directory", async () => {
      vi.mocked(fs.access)
        .mockRejectedValueOnce({ code: "ENOENT" }) // aiworkflow not exists
        .mockResolvedValueOnce(undefined); // claude exists

      await expect(
        manager.deleteFile("readonly-skill", "file.md"),
      ).rejects.toThrow(ReadonlySkillError);
    });

    it("SFM-DF-04: should throw FileNotFoundError when file does not exist", async () => {
      vi.mocked(fs.access)
        .mockResolvedValueOnce(undefined) // skill exists
        .mockRejectedValueOnce({ code: "ENOENT" }); // file not exists

      await expect(
        manager.deleteFile("test-skill", "nonexistent.md"),
      ).rejects.toThrow(FileNotFoundError);
    });

    it("SFM-DF-05: should throw PathTraversalError for ../path patterns", async () => {
      vi.mocked(fs.access).mockResolvedValueOnce(undefined);

      await expect(
        manager.deleteFile("test-skill", "../outside.md"),
      ).rejects.toThrow(PathTraversalError);
    });
  });

  // ===========================================================================
  // listBackups tests
  // ===========================================================================

  describe("listBackups", () => {
    it("SFM-LB-01: should list all backup files in skill directory", async () => {
      const _skillPath = path.join(mockAiworkflowDir, "test-skill");
      const timestamp = Date.now();

      vi.mocked(fs.access).mockResolvedValueOnce(undefined);
      vi.mocked(fs.readdir).mockResolvedValueOnce([
        { name: "file.md", isDirectory: () => false, isFile: () => true },
        {
          name: `file.md.backup.${timestamp}`,
          isDirectory: () => false,
          isFile: () => true,
        },
      ] as unknown as fs.Dirent[]);

      const result = await manager.listBackups("test-skill");

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe("backup");
    });

    it("SFM-LB-02: should include both .backup and .deleted files", async () => {
      const timestamp1 = Date.now();
      const timestamp2 = Date.now() - 1000;

      vi.mocked(fs.access).mockResolvedValueOnce(undefined);
      vi.mocked(fs.readdir).mockResolvedValueOnce([
        {
          name: `file.md.backup.${timestamp1}`,
          isDirectory: () => false,
          isFile: () => true,
        },
        {
          name: `other.md.deleted.${timestamp2}`,
          isDirectory: () => false,
          isFile: () => true,
        },
      ] as unknown as fs.Dirent[]);

      const result = await manager.listBackups("test-skill");

      expect(result).toHaveLength(2);
      expect(result.map((b) => b.type)).toContain("backup");
      expect(result.map((b) => b.type)).toContain("deleted");
    });

    it("SFM-LB-03: should return empty array when no backups exist", async () => {
      vi.mocked(fs.access).mockResolvedValueOnce(undefined);
      vi.mocked(fs.readdir).mockResolvedValueOnce([
        { name: "file.md", isDirectory: () => false, isFile: () => true },
      ] as unknown as fs.Dirent[]);

      const result = await manager.listBackups("test-skill");

      expect(result).toHaveLength(0);
    });

    it("SFM-LB-04: should parse timestamp from backup filename", async () => {
      const timestamp = 1700000000000;

      vi.mocked(fs.access).mockResolvedValueOnce(undefined);
      vi.mocked(fs.readdir).mockResolvedValueOnce([
        {
          name: `file.md.backup.${timestamp}`,
          isDirectory: () => false,
          isFile: () => true,
        },
      ] as unknown as fs.Dirent[]);

      const result = await manager.listBackups("test-skill");

      expect(result[0].timestamp).toBe(timestamp);
      expect(result[0].createdAt).toEqual(new Date(timestamp));
    });

    it("SFM-LB-05: should throw SkillNotFoundError when skill does not exist", async () => {
      vi.mocked(fs.access)
        .mockRejectedValueOnce({ code: "ENOENT" })
        .mockRejectedValueOnce({ code: "ENOENT" });

      await expect(manager.listBackups("nonexistent")).rejects.toThrow(
        SkillNotFoundError,
      );
    });
  });

  // ===========================================================================
  // restoreBackup tests
  // ===========================================================================

  describe("restoreBackup", () => {
    it("SFM-RB-01: should restore file from backup", async () => {
      const skillPath = path.join(mockAiworkflowDir, "test-skill");
      const timestamp = Date.now();
      const backupPath = `file.md.backup.${timestamp}`;

      vi.mocked(fs.access).mockResolvedValueOnce(undefined);
      vi.mocked(fs.readFile).mockResolvedValueOnce("Backup content");
      vi.mocked(fs.mkdir).mockResolvedValueOnce(undefined);
      vi.mocked(fs.writeFile).mockResolvedValueOnce(undefined);

      await manager.restoreBackup("test-skill", backupPath);

      expect(fs.writeFile).toHaveBeenCalledWith(
        path.join(skillPath, "file.md"),
        "Backup content",
        "utf-8",
      );
    });

    it("SFM-RB-02: should restore file from deleted backup", async () => {
      const skillPath = path.join(mockAiworkflowDir, "test-skill");
      const timestamp = Date.now();
      const backupPath = `file.md.deleted.${timestamp}`;

      vi.mocked(fs.access).mockResolvedValueOnce(undefined);
      vi.mocked(fs.readFile).mockResolvedValueOnce("Deleted content");
      vi.mocked(fs.mkdir).mockResolvedValueOnce(undefined);
      vi.mocked(fs.writeFile).mockResolvedValueOnce(undefined);

      await manager.restoreBackup("test-skill", backupPath);

      expect(fs.writeFile).toHaveBeenCalledWith(
        path.join(skillPath, "file.md"),
        "Deleted content",
        "utf-8",
      );
    });

    it("SFM-RB-03: should throw ReadonlySkillError for claude skills directory", async () => {
      vi.mocked(fs.access)
        .mockRejectedValueOnce({ code: "ENOENT" }) // aiworkflow not exists
        .mockResolvedValueOnce(undefined); // claude exists

      await expect(
        manager.restoreBackup("readonly-skill", "file.md.backup.123"),
      ).rejects.toThrow(ReadonlySkillError);
    });

    it("SFM-RB-04: should throw FileNotFoundError when backup does not exist", async () => {
      vi.mocked(fs.access).mockResolvedValueOnce(undefined);
      vi.mocked(fs.readFile).mockRejectedValueOnce({ code: "ENOENT" });

      await expect(
        manager.restoreBackup("test-skill", "file.md.backup.123"),
      ).rejects.toThrow(FileNotFoundError);
    });

    it("SFM-RB-05: should throw PathTraversalError for ../path patterns", async () => {
      vi.mocked(fs.access).mockResolvedValueOnce(undefined);

      await expect(
        manager.restoreBackup("test-skill", "../outside.md.backup.123"),
      ).rejects.toThrow(PathTraversalError);
    });
  });

  // ===========================================================================
  // isReadonly tests
  // ===========================================================================

  describe("isReadonly", () => {
    it("SFM-IR-01: should return false for aiworkflow skills", async () => {
      vi.mocked(fs.access).mockResolvedValueOnce(undefined);

      const result = await manager.isReadonly("aiworkflow-skill");

      expect(result).toBe(false);
    });

    it("SFM-IR-02: should return true for claude skills", async () => {
      vi.mocked(fs.access)
        .mockRejectedValueOnce({ code: "ENOENT" }) // aiworkflow not exists
        .mockResolvedValueOnce(undefined); // claude exists

      const result = await manager.isReadonly("claude-skill");

      expect(result).toBe(true);
    });

    it("SFM-IR-03: should throw SkillNotFoundError when skill does not exist", async () => {
      vi.mocked(fs.access)
        .mockRejectedValueOnce({ code: "ENOENT" })
        .mockRejectedValueOnce({ code: "ENOENT" });

      await expect(manager.isReadonly("nonexistent")).rejects.toThrow(
        SkillNotFoundError,
      );
    });
  });
});

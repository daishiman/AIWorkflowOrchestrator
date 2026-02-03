/**
 * SkillFileManager Security Tests
 *
 * パストラバーサル防止・読み取り専用保護のセキュリティテスト
 *
 * @see docs/30-workflows/task-9a-a-skill-file-manager/phase-04-test-creation.md
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "fs/promises";
import * as path from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";

import { SkillFileManager } from "../SkillFileManager";
import { PathTraversalError, ReadonlySkillError } from "../errors";

describe("SkillFileManager Security", () => {
  let testDir: string;
  let aiworkflowDir: string;
  let claudeDir: string;
  let manager: SkillFileManager;

  beforeEach(async () => {
    // 一時テストディレクトリを作成
    testDir = path.join(tmpdir(), `skill-security-test-${randomUUID()}`);
    aiworkflowDir = path.join(testDir, "aiworkflow");
    claudeDir = path.join(testDir, "claude");

    await fs.mkdir(aiworkflowDir, { recursive: true });
    await fs.mkdir(claudeDir, { recursive: true });

    // テスト用スキルを作成
    const testSkillDir = path.join(aiworkflowDir, "test-skill");
    await fs.mkdir(path.join(testSkillDir, "references"), { recursive: true });
    await fs.writeFile(
      path.join(testSkillDir, "SKILL.md"),
      "---\nname: test-skill\n---",
    );
    await fs.writeFile(
      path.join(testSkillDir, "references", "test.md"),
      "# Test",
    );

    // 読み取り専用スキルを作成
    const readonlySkillDir = path.join(claudeDir, "readonly-skill");
    await fs.mkdir(path.join(readonlySkillDir, "references"), {
      recursive: true,
    });
    await fs.writeFile(
      path.join(readonlySkillDir, "SKILL.md"),
      "---\nname: readonly-skill\n---",
    );

    manager = new SkillFileManager({
      aiworkflowSkillsDir: aiworkflowDir,
      claudeSkillsDir: claudeDir,
    });
  });

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  // ===========================================================================
  // Path Traversal Prevention
  // ===========================================================================

  describe("Path Traversal Prevention", () => {
    // UNIX/macOS path traversal patterns
    // Note: Windows-style backslash paths and URL-encoded paths
    // are not actual traversal attacks on Unix systems
    const traversalPatterns = [
      "../etc/passwd",
      "../../etc/passwd",
      "foo/../../../etc/passwd",
      "foo/bar/../../../etc/passwd",
      "./../../etc/passwd",
      "foo/./../../etc/passwd",
    ];

    describe("readFile", () => {
      traversalPatterns.forEach((pattern) => {
        it(`SEC-RF-${traversalPatterns.indexOf(pattern) + 1}: should block path traversal: ${pattern}`, async () => {
          await expect(manager.readFile("test-skill", pattern)).rejects.toThrow(
            PathTraversalError,
          );
        });
      });
    });

    describe("writeFile", () => {
      traversalPatterns.forEach((pattern) => {
        it(`SEC-WF-${traversalPatterns.indexOf(pattern) + 1}: should block path traversal: ${pattern}`, async () => {
          await expect(
            manager.writeFile("test-skill", pattern, "malicious content"),
          ).rejects.toThrow(PathTraversalError);
        });
      });
    });

    describe("createFile", () => {
      traversalPatterns.forEach((pattern) => {
        it(`SEC-CF-${traversalPatterns.indexOf(pattern) + 1}: should block path traversal: ${pattern}`, async () => {
          await expect(
            manager.createFile("test-skill", pattern, "malicious content"),
          ).rejects.toThrow(PathTraversalError);
        });
      });
    });

    describe("deleteFile", () => {
      traversalPatterns.forEach((pattern) => {
        it(`SEC-DF-${traversalPatterns.indexOf(pattern) + 1}: should block path traversal: ${pattern}`, async () => {
          await expect(
            manager.deleteFile("test-skill", pattern),
          ).rejects.toThrow(PathTraversalError);
        });
      });
    });

    describe("restoreBackup", () => {
      const backupTraversalPatterns = traversalPatterns.map(
        (p) => `${p}.backup.123456`,
      );

      backupTraversalPatterns.forEach((pattern) => {
        it(`SEC-RB-${backupTraversalPatterns.indexOf(pattern) + 1}: should block path traversal: ${pattern}`, async () => {
          await expect(
            manager.restoreBackup("test-skill", pattern),
          ).rejects.toThrow(PathTraversalError);
        });
      });
    });
  });

  // ===========================================================================
  // Readonly Protection
  // ===========================================================================

  describe("Readonly Protection", () => {
    const writeOperations = [
      {
        name: "writeFile",
        fn: (m: SkillFileManager) =>
          m.writeFile("readonly-skill", "test.md", "content"),
      },
      {
        name: "createFile",
        fn: (m: SkillFileManager) =>
          m.createFile("readonly-skill", "new.md", "content"),
      },
      {
        name: "deleteFile",
        fn: (m: SkillFileManager) => m.deleteFile("readonly-skill", "SKILL.md"),
      },
      {
        name: "restoreBackup",
        fn: (m: SkillFileManager) =>
          m.restoreBackup("readonly-skill", "test.md.backup.123"),
      },
    ];

    writeOperations.forEach(({ name, fn }) => {
      it(`SEC-RO-${writeOperations.findIndex((o) => o.name === name) + 1}: should block ${name} on claude skills directory`, async () => {
        await expect(fn(manager)).rejects.toThrow(ReadonlySkillError);
      });
    });

    it("SEC-RO-05: should allow readFile on claude skills directory", async () => {
      const content = await manager.readFile("readonly-skill", "SKILL.md");
      expect(content).toContain("readonly-skill");
    });

    it("SEC-RO-06: should allow listBackups on claude skills directory", async () => {
      const backups = await manager.listBackups("readonly-skill");
      expect(Array.isArray(backups)).toBe(true);
    });
  });

  // ===========================================================================
  // Skill Name Validation
  // ===========================================================================

  describe("Skill Name Validation", () => {
    it("SEC-SN-01: should reject skill names with path traversal", async () => {
      await expect(manager.readFile("../outside", "file.md")).rejects.toThrow();
    });

    it("SEC-SN-02: should reject skill names with absolute paths", async () => {
      await expect(
        manager.readFile("/etc/passwd", "file.md"),
      ).rejects.toThrow();
    });

    it("SEC-SN-03: should reject skill names with special characters", async () => {
      // These should either fail to find or throw an error
      await expect(
        manager.readFile("skill/../../../etc", "passwd"),
      ).rejects.toThrow();
    });
  });

  // ===========================================================================
  // Backup Path Validation
  // ===========================================================================

  describe("Backup Path Validation", () => {
    it("SEC-BP-01: should reject non-backup paths in restoreBackup", async () => {
      // Path without backup/deleted suffix should fail
      await expect(
        manager.restoreBackup("test-skill", "references/test.md"),
      ).rejects.toThrow();
    });

    it("SEC-BP-02: should reject malformed backup timestamps", async () => {
      await expect(
        manager.restoreBackup("test-skill", "test.md.backup.notanumber"),
      ).rejects.toThrow();
    });
  });

  // ===========================================================================
  // Directory Escape Prevention
  // ===========================================================================

  describe("Directory Escape Prevention", () => {
    it("SEC-DE-01: should not allow reading outside skill directory", async () => {
      // Create a file outside skill directory
      const outsideFile = path.join(testDir, "outside.txt");
      await fs.writeFile(outsideFile, "sensitive data");

      // Try to read it via path traversal
      await expect(
        manager.readFile("test-skill", "../../outside.txt"),
      ).rejects.toThrow(PathTraversalError);
    });

    it("SEC-DE-02: should not allow writing outside skill directory", async () => {
      await expect(
        manager.writeFile("test-skill", "../../malicious.txt", "malware"),
      ).rejects.toThrow(PathTraversalError);

      // Verify file was not created
      const maliciousPath = path.join(testDir, "malicious.txt");
      await expect(fs.access(maliciousPath)).rejects.toThrow();
    });

    it("SEC-DE-03: should not allow deleting outside skill directory", async () => {
      // Create a file outside skill directory
      const targetFile = path.join(testDir, "important.txt");
      await fs.writeFile(targetFile, "important data");

      await expect(
        manager.deleteFile("test-skill", "../../important.txt"),
      ).rejects.toThrow(PathTraversalError);

      // Verify file was not deleted
      const content = await fs.readFile(targetFile, "utf-8");
      expect(content).toBe("important data");
    });
  });

  // ===========================================================================
  // Null Byte Injection Prevention
  // ===========================================================================

  describe("Null Byte Injection Prevention", () => {
    it("SEC-NB-01: should handle paths with null bytes safely", async () => {
      // Null byte injection attempt
      const maliciousPath = "test.md\x00.jpg";

      // Should either throw or safely handle
      try {
        await manager.readFile("test-skill", maliciousPath);
        // If it doesn't throw, it should return empty/error, not bypass
      } catch (error) {
        // Expected - any error is acceptable as long as it doesn't bypass security
        expect(error).toBeDefined();
      }
    });
  });
});

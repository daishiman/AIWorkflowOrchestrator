/**
 * SkillFileManager Integration Tests
 *
 * 実際のファイルシステムを使用した統合テスト
 *
 * @see docs/30-workflows/task-9a-a-skill-file-manager/phase-04-test-creation.md
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "fs/promises";
import * as path from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";

import { SkillFileManager } from "../SkillFileManager";
import {
  SkillNotFoundError,
  ReadonlySkillError,
  FileExistsError,
  FileNotFoundError,
} from "../errors";

describe("SkillFileManager Integration", () => {
  let testDir: string;
  let aiworkflowDir: string;
  let claudeDir: string;
  let manager: SkillFileManager;

  beforeEach(async () => {
    // 一時テストディレクトリを作成
    testDir = path.join(tmpdir(), `skill-file-manager-test-${randomUUID()}`);
    aiworkflowDir = path.join(testDir, "aiworkflow");
    claudeDir = path.join(testDir, "claude");

    await fs.mkdir(aiworkflowDir, { recursive: true });
    await fs.mkdir(claudeDir, { recursive: true });

    // テスト用スキルを作成
    const testSkillDir = path.join(aiworkflowDir, "test-skill");
    await fs.mkdir(path.join(testSkillDir, "references"), { recursive: true });
    await fs.writeFile(
      path.join(testSkillDir, "SKILL.md"),
      "---\nname: test-skill\n---\n\n# Test Skill",
    );
    await fs.writeFile(
      path.join(testSkillDir, "references", "test.md"),
      "# Test Content\n\nHello World",
    );

    // 読み取り専用スキルを作成
    const readonlySkillDir = path.join(claudeDir, "readonly-skill");
    await fs.mkdir(path.join(readonlySkillDir, "references"), {
      recursive: true,
    });
    await fs.writeFile(
      path.join(readonlySkillDir, "SKILL.md"),
      "---\nname: readonly-skill\n---\n\n# Readonly Skill",
    );
    await fs.writeFile(
      path.join(readonlySkillDir, "references", "readonly.md"),
      "# Readonly Content",
    );

    manager = new SkillFileManager({
      aiworkflowSkillsDir: aiworkflowDir,
      claudeSkillsDir: claudeDir,
    });
  });

  afterEach(async () => {
    // クリーンアップ
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }
  });

  // ===========================================================================
  // File Operations Flow
  // ===========================================================================

  describe("File Operations Flow", () => {
    it("INT-FO-01: should complete full write-read cycle", async () => {
      const content = "# New Content\n\nThis is new content.";

      // Write
      await manager.writeFile("test-skill", "references/new.md", content);

      // Read
      const result = await manager.readFile("test-skill", "references/new.md");

      expect(result).toBe(content);
    });

    it("INT-FO-02: should complete full create-read-delete cycle", async () => {
      const content = "# Created File";

      // Create
      await manager.createFile("test-skill", "references/created.md", content);

      // Read
      const readResult = await manager.readFile(
        "test-skill",
        "references/created.md",
      );
      expect(readResult).toBe(content);

      // Delete
      await manager.deleteFile("test-skill", "references/created.md");

      // Verify deletion
      await expect(
        manager.readFile("test-skill", "references/created.md"),
      ).rejects.toThrow(FileNotFoundError);
    });

    it("INT-FO-03: should preserve file content through backup-restore cycle", async () => {
      const originalContent = "# Original Content";
      const newContent = "# Modified Content";

      // Write original
      await manager.writeFile(
        "test-skill",
        "references/backup-test.md",
        originalContent,
      );

      // Modify (creates backup)
      await manager.writeFile(
        "test-skill",
        "references/backup-test.md",
        newContent,
      );

      // Get backups
      const backups = await manager.listBackups("test-skill");
      const backupOfOriginal = backups.find(
        (b) =>
          b.originalPath === "references/backup-test.md" && b.type === "backup",
      );

      expect(backupOfOriginal).toBeDefined();

      // Restore
      await manager.restoreBackup("test-skill", backupOfOriginal!.relativePath);

      // Verify restored content
      const restoredContent = await manager.readFile(
        "test-skill",
        "references/backup-test.md",
      );
      expect(restoredContent).toBe(originalContent);
    });
  });

  // ===========================================================================
  // Backup Flow
  // ===========================================================================

  describe("Backup Flow", () => {
    it("INT-BF-01: should create backup with correct timestamp format", async () => {
      const beforeTimestamp = Date.now();

      // Modify existing file
      await manager.writeFile("test-skill", "references/test.md", "# Updated");

      const afterTimestamp = Date.now();

      // Get backups
      const backups = await manager.listBackups("test-skill");
      const backup = backups.find(
        (b) => b.originalPath === "references/test.md",
      );

      expect(backup).toBeDefined();
      expect(backup!.timestamp).toBeGreaterThanOrEqual(beforeTimestamp);
      expect(backup!.timestamp).toBeLessThanOrEqual(afterTimestamp);
      expect(backup!.filename).toMatch(/\.backup\.\d+$/);
    });

    it("INT-BF-02: should list backups in chronological order", async () => {
      // Create multiple backups
      await manager.writeFile("test-skill", "references/test.md", "Content 1");
      await new Promise((r) => setTimeout(r, 10)); // Small delay
      await manager.writeFile("test-skill", "references/test.md", "Content 2");
      await new Promise((r) => setTimeout(r, 10));
      await manager.writeFile("test-skill", "references/test.md", "Content 3");

      const backups = await manager.listBackups("test-skill");
      const testBackups = backups.filter(
        (b) => b.originalPath === "references/test.md",
      );

      // Should be sorted descending (newest first)
      for (let i = 1; i < testBackups.length; i++) {
        expect(testBackups[i - 1].timestamp).toBeGreaterThanOrEqual(
          testBackups[i].timestamp,
        );
      }
    });

    it("INT-BF-03: should restore exact content from backup", async () => {
      const originalContent = "# Exact Content\n\nWith multiple lines.";

      // Write original
      await manager.writeFile(
        "test-skill",
        "references/exact.md",
        originalContent,
      );

      // Modify
      await manager.writeFile(
        "test-skill",
        "references/exact.md",
        "# Different",
      );

      // Get backup
      const backups = await manager.listBackups("test-skill");
      const backup = backups.find(
        (b) => b.originalPath === "references/exact.md" && b.type === "backup",
      );

      // Restore
      await manager.restoreBackup("test-skill", backup!.relativePath);

      // Verify exact content
      const restored = await manager.readFile(
        "test-skill",
        "references/exact.md",
      );
      expect(restored).toBe(originalContent);
    });
  });

  // ===========================================================================
  // Readonly Protection
  // ===========================================================================

  describe("Readonly Protection", () => {
    it("INT-RO-01: should allow reading from readonly skill", async () => {
      const content = await manager.readFile("readonly-skill", "SKILL.md");
      expect(content).toContain("readonly-skill");
    });

    it("INT-RO-02: should block writing to readonly skill", async () => {
      await expect(
        manager.writeFile("readonly-skill", "test.md", "Content"),
      ).rejects.toThrow(ReadonlySkillError);
    });

    it("INT-RO-03: should block creating in readonly skill", async () => {
      await expect(
        manager.createFile("readonly-skill", "new.md", "Content"),
      ).rejects.toThrow(ReadonlySkillError);
    });

    it("INT-RO-04: should block deleting from readonly skill", async () => {
      await expect(
        manager.deleteFile("readonly-skill", "references/readonly.md"),
      ).rejects.toThrow(ReadonlySkillError);
    });

    it("INT-RO-05: should report readonly status correctly", async () => {
      expect(await manager.isReadonly("test-skill")).toBe(false);
      expect(await manager.isReadonly("readonly-skill")).toBe(true);
    });
  });

  // ===========================================================================
  // Error Handling
  // ===========================================================================

  describe("Error Handling", () => {
    it("INT-EH-01: should handle nonexistent skill", async () => {
      await expect(manager.readFile("nonexistent", "file.md")).rejects.toThrow(
        SkillNotFoundError,
      );
    });

    it("INT-EH-02: should handle nonexistent file", async () => {
      await expect(
        manager.readFile("test-skill", "nonexistent.md"),
      ).rejects.toThrow(FileNotFoundError);
    });

    it("INT-EH-03: should handle duplicate file creation", async () => {
      await expect(
        manager.createFile("test-skill", "SKILL.md", "Content"),
      ).rejects.toThrow(FileExistsError);
    });
  });
});

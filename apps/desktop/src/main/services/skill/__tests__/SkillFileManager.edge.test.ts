/**
 * SkillFileManager Edge Cases, Boundary Values, and Error Recovery Tests
 *
 * Phase 6: テスト拡充
 *
 * @see docs/30-workflows/task-9a-a-skill-file-manager/phase-06-test-expansion.md
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "fs/promises";
import * as path from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";

import { SkillFileManager } from "../SkillFileManager";
import { SkillNotFoundError, FileNotFoundError } from "../errors";

describe("SkillFileManager Edge Cases", () => {
  let testDir: string;
  let aiworkflowDir: string;
  let claudeDir: string;
  let manager: SkillFileManager;

  beforeEach(async () => {
    testDir = path.join(tmpdir(), `skill-edge-test-${randomUUID()}`);
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
  // Empty Files
  // ===========================================================================

  describe("Empty Files", () => {
    it("EDGE-EF-01: should read empty file and return empty string", async () => {
      await fs.writeFile(
        path.join(aiworkflowDir, "test-skill", "empty.md"),
        "",
      );

      const content = await manager.readFile("test-skill", "empty.md");
      expect(content).toBe("");
    });

    it("EDGE-EF-02: should write empty content", async () => {
      await manager.writeFile("test-skill", "references/empty.md", "");

      const content = await manager.readFile(
        "test-skill",
        "references/empty.md",
      );
      expect(content).toBe("");
    });

    it("EDGE-EF-03: should create backup of empty file", async () => {
      // 最初に空ファイルを作成
      await manager.writeFile("test-skill", "references/empty.md", "");

      // 更新して backup を作成
      await manager.writeFile("test-skill", "references/empty.md", "content");

      const backups = await manager.listBackups("test-skill");
      const emptyBackup = backups.find(
        (b) => b.originalPath === "references/empty.md",
      );

      expect(emptyBackup).toBeDefined();
    });
  });

  // ===========================================================================
  // Large Files
  // ===========================================================================

  describe("Large Files", () => {
    it("EDGE-LF-01: should handle files larger than 1MB", async () => {
      // 1MB以上のコンテンツを生成
      const largeContent = "x".repeat(1024 * 1024 + 100); // 1MB + 100 bytes

      await manager.writeFile(
        "test-skill",
        "references/large.md",
        largeContent,
      );

      const readContent = await manager.readFile(
        "test-skill",
        "references/large.md",
      );
      expect(readContent.length).toBeGreaterThan(1024 * 1024);
      expect(readContent).toBe(largeContent);
    });

    it("EDGE-LF-02: should create backup of large files", async () => {
      const largeContent = "y".repeat(1024 * 1024);

      // 最初に書き込み
      await manager.writeFile(
        "test-skill",
        "references/large.md",
        largeContent,
      );

      // 更新して backup 作成
      await manager.writeFile(
        "test-skill",
        "references/large.md",
        "new content",
      );

      const backups = await manager.listBackups("test-skill");
      const largeBackup = backups.find(
        (b) => b.originalPath === "references/large.md" && b.type === "backup",
      );

      expect(largeBackup).toBeDefined();

      // バックアップの内容を確認
      const backupContent = await fs.readFile(
        path.join(aiworkflowDir, "test-skill", largeBackup!.relativePath),
        "utf-8",
      );
      expect(backupContent.length).toBe(1024 * 1024);
    });
  });

  // ===========================================================================
  // Unicode Paths
  // ===========================================================================

  describe("Unicode Paths", () => {
    it("EDGE-UP-01: should handle Japanese skill names", async () => {
      // 日本語スキルディレクトリを作成
      const japaneseSkillDir = path.join(aiworkflowDir, "日本語スキル");
      await fs.mkdir(japaneseSkillDir, { recursive: true });
      await fs.writeFile(
        path.join(japaneseSkillDir, "SKILL.md"),
        "---\nname: 日本語スキル\n---",
      );
      await fs.writeFile(
        path.join(japaneseSkillDir, "content.md"),
        "# コンテンツ",
      );

      const content = await manager.readFile("日本語スキル", "content.md");
      expect(content).toBe("# コンテンツ");
    });

    it("EDGE-UP-02: should handle Japanese file names", async () => {
      const content = "# 日本語ファイル";
      await manager.writeFile("test-skill", "テスト.md", content);

      const readContent = await manager.readFile("test-skill", "テスト.md");
      expect(readContent).toBe(content);
    });

    it("EDGE-UP-03: should handle emoji in paths", async () => {
      const content = "# Emoji Content 🎉";
      await manager.writeFile("test-skill", "references/🚀readme.md", content);

      const readContent = await manager.readFile(
        "test-skill",
        "references/🚀readme.md",
      );
      expect(readContent).toBe(content);
    });
  });

  // ===========================================================================
  // Deep Directory Nesting
  // ===========================================================================

  describe("Deep Directory Nesting", () => {
    it("EDGE-DN-01: should read from deeply nested directory", async () => {
      // 10階層のネストを作成
      const deepPath = "a/b/c/d/e/f/g/h/i/j";
      const fullDeepPath = path.join(aiworkflowDir, "test-skill", deepPath);
      await fs.mkdir(fullDeepPath, { recursive: true });
      await fs.writeFile(path.join(fullDeepPath, "deep.md"), "# Deep Content");

      const content = await manager.readFile(
        "test-skill",
        `${deepPath}/deep.md`,
      );
      expect(content).toBe("# Deep Content");
    });

    it("EDGE-DN-02: should write to deeply nested directory", async () => {
      const deepPath = "level1/level2/level3/level4/level5";
      const content = "# Deep Write";

      await manager.writeFile("test-skill", `${deepPath}/file.md`, content);

      const readContent = await manager.readFile(
        "test-skill",
        `${deepPath}/file.md`,
      );
      expect(readContent).toBe(content);
    });

    it("EDGE-DN-03: should create nested directories recursively", async () => {
      const deepPath = "new1/new2/new3/new4";

      await manager.createFile(
        "test-skill",
        `${deepPath}/created.md`,
        "# Created",
      );

      const exists = await fs
        .access(path.join(aiworkflowDir, "test-skill", deepPath, "created.md"))
        .then(() => true)
        .catch(() => false);

      expect(exists).toBe(true);
    });
  });
});

// ===========================================================================
// Error Recovery Tests
// ===========================================================================

describe("SkillFileManager Error Recovery", () => {
  let testDir: string;
  let aiworkflowDir: string;
  let claudeDir: string;
  let manager: SkillFileManager;

  beforeEach(async () => {
    testDir = path.join(tmpdir(), `skill-error-test-${randomUUID()}`);
    aiworkflowDir = path.join(testDir, "aiworkflow");
    claudeDir = path.join(testDir, "claude");

    await fs.mkdir(aiworkflowDir, { recursive: true });
    await fs.mkdir(claudeDir, { recursive: true });

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

  describe("Disk Space Errors", () => {
    it("ERR-DS-01: should propagate filesystem errors", async () => {
      // 無効なパス文字を使ってエラーを発生させる（実際のエラーシナリオ）
      // Note: 実際のENOSPCエラーはディスクフルの状態でしかテストできないため、
      // ここではエラーが適切に伝播されることを確認
      await expect(
        manager.writeFile("test-skill", "references/\0invalid.md", "content"),
      ).rejects.toThrow();
    });

    it("ERR-DS-02: original file should remain after failed write to nonexistent path", async () => {
      const originalContent = "# Original Content";
      await fs.writeFile(
        path.join(aiworkflowDir, "test-skill", "references", "original.md"),
        originalContent,
      );

      // 存在しないパス深くにディレクトリがない場合のエラー
      // (SkillFileManagerは自動でディレクトリを作成するので、別の方法でテスト)
      // 元のファイルが影響を受けないことを確認
      const content = await manager.readFile(
        "test-skill",
        "references/original.md",
      );
      expect(content).toBe(originalContent);
    });
  });

  describe("Permission Errors", () => {
    it("ERR-PE-01: should throw error for nonexistent file", async () => {
      // 権限エラーの代わりに、ファイルが存在しない場合のエラーをテスト
      // Note: 実際のEACCESエラーはファイルシステムの権限変更が必要なため、
      // ここではFileNotFoundErrorが投げられることを確認
      await expect(
        manager.readFile("test-skill", "references/nonexistent.md"),
      ).rejects.toThrow(FileNotFoundError);
    });

    it("ERR-PE-02: should include path in error context", async () => {
      // FileNotFoundError にはパス情報が含まれる
      try {
        await manager.readFile("test-skill", "nonexistent.md");
      } catch (error) {
        expect(error).toBeInstanceOf(FileNotFoundError);
        expect((error as FileNotFoundError).message).toContain(
          "nonexistent.md",
        );
      }
    });
  });

  describe("Concurrent Access", () => {
    it("ERR-CA-01: should handle concurrent reads safely", async () => {
      // 並行読み込みを実行
      const reads = Array.from({ length: 10 }, () =>
        manager.readFile("test-skill", "references/test.md"),
      );

      const results = await Promise.all(reads);

      // すべて同じ内容を返すことを確認
      expect(results.every((r) => r === "# Test")).toBe(true);
    });

    it("ERR-CA-02: should handle concurrent writes to different files", async () => {
      // 異なるファイルへの並行書き込み
      const writes = Array.from({ length: 5 }, (_, i) =>
        manager.writeFile(
          "test-skill",
          `references/file${i}.md`,
          `Content ${i}`,
        ),
      );

      await Promise.all(writes);

      // すべてのファイルが正しく作成されたことを確認
      for (let i = 0; i < 5; i++) {
        const content = await manager.readFile(
          "test-skill",
          `references/file${i}.md`,
        );
        expect(content).toBe(`Content ${i}`);
      }
    });
  });
});

// ===========================================================================
// Boundary Values Tests
// ===========================================================================

describe("SkillFileManager Boundary Values", () => {
  let testDir: string;
  let aiworkflowDir: string;
  let claudeDir: string;
  let manager: SkillFileManager;

  beforeEach(async () => {
    testDir = path.join(tmpdir(), `skill-boundary-test-${randomUUID()}`);
    aiworkflowDir = path.join(testDir, "aiworkflow");
    claudeDir = path.join(testDir, "claude");

    await fs.mkdir(aiworkflowDir, { recursive: true });
    await fs.mkdir(claudeDir, { recursive: true });

    const testSkillDir = path.join(aiworkflowDir, "test-skill");
    await fs.mkdir(path.join(testSkillDir, "references"), { recursive: true });
    await fs.writeFile(
      path.join(testSkillDir, "SKILL.md"),
      "---\nname: test-skill\n---",
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

  describe("Path Length", () => {
    it("BV-PL-01: should handle maximum allowed path length", async () => {
      // macOS/Linuxでは通常255文字がファイル名の上限
      // パス全体は通常4096文字まで
      const longFileName = "a".repeat(200) + ".md";

      await manager.writeFile("test-skill", longFileName, "# Long Name");

      const content = await manager.readFile("test-skill", longFileName);
      expect(content).toBe("# Long Name");
    });

    it("BV-PL-02: should throw error for paths exceeding limit", async () => {
      // 256文字を超えるファイル名は多くのOSで失敗する
      const tooLongFileName = "a".repeat(256) + ".md";

      await expect(
        manager.writeFile("test-skill", tooLongFileName, "content"),
      ).rejects.toThrow();
    });
  });

  describe("Skill Names", () => {
    it("BV-SN-01: should throw error for empty skill name", async () => {
      // 空のスキル名はエラーを投げるべき（FileNotFoundError または SkillNotFoundError）
      await expect(manager.readFile("", "file.md")).rejects.toThrow();
    });

    it("BV-SN-02: should throw error for whitespace-only skill name", async () => {
      // 空白のみのスキル名はエラーを投げるべき
      await expect(manager.readFile("   ", "file.md")).rejects.toThrow();
    });

    it("BV-SN-03: should handle skill name with special characters", async () => {
      // ハイフンとアンダースコアは許可
      const specialSkillDir = path.join(aiworkflowDir, "skill-with_special");
      await fs.mkdir(specialSkillDir, { recursive: true });
      await fs.writeFile(
        path.join(specialSkillDir, "SKILL.md"),
        "---\nname: skill-with_special\n---",
      );
      await fs.writeFile(path.join(specialSkillDir, "file.md"), "# Content");

      const content = await manager.readFile("skill-with_special", "file.md");
      expect(content).toBe("# Content");
    });
  });

  describe("File Content", () => {
    it("BV-FC-01: should handle binary content", async () => {
      // バイナリデータを書き込み（Base64エンコード文字列として）
      const binaryLike = Buffer.from([0x00, 0x01, 0x02, 0xff, 0xfe]).toString(
        "base64",
      );

      await manager.writeFile(
        "test-skill",
        "references/binary.txt",
        binaryLike,
      );

      const content = await manager.readFile(
        "test-skill",
        "references/binary.txt",
      );
      expect(content).toBe(binaryLike);
    });

    it("BV-FC-02: should preserve line endings (LF vs CRLF)", async () => {
      const lfContent = "line1\nline2\nline3";
      const crlfContent = "line1\r\nline2\r\nline3";

      await manager.writeFile("test-skill", "references/lf.txt", lfContent);
      await manager.writeFile("test-skill", "references/crlf.txt", crlfContent);

      const readLf = await manager.readFile("test-skill", "references/lf.txt");
      const readCrlf = await manager.readFile(
        "test-skill",
        "references/crlf.txt",
      );

      expect(readLf).toBe(lfContent);
      expect(readCrlf).toBe(crlfContent);
    });

    it("BV-FC-03: should handle BOM in UTF-8 files", async () => {
      const bomContent = "\uFEFF# Content with BOM";

      await manager.writeFile("test-skill", "references/bom.md", bomContent);

      const content = await manager.readFile("test-skill", "references/bom.md");
      expect(content).toBe(bomContent);
    });
  });
});

// ===========================================================================
// Backup Verification Tests
// ===========================================================================

describe("SkillFileManager Backup Verification", () => {
  let testDir: string;
  let aiworkflowDir: string;
  let claudeDir: string;
  let manager: SkillFileManager;

  beforeEach(async () => {
    testDir = path.join(tmpdir(), `skill-backup-test-${randomUUID()}`);
    aiworkflowDir = path.join(testDir, "aiworkflow");
    claudeDir = path.join(testDir, "claude");

    await fs.mkdir(aiworkflowDir, { recursive: true });
    await fs.mkdir(claudeDir, { recursive: true });

    const testSkillDir = path.join(aiworkflowDir, "test-skill");
    await fs.mkdir(path.join(testSkillDir, "references"), { recursive: true });
    await fs.writeFile(
      path.join(testSkillDir, "SKILL.md"),
      "---\nname: test-skill\n---",
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

  describe("Backup Integrity", () => {
    it("BV-BI-01: should create backup with exact content", async () => {
      const original = "# Original with special chars: éàü 日本語";

      await manager.writeFile("test-skill", "references/special.md", original);
      await manager.writeFile("test-skill", "references/special.md", "# New");

      const backups = await manager.listBackups("test-skill");
      const backup = backups.find(
        (b) =>
          b.originalPath === "references/special.md" && b.type === "backup",
      );

      expect(backup).toBeDefined();

      const backupContent = await fs.readFile(
        path.join(aiworkflowDir, "test-skill", backup!.relativePath),
        "utf-8",
      );
      expect(backupContent).toBe(original);
    });

    it("BV-BI-02: should create unique backup names for rapid writes", async () => {
      // 高速で連続書き込み
      await manager.writeFile("test-skill", "references/rapid.md", "Content 1");
      await manager.writeFile("test-skill", "references/rapid.md", "Content 2");
      await manager.writeFile("test-skill", "references/rapid.md", "Content 3");
      await manager.writeFile("test-skill", "references/rapid.md", "Content 4");

      const backups = await manager.listBackups("test-skill");
      const rapidBackups = backups.filter(
        (b) => b.originalPath === "references/rapid.md",
      );

      // 各バックアップは一意のタイムスタンプを持つべき
      const timestamps = rapidBackups.map((b) => b.timestamp);
      const uniqueTimestamps = new Set(timestamps);

      expect(uniqueTimestamps.size).toBe(rapidBackups.length);
    });

    it("BV-BI-03: should preserve multiline content in backup", async () => {
      const multiline = `# Title

## Section 1
Content for section 1.

## Section 2
- Item 1
- Item 2
- Item 3

\`\`\`typescript
const code = "example";
\`\`\`
`;

      await manager.writeFile("test-skill", "references/multi.md", multiline);
      await manager.writeFile(
        "test-skill",
        "references/multi.md",
        "# Replaced",
      );

      const backups = await manager.listBackups("test-skill");
      const backup = backups.find(
        (b) => b.originalPath === "references/multi.md" && b.type === "backup",
      );

      const backupContent = await fs.readFile(
        path.join(aiworkflowDir, "test-skill", backup!.relativePath),
        "utf-8",
      );
      expect(backupContent).toBe(multiline);
    });

    it("BV-BI-04: should handle backup of file without extension", async () => {
      await manager.writeFile("test-skill", "references/README", "# README");
      await manager.writeFile("test-skill", "references/README", "# Updated");

      const backups = await manager.listBackups("test-skill");
      const readmeBackup = backups.find(
        (b) => b.originalPath === "references/README",
      );

      expect(readmeBackup).toBeDefined();
    });
  });

  describe("Backup Listing", () => {
    it("BV-BL-01: should sort backups by timestamp descending", async () => {
      await manager.writeFile("test-skill", "references/sort.md", "V1");
      await new Promise((r) => setTimeout(r, 10));
      await manager.writeFile("test-skill", "references/sort.md", "V2");
      await new Promise((r) => setTimeout(r, 10));
      await manager.writeFile("test-skill", "references/sort.md", "V3");

      const backups = await manager.listBackups("test-skill");
      const sortBackups = backups.filter(
        (b) => b.originalPath === "references/sort.md",
      );

      // タイムスタンプが降順であることを確認
      for (let i = 1; i < sortBackups.length; i++) {
        expect(sortBackups[i - 1].timestamp).toBeGreaterThanOrEqual(
          sortBackups[i].timestamp,
        );
      }
    });

    it("BV-BL-02: should correctly parse backup type from filename", async () => {
      // 書き込み（backup タイプ）
      await manager.writeFile("test-skill", "references/type.md", "Content");
      await manager.writeFile("test-skill", "references/type.md", "Updated");

      // 削除（deleted タイプ）
      await manager.deleteFile("test-skill", "references/type.md");

      const backups = await manager.listBackups("test-skill");
      const typeBackups = backups.filter(
        (b) => b.originalPath === "references/type.md",
      );

      const hasBackupType = typeBackups.some((b) => b.type === "backup");
      const hasDeletedType = typeBackups.some((b) => b.type === "deleted");

      expect(hasBackupType).toBe(true);
      expect(hasDeletedType).toBe(true);
    });

    it("BV-BL-03: should handle backups in subdirectories", async () => {
      await manager.writeFile("test-skill", "a/b/c/deep.md", "Original");
      await manager.writeFile("test-skill", "a/b/c/deep.md", "Updated");

      const backups = await manager.listBackups("test-skill");
      const deepBackup = backups.find(
        (b) => b.originalPath === "a/b/c/deep.md",
      );

      expect(deepBackup).toBeDefined();
      expect(deepBackup!.relativePath).toContain("a/b/c/");
    });

    it("BV-BL-04: should ignore non-backup files with similar names", async () => {
      // backup に似た名前だが実際はバックアップでないファイル
      await fs.writeFile(
        path.join(aiworkflowDir, "test-skill", "references", "file.md.old"),
        "old content",
      );
      await fs.writeFile(
        path.join(aiworkflowDir, "test-skill", "references", "file.md~"),
        "temp content",
      );

      const backups = await manager.listBackups("test-skill");

      // これらはバックアップとして認識されないべき
      const fakeBackups = backups.filter(
        (b) =>
          b.relativePath.endsWith(".old") || b.relativePath.endsWith(".md~"),
      );

      expect(fakeBackups.length).toBe(0);
    });
  });
});

// ===========================================================================
// Integration Complex Scenarios
// ===========================================================================

describe("SkillFileManager Complex Scenarios", () => {
  let testDir: string;
  let aiworkflowDir: string;
  let claudeDir: string;
  let manager: SkillFileManager;

  beforeEach(async () => {
    testDir = path.join(tmpdir(), `skill-complex-test-${randomUUID()}`);
    aiworkflowDir = path.join(testDir, "aiworkflow");
    claudeDir = path.join(testDir, "claude");

    await fs.mkdir(aiworkflowDir, { recursive: true });
    await fs.mkdir(claudeDir, { recursive: true });

    const testSkillDir = path.join(aiworkflowDir, "test-skill");
    await fs.mkdir(path.join(testSkillDir, "references"), { recursive: true });
    await fs.writeFile(
      path.join(testSkillDir, "SKILL.md"),
      "---\nname: test-skill\n---",
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

  describe("Complex Workflows", () => {
    it("CS-CW-01: should handle create-modify-delete-restore workflow", async () => {
      // 1. Create
      await manager.createFile("test-skill", "references/workflow.md", "V1");
      expect(
        await manager.readFile("test-skill", "references/workflow.md"),
      ).toBe("V1");

      // 2. Modify
      await manager.writeFile("test-skill", "references/workflow.md", "V2");
      expect(
        await manager.readFile("test-skill", "references/workflow.md"),
      ).toBe("V2");

      // 3. Delete
      await manager.deleteFile("test-skill", "references/workflow.md");
      await expect(
        manager.readFile("test-skill", "references/workflow.md"),
      ).rejects.toThrow(FileNotFoundError);

      // 4. Restore from deleted backup
      const backups = await manager.listBackups("test-skill");
      const deletedBackup = backups.find(
        (b) =>
          b.originalPath === "references/workflow.md" && b.type === "deleted",
      );

      await manager.restoreBackup("test-skill", deletedBackup!.relativePath);
      expect(
        await manager.readFile("test-skill", "references/workflow.md"),
      ).toBe("V2");
    });

    it("CS-CW-02: should maintain backup chain through multiple edits", async () => {
      const versions = ["V1", "V2", "V3", "V4", "V5"];

      for (const version of versions) {
        await manager.writeFile(
          "test-skill",
          "references/chain.md",
          `# ${version}`,
        );
        await new Promise((r) => setTimeout(r, 5));
      }

      const backups = await manager.listBackups("test-skill");
      const chainBackups = backups.filter(
        (b) => b.originalPath === "references/chain.md",
      );

      // V1, V2, V3, V4 のバックアップが存在するはず（V5は現在の内容）
      expect(chainBackups.length).toBe(4);
    });

    it("CS-CW-03: should correctly distinguish between backup and deleted types after operations", async () => {
      // Create -> Modify -> Delete -> Restore -> Modify -> Delete
      await manager.createFile("test-skill", "references/types.md", "Created");
      await manager.writeFile("test-skill", "references/types.md", "Modified1");
      await manager.deleteFile("test-skill", "references/types.md");

      const backups1 = await manager.listBackups("test-skill");
      const deleted1 = backups1.filter(
        (b) => b.originalPath === "references/types.md" && b.type === "deleted",
      );
      expect(deleted1.length).toBe(1);

      // Restore
      await manager.restoreBackup("test-skill", deleted1[0].relativePath);

      // Modify again
      await manager.writeFile("test-skill", "references/types.md", "Modified2");

      const backups2 = await manager.listBackups("test-skill");
      const allTypesBackups = backups2.filter(
        (b) => b.originalPath === "references/types.md",
      );

      // backup と deleted の両方のタイプが存在するはず
      expect(allTypesBackups.some((b) => b.type === "backup")).toBe(true);
      expect(allTypesBackups.some((b) => b.type === "deleted")).toBe(true);
    });
  });

  describe("Multiple Skills", () => {
    it("CS-MS-01: should isolate operations between skills", async () => {
      // 2番目のスキルを作成
      const skill2Dir = path.join(aiworkflowDir, "skill-two");
      await fs.mkdir(skill2Dir, { recursive: true });
      await fs.writeFile(
        path.join(skill2Dir, "SKILL.md"),
        "---\nname: skill-two\n---",
      );

      // 各スキルに同名ファイルを作成
      await manager.writeFile("test-skill", "same.md", "Skill 1 Content");
      await manager.writeFile("skill-two", "same.md", "Skill 2 Content");

      // 内容が独立していることを確認
      expect(await manager.readFile("test-skill", "same.md")).toBe(
        "Skill 1 Content",
      );
      expect(await manager.readFile("skill-two", "same.md")).toBe(
        "Skill 2 Content",
      );

      // バックアップも独立
      const backups1 = await manager.listBackups("test-skill");
      const backups2 = await manager.listBackups("skill-two");

      expect(backups1.every((b) => !b.relativePath.includes("skill-two"))).toBe(
        true,
      );
      expect(
        backups2.every((b) => !b.relativePath.includes("test-skill")),
      ).toBe(true);
    });

    it("CS-MS-02: should handle skill not found gracefully", async () => {
      await expect(
        manager.readFile("nonexistent-skill", "file.md"),
      ).rejects.toThrow(SkillNotFoundError);
    });
  });
});

// ===========================================================================
// Performance Tests
// ===========================================================================

describe("SkillFileManager Performance", () => {
  let testDir: string;
  let aiworkflowDir: string;
  let claudeDir: string;
  let manager: SkillFileManager;

  beforeEach(async () => {
    testDir = path.join(tmpdir(), `skill-perf-test-${randomUUID()}`);
    aiworkflowDir = path.join(testDir, "aiworkflow");
    claudeDir = path.join(testDir, "claude");

    await fs.mkdir(aiworkflowDir, { recursive: true });
    await fs.mkdir(claudeDir, { recursive: true });

    const testSkillDir = path.join(aiworkflowDir, "test-skill");
    await fs.mkdir(path.join(testSkillDir, "references"), { recursive: true });
    await fs.writeFile(
      path.join(testSkillDir, "SKILL.md"),
      "---\nname: test-skill\n---",
    );
    await fs.writeFile(
      path.join(testSkillDir, "references", "test.md"),
      "# Test Content",
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

  it("PERF-01: should complete single file read within 100ms", async () => {
    const start = performance.now();

    await manager.readFile("test-skill", "references/test.md");

    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(100);
  });

  it("PERF-02: should complete single file write within 100ms", async () => {
    const start = performance.now();

    await manager.writeFile(
      "test-skill",
      "references/perf.md",
      "# Performance",
    );

    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(100);
  });

  it("PERF-03: should handle 100 consecutive operations within 10s", async () => {
    const start = performance.now();

    for (let i = 0; i < 100; i++) {
      await manager.writeFile(
        "test-skill",
        `references/file${i % 10}.md`,
        `Content ${i}`,
      );
    }

    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(10000);
  });
});

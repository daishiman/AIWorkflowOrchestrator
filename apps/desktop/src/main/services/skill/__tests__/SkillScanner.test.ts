/**
 * SkillScanner Tests
 *
 * TDD Red Phase: These tests are designed to fail until implementation is complete.
 *
 * @see docs/30-workflows/agent-003-skill-management-backend/outputs/phase-2/class-design.md
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as fs from "fs/promises";
import * as path from "path";
import { tmpdir } from "os";

// Mock fs/promises for unit tests
vi.mock("fs/promises");

// Import after mocks - this will fail in Red phase
let SkillScanner: typeof import("../SkillScanner").SkillScanner;

describe("SkillScanner", () => {
  const testBasePath = "/test/skills";
  let scanner: InstanceType<typeof SkillScanner>;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Try to import SkillScanner (will fail in Red phase)
    try {
      const module = await import("../SkillScanner");
      SkillScanner = module.SkillScanner;
      scanner = new SkillScanner(testBasePath);
    } catch {
      // Expected in Red phase - module doesn't exist yet
    }
  });

  afterEach(() => {
    vi.resetModules();
  });

  // ===========================================================================
  // scanDirectory tests
  // ===========================================================================

  describe("scanDirectory", () => {
    it("SS-SD-01: should find directories with SKILL.md", async () => {
      // Given: ディレクトリにSKILL.mdが存在する
      const mockEntries = [
        { name: "skill-a", isDirectory: () => true, isFile: () => false },
        { name: "skill-b", isDirectory: () => true, isFile: () => false },
      ];

      (fs.readdir as ReturnType<typeof vi.fn>).mockResolvedValue(mockEntries);
      (fs.access as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      if (!scanner) {
        throw new Error("SkillScanner not initialized - Red phase");
      }

      // When: scanDirectoryを呼び出す
      const result = await scanner.scanDirectory();

      // Then: SKILL.mdへのパスの配列が返される
      expect(result).toHaveLength(2);
      expect(result).toContain(path.join(testBasePath, "skill-a", "SKILL.md"));
      expect(result).toContain(path.join(testBasePath, "skill-b", "SKILL.md"));
    });

    it("SS-SD-02: should ignore directories without SKILL.md", async () => {
      // Given: SKILL.mdが存在しないディレクトリがある
      const mockEntries = [
        { name: "skill-a", isDirectory: () => true, isFile: () => false },
        { name: "no-skill", isDirectory: () => true, isFile: () => false },
      ];

      (fs.readdir as ReturnType<typeof vi.fn>).mockResolvedValue(mockEntries);
      (fs.access as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(undefined) // skill-a has SKILL.md
        .mockRejectedValueOnce(new Error("ENOENT")); // no-skill doesn't

      if (!scanner) {
        throw new Error("SkillScanner not initialized - Red phase");
      }

      // When: scanDirectoryを呼び出す
      const result = await scanner.scanDirectory();

      // Then: SKILL.mdがあるディレクトリのみ返される
      expect(result).toHaveLength(1);
      expect(result).toContain(path.join(testBasePath, "skill-a", "SKILL.md"));
    });

    it("SS-SD-03: should ignore hidden directories starting with dot", async () => {
      // Given: .で始まる隠しディレクトリがある
      const mockEntries = [
        { name: ".hidden", isDirectory: () => true, isFile: () => false },
        { name: "skill-a", isDirectory: () => true, isFile: () => false },
      ];

      (fs.readdir as ReturnType<typeof vi.fn>).mockResolvedValue(mockEntries);
      (fs.access as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      if (!scanner) {
        throw new Error("SkillScanner not initialized - Red phase");
      }

      // When: scanDirectoryを呼び出す
      const result = await scanner.scanDirectory();

      // Then: 隠しディレクトリは除外される
      expect(result).toHaveLength(1);
      expect(result).not.toContain(
        path.join(testBasePath, ".hidden", "SKILL.md"),
      );
    });

    it("SS-SD-04: should handle empty directory", async () => {
      // Given: 空のディレクトリ
      (fs.readdir as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      if (!scanner) {
        throw new Error("SkillScanner not initialized - Red phase");
      }

      // When: scanDirectoryを呼び出す
      const result = await scanner.scanDirectory();

      // Then: 空配列が返される
      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it("SS-SD-05: should handle non-existent base path", async () => {
      // Given: 存在しないベースパス
      (fs.readdir as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("ENOENT: no such file or directory"),
      );

      if (!scanner) {
        throw new Error("SkillScanner not initialized - Red phase");
      }

      // When & Then: エラーがスローされる
      await expect(scanner.scanDirectory()).rejects.toThrow();
    });

    it("SS-SD-06: should return absolute paths to SKILL.md", async () => {
      // Given: ディレクトリにSKILL.mdが存在する
      const mockEntries = [
        { name: "skill-a", isDirectory: () => true, isFile: () => false },
      ];

      (fs.readdir as ReturnType<typeof vi.fn>).mockResolvedValue(mockEntries);
      (fs.access as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      if (!scanner) {
        throw new Error("SkillScanner not initialized - Red phase");
      }

      // When: scanDirectoryを呼び出す
      const result = await scanner.scanDirectory();

      // Then: 絶対パスが返される
      expect(result[0]).toBe(path.join(testBasePath, "skill-a", "SKILL.md"));
      expect(path.isAbsolute(result[0])).toBe(true);
    });

    it("SS-SD-07: should ignore files (only process directories)", async () => {
      // Given: ファイルとディレクトリが混在
      const mockEntries = [
        { name: "skill-a", isDirectory: () => true, isFile: () => false },
        { name: "README.md", isDirectory: () => false, isFile: () => true },
      ];

      (fs.readdir as ReturnType<typeof vi.fn>).mockResolvedValue(mockEntries);
      (fs.access as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      if (!scanner) {
        throw new Error("SkillScanner not initialized - Red phase");
      }

      // When: scanDirectoryを呼び出す
      const result = await scanner.scanDirectory();

      // Then: ディレクトリのみが処理される
      expect(result).toHaveLength(1);
    });
  });

  // ===========================================================================
  // setBasePath tests
  // ===========================================================================

  describe("setBasePath", () => {
    it("SS-SBP-01: should update the base path", async () => {
      if (!scanner) {
        throw new Error("SkillScanner not initialized - Red phase");
      }

      // Given: 初期ベースパス
      const initialPath = scanner.getBasePath();

      // When: setBasePathで新しいパスを設定
      const newPath = "/new/skills/path";
      scanner.setBasePath(newPath);

      // Then: ベースパスが更新される
      expect(scanner.getBasePath()).toBe(path.resolve(newPath));
      expect(scanner.getBasePath()).not.toBe(initialPath);
    });

    it("SS-SBP-02: should resolve relative paths to absolute", async () => {
      if (!scanner) {
        throw new Error("SkillScanner not initialized - Red phase");
      }

      // When: 相対パスを設定
      scanner.setBasePath("./relative/path");

      // Then: 絶対パスに解決される
      expect(path.isAbsolute(scanner.getBasePath())).toBe(true);
    });
  });

  // ===========================================================================
  // getBasePath tests
  // ===========================================================================

  describe("getBasePath", () => {
    it("SS-GBP-01: should return the current base path", () => {
      if (!scanner) {
        throw new Error("SkillScanner not initialized - Red phase");
      }

      // When: getBasePathを呼び出す
      const result = scanner.getBasePath();

      // Then: 現在のベースパスが返される
      expect(result).toBe(path.resolve(testBasePath));
    });

    it("SS-GBP-02: should return absolute path", () => {
      if (!scanner) {
        throw new Error("SkillScanner not initialized - Red phase");
      }

      // When: getBasePathを呼び出す
      const result = scanner.getBasePath();

      // Then: 絶対パスが返される
      expect(path.isAbsolute(result)).toBe(true);
    });
  });

  // ===========================================================================
  // Path validation tests (Security)
  // ===========================================================================

  describe("path validation", () => {
    it("SS-PV-01: should prevent path traversal attack with ../", async () => {
      // Given: パストラバーサルを試みるディレクトリ名
      const mockEntries = [
        { name: "../etc", isDirectory: () => true, isFile: () => false },
      ];

      (fs.readdir as ReturnType<typeof vi.fn>).mockResolvedValue(mockEntries);

      if (!scanner) {
        throw new Error("SkillScanner not initialized - Red phase");
      }

      // When & Then: パストラバーサル攻撃が防止される
      await expect(scanner.scanDirectory()).rejects.toThrow(/path traversal/i);
    });

    it("SS-PV-02: should reject paths outside base directory", async () => {
      // Given: ベースディレクトリ外を参照するパス
      const mockEntries = [
        {
          name: "../../outside",
          isDirectory: () => true,
          isFile: () => false,
        },
      ];

      (fs.readdir as ReturnType<typeof vi.fn>).mockResolvedValue(mockEntries);

      if (!scanner) {
        throw new Error("SkillScanner not initialized - Red phase");
      }

      // When & Then: ベースディレクトリ外のパスが拒否される
      await expect(scanner.scanDirectory()).rejects.toThrow(/path traversal/i);
    });

    it("SS-PV-03: should handle symlink that points outside base path", async () => {
      // Given: ベースディレクトリ外を指すシンボリックリンク
      const mockEntries = [
        {
          name: "malicious-link",
          isDirectory: () => true,
          isFile: () => false,
        },
      ];

      (fs.readdir as ReturnType<typeof vi.fn>).mockResolvedValue(mockEntries);
      // realpath returns path outside base
      (fs.realpath as ReturnType<typeof vi.fn>).mockResolvedValue(
        "/etc/passwd",
      );

      if (!scanner) {
        throw new Error("SkillScanner not initialized - Red phase");
      }

      // When & Then: シンボリックリンク攻撃が防止される
      // Note: Implementation should check realpath
      await expect(scanner.scanDirectory()).rejects.toThrow(/path traversal/i);
    });
  });
});

// ===========================================================================
// NEW API Tests - TDD Green Phase for TASK-2A
// These tests target the new scanAll() API with ScannedSkillMetadata
// Uses real file system with fixtures (no mocking)
// ===========================================================================

describe("SkillScanner - New API (TASK-2A)", () => {
  let NewSkillScanner: typeof import("../SkillScanner").SkillScanner;
  let realFs: typeof import("fs/promises");

  beforeEach(async () => {
    // Reset modules and unmock fs/promises to use real file system
    vi.resetModules();
    vi.doUnmock("fs/promises");
    realFs = await vi.importActual<typeof import("fs/promises")>("fs/promises");
    const module = await import("../SkillScanner");
    NewSkillScanner = module.SkillScanner;
  });

  afterEach(() => {
    // Restore mock for legacy tests
    vi.doMock("fs/promises");
  });

  describe("scanAll", () => {
    it("should return all skills from both directories", async () => {
      // Arrange
      const scanner = new NewSkillScanner({
        aiworkflowSkillsDir: path.join(__dirname, "__fixtures__"),
        claudeSkillsDir: "/non-existent-path",
      });

      // Act
      const skills = await scanner.scanAll();

      // Assert
      expect(skills).toBeInstanceOf(Array);
      expect(skills.length).toBeGreaterThan(0);
      expect(skills.some((s) => s.name === "valid-skill")).toBe(true);
    });

    it("should return empty array when directory is empty", async () => {
      // Arrange
      const emptyDir = path.join(__dirname, "__fixtures__", "empty-dir-test");
      await realFs.mkdir(emptyDir, { recursive: true });

      const scanner = new NewSkillScanner({
        aiworkflowSkillsDir: emptyDir,
        claudeSkillsDir: "/non-existent-path",
      });

      // Act
      const skills = await scanner.scanAll();

      // Assert
      expect(skills).toEqual([]);

      // Cleanup
      await realFs.rmdir(emptyDir);
    });

    it("should skip invalid skill directories (no SKILL.md)", async () => {
      const scanner = new NewSkillScanner({
        aiworkflowSkillsDir: path.join(__dirname, "__fixtures__"),
        claudeSkillsDir: "/non-existent-path",
      });

      const skills = await scanner.scanAll();

      expect(skills.some((s) => s.name === "invalid-skill")).toBe(false);
    });

    it("should set readonly: false for aiworkflow skills directory", async () => {
      const scanner = new NewSkillScanner({
        aiworkflowSkillsDir: path.join(__dirname, "__fixtures__"),
        claudeSkillsDir: "/non-existent-path",
      });

      const skills = await scanner.scanAll();
      const aiworkflowSkills = skills.filter((s) => s.name === "valid-skill");

      aiworkflowSkills.forEach((skill) => {
        expect(skill.readonly).toBe(false);
      });
    });

    it("should set readonly: true for claude skills directory", async () => {
      // Create a temporary empty directory for aiworkflowSkillsDir
      const emptyAiworkflowDir = path.join(
        __dirname,
        "__fixtures__",
        "empty-aiworkflow-test",
      );
      await realFs.mkdir(emptyAiworkflowDir, { recursive: true });

      const scanner = new NewSkillScanner({
        aiworkflowSkillsDir: emptyAiworkflowDir,
        claudeSkillsDir: path.join(__dirname, "__fixtures__"),
      });

      const skills = await scanner.scanAll();

      // All skills should come from claudeSkillsDir and have readonly: true
      expect(skills.length).toBeGreaterThan(0);
      skills.forEach((skill) => {
        expect(skill.readonly).toBe(true);
      });

      // Cleanup
      await realFs.rmdir(emptyAiworkflowDir);
    });
  });

  describe("parseSkill", () => {
    it("should parse SKILL.md frontmatter correctly", async () => {
      const scanner = new NewSkillScanner({
        aiworkflowSkillsDir: path.join(__dirname, "__fixtures__"),
        claudeSkillsDir: "/non-existent-path",
      });

      const skills = await scanner.scanAll();
      const validSkill = skills.find((s) => s.name === "valid-skill");

      expect(validSkill).toBeDefined();
      expect(validSkill?.description).toBe("テスト用の有効なスキル");
      expect(validSkill?.allowedTools).toEqual(["Read", "Write", "Edit"]);
    });

    it("should skip malformed YAML frontmatter", async () => {
      const scanner = new NewSkillScanner({
        aiworkflowSkillsDir: path.join(__dirname, "__fixtures__"),
        claudeSkillsDir: "/non-existent-path",
      });

      const skills = await scanner.scanAll();

      expect(skills.some((s) => s.name === "malformed-skill")).toBe(false);
    });

    it("should extract allowed-tools correctly", async () => {
      const scanner = new NewSkillScanner({
        aiworkflowSkillsDir: path.join(__dirname, "__fixtures__"),
        claudeSkillsDir: "/non-existent-path",
      });

      const skills = await scanner.scanAll();
      const validSkill = skills.find((s) => s.name === "valid-skill");

      expect(validSkill?.allowedTools).toContain("Read");
      expect(validSkill?.allowedTools).toContain("Write");
      expect(validSkill?.allowedTools).toContain("Edit");
    });
  });

  describe("scanSubDirectory", () => {
    it("should scan agents directory", async () => {
      const scanner = new NewSkillScanner({
        aiworkflowSkillsDir: path.join(__dirname, "__fixtures__"),
        claudeSkillsDir: "/non-existent-path",
      });

      const skills = await scanner.scanAll();
      const validSkill = skills.find((s) => s.name === "valid-skill");

      expect(validSkill?.agents).toBeInstanceOf(Array);
      expect(validSkill?.agents.length).toBeGreaterThan(0);
      expect(validSkill?.agents[0].filename).toBe("task-1.md");
    });

    it("should scan references directory", async () => {
      const scanner = new NewSkillScanner({
        aiworkflowSkillsDir: path.join(__dirname, "__fixtures__"),
        claudeSkillsDir: "/non-existent-path",
      });

      const skills = await scanner.scanAll();
      const validSkill = skills.find((s) => s.name === "valid-skill");

      expect(validSkill?.references).toBeInstanceOf(Array);
      expect(validSkill?.references.length).toBeGreaterThan(0);
      expect(validSkill?.references[0].filename).toBe("guide.md");
    });

    it("should return empty arrays for non-existent subdirectories", async () => {
      const scanner = new NewSkillScanner({
        aiworkflowSkillsDir: path.join(__dirname, "__fixtures__"),
        claudeSkillsDir: "/non-existent-path",
      });

      const skills = await scanner.scanAll();
      const minimalSkill = skills.find((s) => s.name === "minimal-skill");

      expect(minimalSkill?.agents).toEqual([]);
      expect(minimalSkill?.references).toEqual([]);
      expect(minimalSkill?.scripts).toEqual([]);
      expect(minimalSkill?.assets).toEqual([]);
      expect(minimalSkill?.schemas).toEqual([]);
      expect(minimalSkill?.indexes).toEqual([]);
    });
  });

  describe("extractDescription", () => {
    it("should extract first heading as description for subresources", async () => {
      const scanner = new NewSkillScanner({
        aiworkflowSkillsDir: path.join(__dirname, "__fixtures__"),
        claudeSkillsDir: "/non-existent-path",
      });

      const skills = await scanner.scanAll();
      const validSkill = skills.find((s) => s.name === "valid-skill");

      const agent = validSkill?.agents.find((a) => a.filename === "task-1.md");
      expect(agent?.description).toBeDefined();
      expect(agent?.description).toContain("Task 1");
    });
  });

  describe("SkillMetadata structure", () => {
    it("should include path property", async () => {
      const scanner = new NewSkillScanner({
        aiworkflowSkillsDir: path.join(__dirname, "__fixtures__"),
        claudeSkillsDir: "/non-existent-path",
      });

      const skills = await scanner.scanAll();
      const validSkill = skills.find((s) => s.name === "valid-skill");

      expect(validSkill?.path).toBeDefined();
      expect(validSkill?.path).toContain("valid-skill");
    });

    it("should include updatedAt property", async () => {
      const scanner = new NewSkillScanner({
        aiworkflowSkillsDir: path.join(__dirname, "__fixtures__"),
        claudeSkillsDir: "/non-existent-path",
      });

      const skills = await scanner.scanAll();
      const validSkill = skills.find((s) => s.name === "valid-skill");

      expect(validSkill?.updatedAt).toBeInstanceOf(Date);
    });

    it("should include otherFiles property", async () => {
      const scanner = new NewSkillScanner({
        aiworkflowSkillsDir: path.join(__dirname, "__fixtures__"),
        claudeSkillsDir: "/non-existent-path",
      });

      const skills = await scanner.scanAll();
      const validSkill = skills.find((s) => s.name === "valid-skill");

      expect(validSkill?.otherFiles).toBeInstanceOf(Array);
    });
  });
});

// ===========================================================================
// Phase 6: テスト拡充 - Error handling, Boundary cases, Subdirectories, Other files
// ===========================================================================

describe("SkillScanner - Phase 6 Test Expansion", () => {
  let NewSkillScanner: typeof import("../SkillScanner").SkillScanner;
  let realFs: typeof import("fs/promises");

  beforeEach(async () => {
    vi.resetModules();
    vi.doUnmock("fs/promises");
    realFs = await vi.importActual<typeof import("fs/promises")>("fs/promises");
    const module = await import("../SkillScanner");
    NewSkillScanner = module.SkillScanner;
  });

  afterEach(() => {
    vi.doMock("fs/promises");
  });

  // Task 2: Error handling tests
  describe("error handling", () => {
    it("should handle invalid YAML in frontmatter gracefully", async () => {
      const scanner = new NewSkillScanner({
        aiworkflowSkillsDir: path.join(__dirname, "__fixtures__"),
        claudeSkillsDir: "/non-existent-path",
      });

      const skills = await scanner.scanAll();

      // エラーなくスキャンが完了し、不正スキルはスキップされる
      expect(skills.some((s) => s.name === "malformed-skill")).toBe(false);
    });

    it("should create aiworkflow directory if not exists", async () => {
      const tempDir = path.join(__dirname, "__fixtures__", "temp-aiworkflow");

      // Ensure directory does not exist
      try {
        await realFs.rmdir(tempDir);
      } catch {
        // Directory doesn't exist, which is expected
      }

      const scanner = new NewSkillScanner({
        aiworkflowSkillsDir: tempDir,
        claudeSkillsDir: "/non-existent-path",
      });

      await scanner.scanAll();

      // ディレクトリが作成されていることを確認
      const exists = await realFs
        .access(tempDir)
        .then(() => true)
        .catch(() => false);
      expect(exists).toBe(true);

      // クリーンアップ
      await realFs.rmdir(tempDir);
    });

    it("should handle non-existent claude skills directory", async () => {
      const scanner = new NewSkillScanner({
        aiworkflowSkillsDir: path.join(__dirname, "__fixtures__"),
        claudeSkillsDir: "/this/path/definitely/does/not/exist",
      });

      // Should not throw, just return skills from aiworkflow dir only
      const skills = await scanner.scanAll();
      expect(skills).toBeInstanceOf(Array);
    });

    it("should skip skills without name in frontmatter", async () => {
      // Create a skill with no name in frontmatter
      const noNameDir = path.join(__dirname, "__fixtures__", "no-name-skill");
      await realFs.mkdir(noNameDir, { recursive: true });
      await realFs.writeFile(
        path.join(noNameDir, "SKILL.md"),
        "---\ndescription: A skill without name\n---\n# No Name",
      );

      const scanner = new NewSkillScanner({
        aiworkflowSkillsDir: path.join(__dirname, "__fixtures__"),
        claudeSkillsDir: "/non-existent-path",
      });

      const skills = await scanner.scanAll();

      // Skill without name should be skipped
      expect(skills.some((s) => s.description === "A skill without name")).toBe(
        false,
      );

      // Cleanup
      await realFs.rm(noNameDir, { recursive: true });
    });

    it("should skip hidden directories", async () => {
      // Create a hidden directory with SKILL.md
      const hiddenDir = path.join(__dirname, "__fixtures__", ".hidden-skill");
      await realFs.mkdir(hiddenDir, { recursive: true });
      await realFs.writeFile(
        path.join(hiddenDir, "SKILL.md"),
        "---\nname: hidden-skill\ndescription: A hidden skill\n---\n# Hidden",
      );

      const scanner = new NewSkillScanner({
        aiworkflowSkillsDir: path.join(__dirname, "__fixtures__"),
        claudeSkillsDir: "/non-existent-path",
      });

      const skills = await scanner.scanAll();

      // Hidden skill should be skipped
      expect(skills.some((s) => s.name === "hidden-skill")).toBe(false);

      // Cleanup
      await realFs.rm(hiddenDir, { recursive: true });
    });
  });

  // Task 3: Boundary value tests
  describe("boundary cases", () => {
    it("should handle empty SKILL.md", async () => {
      const emptySkillDir = path.join(
        __dirname,
        "__fixtures__",
        "empty-skillmd",
      );
      await realFs.mkdir(emptySkillDir, { recursive: true });
      await realFs.writeFile(path.join(emptySkillDir, "SKILL.md"), "");

      const scanner = new NewSkillScanner({
        aiworkflowSkillsDir: path.join(__dirname, "__fixtures__"),
        claudeSkillsDir: "/non-existent-path",
      });

      const skills = await scanner.scanAll();

      // 空のSKILL.mdは name がないのでスキップされる
      expect(skills.some((s) => s.name === "empty-skillmd")).toBe(false);

      // クリーンアップ
      await realFs.rm(emptySkillDir, { recursive: true });
    });

    it("should handle SKILL.md without frontmatter", async () => {
      const noFrontmatterDir = path.join(
        __dirname,
        "__fixtures__",
        "no-frontmatter",
      );
      await realFs.mkdir(noFrontmatterDir, { recursive: true });
      await realFs.writeFile(
        path.join(noFrontmatterDir, "SKILL.md"),
        "# No Frontmatter Skill\n\nJust markdown content.",
      );

      const scanner = new NewSkillScanner({
        aiworkflowSkillsDir: path.join(__dirname, "__fixtures__"),
        claudeSkillsDir: "/non-existent-path",
      });

      const skills = await scanner.scanAll();

      // フロントマターがなく name もないのでスキップされる
      expect(skills.some((s) => s.name === "no-frontmatter")).toBe(false);

      await realFs.rm(noFrontmatterDir, { recursive: true });
    });

    it("should handle very long description", async () => {
      const longDescDir = path.join(__dirname, "__fixtures__", "long-desc");
      await realFs.mkdir(longDescDir, { recursive: true });
      const longDesc = "A".repeat(5000);
      await realFs.writeFile(
        path.join(longDescDir, "SKILL.md"),
        `---\nname: long-desc\ndescription: ${longDesc}\n---\n# Long Description Skill`,
      );

      const scanner = new NewSkillScanner({
        aiworkflowSkillsDir: path.join(__dirname, "__fixtures__"),
        claudeSkillsDir: "/non-existent-path",
      });

      const skills = await scanner.scanAll();
      const skill = skills.find((s) => s.name === "long-desc");

      expect(skill).toBeDefined();
      expect(skill?.description.length).toBe(5000);

      await realFs.rm(longDescDir, { recursive: true });
    });

    it("should handle skill with only name in frontmatter", async () => {
      const minimalDir = path.join(__dirname, "__fixtures__", "only-name");
      await realFs.mkdir(minimalDir, { recursive: true });
      await realFs.writeFile(
        path.join(minimalDir, "SKILL.md"),
        "---\nname: only-name\n---\n# Only Name",
      );

      const scanner = new NewSkillScanner({
        aiworkflowSkillsDir: path.join(__dirname, "__fixtures__"),
        claudeSkillsDir: "/non-existent-path",
      });

      const skills = await scanner.scanAll();
      const skill = skills.find((s) => s.name === "only-name");

      expect(skill).toBeDefined();
      expect(skill?.description).toBe("");
      expect(skill?.allowedTools).toBeUndefined();

      await realFs.rm(minimalDir, { recursive: true });
    });
  });

  // Task 4: All subdirectory types tests
  describe("all subdirectory types", () => {
    it("should scan scripts directory", async () => {
      const skillDir = path.join(__dirname, "__fixtures__", "scripts-skill");
      await realFs.mkdir(path.join(skillDir, "scripts"), { recursive: true });
      await realFs.writeFile(
        path.join(skillDir, "SKILL.md"),
        "---\nname: scripts-skill\ndescription: Scripts test\n---",
      );
      await realFs.writeFile(
        path.join(skillDir, "scripts", "helper.js"),
        'console.log("helper");',
      );

      const scanner = new NewSkillScanner({
        aiworkflowSkillsDir: path.join(__dirname, "__fixtures__"),
        claudeSkillsDir: "/non-existent-path",
      });

      const skills = await scanner.scanAll();
      const skill = skills.find((s) => s.name === "scripts-skill");

      expect(skill?.scripts).toHaveLength(1);
      expect(skill?.scripts[0].filename).toBe("helper.js");

      await realFs.rm(skillDir, { recursive: true });
    });

    it("should scan assets directory", async () => {
      const skillDir = path.join(__dirname, "__fixtures__", "assets-skill");
      await realFs.mkdir(path.join(skillDir, "assets"), { recursive: true });
      await realFs.writeFile(
        path.join(skillDir, "SKILL.md"),
        "---\nname: assets-skill\ndescription: Assets test\n---",
      );
      await realFs.writeFile(
        path.join(skillDir, "assets", "image.png"),
        "fake-png-data",
      );

      const scanner = new NewSkillScanner({
        aiworkflowSkillsDir: path.join(__dirname, "__fixtures__"),
        claudeSkillsDir: "/non-existent-path",
      });

      const skills = await scanner.scanAll();
      const skill = skills.find((s) => s.name === "assets-skill");

      expect(skill?.assets).toHaveLength(1);
      expect(skill?.assets[0].filename).toBe("image.png");

      await realFs.rm(skillDir, { recursive: true });
    });

    it("should scan schemas directory", async () => {
      const skillDir = path.join(__dirname, "__fixtures__", "schemas-skill");
      await realFs.mkdir(path.join(skillDir, "schemas"), { recursive: true });
      await realFs.writeFile(
        path.join(skillDir, "SKILL.md"),
        "---\nname: schemas-skill\ndescription: Schemas test\n---",
      );
      await realFs.writeFile(
        path.join(skillDir, "schemas", "config.json"),
        '{"type": "object"}',
      );

      const scanner = new NewSkillScanner({
        aiworkflowSkillsDir: path.join(__dirname, "__fixtures__"),
        claudeSkillsDir: "/non-existent-path",
      });

      const skills = await scanner.scanAll();
      const skill = skills.find((s) => s.name === "schemas-skill");

      expect(skill?.schemas).toHaveLength(1);
      expect(skill?.schemas[0].filename).toBe("config.json");

      await realFs.rm(skillDir, { recursive: true });
    });

    it("should scan indexes directory", async () => {
      const skillDir = path.join(__dirname, "__fixtures__", "indexes-skill");
      await realFs.mkdir(path.join(skillDir, "indexes"), { recursive: true });
      await realFs.writeFile(
        path.join(skillDir, "SKILL.md"),
        "---\nname: indexes-skill\ndescription: Indexes test\n---",
      );
      await realFs.writeFile(
        path.join(skillDir, "indexes", "index.json"),
        '{"entries": []}',
      );

      const scanner = new NewSkillScanner({
        aiworkflowSkillsDir: path.join(__dirname, "__fixtures__"),
        claudeSkillsDir: "/non-existent-path",
      });

      const skills = await scanner.scanAll();
      const skill = skills.find((s) => s.name === "indexes-skill");

      expect(skill?.indexes).toHaveLength(1);
      expect(skill?.indexes[0].filename).toBe("index.json");

      await realFs.rm(skillDir, { recursive: true });
    });

    it("should scan all 6 subdirectory types simultaneously", async () => {
      const skillDir = path.join(__dirname, "__fixtures__", "full-skill");
      await realFs.mkdir(path.join(skillDir, "agents"), { recursive: true });
      await realFs.mkdir(path.join(skillDir, "references"), {
        recursive: true,
      });
      await realFs.mkdir(path.join(skillDir, "scripts"), { recursive: true });
      await realFs.mkdir(path.join(skillDir, "assets"), { recursive: true });
      await realFs.mkdir(path.join(skillDir, "schemas"), { recursive: true });
      await realFs.mkdir(path.join(skillDir, "indexes"), { recursive: true });

      await realFs.writeFile(
        path.join(skillDir, "SKILL.md"),
        "---\nname: full-skill\ndescription: Full skill test\n---",
      );
      await realFs.writeFile(
        path.join(skillDir, "agents", "agent.md"),
        "# Agent",
      );
      await realFs.writeFile(
        path.join(skillDir, "references", "ref.md"),
        "# Ref",
      );
      await realFs.writeFile(
        path.join(skillDir, "scripts", "script.js"),
        "// script",
      );
      await realFs.writeFile(
        path.join(skillDir, "assets", "asset.png"),
        "data",
      );
      await realFs.writeFile(
        path.join(skillDir, "schemas", "schema.json"),
        "{}",
      );
      await realFs.writeFile(
        path.join(skillDir, "indexes", "index.json"),
        "[]",
      );

      const scanner = new NewSkillScanner({
        aiworkflowSkillsDir: path.join(__dirname, "__fixtures__"),
        claudeSkillsDir: "/non-existent-path",
      });

      const skills = await scanner.scanAll();
      const skill = skills.find((s) => s.name === "full-skill");

      expect(skill?.agents).toHaveLength(1);
      expect(skill?.references).toHaveLength(1);
      expect(skill?.scripts).toHaveLength(1);
      expect(skill?.assets).toHaveLength(1);
      expect(skill?.schemas).toHaveLength(1);
      expect(skill?.indexes).toHaveLength(1);

      await realFs.rm(skillDir, { recursive: true });
    });
  });

  // Task 5: Other files detection tests
  describe("other files detection", () => {
    it("should detect EVALS.json", async () => {
      const skillDir = path.join(__dirname, "__fixtures__", "with-evals");
      await realFs.mkdir(skillDir, { recursive: true });
      await realFs.writeFile(
        path.join(skillDir, "SKILL.md"),
        "---\nname: with-evals\ndescription: Skill with EVALS\n---",
      );
      await realFs.writeFile(
        path.join(skillDir, "EVALS.json"),
        '{"evaluations": []}',
      );

      const scanner = new NewSkillScanner({
        aiworkflowSkillsDir: path.join(__dirname, "__fixtures__"),
        claudeSkillsDir: "/non-existent-path",
      });

      const skills = await scanner.scanAll();
      const skill = skills.find((s) => s.name === "with-evals");

      expect(skill?.otherFiles).toContainEqual(
        expect.objectContaining({ filename: "EVALS.json", type: "evals" }),
      );

      await realFs.rm(skillDir, { recursive: true });
    });

    it("should detect LOGS.md", async () => {
      const skillDir = path.join(__dirname, "__fixtures__", "with-logs");
      await realFs.mkdir(skillDir, { recursive: true });
      await realFs.writeFile(
        path.join(skillDir, "SKILL.md"),
        "---\nname: with-logs\ndescription: Skill with LOGS\n---",
      );
      await realFs.writeFile(
        path.join(skillDir, "LOGS.md"),
        "# Execution Logs\n\n- Log entry 1",
      );

      const scanner = new NewSkillScanner({
        aiworkflowSkillsDir: path.join(__dirname, "__fixtures__"),
        claudeSkillsDir: "/non-existent-path",
      });

      const skills = await scanner.scanAll();
      const skill = skills.find((s) => s.name === "with-logs");

      expect(skill?.otherFiles).toContainEqual(
        expect.objectContaining({ filename: "LOGS.md", type: "logs" }),
      );

      await realFs.rm(skillDir, { recursive: true });
    });

    it("should detect package.json", async () => {
      const skillDir = path.join(__dirname, "__fixtures__", "with-package");
      await realFs.mkdir(skillDir, { recursive: true });
      await realFs.writeFile(
        path.join(skillDir, "SKILL.md"),
        "---\nname: with-package\ndescription: Skill with package.json\n---",
      );
      await realFs.writeFile(
        path.join(skillDir, "package.json"),
        '{"name": "skill-package", "version": "1.0.0"}',
      );

      const scanner = new NewSkillScanner({
        aiworkflowSkillsDir: path.join(__dirname, "__fixtures__"),
        claudeSkillsDir: "/non-existent-path",
      });

      const skills = await scanner.scanAll();
      const skill = skills.find((s) => s.name === "with-package");

      expect(skill?.otherFiles).toContainEqual(
        expect.objectContaining({ filename: "package.json", type: "package" }),
      );

      await realFs.rm(skillDir, { recursive: true });
    });

    it("should detect all other files types simultaneously", async () => {
      const skillDir = path.join(__dirname, "__fixtures__", "with-all-others");
      await realFs.mkdir(skillDir, { recursive: true });
      await realFs.writeFile(
        path.join(skillDir, "SKILL.md"),
        "---\nname: with-all-others\ndescription: Skill with all other files\n---",
      );
      await realFs.writeFile(path.join(skillDir, "EVALS.json"), "{}");
      await realFs.writeFile(path.join(skillDir, "LOGS.md"), "# Logs");
      await realFs.writeFile(path.join(skillDir, "package.json"), "{}");

      const scanner = new NewSkillScanner({
        aiworkflowSkillsDir: path.join(__dirname, "__fixtures__"),
        claudeSkillsDir: "/non-existent-path",
      });

      const skills = await scanner.scanAll();
      const skill = skills.find((s) => s.name === "with-all-others");

      expect(skill?.otherFiles).toHaveLength(3);
      expect(skill?.otherFiles).toContainEqual(
        expect.objectContaining({ filename: "EVALS.json", type: "evals" }),
      );
      expect(skill?.otherFiles).toContainEqual(
        expect.objectContaining({ filename: "LOGS.md", type: "logs" }),
      );
      expect(skill?.otherFiles).toContainEqual(
        expect.objectContaining({ filename: "package.json", type: "package" }),
      );

      await realFs.rm(skillDir, { recursive: true });
    });

    it("should include size for other files", async () => {
      const skillDir = path.join(__dirname, "__fixtures__", "with-sized-evals");
      await realFs.mkdir(skillDir, { recursive: true });
      await realFs.writeFile(
        path.join(skillDir, "SKILL.md"),
        "---\nname: with-sized-evals\ndescription: Skill with sized EVALS\n---",
      );
      const evalsContent = '{"evaluations": ["test1", "test2"]}';
      await realFs.writeFile(path.join(skillDir, "EVALS.json"), evalsContent);

      const scanner = new NewSkillScanner({
        aiworkflowSkillsDir: path.join(__dirname, "__fixtures__"),
        claudeSkillsDir: "/non-existent-path",
      });

      const skills = await scanner.scanAll();
      const skill = skills.find((s) => s.name === "with-sized-evals");
      const evalsFile = skill?.otherFiles.find(
        (f) => f.filename === "EVALS.json",
      );

      expect(evalsFile?.size).toBe(evalsContent.length);

      await realFs.rm(skillDir, { recursive: true });
    });
  });
});

// ===========================================================================
// Integration test with real file system
// ===========================================================================

describe("SkillScanner Integration", () => {
  let realTestDir: string;
  let realScanner: InstanceType<typeof SkillScanner>;
  let realFs: typeof import("fs/promises");

  beforeEach(async () => {
    // Get the real fs module (not mocked)
    realFs = await vi.importActual<typeof import("fs/promises")>("fs/promises");

    // Create real test directory using actual fs
    realTestDir = path.join(tmpdir(), `skill-scanner-test-${Date.now()}`);
    await realFs.mkdir(realTestDir, { recursive: true });

    try {
      // Reset module registry to get fresh SkillScanner with real fs
      vi.resetModules();
      vi.doUnmock("fs/promises");
      const module = await import("../SkillScanner");
      SkillScanner = module.SkillScanner;
      realScanner = new SkillScanner(realTestDir);
      // Restore mock for other tests
      vi.doMock("fs/promises");
    } catch {
      // Expected in Red phase
    }
  });

  afterEach(async () => {
    try {
      if (realFs && realTestDir) {
        await realFs.rm(realTestDir, { recursive: true, force: true });
      }
    } catch {
      // Ignore cleanup errors
    }
  });

  it("SS-INT-01: should scan real directory with SKILL.md files", async () => {
    // Given: 実際のディレクトリ構造を作成（実際のfsを使用）
    const skillDir = path.join(realTestDir, "test-skill");
    await realFs.mkdir(skillDir, { recursive: true });
    await realFs.writeFile(
      path.join(skillDir, "SKILL.md"),
      "---\nname: Test Skill\n---\n# Test",
    );

    if (!realScanner) {
      throw new Error("SkillScanner not initialized - Red phase");
    }

    // When: scanDirectoryを呼び出す
    const result = await realScanner.scanDirectory();

    // Then: SKILL.mdが見つかる
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(path.join(skillDir, "SKILL.md"));
  });
});

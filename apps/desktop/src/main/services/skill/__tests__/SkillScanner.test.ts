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

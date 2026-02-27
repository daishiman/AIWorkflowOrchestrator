/**
 * SkillShareManager Tests
 *
 * TDD Red Phase: These tests are designed to fail until implementation is complete.
 * SkillShareManager.ts does not yet exist — importing it will cause module resolution failure (Red state).
 *
 * Test count: 31 + 17 (Phase 6) + 3 (並行処理) = 51 tests
 *   - import (16)
 *   - export (6)
 *   - validateSource (4)
 *   - edge cases (5 + 17): ネットワークエラー、ファイルシステムエラー、データ不正
 *   - 並行処理 (3): Promise.all / Promise.allSettled
 *
 * @see docs/30-workflows/skill-share/outputs/phase-2/architecture-design.md
 * @see docs/30-workflows/skill-share/outputs/phase-2/api-specification.md
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock electron-log to prevent log pollution in tests (P20 対策)
vi.mock("electron-log", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

// Import after mocks — this will fail in Red phase because SkillShareManager.ts does not exist yet
let SkillShareManager: typeof import("../SkillShareManager").SkillShareManager;

// ============================================================================
// Mock Types (matching Phase 2 design: architecture-design.md + api-specification.md)
// ============================================================================

interface MockGitHubClient {
  getRepoContents: ReturnType<typeof vi.fn>;
  getGist: ReturnType<typeof vi.fn>;
  createGist: ReturnType<typeof vi.fn>;
}

interface MockFileSystemAdapter {
  readFile: ReturnType<typeof vi.fn>;
  writeFile: ReturnType<typeof vi.fn>;
  readdir: ReturnType<typeof vi.fn>;
  stat: ReturnType<typeof vi.fn>;
  mkdir: ReturnType<typeof vi.fn>;
  cp: ReturnType<typeof vi.fn>;
  exists: ReturnType<typeof vi.fn>;
  resolveRealPath: ReturnType<typeof vi.fn>;
}

interface MockSkillValidator {
  validateStructure: ReturnType<typeof vi.fn>;
  validateSkillMd: ReturnType<typeof vi.fn>;
}

interface MockSkillService {
  scanAvailableSkills: ReturnType<typeof vi.fn>;
  getSkillByName: ReturnType<typeof vi.fn>;
  importManager: {
    importSkills: ReturnType<typeof vi.fn>;
  };
}

// ============================================================================
// Tests
// ============================================================================

describe("SkillShareManager", () => {
  let manager: InstanceType<typeof SkillShareManager>;
  let mockGitHubClient: MockGitHubClient;
  let mockFileSystem: MockFileSystemAdapter;
  let mockSkillValidator: MockSkillValidator;
  let mockSkillService: MockSkillService;

  beforeEach(async () => {
    // P9 対策: テスト間状態リーク防止
    vi.resetAllMocks();

    // Create mock dependencies (DI: Constructor Injection)
    mockGitHubClient = {
      getRepoContents: vi.fn(),
      getGist: vi.fn(),
      createGist: vi.fn(),
    };

    mockFileSystem = {
      readFile: vi.fn(),
      writeFile: vi.fn(),
      readdir: vi.fn(),
      stat: vi.fn(),
      mkdir: vi.fn(),
      cp: vi.fn(),
      exists: vi.fn(),
      resolveRealPath: vi.fn(),
    };

    mockSkillValidator = {
      validateStructure: vi.fn(),
      validateSkillMd: vi.fn(),
    };

    mockSkillService = {
      scanAvailableSkills: vi.fn(),
      getSkillByName: vi.fn(),
      importManager: {
        importSkills: vi.fn(),
      },
    };

    // Try to import SkillShareManager (will fail in Red phase — module doesn't exist yet)
    try {
      const module = await import("../SkillShareManager");
      SkillShareManager = module.SkillShareManager;
      manager = new SkillShareManager(
        mockGitHubClient as never,
        mockFileSystem as never,
        mockSkillValidator as never,
        mockSkillService as never,
      );
    } catch {
      // Expected in Red phase — SkillShareManager.ts does not exist yet
    }
  });

  afterEach(() => {
    vi.resetModules();
  });

  // ==========================================================================
  // importFromSource — GitHub リポジトリからのインポート (5 tests)
  // ==========================================================================

  describe("importFromSource", () => {
    describe("GitHub リポジトリからのインポート", () => {
      it("SSM-IG-01: 有効なリポジトリ・パスからスキルをインポートし ImportResult を返す", async () => {
        // Given: 有効な GitHub ソース
        const source = {
          type: "github" as const,
          repo: "owner/my-skill",
          branch: "main",
          path: "/",
        };

        if (!manager) {
          throw new Error("SkillShareManager not initialized — Red phase");
        }

        // Mock: GitHub API がリポジトリ内容を返す
        mockGitHubClient.getRepoContents.mockResolvedValue({
          success: true,
          data: [
            { name: "SKILL.md", content: "# My Skill\nDescription" },
            { name: "config.json", content: '{"version": "1.0"}' },
          ],
        });

        mockFileSystem.mkdir.mockResolvedValue(undefined);
        mockFileSystem.writeFile.mockResolvedValue(undefined);
        mockSkillValidator.validateStructure.mockResolvedValue({
          isValid: true,
          errors: [],
        });

        // When: importFromSource を呼び出す
        const result = await manager.importFromSource(source);

        // Then: ImportResult が成功で返される
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data!.success).toBe(true);
        expect(result.data!.skillName).toBe("my-skill");
        expect(result.data!.source).toEqual(source);
        expect(result.data!.importedAt).toMatch(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
        );
      });

      it("SSM-IG-02: リポジトリが存在しない場合 External Service Error（ERR_3001）を返す", async () => {
        // Given: 存在しないリポジトリ
        const source = {
          type: "github" as const,
          repo: "nonexistent/repo",
        };

        if (!manager) {
          throw new Error("SkillShareManager not initialized — Red phase");
        }

        // Mock: GitHub API が 404 を返す
        mockGitHubClient.getRepoContents.mockResolvedValue({
          success: false,
          error: {
            code: 3001,
            message: "Repository not found",
            category: "external",
            isRetryable: false,
          },
        });

        // When: importFromSource を呼び出す
        const result = await manager.importFromSource(source);

        // Then: External Service Error が返される
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error!.code).toBe(3001);
        expect(result.error!.category).toBe("external");
      });

      it("SSM-IG-03: リポジトリに SKILL.md が存在しない場合 Business Error（ERR_2003）を返す", async () => {
        // Given: SKILL.md を含まないリポジトリ
        const source = {
          type: "github" as const,
          repo: "owner/no-skill-md",
        };

        if (!manager) {
          throw new Error("SkillShareManager not initialized — Red phase");
        }

        // Mock: GitHub API がファイル一覧を返すが SKILL.md がない
        mockGitHubClient.getRepoContents.mockResolvedValue({
          success: true,
          data: [
            { name: "README.md", content: "# Readme" },
            { name: "index.ts", content: "export {}" },
          ],
        });

        // When: importFromSource を呼び出す
        const result = await manager.importFromSource(source);

        // Then: Business Error が返される
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error!.code).toBe(2003);
        expect(result.error!.category).toBe("business");
      });

      it("SSM-IG-04: ブランチ指定がある場合そのブランチからファイルを取得する", async () => {
        // Given: develop ブランチ指定のソース
        const source = {
          type: "github" as const,
          repo: "owner/my-skill",
          branch: "develop",
        };

        if (!manager) {
          throw new Error("SkillShareManager not initialized — Red phase");
        }

        // Mock: GitHub API が develop ブランチの内容を返す
        mockGitHubClient.getRepoContents.mockResolvedValue({
          success: true,
          data: [{ name: "SKILL.md", content: "# My Skill" }],
        });
        mockFileSystem.mkdir.mockResolvedValue(undefined);
        mockFileSystem.writeFile.mockResolvedValue(undefined);
        mockSkillValidator.validateStructure.mockResolvedValue({
          isValid: true,
          errors: [],
        });

        // When: importFromSource を呼び出す
        await manager.importFromSource(source);

        // Then: develop ブランチを指定して API を呼び出している
        expect(mockGitHubClient.getRepoContents).toHaveBeenCalledWith(
          "owner/my-skill",
          expect.any(String),
          "develop",
        );
      });

      it("SSM-IG-05: path 指定がある場合そのディレクトリ配下を取得する", async () => {
        // Given: サブディレクトリ指定のソース
        const source = {
          type: "github" as const,
          repo: "owner/monorepo",
          path: "skills/my-skill",
        };

        if (!manager) {
          throw new Error("SkillShareManager not initialized — Red phase");
        }

        // Mock: GitHub API がサブディレクトリの内容を返す
        mockGitHubClient.getRepoContents.mockResolvedValue({
          success: true,
          data: [{ name: "SKILL.md", content: "# My Skill" }],
        });
        mockFileSystem.mkdir.mockResolvedValue(undefined);
        mockFileSystem.writeFile.mockResolvedValue(undefined);
        mockSkillValidator.validateStructure.mockResolvedValue({
          isValid: true,
          errors: [],
        });

        // When: importFromSource を呼び出す
        await manager.importFromSource(source);

        // Then: サブディレクトリのパスを指定して API を呼び出している
        expect(mockGitHubClient.getRepoContents).toHaveBeenCalledWith(
          "owner/monorepo",
          "skills/my-skill",
          expect.any(String),
        );
      });
    });

    // ========================================================================
    // importFromSource — Gist からのインポート (3 tests)
    // ========================================================================

    describe("Gist からのインポート", () => {
      it("SSM-IG-06: 有効な gistId からスキルをインポートし ImportResult を返す", async () => {
        // Given: 有効な Gist ソース
        const source = {
          type: "gist" as const,
          gistId: "abc123def456",
        };

        if (!manager) {
          throw new Error("SkillShareManager not initialized — Red phase");
        }

        // Mock: Gist API がファイル内容を返す
        mockGitHubClient.getGist.mockResolvedValue({
          success: true,
          data: {
            files: {
              "SKILL.md": { content: "# Gist Skill\nA shared skill" },
            },
          },
        });
        mockFileSystem.mkdir.mockResolvedValue(undefined);
        mockFileSystem.writeFile.mockResolvedValue(undefined);
        mockSkillValidator.validateStructure.mockResolvedValue({
          isValid: true,
          errors: [],
        });

        // When: importFromSource を呼び出す
        const result = await manager.importFromSource(source);

        // Then: ImportResult が成功で返される
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data!.success).toBe(true);
        expect(result.data!.source).toEqual(source);
        expect(mockGitHubClient.getGist).toHaveBeenCalledWith("abc123def456");
      });

      it("SSM-IG-07: Gist が存在しない場合 External Service Error（ERR_3001）を返す", async () => {
        // Given: 存在しない Gist ID
        const source = {
          type: "gist" as const,
          gistId: "nonexistent-gist-id",
        };

        if (!manager) {
          throw new Error("SkillShareManager not initialized — Red phase");
        }

        // Mock: Gist API が 404 を返す
        mockGitHubClient.getGist.mockResolvedValue({
          success: false,
          error: {
            code: 3001,
            message: "Gist not found",
            category: "external",
            isRetryable: false,
          },
        });

        // When: importFromSource を呼び出す
        const result = await manager.importFromSource(source);

        // Then: External Service Error が返される
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error!.code).toBe(3001);
        expect(result.error!.category).toBe("external");
      });

      it("SSM-IG-08: Gist に SKILL.md が含まれない場合 Business Error（ERR_2003）を返す", async () => {
        // Given: SKILL.md のない Gist
        const source = {
          type: "gist" as const,
          gistId: "gist-without-skill-md",
        };

        if (!manager) {
          throw new Error("SkillShareManager not initialized — Red phase");
        }

        // Mock: Gist API がファイルを返すが SKILL.md がない
        mockGitHubClient.getGist.mockResolvedValue({
          success: true,
          data: {
            files: {
              "README.md": { content: "# Just a readme" },
            },
          },
        });

        // When: importFromSource を呼び出す
        const result = await manager.importFromSource(source);

        // Then: Business Error が返される
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error!.code).toBe(2003);
        expect(result.error!.category).toBe("business");
      });
    });

    // ========================================================================
    // importFromSource — ローカルディレクトリからのインポート (4 tests)
    // ========================================================================

    describe("ローカルディレクトリからのインポート", () => {
      it("SSM-IL-01: 有効なローカルパスからスキルをインポートし ImportResult を返す", async () => {
        // Given: 有効なローカルパス
        const source = {
          type: "local" as const,
          localPath: "/home/user/skills/my-skill",
        };

        if (!manager) {
          throw new Error("SkillShareManager not initialized — Red phase");
        }

        // Mock: ローカルディレクトリにファイルが存在
        mockFileSystem.stat.mockResolvedValue({ isDirectory: () => true });
        mockFileSystem.readdir.mockResolvedValue(["SKILL.md", "config.json"]);
        mockFileSystem.readFile.mockResolvedValue("# My Local Skill");
        mockFileSystem.cp.mockResolvedValue(undefined);
        mockFileSystem.resolveRealPath.mockResolvedValue(
          "/home/user/skills/my-skill",
        );
        mockSkillValidator.validateStructure.mockResolvedValue({
          isValid: true,
          errors: [],
        });

        // When: importFromSource を呼び出す
        const result = await manager.importFromSource(source);

        // Then: ImportResult が成功で返される
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data!.success).toBe(true);
        expect(result.data!.source).toEqual(source);
      });

      it("SSM-IL-02: ディレクトリが存在しない場合 Infrastructure Error（ERR_4002）を返す", async () => {
        // Given: 存在しないローカルパス
        const source = {
          type: "local" as const,
          localPath: "/nonexistent/path/skill",
        };

        if (!manager) {
          throw new Error("SkillShareManager not initialized — Red phase");
        }

        // Mock: stat が ENOENT エラーを返す
        mockFileSystem.stat.mockRejectedValue(
          Object.assign(new Error("ENOENT: no such file or directory"), {
            code: "ENOENT",
          }),
        );

        // When: importFromSource を呼び出す
        const result = await manager.importFromSource(source);

        // Then: Infrastructure Error が返される
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error!.code).toBe(4002);
        expect(result.error!.category).toBe("infrastructure");
      });

      it("SSM-IL-03: パストラバーサルを含むパスを拒否し Validation Error（ERR_1003）を返す", async () => {
        // Given: パストラバーサルを含むパス
        const source = {
          type: "local" as const,
          localPath: "/home/user/skills/../../etc/passwd",
        };

        if (!manager) {
          throw new Error("SkillShareManager not initialized — Red phase");
        }

        // When: importFromSource を呼び出す
        const result = await manager.importFromSource(source);

        // Then: Validation Error が返される
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error!.code).toBe(1003);
        expect(result.error!.category).toBe("validation");
      });

      it("SSM-IL-04: SKILL.md が存在しないディレクトリを拒否し Business Error（ERR_2003）を返す", async () => {
        // Given: SKILL.md のないローカルディレクトリ
        const source = {
          type: "local" as const,
          localPath: "/home/user/skills/no-skill-md",
        };

        if (!manager) {
          throw new Error("SkillShareManager not initialized — Red phase");
        }

        // Mock: ディレクトリは存在するが SKILL.md がない
        mockFileSystem.stat.mockResolvedValue({ isDirectory: () => true });
        mockFileSystem.readdir.mockResolvedValue(["README.md", "index.ts"]);
        mockFileSystem.resolveRealPath.mockResolvedValue(
          "/home/user/skills/no-skill-md",
        );

        // When: importFromSource を呼び出す
        const result = await manager.importFromSource(source);

        // Then: Business Error が返される
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error!.code).toBe(2003);
        expect(result.error!.category).toBe("business");
      });
    });

    // ========================================================================
    // importFromSource — URL からのインポート (4 tests)
    // ========================================================================

    describe("URL からのインポート", () => {
      it("SSM-IU-01: 有効な URL から SKILL.md を取得しインポートする", async () => {
        // Given: 有効な HTTPS URL
        const source = {
          type: "url" as const,
          url: "https://example.com/skills/my-skill/SKILL.md",
        };

        if (!manager) {
          throw new Error("SkillShareManager not initialized — Red phase");
        }

        // Mock: fetch が SKILL.md の内容を返す
        const mockResponse = {
          ok: true,
          status: 200,
          text: vi.fn().mockResolvedValue("# URL Skill\nA skill from URL"),
        };
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse));

        mockFileSystem.mkdir.mockResolvedValue(undefined);
        mockFileSystem.writeFile.mockResolvedValue(undefined);
        mockSkillValidator.validateSkillMd.mockReturnValue({
          isValid: true,
          errors: [],
        });

        // When: importFromSource を呼び出す
        const result = await manager.importFromSource(source);

        // Then: ImportResult が成功で返される
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data!.success).toBe(true);
        expect(result.data!.source).toEqual(source);

        // Cleanup
        vi.unstubAllGlobals();
      });

      it("SSM-IU-02: URL が 404 を返す場合 External Service Error（ERR_3001）を返す", async () => {
        // Given: 404 を返す URL
        const source = {
          type: "url" as const,
          url: "https://example.com/skills/nonexistent/SKILL.md",
        };

        if (!manager) {
          throw new Error("SkillShareManager not initialized — Red phase");
        }

        // Mock: fetch が 404 を返す
        const mockResponse = {
          ok: false,
          status: 404,
          statusText: "Not Found",
        };
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse));

        // When: importFromSource を呼び出す
        const result = await manager.importFromSource(source);

        // Then: External Service Error が返される
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error!.code).toBe(3001);
        expect(result.error!.category).toBe("external");

        // Cleanup
        vi.unstubAllGlobals();
      });

      it("SSM-IU-03: レスポンスが SKILL.md 形式でない場合 Validation Error（ERR_1002）を返す", async () => {
        // Given: SKILL.md 形式ではないレスポンスを返す URL
        const source = {
          type: "url" as const,
          url: "https://example.com/random-file.txt",
        };

        if (!manager) {
          throw new Error("SkillShareManager not initialized — Red phase");
        }

        // Mock: fetch がプレーンテキスト（非 SKILL.md 形式）を返す
        const mockResponse = {
          ok: true,
          status: 200,
          text: vi
            .fn()
            .mockResolvedValue("This is not a valid SKILL.md format"),
        };
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse));

        mockSkillValidator.validateSkillMd.mockReturnValue({
          isValid: false,
          errors: ["Missing required title (# heading)"],
        });

        // When: importFromSource を呼び出す
        const result = await manager.importFromSource(source);

        // Then: Validation Error が返される
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error!.code).toBe(1002);
        expect(result.error!.category).toBe("validation");

        // Cleanup
        vi.unstubAllGlobals();
      });

      it("SSM-IU-04: ネットワークタイムアウト時 External Service Error（ERR_3002）を返す", async () => {
        // Given: タイムアウトする URL
        const source = {
          type: "url" as const,
          url: "https://slow-server.example.com/SKILL.md",
        };

        if (!manager) {
          throw new Error("SkillShareManager not initialized — Red phase");
        }

        // Mock: fetch がタイムアウトエラーを投げる
        vi.stubGlobal(
          "fetch",
          vi
            .fn()
            .mockRejectedValue(
              new Error("AbortError: The operation was aborted"),
            ),
        );

        // When: importFromSource を呼び出す
        const result = await manager.importFromSource(source);

        // Then: External Service Error（タイムアウト）が返される
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error!.code).toBe(3002);
        expect(result.error!.category).toBe("external");

        // Cleanup
        vi.unstubAllGlobals();
      });
    });
  });

  // ==========================================================================
  // exportSkill — Gist へのエクスポート (3 tests)
  // ==========================================================================

  describe("exportSkill", () => {
    describe("Gist へのエクスポート", () => {
      it("SSM-EG-01: スキルを Gist にエクスポートし shareUrl を含む ExportResult を返す", async () => {
        // Given: エクスポート対象のスキル名と Gist 宛先
        const skillName = "my-skill";
        const destination = { type: "gist" as const, gistId: "" };

        if (!manager) {
          throw new Error("SkillShareManager not initialized — Red phase");
        }

        // Mock: スキルファイルの読み取り
        mockSkillService.getSkillByName.mockResolvedValue({
          success: true,
          data: {
            name: "my-skill",
            path: "/home/user/.aiworkflow/skills/my-skill",
          },
        });
        mockFileSystem.readdir.mockResolvedValue(["SKILL.md", "config.json"]);
        mockFileSystem.readFile
          .mockResolvedValueOnce("# My Skill\nDescription")
          .mockResolvedValueOnce('{"version": "1.0"}');

        // Mock: Gist 作成が成功
        mockGitHubClient.createGist.mockResolvedValue({
          success: true,
          data: { url: "https://gist.github.com/abc123" },
        });

        // When: exportSkill を呼び出す
        const result = await manager.exportSkill(skillName, destination);

        // Then: ExportResult に shareUrl が含まれる
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data!.success).toBe(true);
        expect(result.data!.shareUrl).toBe("https://gist.github.com/abc123");
        expect(result.data!.destination).toEqual(destination);
        expect(result.data!.exportedFiles).toContain("SKILL.md");
      });

      it("SSM-EG-02: GitHub トークンが未設定の場合 Business Error（ERR_2005）を返す", async () => {
        // Given: GitHub トークンが未設定の状態
        const skillName = "my-skill";
        const destination = { type: "gist" as const, gistId: "" };

        if (!manager) {
          throw new Error("SkillShareManager not initialized — Red phase");
        }

        // Mock: スキルは存在する
        mockSkillService.getSkillByName.mockResolvedValue({
          success: true,
          data: {
            name: "my-skill",
            path: "/home/user/.aiworkflow/skills/my-skill",
          },
        });
        mockFileSystem.readdir.mockResolvedValue(["SKILL.md"]);
        mockFileSystem.readFile.mockResolvedValue("# My Skill");

        // Mock: Gist 作成がトークン未設定エラーを返す
        mockGitHubClient.createGist.mockResolvedValue({
          success: false,
          error: {
            code: 2005,
            message: "GitHub personal access token is not configured",
            category: "business",
            isRetryable: false,
          },
        });

        // When: exportSkill を呼び出す
        const result = await manager.exportSkill(skillName, destination);

        // Then: Business Error が返される
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error!.code).toBe(2005);
        expect(result.error!.category).toBe("business");
      });

      it("SSM-EG-03: Gist API がエラーを返す場合 External Service Error（ERR_3001）を返す", async () => {
        // Given: Gist API がサーバーエラーを返す状態
        const skillName = "my-skill";
        const destination = { type: "gist" as const, gistId: "" };

        if (!manager) {
          throw new Error("SkillShareManager not initialized — Red phase");
        }

        // Mock: スキルファイルの読み取りは成功
        mockSkillService.getSkillByName.mockResolvedValue({
          success: true,
          data: {
            name: "my-skill",
            path: "/home/user/.aiworkflow/skills/my-skill",
          },
        });
        mockFileSystem.readdir.mockResolvedValue(["SKILL.md"]);
        mockFileSystem.readFile.mockResolvedValue("# My Skill");

        // Mock: Gist API が 500 エラーを返す
        mockGitHubClient.createGist.mockResolvedValue({
          success: false,
          error: {
            code: 3001,
            message: "GitHub API returned 500 Internal Server Error",
            category: "external",
            isRetryable: true,
          },
        });

        // When: exportSkill を呼び出す
        const result = await manager.exportSkill(skillName, destination);

        // Then: External Service Error が返される
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error!.code).toBe(3001);
        expect(result.error!.category).toBe("external");
      });
    });

    // ========================================================================
    // exportSkill — ローカルへのエクスポート (3 tests)
    // ========================================================================

    describe("ローカルへのエクスポート", () => {
      it("SSM-EL-01: スキルをローカルディレクトリにエクスポートし ExportResult を返す", async () => {
        // Given: エクスポート対象のスキル名とローカル宛先
        const skillName = "my-skill";
        const destination = {
          type: "local" as const,
          localPath: "/home/user/exports/my-skill",
        };

        if (!manager) {
          throw new Error("SkillShareManager not initialized — Red phase");
        }

        // Mock: スキルファイルの読み取り
        mockSkillService.getSkillByName.mockResolvedValue({
          success: true,
          data: {
            name: "my-skill",
            path: "/home/user/.aiworkflow/skills/my-skill",
          },
        });
        mockFileSystem.readdir.mockResolvedValue(["SKILL.md", "config.json"]);
        mockFileSystem.cp.mockResolvedValue(undefined);
        mockFileSystem.mkdir.mockResolvedValue(undefined);
        mockFileSystem.resolveRealPath.mockResolvedValue(
          "/home/user/exports/my-skill",
        );

        // When: exportSkill を呼び出す
        const result = await manager.exportSkill(skillName, destination);

        // Then: ExportResult が成功で返される
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data!.success).toBe(true);
        expect(result.data!.destination).toEqual(destination);
        expect(result.data!.exportedFiles).toEqual(
          expect.arrayContaining(["SKILL.md", "config.json"]),
        );
        // ローカルエクスポートでは shareUrl は undefined
        expect(result.data!.shareUrl).toBeUndefined();
      });

      it("SSM-EL-02: 宛先ディレクトリが書き込み不可の場合 Infrastructure Error（ERR_4003）を返す", async () => {
        // Given: 書き込み権限のない宛先ディレクトリ
        const skillName = "my-skill";
        const destination = {
          type: "local" as const,
          localPath: "/readonly-dir/export",
        };

        if (!manager) {
          throw new Error("SkillShareManager not initialized — Red phase");
        }

        // Mock: スキルは存在する
        mockSkillService.getSkillByName.mockResolvedValue({
          success: true,
          data: {
            name: "my-skill",
            path: "/home/user/.aiworkflow/skills/my-skill",
          },
        });
        mockFileSystem.readdir.mockResolvedValue(["SKILL.md"]);

        // Mock: mkdir が EACCES エラーを返す
        mockFileSystem.mkdir.mockRejectedValue(
          Object.assign(new Error("EACCES: permission denied"), {
            code: "EACCES",
          }),
        );

        // When: exportSkill を呼び出す
        const result = await manager.exportSkill(skillName, destination);

        // Then: Infrastructure Error が返される
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error!.code).toBe(4003);
        expect(result.error!.category).toBe("infrastructure");
      });

      it("SSM-EL-03: 存在しないスキル名を指定した場合 Business Error（ERR_2003）を返す", async () => {
        // Given: 存在しないスキル名
        const skillName = "nonexistent-skill";
        const destination = {
          type: "local" as const,
          localPath: "/home/user/exports/output",
        };

        if (!manager) {
          throw new Error("SkillShareManager not initialized — Red phase");
        }

        // Mock: スキルが見つからない
        mockSkillService.getSkillByName.mockResolvedValue({
          success: false,
          error: {
            code: 2003,
            message: "Skill not found: nonexistent-skill",
            category: "business",
            isRetryable: false,
          },
        });

        // When: exportSkill を呼び出す
        const result = await manager.exportSkill(skillName, destination);

        // Then: Business Error が返される
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error!.code).toBe(2003);
        expect(result.error!.category).toBe("business");
      });
    });
  });

  // ==========================================================================
  // validateSource (4 tests)
  // ==========================================================================

  describe("validateSource", () => {
    it("SSM-VS-01: SKILL.md を含む有効なディレクトリ構造を承認する", async () => {
      // Given: SKILL.md を含む有効なローカルソース
      const source = {
        type: "local" as const,
        localPath: "/home/user/skills/valid-skill",
      };

      if (!manager) {
        throw new Error("SkillShareManager not initialized — Red phase");
      }

      // Mock: ディレクトリが存在し SKILL.md を含む
      mockFileSystem.stat.mockResolvedValue({ isDirectory: () => true });
      mockFileSystem.readdir.mockResolvedValue(["SKILL.md", "config.json"]);
      mockFileSystem.exists.mockResolvedValue(true);
      mockFileSystem.resolveRealPath.mockResolvedValue(
        "/home/user/skills/valid-skill",
      );

      // When: validateSource を呼び出す
      const result = await manager.validateSource(source);

      // Then: 有効なソースとして承認される
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.isReachable).toBe(true);
      expect(result.data!.hasSkillMd).toBe(true);
      expect(result.data!.errors).toHaveLength(0);
    });

    it("SSM-VS-02: SKILL.md が存在しないディレクトリを拒否する", async () => {
      // Given: SKILL.md がないローカルソース
      const source = {
        type: "local" as const,
        localPath: "/home/user/skills/no-skill",
      };

      if (!manager) {
        throw new Error("SkillShareManager not initialized — Red phase");
      }

      // Mock: ディレクトリは存在するが SKILL.md がない
      mockFileSystem.stat.mockResolvedValue({ isDirectory: () => true });
      mockFileSystem.readdir.mockResolvedValue(["README.md"]);
      mockFileSystem.exists.mockResolvedValue(true);
      mockFileSystem.resolveRealPath.mockResolvedValue(
        "/home/user/skills/no-skill",
      );

      // When: validateSource を呼び出す
      const result = await manager.validateSource(source);

      // Then: hasSkillMd が false で返される
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.isReachable).toBe(true);
      expect(result.data!.hasSkillMd).toBe(false);
      expect(result.data!.errors.length).toBeGreaterThan(0);
    });

    it("SSM-VS-03: SKILL.md の必須セクション（# で始まるタイトル）がない場合拒否する", async () => {
      // Given: タイトルのない SKILL.md を含むソース
      const source = {
        type: "local" as const,
        localPath: "/home/user/skills/bad-skill",
      };

      if (!manager) {
        throw new Error("SkillShareManager not initialized — Red phase");
      }

      // Mock: SKILL.md は存在するがタイトルがない
      mockFileSystem.stat.mockResolvedValue({ isDirectory: () => true });
      mockFileSystem.readdir.mockResolvedValue(["SKILL.md"]);
      mockFileSystem.exists.mockResolvedValue(true);
      mockFileSystem.readFile.mockResolvedValue(
        "No title here\nJust plain text without heading",
      );
      mockFileSystem.resolveRealPath.mockResolvedValue(
        "/home/user/skills/bad-skill",
      );
      mockSkillValidator.validateSkillMd.mockReturnValue({
        isValid: false,
        errors: ["Missing required title (# heading)"],
      });

      // When: validateSource を呼び出す
      const result = await manager.validateSource(source);

      // Then: バリデーションエラーが返される
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.hasSkillMd).toBe(true);
      expect(result.data!.errors.length).toBeGreaterThan(0);
      expect(result.data!.errors).toEqual(
        expect.arrayContaining([expect.stringContaining("title")]),
      );
    });

    it("SSM-VS-04: 空の SKILL.md を拒否する", async () => {
      // Given: 空の SKILL.md を含むソース
      const source = {
        type: "local" as const,
        localPath: "/home/user/skills/empty-skill",
      };

      if (!manager) {
        throw new Error("SkillShareManager not initialized — Red phase");
      }

      // Mock: SKILL.md は存在するが中身が空
      mockFileSystem.stat.mockResolvedValue({ isDirectory: () => true });
      mockFileSystem.readdir.mockResolvedValue(["SKILL.md"]);
      mockFileSystem.exists.mockResolvedValue(true);
      mockFileSystem.readFile.mockResolvedValue("");
      mockFileSystem.resolveRealPath.mockResolvedValue(
        "/home/user/skills/empty-skill",
      );
      mockSkillValidator.validateSkillMd.mockReturnValue({
        isValid: false,
        errors: ["SKILL.md is empty"],
      });

      // When: validateSource を呼び出す
      const result = await manager.validateSource(source);

      // Then: バリデーションエラーが返される
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.errors.length).toBeGreaterThan(0);
      expect(result.data!.errors).toEqual(
        expect.arrayContaining([expect.stringContaining("empty")]),
      );
    });
  });

  // ==========================================================================
  // Phase 6: エッジケーステスト (5 tests)
  // ==========================================================================

  describe("エッジケース", () => {
    // ネットワークエラー系
    describe("ネットワークエラー系", () => {
      it("SSM-EDGE-01: GitHub API が 403 (rate limit) を返す場合 External Service Error を返す", async () => {
        const source = {
          type: "github" as const,
          repo: "owner/popular-repo",
        };

        if (!manager) {
          throw new Error("SkillShareManager not initialized — Red phase");
        }

        // Mock: GitHub API が 403 rate limit を返す
        mockGitHubClient.getRepoContents.mockResolvedValue({
          success: false,
          error: {
            code: 3001,
            message: "API rate limit exceeded",
            category: "external",
            isRetryable: true,
          },
        });

        const result = await manager.importFromSource(source);

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error!.code).toBe(3001);
        expect(result.error!.category).toBe("external");
        expect(result.error!.isRetryable).toBe(true);
      });

      it("SSM-EDGE-02: fetch が TypeError をスローする場合（ネットワークエラー）Network Timeout Error を返す", async () => {
        const source = {
          type: "url" as const,
          url: "https://unreachable.example.com/SKILL.md",
        };

        if (!manager) {
          throw new Error("SkillShareManager not initialized — Red phase");
        }

        // Mock: fetch がネットワークエラーで TypeError をスローする
        vi.stubGlobal(
          "fetch",
          vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
        );

        const result = await manager.importFromSource(source);

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error!.code).toBe(3002);
        expect(result.error!.category).toBe("external");
        expect(result.error!.isRetryable).toBe(true);
        expect(result.error!.message).toBe("Failed to fetch");

        vi.unstubAllGlobals();
      });
    });

    // ファイルシステムエラー系
    describe("ファイルシステムエラー系", () => {
      it("SSM-EDGE-03: ローカルインポート元が読み取り不可（EACCES）の場合エラーを返す", async () => {
        const source = {
          type: "local" as const,
          localPath: "/protected/skill-dir",
        };

        if (!manager) {
          throw new Error("SkillShareManager not initialized — Red phase");
        }

        // Mock: resolveRealPath が EACCES エラーをスロー
        mockFileSystem.resolveRealPath.mockRejectedValue(
          Object.assign(new Error("EACCES: permission denied"), {
            code: "EACCES",
          }),
        );

        const result = await manager.importFromSource(source);

        // 非 ENOENT エラーなので FILE_NOT_FOUND (4002) のフォールバックブランチに入る
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error!.code).toBe(4002);
        expect(result.error!.category).toBe("infrastructure");
      });

      it("SSM-EDGE-04: ローカルエクスポート時ディスク容量不足（ENOSPC）の場合エラーを返す", async () => {
        const skillName = "my-skill";
        const destination = {
          type: "local" as const,
          localPath: "/full-disk/export",
        };

        if (!manager) {
          throw new Error("SkillShareManager not initialized — Red phase");
        }

        // Mock: スキルは存在する
        mockSkillService.getSkillByName.mockResolvedValue({
          success: true,
          data: {
            name: "my-skill",
            path: "/home/user/.aiworkflow/skills/my-skill",
          },
        });
        mockFileSystem.readdir.mockResolvedValue(["SKILL.md"]);
        mockFileSystem.mkdir.mockResolvedValue(undefined);

        // Mock: cp がディスク容量不足エラーをスロー
        mockFileSystem.cp.mockRejectedValue(
          Object.assign(new Error("ENOSPC: no space left on device"), {
            code: "ENOSPC",
          }),
        );

        const result = await manager.exportSkill(skillName, destination);

        // 非 EACCES エラーなので FILE_NOT_FOUND (4002) のフォールバックブランチに入る
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error!.code).toBe(4002);
        expect(result.error!.category).toBe("infrastructure");
        expect(result.error!.message).toBe("ENOSPC: no space left on device");
      });
    });

    // データ不正系
    describe("データ不正系", () => {
      it("SSM-EDGE-05: サポートされていないソースタイプの場合 Validation Error を返す", async () => {
        // unknown タイプとして動的にキャスト
        const source = {
          type: "unknown-type" as "github",
        };

        if (!manager) {
          throw new Error("SkillShareManager not initialized — Red phase");
        }

        const result = await manager.importFromSource(source);

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error!.code).toBe(1002);
        expect(result.error!.category).toBe("validation");
        expect(result.error!.message).toContain("Unsupported source type");
      });
    });
  });

  // ==========================================================================
  // Phase 6: 追加エッジケーステスト (17 tests)
  // ==========================================================================

  describe("Phase 6 エッジケース拡充", () => {
    // ========================================================================
    // ネットワークエラー系 (6 tests)
    // ========================================================================
    describe("ネットワークエラー系（拡充）", () => {
      it("SSM-P6-NET-01: GitHub API が 500 を返す場合 External Service Error を返す", async () => {
        const source = {
          type: "github" as const,
          repo: "owner/broken-repo",
        };

        if (!manager) {
          throw new Error("SkillShareManager not initialized — Red phase");
        }

        mockGitHubClient.getRepoContents.mockResolvedValue({
          success: false,
          error: {
            code: 3001,
            message: "GitHub API returned 500 Internal Server Error",
            category: "external",
            isRetryable: true,
          },
        });

        const result = await manager.importFromSource(source);

        expect(result.success).toBe(false);
        expect(result.error!.code).toBe(3001);
        expect(result.error!.message).toContain("500");
      });

      it("SSM-P6-NET-02: fetch が非 Error オブジェクトをスローする場合 Network error メッセージを返す", async () => {
        const source = {
          type: "url" as const,
          url: "https://example.com/SKILL.md",
        };

        if (!manager) {
          throw new Error("SkillShareManager not initialized — Red phase");
        }

        // fetch が Error インスタンスではない値をスロー
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue("string error"));

        const result = await manager.importFromSource(source);

        expect(result.success).toBe(false);
        expect(result.error!.code).toBe(3002);
        expect(result.error!.message).toBe("Network error");

        vi.unstubAllGlobals();
      });

      it("SSM-P6-NET-03: Gist 作成が rate limit で失敗する場合エラーを返す", async () => {
        const skillName = "my-skill";
        const destination = { type: "gist" as const, gistId: "" };

        if (!manager) {
          throw new Error("SkillShareManager not initialized — Red phase");
        }

        mockSkillService.getSkillByName.mockResolvedValue({
          success: true,
          data: {
            name: "my-skill",
            path: "/home/user/.aiworkflow/skills/my-skill",
          },
        });
        mockFileSystem.readdir.mockResolvedValue(["SKILL.md"]);
        mockFileSystem.readFile.mockResolvedValue("# My Skill");

        mockGitHubClient.createGist.mockResolvedValue({
          success: false,
          error: {
            code: 3001,
            message: "API rate limit exceeded for gist creation",
            category: "external",
            isRetryable: true,
          },
        });

        const result = await manager.exportSkill(skillName, destination);

        expect(result.success).toBe(false);
        expect(result.error!.code).toBe(3001);
        expect(result.error!.isRetryable).toBe(true);
      });

      it("SSM-P6-NET-04: GitHub getRepoContents が空配列を返す場合 SKILL.md not found エラーを返す", async () => {
        const source = {
          type: "github" as const,
          repo: "owner/empty-repo",
        };

        if (!manager) {
          throw new Error("SkillShareManager not initialized — Red phase");
        }

        mockGitHubClient.getRepoContents.mockResolvedValue({
          success: true,
          data: [],
        });

        const result = await manager.importFromSource(source);

        expect(result.success).toBe(false);
        expect(result.error!.code).toBe(2003);
        expect(result.error!.message).toContain("SKILL.md not found");
      });

      it("SSM-P6-NET-05: URL インポートで HTTP 403 を返す場合 External Service Error を返す", async () => {
        const source = {
          type: "url" as const,
          url: "https://private-server.example.com/SKILL.md",
        };

        if (!manager) {
          throw new Error("SkillShareManager not initialized — Red phase");
        }

        const mockResponse = {
          ok: false,
          status: 403,
          statusText: "Forbidden",
        };
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse));

        const result = await manager.importFromSource(source);

        expect(result.success).toBe(false);
        expect(result.error!.code).toBe(3001);
        expect(result.error!.message).toContain("403");

        vi.unstubAllGlobals();
      });

      it("SSM-P6-NET-06: URL インポートで HTTP 500 を返す場合 External Service Error を返す", async () => {
        const source = {
          type: "url" as const,
          url: "https://broken-server.example.com/SKILL.md",
        };

        if (!manager) {
          throw new Error("SkillShareManager not initialized — Red phase");
        }

        const mockResponse = {
          ok: false,
          status: 500,
          statusText: "Internal Server Error",
        };
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse));

        const result = await manager.importFromSource(source);

        expect(result.success).toBe(false);
        expect(result.error!.code).toBe(3001);
        expect(result.error!.message).toContain("500");

        vi.unstubAllGlobals();
      });
    });

    // ========================================================================
    // ファイルシステムエラー系 (4 tests)
    // ========================================================================
    describe("ファイルシステムエラー系（拡充）", () => {
      it("SSM-P6-FS-01: ローカルインポートで readdir が EACCES を返す場合エラーを返す", async () => {
        const source = {
          type: "local" as const,
          localPath: "/restricted/skill-dir",
        };

        if (!manager) {
          throw new Error("SkillShareManager not initialized — Red phase");
        }

        mockFileSystem.resolveRealPath.mockResolvedValue(
          "/restricted/skill-dir",
        );
        mockFileSystem.stat.mockResolvedValue({ isDirectory: () => true });
        mockFileSystem.readdir.mockRejectedValue(
          Object.assign(new Error("EACCES: permission denied, scandir"), {
            code: "EACCES",
          }),
        );

        const result = await manager.importFromSource(source);

        expect(result.success).toBe(false);
        expect(result.error!.code).toBe(4002);
        expect(result.error!.category).toBe("infrastructure");
      });

      it("SSM-P6-FS-02: mkdir が ENOSPC（ディスク容量不足）を返す場合エラーとなる", async () => {
        const source = {
          type: "github" as const,
          repo: "owner/my-skill",
        };

        if (!manager) {
          throw new Error("SkillShareManager not initialized — Red phase");
        }

        mockGitHubClient.getRepoContents.mockResolvedValue({
          success: true,
          data: [{ name: "SKILL.md", content: "# My Skill" }],
        });

        mockFileSystem.mkdir.mockRejectedValue(
          Object.assign(new Error("ENOSPC: no space left on device"), {
            code: "ENOSPC",
          }),
        );

        // mkdir の例外は importFromGitHub 内で catch されないため直接スロー
        await expect(manager.importFromSource(source)).rejects.toThrow(
          "ENOSPC",
        );
      });

      it("SSM-P6-FS-03: cp がエラーを返す場合ローカルインポートが失敗する", async () => {
        const source = {
          type: "local" as const,
          localPath: "/home/user/skills/my-skill",
        };

        if (!manager) {
          throw new Error("SkillShareManager not initialized — Red phase");
        }

        mockFileSystem.resolveRealPath.mockResolvedValue(
          "/home/user/skills/my-skill",
        );
        mockFileSystem.stat.mockResolvedValue({ isDirectory: () => true });
        mockFileSystem.readdir.mockResolvedValue(["SKILL.md"]);
        mockFileSystem.cp.mockRejectedValue(
          Object.assign(new Error("EIO: i/o error"), { code: "EIO" }),
        );

        const result = await manager.importFromSource(source);

        expect(result.success).toBe(false);
        expect(result.error!.code).toBe(4002);
        expect(result.error!.message).toBe("EIO: i/o error");
      });

      it("SSM-P6-FS-04: writeFile がエラーを返す場合 Gist インポートが失敗する", async () => {
        const source = {
          type: "gist" as const,
          gistId: "gist-write-fail",
        };

        if (!manager) {
          throw new Error("SkillShareManager not initialized — Red phase");
        }

        mockGitHubClient.getGist.mockResolvedValue({
          success: true,
          data: {
            files: {
              "SKILL.md": { content: "# Write Fail Test" },
            },
          },
        });
        mockFileSystem.mkdir.mockResolvedValue(undefined);
        mockFileSystem.writeFile.mockRejectedValue(
          new Error("EACCES: permission denied, write"),
        );

        // writeFile の例外は importFromGist 内で catch されないため直接スロー
        await expect(manager.importFromSource(source)).rejects.toThrow(
          "EACCES",
        );
      });
    });

    // ========================================================================
    // データ不正系 (4 tests)
    // ========================================================================
    describe("データ不正系（拡充）", () => {
      it("SSM-P6-DATA-01: validateSource に SKILL.md の内容が空文字列の場合でも処理を完了する", async () => {
        const source = {
          type: "local" as const,
          localPath: "/home/user/skills/empty-content",
        };

        if (!manager) {
          throw new Error("SkillShareManager not initialized — Red phase");
        }

        mockFileSystem.resolveRealPath.mockResolvedValue(
          "/home/user/skills/empty-content",
        );
        mockFileSystem.stat.mockResolvedValue({ isDirectory: () => true });
        mockFileSystem.readdir.mockResolvedValue(["SKILL.md"]);
        mockFileSystem.readFile.mockResolvedValue("");
        mockSkillValidator.validateSkillMd.mockReturnValue({
          isValid: false,
          errors: ["SKILL.md is empty"],
        });

        const result = await manager.validateSource(source);

        expect(result.success).toBe(true);
        expect(result.data!.hasSkillMd).toBe(true);
        expect(result.data!.errors).toContain("SKILL.md is empty");
      });

      it("SSM-P6-DATA-02: Gist の files が空オブジェクトの場合 SKILL.md not found エラーを返す", async () => {
        const source = {
          type: "gist" as const,
          gistId: "empty-gist",
        };

        if (!manager) {
          throw new Error("SkillShareManager not initialized — Red phase");
        }

        mockGitHubClient.getGist.mockResolvedValue({
          success: true,
          data: { files: {} },
        });

        const result = await manager.importFromSource(source);

        expect(result.success).toBe(false);
        expect(result.error!.code).toBe(2003);
        expect(result.error!.message).toContain("SKILL.md not found in Gist");
      });

      it("SSM-P6-DATA-03: サポートされていないエクスポート先タイプの場合 Validation Error を返す", async () => {
        const skillName = "my-skill";
        const destination = {
          type: "ftp" as "gist",
        };

        if (!manager) {
          throw new Error("SkillShareManager not initialized — Red phase");
        }

        mockSkillService.getSkillByName.mockResolvedValue({
          success: true,
          data: {
            name: "my-skill",
            path: "/home/user/.aiworkflow/skills/my-skill",
          },
        });
        mockFileSystem.readdir.mockResolvedValue(["SKILL.md"]);

        const result = await manager.exportSkill(skillName, destination);

        expect(result.success).toBe(false);
        expect(result.error!.code).toBe(1002);
        expect(result.error!.category).toBe("validation");
        expect(result.error!.message).toContain("Unsupported destination type");
      });

      it("SSM-P6-DATA-04: validateSource に localPath なしの GitHub ソースを渡す場合 localPath required エラーを返す", async () => {
        const source = {
          type: "github" as const,
          repo: "owner/repo",
          // localPath が未設定
        };

        if (!manager) {
          throw new Error("SkillShareManager not initialized — Red phase");
        }

        const result = await manager.validateSource(source);

        expect(result.success).toBe(true);
        expect(result.data!.isReachable).toBe(false);
        expect(result.data!.hasSkillMd).toBe(false);
        expect(result.data!.errors).toContain(
          "localPath is required for validation",
        );
      });
    });

    // ========================================================================
    // validateSource 追加テスト (3 tests)
    // ========================================================================
    describe("validateSource 追加テスト", () => {
      it("SSM-P6-VS-01: validateSource で resolveRealPath が例外をスローした場合エラーを返す", async () => {
        const source = {
          type: "local" as const,
          localPath: "/broken/link",
        };

        if (!manager) {
          throw new Error("SkillShareManager not initialized — Red phase");
        }

        mockFileSystem.resolveRealPath.mockRejectedValue(
          new Error("ENOENT: no such file or directory"),
        );

        const result = await manager.validateSource(source);

        expect(result.success).toBe(true);
        expect(result.data!.isReachable).toBe(false);
        expect(result.data!.errors).toContain(
          "ENOENT: no such file or directory",
        );
      });

      it("SSM-P6-VS-02: validateSource で非 Error オブジェクトがスローされた場合 Unknown error を返す", async () => {
        const source = {
          type: "local" as const,
          localPath: "/some/path",
        };

        if (!manager) {
          throw new Error("SkillShareManager not initialized — Red phase");
        }

        mockFileSystem.resolveRealPath.mockRejectedValue("string error");

        const result = await manager.validateSource(source);

        expect(result.success).toBe(true);
        expect(result.data!.isReachable).toBe(false);
        expect(result.data!.errors).toContain(
          "Unknown error during validation",
        );
      });

      it("SSM-P6-VS-03: validateSource で SKILL.md が存在し内容が有効な場合 errors が空で返る", async () => {
        const source = {
          type: "local" as const,
          localPath: "/home/user/skills/perfect-skill",
        };

        if (!manager) {
          throw new Error("SkillShareManager not initialized — Red phase");
        }

        mockFileSystem.resolveRealPath.mockResolvedValue(
          "/home/user/skills/perfect-skill",
        );
        mockFileSystem.stat.mockResolvedValue({ isDirectory: () => true });
        mockFileSystem.readdir.mockResolvedValue(["SKILL.md", "README.md"]);
        mockFileSystem.readFile.mockResolvedValue(
          "# Perfect Skill\nValid content",
        );
        mockSkillValidator.validateSkillMd.mockReturnValue({
          isValid: true,
          errors: [],
        });

        const result = await manager.validateSource(source);

        expect(result.success).toBe(true);
        expect(result.data!.isReachable).toBe(true);
        expect(result.data!.hasSkillMd).toBe(true);
        expect(result.data!.errors).toHaveLength(0);
      });
    });
  });

  // ==========================================================================
  // Phase 6: 並行処理テスト (3 tests)
  // ==========================================================================

  describe("並行処理テスト", () => {
    it("SSM-P6-CONC-01: Promise.all で 2 件のインポートを同時実行できる", async () => {
      if (!manager) {
        throw new Error("SkillShareManager not initialized — Red phase");
      }

      // GitHub インポート
      const source1 = {
        type: "github" as const,
        repo: "owner/skill-a",
      };
      // Gist インポート
      const source2 = {
        type: "gist" as const,
        gistId: "gist-123",
      };

      mockGitHubClient.getRepoContents.mockResolvedValue({
        success: true,
        data: [{ name: "SKILL.md", content: "# Skill A" }],
      });
      mockGitHubClient.getGist.mockResolvedValue({
        success: true,
        data: {
          files: {
            "SKILL.md": { content: "# Gist Skill" },
          },
        },
      });
      mockFileSystem.mkdir.mockResolvedValue(undefined);
      mockFileSystem.writeFile.mockResolvedValue(undefined);

      const [result1, result2] = await Promise.all([
        manager.importFromSource(source1),
        manager.importFromSource(source2),
      ]);

      expect(result1.success).toBe(true);
      expect(result1.data!.skillName).toBe("skill-a");
      expect(result2.success).toBe(true);
      expect(result2.data!.skillName).toBe("gist-gist-123");
    });

    it("SSM-P6-CONC-02: Promise.all でインポートとエクスポートを同時実行できる", async () => {
      if (!manager) {
        throw new Error("SkillShareManager not initialized — Red phase");
      }

      // インポート
      const importSource = {
        type: "github" as const,
        repo: "owner/new-skill",
      };
      mockGitHubClient.getRepoContents.mockResolvedValue({
        success: true,
        data: [{ name: "SKILL.md", content: "# New Skill" }],
      });
      mockFileSystem.mkdir.mockResolvedValue(undefined);
      mockFileSystem.writeFile.mockResolvedValue(undefined);

      // エクスポート
      const exportDest = { type: "gist" as const, gistId: "" };
      mockSkillService.getSkillByName.mockResolvedValue({
        success: true,
        data: {
          name: "existing-skill",
          path: "/home/user/.aiworkflow/skills/existing-skill",
        },
      });
      mockFileSystem.readdir.mockResolvedValue(["SKILL.md"]);
      mockFileSystem.readFile.mockResolvedValue("# Existing Skill");
      mockGitHubClient.createGist.mockResolvedValue({
        success: true,
        data: { url: "https://gist.github.com/new-gist" },
      });

      const [importResult, exportResult] = await Promise.all([
        manager.importFromSource(importSource),
        manager.exportSkill("existing-skill", exportDest),
      ]);

      expect(importResult.success).toBe(true);
      expect(exportResult.success).toBe(true);
      expect(exportResult.data!.shareUrl).toBe(
        "https://gist.github.com/new-gist",
      );
    });

    it("SSM-P6-CONC-03: Promise.allSettled で 1 件成功・1 件失敗の同時実行", async () => {
      if (!manager) {
        throw new Error("SkillShareManager not initialized — Red phase");
      }

      // 成功するインポート
      const successSource = {
        type: "github" as const,
        repo: "owner/success-skill",
      };

      // 失敗するインポート（存在しないリポジトリ）
      const failSource = {
        type: "github" as const,
        repo: "owner/fail-skill",
      };

      // getRepoContents は最初の呼び出しで成功、2回目で失敗
      mockGitHubClient.getRepoContents
        .mockResolvedValueOnce({
          success: true,
          data: [{ name: "SKILL.md", content: "# Success" }],
        })
        .mockResolvedValueOnce({
          success: false,
          error: {
            code: 3001,
            message: "Repository not found",
            category: "external",
            isRetryable: false,
          },
        });
      mockFileSystem.mkdir.mockResolvedValue(undefined);
      mockFileSystem.writeFile.mockResolvedValue(undefined);

      const results = await Promise.allSettled([
        manager.importFromSource(successSource),
        manager.importFromSource(failSource),
      ]);

      // 両方 fulfilled（エラーは Result パターンで返される）
      expect(results[0].status).toBe("fulfilled");
      expect(results[1].status).toBe("fulfilled");

      const result1 =
        results[0].status === "fulfilled" ? results[0].value : null;
      const result2 =
        results[1].status === "fulfilled" ? results[1].value : null;

      expect(result1!.success).toBe(true);
      expect(result2!.success).toBe(false);
      expect(result2!.error!.code).toBe(3001);
    });
  });
});

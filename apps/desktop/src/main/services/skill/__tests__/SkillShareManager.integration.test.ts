/**
 * SkillShareManager 統合テスト
 *
 * 各メソッドを結合レベルで検証する。
 * テスト安定性を優先し、実ファイルシステムではなくモックを使用。
 *
 * テスト数: 8 tests
 *   - GitHub インポート → ファイル書き込みの結合フロー (1)
 *   - Gist エクスポート → API 呼び出しの結合フロー (1)
 *   - ソース検証 → ファイル読み取りの結合フロー (1)
 *   - インポート → エクスポートの連続フロー (1)
 *   - 並行実行テスト (1)
 *   - URL インポート → SKILL.md 検証の結合フロー (1)
 *   - ローカルインポート → コピー完了の結合フロー (1)
 *   - Gist インポート → 複数ファイル書き込みの結合フロー (1)
 *
 * @see docs/30-workflows/skill-share/outputs/phase-2/architecture-design.md
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock electron-log to prevent log pollution (P20 対策)
vi.mock("electron-log", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

import { SkillShareManager } from "../SkillShareManager";

// ============================================================================
// Mock Types
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
// Integration Tests
// ============================================================================

describe("SkillShareManager Integration", () => {
  let manager: SkillShareManager;
  let mockGitHubClient: MockGitHubClient;
  let mockFileSystem: MockFileSystemAdapter;
  let mockSkillValidator: MockSkillValidator;
  let mockSkillService: MockSkillService;

  beforeEach(() => {
    // P9 対策: テスト間状態リーク防止
    vi.resetAllMocks();

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

    manager = new SkillShareManager(
      mockGitHubClient as never,
      mockFileSystem as never,
      mockSkillValidator as never,
      mockSkillService as never,
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // ==========================================================================
  // GitHub インポート → ファイル書き込みの結合フロー
  // ==========================================================================

  it("INTEG-01: GitHub リポジトリからインポートし全ファイルがローカルに書き込まれることを検証する", async () => {
    // Given: GitHub リポジトリに 3 ファイルが存在
    const source = {
      type: "github" as const,
      repo: "owner/code-review-skill",
      branch: "main",
      path: "/",
    };

    const repoFiles = [
      { name: "SKILL.md", content: "# Code Review Skill\nReviews code" },
      {
        name: "references/patterns.md",
        content: "# Patterns\n## Code patterns",
      },
      { name: "config.json", content: '{"version": "2.0"}' },
    ];

    mockGitHubClient.getRepoContents.mockResolvedValue({
      success: true,
      data: repoFiles,
    });
    mockFileSystem.mkdir.mockResolvedValue(undefined);
    mockFileSystem.writeFile.mockResolvedValue(undefined);

    // When: インポートを実行
    const result = await manager.importFromSource(source);

    // Then: 成功し、全ファイルが書き込まれる
    expect(result.success).toBe(true);
    expect(result.data!.skillName).toBe("code-review-skill");
    expect(result.data!.skillPath).toContain("code-review-skill");

    // mkdir が呼ばれたことを確認
    expect(mockFileSystem.mkdir).toHaveBeenCalledTimes(1);

    // 全ファイルが writeFile で書き込まれたことを確認
    expect(mockFileSystem.writeFile).toHaveBeenCalledTimes(3);
    for (const file of repoFiles) {
      expect(mockFileSystem.writeFile).toHaveBeenCalledWith(
        expect.stringContaining(file.name),
        file.content,
      );
    }
  });

  // ==========================================================================
  // Gist エクスポート → API 呼び出しの結合フロー
  // ==========================================================================

  it("INTEG-02: スキルを Gist にエクスポートし、全ファイルが API に送信されることを検証する", async () => {
    // Given: ローカルにスキルが存在
    const skillName = "my-export-skill";
    const destination = { type: "gist" as const, gistId: "" };

    mockSkillService.getSkillByName.mockResolvedValue({
      success: true,
      data: {
        name: skillName,
        path: "/skills/my-export-skill",
      },
    });
    mockFileSystem.readdir.mockResolvedValue([
      "SKILL.md",
      "config.json",
      "references/patterns.md",
    ]);
    mockFileSystem.readFile
      .mockResolvedValueOnce("# Export Skill\nDescription")
      .mockResolvedValueOnce('{"version": "1.0"}')
      .mockResolvedValueOnce("# Patterns");
    mockGitHubClient.createGist.mockResolvedValue({
      success: true,
      data: { url: "https://gist.github.com/new-gist-id" },
    });

    // When: エクスポートを実行
    const result = await manager.exportSkill(skillName, destination);

    // Then: 成功し、全ファイルが Gist API に送信される
    expect(result.success).toBe(true);
    expect(result.data!.shareUrl).toBe("https://gist.github.com/new-gist-id");
    expect(result.data!.exportedFiles).toHaveLength(3);

    // createGist に全ファイルの内容が渡されたことを確認
    expect(mockGitHubClient.createGist).toHaveBeenCalledWith(
      expect.objectContaining({
        "SKILL.md": { content: "# Export Skill\nDescription" },
        "config.json": { content: '{"version": "1.0"}' },
        "references/patterns.md": { content: "# Patterns" },
      }),
      `Skill: ${skillName}`,
    );
  });

  // ==========================================================================
  // ソース検証 → ファイル読み取りの結合フロー
  // ==========================================================================

  it("INTEG-03: validateSource で SKILL.md の構造検証まで結合的に実行されることを検証する", async () => {
    // Given: ローカルディレクトリに SKILL.md が存在
    const source = {
      type: "local" as const,
      localPath: "/home/user/skills/test-skill",
    };

    mockFileSystem.resolveRealPath.mockResolvedValue(
      "/home/user/skills/test-skill",
    );
    mockFileSystem.stat.mockResolvedValue({ isDirectory: () => true });
    mockFileSystem.readdir.mockResolvedValue(["SKILL.md", "config.json"]);
    mockFileSystem.readFile.mockResolvedValue(
      "# Test Skill\n\nA skill for testing\n\n## Usage\n\nUse it wisely",
    );
    mockSkillValidator.validateSkillMd.mockReturnValue({
      isValid: true,
      errors: [],
    });

    // When: ソース検証を実行
    const result = await manager.validateSource(source);

    // Then: isReachable, hasSkillMd ともに true で、errors は空
    expect(result.success).toBe(true);
    expect(result.data!.isReachable).toBe(true);
    expect(result.data!.hasSkillMd).toBe(true);
    expect(result.data!.errors).toHaveLength(0);

    // readFile が SKILL.md パスで呼ばれたことを確認
    expect(mockFileSystem.readFile).toHaveBeenCalledWith(
      "/home/user/skills/test-skill/SKILL.md",
    );
    // validateSkillMd が呼ばれたことを確認
    expect(mockSkillValidator.validateSkillMd).toHaveBeenCalledWith(
      expect.stringContaining("# Test Skill"),
    );
  });

  // ==========================================================================
  // インポート → エクスポートの連続フロー
  // ==========================================================================

  it("INTEG-04: GitHub からインポートした後、同スキルを Gist へエクスポートする連続フローを検証する", async () => {
    // === Step 1: GitHub インポート ===
    const importSource = {
      type: "github" as const,
      repo: "owner/round-trip-skill",
      branch: "main",
      path: "/",
    };

    mockGitHubClient.getRepoContents.mockResolvedValue({
      success: true,
      data: [
        { name: "SKILL.md", content: "# Round Trip Skill" },
        { name: "config.json", content: '{"v": "1"}' },
      ],
    });
    mockFileSystem.mkdir.mockResolvedValue(undefined);
    mockFileSystem.writeFile.mockResolvedValue(undefined);

    const importResult = await manager.importFromSource(importSource);
    expect(importResult.success).toBe(true);
    expect(importResult.data!.skillName).toBe("round-trip-skill");

    // === Step 2: Gist エクスポート ===
    const exportDestination = { type: "gist" as const, gistId: "" };

    mockSkillService.getSkillByName.mockResolvedValue({
      success: true,
      data: {
        name: "round-trip-skill",
        path: importResult.data!.skillPath,
      },
    });
    mockFileSystem.readdir.mockResolvedValue(["SKILL.md", "config.json"]);
    mockFileSystem.readFile
      .mockResolvedValueOnce("# Round Trip Skill")
      .mockResolvedValueOnce('{"v": "1"}');
    mockGitHubClient.createGist.mockResolvedValue({
      success: true,
      data: { url: "https://gist.github.com/round-trip-gist" },
    });

    const exportResult = await manager.exportSkill(
      "round-trip-skill",
      exportDestination,
    );

    // Then: エクスポートも成功
    expect(exportResult.success).toBe(true);
    expect(exportResult.data!.shareUrl).toBe(
      "https://gist.github.com/round-trip-gist",
    );
    expect(exportResult.data!.exportedFiles).toContain("SKILL.md");
  });

  // ==========================================================================
  // 並行実行テスト
  // ==========================================================================

  it("INTEG-05: Promise.all で 2 件同時インポートした場合、両方が独立に成功する", async () => {
    // Given: 2 つの独立した GitHub ソース
    const source1 = {
      type: "github" as const,
      repo: "owner/skill-alpha",
      branch: "main",
      path: "/",
    };
    const source2 = {
      type: "github" as const,
      repo: "owner/skill-beta",
      branch: "main",
      path: "/",
    };

    // Mock: 両方のリポジトリが成功を返す
    mockGitHubClient.getRepoContents
      .mockResolvedValueOnce({
        success: true,
        data: [{ name: "SKILL.md", content: "# Alpha Skill" }],
      })
      .mockResolvedValueOnce({
        success: true,
        data: [{ name: "SKILL.md", content: "# Beta Skill" }],
      });
    mockFileSystem.mkdir.mockResolvedValue(undefined);
    mockFileSystem.writeFile.mockResolvedValue(undefined);

    // When: 並行実行
    const [result1, result2] = await Promise.all([
      manager.importFromSource(source1),
      manager.importFromSource(source2),
    ]);

    // Then: 両方とも成功
    expect(result1.success).toBe(true);
    expect(result1.data!.skillName).toBe("skill-alpha");
    expect(result2.success).toBe(true);
    expect(result2.data!.skillName).toBe("skill-beta");

    // getRepoContents が 2 回呼ばれたことを確認
    expect(mockGitHubClient.getRepoContents).toHaveBeenCalledTimes(2);
  });

  // ==========================================================================
  // URL インポート → SKILL.md 検証の結合フロー
  // ==========================================================================

  it("INTEG-06: URL からインポートし SKILL.md バリデーションが通る結合フローを検証する", async () => {
    // Given: 有効な SKILL.md を返す URL
    const source = {
      type: "url" as const,
      url: "https://raw.githubusercontent.com/owner/url-skill/main/SKILL.md",
    };

    const skillContent =
      "# URL Import Skill\n\nA skill imported from URL\n\n## Features\n\n- Feature 1";

    const mockResponse = {
      ok: true,
      status: 200,
      text: vi.fn().mockResolvedValue(skillContent),
    };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse));

    mockSkillValidator.validateSkillMd.mockReturnValue({
      isValid: true,
      errors: [],
    });
    mockFileSystem.mkdir.mockResolvedValue(undefined);
    mockFileSystem.writeFile.mockResolvedValue(undefined);

    // When: URL インポートを実行
    const result = await manager.importFromSource(source);

    // Then: 成功し、SKILL.md が書き込まれる
    expect(result.success).toBe(true);
    expect(result.data!.source).toEqual(source);

    // validateSkillMd が URL から取得したコンテンツで呼ばれたことを確認
    expect(mockSkillValidator.validateSkillMd).toHaveBeenCalledWith(
      skillContent,
    );

    // SKILL.md が書き込まれたことを確認
    expect(mockFileSystem.writeFile).toHaveBeenCalledWith(
      expect.stringContaining("SKILL.md"),
      skillContent,
    );
  });

  // ==========================================================================
  // ローカルインポート → コピー完了の結合フロー
  // ==========================================================================

  it("INTEG-07: ローカルディレクトリからインポートし cp 完了まで結合的に検証する", async () => {
    // Given: ローカルディレクトリにスキルが存在
    const source = {
      type: "local" as const,
      localPath: "/home/user/external-skills/local-skill",
    };

    mockFileSystem.resolveRealPath.mockResolvedValue(
      "/home/user/external-skills/local-skill",
    );
    mockFileSystem.stat.mockResolvedValue({ isDirectory: () => true });
    mockFileSystem.readdir.mockResolvedValue(["SKILL.md", "README.md"]);
    mockFileSystem.cp.mockResolvedValue(undefined);

    // When: ローカルインポートを実行
    const result = await manager.importFromSource(source);

    // Then: 成功し、cp がソースとデスト間で呼ばれる
    expect(result.success).toBe(true);
    expect(result.data!.skillName).toBe("local-skill");

    expect(mockFileSystem.cp).toHaveBeenCalledWith(
      "/home/user/external-skills/local-skill",
      expect.stringContaining("local-skill"),
    );
  });

  // ==========================================================================
  // Gist インポート → 複数ファイル書き込みの結合フロー
  // ==========================================================================

  it("INTEG-08: Gist から複数ファイルをインポートし全ファイルが書き込まれることを検証する", async () => {
    // Given: Gist に 3 ファイルが含まれる
    const source = {
      type: "gist" as const,
      gistId: "multi-file-gist-123",
    };

    mockGitHubClient.getGist.mockResolvedValue({
      success: true,
      data: {
        files: {
          "SKILL.md": { content: "# Multi File Skill" },
          "config.yaml": { content: "version: 1.0" },
          "templates/main.txt": { content: "Hello {{name}}" },
        },
      },
    });
    mockFileSystem.mkdir.mockResolvedValue(undefined);
    mockFileSystem.writeFile.mockResolvedValue(undefined);

    // When: Gist インポートを実行
    const result = await manager.importFromSource(source);

    // Then: 成功し、全 3 ファイルが書き込まれる
    expect(result.success).toBe(true);
    expect(result.data!.skillName).toContain("multi-file-gist-123");

    expect(mockFileSystem.writeFile).toHaveBeenCalledTimes(3);
    expect(mockFileSystem.writeFile).toHaveBeenCalledWith(
      expect.stringContaining("SKILL.md"),
      "# Multi File Skill",
    );
    expect(mockFileSystem.writeFile).toHaveBeenCalledWith(
      expect.stringContaining("config.yaml"),
      "version: 1.0",
    );
    expect(mockFileSystem.writeFile).toHaveBeenCalledWith(
      expect.stringContaining("templates/main.txt"),
      "Hello {{name}}",
    );
  });
});

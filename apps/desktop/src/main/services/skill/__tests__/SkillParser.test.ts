/**
 * SkillParser Tests
 *
 * TDD Red Phase: These tests are designed to fail until implementation is complete.
 *
 * @see docs/30-workflows/agent-003-skill-management-backend/outputs/phase-2/class-design.md
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as fs from "fs/promises";
import * as _path from "path";
import { createHash } from "crypto";

// Mock fs/promises for unit tests
vi.mock("fs/promises");

// Import after mocks - this will fail in Red phase
let SkillParser: typeof import("../SkillParser").SkillParser;

describe("SkillParser", () => {
  let parser: InstanceType<typeof SkillParser>;

  // Sample SKILL.md content for testing
  const sampleSkillMd = `---
name: Test Skill
description: |
  テストスキルの説明です。

  Anchors:
  • Clean Code (Robert C. Martin) / 適用: 単一責務の原則 / 目的: タスク分解の基準
  • Domain-Driven Design (Eric Evans) / 適用: ユビキタス言語 / 目的: 一貫した用語設計

  Trigger:
  テスト, スキル, サンプル
  Use when creating test specifications
license: MIT
allowed-tools:
  - Bash
  - Read
  - Write
tags:
  - testing
  - development
dependencies:
  - skill-base
---

# Test Skill

This is the main content of the skill.
`;

  const minimalSkillMd = `---
name: Minimal Skill
---
# Minimal
`;

  const invalidYamlSkillMd = `---
name: [invalid yaml
---
# Invalid
`;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Try to import SkillParser (will fail in Red phase)
    try {
      const module = await import("../SkillParser");
      SkillParser = module.SkillParser;
      parser = new SkillParser();
    } catch {
      // Expected in Red phase - module doesn't exist yet
    }
  });

  afterEach(() => {
    vi.resetModules();
  });

  // ===========================================================================
  // parse tests
  // ===========================================================================

  describe("parse", () => {
    it("SP-P-01: should parse skill name from YAML frontmatter", async () => {
      // Given: SKILL.mdファイルが存在する
      const skillMdPath = "/test/skills/test-skill/SKILL.md";
      (fs.readFile as ReturnType<typeof vi.fn>).mockResolvedValue(
        sampleSkillMd,
      );
      (fs.stat as ReturnType<typeof vi.fn>).mockResolvedValue({
        mtime: new Date("2026-01-11T00:00:00Z"),
      });

      if (!parser) {
        throw new Error("SkillParser not initialized - Red phase");
      }

      // When: parseを呼び出す
      const skill = await parser.parse(skillMdPath);

      // Then: nameが正しく抽出される
      expect(skill.name).toBe("Test Skill");
    });

    it("SP-P-02: should parse description from YAML frontmatter", async () => {
      // Given: SKILL.mdファイルが存在する
      const skillMdPath = "/test/skills/test-skill/SKILL.md";
      (fs.readFile as ReturnType<typeof vi.fn>).mockResolvedValue(
        sampleSkillMd,
      );
      (fs.stat as ReturnType<typeof vi.fn>).mockResolvedValue({
        mtime: new Date("2026-01-11T00:00:00Z"),
      });

      if (!parser) {
        throw new Error("SkillParser not initialized - Red phase");
      }

      // When: parseを呼び出す
      const skill = await parser.parse(skillMdPath);

      // Then: descriptionが正しく抽出される
      expect(skill.description).toContain("テストスキルの説明です");
    });

    it("SP-P-03: should parse license from YAML frontmatter", async () => {
      // Given: SKILL.mdファイルが存在する
      const skillMdPath = "/test/skills/test-skill/SKILL.md";
      (fs.readFile as ReturnType<typeof vi.fn>).mockResolvedValue(
        sampleSkillMd,
      );
      (fs.stat as ReturnType<typeof vi.fn>).mockResolvedValue({
        mtime: new Date("2026-01-11T00:00:00Z"),
      });

      if (!parser) {
        throw new Error("SkillParser not initialized - Red phase");
      }

      // When: parseを呼び出す
      const skill = await parser.parse(skillMdPath);

      // Then: licenseが正しく抽出される
      expect(skill.license).toBe("MIT");
    });

    it("SP-P-04: should parse allowed-tools from YAML frontmatter", async () => {
      // Given: SKILL.mdファイルが存在する
      const skillMdPath = "/test/skills/test-skill/SKILL.md";
      (fs.readFile as ReturnType<typeof vi.fn>).mockResolvedValue(
        sampleSkillMd,
      );
      (fs.stat as ReturnType<typeof vi.fn>).mockResolvedValue({
        mtime: new Date("2026-01-11T00:00:00Z"),
      });

      if (!parser) {
        throw new Error("SkillParser not initialized - Red phase");
      }

      // When: parseを呼び出す
      const skill = await parser.parse(skillMdPath);

      // Then: allowedToolsが正しく抽出される
      expect(skill.allowedTools).toEqual(["Bash", "Read", "Write"]);
    });

    it("SP-P-05: should parse tags from YAML frontmatter", async () => {
      // Given: SKILL.mdファイルが存在する
      const skillMdPath = "/test/skills/test-skill/SKILL.md";
      (fs.readFile as ReturnType<typeof vi.fn>).mockResolvedValue(
        sampleSkillMd,
      );
      (fs.stat as ReturnType<typeof vi.fn>).mockResolvedValue({
        mtime: new Date("2026-01-11T00:00:00Z"),
      });

      if (!parser) {
        throw new Error("SkillParser not initialized - Red phase");
      }

      // When: parseを呼び出す
      const skill = await parser.parse(skillMdPath);

      // Then: tagsが正しく抽出される
      expect(skill.tags).toEqual(["testing", "development"]);
    });

    it("SP-P-06: should parse dependencies from YAML frontmatter", async () => {
      // Given: SKILL.mdファイルが存在する
      const skillMdPath = "/test/skills/test-skill/SKILL.md";
      (fs.readFile as ReturnType<typeof vi.fn>).mockResolvedValue(
        sampleSkillMd,
      );
      (fs.stat as ReturnType<typeof vi.fn>).mockResolvedValue({
        mtime: new Date("2026-01-11T00:00:00Z"),
      });

      if (!parser) {
        throw new Error("SkillParser not initialized - Red phase");
      }

      // When: parseを呼び出す
      const skill = await parser.parse(skillMdPath);

      // Then: dependenciesが正しく抽出される
      expect(skill.dependencies).toEqual(["skill-base"]);
    });

    it("SP-P-07: should generate consistent id from path using SHA-256", async () => {
      // Given: 同じパス
      const skillMdPath = "/test/skills/test-skill/SKILL.md";
      (fs.readFile as ReturnType<typeof vi.fn>).mockResolvedValue(
        sampleSkillMd,
      );
      (fs.stat as ReturnType<typeof vi.fn>).mockResolvedValue({
        mtime: new Date("2026-01-11T00:00:00Z"),
      });

      if (!parser) {
        throw new Error("SkillParser not initialized - Red phase");
      }

      // When: 同じパスでparseを2回呼び出す
      const skill1 = await parser.parse(skillMdPath);
      const skill2 = await parser.parse(skillMdPath);

      // Then: 同じIDが生成される
      expect(skill1.id).toBe(skill2.id);
      expect(skill1.id).toHaveLength(16);

      // Verify it matches expected hash
      const expectedHash = createHash("sha256")
        .update(skillMdPath)
        .digest("hex")
        .substring(0, 16);
      expect(skill1.id).toBe(expectedHash);
    });

    it("SP-P-08: should extract slug from directory name", async () => {
      // Given: ディレクトリ名がtest-skill
      const skillMdPath = "/test/skills/test-skill/SKILL.md";
      (fs.readFile as ReturnType<typeof vi.fn>).mockResolvedValue(
        sampleSkillMd,
      );
      (fs.stat as ReturnType<typeof vi.fn>).mockResolvedValue({
        mtime: new Date("2026-01-11T00:00:00Z"),
      });

      if (!parser) {
        throw new Error("SkillParser not initialized - Red phase");
      }

      // When: parseを呼び出す
      const skill = await parser.parse(skillMdPath);

      // Then: slugがディレクトリ名になる
      expect(skill.slug).toBe("test-skill");
    });

    it("SP-P-09: should set lastModified from file stats", async () => {
      // Given: ファイルの更新日時がある
      const skillMdPath = "/test/skills/test-skill/SKILL.md";
      const mtime = new Date("2026-01-11T12:00:00Z");
      (fs.readFile as ReturnType<typeof vi.fn>).mockResolvedValue(
        sampleSkillMd,
      );
      (fs.stat as ReturnType<typeof vi.fn>).mockResolvedValue({ mtime });

      if (!parser) {
        throw new Error("SkillParser not initialized - Red phase");
      }

      // When: parseを呼び出す
      const skill = await parser.parse(skillMdPath);

      // Then: lastModifiedが設定される
      expect(skill.lastModified).toEqual(mtime);
    });

    it("SP-P-10: should set path to skillMdPath", async () => {
      // Given: SKILL.mdファイルパス
      const skillMdPath = "/test/skills/test-skill/SKILL.md";
      (fs.readFile as ReturnType<typeof vi.fn>).mockResolvedValue(
        sampleSkillMd,
      );
      (fs.stat as ReturnType<typeof vi.fn>).mockResolvedValue({
        mtime: new Date(),
      });

      if (!parser) {
        throw new Error("SkillParser not initialized - Red phase");
      }

      // When: parseを呼び出す
      const skill = await parser.parse(skillMdPath);

      // Then: pathが設定される
      expect(skill.path).toBe(skillMdPath);
    });

    it("SP-P-11: should infer category from first tag", async () => {
      // Given: tagsがある
      const skillMdPath = "/test/skills/test-skill/SKILL.md";
      (fs.readFile as ReturnType<typeof vi.fn>).mockResolvedValue(
        sampleSkillMd,
      );
      (fs.stat as ReturnType<typeof vi.fn>).mockResolvedValue({
        mtime: new Date(),
      });

      if (!parser) {
        throw new Error("SkillParser not initialized - Red phase");
      }

      // When: parseを呼び出す
      const skill = await parser.parse(skillMdPath);

      // Then: categoryが最初のタグに設定される
      expect(skill.category).toBe("testing");
    });
  });

  // ===========================================================================
  // parseAnchors tests
  // ===========================================================================

  describe("parseAnchors", () => {
    it("SP-PA-01: should parse anchors from description", async () => {
      // Given: Anchors:セクションを含むdescription
      const skillMdPath = "/test/skills/test-skill/SKILL.md";
      (fs.readFile as ReturnType<typeof vi.fn>).mockResolvedValue(
        sampleSkillMd,
      );
      (fs.stat as ReturnType<typeof vi.fn>).mockResolvedValue({
        mtime: new Date(),
      });

      if (!parser) {
        throw new Error("SkillParser not initialized - Red phase");
      }

      // When: parseを呼び出す
      const skill = await parser.parse(skillMdPath);

      // Then: anchorsが正しく解析される
      expect(skill.anchors).toHaveLength(2);
    });

    it("SP-PA-02: should parse multiple anchors", async () => {
      // Given: 複数のアンカーを含むdescription
      const skillMdPath = "/test/skills/test-skill/SKILL.md";
      (fs.readFile as ReturnType<typeof vi.fn>).mockResolvedValue(
        sampleSkillMd,
      );
      (fs.stat as ReturnType<typeof vi.fn>).mockResolvedValue({
        mtime: new Date(),
      });

      if (!parser) {
        throw new Error("SkillParser not initialized - Red phase");
      }

      // When: parseを呼び出す
      const skill = await parser.parse(skillMdPath);

      // Then: 複数のアンカーが解析される
      expect(skill.anchors).toHaveLength(2);
      expect(skill.anchors[0].source).toBe("Clean Code (Robert C. Martin)");
      expect(skill.anchors[1].source).toBe("Domain-Driven Design (Eric Evans)");
    });

    it("SP-PA-03: should handle missing anchors section", async () => {
      // Given: Anchors:セクションがない
      const skillMdPath = "/test/skills/minimal-skill/SKILL.md";
      (fs.readFile as ReturnType<typeof vi.fn>).mockResolvedValue(
        minimalSkillMd,
      );
      (fs.stat as ReturnType<typeof vi.fn>).mockResolvedValue({
        mtime: new Date(),
      });

      if (!parser) {
        throw new Error("SkillParser not initialized - Red phase");
      }

      // When: parseを呼び出す
      const skill = await parser.parse(skillMdPath);

      // Then: 空配列が返される
      expect(skill.anchors).toEqual([]);
    });

    it("SP-PA-04: should extract source, application, and purpose", async () => {
      // Given: アンカーを含むdescription
      const skillMdPath = "/test/skills/test-skill/SKILL.md";
      (fs.readFile as ReturnType<typeof vi.fn>).mockResolvedValue(
        sampleSkillMd,
      );
      (fs.stat as ReturnType<typeof vi.fn>).mockResolvedValue({
        mtime: new Date(),
      });

      if (!parser) {
        throw new Error("SkillParser not initialized - Red phase");
      }

      // When: parseを呼び出す
      const skill = await parser.parse(skillMdPath);

      // Then: source, application, purposeが正しく抽出される
      const firstAnchor = skill.anchors[0];
      expect(firstAnchor.source).toBe("Clean Code (Robert C. Martin)");
      expect(firstAnchor.application).toBe("単一責務の原則");
      expect(firstAnchor.purpose).toBe("タスク分解の基準");
    });
  });

  // ===========================================================================
  // parseTriggers tests
  // ===========================================================================

  describe("parseTriggers", () => {
    it("SP-PT-01: should parse triggers from description", async () => {
      // Given: Trigger:セクションを含むdescription
      const skillMdPath = "/test/skills/test-skill/SKILL.md";
      (fs.readFile as ReturnType<typeof vi.fn>).mockResolvedValue(
        sampleSkillMd,
      );
      (fs.stat as ReturnType<typeof vi.fn>).mockResolvedValue({
        mtime: new Date(),
      });

      if (!parser) {
        throw new Error("SkillParser not initialized - Red phase");
      }

      // When: parseを呼び出す
      const skill = await parser.parse(skillMdPath);

      // Then: triggersが正しく解析される
      expect(skill.triggers.length).toBeGreaterThan(0);
    });

    it("SP-PT-02: should handle comma-separated triggers", async () => {
      // Given: カンマ区切りのトリガー
      const skillMdPath = "/test/skills/test-skill/SKILL.md";
      (fs.readFile as ReturnType<typeof vi.fn>).mockResolvedValue(
        sampleSkillMd,
      );
      (fs.stat as ReturnType<typeof vi.fn>).mockResolvedValue({
        mtime: new Date(),
      });

      if (!parser) {
        throw new Error("SkillParser not initialized - Red phase");
      }

      // When: parseを呼び出す
      const skill = await parser.parse(skillMdPath);

      // Then: カンマ区切りのキーワードが個別に解析される
      expect(skill.triggers).toContain("テスト");
      expect(skill.triggers).toContain("スキル");
      expect(skill.triggers).toContain("サンプル");
    });

    it("SP-PT-03: should handle missing triggers section", async () => {
      // Given: Trigger:セクションがない
      const skillMdPath = "/test/skills/minimal-skill/SKILL.md";
      (fs.readFile as ReturnType<typeof vi.fn>).mockResolvedValue(
        minimalSkillMd,
      );
      (fs.stat as ReturnType<typeof vi.fn>).mockResolvedValue({
        mtime: new Date(),
      });

      if (!parser) {
        throw new Error("SkillParser not initialized - Red phase");
      }

      // When: parseを呼び出す
      const skill = await parser.parse(skillMdPath);

      // Then: 空配列が返される
      expect(skill.triggers).toEqual([]);
    });

    it("SP-PT-04: should trim whitespace from triggers", async () => {
      // Given: 空白を含むトリガー
      const skillMdWithSpaces = `---
name: Spacey Skill
description: |
  Trigger:
  one ,  two  , three
---
# Test
`;
      const skillMdPath = "/test/skills/spacey-skill/SKILL.md";
      (fs.readFile as ReturnType<typeof vi.fn>).mockResolvedValue(
        skillMdWithSpaces,
      );
      (fs.stat as ReturnType<typeof vi.fn>).mockResolvedValue({
        mtime: new Date(),
      });

      if (!parser) {
        throw new Error("SkillParser not initialized - Red phase");
      }

      // When: parseを呼び出す
      const skill = await parser.parse(skillMdPath);

      // Then: 前後の空白が除去される
      expect(skill.triggers).toContain("one");
      expect(skill.triggers).toContain("two");
      expect(skill.triggers).toContain("three");
      expect(skill.triggers).not.toContain(" one");
      expect(skill.triggers).not.toContain("one ");
    });

    it("SP-PT-05: should handle 'Use when' format triggers", async () => {
      // Given: "Use when"形式のトリガー
      const skillMdPath = "/test/skills/test-skill/SKILL.md";
      (fs.readFile as ReturnType<typeof vi.fn>).mockResolvedValue(
        sampleSkillMd,
      );
      (fs.stat as ReturnType<typeof vi.fn>).mockResolvedValue({
        mtime: new Date(),
      });

      if (!parser) {
        throw new Error("SkillParser not initialized - Red phase");
      }

      // When: parseを呼び出す
      const skill = await parser.parse(skillMdPath);

      // Then: "Use when"形式のトリガーが解析される
      expect(
        skill.triggers.some((t) => t.includes("creating test specifications")),
      ).toBe(true);
    });
  });

  // ===========================================================================
  // error handling tests
  // ===========================================================================

  describe("error handling", () => {
    it("SP-EH-01: should use fallback values for missing required fields", async () => {
      // Given: 必須フィールドがない（nameのみ）
      const skillMdPath = "/test/skills/minimal-skill/SKILL.md";
      (fs.readFile as ReturnType<typeof vi.fn>).mockResolvedValue(
        minimalSkillMd,
      );
      (fs.stat as ReturnType<typeof vi.fn>).mockResolvedValue({
        mtime: new Date(),
      });

      if (!parser) {
        throw new Error("SkillParser not initialized - Red phase");
      }

      // When: parseを呼び出す
      const skill = await parser.parse(skillMdPath);

      // Then: fallback値が使用される
      expect(skill.name).toBe("Minimal Skill");
      expect(skill.description).toBe(""); // or undefined
      expect(skill.triggers).toEqual([]);
      expect(skill.anchors).toEqual([]);
    });

    it("SP-EH-02: should use directory name as fallback for missing name", async () => {
      // Given: nameフィールドがない
      const noNameSkillMd = `---
description: No name skill
---
# No Name
`;
      const skillMdPath = "/test/skills/fallback-name/SKILL.md";
      (fs.readFile as ReturnType<typeof vi.fn>).mockResolvedValue(
        noNameSkillMd,
      );
      (fs.stat as ReturnType<typeof vi.fn>).mockResolvedValue({
        mtime: new Date(),
      });

      if (!parser) {
        throw new Error("SkillParser not initialized - Red phase");
      }

      // When: parseを呼び出す
      const skill = await parser.parse(skillMdPath);

      // Then: ディレクトリ名がnameとして使用される
      expect(skill.name).toBe("fallback-name");
    });

    it("SP-EH-03: should handle invalid YAML frontmatter", async () => {
      // Given: 無効なYAML
      const skillMdPath = "/test/skills/invalid/SKILL.md";
      (fs.readFile as ReturnType<typeof vi.fn>).mockResolvedValue(
        invalidYamlSkillMd,
      );
      (fs.stat as ReturnType<typeof vi.fn>).mockResolvedValue({
        mtime: new Date(),
      });

      if (!parser) {
        throw new Error("SkillParser not initialized - Red phase");
      }

      // When & Then: エラーがスローされるか、fallback値が使用される
      // Note: 実装によってどちらかの挙動
      try {
        const skill = await parser.parse(skillMdPath);
        // If it doesn't throw, check that fallback values are used
        expect(skill.name).toBe("invalid"); // directory name as fallback
      } catch (error) {
        // If it throws, that's also acceptable
        expect(error).toBeDefined();
      }
    });

    it("SP-EH-04: should handle file read errors", async () => {
      // Given: ファイル読み取りエラー
      const skillMdPath = "/test/skills/nonexistent/SKILL.md";
      (fs.readFile as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("ENOENT: no such file or directory"),
      );

      if (!parser) {
        throw new Error("SkillParser not initialized - Red phase");
      }

      // When & Then: 適切にエラーがスローされる
      await expect(parser.parse(skillMdPath)).rejects.toThrow();
    });

    it("SP-EH-05: should handle stat errors", async () => {
      // Given: stat取得エラー
      const skillMdPath = "/test/skills/test-skill/SKILL.md";
      (fs.readFile as ReturnType<typeof vi.fn>).mockResolvedValue(
        sampleSkillMd,
      );
      (fs.stat as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("EACCES: permission denied"),
      );

      if (!parser) {
        throw new Error("SkillParser not initialized - Red phase");
      }

      // When & Then: 適切にエラーがスローされる
      await expect(parser.parse(skillMdPath)).rejects.toThrow();
    });
  });
});

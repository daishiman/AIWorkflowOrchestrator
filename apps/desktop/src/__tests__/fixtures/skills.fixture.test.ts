/**
 * E2E Skill Fixtures Validation Tests
 *
 * TASK-8C-E: E2Eテストフィクスチャの検証テスト
 * フィクスチャファイルの存在・構造・SkillScannerとの統合を検証する。
 */
import { describe, it, expect, beforeAll } from "vitest";
import * as fs from "fs/promises";
import * as path from "path";
import { SkillScanner } from "../../main/services/skill/SkillScanner";
import type { ScannedSkillMetadata } from "../../main/services/skill/SkillScanner";

const FIXTURES_DIR = path.join(__dirname, "..", "__fixtures__", "skills");

const fixturePath = (...segments: string[]) =>
  path.join(FIXTURES_DIR, ...segments);

const createScanner = () =>
  new SkillScanner({
    aiworkflowSkillsDir: FIXTURES_DIR,
    claudeSkillsDir: "/non-existent-path-for-test",
  });

describe("E2E Skill Fixtures", () => {
  // TC-001: test-skill/SKILL.md が存在する
  it("TC-001: test-skill/SKILL.md should exist", async () => {
    await expect(
      fs.access(fixturePath("test-skill", "SKILL.md")),
    ).resolves.toBeUndefined();
  });

  // TC-002: test-skill/SKILL.md の YAML Frontmatter が正しい
  it("TC-002: test-skill/SKILL.md should have valid YAML frontmatter", async () => {
    const content = await fs.readFile(
      fixturePath("test-skill", "SKILL.md"),
      "utf-8",
    );
    expect(content).toMatch(/^---\r?\n[\s\S]*?\r?\n---/);
    expect(content).toContain("name: test-skill");
    expect(content).toContain("description:");
    expect(content).toContain("allowed-tools:");
  });

  // TC-003: test-skill/agents/test-agent.md が存在する
  it("TC-003: test-skill/agents/test-agent.md should exist", async () => {
    await expect(
      fs.access(fixturePath("test-skill", "agents", "test-agent.md")),
    ).resolves.toBeUndefined();
  });

  // TC-004: test-skill/references/test-ref.md が存在する
  it("TC-004: test-skill/references/test-ref.md should exist", async () => {
    await expect(
      fs.access(fixturePath("test-skill", "references", "test-ref.md")),
    ).resolves.toBeUndefined();
  });

  // TC-005: another-skill/SKILL.md が存在する
  it("TC-005: another-skill/SKILL.md should exist", async () => {
    await expect(
      fs.access(fixturePath("another-skill", "SKILL.md")),
    ).resolves.toBeUndefined();
  });

  // TC-006: another-skill/SKILL.md の YAML Frontmatter が正しい
  it("TC-006: another-skill/SKILL.md should have valid YAML frontmatter", async () => {
    const content = await fs.readFile(
      fixturePath("another-skill", "SKILL.md"),
      "utf-8",
    );
    expect(content).toMatch(/^---\r?\n[\s\S]*?\r?\n---/);
    expect(content).toContain("name: another-skill");
    expect(content).toContain("description:");
  });

  // TC-007: invalid-skill/README.md が存在する
  it("TC-007: invalid-skill/README.md should exist", async () => {
    await expect(
      fs.access(fixturePath("invalid-skill", "README.md")),
    ).resolves.toBeUndefined();
  });

  // TC-008: invalid-skill/SKILL.md が存在しない
  it("TC-008: invalid-skill/SKILL.md should NOT exist", async () => {
    await expect(
      fs.access(fixturePath("invalid-skill", "SKILL.md")),
    ).rejects.toThrow();
  });
});

describe("SkillScanner Fixture Integration", () => {
  let skills: ScannedSkillMetadata[];
  let testSkill: ScannedSkillMetadata | undefined;
  let anotherSkill: ScannedSkillMetadata | undefined;

  beforeAll(async () => {
    skills = await createScanner().scanAll();
    testSkill = skills.find((s) => s.name === "test-skill");
    anotherSkill = skills.find((s) => s.name === "another-skill");
  });

  // TC-009: SkillScanner がフィクスチャディレクトリを正しくスキャンできる
  it("TC-009: SkillScanner should scan fixture directory successfully", () => {
    expect(skills).toBeInstanceOf(Array);
    expect(skills.length).toBeGreaterThanOrEqual(2);
  });

  // TC-010: test-skill が ScannedSkillMetadata として取得される
  it("TC-010: test-skill should be scanned as ScannedSkillMetadata", () => {
    expect(testSkill).toBeDefined();
    expect(testSkill?.description).toBe("E2Eテスト用のスキル");
  });

  // TC-011: test-skill の agents 配列に test-agent が含まれる
  it("TC-011: test-skill agents should contain test-agent", () => {
    expect(testSkill?.agents).toBeInstanceOf(Array);
    expect(testSkill?.agents.some((a) => a.filename === "test-agent.md")).toBe(
      true,
    );
  });

  // TC-012: test-skill の references 配列に test-ref が含まれる
  it("TC-012: test-skill references should contain test-ref", () => {
    expect(testSkill?.references).toBeInstanceOf(Array);
    expect(
      testSkill?.references.some((r) => r.filename === "test-ref.md"),
    ).toBe(true);
  });

  // TC-013: another-skill が ScannedSkillMetadata として取得される
  it("TC-013: another-skill should be scanned as ScannedSkillMetadata", () => {
    expect(anotherSkill).toBeDefined();
    expect(anotherSkill?.description).toBe("別のテスト用スキル");
  });

  // TC-014: invalid-skill が結果に含まれない
  it("TC-014: invalid-skill should NOT be in scan results", () => {
    expect(skills.every((s) => s.name !== "invalid-skill")).toBe(true);
  });

  // TC-015: test-skill の name が 'test-skill' である
  it("TC-015: test-skill name should be 'test-skill'", () => {
    expect(testSkill?.name).toBe("test-skill");
  });

  // TC-016: test-skill の description が 'E2Eテスト用のスキル' である
  it("TC-016: test-skill description should be 'E2Eテスト用のスキル'", () => {
    expect(testSkill?.description).toBe("E2Eテスト用のスキル");
  });

  // TC-017: test-skill の allowed-tools が ['Read', 'Write', 'Edit', 'Bash'] である
  it("TC-017: test-skill allowedTools should be ['Read', 'Write', 'Edit', 'Bash']", () => {
    expect(testSkill?.allowedTools).toEqual(["Read", "Write", "Edit", "Bash"]);
  });

  // TC-018: another-skill の name が 'another-skill' である
  it("TC-018: another-skill name should be 'another-skill'", () => {
    expect(anotherSkill?.name).toBe("another-skill");
  });

  // TC-019: another-skill の allowed-tools が ['Read', 'Glob'] である
  it("TC-019: another-skill allowedTools should be ['Read', 'Glob']", () => {
    expect(anotherSkill?.allowedTools).toEqual(["Read", "Glob"]);
  });

  // TC-020: test-agent の filename が 'test-agent.md' である
  it("TC-020: test-agent filename should be 'test-agent.md'", () => {
    const agent = testSkill?.agents.find((a) => a.filename === "test-agent.md");
    expect(agent).toBeDefined();
    expect(agent?.filename).toBe("test-agent.md");
  });

  // TC-021: test-agent の description が 'Test Agent' を含む
  it("TC-021: test-agent description should contain 'Test Agent'", () => {
    const agent = testSkill?.agents.find((a) => a.filename === "test-agent.md");
    expect(agent?.description).toContain("Test Agent");
  });

  // TC-022: test-ref の filename が 'test-ref.md' である
  it("TC-022: test-ref filename should be 'test-ref.md'", () => {
    const ref = testSkill?.references.find((r) => r.filename === "test-ref.md");
    expect(ref).toBeDefined();
    expect(ref?.filename).toBe("test-ref.md");
  });

  // TC-023: test-ref の description が 'Test Reference' を含む
  it("TC-023: test-ref description should contain 'Test Reference'", () => {
    const ref = testSkill?.references.find((r) => r.filename === "test-ref.md");
    expect(ref?.description).toContain("Test Reference");
  });

  // TC-024: another-skill の agents が空配列である
  it("TC-024: another-skill agents should be empty array", () => {
    expect(anotherSkill?.agents).toEqual([]);
  });

  // TC-025: another-skill の references が空配列である
  it("TC-025: another-skill references should be empty array", () => {
    expect(anotherSkill?.references).toEqual([]);
  });
});

describe("Directory Structure Validation", () => {
  // TC-026: __fixtures__/skills/ 配下に3つのディレクトリが存在する
  it("TC-026: fixtures/skills/ should contain 3 directories", async () => {
    const entries = await fs.readdir(FIXTURES_DIR, { withFileTypes: true });
    const dirs = entries.filter((e) => e.isDirectory());
    expect(dirs.length).toBe(3);
  });

  // TC-027: test-skill/ に agents/ と references/ サブディレクトリが存在する
  it("TC-027: test-skill should have agents/ and references/ subdirectories", async () => {
    const entries = await fs.readdir(fixturePath("test-skill"), {
      withFileTypes: true,
    });
    const dirNames = entries.filter((e) => e.isDirectory()).map((e) => e.name);
    expect(dirNames).toContain("agents");
    expect(dirNames).toContain("references");
  });

  // TC-028: another-skill/ にサブディレクトリが存在しない
  it("TC-028: another-skill should have no subdirectories", async () => {
    const entries = await fs.readdir(fixturePath("another-skill"), {
      withFileTypes: true,
    });
    const dirs = entries.filter((e) => e.isDirectory());
    expect(dirs.length).toBe(0);
  });

  // TC-029: invalid-skill/ に SKILL.md が存在しない
  it("TC-029: invalid-skill should not contain SKILL.md", async () => {
    const entries = await fs.readdir(fixturePath("invalid-skill"));
    expect(entries).not.toContain("SKILL.md");
  });
});

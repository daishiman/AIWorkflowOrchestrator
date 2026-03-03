/**
 * SkillFileManager.getFileTree - Unit Tests (UT-UI-05A-GETFILETREE-001 Phase 4)
 *
 * 5 test cases:
 * - FT-03: ネストされたディレクトリ構造のツリー化
 * - FT-04: バックアップファイルのフィルタリング
 * - FT-05: ファイル/ディレクトリのソート順
 * - FT-13: スキル未発見時の SkillNotFoundError
 * - 空ディレクトリで空配列を返す
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { SkillFileManager } from "../SkillFileManager";
import { SkillNotFoundError } from "../errors";

describe("SkillFileManager.getFileTree", () => {
  let tmpDir: string;
  let aiworkflowSkillsDir: string;
  let claudeSkillsDir: string;
  let manager: SkillFileManager;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "sfm-getfiletree-"));
    aiworkflowSkillsDir = path.join(tmpDir, ".aiworkflow", "skills");
    claudeSkillsDir = path.join(tmpDir, ".claude", "skills");
    await fs.mkdir(aiworkflowSkillsDir, { recursive: true });
    await fs.mkdir(claudeSkillsDir, { recursive: true });
    manager = new SkillFileManager({
      aiworkflowSkillsDir,
      claudeSkillsDir,
    });
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  // FT-03
  it("ネストされたディレクトリ構造を正しくツリー化する", async () => {
    const skillDir = path.join(aiworkflowSkillsDir, "test-skill");
    await fs.mkdir(skillDir, { recursive: true });
    await fs.writeFile(path.join(skillDir, "SKILL.md"), "# Test");
    await fs.mkdir(path.join(skillDir, "references"), { recursive: true });
    await fs.writeFile(
      path.join(skillDir, "references", "guide.md"),
      "guide content",
    );

    const tree = await manager.getFileTree("test-skill");

    // ディレクトリが先、ファイルが後
    expect(tree).toHaveLength(2);
    const dirNode = tree.find((n) => n.type === "directory");
    const fileNode = tree.find((n) => n.type === "file");
    expect(dirNode).toBeDefined();
    expect(dirNode!.name).toBe("references");
    expect(dirNode!.path).toBe("references");
    expect(dirNode!.children).toHaveLength(1);
    expect(dirNode!.children![0].name).toBe("guide.md");
    expect(dirNode!.children![0].path).toBe("references/guide.md");
    expect(dirNode!.children![0].type).toBe("file");
    expect(fileNode).toBeDefined();
    expect(fileNode!.name).toBe("SKILL.md");
    expect(fileNode!.path).toBe("SKILL.md");
  });

  // FT-04
  it("バックアップファイルをツリーから除外する", async () => {
    const skillDir = path.join(aiworkflowSkillsDir, "test-skill");
    await fs.mkdir(skillDir, { recursive: true });
    await fs.writeFile(path.join(skillDir, "SKILL.md"), "# Test");
    await fs.writeFile(
      path.join(skillDir, "SKILL.md.backup.1700000000000"),
      "backup",
    );
    await fs.writeFile(
      path.join(skillDir, "old.md.deleted.1700000000000"),
      "deleted",
    );

    const tree = await manager.getFileTree("test-skill");

    expect(tree).toHaveLength(1);
    expect(tree[0].name).toBe("SKILL.md");
    // バックアップと削除ファイルが含まれないことを確認
    const allNames = tree.map((n) => n.name);
    expect(allNames).not.toContain("SKILL.md.backup.1700000000000");
    expect(allNames).not.toContain("old.md.deleted.1700000000000");
  });

  // FT-05
  it("ファイルとディレクトリが名前順でソートされる", async () => {
    const skillDir = path.join(aiworkflowSkillsDir, "test-skill");
    await fs.mkdir(skillDir, { recursive: true });
    await fs.writeFile(path.join(skillDir, "zebra.md"), "z");
    await fs.writeFile(path.join(skillDir, "alpha.md"), "a");
    await fs.mkdir(path.join(skillDir, "beta"), { recursive: true });
    await fs.writeFile(path.join(skillDir, "beta", "inner.md"), "inner");
    await fs.mkdir(path.join(skillDir, "alpha-dir"), { recursive: true });
    await fs.writeFile(path.join(skillDir, "alpha-dir", "file.md"), "content");

    const tree = await manager.getFileTree("test-skill");

    // ディレクトリが先、名前順ソート
    const names = tree.map((n) => n.name);
    expect(names).toEqual(["alpha-dir", "beta", "alpha.md", "zebra.md"]);
    // ディレクトリ内も名前順ソート
    const betaNode = tree.find((n) => n.name === "beta");
    expect(betaNode!.children![0].name).toBe("inner.md");
  });

  // FT-13
  it("スキルが見つからない場合 SkillNotFoundError をスローする", async () => {
    await expect(manager.getFileTree("nonexistent")).rejects.toThrow(
      SkillNotFoundError,
    );
    await expect(manager.getFileTree("nonexistent")).rejects.toThrow(
      "Skill not found: nonexistent",
    );
  });

  // 空ディレクトリテスト
  it("空ディレクトリで空配列を返す", async () => {
    const skillDir = path.join(aiworkflowSkillsDir, "empty-skill");
    await fs.mkdir(skillDir, { recursive: true });

    const tree = await manager.getFileTree("empty-skill");

    expect(tree).toEqual([]);
  });
});

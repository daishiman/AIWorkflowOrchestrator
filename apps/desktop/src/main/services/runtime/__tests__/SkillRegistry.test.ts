/**
 * SkillRegistry テスト
 * TASK-SDK-SC-04: Skill Output Integration
 *
 * SkillRegistry の register/unregister/registerFromPath をカバー
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { SkillRegistry } from "../SkillRegistry";

// ── fs モック ──────────────────────────────────────────────
vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
}));

import * as fs from "node:fs/promises";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("SkillRegistry", () => {
  describe("register / unregister / get / getAll", () => {
    it("register でエントリを追加し get で取得できる", () => {
      const registry = new SkillRegistry();
      registry.register({
        name: "my-skill",
        path: "/project/.claude/skills/my-skill/SKILL.md",
        content: "name: my-skill",
      });
      const entry = registry.get("my-skill");
      expect(entry).toBeDefined();
      expect(entry?.name).toBe("my-skill");
    });

    it("unregister でエントリを削除できる", () => {
      const registry = new SkillRegistry();
      registry.register({
        name: "my-skill",
        path: "/project/.claude/skills/my-skill/SKILL.md",
        content: "name: my-skill",
      });
      registry.unregister("my-skill");
      expect(registry.get("my-skill")).toBeUndefined();
    });

    it("getAll で全エントリを返す", () => {
      const registry = new SkillRegistry();
      registry.register({ name: "skill-a", path: "/a/SKILL.md", content: "" });
      registry.register({ name: "skill-b", path: "/b/SKILL.md", content: "" });
      expect(registry.getAll()).toHaveLength(2);
    });

    it("register 同名スキルは上書きされる", () => {
      const registry = new SkillRegistry();
      registry.register({
        name: "skill-a",
        path: "/a/SKILL.md",
        content: "v1",
      });
      registry.register({
        name: "skill-a",
        path: "/a/SKILL.md",
        content: "v2",
      });
      expect(registry.getAll()).toHaveLength(1);
      expect(registry.get("skill-a")?.content).toBe("v2");
    });
  });

  describe("registerFromPath", () => {
    it("SKILL.md を読み込んでスキルを登録する", async () => {
      vi.spyOn(fs, "readFile").mockResolvedValue(
        "name: loaded-skill\ndescription: テスト" as unknown as Buffer,
      );

      const registry = new SkillRegistry();
      await registry.registerFromPath(
        "/project/.claude/skills/loaded-skill/SKILL.md",
      );

      const entry = registry.get("loaded-skill");
      expect(entry).toBeDefined();
      expect(entry?.name).toBe("loaded-skill");
      expect(entry?.path).toBe("/project/.claude/skills/loaded-skill/SKILL.md");
    });

    it("同名スキルが存在する場合は上書き登録する", async () => {
      vi.spyOn(fs, "readFile").mockResolvedValue(
        "name: my-skill\ndescription: 更新版" as unknown as Buffer,
      );

      const registry = new SkillRegistry();
      registry.register({
        name: "my-skill",
        path: "/old/SKILL.md",
        content: "old content",
      });

      await registry.registerFromPath("/new/SKILL.md");

      const entries = registry.getAll();
      expect(entries).toHaveLength(1);
      expect(entries[0].path).toBe("/new/SKILL.md");
    });

    it("name: フィールドが存在しない場合は Error をスローする", async () => {
      vi.spyOn(fs, "readFile").mockResolvedValue(
        "description: nameなし" as unknown as Buffer,
      );

      const registry = new SkillRegistry();
      await expect(
        registry.registerFromPath("/project/.claude/skills/broken/SKILL.md"),
      ).rejects.toThrow("name フィールドが見つかりません");
    });
  });
});

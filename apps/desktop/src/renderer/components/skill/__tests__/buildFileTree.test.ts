import { describe, expect, it } from "vitest";
import type { ImportedSkill } from "@repo/shared";
import { buildFileTree } from "../SkillEditor";

const createSkill = (): ImportedSkill => ({
  name: "test-skill",
  description: "test",
  path: "/Users/test/.aiworkflow/skills/test-skill",
  updatedAt: new Date("2026-02-26T00:00:00Z"),
  importedAt: new Date("2026-02-26T00:00:00Z"),
  status: "active",
  agents: [
    {
      filename: "main.md",
      relativePath: "agents/main.md",
      size: 120,
    },
  ],
  references: [
    {
      filename: "guide.md",
      relativePath: "references/guide.md",
      size: 90,
    },
  ],
  scripts: [],
  assets: [],
  schemas: [],
  indexes: [],
  otherFiles: [{ filename: "LOGS.md", type: "logs", size: 20 }],
});

describe("buildFileTree", () => {
  it("カテゴリ別にファイルツリーを構築する", () => {
    const tree = buildFileTree(createSkill());
    const root = tree.find((category) => category.key === "root");
    const agents = tree.find((category) => category.key === "agents");
    const references = tree.find((category) => category.key === "references");
    const other = tree.find((category) => category.key === "other");

    expect(root?.files.map((file) => file.relativePath)).toEqual(["SKILL.md"]);
    expect(agents?.files.map((file) => file.relativePath)).toEqual([
      "agents/main.md",
    ]);
    expect(references?.files.map((file) => file.relativePath)).toEqual([
      "references/guide.md",
    ]);
    expect(other?.files.map((file) => file.relativePath)).toEqual(["LOGS.md"]);
  });

  it("空カテゴリを含めない", () => {
    const tree = buildFileTree(createSkill());
    expect(tree.some((category) => category.key === "assets")).toBe(false);
    expect(tree.some((category) => category.key === "scripts")).toBe(false);
  });
});

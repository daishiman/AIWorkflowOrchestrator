import { describe, expect, it } from "vitest";
import {
  toSkillId,
  toSkillName,
  type Skill,
  type SkillId,
  type SkillName,
} from "../skill";

describe("Skill識別子 Branded Type", () => {
  it("toSkillId/toSkillName は値を保持して変換できる", () => {
    const id = toSkillId("skill-id-001");
    const name = toSkillName("task-specification-creator");

    expect(id).toBe("skill-id-001");
    expect(name).toBe("task-specification-creator");
  });

  it("Skill.id と Skill.name は型レベルで区別される", () => {
    const skill = {
      id: toSkillId("skill-id-001"),
      name: toSkillName("task-specification-creator"),
    } as Pick<Skill, "id" | "name">;

    const skillId: SkillId = skill.id;
    const skillName: SkillName = skill.name;

    expect(skillId).toBe("skill-id-001");
    expect(skillName).toBe("task-specification-creator");

    // @ts-expect-error SkillId は SkillName に代入不可
    const invalidName: SkillName = skillId;
    // @ts-expect-error SkillName は SkillId に代入不可
    const invalidId: SkillId = skillName;

    expect(invalidName).toBeDefined();
    expect(invalidId).toBeDefined();
  });
});

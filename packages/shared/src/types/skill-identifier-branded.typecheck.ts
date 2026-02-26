import type { SkillId, SkillName } from "./skill";

const skillId = "skill-id-001" as SkillId;
const skillName = "task-specification-creator" as SkillName;

// @ts-expect-error SkillId は SkillName に代入不可
const invalidName: SkillName = skillId;
// @ts-expect-error SkillName は SkillId に代入不可
const invalidId: SkillId = skillName;

void invalidName;
void invalidId;

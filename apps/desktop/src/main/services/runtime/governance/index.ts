/**
 * Governance module index
 * TASK-P0-09: claude-sdk-permission-hooks-governance
 */

export {
  getPolicy,
  canUseTool,
  getAllPolicies,
} from "./SkillCreatorPermissionPolicy";
export type { CanUseToolContext } from "./SkillCreatorPermissionPolicy";

export { SkillCreatorAuditSink } from "./SkillCreatorAuditSink";

export { createHooks } from "./SkillCreatorHooksFactory";
export type { SkillCreatorHooks } from "./SkillCreatorHooksFactory";

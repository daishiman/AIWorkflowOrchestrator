/**
 * Claude CLI Integration Module
 * Phase 4: TDD Red - Stub exports
 *
 * @see docs/30-workflows/claude-code-cli-integration/outputs/phase-2/architecture-design.md
 */

export { ProcessManager } from "./ProcessManager";
export { SessionManager } from "./SessionManager";
export { SkillScanner } from "./SkillScanner";
export { ClaudeCliManager } from "./ClaudeCliManager";
export {
  registerClaudeCliHandlers,
  unregisterClaudeCliHandlers,
} from "./ipc-handler";

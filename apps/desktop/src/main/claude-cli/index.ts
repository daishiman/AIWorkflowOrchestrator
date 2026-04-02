/**
 * Claude CLI Integration Module
 *
 * @see docs/30-workflows/claude-code-cli-integration/outputs/phase-2/architecture-design.md
 */

export { ProcessManager } from "./ProcessManager";
export { SessionManager } from "./SessionManager";
export { SkillScanner } from "./SkillScanner";
export { ClaudeCliManager } from "./ClaudeCliManager";
export { getClaudeCliManager } from "./ipc-handler";
export {
  registerClaudeCliHandlers,
  unregisterClaudeCliHandlers,
} from "./ipc-handler";

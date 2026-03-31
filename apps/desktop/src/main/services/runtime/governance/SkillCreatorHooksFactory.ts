/**
 * SkillCreatorHooksFactory - Phase 別 Hooks 生成
 *
 * TASK-P0-09: claude-sdk-permission-hooks-governance
 *
 * SessionStart / PreToolUse / PostToolUse / SessionEnd の
 * hooks handler を生成する。
 * hooks は監査専用であり、主処理を固定化しない。
 */

import type {
  SkillCreatorGovernancePhase,
  SkillCreatorToolDecision,
  SkillCreatorWorkflowSourceProvenance,
} from "@repo/shared/types";
import { canUseTool } from "./SkillCreatorPermissionPolicy";
import type { SkillCreatorAuditSink } from "./SkillCreatorAuditSink";

/**
 * Hooks handler の型定義。
 * Claude Code SDK の hooks 契約に合わせた callback 構造。
 */
export interface SkillCreatorHooks {
  onSessionStart: (params: {
    sessionId: string;
    provenance?: SkillCreatorWorkflowSourceProvenance;
  }) => void;

  onPreToolUse: (params: {
    sessionId: string;
    toolName: string;
  }) => SkillCreatorToolDecision;

  onPostToolUse: (params: {
    sessionId: string;
    toolName: string;
    success: boolean;
    error?: string;
  }) => void;

  onSessionEnd: (params: { sessionId: string; summary?: string }) => void;
}

/**
 * 指定 phase と audit sink に基づく hooks を生成する。
 *
 * @param phase - 現在の governance phase
 * @param auditSink - 監査イベント記録先
 * @param provenance - skill-creator の resource provenance
 * @returns SkillCreatorHooks
 */
export function createHooks(
  phase: SkillCreatorGovernancePhase,
  auditSink: SkillCreatorAuditSink,
  provenance?: SkillCreatorWorkflowSourceProvenance,
): SkillCreatorHooks {
  return {
    onSessionStart({ sessionId, provenance: sessionProvenance }) {
      auditSink.recordEvent({
        eventType: "session_start",
        sessionId,
        phase,
        provenance: sessionProvenance ?? provenance,
        metadata: { hookPhase: phase },
      });
    },

    onPreToolUse({ sessionId, toolName }) {
      const decision = canUseTool(toolName, phase);

      auditSink.recordEvent({
        eventType: "pre_tool_use",
        sessionId,
        phase,
        toolName,
        decision,
      });

      return decision;
    },

    onPostToolUse({ sessionId, toolName, success, error }) {
      auditSink.recordEvent({
        eventType: "post_tool_use",
        sessionId,
        phase,
        toolName,
        metadata: { success, error },
      });
    },

    onSessionEnd({ sessionId, summary }) {
      auditSink.recordEvent({
        eventType: "session_end",
        sessionId,
        phase,
        metadata: { summary },
      });
    },
  };
}

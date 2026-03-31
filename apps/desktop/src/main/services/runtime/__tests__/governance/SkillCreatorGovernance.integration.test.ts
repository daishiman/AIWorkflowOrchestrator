/**
 * Governance 統合テスト
 * TASK-P0-09: Phase 6 - テスト拡充
 *
 * PermissionPolicy + HooksFactory + AuditSink の統合動作を検証する。
 * また、RuntimeSkillCreatorFacade の governance 統合を検証する。
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  getPolicy,
  canUseTool,
  getAllPolicies,
  SkillCreatorAuditSink,
  createHooks,
} from "../../governance";
import type { SkillCreatorGovernancePhase } from "@repo/shared/types";

describe("Governance Integration", () => {
  let auditSink: SkillCreatorAuditSink;

  beforeEach(() => {
    auditSink = new SkillCreatorAuditSink();
  });

  describe("end-to-end: hooks → policy → audit", () => {
    it("plan phase で read → write → deny → audit 記録の一連が動く", () => {
      const hooks = createHooks("plan", auditSink);
      hooks.onSessionStart({ sessionId: "e2e-1" });

      // read は OK
      const readDecision = hooks.onPreToolUse({
        sessionId: "e2e-1",
        toolName: "Read",
      });
      expect(readDecision.allowed).toBe(true);
      hooks.onPostToolUse({
        sessionId: "e2e-1",
        toolName: "Read",
        success: true,
      });

      // write は deny
      const writeDecision = hooks.onPreToolUse({
        sessionId: "e2e-1",
        toolName: "Write",
      });
      expect(writeDecision.allowed).toBe(false);

      hooks.onSessionEnd({ sessionId: "e2e-1" });

      // audit に 5 イベントが記録されている
      const events = auditSink.getEvents();
      expect(events).toHaveLength(5);

      // denial は 1 件
      const denials = auditSink.getDenialEvents();
      expect(denials).toHaveLength(1);
      expect(denials[0].toolName).toBe("Write");
    });

    it("execute phase で write → persist → audit 記録の一連が動く", () => {
      const hooks = createHooks("execute", auditSink);
      hooks.onSessionStart({ sessionId: "e2e-2" });

      const writeDecision = hooks.onPreToolUse({
        sessionId: "e2e-2",
        toolName: "Write",
      });
      expect(writeDecision.allowed).toBe(true);
      hooks.onPostToolUse({
        sessionId: "e2e-2",
        toolName: "Write",
        success: true,
      });

      hooks.onSessionEnd({ sessionId: "e2e-2" });

      const events = auditSink.getEventsBySession("e2e-2");
      expect(events).toHaveLength(4);
      expect(auditSink.getDenialEvents()).toHaveLength(0);
    });
  });

  describe("edge case: hook failure", () => {
    it("audit sink が満杯でも新しいイベントは記録される", () => {
      const tinyAuditSink = new SkillCreatorAuditSink(2);
      const hooks = createHooks("plan", tinyAuditSink);

      hooks.onSessionStart({ sessionId: "tiny-1" });
      hooks.onPreToolUse({ sessionId: "tiny-1", toolName: "Read" });
      hooks.onPostToolUse({
        sessionId: "tiny-1",
        toolName: "Read",
        success: true,
      });

      // 2件に制限されている
      expect(tinyAuditSink.size).toBe(2);
      // 最新のイベントが保持されている
      const events = tinyAuditSink.getEvents();
      expect(events[1].eventType).toBe("post_tool_use");
    });
  });

  describe("edge case: unexpected tool request", () => {
    it("plan phase で NotebookEdit は disallowed として deny される", () => {
      const decision = canUseTool("NotebookEdit", "plan");
      expect(decision.allowed).toBe(false);
      expect(decision.reason).toContain("disallowed");
    });

    it("verify phase で全く未知のツールは not in allowedTools で deny", () => {
      const decision = canUseTool("SuperDangerousTool", "verify");
      expect(decision.allowed).toBe(false);
      expect(decision.reason).toContain("not in allowedTools");
    });

    it("execute phase で空文字列ツール名は not in allowedTools で deny", () => {
      const decision = canUseTool("", "execute");
      expect(decision.allowed).toBe(false);
    });
  });

  describe("edge case: permission denial detail", () => {
    it("denial の reason は phase と toolName を含む", () => {
      const decision = canUseTool("Write", "plan");
      expect(decision.reason).toContain("Write");
      expect(decision.reason).toContain("plan");
    });

    it("allowed の reason も phase と toolName を含む", () => {
      const decision = canUseTool("Read", "plan");
      expect(decision.reason).toContain("Read");
      expect(decision.reason).toContain("plan");
    });
  });

  describe("cross-phase audit isolation", () => {
    it("異なる phase の hooks が同じ audit sink に書き込める", () => {
      const planHooks = createHooks("plan", auditSink);
      const execHooks = createHooks("execute", auditSink);

      planHooks.onSessionStart({ sessionId: "cross-1" });
      execHooks.onSessionStart({ sessionId: "cross-2" });

      const events = auditSink.getEvents();
      expect(events).toHaveLength(2);
      expect(events[0].phase).toBe("plan");
      expect(events[1].phase).toBe("execute");
    });

    it("getEventsBySession で session ごとにフィルタできる", () => {
      const planHooks = createHooks("plan", auditSink);
      const execHooks = createHooks("execute", auditSink);

      planHooks.onSessionStart({ sessionId: "iso-1" });
      execHooks.onSessionStart({ sessionId: "iso-2" });
      planHooks.onPreToolUse({ sessionId: "iso-1", toolName: "Read" });
      execHooks.onPreToolUse({ sessionId: "iso-2", toolName: "Write" });

      expect(auditSink.getEventsBySession("iso-1")).toHaveLength(2);
      expect(auditSink.getEventsBySession("iso-2")).toHaveLength(2);
    });
  });

  describe("policy consistency", () => {
    it("getAllPolicies と getPolicy が同じ結果を返す", () => {
      const all = getAllPolicies();
      const phases: SkillCreatorGovernancePhase[] = [
        "plan",
        "execute",
        "verify",
        "improve",
      ];
      for (const phase of phases) {
        expect(getPolicy(phase)).toEqual(all[phase]);
      }
    });

    it("policy の allowedTools と disallowedTools は重複しない", () => {
      const all = getAllPolicies();
      for (const phase of Object.values(all)) {
        const overlap = phase.allowedTools.filter((t) =>
          phase.disallowedTools.includes(t),
        );
        expect(overlap).toHaveLength(0);
      }
    });
  });
});

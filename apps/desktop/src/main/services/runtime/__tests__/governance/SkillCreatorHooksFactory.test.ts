/**
 * SkillCreatorHooksFactory テスト
 * TASK-P0-09: Phase 4 - テスト作成
 */
import { describe, it, expect, beforeEach } from "vitest";
import { createHooks } from "../../governance/SkillCreatorHooksFactory";
import { SkillCreatorAuditSink } from "../../governance/SkillCreatorAuditSink";
import type { SkillCreatorWorkflowSourceProvenance } from "@repo/shared/types";

describe("SkillCreatorHooksFactory", () => {
  let auditSink: SkillCreatorAuditSink;
  const testProvenance: SkillCreatorWorkflowSourceProvenance = {
    resolvedSkillCreatorRoot: "/test/skill-creator",
    manifestPath: "/test/manifest.json",
    resourceDescriptorHash: "abc123",
    manifestCacheKey: "cache-key-1",
  };

  beforeEach(() => {
    auditSink = new SkillCreatorAuditSink();
  });

  describe("createHooks", () => {
    it("4 つの hook handler を持つオブジェクトを返す", () => {
      const hooks = createHooks("plan", auditSink);
      expect(hooks.onSessionStart).toBeTypeOf("function");
      expect(hooks.onPreToolUse).toBeTypeOf("function");
      expect(hooks.onPostToolUse).toBeTypeOf("function");
      expect(hooks.onSessionEnd).toBeTypeOf("function");
    });
  });

  describe("onSessionStart", () => {
    it("session_start イベントを audit に記録する", () => {
      const hooks = createHooks("plan", auditSink, testProvenance);
      hooks.onSessionStart({ sessionId: "s1" });
      const events = auditSink.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe("session_start");
      expect(events[0].sessionId).toBe("s1");
      expect(events[0].phase).toBe("plan");
    });

    it("provenance が audit event に含まれる", () => {
      const hooks = createHooks("plan", auditSink, testProvenance);
      hooks.onSessionStart({ sessionId: "s1" });
      const events = auditSink.getEvents();
      expect(events[0].provenance?.resolvedSkillCreatorRoot).toBe(
        "/test/skill-creator",
      );
    });

    it("session 固有の provenance がファクトリ provenance を上書きする", () => {
      const hooks = createHooks("plan", auditSink, testProvenance);
      const sessionProvenance: SkillCreatorWorkflowSourceProvenance = {
        resolvedSkillCreatorRoot: "/session/specific",
      };
      hooks.onSessionStart({
        sessionId: "s1",
        provenance: sessionProvenance,
      });
      const events = auditSink.getEvents();
      expect(events[0].provenance?.resolvedSkillCreatorRoot).toBe(
        "/session/specific",
      );
    });
  });

  describe("onPreToolUse", () => {
    it("plan phase で Read は allowed を返す", () => {
      const hooks = createHooks("plan", auditSink);
      const decision = hooks.onPreToolUse({
        sessionId: "s1",
        toolName: "Read",
      });
      expect(decision.allowed).toBe(true);
      expect(decision.phase).toBe("plan");
    });

    it("plan phase で Write は denied を返す", () => {
      const hooks = createHooks("plan", auditSink);
      const decision = hooks.onPreToolUse({
        sessionId: "s1",
        toolName: "Write",
      });
      expect(decision.allowed).toBe(false);
    });

    it("execute phase で Write は allowed を返す", () => {
      const hooks = createHooks("execute", auditSink);
      const decision = hooks.onPreToolUse({
        sessionId: "s1",
        toolName: "Write",
      });
      expect(decision.allowed).toBe(true);
    });

    it("pre_tool_use イベントが audit に記録される", () => {
      const hooks = createHooks("plan", auditSink);
      hooks.onPreToolUse({ sessionId: "s1", toolName: "Read" });
      const events = auditSink.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe("pre_tool_use");
      expect(events[0].toolName).toBe("Read");
    });

    it("denied の場合も audit に記録される", () => {
      const hooks = createHooks("plan", auditSink);
      hooks.onPreToolUse({ sessionId: "s1", toolName: "Write" });
      const denials = auditSink.getDenialEvents();
      expect(denials).toHaveLength(1);
      expect(denials[0].decision?.allowed).toBe(false);
    });
  });

  describe("onPostToolUse", () => {
    it("post_tool_use イベントを audit に記録する", () => {
      const hooks = createHooks("execute", auditSink);
      hooks.onPostToolUse({
        sessionId: "s1",
        toolName: "Write",
        success: true,
      });
      const events = auditSink.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe("post_tool_use");
      expect(events[0].metadata).toEqual({ success: true, error: undefined });
    });

    it("エラー情報を metadata に含める", () => {
      const hooks = createHooks("execute", auditSink);
      hooks.onPostToolUse({
        sessionId: "s1",
        toolName: "Write",
        success: false,
        error: "Permission denied",
      });
      const events = auditSink.getEvents();
      expect(events[0].metadata).toEqual({
        success: false,
        error: "Permission denied",
      });
    });
  });

  describe("onSessionEnd", () => {
    it("session_end イベントを audit に記録する", () => {
      const hooks = createHooks("plan", auditSink);
      hooks.onSessionEnd({ sessionId: "s1", summary: "Plan completed" });
      const events = auditSink.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe("session_end");
      expect(events[0].metadata).toEqual({ summary: "Plan completed" });
    });
  });

  describe("hook 呼び出し順", () => {
    it("SessionStart → PreToolUse → PostToolUse → SessionEnd の順で記録される", () => {
      const hooks = createHooks("execute", auditSink);

      hooks.onSessionStart({ sessionId: "s1" });
      hooks.onPreToolUse({ sessionId: "s1", toolName: "Write" });
      hooks.onPostToolUse({
        sessionId: "s1",
        toolName: "Write",
        success: true,
      });
      hooks.onSessionEnd({ sessionId: "s1" });

      const events = auditSink.getEvents();
      expect(events).toHaveLength(4);
      expect(events.map((e) => e.eventType)).toEqual([
        "session_start",
        "pre_tool_use",
        "post_tool_use",
        "session_end",
      ]);
    });

    it("複数ツール使用でも順序が保たれる", () => {
      const hooks = createHooks("execute", auditSink);

      hooks.onSessionStart({ sessionId: "s1" });
      hooks.onPreToolUse({ sessionId: "s1", toolName: "Read" });
      hooks.onPostToolUse({
        sessionId: "s1",
        toolName: "Read",
        success: true,
      });
      hooks.onPreToolUse({ sessionId: "s1", toolName: "Write" });
      hooks.onPostToolUse({
        sessionId: "s1",
        toolName: "Write",
        success: true,
      });
      hooks.onSessionEnd({ sessionId: "s1" });

      const events = auditSink.getEvents();
      expect(events).toHaveLength(6);
      expect(events.map((e) => e.eventType)).toEqual([
        "session_start",
        "pre_tool_use",
        "post_tool_use",
        "pre_tool_use",
        "post_tool_use",
        "session_end",
      ]);
    });
  });

  describe("phase 別 hooks の挙動", () => {
    it("verify phase hooks で Write は denied", () => {
      const hooks = createHooks("verify", auditSink);
      const decision = hooks.onPreToolUse({
        sessionId: "s1",
        toolName: "Write",
      });
      expect(decision.allowed).toBe(false);
    });

    it("improve phase hooks で Edit は allowed, Write は denied", () => {
      const hooks = createHooks("improve", auditSink);
      const editDecision = hooks.onPreToolUse({
        sessionId: "s1",
        toolName: "Edit",
      });
      const writeDecision = hooks.onPreToolUse({
        sessionId: "s1",
        toolName: "Write",
      });
      expect(editDecision.allowed).toBe(true);
      expect(writeDecision.allowed).toBe(false);
    });
  });
});

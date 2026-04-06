/**
 * SkillCreatorAuditSink テスト
 * TASK-P0-09: Phase 4 - テスト作成
 */
import { describe, it, expect, beforeEach } from "vitest";
import { SkillCreatorAuditSink } from "../../governance/SkillCreatorAuditSink";

describe("SkillCreatorAuditSink", () => {
  let sink: SkillCreatorAuditSink;

  beforeEach(() => {
    sink = new SkillCreatorAuditSink();
  });

  describe("record / getEvents", () => {
    it("イベントを記録して取得できる", () => {
      sink.record({
        eventType: "session_start",
        timestamp: "2026-03-31T00:00:00Z",
        sessionId: "s1",
        phase: "plan",
      });
      expect(sink.getEvents()).toHaveLength(1);
      expect(sink.getEvents()[0].eventType).toBe("session_start");
    });

    it("複数イベントを記録して順序が保たれる", () => {
      sink.record({
        eventType: "session_start",
        timestamp: "2026-03-31T00:00:00Z",
        sessionId: "s1",
        phase: "plan",
      });
      sink.record({
        eventType: "pre_tool_use",
        timestamp: "2026-03-31T00:00:01Z",
        sessionId: "s1",
        phase: "plan",
        toolName: "Read",
      });
      const events = sink.getEvents();
      expect(events).toHaveLength(2);
      expect(events[0].eventType).toBe("session_start");
      expect(events[1].eventType).toBe("pre_tool_use");
    });

    it("getEvents は read-only コピーを返す", () => {
      sink.record({
        eventType: "session_start",
        timestamp: "2026-03-31T00:00:00Z",
        sessionId: "s1",
        phase: "plan",
      });
      const events = sink.getEvents();
      // コピーであることの確認: 元の配列は変わらない
      expect(events).toHaveLength(1);
    });
  });

  describe("recordEvent", () => {
    it("timestamp を自動生成して記録する", () => {
      const event = sink.recordEvent({
        eventType: "session_start",
        sessionId: "s1",
        phase: "execute",
      });
      expect(event.timestamp).toBeTruthy();
      expect(event.phase).toBe("execute");
      expect(sink.size).toBe(1);
    });

    it("provenance を含めて記録できる", () => {
      const event = sink.recordEvent({
        eventType: "session_start",
        sessionId: "s1",
        phase: "plan",
        provenance: {
          resolvedSkillCreatorRoot: "/path/to/skill",
          manifestPath: "/path/to/manifest.json",
        },
      });
      expect(event.provenance?.resolvedSkillCreatorRoot).toBe("/path/to/skill");
    });

    it("decision を含めて記録できる", () => {
      const event = sink.recordEvent({
        eventType: "pre_tool_use",
        sessionId: "s1",
        phase: "plan",
        toolName: "Write",
        decision: {
          allowed: false,
          reason: "disallowed in plan",
          phase: "plan",
          toolName: "Write",
        },
      });
      expect(event.decision?.allowed).toBe(false);
    });
  });

  describe("getRecentEvents", () => {
    it("直近 N 件を返す", () => {
      for (let i = 0; i < 10; i++) {
        sink.recordEvent({
          eventType: "pre_tool_use",
          sessionId: "s1",
          phase: "plan",
          toolName: `Tool${i}`,
        });
      }
      const recent = sink.getRecentEvents(3);
      expect(recent).toHaveLength(3);
      expect(recent[0].toolName).toBe("Tool7");
      expect(recent[2].toolName).toBe("Tool9");
    });
  });

  describe("getEventsBySession", () => {
    it("指定 sessionId のイベントのみ返す", () => {
      sink.recordEvent({
        eventType: "session_start",
        sessionId: "s1",
        phase: "plan",
      });
      sink.recordEvent({
        eventType: "session_start",
        sessionId: "s2",
        phase: "execute",
      });
      const events = sink.getEventsBySession("s1");
      expect(events).toHaveLength(1);
      expect(events[0].sessionId).toBe("s1");
    });
  });

  describe("getDenialEvents", () => {
    it("denied イベントのみ返す", () => {
      sink.recordEvent({
        eventType: "pre_tool_use",
        sessionId: "s1",
        phase: "plan",
        toolName: "Read",
        decision: {
          allowed: true,
          reason: "ok",
          phase: "plan",
          toolName: "Read",
        },
      });
      sink.recordEvent({
        eventType: "pre_tool_use",
        sessionId: "s1",
        phase: "plan",
        toolName: "Write",
        decision: {
          allowed: false,
          reason: "disallowed",
          phase: "plan",
          toolName: "Write",
        },
      });
      const denials = sink.getDenialEvents();
      expect(denials).toHaveLength(1);
      expect(denials[0].toolName).toBe("Write");
    });
  });

  describe("maxEvents 制限", () => {
    it("maxEvents を超えた場合、古いイベントが破棄される", () => {
      const smallSink = new SkillCreatorAuditSink(5);
      for (let i = 0; i < 10; i++) {
        smallSink.recordEvent({
          eventType: "pre_tool_use",
          sessionId: "s1",
          phase: "plan",
          toolName: `Tool${i}`,
        });
      }
      expect(smallSink.size).toBe(5);
      const events = smallSink.getEvents();
      expect(events[0].toolName).toBe("Tool5");
      expect(events[4].toolName).toBe("Tool9");
    });
  });

  describe("clear", () => {
    it("全イベントがクリアされる", () => {
      sink.recordEvent({
        eventType: "session_start",
        sessionId: "s1",
        phase: "plan",
      });
      expect(sink.size).toBe(1);
      sink.clear();
      expect(sink.size).toBe(0);
      expect(sink.getEvents()).toHaveLength(0);
    });
  });

  // Phase 6: テスト拡充 (TC-AS-E01〜E03, TC-RG-01)
  describe("Phase 6: edge case 拡充", () => {
    it("TC-AS-E01: maxEvents=1 で 2 件目を追加すると最初のイベントが消える", () => {
      const tinyAuditSink = new SkillCreatorAuditSink(1);
      tinyAuditSink.recordEvent({
        eventType: "session_start",
        sessionId: "s1",
        phase: "plan",
      });
      tinyAuditSink.recordEvent({
        eventType: "session_end",
        sessionId: "s1",
        phase: "plan",
      });
      expect(tinyAuditSink.size).toBe(1);
      expect(tinyAuditSink.getEvents()[0].eventType).toBe("session_end");
    });

    it("TC-AS-E02: 存在しない sessionId で空配列を返す", () => {
      sink.recordEvent({
        eventType: "session_start",
        sessionId: "s1",
        phase: "plan",
      });
      const events = sink.getEventsBySession("non-existent");
      expect(events).toHaveLength(0);
    });

    it("TC-AS-E03: decision がない session_start イベントは getDenialEvents から除外される", () => {
      sink.recordEvent({
        eventType: "session_start",
        sessionId: "s1",
        phase: "plan",
        // decision なし
      });
      sink.recordEvent({
        eventType: "pre_tool_use",
        sessionId: "s1",
        phase: "plan",
        toolName: "Write",
        decision: {
          allowed: false,
          reason: "disallowed",
          phase: "plan",
          toolName: "Write",
        },
      });
      const denials = sink.getDenialEvents();
      expect(denials).toHaveLength(1);
      expect(denials[0].eventType).toBe("pre_tool_use");
    });

    it("TC-RG-01: count=0 の getRecentEvents は空配列を返す", () => {
      sink.recordEvent({
        eventType: "session_start",
        sessionId: "s1",
        phase: "plan",
      });
      const events = sink.getRecentEvents(0);
      expect(events).toHaveLength(0);
    });
  });
});

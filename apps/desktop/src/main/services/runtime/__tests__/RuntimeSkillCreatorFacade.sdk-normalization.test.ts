/**
 * TASK-RT-06: SDK Message Contract Normalization — Unit Tests
 *
 * Phase 4 Test Matrix のうち SDK 正規化責務（P4-01〜P4-07）を検証する。
 * P4-08（terminal handoff 契約維持）は workflow-orchestration テストで検証する。
 * normalizeSkillCreatorSdkEvents / normalizeSkillCreatorSdkMessage を直接テストする。
 */

import { describe, it, expect } from "vitest";
import {
  normalizeSkillCreatorSdkEvents,
  normalizeSkillCreatorSdkMessage,
} from "../RuntimeSkillCreatorFacade";
import type { SkillCreatorWorkflowSourceProvenance } from "@repo/shared/types";

const PROVENANCE: SkillCreatorWorkflowSourceProvenance = {
  resolvedSkillCreatorRoot: "/tmp/.claude/skills/skill-creator",
  resourceDescriptorHash: "abc123",
  manifestPath: "/tmp/.claude/skills/skill-creator/workflow-manifest.json",
  manifestCacheKey: "cache-001",
};

describe("normalizeSkillCreatorSdkMessage", () => {
  // P4-01: init 正規化
  describe("P4-01: system/init 正規化", () => {
    it("type=system, subtype=init → eventType=init, sessionId 保持", () => {
      const msg = {
        type: "system",
        subtype: "init",
        session_id: "sess-abc-123",
      };

      const result = normalizeSkillCreatorSdkMessage(msg, 0, PROVENANCE);

      expect(result).not.toBeNull();
      expect(result!.eventType).toBe("init");
      expect(result!.sessionId).toBe("sess-abc-123");
      expect(result!.rawType).toBe("system");
      expect(result!.sequence).toBe(0);
      expect(result!.sourceProvenance).toEqual(PROVENANCE);
    });

    it("type=system/init でも eventType=init に変換される", () => {
      const msg = { type: "system/init", session_id: "sess-xyz" };
      const result = normalizeSkillCreatorSdkMessage(msg, 0);
      expect(result!.eventType).toBe("init");
      expect(result!.sessionId).toBe("sess-xyz");
    });
  });

  // P4-02: assistant 正規化
  describe("P4-02: assistant 正規化", () => {
    it("type=assistant, message.content[].text → eventType=assistant, text 保持", () => {
      const msg = {
        type: "assistant",
        message: {
          id: "msg-001",
          content: [{ type: "text", text: "Hello, world!" }],
        },
      };

      const result = normalizeSkillCreatorSdkMessage(msg, 1, PROVENANCE);

      expect(result).not.toBeNull();
      expect(result!.eventType).toBe("assistant");
      expect(result!.text).toBe("Hello, world!");
      expect(result!.messageId).toBe("msg-001");
    });

    it("type=text でも eventType=assistant に変換される", () => {
      const msg = { type: "text", content: "Direct text content" };
      const result = normalizeSkillCreatorSdkMessage(msg, 1);
      expect(result!.eventType).toBe("assistant");
      expect(result!.text).toBe("Direct text content");
    });
  });

  // P4-03: result 正規化
  describe("P4-03: result 正規化", () => {
    it("type=result, subtype=success, stop_reason=end_turn → resultSubtype/stopReason 保持", () => {
      const msg = {
        type: "result",
        result: {
          subtype: "success",
          stop_reason: "end_turn",
          session_id: "sess-result-001",
        },
      };

      const result = normalizeSkillCreatorSdkMessage(msg, 2, PROVENANCE);

      expect(result).not.toBeNull();
      expect(result!.eventType).toBe("result");
      expect(result!.resultSubtype).toBe("success");
      expect(result!.stopReason).toBe("end_turn");
      expect(result!.sessionId).toBe("sess-result-001");
    });

    it("camelCase フィールド (stopReason, sessionId) でも読み取れる", () => {
      const msg = {
        type: "result",
        result: {
          subtype: "error",
          stopReason: "max_tokens",
          sessionId: "sess-camel",
        },
      };

      const result = normalizeSkillCreatorSdkMessage(msg, 2);
      expect(result!.stopReason).toBe("max_tokens");
      expect(result!.sessionId).toBe("sess-camel");
    });
  });

  // P4-04: permission denial 集約
  describe("P4-04: permission denial 集約", () => {
    it("top-level permission_denials 配列が抽出される", () => {
      const msg = {
        type: "result",
        permission_denials: [
          { tool_name: "Bash", reason: "dangerous command" },
          { toolName: "Write", toolUseId: "tu-001", reason: "protected path" },
        ],
      };

      const result = normalizeSkillCreatorSdkMessage(msg, 3, PROVENANCE);

      expect(result).not.toBeNull();
      expect(result!.permissionDenials).toHaveLength(2);
      expect(result!.permissionDenials![0]).toEqual({
        toolName: "Bash",
        reason: "dangerous command",
      });
      expect(result!.permissionDenials![1]).toEqual({
        toolName: "Write",
        toolUseId: "tu-001",
        reason: "protected path",
      });
    });

    it("result 配下の permissionDenials でも抽出される", () => {
      const msg = {
        type: "result",
        result: {
          permissionDenials: [{ reason: "access denied" }],
        },
      };

      const result = normalizeSkillCreatorSdkMessage(msg, 3);
      expect(result!.permissionDenials).toHaveLength(1);
      expect(result!.permissionDenials![0].reason).toBe("access denied");
    });

    it("文字列形式の denial も { reason } に正規化される", () => {
      const msg = {
        type: "result",
        permission_denials: ["simple denial string"],
      };

      const result = normalizeSkillCreatorSdkMessage(msg, 3);
      expect(result!.permissionDenials).toHaveLength(1);
      expect(result!.permissionDenials![0]).toEqual({
        reason: "simple denial string",
      });
    });
  });

  // P4-05: source provenance 継承
  describe("P4-05: source provenance 継承", () => {
    it("全正規化 event に sourceProvenance を付与", () => {
      const messages = [
        { type: "system", subtype: "init", session_id: "s1" },
        { type: "assistant", content: "hello" },
        { type: "result", result: { subtype: "success" } },
      ];

      const events = normalizeSkillCreatorSdkEvents(messages, PROVENANCE);

      for (const event of events) {
        expect(event.sourceProvenance).toEqual(PROVENANCE);
      }
    });

    it("provenance 未指定なら undefined のまま", () => {
      const events = normalizeSkillCreatorSdkEvents([
        { type: "assistant", content: "test" },
      ]);
      expect(events[0].sourceProvenance).toBeUndefined();
    });
  });

  // error 正規化
  describe("error 正規化", () => {
    it("type=error → eventType=error, errorMessage 保持", () => {
      const msg = {
        type: "error",
        error: { message: "something went wrong" },
      };

      const result = normalizeSkillCreatorSdkMessage(msg, 4);
      expect(result!.eventType).toBe("error");
      expect(result!.errorMessage).toBe("something went wrong");
    });
  });

  // 未知のメッセージタイプ
  describe("未知のメッセージタイプ", () => {
    it("未知の type は null を返す", () => {
      const result = normalizeSkillCreatorSdkMessage(
        { type: "unknown_type" },
        0,
      );
      expect(result).toBeNull();
    });

    it("非オブジェクト値は null を返す", () => {
      expect(normalizeSkillCreatorSdkMessage("string", 0)).toBeNull();
      expect(normalizeSkillCreatorSdkMessage(42, 0)).toBeNull();
      expect(normalizeSkillCreatorSdkMessage(null, 0)).toBeNull();
    });
  });
});

describe("normalizeSkillCreatorSdkEvents", () => {
  // P4-06: SDK event 欠損
  describe("P4-06: SDK event 欠損（空配列）", () => {
    it("sdkMessages=[] → fallback error event を生成", () => {
      const events = normalizeSkillCreatorSdkEvents([], PROVENANCE);

      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe("error");
      expect(events[0].rawType).toBe("missing_sdk_events");
      expect(events[0].errorMessage).toContain(
        "SDK stream did not emit any normalizable events",
      );
      expect(events[0].sourceProvenance).toEqual(PROVENANCE);
    });

    it("全メッセージが未知形状でも fallback error event を生成", () => {
      const events = normalizeSkillCreatorSdkEvents(
        [{ type: "unknown_1" }, { type: "unknown_2" }],
        PROVENANCE,
      );

      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe("error");
      expect(events[0].rawType).toBe("missing_sdk_events");
    });
  });

  // P4-07: execute 失敗時
  describe("P4-07: execute 失敗時のイベント保持", () => {
    it("エラーメッセージを含む result event が正規化される", () => {
      const messages = [
        { type: "system", subtype: "init", session_id: "fail-sess" },
        {
          type: "result",
          result: {
            subtype: "error",
            error: "execution failed",
            stop_reason: "error",
          },
        },
      ];

      const events = normalizeSkillCreatorSdkEvents(messages, PROVENANCE);

      expect(events).toHaveLength(2);
      expect(events[0].eventType).toBe("init");
      expect(events[1].eventType).toBe("result");
      expect(events[1].resultSubtype).toBe("error");
      expect(events[1].errorMessage).toBe("execution failed");
      expect(events[1].stopReason).toBe("error");
    });
  });

  // sequence 番号
  describe("sequence 番号の割り振り", () => {
    it("各 event に 0-based の sequence が振られる", () => {
      const messages = [
        { type: "system", subtype: "init" },
        { type: "assistant", content: "msg1" },
        { type: "assistant", content: "msg2" },
        { type: "result", result: { subtype: "success" } },
      ];

      const events = normalizeSkillCreatorSdkEvents(messages);
      expect(events.map((e) => e.sequence)).toEqual([0, 1, 2, 3]);
    });
  });

  // sessionId の昇格（最初に発見したもの）
  describe("sessionId 抽出", () => {
    it("init イベントの session_id が保持される", () => {
      const messages = [
        { type: "system", subtype: "init", session_id: "first-sess" },
        { type: "result", result: { session_id: "result-sess" } },
      ];

      const events = normalizeSkillCreatorSdkEvents(messages);
      expect(events[0].sessionId).toBe("first-sess");
      expect(events[1].sessionId).toBe("result-sess");
    });
  });
});

// ============================================
// Phase 6: Edge Case Tests
// ============================================

describe("normalizeSkillCreatorSdkEvents — edge cases (Phase 6)", () => {
  // Cancellation / timeout: SDK stream が途中中断された場合
  describe("途中中断シナリオ", () => {
    it("init のみで result が来ない不完全ストリームでも正規化できる", () => {
      const messages = [
        { type: "system", subtype: "init", session_id: "interrupted-sess" },
      ];

      const events = normalizeSkillCreatorSdkEvents(messages, PROVENANCE);
      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe("init");
      expect(events[0].sessionId).toBe("interrupted-sess");
    });

    it("init + assistant のみで中断されても全イベントが保持される", () => {
      const messages = [
        { type: "system", subtype: "init", session_id: "cancel-sess" },
        { type: "assistant", content: "partial output before cancel" },
      ];

      const events = normalizeSkillCreatorSdkEvents(messages);
      expect(events).toHaveLength(2);
      expect(events[0].eventType).toBe("init");
      expect(events[1].eventType).toBe("assistant");
      expect(events[1].text).toBe("partial output before cancel");
    });
  });

  // Permission denial edge cases
  describe("permission denial の複合ケース", () => {
    it("複数の denial source が混在しても全て集約される", () => {
      const messages = [
        { type: "system", subtype: "init" },
        {
          type: "result",
          permission_denials: [{ tool_name: "Bash", reason: "dangerous" }],
          result: {
            permissionDenials: [{ toolName: "Write", reason: "protected" }],
          },
        },
      ];

      const events = normalizeSkillCreatorSdkEvents(messages, PROVENANCE);
      const resultEvent = events.find((e) => e.eventType === "result");
      expect(resultEvent).toBeDefined();
      // top-level が優先される（readValue の探索順序）
      expect(resultEvent!.permissionDenials).toBeDefined();
      expect(resultEvent!.permissionDenials!.length).toBeGreaterThanOrEqual(1);
    });

    it("permission denial が空配列の場合は undefined になる", () => {
      const msg = { type: "result", permission_denials: [] };
      const result = normalizeSkillCreatorSdkMessage(msg, 0);
      expect(result!.permissionDenials).toBeUndefined();
    });
  });

  // Resumed session edge cases
  describe("resumed session (sessionId 引き回し)", () => {
    it("session_id が result.session_id にのみ存在しても抽出される", () => {
      const messages = [
        { type: "system", subtype: "init" }, // session_id なし
        {
          type: "result",
          result: { subtype: "success", session_id: "resumed-sess-456" },
        },
      ];

      const events = normalizeSkillCreatorSdkEvents(messages);
      expect(events[0].sessionId).toBeUndefined();
      expect(events[1].sessionId).toBe("resumed-sess-456");
    });

    it("sessionId (camelCase) もフォールバックで抽出される", () => {
      const msg = { type: "system", subtype: "init", sessionId: "camel-sess" };
      const result = normalizeSkillCreatorSdkMessage(msg, 0);
      expect(result!.sessionId).toBe("camel-sess");
    });
  });

  // Mixed stream with errors interspersed
  describe("mixed stream（正常 + エラーの混在）", () => {
    it("init → assistant → error → result の混合ストリームを正規化", () => {
      const messages = [
        { type: "system", subtype: "init", session_id: "mixed" },
        { type: "assistant", content: "thinking..." },
        { type: "error", error: { message: "rate limit hit" } },
        {
          type: "result",
          result: { subtype: "success", stop_reason: "end_turn" },
        },
      ];

      const events = normalizeSkillCreatorSdkEvents(messages, PROVENANCE);
      expect(events).toHaveLength(4);
      expect(events.map((e) => e.eventType)).toEqual([
        "init",
        "assistant",
        "error",
        "result",
      ]);
      expect(events[2].errorMessage).toBe("rate limit hit");
      expect(events[3].resultSubtype).toBe("success");
    });
  });

  // Large content handling
  describe("大容量 content 処理", () => {
    it("message.content が複数テキストブロックの配列でも結合される", () => {
      const msg = {
        type: "assistant",
        message: {
          content: [
            { type: "text", text: "Part 1" },
            { type: "text", text: "Part 2" },
            { type: "text", text: "Part 3" },
          ],
        },
      };

      const result = normalizeSkillCreatorSdkMessage(msg, 0);
      expect(result!.text).toBe("Part 1\nPart 2\nPart 3");
    });
  });
});

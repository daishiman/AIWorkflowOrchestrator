/**
 * sdkMessageNormalizer テスト
 * TASK-RT-06: Claude Code SDK SDKMessage → SkillCreatorSdkEvent 正規化
 *
 * Phase 4 (TDD Red): 実装前にテストを定義し、normalizer の入出力契約を固定する。
 */
import { describe, it, expect } from "vitest";
import {
  normalizeSdkMessage,
  normalizeSdkStream,
  type NormalizerContext,
} from "../sdkMessageNormalizer";

// ── Fixtures ──────────────────────────────────────────

/** system/init メッセージ */
const SYSTEM_INIT_MSG = {
  type: "system",
  subtype: "init",
  session_id: "sess-abc-123",
};

/** assistant text メッセージ */
const ASSISTANT_TEXT_MSG = {
  type: "assistant",
  content: [{ type: "text", text: "Hello, I am working on your skill." }],
};

/** result メッセージ（success） */
const RESULT_SUCCESS_MSG = {
  type: "result",
  subtype: "success",
  session_id: "sess-abc-123",
  result: "Skill creation completed successfully.",
  cost_usd: 0.05,
  duration_ms: 12000,
  stop_reason: "end_turn",
};

/** result メッセージ（error subtype） */
const RESULT_ERROR_MSG = {
  type: "result",
  subtype: "error",
  session_id: "sess-abc-123",
  error: "Rate limit exceeded",
  stop_reason: "error",
};

/** permission denial メッセージ */
const PERMISSION_DENIAL_MSG = {
  type: "assistant",
  content: [
    {
      type: "tool_use",
      name: "Write",
      input: { path: "/etc/passwd" },
    },
  ],
  stop_reason: "tool_use",
  permission_denied: true,
  denied_tool: "Write",
  denied_reason: "File write access denied for /etc/passwd",
};

/** tool error メッセージ */
const TOOL_ERROR_MSG = {
  type: "assistant",
  content: [
    {
      type: "tool_result",
      tool_use_id: "tu-001",
      is_error: true,
      content: "Command failed with exit code 1",
    },
  ],
};

/** 不正/未知のメッセージ */
const UNKNOWN_MSG = {
  type: "unknown_type",
  data: "some data",
};

// ── Context ───────────────────────────────────────────

const BASE_CONTEXT: NormalizerContext = {
  sourceProvenance: {
    resolvedSkillCreatorRoot: ".claude/skills/skill-creator",
    resourceDescriptorHash: "abc123hash",
  },
};

// ── Tests ─────────────────────────────────────────────

describe("sdkMessageNormalizer", () => {
  describe("normalizeSdkMessage", () => {
    // ── Task 1: system/init 正規化テスト ──

    describe("system/init messages", () => {
      it("system/init を init イベントに正規化する", () => {
        const event = normalizeSdkMessage(SYSTEM_INIT_MSG, BASE_CONTEXT);

        expect(event.eventType).toBe("init");
        expect(event.sessionId).toBe("sess-abc-123");
        expect(event.sourceProvenance).toEqual({
          resolvedSkillCreatorRoot: ".claude/skills/skill-creator",
          resourceDescriptorHash: "abc123hash",
        });
      });

      it("system/init の sessionId が正規化結果に保持される", () => {
        const event = normalizeSdkMessage(SYSTEM_INIT_MSG, BASE_CONTEXT);
        expect(event.sessionId).toBe("sess-abc-123");
      });
    });

    // ── Task 2: assistant message 正規化テスト ──

    describe("assistant messages", () => {
      it("assistant text を assistant イベントに正規化する", () => {
        const event = normalizeSdkMessage(ASSISTANT_TEXT_MSG, BASE_CONTEXT);

        expect(event.eventType).toBe("assistant");
        expect(event.text).toBe("Hello, I am working on your skill.");
      });

      it("assistant text が空の場合も正規化される", () => {
        const emptyTextMsg = {
          type: "assistant",
          content: [{ type: "text", text: "" }],
        };
        const event = normalizeSdkMessage(emptyTextMsg, BASE_CONTEXT);

        expect(event.eventType).toBe("assistant");
        expect(event.text).toBe("");
      });

      it("content が空配列の場合は text が undefined", () => {
        const noContentMsg = {
          type: "assistant",
          content: [],
        };
        const event = normalizeSdkMessage(noContentMsg, BASE_CONTEXT);

        expect(event.eventType).toBe("assistant");
        expect(event.text).toBeUndefined();
      });
    });

    // ── Task 3: result subtype / permission denial 正規化テスト ──

    describe("result messages", () => {
      it("result success を result イベントに正規化する", () => {
        const event = normalizeSdkMessage(RESULT_SUCCESS_MSG, BASE_CONTEXT);

        expect(event.eventType).toBe("result");
        expect(event.resultSubtype).toBe("success");
        expect(event.sessionId).toBe("sess-abc-123");
        expect(event.stopReason).toBe("end_turn");
      });

      it("result error を result イベントに正規化する", () => {
        const event = normalizeSdkMessage(RESULT_ERROR_MSG, BASE_CONTEXT);

        expect(event.eventType).toBe("result");
        expect(event.resultSubtype).toBe("error");
        expect(event.text).toBe("Rate limit exceeded");
        expect(event.stopReason).toBe("error");
      });
    });

    describe("permission denial messages", () => {
      it("permission denial を permissionDenials に記録する", () => {
        const event = normalizeSdkMessage(PERMISSION_DENIAL_MSG, BASE_CONTEXT);

        expect(event.permissionDenials).toBeDefined();
        expect(event.permissionDenials).toHaveLength(1);
        expect(event.permissionDenials![0].toolName).toBe("Write");
      });
    });

    describe("error messages", () => {
      it("tool error を error イベントに正規化する", () => {
        const event = normalizeSdkMessage(TOOL_ERROR_MSG, BASE_CONTEXT);

        expect(event.eventType).toBe("error");
        expect(event.text).toContain("Command failed");
      });

      it("未知のメッセージタイプは error イベントとして正規化する", () => {
        const event = normalizeSdkMessage(UNKNOWN_MSG, BASE_CONTEXT);

        expect(event.eventType).toBe("error");
      });
    });

    // ── Task 4: session_id 欠損時のテスト ──

    describe("session_id missing", () => {
      it("system/init に session_id がない場合は sessionId が undefined", () => {
        const noSessionMsg = {
          type: "system",
          subtype: "init",
          // session_id 欠損
        };
        const event = normalizeSdkMessage(noSessionMsg, BASE_CONTEXT);

        expect(event.eventType).toBe("init");
        expect(event.sessionId).toBeUndefined();
      });

      it("result に session_id がない場合は sessionId が undefined", () => {
        const noSessionResult = {
          type: "result",
          subtype: "success",
          result: "done",
          stop_reason: "end_turn",
        };
        const event = normalizeSdkMessage(noSessionResult, BASE_CONTEXT);

        expect(event.eventType).toBe("result");
        expect(event.sessionId).toBeUndefined();
      });
    });

    // ── sourceProvenance 保持テスト ──

    describe("sourceProvenance", () => {
      it("context の sourceProvenance が全イベントに付与される", () => {
        const events = [
          normalizeSdkMessage(SYSTEM_INIT_MSG, BASE_CONTEXT),
          normalizeSdkMessage(ASSISTANT_TEXT_MSG, BASE_CONTEXT),
          normalizeSdkMessage(RESULT_SUCCESS_MSG, BASE_CONTEXT),
        ];

        for (const event of events) {
          expect(event.sourceProvenance).toEqual({
            resolvedSkillCreatorRoot: ".claude/skills/skill-creator",
            resourceDescriptorHash: "abc123hash",
          });
        }
      });

      it("sourceProvenance がない context でも正規化できる", () => {
        const event = normalizeSdkMessage(ASSISTANT_TEXT_MSG, {});
        expect(event.eventType).toBe("assistant");
        expect(event.sourceProvenance).toBeUndefined();
      });
    });

    // ── null / undefined 入力 ──

    describe("invalid inputs", () => {
      it("null 入力は error イベントに正規化される", () => {
        const event = normalizeSdkMessage(null, BASE_CONTEXT);
        expect(event.eventType).toBe("error");
      });

      it("undefined 入力は error イベントに正規化される", () => {
        const event = normalizeSdkMessage(undefined, BASE_CONTEXT);
        expect(event.eventType).toBe("error");
      });

      it("空オブジェクト入力は error イベントに正規化される", () => {
        const event = normalizeSdkMessage({}, BASE_CONTEXT);
        expect(event.eventType).toBe("error");
      });
    });
  });

  // ── normalizeSdkStream: ストリーム全体の正規化 ──

  describe("normalizeSdkStream", () => {
    it("ストリーム全体を正規化し、sessionId を伝播する", () => {
      const rawMessages = [
        SYSTEM_INIT_MSG,
        ASSISTANT_TEXT_MSG,
        RESULT_SUCCESS_MSG,
      ];

      const events = normalizeSdkStream(rawMessages, BASE_CONTEXT);

      expect(events).toHaveLength(3);
      expect(events[0].eventType).toBe("init");
      expect(events[0].sessionId).toBe("sess-abc-123");

      // init で取得した sessionId が後続に伝播される
      expect(events[1].sessionId).toBe("sess-abc-123");
      expect(events[2].sessionId).toBe("sess-abc-123");
    });

    it("system/init 不在でもストリームを正規化できる", () => {
      const rawMessages = [ASSISTANT_TEXT_MSG, RESULT_SUCCESS_MSG];

      const events = normalizeSdkStream(rawMessages, BASE_CONTEXT);

      expect(events).toHaveLength(2);
      expect(events[0].eventType).toBe("assistant");
      // sessionId は result メッセージ自体から取得
      expect(events[1].sessionId).toBe("sess-abc-123");
    });

    it("空のストリームは空配列を返す", () => {
      const events = normalizeSdkStream([], BASE_CONTEXT);
      expect(events).toHaveLength(0);
    });

    it("permission denial が stream 内で蓄積される", () => {
      const denialMsg2 = {
        ...PERMISSION_DENIAL_MSG,
        denied_tool: "Bash",
        denied_reason: "Shell access denied",
      };
      const rawMessages = [
        SYSTEM_INIT_MSG,
        PERMISSION_DENIAL_MSG,
        denialMsg2,
        RESULT_SUCCESS_MSG,
      ];

      const events = normalizeSdkStream(rawMessages, BASE_CONTEXT);

      // 各 denial メッセージはそれぞれ permissionDenials を持つ
      const denialEvents = events.filter(
        (e) => e.permissionDenials && e.permissionDenials.length > 0,
      );
      expect(denialEvents.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ── Phase 6: Edge Case テスト拡充 ──────────────────

  describe("edge cases (Phase 6)", () => {
    // ── Task 1: cancellation / timeout ──

    describe("cancellation / timeout", () => {
      it("stop_reason が timeout の result を正規化する", () => {
        const timeoutMsg = {
          type: "result",
          subtype: "error",
          session_id: "sess-timeout",
          error: "Operation timed out after 30000ms",
          stop_reason: "timeout",
        };
        const event = normalizeSdkMessage(timeoutMsg, BASE_CONTEXT);

        expect(event.eventType).toBe("result");
        expect(event.resultSubtype).toBe("error");
        expect(event.stopReason).toBe("timeout");
        expect(event.text).toContain("timed out");
      });

      it("stop_reason が cancelled の result を正規化する", () => {
        const cancelledMsg = {
          type: "result",
          subtype: "error",
          session_id: "sess-cancel",
          error: "Operation was cancelled by user",
          stop_reason: "cancelled",
        };
        const event = normalizeSdkMessage(cancelledMsg, BASE_CONTEXT);

        expect(event.eventType).toBe("result");
        expect(event.stopReason).toBe("cancelled");
      });

      it("中断後のストリームで sessionId が保持される", () => {
        const cancelledResult = {
          type: "result",
          subtype: "error",
          session_id: "sess-cancel-123",
          error: "Cancelled",
          stop_reason: "cancelled",
        };
        const events = normalizeSdkStream(
          [SYSTEM_INIT_MSG, ASSISTANT_TEXT_MSG, cancelledResult],
          BASE_CONTEXT,
        );

        expect(events).toHaveLength(3);
        expect(events[2].sessionId).toBe("sess-cancel-123");
      });
    });

    // ── Task 2: permission denial variants ──

    describe("permission denial variants", () => {
      it("複数ツールの permission denial を個別に記録する", () => {
        const denial1 = {
          type: "assistant",
          content: [{ type: "tool_use", name: "Write" }],
          permission_denied: true,
          denied_tool: "Write",
          denied_reason: "Write access denied",
        };
        const denial2 = {
          type: "assistant",
          content: [{ type: "tool_use", name: "Bash" }],
          permission_denied: true,
          denied_tool: "Bash",
          denied_reason: "Shell execution denied",
        };

        const e1 = normalizeSdkMessage(denial1, BASE_CONTEXT);
        const e2 = normalizeSdkMessage(denial2, BASE_CONTEXT);

        expect(e1.permissionDenials).toEqual([
          { toolName: "Write", reason: "Write access denied" },
        ]);
        expect(e2.permissionDenials).toEqual([
          { toolName: "Bash", reason: "Shell execution denied" },
        ]);
      });

      it("permission_denied が false の場合は permissionDenials なし", () => {
        const noDenialMsg = {
          type: "assistant",
          content: [{ type: "text", text: "OK" }],
          permission_denied: false,
        };
        const event = normalizeSdkMessage(noDenialMsg, BASE_CONTEXT);

        expect(event.permissionDenials).toBeUndefined();
      });

      it("denied_tool / denied_reason 欠損時のデフォルト", () => {
        const partialDenial = {
          type: "assistant",
          content: [],
          permission_denied: true,
          // denied_tool / denied_reason 欠損
        };
        const event = normalizeSdkMessage(partialDenial, BASE_CONTEXT);

        expect(event.permissionDenials).toBeDefined();
        expect(event.permissionDenials![0].toolName).toBe("unknown");
        expect(event.permissionDenials![0].reason).toBe("Permission denied");
      });
    });

    // ── Task 3: resumed session ──

    describe("resumed session", () => {
      it("context に既存 sessionId がある場合に伝播する", () => {
        const contextWithSession: NormalizerContext = {
          ...BASE_CONTEXT,
          sessionId: "sess-existing",
        };

        const events = normalizeSdkStream(
          [ASSISTANT_TEXT_MSG],
          contextWithSession,
        );

        expect(events[0].sessionId).toBe("sess-existing");
      });

      it("resume 時: 新しい init の sessionId が既存を上書きする", () => {
        const contextWithSession: NormalizerContext = {
          ...BASE_CONTEXT,
          sessionId: "sess-old",
        };
        const newInitMsg = {
          type: "system",
          subtype: "init",
          session_id: "sess-new-after-resume",
        };

        const events = normalizeSdkStream(
          [newInitMsg, ASSISTANT_TEXT_MSG],
          contextWithSession,
        );

        expect(events[0].sessionId).toBe("sess-new-after-resume");
        expect(events[1].sessionId).toBe("sess-new-after-resume");
      });

      it("resume 時: init がなくても既存 sessionId が使われる", () => {
        const contextWithSession: NormalizerContext = {
          ...BASE_CONTEXT,
          sessionId: "sess-resumed",
        };

        const events = normalizeSdkStream(
          [ASSISTANT_TEXT_MSG, RESULT_SUCCESS_MSG],
          contextWithSession,
        );

        // assistant は伝播された sessionId を使う
        expect(events[0].sessionId).toBe("sess-resumed");
        // result は自身の sessionId を持つ
        expect(events[1].sessionId).toBe("sess-abc-123");
      });
    });

    // ── system subtype 未知 ──

    describe("unknown system subtype", () => {
      it("未知の system subtype は error イベントに正規化する", () => {
        const unknownSystem = {
          type: "system",
          subtype: "unknown_subtype",
        };
        const event = normalizeSdkMessage(unknownSystem, BASE_CONTEXT);

        expect(event.eventType).toBe("error");
      });
    });

    // ── 大量メッセージストリーム ──

    describe("large stream", () => {
      it("100件のメッセージを正規化できる", () => {
        const messages = [
          SYSTEM_INIT_MSG,
          ...Array.from({ length: 98 }, () => ASSISTANT_TEXT_MSG),
          RESULT_SUCCESS_MSG,
        ];

        const events = normalizeSdkStream(messages, BASE_CONTEXT);

        expect(events).toHaveLength(100);
        expect(events[0].eventType).toBe("init");
        expect(events[99].eventType).toBe("result");
        // 全イベントに sessionId が伝播
        expect(events[50].sessionId).toBe("sess-abc-123");
      });
    });
  });
});

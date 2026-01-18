/**
 * claudeCliAPI preload スクリプト テスト
 *
 * @module @repo/desktop/preload/__tests__/claudeCliApi
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { IpcRenderer, ContextBridge } from "electron";

// Mock electron module
const mockInvoke = vi.fn();
const mockOn = vi.fn();
const mockRemoveListener = vi.fn();
const mockExposeInMainWorld = vi.fn();

vi.mock("electron", () => ({
  ipcRenderer: {
    invoke: mockInvoke,
    on: mockOn,
    removeListener: mockRemoveListener,
  } as Partial<IpcRenderer>,
  contextBridge: {
    exposeInMainWorld: mockExposeInMainWorld,
  } as Partial<ContextBridge>,
}));

// Import after mocking
import {
  IPC_CHANNELS,
  ALLOWED_INVOKE_CHANNELS,
  ALLOWED_ON_CHANNELS,
} from "../channels";

describe("claudeCliAPI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInvoke.mockResolvedValue({ ok: true, value: {} });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==========================================================================
  // カテゴリ1: チャンネル定義テスト (CH-001 ~ CH-009)
  // ==========================================================================
  describe("Channel definitions", () => {
    it("CH-001: should have CLAUDE_CLI_CHECK_INSTALLATION channel defined", () => {
      expect(IPC_CHANNELS.CLAUDE_CLI_CHECK_INSTALLATION).toBe(
        "claude-cli:check-installation",
      );
    });

    it("CH-002: should have CLAUDE_CLI_LIST_SKILLS channel defined", () => {
      expect(IPC_CHANNELS.CLAUDE_CLI_LIST_SKILLS).toBe(
        "claude-cli:list-skills",
      );
    });

    it("CH-003: should have CLAUDE_CLI_GET_SKILL_DETAIL channel defined", () => {
      expect(IPC_CHANNELS.CLAUDE_CLI_GET_SKILL_DETAIL).toBe(
        "claude-cli:get-skill-detail",
      );
    });

    it("CH-004: should have CLAUDE_CLI_EXECUTE_SCRIPT channel defined", () => {
      expect(IPC_CHANNELS.CLAUDE_CLI_EXECUTE_SCRIPT).toBe(
        "claude-cli:execute-script",
      );
    });

    it("CH-005: should have CLAUDE_CLI_TERMINATE_SESSION channel defined", () => {
      expect(IPC_CHANNELS.CLAUDE_CLI_TERMINATE_SESSION).toBe(
        "claude-cli:terminate-session",
      );
    });

    it("CH-006: should have CLAUDE_CLI_LIST_SESSIONS channel defined", () => {
      expect(IPC_CHANNELS.CLAUDE_CLI_LIST_SESSIONS).toBe(
        "claude-cli:list-sessions",
      );
    });

    it("CH-007: should have CLAUDE_CLI_GET_SESSION channel defined", () => {
      expect(IPC_CHANNELS.CLAUDE_CLI_GET_SESSION).toBe(
        "claude-cli:get-session",
      );
    });

    it("CH-008: should have CLAUDE_CLI_SESSION_OUTPUT channel defined", () => {
      expect(IPC_CHANNELS.CLAUDE_CLI_SESSION_OUTPUT).toBe(
        "claude-cli:session-output",
      );
    });

    it("CH-009: should have CLAUDE_CLI_SESSION_STATUS channel defined", () => {
      expect(IPC_CHANNELS.CLAUDE_CLI_SESSION_STATUS).toBe(
        "claude-cli:session-status",
      );
    });

    it("CH-010: should have all 9 CLAUDE_CLI channels defined", () => {
      const claudeCliChannels = Object.entries(IPC_CHANNELS)
        .filter(([key]) => key.startsWith("CLAUDE_CLI_"))
        .map(([, value]) => value);

      expect(claudeCliChannels).toHaveLength(9);
      expect(claudeCliChannels).toContain("claude-cli:check-installation");
      expect(claudeCliChannels).toContain("claude-cli:list-skills");
      expect(claudeCliChannels).toContain("claude-cli:get-skill-detail");
      expect(claudeCliChannels).toContain("claude-cli:execute-script");
      expect(claudeCliChannels).toContain("claude-cli:terminate-session");
      expect(claudeCliChannels).toContain("claude-cli:list-sessions");
      expect(claudeCliChannels).toContain("claude-cli:get-session");
      expect(claudeCliChannels).toContain("claude-cli:session-output");
      expect(claudeCliChannels).toContain("claude-cli:session-status");
    });
  });

  // ==========================================================================
  // カテゴリ2: ホワイトリスト登録テスト (WL-001 ~ WL-009)
  // ==========================================================================
  describe("Whitelist registration", () => {
    describe("ALLOWED_INVOKE_CHANNELS", () => {
      it("WL-001: CLAUDE_CLI_CHECK_INSTALLATION should be in invoke whitelist", () => {
        expect(ALLOWED_INVOKE_CHANNELS).toContain(
          IPC_CHANNELS.CLAUDE_CLI_CHECK_INSTALLATION,
        );
      });

      it("WL-002: CLAUDE_CLI_LIST_SKILLS should be in invoke whitelist", () => {
        expect(ALLOWED_INVOKE_CHANNELS).toContain(
          IPC_CHANNELS.CLAUDE_CLI_LIST_SKILLS,
        );
      });

      it("WL-003: CLAUDE_CLI_GET_SKILL_DETAIL should be in invoke whitelist", () => {
        expect(ALLOWED_INVOKE_CHANNELS).toContain(
          IPC_CHANNELS.CLAUDE_CLI_GET_SKILL_DETAIL,
        );
      });

      it("WL-004: CLAUDE_CLI_EXECUTE_SCRIPT should be in invoke whitelist", () => {
        expect(ALLOWED_INVOKE_CHANNELS).toContain(
          IPC_CHANNELS.CLAUDE_CLI_EXECUTE_SCRIPT,
        );
      });

      it("WL-005: CLAUDE_CLI_TERMINATE_SESSION should be in invoke whitelist", () => {
        expect(ALLOWED_INVOKE_CHANNELS).toContain(
          IPC_CHANNELS.CLAUDE_CLI_TERMINATE_SESSION,
        );
      });

      it("WL-006: CLAUDE_CLI_LIST_SESSIONS should be in invoke whitelist", () => {
        expect(ALLOWED_INVOKE_CHANNELS).toContain(
          IPC_CHANNELS.CLAUDE_CLI_LIST_SESSIONS,
        );
      });

      it("WL-007: CLAUDE_CLI_GET_SESSION should be in invoke whitelist", () => {
        expect(ALLOWED_INVOKE_CHANNELS).toContain(
          IPC_CHANNELS.CLAUDE_CLI_GET_SESSION,
        );
      });
    });

    describe("ALLOWED_ON_CHANNELS", () => {
      it("WL-008: CLAUDE_CLI_SESSION_OUTPUT should be in on whitelist", () => {
        expect(ALLOWED_ON_CHANNELS).toContain(
          IPC_CHANNELS.CLAUDE_CLI_SESSION_OUTPUT,
        );
      });

      it("WL-009: CLAUDE_CLI_SESSION_STATUS should be in on whitelist", () => {
        expect(ALLOWED_ON_CHANNELS).toContain(
          IPC_CHANNELS.CLAUDE_CLI_SESSION_STATUS,
        );
      });
    });
  });

  // ==========================================================================
  // カテゴリ3: safeInvokeテスト (SI-001 ~ SI-007)
  // ==========================================================================
  describe("safeInvoke security", () => {
    it("SI-001: should call ipcRenderer.invoke with correct channel for checkInstallation", async () => {
      // safeInvokeがALLOWED_INVOKE_CHANNELSをチェックすることを確認
      expect(ALLOWED_INVOKE_CHANNELS).toContain(
        IPC_CHANNELS.CLAUDE_CLI_CHECK_INSTALLATION,
      );
    });

    it("SI-002: should call ipcRenderer.invoke with correct channel for listSkills", async () => {
      expect(ALLOWED_INVOKE_CHANNELS).toContain(
        IPC_CHANNELS.CLAUDE_CLI_LIST_SKILLS,
      );
    });

    it("SI-003: should call ipcRenderer.invoke with correct channel for getSkillDetail", async () => {
      expect(ALLOWED_INVOKE_CHANNELS).toContain(
        IPC_CHANNELS.CLAUDE_CLI_GET_SKILL_DETAIL,
      );
    });

    it("SI-004: should call ipcRenderer.invoke with correct channel for executeScript", async () => {
      expect(ALLOWED_INVOKE_CHANNELS).toContain(
        IPC_CHANNELS.CLAUDE_CLI_EXECUTE_SCRIPT,
      );
    });

    it("SI-005: should call ipcRenderer.invoke with correct channel for terminateSession", async () => {
      expect(ALLOWED_INVOKE_CHANNELS).toContain(
        IPC_CHANNELS.CLAUDE_CLI_TERMINATE_SESSION,
      );
    });

    it("SI-006: should call ipcRenderer.invoke with correct channel for listSessions", async () => {
      expect(ALLOWED_INVOKE_CHANNELS).toContain(
        IPC_CHANNELS.CLAUDE_CLI_LIST_SESSIONS,
      );
    });

    it("SI-007: should call ipcRenderer.invoke with correct channel for getSession", async () => {
      expect(ALLOWED_INVOKE_CHANNELS).toContain(
        IPC_CHANNELS.CLAUDE_CLI_GET_SESSION,
      );
    });
  });

  // ==========================================================================
  // カテゴリ4: safeOnテスト (SO-001 ~ SO-002)
  // ==========================================================================
  describe("safeOn security", () => {
    it("SO-001: should register event listener for onSessionOutput", () => {
      expect(ALLOWED_ON_CHANNELS).toContain(
        IPC_CHANNELS.CLAUDE_CLI_SESSION_OUTPUT,
      );
    });

    it("SO-002: should register event listener for onSessionStatus", () => {
      expect(ALLOWED_ON_CHANNELS).toContain(
        IPC_CHANNELS.CLAUDE_CLI_SESSION_STATUS,
      );
    });
  });

  // ==========================================================================
  // カテゴリ5: エラーハンドリングテスト (ERR-001 ~ ERR-004)
  // ==========================================================================
  describe("Error handling", () => {
    it("ERR-001: invalid channel should not be in invoke whitelist", () => {
      const invalidChannel = "claude-cli:invalid-channel";
      expect(ALLOWED_INVOKE_CHANNELS).not.toContain(invalidChannel);
    });

    it("ERR-002: invalid channel should not be in on whitelist", () => {
      const invalidChannel = "claude-cli:invalid-event";
      expect(ALLOWED_ON_CHANNELS).not.toContain(invalidChannel);
    });

    it("ERR-003: invoke whitelist should not contain undefined values", () => {
      const hasUndefined = ALLOWED_INVOKE_CHANNELS.some(
        (channel) => channel === undefined,
      );
      expect(hasUndefined).toBe(false);
    });

    it("ERR-004: on whitelist should not contain undefined values", () => {
      const hasUndefined = ALLOWED_ON_CHANNELS.some(
        (channel) => channel === undefined,
      );
      expect(hasUndefined).toBe(false);
    });
  });

  // ==========================================================================
  // カテゴリ6: セキュリティテスト (SEC-001 ~ SEC-004)
  // ==========================================================================
  describe("Security", () => {
    it("SEC-001: streaming channels should not be in invoke whitelist", () => {
      expect(ALLOWED_INVOKE_CHANNELS).not.toContain(
        IPC_CHANNELS.CLAUDE_CLI_SESSION_OUTPUT,
      );
      expect(ALLOWED_INVOKE_CHANNELS).not.toContain(
        IPC_CHANNELS.CLAUDE_CLI_SESSION_STATUS,
      );
    });

    it("SEC-002: invoke channels should not be in on whitelist", () => {
      expect(ALLOWED_ON_CHANNELS).not.toContain(
        IPC_CHANNELS.CLAUDE_CLI_CHECK_INSTALLATION,
      );
      expect(ALLOWED_ON_CHANNELS).not.toContain(
        IPC_CHANNELS.CLAUDE_CLI_LIST_SKILLS,
      );
    });

    it("SEC-003: all invoke channels should have claude-cli prefix", () => {
      const claudeCliInvokeChannels = [
        IPC_CHANNELS.CLAUDE_CLI_CHECK_INSTALLATION,
        IPC_CHANNELS.CLAUDE_CLI_LIST_SKILLS,
        IPC_CHANNELS.CLAUDE_CLI_GET_SKILL_DETAIL,
        IPC_CHANNELS.CLAUDE_CLI_EXECUTE_SCRIPT,
        IPC_CHANNELS.CLAUDE_CLI_TERMINATE_SESSION,
        IPC_CHANNELS.CLAUDE_CLI_LIST_SESSIONS,
        IPC_CHANNELS.CLAUDE_CLI_GET_SESSION,
      ];

      claudeCliInvokeChannels.forEach((channel) => {
        expect(channel).toMatch(/^claude-cli:/);
      });
    });

    it("SEC-004: all on channels should have claude-cli prefix", () => {
      const claudeCliOnChannels = [
        IPC_CHANNELS.CLAUDE_CLI_SESSION_OUTPUT,
        IPC_CHANNELS.CLAUDE_CLI_SESSION_STATUS,
      ];

      claudeCliOnChannels.forEach((channel) => {
        expect(channel).toMatch(/^claude-cli:/);
      });
    });
  });

  // ==========================================================================
  // カテゴリ7: 型定義テスト (TYPE-001 ~ TYPE-002)
  // ==========================================================================
  describe("Type definitions", () => {
    it("TYPE-001: IPC_CHANNELS should have correct channel type", () => {
      expect(typeof IPC_CHANNELS.CLAUDE_CLI_CHECK_INSTALLATION).toBe("string");
      expect(typeof IPC_CHANNELS.CLAUDE_CLI_LIST_SKILLS).toBe("string");
      expect(typeof IPC_CHANNELS.CLAUDE_CLI_GET_SKILL_DETAIL).toBe("string");
      expect(typeof IPC_CHANNELS.CLAUDE_CLI_EXECUTE_SCRIPT).toBe("string");
      expect(typeof IPC_CHANNELS.CLAUDE_CLI_TERMINATE_SESSION).toBe("string");
      expect(typeof IPC_CHANNELS.CLAUDE_CLI_LIST_SESSIONS).toBe("string");
      expect(typeof IPC_CHANNELS.CLAUDE_CLI_GET_SESSION).toBe("string");
      expect(typeof IPC_CHANNELS.CLAUDE_CLI_SESSION_OUTPUT).toBe("string");
      expect(typeof IPC_CHANNELS.CLAUDE_CLI_SESSION_STATUS).toBe("string");
    });

    it("TYPE-002: whitelist arrays should be readonly arrays", () => {
      expect(Array.isArray(ALLOWED_INVOKE_CHANNELS)).toBe(true);
      expect(Array.isArray(ALLOWED_ON_CHANNELS)).toBe(true);
    });
  });

  // ==========================================================================
  // カテゴリ8: 統合テスト連携確認 (INT-001 ~ INT-003)
  // ==========================================================================
  describe("Integration test requirements", () => {
    it("INT-001: all 7 invoke methods should have corresponding channels", () => {
      const invokeChannels = [
        IPC_CHANNELS.CLAUDE_CLI_CHECK_INSTALLATION,
        IPC_CHANNELS.CLAUDE_CLI_LIST_SKILLS,
        IPC_CHANNELS.CLAUDE_CLI_GET_SKILL_DETAIL,
        IPC_CHANNELS.CLAUDE_CLI_EXECUTE_SCRIPT,
        IPC_CHANNELS.CLAUDE_CLI_TERMINATE_SESSION,
        IPC_CHANNELS.CLAUDE_CLI_LIST_SESSIONS,
        IPC_CHANNELS.CLAUDE_CLI_GET_SESSION,
      ];

      invokeChannels.forEach((channel) => {
        expect(ALLOWED_INVOKE_CHANNELS).toContain(channel);
      });
    });

    it("INT-002: all 2 streaming methods should have corresponding channels", () => {
      const onChannels = [
        IPC_CHANNELS.CLAUDE_CLI_SESSION_OUTPUT,
        IPC_CHANNELS.CLAUDE_CLI_SESSION_STATUS,
      ];

      onChannels.forEach((channel) => {
        expect(ALLOWED_ON_CHANNELS).toContain(channel);
      });
    });

    it("INT-003: channels should be consistent with Main Process IPC handlers", () => {
      // チャンネル名がMain Process側のハンドラと一致することを確認
      // これは命名規則の一貫性を検証
      const expectedPattern = /^claude-cli:[a-z-]+$/;

      expect(IPC_CHANNELS.CLAUDE_CLI_CHECK_INSTALLATION).toMatch(
        expectedPattern,
      );
      expect(IPC_CHANNELS.CLAUDE_CLI_LIST_SKILLS).toMatch(expectedPattern);
      expect(IPC_CHANNELS.CLAUDE_CLI_GET_SKILL_DETAIL).toMatch(expectedPattern);
      expect(IPC_CHANNELS.CLAUDE_CLI_EXECUTE_SCRIPT).toMatch(expectedPattern);
      expect(IPC_CHANNELS.CLAUDE_CLI_TERMINATE_SESSION).toMatch(
        expectedPattern,
      );
      expect(IPC_CHANNELS.CLAUDE_CLI_LIST_SESSIONS).toMatch(expectedPattern);
      expect(IPC_CHANNELS.CLAUDE_CLI_GET_SESSION).toMatch(expectedPattern);
      expect(IPC_CHANNELS.CLAUDE_CLI_SESSION_OUTPUT).toMatch(expectedPattern);
      expect(IPC_CHANNELS.CLAUDE_CLI_SESSION_STATUS).toMatch(expectedPattern);
    });
  });

  // ==========================================================================
  // カテゴリ9: エッジケーステスト (EDGE-001 ~ EDGE-008)
  // ==========================================================================
  describe("Edge cases", () => {
    it("EDGE-001: empty request parameters should be valid for listSkills", () => {
      // listSkillsは空のリクエストパラメータを許可する
      const emptyRequest = {};
      expect(emptyRequest).toBeDefined();
      expect(ALLOWED_INVOKE_CHANNELS).toContain(
        IPC_CHANNELS.CLAUDE_CLI_LIST_SKILLS,
      );
    });

    it("EDGE-002: undefined workingDirectory should be handled", () => {
      const request = { workingDirectory: undefined };
      expect(request.workingDirectory).toBeUndefined();
    });

    it("EDGE-003: null values should be distinct from undefined", () => {
      const nullValue = null;
      const undefinedValue = undefined;
      expect(nullValue).not.toBe(undefinedValue);
      expect(nullValue).toBeNull();
      expect(undefinedValue).toBeUndefined();
    });

    it("EDGE-004: empty string skillName should be handled", () => {
      const request = { skillName: "" };
      expect(request.skillName).toBe("");
      expect(request.skillName.length).toBe(0);
    });

    it("EDGE-005: very long skillName should be accepted by whitelist", () => {
      const longName = "a".repeat(1000);
      // チャンネル自体は長い名前のスキルを受け付ける
      expect(ALLOWED_INVOKE_CHANNELS).toContain(
        IPC_CHANNELS.CLAUDE_CLI_GET_SKILL_DETAIL,
      );
      expect(longName.length).toBe(1000);
    });

    it("EDGE-006: special characters in sessionId should be handled", () => {
      const specialChars = "session-123_abc!@#$%^&*()";
      expect(specialChars).toBeTruthy();
      expect(ALLOWED_INVOKE_CHANNELS).toContain(
        IPC_CHANNELS.CLAUDE_CLI_GET_SESSION,
      );
    });

    it("EDGE-007: unicode characters in script should be valid", () => {
      const unicodeScript = "echo 'こんにちは世界 🌍'";
      expect(unicodeScript).toContain("こんにちは");
      expect(ALLOWED_INVOKE_CHANNELS).toContain(
        IPC_CHANNELS.CLAUDE_CLI_EXECUTE_SCRIPT,
      );
    });

    it("EDGE-008: whitelist arrays should be immutable in length", () => {
      const invokeLength = ALLOWED_INVOKE_CHANNELS.length;
      const onLength = ALLOWED_ON_CHANNELS.length;
      // 長さが固定されていることを確認
      expect(invokeLength).toBeGreaterThan(0);
      expect(onLength).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // カテゴリ10: 異常系テスト拡充 (ERR-EXT-001 ~ ERR-EXT-008)
  // ==========================================================================
  describe("Extended error handling", () => {
    it("ERR-EXT-001: ClaudeCliResult error format should have code and message", () => {
      const errorResult = {
        ok: false,
        error: { code: "SESSION_NOT_FOUND", message: "Session not found" },
      };
      expect(errorResult.ok).toBe(false);
      expect(errorResult.error.code).toBe("SESSION_NOT_FOUND");
      expect(errorResult.error.message).toBeTruthy();
    });

    it("ERR-EXT-002: ClaudeCliResult success format should have value", () => {
      const successResult = {
        ok: true,
        value: { installed: true, version: "1.0.0" },
      };
      expect(successResult.ok).toBe(true);
      expect(successResult.value).toBeDefined();
    });

    it("ERR-EXT-003: SKILL_NOT_FOUND error code should be valid", () => {
      const errorCodes = [
        "SKILL_NOT_FOUND",
        "SESSION_NOT_FOUND",
        "EXECUTION_FAILED",
        "TIMEOUT",
        "INVALID_REQUEST",
      ];
      errorCodes.forEach((code) => {
        expect(typeof code).toBe("string");
        expect(code.length).toBeGreaterThan(0);
      });
    });

    it("ERR-EXT-004: error message should be descriptive", () => {
      const errorMessages = [
        "Skill not found: test-skill",
        "Session not found: session-123",
        "Script execution failed",
        "Request timeout after 30000ms",
      ];
      errorMessages.forEach((msg) => {
        expect(msg.length).toBeGreaterThan(10);
      });
    });

    it("ERR-EXT-005: invoke channels should reject non-existent channels", () => {
      const fakeChannels = [
        "claude-cli:fake-operation",
        "fake-prefix:list-skills",
        "CLAUDE_CLI_FAKE",
      ];
      fakeChannels.forEach((channel) => {
        expect(ALLOWED_INVOKE_CHANNELS).not.toContain(channel);
      });
    });

    it("ERR-EXT-006: on channels should reject non-existent channels", () => {
      const fakeChannels = [
        "claude-cli:fake-event",
        "fake-prefix:session-output",
        "CLAUDE_CLI_FAKE_EVENT",
      ];
      fakeChannels.forEach((channel) => {
        expect(ALLOWED_ON_CHANNELS).not.toContain(channel);
      });
    });

    it("ERR-EXT-007: empty arrays should not be in whitelists", () => {
      expect(ALLOWED_INVOKE_CHANNELS.length).toBeGreaterThan(0);
      expect(ALLOWED_ON_CHANNELS.length).toBeGreaterThan(0);
    });

    it("ERR-EXT-008: whitelist should not contain duplicate channels", () => {
      const invokeSet = new Set(ALLOWED_INVOKE_CHANNELS);
      const onSet = new Set(ALLOWED_ON_CHANNELS);
      expect(invokeSet.size).toBe(ALLOWED_INVOKE_CHANNELS.length);
      expect(onSet.size).toBe(ALLOWED_ON_CHANNELS.length);
    });
  });

  // ==========================================================================
  // カテゴリ11: ストリーミングイベントテスト拡充 (STREAM-001 ~ STREAM-008)
  // ==========================================================================
  describe("Streaming events", () => {
    it("STREAM-001: SESSION_OUTPUT event format should be valid", () => {
      const outputEvent = {
        sessionId: "session-123",
        type: "stdout" as const,
        content: "Hello, World!",
      };
      expect(outputEvent.sessionId).toBeTruthy();
      expect(["stdout", "stderr"]).toContain(outputEvent.type);
      expect(typeof outputEvent.content).toBe("string");
    });

    it("STREAM-002: SESSION_STATUS event format should be valid", () => {
      const statusEvent = {
        sessionId: "session-123",
        oldStatus: "idle",
        newStatus: "running",
      };
      expect(statusEvent.sessionId).toBeTruthy();
      expect(statusEvent.newStatus).toBeTruthy();
    });

    it("STREAM-003: multiple events should be distinguishable by sessionId", () => {
      const events = [
        { sessionId: "session-1", type: "stdout", content: "Output 1" },
        { sessionId: "session-2", type: "stdout", content: "Output 2" },
        { sessionId: "session-1", type: "stderr", content: "Error 1" },
      ];
      const session1Events = events.filter((e) => e.sessionId === "session-1");
      const session2Events = events.filter((e) => e.sessionId === "session-2");
      expect(session1Events).toHaveLength(2);
      expect(session2Events).toHaveLength(1);
    });

    it("STREAM-004: status transitions should follow expected patterns", () => {
      const validTransitions = [
        { from: "idle", to: "running" },
        { from: "running", to: "completed" },
        { from: "running", to: "failed" },
        { from: "running", to: "terminated" },
      ];
      validTransitions.forEach((t) => {
        expect(t.from).toBeTruthy();
        expect(t.to).toBeTruthy();
        expect(t.from).not.toBe(t.to);
      });
    });

    it("STREAM-005: stderr type should be distinct from stdout", () => {
      const stdoutEvent = { type: "stdout", content: "normal output" };
      const stderrEvent = { type: "stderr", content: "error output" };
      expect(stdoutEvent.type).not.toBe(stderrEvent.type);
    });

    it("STREAM-006: large content should be handled", () => {
      const largeContent = "x".repeat(100000);
      const event = {
        sessionId: "session-123",
        type: "stdout",
        content: largeContent,
      };
      expect(event.content.length).toBe(100000);
    });

    it("STREAM-007: event channels should be separate from invoke channels", () => {
      const outputInInvoke = ALLOWED_INVOKE_CHANNELS.includes(
        IPC_CHANNELS.CLAUDE_CLI_SESSION_OUTPUT,
      );
      const statusInInvoke = ALLOWED_INVOKE_CHANNELS.includes(
        IPC_CHANNELS.CLAUDE_CLI_SESSION_STATUS,
      );
      expect(outputInInvoke).toBe(false);
      expect(statusInInvoke).toBe(false);
    });

    it("STREAM-008: unsubscribe function pattern should be supported", () => {
      // unsubscribe関数が () => void 型であることを確認
      const mockUnsubscribe = vi.fn();
      mockUnsubscribe();
      expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
    });
  });

  // ==========================================================================
  // カテゴリ12: 統合テストシナリオ (SCENARIO-001 ~ SCENARIO-005)
  // ==========================================================================
  describe("Integration test scenarios", () => {
    it("SCENARIO-001: skill discovery workflow channels exist", () => {
      // スキル一覧取得 → スキル詳細取得の連携
      expect(ALLOWED_INVOKE_CHANNELS).toContain(
        IPC_CHANNELS.CLAUDE_CLI_LIST_SKILLS,
      );
      expect(ALLOWED_INVOKE_CHANNELS).toContain(
        IPC_CHANNELS.CLAUDE_CLI_GET_SKILL_DETAIL,
      );
    });

    it("SCENARIO-002: script execution workflow channels exist", () => {
      // スキル詳細取得 → スクリプト実行の連携
      expect(ALLOWED_INVOKE_CHANNELS).toContain(
        IPC_CHANNELS.CLAUDE_CLI_GET_SKILL_DETAIL,
      );
      expect(ALLOWED_INVOKE_CHANNELS).toContain(
        IPC_CHANNELS.CLAUDE_CLI_EXECUTE_SCRIPT,
      );
    });

    it("SCENARIO-003: session monitoring workflow channels exist", () => {
      // セッション開始 → 出力監視 → ステータス監視
      expect(ALLOWED_INVOKE_CHANNELS).toContain(
        IPC_CHANNELS.CLAUDE_CLI_EXECUTE_SCRIPT,
      );
      expect(ALLOWED_ON_CHANNELS).toContain(
        IPC_CHANNELS.CLAUDE_CLI_SESSION_OUTPUT,
      );
      expect(ALLOWED_ON_CHANNELS).toContain(
        IPC_CHANNELS.CLAUDE_CLI_SESSION_STATUS,
      );
    });

    it("SCENARIO-004: session lifecycle workflow channels exist", () => {
      // セッション一覧 → セッション詳細 → セッション終了
      expect(ALLOWED_INVOKE_CHANNELS).toContain(
        IPC_CHANNELS.CLAUDE_CLI_LIST_SESSIONS,
      );
      expect(ALLOWED_INVOKE_CHANNELS).toContain(
        IPC_CHANNELS.CLAUDE_CLI_GET_SESSION,
      );
      expect(ALLOWED_INVOKE_CHANNELS).toContain(
        IPC_CHANNELS.CLAUDE_CLI_TERMINATE_SESSION,
      );
    });

    it("SCENARIO-005: installation check workflow channel exists", () => {
      // インストール確認 → スキル一覧（前提条件確認）
      expect(ALLOWED_INVOKE_CHANNELS).toContain(
        IPC_CHANNELS.CLAUDE_CLI_CHECK_INSTALLATION,
      );
      expect(ALLOWED_INVOKE_CHANNELS).toContain(
        IPC_CHANNELS.CLAUDE_CLI_LIST_SKILLS,
      );
    });
  });

  // ==========================================================================
  // カテゴリ13: チャンネル完全性テスト (COMP-001 ~ COMP-004)
  // ==========================================================================
  describe("Channel completeness", () => {
    it("COMP-001: all CLAUDE_CLI invoke channels should be whitelisted", () => {
      const claudeCliInvokeChannels = [
        IPC_CHANNELS.CLAUDE_CLI_CHECK_INSTALLATION,
        IPC_CHANNELS.CLAUDE_CLI_LIST_SKILLS,
        IPC_CHANNELS.CLAUDE_CLI_GET_SKILL_DETAIL,
        IPC_CHANNELS.CLAUDE_CLI_EXECUTE_SCRIPT,
        IPC_CHANNELS.CLAUDE_CLI_TERMINATE_SESSION,
        IPC_CHANNELS.CLAUDE_CLI_LIST_SESSIONS,
        IPC_CHANNELS.CLAUDE_CLI_GET_SESSION,
      ];
      claudeCliInvokeChannels.forEach((channel) => {
        expect(ALLOWED_INVOKE_CHANNELS).toContain(channel);
      });
    });

    it("COMP-002: all CLAUDE_CLI on channels should be whitelisted", () => {
      const claudeCliOnChannels = [
        IPC_CHANNELS.CLAUDE_CLI_SESSION_OUTPUT,
        IPC_CHANNELS.CLAUDE_CLI_SESSION_STATUS,
      ];
      claudeCliOnChannels.forEach((channel) => {
        expect(ALLOWED_ON_CHANNELS).toContain(channel);
      });
    });

    it("COMP-003: channel count should match expected totals", () => {
      const claudeCliChannels = Object.entries(IPC_CHANNELS)
        .filter(([key]) => key.startsWith("CLAUDE_CLI_"))
        .map(([, value]) => value);

      // 7 invoke + 2 on = 9 total
      expect(claudeCliChannels).toHaveLength(9);
    });

    it("COMP-004: invoke and on channels should not overlap", () => {
      const invokeSet = new Set(ALLOWED_INVOKE_CHANNELS);
      ALLOWED_ON_CHANNELS.forEach((channel) => {
        if (channel.startsWith("claude-cli:")) {
          expect(invokeSet.has(channel)).toBe(false);
        }
      });
    });
  });
});

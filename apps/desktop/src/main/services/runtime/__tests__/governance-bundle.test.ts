/**
 * TASK-SDK-07: Governance bundle 統合テスト
 *
 * 5 つの governance 観点を横断的にカバーする:
 * 1. route priority (integrated_api / terminal_handoff)
 * 2. consumer auth guard
 * 3. handoff DTO (HandoffGuidance)
 * 4. approval lifecycle (grant / expired / already_used)
 * 5. disclosure separation
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { RuntimePolicyResolver } from "../RuntimePolicyResolver";
import { TerminalHandoffBuilder } from "../TerminalHandoffBuilder";
import { DefaultApprovalGate } from "../ApprovalGate";
import { IPC_CHANNELS as SHARED_IPC_CHANNELS } from "../../../../../../../packages/shared/src/ipc/channels";
import type { ISubscriptionAuthProvider } from "@repo/shared/types/auth-mode";
import type { IAuthKeyService } from "../../auth/types";

describe("TASK-SDK-07: Governance bundle", () => {
  // --- 観点 1: route priority ---
  describe("route priority", () => {
    let resolver: RuntimePolicyResolver;
    let mockSub: { validateToken: ReturnType<typeof vi.fn> };

    beforeEach(() => {
      mockSub = { validateToken: vi.fn().mockResolvedValue(false) };
      resolver = new RuntimePolicyResolver(
        undefined,
        mockSub as unknown as ISubscriptionAuthProvider,
      );
    });

    it("integrated_api が primary: API key 有効時は必ず integrated_api", async () => {
      const result = await resolver.resolve("api-key", "sk-valid");
      expect(result.type).toBe("integrated_api");
    });

    it("terminal_handoff が secondary: API key なし時は terminal_handoff", async () => {
      const result = await resolver.resolve("api-key", null);
      expect(result.type).toBe("terminal_handoff");
    });

    it("silent fallback 禁止: degraded 時に integrated_api を装わない", async () => {
      const degradedResolver = new RuntimePolicyResolver(
        undefined,
        mockSub as unknown as ISubscriptionAuthProvider,
        { isDegraded: true } as never,
      );
      const result = await degradedResolver.resolve("api-key", "sk-valid");
      // degraded 時は API key があっても terminal_handoff になる
      expect(result.type).toBe("terminal_handoff");
    });
  });

  // --- 観点 2: consumer auth guard ---
  describe("consumer auth guard", () => {
    let resolver: RuntimePolicyResolver;

    beforeEach(() => {
      resolver = new RuntimePolicyResolver();
    });

    it("sess- prefix token を拒否する", async () => {
      await expect(resolver.resolve("api-key", "sess-abc123")).rejects.toThrow(
        "Consumer authentication tokens",
      );
    });

    it("sessionKey= prefix token を拒否する", async () => {
      await expect(
        resolver.resolve("api-key", "sessionKey=abc123"),
      ).rejects.toThrow("Consumer authentication tokens");
    });

    it("先頭空白付きの sess- token も拒否する", async () => {
      await expect(
        resolver.resolve("api-key", "  sess-trimmed"),
      ).rejects.toThrow("Consumer authentication tokens");
    });

    it("sk- prefix token は受け入れる", async () => {
      const result = await resolver.resolve("api-key", "sk-valid-key");
      expect(result.type).toBe("integrated_api");
    });
  });

  // --- 観点 3: handoff DTO (HandoffGuidance) ---
  describe("handoff DTO", () => {
    const builder = new TerminalHandoffBuilder();

    it("buildForSurface が shared HandoffGuidance を返す", () => {
      const guidance = builder.buildForSurface(
        {
          surfaceType: "runtime",
          runtimeType: "skill",
          skillName: "test-skill",
          prompt: "test prompt",
        },
        "API key unavailable",
      );

      expect(guidance).toHaveProperty("terminalCommand");
      expect(guidance).toHaveProperty("contextSummary");
      expect(guidance).toHaveProperty("reason");
      expect(guidance.reason).toBe("API key unavailable");
    });

    it("sanitize が prompt 内の危険文字をエスケープする", () => {
      const guidance = builder.buildForSurface(
        {
          surfaceType: "runtime",
          runtimeType: "skill",
          prompt: 'test "injection" $HOME `cmd`',
        },
        "test",
      );

      // ダブルクォートがエスケープされている
      expect(guidance.terminalCommand).toContain('\\"injection\\"');
      // $ がエスケープされている
      expect(guidance.terminalCommand).toContain("\\$HOME");
      // バッククォートがエスケープされている
      expect(guidance.terminalCommand).toContain("\\`cmd\\`");
    });

    it("未知の surfaceType で throw する (P62 exhaustive check)", () => {
      expect(() =>
        builder.buildForSurface({ surfaceType: "unknown" } as never, "test"),
      ).toThrow("未知の surfaceType");
    });
  });

  // --- 観点 4: approval lifecycle ---
  describe("approval lifecycle", () => {
    let gate: DefaultApprovalGate;

    beforeEach(() => {
      gate = new DefaultApprovalGate();
    });

    it("grantApproval → checkApproval → 成功（single-use）", () => {
      const granted = gate.grantApproval("s1", "op1");
      expect(granted.approved).toBe(true);

      if (granted.approved) {
        const checked = gate.checkApproval("s1", "op1", granted.token);
        expect(checked.approved).toBe(true);
      }
    });

    it("token 再利用で already_used を返す", () => {
      const granted = gate.grantApproval("s1", "op1");
      if (granted.approved) {
        gate.checkApproval("s1", "op1", granted.token);
        const reuse = gate.checkApproval("s1", "op1", granted.token);
        expect(reuse.approved).toBe(false);
        if (!reuse.approved) {
          expect(reuse.reason).toBe("already_used");
        }
      }
    });

    it("不正 token で not_requested を返す", () => {
      gate.grantApproval("s1", "op1");
      const result = gate.checkApproval("s1", "op1", "wrong-token");
      expect(result.approved).toBe(false);
      if (!result.approved) {
        expect(result.reason).toBe("not_requested");
      }
    });

    it("rejectApproval 後は not_requested を返す", () => {
      const granted = gate.grantApproval("s1", "op1");
      gate.rejectApproval("s1", "op1");
      if (granted.approved) {
        const result = gate.checkApproval("s1", "op1", granted.token);
        expect(result.approved).toBe(false);
      }
    });

    it("revokeAll がセッション内の全 token を無効化する", () => {
      const g1 = gate.grantApproval("s1", "op1");
      const g2 = gate.grantApproval("s1", "op2");
      gate.revokeAll("s1");
      if (g1.approved) {
        expect(gate.checkApproval("s1", "op1", g1.token).approved).toBe(false);
      }
      if (g2.approved) {
        expect(gate.checkApproval("s1", "op2", g2.token).approved).toBe(false);
      }
    });

    it("TTL 超過で expired を返す", () => {
      const now = Date.now();
      vi.spyOn(Date, "now")
        .mockReturnValueOnce(now) // grantApproval 時
        .mockReturnValueOnce(now + 301 * 1000); // checkApproval 時 (301秒後)
      const granted = gate.grantApproval("s1", "op1");
      if (granted.approved) {
        const result = gate.checkApproval("s1", "op1", granted.token);
        expect(result.approved).toBe(false);
        if (!result.approved) {
          expect(result.reason).toBe("expired");
        }
      }
      vi.restoreAllMocks();
    });
  });

  // --- 観点 5: disclosure separation ---
  describe("disclosure は approval と別責務", () => {
    it("approval handler と disclosure handler が異なるチャンネルを使う", async () => {
      // channels.ts からインポートして確認
      const { IPC_CHANNELS } = await import("../../../../preload/channels");
      expect(IPC_CHANNELS.APPROVAL_RESPOND).toBe("approval:respond");
      expect(IPC_CHANNELS.EXECUTION_GET_DISCLOSURE_INFO).toBe(
        "execution:get-disclosure-info",
      );
      expect(IPC_CHANNELS.APPROVAL_RESPOND).not.toBe(
        IPC_CHANNELS.EXECUTION_GET_DISCLOSURE_INFO,
      );
    });

    it("shared APPROVAL_CHANNELS と desktop IPC_CHANNELS で同一チャネル名が使用されている (cross-layer parity)", async () => {
      const { IPC_CHANNELS } = await import("../../../../preload/channels");
      expect(IPC_CHANNELS.APPROVAL_RESPOND).toBe(
        SHARED_IPC_CHANNELS.APPROVAL_RESPOND,
      );
      expect(IPC_CHANNELS.APPROVAL_REQUEST).toBe(
        SHARED_IPC_CHANNELS.APPROVAL_REQUEST,
      );
      expect(IPC_CHANNELS.EXECUTION_GET_DISCLOSURE_INFO).toBe(
        SHARED_IPC_CHANNELS.EXECUTION_GET_DISCLOSURE_INFO,
      );
    });
  });

  // --- 観点 5b: skill creator runtime channel parity ---
  describe("skill creator runtime channel parity", () => {
    it("shared の runtime channel 正本と preload の IPC_CHANNELS が一致する", async () => {
      const { IPC_CHANNELS } = await import("../../../../preload/channels");

      expect(IPC_CHANNELS.SKILL_CREATOR_PROGRESS).toBe(
        SHARED_IPC_CHANNELS.SKILL_CREATOR_PROGRESS,
      );
      expect(IPC_CHANNELS.SKILL_CREATOR_WORKFLOW_STATE_CHANGED).toBe(
        SHARED_IPC_CHANNELS.SKILL_CREATOR_WORKFLOW_STATE_CHANGED,
      );
      expect(IPC_CHANNELS.SKILL_CREATOR_ADAPTER_STATUS_CHANGED).toBe(
        SHARED_IPC_CHANNELS.SKILL_CREATOR_ADAPTER_STATUS_CHANGED,
      );
    });
  });

  // --- downstream boundary ---
  describe("downstream boundary (AC-5, AC-6)", () => {
    it("RuntimePolicyResolver は resolveWithService を公開しており service injection で動作する", async () => {
      const mockAuth: IAuthKeyService = {
        getKey: vi.fn().mockResolvedValue("sk-downstream"),
      } as unknown as IAuthKeyService;
      const resolver = new RuntimePolicyResolver(mockAuth);
      const result = await resolver.resolveWithService("api-key");
      expect(result.type).toBe("integrated_api");
    });
  });
});

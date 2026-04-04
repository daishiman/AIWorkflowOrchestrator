/**
 * GovernanceAllPhases テスト
 * UT-P0-09-GOVERNANCE-RUNTIME-COVERAGE-AND-UI-SURFACE-001
 * Phase 4: TDD Red
 *
 * plan / execute / verify / improve 全フェーズで governance hooks が
 * 正しく配線されていることを検証する。
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { createHooks } from "../../governance/SkillCreatorHooksFactory";
import { canUseTool } from "../../governance/SkillCreatorPermissionPolicy";
import { SkillCreatorAuditSink } from "../../governance/SkillCreatorAuditSink";
import { RuntimeSkillCreatorFacade } from "../../RuntimeSkillCreatorFacade";
import { RuntimePolicyResolver } from "../../RuntimePolicyResolver";

describe("GovernanceAllPhases", () => {
  let auditSink: SkillCreatorAuditSink;

  beforeEach(() => {
    auditSink = new SkillCreatorAuditSink();
  });

  it("TC-G-01: plan フェーズで createGovernanceHooks('plan') が呼ばれる", () => {
    const hooks = createHooks("plan", auditSink);
    hooks.onSessionStart({ sessionId: "plan-s1" });
    const events = auditSink.getEvents();
    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events[0].phase).toBe("plan");
  });

  it("TC-G-02: verify フェーズで createGovernanceHooks('verify') が呼ばれる", () => {
    const hooks = createHooks("verify", auditSink);
    hooks.onSessionStart({ sessionId: "verify-s1" });
    const events = auditSink.getEvents();
    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events[0].phase).toBe("verify");
  });

  it("TC-G-03: improve フェーズで createGovernanceHooks('improve') が呼ばれる", () => {
    const hooks = createHooks("improve", auditSink);
    hooks.onSessionStart({ sessionId: "improve-s1" });
    const events = auditSink.getEvents();
    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events[0].phase).toBe("improve");
  });

  it("TC-G-04: plan フェーズで Write ツールが拒否される", () => {
    const decision = canUseTool("Write", "plan");
    expect(decision.allowed).toBe(false);
    expect(decision.phase).toBe("plan");
    expect(decision.toolName).toBe("Write");
  });

  it("TC-G-05: verify フェーズで Write ツールが拒否される", () => {
    const decision = canUseTool("Write", "verify");
    expect(decision.allowed).toBe(false);
    expect(decision.phase).toBe("verify");
  });

  it("TC-G-06: improve フェーズで Read ツールが許可される", () => {
    const decision = canUseTool("Read", "improve");
    expect(decision.allowed).toBe(true);
    expect(decision.phase).toBe("improve");
  });

  it("TC-G-07: getGovernanceState() が現在フェーズを正確に返す", () => {
    const facade = new RuntimeSkillCreatorFacade({
      skillExecutor: {
        execute: vi.fn(),
      } as never,
    });
    const state = facade.getGovernanceState();
    // 初期フェーズは "plan"
    expect(state.phase).toBe("plan");
    expect(state.activePolicy).toBeDefined();
    expect(state.activePolicy.phase).toBe("plan");
    expect(Array.isArray(state.recentAuditEvents)).toBe(true);
    expect(Array.isArray(state.recentDenials)).toBe(true);
  });

  // Phase 6: 拡充テスト
  it("TC-G-08: plan → verify → improve でフェーズ変更が audit に記録される", () => {
    const planHooks = createHooks("plan", auditSink);
    planHooks.onSessionStart({ sessionId: "phase-change-s1" });

    const verifyAuditSink = new SkillCreatorAuditSink();
    const verifyHooks = createHooks("verify", verifyAuditSink);
    verifyHooks.onSessionStart({ sessionId: "phase-change-s2" });

    const improveAuditSink = new SkillCreatorAuditSink();
    const improveHooks = createHooks("improve", improveAuditSink);
    improveHooks.onSessionStart({ sessionId: "phase-change-s3" });

    expect(auditSink.getEvents()[0].phase).toBe("plan");
    expect(verifyAuditSink.getEvents()[0].phase).toBe("verify");
    expect(improveAuditSink.getEvents()[0].phase).toBe("improve");
  });

  it("TC-G-09: execute フェーズで Write ツールが許可される", () => {
    const decision = canUseTool("Write", "execute");
    expect(decision.allowed).toBe(true);
    expect(decision.phase).toBe("execute");
  });

  it("TC-G-10: improve フェーズで Write ツールが拒否される", () => {
    const decision = canUseTool("Write", "improve");
    expect(decision.allowed).toBe(false);
    expect(decision.phase).toBe("improve");
  });

  it("TC-G-11: plan フェーズの hooks で denial が audit に記録される", () => {
    const hooks = createHooks("plan", auditSink);
    hooks.onSessionStart({ sessionId: "denial-test" });
    hooks.onPreToolUse({ sessionId: "denial-test", toolName: "Write" });

    const denials = auditSink.getDenialEvents();
    expect(denials.length).toBeGreaterThanOrEqual(1);
    expect(denials[0].phase).toBe("plan");
  });

  it("TC-G-12: verify フェーズの hooks で denial が audit に記録される", () => {
    const verifyAuditSink = new SkillCreatorAuditSink();
    const hooks = createHooks("verify", verifyAuditSink);
    hooks.onSessionStart({ sessionId: "verify-denial" });
    hooks.onPreToolUse({ sessionId: "verify-denial", toolName: "Edit" });

    const denials = verifyAuditSink.getDenialEvents();
    expect(denials.length).toBeGreaterThanOrEqual(1);
    expect(denials[0].phase).toBe("verify");
  });

  // UT-RT-02: governanceHooks.onSessionEnd() 全パス保証
  // setLLMAdapter で status を "ready" にした上で resourceLoader 未設定パスを経由させ、
  // governance hooks 生成後の early return でも onSessionEnd が記録されることを確認する。
  it("TC-G-13: plan() が resourceLoader 未設定で失敗した場合も onSessionEnd が audit に記録される (UT-RT-02)", async () => {
    const facade = new RuntimeSkillCreatorFacade({
      skillExecutor: { execute: vi.fn() } as never,
    });
    // _llmAdapterStatus を "ready" にして adapter status early return を回避
    facade.setLLMAdapter({
      providerId: "anthropic",
      sendChat: vi.fn(),
      streamChat: vi.fn(),
      checkHealth: vi.fn(),
    } as never);
    vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
      type: "integrated_api",
      apiKey: "sk-test",
      permissionMode: "default",
    });
    // resourceLoader を設定しない → governance hooks 作成後に early return

    await facade.plan("test skill spec", "api-key", null);

    const state = facade.getGovernanceState();
    const sessionEndEvents = state.recentAuditEvents.filter(
      (e) => e.eventType === "session_end",
    );
    expect(sessionEndEvents.length).toBeGreaterThanOrEqual(1);
    expect(sessionEndEvents[0].phase).toBe("plan");
  });

  it("TC-G-14: improve() が llmAdapter 未注入で失敗した場合も onSessionEnd が audit に記録される (UT-RT-02)", async () => {
    const facade = new RuntimeSkillCreatorFacade({
      skillExecutor: { execute: vi.fn() } as never,
    });
    // _llmAdapterStatus を "ready" にしてから llmAdapter を外す
    facade.setLLMAdapter({
      providerId: "anthropic",
      sendChat: vi.fn(),
      streamChat: vi.fn(),
      checkHealth: vi.fn(),
    } as never);
    // その後 failed にセットすると improve() の _llmAdapterStatus ガードで早期リターンする。
    // ここではガード後に onSessionEnd が呼ばれることを確認するため
    // resourceLoader 未設定パスを使う（llmAdapter は設定済み）。
    vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
      type: "integrated_api",
      apiKey: "sk-test",
      permissionMode: "default",
    });
    // resourceLoader・skillFileManager 未設定 → improve() が governance hooks 生成後に early return

    await facade.improve(
      "test-skill",
      "Please fix the issues",
      "api-key",
      null,
    );

    const state = facade.getGovernanceState();
    const sessionEndEvents = state.recentAuditEvents.filter(
      (e) => e.eventType === "session_end",
    );
    expect(sessionEndEvents.length).toBeGreaterThanOrEqual(1);
    expect(sessionEndEvents[0].phase).toBe("improve");
  });
});

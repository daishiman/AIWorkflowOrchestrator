/**
 * RuntimeSkillCreatorFacade.executeAsync - exhaustive check テスト
 *
 * TASK-UT-RT-01-EXHAUSTIVE-CHECK-EXECUTE-RESPONSE-001
 *
 * classifyExecuteResult() + switch + assertNever による exhaustive check が
 * RuntimeSkillCreatorExecuteResponse の 3 union メンバーを正しく処理することを検証する。
 *
 * テスト方針（Feedback P0-09-U1）:
 * classifyExecuteResult() は module-local helper のため、
 * executeAsync() パブリックメソッド経由での振る舞い検証を主軸とする。
 *
 * TC-01: ExecuteResult (success:true)   → phase = "complete", error なし
 * TC-02: ExecuteResult (success:false)  → phase = "error", fallback message
 * TC-03: ExecuteErrorResponse           → phase = "error", error.message 伝搬
 * TC-04: terminal_handoff              → phase = "complete", error なし
 * TC-05: 型レベル exhaustive check      → typecheck で担保（コメント参照）
 * TC-06: ExecuteErrorResponse の error.message が onWorkflowStateSnapshot 第3引数に渡る
 * TC-07: success:false + error なし     → "Unknown execute error" fallback
 * TC-08: terminal_handoff を success と誤判定しない
 * TC-09: success:false + error 無効値   → "Unknown execute error" fallback
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import type { SkillExecutor } from "../../skill/SkillExecutor";
import type { ILLMAdapter } from "../../../adapters/llm/types";
import { RuntimeSkillCreatorFacade } from "../RuntimeSkillCreatorFacade";
import { SkillCreatorWorkflowEngine } from "../SkillCreatorWorkflowEngine";

// ── テストヘルパー ──────────────────────────────────────────────────

function createMockLLMAdapter(): ILLMAdapter {
  return {
    providerId: "anthropic" as ILLMAdapter["providerId"],
    sendChat: vi.fn(),
    streamChat: vi.fn(),
    checkHealth: vi.fn(),
  } as unknown as ILLMAdapter;
}

function createFacade() {
  const workflowEngine = new SkillCreatorWorkflowEngine();
  const facade = new RuntimeSkillCreatorFacade({
    skillExecutor: {
      execute: vi.fn(),
    } as unknown as SkillExecutor,
    llmAdapter: createMockLLMAdapter(),
    workflowEngine,
  });
  facade.setLLMAdapter(createMockLLMAdapter());
  return { facade, workflowEngine };
}

// ── テストスイート ──────────────────────────────────────────────────

describe("RuntimeSkillCreatorFacade.executeAsync — exhaustive check (UT-RT-02)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── 正常系 ──

  it("TC-01: ExecuteResult(success:true) → phase = complete, onWorkflowStateSnapshot に error なし", async () => {
    const { facade, workflowEngine } = createFacade();
    const phaseSpy = vi.spyOn(workflowEngine, "triggerPhaseTransition");
    const snapshotSpy = vi.fn();
    facade.onWorkflowStateSnapshot = snapshotSpy;

    vi.spyOn(facade, "execute").mockResolvedValue({
      executeId: "exec-tc01",
      skillName: "test-skill",
      success: true,
      sdkEvents: [],
    } as any);

    await facade.executeAsync("plan-tc01", {
      planId: "plan-tc01",
      skillSpec: "skill spec",
      authMode: "api-key",
      apiKey: "sk-test",
    });

    // complete に遷移していること
    expect(phaseSpy).toHaveBeenCalledWith("plan-tc01", "complete", 100);
    // error なし（第3引数は常に undefined）
    for (const call of snapshotSpy.mock.calls) {
      expect(call[2]).toBeUndefined();
    }
  });

  it("TC-04: terminal_handoff → phase = complete, onWorkflowStateSnapshot に error なし", async () => {
    const { facade, workflowEngine } = createFacade();
    const phaseSpy = vi.spyOn(workflowEngine, "triggerPhaseTransition");
    const snapshotSpy = vi.fn();
    facade.onWorkflowStateSnapshot = snapshotSpy;

    vi.spyOn(facade, "execute").mockResolvedValue({
      type: "terminal_handoff",
      bundle: {
        planId: "plan-tc04",
        surfaceType: "runtime",
        runtimeType: "skill",
        prompt: "skill spec",
        workingDirectory: "/tmp",
      },
    } as any);

    await facade.executeAsync("plan-tc04", {
      planId: "plan-tc04",
      skillSpec: "skill spec",
      authMode: "api-key",
      apiKey: "sk-test",
    });

    expect(phaseSpy).toHaveBeenCalledWith("plan-tc04", "complete", 100);
    // error なし
    for (const call of snapshotSpy.mock.calls) {
      expect(call[2]).toBeUndefined();
    }
  });

  // ── エラー系 ──

  it("TC-02: ExecuteResult(success:false, error なし) → phase = error, fallback message", async () => {
    const { facade, workflowEngine } = createFacade();
    const phaseSpy = vi.spyOn(workflowEngine, "triggerPhaseTransition");
    const snapshotSpy = vi.fn();
    facade.onWorkflowStateSnapshot = snapshotSpy;

    vi.spyOn(workflowEngine, "getWorkflowState").mockReturnValue(undefined);
    vi.spyOn(facade, "execute").mockResolvedValue({
      executeId: "exec-tc02",
      skillName: "test-skill",
      success: false,
      sdkEvents: [],
    } as any);

    await facade.executeAsync("plan-tc02", {
      planId: "plan-tc02",
      skillSpec: "skill spec",
      authMode: "api-key",
      apiKey: "sk-test",
    });

    expect(phaseSpy).toHaveBeenCalledWith("plan-tc02", "error", 0);
    // fallback message が第3引数に渡る
    expect(snapshotSpy).toHaveBeenCalledWith(
      "plan-tc02",
      null,
      "Unknown execute error",
    );
  });

  it("TC-03: ExecuteErrorResponse → phase = error, error.message が第3引数に伝搬する", async () => {
    const { facade, workflowEngine } = createFacade();
    const phaseSpy = vi.spyOn(workflowEngine, "triggerPhaseTransition");
    const snapshotSpy = vi.fn();
    facade.onWorkflowStateSnapshot = snapshotSpy;

    const mockSnapshot = {
      planId: "plan-tc03",
      currentPhase: "review",
      awaitingUserInput: null,
      verifyResult: null,
      phaseArtifacts: [],
      resumeTokenEnvelope: {
        version: "task-sdk-02-v1",
        planId: "plan-tc03",
        currentPhase: "review",
        artifactCount: 0,
        updatedAt: new Date().toISOString(),
      },
    } as any;
    vi.spyOn(workflowEngine, "getWorkflowState").mockReturnValue(mockSnapshot);

    vi.spyOn(facade, "execute").mockResolvedValue({
      success: false,
      error: {
        code: "llm_adapter_unavailable",
        message: "APIキーを設定してください",
      },
    } as any);

    await facade.executeAsync("plan-tc03", {
      planId: "plan-tc03",
      skillSpec: "skill spec",
      authMode: "api-key",
      apiKey: "sk-test",
    });

    expect(phaseSpy).toHaveBeenCalledWith("plan-tc03", "error", 0);
    // error.message が第3引数に渡る（extractExecuteErrorMessage の結果）
    expect(snapshotSpy).toHaveBeenCalledWith(
      "plan-tc03",
      mockSnapshot,
      "APIキーを設定してください",
    );
  });

  // ── TC-05: 型レベル exhaustive check ──────────────────────────────
  // classifyExecuteResult() の default ブランチにある assertNever は
  // 新しい union メンバーが RuntimeSkillCreatorExecuteResponse に追加された際に
  // コンパイルエラーを引き起こす（typecheck で担保）。
  //
  // 手動検証手順:
  // 1. packages/shared/src/types/skillCreator.ts の RuntimeSkillCreatorExecuteResponse に
  //    仮バリアント (e.g. `| { type: "pending" }`) を追加する
  // 2. pnpm --filter @repo/desktop typecheck を実行する
  // 3. classifyExecuteResult() の assertNever(result) 行でコンパイルエラーが発生することを確認する
  // 4. 仮バリアントを削除して元に戻す
  //
  // ランタイム動作確認（TC-08 で担保）:
  it.todo(
    "TC-05: union型に新バリアント追加時のコンパイルエラー確認（手動 typecheck で担保）",
  );

  // ── エラーメッセージ伝搬の詳細テスト ──

  it("TC-06: ExecuteErrorResponse の error.message が正確に onWorkflowStateSnapshot 第3引数に渡る", async () => {
    const { facade, workflowEngine } = createFacade();
    const snapshotSpy = vi.fn();
    facade.onWorkflowStateSnapshot = snapshotSpy;

    vi.spyOn(workflowEngine, "getWorkflowState").mockReturnValue(undefined);

    const specificMessage = "LLM adapter unavailable: Connection refused";
    vi.spyOn(facade, "execute").mockResolvedValue({
      success: false,
      error: {
        code: "llm_adapter_unavailable",
        message: specificMessage,
      },
    } as any);

    await facade.executeAsync("plan-tc06", {
      planId: "plan-tc06",
      skillSpec: "skill spec",
      authMode: "api-key",
      apiKey: "sk-test",
    });

    // 特定の error.message が正確に渡ること
    expect(snapshotSpy).toHaveBeenCalledWith(
      "plan-tc06",
      null,
      specificMessage,
    );
  });

  it("TC-07: ExecuteResult(success:false) で error フィールドなし → 'Unknown execute error' fallback", async () => {
    const { facade, workflowEngine } = createFacade();
    const snapshotSpy = vi.fn();
    facade.onWorkflowStateSnapshot = snapshotSpy;

    vi.spyOn(workflowEngine, "getWorkflowState").mockReturnValue(undefined);
    // error フィールドを含まない success:false
    vi.spyOn(facade, "execute").mockResolvedValue({
      executeId: "exec-tc07",
      skillName: "test-skill",
      success: false,
      sdkEvents: [],
    } as any);

    await facade.executeAsync("plan-tc07", {
      planId: "plan-tc07",
      skillSpec: "skill spec",
      authMode: "api-key",
      apiKey: "sk-test",
    });

    expect(snapshotSpy).toHaveBeenCalledWith(
      "plan-tc07",
      null,
      "Unknown execute error",
    );
  });

  // ── 境界値テスト ──

  it("TC-08: terminal_handoff を success と誤判定しない（complete でも error メッセージなし）", async () => {
    const { facade, workflowEngine } = createFacade();
    const phaseSpy = vi.spyOn(workflowEngine, "triggerPhaseTransition");
    const snapshotSpy = vi.fn();
    facade.onWorkflowStateSnapshot = snapshotSpy;

    vi.spyOn(facade, "execute").mockResolvedValue({
      type: "terminal_handoff",
      bundle: {
        planId: "plan-tc08",
        surfaceType: "runtime",
        runtimeType: "skill",
        prompt: "skill spec",
        workingDirectory: "/tmp",
      },
    } as any);

    await facade.executeAsync("plan-tc08", {
      planId: "plan-tc08",
      skillSpec: "skill spec",
      authMode: "api-key",
      apiKey: "sk-test",
    });

    // terminal_handoff は complete に遷移すること
    expect(phaseSpy).toHaveBeenCalledWith("plan-tc08", "complete", 100);
    // error には遷移しないこと
    expect(phaseSpy).not.toHaveBeenCalledWith(
      "plan-tc08",
      "error",
      expect.any(Number),
    );
    // onWorkflowStateSnapshot には error 第3引数がないこと
    for (const call of snapshotSpy.mock.calls) {
      expect(call[2]).toBeUndefined();
    }
  });

  it("TC-09: ExecuteResult(success:false) で error フィールドが null → 'Unknown execute error' fallback", async () => {
    const { facade, workflowEngine } = createFacade();
    const snapshotSpy = vi.fn();
    facade.onWorkflowStateSnapshot = snapshotSpy;

    vi.spyOn(workflowEngine, "getWorkflowState").mockReturnValue(undefined);
    // error が null（or undefined）の場合 → fallback
    vi.spyOn(facade, "execute").mockResolvedValue({
      executeId: "exec-tc09",
      skillName: "test-skill",
      success: false,
      error: undefined,
      sdkEvents: [],
    } as any);

    await facade.executeAsync("plan-tc09", {
      planId: "plan-tc09",
      skillSpec: "skill spec",
      authMode: "api-key",
      apiKey: "sk-test",
    });

    expect(snapshotSpy).toHaveBeenCalledWith(
      "plan-tc09",
      null,
      "Unknown execute error",
    );
  });

  // ── assertNever のランタイム動作（型拡張の runtime ガード確認）──

  it("TC-05b: 未知のバリアントが渡された場合は assertNever により catch パスを経由してエラー処理される", async () => {
    const { facade, workflowEngine } = createFacade();
    const phaseSpy = vi.spyOn(workflowEngine, "triggerPhaseTransition");
    const snapshotSpy = vi.fn();
    facade.onWorkflowStateSnapshot = snapshotSpy;

    vi.spyOn(workflowEngine, "getWorkflowState").mockReturnValue(undefined);
    // 未知バリアント（assertNever により throw される）
    vi.spyOn(facade, "execute").mockResolvedValue({
      type: "unknown_future_variant",
      data: "should not happen",
    } as any);

    await facade.executeAsync("plan-tc05b", {
      planId: "plan-tc05b",
      skillSpec: "skill spec",
      authMode: "api-key",
      apiKey: "sk-test",
    });

    // catch パスへ：error フェーズに遷移すること
    expect(phaseSpy).toHaveBeenCalledWith("plan-tc05b", "error", 0);
    // "Unhandled case" メッセージを含む第3引数が渡ること
    expect(snapshotSpy).toHaveBeenCalledWith(
      "plan-tc05b",
      null,
      expect.stringContaining("Unhandled case"),
    );
  });
});

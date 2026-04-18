/**
 * SkillCreatorService.createSkill - 進捗コールバックテスト
 * TASK-SW-STREAM-001: skill-creator-service-progress-callback
 *
 * TDD: Phase 4 で作成（Red → Phase 5 実装後に Green）
 *
 * テストケース:
 * TC-01: onProgress が "planning" フェーズで呼ばれること
 * TC-02: onProgress が "generating-skill" フェーズで呼ばれること
 * TC-03: onProgress が "generating-agents" フェーズで呼ばれること
 * TC-04: onProgress が "validating" フェーズで呼ばれること
 * TC-05: onProgress が "done" フェーズで呼ばれること
 * TC-06: onProgress が合計5回呼ばれること
 * TC-07: onProgress が未指定でも createSkill が正常完了すること
 * TC-08: onProgress のフェーズが planning→done の順序で呼ばれること
 * TC-09: onProgress の percentage 値が正確に 10/40/70/90/100 であること
 * TC-10: onProgress の message 内容が正確な日本語文字列であること
 * TC-11: onProgress がエラーを投げた場合にそのエラーが伝播すること
 * TC-12: create モード以外（collaborative）でも planning フェーズが呼ばれること
 * TC-13: createSkill がエラーで終了した場合 done フェーズが呼ばれないこと
 * TC-14: onProgress に渡されるオブジェクトが毎回新しいオブジェクトであること
 * TC-15: callback で変更した progress が次回呼び出しに漏れないこと
 */

import { describe, expect, it, vi, beforeEach } from "vitest";
import * as fsPromises from "fs/promises";
import { SkillCreatorService } from "../SkillCreatorService";
import { ScriptExecutor } from "../ScriptExecutor";
import { ResourceLoader } from "../ResourceLoader";
import type { CreateSkillOptions, InterviewResult } from "@repo/shared/types";

vi.mock("../ScriptExecutor");
vi.mock("../ResourceLoader");
vi.mock("fs/promises");

describe("SkillCreatorService.createSkill - 進捗コールバック (TASK-SW-STREAM-001)", () => {
  let service: SkillCreatorService;
  let onProgress: ReturnType<typeof vi.fn>;
  let mockScriptExecutor: {
    execute: ReturnType<typeof vi.fn>;
    executeJson: ReturnType<typeof vi.fn>;
  };
  let mockResourceLoader: {
    load: ReturnType<typeof vi.fn>;
    loadAgent: ReturnType<typeof vi.fn>;
    loadSchema: ReturnType<typeof vi.fn>;
    clearCache: ReturnType<typeof vi.fn>;
  };

  const validCreateOptions: CreateSkillOptions = {
    name: "test-skill",
    description: "Test description",
    mode: "create",
  };

  const mockInterviewResult: InterviewResult = {
    purpose: "Test skill purpose",
    features: ["feature1", "feature2"],
    inputs: ["input1"],
    outputs: ["output1"],
    toolsNeeded: ["Read", "Write"],
    abstractionLevel: "L2",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockScriptExecutor = {
      execute: vi.fn(),
      executeJson: vi.fn(),
    };

    mockResourceLoader = {
      load: vi.fn(),
      loadAgent: vi.fn().mockResolvedValue("agent-content"),
      loadSchema: vi.fn(),
      clearCache: vi.fn(),
    };

    vi.mocked(ScriptExecutor).mockImplementation(
      () => mockScriptExecutor as unknown as ScriptExecutor,
    );
    vi.mocked(ResourceLoader).mockImplementation(
      () => mockResourceLoader as unknown as ResourceLoader,
    );

    // fs/promises デフォルトモック
    vi.mocked(fsPromises.mkdir).mockResolvedValue(undefined);
    vi.mocked(fsPromises.access).mockRejectedValue(new Error("ENOENT"));
    vi.mocked(fsPromises.writeFile).mockResolvedValue();
    vi.mocked(fsPromises.unlink).mockResolvedValue();
    vi.mocked(fsPromises.readdir).mockResolvedValue([]);
    vi.mocked(fsPromises.readFile).mockResolvedValue(Buffer.from(""));

    // init_skill.js と validate_all.js のデフォルト成功モック
    mockScriptExecutor.execute.mockResolvedValue({
      success: true,
      stdout: "",
      stderr: "",
      exitCode: 0,
    });

    // generate_skill_md.js 成功後 skillMdPath アクセス成功
    vi.mocked(fsPromises.access)
      .mockRejectedValueOnce(new Error("ENOENT")) // tmpPlanPath 書き込み前の初期チェック不要
      .mockResolvedValue(undefined); // generate_skill_md.js 後の access 成功

    service = new SkillCreatorService();
    onProgress = vi.fn();
  });

  describe("正常系: コールバックが指定された場合", () => {
    it('TC-01: onProgress が "planning" フェーズで呼ばれること (AC-2)', async () => {
      await service.createSkill(validCreateOptions, onProgress);

      expect(onProgress).toHaveBeenCalledWith(
        expect.objectContaining({ phase: "planning", percentage: 10 }),
      );
    });

    it('TC-02: onProgress が "generating-skill" フェーズで呼ばれること (AC-3)', async () => {
      await service.createSkill(validCreateOptions, onProgress);

      expect(onProgress).toHaveBeenCalledWith(
        expect.objectContaining({ phase: "generating-skill", percentage: 40 }),
      );
    });

    it('TC-03: onProgress が "generating-agents" フェーズで呼ばれること (AC-3)', async () => {
      await service.createSkill(validCreateOptions, onProgress);

      expect(onProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          phase: "generating-agents",
          percentage: 70,
        }),
      );
    });

    it('TC-04: onProgress が "validating" フェーズで呼ばれること (AC-3)', async () => {
      await service.createSkill(validCreateOptions, onProgress);

      expect(onProgress).toHaveBeenCalledWith(
        expect.objectContaining({ phase: "validating", percentage: 90 }),
      );
    });

    it('TC-05: onProgress が "done" フェーズで呼ばれること (AC-3)', async () => {
      await service.createSkill(validCreateOptions, onProgress);

      expect(onProgress).toHaveBeenCalledWith(
        expect.objectContaining({ phase: "done", percentage: 100 }),
      );
    });

    it("TC-06: onProgress が合計5回呼ばれること", async () => {
      await service.createSkill(validCreateOptions, onProgress);

      expect(onProgress).toHaveBeenCalledTimes(5);
    });

    it("TC-08: onProgress のフェーズが planning→done の順序で呼ばれること", async () => {
      await service.createSkill(validCreateOptions, onProgress);

      expect(onProgress).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ phase: "planning" }),
      );
      expect(onProgress).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ phase: "generating-skill" }),
      );
      expect(onProgress).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining({ phase: "generating-agents" }),
      );
      expect(onProgress).toHaveBeenNthCalledWith(
        4,
        expect.objectContaining({ phase: "validating" }),
      );
      expect(onProgress).toHaveBeenNthCalledWith(
        5,
        expect.objectContaining({ phase: "done" }),
      );
    });
  });

  describe("正常系: コールバックが未指定の場合 (AC-4)", () => {
    it("TC-07: onProgress が未指定でも createSkill が正常完了すること", async () => {
      const result = await service.createSkill(validCreateOptions);

      expect(result).toContain("test-skill");
    });
  });

  describe("エッジケース", () => {
    it("TC-09: onProgress の percentage 値が正確に 10/40/70/90/100 であること", async () => {
      await service.createSkill(validCreateOptions, onProgress);

      const percentages = onProgress.mock.calls.map(
        (c: [{ percentage: number }]) => c[0].percentage,
      );
      expect(percentages).toEqual([10, 40, 70, 90, 100]);
    });

    it("TC-10: onProgress の message 内容が正確な日本語文字列であること", async () => {
      await service.createSkill(validCreateOptions, onProgress);

      const messages = onProgress.mock.calls.map(
        (c: [{ message: string }]) => c[0].message,
      );
      expect(messages).toEqual([
        "構造を計画しています",
        "SKILL.md を生成しています",
        "エージェント定義を生成しています",
        "スキルを検証しています",
        "完了しました",
      ]);
    });

    it("TC-11: onProgress がエラーを投げた場合にそのエラーが伝播すること", async () => {
      const throwingCallback = vi.fn().mockImplementation(() => {
        throw new Error("コールバックエラー");
      });

      // コールバックのエラーはそのまま伝播する
      await expect(
        service.createSkill(validCreateOptions, throwingCallback),
      ).rejects.toThrow("コールバックエラー");
      // 呼び出しは1回で止まっている（エラー伝播する実装）
      expect(throwingCallback).toHaveBeenCalledTimes(1);
    });

    it("TC-12: collaborative モードで interview フェーズが最初に通知される（FUP-03 挙動）", async () => {
      const collaborativeOptions: CreateSkillOptions = {
        name: "collab-skill",
        description: "Collaborative skill",
        mode: "collaborative",
        interviewResult: mockInterviewResult,
      };

      await service.createSkill(collaborativeOptions, onProgress);

      expect(onProgress).toHaveBeenCalledWith(
        expect.objectContaining({ phase: "interview" }),
      );
      // planning フェーズは collaborative モードでは通知されない
      expect(onProgress).not.toHaveBeenCalledWith(
        expect.objectContaining({ phase: "planning" }),
      );
    });

    it("TC-13: createSkill がバリデーションエラーで終了した場合 done フェーズが呼ばれないこと", async () => {
      const invalidOptions: CreateSkillOptions = {
        name: "",
        description: "Test",
        mode: "create",
      };

      await expect(
        service.createSkill(invalidOptions, onProgress),
      ).rejects.toThrow();
      expect(onProgress).not.toHaveBeenCalledWith(
        expect.objectContaining({ phase: "done" }),
      );
    });

    it("TC-14: onProgress に渡されるオブジェクトが毎回新しいオブジェクトであること", async () => {
      await service.createSkill(validCreateOptions, onProgress);

      const calls = onProgress.mock.calls as [object][];
      const objects = calls.map((c) => c[0]);
      // 各呼び出しで異なるオブジェクト参照であることを確認
      for (let i = 0; i < objects.length; i++) {
        for (let j = i + 1; j < objects.length; j++) {
          expect(objects[i]).not.toBe(objects[j]);
        }
      }
    });

    it("TC-15: callback で変更した progress が次回呼び出しに漏れないこと", async () => {
      const firstRunProgresses: Array<{ phase: string }> = [];
      const mutatingCallback = vi
        .fn()
        .mockImplementation((progress: { phase: string }) => {
          firstRunProgresses.push(progress);
          progress.phase = "mutated";
        });

      await service.createSkill(validCreateOptions, mutatingCallback);

      const secondRunProgresses: Array<{ phase: string }> = [];
      const recordingCallback = vi
        .fn()
        .mockImplementation((progress: { phase: string }) => {
          secondRunProgresses.push(progress);
        });

      await service.createSkill(validCreateOptions, recordingCallback);

      expect(firstRunProgresses[0].phase).toBe("mutated");
      expect(secondRunProgresses[0].phase).toBe("planning");
      expect(secondRunProgresses[0]).not.toBe(firstRunProgresses[0]);
    });
  });

  // ===========================================================
  // TASK-SW-STREAM-FUP-03: モード別進捗フロー詳細化
  // ===========================================================

  describe("TASK-SW-STREAM-FUP-03: collaborative モード進捗フロー", () => {
    const collaborativeOptions: CreateSkillOptions = {
      name: "collab-skill",
      description: "Collaborative skill",
      mode: "collaborative",
      interviewResult: {
        purpose: "Test skill purpose",
        features: ["feature1", "feature2"],
        inputs: ["input1"],
        outputs: ["output1"],
        toolsNeeded: ["Read", "Write"],
        abstractionLevel: "L2",
      },
    };

    it("TC-01: interview フェーズが最初に通知される", async () => {
      await service.createSkill(collaborativeOptions, onProgress);
      expect(onProgress.mock.calls[0][0].phase).toBe("interview");
    });

    it("TC-02: consensus フェーズが interview の後に通知される", async () => {
      await service.createSkill(collaborativeOptions, onProgress);
      const phases = onProgress.mock.calls.map(
        (c: [{ phase: string }]) => c[0].phase,
      );
      const interviewIdx = phases.indexOf("interview");
      const consensusIdx = phases.indexOf("consensus");
      expect(interviewIdx).toBeGreaterThanOrEqual(0);
      expect(consensusIdx).toBeGreaterThan(interviewIdx);
    });

    it("TC-03: collaborative モードの percentage が単調増加する", async () => {
      await service.createSkill(collaborativeOptions, onProgress);
      const percentages = onProgress.mock.calls.map(
        (c: [{ percentage: number }]) => c[0].percentage,
      );
      for (let i = 1; i < percentages.length; i++) {
        expect(percentages[i]).toBeGreaterThanOrEqual(percentages[i - 1]);
      }
    });

    it("TC-04: collaborative モードで done フェーズが最後に通知される", async () => {
      await service.createSkill(collaborativeOptions, onProgress);
      const lastCall =
        onProgress.mock.calls[onProgress.mock.calls.length - 1][0];
      expect(lastCall.phase).toBe("done");
      expect(lastCall.percentage).toBe(100);
    });
  });

  describe("TASK-SW-STREAM-FUP-03: orchestrate モード進捗フロー", () => {
    const orchestrateOptions: CreateSkillOptions = {
      name: "orchestrate-skill",
      description: "Orchestrate skill",
      mode: "orchestrate",
    };

    it("TC-05: engine-selection フェーズが最初に通知される", async () => {
      await service.createSkill(orchestrateOptions, onProgress);
      expect(onProgress.mock.calls[0][0].phase).toBe("engine-selection");
    });

    it("TC-06: orchestrate モードの percentage が単調増加する", async () => {
      await service.createSkill(orchestrateOptions, onProgress);
      const percentages = onProgress.mock.calls.map(
        (c: [{ percentage: number }]) => c[0].percentage,
      );
      for (let i = 1; i < percentages.length; i++) {
        expect(percentages[i]).toBeGreaterThanOrEqual(percentages[i - 1]);
      }
    });

    it("TC-07: orchestrate モードで done フェーズが最後に通知される", async () => {
      await service.createSkill(orchestrateOptions, onProgress);
      const lastCall =
        onProgress.mock.calls[onProgress.mock.calls.length - 1][0];
      expect(lastCall.phase).toBe("done");
      expect(lastCall.percentage).toBe(100);
    });
  });

  describe("TASK-SW-STREAM-FUP-03: update モード進捗フロー", () => {
    const updateOptions: CreateSkillOptions = {
      name: "update-skill",
      description: "Update skill",
      mode: "update",
    };

    it("TC-08: loading-skill フェーズが最初に通知される", async () => {
      await service.createSkill(updateOptions, onProgress);
      expect(onProgress.mock.calls[0][0].phase).toBe("loading-skill");
    });

    it("TC-09: analyzing フェーズが loading-skill の後に通知される", async () => {
      await service.createSkill(updateOptions, onProgress);
      const phases = onProgress.mock.calls.map(
        (c: [{ phase: string }]) => c[0].phase,
      );
      const loadingIdx = phases.indexOf("loading-skill");
      const analyzingIdx = phases.indexOf("analyzing");
      expect(loadingIdx).toBeGreaterThanOrEqual(0);
      expect(analyzingIdx).toBeGreaterThan(loadingIdx);
    });

    it("TC-10: update モードで done フェーズが最後に通知される", async () => {
      await service.createSkill(updateOptions, onProgress);
      const lastCall =
        onProgress.mock.calls[onProgress.mock.calls.length - 1][0];
      expect(lastCall.phase).toBe("done");
      expect(lastCall.percentage).toBe(100);
    });
  });

  describe("TASK-SW-STREAM-FUP-03: improve-prompt モード進捗フロー", () => {
    const improvePromptOptions: CreateSkillOptions = {
      name: "improve-skill",
      description: "Improve prompt skill",
      mode: "improve-prompt",
    };

    it("TC-11: loading-skill フェーズが最初に通知される", async () => {
      await service.createSkill(improvePromptOptions, onProgress);
      expect(onProgress.mock.calls[0][0].phase).toBe("loading-skill");
    });

    it("TC-12: improving フェーズが analyzing の後に通知される", async () => {
      await service.createSkill(improvePromptOptions, onProgress);
      const phases = onProgress.mock.calls.map(
        (c: [{ phase: string }]) => c[0].phase,
      );
      const analyzingIdx = phases.indexOf("analyzing");
      const improvingIdx = phases.indexOf("improving");
      expect(analyzingIdx).toBeGreaterThanOrEqual(0);
      expect(improvingIdx).toBeGreaterThan(analyzingIdx);
    });

    it("TC-13: improve-prompt モードで done フェーズが最後に通知される", async () => {
      await service.createSkill(improvePromptOptions, onProgress);
      const lastCall =
        onProgress.mock.calls[onProgress.mock.calls.length - 1][0];
      expect(lastCall.phase).toBe("done");
      expect(lastCall.percentage).toBe(100);
    });
  });

  describe("TASK-SW-STREAM-FUP-03: create モード回帰確認", () => {
    it("TC-14: create モードの5段階フローが変わらない（planning → done）", async () => {
      await service.createSkill(validCreateOptions, onProgress);
      const phases = onProgress.mock.calls.map(
        (c: [{ phase: string }]) => c[0].phase,
      );
      const percentages = onProgress.mock.calls.map(
        (c: [{ percentage: number }]) => c[0].percentage,
      );
      expect(phases).toEqual([
        "planning",
        "generating-skill",
        "generating-agents",
        "validating",
        "done",
      ]);
      expect(percentages).toEqual([10, 40, 70, 90, 100]);
      expect(onProgress).toHaveBeenCalledTimes(5);
    });
  });

  // ===========================================================
  // TASK-SW-STREAM-FUP-03 Phase 6: テスト拡充
  // ===========================================================

  describe("TASK-SW-STREAM-FUP-03: onProgress 未指定時の安全動作", () => {
    it("TC-15: collaborative モードで onProgress 未指定でもエラーが発生しない", async () => {
      const opts: CreateSkillOptions = {
        name: "collab-no-cb",
        description: "Test",
        mode: "collaborative",
        interviewResult: {
          purpose: "Test",
          features: ["f1"],
          inputs: [],
          outputs: [],
          toolsNeeded: [],
          abstractionLevel: "L2",
        },
      };
      await expect(service.createSkill(opts)).resolves.not.toThrow();
    });

    it("TC-16: orchestrate モードで onProgress 未指定でもエラーが発生しない", async () => {
      const opts: CreateSkillOptions = {
        name: "orch-no-cb",
        description: "Test",
        mode: "orchestrate",
      };
      await expect(service.createSkill(opts)).resolves.not.toThrow();
    });

    it("TC-17: update モードで onProgress 未指定でもエラーが発生しない", async () => {
      const opts: CreateSkillOptions = {
        name: "update-no-cb",
        description: "Test",
        mode: "update",
      };
      await expect(service.createSkill(opts)).resolves.not.toThrow();
    });

    it("TC-18: improve-prompt モードで onProgress 未指定でもエラーが発生しない", async () => {
      const opts: CreateSkillOptions = {
        name: "improve-no-cb",
        description: "Test",
        mode: "improve-prompt",
      };
      await expect(service.createSkill(opts)).resolves.not.toThrow();
    });
  });

  describe("TASK-SW-STREAM-FUP-03: percentage 単調増加ガード", () => {
    it("TC-19: orchestrate モードの percentage が単調増加する（engine-selection → done）", async () => {
      await service.createSkill(
        { name: "orch-mono", description: "Test", mode: "orchestrate" },
        onProgress,
      );
      const percentages = onProgress.mock.calls.map(
        (c: [{ percentage: number }]) => c[0].percentage,
      );
      expect(percentages.every((p: number) => p >= 0 && p <= 100)).toBe(true);
      for (let i = 1; i < percentages.length; i++) {
        expect(percentages[i]).toBeGreaterThanOrEqual(percentages[i - 1]);
      }
    });

    it("TC-20: update モードの percentage が単調増加する", async () => {
      await service.createSkill(
        { name: "update-mono", description: "Test", mode: "update" },
        onProgress,
      );
      const percentages = onProgress.mock.calls.map(
        (c: [{ percentage: number }]) => c[0].percentage,
      );
      expect(percentages.every((p: number) => p >= 0 && p <= 100)).toBe(true);
      for (let i = 1; i < percentages.length; i++) {
        expect(percentages[i]).toBeGreaterThanOrEqual(percentages[i - 1]);
      }
    });

    it("TC-21: improve-prompt モードの percentage が単調増加する", async () => {
      await service.createSkill(
        {
          name: "improve-mono",
          description: "Test",
          mode: "improve-prompt",
        },
        onProgress,
      );
      const percentages = onProgress.mock.calls.map(
        (c: [{ percentage: number }]) => c[0].percentage,
      );
      expect(percentages.every((p: number) => p >= 0 && p <= 100)).toBe(true);
      for (let i = 1; i < percentages.length; i++) {
        expect(percentages[i]).toBeGreaterThanOrEqual(percentages[i - 1]);
      }
    });
  });

  describe("TASK-SW-STREAM-FUP-03: 全モードで done が最後に通知される", () => {
    const assertDoneLast = async (opts: CreateSkillOptions) => {
      await service.createSkill(opts, onProgress);
      const lastCall =
        onProgress.mock.calls[onProgress.mock.calls.length - 1][0];
      expect(lastCall.phase).toBe("done");
      expect(lastCall.percentage).toBe(100);
    };

    it("TC-22: collaborative モードで最後のフェーズが done(100%) である", async () => {
      await assertDoneLast({
        name: "collab-done",
        description: "Test",
        mode: "collaborative",
        interviewResult: {
          purpose: "Test",
          features: ["f1"],
          inputs: [],
          outputs: [],
          toolsNeeded: [],
          abstractionLevel: "L2",
        },
      });
    });

    it("TC-23: orchestrate モードで最後のフェーズが done(100%) である", async () => {
      await assertDoneLast({
        name: "orch-done",
        description: "Test",
        mode: "orchestrate",
      });
    });

    it("TC-24: update モードで最後のフェーズが done(100%) である", async () => {
      await assertDoneLast({
        name: "update-done",
        description: "Test",
        mode: "update",
      });
    });

    it("TC-25: improve-prompt モードで最後のフェーズが done(100%) である", async () => {
      await assertDoneLast({
        name: "improve-done",
        description: "Test",
        mode: "improve-prompt",
      });
    });
  });
});

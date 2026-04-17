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

    it("TC-12: create モード以外（collaborative）でも planning フェーズが呼ばれること", async () => {
      const collaborativeOptions: CreateSkillOptions = {
        name: "collab-skill",
        description: "Collaborative skill",
        mode: "collaborative",
        interviewResult: mockInterviewResult,
      };

      await service.createSkill(collaborativeOptions, onProgress);

      expect(onProgress).toHaveBeenCalledWith(
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
  });
});

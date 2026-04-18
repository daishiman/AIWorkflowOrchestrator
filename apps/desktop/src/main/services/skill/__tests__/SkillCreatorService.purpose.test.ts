/**
 * TASK-SC-LLM-PURPOSE-WIRE-001: purpose 抽出 LLM 統合テスト
 *
 * TC-01: extract-purpose エージェント定義が LLM の system prompt に渡される (AC-1)
 * TC-02: llmClient.generate が正しい system/user 引数で呼び出される (AC-2)
 * TC-03: structurePlan.purpose に LLM 生成結果が格納される (AC-3)
 * TC-04: LLM 呼び出し失敗時も createSkill は成功する（フォールバック）
 * TC-05: llmClient なしでも createSkill が正常に動作する（後方互換）(AC-6)
 * TC-06: generate が空文字を返す場合、purpose に空文字が格納される (IT-B-01)
 * TC-07: loadAgent 失敗時も createSkill は成功する (IT-E-02)
 * TC-08: AbortError は rethrow される (IT-E-03)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fsPromises from "fs/promises";
import { SkillCreatorService } from "../SkillCreatorService";
import { ScriptExecutor } from "../ScriptExecutor";
import { ResourceLoader } from "../ResourceLoader";

vi.mock("../ScriptExecutor");
vi.mock("../ResourceLoader");
vi.mock("fs/promises");

const mockLlmClient = {
  generate: vi.fn<[{ system: string; user: string }], Promise<string>>(),
};

describe("LLM-PURPOSE-WIRE-001: purpose 抽出 LLM 統合", () => {
  let service: SkillCreatorService;
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

  beforeEach(() => {
    vi.clearAllMocks();

    mockScriptExecutor = {
      execute: vi.fn().mockResolvedValue({
        success: true,
        stdout: "",
        stderr: "",
        exitCode: 0,
      }),
      executeJson: vi.fn(),
    };

    mockResourceLoader = {
      load: vi.fn(),
      loadAgent: vi.fn().mockResolvedValue("mock-agent-definition"),
      loadSchema: vi.fn(),
      clearCache: vi.fn(),
    };

    vi.mocked(ScriptExecutor).mockImplementation(
      () => mockScriptExecutor as unknown as ScriptExecutor,
    );
    vi.mocked(ResourceLoader).mockImplementation(
      () => mockResourceLoader as unknown as ResourceLoader,
    );

    vi.mocked(fsPromises.mkdir).mockResolvedValue(undefined);
    vi.mocked(fsPromises.access).mockRejectedValue(new Error("ENOENT"));
    vi.mocked(fsPromises.writeFile).mockResolvedValue();
    vi.mocked(fsPromises.unlink).mockResolvedValue();
    vi.mocked(fsPromises.readdir).mockResolvedValue([]);
    vi.mocked(fsPromises.readFile).mockResolvedValue(Buffer.from(""));

    mockLlmClient.generate.mockResolvedValue(
      JSON.stringify({
        skillName: "test-skill",
        summary: "このスキルはファイルを読み書きするためのスキルです",
        goals: ["ファイル操作を安全に自動化する"],
      }),
    );

    service = new SkillCreatorService(undefined, undefined, mockLlmClient);
  });

  describe("正常系: LLM による purpose 抽出", () => {
    it("TC-01: extract-purpose エージェント定義が LLM の system prompt に渡される", async () => {
      mockResourceLoader.loadAgent.mockResolvedValue("mock-agent-definition");

      await service.createSkill({
        name: "test-skill",
        description: "テスト説明",
        mode: "create",
      });

      expect(mockLlmClient.generate).toHaveBeenCalledWith(
        expect.objectContaining({
          system: "mock-agent-definition",
        }),
      );
    });

    it("TC-02: llmClient.generate が正しい system/user 引数で呼び出される", async () => {
      mockResourceLoader.loadAgent.mockResolvedValue("agent-def");

      await service.createSkill({
        name: "my-skill",
        description: "my description",
        mode: "create",
      });

      expect(mockLlmClient.generate).toHaveBeenCalledWith({
        system: "agent-def",
        user: "スキル名: my-skill\n説明: my description",
      });
    });

    it("TC-03: JSON 応答の summary が structurePlan.purpose に格納される", async () => {
      const llmPurpose = "LLM生成のpurpose文字列";
      mockLlmClient.generate.mockResolvedValue(
        JSON.stringify({
          skillName: "test-skill",
          summary: llmPurpose,
          goals: ["goal-1"],
        }),
      );
      mockResourceLoader.loadAgent.mockResolvedValue("agent-def");

      const structurePlan = await (
        service as unknown as {
          runCreateWorkflow: (
            opts: { name: string; description: string; mode: string },
            signal?: AbortSignal,
          ) => Promise<{ purpose: string } | null>;
        }
      ).runCreateWorkflow({
        name: "test-skill",
        description: "テスト説明",
        mode: "create",
      });

      expect(structurePlan?.purpose).toBe(llmPurpose);
    });

    it("TC-03b: JSON ではない応答はそのまま purpose に格納される", async () => {
      const llmPurpose = "プレーンテキストのpurpose";
      mockLlmClient.generate.mockResolvedValue(llmPurpose);
      mockResourceLoader.loadAgent.mockResolvedValue("agent-def");

      const structurePlan = await (
        service as unknown as {
          runCreateWorkflow: (opts: {
            name: string;
            description: string;
            mode: string;
          }) => Promise<{ purpose: string } | null>;
        }
      ).runCreateWorkflow({
        name: "test-skill",
        description: "テスト説明",
        mode: "create",
      });

      expect(structurePlan?.purpose).toBe(llmPurpose);
    });

    it("TC-06: generate が空文字を返す場合、purpose に空文字が格納される", async () => {
      mockLlmClient.generate.mockResolvedValue("   ");
      mockResourceLoader.loadAgent.mockResolvedValue("agent-def");

      const structurePlan = await (
        service as unknown as {
          runCreateWorkflow: (opts: {
            name: string;
            description: string;
            mode: string;
          }) => Promise<{ purpose: string } | null>;
        }
      ).runCreateWorkflow({
        name: "test-skill",
        description: "テスト説明",
        mode: "create",
      });

      expect(structurePlan?.purpose).toBe("");
    });
  });

  describe("異常系: LLM 呼び出し失敗時のエラーハンドリング", () => {
    it("TC-04: LLM 呼び出し失敗時も createSkill は成功する（フォールバック）", async () => {
      mockLlmClient.generate.mockRejectedValue(
        new Error("LLM connection failed"),
      );

      await expect(
        service.createSkill({
          name: "test-skill",
          description: "テスト説明",
          mode: "create",
        }),
      ).resolves.toContain("test-skill");
    });

    it("TC-07: loadAgent 失敗時も createSkill は成功する", async () => {
      mockResourceLoader.loadAgent.mockRejectedValue(
        new Error("Agent file not found"),
      );

      await expect(
        service.createSkill({
          name: "test-skill",
          description: "テスト説明",
          mode: "create",
        }),
      ).resolves.toContain("test-skill");
    });

    it("TC-08: AbortError は createSkill から rethrow される", async () => {
      const abortError = new Error("AbortError");
      abortError.name = "AbortError";
      mockLlmClient.generate.mockRejectedValue(abortError);

      const controller = new AbortController();
      controller.abort();

      await expect(
        service.createSkill({
          name: "test-skill",
          description: "テスト説明",
          mode: "create",
        }),
      ).rejects.toThrow();
    });
  });

  describe("回帰: 既存テストへの影響なし", () => {
    it("TC-05: llmClient なしでも createSkill が正常に動作する（後方互換）", async () => {
      const serviceWithoutLlm = new SkillCreatorService();

      await expect(
        serviceWithoutLlm.createSkill({
          name: "legacy-skill",
          description: "レガシースキル",
          mode: "create",
        }),
      ).resolves.toContain("legacy-skill");
    });

    it("TC-09: llmClient なし時の structurePlan.purpose は options.description と一致する", async () => {
      const serviceWithoutLlm = new SkillCreatorService();
      const description = "レガシースキルの説明";

      const structurePlan = await (
        serviceWithoutLlm as unknown as {
          runCreateWorkflow: (opts: {
            name: string;
            description: string;
            mode: string;
          }) => Promise<{ purpose: string } | null>;
        }
      ).runCreateWorkflow({
        name: "legacy-skill",
        description,
        mode: "create",
      });

      expect(structurePlan?.purpose).toBe(description);
    });
  });
});

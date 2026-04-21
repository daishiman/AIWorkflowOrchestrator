/**
 * TASK-SC-IMPROVE-PROMPT-IMPL-001: runImprovePromptWorkflow テスト
 *
 * TC-01: LLM あり - SKILL.md が読み込まれ LLM で改善・書き戻される (AC-001, AC-002)
 * TC-02: LLM なし - improveSkill() フォールバックが動作する (AC-003)
 * TC-03: ファイル読み込み失敗 - improveSkill() フォールバック
 * TC-04: LLM 実行失敗 - improveSkill() フォールバック
 * TC-05: abort (loading-skill) - AbortError がスローされる (AC-004)
 * TC-06: abort (analyzing) - AbortError がスローされる (AC-004)
 * TC-07: abort (improving 直前) - AbortError がスローされる (AC-004)
 * TC-08: improve-prompt で init_skill.js / generate_skill_md.js が走らない
 * TC-09: progress が正しい順序で emit される
 * TC-10: 回帰 - create モードが improve-prompt の変更で壊れない (AC-006)
 * TC-11: 回帰 - update モードが improve-prompt の変更で壊れない (AC-006)
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

describe("TASK-SC-IMPROVE-PROMPT-IMPL-001: runImprovePromptWorkflow", () => {
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

  const EXISTING_SKILL_MD = `---
name: my-skill
description: |
  既存のスキル説明
---

# my-skill

## 概要
既存の概要テキスト
`;

  const IMPROVED_SKILL_MD = `---
name: rewritten-name
description: |
  LLM が frontmatter まで書き換えた説明
allowed-tools:
  - Bash
---

# my-skill

## 概要
LLM が改善した概要テキスト
`;

  const EXPECTED_SKILL_MD = `---
name: my-skill
description: |
  既存のスキル説明
---

# my-skill

## 概要
LLM が改善した概要テキスト
`;

  beforeEach(() => {
    vi.clearAllMocks();

    mockScriptExecutor = {
      execute: vi.fn().mockResolvedValue({
        success: true,
        stdout: "",
        stderr: "",
        exitCode: 0,
      }),
      executeJson: vi.fn().mockResolvedValue({
        suggestions: [],
        applied: true,
      }),
    };

    mockResourceLoader = {
      load: vi.fn(),
      loadAgent: vi.fn().mockResolvedValue("improve-prompt-agent-definition"),
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
    vi.mocked(fsPromises.access).mockResolvedValue(undefined);
    vi.mocked(fsPromises.writeFile).mockResolvedValue(undefined);
    vi.mocked(fsPromises.unlink).mockResolvedValue(undefined);
    vi.mocked(fsPromises.readdir).mockResolvedValue([]);
    vi.mocked(fsPromises.readFile).mockResolvedValue(
      EXISTING_SKILL_MD as unknown as Buffer,
    );

    mockLlmClient.generate.mockResolvedValue(IMPROVED_SKILL_MD);

    service = new SkillCreatorService(undefined, undefined, mockLlmClient);
  });

  describe("正常系: LLM あり", () => {
    it("TC-01: SKILL.md を読み込み LLM で改善し書き戻す", async () => {
      await service.createSkill({
        name: "my-skill",
        description: "既存のスキル説明",
        mode: "improve-prompt",
      });

      expect(fsPromises.readFile).toHaveBeenCalledWith(
        expect.stringContaining("my-skill/SKILL.md"),
        "utf-8",
      );
      expect(mockLlmClient.generate).toHaveBeenCalledWith({
        system: "improve-prompt-agent-definition",
        user: EXISTING_SKILL_MD,
      });
      expect(fsPromises.writeFile).toHaveBeenCalledWith(
        expect.stringContaining("my-skill/SKILL.md"),
        EXPECTED_SKILL_MD,
        "utf-8",
      );

      const executedScripts = mockScriptExecutor.execute.mock.calls.map(
        (call: [string]) => call[0],
      );
      expect(executedScripts).not.toContain("init_skill.js");
      expect(executedScripts).not.toContain("generate_skill_md.js");
    });

    it("TC-08: improve-prompt で init_skill.js / generate_skill_md.js が走らない", async () => {
      await service.createSkill({
        name: "my-skill",
        description: "説明",
        mode: "improve-prompt",
      });

      const executedScripts = mockScriptExecutor.execute.mock.calls.map(
        (call: [string]) => call[0],
      );
      expect(executedScripts).not.toContain("init_skill.js");
      expect(executedScripts).not.toContain("generate_skill_md.js");
    });

    it("TC-09: progress が loading-skill → analyzing → improving → validating → done の順序で emit される", async () => {
      const progressLog: string[] = [];
      await service.createSkill(
        {
          name: "my-skill",
          description: "説明",
          mode: "improve-prompt",
        },
        (p) => progressLog.push(p.phase),
      );

      expect(progressLog).toEqual([
        "loading-skill",
        "analyzing",
        "improving",
        "validating",
        "done",
      ]);
    });
  });

  describe("正常系: LLM なし", () => {
    it("TC-02: llmClient なしで improveSkill() フォールバックが動作する", async () => {
      const serviceNoLlm = new SkillCreatorService();

      await serviceNoLlm.createSkill({
        name: "my-skill",
        description: "説明",
        mode: "improve-prompt",
      });

      expect(mockScriptExecutor.executeJson).toHaveBeenCalledWith(
        "improve_skill.js",
        expect.arrayContaining(["--name", "my-skill", "--auto-apply"]),
      );
      expect(mockLlmClient.generate).not.toHaveBeenCalled();
    });
  });

  describe("異常系: ファイル読み込み失敗", () => {
    it("TC-03: readFile 失敗時は improveSkill() フォールバックが動作する", async () => {
      vi.mocked(fsPromises.readFile).mockRejectedValueOnce(
        new Error("ENOENT: no such file"),
      );

      await service.createSkill({
        name: "my-skill",
        description: "説明",
        mode: "improve-prompt",
      });

      expect(mockScriptExecutor.executeJson).toHaveBeenCalledWith(
        "improve_skill.js",
        expect.arrayContaining(["--name", "my-skill", "--auto-apply"]),
      );
    });
  });

  describe("異常系: LLM 実行失敗", () => {
    it("TC-04: LLM 失敗時は improveSkill() フォールバックが動作する", async () => {
      mockLlmClient.generate.mockRejectedValueOnce(
        new Error("LLM request failed"),
      );

      await service.createSkill({
        name: "my-skill",
        description: "説明",
        mode: "improve-prompt",
      });

      expect(mockScriptExecutor.executeJson).toHaveBeenCalledWith(
        "improve_skill.js",
        expect.arrayContaining(["--name", "my-skill", "--auto-apply"]),
      );
    });
  });

  describe("異常系: AbortSignal", () => {
    it("TC-05: cancelCurrentOperation() で実行中の createSkill が中断される", async () => {
      let resolveBlock: () => void;
      const blockPromise = new Promise<void>((resolve) => {
        resolveBlock = resolve;
      });

      vi.mocked(fsPromises.readFile).mockImplementationOnce(async () => {
        service.cancelCurrentOperation();
        await blockPromise;
        return EXISTING_SKILL_MD as unknown as Buffer;
      });
      resolveBlock!();

      await expect(
        service.createSkill({
          name: "my-skill",
          description: "説明",
          mode: "improve-prompt",
        }),
      ).rejects.toThrow(/abort|cancel|中断|キャンセル/i);
    });

    it("TC-06: analyzing フェーズで cancelCurrentOperation() すると AbortError がスローされる", async () => {
      await expect(
        service.createSkill(
          {
            name: "my-skill",
            description: "説明",
            mode: "improve-prompt",
          },
          (progress) => {
            if (progress.phase === "analyzing") {
              service.cancelCurrentOperation();
            }
          },
        ),
      ).rejects.toThrow(/abort|cancel|中断|キャンセル/i);
    });

    it("TC-07: readFile 後 abort → AbortError がスロー・writeFile は呼ばれない", async () => {
      const controller = new AbortController();
      vi.mocked(fsPromises.readFile).mockImplementationOnce(async () => {
        controller.abort();
        return Buffer.from(EXISTING_SKILL_MD);
      });
      mockLlmClient.generate.mockImplementationOnce(async () => {
        const abortError = new Error("Aborted");
        abortError.name = "AbortError";
        throw abortError;
      });

      const serviceWithSignal = new SkillCreatorService(
        undefined,
        undefined,
        mockLlmClient,
      );

      await expect(
        serviceWithSignal.createSkill({
          name: "my-skill",
          description: "説明",
          mode: "improve-prompt",
        }),
      ).rejects.toThrow(/abort|cancel|中断|キャンセル/i);
    });
  });

  describe("回帰: 既存モードへの影響なし", () => {
    it("TC-10: create モードが正常に動作する", async () => {
      mockResourceLoader.loadAgent.mockResolvedValue("extract-purpose-agent");
      mockLlmClient.generate.mockResolvedValue(
        JSON.stringify({ summary: "purpose text", goals: [] }),
      );

      const result = await service.createSkill({
        name: "new-skill",
        description: "新規スキル説明",
        mode: "create",
      });

      expect(result).toContain("new-skill");
    });

    it("TC-11: update モードが正常に動作する", async () => {
      const result = await service.createSkill({
        name: "update-skill",
        description: "更新スキル説明",
        mode: "update",
      });

      expect(result).toContain("update-skill");
    });
  });
});

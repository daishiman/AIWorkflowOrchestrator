/**
 * TASK-SW-STRUCT-LLM-002: generateFeaturesWithLlm テスト
 *
 * runCreateWorkflow() が features: [] ではなく LLM 生成の非空配列を返すことを検証する。
 *
 * TC-01: generate_features.js が呼ばれること
 * TC-02: 返却された features が非空配列（length >= 1）であること
 * TC-03: LLM失敗（scriptが失敗）時に features: [] でフォールバックすること
 * TC-04: generateSkillMd 用 plan に features が渡されること
 * TC-05: generate_skill_md.js 出力に features が含まれること
 * TC-06: create ワークフローの他のフィールドが影響を受けないこと
 * TC-07: runCreateWorkflow が null 以外を返すこと
 * TC-08: parseFeaturesResponse が stdout を正しく解析できること
 * TC-09: parseFeaturesResponse がJSON配列のない文字列に対してエラーをスローすること
 * TC-10: 空のdescriptionでも generateFeaturesWithLlm がフォールバック（[]）を返すこと
 * TC-11: 長いdescription（1000文字超）でもエラーなく動作すること
 * TC-12: parseFeaturesResponse が空配列に対してエラーをスローすること
 * TC-13: parseFeaturesResponse が文字列以外の要素を除去すること
 * TC-14: タイムアウトエラー時に features: [] でフォールバックすること
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import os from "os";
import path from "path";
import * as fsPromises from "fs/promises";
import { SkillCreatorService } from "../SkillCreatorService";
import { ScriptExecutor } from "../ScriptExecutor";
import { ResourceLoader } from "../ResourceLoader";

vi.mock("../ScriptExecutor");
vi.mock("../ResourceLoader");
vi.mock("fs/promises");

/** runCreateWorkflow の戻り値型（private アクセス用） */
type RunCreateWorkflowResult = {
  skillName: string;
  description: string;
  purpose: string;
  features: string[];
  agents: string[];
};

describe("STRUCT-LLM-002: generateFeaturesWithLlm", () => {
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
        stdout: '["機能1を実行する", "機能2を処理する", "結果を返す"]',
        stderr: "",
        exitCode: 0,
      }),
      executeJson: vi.fn(),
    };

    mockResourceLoader = {
      load: vi.fn(),
      loadAgent: vi.fn().mockResolvedValue("mock-agent-content"),
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

    service = new SkillCreatorService();
  });

  // TC-01: generate_features.js が呼ばれること
  it("TC-01: runCreateWorkflow が generate_features.js を呼び出す", async () => {
    await (
      service as unknown as {
        runCreateWorkflow: (opts: {
          name: string;
          description: string;
          mode: string;
        }) => Promise<RunCreateWorkflowResult>;
      }
    ).runCreateWorkflow({
      name: "test-skill",
      description: "テスト用スキルの説明",
      mode: "create",
    });

    // signal が undefined のとき executeScript は2引数で scriptExecutor.execute を呼ぶ
    expect(mockScriptExecutor.execute).toHaveBeenCalledWith(
      "generate_features.js",
      expect.arrayContaining(["--description", "テスト用スキルの説明"]),
    );
  });

  // TC-02: 返却された features が非空配列（length >= 1）であること
  it("TC-02: runCreateWorkflow が返す structurePlan.features は非空配列である", async () => {
    const structurePlan = await (
      service as unknown as {
        runCreateWorkflow: (opts: {
          name: string;
          description: string;
          mode: string;
        }) => Promise<RunCreateWorkflowResult>;
      }
    ).runCreateWorkflow({
      name: "test-skill",
      description: "テスト用スキルの説明",
      mode: "create",
    });

    expect(structurePlan).not.toBeNull();
    expect(Array.isArray(structurePlan!.features)).toBe(true);
    expect(structurePlan!.features.length).toBeGreaterThanOrEqual(1);
  });

  // TC-03: LLM失敗（scriptが失敗）時に features: [] でフォールバックすること
  it("TC-03: generate_features.js 失敗時に features: [] でフォールバックする", async () => {
    mockScriptExecutor.execute.mockResolvedValue({
      success: false,
      stdout: "",
      stderr: "Error: claude CLI not found",
      exitCode: 1,
    });

    const structurePlan = await (
      service as unknown as {
        runCreateWorkflow: (opts: {
          name: string;
          description: string;
          mode: string;
        }) => Promise<RunCreateWorkflowResult>;
      }
    ).runCreateWorkflow({
      name: "test-skill",
      description: "テスト用スキルの説明",
      mode: "create",
    });

    expect(structurePlan).not.toBeNull();
    expect(structurePlan!.features).toEqual([]);
  });

  // TC-04: generateSkillMd 呼び出し時に features が plan.workflow.features へ渡されること
  it("TC-04: generateSkillMd 用 plan.workflow.features に structurePlan.features が渡される", async () => {
    const structurePlan = await (
      service as unknown as {
        runCreateWorkflow: (opts: {
          name: string;
          description: string;
          mode: string;
        }) => Promise<RunCreateWorkflowResult>;
      }
    ).runCreateWorkflow({
      name: "test-skill",
      description: "テスト用スキルの説明",
      mode: "create",
    });

    const skillDir = path.join(os.tmpdir(), "skill-features-plan");
    const skillMdPath = path.join(skillDir, "SKILL.md");

    vi.mocked(fsPromises.access).mockImplementation(async (targetPath) => {
      if (targetPath === skillMdPath) {
        return undefined;
      }
      throw new Error("ENOENT");
    });
    vi.mocked(fsPromises.writeFile).mockImplementation(
      async (targetPath, data) => {
        if (String(targetPath).includes("skill-plan-")) {
          const plan = JSON.parse(String(data)) as {
            workflow: { features?: string[] };
          };
          expect(plan.workflow.features).toEqual(structurePlan!.features);
        }
      },
    );

    mockScriptExecutor.execute.mockResolvedValueOnce({
      success: true,
      stdout: "",
      stderr: "",
      exitCode: 0,
    });

    await (
      service as unknown as {
        generateSkillMd: (
          skillDir: string,
          structurePlan: RunCreateWorkflowResult,
          signal?: AbortSignal,
        ) => Promise<void>;
      }
    ).generateSkillMd(skillDir, structurePlan!);
  });

  // TC-05: SKILL.md に features が反映されること
  it("TC-05: generate_skill_md.js 出力へ features frontmatter と section が含まれる", async () => {
    mockScriptExecutor.execute.mockResolvedValue({
      success: true,
      stdout:
        '["ファイルを読み込む", "データを変換する", "結果をファイルに保存する"]',
      stderr: "",
      exitCode: 0,
    });

    const structurePlan = await (
      service as unknown as {
        runCreateWorkflow: (opts: {
          name: string;
          description: string;
          mode: string;
        }) => Promise<RunCreateWorkflowResult>;
      }
    ).runCreateWorkflow({
      name: "file-processor",
      description: "ファイルを処理するスキル",
      mode: "create",
    });

    const skillDir = path.join(os.tmpdir(), "skill-features-output");
    const skillMdPath = path.join(skillDir, "SKILL.md");

    vi.mocked(fsPromises.access).mockImplementation(async (targetPath) => {
      if (targetPath === skillMdPath) {
        return undefined;
      }
      throw new Error("ENOENT");
    });
    vi.mocked(fsPromises.writeFile).mockImplementation(
      async (targetPath, data) => {
        if (targetPath === skillMdPath) {
          const content = String(data);
          expect(content).toContain("features:");
          expect(content).toContain("  - ファイルを読み込む");
          expect(content).toContain("## Features");
          expect(content).toContain("- データを変換する");
        }
      },
    );

    mockScriptExecutor.execute.mockResolvedValueOnce({
      success: true,
      stdout: "",
      stderr: "",
      exitCode: 0,
    });

    await (
      service as unknown as {
        generateSkillMd: (
          skillDir: string,
          structurePlan: RunCreateWorkflowResult,
          signal?: AbortSignal,
        ) => Promise<void>;
      }
    ).generateSkillMd(skillDir, structurePlan!);
  });

  // TC-06: create ワークフローの他のフィールド（purpose・agents・skillName・description）が影響を受けないこと
  it("TC-06: features 変更が他のフィールドに影響を与えない", async () => {
    const description = "他のフィールドテスト用スキル";
    const structurePlan = await (
      service as unknown as {
        runCreateWorkflow: (opts: {
          name: string;
          description: string;
          mode: string;
        }) => Promise<RunCreateWorkflowResult>;
      }
    ).runCreateWorkflow({
      name: "other-fields-skill",
      description,
      mode: "create",
    });

    expect(structurePlan).not.toBeNull();
    expect(structurePlan!.skillName).toBe("other-fields-skill");
    expect(structurePlan!.description).toBe(description);
    expect(structurePlan!.purpose).toBe(description);
    expect(structurePlan!.agents).toEqual([
      "extract-purpose",
      "plan-structure",
    ]);
  });

  // TC-07: runCreateWorkflow が null 以外を返すこと
  it("TC-07: runCreateWorkflow が null 以外を返す（エラーが起きていない）", async () => {
    const structurePlan = await (
      service as unknown as {
        runCreateWorkflow: (opts: {
          name: string;
          description: string;
          mode: string;
        }) => Promise<RunCreateWorkflowResult | null>;
      }
    ).runCreateWorkflow({
      name: "test-skill",
      description: "テスト用スキル",
      mode: "create",
    });

    expect(structurePlan).not.toBeNull();
  });

  // TC-08: parseFeaturesResponse が description を含む stdout を正しく解析できること
  it("TC-08: parseFeaturesResponse が JSON配列を含む stdout を正しく解析できる", () => {
    const response =
      'いくつか考えてみます。\n["機能A", "機能B", "機能C"]\n以上です。';
    const result = (
      service as unknown as {
        parseFeaturesResponse: (response: string) => string[];
      }
    ).parseFeaturesResponse(response);

    expect(result).toEqual(["機能A", "機能B", "機能C"]);
  });

  // TC-09: parseFeaturesResponse がJSON配列のない文字列に対してエラーをスローすること
  it("TC-09: parseFeaturesResponse がJSON配列のない文字列に対してエラーをスローする", () => {
    const response = "これは配列を含まない文字列です。";

    expect(() =>
      (
        service as unknown as {
          parseFeaturesResponse: (response: string) => string[];
        }
      ).parseFeaturesResponse(response),
    ).toThrow();
  });

  // TC-10: 空のdescriptionでも generateFeaturesWithLlm がフォールバック（[]）を返すこと
  it("TC-10: 空のdescriptionでも generateFeaturesWithLlm がフォールバック（[]）を返す", async () => {
    mockScriptExecutor.execute.mockResolvedValue({
      success: false,
      stdout: "",
      stderr: "Error: description is empty",
      exitCode: 2,
    });

    const result = await (
      service as unknown as {
        generateFeaturesWithLlm: (
          description: string,
          signal?: AbortSignal,
        ) => Promise<string[]>;
      }
    ).generateFeaturesWithLlm("");

    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual([]);
  });

  // TC-11: 長いdescription（1000文字超）でもエラーなく動作すること
  it("TC-11: 長いdescription（1000文字超）でもエラーなく動作する", async () => {
    const longDescription = "あ".repeat(1100);

    const structurePlan = await (
      service as unknown as {
        runCreateWorkflow: (opts: {
          name: string;
          description: string;
          mode: string;
        }) => Promise<RunCreateWorkflowResult | null>;
      }
    ).runCreateWorkflow({
      name: "long-desc-skill",
      description: longDescription,
      mode: "create",
    });

    expect(structurePlan).not.toBeNull();
    expect(Array.isArray(structurePlan!.features)).toBe(true);
  });

  // TC-12: parseFeaturesResponse が空配列に対してエラーをスローすること
  it("TC-12: parseFeaturesResponse が空配列に対してエラーをスローする", () => {
    const response = "[]";

    expect(() =>
      (
        service as unknown as {
          parseFeaturesResponse: (response: string) => string[];
        }
      ).parseFeaturesResponse(response),
    ).toThrow();
  });

  // TC-13: parseFeaturesResponse が文字列以外の要素を除去すること
  it("TC-13: parseFeaturesResponse が文字列以外の要素を除去する", () => {
    const response = '["機能1", 123, null, "機能2", true, "機能3"]';
    const result = (
      service as unknown as {
        parseFeaturesResponse: (response: string) => string[];
      }
    ).parseFeaturesResponse(response);

    expect(result).toEqual(["機能1", "機能2", "機能3"]);
  });

  // TC-14: タイムアウトエラー時に features: [] でフォールバックすること
  it("TC-14: タイムアウトエラー時に features: [] でフォールバックする", async () => {
    const timeoutError = new Error("Command timed out");
    mockScriptExecutor.execute.mockRejectedValue(timeoutError);

    const result = await (
      service as unknown as {
        generateFeaturesWithLlm: (
          description: string,
          signal?: AbortSignal,
        ) => Promise<string[]>;
      }
    ).generateFeaturesWithLlm("タイムアウトテスト用スキル");

    expect(result).toEqual([]);
  });
});

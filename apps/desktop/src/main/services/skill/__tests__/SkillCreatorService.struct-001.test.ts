/**
 * TASK-SW-STRUCT-001: StructurePlanJson フィールド仕様テスト
 *
 * runCreateWorkflow() が返す StructurePlanJson の各フィールドが
 * 意味的に正しい値であることを検証する。
 *
 * TC-01: purpose === options.description (AC-1)
 * TC-02: agents === ["extract-purpose", "plan-structure"] (AC-2)
 * TC-03: features === [] (AC-3)
 * TC-04: createSkill() は runCreateWorkflow が throw しても成功する (AC-4)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fsPromises from "fs/promises";
import { SkillCreatorService } from "../SkillCreatorService";
import { ScriptExecutor } from "../ScriptExecutor";
import { ResourceLoader } from "../ResourceLoader";

vi.mock("../ScriptExecutor");
vi.mock("../ResourceLoader");
vi.mock("fs/promises");

describe("STRUCT-001: runCreateWorkflow output spec", () => {
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

  // TC-01: AC-1 — structurePlan.purpose === options.description
  it("TC-01: runCreateWorkflow が返す structurePlan.purpose は options.description と一致する", async () => {
    const description = "このスキルはファイルを読み書きするためのスキルです";

    const structurePlan = await (
      service as unknown as {
        runCreateWorkflow: (opts: {
          name: string;
          description: string;
          mode: string;
        }) => Promise<{
          purpose: string;
          agents: string[];
          features: string[];
        }>;
      }
    ).runCreateWorkflow({
      name: "test-skill",
      description,
      mode: "create",
    });

    expect(structurePlan).not.toBeNull();
    expect(structurePlan!.purpose).toBe(description);
  });

  // TC-02: AC-2 — structurePlan.agents === ["extract-purpose", "plan-structure"]
  it('TC-02: runCreateWorkflow が返す structurePlan.agents は ["extract-purpose", "plan-structure"] である', async () => {
    const structurePlan = await (
      service as unknown as {
        runCreateWorkflow: (opts: {
          name: string;
          description: string;
          mode: string;
        }) => Promise<{
          purpose: string;
          agents: string[];
          features: string[];
        }>;
      }
    ).runCreateWorkflow({
      name: "test-skill",
      description: "テスト用スキル",
      mode: "create",
    });

    expect(structurePlan).not.toBeNull();
    expect(structurePlan!.agents).toEqual([
      "extract-purpose",
      "plan-structure",
    ]);
  });

  // TC-03: AC-3 — structurePlan.features === []
  it("TC-03: runCreateWorkflow が返す structurePlan.features は空配列である", async () => {
    const structurePlan = await (
      service as unknown as {
        runCreateWorkflow: (opts: {
          name: string;
          description: string;
          mode: string;
        }) => Promise<{
          purpose: string;
          agents: string[];
          features: string[];
        }>;
      }
    ).runCreateWorkflow({
      name: "test-skill",
      description: "テスト用スキル",
      mode: "create",
    });

    expect(structurePlan).not.toBeNull();
    expect(structurePlan!.features).toEqual([]);
  });

  // TC-04: AC-4 — runCreateWorkflow が throw しても createSkill() は成功する
  it("TC-04: runCreateWorkflow が例外を throw しても createSkill() は成功する", async () => {
    // runCreateWorkflow を強制的に例外スローさせる
    vi.spyOn(
      service as unknown as { runCreateWorkflow: () => Promise<null> },
      "runCreateWorkflow",
    ).mockRejectedValue(new Error("unexpected internal error"));

    // createSkill() は例外をスローしない（フォールバックで継続）
    await expect(
      service.createSkill({
        name: "test-skill",
        description: "テスト用スキル",
        mode: "create",
      }),
    ).resolves.not.toThrow();
  });
});

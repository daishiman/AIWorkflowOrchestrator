/**
 * SkillCreatorService - 進捗コールバック ユニットテスト
 * TASK-SW-STREAM-001: createSkill() onProgress コールバック
 *
 * TC-01: onProgress が省略可能であること（undefined でクラッシュしない）
 * TC-02: createSkill が onProgress コールバックを呼び出すこと
 * TC-03: 最初の進捗コールバックが phase="planning" percentage=10 で呼ばれること
 * TC-04: percentage=40 の generating-skill 進捗が呼ばれること
 * TC-05: percentage=70 の generating-agents 進捗が呼ばれること
 * TC-06: percentage=90 の validating 進捗が呼ばれること
 * TC-07: 最後の進捗が phase="done" percentage=100 で呼ばれること
 * TC-08: 全 5 回の進捗コールバックが呼ばれること
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fsPromises from "fs/promises";
import { SkillCreatorService } from "../SkillCreatorService";
import { ScriptExecutor } from "../ScriptExecutor";
import { ResourceLoader } from "../ResourceLoader";
import type { CreateSkillOptions } from "@repo/shared/types";

vi.mock("../ScriptExecutor");
vi.mock("../ResourceLoader");
vi.mock("fs/promises");

describe("SkillCreatorService.createSkill - 進捗コールバック (TASK-SW-STREAM-001)", () => {
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

  const allowSuccessfulCreate = () => {
    mockScriptExecutor.execute.mockImplementation(async () => ({
      success: true,
      stdout: "",
      stderr: "",
      exitCode: 0,
    }));
    vi.mocked(fsPromises.access).mockImplementation(async (target) => {
      const resolved = String(target);
      if (/test-skill[\\/]SKILL\.md$/.test(resolved)) return;
      throw new Error("ENOENT");
    });
  };

  const defaultOptions: CreateSkillOptions = {
    name: "test-skill",
    description: "テスト用スキル",
    mode: "create",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockScriptExecutor = {
      execute: vi.fn(),
      executeJson: vi.fn(),
    };
    mockResourceLoader = {
      load: vi.fn(),
      loadAgent: vi.fn(),
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

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("TC-01: onProgress を省略しても createSkill() がクラッシュしない", async () => {
    allowSuccessfulCreate();

    await expect(service.createSkill(defaultOptions)).resolves.not.toThrow();
  });

  it("TC-02: onProgress コールバックが 1 回以上呼ばれること", async () => {
    allowSuccessfulCreate();
    const onProgress = vi.fn();

    await service.createSkill(defaultOptions, onProgress);

    expect(onProgress).toHaveBeenCalled();
  });

  it("TC-03: 最初の進捗コールバックが phase='planning' percentage=10 で呼ばれること", async () => {
    allowSuccessfulCreate();
    const onProgress = vi.fn();

    await service.createSkill(defaultOptions, onProgress);

    const calls = onProgress.mock.calls.map(([arg]) => arg);
    const planningCall = calls.find((c) => c.phase === "planning");
    expect(planningCall).toBeDefined();
    expect(planningCall?.percentage).toBe(10);
    expect(typeof planningCall?.message).toBe("string");
  });

  it("TC-04: phase='generating-skill' percentage=40 の進捗が呼ばれること", async () => {
    allowSuccessfulCreate();
    const onProgress = vi.fn();

    await service.createSkill(defaultOptions, onProgress);

    const calls = onProgress.mock.calls.map(([arg]) => arg);
    const generatingSkillCall = calls.find(
      (c) => c.phase === "generating-skill",
    );
    expect(generatingSkillCall).toBeDefined();
    expect(generatingSkillCall?.percentage).toBe(40);
  });

  it("TC-05: phase='generating-agents' percentage=70 の進捗が呼ばれること", async () => {
    allowSuccessfulCreate();
    const onProgress = vi.fn();

    await service.createSkill(defaultOptions, onProgress);

    const calls = onProgress.mock.calls.map(([arg]) => arg);
    const generatingAgentsCall = calls.find(
      (c) => c.phase === "generating-agents",
    );
    expect(generatingAgentsCall).toBeDefined();
    expect(generatingAgentsCall?.percentage).toBe(70);
  });

  it("TC-06: phase='validating' percentage=90 の進捗が呼ばれること", async () => {
    allowSuccessfulCreate();
    const onProgress = vi.fn();

    await service.createSkill(defaultOptions, onProgress);

    const calls = onProgress.mock.calls.map(([arg]) => arg);
    const validatingCall = calls.find((c) => c.phase === "validating");
    expect(validatingCall).toBeDefined();
    expect(validatingCall?.percentage).toBe(90);
  });

  it("TC-07: 最後の進捗が phase='done' percentage=100 で呼ばれること", async () => {
    allowSuccessfulCreate();
    const onProgress = vi.fn();

    await service.createSkill(defaultOptions, onProgress);

    const calls = onProgress.mock.calls.map(([arg]) => arg);
    const doneCall = calls.find((c) => c.phase === "done");
    expect(doneCall).toBeDefined();
    expect(doneCall?.percentage).toBe(100);
  });

  it("TC-08: 合計 5 回の進捗コールバックが呼ばれること", async () => {
    allowSuccessfulCreate();
    const onProgress = vi.fn();

    await service.createSkill(defaultOptions, onProgress);

    expect(onProgress).toHaveBeenCalledTimes(5);
  });
});

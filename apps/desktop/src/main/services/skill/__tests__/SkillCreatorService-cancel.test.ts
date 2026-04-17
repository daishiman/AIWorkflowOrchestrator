/**
 * SkillCreatorService - cancelCurrentOperation ユニットテスト
 * TASK-SW-CANCEL-003: cancelCurrentOperation() メソッド
 *
 * TC-01: cancelCurrentOperation() メソッドが public で存在すること
 * TC-02: cancelCurrentOperation() を呼ぶと AbortController.abort() が呼ばれること
 * TC-03: cancelCurrentOperation() 後に currentAbortController が null になること
 * TC-04: createSkill() 呼び出し中に currentAbortController が設定され、finally でリセットされること
 * TC-05: createSkill() が ScriptExecutor に AbortSignal を渡し、cancelCurrentOperation() で中断されること
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

describe("SkillCreatorService - cancelCurrentOperation (TASK-SW-CANCEL-003)", () => {
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

  it("TC-01: cancelCurrentOperation() メソッドが public で存在すること", () => {
    expect(typeof service.cancelCurrentOperation).toBe("function");
  });

  it("TC-02: cancelCurrentOperation() を 2 回呼んでもクラッシュしないこと（AbortController が null の場合も安全）", () => {
    // AbortController が未設定の状態で呼ぶ
    expect(() => service.cancelCurrentOperation()).not.toThrow();
    // 2 回目も安全
    expect(() => service.cancelCurrentOperation()).not.toThrow();
  });

  it("TC-03: cancelCurrentOperation() 後に currentAbortController が null になること", () => {
    // 内部状態を確認するため private フィールドにアクセス
    service.cancelCurrentOperation();

    const controller = (
      service as unknown as { currentAbortController: unknown }
    ).currentAbortController;
    expect(controller).toBeNull();
  });

  it("TC-04: createSkill() 完了後に currentAbortController が null にリセットされること", async () => {
    // Arrange: 成功するスクリプト実行をモック
    mockScriptExecutor.execute.mockImplementation(async () => ({
      success: true,
      stdout: "",
      stderr: "",
      exitCode: 0,
    }));
    vi.mocked(fsPromises.access).mockImplementation(async (target) => {
      if (/test-skill[\\/]SKILL\.md$/.test(String(target))) return;
      throw new Error("ENOENT");
    });

    const options: CreateSkillOptions = {
      name: "test-skill",
      description: "テスト",
      mode: "create",
    };

    // Act
    await service.createSkill(options);

    // Assert: finally ブロックで null にリセットされる
    const controller = (
      service as unknown as { currentAbortController: unknown }
    ).currentAbortController;
    expect(controller).toBeNull();
  });

  it("TC-05: createSkill() が ScriptExecutor に AbortSignal を渡し、cancelCurrentOperation() で中断されること", async () => {
    const abortError = new Error("Skill creation was aborted");
    abortError.name = "AbortError";
    let capturedSignal: AbortSignal | undefined;

    mockScriptExecutor.execute.mockImplementation(
      (_scriptName, _args, options) => {
        capturedSignal = options?.signal;
        return new Promise((_resolve, reject) => {
          capturedSignal?.addEventListener(
            "abort",
            () => {
              reject(abortError);
            },
            { once: true },
          );
        }) as Promise<{
          success: boolean;
          stdout: string;
          stderr: string;
          exitCode: number;
        }>;
      },
    );

    const options: CreateSkillOptions = {
      name: "test-skill",
      description: "テスト",
      mode: "create",
    };

    const createPromise = service.createSkill(options);

    await Promise.resolve();
    service.cancelCurrentOperation();

    await expect(createPromise).rejects.toMatchObject({ name: "AbortError" });
    expect(capturedSignal).toBeDefined();
    expect(capturedSignal?.aborted).toBe(true);
    expect(
      (service as unknown as { currentAbortController: AbortController | null })
        .currentAbortController,
    ).toBeNull();
  });
});

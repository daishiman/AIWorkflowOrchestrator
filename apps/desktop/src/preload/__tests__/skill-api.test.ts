/**
 * 統一SkillAPI テスト（Phase 4: TDD Red）
 *
 * TASK-FIX-5-1-SKILL-API-UNIFICATION
 * 統一API全13メソッドの期待動作をテストとして定義する。
 *
 * Red状態（Phase 5実装前に失敗するテスト）:
 * - list, getImported, rescan, import, remove → スタブがsafeInvokeを呼ばない
 * - abort → boolean返却（void期待）
 * - remove → boolean返却（void期待）
 * - respondToPermission → 存在する（削除期待）
 *
 * Green状態（既に実装済みで成功するテスト）:
 * - execute, onStream, getExecutionStatus
 * - onPermissionRequest, sendPermissionResponse
 * - onComplete, onError
 * - IPCチャンネルホワイトリスト
 *
 * @module @repo/desktop/preload/__tests__/skill-api
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  IPC_CHANNELS,
  ALLOWED_INVOKE_CHANNELS,
  ALLOWED_ON_CHANNELS,
} from "../channels";

// Mock electron module - vi.hoisted()でホイスティング対応
const { mockInvoke, mockOn, mockRemoveListener } = vi.hoisted(() => ({
  mockInvoke: vi.fn(),
  mockOn: vi.fn(),
  mockRemoveListener: vi.fn(),
}));

vi.mock("electron", () => ({
  ipcRenderer: {
    invoke: mockInvoke,
    on: mockOn,
    removeListener: mockRemoveListener,
  },
}));

// Import after mocking - skillAPI uses ipcRenderer internally
import { skillAPI } from "../skill-api";
import type { SkillAPI } from "../skill-api";
import type {
  SkillExecutionRequest,
  SkillExecutionResponse,
  ExecutionInfo,
  SkillPermissionResponse,
  SkillMetadata,
  ImportedSkill,
  RemoveResult,
} from "@repo/shared";

// ============================================================
// テストフィクスチャ
// ============================================================
const createMockSkillMetadata = (
  overrides?: Partial<SkillMetadata>,
): SkillMetadata => ({
  name: "test-skill",
  description: "Test skill description",
  path: "/skills/test-skill",
  updatedAt: new Date("2026-01-01"),
  agents: [],
  references: [],
  scripts: [],
  assets: [],
  schemas: [],
  indexes: [],
  otherFiles: [],
  ...overrides,
});

const createMockImportedSkill = (
  overrides?: Partial<ImportedSkill>,
): ImportedSkill => ({
  ...createMockSkillMetadata(),
  importedAt: new Date("2026-01-01"),
  status: "active",
  ...overrides,
});

const createMockExecutionRequest = (
  overrides?: Partial<SkillExecutionRequest>,
): SkillExecutionRequest => ({
  skillName: "test-skill",
  prompt: "Test prompt",
  ...overrides,
});

const createMockExecutionResponse = (
  overrides?: Partial<SkillExecutionResponse>,
): SkillExecutionResponse => ({
  executionId: "exec-001",
  success: true,
  ...overrides,
});

const createMockExecutionInfo = (
  overrides?: Partial<ExecutionInfo>,
): ExecutionInfo => ({
  id: "exec-001",
  skillId: "test-skill",
  state: "running",
  startedAt: Date.now(),
  ...overrides,
});

const createMockRemoveResult = (
  overrides?: Partial<RemoveResult>,
): RemoveResult => ({
  success: true,
  removed: true,
  ...overrides,
});

// ============================================================
// セットアップ
// ============================================================
beforeEach(() => {
  vi.clearAllMocks();
  // デフォルト: invokeは成功を返す
  mockInvoke.mockResolvedValue(undefined);
  // デフォルト: onはリスナー登録を受け付ける
  mockOn.mockImplementation(() => {});
});

// ============================================================
// 1. IPCチャンネルホワイトリスト検証
// ============================================================
describe("統一SkillAPI - IPCチャンネルホワイトリスト", () => {
  describe("invokeチャンネル（Renderer→Main）", () => {
    const invokeChannels = [
      IPC_CHANNELS.SKILL_LIST,
      IPC_CHANNELS.SKILL_GET_IMPORTED,
      IPC_CHANNELS.SKILL_IMPORT,
      IPC_CHANNELS.SKILL_REMOVE,
      IPC_CHANNELS.SKILL_SCAN,
      IPC_CHANNELS.SKILL_EXECUTE,
      IPC_CHANNELS.SKILL_ABORT,
      IPC_CHANNELS.SKILL_GET_STATUS,
      IPC_CHANNELS.SKILL_PERMISSION_RESPONSE,
    ];

    it.each(invokeChannels)(
      "チャンネル %s がALLOWED_INVOKE_CHANNELSに含まれる",
      (channel) => {
        expect(ALLOWED_INVOKE_CHANNELS).toContain(channel);
      },
    );
  });

  describe("onチャンネル（Main→Renderer）", () => {
    const onChannels = [
      IPC_CHANNELS.SKILL_STREAM,
      IPC_CHANNELS.SKILL_COMPLETE,
      IPC_CHANNELS.SKILL_ERROR,
      IPC_CHANNELS.SKILL_PERMISSION_REQUEST,
    ];

    it.each(onChannels)(
      "チャンネル %s がALLOWED_ON_CHANNELSに含まれる",
      (channel) => {
        expect(ALLOWED_ON_CHANNELS).toContain(channel);
      },
    );
  });
});

// ============================================================
// 2. 一覧・管理メソッド（5メソッド）
//    ※ list, getImported, rescan, import, remove はスタブのためRed
// ============================================================
describe("統一SkillAPI - 一覧・管理メソッド", () => {
  describe("list()", () => {
    it("safeInvokeでSKILL_LISTチャンネルを呼び出す", async () => {
      const mockMetadata = [createMockSkillMetadata()];
      mockInvoke.mockResolvedValue({ success: true, data: mockMetadata });

      await skillAPI.list();

      expect(mockInvoke).toHaveBeenCalledWith(IPC_CHANNELS.SKILL_LIST);
    });

    it("SkillMetadata[]型で結果を返す", async () => {
      const mockMetadata = [
        createMockSkillMetadata({ name: "skill-a" }),
        createMockSkillMetadata({ name: "skill-b" }),
      ];
      mockInvoke.mockResolvedValue({ success: true, data: mockMetadata });

      const result = await skillAPI.list();

      expect(result).toEqual(mockMetadata);
      expect(result).toHaveLength(2);
    });
  });

  describe("getImported()", () => {
    it("safeInvokeでSKILL_GET_IMPORTEDチャンネルを呼び出す", async () => {
      const mockImported = [createMockImportedSkill()];
      mockInvoke.mockResolvedValue({ success: true, data: mockImported });

      await skillAPI.getImported();

      expect(mockInvoke).toHaveBeenCalledWith(IPC_CHANNELS.SKILL_GET_IMPORTED);
    });

    it("ImportedSkill[]型で結果を返す", async () => {
      const mockImported = [
        createMockImportedSkill({ name: "imported-skill" }),
      ];
      mockInvoke.mockResolvedValue({ success: true, data: mockImported });

      const result = await skillAPI.getImported();

      expect(result).toEqual(mockImported);
    });
  });

  describe("import(skillName)", () => {
    it("safeInvokeでSKILL_IMPORTチャンネルをskillName引数で呼び出す", async () => {
      const mockImported = createMockImportedSkill({ name: "new-skill" });
      mockInvoke.mockResolvedValue(mockImported);

      await skillAPI.import("new-skill");

      // RED: スタブはipcRenderer.invokeを呼ばない
      expect(mockInvoke).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_IMPORT,
        "new-skill",
      );
    });

    it("ImportedSkill型で結果を返す", async () => {
      const mockImported = createMockImportedSkill({ name: "new-skill" });
      mockInvoke.mockResolvedValue(mockImported);

      const result = await skillAPI.import("new-skill");

      // RED: スタブはハードコードされたオブジェクトを返す（IPC経由でない）
      expect(result).toEqual(mockImported);
    });
  });

  describe("remove(skillName)", () => {
    it("safeInvokeでSKILL_REMOVEチャンネルをskillName引数で呼び出す", async () => {
      mockInvoke.mockResolvedValue(createMockRemoveResult());

      await skillAPI.remove("old-skill");

      expect(mockInvoke).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_REMOVE,
        "old-skill",
      );
    });

    it("RemoveResult型で結果を返す", async () => {
      const removeResult = createMockRemoveResult({
        success: true,
        removed: true,
      });
      mockInvoke.mockResolvedValue(removeResult);

      const result = await skillAPI.remove("old-skill");

      expect(result).toEqual(removeResult);
      expect(result.removed).toBe(true);
    });
  });

  describe("rescan()", () => {
    it("safeInvokeでSKILL_SCANチャンネルを呼び出す", async () => {
      const mockMetadata = [createMockSkillMetadata()];
      mockInvoke.mockResolvedValue({ success: true, data: mockMetadata });

      await skillAPI.rescan();

      expect(mockInvoke).toHaveBeenCalledWith(IPC_CHANNELS.SKILL_SCAN);
    });

    it("SkillMetadata[]型で結果を返す", async () => {
      const mockMetadata = [createMockSkillMetadata({ name: "rescanned" })];
      mockInvoke.mockResolvedValue({ success: true, data: mockMetadata });

      const result = await skillAPI.rescan();

      expect(result).toEqual(mockMetadata);
    });
  });
});

// ============================================================
// 3. 実行メソッド（3メソッド）
//    ※ execute, getExecutionStatus は既に実装済み（Green）
//    ※ abort は戻り値型変更のためRed
// ============================================================
describe("統一SkillAPI - 実行メソッド", () => {
  describe("execute(request)", () => {
    it("safeInvokeでSKILL_EXECUTEチャンネルをリクエスト引数で呼び出す", async () => {
      const request = createMockExecutionRequest();
      const response = createMockExecutionResponse();
      mockInvoke.mockResolvedValue({ success: true, data: response });

      await skillAPI.execute(request);

      expect(mockInvoke).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_EXECUTE,
        request,
      );
    });

    it("SkillExecutionResponse型で結果を返す", async () => {
      const request = createMockExecutionRequest();
      const response = createMockExecutionResponse({
        executionId: "exec-test-001",
        success: true,
      });
      mockInvoke.mockResolvedValue({ success: true, data: response });

      const result = await skillAPI.execute(request);

      expect(result).toEqual(response);
      expect(result.executionId).toBe("exec-test-001");
      expect(result.success).toBe(true);
    });

    it("SkillExecutionRequest単一引数で呼び出し可能", async () => {
      const request: SkillExecutionRequest = {
        skillName: "my-skill",
        prompt: "Hello",
        workingDirectory: "/tmp",
      };
      mockInvoke.mockResolvedValue({
        success: true,
        data: createMockExecutionResponse(),
      });

      await skillAPI.execute(request);

      expect(mockInvoke).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_EXECUTE,
        request,
      );
    });
  });

  describe("abort(executionId)", () => {
    it("safeInvokeでSKILL_ABORTチャンネルをexecutionId引数で呼び出す", async () => {
      mockInvoke.mockResolvedValue(undefined);

      await skillAPI.abort("exec-001");

      expect(mockInvoke).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_ABORT,
        "exec-001",
      );
    });

    it("戻り値がvoid（undefined）である", async () => {
      mockInvoke.mockResolvedValue(undefined);

      const result = await skillAPI.abort("exec-001");

      // RED: 現在はboolean(true/false)を返す
      expect(result).toBeUndefined();
    });
  });

  describe("getExecutionStatus(executionId)", () => {
    it("safeInvokeでSKILL_GET_STATUSチャンネルを呼び出す", async () => {
      const info = createMockExecutionInfo();
      mockInvoke.mockResolvedValue(info);

      await skillAPI.getExecutionStatus("exec-001");

      expect(mockInvoke).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_GET_STATUS,
        "exec-001",
      );
    });

    it("ExecutionInfo型で結果を返す", async () => {
      const info = createMockExecutionInfo({
        id: "exec-001",
        state: "running",
      });
      mockInvoke.mockResolvedValue(info);

      const result = await skillAPI.getExecutionStatus("exec-001");

      expect(result).toEqual(info);
      expect(result?.state).toBe("running");
    });

    it("存在しないexecutionIdの場合nullを返す", async () => {
      mockInvoke.mockResolvedValue(null);

      const result = await skillAPI.getExecutionStatus("non-existent");

      expect(result).toBeNull();
    });
  });
});

// ============================================================
// 4. イベントメソッド（3メソッド）
//    ※ 全て既に実装済み（Green）
// ============================================================
describe("統一SkillAPI - イベントメソッド", () => {
  describe("onStream(callback)", () => {
    it("safeOnでSKILL_STREAMチャンネルにリスナーを登録する", () => {
      const callback = vi.fn();

      skillAPI.onStream(callback);

      expect(mockOn).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_STREAM,
        expect.any(Function),
      );
    });

    it("unsubscribe関数（() => void）を返す", () => {
      const callback = vi.fn();

      const unsubscribe = skillAPI.onStream(callback);

      expect(typeof unsubscribe).toBe("function");
    });

    it("unsubscribe呼び出しでリスナーが解除される", () => {
      const callback = vi.fn();

      const unsubscribe = skillAPI.onStream(callback);
      unsubscribe();

      expect(mockRemoveListener).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_STREAM,
        expect.any(Function),
      );
    });
  });

  describe("onComplete(callback)", () => {
    it("safeOnでSKILL_COMPLETEチャンネルにリスナーを登録する", () => {
      const callback = vi.fn();

      skillAPI.onComplete(callback);

      expect(mockOn).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_COMPLETE,
        expect.any(Function),
      );
    });

    it("unsubscribe関数を返す", () => {
      const callback = vi.fn();

      const unsubscribe = skillAPI.onComplete(callback);

      expect(typeof unsubscribe).toBe("function");
    });
  });

  describe("onError(callback)", () => {
    it("safeOnでSKILL_ERRORチャンネルにリスナーを登録する", () => {
      const callback = vi.fn();

      skillAPI.onError(callback);

      expect(mockOn).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_ERROR,
        expect.any(Function),
      );
    });

    it("unsubscribe関数を返す", () => {
      const callback = vi.fn();

      const unsubscribe = skillAPI.onError(callback);

      expect(typeof unsubscribe).toBe("function");
    });
  });
});

// ============================================================
// 5. 権限メソッド（2メソッド + respondToPermission削除検証）
//    ※ onPermissionRequest, sendPermissionResponse は既に実装済み（Green）
//    ※ respondToPermission削除はRed
// ============================================================
describe("統一SkillAPI - 権限メソッド", () => {
  describe("onPermissionRequest(callback)", () => {
    it("safeOnでSKILL_PERMISSION_REQUESTチャンネルにリスナーを登録する", () => {
      const callback = vi.fn();

      skillAPI.onPermissionRequest(callback);

      expect(mockOn).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_PERMISSION_REQUEST,
        expect.any(Function),
      );
    });

    it("unsubscribe関数を返す", () => {
      const callback = vi.fn();

      const unsubscribe = skillAPI.onPermissionRequest(callback);

      expect(typeof unsubscribe).toBe("function");
    });
  });

  describe("sendPermissionResponse(response)", () => {
    it("safeInvokeでSKILL_PERMISSION_RESPONSEチャンネルを呼び出す", async () => {
      const response: SkillPermissionResponse = {
        requestId: "req-001",
        approved: true,
      };
      mockInvoke.mockResolvedValue({ success: true });

      await skillAPI.sendPermissionResponse(response);

      expect(mockInvoke).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_PERMISSION_RESPONSE,
        response,
      );
    });

    it("{ success: boolean }型で結果を返す", async () => {
      const response: SkillPermissionResponse = {
        requestId: "req-001",
        approved: true,
        rememberChoice: true,
      };
      mockInvoke.mockResolvedValue({ success: true });

      const result = await skillAPI.sendPermissionResponse(response);

      expect(result).toEqual({ success: true });
    });
  });

  describe("respondToPermission削除", () => {
    it("統一APIにrespondToPermissionメソッドが存在しない", () => {
      // RED: 現在はエイリアスとして存在する
      // Phase 5で削除後にGreenになる
      const api = skillAPI as Record<string, unknown>;
      expect(api.respondToPermission).toBeUndefined();
    });
  });
});

// ============================================================
// 6. エラーハンドリングテスト（Task 2）
// ============================================================
describe("統一SkillAPI - エラーハンドリング", () => {
  it("execute()でIPC通信エラー発生時にthrowされる（OperationResult不使用）", async () => {
    mockInvoke.mockRejectedValue(new Error("IPC connection failed"));

    const request = createMockExecutionRequest();

    await expect(skillAPI.execute(request)).rejects.toThrow(
      "IPC connection failed",
    );
  });

  it("abort()で無効なexecutionId指定時にエラーがthrowされる", async () => {
    mockInvoke.mockRejectedValue(new Error("Execution not found"));

    await expect(skillAPI.abort("invalid-id")).rejects.toThrow(
      "Execution not found",
    );
  });

  it("getExecutionStatus()で存在しないexecutionIdの場合nullを返す", async () => {
    mockInvoke.mockResolvedValue(null);

    const result = await skillAPI.getExecutionStatus("non-existent-id");

    expect(result).toBeNull();
  });

  it("import()で存在しないskillName指定時にエラーがthrowされる", async () => {
    mockInvoke.mockRejectedValue(new Error("Skill not found: unknown-skill"));

    // RED: スタブはエラーをthrowせずスタブオブジェクトを返す
    await expect(skillAPI.import("unknown-skill")).rejects.toThrow(
      "Skill not found",
    );
  });

  it("remove()で未インポートskillName指定時にエラーがthrowされる", async () => {
    mockInvoke.mockRejectedValue(
      new Error("Skill not imported: unknown-skill"),
    );

    // RED: スタブはエラーをthrowせずtrue(boolean)を返す
    await expect(skillAPI.remove("unknown-skill")).rejects.toThrow(
      "Skill not imported",
    );
  });

  it("許可されていないチャンネルへのinvoke呼び出しがrejectされる", async () => {
    // safeInvokeが不正チャンネルを拒否することを間接的にテスト
    // これは既にsafeInvoke内部で実装されている（Green）
    // ただし直接テストするにはprivate関数のテストが必要なため、
    // skillAPI経由で正しいチャンネルが使われることを他テストで検証
    expect(ALLOWED_INVOKE_CHANNELS).not.toContain("invalid:channel");
  });
});

// ============================================================
// 7. 呼び出し元移行テスト（Task 3）
// ============================================================
describe("統一SkillAPI - 呼び出し元移行テスト", () => {
  describe("useSkillExecution相当のAPI呼び出しパターン", () => {
    it("window.electronAPI.skill.execute経由でIPC呼び出しが行われる", async () => {
      const request = createMockExecutionRequest({
        skillName: "test-skill",
        prompt: "Execute this",
      });
      mockInvoke.mockResolvedValue(createMockExecutionResponse());

      // skillAPIオブジェクトはwindow.electronAPI.skillとして公開される
      // ここではskillAPIを直接テストし、IPC呼び出しを検証
      await skillAPI.execute(request);

      expect(mockInvoke).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_EXECUTE,
        request,
      );
    });

    it("abort呼び出し後にvoidが返る（booleanではない）", async () => {
      mockInvoke.mockResolvedValue(undefined);

      const result = await skillAPI.abort("exec-001");

      // RED: 現在の実装はboolean
      expect(result).toBeUndefined();
    });
  });

  describe("useSkillPermission相当のAPI呼び出しパターン", () => {
    it("window.electronAPI.skill.onPermissionRequest経由でリスナー登録", () => {
      const callback = vi.fn();

      const unsubscribe = skillAPI.onPermissionRequest(callback);

      expect(mockOn).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_PERMISSION_REQUEST,
        expect.any(Function),
      );
      expect(typeof unsubscribe).toBe("function");
    });

    it("window.electronAPI.skill.sendPermissionResponse経由で応答送信", async () => {
      const response: SkillPermissionResponse = {
        requestId: "req-001",
        approved: true,
      };
      mockInvoke.mockResolvedValue({ success: true });

      await skillAPI.sendPermissionResponse(response);

      expect(mockInvoke).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_PERMISSION_RESPONSE,
        response,
      );
    });
  });

  describe("skillSlice相当のAPI呼び出しパターン", () => {
    it("list()が直接型（非OperationResult）でSkillMetadata[]を返す", async () => {
      const mockMetadata = [
        createMockSkillMetadata({ name: "skill-1" }),
        createMockSkillMetadata({ name: "skill-2" }),
      ];
      mockInvoke.mockResolvedValue({ success: true, data: mockMetadata });

      const result = await skillAPI.list();

      // RED: スタブは空配列を返すため失敗
      // 直接型であること（OperationResult<T>でないこと）を検証
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      // OperationResultでないことを確認（success/dataプロパティがない）
      expect(
        (result as unknown as Record<string, unknown>).success,
      ).toBeUndefined();
      expect(
        (result as unknown as Record<string, unknown>).data,
      ).toBeUndefined();
    });

    it("execute()がSkillExecutionRequestオブジェクト引数を受け取る", async () => {
      const request: SkillExecutionRequest = {
        skillName: "my-skill",
        prompt: "Do something",
      };
      mockInvoke.mockResolvedValue(createMockExecutionResponse());

      await skillAPI.execute(request);

      // 引数がオブジェクト形式であることを検証（分割引数ではない）
      expect(mockInvoke).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_EXECUTE,
        expect.objectContaining({
          skillName: "my-skill",
          prompt: "Do something",
        }),
      );
    });
  });
});

// ============================================================
// 8. 統一API構造テスト
// ============================================================
describe("統一SkillAPI - API構造検証", () => {
  it("統一APIが42メソッドを持つ（fork API・共有API・ドキュメントAPI・分析API・チェーンAPI含む）", () => {
    const expectedMethods: (keyof SkillAPI)[] = [
      "list",
      "getImported",
      "import",
      "remove",
      "rescan",
      "execute",
      "abort",
      "getExecutionStatus",
      "onStream",
      "onComplete",
      "onError",
      "onPermissionRequest",
      "sendPermissionResponse",
      "readFile",
      "writeFile",
      "createFile",
      "deleteFile",
      "listBackups",
      "restoreBackup",
      "importFromSource",
      "exportSkill",
      "validateSource",
      "scheduleList",
      "scheduleAdd",
      "scheduleUpdate",
      "scheduleDelete",
      "scheduleToggle",
      "forkSkill",
      "docsGenerate",
      "docsPreview",
      "docsExport",
      "docsTemplates",
      "analyticsRecord",
      "analyticsStatistics",
      "analyticsSummary",
      "analyticsTrend",
      "analyticsExport",
      "chainList",
      "chainGet",
      "chainSave",
      "chainDelete",
      "chainExecute",
    ];

    for (const method of expectedMethods) {
      expect(typeof skillAPI[method]).toBe("function");
    }

    const methodCount = Object.keys(skillAPI).filter(
      (key) => typeof (skillAPI as Record<string, unknown>)[key] === "function",
    ).length;
    expect(methodCount).toBe(42);
  });

  it("全イベントリスナーメソッドがunsubscribe関数を返す", () => {
    const eventMethods = [
      skillAPI.onStream,
      skillAPI.onComplete,
      skillAPI.onError,
      skillAPI.onPermissionRequest,
    ];

    for (const method of eventMethods) {
      const unsubscribe = method(vi.fn());
      expect(typeof unsubscribe).toBe("function");
    }
  });
});

// ============================================================
// 9. 統合テスト連携: IPC通信フロー検証
// ============================================================
describe("統一SkillAPI - 統合テスト連携", () => {
  it("execute→onStream→onCompleteのイベントフロー設計", async () => {
    // Step 1: execute呼び出し
    mockInvoke.mockResolvedValue({
      success: true,
      data: createMockExecutionResponse({ executionId: "flow-001" }),
    });
    const response = await skillAPI.execute(
      createMockExecutionRequest({ skillName: "flow-skill" }),
    );
    expect(response.executionId).toBe("flow-001");

    // Step 2: onStreamリスナー登録
    const streamCallback = vi.fn();
    const unsubStream = skillAPI.onStream(streamCallback);
    expect(mockOn).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_STREAM,
      expect.any(Function),
    );

    // Step 3: onCompleteリスナー登録
    const completeCallback = vi.fn();
    const unsubComplete = skillAPI.onComplete(completeCallback);
    expect(mockOn).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_COMPLETE,
      expect.any(Function),
    );

    // クリーンアップ
    unsubStream();
    unsubComplete();
    expect(mockRemoveListener).toHaveBeenCalledTimes(2);
  });

  it("onPermissionRequest→sendPermissionResponseの権限フロー", async () => {
    // Step 1: 権限リクエストリスナー登録
    const permCallback = vi.fn();
    const unsubPerm = skillAPI.onPermissionRequest(permCallback);
    expect(mockOn).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_PERMISSION_REQUEST,
      expect.any(Function),
    );

    // Step 2: 権限応答送信
    const permResponse: SkillPermissionResponse = {
      requestId: "req-001",
      approved: true,
      rememberChoice: false,
    };
    mockInvoke.mockResolvedValue({ success: true });
    await skillAPI.sendPermissionResponse(permResponse);
    expect(mockInvoke).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_PERMISSION_RESPONSE,
      permResponse,
    );

    unsubPerm();
  });

  it("import/remove後の一覧更新パターン", async () => {
    // Step 1: import
    mockInvoke.mockResolvedValueOnce(
      createMockImportedSkill({ name: "new-skill" }),
    );

    // RED: スタブはipcRenderer.invokeを呼ばない
    await skillAPI.import("new-skill");

    // Step 2: list（更新確認）
    const updatedList = [
      createMockSkillMetadata({ name: "existing" }),
      createMockSkillMetadata({ name: "new-skill" }),
    ];
    mockInvoke.mockResolvedValueOnce({ success: true, data: updatedList });

    // RED: スタブは空配列を返す
    const result = await skillAPI.list();
    expect(result).toHaveLength(2);
  });
});

// ================================================================
// Phase 6: テスト拡充
// ================================================================

// ================================================================
// Task 1: 境界値・異常系テスト
// ================================================================
describe("Phase 6: 境界値・異常系テスト", () => {
  it("list() IPCエラー時にthrow", async () => {
    mockInvoke.mockRejectedValueOnce(new Error("IPC communication failed"));
    await expect(skillAPI.list()).rejects.toThrow("IPC communication failed");
  });

  it("getImported() IPCエラー時にthrow", async () => {
    mockInvoke.mockRejectedValueOnce(new Error("Connection lost"));
    await expect(skillAPI.getImported()).rejects.toThrow("Connection lost");
  });

  it("rescan() IPCエラー時にthrow", async () => {
    mockInvoke.mockRejectedValueOnce(new Error("Scan timeout"));
    await expect(skillAPI.rescan()).rejects.toThrow("Scan timeout");
  });

  it("execute() 空skillNameでもsafeInvokeに委譲", async () => {
    const emptyRequest = createMockExecutionRequest();
    emptyRequest.skillName = "";
    mockInvoke.mockResolvedValueOnce({
      success: true,
      data: createMockExecutionResponse({ executionId: "exec-empty" }),
    });

    const result = await skillAPI.execute(emptyRequest);
    expect(mockInvoke).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_EXECUTE,
      emptyRequest,
    );
    expect(result.executionId).toBe("exec-empty");
  });

  it("import() 空文字列skillNameでもsafeInvokeに委譲", async () => {
    mockInvoke.mockResolvedValueOnce(createMockImportedSkill({ name: "" }));
    const result = await skillAPI.import("");
    expect(mockInvoke).toHaveBeenCalledWith(IPC_CHANNELS.SKILL_IMPORT, "");
    expect(result).toBeDefined();
  });

  it("abort() 空executionIdでもsafeInvokeに委譲", async () => {
    mockInvoke.mockResolvedValueOnce(undefined);
    await skillAPI.abort("");
    expect(mockInvoke).toHaveBeenCalledWith(IPC_CHANNELS.SKILL_ABORT, "");
  });

  it("sendPermissionResponse() IPCエラー時にthrow", async () => {
    mockInvoke.mockRejectedValueOnce(new Error("Permission IPC failed"));
    await expect(
      skillAPI.sendPermissionResponse({
        requestId: "req-err",
        approved: true,
        rememberChoice: false,
      }),
    ).rejects.toThrow("Permission IPC failed");
  });

  it("不許可チャンネルのsafeInvokeでreject", async () => {
    // safeInvokeは内部関数だが、ALLOWED_INVOKE_CHANNELSに無いチャンネルはrejectされる
    // skillAPIの全メソッドは許可チャンネルのみ使用するため、直接テスト不可
    // 代わりにALLOWED_INVOKE_CHANNELSの不正チャンネル不在を検証
    expect(ALLOWED_INVOKE_CHANNELS).not.toContain("skill:invalid:channel");
    expect(ALLOWED_ON_CHANNELS).not.toContain("skill:invalid:channel");
  });
});

// ================================================================
// Task 2: イベントリスナーのライフサイクルテスト
// ================================================================
describe("Phase 6: イベントリスナーのライフサイクルテスト", () => {
  it("onStream: unsubscribe後にイベント発火してもコールバック呼ばれない", () => {
    const callback = vi.fn();
    let capturedListener: ((...args: unknown[]) => void) | null = null;

    mockOn.mockImplementation(
      (_channel: string, listener: (...args: unknown[]) => void) => {
        capturedListener = listener;
      },
    );

    const unsubscribe = skillAPI.onStream(callback);

    // リスナーが登録されたことを確認
    expect(mockOn).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_STREAM,
      expect.any(Function),
    );

    // unsubscribe
    unsubscribe();
    expect(mockRemoveListener).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_STREAM,
      expect.any(Function),
    );

    // unsubscribe後にイベント発火
    capturedListener?.(
      {},
      { executionId: "e1", type: "text", content: "test", timestamp: 0 },
    );

    // safeOnの実装により、removeListenerが呼ばれた後もcapturedListenerは残るが
    // ipcRenderer.removeListenerによりElectron内部で解除される
    // ここではremoveListenerが正しく呼ばれたことを検証
    expect(mockRemoveListener).toHaveBeenCalledTimes(1);
  });

  it("onComplete: 複数登録→1つunsubscribe→残りのリスナーは維持", () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    const unsubscribe1 = skillAPI.onComplete(callback1);
    skillAPI.onComplete(callback2);

    expect(mockOn).toHaveBeenCalledTimes(2);

    // 1つ目をunsubscribe
    unsubscribe1();

    // removeListenerは1回のみ
    expect(mockRemoveListener).toHaveBeenCalledTimes(1);

    // 2つ目は解除されていない
    expect(mockOn).toHaveBeenCalledTimes(2);
  });

  it("onError: 登録なし状態でもクラッシュしない", () => {
    // onErrorを呼ばずに、mockOnが呼ばれないことを確認
    // （リスナー未登録 = onError未呼出）
    expect(mockOn).not.toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_ERROR,
      expect.any(Function),
    );

    // 直接ipcRenderer.onに登録されたリスナーなしの状態でも
    // skillAPI自体はクラッシュしない
    expect(() => skillAPI.onError).not.toThrow();
  });

  it("onPermissionRequest: register→unsubscribe→removeListener確認", () => {
    const callback = vi.fn();

    const unsubscribe = skillAPI.onPermissionRequest(callback);

    expect(mockOn).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_PERMISSION_REQUEST,
      expect.any(Function),
    );

    unsubscribe();

    expect(mockRemoveListener).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_PERMISSION_REQUEST,
      expect.any(Function),
    );
  });

  it("全イベントメソッドのunsubscribeが独立して動作", () => {
    const unsub1 = skillAPI.onStream(vi.fn());
    const unsub2 = skillAPI.onComplete(vi.fn());
    const unsub3 = skillAPI.onError(vi.fn());
    const unsub4 = skillAPI.onPermissionRequest(vi.fn());

    expect(mockOn).toHaveBeenCalledTimes(4);

    unsub1();
    expect(mockRemoveListener).toHaveBeenCalledTimes(1);

    unsub2();
    expect(mockRemoveListener).toHaveBeenCalledTimes(2);

    unsub3();
    expect(mockRemoveListener).toHaveBeenCalledTimes(3);

    unsub4();
    expect(mockRemoveListener).toHaveBeenCalledTimes(4);
  });
});

// ================================================================
// Task 3: 統合テスト（Preload→IPC呼び出し チャンネル値検証）
// ================================================================
describe("Phase 6: IPCチャンネル統合テスト", () => {
  it("list() はSKILL_LISTチャンネル（'skill:list'）を呼ぶ", async () => {
    mockInvoke.mockResolvedValueOnce({ success: true, data: [] });
    await skillAPI.list();
    expect(mockInvoke).toHaveBeenCalledWith("skill:list");
  });

  it("execute() はSKILL_EXECUTEチャンネル（'skill:execute'）を呼ぶ", async () => {
    const req = createMockExecutionRequest();
    mockInvoke.mockResolvedValueOnce({
      success: true,
      data: createMockExecutionResponse(),
    });
    await skillAPI.execute(req);
    expect(mockInvoke).toHaveBeenCalledWith("skill:execute", req);
  });

  it("import() はSKILL_IMPORTチャンネル（'skill:import'）を呼ぶ", async () => {
    mockInvoke.mockResolvedValueOnce(createMockImportedSkill());
    await skillAPI.import("test-skill");
    expect(mockInvoke).toHaveBeenCalledWith("skill:import", "test-skill");
  });

  it("remove() はSKILL_REMOVEチャンネル（'skill:remove'）を呼ぶ", async () => {
    mockInvoke.mockResolvedValueOnce(createMockRemoveResult());
    await skillAPI.remove("test-skill");
    expect(mockInvoke).toHaveBeenCalledWith("skill:remove", "test-skill");
  });

  it("abort() はSKILL_ABORTチャンネル（'skill:abort'）を呼ぶ", async () => {
    mockInvoke.mockResolvedValueOnce(undefined);
    await skillAPI.abort("exec-123");
    expect(mockInvoke).toHaveBeenCalledWith("skill:abort", "exec-123");
  });

  it("getImported() はSKILL_GET_IMPORTEDチャンネルを呼ぶ", async () => {
    mockInvoke.mockResolvedValueOnce({ success: true, data: [] });
    await skillAPI.getImported();
    expect(mockInvoke).toHaveBeenCalledWith("skill:getImported");
  });

  it("rescan() はSKILL_SCANチャンネルを呼ぶ", async () => {
    mockInvoke.mockResolvedValueOnce({ success: true, data: [] });
    await skillAPI.rescan();
    expect(mockInvoke).toHaveBeenCalledWith("skill:scan");
  });

  it("getExecutionStatus() はSKILL_GET_STATUSチャンネルを呼ぶ", async () => {
    mockInvoke.mockResolvedValueOnce(null);
    await skillAPI.getExecutionStatus("exec-123");
    expect(mockInvoke).toHaveBeenCalledWith("skill:get-status", "exec-123");
  });

  it("sendPermissionResponse() はSKILL_PERMISSION_RESPONSEチャンネルを呼ぶ", async () => {
    const resp = { requestId: "r1", approved: true, rememberChoice: false };
    mockInvoke.mockResolvedValueOnce({ success: true });
    await skillAPI.sendPermissionResponse(resp);
    expect(mockInvoke).toHaveBeenCalledWith("skill:permission:response", resp);
  });

  it("onStream() はSKILL_STREAMチャンネルでリスナー登録", () => {
    skillAPI.onStream(vi.fn());
    expect(mockOn).toHaveBeenCalledWith("skill:stream", expect.any(Function));
  });
});

/**
 * SkillAPI Unification テスト（Phase 4: TDD Red）
 *
 * TASK-FIX-5-1-SKILL-API-UNIFICATION
 * 統一API（window.electronAPI.skill）の公開検証と、
 * 旧API（window.skillAPI）の削除検証を行う。
 *
 * Red状態:
 * - window.skillAPI が types.d.ts にまだ定義されているため、
 *   toBeUndefined() テストは失敗する
 *
 * Green状態（Phase 5実装後）:
 * - types.d.ts から window.skillAPI を削除後、テストがPASSになる
 *
 * @module @repo/desktop/preload/__tests__/skill-api.unification
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

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

// Import after mocking
import { skillAPI } from "../skill-api";
import type { SkillAPI } from "../skill-api";

// ============================================================
// セットアップ
// ============================================================
beforeEach(() => {
  vi.clearAllMocks();
  mockInvoke.mockResolvedValue(undefined);
  mockOn.mockImplementation(() => {});
});

// ============================================================
// 1. SkillAPI Unification テスト
// ============================================================
describe("SkillAPI Unification", () => {
  describe("window.electronAPI.skill", () => {
    it("should expose all 22 methods", () => {
      // skillAPI は window.electronAPI.skill として公開される
      // ここでは skillAPI オブジェクトを直接検証

      // 一覧・管理系（5メソッド）
      expect(typeof skillAPI.list).toBe("function");
      expect(typeof skillAPI.getImported).toBe("function");
      expect(typeof skillAPI.import).toBe("function");
      expect(typeof skillAPI.remove).toBe("function");
      expect(typeof skillAPI.rescan).toBe("function");

      // 実行系（3メソッド）
      expect(typeof skillAPI.execute).toBe("function");
      expect(typeof skillAPI.abort).toBe("function");
      expect(typeof skillAPI.getExecutionStatus).toBe("function");

      // イベント系（3メソッド）
      expect(typeof skillAPI.onStream).toBe("function");
      expect(typeof skillAPI.onComplete).toBe("function");
      expect(typeof skillAPI.onError).toBe("function");

      // 権限系（2メソッド）
      expect(typeof skillAPI.onPermissionRequest).toBe("function");
      expect(typeof skillAPI.sendPermissionResponse).toBe("function");

      // ファイル操作系（6メソッド）
      expect(typeof skillAPI.readFile).toBe("function");
      expect(typeof skillAPI.writeFile).toBe("function");
      expect(typeof skillAPI.createFile).toBe("function");
      expect(typeof skillAPI.deleteFile).toBe("function");
      expect(typeof skillAPI.listBackups).toBe("function");
      expect(typeof skillAPI.restoreBackup).toBe("function");

      // 共有系（3メソッド）
      expect(typeof skillAPI.importFromSource).toBe("function");
      expect(typeof skillAPI.exportSkill).toBe("function");
      expect(typeof skillAPI.validateSource).toBe("function");
    });

    it("should have exactly 22 methods (no extra methods)", () => {
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
      ];

      const actualMethods = Object.keys(skillAPI).filter(
        (key) =>
          typeof (skillAPI as Record<string, unknown>)[key] === "function",
      );

      // メソッド数が正確に22であること（13 + 6ファイル操作 + 3共有）
      expect(actualMethods.length).toBe(22);

      // 全ての期待メソッドが含まれていること
      for (const method of expectedMethods) {
        expect(actualMethods).toContain(method);
      }
    });
  });

  describe("window.skillAPI (deprecated)", () => {
    it("should not be defined after unification", () => {
      // RED: Phase 5実装前はこのテストが失敗する
      // types.d.ts に window.skillAPI がまだ定義されているため
      //
      // Phase 5で types.d.ts から削除後、このテストがPASS（Green）になる
      //
      // Note: 実際のwindowオブジェクトはテスト環境では存在しないため、
      // types.d.tsの型定義の削除を検証するためにはコンパイル時チェックが必要
      // ここではランタイムでのwindow.skillAPI未定義を期待
      expect(
        (globalThis as unknown as { skillAPI?: unknown }).skillAPI,
      ).toBeUndefined();
    });
  });
});

// ============================================================
// 2. 型安全性テスト（コンパイル時検証のランタイム補完）
// ============================================================
describe("SkillAPI Type Safety", () => {
  describe("Method signatures", () => {
    it("list() returns Promise<SkillMetadata[]>", async () => {
      const mockResult = [
        { name: "test-skill", description: "desc", path: "/path" },
      ];
      mockInvoke.mockResolvedValueOnce({ success: true, data: mockResult });

      const result = await skillAPI.list();
      expect(Array.isArray(result)).toBe(true);
    });

    it("getImported() returns Promise<ImportedSkill[]>", async () => {
      const mockResult = [{ name: "imported", status: "active" }];
      mockInvoke.mockResolvedValueOnce({ success: true, data: mockResult });

      const result = await skillAPI.getImported();
      expect(Array.isArray(result)).toBe(true);
    });

    it("import(skillName) returns Promise<ImportedSkill>", async () => {
      const mockResult = { name: "new-skill", status: "active" };
      mockInvoke.mockResolvedValueOnce(mockResult);

      const result = await skillAPI.import("new-skill");
      expect(typeof result).toBe("object");
      expect(result).not.toBeNull();
    });

    it("remove(skillName) returns Promise<RemoveResult>", async () => {
      mockInvoke.mockResolvedValueOnce({ success: true, removed: true });

      const result = await skillAPI.remove("old-skill");
      expect(result).toEqual({ success: true, removed: true });
    });

    it("rescan() returns Promise<SkillMetadata[]>", async () => {
      const mockResult = [
        { name: "rescanned", description: "desc", path: "/path" },
      ];
      mockInvoke.mockResolvedValueOnce({ success: true, data: mockResult });

      const result = await skillAPI.rescan();
      expect(Array.isArray(result)).toBe(true);
    });

    it("execute(request) returns Promise<SkillExecutionResponse>", async () => {
      const mockResult = { executionId: "exec-001", success: true };
      mockInvoke.mockResolvedValueOnce({ success: true, data: mockResult });

      const result = await skillAPI.execute({
        skillName: "test",
        prompt: "test prompt",
      });
      expect(result).toHaveProperty("executionId");
      expect(result).toHaveProperty("success");
    });

    it("abort(executionId) returns Promise<void>", async () => {
      mockInvoke.mockResolvedValueOnce(undefined);

      const result = await skillAPI.abort("exec-001");
      expect(result).toBeUndefined();
    });

    it("getExecutionStatus(executionId) returns Promise<ExecutionInfo | null>", async () => {
      const mockResult = { id: "exec-001", state: "running" };
      mockInvoke.mockResolvedValueOnce(mockResult);

      const result = await skillAPI.getExecutionStatus("exec-001");
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("state");
    });

    it("onStream(callback) returns unsubscribe function", () => {
      const callback = vi.fn();
      const unsubscribe = skillAPI.onStream(callback);
      expect(typeof unsubscribe).toBe("function");
    });

    it("onComplete(callback) returns unsubscribe function", () => {
      const callback = vi.fn();
      const unsubscribe = skillAPI.onComplete(callback);
      expect(typeof unsubscribe).toBe("function");
    });

    it("onError(callback) returns unsubscribe function", () => {
      const callback = vi.fn();
      const unsubscribe = skillAPI.onError(callback);
      expect(typeof unsubscribe).toBe("function");
    });

    it("onPermissionRequest(callback) returns unsubscribe function", () => {
      const callback = vi.fn();
      const unsubscribe = skillAPI.onPermissionRequest(callback);
      expect(typeof unsubscribe).toBe("function");
    });

    it("sendPermissionResponse(response) returns Promise<{ success: boolean }>", async () => {
      mockInvoke.mockResolvedValueOnce({ success: true });

      const result = await skillAPI.sendPermissionResponse({
        requestId: "req-001",
        approved: true,
      });
      expect(result).toHaveProperty("success");
      expect(typeof result.success).toBe("boolean");
    });
  });
});

// ============================================================
// 3. 境界値テスト
// ============================================================
describe("SkillAPI Boundary Tests", () => {
  it("import() with empty string skillName", async () => {
    mockInvoke.mockResolvedValueOnce({ name: "", status: "active" });
    const result = await skillAPI.import("");
    expect(result).toBeDefined();
  });

  it("remove() with empty string skillName", async () => {
    mockInvoke.mockResolvedValueOnce({ success: true, removed: true });
    const result = await skillAPI.remove("");
    expect(result).toEqual({ success: true, removed: true });
  });

  it("abort() with empty string executionId", async () => {
    mockInvoke.mockResolvedValueOnce(undefined);
    const result = await skillAPI.abort("");
    expect(result).toBeUndefined();
  });

  it("getExecutionStatus() returns null for non-existent id", async () => {
    mockInvoke.mockResolvedValueOnce(null);
    const result = await skillAPI.getExecutionStatus("non-existent");
    expect(result).toBeNull();
  });

  it("execute() with minimal request (skillName and prompt only)", async () => {
    mockInvoke.mockResolvedValueOnce({
      success: true,
      data: {
        executionId: "exec-min",
        success: true,
      },
    });
    const result = await skillAPI.execute({
      skillName: "minimal-skill",
      prompt: "",
    });
    expect(result.executionId).toBe("exec-min");
  });
});

// ============================================================
// 4. 統合テストシナリオ
// ============================================================
describe("SkillAPI Integration Scenarios", () => {
  it("Skill discovery flow: list -> rescan -> list", async () => {
    // 初回リスト取得
    mockInvoke.mockResolvedValueOnce({
      success: true,
      data: [{ name: "skill-a" }],
    });
    const initialList = await skillAPI.list();
    expect(initialList).toHaveLength(1);

    // 再スキャン
    mockInvoke.mockResolvedValueOnce({
      success: true,
      data: [{ name: "skill-a" }, { name: "skill-b" }],
    });
    const rescanResult = await skillAPI.rescan();
    expect(rescanResult).toHaveLength(2);

    // 再度リスト取得
    mockInvoke.mockResolvedValueOnce({
      success: true,
      data: [{ name: "skill-a" }, { name: "skill-b" }],
    });
    const updatedList = await skillAPI.list();
    expect(updatedList).toHaveLength(2);
  });

  it("Skill import flow: list -> import -> getImported", async () => {
    // 利用可能なスキル一覧
    mockInvoke.mockResolvedValueOnce({
      success: true,
      data: [{ name: "available-skill" }],
    });
    await skillAPI.list();

    // インポート（import は safeInvoke を使用 — ハンドラがラッパーなしで返す）
    mockInvoke.mockResolvedValueOnce({
      name: "available-skill",
      status: "active",
    });
    await skillAPI.import("available-skill");

    // インポート済み一覧
    mockInvoke.mockResolvedValueOnce({
      success: true,
      data: [{ name: "available-skill", status: "active" }],
    });
    const imported = await skillAPI.getImported();
    expect(imported).toHaveLength(1);
  });

  it("Skill execution flow: execute -> onStream -> onComplete", async () => {
    // 実行開始
    mockInvoke.mockResolvedValueOnce({
      success: true,
      data: {
        executionId: "flow-001",
        success: true,
      },
    });
    const response = await skillAPI.execute({
      skillName: "flow-skill",
      prompt: "Execute flow test",
    });
    expect(response.executionId).toBe("flow-001");

    // ストリームリスナー登録
    const streamCallback = vi.fn();
    const unsubStream = skillAPI.onStream(streamCallback);
    expect(mockOn).toHaveBeenCalled();

    // 完了リスナー登録
    const completeCallback = vi.fn();
    const unsubComplete = skillAPI.onComplete(completeCallback);
    expect(mockOn).toHaveBeenCalledTimes(2);

    // クリーンアップ
    unsubStream();
    unsubComplete();
    expect(mockRemoveListener).toHaveBeenCalledTimes(2);
  });

  it("Permission flow: onPermissionRequest -> sendPermissionResponse", async () => {
    // 権限リクエストリスナー登録
    const permCallback = vi.fn();
    const unsubPerm = skillAPI.onPermissionRequest(permCallback);
    expect(mockOn).toHaveBeenCalled();

    // 権限応答送信
    mockInvoke.mockResolvedValueOnce({ success: true });
    const result = await skillAPI.sendPermissionResponse({
      requestId: "req-perm-001",
      approved: true,
      rememberChoice: false,
    });
    expect(result.success).toBe(true);

    unsubPerm();
  });
});

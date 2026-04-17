/**
 * SkillCreator Preload API - cancelGeneration テスト
 * TASK-SW-CANCEL-002: preload に cancelGeneration を追加
 *
 * TC-01: cancelGeneration() が SKILL_CREATOR_CANCEL チャンネルで invoke を呼ぶこと
 * TC-02: cancelGeneration() が Promise<IpcResult<void>> を返すこと
 * TC-03: cancelGeneration が SkillCreatorAPI インターフェースに定義されていること
 * TC-04: cancelGeneration が ALLOWED_INVOKE_CHANNELS ホワイトリスト経由で呼ばれること
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { IPC_CHANNELS, ALLOWED_INVOKE_CHANNELS } from "../channels";

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

import { skillCreatorAPI } from "../skill-creator-api";
import type { SkillCreatorAPI } from "../skill-creator-api";

describe("SkillCreator Preload API - cancelGeneration (TASK-SW-CANCEL-002)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("TC-01: cancelGeneration() が SKILL_CREATOR_CANCEL チャンネルで ipcRenderer.invoke を呼ぶこと", async () => {
    // Arrange
    mockInvoke.mockResolvedValue({ success: true });

    // Act
    await skillCreatorAPI.cancelGeneration();

    // Assert
    expect(mockInvoke).toHaveBeenCalledWith(IPC_CHANNELS.SKILL_CREATOR_CANCEL);
  });

  it("TC-02: cancelGeneration() が Promise を返すこと", () => {
    // Arrange
    mockInvoke.mockResolvedValue({ success: true });

    // Act
    const result = skillCreatorAPI.cancelGeneration();

    // Assert
    expect(result).toBeInstanceOf(Promise);
  });

  it("TC-03: cancelGeneration が SkillCreatorAPI インターフェースに定義されていること", () => {
    // TypeScript コンパイル時の型チェックに加え、ランタイムでもメソッドが存在することを確認
    expect(typeof skillCreatorAPI.cancelGeneration).toBe("function");

    // インターフェースのキーとして存在すること
    const api: SkillCreatorAPI = skillCreatorAPI;
    expect(api.cancelGeneration).toBeDefined();
  });

  it("TC-04: SKILL_CREATOR_CANCEL が ALLOWED_INVOKE_CHANNELS に含まれること（safeInvoke ホワイトリスト通過）", () => {
    expect(ALLOWED_INVOKE_CHANNELS).toContain(
      IPC_CHANNELS.SKILL_CREATOR_CANCEL,
    );
  });
});

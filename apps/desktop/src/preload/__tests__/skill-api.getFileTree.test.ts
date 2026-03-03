/**
 * skillAPI.getFileTree - Preload API Test (UT-UI-05A-GETFILETREE-001 Phase 4)
 *
 * 1 test case:
 * - FT-14: safeInvokeUnwrap で正しいチャネルを呼び出す
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { IPC_CHANNELS } from "../channels";

// Mock electron ipcRenderer
const mockInvoke = vi.fn();
vi.mock("electron", () => ({
  ipcRenderer: {
    invoke: (...args: unknown[]) => mockInvoke(...args),
    on: vi.fn(),
    removeListener: vi.fn(),
  },
}));

describe("skillAPI.getFileTree", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // FT-14
  it("SKILL_GET_FILE_TREE チャネルに { skillName } を渡して呼び出す", async () => {
    const mockTree = [{ name: "SKILL.md", path: "SKILL.md", type: "file" }];
    mockInvoke.mockResolvedValue({
      success: true,
      data: mockTree,
    });

    // Import after mocks are set up
    const { skillAPI } = await import("../skill-api");
    const result = await skillAPI.getFileTree("test-skill");

    expect(mockInvoke).toHaveBeenCalledWith(IPC_CHANNELS.SKILL_GET_FILE_TREE, {
      skillName: "test-skill",
    });
    expect(result).toEqual(mockTree);
  });
});

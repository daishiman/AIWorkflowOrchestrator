import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFileTree } from "../hooks/useFileTree";
import { setupSkillApiMocks, sampleFileTree } from "./helpers/test-factories";

describe("useFileTree", () => {
  let mocks: ReturnType<typeof setupSkillApiMocks>;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks = setupSkillApiMocks();
  });

  // UFT-01
  it("refreshTree 実行時に skill:getFileTree を呼び出す", async () => {
    const hook = renderHook(() => useFileTree("my-skill"));
    // useEffect で初期化時に自動呼び出しされる
    await act(async () => {
      // useEffectの完了を待つ
    });
    expect(hook.result.current).toBeDefined();
    expect(mocks.getFileTree).toHaveBeenCalledWith("my-skill");
  });

  // UFT-02
  it("空ツリー応答時に fileTree が空配列になる", async () => {
    // getFileTree を常に空ツリーで返すように設定（useEffect初期化 + 手動呼び出し両方で使用される）
    mocks.getFileTree.mockResolvedValue({ tree: [] });
    const { result } = renderHook(() => useFileTree("my-skill"));
    await act(async () => {
      await result.current.refreshTree();
    });
    expect(result.current.fileTree).toEqual([]);
  });

  // UFT-03
  it("ネストされた FileNode 応答を fileTree に反映する", async () => {
    const { result } = renderHook(() => useFileTree("my-skill"));
    await act(async () => {
      await result.current.refreshTree();
    });
    expect(result.current.fileTree).toEqual(sampleFileTree);
  });

  // UFT-04
  it("selectFile 呼び出し時に selectedFile を更新する", async () => {
    const { result } = renderHook(() => useFileTree("my-skill"));
    await act(async () => {
      // 初期化を待つ
    });
    act(() => {
      result.current.selectFile("SKILL.md");
    });
    expect(result.current.selectedFile).toBe("SKILL.md");
  });

  // UFT-05
  it("toggleExpand でディレクトリの展開状態をトグルする", async () => {
    const { result } = renderHook(() => useFileTree("my-skill"));
    await act(async () => {
      // 初期化を待つ
    });

    // 展開
    act(() => {
      result.current.toggleExpand("agents/");
    });
    expect(result.current.expandedDirs.has("agents/")).toBe(true);

    // 折りたたみ
    act(() => {
      result.current.toggleExpand("agents/");
    });
    expect(result.current.expandedDirs.has("agents/")).toBe(false);
  });

  // UFT-06
  it("refreshTree 失敗時に error を設定する", async () => {
    mocks.getFileTree.mockRejectedValueOnce(new Error("Tree fetch failed"));
    const { result } = renderHook(() => useFileTree("my-skill"));
    await act(async () => {
      await result.current.refreshTree();
    });
    expect(result.current.error).not.toBeNull();
    expect(result.current.error).toContain("Tree fetch failed");
  });

  // UFT-07
  it("createFile/deleteFile 成功後に refreshTree を再実行する", async () => {
    const { result } = renderHook(() => useFileTree("my-skill"));
    await act(async () => {
      // 初期化を待つ
    });

    // 初期呼び出し回数をリセット
    const initialCallCount = mocks.getFileTree.mock.calls.length;

    await act(async () => {
      await result.current.createFile("new-file.md", "content");
    });
    expect(mocks.getFileTree.mock.calls.length).toBeGreaterThan(
      initialCallCount,
    );

    const afterCreateCount = mocks.getFileTree.mock.calls.length;

    await act(async () => {
      await result.current.deleteFile("new-file.md");
    });
    expect(mocks.getFileTree.mock.calls.length).toBeGreaterThan(
      afterCreateCount,
    );
  });
});

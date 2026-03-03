import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSkillEditor } from "../hooks/useSkillEditor";
import { setupSkillApiMocks, sampleContent } from "./helpers/test-factories";

describe("useSkillEditor", () => {
  let mocks: ReturnType<typeof setupSkillApiMocks>;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks = setupSkillApiMocks();
  });

  // USE-01
  it("初期状態で content が空文字列、isLoading が false である", () => {
    const { result } = renderHook(() => useSkillEditor("my-skill", false));
    expect(result.current.content).toBe("");
    expect(result.current.isLoading).toBe(false);
  });

  // USE-02
  it("loadFile 呼び出し時に skill:readFile IPC を呼び出す", async () => {
    const { result } = renderHook(() => useSkillEditor("my-skill", false));
    await act(async () => {
      await result.current.loadFile("SKILL.md");
    });
    expect(mocks.readFile).toHaveBeenCalledWith("my-skill", "SKILL.md");
  });

  // USE-03
  it("loadFile 成功時に content にファイル内容を設定する", async () => {
    const { result } = renderHook(() => useSkillEditor("my-skill", false));
    await act(async () => {
      await result.current.loadFile("SKILL.md");
    });
    expect(result.current.content).toBe(sampleContent);
  });

  // USE-04
  it("loadFile 失敗時に error にエラーメッセージを設定する", async () => {
    mocks.readFile.mockRejectedValueOnce(new Error("Read failed"));
    const { result } = renderHook(() => useSkillEditor("my-skill", false));
    await act(async () => {
      await result.current.loadFile("SKILL.md");
    });
    expect(result.current.error).not.toBeNull();
    expect(result.current.error).toContain("Read failed");
  });

  // USE-05
  it("saveFile 呼び出し時に skill:writeFile IPC を呼び出す", async () => {
    const { result } = renderHook(() => useSkillEditor("my-skill", false));
    // まずファイルを読み込んで currentPath を設定
    await act(async () => {
      await result.current.loadFile("SKILL.md");
    });
    // 変更を加える
    act(() => {
      result.current.updateContent("updated content");
    });
    // 保存
    await act(async () => {
      await result.current.saveFile();
    });
    expect(mocks.writeFile).toHaveBeenCalledWith(
      "my-skill",
      "SKILL.md",
      "updated content",
    );
  });

  // USE-06
  it("saveFile 成功時に hasChanges を false にリセットする", async () => {
    const { result } = renderHook(() => useSkillEditor("my-skill", false));
    await act(async () => {
      await result.current.loadFile("SKILL.md");
    });
    act(() => {
      result.current.updateContent("changed");
    });
    expect(result.current.hasChanges).toBe(true);

    await act(async () => {
      await result.current.saveFile();
    });
    expect(result.current.hasChanges).toBe(false);
  });

  // USE-07
  it("saveFile 失敗時に error にエラーメッセージを設定する", async () => {
    mocks.writeFile.mockRejectedValueOnce(new Error("Write failed"));
    const { result } = renderHook(() => useSkillEditor("my-skill", false));
    await act(async () => {
      await result.current.loadFile("SKILL.md");
    });
    act(() => {
      result.current.updateContent("changed");
    });
    await act(async () => {
      await result.current.saveFile().catch(() => {
        // saveFile は内部で error 状態を設定しつつ re-throw する
      });
    });
    expect(result.current.error).not.toBeNull();
    expect(result.current.error).toContain("Write failed");
  });

  // USE-08
  it("updateContent 呼び出し時に hasChanges を true に設定する", () => {
    const { result } = renderHook(() => useSkillEditor("my-skill", false));
    act(() => {
      result.current.updateContent("new content");
    });
    expect(result.current.hasChanges).toBe(true);
  });

  // USE-09
  it("loadFile 中は isLoading が true である", async () => {
    // readFile を遅延させてローディング状態を確認
    let resolveReadFile: (value: string) => void;
    mocks.readFile.mockImplementationOnce(
      () =>
        new Promise<string>((resolve) => {
          resolveReadFile = resolve;
        }),
    );
    const { result } = renderHook(() => useSkillEditor("my-skill", false));

    // loadFile を開始（完了させない）
    let loadPromise: Promise<void>;
    act(() => {
      loadPromise = result.current.loadFile("SKILL.md");
    });

    // ローディング中
    expect(result.current.isLoading).toBe(true);

    // readFile を完了
    await act(async () => {
      resolveReadFile!("content");
      await loadPromise!;
    });

    expect(result.current.isLoading).toBe(false);
  });

  // USE-10
  it("isReadOnly=true の場合に saveFile が実行されない", async () => {
    const { result } = renderHook(() => useSkillEditor("my-skill", true));
    await act(async () => {
      await result.current.loadFile("SKILL.md");
    });
    act(() => {
      result.current.updateContent("changed");
    });
    await act(async () => {
      await result.current.saveFile();
    });
    expect(mocks.writeFile).not.toHaveBeenCalled();
  });
});

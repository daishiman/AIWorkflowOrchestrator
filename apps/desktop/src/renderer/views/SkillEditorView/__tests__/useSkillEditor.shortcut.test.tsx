/**
 * SkillEditorView Cmd/Ctrl+S ショートカット テスト
 * UT-UI-05A-003: Cmd/Ctrl+S 保存ショートカット
 *
 * Phase 4 - TDD Red → Phase 5 Green
 *
 * 注: キーボードショートカットは index.tsx（コンポーネントレベル）で
 * 実装されているため、コンポーネントレベルでテストする。
 *
 * @module SkillEditorView/__tests__/useSkillEditor.shortcut.test
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { SkillEditorView } from "../index";
import { setupSkillApiMocks } from "./helpers/test-factories";

describe("SkillEditorView Cmd/Ctrl+S ショートカット", () => {
  let mocks: ReturnType<typeof setupSkillApiMocks>;

  beforeEach(() => {
    mocks = setupSkillApiMocks();
    vi.clearAllMocks();
    // Desktop mode
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("Cmd+S (macOS) で保存が実行される", async () => {
    await act(async () => {
      render(<SkillEditorView skillName="test-skill" onClose={vi.fn()} />);
    });

    // ファイルを読み込む
    await act(async () => {
      fireEvent.click(screen.getByText("SKILL.md"));
    });

    // テキストを変更
    const textarea = screen.getByRole("textbox");
    await act(async () => {
      fireEvent.change(textarea, { target: { value: "modified content" } });
    });

    // writeFile をリセット（loadFile 呼び出しをクリア）
    mocks.writeFile.mockClear();

    // Cmd+S をシミュレート
    await act(async () => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "s",
          metaKey: true,
          bubbles: true,
        }),
      );
    });

    expect(mocks.writeFile).toHaveBeenCalled();
  });

  it("Ctrl+S (Windows/Linux) で保存が実行される", async () => {
    await act(async () => {
      render(<SkillEditorView skillName="test-skill" onClose={vi.fn()} />);
    });

    await act(async () => {
      fireEvent.click(screen.getByText("SKILL.md"));
    });

    const textarea = screen.getByRole("textbox");
    await act(async () => {
      fireEvent.change(textarea, { target: { value: "modified content" } });
    });

    mocks.writeFile.mockClear();

    await act(async () => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "s",
          ctrlKey: true,
          bubbles: true,
        }),
      );
    });

    expect(mocks.writeFile).toHaveBeenCalled();
  });

  it("preventDefault() が呼び出される", async () => {
    await act(async () => {
      render(<SkillEditorView skillName="test-skill" onClose={vi.fn()} />);
    });

    await act(async () => {
      fireEvent.click(screen.getByText("SKILL.md"));
    });

    const event = new KeyboardEvent("keydown", {
      key: "s",
      metaKey: true,
      bubbles: true,
      cancelable: true,
    });
    const preventDefaultSpy = vi.spyOn(event, "preventDefault");

    await act(async () => {
      document.dispatchEvent(event);
    });

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it("isReadOnly=true の場合、保存が実行されない", async () => {
    await act(async () => {
      render(
        <SkillEditorView
          skillName="test-skill"
          isReadOnly={true}
          onClose={vi.fn()}
        />,
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByText("SKILL.md"));
    });

    mocks.writeFile.mockClear();

    await act(async () => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "s",
          metaKey: true,
          bubbles: true,
        }),
      );
    });

    expect(mocks.writeFile).not.toHaveBeenCalled();
  });

  it("ファイル未選択の場合、保存が実行されない", async () => {
    await act(async () => {
      render(<SkillEditorView skillName="test-skill" onClose={vi.fn()} />);
    });

    // ファイルを読み込まずにショートカット実行
    mocks.writeFile.mockClear();

    await act(async () => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "s",
          metaKey: true,
          bubbles: true,
        }),
      );
    });

    expect(mocks.writeFile).not.toHaveBeenCalled();
  });

  it("cleanup 時にイベントリスナーが解除される（P5対策）", async () => {
    const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");

    let unmount: () => void;
    await act(async () => {
      const result = render(
        <SkillEditorView skillName="test-skill" onClose={vi.fn()} />,
      );
      unmount = result.unmount;
    });

    act(() => {
      unmount();
    });

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function),
    );

    removeEventListenerSpy.mockRestore();
  });
});

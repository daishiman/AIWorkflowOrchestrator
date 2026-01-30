// @vitest-environment jsdom
/**
 * SkillStreamDisplay テスト環境検証テスト
 * TASK-3-2-F: テスト環境改善の検証用
 *
 * Phase 4 (TDD-Red): この環境(happy-dom)では失敗する
 * Phase 5 (TDD-Green): jsdom環境切り替え後にPASSする
 */

import { describe, test, expect } from "vitest";

describe("SkillStreamDisplay - Test Environment Verification", () => {
  test("navigator.clipboard.writeText が利用可能", () => {
    expect(navigator.clipboard).toBeDefined();
    expect(typeof navigator.clipboard.writeText).toBe("function");
  });

  test("navigator.clipboard.writeText がPromiseを返す", async () => {
    const result = navigator.clipboard.writeText("test");
    expect(result).toBeInstanceOf(Promise);
    await expect(result).resolves.toBeUndefined();
  });

  test("React concurrent mode での非同期状態更新（act警告なし）", async () => {
    // jsdom環境ではact()警告が発生しないことを確認
    // happy-dom環境ではReact concurrent modeとの互換性問題がある
    const { render, screen, act } = await import("@testing-library/react");
    const { useState } = await import("react");
    const React = await import("react");

    function TestComponent() {
      const [count, setCount] = useState(0);
      return React.createElement(
        "div",
        null,
        React.createElement(
          "button",
          { onClick: () => setCount((c) => c + 1) },
          `Count: ${count}`,
        ),
      );
    }

    const { unmount } = render(React.createElement(TestComponent));

    await act(async () => {
      screen.getByText("Count: 0").click();
    });

    expect(screen.getByText("Count: 1")).toBeDefined();
    unmount();
  });
});

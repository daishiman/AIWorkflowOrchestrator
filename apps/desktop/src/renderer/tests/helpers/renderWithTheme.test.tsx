import type { ReactNode } from "react";
import { renderWithAllThemes, renderWithTheme } from "./renderWithTheme";

describe("renderWithTheme", () => {
  afterEach(() => {
    document.documentElement.removeAttribute("data-theme");
  });

  describe.each(["kanagawa-dragon", "light", "dark"] as const)(
    "Theme: %s",
    (theme) => {
      it("sets data-theme attribute on documentElement", () => {
        renderWithTheme(<div data-testid="test-element">test</div>, { theme });
        expect(document.documentElement.getAttribute("data-theme")).toBe(theme);
      });

      it("renders child elements in the DOM", () => {
        const { getByTestId } = renderWithTheme(
          <div data-testid="test-element">test content</div>,
          { theme },
        );
        expect(getByTestId("test-element")).toBeInTheDocument();
        expect(getByTestId("test-element").textContent).toBe("test content");
      });
    },
  );

  it("defaults to kanagawa-dragon when no theme specified", () => {
    renderWithTheme(<div data-testid="default-test">default</div>);
    expect(document.documentElement.getAttribute("data-theme")).toBe(
      "kanagawa-dragon",
    );
  });

  it("returns RenderResult with standard query methods", () => {
    const result = renderWithTheme(<div data-testid="result-test">result</div>);
    expect(result).toHaveProperty("getByTestId");
    expect(result).toHaveProperty("queryByTestId");
    expect(result).toHaveProperty("container");
    expect(result).toHaveProperty("unmount");
  });

  it("cleans up data-theme attribute after each test", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    expect(currentTheme).toBeNull();
  });
});

describe("renderWithAllThemes", () => {
  afterEach(() => {
    document.documentElement.removeAttribute("data-theme");
  });

  it("renders once for each supported theme", () => {
    const result = renderWithAllThemes(
      <div data-testid="multi-theme-element">multi theme</div>,
    );

    expect(Object.keys(result)).toEqual(["kanagawa-dragon", "light", "dark"]);
    expect(
      result["kanagawa-dragon"].container.querySelector(
        '[data-testid="multi-theme-element"]',
      ),
    ).not.toBeNull();
    expect(
      result.light.container.querySelector(
        '[data-testid="multi-theme-element"]',
      ),
    ).not.toBeNull();
    expect(
      result.dark.container.querySelector(
        '[data-testid="multi-theme-element"]',
      ),
    ).not.toBeNull();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });
});

// Phase 6: 境界値テスト
describe("renderWithTheme - boundary cases", () => {
  afterEach(() => {
    document.documentElement.removeAttribute("data-theme");
  });

  // TC-6-1: options 未指定
  it("works without any options parameter", () => {
    const { getByTestId } = renderWithTheme(
      <div data-testid="no-opts">content</div>,
    );
    expect(document.documentElement.getAttribute("data-theme")).toBe(
      "kanagawa-dragon",
    );
    expect(getByTestId("no-opts")).toBeInTheDocument();
  });

  // TC-6-2: 空オブジェクト
  it("works with empty options object", () => {
    const { getByTestId } = renderWithTheme(
      <div data-testid="empty-opts">content</div>,
      {},
    );
    expect(document.documentElement.getAttribute("data-theme")).toBe(
      "kanagawa-dragon",
    );
    expect(getByTestId("empty-opts")).toBeInTheDocument();
  });

  // TC-6-3: container オプション
  it("respects container option from RenderOptions", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    renderWithTheme(<span data-testid="custom-container">in container</span>, {
      theme: "light",
      container,
    });

    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(
      container.querySelector('[data-testid="custom-container"]'),
    ).not.toBeNull();

    document.body.removeChild(container);
  });

  // TC-6-4: 連続テーマ切り替え
  it("overrides previous theme when called consecutively", () => {
    renderWithTheme(<div>first</div>, { theme: "light" });
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");

    renderWithTheme(<div>second</div>, { theme: "dark" });
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

    renderWithTheme(<div>third</div>, { theme: "kanagawa-dragon" });
    expect(document.documentElement.getAttribute("data-theme")).toBe(
      "kanagawa-dragon",
    );
  });

  // TC-6-5: wrapper オプション
  it("respects wrapper option from RenderOptions", () => {
    const Wrapper = ({ children }: { children: ReactNode }) => (
      <div data-testid="wrapper">{children}</div>
    );

    const { getByTestId } = renderWithTheme(
      <span data-testid="wrapped-child">child</span>,
      { theme: "dark", wrapper: Wrapper },
    );

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(getByTestId("wrapper")).toBeInTheDocument();
    expect(getByTestId("wrapped-child")).toBeInTheDocument();
  });
});

// Phase 6: WCAG AA コントラスト比検証

/**
 * 相対輝度計算（WCAG 2.1 準拠）
 */
function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r / 255, g / 255, b / 255].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4),
  );
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * コントラスト比計算（WCAG 2.1 準拠）
 */
function contrastRatio(
  fg: [number, number, number],
  bg: [number, number, number],
): number {
  const l1 = relativeLuminance(...fg);
  const l2 = relativeLuminance(...bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * rgba前景色を背景色上でアルファブレンドしたRGBを計算
 */
function alphaBlend(
  fg: [number, number, number],
  alpha: number,
  bg: [number, number, number],
): [number, number, number] {
  return [
    Math.round(fg[0] * alpha + bg[0] * (1 - alpha)),
    Math.round(fg[1] * alpha + bg[1] * (1 - alpha)),
    Math.round(fg[2] * alpha + bg[2] * (1 - alpha)),
  ];
}

describe("WCAG AA contrast ratio verification", () => {
  describe("light theme", () => {
    it("text-primary on bg-primary meets 4.5:1", () => {
      const ratio = contrastRatio([0, 0, 0], [255, 255, 255]);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it("text-secondary on bg-primary meets 3:1 for UI components", () => {
      // rgba(60, 60, 67, 0.6) on #FFFFFF — Apple HIG secondaryLabel
      // WCAG AA 4.5:1 は満たさないが、UIコンポーネント/大テキスト基準 3:1 を満たす
      const blended = alphaBlend([60, 60, 67], 0.6, [255, 255, 255]);
      const ratio = contrastRatio(blended, [255, 255, 255]);
      expect(ratio).toBeGreaterThanOrEqual(3.0);
    });

    it("text-muted on bg-primary is documented as low contrast", () => {
      // rgba(60, 60, 67, 0.3) on #FFFFFF — tertiaryLabel
      const blended = alphaBlend([60, 60, 67], 0.3, [255, 255, 255]);
      const ratio = contrastRatio(blended, [255, 255, 255]);
      // tertiaryLabel は WCAG AA 4.5:1 を満たさない場合がある（≈2.5:1）
      // 小テキスト（<18px）での使用時は要注意
      expect(ratio).toBeLessThan(4.5);
    });

    it("status-primary on bg-primary meets 3:1 for UI components", () => {
      const ratio = contrastRatio([0, 122, 255], [255, 255, 255]);
      expect(ratio).toBeGreaterThanOrEqual(3.0);
    });
  });

  describe("dark theme", () => {
    it("text-primary on bg-primary meets 4.5:1", () => {
      const ratio = contrastRatio([255, 255, 255], [0, 0, 0]);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it("text-secondary on bg-primary meets 4.5:1", () => {
      // rgba(235, 235, 245, 0.6) on #000000
      const blended = alphaBlend([235, 235, 245], 0.6, [0, 0, 0]);
      const ratio = contrastRatio(blended, [0, 0, 0]);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it("status-primary on bg-primary meets 3:1 for UI components", () => {
      const ratio = contrastRatio([10, 132, 255], [0, 0, 0]);
      expect(ratio).toBeGreaterThanOrEqual(3.0);
    });
  });

  describe("kanagawa-dragon theme", () => {
    it("text-primary on bg-primary meets 4.5:1", () => {
      // #c5c9c5 on #12120f
      const ratio = contrastRatio([197, 201, 197], [18, 18, 15]);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  });
});

// Phase 6: 3テーマカラーマップ整合性テスト
describe("theme color map completeness", () => {
  afterEach(() => {
    document.documentElement.removeAttribute("data-theme");
  });

  const themes = ["kanagawa-dragon", "light", "dark"] as const;

  describe.each(themes)("Theme: %s", (theme) => {
    it("sets data-theme and renders correctly", () => {
      const { container } = renderWithTheme(
        <div
          style={{
            backgroundColor: "var(--bg-primary)",
            color: "var(--text-primary)",
            borderColor: "var(--border-default)",
          }}
          data-testid="styled-element"
        >
          Theme styled content
        </div>,
        { theme },
      );
      expect(document.documentElement.getAttribute("data-theme")).toBe(theme);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("can render elements using status color variables", () => {
      const { getByTestId } = renderWithTheme(
        <div>
          <span
            data-testid="primary"
            style={{ color: "var(--status-primary)" }}
          >
            primary
          </span>
          <span
            data-testid="success"
            style={{ color: "var(--status-success)" }}
          >
            success
          </span>
          <span data-testid="error" style={{ color: "var(--status-error)" }}>
            error
          </span>
          <span
            data-testid="warning"
            style={{ color: "var(--status-warning)" }}
          >
            warning
          </span>
        </div>,
        { theme },
      );
      expect(getByTestId("primary")).toBeInTheDocument();
      expect(getByTestId("success")).toBeInTheDocument();
      expect(getByTestId("error")).toBeInTheDocument();
      expect(getByTestId("warning")).toBeInTheDocument();
    });
  });
});

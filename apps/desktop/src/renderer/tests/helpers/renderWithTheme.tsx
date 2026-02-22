import {
  render,
  type RenderOptions,
  type RenderResult,
} from "@testing-library/react";
import type { ReactElement } from "react";
import type { ResolvedTheme } from "../../store/types";

interface ThemeRenderOptions extends RenderOptions {
  theme?: ResolvedTheme;
}

const TEST_THEMES = ["kanagawa-dragon", "light", "dark"] as const;
type TestTheme = (typeof TEST_THEMES)[number];

export function renderWithTheme(
  ui: ReactElement,
  options: ThemeRenderOptions = {},
): RenderResult {
  const { theme = "kanagawa-dragon", ...renderOptions } = options;
  document.documentElement.setAttribute("data-theme", theme);
  return render(ui, renderOptions);
}

export function renderWithAllThemes(
  ui: ReactElement,
  options: Omit<ThemeRenderOptions, "theme"> = {},
): Record<TestTheme, RenderResult> {
  return TEST_THEMES.reduce(
    (acc, theme) => {
      acc[theme] = renderWithTheme(ui, { ...options, theme });
      return acc;
    },
    {} as Record<TestTheme, RenderResult>,
  );
}

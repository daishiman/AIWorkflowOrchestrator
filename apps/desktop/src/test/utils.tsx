/**
 * テストユーティリティ
 * カスタムレンダー関数とProvider設定
 */
import type { ReactElement, ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { BrowserRouter, MemoryRouter } from "react-router-dom";

/**
 * Router込みでコンポーネントをレンダリング
 * @param ui - レンダリングするコンポーネント
 * @param options - レンダリングオプション
 */
export function renderWithRouter(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <BrowserRouter>{children}</BrowserRouter>
    ),
    ...options,
  });
}

/**
 * MemoryRouter込みでコンポーネントをレンダリング
 * 初期ルートやエントリを指定可能
 * @param ui - レンダリングするコンポーネント
 * @param options - レンダリングオプション
 * @param routerOptions - MemoryRouter設定
 */
export function renderWithMemoryRouter(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
  routerOptions?: {
    initialEntries?: string[];
    initialIndex?: number;
  },
) {
  return render(ui, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <MemoryRouter {...routerOptions}>{children}</MemoryRouter>
    ),
    ...options,
  });
}

/**
 * 全Provider込みでコンポーネントをレンダリング
 * 必要に応じてProviderを追加
 * @param ui - レンダリングするコンポーネント
 * @param options - レンダリングオプション
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <BrowserRouter>{children}</BrowserRouter>
    ),
    ...options,
  });
}

// @testing-library/reactの全エクスポートを再エクスポート
export * from "@testing-library/react";

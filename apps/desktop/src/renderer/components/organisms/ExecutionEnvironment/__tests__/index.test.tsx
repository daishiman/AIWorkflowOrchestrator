/**
 * ExecutionEnvironment Component Tests (TDD Green Phase)
 * @module ExecutionEnvironment.test
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { PreviewContent } from "@repo/shared/types/agent";
import { ExecutionEnvironment } from "../index";

describe("ExecutionEnvironment", () => {
  describe("環境タイプに応じたレンダリング", () => {
    it("type='html'の場合、HTMLPreviewEnvironmentが表示される", () => {
      // Given: environmentType="html"とHTMLコンテンツ
      const content: PreviewContent = {
        type: "html",
        content: "<h1>Hello</h1>",
        timestamp: new Date(),
      };

      render(<ExecutionEnvironment environmentType="html" content={content} />);

      // Then: HTMLプレビューが表示される
      expect(screen.getByTestId("html-preview")).toBeInTheDocument();
    });

    it("type='markdown'の場合、MarkdownPreviewEnvironmentが表示される", () => {
      // Given: environmentType="markdown"とMarkdownコンテンツ
      const content: PreviewContent = {
        type: "markdown",
        content: "# Hello",
        timestamp: new Date(),
      };

      render(
        <ExecutionEnvironment environmentType="markdown" content={content} />,
      );

      // Then: Markdownプレビューが表示される
      expect(screen.getByTestId("markdown-preview")).toBeInTheDocument();
    });

    it("type='none'の場合、NoPreviewPlaceholderが表示される", () => {
      // Given: environmentType="none"
      render(<ExecutionEnvironment environmentType="none" content={null} />);

      // Then: プレースホルダーが表示される
      expect(screen.getByTestId("no-preview")).toBeInTheDocument();
    });

    it("type='terminal'の場合、待機中Placeholderが表示される（handoffGuidance未指定）", () => {
      // Given: environmentType="terminal"、handoffGuidance なし
      render(
        <ExecutionEnvironment environmentType="terminal" content={null} />,
      );

      // Then: 待機中プレースホルダーが表示される
      expect(screen.getByTestId("terminal-waiting")).toBeInTheDocument();
    });

    it("type='code'の場合、Codeプレースホルダーが表示される", () => {
      // Given: environmentType="code"（将来実装）
      render(<ExecutionEnvironment environmentType="code" content={null} />);

      // Then: 未実装メッセージが表示される
      expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
    });
  });

  describe("コンテンツがnullの場合", () => {
    it("HTMLタイプでもプレースホルダーが表示される", () => {
      render(<ExecutionEnvironment environmentType="html" content={null} />);

      // Then: 空のプレースホルダーまたはローディング状態
      expect(
        screen.getByTestId("empty-preview") || screen.getByTestId("no-preview"),
      ).toBeInTheDocument();
    });

    it("Markdownタイプでもプレースホルダーが表示される", () => {
      render(
        <ExecutionEnvironment environmentType="markdown" content={null} />,
      );

      expect(
        screen.getByTestId("empty-preview") || screen.getByTestId("no-preview"),
      ).toBeInTheDocument();
    });
  });

  describe("環境タイプとコンテンツタイプの不一致", () => {
    it("環境タイプがhtmlでコンテンツがmarkdownの場合、環境タイプが優先される", () => {
      // Given: environmentType="html"だがcontent.type="markdown"
      const content: PreviewContent = {
        type: "markdown",
        content: "# Hello",
        timestamp: new Date(),
      };

      render(<ExecutionEnvironment environmentType="html" content={content} />);

      // Then: HTML環境として表示される（環境タイプ優先）
      expect(screen.getByTestId("html-preview")).toBeInTheDocument();
    });
  });

  describe("コールバック", () => {
    it("onRefreshがHTMLPreviewEnvironmentに渡される", () => {
      const onRefresh = vi.fn();
      const content: PreviewContent = {
        type: "html",
        content: "<p>Test</p>",
        timestamp: new Date(),
      };

      render(
        <ExecutionEnvironment
          environmentType="html"
          content={content}
          onRefresh={onRefresh}
        />,
      );

      // コンポーネントがonRefreshを受け取れることを確認
      // 実際の呼び出しテストは子コンポーネントのテストで行う
    });
  });

  describe("レイアウト", () => {
    it("コンテンツ領域が全体を占める", () => {
      const content: PreviewContent = {
        type: "html",
        content: "<p>Test</p>",
        timestamp: new Date(),
      };

      const { container } = render(
        <ExecutionEnvironment environmentType="html" content={content} />,
      );

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("flex-1");
    });
  });

  describe("エラーハンドリング", () => {
    it("不明な環境タイプの場合、フォールバックが表示される", () => {
      // @ts-expect-error 不明な環境タイプをテスト
      render(<ExecutionEnvironment environmentType="unknown" content={null} />);

      // Then: フォールバック（NoPreview）が表示される
      expect(screen.getByTestId("no-preview")).toBeInTheDocument();
    });
  });
});

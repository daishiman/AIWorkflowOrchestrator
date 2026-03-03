/**
 * @file GenerateStep.test.tsx
 * @description GenerateStep コンポーネント ユニットテスト
 * @phase Phase 4: テスト作成（TDD: Red -> Green）
 * @task TASK-10A-C
 *
 * P39準拠: fireEventのみ使用（happy-dom環境でuserEvent禁止）
 * P9準拠: beforeEachで状態リセット
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { GenerateStep } from "../GenerateStep";

describe("GenerateStep", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ------------------------------------------
  // 1. isGenerating=trueでスピナー表示
  // ------------------------------------------
  it("isGenerating=trueでスピナーが表示される", () => {
    render(<GenerateStep isGenerating={true} error={null} />);

    const spinner = screen.getByRole("status");
    expect(spinner).toBeInTheDocument();
  });

  // ------------------------------------------
  // 2. isGenerating=trueで「生成中...」テキスト表示
  // ------------------------------------------
  it("isGenerating=trueで「生成中...」テキストが表示される", () => {
    render(<GenerateStep isGenerating={true} error={null} />);

    expect(screen.getByText("生成中...")).toBeInTheDocument();
  });

  // ------------------------------------------
  // 3. isGenerating=falseでスピナー非表示
  // ------------------------------------------
  it("isGenerating=falseでスピナーが表示されない", () => {
    render(<GenerateStep isGenerating={false} error={null} />);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByText("生成中...")).not.toBeInTheDocument();
  });

  // ------------------------------------------
  // 4. error設定でエラーメッセージ表示
  // ------------------------------------------
  it("error設定でエラーメッセージが表示される", () => {
    const testError = new Error("接続に失敗しました");
    render(<GenerateStep isGenerating={false} error={testError} />);

    expect(screen.getByText("接続に失敗しました")).toBeInTheDocument();
  });

  // ------------------------------------------
  // 5. error=nullでエラー非表示
  // ------------------------------------------
  it("error=nullでエラーメッセージが表示されない", () => {
    render(<GenerateStep isGenerating={false} error={null} />);

    // エラーメッセージの要素がないことを確認
    expect(
      screen.queryByText("スキル生成に失敗しました"),
    ).not.toBeInTheDocument();
  });

  // ------------------------------------------
  // 6. aria-liveが存在
  // ------------------------------------------
  it("isGenerating=trueでaria-live='polite'要素が存在する", () => {
    const { container } = render(
      <GenerateStep isGenerating={true} error={null} />,
    );

    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeInTheDocument();
  });

  // ------------------------------------------
  // 7. エラーメッセージが空の場合のフォールバック
  // ------------------------------------------
  it("error.messageが空の場合にフォールバックメッセージが表示される", () => {
    const emptyError = new Error("");
    render(<GenerateStep isGenerating={false} error={emptyError} />);

    expect(screen.getByText("スキル生成に失敗しました")).toBeInTheDocument();
  });

  // ------------------------------------------
  // 8. isGeneratingとerrorが同時に設定可能
  // ------------------------------------------
  it("isGeneratingとerrorが同時に表示される", () => {
    const testError = new Error("タイムアウトしました");
    render(<GenerateStep isGenerating={true} error={testError} />);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("タイムアウトしました")).toBeInTheDocument();
  });

  // ==========================================================
  // Phase 6: 追加異常系
  // ==========================================================
  describe("GenerateStep - 追加異常系", () => {
    it("isGenerating=false かつ error=null のときスピナーもエラーも表示されない", () => {
      const { container } = render(
        <GenerateStep isGenerating={false} error={null} />,
      );
      expect(
        container.querySelector('[role="status"]'),
      ).not.toBeInTheDocument();
      expect(
        container.querySelector('[aria-live="polite"]'),
      ).not.toBeInTheDocument();
    });
  });
});

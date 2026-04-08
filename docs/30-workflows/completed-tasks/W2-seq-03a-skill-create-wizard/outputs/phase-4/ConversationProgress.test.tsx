import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ConversationProgress } from "../ConversationProgress";

describe("ConversationProgress", () => {
  // 「質問 N / 推定合計」形式で表示される
  it("「質問 3 / 10」形式で表示される", () => {
    render(<ConversationProgress current={3} estimatedTotal={10} />);
    expect(screen.getByText(/質問\s*3\s*\/\s*10/)).toBeInTheDocument();
  });

  // current=1 のとき正しく表示される
  it("current=1 のとき「質問 1 / 10」が表示される", () => {
    render(<ConversationProgress current={1} estimatedTotal={10} />);
    expect(screen.getByText(/質問\s*1\s*\/\s*10/)).toBeInTheDocument();
  });

  // プログレスバーの幅が進捗率に応じて変化する
  it("current=5, estimatedTotal=10 のときバー幅が 50% になる", () => {
    render(<ConversationProgress current={5} estimatedTotal={10} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveStyle("width: 50%");
  });
});

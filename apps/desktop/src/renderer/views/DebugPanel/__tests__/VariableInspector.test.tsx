/**
 * VariableInspector テスト
 *
 * 変数一覧表示、ネストオブジェクト展開、空状態、検索フィルタのテスト。
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { VariableInspector } from "../components/VariableInspector";

describe("VariableInspector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("インスペクタが表示される", () => {
    render(<VariableInspector variables={{}} />);
    expect(screen.getByTestId("variable-inspector")).toBeInTheDocument();
  });

  it("変数がない場合に空状態が表示される", () => {
    render(<VariableInspector variables={{}} />);
    expect(screen.getByTestId("variable-empty-state")).toBeInTheDocument();
    expect(screen.getByText("変数がありません")).toBeInTheDocument();
  });

  it("変数一覧が表示される", () => {
    const variables = {
      name: "test",
      count: 42,
      isActive: true,
    };
    render(<VariableInspector variables={variables} />);

    expect(screen.getByTestId("variable-item-name")).toBeInTheDocument();
    expect(screen.getByTestId("variable-item-count")).toBeInTheDocument();
    expect(screen.getByTestId("variable-item-isActive")).toBeInTheDocument();
  });

  it("変数の件数が表示される", () => {
    const variables = {
      a: 1,
      b: 2,
      c: 3,
    };
    render(<VariableInspector variables={variables} />);
    expect(screen.getByText("(3)")).toBeInTheDocument();
  });

  it("ネストオブジェクトが展開/折りたたみできる", async () => {
    const variables = {
      user: { name: "Alice", age: 30 },
    };
    render(<VariableInspector variables={variables} />);

    // 初期状態ではネストは折りたたまれている
    expect(screen.queryByTestId("variable-item-name")).not.toBeInTheDocument();

    // 展開ボタンクリック
    const toggleBtn = screen.getByTestId("variable-toggle-user");
    await act(async () => {
      fireEvent.click(toggleBtn);
    });

    // 子要素が表示される
    expect(screen.getByTestId("variable-item-name")).toBeInTheDocument();
    expect(screen.getByTestId("variable-item-age")).toBeInTheDocument();
  });

  it("配列が展開できる", async () => {
    const variables = {
      items: ["apple", "banana", "cherry"],
    };
    render(<VariableInspector variables={variables} />);

    // 展開ボタンクリック
    const toggleBtn = screen.getByTestId("variable-toggle-items");
    await act(async () => {
      fireEvent.click(toggleBtn);
    });

    // インデックスベースの子要素が表示される
    expect(screen.getByTestId("variable-item-0")).toBeInTheDocument();
    expect(screen.getByTestId("variable-item-1")).toBeInTheDocument();
    expect(screen.getByTestId("variable-item-2")).toBeInTheDocument();
  });

  it("検索フィルタで変数が絞り込まれる", async () => {
    const variables = {
      userName: "Alice",
      userAge: 30,
      count: 5,
    };
    render(<VariableInspector variables={variables} />);

    const filterInput = screen.getByTestId("variable-filter-input");

    await act(async () => {
      fireEvent.change(filterInput, { target: { value: "user" } });
    });

    // "user" を含む変数のみ表示
    expect(screen.getByTestId("variable-item-userName")).toBeInTheDocument();
    expect(screen.getByTestId("variable-item-userAge")).toBeInTheDocument();
    expect(screen.queryByTestId("variable-item-count")).not.toBeInTheDocument();
  });

  it("検索で結果がない場合に「一致する変数がありません」が表示される", async () => {
    const variables = {
      name: "test",
    };
    render(<VariableInspector variables={variables} />);

    const filterInput = screen.getByTestId("variable-filter-input");

    await act(async () => {
      fireEvent.change(filterInput, { target: { value: "nonexistent" } });
    });

    expect(screen.getByTestId("variable-no-results")).toBeInTheDocument();
    expect(screen.getByText("一致する変数がありません")).toBeInTheDocument();
  });

  it("変数が空の場合はフィルタ入力が表示されない", () => {
    render(<VariableInspector variables={{}} />);
    expect(
      screen.queryByTestId("variable-filter-input"),
    ).not.toBeInTheDocument();
  });

  it("role='tree'のaria-labelが設定されている", () => {
    render(<VariableInspector variables={{}} />);
    expect(screen.getByRole("tree")).toHaveAttribute("aria-label", "変数一覧");
  });
});

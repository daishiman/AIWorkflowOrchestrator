/**
 * EditCommandInput コンポーネントテスト
 *
 * Phase 4: TDD Red - 失敗するテストを作成
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditCommandInput } from "../EditCommandInput";

describe("EditCommandInput", () => {
  const defaultProps = {
    targetContextId: "context-1",
    onSubmit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("表示", () => {
    it("コマンドタイプセレクタが表示される", () => {
      render(<EditCommandInput {...defaultProps} />);

      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("送信ボタンが表示される", () => {
      render(<EditCommandInput {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: /送信|実行/ }),
      ).toBeInTheDocument();
    });

    it("全てのコマンドタイプがオプションとして表示される", async () => {
      const user = userEvent.setup();
      render(<EditCommandInput {...defaultProps} />);

      const select = screen.getByRole("combobox");
      await user.click(select);

      expect(screen.getByText(/続きを書く|continue/i)).toBeInTheDocument();
      expect(
        screen.getByText(/リファクタリング|refactor/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/テスト生成|generate.*test/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/コメント追加|add.*comment/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/カスタム|custom/i)).toBeInTheDocument();
    });

    it("デフォルトでcontinueが選択されている", () => {
      render(<EditCommandInput {...defaultProps} />);

      const select = screen.getByRole("combobox");
      expect(select).toHaveValue("continue");
    });

    it("initialTypeで初期選択を設定できる", () => {
      render(<EditCommandInput {...defaultProps} initialType="refactor" />);

      const select = screen.getByRole("combobox");
      expect(select).toHaveValue("refactor");
    });
  });

  describe("カスタム指示", () => {
    it("customタイプ選択時にテキストエリアが表示される", async () => {
      const user = userEvent.setup();
      render(<EditCommandInput {...defaultProps} />);

      const select = screen.getByRole("combobox");
      await user.selectOptions(select, "custom");

      expect(
        screen.getByRole("textbox", { name: /カスタム指示|instruction/i }),
      ).toBeInTheDocument();
    });

    it("custom以外のタイプではテキストエリアが表示されない", () => {
      render(<EditCommandInput {...defaultProps} initialType="refactor" />);

      expect(
        screen.queryByRole("textbox", { name: /カスタム指示|instruction/i }),
      ).not.toBeInTheDocument();
    });

    it("カスタム指示のプレースホルダーが表示される", async () => {
      const user = userEvent.setup();
      render(<EditCommandInput {...defaultProps} />);

      const select = screen.getByRole("combobox");
      await user.selectOptions(select, "custom");

      const textArea = screen.getByRole("textbox", {
        name: /カスタム指示|instruction/i,
      });
      expect(textArea).toHaveAttribute("placeholder");
    });

    it("カスタム指示が空の場合は送信ボタンが無効化される", async () => {
      const user = userEvent.setup();
      render(<EditCommandInput {...defaultProps} />);

      const select = screen.getByRole("combobox");
      await user.selectOptions(select, "custom");

      const submitButton = screen.getByRole("button", { name: /送信|実行/ });
      expect(submitButton).toBeDisabled();
    });

    it("カスタム指示入力後は送信ボタンが有効化される", async () => {
      const user = userEvent.setup();
      render(<EditCommandInput {...defaultProps} />);

      const select = screen.getByRole("combobox");
      await user.selectOptions(select, "custom");

      const textArea = screen.getByRole("textbox", {
        name: /カスタム指示|instruction/i,
      });
      await user.type(textArea, "カスタムの指示内容");

      const submitButton = screen.getByRole("button", { name: /送信|実行/ });
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe("インタラクション", () => {
    it("送信ボタンクリックでonSubmitが呼ばれる", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<EditCommandInput {...defaultProps} onSubmit={onSubmit} />);

      const submitButton = screen.getByRole("button", { name: /送信|実行/ });
      await user.click(submitButton);

      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it("onSubmitにEditCommandが渡される", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<EditCommandInput {...defaultProps} onSubmit={onSubmit} />);

      const submitButton = screen.getByRole("button", { name: /送信|実行/ });
      await user.click(submitButton);

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "continue",
          targetContextId: "context-1",
        }),
      );
    });

    it("customタイプではinstructionが含まれる", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<EditCommandInput {...defaultProps} onSubmit={onSubmit} />);

      const select = screen.getByRole("combobox");
      await user.selectOptions(select, "custom");

      const textArea = screen.getByRole("textbox", {
        name: /カスタム指示|instruction/i,
      });
      await user.type(textArea, "テストの指示");

      const submitButton = screen.getByRole("button", { name: /送信|実行/ });
      await user.click(submitButton);

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "custom",
          instruction: "テストの指示",
        }),
      );
    });

    it("Ctrl+Enterで送信される", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<EditCommandInput {...defaultProps} onSubmit={onSubmit} />);

      // フォーム内の要素にフォーカスしてからキーボードイベントを発火
      const select = screen.getByRole("combobox");
      await user.click(select);
      await user.keyboard("{Control>}{Enter}{/Control}");

      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it("Cmd+Enterで送信される（Mac）", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<EditCommandInput {...defaultProps} onSubmit={onSubmit} />);

      // フォーム内の要素にフォーカスしてからキーボードイベントを発火
      const select = screen.getByRole("combobox");
      await user.click(select);
      await user.keyboard("{Meta>}{Enter}{/Meta}");

      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe("無効化状態", () => {
    it("disabled=trueでセレクタが無効化される", () => {
      render(<EditCommandInput {...defaultProps} disabled={true} />);

      const select = screen.getByRole("combobox");
      expect(select).toBeDisabled();
    });

    it("disabled=trueで送信ボタンが無効化される", () => {
      render(<EditCommandInput {...defaultProps} disabled={true} />);

      const submitButton = screen.getByRole("button", { name: /送信|実行/ });
      expect(submitButton).toBeDisabled();
    });

    it("disabled=trueでテキストエリアが無効化される", async () => {
      const _user = userEvent.setup(); // Reserved for future interaction tests
      render(
        <EditCommandInput
          {...defaultProps}
          disabled={true}
          initialType="custom"
        />,
      );

      // customタイプが初期設定されているのでテキストエリアが表示される
      const textArea = screen.getByRole("textbox", {
        name: /カスタム指示|instruction/i,
      });
      expect(textArea).toBeDisabled();
    });

    it("isLoading=trueでローディング状態になる", () => {
      render(<EditCommandInput {...defaultProps} isLoading={true} />);

      const submitButton = screen.getByRole("button", { name: /送信|実行/ });
      expect(submitButton).toBeDisabled();
      expect(
        submitButton.querySelector("svg") ||
          screen.getByRole("button").querySelector('[class*="animate"]'),
      ).toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("セレクタにaria-labelが設定されている", () => {
      render(<EditCommandInput {...defaultProps} />);

      const select = screen.getByRole("combobox");
      expect(select).toHaveAttribute("aria-label", "コマンドタイプ");
    });

    it("送信ボタンにaria-labelが設定されている", () => {
      render(<EditCommandInput {...defaultProps} />);

      const submitButton = screen.getByRole("button", { name: /送信|実行/ });
      expect(submitButton).toHaveAttribute("aria-label");
    });

    it("テキストエリアにaria-labelが設定されている", async () => {
      const user = userEvent.setup();
      render(<EditCommandInput {...defaultProps} />);

      const select = screen.getByRole("combobox");
      await user.selectOptions(select, "custom");

      const textArea = screen.getByRole("textbox", {
        name: /カスタム指示|instruction/i,
      });
      expect(textArea).toHaveAttribute("aria-label");
    });

    it("ローディング中はaria-busyがtrueになる", () => {
      render(<EditCommandInput {...defaultProps} isLoading={true} />);

      const form = screen.getByRole("form");
      expect(form).toHaveAttribute("aria-busy", "true");
    });

    it("フォームにrole=formが設定されている", () => {
      render(<EditCommandInput {...defaultProps} />);

      expect(screen.getByRole("form")).toBeInTheDocument();
    });
  });

  describe("オプション", () => {
    it("テスト生成時にtestFrameworkオプションが設定できる", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(
        <EditCommandInput
          {...defaultProps}
          onSubmit={onSubmit}
          initialType="generate-test"
          defaultOptions={{ testFramework: "vitest" }}
        />,
      );

      const submitButton = screen.getByRole("button", { name: /送信|実行/ });
      await user.click(submitButton);

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "generate-test",
          options: expect.objectContaining({
            testFramework: "vitest",
          }),
        }),
      );
    });

    it("コメント追加時にcommentStyleオプションが設定できる", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(
        <EditCommandInput
          {...defaultProps}
          onSubmit={onSubmit}
          initialType="add-comment"
          defaultOptions={{ commentStyle: "jsdoc" }}
        />,
      );

      const submitButton = screen.getByRole("button", { name: /送信|実行/ });
      await user.click(submitButton);

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "add-comment",
          options: expect.objectContaining({
            commentStyle: "jsdoc",
          }),
        }),
      );
    });

    it("リファクタリング時にrefactorFocusオプションが設定できる", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(
        <EditCommandInput
          {...defaultProps}
          onSubmit={onSubmit}
          initialType="refactor"
          defaultOptions={{ refactorFocus: "readability" }}
        />,
      );

      const submitButton = screen.getByRole("button", { name: /送信|実行/ });
      await user.click(submitButton);

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "refactor",
          options: expect.objectContaining({
            refactorFocus: "readability",
          }),
        }),
      );
    });
  });

  describe("スタイリング", () => {
    it("classNameでカスタムクラスを追加できる", () => {
      const { container } = render(
        <EditCommandInput {...defaultProps} className="custom-class" />,
      );

      expect(container.firstChild).toHaveClass("custom-class");
    });

    it("size=smでコンパクト表示になる", () => {
      render(<EditCommandInput {...defaultProps} size="sm" />);

      const select = screen.getByRole("combobox");
      expect(select.className).toMatch(/text-sm/);
    });

    it("size=mdでデフォルト表示になる", () => {
      render(<EditCommandInput {...defaultProps} size="md" />);

      const select = screen.getByRole("combobox");
      expect(select).toBeInTheDocument();
    });
  });

  describe("送信後のリセット", () => {
    it("送信後にフォームがリセットされない（デフォルト）", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(
        <EditCommandInput
          {...defaultProps}
          onSubmit={onSubmit}
          initialType="custom"
        />,
      );

      const textArea = screen.getByRole("textbox", {
        name: /カスタム指示|instruction/i,
      });
      await user.type(textArea, "テストの指示");

      const submitButton = screen.getByRole("button", { name: /送信|実行/ });
      await user.click(submitButton);

      expect(textArea).toHaveValue("テストの指示");
    });

    it("resetOnSubmit=trueで送信後にフォームがリセットされる", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(
        <EditCommandInput
          {...defaultProps}
          onSubmit={onSubmit}
          initialType="custom"
          resetOnSubmit={true}
        />,
      );

      const textArea = screen.getByRole("textbox", {
        name: /カスタム指示|instruction/i,
      });
      await user.type(textArea, "テストの指示");

      const submitButton = screen.getByRole("button", { name: /送信|実行/ });
      await user.click(submitButton);

      await waitFor(() => {
        expect(textArea).toHaveValue("");
      });
    });
  });
});

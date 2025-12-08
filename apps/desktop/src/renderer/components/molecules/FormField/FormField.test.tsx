import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormField } from "./index";
import { Input } from "../../atoms/Input";

describe("FormField", () => {
  describe("レンダリング", () => {
    it("ラベルをレンダリングする", () => {
      render(
        <FormField label="Username">
          <Input value="" onChange={() => {}} />
        </FormField>,
      );
      expect(screen.getByText("Username")).toBeInTheDocument();
    });

    it("子要素をレンダリングする", () => {
      render(
        <FormField label="Username">
          <Input value="" onChange={() => {}} placeholder="Enter username" />
        </FormField>,
      );
      expect(screen.getByPlaceholderText("Enter username")).toBeInTheDocument();
    });
  });

  describe("必須フィールド", () => {
    it("required=trueで * マークを表示する", () => {
      render(
        <FormField label="Username" required>
          <Input value="" onChange={() => {}} />
        </FormField>,
      );
      expect(screen.getByText("*")).toBeInTheDocument();
    });

    it("required=trueで * にaria-label=requiredを設定する", () => {
      render(
        <FormField label="Username" required>
          <Input value="" onChange={() => {}} />
        </FormField>,
      );
      expect(screen.getByLabelText("required")).toBeInTheDocument();
    });

    it("required=falseで * マークを表示しない", () => {
      render(
        <FormField label="Username" required={false}>
          <Input value="" onChange={() => {}} />
        </FormField>,
      );
      expect(screen.queryByText("*")).not.toBeInTheDocument();
    });

    it("子要素にaria-required=trueを設定する", () => {
      render(
        <FormField label="Username" required>
          <Input value="" onChange={() => {}} />
        </FormField>,
      );
      expect(screen.getByRole("textbox")).toHaveAttribute(
        "aria-required",
        "true",
      );
    });
  });

  describe("説明", () => {
    it("descriptionを表示する", () => {
      render(
        <FormField label="Username" description="Choose a unique username">
          <Input value="" onChange={() => {}} />
        </FormField>,
      );
      expect(screen.getByText("Choose a unique username")).toBeInTheDocument();
    });

    it("descriptionがない場合は表示しない", () => {
      render(
        <FormField label="Username">
          <Input value="" onChange={() => {}} />
        </FormField>,
      );
      expect(
        screen.queryByText("Choose a unique username"),
      ).not.toBeInTheDocument();
    });
  });

  describe("エラー", () => {
    it("エラーメッセージを表示する", () => {
      render(
        <FormField label="Username" error="Username is required">
          <Input value="" onChange={() => {}} />
        </FormField>,
      );
      expect(screen.getByText("Username is required")).toBeInTheDocument();
    });

    it("エラーにrole=alertを設定する", () => {
      render(
        <FormField label="Username" error="Username is required">
          <Input value="" onChange={() => {}} />
        </FormField>,
      );
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("エラーがない場合はエラー要素を表示しない", () => {
      render(
        <FormField label="Username">
          <Input value="" onChange={() => {}} />
        </FormField>,
      );
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("子要素にaria-invalid=trueを設定する", () => {
      render(
        <FormField label="Username" error="Username is required">
          <Input value="" onChange={() => {}} />
        </FormField>,
      );
      expect(screen.getByRole("textbox")).toHaveAttribute(
        "aria-invalid",
        "true",
      );
    });
  });

  describe("アクセシビリティ", () => {
    it("ラベルとinputをhtmlForで関連付ける", () => {
      render(
        <FormField label="Username" htmlFor="username-input">
          <Input value="" onChange={() => {}} />
        </FormField>,
      );
      const label = screen.getByText("Username");
      const input = screen.getByRole("textbox");
      expect(label).toHaveAttribute("for", "username-input");
      expect(input).toHaveAttribute("id", "username-input");
    });

    it("htmlForがない場合、自動生成されたidで関連付ける", () => {
      render(
        <FormField label="Username">
          <Input value="" onChange={() => {}} />
        </FormField>,
      );
      const label = screen.getByText("Username");
      const input = screen.getByRole("textbox");
      const labelFor = label.getAttribute("for");
      const inputId = input.getAttribute("id");
      expect(labelFor).toBeTruthy();
      expect(labelFor).toBe(inputId);
    });

    it("descriptionとerrorをaria-describedbyで関連付ける", () => {
      render(
        <FormField
          label="Username"
          description="Help text"
          error="Error message"
        >
          <Input value="" onChange={() => {}} />
        </FormField>,
      );
      const input = screen.getByRole("textbox");
      const describedBy = input.getAttribute("aria-describedby");
      expect(describedBy).toBeTruthy();
      // descriptionとerrorの両方のidが含まれる
      expect(describedBy?.split(" ").length).toBe(2);
    });
  });

  describe("className", () => {
    it("カスタムclassNameを追加する", () => {
      const { container } = render(
        <FormField label="Username" className="custom-class">
          <Input value="" onChange={() => {}} />
        </FormField>,
      );
      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("displayName", () => {
    it("displayNameが設定されている", () => {
      expect(FormField.displayName).toBe("FormField");
    });
  });
});

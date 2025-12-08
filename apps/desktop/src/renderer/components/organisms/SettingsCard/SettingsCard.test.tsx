import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SettingsCard } from "./index";

describe("SettingsCard", () => {
  describe("レンダリング", () => {
    it("カードをレンダリングする", () => {
      render(
        <SettingsCard title="General Settings">
          <div>Content</div>
        </SettingsCard>,
      );
      expect(screen.getByText("General Settings")).toBeInTheDocument();
    });

    it("子要素をレンダリングする", () => {
      render(
        <SettingsCard title="Settings">
          <button>Save</button>
        </SettingsCard>,
      );
      expect(screen.getByText("Save")).toBeInTheDocument();
    });
  });

  describe("タイトル", () => {
    it("タイトルをh3として表示する", () => {
      render(
        <SettingsCard title="Account Settings">
          <div>Content</div>
        </SettingsCard>,
      );
      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading).toHaveTextContent("Account Settings");
    });
  });

  describe("説明", () => {
    it("descriptionを表示する", () => {
      render(
        <SettingsCard title="Settings" description="Configure your preferences">
          <div>Content</div>
        </SettingsCard>,
      );
      expect(
        screen.getByText("Configure your preferences"),
      ).toBeInTheDocument();
    });

    it("descriptionがない場合は表示しない", () => {
      render(
        <SettingsCard title="Settings">
          <div>Content</div>
        </SettingsCard>,
      );
      expect(
        screen.queryByText("Configure your preferences"),
      ).not.toBeInTheDocument();
    });
  });

  describe("スタイル", () => {
    it("GlassPanelのスタイルを継承する", () => {
      const { container } = render(
        <SettingsCard title="Settings">
          <div>Content</div>
        </SettingsCard>,
      );
      // GlassPanelのデフォルトスタイル（radius=md, blur=md）
      expect(container.firstChild).toHaveClass("rounded-[16px]");
      expect(container.firstChild).toHaveClass("backdrop-blur-[20px]");
    });

    it("p-6クラスを持つ", () => {
      const { container } = render(
        <SettingsCard title="Settings">
          <div>Content</div>
        </SettingsCard>,
      );
      expect(container.firstChild).toHaveClass("p-6");
    });
  });

  describe("className", () => {
    it("カスタムclassNameを追加する", () => {
      const { container } = render(
        <SettingsCard title="Settings" className="custom-class">
          <div>Content</div>
        </SettingsCard>,
      );
      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("displayName", () => {
    it("displayNameが設定されている", () => {
      expect(SettingsCard.displayName).toBe("SettingsCard");
    });
  });
});

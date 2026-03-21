import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SlideWatchStatus, dotStyles, labelMap } from "./SlideWatchStatus";

describe("SlideWatchStatus", () => {
  describe("watching=true: 緑ドット + 監視中", () => {
    it("watching=true のとき activeラベルを表示する", () => {
      render(<SlideWatchStatus watching={true} />);
      expect(screen.getByText(labelMap.active)).toBeInTheDocument();
    });

    it("watching=true のとき activeドットスタイルを適用する", () => {
      render(<SlideWatchStatus watching={true} />);
      const dot = screen.getByRole("status").querySelector("span[aria-hidden]");
      expect(dot?.className).toContain(dotStyles.active.split(" ")[0]);
    });
  });

  describe("watching=false: 灰ドット + 停止中", () => {
    it("watching=false のとき inactiveラベルを表示する", () => {
      render(<SlideWatchStatus watching={false} />);
      expect(screen.getByText(labelMap.inactive)).toBeInTheDocument();
    });

    it("watching=false のとき inactiveドットスタイルを適用する", () => {
      render(<SlideWatchStatus watching={false} />);
      const dot = screen.getByRole("status").querySelector("span[aria-hidden]");
      expect(dot?.className).toContain(dotStyles.inactive.split(" ")[0]);
    });
  });

  describe("syncDirection 表示", () => {
    it("syncDirection=forward のとき → を表示する", () => {
      render(<SlideWatchStatus watching={true} syncDirection="forward" />);
      expect(screen.getByText("→")).toBeInTheDocument();
    });

    it("syncDirection=reverse のとき ← を表示する", () => {
      render(<SlideWatchStatus watching={true} syncDirection="reverse" />);
      expect(screen.getByText("←")).toBeInTheDocument();
    });

    it("syncDirection 未指定のとき方向表示なし", () => {
      render(<SlideWatchStatus watching={true} />);
      expect(screen.queryByText("→")).not.toBeInTheDocument();
      expect(screen.queryByText("←")).not.toBeInTheDocument();
    });
  });

  describe("watchPath 表示", () => {
    it("watchPath が指定されたとき表示する", () => {
      render(<SlideWatchStatus watching={true} watchPath="/path/to/project" />);
      expect(screen.getByText("/path/to/project")).toBeInTheDocument();
    });

    it("watchPath 未指定のとき非表示", () => {
      render(<SlideWatchStatus watching={true} />);
      expect(screen.queryByTitle("")).not.toBeInTheDocument();
    });
  });

  describe("ARIA", () => {
    it("role=status を持つ", () => {
      render(<SlideWatchStatus watching={true} />);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("data-testid=slide-watch-status を持つ", () => {
      render(<SlideWatchStatus watching={true} />);
      expect(screen.getByTestId("slide-watch-status")).toBeInTheDocument();
    });

    it("aria-label に状態テキストが含まれる", () => {
      render(<SlideWatchStatus watching={true} />);
      expect(screen.getByRole("status")).toHaveAttribute(
        "aria-label",
        "監視状態: 監視中",
      );
    });
  });

  describe("P47: dotStyles export 検証", () => {
    it("dotStyles.active が緑色クラスを含む", () => {
      expect(dotStyles.active).toContain("#34C759");
    });

    it("dotStyles.inactive が灰色クラスを含む", () => {
      expect(dotStyles.inactive).toContain("#C6C6C8");
    });
  });
});

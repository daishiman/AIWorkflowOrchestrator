import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MasterDetailLayout } from "./index";

function setViewportWidth(width: number): void {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: width,
  });
  fireEvent(window, new Event("resize"));
}

describe("MasterDetailLayout", () => {
  beforeEach(() => {
    setViewportWidth(1280);
  });

  it("desktopで左右分割表示する", () => {
    render(
      <MasterDetailLayout
        master={<div>master</div>}
        detail={<div>detail</div>}
        isDetailOpen={true}
      />,
    );

    expect(screen.getByText("master")).toBeInTheDocument();
    expect(screen.getByText("detail")).toBeInTheDocument();
  });

  it("mobileでdetailをSlideInPanelとして表示する", () => {
    setViewportWidth(700);

    render(
      <MasterDetailLayout
        master={<div>master</div>}
        detail={<div>detail</div>}
        isDetailOpen={true}
      />,
    );

    expect(screen.getByText("master")).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "詳細" })).toBeInTheDocument();
  });

  it("overlayOnMobile=falseならmobileでも分割表示する", () => {
    setViewportWidth(700);

    render(
      <MasterDetailLayout
        master={<div>master</div>}
        detail={<div>detail</div>}
        isDetailOpen={true}
        overlayOnMobile={false}
      />,
    );

    expect(screen.getByText("master")).toBeInTheDocument();
    expect(screen.getByText("detail")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("mobile overlayで閉じる操作を伝播する", () => {
    setViewportWidth(700);
    const onCloseDetail = vi.fn();

    render(
      <MasterDetailLayout
        master={<div>master</div>}
        detail={<div>detail</div>}
        isDetailOpen={true}
        onCloseDetail={onCloseDetail}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "オーバーレイを閉じる" }),
    );
    expect(onCloseDetail).toHaveBeenCalledTimes(1);
  });
});

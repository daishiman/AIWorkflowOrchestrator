import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { useAppStore } from "../../../store";
import { AppLayout } from "./index";

describe("AppLayout", () => {
  beforeEach(() => {
    useAppStore.setState({
      responsiveMode: "desktop",
      isNavExpanded: true,
      isMobileMoreOpen: false,
      dynamicIsland: {
        visible: false,
        status: "completed",
        message: "",
      },
    });
  });

  it("desktop では GlobalNavStrip と本文を描画する", () => {
    render(
      <AppLayout
        currentView="dashboard"
        onViewChange={vi.fn()}
        onGoBack={vi.fn()}
        canGoBack={false}
      >
        <div>Desktop Content</div>
      </AppLayout>,
    );

    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveTextContent("Desktop Content");
    expect(
      screen.getByRole("button", { name: "前のビューに戻る" }),
    ).toBeDisabled();
  });

  it("mobile では MobileNavBar を表示し、戻る操作を呼び出せる", () => {
    useAppStore.setState({ responsiveMode: "mobile" });
    const onGoBack = vi.fn();

    render(
      <AppLayout
        currentView="dashboard"
        onViewChange={vi.fn()}
        onGoBack={onGoBack}
        canGoBack={true}
      >
        <div>Mobile Content</div>
      </AppLayout>,
    );

    fireEvent.click(screen.getByRole("button", { name: "前のビューに戻る" }));

    expect(screen.getByRole("button", { name: "その他" })).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveClass("pb-[88px]");
    expect(onGoBack).toHaveBeenCalledTimes(1);
  });
});

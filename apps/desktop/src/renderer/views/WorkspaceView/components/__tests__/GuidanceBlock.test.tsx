import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GuidanceBlock } from "../GuidanceBlock";

describe("GuidanceBlock", () => {
  it("primary / secondary action の両方を描画できる", () => {
    const onAction = vi.fn();
    const onSecondaryAction = vi.fn();

    render(
      <GuidanceBlock
        variant="blocked"
        message="ガイダンス"
        actionLabel="設定を見る"
        onAction={onAction}
        secondaryActionLabel="ターミナルを開く"
        onSecondaryAction={onSecondaryAction}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "設定を見る" }));
    fireEvent.click(screen.getByRole("button", { name: "ターミナルを開く" }));

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onSecondaryAction).toHaveBeenCalledTimes(1);
  });

  it("secondary handler が無い場合は secondary CTA を描画しない", () => {
    render(
      <GuidanceBlock
        variant="blocked"
        message="ガイダンス"
        secondaryActionLabel="ターミナルを開く"
      />,
    );

    expect(
      screen.queryByRole("button", { name: "ターミナルを開く" }),
    ).not.toBeInTheDocument();
  });
});

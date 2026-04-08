import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ChoiceButton } from "../ChoiceButton";

describe("ChoiceButton", () => {
  // 選択済み状態のスタイル確認
  it("isSelected=true のとき選択済みスタイルが適用される", () => {
    render(
      <ChoiceButton label="選択肢A" isSelected={true} onClick={() => {}} />,
    );
    const btn = screen.getByRole("button", { name: "選択肢A" });
    expect(btn).toHaveClass("bg-blue-500");
  });

  // 未選択状態のスタイル確認
  it("isSelected=false のとき未選択スタイルが適用される", () => {
    render(
      <ChoiceButton label="選択肢A" isSelected={false} onClick={() => {}} />,
    );
    const btn = screen.getByRole("button", { name: "選択肢A" });
    expect(btn).not.toHaveClass("bg-blue-500");
  });

  // isFreeText=true のとき破線ボーダースタイル
  it("isFreeText=true のとき破線ボーダースタイルが適用される", () => {
    render(
      <ChoiceButton
        label="その他（自由入力）"
        isSelected={false}
        isFreeText={true}
        onClick={() => {}}
      />,
    );
    const btn = screen.getByRole("button", { name: "その他（自由入力）" });
    expect(btn).toHaveClass("border-dashed");
  });

  // クリック時に onClick が呼ばれる
  it("クリック時に onClick コールバックが呼ばれる", () => {
    const onClick = vi.fn();
    render(
      <ChoiceButton label="選択肢A" isSelected={false} onClick={onClick} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "選択肢A" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  // disabled=true のとき onClick が呼ばれない
  it("disabled=true のとき onClick が呼ばれない", () => {
    const onClick = vi.fn();
    render(
      <ChoiceButton
        label="選択肢A"
        isSelected={false}
        onClick={onClick}
        disabled={true}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "選択肢A" }));
    expect(onClick).not.toHaveBeenCalled();
  });
});

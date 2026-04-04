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

describe("ChoiceButton エッジケース", () => {
  // T-07-1: 長いラベルテキストでも表示が崩れない
  it("100文字を超える長いラベルテキストでも表示される", () => {
    const longLabel = "あ".repeat(120);
    render(
      <ChoiceButton label={longLabel} isSelected={false} onClick={() => {}} />,
    );
    expect(screen.getByRole("button", { name: longLabel })).toBeInTheDocument();
  });

  // T-07-2: 空のラベルテキストでもクラッシュしない
  it("空のラベルテキストでもクラッシュせずに表示される", () => {
    render(<ChoiceButton label="" isSelected={false} onClick={() => {}} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  // isFreeText=true かつ isSelected=true の組み合わせ
  it("isFreeText=true かつ isSelected=true のとき選択済みスタイルが優先される", () => {
    render(
      <ChoiceButton
        label="その他（自由入力）"
        isSelected={true}
        isFreeText={true}
        onClick={() => {}}
      />,
    );
    const btn = screen.getByRole("button");
    expect(btn).toHaveClass("bg-blue-500");
    // isSelected=true のとき border-dashed は適用されない
    expect(btn).not.toHaveClass("border-dashed");
  });

  // aria-pressed 属性
  it("aria-pressed 属性が isSelected の値を反映する", () => {
    render(
      <ChoiceButton label="選択肢" isSelected={true} onClick={() => {}} />,
    );
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });
});

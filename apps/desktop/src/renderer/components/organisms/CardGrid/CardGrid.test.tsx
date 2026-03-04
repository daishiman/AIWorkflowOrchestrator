import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CardGrid } from "./index";
import { renderWithAllThemes } from "../../../tests/helpers/renderWithTheme";

interface Item {
  id: string;
  label: string;
}

const items: Item[] = [
  { id: "1", label: "A" },
  { id: "2", label: "B" },
];

describe("CardGrid", () => {
  it("アイテムをgridcellとして表示する", () => {
    render(
      <CardGrid items={items} renderCard={(item) => <div>{item.label}</div>} />,
    );

    expect(screen.getByRole("grid")).toBeInTheDocument();
    expect(screen.getAllByRole("gridcell")).toHaveLength(2);
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("ローディング時にSkeletonCardを指定数表示する", () => {
    render(
      <CardGrid
        items={[]}
        isLoading={true}
        skeletonCount={3}
        renderCard={(item: Item) => <div>{item.label}</div>}
      />,
    );

    expect(screen.getAllByRole("status")).toHaveLength(3);
  });

  it("空状態でメッセージを表示する", () => {
    render(
      <CardGrid
        items={[]}
        emptyMessage="空です"
        renderCard={(item: Item) => <div>{item.label}</div>}
      />,
    );

    expect(screen.getByText("空です")).toBeInTheDocument();
  });

  it("minCardWidthをgrid-template-columnsに反映する", () => {
    render(
      <CardGrid
        items={items}
        minCardWidth={320}
        renderCard={(item) => <div>{item.label}</div>}
      />,
    );

    expect(screen.getByRole("grid")).toHaveStyle({
      gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    });
  });

  it("3テーマでレンダリングできる", () => {
    expect(() => {
      renderWithAllThemes(
        <CardGrid
          items={items}
          renderCard={(item) => <div>{item.label}</div>}
        />,
      );
    }).not.toThrow();
  });
});

import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { SearchFilterList } from "./index";
import { renderWithAllThemes } from "../../../tests/helpers/renderWithTheme";

interface Skill {
  id: string;
  name: string;
  category: "core" | "extra";
}

const skills: Skill[] = [
  { id: "1", name: "build", category: "core" },
  { id: "2", name: "lint", category: "core" },
  { id: "3", name: "translate", category: "extra" },
];

const filters = [
  {
    id: "core",
    label: "Core",
    predicate: (item: Skill) => item.category === "core",
  },
  {
    id: "extra",
    label: "Extra",
    predicate: (item: Skill) => item.category === "extra",
  },
];

describe("SearchFilterList", () => {
  it("初期表示で全件を表示する", () => {
    render(
      <SearchFilterList
        items={skills}
        filters={filters}
        searchPredicate={(item, query) => item.name.includes(query)}
        renderItem={(item) => <div>{item.name}</div>}
      />,
    );

    expect(screen.getByText("3 件")).toBeInTheDocument();
    expect(screen.getByText("build")).toBeInTheDocument();
    expect(screen.getByText("lint")).toBeInTheDocument();
    expect(screen.getByText("translate")).toBeInTheDocument();
  });

  it("検索クエリで絞り込む", () => {
    render(
      <SearchFilterList
        items={skills}
        filters={filters}
        searchPredicate={(item, query) => item.name.includes(query)}
        renderItem={(item) => <div>{item.name}</div>}
      />,
    );

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "li" },
    });

    expect(screen.getByText("1 件")).toBeInTheDocument();
    expect(screen.getByText("lint")).toBeInTheDocument();
    expect(screen.queryByText("build")).not.toBeInTheDocument();
  });

  it("FilterChip選択でフィルターを適用する", () => {
    render(
      <SearchFilterList
        items={skills}
        filters={filters}
        searchPredicate={(item, query) => item.name.includes(query)}
        renderItem={(item) => <div>{item.name}</div>}
      />,
    );

    fireEvent.click(screen.getByRole("checkbox", { name: /Core/i }));

    expect(screen.getByText("2 件")).toBeInTheDocument();
    expect(screen.getByText("build")).toBeInTheDocument();
    expect(screen.getByText("lint")).toBeInTheDocument();
    expect(screen.queryByText("translate")).not.toBeInTheDocument();
  });

  it("gridモードでCardGrid描画する", () => {
    render(
      <SearchFilterList
        items={skills}
        filters={filters}
        searchPredicate={(item, query) => item.name.includes(query)}
        viewMode="grid"
        renderCard={(item) => <div>{item.name}</div>}
      />,
    );

    expect(screen.getByRole("grid")).toBeInTheDocument();
    expect(screen.getAllByRole("gridcell")).toHaveLength(3);
  });

  it("空状態メッセージを表示する", () => {
    render(
      <SearchFilterList
        items={skills}
        filters={filters}
        searchPredicate={() => false}
        renderItem={(item) => <div>{item.name}</div>}
        emptyMessage="結果なし"
      />,
    );

    expect(screen.getByText("結果なし")).toBeInTheDocument();
  });

  it("3テーマでレンダリングできる", () => {
    expect(() => {
      renderWithAllThemes(
        <SearchFilterList
          items={skills}
          filters={filters}
          searchPredicate={(item, query) => item.name.includes(query)}
          renderItem={(item) => <div>{item.name}</div>}
        />,
      );
    }).not.toThrow();
  });
});

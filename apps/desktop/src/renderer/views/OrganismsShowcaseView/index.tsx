import React, { useMemo } from "react";
import { CardGrid } from "../../components/organisms/CardGrid";
import { MasterDetailLayout } from "../../components/organisms/MasterDetailLayout";
import { SearchFilterList } from "../../components/organisms/SearchFilterList";

interface ShowcaseItem {
  id: string;
  title: string;
  category: "A" | "B";
  score: number;
}

const showcaseItems: ShowcaseItem[] = [
  { id: "a1", title: "Alpha", category: "A", score: 81 },
  { id: "a2", title: "Beta", category: "B", score: 62 },
  { id: "a3", title: "Gamma", category: "A", score: 74 },
  { id: "a4", title: "Delta", category: "B", score: 55 },
];

const filters = [
  {
    id: "category-a",
    label: "カテゴリA",
    icon: "tag",
    predicate: (item: ShowcaseItem) => item.category === "A",
  },
  {
    id: "score-70",
    label: "70点以上",
    icon: "sparkles",
    predicate: (item: ShowcaseItem) => item.score >= 70,
  },
];

export const OrganismsShowcaseView: React.FC = () => {
  const searchParams = useMemo(
    () => new URLSearchParams(window.location.search),
    [],
  );

  const cardState = searchParams.get("card") ?? "default";
  const viewMode = searchParams.get("view") === "grid" ? "grid" : "list";
  const detailState = searchParams.get("detail") ?? "open";

  const cardItems =
    cardState === "empty" || cardState === "loading" ? [] : showcaseItems;
  const isCardLoading = cardState === "loading";
  const isDetailOpen = detailState !== "closed";

  return (
    <section
      data-testid="organisms-showcase-view"
      className="mx-auto flex w-full max-w-[1240px] flex-col gap-8 py-4"
    >
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Organisms Showcase</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          TASK-UI-00-ORGANISMS の手動検証用ビュー
        </p>
      </header>

      <section data-testid="showcase-card-grid" className="space-y-3">
        <h2 className="text-lg font-semibold">CardGrid</h2>
        <CardGrid<ShowcaseItem>
          items={cardItems}
          isLoading={isCardLoading}
          emptyMessage="カードがありません"
          renderCard={(item) => (
            <article className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4">
              <h3 className="text-base font-semibold">{item.title}</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                カテゴリ: {item.category} / スコア: {item.score}
              </p>
            </article>
          )}
        />
      </section>

      <section data-testid="showcase-master-detail" className="space-y-3">
        <h2 className="text-lg font-semibold">MasterDetailLayout</h2>
        <div className="h-[360px]">
          <MasterDetailLayout
            isDetailOpen={isDetailOpen}
            master={
              <ul className="space-y-2 p-3" aria-label="一覧項目">
                {showcaseItems.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-2"
                  >
                    {item.title}
                  </li>
                ))}
              </ul>
            }
            detail={
              <article className="space-y-2 p-4">
                <h3 className="text-base font-semibold">詳細ビュー</h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  モバイル時は SlideInPanel で表示されます。
                </p>
              </article>
            }
          />
        </div>
      </section>

      <section data-testid="showcase-search-filter-list" className="space-y-3">
        <h2 className="text-lg font-semibold">SearchFilterList</h2>
        <SearchFilterList<ShowcaseItem>
          items={showcaseItems}
          filters={filters}
          viewMode={viewMode}
          searchPredicate={(item, query) =>
            item.title.toLowerCase().includes(query.toLowerCase())
          }
          renderItem={(item) => (
            <article className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2">
              <strong>{item.title}</strong>
              <span className="ml-2 text-sm text-[var(--text-secondary)]">
                {item.category} / {item.score}
              </span>
            </article>
          )}
          renderCard={(item) => (
            <article className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4">
              <h3 className="text-base font-semibold">{item.title}</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                {item.category} / {item.score}
              </p>
            </article>
          )}
        />
      </section>
    </section>
  );
};

OrganismsShowcaseView.displayName = "OrganismsShowcaseView";

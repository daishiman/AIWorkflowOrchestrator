import React, { memo, useMemo, useState } from "react";
import { CheckCircle, Layers, PanelRightOpen } from "lucide-react";
import {
  Badge,
  EmptyState,
  RelativeTime,
  SkeletonCard,
  StatusIndicator,
} from "../../components/atoms";
import {
  CodeViewer,
  ConfirmDialog,
  SearchBar,
  SlideInPanel,
  TabSwitcher,
} from "../../components/molecules";
import {
  CardGrid,
  MasterDetailLayout,
  SearchFilterList,
} from "../../components/organisms";

type DemoItem = {
  id: string;
  title: string;
  description: string;
  category: "core" | "extension";
  status: "running" | "success" | "warning";
  updatedAt: string;
};

const demoItems: DemoItem[] = [
  {
    id: "1",
    title: "Search Foundation",
    description: "検索導線とフィルタリングの共通化",
    category: "core",
    status: "success",
    updatedAt: "2026-03-04T09:00:00.000Z",
  },
  {
    id: "2",
    title: "Panel Interaction",
    description: "SlideInPanelとConfirmDialogの統合",
    category: "core",
    status: "running",
    updatedAt: "2026-03-04T10:20:00.000Z",
  },
  {
    id: "3",
    title: "UX Language",
    description: "やさしい文言への統一",
    category: "extension",
    status: "warning",
    updatedAt: "2026-03-03T23:15:00.000Z",
  },
];

const tabs = [
  { id: "overview", label: "Overview", icon: "layout-grid" },
  { id: "code", label: "Code", icon: "file-text", badge: 3 },
  { id: "qa", label: "QA", icon: "check-circle" },
];

const codeSample = `interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onDebouncedChange?: (value: string) => void;
}`;

const previewStyles = {
  section:
    "rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4",
};

const UIDesignFoundationPreviewComponent: React.FC = () => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [panelOpen, setPanelOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(
    demoItems[0]?.id ?? null,
  );

  const selectedItem = useMemo(
    () => demoItems.find((item) => item.id === selectedItemId) ?? null,
    [selectedItemId],
  );

  return (
    <div
      data-testid="ui-design-foundation-preview"
      className="mx-auto flex max-w-6xl flex-col gap-4"
    >
      <section className={previewStyles.section}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-[var(--text-primary)]">
              UI Design Foundation Preview
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              共通トークンと Atomic Components の統合プレビュー
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              data-testid="theme-dark"
              onClick={() =>
                document.documentElement.setAttribute("data-theme", "dark")
              }
              className="rounded-[var(--radius-default)] bg-[var(--bg-tertiary)] px-3 py-2 text-sm"
            >
              Dark
            </button>
            <button
              type="button"
              data-testid="theme-light"
              onClick={() =>
                document.documentElement.setAttribute("data-theme", "light")
              }
              className="rounded-[var(--radius-default)] bg-[var(--bg-tertiary)] px-3 py-2 text-sm"
            >
              Light
            </button>
            <button
              type="button"
              data-testid="open-panel"
              onClick={() => setPanelOpen(true)}
              className="inline-flex items-center gap-1 rounded-[var(--radius-default)] bg-[var(--status-primary)] px-3 py-2 text-sm text-[var(--text-inverse)]"
            >
              <PanelRightOpen size={14} aria-hidden="true" />
              Panel
            </button>
            <button
              type="button"
              data-testid="open-dialog"
              onClick={() => setConfirmOpen(true)}
              className="inline-flex items-center gap-1 rounded-[var(--radius-default)] bg-[var(--status-warning)] px-3 py-2 text-sm text-[var(--text-inverse)]"
            >
              <Layers size={14} aria-hidden="true" />
              Dialog
            </button>
          </div>
        </div>
      </section>

      <section className={previewStyles.section}>
        <div className="grid gap-3 lg:grid-cols-2">
          <SearchBar
            value={query}
            onChange={setQuery}
            onDebouncedChange={setDebouncedQuery}
            placeholder="機能名で検索"
            shortcutHint="Cmd+K"
          />
          <div className="flex items-center justify-between rounded-[var(--radius-md)] bg-[var(--bg-tertiary)] px-3 py-2">
            <span className="text-sm text-[var(--text-secondary)]">
              Debounced:
            </span>
            <Badge variant="primary" content={debouncedQuery || "(empty)"} />
          </div>
        </div>
        <div className="mt-3">
          <TabSwitcher
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </section>

      <section className={previewStyles.section}>
        <CodeViewer
          code={codeSample}
          language="typescript"
          showLineNumbers={true}
          filePath="src/renderer/components/molecules/SearchBar/index.tsx"
        />
      </section>

      <section className={previewStyles.section}>
        <CardGrid
          items={demoItems}
          renderCard={(item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedItemId(item.id)}
              className="w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] p-3 text-left"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-[var(--text-primary)]">
                  {item.title}
                </h3>
                <StatusIndicator status={item.status} />
              </div>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {item.description}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <Badge
                  size="sm"
                  variant={item.category === "core" ? "success" : "info"}
                  content={item.category}
                />
                <RelativeTime timestamp={item.updatedAt} format="short" />
              </div>
            </button>
          )}
        />
      </section>

      <section className={previewStyles.section}>
        <MasterDetailLayout
          master={
            <ul className="space-y-2 p-2">
              {demoItems.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedItemId(item.id)}
                    className="w-full rounded-[var(--radius-md)] bg-[var(--bg-tertiary)] p-2 text-left text-sm"
                  >
                    {item.title}
                  </button>
                </li>
              ))}
            </ul>
          }
          detail={
            selectedItem ? (
              <div className="space-y-2 p-3">
                <h3 className="text-lg font-semibold">{selectedItem.title}</h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  {selectedItem.description}
                </p>
                <Badge content={selectedItem.category} variant="primary" />
              </div>
            ) : (
              <EmptyState
                title="選択中のアイテムがありません"
                description="左のリストから項目を選択してください"
                icon="folder-open"
                compact={true}
              />
            )
          }
          isDetailOpen={Boolean(selectedItem)}
          onCloseDetail={() => setSelectedItemId(null)}
        />
      </section>

      <section className={previewStyles.section}>
        <SearchFilterList
          items={demoItems}
          filters={[
            {
              id: "core",
              label: "Core",
              predicate: (item) => item.category === "core",
            },
            {
              id: "extension",
              label: "Extension",
              predicate: (item) => item.category === "extension",
            },
          ]}
          searchPredicate={(item, q) =>
            item.title.toLowerCase().includes(q.toLowerCase()) ||
            item.description.toLowerCase().includes(q.toLowerCase())
          }
          renderItem={(item) => (
            <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] p-3">
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-[var(--text-secondary)]">
                {item.description}
              </p>
            </div>
          )}
          searchPlaceholder="一覧を検索"
        />
      </section>

      <section className={previewStyles.section}>
        <div className="flex items-center gap-2 text-[var(--status-success)]">
          <CheckCircle size={18} aria-hidden="true" />
          <p className="text-sm">Phase 11 visual inspection target is ready.</p>
        </div>
        <div className="mt-3 max-w-xs">
          <SkeletonCard variant="stat" />
        </div>
      </section>

      <SlideInPanel
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        side="right"
        title="Inspector Panel"
      >
        <p className="text-sm text-[var(--text-secondary)]">
          Panel interaction verification content.
        </p>
      </SlideInPanel>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => setConfirmOpen(false)}
        title="Delete Foundation Spec"
        description="この操作はサンプルです。実データは変更されません。"
        isDestructive={true}
      />
    </div>
  );
};

export const UIDesignFoundationPreview = memo(
  UIDesignFoundationPreviewComponent,
);
UIDesignFoundationPreview.displayName = "UIDesignFoundationPreview";

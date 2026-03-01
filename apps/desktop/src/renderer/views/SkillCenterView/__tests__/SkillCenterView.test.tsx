import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { SkillMetadata, SkillName } from "@repo/shared/types/skill";

// --- テストデータファクトリ ---

const createMockSkillMetadata = (
  overrides: Partial<SkillMetadata> = {},
): SkillMetadata => ({
  name: "test-skill" as SkillName,
  description: "テスト用スキル",
  path: ".claude/skills/test-skill/SKILL.md",
  allowedTools: ["Read", "Write"],
  updatedAt: new Date("2026-01-01"),
  agents: [],
  references: [],
  scripts: [],
  assets: [],
  schemas: [],
  indexes: [],
  otherFiles: [],
  ...overrides,
});

// --- 子コンポーネントモック ---

vi.mock("../components/CategoryTabs", () => ({
  CategoryTabs: vi.fn(() => <div data-testid="category-tabs" />),
  CATEGORIES: [
    { id: "all", label: "すべて" },
    { id: "development", label: "開発" },
    { id: "testing", label: "テスト" },
    { id: "documentation", label: "ドキュメント" },
    { id: "security", label: "セキュリティ" },
    { id: "other", label: "その他" },
  ],
}));

vi.mock("../components/FeaturedSection/FeaturedSection", () => ({
  FeaturedSection: vi.fn(() => <div data-testid="featured-section" />),
}));

vi.mock("../components/SkillCard", () => ({
  SkillCard: vi.fn(({ skill }: { skill: SkillMetadata }) => (
    <div data-testid={`skill-card-${skill.name}`}>{skill.name}</div>
  )),
}));

vi.mock("../components/SkillEmptyState", () => ({
  SkillEmptyState: vi.fn(({ variant }: { variant: string }) => (
    <div data-testid={`empty-state-${variant}`}>
      {variant === "no-skills"
        ? "ツールがまだありません"
        : "見つかりませんでした"}
    </div>
  )),
}));

vi.mock("../components/AddButton", () => ({
  AddButton: vi.fn(() => <button>追加する</button>),
  addButtonStyles: {
    idle: "bg-blue-500",
    processing: "bg-blue-500",
    success: "bg-green-100",
  },
}));

// --- Store モック ---

const mockFetchSkills = vi.fn();
const mockImportSkill = vi.fn();
const mockRemoveSkill = vi.fn();
const mockSetSkillFilter = vi.fn();
const mockSetSkillCategory = vi.fn();
const mockSelectSkillByName = vi.fn();

vi.mock("../../../store", () => ({
  useAppStore: vi.fn(),
  useAvailableSkillsMetadata: vi.fn(() => []),
  useImportedSkills: vi.fn(() => []),
  useIsLoadingSkills: vi.fn(() => false),
  useSkillError: vi.fn(() => null),
  useSkillFilter: vi.fn(() => ""),
  useSkillCategory: vi.fn(() => null),
  useFetchSkills: vi.fn(() => mockFetchSkills),
  useImportSkill: vi.fn(() => mockImportSkill),
  useRemoveSkill: vi.fn(() => mockRemoveSkill),
  useSetSkillFilter: vi.fn(() => mockSetSkillFilter),
  useSetSkillCategory: vi.fn(() => mockSetSkillCategory),
  useSelectSkillByName: vi.fn(() => mockSelectSkillByName),
  useIsImportDialogOpen: vi.fn(() => false),
  useToastMessage: vi.fn(() => null),
  useSelectSkill: vi.fn(() => vi.fn()),
  useOpenImportDialog: vi.fn(() => vi.fn()),
  useCloseImportDialog: vi.fn(() => vi.fn()),
  useShowToast: vi.fn(() => vi.fn()),
  useClearToast: vi.fn(() => vi.fn()),
  useImportedSkillIds: vi.fn(() => []),
  useSelectedSkill: vi.fn(() => null),
  useSkills: vi.fn(() => []),
}));

// テスト対象のビュー（実装はPhase 5で作成される）
import { SkillCenterView } from "../index";

describe("SkillCenterView", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const store = await import("../../../store");
    vi.mocked(store.useAvailableSkillsMetadata).mockReturnValue([]);
    vi.mocked(store.useImportedSkills).mockReturnValue([]);
    vi.mocked(store.useIsLoadingSkills).mockReturnValue(false);
    vi.mocked(store.useSkillError).mockReturnValue(null);
    vi.mocked(store.useSkillFilter).mockReturnValue("");
    vi.mocked(store.useSkillCategory).mockReturnValue(null);
    vi.mocked(store.useFetchSkills).mockReturnValue(mockFetchSkills);
    vi.mocked(store.useImportSkill).mockReturnValue(mockImportSkill);
    vi.mocked(store.useRemoveSkill).mockReturnValue(mockRemoveSkill);
    vi.mocked(store.useSetSkillFilter).mockReturnValue(mockSetSkillFilter);
    vi.mocked(store.useSetSkillCategory).mockReturnValue(mockSetSkillCategory);
    vi.mocked(store.useSelectSkillByName).mockReturnValue(
      mockSelectSkillByName,
    );
  });

  it("data-testid='skill-center-view'が表示される", () => {
    render(<SkillCenterView />);
    expect(screen.getByTestId("skill-center-view")).toBeInTheDocument();
  });

  it("「ツールを探す」ヘッダーが表示される", () => {
    render(<SkillCenterView />);
    expect(screen.getByText("ツールを探す")).toBeInTheDocument();
  });

  it("ローディング中にスケルトンが表示される", async () => {
    const store = await import("../../../store");
    vi.mocked(store.useIsLoadingSkills).mockReturnValue(true);

    render(<SkillCenterView />);

    // ローディングスケルトンまたはローディング表示を検証
    const loadingIndicator =
      screen.queryByTestId("skeleton-loading") ??
      screen.queryByText(/読み込み中/) ??
      screen.queryByRole("status");
    expect(loadingIndicator).not.toBeNull();
  });

  it("エラー時にエラーメッセージが表示される", async () => {
    const store = await import("../../../store");
    vi.mocked(store.useSkillError).mockReturnValue(
      "スキルの読み込みに失敗しました",
    );

    render(<SkillCenterView />);
    expect(
      screen.getByText("スキルの読み込みに失敗しました"),
    ).toBeInTheDocument();
  });

  it("ツールがある場合にカード一覧が表示される", async () => {
    const skills = [
      createMockSkillMetadata({
        name: "skill-alpha" as SkillName,
        description: "スキルAlpha",
      }),
      createMockSkillMetadata({
        name: "skill-beta" as SkillName,
        description: "スキルBeta",
      }),
    ];

    const store = await import("../../../store");
    vi.mocked(store.useAvailableSkillsMetadata).mockReturnValue(skills);

    render(<SkillCenterView />);

    expect(screen.getByTestId("skill-card-skill-alpha")).toBeInTheDocument();
    expect(screen.getByTestId("skill-card-skill-beta")).toBeInTheDocument();
  });

  it("ツールがない場合にEmptyStateが表示される", () => {
    render(<SkillCenterView />);

    // AvailableSkillsMetadataが空配列 + ローディングなし + エラーなし
    // → EmptyState（no-skills）が表示される
    const emptyState = screen.getByTestId("empty-state-no-skills");
    expect(emptyState).toBeInTheDocument();
  });

  it("件数が「XX件のツール」形式で表示される", async () => {
    const skills = [
      createMockSkillMetadata({
        name: "count-skill-1" as SkillName,
      }),
      createMockSkillMetadata({
        name: "count-skill-2" as SkillName,
      }),
      createMockSkillMetadata({
        name: "count-skill-3" as SkillName,
      }),
    ];

    const store = await import("../../../store");
    vi.mocked(store.useAvailableSkillsMetadata).mockReturnValue(skills);

    render(<SkillCenterView />);

    // 「3件のツール」のようなテキストが表示される
    expect(screen.getByText(/3件.*ツール/)).toBeInTheDocument();
  });

  it("カテゴリ選択 + 検索の同時操作でフィルタリングされる", async () => {
    const skills = [
      createMockSkillMetadata({
        name: "dev-hello" as SkillName,
        description: "開発用の挨拶スキル",
      }),
      createMockSkillMetadata({
        name: "dev-world" as SkillName,
        description: "開発用の世界スキル",
      }),
      createMockSkillMetadata({
        name: "test-hello" as SkillName,
        description: "テスト用の挨拶スキル",
      }),
    ];

    const store = await import("../../../store");
    vi.mocked(store.useAvailableSkillsMetadata).mockReturnValue(skills);
    vi.mocked(store.useSkillCategory).mockReturnValue("development");
    vi.mocked(store.useSkillFilter).mockReturnValue("hello");

    render(<SkillCenterView />);

    // カテゴリ "development" + キーワード "hello" の両方でフィルタリング
    // "dev-hello" のみが表示される（developmentカテゴリでhelloを含む）
    expect(screen.getByTestId("skill-card-dev-hello")).toBeInTheDocument();
    expect(screen.queryByTestId("skill-card-dev-world")).toBeNull();
    expect(screen.queryByTestId("skill-card-test-hello")).toBeNull();
  });

  it("大量スキル（50件以上）でのレンダリング", async () => {
    const skills = Array.from({ length: 55 }, (_, i) =>
      createMockSkillMetadata({
        name: `skill-${String(i).padStart(3, "0")}` as SkillName,
        description: `スキル${i}の説明`,
      }),
    );

    const store = await import("../../../store");
    vi.mocked(store.useAvailableSkillsMetadata).mockReturnValue(skills);

    render(<SkillCenterView />);

    // 全55件のカードが表示される
    expect(screen.getByText(/55件.*ツール/)).toBeInTheDocument();
    // 最初と最後のカードが存在する
    expect(screen.getByTestId("skill-card-skill-000")).toBeInTheDocument();
    expect(screen.getByTestId("skill-card-skill-054")).toBeInTheDocument();
  });

  it("検索バーが表示されている", () => {
    render(<SkillCenterView />);
    expect(screen.getByTestId("skill-search-input")).toBeInTheDocument();
  });

  it("検索バーにaria-label='ツールを検索'が設定される", () => {
    render(<SkillCenterView />);
    const input = screen.getByTestId("skill-search-input");
    expect(input).toHaveAttribute("aria-label", "ツールを検索");
  });
});

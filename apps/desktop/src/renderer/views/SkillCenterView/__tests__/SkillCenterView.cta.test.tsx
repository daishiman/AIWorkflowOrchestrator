/**
 * SkillCenterView CTA (Call-to-Action) テスト
 *
 * ヘッダーCTAボタンとJourneyPanel CTAボタンのレンダリング・インタラクションを検証する。
 *
 * P39対策: happy-dom環境のため fireEvent を使用（userEvent 禁止）
 * P40対策: cd apps/desktop && pnpm vitest run で実行
 * P31対策: useSkillCenter をモックして個別セレクタの問題を回避
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import type { SkillMetadata } from "@repo/shared/types/skill";
import type { UseSkillCenterReturn } from "../hooks/useSkillCenter";

// --- モック関数 ---
const mockNavigateToSkillCreate = vi.fn();
const mockNavigateToSkillManagement = vi.fn();
const mockNavigateToWorkspace = vi.fn();
const mockNavigateToSkillAnalysis = vi.fn();
const mockUseSkillCenter = vi.fn<() => UseSkillCenterReturn>();

vi.mock("../hooks/useSkillCenter", () => ({
  useSkillCenter: () => mockUseSkillCenter(),
}));

vi.mock("../components/CategoryTabs", () => ({
  CategoryTabs: vi.fn(() => <div data-testid="category-tabs" />),
}));

vi.mock("../components/FeaturedSection/FeaturedSection", () => ({
  FeaturedSection: vi.fn(() => <div data-testid="featured-section" />),
}));

vi.mock("../components/SkillCard", () => ({
  SkillCard: vi.fn(({ skill }: { skill: SkillMetadata }) => (
    <div data-testid={`skill-card-${String(skill.name)}`}>
      {String(skill.name)}
    </div>
  )),
}));

vi.mock("../components/SkillEmptyState", () => ({
  SkillEmptyState: vi.fn(({ variant }: { variant: string }) => (
    <div data-testid={`empty-state-${variant}`} />
  )),
}));

vi.mock("../components/SkillDetailPanel/SkillDetailPanel", () => ({
  SkillDetailPanel: vi.fn(() => <div data-testid="skill-detail-panel" />),
}));

import { SkillCenterView } from "../index";

/** ベースのhook戻り値ファクトリ */
const createBaseHookValue = (
  overrides: Partial<UseSkillCenterReturn> = {},
): UseSkillCenterReturn => ({
  availableSkills: [],
  importedSkills: [],
  isLoading: false,
  error: null,
  filter: "",
  category: null,
  isDetailOpen: false,
  detailSkillName: null,
  isDeleteConfirmOpen: false,
  deleteTargetSkillName: null,
  addingSkills: new Map(),
  filteredSkills: [],
  featuredSkills: [],
  importedSkillNames: [],
  navigateToSkillCreate: mockNavigateToSkillCreate,
  navigateToSkillManagement: mockNavigateToSkillManagement,
  navigateToWorkspace: mockNavigateToWorkspace,
  navigateToSkillAnalysis: mockNavigateToSkillAnalysis,
  handleAddSkill: vi.fn(async () => {}),
  handleRemoveSkill: vi.fn(async () => {}),
  handleOpenDetail: vi.fn(),
  handleCloseDetail: vi.fn(),
  handleConfirmDelete: vi.fn(async () => {}),
  handleCancelDelete: vi.fn(),
  handleRequestDelete: vi.fn(),
  handleSetFilter: vi.fn(),
  handleSetCategory: vi.fn(),
  ...overrides,
});

describe("SkillCenterView ヘッダー CTA", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigateToSkillManagement.mockReset();
    mockUseSkillCenter.mockReturnValue(createBaseHookValue());
  });

  it("TC-CTA-01: ヘッダーCTAボタンが表示される", () => {
    render(<SkillCenterView />);

    const ctaButton = screen.getByTestId("header-create-cta");
    expect(ctaButton).toBeInTheDocument();
  });

  it("TC-CTA-02: ヘッダーCTAボタンに「新規作成」テキストが表示される", () => {
    render(<SkillCenterView />);

    const ctaButton = screen.getByTestId("header-create-cta");
    expect(ctaButton).toHaveTextContent("新規作成");
  });

  it("TC-CTA-03: ヘッダーCTAクリックで navigateToSkillCreate が呼ばれる", () => {
    render(<SkillCenterView />);

    const ctaButton = screen.getByTestId("header-create-cta");
    fireEvent.click(ctaButton);

    expect(mockNavigateToSkillCreate).toHaveBeenCalledTimes(1);
  });

  it("TC-CTA-04: ヘッダーCTAがbutton要素である", () => {
    render(<SkillCenterView />);

    const ctaButton = screen.getByTestId("header-create-cta");
    expect(ctaButton.tagName).toBe("BUTTON");
  });

  it("TC-CTA-05: ヘッダーCTAに type='button' が設定されている", () => {
    render(<SkillCenterView />);

    const ctaButton = screen.getByTestId("header-create-cta");
    expect(ctaButton).toHaveAttribute("type", "button");
  });

  it("TC-CTA-06: ローディング中はヘッダーCTAが表示されない", () => {
    mockUseSkillCenter.mockReturnValue(
      createBaseHookValue({ isLoading: true }),
    );

    render(<SkillCenterView />);

    expect(screen.queryByTestId("header-create-cta")).toBeNull();
  });

  it("TC-CTA-07: エラー状態ではヘッダーCTAが表示されない", () => {
    mockUseSkillCenter.mockReturnValue(
      createBaseHookValue({ error: "エラーが発生しました" }),
    );

    render(<SkillCenterView />);

    expect(screen.queryByTestId("header-create-cta")).toBeNull();
  });

  it("TC-CTA-08: ヘッダーCTAがタイトルと同じ行に配置される", () => {
    render(<SkillCenterView />);

    const ctaButton = screen.getByTestId("header-create-cta");
    const title = screen.getByText("ツールを探す");
    // data-testid="header-row" 内に title と CTA ボタンが共存することを確認
    const headerRow = screen.getByTestId("header-row");
    expect(headerRow).toContainElement(title);
    expect(headerRow).toContainElement(ctaButton);
  });
});

describe("SkillCenterView JourneyPanel CTA", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSkillCenter.mockReturnValue(createBaseHookValue());
  });

  it("TC-CTA-09: create ジョブのCTAボタンが表示される", () => {
    render(<SkillCenterView />);

    const ctaButton = screen.getByTestId("skill-lifecycle-cta-create");
    expect(ctaButton).toBeInTheDocument();
    expect(ctaButton).toHaveTextContent("作成を始める");
  });

  it("TC-CTA-10: use ジョブのCTAボタンが表示される", () => {
    render(<SkillCenterView />);

    const ctaButton = screen.getByTestId("skill-lifecycle-cta-use");
    expect(ctaButton).toBeInTheDocument();
    expect(ctaButton).toHaveTextContent("使ってみる");
  });

  it("TC-CTA-11: improve ジョブのCTAボタンが表示される", () => {
    render(<SkillCenterView />);

    const ctaButton = screen.getByTestId("skill-lifecycle-cta-improve");
    expect(ctaButton).toBeInTheDocument();
    expect(ctaButton).toHaveTextContent("改善する");
  });

  it("TC-CTA-12: create CTAクリックで navigateToSkillCreate が呼ばれる", () => {
    render(<SkillCenterView />);

    fireEvent.click(screen.getByTestId("skill-lifecycle-cta-create"));

    expect(mockNavigateToSkillCreate).toHaveBeenCalledTimes(1);
  });

  it("TC-CTA-13: use CTAクリックで navigateToWorkspace が呼ばれる", () => {
    render(<SkillCenterView />);

    fireEvent.click(screen.getByTestId("skill-lifecycle-cta-use"));

    expect(mockNavigateToWorkspace).toHaveBeenCalledTimes(1);
  });

  it("TC-CTA-14: improve CTAクリックで navigateToSkillAnalysis が呼ばれる", () => {
    render(<SkillCenterView />);

    fireEvent.click(screen.getByTestId("skill-lifecycle-cta-improve"));

    expect(mockNavigateToSkillAnalysis).toHaveBeenCalledTimes(1);
  });

  it("TC-CTA-15: 全CTAボタンに type='button' が設定されている", () => {
    render(<SkillCenterView />);

    const createCta = screen.getByTestId("skill-lifecycle-cta-create");
    const useCta = screen.getByTestId("skill-lifecycle-cta-use");
    const improveCta = screen.getByTestId("skill-lifecycle-cta-improve");

    expect(createCta).toHaveAttribute("type", "button");
    expect(useCta).toHaveAttribute("type", "button");
    expect(improveCta).toHaveAttribute("type", "button");
  });

  it("TC-CTA-16: CTAボタンは各ジョブカード内にある", () => {
    render(<SkillCenterView />);

    const createCard = screen.getByTestId("skill-lifecycle-job-create");
    const useCard = screen.getByTestId("skill-lifecycle-job-use");
    const improveCard = screen.getByTestId("skill-lifecycle-job-improve");

    expect(
      within(createCard).getByTestId("skill-lifecycle-cta-create"),
    ).toBeInTheDocument();
    expect(
      within(useCard).getByTestId("skill-lifecycle-cta-use"),
    ).toBeInTheDocument();
    expect(
      within(improveCard).getByTestId("skill-lifecycle-cta-improve"),
    ).toBeInTheDocument();
  });

  it("TC-CTA-17: ローディング中はJourneyPanel CTAが表示されない", () => {
    mockUseSkillCenter.mockReturnValue(
      createBaseHookValue({ isLoading: true }),
    );

    render(<SkillCenterView />);

    expect(screen.queryByTestId("skill-lifecycle-cta-create")).toBeNull();
    expect(screen.queryByTestId("skill-lifecycle-cta-use")).toBeNull();
    expect(screen.queryByTestId("skill-lifecycle-cta-improve")).toBeNull();
  });

  it("TC-CTA-18: エラー状態ではJourneyPanel CTAが表示されない", () => {
    mockUseSkillCenter.mockReturnValue(
      createBaseHookValue({ error: "エラーが発生しました" }),
    );

    render(<SkillCenterView />);

    expect(screen.queryByTestId("skill-lifecycle-cta-create")).toBeNull();
    expect(screen.queryByTestId("skill-lifecycle-cta-use")).toBeNull();
    expect(screen.queryByTestId("skill-lifecycle-cta-improve")).toBeNull();
  });
});

describe("SkillCenterView CTA ctaLabel 条件分岐", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSkillCenter.mockReturnValue(createBaseHookValue());
  });

  it("TC-CTA-19: JourneyPanel の各CTAテキストが SKILL_LIFECYCLE_JOB_GUIDES の ctaLabel と一致する", async () => {
    render(<SkillCenterView />);

    // skillLifecycleJourney.ts で定義された ctaLabel と一致することを確認
    expect(screen.getByTestId("skill-lifecycle-cta-create")).toHaveTextContent(
      "作成を始める",
    );
    expect(screen.getByTestId("skill-lifecycle-cta-use")).toHaveTextContent(
      "使ってみる",
    );
    expect(screen.getByTestId("skill-lifecycle-cta-improve")).toHaveTextContent(
      "改善する",
    );
  });

  it("TC-CTA-20: ヘッダーCTAとcreate CTAは同じナビゲーション先を呼ぶ", () => {
    render(<SkillCenterView />);

    fireEvent.click(screen.getByTestId("header-create-cta"));
    fireEvent.click(screen.getByTestId("skill-lifecycle-cta-create"));

    expect(mockNavigateToSkillCreate).toHaveBeenCalledTimes(2);
  });

  it("TC-CTA-21: 複数CTAを連続クリックしても各ナビゲーション関数が個別に呼ばれる", () => {
    render(<SkillCenterView />);

    fireEvent.click(screen.getByTestId("skill-lifecycle-cta-create"));
    fireEvent.click(screen.getByTestId("skill-lifecycle-cta-use"));
    fireEvent.click(screen.getByTestId("skill-lifecycle-cta-improve"));

    expect(mockNavigateToSkillCreate).toHaveBeenCalledTimes(1);
    expect(mockNavigateToWorkspace).toHaveBeenCalledTimes(1);
    expect(mockNavigateToSkillAnalysis).toHaveBeenCalledTimes(1);
  });
});

describe("SkillCenterView Escape キーハンドラ", () => {
  const mockHandleCancelDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("TC-CTA-ESC-01: 削除確認ダイアログが開いている状態で Escape キーを押すと handleCancelDelete が呼ばれる", () => {
    mockUseSkillCenter.mockReturnValue(
      createBaseHookValue({
        isDeleteConfirmOpen: true,
        deleteTargetSkillName: "test-skill",
        handleCancelDelete: mockHandleCancelDelete,
      }),
    );

    render(<SkillCenterView />);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(mockHandleCancelDelete).toHaveBeenCalledTimes(1);
  });

  it("TC-CTA-ESC-02: 削除確認ダイアログが閉じている状態では Escape キーで handleCancelDelete が呼ばれない", () => {
    mockUseSkillCenter.mockReturnValue(
      createBaseHookValue({
        isDeleteConfirmOpen: false,
        handleCancelDelete: mockHandleCancelDelete,
      }),
    );

    render(<SkillCenterView />);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(mockHandleCancelDelete).not.toHaveBeenCalled();
  });
});

describe("SkillCenterView CTA と skillLifecycleJourney の統合", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSkillCenter.mockReturnValue(createBaseHookValue());
  });

  it("TC-CTA-22: JourneyPanel セクションが skill-lifecycle-journey の data-testid を持つ", () => {
    render(<SkillCenterView />);

    expect(screen.getByTestId("skill-lifecycle-journey")).toBeInTheDocument();
  });

  it("TC-CTA-23: 各ジョブカードに Step ラベルが表示される", () => {
    render(<SkillCenterView />);

    expect(screen.getByText("Step 1")).toBeInTheDocument();
    expect(screen.getByText("Step 2")).toBeInTheDocument();
    expect(screen.getByText("Step 3")).toBeInTheDocument();
  });

  it("TC-CTA-25: ヘッダーCTAが data-route-kind='primary' を持つ (TASK-SDK-05)", () => {
    render(<SkillCenterView />);

    const ctaButton = screen.getByTestId("header-create-cta");
    expect(ctaButton).toHaveAttribute("data-route-kind", "primary");
  });

  it("TC-CTA-26: journey create CTA が data-route-kind='primary' を持つ (TASK-SDK-05)", () => {
    render(<SkillCenterView />);

    const createCta = screen.getByTestId("skill-lifecycle-cta-create");
    expect(createCta).toHaveAttribute("data-route-kind", "primary");
  });

  it("TC-CTA-24: CTAボタンは削除確認ダイアログが開いていても正常に動作する", () => {
    mockUseSkillCenter.mockReturnValue(
      createBaseHookValue({
        isDeleteConfirmOpen: true,
        deleteTargetSkillName: "test-skill",
      }),
    );

    render(<SkillCenterView />);

    // CTAボタンは表示されている
    const createCta = screen.getByTestId("skill-lifecycle-cta-create");
    fireEvent.click(createCta);

    expect(mockNavigateToSkillCreate).toHaveBeenCalledTimes(1);
  });
});

describe("SkillCenterView ヘッダー 管理 CTA（TC-04/05 対応）", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSkillCenter.mockReturnValue(createBaseHookValue());
  });

  it("TC-04: 「スキル管理」ボタンが表示される", () => {
    render(<SkillCenterView />);

    const mgmtButton = screen.getByTestId("header-management-cta");
    expect(mgmtButton).toBeInTheDocument();
  });

  it("TC-05: 「スキル管理」ボタンクリックで navigateToSkillManagement が呼ばれる", () => {
    render(<SkillCenterView />);

    const mgmtButton = screen.getByTestId("header-management-cta");
    fireEvent.click(mgmtButton);

    expect(mockNavigateToSkillManagement).toHaveBeenCalledTimes(1);
  });

  it("TC-04b: 「スキル管理」ボタンが button 要素である", () => {
    render(<SkillCenterView />);

    const mgmtButton = screen.getByTestId("header-management-cta");
    expect(mgmtButton.tagName).toBe("BUTTON");
    expect(mgmtButton).toHaveAttribute("type", "button");
  });

  it("TC-04c: 「スキル管理」ボタンが data-route-kind='secondary' を持つ", () => {
    render(<SkillCenterView />);

    const mgmtButton = screen.getByTestId("header-management-cta");
    expect(mgmtButton).toHaveAttribute("data-route-kind", "secondary");
  });

  it("TC-04d: 「+新規作成」CTAクリックで skillCreate が維持される（回帰）", () => {
    render(<SkillCenterView />);

    fireEvent.click(screen.getByTestId("header-create-cta"));

    expect(mockNavigateToSkillCreate).toHaveBeenCalledTimes(1);
    expect(mockNavigateToSkillManagement).not.toHaveBeenCalled();
  });

  it("TC-04e: ローディング中は管理CTAが表示されない", () => {
    mockUseSkillCenter.mockReturnValue(
      createBaseHookValue({ isLoading: true }),
    );

    render(<SkillCenterView />);

    expect(screen.queryByTestId("header-management-cta")).toBeNull();
  });

  it("TC-04f: 管理CTAと作成CTAが同じ header-row 内にある", () => {
    render(<SkillCenterView />);

    const mgmtButton = screen.getByTestId("header-management-cta");
    const createButton = screen.getByTestId("header-create-cta");
    const headerRow = screen.getByTestId("header-row");

    expect(headerRow).toContainElement(mgmtButton);
    expect(headerRow).toContainElement(createButton);
  });
});

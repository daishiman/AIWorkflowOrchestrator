import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { SkillMetadata, SkillName } from "@repo/shared/types/skill";
import { SkillCenterView } from "../index";

const mockActivateChatMode = vi.fn();
const mockSetCurrentView = vi.fn();

vi.mock("../../../store", () => ({
  useActivateChatMode: () => mockActivateChatMode,
  useSetCurrentView: () => mockSetCurrentView,
}));

const createMockSkill = (
  overrides: Partial<SkillMetadata> = {},
): SkillMetadata => ({
  name: "test-skill" as SkillName,
  description: "テスト用スキル",
  path: ".claude/skills/test-skill/SKILL.md",
  allowedTools: ["Read"],
  updatedAt: new Date("2026-03-11T00:00:00.000Z"),
  agents: [],
  references: [],
  scripts: [],
  assets: [],
  schemas: [],
  indexes: [],
  otherFiles: [],
  ...overrides,
});

const createUseSkillCenterResult = () => ({
  availableSkills: [
    createMockSkill({ name: "alpha-skill" as SkillName }),
    createMockSkill({ name: "beta-skill" as SkillName }),
  ],
  importedSkills: [],
  isLoading: false,
  error: null,
  filter: "",
  category: null,
  isDetailOpen: false,
  detailSkillName: null,
  isDeleteConfirmOpen: false,
  deleteTargetSkillName: null,
  addingSkills: new Map<string, boolean>(),
  filteredSkills: [
    createMockSkill({ name: "alpha-skill" as SkillName }),
    createMockSkill({ name: "beta-skill" as SkillName }),
  ],
  featuredSkills: [createMockSkill({ name: "alpha-skill" as SkillName })],
  handleAddSkill: vi.fn().mockResolvedValue(undefined),
  handleRemoveSkill: vi.fn().mockResolvedValue(undefined),
  handleOpenDetail: vi.fn(),
  handleCloseDetail: vi.fn(),
  handleConfirmDelete: vi.fn().mockResolvedValue(undefined),
  handleCancelDelete: vi.fn(),
  handleRequestDelete: vi.fn(),
  handleSetFilter: vi.fn(),
  handleSetCategory: vi.fn(),
});

const mockUseSkillCenter = vi.fn(createUseSkillCenterResult);

vi.mock("../hooks/useSkillCenter", () => ({
  useSkillCenter: () => mockUseSkillCenter(),
}));

vi.mock("../components/FeaturedSection/FeaturedSection", () => ({
  FeaturedSection: () => <div data-testid="featured-section" />,
}));

vi.mock("../components/CategoryTabs", () => ({
  CategoryTabs: () => <div data-testid="category-tabs" />,
}));

vi.mock("../components/SkillCard", () => ({
  SkillCard: ({ skill }: { skill: SkillMetadata }) => (
    <div data-testid={`skill-card-${skill.name}`}>{skill.name}</div>
  ),
}));

vi.mock("../components/SkillEmptyState", () => ({
  SkillEmptyState: ({ variant }: { variant: string }) => (
    <div data-testid={`empty-state-${variant}`}>{variant}</div>
  ),
}));

vi.mock("../components/SkillDetailPanel/SkillDetailPanel", () => ({
  SkillDetailPanel: () => <div data-testid="skill-detail-panel" />,
}));

describe("SkillCenterView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSkillCenter.mockReturnValue(createUseSkillCenterResult());
  });

  it("一次導線ガイドと責務ボードを表示する", () => {
    render(<SkillCenterView />);

    expect(screen.getByTestId("skill-center-view")).toBeInTheDocument();
    expect(screen.getByTestId("skill-lifecycle-journey")).toBeInTheDocument();
    expect(
      screen.getByTestId("skill-lifecycle-surface-ownership"),
    ).toBeInTheDocument();
  });

  it("Skill Lifecycle 会話開始ボタンで chat view に handoff する", () => {
    render(<SkillCenterView />);

    fireEvent.click(screen.getByTestId("skill-lifecycle-start-improve"));

    expect(mockActivateChatMode).toHaveBeenCalledWith("skill-lifecycle", {
      lifecycleJob: "improve",
      entryPoint: "skill-center",
      handoffLabel: "改善の意図を Skill Center から引き継ぎ",
    });
    expect(mockSetCurrentView).toHaveBeenCalledWith("chat");
  });

  it("filteredSkills がある場合は件数とカードを表示する", () => {
    render(<SkillCenterView />);

    expect(screen.getByText("2件のツール")).toBeInTheDocument();
    expect(screen.getByTestId("skill-card-alpha-skill")).toBeInTheDocument();
    expect(screen.getByTestId("skill-card-beta-skill")).toBeInTheDocument();
  });

  it("filteredSkills が空なら empty state を表示する", () => {
    mockUseSkillCenter.mockReturnValue({
      ...createUseSkillCenterResult(),
      filteredSkills: [],
      featuredSkills: [],
    });

    render(<SkillCenterView />);

    expect(screen.getByTestId("empty-state-no-skills")).toBeInTheDocument();
  });

  it("ローディング時は status を表示する", () => {
    mockUseSkillCenter.mockReturnValue({
      ...createUseSkillCenterResult(),
      isLoading: true,
    });

    render(<SkillCenterView />);

    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});

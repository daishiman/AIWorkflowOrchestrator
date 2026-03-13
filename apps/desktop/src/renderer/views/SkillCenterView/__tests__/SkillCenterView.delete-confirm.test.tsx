import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { SkillMetadata, SkillName } from "@repo/shared/types/skill";
import type { UseSkillCenterReturn } from "../hooks/useSkillCenter";

const mockUseSkillCenter = vi.fn<() => UseSkillCenterReturn>();
const mockHandleConfirmDelete = vi.fn();
const mockHandleCancelDelete = vi.fn();
const mockEvaluatePostImprove = vi.fn();

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

vi.mock("../../../store", () => ({
  useLatestGateDecision: vi.fn(() => null),
  useLatestEvaluationSnapshot: vi.fn(() => null),
  useLatestPromptRequest: vi.fn(() => "改善して"),
  useCurrentAnalysis: vi.fn(() => null),
  useIsLifecycleEvaluating: vi.fn(() => false),
  useSkillEvaluationError: vi.fn(() => null),
  useEvaluatePostImprove: vi.fn(() => mockEvaluatePostImprove),
}));

import { SkillCenterView } from "../index";

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
  handleAddSkill: vi.fn(async () => {}),
  handleRemoveSkill: vi.fn(async () => {}),
  handleOpenDetail: vi.fn(),
  handleCloseDetail: vi.fn(),
  handleConfirmDelete: mockHandleConfirmDelete,
  handleCancelDelete: mockHandleCancelDelete,
  handleRequestDelete: vi.fn(),
  handleSetFilter: vi.fn(),
  handleSetCategory: vi.fn(),
  ...overrides,
});

describe("SkillCenterView delete confirm dialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSkillCenter.mockReturnValue(createBaseHookValue());
  });

  it("isDeleteConfirmOpen=true のとき削除確認ダイアログを表示する", () => {
    mockUseSkillCenter.mockReturnValue(
      createBaseHookValue({
        isDeleteConfirmOpen: true,
        deleteTargetSkillName: "aiworkflow-requirements" as SkillName,
      }),
    );

    render(<SkillCenterView />);

    expect(screen.getByTestId("delete-confirm-dialog")).toBeInTheDocument();
    expect(screen.getByText("ツールを削除しますか？")).toBeInTheDocument();
    expect(screen.getByText("aiworkflow-requirements")).toBeInTheDocument();
  });

  it("確認ボタン押下で handleConfirmDelete を呼び出す", () => {
    mockUseSkillCenter.mockReturnValue(
      createBaseHookValue({
        isDeleteConfirmOpen: true,
        deleteTargetSkillName: "aiworkflow-requirements" as SkillName,
      }),
    );

    render(<SkillCenterView />);
    fireEvent.click(screen.getByTestId("confirm-delete-button"));

    expect(mockHandleConfirmDelete).toHaveBeenCalledTimes(1);
  });

  it("キャンセルボタン押下で handleCancelDelete を呼び出す", () => {
    mockUseSkillCenter.mockReturnValue(
      createBaseHookValue({
        isDeleteConfirmOpen: true,
        deleteTargetSkillName: "aiworkflow-requirements" as SkillName,
      }),
    );

    render(<SkillCenterView />);
    fireEvent.click(screen.getByTestId("cancel-delete-button"));

    expect(mockHandleCancelDelete).toHaveBeenCalledTimes(1);
  });
});

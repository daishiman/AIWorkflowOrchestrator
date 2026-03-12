/**
 * @vitest-environment happy-dom
 */

import React from "react";
import { axe, toHaveNoViolations } from "jest-axe";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import type { ImportedSkill, SkillMetadata } from "@repo/shared";

expect.extend(toHaveNoViolations);

function buildImportedSkill(
  name: string,
  description: string,
  overrides: Partial<ImportedSkill> = {},
): ImportedSkill {
  return {
    name: name as ImportedSkill["name"],
    description,
    path: `/skills/${name}`,
    allowedTools: [],
    updatedAt: new Date("2026-03-01T00:00:00Z"),
    importedAt: new Date("2026-03-02T00:00:00Z"),
    status: "active",
    agents: [],
    references: [],
    scripts: [],
    assets: [],
    schemas: [],
    indexes: [],
    otherFiles: [],
    ...overrides,
  };
}

function buildAvailableSkill(
  name: string,
  description: string,
  overrides: Partial<SkillMetadata> = {},
): SkillMetadata {
  return {
    name: name as SkillMetadata["name"],
    description,
    path: `/skills/${name}`,
    allowedTools: [],
    updatedAt: new Date("2026-03-01T00:00:00Z"),
    agents: [],
    references: [],
    scripts: [],
    assets: [],
    schemas: [],
    indexes: [],
    otherFiles: [],
    ...overrides,
  };
}

type MockStoreState = {
  availableSkillsMetadata: SkillMetadata[];
  importedSkills: ImportedSkill[];
  skillError: string | null;
  isLoadingSkills: boolean;
  isImporting: boolean;
  importingSkillName: SkillMetadata["name"] | null;
  fetchSkills: ReturnType<typeof vi.fn>;
  importSkill: ReturnType<typeof vi.fn>;
  removeSkill: ReturnType<typeof vi.fn>;
  clearSkillError: ReturnType<typeof vi.fn>;
};

const mockFetchSkills = vi.fn().mockResolvedValue(undefined);
const mockImportSkill = vi.fn().mockResolvedValue(undefined);
const mockRemoveSkill = vi.fn().mockResolvedValue(undefined);
const mockClearSkillError = vi.fn();

const defaultImportedSkills = [
  buildImportedSkill("skill-alpha", "Alpha skill for testing"),
  buildImportedSkill("skill-beta", "Beta skill for search testing"),
];

const defaultAvailableSkills = [
  buildAvailableSkill("skill-gamma", "Gamma skill for importing"),
  buildAvailableSkill("skill-delta", "Delta skill for import list"),
];

const defaultStoreState: MockStoreState = {
  availableSkillsMetadata: defaultAvailableSkills,
  importedSkills: defaultImportedSkills,
  skillError: null,
  isLoadingSkills: false,
  isImporting: false,
  importingSkillName: null,
  fetchSkills: mockFetchSkills,
  importSkill: mockImportSkill,
  removeSkill: mockRemoveSkill,
  clearSkillError: mockClearSkillError,
};

let currentStoreState: MockStoreState = { ...defaultStoreState };

function selectFromStore<T>(selector: (state: MockStoreState) => T): T {
  return selector(currentStoreState);
}

vi.mock("../../../store", () => {
  const useAppStore = Object.assign(
    <T,>(selector: (state: MockStoreState) => T) => selectFromStore(selector),
    {
      getState: () => currentStoreState,
    },
  );

  return {
    useAvailableSkillsMetadata: () => currentStoreState.availableSkillsMetadata,
    useImportedSkills: () => currentStoreState.importedSkills,
    useSkillError: () => currentStoreState.skillError,
    useIsLoadingSkills: () => currentStoreState.isLoadingSkills,
    useIsImportingSkill: () => currentStoreState.isImporting,
    useImportingSkillName: () => currentStoreState.importingSkillName,
    useFetchSkills: () => currentStoreState.fetchSkills,
    useRemoveSkill: () => currentStoreState.removeSkill,
    useClearSkillError: () => currentStoreState.clearSkillError,
    useAppStore,
  };
});

vi.mock("@/renderer/store", () => {
  const useAppStore = Object.assign(
    <T,>(selector: (state: MockStoreState) => T) => selectFromStore(selector),
    {
      getState: () => currentStoreState,
    },
  );

  return {
    useAvailableSkillsMetadata: () => currentStoreState.availableSkillsMetadata,
    useImportedSkills: () => currentStoreState.importedSkills,
    useSkillError: () => currentStoreState.skillError,
    useIsLoadingSkills: () => currentStoreState.isLoadingSkills,
    useIsImportingSkill: () => currentStoreState.isImporting,
    useImportingSkillName: () => currentStoreState.importingSkillName,
    useFetchSkills: () => currentStoreState.fetchSkills,
    useRemoveSkill: () => currentStoreState.removeSkill,
    useClearSkillError: () => currentStoreState.clearSkillError,
    useAppStore,
  };
});

vi.mock("../SkillEditor", () => ({
  SkillEditor: ({
    skill,
    onClose,
  }: {
    skill: ImportedSkill;
    onClose: () => void;
  }) => (
    <div data-testid="skill-editor">
      <span>{String(skill.name)}</span>
      <button onClick={onClose}>閉じる</button>
    </div>
  ),
}));

vi.mock("../SkillAnalysisView", () => ({
  SkillAnalysisView: ({
    skillName,
    onClose,
  }: {
    skillName: string;
    onClose: () => void;
  }) => (
    <div data-testid="skill-analysis-view">
      <span>{skillName}</span>
      <button onClick={onClose}>閉じる</button>
    </div>
  ),
}));

vi.mock("../SkillCreateWizard", () => ({
  SkillCreateWizard: React.forwardRef<HTMLDivElement, { onClose: () => void }>(
    ({ onClose }, ref) => (
      <div ref={ref} data-testid="skill-create-wizard">
        <button onClick={onClose}>閉じる</button>
      </div>
    ),
  ),
}));

vi.mock("../SkillLifecyclePanel", () => ({
  SkillLifecyclePanel: ({
    onClose,
    onOpenWizard,
  }: {
    onClose: () => void;
    onOpenWizard: () => void;
  }) => (
    <div data-testid="skill-lifecycle-panel">
      <button onClick={onClose}>閉じる</button>
      <button onClick={onOpenWizard}>詳細ウィザード</button>
    </div>
  ),
}));
vi.mock("../SkillLifecycleSessionCard", () => ({
  SkillLifecycleSessionCard: () => (
    <div data-testid="mock-skill-lifecycle-session-card" />
  ),
}));
import { SkillManagementPanel } from "../SkillManagementPanel";

beforeEach(() => {
  vi.clearAllMocks();
  currentStoreState = {
    ...defaultStoreState,
    availableSkillsMetadata: [...defaultAvailableSkills],
    importedSkills: [...defaultImportedSkills],
    fetchSkills: mockFetchSkills,
    importSkill: mockImportSkill,
    removeSkill: mockRemoveSkill,
    clearSkillError: mockClearSkillError,
  };
});

afterEach(() => {
  cleanup();
});

describe("SkillManagementPanel list UI", () => {
  it("mixed stateで imported / available の2セクションを表示する", () => {
    render(<SkillManagementPanel />);

    expect(
      screen.getByTestId("mock-skill-lifecycle-session-card"),
    ).toBeDefined();
    expect(screen.getByText("インポート済み")).toBeDefined();
    expect(screen.getByText("利用可能なスキル")).toBeDefined();
    expect(
      screen.getByTestId("skill-management-imported-count"),
    ).toHaveTextContent("2件");
    expect(
      screen.getByTestId("skill-management-available-count"),
    ).toHaveTextContent("2件");
    expect(screen.getByTestId("imported-skill-card-skill-alpha")).toBeDefined();
    expect(screen.getByTestId("available-skill-row-skill-gamma")).toBeDefined();
  });

  it("両セクション0件かつ検索なしなら単一の global empty state を表示する", () => {
    currentStoreState = {
      ...currentStoreState,
      availableSkillsMetadata: [],
      importedSkills: [],
    };

    render(<SkillManagementPanel />);

    expect(screen.getByTestId("skill-management-global-empty")).toBeDefined();
    expect(
      screen.queryByTestId("skill-management-imported-section"),
    ).toBeNull();
    expect(
      screen.queryByTestId("skill-management-available-section"),
    ).toBeNull();
  });

  it("available だけ存在する場合は imported の inline empty state を表示する", () => {
    currentStoreState = {
      ...currentStoreState,
      importedSkills: [],
    };

    render(<SkillManagementPanel />);

    expect(
      screen.getByTestId("skill-management-imported-empty"),
    ).toHaveTextContent("まだ追加済みのスキルはありません。");
    expect(screen.getByTestId("available-skill-row-skill-gamma")).toBeDefined();
  });

  it("1つの検索入力で imported / available の両セクションを同時に絞り込む", () => {
    render(<SkillManagementPanel />);

    fireEvent.change(screen.getByLabelText("スキルを検索"), {
      target: { value: "delta" },
    });

    expect(screen.queryByTestId("imported-skill-card-skill-alpha")).toBeNull();
    expect(screen.getByTestId("available-skill-row-skill-delta")).toBeDefined();
    expect(
      screen.getByTestId("skill-management-imported-empty"),
    ).toHaveTextContent("検索条件に一致する追加済みスキルはありません。");
  });

  it("検索結果が両セクション0件なら global no-result state を表示する", () => {
    render(<SkillManagementPanel />);

    fireEvent.change(screen.getByLabelText("スキルを検索"), {
      target: { value: "nonexistent" },
    });

    expect(screen.getByTestId("skill-management-no-result")).toHaveTextContent(
      "検索条件に一致するスキルはありません。",
    );
  });

  it("追加するボタンで確認ダイアログを開く", async () => {
    render(<SkillManagementPanel />);

    await act(async () => {
      fireEvent.click(screen.getByLabelText("skill-gamma を追加する"));
    });

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeDefined();
    expect(within(dialog).getByText("スキルを追加する")).toBeDefined();
    expect(within(dialog).getByText("skill-gamma")).toBeDefined();
  });

  it("インポート中は対象 row だけ disabled にする", () => {
    currentStoreState = {
      ...currentStoreState,
      isImporting: true,
      importingSkillName: "skill-gamma" as SkillMetadata["name"],
    };

    render(<SkillManagementPanel />);

    expect(screen.getByLabelText("skill-gamma を追加する")).toBeDisabled();
    expect(screen.getByLabelText("skill-delta を追加する")).not.toBeDisabled();
  });

  it("skillError は alert と retry copy で表示する", () => {
    currentStoreState = {
      ...currentStoreState,
      skillError: "スキルのインポートに失敗: network",
    };

    render(<SkillManagementPanel />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "スキルのインポートに失敗: network もう一度試してみてください。",
    );
  });

  it("nullish metadata を含んでも一覧と dialog がクラッシュしない", async () => {
    currentStoreState = {
      ...currentStoreState,
      availableSkillsMetadata: [
        buildAvailableSkill("skill-nullish", "", {
          description: undefined as unknown as string,
          allowedTools: undefined,
          agents: undefined as unknown as SkillMetadata["agents"],
          references: undefined as unknown as SkillMetadata["references"],
          scripts: undefined as unknown as SkillMetadata["scripts"],
          assets: undefined as unknown as SkillMetadata["assets"],
          schemas: undefined as unknown as SkillMetadata["schemas"],
          indexes: undefined as unknown as SkillMetadata["indexes"],
          otherFiles: undefined as unknown as SkillMetadata["otherFiles"],
        }),
      ],
      importedSkills: [],
    };

    render(<SkillManagementPanel />);

    expect(
      screen.getByTestId("available-skill-row-skill-nullish"),
    ).toHaveTextContent("説明はありません");

    await act(async () => {
      fireEvent.click(screen.getByLabelText("skill-nullish を追加する"));
    });

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeDefined();
    expect(within(dialog).getByText("説明はありません")).toBeDefined();
  });

  it("削除ダイアログで削除を確定すると removeSkill が呼ばれる", async () => {
    render(<SkillManagementPanel />);

    await act(async () => {
      fireEvent.click(screen.getByLabelText("skill-alpha を削除"));
    });

    await act(async () => {
      fireEvent.click(screen.getByText("削除する"));
    });

    expect(mockRemoveSkill).toHaveBeenCalledWith("skill-alpha");
  });

  it("読み込み中は loading state を表示する", () => {
    currentStoreState = {
      ...currentStoreState,
      isLoadingSkills: true,
    };

    render(<SkillManagementPanel />);

    expect(screen.getByTestId("skill-management-loading")).toHaveTextContent(
      "読み込み中...",
    );
  });

  it("mount 時に fetchSkills を呼ぶ", () => {
    render(<SkillManagementPanel />);
    expect(mockFetchSkills).toHaveBeenCalledTimes(1);
  });

  it("jest-axe で重大な a11y violation が出ない", async () => {
    const { container } = render(<SkillManagementPanel />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("既に imported 済みの skill は available 側に再表示しない", () => {
    currentStoreState = {
      ...currentStoreState,
      availableSkillsMetadata: [
        ...defaultAvailableSkills,
        buildAvailableSkill("skill-alpha", "duplicate row"),
      ],
    };

    render(<SkillManagementPanel />);

    expect(screen.queryByTestId("available-skill-row-skill-alpha")).toBeNull();
  });

  it("section 内の listitem 数が期待どおりになる", () => {
    render(<SkillManagementPanel />);

    const importedSection = screen.getByTestId(
      "skill-management-imported-section",
    );
    const availableSection = screen.getByTestId(
      "skill-management-available-section",
    );

    expect(within(importedSection).getAllByRole("listitem")).toHaveLength(2);
    expect(within(availableSection).getAllByRole("listitem")).toHaveLength(2);
  });
});

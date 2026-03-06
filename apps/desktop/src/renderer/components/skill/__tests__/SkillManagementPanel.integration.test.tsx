/**
 * @vitest-environment happy-dom
 */

import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import type { ImportedSkill, SkillMetadata } from "@repo/shared";

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
  buildImportedSkill("skill-alpha", "Alpha skill"),
];
const defaultAvailableSkills = [
  buildAvailableSkill("skill-gamma", "Gamma skill"),
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

let capturedAnalysisProps: Record<string, unknown> = {};
let capturedCreateWizardProps: Record<string, unknown> = {};

vi.mock("../SkillEditor", () => ({
  SkillEditor: ({
    skill,
    onClose,
  }: {
    skill: ImportedSkill;
    onClose: () => void;
  }) => (
    <div data-testid="skill-editor">
      <span data-testid="editor-skill-name">{String(skill.name)}</span>
      <button onClick={onClose}>閉じる</button>
    </div>
  ),
}));

vi.mock("../SkillAnalysisView", () => ({
  SkillAnalysisView: (props: Record<string, unknown>) => {
    capturedAnalysisProps = props;
    return (
      <div data-testid="mock-skill-analysis-view">
        <span data-testid="analysis-skill-name">
          {props.skillName as string}
        </span>
        <button
          data-testid="analysis-close"
          onClick={props.onClose as () => void}
        >
          閉じる
        </button>
      </div>
    );
  },
}));

vi.mock("../SkillCreateWizard", () => ({
  SkillCreateWizard: React.forwardRef<HTMLDivElement, Record<string, unknown>>(
    (props, ref) => {
      capturedCreateWizardProps = props;
      return (
        <div ref={ref} data-testid="mock-skill-create-wizard">
          <button
            data-testid="wizard-close"
            onClick={props.onClose as () => void}
          >
            閉じる
          </button>
        </div>
      );
    },
  ),
}));

import { SkillManagementPanel } from "../SkillManagementPanel";

beforeEach(() => {
  vi.clearAllMocks();
  capturedAnalysisProps = {};
  capturedCreateWizardProps = {};
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

describe("SkillManagementPanel integration", () => {
  it("analysis view に遷移し、onClose で list view に戻る", async () => {
    render(<SkillManagementPanel />);

    await act(async () => {
      fireEvent.click(screen.getByLabelText("skill-alpha を分析"));
    });

    expect(screen.getByTestId("mock-skill-analysis-view")).toBeDefined();
    expect(
      screen.getByTestId("skill-management-panel-analysis-view"),
    ).toBeDefined();
    expect(capturedAnalysisProps.skillName).toBe("skill-alpha");

    await act(async () => {
      fireEvent.click(screen.getByTestId("analysis-close"));
    });

    expect(screen.queryByTestId("mock-skill-analysis-view")).toBeNull();
    expect(screen.getByTestId("skill-management-panel")).toBeDefined();
  });

  it("create view に遷移し、onClose で list view に戻る", async () => {
    render(<SkillManagementPanel />);

    await act(async () => {
      fireEvent.click(screen.getByText("新規作成"));
    });

    expect(screen.getByTestId("mock-skill-create-wizard")).toBeDefined();
    expect(
      screen.getByTestId("skill-management-panel-create-view"),
    ).toBeDefined();
    expect(typeof capturedCreateWizardProps.onClose).toBe("function");

    await act(async () => {
      fireEvent.click(screen.getByTestId("wizard-close"));
    });

    expect(screen.queryByTestId("mock-skill-create-wizard")).toBeNull();
    expect(screen.getByTestId("skill-management-panel")).toBeDefined();
  });

  it("dialog confirm 後に available から imported へ移動し、成功メッセージを出す", async () => {
    currentStoreState = {
      ...currentStoreState,
      importSkill: vi.fn(async (skillName: SkillMetadata["name"]) => {
        currentStoreState = {
          ...currentStoreState,
          importedSkills: [
            ...currentStoreState.importedSkills,
            buildImportedSkill(String(skillName), "Imported from dialog"),
          ],
          availableSkillsMetadata:
            currentStoreState.availableSkillsMetadata.filter(
              (skill) => skill.name !== skillName,
            ),
          skillError: null,
        };
      }),
    };

    const { rerender } = render(<SkillManagementPanel />);

    const addButton = screen.getByLabelText("skill-gamma を追加する");
    await act(async () => {
      fireEvent.click(addButton);
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "追加する" }));
    });

    rerender(<SkillManagementPanel />);
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(screen.queryByTestId("available-skill-row-skill-gamma")).toBeNull();
    expect(screen.getByTestId("imported-skill-card-skill-gamma")).toBeDefined();
    expect(screen.getByTestId("skill-management-success")).toHaveTextContent(
      "skill-gamma を追加しました",
    );
    expect(document.activeElement).toBe(
      screen.getByTestId("imported-skill-card-skill-gamma"),
    );
  });

  it("dialog cancel で trigger へ focus return する", async () => {
    render(<SkillManagementPanel />);

    const addButton = screen.getByLabelText("skill-gamma を追加する");
    await act(async () => {
      fireEvent.click(addButton);
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "キャンセル" }));
    });

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(addButton);
  });

  it("import failure 時は dialog を開いたまま alert を表示する", async () => {
    currentStoreState = {
      ...currentStoreState,
      importSkill: vi.fn(async () => {
        currentStoreState = {
          ...currentStoreState,
          skillError: "スキルのインポートに失敗: timeout",
        };
      }),
    };

    const { rerender } = render(<SkillManagementPanel />);

    await act(async () => {
      fireEvent.click(screen.getByLabelText("skill-gamma を追加する"));
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "追加する" }));
    });

    rerender(<SkillManagementPanel />);

    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByTestId("skill-import-dialog-error")).toHaveTextContent(
      "スキルのインポートに失敗: timeout もう一度試してみてください。",
    );
    expect(screen.getAllByRole("alert")).toHaveLength(1);
  });

  it("検索クエリは analysis view を往復しても維持される", async () => {
    render(<SkillManagementPanel />);

    const searchInput = screen.getByLabelText(
      "スキルを検索",
    ) as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: "alpha" } });

    await act(async () => {
      fireEvent.click(screen.getByLabelText("skill-alpha を分析"));
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("analysis-close"));
    });

    expect(
      (screen.getByLabelText("スキルを検索") as HTMLInputElement).value,
    ).toBe("alpha");
    expect(screen.getByTestId("imported-skill-card-skill-alpha")).toBeDefined();
  });
});

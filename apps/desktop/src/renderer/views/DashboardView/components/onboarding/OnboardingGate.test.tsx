import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ImportedSkill, SkillMetadata } from "@repo/shared";
import { useAppStore } from "../../../../store";
import {
  ONBOARDING_COMPLETED_KEY,
  ONBOARDING_SELECTED_SKILL_KEY,
  OnboardingGate,
} from "./OnboardingGate";

function createSkillMetadata(name: SkillMetadata["name"]): SkillMetadata {
  return {
    name,
    description: `${name} の説明`,
    path: `/mock/${name}`,
    updatedAt: new Date("2026-03-12T12:00:00Z"),
    agents: [],
    references: [],
    scripts: [],
    assets: [],
    schemas: [],
    indexes: [],
    otherFiles: [],
  };
}

function createImportedSkill(name: ImportedSkill["name"]): ImportedSkill {
  return {
    ...createSkillMetadata(name),
    importedAt: new Date("2026-03-12T12:05:00Z"),
    status: "active",
  };
}

function installElectronApi(
  overrides: Partial<{
    get: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
  }> = {},
) {
  const api = {
    get: vi.fn().mockResolvedValue({ success: true, data: false }),
    set: vi.fn().mockResolvedValue({ success: true }),
    ...overrides,
  };

  Object.defineProperty(window, "electronAPI", {
    configurable: true,
    value: {
      store: api,
    },
  });

  return api;
}

describe("OnboardingGate", () => {
  const originalState = useAppStore.getState();

  beforeEach(() => {
    useAppStore.setState({
      userProfile: {
        name: "ユーザー",
        email: "",
        avatar: "",
        plan: "free",
      },
      themeMode: "light",
      resolvedTheme: "light",
      availableSkillsMetadata: [],
      importedSkills: [],
      isLoadingSkills: false,
      skillError: null,
      fetchSkills: vi.fn().mockResolvedValue(undefined),
      importSkill: vi.fn().mockResolvedValue(undefined),
      selectSkillByName: vi.fn(),
      updateUserProfile: vi.fn(),
      setThemeMode: vi.fn().mockResolvedValue(undefined),
    });
  });

  afterEach(() => {
    useAppStore.setState(originalState);
    delete (
      window as typeof window & { electronAPI?: unknown }
    ).electronAPI;
  });

  it("completed=false のとき overlay を開き、スキル未読込なら fetchSkills を呼ぶ", async () => {
    const electronApi = installElectronApi();
    const fetchSkills = vi.fn().mockResolvedValue(undefined);
    useAppStore.setState({
      fetchSkills,
    });

    render(<OnboardingGate />);

    await waitFor(() => {
      expect(screen.getByTestId("onboarding-wizard")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(electronApi.get).toHaveBeenCalledWith({
        key: ONBOARDING_COMPLETED_KEY,
        defaultValue: false,
      });
      expect(fetchSkills).toHaveBeenCalledTimes(1);
    });
  });

  it("completed=true のとき overlay を表示しない", async () => {
    installElectronApi({
      get: vi.fn().mockResolvedValue({ success: true, data: true }),
    });

    render(<OnboardingGate />);

    await waitFor(() => {
      expect(screen.queryByTestId("onboarding-wizard")).not.toBeInTheDocument();
    });
  });

  it("あとで で onboarding.completed=true を保存して閉じる", async () => {
    const electronApi = installElectronApi();

    render(<OnboardingGate />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "あとで" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "あとで" }));

    await waitFor(() => {
      expect(electronApi.set).toHaveBeenCalledWith({
        key: ONBOARDING_COMPLETED_KEY,
        value: true,
      });
    });

    await waitFor(() => {
      expect(screen.queryByTestId("onboarding-wizard")).not.toBeInTheDocument();
    });
  });

  it("完了時に userProfile 更新・skill handoff・store 保存を行う", async () => {
    const electronApi = installElectronApi();
    const updateUserProfile = vi.fn();
    const selectSkillByName = vi.fn();
    const importSkill = vi.fn(async (skillName: ImportedSkill["name"]) => {
      useAppStore.setState({
        importedSkills: [createImportedSkill(skillName)],
        skillError: null,
      });
    });
    const setThemeMode = vi.fn().mockResolvedValue(undefined);

    useAppStore.setState({
      availableSkillsMetadata: [
        createSkillMetadata("aiworkflow-requirements"),
        createSkillMetadata("task-specification-creator"),
      ],
      importedSkills: [],
      updateUserProfile,
      selectSkillByName,
      importSkill,
      setThemeMode,
    });

    render(<OnboardingGate />);

    await waitFor(() => {
      expect(screen.getByTestId("onboarding-wizard")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("オンボーディングの名前入力"), {
      target: { value: "春子" },
    });
    fireEvent.click(screen.getByTestId("onboarding-primary-action"));
    fireEvent.click(screen.getByText("今日の天気は?"));
    fireEvent.click(screen.getByTestId("onboarding-primary-action"));
    fireEvent.click(
      screen.getByTestId(
        "onboarding-skill-card-aiworkflow-requirements",
      ),
    );
    fireEvent.click(screen.getByTestId("onboarding-primary-action"));
    fireEvent.click(screen.getByTestId("onboarding-theme-card-dark"));
    fireEvent.click(screen.getByTestId("onboarding-primary-action"));

    await waitFor(() => {
      expect(updateUserProfile).toHaveBeenCalledWith({ name: "春子" });
    });

    expect(setThemeMode).toHaveBeenCalledWith("dark");
    expect(importSkill).toHaveBeenCalledWith("aiworkflow-requirements");
    expect(selectSkillByName).toHaveBeenCalledWith("aiworkflow-requirements");
    expect(electronApi.set).toHaveBeenCalledWith({
      key: ONBOARDING_SELECTED_SKILL_KEY,
      value: "aiworkflow-requirements",
    });
    expect(electronApi.set).toHaveBeenCalledWith({
      key: ONBOARDING_COMPLETED_KEY,
      value: true,
    });
  });
});

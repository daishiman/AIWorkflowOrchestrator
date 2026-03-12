import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { ImportedSkill, SkillMetadata } from "@repo/shared";
import { useAppStore } from "../../../../store";
import type { ThemeMode } from "../../../../store/types";
import {
  buildOnboardingSkillCards,
  type OnboardingThemeMode,
} from "./constants";
import {
  OnboardingWizard,
  type OnboardingCompletionPayload,
} from "./OnboardingWizard";

type StoreGetResponse = {
  success: boolean;
  data?: unknown;
  error?: string;
};

type StoreSetResponse = {
  success: boolean;
  error?: string;
};

type ElectronStoreApi = {
  get?: (request: {
    key: string;
    defaultValue?: unknown;
  }) => Promise<StoreGetResponse>;
  set?: (request: { key: string; value: unknown }) => Promise<StoreSetResponse>;
};

export const ONBOARDING_COMPLETED_KEY = "onboarding.completed";
export const ONBOARDING_SELECTED_SKILL_KEY = "onboarding.selectedSkillName";

function getStoreApi(): ElectronStoreApi | undefined {
  return (
    window as typeof window & {
      electronAPI?: {
        store?: ElectronStoreApi;
      };
    }
  ).electronAPI?.store;
}

function normalizeOnboardingName(value: string): string {
  const trimmed = value.trim();
  return trimmed === "ユーザー" ? "" : trimmed;
}

function normalizeThemeMode(
  themeMode: ThemeMode,
  resolvedTheme: "kanagawa-dragon" | "light" | "dark",
): OnboardingThemeMode {
  if (themeMode === "system") {
    return resolvedTheme;
  }
  return themeMode;
}

async function setPersistedValue(key: string, value: unknown): Promise<void> {
  const storeApi = getStoreApi();
  if (!storeApi?.set) {
    throw new Error("Store API is not available");
  }

  const response = await storeApi.set({ key, value });
  if (!response.success) {
    throw new Error(
      response.error ?? `Failed to persist onboarding value for ${key}`,
    );
  }
}

export const OnboardingGate: React.FC = () => {
  const [status, setStatus] = useState<"checking" | "open" | "closed">(
    "checking",
  );

  const userProfileName = useAppStore((state) => state.userProfile.name);
  const themeMode = useAppStore((state) => state.themeMode);
  const resolvedTheme = useAppStore((state) => state.resolvedTheme);
  const updateUserProfile = useAppStore((state) => state.updateUserProfile);
  const availableSkillsMetadata = useAppStore(
    (state) => state.availableSkillsMetadata,
  );
  const importedSkills = useAppStore((state) => state.importedSkills);
  const isLoadingSkills = useAppStore((state) => state.isLoadingSkills);
  const skillError = useAppStore((state) => state.skillError);
  const fetchSkills = useAppStore((state) => state.fetchSkills);
  const importSkill = useAppStore((state) => state.importSkill);
  const selectSkillByName = useAppStore((state) => state.selectSkillByName);
  const setThemeMode = useAppStore((state) => state.setThemeMode);

  useEffect(() => {
    let active = true;

    const checkOnboardingState = async () => {
      const storeApi = getStoreApi();

      if (!storeApi?.get) {
        if (active) {
          setStatus("open");
        }
        return;
      }

      try {
        const response = await storeApi.get({
          key: ONBOARDING_COMPLETED_KEY,
          defaultValue: false,
        });
        if (!active) {
          return;
        }

        setStatus(response.success && response.data === true ? "closed" : "open");
      } catch {
        if (active) {
          setStatus("open");
        }
      }
    };

    void checkOnboardingState();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (
      status !== "open" ||
      isLoadingSkills ||
      availableSkillsMetadata.length > 0 ||
      importedSkills.length > 0
    ) {
      return;
    }

    void fetchSkills();
  }, [
    availableSkillsMetadata.length,
    fetchSkills,
    importedSkills.length,
    isLoadingSkills,
    status,
  ]);

  const skillCards = useMemo(
    () =>
      buildOnboardingSkillCards(
        availableSkillsMetadata as SkillMetadata[],
        importedSkills as ImportedSkill[],
      ),
    [availableSkillsMetadata, importedSkills],
  );

  const handleSkip = useCallback(async () => {
    await setPersistedValue(ONBOARDING_COMPLETED_KEY, true);
    setStatus("closed");
  }, []);

  const handleApplyTheme = useCallback(
    async (mode: OnboardingThemeMode) => {
      await setThemeMode(mode);
    },
    [setThemeMode],
  );

  const handleComplete = useCallback(
    async (payload: OnboardingCompletionPayload) => {
      const trimmedName = payload.userName.trim();
      if (trimmedName !== "") {
        updateUserProfile({ name: trimmedName });
      }

      if (payload.selectedSkillName) {
        await importSkill(payload.selectedSkillName);
        const latestState = useAppStore.getState();
        const isImported = latestState.importedSkills.some(
          (skill) => skill.name === payload.selectedSkillName,
        );

        if (!isImported) {
          throw new Error(
            latestState.skillError ?? "ツールの追加に失敗しました",
          );
        }

        selectSkillByName(payload.selectedSkillName);
        await setPersistedValue(
          ONBOARDING_SELECTED_SKILL_KEY,
          payload.selectedSkillName,
        );
      }

      await setPersistedValue(ONBOARDING_COMPLETED_KEY, true);
    },
    [importSkill, selectSkillByName, updateUserProfile],
  );

  if (status !== "open") {
    return null;
  }

  return (
    <OnboardingWizard
      defaultName={normalizeOnboardingName(userProfileName)}
      defaultTheme={normalizeThemeMode(themeMode, resolvedTheme)}
      skillCards={skillCards}
      isSkillsLoading={isLoadingSkills}
      skillLoadError={skillCards.length === 0 ? skillError : null}
      onApplyTheme={handleApplyTheme}
      onSkip={handleSkip}
      onComplete={handleComplete}
      onFinished={() => setStatus("closed")}
    />
  );
};

OnboardingGate.displayName = "OnboardingGate";

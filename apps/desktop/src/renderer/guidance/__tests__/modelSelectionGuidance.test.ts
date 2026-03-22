import { describe, expect, it, vi } from "vitest";
import {
  createGuidanceActionDispatcher,
  deriveModelSelectionBlockedReason,
  getModelSelectionGuidance,
} from "../modelSelectionGuidance";

describe("modelSelectionGuidance", () => {
  it("provider 未選択時は NO_PROVIDER を返す", () => {
    expect(
      deriveModelSelectionBlockedReason({
        selectedProviderId: null,
        selectedModelId: null,
      }),
    ).toBe("NO_PROVIDER");
  });

  it("provider 選択済みかつ model 未選択時は NO_MODEL を返す", () => {
    expect(
      deriveModelSelectionBlockedReason({
        selectedProviderId: "openai",
        selectedModelId: null,
      }),
    ).toBe("NO_MODEL");
  });

  it("provider と model が揃っている場合は blocked reason を返さない", () => {
    expect(
      deriveModelSelectionBlockedReason({
        selectedProviderId: "openai",
        selectedModelId: "gpt-4o",
      }),
    ).toBeNull();
  });

  it("guidance config は secondary CTA を保持する", () => {
    const guidance = getModelSelectionGuidance("NO_MODEL");

    expect(guidance?.primaryAction.type).toBe("open-settings");
    expect(guidance?.secondaryAction.type).toBe("open-terminal");
  });

  it("dispatcher は未実装 handler を no-op 化せず undefined を返す", () => {
    const openSettings = vi.fn();
    const dispatch = createGuidanceActionDispatcher({
      openSettings,
    });

    const settingsHandler = dispatch("open-settings");
    settingsHandler?.();

    expect(openSettings).toHaveBeenCalledTimes(1);
    expect(dispatch("open-terminal")).toBeUndefined();
  });
});

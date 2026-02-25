import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useAppStore } from "../index";

describe("settingsSlice - Theme Modes", () => {
  beforeEach(() => {
    useAppStore.setState({
      themeMode: "kanagawa-dragon",
      resolvedTheme: "kanagawa-dragon",
    });

    vi.stubGlobal("electronAPI", {
      theme: {
        get: vi.fn().mockResolvedValue({
          success: true,
          data: { mode: "kanagawa-dragon", resolvedTheme: "kanagawa-dragon" },
        }),
        set: vi.fn().mockImplementation(({ mode }: { mode: string }) =>
          Promise.resolve({
            success: true,
            data: {
              mode,
              resolvedTheme: mode === "system" ? "dark" : mode,
            },
          }),
        ),
        getSystem: vi.fn().mockResolvedValue({
          success: true,
          data: { isDark: true, resolvedTheme: "dark" },
        }),
      },
    });

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: true,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("初期値がkanagawa-dragonである", () => {
    const state = useAppStore.getState();
    expect(state.themeMode).toBe("kanagawa-dragon");
    expect(state.resolvedTheme).toBe("kanagawa-dragon");
  });

  it("kanagawa-dragonへ切り替えできる", async () => {
    const { setThemeMode } = useAppStore.getState();
    await setThemeMode("kanagawa-dragon");

    const state = useAppStore.getState();
    expect(state.themeMode).toBe("kanagawa-dragon");
    expect(state.resolvedTheme).toBe("kanagawa-dragon");
  });

  it("light/dark/systemへ切り替えできる", async () => {
    const { setThemeMode } = useAppStore.getState();

    await setThemeMode("light");
    expect(useAppStore.getState().themeMode).toBe("light");
    expect(useAppStore.getState().resolvedTheme).toBe("light");

    await setThemeMode("dark");
    expect(useAppStore.getState().themeMode).toBe("dark");
    expect(useAppStore.getState().resolvedTheme).toBe("dark");

    await setThemeMode("system");
    expect(useAppStore.getState().themeMode).toBe("system");
    expect(useAppStore.getState().resolvedTheme).toBe("dark");
  });
});

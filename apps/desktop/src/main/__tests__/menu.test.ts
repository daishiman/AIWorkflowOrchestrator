import { vi, describe, it, expect, afterEach, beforeEach } from "vitest";

// electron をモック化
vi.mock("electron", () => {
  return {
    Menu: {
      buildFromTemplate: vi.fn(
        (template: Electron.MenuItemConstructorOptions[]) => ({ template }),
      ),
      setApplicationMenu: vi.fn(),
    },
    app: {
      getName: vi.fn(() => "AIWorkflow"),
    },
  };
});

// テスト対象関数のインポート
import {
  buildMacTemplate,
  buildDefaultTemplate,
  createApplicationMenu,
} from "../menu";
import { Menu } from "electron";

// ヘルパー: submenu からすべての role を再帰的に収集
function collectRoles(items: Electron.MenuItemConstructorOptions[]): string[] {
  return items.flatMap((item) => {
    const roles: string[] = [];
    if (item.role) roles.push(item.role as string);
    if (item.submenu && Array.isArray(item.submenu)) {
      roles.push(
        ...collectRoles(item.submenu as Electron.MenuItemConstructorOptions[]),
      );
    }
    return roles;
  });
}

// ヘルパー: 特定 label のメニュー項目の submenu を取得
function findSubmenuByLabel(
  template: Electron.MenuItemConstructorOptions[],
  label: string,
): Electron.MenuItemConstructorOptions[] {
  const item = template.find((m) => m.label === label);
  if (!item || !Array.isArray(item.submenu)) return [];
  return item.submenu as Electron.MenuItemConstructorOptions[];
}

// process.platform モック用ヘルパー
function mockPlatform(platform: NodeJS.Platform): void {
  vi.spyOn(process, "platform", "get").mockReturnValue(platform);
}

describe("buildMacTemplate", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("TC-4: zoomIn role を含む", () => {
    const template = buildMacTemplate();
    const viewSubmenu = findSubmenuByLabel(template, "表示");
    const roles = collectRoles(viewSubmenu);
    expect(roles).toContain("zoomIn");
  });

  it("TC-5: zoomOut role を含む", () => {
    const template = buildMacTemplate();
    const viewSubmenu = findSubmenuByLabel(template, "表示");
    const roles = collectRoles(viewSubmenu);
    expect(roles).toContain("zoomOut");
  });

  it("TC-6: resetZoom role を含む", () => {
    const template = buildMacTemplate();
    const viewSubmenu = findSubmenuByLabel(template, "表示");
    const roles = collectRoles(viewSubmenu);
    expect(roles).toContain("resetZoom");
  });

  it("TC-7: 編集メニューに undo/redo/cut/copy/paste/selectAll を含む", () => {
    const template = buildMacTemplate();
    const editSubmenu = findSubmenuByLabel(template, "編集");
    const roles = collectRoles(editSubmenu);
    expect(roles).toContain("undo");
    expect(roles).toContain("redo");
    expect(roles).toContain("cut");
    expect(roles).toContain("copy");
    expect(roles).toContain("paste");
    expect(roles).toContain("selectAll");
  });

  it("TC-8: アプリ名メニューに quit role を含む", () => {
    const template = buildMacTemplate();
    const appMenu = template[0];
    const submenu = Array.isArray(appMenu.submenu)
      ? (appMenu.submenu as Electron.MenuItemConstructorOptions[])
      : [];
    const roles = collectRoles(submenu);
    expect(roles).toContain("quit");
  });

  it("TC-9: ウィンドウメニューに minimize と close role を含む", () => {
    const template = buildMacTemplate();
    const windowSubmenu = findSubmenuByLabel(template, "ウィンドウ");
    const roles = collectRoles(windowSubmenu);
    expect(roles).toContain("minimize");
    expect(roles).toContain("close");
  });
});

describe("buildDefaultTemplate", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("TC-10: zoomIn/zoomOut/resetZoom role を含む", () => {
    const template = buildDefaultTemplate();
    const viewSubmenu = findSubmenuByLabel(template, "表示");
    const roles = collectRoles(viewSubmenu);
    expect(roles).toContain("zoomIn");
    expect(roles).toContain("zoomOut");
    expect(roles).toContain("resetZoom");
  });

  it("TC-11: メニューが 1 件のみ（「表示」のみ）", () => {
    const template = buildDefaultTemplate();
    expect(template).toHaveLength(1);
    expect(template[0].label).toBe("表示");
  });
});

describe("createApplicationMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("TC-1: darwin では buildMacTemplate を使う（4メニュー）", () => {
    mockPlatform("darwin");
    createApplicationMenu();
    const mockBuildFromTemplate = vi.mocked(Menu.buildFromTemplate);
    const callArgs = mockBuildFromTemplate.mock.calls[0][0];
    expect(callArgs).toHaveLength(4);
  });

  it("TC-2: win32 では buildDefaultTemplate を使う（1メニュー）", () => {
    mockPlatform("win32");
    createApplicationMenu();
    const mockBuildFromTemplate = vi.mocked(Menu.buildFromTemplate);
    const callArgs = mockBuildFromTemplate.mock.calls[0][0];
    expect(callArgs).toHaveLength(1);
  });

  it("TC-3: linux では buildDefaultTemplate を使う（1メニュー）", () => {
    mockPlatform("linux");
    createApplicationMenu();
    const mockBuildFromTemplate = vi.mocked(Menu.buildFromTemplate);
    const callArgs = mockBuildFromTemplate.mock.calls[0][0];
    expect(callArgs).toHaveLength(1);
  });

  it("TC-12: Menu.setApplicationMenu が 1 回呼ばれる", () => {
    mockPlatform("darwin");
    createApplicationMenu();
    expect(vi.mocked(Menu.setApplicationMenu)).toHaveBeenCalledTimes(1);
  });
});

describe("buildMacTemplate - 境界値テスト", () => {
  it("TC-13: 4 つのトップレベルメニューを返す", () => {
    const template = buildMacTemplate();
    expect(template).toHaveLength(4);
  });

  it("TC-14: 「表示」メニューに role の重複がない", () => {
    const template = buildMacTemplate();
    const viewSubmenu = findSubmenuByLabel(template, "表示");
    const roles = viewSubmenu
      .filter((item) => item.role !== undefined)
      .map((item) => item.role as string);
    const uniqueRoles = new Set(roles);
    expect(uniqueRoles.size).toBe(roles.length);
  });

  it("TC-16: 各メニューが submenu を持ち、submenu が空でない", () => {
    const template = buildMacTemplate();
    for (const item of template) {
      expect(Array.isArray(item.submenu)).toBe(true);
      expect(
        (item.submenu as Electron.MenuItemConstructorOptions[]).length,
      ).toBeGreaterThan(0);
    }
  });
});

describe("buildDefaultTemplate - 境界値テスト", () => {
  it("TC-15: 「表示」メニューに role の重複がない", () => {
    const template = buildDefaultTemplate();
    const viewSubmenu = findSubmenuByLabel(template, "表示");
    const roles = viewSubmenu
      .filter((item) => item.role !== undefined)
      .map((item) => item.role as string);
    const uniqueRoles = new Set(roles);
    expect(uniqueRoles.size).toBe(roles.length);
  });
});

describe("buildMacTemplate - 異常系テスト", () => {
  it("TC-17: 「表示」メニューの index 3 がセパレーター", () => {
    const template = buildMacTemplate();
    const viewSubmenu = findSubmenuByLabel(template, "表示");
    expect(viewSubmenu[3]).toEqual({ type: "separator" });
  });
});

describe("buildDefaultTemplate - 異常系テスト", () => {
  it("TC-18: 「表示」メニューの index 3 がセパレーター", () => {
    const template = buildDefaultTemplate();
    const viewSubmenu = findSubmenuByLabel(template, "表示");
    expect(viewSubmenu[3]).toEqual({ type: "separator" });
  });
});

describe("createApplicationMenu - 回帰テスト", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("TC-19: 複数回呼び出しても各回 Menu.setApplicationMenu が呼ばれる", () => {
    mockPlatform("darwin");
    createApplicationMenu();
    createApplicationMenu();
    expect(vi.mocked(Menu.setApplicationMenu)).toHaveBeenCalledTimes(2);
  });
});

describe("buildMacTemplate - 回帰テスト", () => {
  it("TC-20: ウィンドウメニューに front role を含む（macOS 固有）", () => {
    const template = buildMacTemplate();
    const windowSubmenu = findSubmenuByLabel(template, "ウィンドウ");
    const roles = collectRoles(windowSubmenu);
    expect(roles).toContain("front");
  });
});

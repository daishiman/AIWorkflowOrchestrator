import { describe, expect, it } from "vitest";
import {
  APP_DOCK_NAV_ITEMS,
  MOBILE_PRIMARY_NAV_ITEMS,
  MOBILE_SECONDARY_NAV_ITEMS,
  NAV_SECTIONS,
  NAV_SHORTCUT_TO_VIEW,
  getViewFromNavigationShortcut,
  isGoBackNavigationShortcut,
  isEditableEventTarget,
} from "./navContract";

interface ShortcutEventInput {
  key?: string;
  code?: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  target?: EventTarget | null;
}

const createEvent = (
  input: ShortcutEventInput = {},
): Parameters<typeof getViewFromNavigationShortcut>[0] => ({
  key: input.key ?? "",
  code: input.code,
  metaKey: input.metaKey ?? false,
  ctrlKey: input.ctrlKey ?? false,
  altKey: input.altKey ?? false,
  shiftKey: input.shiftKey ?? false,
  target: input.target ?? null,
});

describe("navContract", () => {
  describe("NAV_SECTIONS", () => {
    it("セクション構成が main/sub/footer の3区分になっている", () => {
      expect(NAV_SECTIONS.map((section) => section.id)).toEqual([
        "main",
        "sub",
        "footer",
      ]);
      expect(NAV_SECTIONS.map((section) => section.items.length)).toEqual([
        6, 3, 1,
      ]);
    });

    it("AppDock表示順とショートカット割当が契約通りである", () => {
      expect(APP_DOCK_NAV_ITEMS.map((item) => item.id)).toEqual([
        "dashboard",
        "workspace",
        "chat",
        "agent",
        "skillCenter",
        "historySearch",
        "graph",
        "editor",
        "executionConsole",
        "settings",
      ]);
      expect(APP_DOCK_NAV_ITEMS.map((item) => item.shortcut)).toEqual([
        "Cmd+1",
        "Cmd+2",
        "Cmd+3",
        "Cmd+4",
        "Cmd+5",
        "Cmd+6",
        "Cmd+7",
        "Cmd+8",
        "Cmd+9",
        "Cmd+,",
      ]);
    });

    it("モバイルの主要5項目とMore内4項目が仕様通りに分割される", () => {
      expect(MOBILE_PRIMARY_NAV_ITEMS.map((item) => item.id)).toEqual([
        "dashboard",
        "workspace",
        "chat",
        "agent",
        "skillCenter",
      ]);
      expect(MOBILE_SECONDARY_NAV_ITEMS.map((item) => item.id)).toEqual([
        "historySearch",
        "graph",
        "editor",
        "executionConsole",
        "settings",
      ]);
    });
  });

  describe("getViewFromNavigationShortcut", () => {
    it("Cmd/Ctrl + 数字ショートカットを ViewType へ解決する", () => {
      expect(
        getViewFromNavigationShortcut(createEvent({ key: "1", metaKey: true })),
      ).toBe("dashboard");
      expect(
        getViewFromNavigationShortcut(createEvent({ key: "5", ctrlKey: true })),
      ).toBe("skillCenter");
      expect(
        getViewFromNavigationShortcut(createEvent({ key: "8", metaKey: true })),
      ).toBe("editor");
    });

    it("Cmd+9 を executionConsole に解決する", () => {
      expect(
        getViewFromNavigationShortcut(createEvent({ key: "9", metaKey: true })),
      ).toBe("executionConsole");
      expect(
        getViewFromNavigationShortcut(createEvent({ key: "9", ctrlKey: true })),
      ).toBe("executionConsole");
    });

    it("Cmd+0 は割当外のため null を返す", () => {
      expect(
        getViewFromNavigationShortcut(createEvent({ key: "0", metaKey: true })),
      ).toBeNull();
    });

    it("Cmd/Ctrl + , を settings に解決する", () => {
      expect(
        getViewFromNavigationShortcut(createEvent({ key: ",", metaKey: true })),
      ).toBe("settings");
      expect(
        getViewFromNavigationShortcut(
          createEvent({ key: "<", code: "Comma", ctrlKey: true }),
        ),
      ).toBe("settings");
    });

    it("修飾キー条件を満たさない場合は無効化する", () => {
      expect(
        getViewFromNavigationShortcut(
          createEvent({ key: "1", metaKey: false }),
        ),
      ).toBeNull();
      expect(
        getViewFromNavigationShortcut(
          createEvent({ key: "1", metaKey: true, shiftKey: true }),
        ),
      ).toBeNull();
      expect(
        getViewFromNavigationShortcut(
          createEvent({ key: "1", ctrlKey: true, altKey: true }),
        ),
      ).toBeNull();
    });

    it("編集可能要素上ではショートカットを無効化する", () => {
      const input = document.createElement("input");
      expect(
        getViewFromNavigationShortcut(
          createEvent({ key: "2", metaKey: true, target: input }),
        ),
      ).toBeNull();
    });
  });

  describe("isGoBackNavigationShortcut", () => {
    it("Cmd/Ctrl + [ を戻るショートカットとして判定する", () => {
      expect(
        isGoBackNavigationShortcut(
          createEvent({ key: "[", code: "BracketLeft", metaKey: true }),
        ),
      ).toBe(true);
      expect(
        isGoBackNavigationShortcut(
          createEvent({ key: "[", code: "BracketLeft", ctrlKey: true }),
        ),
      ).toBe(true);
    });

    it("編集可能要素上や修飾キー違反では戻るショートカットを無効化する", () => {
      const textarea = document.createElement("textarea");
      expect(
        isGoBackNavigationShortcut(
          createEvent({
            key: "[",
            code: "BracketLeft",
            metaKey: true,
            target: textarea,
          }),
        ),
      ).toBe(false);
      expect(
        isGoBackNavigationShortcut(
          createEvent({
            key: "[",
            code: "BracketLeft",
            metaKey: true,
            shiftKey: true,
          }),
        ),
      ).toBe(false);
    });
  });

  describe("isEditableEventTarget", () => {
    it("input / textarea / select を編集対象として判定する", () => {
      expect(isEditableEventTarget(document.createElement("input"))).toBe(true);
      expect(isEditableEventTarget(document.createElement("textarea"))).toBe(
        true,
      );
      expect(isEditableEventTarget(document.createElement("select"))).toBe(
        true,
      );
    });

    it("contenteditable 要素を編集対象として判定する", () => {
      const editable = document.createElement("div");
      editable.setAttribute("contenteditable", "true");
      expect(isEditableEventTarget(editable)).toBe(true);
    });

    it("通常要素と null は編集対象として扱わない", () => {
      expect(isEditableEventTarget(document.createElement("button"))).toBe(
        false,
      );
      expect(isEditableEventTarget(null)).toBe(false);
    });
  });

  describe("NAV_SHORTCUT_TO_VIEW", () => {
    it("定義済みショートカットが AppDock の10項目を一意にカバーする", () => {
      const shortcutViews = Object.values(NAV_SHORTCUT_TO_VIEW);
      expect(shortcutViews).toHaveLength(10);
      expect(new Set(shortcutViews).size).toBe(10);
    });
  });

  // TASK-UI-01 Phase 6: skillLifecycle は DockViewType に含まれないことを確認
  describe("TASK-UI-01: skillLifecycle と DockViewType の境界 (AC-5)", () => {
    it("skillLifecycle は NAV_SHORTCUT_TO_VIEW に含まれない", () => {
      const shortcutViews = Object.values(NAV_SHORTCUT_TO_VIEW);
      expect(shortcutViews).not.toContain("skillLifecycle");
    });

    it("skillLifecycle は APP_DOCK_NAV_ITEMS の id に含まれない", () => {
      const navIds = APP_DOCK_NAV_ITEMS.map((item) => item.id);
      expect(navIds).not.toContain("skillLifecycle");
    });
  });
});

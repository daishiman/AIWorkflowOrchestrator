import { describe, expect, it } from "vitest";
import {
  isPublicUnauthenticatedView,
  shouldResetUnauthenticatedView,
} from "../shouldResetUnauthenticatedView";

describe("shouldResetUnauthenticatedView", () => {
  it("未認証・初期化完了・保護ビューでは dashboard へ戻す", () => {
    expect(
      shouldResetUnauthenticatedView({
        isAuthenticated: false,
        isLoading: false,
        currentView: "chat",
      }),
    ).toBe(true);
  });

  it("settings は未認証公開ビューとして維持する", () => {
    expect(
      shouldResetUnauthenticatedView({
        isAuthenticated: false,
        isLoading: false,
        currentView: "settings",
      }),
    ).toBe(false);
    expect(isPublicUnauthenticatedView("settings")).toBe(true);
  });

  it("dashboard はそのまま維持する", () => {
    expect(
      shouldResetUnauthenticatedView({
        isAuthenticated: false,
        isLoading: false,
        currentView: "dashboard",
      }),
    ).toBe(false);
  });

  it("認証中または認証済みでは reset しない", () => {
    expect(
      shouldResetUnauthenticatedView({
        isAuthenticated: false,
        isLoading: true,
        currentView: "chat",
      }),
    ).toBe(false);

    expect(
      shouldResetUnauthenticatedView({
        isAuthenticated: true,
        isLoading: false,
        currentView: "chat",
      }),
    ).toBe(false);
  });
});

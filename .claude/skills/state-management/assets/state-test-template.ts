import { describe, expect, it } from "vitest";

import { store } from "../store";

describe("state management", () => {
  it("updates loading state", () => {
    store.dispatch("setLoading", true);
    expect(store.getState().ui.isLoading).toBe(true);
  });
});

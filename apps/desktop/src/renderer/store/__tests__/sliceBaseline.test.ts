import { describe, expect, it } from "vitest";
import {
  STORE_BOUNDARY_MATRIX_BASELINE,
  STORE_PERSISTED_KEYS_BASELINE,
  STORE_SELECTOR_POLICY_BASELINE,
  STORE_SLICE_INVENTORY_BASELINE,
} from "../sliceBaseline";

describe("sliceBaseline unit", () => {
  it("境界判定が許容値4種のみである", () => {
    const allowed = new Set(["new", "extend", "no-change", "local-useState"]);

    for (const row of STORE_BOUNDARY_MATRIX_BASELINE) {
      expect(allowed.has(row.decision)).toBe(true);
    }
  });

  it("必須ドメイン（Notification/HistorySearch/SkillCenter/ViewType）を含む", () => {
    const domains = new Set(
      STORE_BOUNDARY_MATRIX_BASELINE.map((row) => row.domain),
    );

    expect(domains.has("Notification")).toBe(true);
    expect(domains.has("HistorySearch")).toBe(true);
    expect(domains.has("SkillCenter")).toBe(true);
    expect(domains.has("ViewType")).toBe(true);
  });

  it("台帳行に必須フィールドがある", () => {
    for (const row of STORE_SLICE_INVENTORY_BASELINE) {
      expect(row.sliceName.length).toBeGreaterThan(0);
      expect(row.state.length).toBeGreaterThan(0);
      expect(row.actions.length).toBeGreaterThan(0);
      expect(row.ownerView.length).toBeGreaterThan(0);
      expect(row.filePath.length).toBeGreaterThan(0);
      expect(row.persistence.strategy.length).toBeGreaterThan(0);
      expect(Array.isArray(row.persistence.keys)).toBe(true);
    }
  });
});

describe("sliceBaseline integration", () => {
  it("台帳行数が16行以上（15 Slice + chatEditSlice）である", () => {
    expect(STORE_SLICE_INVENTORY_BASELINE.length).toBeGreaterThanOrEqual(16);
  });

  it("persisted keys の基準値と台帳集計値が一致する", () => {
    const derivedKeys = Array.from(
      new Set(
        STORE_SLICE_INVENTORY_BASELINE.flatMap((row) => row.persistence.keys),
      ),
    ).sort();
    const baselineKeys = [...STORE_PERSISTED_KEYS_BASELINE].sort();

    expect(derivedKeys).toEqual(baselineKeys);
  });

  it("store/index.ts から baseline 定数が再exportされる", async () => {
    const storeModule = await import("../index");

    expect(storeModule.STORE_SLICE_INVENTORY_BASELINE).toBeDefined();
    expect(storeModule.STORE_BOUNDARY_MATRIX_BASELINE).toBeDefined();
    expect(storeModule.STORE_SELECTOR_POLICY_BASELINE).toBeDefined();
  });
});

describe("sliceBaseline regression", () => {
  it("合成Hookの非推奨リストを維持する", () => {
    expect(STORE_SELECTOR_POLICY_BASELINE.deprecatedCompositeHooks).toEqual([
      "useLLMStore",
      "useSkillStore",
      "useAuthModeStore",
    ]);
  });

  it("禁止セレクタ名の規約を維持する", () => {
    expect(STORE_SELECTOR_POLICY_BASELINE.bannedGenericSelectorNames).toContain(
      "useError",
    );
    expect(STORE_SELECTOR_POLICY_BASELINE.bannedGenericSelectorNames).toContain(
      "useLoading",
    );
  });

  it("SkillCenter と ViewType の境界判定を維持する", () => {
    const skillCenter = STORE_BOUNDARY_MATRIX_BASELINE.find(
      (row) => row.domain === "SkillCenter",
    );
    const viewType = STORE_BOUNDARY_MATRIX_BASELINE.find(
      (row) => row.domain === "ViewType",
    );

    expect(skillCenter?.decision).toBe("local-useState");
    expect(viewType?.decision).toBe("extend");
  });
});

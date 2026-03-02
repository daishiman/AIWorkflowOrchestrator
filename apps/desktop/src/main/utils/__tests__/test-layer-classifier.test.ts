import { describe, it, expect } from "vitest";
import {
  classifyTestLayer,
  canRunInWorktree,
  type TestItem,
  type TestLayer,
} from "../test-layer-classifier";

describe("classifyTestLayer", () => {
  it("UT-LC-01: vitest 実行可能テストを Layer 1 に分類する", () => {
    const testItem: TestItem = {
      type: "unit-test",
      runner: "vitest",
      requiresElectron: false,
      requiresUI: false,
    };
    expect(classifyTestLayer(testItem)).toBe(1 satisfies TestLayer);
  });

  it("UT-LC-02: IPC 契約静的解析テストを Layer 2 に分類する", () => {
    const testItem: TestItem = {
      type: "static-analysis",
      runner: "typecheck",
      requiresElectron: false,
      requiresUI: false,
    };
    expect(classifyTestLayer(testItem)).toBe(2 satisfies TestLayer);
  });

  it("UT-LC-03: UI 操作テストを Layer 3 に分類する", () => {
    const testItem: TestItem = {
      type: "e2e",
      runner: "playwright",
      requiresElectron: true,
      requiresUI: true,
    };
    expect(classifyTestLayer(testItem)).toBe(3 satisfies TestLayer);
  });

  it("UT-LC-04: DevTools コンソールテストを Layer 3 に分類する", () => {
    const testItem: TestItem = {
      type: "manual",
      runner: "devtools",
      requiresElectron: true,
      requiresUI: true,
    };
    expect(classifyTestLayer(testItem)).toBe(3 satisfies TestLayer);
  });

  it("UT-LC-08: integration-test タイプで Electron 不要の場合 Layer 1 に分類する", () => {
    const testItem: TestItem = {
      type: "integration-test",
      runner: "vitest",
      requiresElectron: false,
      requiresUI: false,
    };
    expect(classifyTestLayer(testItem)).toBe(1 satisfies TestLayer);
  });

  it("UT-LC-09: integration-test タイプで Electron 必要の場合 Layer 3 に分類する", () => {
    const testItem: TestItem = {
      type: "integration-test",
      runner: "vitest",
      requiresElectron: true,
      requiresUI: false,
    };
    expect(classifyTestLayer(testItem)).toBe(3 satisfies TestLayer);
  });

  it("UT-LC-10: requiresElectron === true かつ requiresUI === false の場合 Layer 3 に分類する", () => {
    const testItem: TestItem = {
      type: "unit-test",
      runner: "vitest",
      requiresElectron: true,
      requiresUI: false,
    };
    expect(classifyTestLayer(testItem)).toBe(3 satisfies TestLayer);
  });

  it("UT-LC-11: requiresElectron === false かつ requiresUI === true の場合 Layer 3 に分類する", () => {
    const testItem: TestItem = {
      type: "unit-test",
      runner: "vitest",
      requiresElectron: false,
      requiresUI: true,
    };
    expect(classifyTestLayer(testItem)).toBe(3 satisfies TestLayer);
  });

  it.each<{
    label: string;
    testItem: TestItem;
    expectedLayer: TestLayer;
  }>([
    {
      label: "unit-test + vitest (Electron不要/UI不要) → Layer 1",
      testItem: {
        type: "unit-test",
        runner: "vitest",
        requiresElectron: false,
        requiresUI: false,
      },
      expectedLayer: 1,
    },
    {
      label: "integration-test + vitest (Electron不要/UI不要) → Layer 1",
      testItem: {
        type: "integration-test",
        runner: "vitest",
        requiresElectron: false,
        requiresUI: false,
      },
      expectedLayer: 1,
    },
    {
      label: "static-analysis + lint (Electron不要/UI不要) → Layer 2",
      testItem: {
        type: "static-analysis",
        runner: "lint",
        requiresElectron: false,
        requiresUI: false,
      },
      expectedLayer: 2,
    },
    {
      label: "static-analysis + typecheck (Electron不要/UI不要) → Layer 2",
      testItem: {
        type: "static-analysis",
        runner: "typecheck",
        requiresElectron: false,
        requiresUI: false,
      },
      expectedLayer: 2,
    },
    {
      label: "e2e + playwright (Electron必要/UI必要) → Layer 3",
      testItem: {
        type: "e2e",
        runner: "playwright",
        requiresElectron: true,
        requiresUI: true,
      },
      expectedLayer: 3,
    },
    {
      label: "manual + devtools (Electron必要/UI必要) → Layer 3",
      testItem: {
        type: "manual",
        runner: "devtools",
        requiresElectron: true,
        requiresUI: true,
      },
      expectedLayer: 3,
    },
    {
      label: "unit-test + playwright (Electron必要/UI不要) → Layer 3",
      testItem: {
        type: "unit-test",
        runner: "playwright",
        requiresElectron: true,
        requiresUI: false,
      },
      expectedLayer: 3,
    },
  ])("UT-LC-13: 全組合せ分類テスト: $label", ({ testItem, expectedLayer }) => {
    expect(classifyTestLayer(testItem)).toBe(expectedLayer satisfies TestLayer);
  });
});

describe("canRunInWorktree", () => {
  it("UT-LC-05: Layer 1 テストは Worktree 環境で実行可能", () => {
    expect(canRunInWorktree(1 satisfies TestLayer)).toBe(true);
  });

  it("UT-LC-06: Layer 2 テストは Worktree 環境で実行可能", () => {
    expect(canRunInWorktree(2 satisfies TestLayer)).toBe(true);
  });

  it("UT-LC-07: Layer 3 テストは Worktree 環境で実行不可", () => {
    expect(canRunInWorktree(3 satisfies TestLayer)).toBe(false);
  });

  it.each<{ label: string; invalidValue: number }>([
    { label: "0 を渡した場合", invalidValue: 0 },
    { label: "4 を渡した場合", invalidValue: 4 },
    { label: "-1 を渡した場合", invalidValue: -1 },
    { label: "100 を渡した場合", invalidValue: 100 },
  ])(
    "UT-LC-12: 不正な値 ($label) を渡すと false を返す",
    ({ invalidValue }) => {
      // TestLayer 型 (1|2|3) の範囲外の値を意図的にテストするためキャスト
      expect(canRunInWorktree(invalidValue as TestLayer)).toBe(false);
    },
  );
});

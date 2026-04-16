/**
 * バリデーターテスト
 * scripts/verify-ipc-4layer.js のバリデーション関数を個別にテストする
 */
import { describe, it, expect } from "vitest";

const {
  validateSharedToPreload,
  validatePreloadToMain,
  validateRendererToShared,
} = require("../../verify-ipc-4layer.cjs");

// ====== validateSharedToPreload ======

describe("validateSharedToPreload", () => {
  it("正常系: 全チャネルが preload に登録されている場合 PASS", () => {
    const shared = new Set(["ch:one", "ch:two", "ch:three"]);
    const preload = {
      invoke: new Set(["ch:one", "ch:two"]),
      on: new Set(["ch:three"]),
      defined: new Set(["ch:one", "ch:two", "ch:three"]),
    };
    const result = validateSharedToPreload(shared, preload);
    expect(result.rule).toBe("Rule-1");
    expect(result.status).toBe("pass");
    expect(result.missing).toHaveLength(0);
  });

  it("異常系: shared にあり preload にないチャネルがある場合 FAIL", () => {
    const shared = new Set(["ch:one", "ch:two", "ch:missing"]);
    const preload = {
      invoke: new Set(["ch:one"]),
      on: new Set(["ch:two"]),
      defined: new Set(["ch:one", "ch:two"]),
    };
    const result = validateSharedToPreload(shared, preload);
    expect(result.rule).toBe("Rule-1");
    expect(result.status).toBe("fail");
    expect(result.missing).toContain("ch:missing");
    expect(result.missing).toHaveLength(1);
  });

  it("空の shared の場合 PASS", () => {
    const shared = new Set();
    const preload = {
      invoke: new Set(["ch:one"]),
      on: new Set(),
      defined: new Set(["ch:one"]),
    };
    const result = validateSharedToPreload(shared, preload);
    expect(result.status).toBe("pass");
    expect(result.missing).toHaveLength(0);
  });

  it("空の preload の場合、shared にチャネルがあれば FAIL", () => {
    const shared = new Set(["ch:one"]);
    const preload = {
      invoke: new Set(),
      on: new Set(),
      defined: new Set(),
    };
    const result = validateSharedToPreload(shared, preload);
    expect(result.status).toBe("fail");
    expect(result.missing).toContain("ch:one");
  });

  it("両方空の場合 PASS", () => {
    const shared = new Set();
    const preload = {
      invoke: new Set(),
      on: new Set(),
      defined: new Set(),
    };
    const result = validateSharedToPreload(shared, preload);
    expect(result.status).toBe("pass");
  });

  it("description プロパティが存在する", () => {
    const result = validateSharedToPreload(new Set(), {
      invoke: new Set(),
      on: new Set(),
      defined: new Set(),
    });
    expect(result.description).toBeTruthy();
    expect(typeof result.description).toBe("string");
  });
});

// ====== validatePreloadToMain ======

describe("validatePreloadToMain", () => {
  it("正常系: 全 invoke チャネルが main に実装されている場合 PASS", () => {
    const preload = {
      invoke: new Set(["ch:one", "ch:two"]),
      on: new Set(["ch:event"]),
      defined: new Set(["ch:one", "ch:two", "ch:event"]),
    };
    const main = new Set(["ch:one", "ch:two", "ch:three"]);
    const result = validatePreloadToMain(preload, main);
    expect(result.rule).toBe("Rule-2");
    expect(result.status).toBe("pass");
    expect(result.missing).toHaveLength(0);
  });

  it("異常系: preload invoke にあり main にないチャネルがある場合 FAIL", () => {
    const preload = {
      invoke: new Set(["ch:one", "ch:missing"]),
      on: new Set(),
      defined: new Set(["ch:one", "ch:missing"]),
    };
    const main = new Set(["ch:one"]);
    const result = validatePreloadToMain(preload, main);
    expect(result.rule).toBe("Rule-2");
    expect(result.status).toBe("fail");
    expect(result.missing).toContain("ch:missing");
    expect(result.missing).toHaveLength(1);
  });

  it("on チャネルは検証対象に含まれない (invoke のみ)", () => {
    const preload = {
      invoke: new Set(["ch:one"]),
      on: new Set(["ch:on-only"]),
      defined: new Set(["ch:one", "ch:on-only"]),
    };
    const main = new Set(["ch:one"]);
    // ch:on-only は main に無くても PASS（on は main ハンドラ不要）
    const result = validatePreloadToMain(preload, main);
    expect(result.status).toBe("pass");
  });

  it("空の preload invoke の場合 PASS", () => {
    const preload = {
      invoke: new Set(),
      on: new Set(["ch:event"]),
      defined: new Set(["ch:event"]),
    };
    const main = new Set();
    const result = validatePreloadToMain(preload, main);
    expect(result.status).toBe("pass");
  });

  it("空の main の場合、invoke にチャネルがあれば FAIL", () => {
    const preload = {
      invoke: new Set(["ch:one"]),
      on: new Set(),
      defined: new Set(["ch:one"]),
    };
    const main = new Set();
    const result = validatePreloadToMain(preload, main);
    expect(result.status).toBe("fail");
    expect(result.missing).toContain("ch:one");
  });

  it("両方空の場合 PASS", () => {
    const preload = {
      invoke: new Set(),
      on: new Set(),
      defined: new Set(),
    };
    const main = new Set();
    const result = validatePreloadToMain(preload, main);
    expect(result.status).toBe("pass");
  });

  it("description プロパティが存在する", () => {
    const result = validatePreloadToMain(
      { invoke: new Set(), on: new Set(), defined: new Set() },
      new Set(),
    );
    expect(result.description).toBeTruthy();
  });
});

// ====== validateRendererToShared ======

describe("validateRendererToShared", () => {
  it("正常系: 全 renderer チャネルが shared/preload に定義されている場合 PASS", () => {
    const renderer = new Set(["ch:one", "ch:two"]);
    const shared = new Set(["ch:one"]);
    const preload = {
      invoke: new Set(),
      on: new Set(),
      defined: new Set(["ch:two"]),
    };
    const result = validateRendererToShared(renderer, shared, preload);
    expect(result.rule).toBe("Rule-3");
    expect(result.status).toBe("pass");
    expect(result.missing).toHaveLength(0);
  });

  it("異常系: renderer にあり shared/preload にないチャネルがある場合 FAIL", () => {
    const renderer = new Set(["ch:one", "ch:unknown"]);
    const shared = new Set(["ch:one"]);
    const preload = {
      invoke: new Set(),
      on: new Set(),
      defined: new Set(["ch:one"]),
    };
    const result = validateRendererToShared(renderer, shared, preload);
    expect(result.rule).toBe("Rule-3");
    expect(result.status).toBe("fail");
    expect(result.missing).toContain("ch:unknown");
    expect(result.missing).toHaveLength(1);
  });

  it("空の renderer の場合 PASS", () => {
    const renderer = new Set();
    const shared = new Set(["ch:one"]);
    const preload = {
      invoke: new Set(),
      on: new Set(),
      defined: new Set(["ch:one"]),
    };
    const result = validateRendererToShared(renderer, shared, preload);
    expect(result.status).toBe("pass");
  });

  it("shared と preload.defined の和集合で判定する", () => {
    const renderer = new Set(["ch:from-shared", "ch:from-preload"]);
    const shared = new Set(["ch:from-shared"]);
    const preload = {
      invoke: new Set(),
      on: new Set(),
      defined: new Set(["ch:from-preload"]),
    };
    const result = validateRendererToShared(renderer, shared, preload);
    expect(result.status).toBe("pass");
  });

  it("全て空の場合 PASS", () => {
    const renderer = new Set();
    const shared = new Set();
    const preload = {
      invoke: new Set(),
      on: new Set(),
      defined: new Set(),
    };
    const result = validateRendererToShared(renderer, shared, preload);
    expect(result.status).toBe("pass");
  });

  it("description プロパティが存在する", () => {
    const result = validateRendererToShared(new Set(), new Set(), {
      invoke: new Set(),
      on: new Set(),
      defined: new Set(),
    });
    expect(result.description).toBeTruthy();
  });
});

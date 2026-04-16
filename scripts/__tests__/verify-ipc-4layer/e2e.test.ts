/**
 * E2E（結合）テスト
 * scripts/verify-ipc-4layer.js の main 関数相当のパイプラインを
 * テスト用フィクスチャで結合検証する
 */
import { describe, it, expect } from "vitest";

const {
  stripComments,
  parseSharedChannels,
  parseSharedGroupMap,
  parsePreloadWhitelist,
  parseMainHandlersFromContent,
  parseRendererUsageFromContent,
  resolveMainChannelRefs,
  buildPreloadChannelMap,
  validateSharedToPreload,
  validatePreloadToMain,
  validateRendererToShared,
  formatReport,
} = require("../../verify-ipc-4layer.cjs");

// ====== テストフィクスチャ ======

const SHARED_FIXTURE = `
export const FILE_CHANNELS = {
  FILE_READ: "file:read",
  FILE_WRITE: "file:write",
  FILE_DELETE: "file:delete",
} as const;

export const CHAT_CHANNELS = {
  CHAT_SEND: "chat:send",
  CHAT_EXPORT: "chat:exportSession",
} as const;

export const SKILL_CREATOR_OUTPUT_READY = "skill-creator:output-ready" as const;
`;

const PRELOAD_FIXTURE = `
export const IPC_CHANNELS = {
  FILE_READ: "file:read",
  FILE_WRITE: "file:write",
  FILE_DELETE: "file:delete",
  CHAT_SEND: "chat:send",
  CHAT_EXPORT: "chat:exportSession",
  SKILL_CREATOR_OUTPUT_READY: "skill-creator:output-ready",
  ANALYTICS_SEND: "analytics:send",
} as const;

export const ALLOWED_INVOKE_CHANNELS: readonly string[] = [
  IPC_CHANNELS.FILE_READ,
  IPC_CHANNELS.FILE_WRITE,
  IPC_CHANNELS.FILE_DELETE,
  IPC_CHANNELS.CHAT_SEND,
  IPC_CHANNELS.CHAT_EXPORT,
  IPC_CHANNELS.ANALYTICS_SEND,
];

export const ALLOWED_ON_CHANNELS: readonly string[] = [
  IPC_CHANNELS.SKILL_CREATOR_OUTPUT_READY,
];
`;

const MAIN_HANDLER_FIXTURE = `
import { ipcMain } from "electron";

ipcMain.handle("file:read", async (event, args) => {
  return readFile(args);
});

ipcMain.handle("file:write", async (event, args) => {
  return writeFile(args);
});

ipcMain.handle("file:delete", async (event, args) => {
  return deleteFile(args);
});

ipcMain.handle("chat:send", async (event, args) => {
  return sendChat(args);
});

ipcMain.handle("chat:exportSession", async (event, args) => {
  return exportSession(args);
});

ipcMain.handle("analytics:send", async (event, args) => {
  return sendAnalytics(args);
});
`;

const RENDERER_FIXTURE = `
import { safeInvoke, safeOn } from "./ipc";

safeInvoke("file:read", { path: "/tmp" });
safeInvoke("chat:send", { message: "hello" });
safeOn("skill-creator:output-ready", (data) => console.log(data));
`;

// ====== E2E: 全層一貫性 PASS ======

describe("E2E: 4層パイプライン全体テスト", () => {
  it("全ルール PASS の正常系シナリオ", () => {
    // Step 1: shared パース
    const sharedChannels = parseSharedChannels(SHARED_FIXTURE);
    const sharedGroupMap = parseSharedGroupMap(SHARED_FIXTURE);
    expect(sharedChannels.size).toBeGreaterThan(0);

    // Step 2: preload パース
    const preloadChannelMap = buildPreloadChannelMap(PRELOAD_FIXTURE);
    const preload = parsePreloadWhitelist(PRELOAD_FIXTURE, sharedChannels);

    // Step 3: main パース + 参照解決
    const rawMain = parseMainHandlersFromContent(MAIN_HANDLER_FIXTURE);
    const mainHandlers = resolveMainChannelRefs(
      rawMain,
      sharedGroupMap,
      preloadChannelMap,
    );

    // Step 4: renderer パース
    const rendererUsage = parseRendererUsageFromContent(RENDERER_FIXTURE);

    // Step 5: バリデーション
    const r1 = validateSharedToPreload(sharedChannels, preload);
    const r2 = validatePreloadToMain(preload, mainHandlers);
    const r3 = validateRendererToShared(rendererUsage, sharedChannels, preload);

    // Step 6: レポート
    const report = formatReport([r1, r2, r3]);
    expect(report.hasErrors).toBe(false);
    expect(report.text).toContain("Passed: 3");
    expect(report.text).toContain("Failed: 0");
  });

  it("Rule-1 FAIL: shared に定義があるが preload ホワイトリストに漏れがあるケース", () => {
    const sharedContent = `
export const TEST_CHANNELS = {
  TEST_ONE: "test:one",
  TEST_TWO: "test:two",
} as const;
`;
    const preloadContent = `
export const IPC_CHANNELS = {
  TEST_ONE: "test:one",
} as const;

export const ALLOWED_INVOKE_CHANNELS: readonly string[] = [
  IPC_CHANNELS.TEST_ONE,
];
export const ALLOWED_ON_CHANNELS: readonly string[] = [];
`;

    const shared = parseSharedChannels(sharedContent);
    const preload = parsePreloadWhitelist(preloadContent, shared);
    const r1 = validateSharedToPreload(shared, preload);

    expect(r1.status).toBe("fail");
    expect(r1.missing).toContain("test:two");
  });

  it("Rule-2 FAIL: preload invoke に登録があるが main handler が未実装のケース", () => {
    const preloadContent = `
export const IPC_CHANNELS = {
  ACTION_ONE: "action:one",
  ACTION_TWO: "action:two",
} as const;

export const ALLOWED_INVOKE_CHANNELS: readonly string[] = [
  IPC_CHANNELS.ACTION_ONE,
  IPC_CHANNELS.ACTION_TWO,
];
export const ALLOWED_ON_CHANNELS: readonly string[] = [];
`;
    const mainContent = `
ipcMain.handle("action:one", async () => {});
`;

    const preload = parsePreloadWhitelist(preloadContent, new Set());
    const preloadChannelMap = buildPreloadChannelMap(preloadContent);
    const sharedGroupMap = new Map();
    const rawMain = parseMainHandlersFromContent(mainContent);
    const mainHandlers = resolveMainChannelRefs(
      rawMain,
      sharedGroupMap,
      preloadChannelMap,
    );

    const r2 = validatePreloadToMain(preload, mainHandlers);
    expect(r2.status).toBe("fail");
    expect(r2.missing).toContain("action:two");
  });

  it("Rule-3 FAIL: renderer で使用するチャネルが shared/preload に未定義のケース", () => {
    const rendererContent = `
safeInvoke("known:channel", {});
safeInvoke("unknown:channel", {});
`;
    const shared = new Set(["known:channel"]);
    const preload = {
      invoke: new Set<string>(),
      on: new Set<string>(),
      defined: new Set(["known:channel"]),
    };

    const renderer = parseRendererUsageFromContent(rendererContent);
    const r3 = validateRendererToShared(renderer, shared, preload);

    expect(r3.status).toBe("fail");
    expect(r3.missing).toContain("unknown:channel");
  });

  it("全ルール FAIL のシナリオでレポートに全エラーが含まれる", () => {
    const r1 = {
      rule: "Rule-1",
      status: "fail" as const,
      missing: ["shared:only"],
      description: "shared → preload 未登録",
    };
    const r2 = {
      rule: "Rule-2",
      status: "fail" as const,
      missing: ["preload:only"],
      description: "preload → main 未実装",
    };
    const r3 = {
      rule: "Rule-3",
      status: "fail" as const,
      missing: ["renderer:only"],
      description: "renderer → shared 未定義",
    };

    const report = formatReport([r1, r2, r3]);
    expect(report.hasErrors).toBe(true);
    expect(report.text).toContain("Failed: 3");
    expect(report.text).toContain("shared:only");
    expect(report.text).toContain("preload:only");
    expect(report.text).toContain("renderer:only");
  });

  it("resolveMainChannelRefs が IPC_CHANNELS 参照を正しく解決する", () => {
    const rawMain = new Set([
      "direct:channel",
      "__IPC_CHANNELS_REF__:FILE_READ",
      "__CHANNELS_REF__:CHAT_CHANNELS.CHAT_SEND",
    ]);
    const sharedGroupMap = new Map([
      ["CHAT_CHANNELS", new Map([["CHAT_SEND", "chat:send"]])],
    ]);
    const preloadChannelMap = new Map([["FILE_READ", "file:read"]]);

    const resolved = resolveMainChannelRefs(
      rawMain,
      sharedGroupMap,
      preloadChannelMap,
    );

    expect(resolved.has("direct:channel")).toBe(true);
    expect(resolved.has("file:read")).toBe(true);
    expect(resolved.has("chat:send")).toBe(true);
    expect(resolved.size).toBe(3);
  });

  it("camelCase チャネル名が全パイプラインで正しく処理される", () => {
    const sharedContent = `
export const CHANNELS = {
  EXPORT_SESSION: "chat:exportSession",
  GET_DETAIL: "skill:getDetail",
} as const;
`;
    const preloadContent = `
export const IPC_CHANNELS = {
  EXPORT_SESSION: "chat:exportSession",
  GET_DETAIL: "skill:getDetail",
} as const;

export const ALLOWED_INVOKE_CHANNELS: readonly string[] = [
  IPC_CHANNELS.EXPORT_SESSION,
  IPC_CHANNELS.GET_DETAIL,
];
export const ALLOWED_ON_CHANNELS: readonly string[] = [];
`;
    const mainContent = `
ipcMain.handle("chat:exportSession", async () => {});
ipcMain.handle("skill:getDetail", async () => {});
`;
    const rendererContent = `
safeInvoke("chat:exportSession", {});
safeInvoke("skill:getDetail", {});
`;

    const shared = parseSharedChannels(sharedContent);
    const sharedGroupMap = parseSharedGroupMap(sharedContent);
    const preload = parsePreloadWhitelist(preloadContent, shared);
    const preloadChannelMap = buildPreloadChannelMap(preloadContent);
    const rawMain = parseMainHandlersFromContent(mainContent);
    const mainHandlers = resolveMainChannelRefs(
      rawMain,
      sharedGroupMap,
      preloadChannelMap,
    );
    const renderer = parseRendererUsageFromContent(rendererContent);

    const r1 = validateSharedToPreload(shared, preload);
    const r2 = validatePreloadToMain(preload, mainHandlers);
    const r3 = validateRendererToShared(renderer, shared, preload);

    expect(r1.status).toBe("pass");
    expect(r2.status).toBe("pass");
    expect(r3.status).toBe("pass");
  });
});

/**
 * パーサーテスト
 * scripts/verify-ipc-4layer.js のパーサー関数を個別にテストする
 */
import { describe, it, expect } from "vitest";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";

const {
  stripComments,
  parseSharedChannels,
  parseSharedGroupMap,
  parsePreloadWhitelist,
  parseMainHandlers,
  parseMainHandlersFromContent,
  parseRendererUsage,
  parseRendererUsageFromContent,
  buildPreloadChannelMap,
} = require("../../verify-ipc-4layer.cjs");

// ====== stripComments ======

describe("stripComments", () => {
  it("行コメントを除去する", () => {
    const input = `const a = 1; // this is a comment
const b = 2;`;
    const result = stripComments(input);
    expect(result).toContain("const a = 1;");
    expect(result).toContain("const b = 2;");
    expect(result).not.toContain("this is a comment");
  });

  it("ブロックコメントを除去する", () => {
    const input = `const a = 1; /* block comment */ const b = 2;`;
    const result = stripComments(input);
    expect(result).toContain("const a = 1;");
    expect(result).toContain("const b = 2;");
    expect(result).not.toContain("block comment");
  });

  it("複数行ブロックコメントを除去する", () => {
    const input = `const a = 1;
/**
 * multi-line
 * comment
 */
const b = 2;`;
    const result = stripComments(input);
    expect(result).toContain("const a = 1;");
    expect(result).toContain("const b = 2;");
    expect(result).not.toContain("multi-line");
  });

  it("文字列内のコメントパターンを保持する（ダブルクォート）", () => {
    const input = `const a = "http://example.com"; // real comment`;
    const result = stripComments(input);
    expect(result).toContain('"http://example.com"');
    expect(result).not.toContain("real comment");
  });

  it("文字列内のコメントパターンを保持する（シングルクォート）", () => {
    const input = `const a = 'http://example.com'; // real comment`;
    const result = stripComments(input);
    expect(result).toContain("'http://example.com'");
    expect(result).not.toContain("real comment");
  });

  it("テンプレートリテラル内のコメントパターンを保持する", () => {
    const input = "const a = `http://example.com`; // real comment";
    const result = stripComments(input);
    expect(result).toContain("`http://example.com`");
    expect(result).not.toContain("real comment");
  });

  it("エスケープされたクォートを正しく処理する", () => {
    const input = `const a = "he said \\"hello\\""; // comment`;
    const result = stripComments(input);
    expect(result).toContain('"he said \\"hello\\""');
    expect(result).not.toContain("// comment");
  });

  it("空文字列を処理できる", () => {
    expect(stripComments("")).toBe("");
  });
});

// ====== parseSharedChannels ======

describe("parseSharedChannels", () => {
  it("export const XXX_CHANNELS = { ... } as const パターンからチャネル名を抽出する", () => {
    const input = `
export const CHAT_EXPORT_CHANNELS = {
  EXPORT_SESSION: "chat:exportSession",
  PREVIEW_EXPORT: "chat:previewExport",
} as const;
`;
    const result = parseSharedChannels(input);
    expect(result).toBeInstanceOf(Set);
    expect(result.has("chat:exportSession")).toBe(true);
    expect(result.has("chat:previewExport")).toBe(true);
  });

  it("コメント行を除外する", () => {
    const input = `
export const CHANNELS = {
  // "commented:channel" should not be extracted
  REAL: "real:channel",
  /* "block:commented" */
  ANOTHER: "another:channel",
} as const;
`;
    const result = parseSharedChannels(input);
    expect(result.has("real:channel")).toBe(true);
    expect(result.has("another:channel")).toBe(true);
    expect(result.has("commented:channel")).toBe(false);
    expect(result.has("block:commented")).toBe(false);
  });

  it("複数 export ブロックに対応する", () => {
    const input = `
export const GROUP_A = {
  A1: "group-a:one",
} as const;

export const GROUP_B = {
  B1: "group-b:one",
  B2: "group-b:two",
} as const;
`;
    const result = parseSharedChannels(input);
    expect(result.has("group-a:one")).toBe(true);
    expect(result.has("group-b:one")).toBe(true);
    expect(result.has("group-b:two")).toBe(true);
  });

  it("camelCase チャネル名を抽出する (例: chat:exportSession)", () => {
    const input = `
export const CHANNELS = {
  EXPORT: "chat:exportSession",
  GET_DETAIL: "skill:get-detail",
} as const;
`;
    const result = parseSharedChannels(input);
    expect(result.has("chat:exportSession")).toBe(true);
    expect(result.has("skill:get-detail")).toBe(true);
  });

  it("コロンを含む複合チャネル名を抽出する (例: skill:permission:request)", () => {
    const input = `
export const CHANNELS = {
  PERMISSION_REQ: "skill:permission:request",
} as const;
`;
    const result = parseSharedChannels(input);
    expect(result.has("skill:permission:request")).toBe(true);
  });

  it("単独 export const 文字列リテラルを抽出する", () => {
    const input = `
export const SKILL_CREATOR_OUTPUT_READY = "skill-creator:output-ready" as const;
`;
    const result = parseSharedChannels(input);
    expect(result.has("skill-creator:output-ready")).toBe(true);
  });

  it("空コンテンツではからのSetを返す", () => {
    const result = parseSharedChannels("");
    expect(result.size).toBe(0);
  });
});

// ====== parseSharedGroupMap ======

describe("parseSharedGroupMap", () => {
  it("グループ定数マップを構築する", () => {
    const input = `
export const CHAT_CHANNELS = {
  EXPORT: "chat:export",
  IMPORT: "chat:import",
} as const;
`;
    const result = parseSharedGroupMap(input);
    expect(result.has("CHAT_CHANNELS")).toBe(true);
    const group = result.get("CHAT_CHANNELS")!;
    expect(group.get("EXPORT")).toBe("chat:export");
    expect(group.get("IMPORT")).toBe("chat:import");
  });

  it("単独 export const も取得する", () => {
    const input = `
export const MY_CHANNEL = "my:channel" as const;
`;
    const result = parseSharedGroupMap(input);
    expect(result.has("MY_CHANNEL")).toBe(true);
    const group = result.get("MY_CHANNEL")!;
    expect(group.get("MY_CHANNEL")).toBe("my:channel");
  });

  it("複数グループを取得する", () => {
    const input = `
export const GROUP_A = {
  A1: "a:one",
} as const;
export const GROUP_B = {
  B1: "b:one",
} as const;
`;
    const result = parseSharedGroupMap(input);
    expect(result.size).toBeGreaterThanOrEqual(2);
  });
});

// ====== parsePreloadWhitelist ======

describe("parsePreloadWhitelist", () => {
  it("IPC_CHANNELS と ALLOWED_INVOKE_CHANNELS から invoke チャネルを解決する", () => {
    const input = `
export const IPC_CHANNELS = {
  FILE_READ: "file:read",
  FILE_WRITE: "file:write",
  FILE_CHANGED: "file:changed",
} as const;

export const ALLOWED_INVOKE_CHANNELS: readonly string[] = [
  IPC_CHANNELS.FILE_READ,
  IPC_CHANNELS.FILE_WRITE,
];

export const ALLOWED_ON_CHANNELS: readonly string[] = [
  IPC_CHANNELS.FILE_CHANGED,
];
`;
    const result = parsePreloadWhitelist(input, new Set());
    expect(result.invoke.has("file:read")).toBe(true);
    expect(result.invoke.has("file:write")).toBe(true);
    expect(result.on.has("file:changed")).toBe(true);
  });

  it("defined プロパティに IPC_CHANNELS の全チャネルを含む", () => {
    const input = `
export const IPC_CHANNELS = {
  A: "a:one",
  B: "b:two",
} as const;

export const ALLOWED_INVOKE_CHANNELS: readonly string[] = [
  IPC_CHANNELS.A,
];

export const ALLOWED_ON_CHANNELS: readonly string[] = [];
`;
    const result = parsePreloadWhitelist(input, new Set());
    expect(result.defined.has("a:one")).toBe(true);
    expect(result.defined.has("b:two")).toBe(true);
  });

  it("空の場合、空の Set を返す", () => {
    const input = `
export const IPC_CHANNELS = {} as const;
export const ALLOWED_INVOKE_CHANNELS: readonly string[] = [];
export const ALLOWED_ON_CHANNELS: readonly string[] = [];
`;
    const result = parsePreloadWhitelist(input, new Set());
    expect(result.invoke.size).toBe(0);
    expect(result.on.size).toBe(0);
    expect(result.defined.size).toBe(0);
  });

  it("{ invoke, on, defined } の3プロパティを持つ", () => {
    const input = `
export const IPC_CHANNELS = { A: "a:one" } as const;
export const ALLOWED_INVOKE_CHANNELS: readonly string[] = [];
export const ALLOWED_ON_CHANNELS: readonly string[] = [];
`;
    const result = parsePreloadWhitelist(input, new Set());
    expect(result).toHaveProperty("invoke");
    expect(result).toHaveProperty("on");
    expect(result).toHaveProperty("defined");
    expect(result.invoke).toBeInstanceOf(Set);
    expect(result.on).toBeInstanceOf(Set);
    expect(result.defined).toBeInstanceOf(Set);
  });
});

// ====== parseMainHandlersFromContent ======

describe("parseMainHandlersFromContent", () => {
  it('ipcMain.handle("channel", ...) からチャネル名を抽出する', () => {
    const input = `
ipcMain.handle("file:read", async (event, args) => {
  return readFile(args);
});
`;
    const result = parseMainHandlersFromContent(input);
    expect(result.has("file:read")).toBe(true);
  });

  it('ipcMain.on("channel", ...) からチャネル名を抽出する', () => {
    const input = `
ipcMain.on("file:changed", (event, data) => {
  notifyRenderer(data);
});
`;
    const result = parseMainHandlersFromContent(input);
    expect(result.has("file:changed")).toBe(true);
  });

  it("IPC_CHANNELS.KEY 参照の場合、参照マーカーを返す", () => {
    const input = `
ipcMain.handle(IPC_CHANNELS.FILE_READ, async (event, args) => {
  return readFile(args);
});
`;
    const result = parseMainHandlersFromContent(input);
    expect(result.has("__IPC_CHANNELS_REF__:FILE_READ")).toBe(true);
  });

  it("コメント内のパターンを除外する", () => {
    const input = `
// ipcMain.handle("commented:channel", ...)
ipcMain.handle("real:channel", async () => {});
`;
    const result = parseMainHandlersFromContent(input);
    expect(result.has("real:channel")).toBe(true);
    expect(result.has("commented:channel")).toBe(false);
  });

  it("複数のハンドラを抽出する", () => {
    const input = `
ipcMain.handle("channel:one", async () => {});
ipcMain.handle("channel:two", async () => {});
ipcMain.on("channel:three", () => {});
`;
    const result = parseMainHandlersFromContent(input);
    expect(result.has("channel:one")).toBe(true);
    expect(result.has("channel:two")).toBe(true);
    expect(result.has("channel:three")).toBe(true);
  });

  it("ipcMain alias でもチャネル名を抽出する", () => {
    const input = `
const ipc = deps.ipcMain ?? ipcMain;
ipc.handle(IPC_CHANNELS.FILE_READ, async () => {});
ipc.on(IPC_CHANNELS.FILE_WRITE, () => {});
`;
    const result = parseMainHandlersFromContent(input);
    expect(result.has("__IPC_CHANNELS_REF__:FILE_READ")).toBe(true);
    expect(result.has("__IPC_CHANNELS_REF__:FILE_WRITE")).toBe(true);
  });

  it("ハンドラ配列の先頭要素を抽出する", () => {
    const input = `
const fallbackHandlers = [
  [IPC_CHANNELS.FILE_READ, async () => {}],
  ["chat:send", async () => {}],
];
`;
    const result = parseMainHandlersFromContent(input);
    expect(result.has("__IPC_CHANNELS_REF__:FILE_READ")).toBe(true);
    expect(result.has("chat:send")).toBe(true);
  });

  it("import された単独チャネル定数を externalMap で解決する", () => {
    const input = `
ipcMain.handle(SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED, async () => {});
`;
    const externalMap = new Map([
      [
        "SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED",
        "skill-creator:output-overwrite-approved",
      ],
    ]);
    const result = parseMainHandlersFromContent(input, externalMap);
    expect(result.has("skill-creator:output-overwrite-approved")).toBe(true);
  });

  it("空コンテンツでは空の Set を返す", () => {
    const result = parseMainHandlersFromContent("");
    expect(result.size).toBe(0);
  });
});

// ====== parseMainHandlers (ディレクトリ走査) ======

describe("parseMainHandlers", () => {
  it("一時ディレクトリ内の .ts ファイルからハンドラを抽出する", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ipc-test-main-"));
    try {
      fs.writeFileSync(
        path.join(tmpDir, "handler1.ts"),
        `ipcMain.handle("test:one", async () => {});`,
      );
      fs.writeFileSync(
        path.join(tmpDir, "handler2.ts"),
        `ipcMain.on("test:two", () => {});`,
      );
      const result = parseMainHandlers(tmpDir);
      expect(result.has("test:one")).toBe(true);
      expect(result.has("test:two")).toBe(true);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("ネストした .tsx ファイルと alias ハンドラを再帰的に抽出する", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ipc-test-main-"));
    try {
      const nestedDir = path.join(tmpDir, "nested");
      fs.mkdirSync(nestedDir, { recursive: true });
      fs.writeFileSync(
        path.join(nestedDir, "handler.tsx"),
        `
const main = deps?.ipcMain ?? ipcMain;
main.handle("test:nested", async () => {});
`,
      );
      const result = parseMainHandlers(tmpDir);
      expect(result.has("test:nested")).toBe(true);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("テストファイル (.test.ts) を除外する", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ipc-test-main-"));
    try {
      fs.writeFileSync(
        path.join(tmpDir, "handler.ts"),
        `ipcMain.handle("real:handler", async () => {});`,
      );
      fs.writeFileSync(
        path.join(tmpDir, "handler.test.ts"),
        `ipcMain.handle("test:handler", async () => {});`,
      );
      const result = parseMainHandlers(tmpDir);
      expect(result.has("real:handler")).toBe(true);
      expect(result.has("test:handler")).toBe(false);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("存在しないディレクトリでは空の Set を返す", () => {
    const result = parseMainHandlers("/nonexistent/path");
    expect(result.size).toBe(0);
  });

  it("parseMainHandlers に渡した externalMap で単独定数参照を解決する", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ipc-test-main-"));
    try {
      fs.writeFileSync(
        path.join(tmpDir, "handler.ts"),
        `ipcMain.handle(SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED, async () => {});`,
      );
      const externalMap = new Map([
        [
          "SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED",
          "skill-creator:output-overwrite-approved",
        ],
      ]);
      const result = parseMainHandlers(tmpDir, externalMap);
      expect(result.has("skill-creator:output-overwrite-approved")).toBe(true);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});

// ====== parseRendererUsageFromContent ======

describe("parseRendererUsageFromContent", () => {
  it('safeInvoke("channel", ...) からチャネル名を抽出する', () => {
    const input = `safeInvoke("file:read", request)`;
    const result = parseRendererUsageFromContent(input);
    expect(result.has("file:read")).toBe(true);
  });

  it('safeOn("channel", ...) からチャネル名を抽出する', () => {
    const input = `safeOn("file:changed", callback)`;
    const result = parseRendererUsageFromContent(input);
    expect(result.has("file:changed")).toBe(true);
  });

  it("safeInvokeUnwrap からチャネル名を抽出する", () => {
    const input = `safeInvokeUnwrap<FileResult>("file:read", request)`;
    const result = parseRendererUsageFromContent(input);
    expect(result.has("file:read")).toBe(true);
  });

  it("ジェネリック型パラメータ付きの safeInvoke を処理する", () => {
    const input = `safeInvoke<FileResult>("file:read", request)`;
    const result = parseRendererUsageFromContent(input);
    expect(result.has("file:read")).toBe(true);
  });

  it("ジェネリック型パラメータ付きの safeOn を処理する", () => {
    const input = `safeOn<FileChangedEvent>("file:changed", callback)`;
    const result = parseRendererUsageFromContent(input);
    expect(result.has("file:changed")).toBe(true);
  });

  it("IPC_CHANNELS.KEY 参照をチャネルマップで解決する", () => {
    const channelMap = new Map([["FILE_READ", "file:read"]]);
    const input = `safeInvoke(IPC_CHANNELS.FILE_READ, request)`;
    const result = parseRendererUsageFromContent(input, channelMap);
    expect(result.has("file:read")).toBe(true);
  });

  it("チャネルマップがない場合、参照マーカーを返す", () => {
    const input = `safeInvoke(IPC_CHANNELS.FILE_READ, request)`;
    const result = parseRendererUsageFromContent(input);
    expect(result.has("__IPC_CHANNELS_REF__:FILE_READ")).toBe(true);
  });

  it("invokeIpc と electronAPI.invoke を抽出する", () => {
    const input = `
const IPC_CHANNELS = {
  PROFILE_EXPORT: "profile:export",
} as const;

const exportResult = await invokeIpc(IPC_CHANNELS.PROFILE_EXPORT);
const disclosure = await electronAPI.invoke("execution:get-disclosure-info");
`;
    const result = parseRendererUsageFromContent(input);
    expect(result.has("profile:export")).toBe(true);
    expect(result.has("execution:get-disclosure-info")).toBe(true);
  });

  it("コメント内の safeInvoke を除外する", () => {
    const input = `
// safeInvoke("commented:channel", request)
safeInvoke("real:channel", request)
`;
    const result = parseRendererUsageFromContent(input);
    expect(result.has("real:channel")).toBe(true);
    expect(result.has("commented:channel")).toBe(false);
  });

  it("空コンテンツでは空の Set を返す", () => {
    const result = parseRendererUsageFromContent("");
    expect(result.size).toBe(0);
  });
});

// ====== parseRendererUsage (ディレクトリ走査) ======

describe("parseRendererUsage", () => {
  it("一時ディレクトリ内の .ts ファイルから safeInvoke/safeOn を抽出する", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ipc-test-renderer-"));
    try {
      // channels.ts に IPC_CHANNELS マップを定義
      fs.writeFileSync(
        path.join(tmpDir, "channels.ts"),
        `export const IPC_CHANNELS = {
  TEST_ONE: "test:one",
} as const;
export const ALLOWED_INVOKE_CHANNELS: readonly string[] = [];
export const ALLOWED_ON_CHANNELS: readonly string[] = [];`,
      );
      fs.writeFileSync(
        path.join(tmpDir, "api.ts"),
        `safeInvoke(IPC_CHANNELS.TEST_ONE, request);
safeOn("test:two", callback);`,
      );
      const result = parseRendererUsage(tmpDir);
      expect(result.has("test:one")).toBe(true);
      expect(result.has("test:two")).toBe(true);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("ネストした .tsx ファイルの direct invoke を再帰的に抽出する", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ipc-test-renderer-"));
    try {
      fs.writeFileSync(
        path.join(tmpDir, "channels.ts"),
        `export const IPC_CHANNELS = {
  PROFILE_EXPORT: "profile:export",
} as const;
export const ALLOWED_INVOKE_CHANNELS: readonly string[] = [
  IPC_CHANNELS.PROFILE_EXPORT,
];
export const ALLOWED_ON_CHANNELS: readonly string[] = [];`,
      );
      const nestedDir = path.join(tmpDir, "views");
      fs.mkdirSync(nestedDir, { recursive: true });
      fs.writeFileSync(
        path.join(nestedDir, "profile.tsx"),
        `
const result = await invokeIpc(IPC_CHANNELS.PROFILE_EXPORT);
const disclosure = await electronAPI.invoke("execution:get-disclosure-info");
`,
      );
      const result = parseRendererUsage(tmpDir);
      expect(result.has("profile:export")).toBe(true);
      expect(result.has("execution:get-disclosure-info")).toBe(true);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("channels.ts, types.ts, types.d.ts を走査対象から除外する", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ipc-test-renderer-"));
    try {
      fs.writeFileSync(
        path.join(tmpDir, "channels.ts"),
        `export const IPC_CHANNELS = { A: "a:one" } as const;
export const ALLOWED_INVOKE_CHANNELS: readonly string[] = [];
export const ALLOWED_ON_CHANNELS: readonly string[] = [];
safeInvoke("channels:should-skip", request);`,
      );
      fs.writeFileSync(
        path.join(tmpDir, "types.ts"),
        `safeInvoke("types:should-skip", request);`,
      );
      fs.writeFileSync(
        path.join(tmpDir, "index.ts"),
        `safeInvoke("real:channel", request);`,
      );
      const result = parseRendererUsage(tmpDir);
      expect(result.has("real:channel")).toBe(true);
      expect(result.has("channels:should-skip")).toBe(false);
      expect(result.has("types:should-skip")).toBe(false);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("存在しないディレクトリでは空の Set を返す", () => {
    const result = parseRendererUsage("/nonexistent/path");
    expect(result.size).toBe(0);
  });
});

// ====== buildPreloadChannelMap ======

describe("buildPreloadChannelMap", () => {
  it("IPC_CHANNELS から キー→値 マップを構築する", () => {
    const input = `
export const IPC_CHANNELS = {
  FILE_READ: "file:read",
  FILE_WRITE: "file:write",
} as const;
`;
    const result = buildPreloadChannelMap(input);
    expect(result.get("FILE_READ")).toBe("file:read");
    expect(result.get("FILE_WRITE")).toBe("file:write");
  });

  it("空の IPC_CHANNELS では空マップを返す", () => {
    const input = `export const IPC_CHANNELS = {} as const;`;
    const result = buildPreloadChannelMap(input);
    expect(result.size).toBe(0);
  });

  it("spread パターンを sharedGroupMap で解決する", () => {
    const input = `
import { CHAT_CHANNELS } from "@shared/ipc/channels";
export const IPC_CHANNELS = {
  FILE_READ: "file:read",
  ...CHAT_CHANNELS,
} as const;
`;
    const sharedGroupMap = new Map([
      [
        "CHAT_CHANNELS",
        new Map([
          ["CHAT_SEND", "chat:send"],
          ["CHAT_EXPORT", "chat:export"],
        ]),
      ],
    ]);
    const result = buildPreloadChannelMap(input, sharedGroupMap);
    expect(result.get("FILE_READ")).toBe("file:read");
    expect(result.get("CHAT_SEND")).toBe("chat:send");
    expect(result.get("CHAT_EXPORT")).toBe("chat:export");
  });

  it("GROUP.MEMBER 参照を sharedGroupMap で解決する", () => {
    const input = `
export const IPC_CHANNELS = {
  MY_CHANNEL: APPROVAL_CHANNELS.APPROVAL_RESPOND,
} as const;
`;
    const sharedGroupMap = new Map([
      [
        "APPROVAL_CHANNELS",
        new Map([["APPROVAL_RESPOND", "approval:respond"]]),
      ],
    ]);
    const result = buildPreloadChannelMap(input, sharedGroupMap);
    expect(result.get("MY_CHANNEL")).toBe("approval:respond");
  });

  it("standalone 参照を shared フラットマップで解決する", () => {
    const input = `
export const IPC_CHANNELS = {
  FILE_READ: "file:read",
  MY_CONST,
} as const;
`;
    const sharedGroupMap = new Map([
      ["MY_GROUP", new Map([["MY_CONST", "my:channel"]])],
    ]);
    const result = buildPreloadChannelMap(input, sharedGroupMap);
    expect(result.get("FILE_READ")).toBe("file:read");
    expect(result.get("MY_CONST")).toBe("my:channel");
  });
});

// ====== resolveMainChannelRefs ======

describe("resolveMainChannelRefs", () => {
  const { resolveMainChannelRefs } = require("../../verify-ipc-4layer.cjs");

  it("直接チャネル名はそのまま保持する", () => {
    const raw = new Set(["file:read", "file:write"]);
    const result = resolveMainChannelRefs(raw, new Map(), new Map());
    expect(result.has("file:read")).toBe(true);
    expect(result.has("file:write")).toBe(true);
  });

  it("__IPC_CHANNELS_REF__ を preloadChannelMap で解決する", () => {
    const raw = new Set(["__IPC_CHANNELS_REF__:FILE_READ"]);
    const preloadMap = new Map([["FILE_READ", "file:read"]]);
    const result = resolveMainChannelRefs(raw, new Map(), preloadMap);
    expect(result.has("file:read")).toBe(true);
    expect(result.size).toBe(1);
  });

  it("__IPC_CHANNELS_REF__ が preloadMap になければ shared フラットマップで解決する", () => {
    const raw = new Set(["__IPC_CHANNELS_REF__:CHAT_SEND"]);
    const sharedGroupMap = new Map([
      ["CHAT_CHANNELS", new Map([["CHAT_SEND", "chat:send"]])],
    ]);
    const result = resolveMainChannelRefs(raw, sharedGroupMap, new Map());
    expect(result.has("chat:send")).toBe(true);
  });

  it("__IPC_CHANNELS_REF__ がどちらのマップでも解決できない場合はスキップされる", () => {
    const raw = new Set(["__IPC_CHANNELS_REF__:UNKNOWN_KEY"]);
    const result = resolveMainChannelRefs(raw, new Map(), new Map());
    expect(result.size).toBe(0);
  });

  it("__CHANNELS_REF__ を sharedGroupMap で解決する", () => {
    const raw = new Set(["__CHANNELS_REF__:APPROVAL_CHANNELS.RESPOND"]);
    const sharedGroupMap = new Map([
      ["APPROVAL_CHANNELS", new Map([["RESPOND", "approval:respond"]])],
    ]);
    const result = resolveMainChannelRefs(raw, sharedGroupMap, new Map());
    expect(result.has("approval:respond")).toBe(true);
  });

  it("__CHANNELS_REF__ が解決できない場合はスキップされる", () => {
    const raw = new Set(["__CHANNELS_REF__:UNKNOWN.KEY"]);
    const result = resolveMainChannelRefs(raw, new Map(), new Map());
    expect(result.size).toBe(0);
  });

  it("混在する参照タイプを同時に解決する", () => {
    const raw = new Set([
      "direct:channel",
      "__IPC_CHANNELS_REF__:FILE_READ",
      "__CHANNELS_REF__:GROUP.KEY",
      "__IPC_CHANNELS_REF__:UNRESOLVABLE",
    ]);
    const sharedGroupMap = new Map([
      ["GROUP", new Map([["KEY", "group:value"]])],
    ]);
    const preloadMap = new Map([["FILE_READ", "file:read"]]);
    const result = resolveMainChannelRefs(raw, sharedGroupMap, preloadMap);
    expect(result.has("direct:channel")).toBe(true);
    expect(result.has("file:read")).toBe(true);
    expect(result.has("group:value")).toBe(true);
    expect(result.size).toBe(3); // UNRESOLVABLE はスキップ
  });
});

// ====== エッジケーステスト ======

describe("エッジケース", () => {
  it("stripComments: コメントのみのファイルを処理できる", () => {
    const input = `// only comment line
/* block comment only */`;
    const result = stripComments(input);
    expect(result.trim()).toBe("");
  });

  it("stripComments: 閉じていないブロックコメントを安全に処理する", () => {
    const input = `const a = 1; /* unclosed block comment`;
    // 無限ループに陥らないことを確認
    const result = stripComments(input);
    expect(typeof result).toBe("string");
  });

  it("parseSharedChannels: 不正なチャネル名パターンを除外する", () => {
    const input = `
export const CHANNELS = {
  VALID: "domain:operation",
  NUMBERS: "123:456",
} as const;
`;
    const result = parseSharedChannels(input);
    expect(result.has("domain:operation")).toBe(true);
    // 数字始まりは domain:operation パターンに合致しない
    expect(result.has("123:456")).toBe(false);
  });

  it("parseSharedChannels: アンダースコアを含むチャネル名を処理する", () => {
    const input = `
export const CHANNELS = {
  WITH_UNDERSCORE: "domain:op_name",
} as const;
`;
    const result = parseSharedChannels(input);
    expect(result.has("domain:op_name")).toBe(true);
  });

  it("parseMainHandlersFromContent: registerXxxHandler パターンを抽出する", () => {
    const input = `
registerFileHandler(IPC_CHANNELS.FILE_READ, async () => {});
registerHandlers(IPC_CHANNELS.BATCH, async () => {});
`;
    const result = parseMainHandlersFromContent(input);
    expect(result.has("__IPC_CHANNELS_REF__:FILE_READ")).toBe(true);
    expect(result.has("__IPC_CHANNELS_REF__:BATCH")).toBe(true);
  });

  it("parseMainHandlersFromContent: createIpcHandler パターンを抽出する", () => {
    const input = `
createIpcHandler<FileResult>(IPC_CHANNELS.FILE_READ, async () => {});
createIpcHandler(IPC_CHANNELS.FILE_WRITE, async () => {});
`;
    const result = parseMainHandlersFromContent(input);
    expect(result.has("__IPC_CHANNELS_REF__:FILE_READ")).toBe(true);
    expect(result.has("__IPC_CHANNELS_REF__:FILE_WRITE")).toBe(true);
  });

  it("parseMainHandlersFromContent: ローカル定数で定義されたチャネルを解決する", () => {
    const input = `
const CHANNELS = {
  FILE_READ: "file:read",
  FILE_WRITE: "file:write",
};
ipcMain.handle(CHANNELS.FILE_READ, async () => {});
ipcMain.handle(CHANNELS.FILE_WRITE, async () => {});
`;
    const result = parseMainHandlersFromContent(input);
    expect(result.has("file:read")).toBe(true);
    expect(result.has("file:write")).toBe(true);
  });

  it("parseMainHandlersFromContent: main.handle パターンを抽出する", () => {
    const input = `
main.handle(IPC_CHANNELS.FILE_READ, async () => {});
main.on(IPC_CHANNELS.NOTIFY, () => {});
`;
    const result = parseMainHandlersFromContent(input);
    expect(result.has("__IPC_CHANNELS_REF__:FILE_READ")).toBe(true);
    expect(result.has("__IPC_CHANNELS_REF__:NOTIFY")).toBe(true);
  });

  it("parsePreloadWhitelist: spread パターンを sharedGroupMap で解決する", () => {
    const input = `
export const IPC_CHANNELS = {
  ...FILE_CHANNELS,
  EXTRA: "extra:channel",
} as const;
export const ALLOWED_INVOKE_CHANNELS: readonly string[] = [
  IPC_CHANNELS.EXTRA,
];
export const ALLOWED_ON_CHANNELS: readonly string[] = [];
`;
    const sharedGroupMap = new Map([
      [
        "FILE_CHANNELS",
        new Map([
          ["FILE_READ", "file:read"],
          ["FILE_WRITE", "file:write"],
        ]),
      ],
    ]);
    const result = parsePreloadWhitelist(input, new Set(), sharedGroupMap);
    expect(result.defined.has("file:read")).toBe(true);
    expect(result.defined.has("file:write")).toBe(true);
    expect(result.defined.has("extra:channel")).toBe(true);
    expect(result.invoke.has("extra:channel")).toBe(true);
  });

  it("parsePreloadWhitelist: GROUP.MEMBER 参照を解決する", () => {
    const input = `
export const IPC_CHANNELS = {
  MY_APPROVAL: APPROVAL_CHANNELS.RESPOND,
} as const;
export const ALLOWED_INVOKE_CHANNELS: readonly string[] = [
  IPC_CHANNELS.MY_APPROVAL,
];
export const ALLOWED_ON_CHANNELS: readonly string[] = [];
`;
    const sharedGroupMap = new Map([
      ["APPROVAL_CHANNELS", new Map([["RESPOND", "approval:respond"]])],
    ]);
    const result = parsePreloadWhitelist(input, new Set(), sharedGroupMap);
    expect(result.defined.has("approval:respond")).toBe(true);
    expect(result.invoke.has("approval:respond")).toBe(true);
  });

  it("parseMainHandlers: .spec.ts ファイルを除外する", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ipc-test-spec-"));
    try {
      fs.writeFileSync(
        path.join(tmpDir, "handler.ts"),
        `ipcMain.handle("real:handler", async () => {});`,
      );
      fs.writeFileSync(
        path.join(tmpDir, "handler.spec.ts"),
        `ipcMain.handle("spec:handler", async () => {});`,
      );
      const result = parseMainHandlers(tmpDir);
      expect(result.has("real:handler")).toBe(true);
      expect(result.has("spec:handler")).toBe(false);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("parseMainHandlers: .d.ts ファイルを除外する", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ipc-test-dts-"));
    try {
      fs.writeFileSync(
        path.join(tmpDir, "handler.ts"),
        `ipcMain.handle("real:handler", async () => {});`,
      );
      fs.writeFileSync(
        path.join(tmpDir, "handler.d.ts"),
        `ipcMain.handle("dts:handler", async () => {});`,
      );
      const result = parseMainHandlers(tmpDir);
      expect(result.has("real:handler")).toBe(true);
      expect(result.has("dts:handler")).toBe(false);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("parseMainHandlers: __tests__ / __mocks__ ディレクトリを除外する", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ipc-test-skip-"));
    try {
      fs.writeFileSync(
        path.join(tmpDir, "handler.ts"),
        `ipcMain.handle("real:handler", async () => {});`,
      );
      fs.mkdirSync(path.join(tmpDir, "__tests__"));
      fs.writeFileSync(
        path.join(tmpDir, "__tests__", "test-file.ts"),
        `ipcMain.handle("test:handler", async () => {});`,
      );
      fs.mkdirSync(path.join(tmpDir, "__mocks__"));
      fs.writeFileSync(
        path.join(tmpDir, "__mocks__", "mock-file.ts"),
        `ipcMain.handle("mock:handler", async () => {});`,
      );
      const result = parseMainHandlers(tmpDir);
      expect(result.has("real:handler")).toBe(true);
      expect(result.has("test:handler")).toBe(false);
      expect(result.has("mock:handler")).toBe(false);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("parseMainHandlers: サブディレクトリ内のファイルも再帰的に走査する", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ipc-test-recurse-"));
    try {
      fs.writeFileSync(
        path.join(tmpDir, "root.ts"),
        `ipcMain.handle("root:handler", async () => {});`,
      );
      fs.mkdirSync(path.join(tmpDir, "sub"));
      fs.writeFileSync(
        path.join(tmpDir, "sub", "nested.ts"),
        `ipcMain.handle("nested:handler", async () => {});`,
      );
      const result = parseMainHandlers(tmpDir);
      expect(result.has("root:handler")).toBe(true);
      expect(result.has("nested:handler")).toBe(true);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("parseRendererUsageFromContent: 複数の型パラメータを持つ safeInvoke を処理する", () => {
    const input = `safeInvoke<Req, Res>("multi:generic", request)`;
    const result = parseRendererUsageFromContent(input);
    expect(result.has("multi:generic")).toBe(true);
  });

  it("parseSharedGroupMap: コメント内のグループを無視する", () => {
    const input = `
// export const FAKE_GROUP = { FAKE: "fake:channel" } as const;
export const REAL_GROUP = {
  REAL: "real:channel",
} as const;
`;
    const result = parseSharedGroupMap(input);
    expect(result.has("REAL_GROUP")).toBe(true);
    expect(result.has("FAKE_GROUP")).toBe(false);
  });

  it("parseSharedGroupMap: 空のグループを含まない", () => {
    const input = `
export const EMPTY_GROUP = {} as const;
export const NON_EMPTY = {
  KEY: "non-empty:value",
} as const;
`;
    const result = parseSharedGroupMap(input);
    // 空グループはキーマップが空なので含まれない
    expect(result.has("EMPTY_GROUP")).toBe(false);
    expect(result.has("NON_EMPTY")).toBe(true);
  });
});

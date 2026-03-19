// @vitest-environment node

import { describe, it, expect, beforeEach } from "vitest";
import {
  extractMainHandlers,
  extractPreloadEntries,
  resolveChannelMap,
  matchAndValidate,
  generateReport,
  type HandlerEntry,
  type PreloadEntry,
  type DriftReport,
} from "../check-ipc-contracts";

// ============================================================================
// T-4-1: extractMainHandlers
// ============================================================================

describe("extractMainHandlers", () => {
  it("T-4-1a: ipcMain.handle行からチャンネル名を正しく抽出する", () => {
    const source = `ipcMain.handle('skill:import', async (event, args) => {`;
    const result = extractMainHandlers(source, "handlers/skill.ts");

    expect(result).toHaveLength(1);
    expect(result[0].channel).toBe("skill:import");
    expect(result[0].filePath).toBe("handlers/skill.ts");
    expect(result[0].line).toBeGreaterThan(0);
  });

  it("T-4-1b: IPC_CHANNELS定数参照からチャンネル名を正しく抽出する", () => {
    const source = `ipcMain.handle(IPC_CHANNELS.SKILL_IMPORT, async (e, a) => {`;
    const result = extractMainHandlers(source, "handlers/skill.ts");

    expect(result).toHaveLength(1);
    expect(result[0].channel).toBe("IPC_CHANNELS.SKILL_IMPORT");
  });

  it("T-4-1c: ipcMain.on行からチャンネル名を正しく抽出する", () => {
    const source = `ipcMain.on('system:theme-changed', (event, data) => {`;
    const result = extractMainHandlers(source, "handlers/theme.ts");

    expect(result).toHaveLength(1);
    expect(result[0].channel).toBe("system:theme-changed");
  });

  it("T-4-1d: 複数ハンドラを含むソースから全件抽出する", () => {
    const source = [
      `ipcMain.handle('skill:import', async (event, args) => {`,
      `  return { success: true };`,
      `});`,
      `ipcMain.handle(IPC_CHANNELS.SKILL_REMOVE, async (event, skillName) => {`,
      `  return { success: true };`,
      `});`,
      `ipcMain.on('system:theme-changed', (event, data) => {`,
      `  console.log(data);`,
      `});`,
    ].join("\n");
    const result = extractMainHandlers(source, "handlers/index.ts");

    expect(result).toHaveLength(3);
    expect(result.map((h) => h.channel)).toContain("skill:import");
    expect(result.map((h) => h.channel)).toContain("IPC_CHANNELS.SKILL_REMOVE");
    expect(result.map((h) => h.channel)).toContain("system:theme-changed");
  });

  it("T-4-1e: ハンドラ0件のファイルは空配列を返す", () => {
    const source = `export function doNothing() { console.log("hello"); }`;
    const result = extractMainHandlers(source, "handlers/empty.ts");

    expect(result).toHaveLength(0);
  });
});

// ============================================================================
// T-4-2: extractPreloadEntries
// ============================================================================

describe("extractPreloadEntries", () => {
  it("T-4-2a: safeInvoke行からチャンネル名とargPatternをprimitive として抽出する", () => {
    const source = `safeInvoke(IPC_CHANNELS.SKILL_IMPORT, skillName)`;
    const result = extractPreloadEntries(source, "preload/skill-api.ts");

    expect(result).toHaveLength(1);
    expect(result[0].channel).toBe("IPC_CHANNELS.SKILL_IMPORT");
    expect(result[0].argPattern).toBe("primitive");
    expect(result[0].filePath).toBe("preload/skill-api.ts");
  });

  it("T-4-2b: safeOn行からチャンネル名を正しく抽出する", () => {
    const source = `safeOn(IPC_CHANNELS.SYSTEM_THEME, callback)`;
    const result = extractPreloadEntries(source, "preload/theme-api.ts");

    expect(result).toHaveLength(1);
    expect(result[0].channel).toBe("IPC_CHANNELS.SYSTEM_THEME");
  });

  it("T-4-2c: 文字列リテラルのチャンネル名を正しく抽出する", () => {
    const source = `safeInvoke('skill:import', data)`;
    const result = extractPreloadEntries(source, "preload/skill-api.ts");

    expect(result).toHaveLength(1);
    expect(result[0].channel).toBe("skill:import");
  });

  it("T-4-2d: safeInvokeにオブジェクト引数が渡される場合argPatternがobjectになる", () => {
    const source = `safeInvoke(IPC_CHANNELS.SKILL_EXPORT, { skillName, destination })`;
    const result = extractPreloadEntries(source, "preload/skill-api.ts");

    expect(result).toHaveLength(1);
    expect(result[0].argPattern).toBe("object");
  });

  it("T-4-2e: Preloadエントリ0件のファイルは空配列を返す", () => {
    const source = `export const x = 1;`;
    const result = extractPreloadEntries(source, "preload/empty.ts");

    expect(result).toHaveLength(0);
  });
});

// ============================================================================
// T-4-3: R-01 チャンネル孤児検出
// ============================================================================

describe("R-01: チャンネル孤児検出 (matchAndValidate)", () => {
  let baseHandler: HandlerEntry;
  let basePreload: PreloadEntry;

  beforeEach(() => {
    baseHandler = {
      channel: "skill:import",
      argPattern: "primitive",
      filePath: "handlers/skill.ts",
      line: 10,
      rawSignature:
        "ipcMain.handle('skill:import', async (event, skillName) => {",
    };
    basePreload = {
      channel: "skill:import",
      argPattern: "primitive",
      filePath: "preload/skill-api.ts",
      line: 5,
      rawArgs: "skillName",
    };
  });

  it("T-4-3a: Mainにのみ存在するチャンネルを孤児(main-only)として検出する", () => {
    const handlers: HandlerEntry[] = [
      { ...baseHandler, channel: "skill:import" },
      { ...baseHandler, channel: "skill:remove" },
    ];
    const preloads: PreloadEntry[] = [
      { ...basePreload, channel: "skill:import" },
    ];

    const report = matchAndValidate(handlers, preloads);

    expect(report.orphans).toHaveLength(1);
    expect(report.orphans[0].channel).toBe("skill:remove");
    expect(report.orphans[0].side).toBe("main-only");
  });

  it("T-4-3b: Preloadにのみ存在するチャンネルを孤児(preload-only)として検出する", () => {
    const handlers: HandlerEntry[] = [
      { ...baseHandler, channel: "skill:import" },
    ];
    const preloads: PreloadEntry[] = [
      { ...basePreload, channel: "skill:import" },
      { ...basePreload, channel: "skill:list" },
    ];

    const report = matchAndValidate(handlers, preloads);

    expect(report.orphans).toHaveLength(1);
    expect(report.orphans[0].channel).toBe("skill:list");
    expect(report.orphans[0].side).toBe("preload-only");
  });

  it("T-4-3c: 全チャンネルが双方に存在する場合は孤児なし", () => {
    const handlers: HandlerEntry[] = [
      { ...baseHandler, channel: "skill:import" },
    ];
    const preloads: PreloadEntry[] = [
      { ...basePreload, channel: "skill:import" },
    ];

    const report = matchAndValidate(handlers, preloads);

    expect(report.orphans).toHaveLength(0);
  });

  it("T-4-3d: 両側0件の場合は孤児なし", () => {
    const report = matchAndValidate([], []);

    expect(report.orphans).toHaveLength(0);
  });
});

// ============================================================================
// T-4-4: R-02 引数形式不一致検出
// ============================================================================

describe("R-02: 引数形式不一致検出 (matchAndValidate)", () => {
  let baseHandler: HandlerEntry;
  let basePreload: PreloadEntry;

  beforeEach(() => {
    baseHandler = {
      channel: "skill:import",
      argPattern: "object",
      filePath: "handlers/skill.ts",
      line: 10,
      rawSignature: "ipcMain.handle('skill:import', async (event, args) => {",
    };
    basePreload = {
      channel: "skill:import",
      argPattern: "primitive",
      filePath: "preload/skill-api.ts",
      line: 5,
      rawArgs: "skillName",
    };
  });

  it("T-4-4a: P44パターン: Main=object, Preload=primitiveの不一致をR-02 errorとして検出する", () => {
    const handlers: HandlerEntry[] = [{ ...baseHandler, argPattern: "object" }];
    const preloads: PreloadEntry[] = [
      { ...basePreload, argPattern: "primitive" },
    ];

    const report = matchAndValidate(handlers, preloads);

    const r02Drifts = report.drifts.filter((d) => d.rule === "R-02");
    expect(r02Drifts).toHaveLength(1);
    expect(r02Drifts[0].channel).toBe("skill:import");
    expect(r02Drifts[0].severity).toBe("error");
  });

  it("T-4-4b: 引数形式が一致する場合はR-02ドリフトなし", () => {
    const handlers: HandlerEntry[] = [
      { ...baseHandler, argPattern: "primitive" },
    ];
    const preloads: PreloadEntry[] = [
      { ...basePreload, argPattern: "primitive" },
    ];

    const report = matchAndValidate(handlers, preloads);

    const r02Drifts = report.drifts.filter((d) => d.rule === "R-02");
    expect(r02Drifts).toHaveLength(0);
  });

  it("T-4-4c: unknown同士は不一致としない", () => {
    const handlers: HandlerEntry[] = [
      { ...baseHandler, argPattern: "unknown" },
    ];
    const preloads: PreloadEntry[] = [
      { ...basePreload, argPattern: "unknown" },
    ];

    const report = matchAndValidate(handlers, preloads);

    const r02Drifts = report.drifts.filter((d) => d.rule === "R-02");
    expect(r02Drifts).toHaveLength(0);
  });
});

// ============================================================================
// T-4-5: R-03 ハードコード文字列チャンネル検出
// ============================================================================

describe("R-03: ハードコード文字列チャンネル検出 (matchAndValidate)", () => {
  it("T-4-5a: 文字列リテラルのチャンネル名を持つエントリをR-03 warningとして検出する", () => {
    const handlers: HandlerEntry[] = [
      {
        channel: "skill:import",
        argPattern: "primitive",
        filePath: "handlers/skill.ts",
        line: 10,
        rawSignature: "ipcMain.handle('skill:import', async (event, name) => {",
      },
    ];
    const preloads: PreloadEntry[] = [
      {
        channel: "skill:import",
        argPattern: "primitive",
        filePath: "preload/skill-api.ts",
        line: 5,
        rawArgs: "name",
      },
    ];

    const report = matchAndValidate(handlers, preloads);

    const r03Drifts = report.drifts.filter((d) => d.rule === "R-03");
    expect(r03Drifts.length).toBeGreaterThan(0);
    expect(r03Drifts[0].severity).toBe("warning");
  });

  it("T-4-5b: IPC_CHANNELS定数のみ使用している場合R-03なし", () => {
    const handlers: HandlerEntry[] = [
      {
        channel: "IPC_CHANNELS.SKILL_IMPORT",
        argPattern: "primitive",
        filePath: "handlers/skill.ts",
        line: 10,
        rawSignature:
          "ipcMain.handle(IPC_CHANNELS.SKILL_IMPORT, async (event, name) => {",
      },
    ];
    const preloads: PreloadEntry[] = [
      {
        channel: "IPC_CHANNELS.SKILL_IMPORT",
        argPattern: "primitive",
        filePath: "preload/skill-api.ts",
        line: 5,
        rawArgs: "name",
      },
    ];

    const report = matchAndValidate(handlers, preloads);

    const r03Drifts = report.drifts.filter((d) => d.rule === "R-03");
    expect(r03Drifts).toHaveLength(0);
  });
});

// ============================================================================
// T-4-6: generateReport
// ============================================================================

describe("generateReport", () => {
  let reportWithDrifts: DriftReport;
  let reportNoDrifts: DriftReport;

  beforeEach(() => {
    reportWithDrifts = {
      timestamp: "2026-03-18T10:00:00.000Z",
      summary: {
        totalHandlers: 2,
        totalPreloads: 2,
        drifts: 1,
        orphans: 0,
      },
      drifts: [
        {
          channel: "skill:import",
          rule: "R-02",
          severity: "error",
          message: "引数形式不一致: Main=object, Preload=primitive",
          mainSide: { file: "handlers/skill.ts", line: 10, detail: "object" },
          preloadSide: {
            file: "preload/skill-api.ts",
            line: 5,
            detail: "primitive",
          },
        },
      ],
      orphans: [],
      passed: false,
    };

    reportNoDrifts = {
      timestamp: "2026-03-18T10:00:00.000Z",
      summary: {
        totalHandlers: 1,
        totalPreloads: 1,
        drifts: 0,
        orphans: 0,
      },
      drifts: [],
      orphans: [],
      passed: true,
    };
  });

  it("T-4-6a: Markdown形式でドリフトレポートを出力する", () => {
    const output = generateReport(reportWithDrifts, "markdown");

    expect(output).toContain("skill:import");
    expect(output).toContain("R-02");
  });

  it("T-4-6b: JSON形式で有効なJSON出力を返す", () => {
    const output = generateReport(reportWithDrifts, "json");

    expect(() => JSON.parse(output)).not.toThrow();
    const parsed = JSON.parse(output);
    expect(parsed.drifts).toHaveLength(1);
    expect(parsed.summary.drifts).toBe(1);
  });

  it("T-4-6c: ドリフトなしの場合 ALL CHECKS PASSED を含む", () => {
    const output = generateReport(reportNoDrifts, "markdown");

    expect(output).toContain("ALL CHECKS PASSED");
  });
});

// ============================================================================
// T-4-7: resolveChannelMap
// ============================================================================

describe("resolveChannelMap", () => {
  it("T-4-7a: channels.tsコンテンツからIPC_CHANNELS定数のマッピングを構築する", () => {
    const channelsContent = [
      `export const IPC_CHANNELS = {`,
      `  SKILL_IMPORT: 'skill:import',`,
      `  SKILL_REMOVE: 'skill:remove',`,
      `  SYSTEM_THEME: 'system:theme-changed',`,
      `} as const;`,
    ].join("\n");

    const map = resolveChannelMap(channelsContent);

    expect(map.get("SKILL_IMPORT")).toBe("skill:import");
    expect(map.get("SKILL_REMOVE")).toBe("skill:remove");
    expect(map.get("SYSTEM_THEME")).toBe("system:theme-changed");
  });

  it("T-4-7b: 空コンテンツは空のMapを返す", () => {
    const map = resolveChannelMap("");

    expect(map.size).toBe(0);
  });
});

// ============================================================================
// T-4-8: matchAndValidate with channelMap
// ============================================================================

describe("matchAndValidate with channelMap", () => {
  let channelMap: Map<string, string>;

  beforeEach(() => {
    channelMap = new Map([
      ["SKILL_IMPORT", "skill:import"],
      ["SKILL_REMOVE", "skill:remove"],
    ]);
  });

  it("T-4-8a: channelMap使用時IPC_CHANNELS.XXXが実際のチャンネル名に解決される", () => {
    const handlers: HandlerEntry[] = [
      {
        channel: "IPC_CHANNELS.SKILL_IMPORT",
        argPattern: "primitive",
        filePath: "handlers/skill.ts",
        line: 10,
        rawSignature:
          "ipcMain.handle(IPC_CHANNELS.SKILL_IMPORT, async (event, name) => {",
      },
    ];
    const preloads: PreloadEntry[] = [
      {
        channel: "IPC_CHANNELS.SKILL_IMPORT",
        argPattern: "primitive",
        filePath: "preload/skill-api.ts",
        line: 5,
        rawArgs: "name",
      },
    ];

    const report = matchAndValidate(handlers, preloads, channelMap);

    expect(report.summary.totalHandlers).toBe(1);
    expect(report.summary.totalPreloads).toBe(1);
  });

  it("T-4-8b: channelMap解決後に同一チャンネルの照合が正しく行われR-02不一致が検出される", () => {
    const handlers: HandlerEntry[] = [
      {
        channel: "IPC_CHANNELS.SKILL_IMPORT",
        argPattern: "object",
        filePath: "handlers/skill.ts",
        line: 10,
        rawSignature:
          "ipcMain.handle(IPC_CHANNELS.SKILL_IMPORT, async (event, args) => {",
      },
    ];
    const preloads: PreloadEntry[] = [
      {
        channel: "IPC_CHANNELS.SKILL_IMPORT",
        argPattern: "primitive",
        filePath: "preload/skill-api.ts",
        line: 5,
        rawArgs: "skillName",
      },
    ];

    const report = matchAndValidate(handlers, preloads, channelMap);

    const r02Drifts = report.drifts.filter((d) => d.rule === "R-02");
    expect(r02Drifts).toHaveLength(1);
    expect(r02Drifts[0].channel).toBe("skill:import");
  });
});

// ============================================================================
// T-6-1: 異常系テスト
// ============================================================================

describe("Phase 6: 異常系テスト", () => {
  it("T-6-1a: 空ソースでextractMainHandlersは空配列", () => {
    const result = extractMainHandlers("", "empty.ts");
    expect(result).toHaveLength(0);
  });

  it("T-6-1b: 空ソースでextractPreloadEntriesは空配列", () => {
    const result = extractPreloadEntries("", "empty.ts");
    expect(result).toHaveLength(0);
  });

  it("T-6-1d: 不正な構文のソースでもクラッシュしない", () => {
    const source = `ipcMain.handle( /* incomplete`;
    expect(() => extractMainHandlers(source, "bad.ts")).not.toThrow();
  });
});

// ============================================================================
// T-6-2: 境界値テスト
// ============================================================================

describe("Phase 6: 境界値テスト", () => {
  it("T-6-2b: チャンネル名に特殊文字を含む場合に正しく抽出", () => {
    const source = `ipcMain.handle('skill:import-v2.0', async (event) => {`;
    const result = extractMainHandlers(source, "test.ts");
    expect(result).toHaveLength(1);
    expect(result[0].channel).toBe("skill:import-v2.0");
  });

  it("T-6-2c: ハンドラ0件/Preload0件でもレポート生成される", () => {
    const report = matchAndValidate([], []);
    expect(report.passed).toBe(true);
    expect(report.summary.totalHandlers).toBe(0);
  });
});

// ============================================================================
// T-6-3: エッジケーステスト
// ============================================================================

describe("Phase 6: エッジケーステスト", () => {
  it("T-6-3a: コメントアウトされたipcMain.handle行を無視する", () => {
    const source = `  // ipcMain.handle('disabled:ch', async (event) => {`;
    const result = extractMainHandlers(source, "test.ts");
    expect(result).toHaveLength(0);
  });

  it("T-6-3b: ブロックコメント内のipcMain.handle行を無視する", () => {
    const source = `  /* ipcMain.handle('disabled:ch', async (event) => { */`;
    const result = extractMainHandlers(source, "test.ts");
    expect(result).toHaveLength(0);
  });

  it("T-6-3b2: 複数行ブロックコメント内のipcMain.handleを無視する", () => {
    const source = [
      "/*",
      "  ipcMain.handle('disabled:ch', async (event) => {",
      "*/",
      "ipcMain.handle('enabled:ch', async (event) => {",
    ].join("\n");
    const result = extractMainHandlers(source, "test.ts");
    expect(result).toHaveLength(1);
    expect(result[0].channel).toBe("enabled:ch");
  });

  it("T-6-3c: マルチライン定義のipcMain.handleを正しく抽出する", () => {
    const source = [
      "  ipcMain.handle(",
      "    IPC_CHANNELS.SKILL_LIST,",
      "    async (event, args) => {",
    ].join("\n");
    const result = extractMainHandlers(source, "test.ts");
    expect(result).toHaveLength(1);
    expect(result[0].channel).toBe("IPC_CHANNELS.SKILL_LIST");
  });

  it("T-6-3e: IPC_CHANNELS定数を使わない直接文字列をR-03で検出する", () => {
    const handlers = [
      {
        channel: "skill:import",
        argPattern: "primitive" as const,
        filePath: "h.ts",
        line: 1,
        rawSignature: "ipcMain.handle('skill:import', h)",
      },
    ];
    const preloads = [
      {
        channel: "skill:import",
        argPattern: "primitive" as const,
        filePath: "p.ts",
        line: 1,
        rawArgs: "x",
      },
    ];
    const report = matchAndValidate(handlers, preloads);
    const r03 = report.drifts.filter((d) => d.rule === "R-03");
    expect(r03.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// T-6-4: P44/P45回帰テスト
// ============================================================================

describe("Phase 6: P44/P45回帰テスト", () => {
  it("T-6-4a: P44パターン skill:import の引数不一致が検出される", () => {
    const handlers = [
      {
        channel: "skill:import",
        argPattern: "object" as const,
        filePath: "h.ts",
        line: 1,
        rawSignature:
          "ipcMain.handle('skill:import', async (event, { skillIds }) => {",
      },
    ];
    const preloads = [
      {
        channel: "skill:import",
        argPattern: "primitive" as const,
        filePath: "p.ts",
        line: 1,
        rawArgs: "skillName",
      },
    ];
    const report = matchAndValidate(handlers, preloads);
    expect(report.drifts.some((d) => d.rule === "R-02")).toBe(true);
  });

  it("T-6-4b: P44パターン skill:remove の引数不一致が検出される", () => {
    const handlers = [
      {
        channel: "skill:remove",
        argPattern: "object" as const,
        filePath: "h.ts",
        line: 1,
        rawSignature:
          "ipcMain.handle('skill:remove', async (event, { skillId }) => {",
      },
    ];
    const preloads = [
      {
        channel: "skill:remove",
        argPattern: "primitive" as const,
        filePath: "p.ts",
        line: 1,
        rawArgs: "skillName",
      },
    ];
    const report = matchAndValidate(handlers, preloads);
    expect(report.drifts.some((d) => d.rule === "R-02")).toBe(true);
  });

  it("T-6-4c: 修正後のskill:importパターンが整合として判定される", () => {
    const handlers = [
      {
        channel: "skill:import",
        argPattern: "primitive" as const,
        filePath: "h.ts",
        line: 1,
        rawSignature:
          "ipcMain.handle('skill:import', async (event, skillName) => {",
      },
    ];
    const preloads = [
      {
        channel: "skill:import",
        argPattern: "primitive" as const,
        filePath: "p.ts",
        line: 1,
        rawArgs: "skillName",
      },
    ];
    const report = matchAndValidate(handlers, preloads);
    const r02 = report.drifts.filter((d) => d.rule === "R-02");
    expect(r02).toHaveLength(0);
  });
});

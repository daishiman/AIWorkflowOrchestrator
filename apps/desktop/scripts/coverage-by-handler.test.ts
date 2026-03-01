// @vitest-environment node
/**
 * coverage-by-handler.test.ts
 *
 * IPCハンドラ単位カバレッジ測定基盤のテストスイート
 * TDD Phase 4: テストケース設計
 *
 * タスクID: UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001
 * Issue: #854
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  extractHandlers,
  convertConstantToChannelName,
  parseCoverageJson,
  getDefaultCoverageJsonPath,
  calculateHandlerCoverage,
  judgePhase7,
  formatMarkdownReport,
  formatJsonReport,
  generateReport,
  parseCliArgs,
  main,
  type HandlerInfo,
  type IstanbulFileCoverage,
  type HandlerCoverage,
  type CoverageReport,
} from "./coverage-by-handler";

// ============================================================================
// テストヘルパー
// ============================================================================

/** テスト用ハンドラ情報を生成 */
function createMockHandlerInfo(
  overrides: Partial<HandlerInfo> = {},
): HandlerInfo {
  return {
    channelName: "skill:list",
    startLine: 93,
    endLine: 118,
    registrationFunction: "registerSkillHandlers",
    ...overrides,
  };
}

/** テスト用Istanbul形式カバレッジデータを生成 */
function createMockIstanbulCoverage(
  options: {
    statementCount?: number;
    coveredStatements?: number;
    branchCount?: number;
    coveredBranches?: number;
    functionCount?: number;
    coveredFunctions?: number;
    startLine?: number;
    endLine?: number;
  } = {},
): IstanbulFileCoverage {
  const {
    statementCount = 10,
    coveredStatements = 8,
    branchCount = 4,
    coveredBranches = 3,
    functionCount = 2,
    coveredFunctions = 2,
    startLine = 93,
    endLine = 118,
  } = options;

  const statementMap: Record<
    string,
    {
      start: { line: number; column: number };
      end: { line: number; column: number };
    }
  > = {};
  const s: Record<string, number> = {};
  const branchMap: Record<
    string,
    {
      type: string;
      line: number;
      loc: {
        start: { line: number; column: number };
        end: { line: number; column: number };
      };
      locations: {
        start: { line: number; column: number };
        end: { line: number; column: number };
      }[];
    }
  > = {};
  const b: Record<string, number[]> = {};
  const fnMap: Record<
    string,
    {
      name: string;
      decl: {
        start: { line: number; column: number };
        end: { line: number; column: number };
      };
      loc: {
        start: { line: number; column: number };
        end: { line: number; column: number };
      };
      line: number;
    }
  > = {};
  const f: Record<string, number> = {};

  // ステートメント生成
  for (let i = 0; i < statementCount; i++) {
    const line =
      startLine + Math.floor((i / statementCount) * (endLine - startLine));
    statementMap[String(i)] = {
      start: { line, column: 0 },
      end: { line, column: 80 },
    };
    s[String(i)] = i < coveredStatements ? 1 : 0;
  }

  // ブランチ生成
  for (let i = 0; i < branchCount; i++) {
    const line =
      startLine + Math.floor((i / branchCount) * (endLine - startLine));
    branchMap[String(i)] = {
      type: "if",
      line,
      loc: {
        start: { line, column: 0 },
        end: { line, column: 80 },
      },
      locations: [{ start: { line, column: 0 }, end: { line, column: 40 } }],
    };
    b[String(i)] = [i < coveredBranches ? 1 : 0];
  }

  // 関数生成
  for (let i = 0; i < functionCount; i++) {
    const line =
      startLine + Math.floor((i / functionCount) * (endLine - startLine));
    fnMap[String(i)] = {
      name: i === 0 ? "handler" : `helper${i}`,
      decl: {
        start: { line, column: 0 },
        end: { line, column: 80 },
      },
      loc: {
        start: { line, column: 0 },
        end: { line: line + 5, column: 1 },
      },
      line,
    };
    f[String(i)] = i < coveredFunctions ? 1 : 0;
  }

  return {
    path: "/test/file.ts",
    statementMap,
    s,
    branchMap,
    b,
    fnMap,
    f,
  };
}

/** テスト用TypeScriptファイルの一時パスを生成 */
function createTempTsFile(content: string): string {
  const tmpDir = path.join(__dirname, "__test_tmp__");
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }
  const tmpFile = path.join(tmpDir, `test-${Date.now()}.ts`);
  fs.writeFileSync(tmpFile, content);
  return tmpFile;
}

/** テスト用カバレッジJSONファイルの一時パスを生成 */
function createTempCoverageJson(
  data: Record<string, IstanbulFileCoverage>,
): string {
  const tmpDir = path.join(__dirname, "__test_tmp__");
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }
  const tmpFile = path.join(tmpDir, `coverage-${Date.now()}.json`);
  fs.writeFileSync(tmpFile, JSON.stringify(data));
  return tmpFile;
}

/** 一時ファイルのクリーンアップ */
function cleanupTempFiles(): void {
  const tmpDir = path.join(__dirname, "__test_tmp__");
  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

// ============================================================================
// TC-001: HandlerDetector — AST解析テスト
// ============================================================================

describe("HandlerDetector (extractHandlers)", () => {
  afterEach(() => {
    cleanupTempFiles();
  });

  it("ipcMain.handle() 呼び出しからチャンネル名と行範囲を抽出する", () => {
    const content = `
import { ipcMain } from "electron";

export function registerHandlers() {
  ipcMain.handle("test:channel", async (event) => {
    return { success: true };
  });
}
`;
    const tmpFile = createTempTsFile(content);
    const handlers = extractHandlers(tmpFile);

    expect(handlers).toHaveLength(1);
    expect(handlers[0].channelName).toBe("test:channel");
    expect(handlers[0].registrationFunction).toBe("registerHandlers");
    expect(handlers[0].startLine).toBeGreaterThan(0);
    expect(handlers[0].endLine).toBeGreaterThan(handlers[0].startLine);
  });

  it("複数のipcMain.handle()呼び出しを正しく検出する", () => {
    const content = `
import { ipcMain } from "electron";

export function registerHandlers() {
  ipcMain.handle("channel:one", async (event) => {
    return 1;
  });

  ipcMain.handle("channel:two", async (event) => {
    return 2;
  });

  ipcMain.handle("channel:three", async (event) => {
    return 3;
  });
}
`;
    const tmpFile = createTempTsFile(content);
    const handlers = extractHandlers(tmpFile);

    expect(handlers).toHaveLength(3);
    expect(handlers.map((h) => h.channelName)).toEqual([
      "channel:one",
      "channel:two",
      "channel:three",
    ]);
  });

  it("IPC_CHANNELS.XXX 形式のチャンネル名を正しく変換する", () => {
    const content = `
import { ipcMain } from "electron";
const IPC_CHANNELS = { SKILL_LIST: "skill:list" };

export function registerHandlers() {
  ipcMain.handle(IPC_CHANNELS.SKILL_LIST, async (event) => {
    return [];
  });
}
`;
    const tmpFile = createTempTsFile(content);
    const handlers = extractHandlers(tmpFile);

    expect(handlers).toHaveLength(1);
    expect(handlers[0].channelName).toBe("skill:list");
  });

  it("存在しないファイルでエラーをスローする", () => {
    expect(() => extractHandlers("/nonexistent/file.ts")).toThrow(
      "ファイルが見つかりません",
    );
  });

  it("ipcMain.handle()がないファイルで空配列を返す", () => {
    const content = `
export function doNothing() {
  console.log("hello");
}
`;
    const tmpFile = createTempTsFile(content);
    const handlers = extractHandlers(tmpFile);

    expect(handlers).toHaveLength(0);
  });

  it("複数の登録関数にまたがるハンドラを正しく分類する", () => {
    const content = `
import { ipcMain } from "electron";

export function registerGroupA() {
  ipcMain.handle("group:a1", async (event) => {
    return "a1";
  });
  ipcMain.handle("group:a2", async (event) => {
    return "a2";
  });
}

export function registerGroupB() {
  ipcMain.handle("group:b1", async (event) => {
    return "b1";
  });
}
`;
    const tmpFile = createTempTsFile(content);
    const handlers = extractHandlers(tmpFile);

    expect(handlers).toHaveLength(3);
    expect(handlers[0].registrationFunction).toBe("registerGroupA");
    expect(handlers[1].registrationFunction).toBe("registerGroupA");
    expect(handlers[2].registrationFunction).toBe("registerGroupB");
  });

  it("実際のskillHandlers.tsから23ハンドラを検出する", () => {
    const skillHandlersPath = path.resolve(
      __dirname,
      "../src/main/ipc/skillHandlers.ts",
    );
    if (!fs.existsSync(skillHandlersPath)) {
      // CI環境等でファイルが存在しない場合はスキップ
      return;
    }

    const handlers = extractHandlers(skillHandlersPath);
    expect(handlers.length).toBe(23);

    // 登録関数の分類確認
    const groupedByFunction = handlers.reduce(
      (acc, h) => {
        acc[h.registrationFunction] = (acc[h.registrationFunction] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    expect(groupedByFunction["registerSkillHandlers"]).toBe(14);
    expect(groupedByFunction["registerSkillScheduleHandlers"]).toBe(5);
    expect(groupedByFunction["registerSkillDocsHandlers"]).toBe(4);
  });
});

// ============================================================================
// TC-001b: convertConstantToChannelName
// ============================================================================

describe("convertConstantToChannelName", () => {
  it("SKILL_LIST を skill:list に変換する", () => {
    expect(convertConstantToChannelName("SKILL_LIST")).toBe("skill:list");
  });

  it("SKILL_GET_IMPORTED を skill:getImported に変換する", () => {
    expect(convertConstantToChannelName("SKILL_GET_IMPORTED")).toBe(
      "skill:getImported",
    );
  });

  it("SKILL_SCHEDULE_ADD を skill:schedule:add に変換する", () => {
    expect(convertConstantToChannelName("SKILL_SCHEDULE_ADD")).toBe(
      "skill:schedule:add",
    );
  });

  it("SKILL_DOCS_GENERATE を skill:docs:generate に変換する", () => {
    expect(convertConstantToChannelName("SKILL_DOCS_GENERATE")).toBe(
      "skill:docs:generate",
    );
  });

  it("SKILL_OPTIMIZE_VARIANTS を skill:optimize:variants に変換する", () => {
    expect(convertConstantToChannelName("SKILL_OPTIMIZE_VARIANTS")).toBe(
      "skill:optimize:variants",
    );
  });

  it("SKILL_OPTIMIZE_EVALUATE を skill:optimize:evaluate に変換する", () => {
    expect(convertConstantToChannelName("SKILL_OPTIMIZE_EVALUATE")).toBe(
      "skill:optimize:evaluate",
    );
  });
});

// ============================================================================
// TC-002: CoverageParser — Istanbul形式JSON解析テスト
// ============================================================================

describe("CoverageParser (parseCoverageJson)", () => {
  afterEach(() => {
    cleanupTempFiles();
  });

  it("Istanbul形式のカバレッジJSONを正しく解析する", () => {
    const mockCoverage = createMockIstanbulCoverage();
    const targetPath = "/test/file.ts";
    const jsonPath = createTempCoverageJson({
      [targetPath]: mockCoverage,
    });

    const result = parseCoverageJson(jsonPath, targetPath);

    expect(result).not.toBeNull();
    expect(result!.statementMap).toBeDefined();
    expect(result!.s).toBeDefined();
    expect(result!.fnMap).toBeDefined();
    expect(result!.f).toBeDefined();
    expect(result!.branchMap).toBeDefined();
    expect(result!.b).toBeDefined();
  });

  it("部分一致でファイルを検索する", () => {
    const mockCoverage = createMockIstanbulCoverage();
    const fullPath =
      "/Users/dev/project/apps/desktop/src/main/ipc/skillHandlers.ts";
    const jsonPath = createTempCoverageJson({
      [fullPath]: mockCoverage,
    });

    const result = parseCoverageJson(jsonPath, "src/main/ipc/skillHandlers.ts");

    expect(result).not.toBeNull();
  });

  it("存在しないカバレッジJSONでエラーをスローする", () => {
    expect(() =>
      parseCoverageJson("/nonexistent/coverage.json", "test.ts"),
    ).toThrow("カバレッジデータが見つかりません");
  });

  it("不正なJSONでエラーをスローする", () => {
    const tmpDir = path.join(__dirname, "__test_tmp__");
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    const invalidJsonPath = path.join(tmpDir, "invalid.json");
    fs.writeFileSync(invalidJsonPath, "{ invalid json }}}");

    expect(() => parseCoverageJson(invalidJsonPath, "test.ts")).toThrow(
      "カバレッジJSONの解析に失敗しました",
    );
  });

  it("対象ファイルがカバレッジデータに含まれない場合にnullを返す", () => {
    const mockCoverage = createMockIstanbulCoverage();
    const jsonPath = createTempCoverageJson({
      "/other/file.ts": mockCoverage,
    });

    const result = parseCoverageJson(jsonPath, "/test/target.ts");

    expect(result).toBeNull();
  });
});

describe("getDefaultCoverageJsonPath", () => {
  it("coverage/coverage-final.json のパスを返す", () => {
    const result = getDefaultCoverageJsonPath();
    expect(result).toContain("coverage-final.json");
    expect(result).toContain("coverage");
  });
});

// ============================================================================
// TC-003: CoverageCalculator — ハンドラ単位カバレッジ算出テスト
// ============================================================================

describe("CoverageCalculator (calculateHandlerCoverage)", () => {
  it("ハンドラ行範囲内のLine Coverageを正しく算出する", () => {
    const handler = createMockHandlerInfo({ startLine: 93, endLine: 118 });
    const coverage = createMockIstanbulCoverage({
      statementCount: 10,
      coveredStatements: 8,
      startLine: 93,
      endLine: 118,
    });

    const result = calculateHandlerCoverage(handler, coverage);

    expect(result.lineCoverage).toBe(80);
    expect(result.coveredLines).toBe(8);
    expect(result.totalLines).toBe(10);
  });

  it("ハンドラ行範囲内のBranch Coverageを正しく算出する", () => {
    const handler = createMockHandlerInfo({ startLine: 93, endLine: 118 });
    const coverage = createMockIstanbulCoverage({
      branchCount: 4,
      coveredBranches: 3,
      startLine: 93,
      endLine: 118,
    });

    const result = calculateHandlerCoverage(handler, coverage);

    expect(result.branchCoverage).toBe(75);
    expect(result.coveredBranches).toBe(3);
    expect(result.totalBranches).toBe(4);
  });

  it("ハンドラ行範囲内のFunction Coverageを正しく算出する", () => {
    const handler = createMockHandlerInfo({ startLine: 93, endLine: 118 });
    const coverage = createMockIstanbulCoverage({
      functionCount: 2,
      coveredFunctions: 2,
      startLine: 93,
      endLine: 118,
    });

    const result = calculateHandlerCoverage(handler, coverage);

    expect(result.functionCoverage).toBe(100);
    expect(result.coveredFunctions).toBe(2);
    expect(result.totalFunctions).toBe(2);
  });

  it("行範囲外のカバレッジデータを除外する", () => {
    const handler = createMockHandlerInfo({ startLine: 100, endLine: 110 });
    const coverage = createMockIstanbulCoverage({
      statementCount: 10,
      coveredStatements: 10,
      startLine: 200,
      endLine: 300,
    });

    const result = calculateHandlerCoverage(handler, coverage);

    expect(result.totalLines).toBe(0);
    expect(result.lineCoverage).toBe(0);
  });

  it("カバレッジが0%のハンドラを正しく算出する", () => {
    const handler = createMockHandlerInfo({ startLine: 93, endLine: 118 });
    const coverage = createMockIstanbulCoverage({
      statementCount: 10,
      coveredStatements: 0,
      branchCount: 4,
      coveredBranches: 0,
      functionCount: 2,
      coveredFunctions: 0,
      startLine: 93,
      endLine: 118,
    });

    const result = calculateHandlerCoverage(handler, coverage);

    expect(result.lineCoverage).toBe(0);
    expect(result.branchCoverage).toBe(0);
    expect(result.functionCoverage).toBe(0);
  });

  it("カバレッジが100%のハンドラを正しく算出する", () => {
    const handler = createMockHandlerInfo({ startLine: 93, endLine: 118 });
    const coverage = createMockIstanbulCoverage({
      statementCount: 10,
      coveredStatements: 10,
      branchCount: 4,
      coveredBranches: 4,
      functionCount: 2,
      coveredFunctions: 2,
      startLine: 93,
      endLine: 118,
    });

    const result = calculateHandlerCoverage(handler, coverage);

    expect(result.lineCoverage).toBe(100);
    expect(result.branchCoverage).toBe(100);
    expect(result.functionCoverage).toBe(100);
  });

  it("P41: インライン関数を検出する", () => {
    const handler = createMockHandlerInfo({ startLine: 93, endLine: 118 });
    const coverage: IstanbulFileCoverage = {
      path: "/test/file.ts",
      statementMap: {},
      s: {},
      branchMap: {},
      b: {},
      fnMap: {
        "0": {
          name: "handler",
          decl: {
            start: { line: 93, column: 0 },
            end: { line: 93, column: 50 },
          },
          loc: {
            start: { line: 93, column: 0 },
            end: { line: 118, column: 1 },
          },
          line: 93,
        },
        "1": {
          name: "(anonymous)",
          decl: {
            start: { line: 100, column: 20 },
            end: { line: 100, column: 40 },
          },
          loc: {
            start: { line: 100, column: 20 },
            end: { line: 100, column: 60 },
          },
          line: 100,
        },
      },
      f: { "0": 1, "1": 0 },
    };

    const result = calculateHandlerCoverage(handler, coverage);

    expect(result.inlineFunctions).toHaveLength(1);
    expect(result.inlineFunctions[0]).toBe("(anonymous)");
    expect(result.totalFunctions).toBe(2);
    expect(result.coveredFunctions).toBe(1);
  });
});

// ============================================================================
// TC-004: Phase7Judge — 判定ルールテスト
// ============================================================================

describe("Phase7Judge (judgePhase7)", () => {
  it("Rule-1 推奨達成: 全指標が推奨基準を満たす場合PASSを返す", () => {
    const coverage: HandlerCoverage = {
      handler: createMockHandlerInfo(),
      lineCoverage: 95,
      branchCoverage: 75,
      functionCoverage: 95,
      coveredLines: 19,
      totalLines: 20,
      coveredBranches: 3,
      totalBranches: 4,
      coveredFunctions: 2,
      totalFunctions: 2,
      inlineFunctions: [],
    };

    const result = judgePhase7(coverage);

    expect(result.isPassed).toBe(true);
    expect(result.rule).toContain("推奨達成");
  });

  it("Rule-1 最低達成: 全指標が最低基準のみ満たす場合PASSを返す", () => {
    const coverage: HandlerCoverage = {
      handler: createMockHandlerInfo(),
      lineCoverage: 82,
      branchCoverage: 62,
      functionCoverage: 82,
      coveredLines: 8,
      totalLines: 10,
      coveredBranches: 3,
      totalBranches: 5,
      coveredFunctions: 4,
      totalFunctions: 5,
      inlineFunctions: [],
    };

    const result = judgePhase7(coverage);

    expect(result.isPassed).toBe(true);
    expect(result.rule).toContain("最低達成");
  });

  it("Rule-1 未達: Line Coverageが基準未達の場合FAILを返す", () => {
    const coverage: HandlerCoverage = {
      handler: createMockHandlerInfo(),
      lineCoverage: 70,
      branchCoverage: 65,
      functionCoverage: 85,
      coveredLines: 7,
      totalLines: 10,
      coveredBranches: 3,
      totalBranches: 5,
      coveredFunctions: 4,
      totalFunctions: 5,
      inlineFunctions: [],
    };

    const result = judgePhase7(coverage);

    expect(result.isPassed).toBe(false);
    expect(result.reason).toContain("Line");
  });

  it("Rule-3: テスト未作成ハンドラの場合FAILを返す", () => {
    const coverage: HandlerCoverage = {
      handler: createMockHandlerInfo(),
      lineCoverage: 0,
      branchCoverage: 0,
      functionCoverage: 0,
      coveredLines: 0,
      totalLines: 10,
      coveredBranches: 0,
      totalBranches: 2,
      coveredFunctions: 0,
      totalFunctions: 1,
      inlineFunctions: [],
    };

    const result = judgePhase7(coverage);

    expect(result.isPassed).toBe(false);
    expect(result.rule).toBe("Rule-3");
    expect(result.reason).toContain("未タスク");
  });

  it("複数指標が基準未達の場合、全未達指標を理由に含める", () => {
    const coverage: HandlerCoverage = {
      handler: createMockHandlerInfo(),
      lineCoverage: 50,
      branchCoverage: 40,
      functionCoverage: 60,
      coveredLines: 5,
      totalLines: 10,
      coveredBranches: 2,
      totalBranches: 5,
      coveredFunctions: 3,
      totalFunctions: 5,
      inlineFunctions: [],
    };

    const result = judgePhase7(coverage);

    expect(result.isPassed).toBe(false);
    expect(result.reason).toContain("Line");
    expect(result.reason).toContain("Branch");
    expect(result.reason).toContain("Function");
  });
});

// ============================================================================
// TC-005: ReportFormatter — Markdownレポート出力テスト
// ============================================================================

describe("ReportFormatter (formatMarkdownReport)", () => {
  it("Markdownテーブルを正しくフォーマットする", () => {
    const report: CoverageReport = {
      filePath: "src/main/ipc/skillHandlers.ts",
      handlers: [
        {
          handler: createMockHandlerInfo({ channelName: "skill:list" }),
          lineCoverage: 90,
          branchCoverage: 70,
          functionCoverage: 85,
          coveredLines: 9,
          totalLines: 10,
          coveredBranches: 7,
          totalBranches: 10,
          coveredFunctions: 2,
          totalFunctions: 2,
          inlineFunctions: [],
        },
      ],
      summary: {
        totalHandlers: 1,
        coveredHandlers: 1,
        averageLineCoverage: 90,
        averageBranchCoverage: 70,
        averageFunctionCoverage: 85,
      },
      p41Note: "P41 test note",
    };

    const result = formatMarkdownReport(report);

    expect(result).toContain("# ハンドラ単位カバレッジレポート");
    expect(result).toContain("skill:list");
    expect(result).toContain("90.0");
    expect(result).toContain("PASS");
    expect(result).toContain("## サマリー");
    expect(result).toContain("P41 test note");
  });

  it("テーブルヘッダとセパレータを含む", () => {
    const report: CoverageReport = {
      filePath: "test.ts",
      handlers: [],
      summary: {
        totalHandlers: 0,
        coveredHandlers: 0,
        averageLineCoverage: 0,
        averageBranchCoverage: 0,
        averageFunctionCoverage: 0,
      },
      p41Note: "",
    };

    const result = formatMarkdownReport(report);

    expect(result).toContain(
      "| # | チャンネル名 | 行範囲 | Line% | Branch% | Func% | 判定 |",
    );
    expect(result).toContain("| --- | --- | --- | ---: | ---: | ---: | --- |");
  });
});

// ============================================================================
// TC-006: ReportFormatter — JSON出力テスト
// ============================================================================

describe("ReportFormatter (formatJsonReport)", () => {
  it("有効なJSONを出力する", () => {
    const report: CoverageReport = {
      filePath: "test.ts",
      handlers: [
        {
          handler: createMockHandlerInfo(),
          lineCoverage: 90,
          branchCoverage: 70,
          functionCoverage: 85,
          coveredLines: 9,
          totalLines: 10,
          coveredBranches: 7,
          totalBranches: 10,
          coveredFunctions: 2,
          totalFunctions: 2,
          inlineFunctions: [],
        },
      ],
      summary: {
        totalHandlers: 1,
        coveredHandlers: 1,
        averageLineCoverage: 90,
        averageBranchCoverage: 70,
        averageFunctionCoverage: 85,
      },
      p41Note: "test note",
    };

    const result = formatJsonReport(report);
    const parsed = JSON.parse(result);

    expect(parsed.filePath).toBe("test.ts");
    expect(parsed.handlers).toHaveLength(1);
    expect(parsed.summary.totalHandlers).toBe(1);
  });
});

// ============================================================================
// TC-007: CLIオプション解析テスト
// ============================================================================

describe("parseCliArgs", () => {
  it("--file オプションを正しく解析する", () => {
    const result = parseCliArgs(["--file", "src/main/ipc/skillHandlers.ts"]);

    expect(result).not.toBeNull();
    expect(result!.file).toBe("src/main/ipc/skillHandlers.ts");
    expect(result!.format).toBe("markdown");
    expect(result!.targets).toEqual([]);
    expect(result!.coveragePath).toBeUndefined();
  });

  it("--target オプションを正しく解析する", () => {
    const result = parseCliArgs([
      "--file",
      "test.ts",
      "--target",
      "skill:list",
    ]);

    expect(result!.targets).toEqual(["skill:list"]);
  });

  it("--target を複数回指定した場合、全て解析する", () => {
    const result = parseCliArgs([
      "--file",
      "test.ts",
      "--target",
      "skill:list",
      "--target",
      "skill:remove",
    ]);

    expect(result!.targets).toEqual(["skill:list", "skill:remove"]);
  });

  it("--source エイリアスを正しく解析する", () => {
    const result = parseCliArgs(["--source", "src/main/ipc/skillHandlers.ts"]);

    expect(result).not.toBeNull();
    expect(result!.file).toBe("src/main/ipc/skillHandlers.ts");
  });

  it("--coverage オプションを正しく解析する", () => {
    const result = parseCliArgs([
      "--file",
      "test.ts",
      "--coverage",
      "coverage/coverage-final.json",
    ]);

    expect(result!.coveragePath).toBe("coverage/coverage-final.json");
  });

  it("--format json を正しく解析する", () => {
    const result = parseCliArgs(["--file", "test.ts", "--format", "json"]);

    expect(result!.format).toBe("json");
  });

  it("--format both を正しく解析する", () => {
    const result = parseCliArgs(["--file", "test.ts", "--format", "both"]);

    expect(result!.format).toBe("both");
  });

  it("--file がない場合にnullを返す", () => {
    const result = parseCliArgs(["--target", "skill:list"]);

    expect(result).toBeNull();
  });

  it("引数なしの場合にnullを返す", () => {
    const result = parseCliArgs([]);

    expect(result).toBeNull();
  });

  it("不明なformat値はmarkdownとして扱う", () => {
    const result = parseCliArgs(["--file", "test.ts", "--format", "unknown"]);

    expect(result!.format).toBe("markdown");
  });
});

// ============================================================================
// TC-008: generateReport — レポート生成統合テスト
// ============================================================================

describe("generateReport", () => {
  it("ハンドラリストとカバレッジからレポートを生成する", () => {
    const handlers = [
      createMockHandlerInfo({
        channelName: "skill:list",
        startLine: 93,
        endLine: 118,
      }),
      createMockHandlerInfo({
        channelName: "skill:scan",
        startLine: 121,
        endLine: 138,
      }),
    ];
    const coverage = createMockIstanbulCoverage({
      statementCount: 20,
      coveredStatements: 15,
      startLine: 93,
      endLine: 138,
    });

    const report = generateReport(handlers, coverage, "test.ts");

    expect(report.filePath).toBe("test.ts");
    expect(report.handlers).toHaveLength(2);
    expect(report.summary.totalHandlers).toBe(2);
    expect(report.p41Note).toContain("P41");
  });

  it("空のハンドラリストで正しいサマリーを生成する", () => {
    const coverage = createMockIstanbulCoverage();
    const report = generateReport([], coverage, "test.ts");

    expect(report.handlers).toHaveLength(0);
    expect(report.summary.totalHandlers).toBe(0);
    expect(report.summary.averageLineCoverage).toBe(0);
  });

  it("カバー済みハンドラ数を正しくカウントする", () => {
    const handlers = [
      createMockHandlerInfo({
        channelName: "skill:list",
        startLine: 93,
        endLine: 118,
      }),
      createMockHandlerInfo({
        channelName: "skill:scan",
        startLine: 200,
        endLine: 220,
      }),
    ];

    // startLine 93-118 にのみカバレッジデータがあるモック
    const coverage = createMockIstanbulCoverage({
      statementCount: 10,
      coveredStatements: 8,
      startLine: 93,
      endLine: 118,
    });

    const report = generateReport(handlers, coverage, "test.ts");

    expect(report.summary.coveredHandlers).toBe(1);
  });
});

// ============================================================================
// TC-009: main() — エラーケーステスト
// ============================================================================

describe("main (エラーケース)", () => {
  let exitSpy: ReturnType<typeof vi.spyOn>;
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });
    consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    exitSpy.mockRestore();
    consoleSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  it("引数なしでusageを表示しexit(1)する", async () => {
    await expect(main([])).rejects.toThrow("process.exit called");
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it("存在しないファイル指定でエラーメッセージを表示する", async () => {
    await expect(main(["--file", "/nonexistent/file.ts"])).rejects.toThrow();
  });

  it("ハンドラが0件のファイルでexit(1)する", async () => {
    const content = `export const x = 1;`;
    const tmpFile = createTempTsFile(content);

    await expect(main(["--file", tmpFile])).rejects.toThrow(
      "process.exit called",
    );
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("ハンドラが検出されませんでした"),
    );
  });

  afterEach(() => {
    cleanupTempFiles();
  });
});

// ============================================================================
// TC-010: main() — 正常系テスト（モック使用）
// ============================================================================

describe("main (正常系)", () => {
  let exitSpy: ReturnType<typeof vi.spyOn>;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    exitSpy.mockRestore();
    consoleLogSpy.mockRestore();
    consoleSpy.mockRestore();
    cleanupTempFiles();
  });

  /** テスト用のTS+カバレッジJSON環境を構築 */
  function setupTestEnvironment(): {
    tsFile: string;
    coverageJsonPath: string;
  } {
    const content = `
import { ipcMain } from "electron";
export function registerHandlers() {
  ipcMain.handle("test:channel", async (event) => {
    if (event) {
      return { success: true };
    }
    return { success: false };
  });
}
`;
    const tsFile = createTempTsFile(content);

    // カバレッジJSONを生成（tsFileのパスをキーにする）
    const mockCoverage = createMockIstanbulCoverage({
      statementCount: 8,
      coveredStatements: 7,
      branchCount: 2,
      coveredBranches: 2,
      functionCount: 1,
      coveredFunctions: 1,
      startLine: 4,
      endLine: 10,
    });

    const coverageData: Record<string, IstanbulFileCoverage> = {};
    coverageData[tsFile] = { ...mockCoverage, path: tsFile };

    const coverageJsonPath = createTempCoverageJson(coverageData);

    return { tsFile, coverageJsonPath };
  }

  it("全体レポート（markdown）を正常出力する", async () => {
    const { tsFile, coverageJsonPath } = setupTestEnvironment();

    await main(["--file", tsFile], coverageJsonPath);

    expect(consoleLogSpy).toHaveBeenCalled();
    const output = consoleLogSpy.mock.calls.map((c) => String(c[0])).join("\n");
    expect(output).toContain("ハンドラ単位カバレッジレポート");
    expect(output).toContain("test:channel");
  });

  it("全体レポート（json）を正常出力する", async () => {
    const { tsFile, coverageJsonPath } = setupTestEnvironment();

    await main(["--file", tsFile, "--format", "json"], coverageJsonPath);

    expect(consoleLogSpy).toHaveBeenCalled();
    const output = consoleLogSpy.mock.calls.map((c) => String(c[0])).join("\n");
    const parsed = JSON.parse(output);
    expect(parsed.handlers).toBeDefined();
    expect(parsed.summary).toBeDefined();
  });

  it("--target で特定ハンドラの判定結果を出力する", async () => {
    const { tsFile, coverageJsonPath } = setupTestEnvironment();

    await main(
      ["--file", tsFile, "--target", "test:channel"],
      coverageJsonPath,
    );

    expect(consoleLogSpy).toHaveBeenCalled();
    const output = consoleLogSpy.mock.calls.map((c) => String(c[0])).join("\n");
    expect(output).toContain("test:channel");
    expect(output).toContain("判定");
  });

  it("--target --format json で特定ハンドラのJSON出力する", async () => {
    const { tsFile, coverageJsonPath } = setupTestEnvironment();

    await main(
      ["--file", tsFile, "--target", "test:channel", "--format", "json"],
      coverageJsonPath,
    );

    expect(consoleLogSpy).toHaveBeenCalled();
    const output = consoleLogSpy.mock.calls.map((c) => String(c[0])).join("\n");
    const parsed = JSON.parse(output);
    expect(parsed.handler).toBeDefined();
    expect(parsed.judgment).toBeDefined();
  });

  it("--source/--coverage エイリアスで実行できる", async () => {
    const { tsFile, coverageJsonPath } = setupTestEnvironment();

    await main(["--source", tsFile, "--coverage", coverageJsonPath]);

    expect(consoleLogSpy).toHaveBeenCalled();
    const output = consoleLogSpy.mock.calls.map((c) => String(c[0])).join("\n");
    expect(output).toContain("ハンドラ単位カバレッジレポート");
  });

  it("--target を複数指定した場合に結果サマリーをJSON出力する", async () => {
    const content = `
import { ipcMain } from "electron";
export function registerHandlers() {
  ipcMain.handle("test:channel:a", async () => {
    return true;
  });
  ipcMain.handle("test:channel:b", async () => {
    return true;
  });
}
`;
    const tsFile = createTempTsFile(content);
    const mockCoverage = createMockIstanbulCoverage({
      statementCount: 10,
      coveredStatements: 9,
      branchCount: 2,
      coveredBranches: 2,
      functionCount: 2,
      coveredFunctions: 2,
      startLine: 4,
      endLine: 10,
    });
    const coverageJsonPath = createTempCoverageJson({
      [tsFile]: { ...mockCoverage, path: tsFile },
    });

    await main(
      [
        "--file",
        tsFile,
        "--target",
        "test:channel:a",
        "--target",
        "test:channel:b",
        "--format",
        "json",
      ],
      coverageJsonPath,
    );

    const output = consoleLogSpy.mock.calls.map((c) => String(c[0])).join("\n");
    const parsed = JSON.parse(output);
    expect(parsed.results).toBeDefined();
    expect(parsed.summary.total).toBe(2);
  });

  it("存在しないターゲットハンドラでexit(1)する", async () => {
    const { tsFile, coverageJsonPath } = setupTestEnvironment();

    await expect(
      main(
        ["--file", tsFile, "--target", "nonexistent:handler"],
        coverageJsonPath,
      ),
    ).rejects.toThrow("process.exit called");
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("見つかりません"),
    );
  });

  it("カバレッジデータに対象ファイルがない場合exit(1)する", async () => {
    const content = `
import { ipcMain } from "electron";
export function registerHandlers() {
  ipcMain.handle("test:channel", async (event) => {
    return true;
  });
}
`;
    const tsFile = createTempTsFile(content);
    const coverageJsonPath = createTempCoverageJson({
      "/other/file.ts": createMockIstanbulCoverage(),
    });

    await expect(main(["--file", tsFile], coverageJsonPath)).rejects.toThrow(
      "process.exit called",
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("カバレッジデータが見つかりません"),
    );
  });
});

/**
 * coverage-by-handler.ts
 *
 * IPCハンドラ単位のカバレッジ測定基盤スクリプト
 * skillHandlers.ts 等のファイルから ipcMain.handle() 呼び出しを検出し、
 * ハンドラ単位でのLine/Branch/Function Coverageを集計・レポートする。
 *
 * @usage
 *   npx tsx scripts/coverage-by-handler.ts --file src/main/ipc/skillHandlers.ts
 *   npx tsx scripts/coverage-by-handler.ts --file src/main/ipc/skillHandlers.ts --target skill:list
 *   npx tsx scripts/coverage-by-handler.ts --file src/main/ipc/skillHandlers.ts --format json
 *
 * @note P41: v8カバレッジプロバイダはインラインarrow function（例: getAllowedWindows: () => [mainWindow]）
 *       を独立した関数としてカウントする。そのためFunction Coverageが実態より低く表示される場合がある。
 *
 * タスクID: UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001
 * Issue: #854
 */

import * as fs from "fs";
import * as path from "path";
import { Project, Node, CallExpression } from "ts-morph";

// ============================================================================
// 型定義
// ============================================================================

/** ハンドラ情報 */
export interface HandlerInfo {
  /** IPCチャンネル名（例: "skill:list"） */
  channelName: string;
  /** ハンドラ開始行（1-indexed） */
  startLine: number;
  /** ハンドラ終了行（1-indexed） */
  endLine: number;
  /** 登録関数名（例: "registerSkillHandlers"） */
  registrationFunction: string;
}

/** Istanbul形式のステートメント/関数/ブランチの位置情報 */
export interface IstanbulLocation {
  start: { line: number; column: number };
  end: { line: number; column: number };
}

/** Istanbul形式のステートメントマップエントリ */
export interface IstanbulStatementMap {
  [key: string]: IstanbulLocation;
}

/** Istanbul形式の関数マップエントリ */
export interface IstanbulFunctionMapEntry {
  name: string;
  decl: IstanbulLocation;
  loc: IstanbulLocation;
  line: number;
}

/** Istanbul形式のブランチマップエントリ */
export interface IstanbulBranchMapEntry {
  type: string;
  line: number;
  loc: IstanbulLocation;
  locations: IstanbulLocation[];
}

/** Istanbul形式のカバレッジデータ（1ファイル分） */
export interface IstanbulFileCoverage {
  path: string;
  all?: boolean;
  statementMap: IstanbulStatementMap;
  s: { [key: string]: number };
  branchMap: { [key: string]: IstanbulBranchMapEntry };
  b: { [key: string]: number[] };
  fnMap: { [key: string]: IstanbulFunctionMapEntry };
  f: { [key: string]: number };
}

/** Istanbul形式のカバレッジJSON全体 */
export interface IstanbulCoverageJson {
  [filePath: string]: IstanbulFileCoverage;
}

/** ハンドラ単位のカバレッジ結果 */
export interface HandlerCoverage {
  handler: HandlerInfo;
  lineCoverage: number;
  branchCoverage: number;
  functionCoverage: number;
  coveredLines: number;
  totalLines: number;
  coveredBranches: number;
  totalBranches: number;
  coveredFunctions: number;
  totalFunctions: number;
  /** P41影響: ハンドラ内のインライン関数名一覧 */
  inlineFunctions: string[];
}

/** Phase 7判定結果 */
export interface Phase7Judgment {
  isPassed: boolean;
  rule: string;
  reason: string;
}

/** target指定時の判定結果 */
export interface TargetHandlerResult {
  targetName: string;
  targetCoverage: HandlerCoverage;
  judgment: Phase7Judgment;
}

/** レポートオプション */
export interface ReportOptions {
  format: "markdown" | "json" | "both";
  targetHandler?: string;
}

/** CLIオプション */
export interface CoverageByHandlerOptions {
  file: string;
  targets: string[];
  coveragePath?: string;
  format: "markdown" | "json" | "both";
}

/** カバレッジレポート全体 */
export interface CoverageReport {
  filePath: string;
  handlers: HandlerCoverage[];
  summary: {
    totalHandlers: number;
    coveredHandlers: number;
    averageLineCoverage: number;
    averageBranchCoverage: number;
    averageFunctionCoverage: number;
  };
  /** P41注記 */
  p41Note: string;
}

// ============================================================================
// Module 1: HandlerDetector — AST解析によるハンドラ検出
// ============================================================================

/**
 * ts-morphを使用してTypeScriptファイルからipcMain.handle()呼び出しを検出し、
 * チャンネル名と行範囲を抽出する。
 */
export function extractHandlers(filePath: string): HandlerInfo[] {
  const absolutePath = path.resolve(filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`ファイルが見つかりません: ${filePath}`);
  }

  const project = new Project({
    compilerOptions: { strict: true },
    skipAddingFilesFromTsConfig: true,
  });

  const sourceFile = project.addSourceFileAtPath(absolutePath);
  const handlers: HandlerInfo[] = [];

  // ipcMain.handle() 呼び出しを検索
  sourceFile.forEachDescendant((node) => {
    if (!Node.isCallExpression(node)) return;
    const callExpr = node as CallExpression;
    const expression = callExpr.getExpression();

    // ipcMain.handle パターンをチェック
    if (!Node.isPropertyAccessExpression(expression)) return;
    const propAccess = expression;
    if (propAccess.getName() !== "handle") return;
    const obj = propAccess.getExpression();
    if (!Node.isIdentifier(obj) || obj.getText() !== "ipcMain") return;

    const args = callExpr.getArguments();
    if (args.length < 2) return;

    // チャンネル名の抽出
    const channelArg = args[0];
    const channelName = resolveChannelName(channelArg);
    if (!channelName) return;

    // 行範囲の取得（ipcMain.handle() 呼び出し全体）
    const startLine = callExpr.getStartLineNumber();
    const endLine = callExpr.getEndLineNumber();

    // 所属する登録関数の特定
    const registrationFunction = findParentFunctionName(callExpr);

    handlers.push({
      channelName,
      startLine,
      endLine,
      registrationFunction,
    });
  });

  return handlers;
}

/**
 * チャンネル名引数を解決する。
 * IPC_CHANNELS.XXX 形式の場合、定数名からチャンネル名を推定する。
 */
function resolveChannelName(node: Node): string | null {
  // 文字列リテラルの場合
  if (Node.isStringLiteral(node)) {
    return node.getLiteralValue();
  }

  // IPC_CHANNELS.XXX 形式の場合
  if (Node.isPropertyAccessExpression(node)) {
    const propName = node.getName();
    // SKILL_LIST -> skill:list, SKILL_GET_IMPORTED -> skill:getImported
    return convertConstantToChannelName(propName);
  }

  return null;
}

/**
 * 定数名からIPCチャンネル名に変換する。
 * 例: SKILL_LIST -> skill:list
 *     SKILL_GET_IMPORTED -> skill:getImported
 *     SKILL_SCHEDULE_ADD -> skill:schedule:add
 *     SKILL_DOCS_GENERATE -> skill:docs:generate
 */
const SKILL_CHANNEL_EXCEPTIONS: Record<string, string> = {
  // preload/channels.ts で camelCase を採用している例外を先に解決する
  SKILL_GET_IMPORTED: "skill:getImported",
  SKILL_LIST_BACKUPS: "skill:listBackups",
  SKILL_IMPORT_FROM_SOURCE: "skill:importFromSource",
};

export function convertConstantToChannelName(constName: string): string {
  const exceptional = SKILL_CHANNEL_EXCEPTIONS[constName];
  if (exceptional) {
    return exceptional;
  }

  const lower = constName.toLowerCase();

  // SKILL_DOCS_ prefix
  if (lower.startsWith("skill_docs_")) {
    const rest = lower.slice("skill_docs_".length).replace(/_/g, "-");
    return `skill:docs:${rest}`;
  }

  // SKILL_SCHEDULE_ prefix
  if (lower.startsWith("skill_schedule_")) {
    const rest = lower.slice("skill_schedule_".length).replace(/_/g, "-");
    return `skill:schedule:${rest}`;
  }

  // SKILL_OPTIMIZE_ prefix (variants, evaluate)
  if (lower.startsWith("skill_optimize_")) {
    const rest = lower.slice("skill_optimize_".length).replace(/_/g, "-");
    return `skill:optimize:${rest}`;
  }

  // SKILL_ prefix (general)
  if (lower.startsWith("skill_")) {
    const rest = lower.slice("skill_".length).replace(/_/g, "-");
    return `skill:${rest}`;
  }

  return lower.replace(/_/g, ":");
}

/**
 * ノードが所属する最も近い関数宣言の名前を返す。
 */
function findParentFunctionName(node: Node): string {
  let current: Node | undefined = node.getParent();
  while (current) {
    if (Node.isFunctionDeclaration(current)) {
      return current.getName() ?? "anonymous";
    }
    current = current.getParent();
  }
  return "module-level";
}

// ============================================================================
// Module 2: CoverageParser — Istanbul形式カバレッジJSON解析
// ============================================================================

/**
 * Istanbul形式のカバレッジJSONファイルを解析し、
 * 指定ファイルのカバレッジデータを返す。
 */
export function parseCoverageJson(
  coverageJsonPath: string,
  targetFilePath: string,
): IstanbulFileCoverage | null {
  if (!fs.existsSync(coverageJsonPath)) {
    throw new Error(
      `カバレッジデータが見つかりません: ${coverageJsonPath}\n` +
        "先にテストをカバレッジ付きで実行してください:\n" +
        "  cd apps/desktop && pnpm vitest run <test-file> --coverage --coverage.include='scripts/coverage-by-handler.ts'",
    );
  }

  const rawJson = fs.readFileSync(coverageJsonPath, "utf-8");
  let coverageData: IstanbulCoverageJson;

  try {
    coverageData = JSON.parse(rawJson) as IstanbulCoverageJson;
  } catch {
    throw new Error(`カバレッジJSONの解析に失敗しました: ${coverageJsonPath}`);
  }

  const absoluteTargetPath = path.resolve(targetFilePath);

  // ファイルパスで検索（完全一致 → 部分一致）
  for (const [filePath, data] of Object.entries(coverageData)) {
    if (filePath === absoluteTargetPath || filePath.endsWith(targetFilePath)) {
      return data;
    }
  }

  return null;
}

/**
 * カバレッジJSONのデフォルトパスを返す。
 */
export function getDefaultCoverageJsonPath(): string {
  return path.resolve("coverage", "coverage-final.json");
}

// ============================================================================
// Module 3: CoverageCalculator — ハンドラ単位カバレッジ算出
// ============================================================================

/**
 * ハンドラの行範囲内にあるステートメント/関数/ブランチのカバレッジを算出する。
 */
export function calculateHandlerCoverage(
  handler: HandlerInfo,
  coverage: IstanbulFileCoverage,
): HandlerCoverage {
  // Line Coverage（ステートメントベース）
  const { covered: coveredLines, total: totalLines } =
    countCoveredStatementsInRange(
      coverage.statementMap,
      coverage.s,
      handler.startLine,
      handler.endLine,
    );

  // Branch Coverage
  const { covered: coveredBranches, total: totalBranches } =
    countCoveredBranchesInRange(
      coverage.branchMap,
      coverage.b,
      handler.startLine,
      handler.endLine,
    );

  // Function Coverage
  const {
    covered: coveredFunctions,
    total: totalFunctions,
    inlineFunctions,
  } = countCoveredFunctionsInRange(
    coverage.fnMap,
    coverage.f,
    handler.startLine,
    handler.endLine,
  );

  const lineCoverage = totalLines > 0 ? (coveredLines / totalLines) * 100 : 0;
  const branchCoverage =
    totalBranches > 0 ? (coveredBranches / totalBranches) * 100 : 0;
  const functionCoverage =
    totalFunctions > 0 ? (coveredFunctions / totalFunctions) * 100 : 0;

  return {
    handler,
    lineCoverage,
    branchCoverage,
    functionCoverage,
    coveredLines,
    totalLines,
    coveredBranches,
    totalBranches,
    coveredFunctions,
    totalFunctions,
    inlineFunctions,
  };
}

/**
 * 指定行範囲内のステートメントカバレッジを集計する。
 */
function countCoveredStatementsInRange(
  statementMap: IstanbulStatementMap,
  s: { [key: string]: number },
  startLine: number,
  endLine: number,
): { covered: number; total: number } {
  let covered = 0;
  let total = 0;

  for (const [key, loc] of Object.entries(statementMap)) {
    if (loc.start.line >= startLine && loc.end.line <= endLine) {
      total++;
      if (s[key] > 0) {
        covered++;
      }
    }
  }

  return { covered, total };
}

/**
 * 指定行範囲内のブランチカバレッジを集計する。
 */
function countCoveredBranchesInRange(
  branchMap: { [key: string]: IstanbulBranchMapEntry },
  b: { [key: string]: number[] },
  startLine: number,
  endLine: number,
): { covered: number; total: number } {
  let covered = 0;
  let total = 0;

  for (const [key, branch] of Object.entries(branchMap)) {
    if (branch.line >= startLine && branch.line <= endLine) {
      const counts = b[key] ?? [];
      for (const count of counts) {
        total++;
        if (count > 0) {
          covered++;
        }
      }
    }
  }

  return { covered, total };
}

/**
 * 指定行範囲内の関数カバレッジを集計する。
 * P41注記: インラインarrow functionも独立関数としてカウントされる。
 */
function countCoveredFunctionsInRange(
  fnMap: { [key: string]: IstanbulFunctionMapEntry },
  f: { [key: string]: number },
  startLine: number,
  endLine: number,
): { covered: number; total: number; inlineFunctions: string[] } {
  let covered = 0;
  let total = 0;
  const inlineFunctions: string[] = [];

  for (const [key, fn] of Object.entries(fnMap)) {
    if (fn.line >= startLine && fn.line <= endLine) {
      total++;
      if (f[key] > 0) {
        covered++;
      }
      // P41: インライン関数の検出（名前が空や無名の場合はインライン関数の可能性）
      if (
        fn.name === "(anonymous)" ||
        fn.name === "" ||
        fn.name.includes("=>")
      ) {
        inlineFunctions.push(fn.name || `anonymous@line:${fn.line}`);
      }
    }
  }

  return { covered, total, inlineFunctions };
}

// ============================================================================
// Module 4: Phase7Judge — 判定ルール適用
// ============================================================================

/** カバレッジ判定の閾値 */
const COVERAGE_THRESHOLDS = {
  line: { minimum: 80, recommended: 90 },
  branch: { minimum: 60, recommended: 70 },
  function: { minimum: 80, recommended: 90 },
};

/**
 * Phase 7判定ルール（Rule-1〜Rule-4）を適用し、PASS/FAIL判定を返す。
 *
 * Rule-1: 対象ハンドラのカバレッジが閾値を満たせばPASS
 * Rule-2: ファイル全体が閾値未達でも、対象ハンドラが閾値を満たせばPASS
 * Rule-3: 未カバーハンドラは未タスクとして記録
 * Rule-4: ファイル全体のBranch Coverageが60%以上であること
 */
export function judgePhase7(handlerCoverage: HandlerCoverage): Phase7Judgment {
  const { lineCoverage, branchCoverage, functionCoverage } = handlerCoverage;

  // Rule-1: 全指標が最低基準を満たすか
  const isLinePass = lineCoverage >= COVERAGE_THRESHOLDS.line.minimum;
  const isBranchPass = branchCoverage >= COVERAGE_THRESHOLDS.branch.minimum;
  const isFunctionPass =
    functionCoverage >= COVERAGE_THRESHOLDS.function.minimum;

  if (isLinePass && isBranchPass && isFunctionPass) {
    const isRecommended =
      lineCoverage >= COVERAGE_THRESHOLDS.line.recommended &&
      branchCoverage >= COVERAGE_THRESHOLDS.branch.recommended &&
      functionCoverage >= COVERAGE_THRESHOLDS.function.recommended;

    return {
      isPassed: true,
      rule: isRecommended ? "Rule-1 (推奨達成)" : "Rule-1 (最低達成)",
      reason: `Line: ${lineCoverage.toFixed(1)}%, Branch: ${branchCoverage.toFixed(1)}%, Function: ${functionCoverage.toFixed(1)}%`,
    };
  }

  // Rule-3: 未カバーハンドラ
  if (lineCoverage === 0 && branchCoverage === 0 && functionCoverage === 0) {
    return {
      isPassed: false,
      rule: "Rule-3",
      reason: "テスト未作成ハンドラ — 未タスクとして記録が必要",
    };
  }

  // 閾値未達
  const failReasons: string[] = [];
  if (!isLinePass)
    failReasons.push(
      `Line: ${lineCoverage.toFixed(1)}% < ${COVERAGE_THRESHOLDS.line.minimum}%`,
    );
  if (!isBranchPass)
    failReasons.push(
      `Branch: ${branchCoverage.toFixed(1)}% < ${COVERAGE_THRESHOLDS.branch.minimum}%`,
    );
  if (!isFunctionPass)
    failReasons.push(
      `Function: ${functionCoverage.toFixed(1)}% < ${COVERAGE_THRESHOLDS.function.minimum}%`,
    );

  return {
    isPassed: false,
    rule: "Rule-1 (未達)",
    reason: failReasons.join(", "),
  };
}

// ============================================================================
// Module 5: ReportFormatter — レポート出力
// ============================================================================

/**
 * P41注記メッセージ
 */
const P41_NOTE =
  "注記 (P41): v8カバレッジプロバイダはインラインarrow function" +
  "（例: getAllowedWindows: () => [mainWindow]）を独立した関数としてカウントします。" +
  "そのため Function Coverage が実態より低く表示される場合があります。" +
  "詳細: .claude/rules/06-known-pitfalls.md#P41";

/**
 * カバレッジレポートをMarkdown形式でフォーマットする。
 */
export function formatMarkdownReport(report: CoverageReport): string {
  const lines: string[] = [];

  lines.push(`# ハンドラ単位カバレッジレポート`);
  lines.push("");
  lines.push(`**対象ファイル**: \`${report.filePath}\``);
  lines.push(`**検出ハンドラ数**: ${report.summary.totalHandlers}`);
  lines.push("");

  // テーブルヘッダ
  lines.push("| # | チャンネル名 | 行範囲 | Line% | Branch% | Func% | 判定 |");
  lines.push("| --- | --- | --- | ---: | ---: | ---: | --- |");

  // テーブルボディ
  report.handlers.forEach((hc, index) => {
    const judgment = judgePhase7(hc);
    const status = judgment.isPassed ? "PASS" : "FAIL";
    lines.push(
      `| ${index + 1} | ${hc.handler.channelName} | ${hc.handler.startLine}-${hc.handler.endLine} | ${hc.lineCoverage.toFixed(1)} | ${hc.branchCoverage.toFixed(1)} | ${hc.functionCoverage.toFixed(1)} | ${status} |`,
    );
  });

  lines.push("");

  // サマリー
  lines.push("## サマリー");
  lines.push("");
  lines.push(`- 総ハンドラ数: ${report.summary.totalHandlers}`);
  lines.push(`- カバー済みハンドラ数: ${report.summary.coveredHandlers}`);
  lines.push(
    `- 平均Line Coverage: ${report.summary.averageLineCoverage.toFixed(1)}%`,
  );
  lines.push(
    `- 平均Branch Coverage: ${report.summary.averageBranchCoverage.toFixed(1)}%`,
  );
  lines.push(
    `- 平均Function Coverage: ${report.summary.averageFunctionCoverage.toFixed(1)}%`,
  );
  lines.push("");

  // P41注記
  lines.push(`> ${report.p41Note}`);
  lines.push("");

  return lines.join("\n");
}

/**
 * カバレッジレポートをJSON形式でフォーマットする。
 */
export function formatJsonReport(report: CoverageReport): string {
  return JSON.stringify(report, null, 2);
}

// ============================================================================
// メイン処理: CLI統合
// ============================================================================

/**
 * コマンドライン引数を解析する。
 */
export function parseCliArgs(args: string[]): CoverageByHandlerOptions | null {
  const fileIndex = args.indexOf("--file");
  const sourceIndex = args.indexOf("--source");
  const pathIndex = fileIndex !== -1 ? fileIndex : sourceIndex;
  if (pathIndex === -1 || pathIndex + 1 >= args.length) {
    return null;
  }

  const file = args[pathIndex + 1];
  const targets: string[] = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--target" && i + 1 < args.length) {
      const target = args[i + 1];
      if (!targets.includes(target)) {
        targets.push(target);
      }
      i++;
    }
  }

  const coverageIndex = args.indexOf("--coverage");
  const coveragePath =
    coverageIndex !== -1 && coverageIndex + 1 < args.length
      ? args[coverageIndex + 1]
      : undefined;

  const formatIndex = args.indexOf("--format");
  const formatValue =
    formatIndex !== -1 && formatIndex + 1 < args.length
      ? args[formatIndex + 1]
      : "markdown";

  const format =
    formatValue === "json"
      ? "json"
      : formatValue === "both"
        ? "both"
        : "markdown";

  return { file, targets, coveragePath, format };
}

/**
 * レポートを生成する。
 */
export function generateReport(
  handlers: HandlerInfo[],
  coverage: IstanbulFileCoverage,
  filePath: string,
): CoverageReport {
  const handlerCoverages = handlers.map((handler) =>
    calculateHandlerCoverage(handler, coverage),
  );

  const coveredHandlers = handlerCoverages.filter(
    (hc) => hc.lineCoverage > 0,
  ).length;

  const avgLine =
    handlerCoverages.length > 0
      ? handlerCoverages.reduce((sum, hc) => sum + hc.lineCoverage, 0) /
        handlerCoverages.length
      : 0;
  const avgBranch =
    handlerCoverages.length > 0
      ? handlerCoverages.reduce((sum, hc) => sum + hc.branchCoverage, 0) /
        handlerCoverages.length
      : 0;
  const avgFunction =
    handlerCoverages.length > 0
      ? handlerCoverages.reduce((sum, hc) => sum + hc.functionCoverage, 0) /
        handlerCoverages.length
      : 0;

  return {
    filePath,
    handlers: handlerCoverages,
    summary: {
      totalHandlers: handlers.length,
      coveredHandlers,
      averageLineCoverage: avgLine,
      averageBranchCoverage: avgBranch,
      averageFunctionCoverage: avgFunction,
    },
    p41Note: P41_NOTE,
  };
}

/**
 * target指定時の判定結果をMarkdownで整形する。
 */
function formatTargetJudgmentMarkdown(result: TargetHandlerResult): string {
  const lines: string[] = [];
  lines.push(`## ${result.targetName} の判定結果`);
  lines.push("");
  lines.push(`- 判定: ${result.judgment.isPassed ? "PASS" : "FAIL"}`);
  lines.push(`- ルール: ${result.judgment.rule}`);
  lines.push(`- 理由: ${result.judgment.reason}`);
  lines.push("");
  lines.push(`| 指標 | 値 | 最低基準 | 推奨基準 |`);
  lines.push(`| --- | ---: | ---: | ---: |`);
  lines.push(
    `| Line | ${result.targetCoverage.lineCoverage.toFixed(1)}% | 80% | 90% |`,
  );
  lines.push(
    `| Branch | ${result.targetCoverage.branchCoverage.toFixed(1)}% | 60% | 70% |`,
  );
  lines.push(
    `| Function | ${result.targetCoverage.functionCoverage.toFixed(1)}% | 80% | 90% |`,
  );
  lines.push("");
  return lines.join("\n");
}

/**
 * usageヘルプを表示する。
 */
function printUsage(): void {
  console.log(`使用方法:
  npx tsx scripts/coverage-by-handler.ts --file <path> [options]

オプション:
  --file <path>       解析対象のTypeScriptファイルパス（必須）
  --source <path>     --file のエイリアス
  --coverage <path>   coverage JSON パス（省略時: coverage/coverage-final.json）
  --target <handler>  特定ハンドラの判定（複数指定可）
  --format <type>     出力形式: markdown（デフォルト）/ json / both

例:
  npx tsx scripts/coverage-by-handler.ts --file src/main/ipc/skillHandlers.ts
  npx tsx scripts/coverage-by-handler.ts --file src/main/ipc/skillHandlers.ts --target skill:list
  npx tsx scripts/coverage-by-handler.ts --source src/main/ipc/skillHandlers.ts --coverage coverage/coverage-final.json
  npx tsx scripts/coverage-by-handler.ts --file src/main/ipc/skillHandlers.ts --format json`);
}

/**
 * メインエントリーポイント
 */
export async function main(
  args: string[],
  overrideCoverageJsonPath?: string,
): Promise<void> {
  const options = parseCliArgs(args);

  if (!options) {
    printUsage();
    process.exit(1);
  }

  // ハンドラ検出
  const handlers = extractHandlers(options.file);

  if (handlers.length === 0) {
    console.error(`エラー: ${options.file} からハンドラが検出されませんでした`);
    process.exit(1);
  }

  // カバレッジデータ読み込み
  const coverageJsonPath =
    overrideCoverageJsonPath ??
    options.coveragePath ??
    getDefaultCoverageJsonPath();
  const coverage = parseCoverageJson(coverageJsonPath, options.file);

  if (!coverage) {
    console.error(
      `エラー: ${options.file} のカバレッジデータが見つかりません。\n` +
        "先にテストをカバレッジ付きで実行してください:\n" +
        "  cd apps/desktop && pnpm vitest run <test-file> --coverage --coverage.include='scripts/coverage-by-handler.ts'",
    );
    process.exit(1);
  }

  // レポート生成
  const report = generateReport(handlers, coverage, options.file);

  // 特定ハンドラの判定
  if (options.targets.length > 0) {
    const targetResults = options.targets.map((targetName) => {
      const targetCoverage = report.handlers.find(
        (hc) => hc.handler.channelName === targetName,
      );
      if (!targetCoverage) {
        return { targetName, targetCoverage: null, judgment: null };
      }
      return {
        targetName,
        targetCoverage,
        judgment: judgePhase7(targetCoverage),
      };
    });

    const missingTargets = targetResults.filter(
      (result) => result.targetCoverage === null,
    );
    if (missingTargets.length > 0) {
      console.error(
        `エラー: ハンドラ "${missingTargets
          .map((result) => result.targetName)
          .join(", ")}" が見つかりません`,
      );
      process.exit(1);
    }

    const resolvedResults = targetResults.filter(
      (result): result is TargetHandlerResult =>
        result.targetCoverage !== null && result.judgment !== null,
    );

    const jsonPayload =
      resolvedResults.length === 1
        ? {
            handler: resolvedResults[0].targetCoverage,
            judgment: resolvedResults[0].judgment,
          }
        : {
            results: resolvedResults.map((result) => ({
              target: result.targetName,
              handler: result.targetCoverage,
              judgment: result.judgment,
            })),
            summary: {
              total: resolvedResults.length,
              passed: resolvedResults.filter(
                (result) => result.judgment.isPassed,
              ).length,
              failed: resolvedResults.filter(
                (result) => !result.judgment.isPassed,
              ).length,
            },
          };

    if (options.format === "json" || options.format === "both") {
      if (options.format === "both") {
        resolvedResults.forEach((result) => {
          console.log(formatTargetJudgmentMarkdown(result));
        });
      }
      console.log(JSON.stringify(jsonPayload, null, 2));
    } else {
      resolvedResults.forEach((result) => {
        console.log(formatTargetJudgmentMarkdown(result));
      });
    }

    if (resolvedResults.some((result) => !result.judgment.isPassed)) {
      process.exitCode = 1;
    }

    return;
  }

  // 全体レポート出力
  if (options.format === "json") {
    console.log(formatJsonReport(report));
  } else if (options.format === "both") {
    console.log(formatMarkdownReport(report));
    console.log("");
    console.log(formatJsonReport(report));
  } else {
    console.log(formatMarkdownReport(report));
  }
}

// CLI実行
const isDirectExecution =
  typeof process !== "undefined" &&
  process.argv[1] &&
  (process.argv[1].endsWith("coverage-by-handler.ts") ||
    process.argv[1].endsWith("coverage-by-handler.js"));

if (isDirectExecution) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(
      `エラー: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(1);
  });
}

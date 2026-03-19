import * as fs from "fs";
import * as path from "path";

export interface HandlerEntry {
  channel: string;
  argPattern: "object" | "primitive" | "none" | "unknown";
  filePath: string;
  line: number;
  rawSignature: string;
}

export interface PreloadEntry {
  channel: string;
  argPattern: "object" | "primitive" | "none" | "unknown";
  filePath: string;
  line: number;
  rawArgs: string;
}

export interface DriftEntry {
  channel: string;
  rule: "R-01" | "R-02" | "R-03" | "R-04";
  severity: "error" | "warning";
  message: string;
  mainSide?: { file: string; line: number; detail: string };
  preloadSide?: { file: string; line: number; detail: string };
}

export interface OrphanEntry {
  channel: string;
  side: "main-only" | "preload-only";
  file: string;
  line: number;
}

export interface DriftReport {
  timestamp: string;
  summary: {
    totalHandlers: number;
    totalPreloads: number;
    drifts: number;
    orphans: number;
  };
  drifts: DriftEntry[];
  orphans: OrphanEntry[];
  passed: boolean;
}

const HANDLER_PATTERN =
  /ipcMain\.(handle|on)\s*\(\s*(?:(['"`])([^'"`]+)\2|([A-Z_]+(?:\.[A-Z_]+)+))/;
const PRELOAD_PATTERN =
  /safe(Invoke|On)\s*\(\s*(?:(['"`])([^'"`]+)\2|([A-Z_]+(?:\.[A-Z_]+)+))(?:\s*,\s*(.+))?\)/;
const CHANNEL_CONST_PATTERN = /^\s*([A-Z_]+)\s*:\s*['"]([^'"]+)['"]/gm;

function classifyHandlerArgPattern(
  line: string,
  fullSignature: string,
): "object" | "primitive" | "none" | "unknown" {
  const arrowMatch = fullSignature.match(
    /\(\s*(?:_?event[^,)]*),?\s*([^)]*)\)/,
  );
  if (!arrowMatch) {
    const handlerRefMatch = line.match(
      /ipcMain\.(?:handle|on)\s*\([^,]+,\s*(\w+)\s*\)/,
    );
    if (handlerRefMatch) return "unknown";
    return "none";
  }
  const argsPart = arrowMatch[1].trim();
  if (!argsPart) return "none";
  if (argsPart.startsWith("{")) return "object";
  if (argsPart.match(/^[a-zA-Z_$]/)) return "primitive";
  return "unknown";
}

function classifyPreloadArgPattern(
  rawArgs: string,
): "object" | "primitive" | "none" | "unknown" {
  if (!rawArgs || rawArgs.trim() === "") return "none";
  const trimmed = rawArgs.trim();
  if (trimmed.startsWith("{")) return "object";
  if (trimmed.match(/^[a-zA-Z_$0-9'"]/)) return "primitive";
  return "unknown";
}

export function extractMainHandlers(
  sourceContent: string,
  filePath: string,
): HandlerEntry[] {
  const entries: HandlerEntry[] = [];
  const lines = sourceContent.split("\n");
  let inBlockComment = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trimStart();
    if (inBlockComment) {
      if (trimmed.includes("*/")) inBlockComment = false;
      continue;
    }
    if (trimmed.startsWith("//")) continue;
    if (trimmed.startsWith("/*")) {
      if (!trimmed.includes("*/")) inBlockComment = true;
      continue;
    }

    let combined = line;
    let match = HANDLER_PATTERN.exec(combined);
    if (!match && /ipcMain\.(handle|on)\s*\(\s*$/.test(trimmed)) {
      const nextLines = lines.slice(i, Math.min(i + 5, lines.length)).join(" ");
      match = HANDLER_PATTERN.exec(nextLines);
      if (match) combined = nextLines;
    }
    if (!match) continue;

    const literalChannel = match[3];
    const constRef = match[4];
    const channel = literalChannel ?? constRef ?? "";
    if (!channel) continue;

    let rawSignature = line;
    let depth = 0;
    let started = false;
    for (let j = i; j < Math.min(i + 10, lines.length); j++) {
      for (const ch of lines[j]) {
        if (ch === "(") {
          depth++;
          started = true;
        }
        if (ch === ")") depth--;
      }
      if (j > i) rawSignature += "\n" + lines[j];
      if (started && depth <= 0) break;
    }

    const argPattern = classifyHandlerArgPattern(combined, rawSignature);
    entries.push({
      channel,
      argPattern,
      filePath,
      line: i + 1,
      rawSignature: line.trim(),
    });
  }

  return entries;
}

export function extractPreloadEntries(
  sourceContent: string,
  filePath: string,
): PreloadEntry[] {
  const entries: PreloadEntry[] = [];
  const lines = sourceContent.split("\n");
  let inBlockComment = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trimStart();
    if (inBlockComment) {
      if (trimmed.includes("*/")) inBlockComment = false;
      continue;
    }
    if (trimmed.startsWith("//")) continue;
    if (trimmed.startsWith("/*")) {
      if (!trimmed.includes("*/")) inBlockComment = true;
      continue;
    }

    const match = PRELOAD_PATTERN.exec(line);
    if (!match) continue;

    const literalChannel = match[3];
    const constRef = match[4];
    const channel = literalChannel ?? constRef ?? "";
    if (!channel) continue;

    const rawArgs = match[5] ?? "";
    const cleanArgs = rawArgs.replace(/\).*$/, "").trim();
    const argPattern = classifyPreloadArgPattern(cleanArgs);

    entries.push({
      channel,
      argPattern,
      filePath,
      line: i + 1,
      rawArgs: cleanArgs,
    });
  }

  return entries;
}

export function resolveChannelMap(
  channelsContent: string,
): Map<string, string> {
  const map = new Map<string, string>();
  let m: RegExpExecArray | null;
  const re = new RegExp(CHANNEL_CONST_PATTERN.source, "gm");
  while ((m = re.exec(channelsContent)) !== null) {
    map.set(m[1], m[2]);
  }
  return map;
}

function resolveChannel(raw: string, channelMap: Map<string, string>): string {
  if (!raw.includes(".")) return raw;
  const parts = raw.split(".");
  const key = parts[parts.length - 1];
  return channelMap.get(key) ?? raw;
}

export function matchAndValidate(
  handlers: HandlerEntry[],
  preloads: PreloadEntry[],
  channelMap?: Map<string, string>,
): DriftReport {
  const map = channelMap ?? new Map<string, string>();

  const resolvedHandlers = handlers.map((h) => ({
    ...h,
    resolvedChannel: resolveChannel(h.channel, map),
    isLiteral: !h.channel.includes("."),
  }));

  const resolvedPreloads = preloads.map((p) => ({
    ...p,
    resolvedChannel: resolveChannel(p.channel, map),
    isLiteral: !p.channel.includes("."),
  }));

  const handlerMap = new Map<string, (typeof resolvedHandlers)[number][]>();
  for (const h of resolvedHandlers) {
    const ch = h.resolvedChannel;
    if (!handlerMap.has(ch)) handlerMap.set(ch, []);
    handlerMap.get(ch)!.push(h);
  }

  const preloadMap = new Map<string, (typeof resolvedPreloads)[number][]>();
  for (const p of resolvedPreloads) {
    const ch = p.resolvedChannel;
    if (!preloadMap.has(ch)) preloadMap.set(ch, []);
    preloadMap.get(ch)!.push(p);
  }

  const allChannels = new Set([...handlerMap.keys(), ...preloadMap.keys()]);

  const drifts: DriftEntry[] = [];
  const orphans: OrphanEntry[] = [];

  for (const channel of allChannels) {
    const hEntries = handlerMap.get(channel) ?? [];
    const pEntries = preloadMap.get(channel) ?? [];

    if (hEntries.length > 0 && pEntries.length === 0) {
      const h = hEntries[0];
      orphans.push({
        channel,
        side: "main-only",
        file: h.filePath,
        line: h.line,
      });
      drifts.push({
        channel,
        rule: "R-01",
        severity: "warning",
        message: `Handler registered in main but no safeInvoke/safeOn found in preload`,
        mainSide: { file: h.filePath, line: h.line, detail: h.rawSignature },
      });
      continue;
    }

    if (hEntries.length === 0 && pEntries.length > 0) {
      const p = pEntries[0];
      orphans.push({
        channel,
        side: "preload-only",
        file: p.filePath,
        line: p.line,
      });
      drifts.push({
        channel,
        rule: "R-04",
        severity: "error",
        message: `safeInvoke/safeOn used in preload but no ipcMain.handle/on found in main`,
        preloadSide: { file: p.filePath, line: p.line, detail: p.rawArgs },
      });
      continue;
    }

    const h = hEntries[0];
    const p = pEntries[0];

    if (h.isLiteral) {
      drifts.push({
        channel,
        rule: "R-03",
        severity: "warning",
        message: `String literal channel name in main handler; use IPC_CHANNELS constant`,
        mainSide: { file: h.filePath, line: h.line, detail: h.rawSignature },
      });
    }
    if (p.isLiteral) {
      drifts.push({
        channel,
        rule: "R-03",
        severity: "warning",
        message: `String literal channel name in preload; use IPC_CHANNELS constant`,
        preloadSide: { file: p.filePath, line: p.line, detail: p.rawArgs },
      });
    }

    const hPat = h.argPattern;
    const pPat = p.argPattern;
    const bothKnown =
      hPat !== "unknown" &&
      pPat !== "unknown" &&
      hPat !== "none" &&
      pPat !== "none";

    if (bothKnown && hPat !== pPat) {
      drifts.push({
        channel,
        rule: "R-02",
        severity: "error",
        message: `Argument pattern mismatch: main expects ${hPat}, preload sends ${pPat} (P44)`,
        mainSide: { file: h.filePath, line: h.line, detail: h.rawSignature },
        preloadSide: { file: p.filePath, line: p.line, detail: p.rawArgs },
      });
    }
  }

  const errors = drifts.filter((d) => d.severity === "error");
  return {
    timestamp: new Date().toISOString(),
    summary: {
      totalHandlers: handlers.length,
      totalPreloads: preloads.length,
      drifts: drifts.length,
      orphans: orphans.length,
    },
    drifts,
    orphans,
    passed: errors.length === 0,
  };
}

export function generateReport(
  report: DriftReport,
  format: "markdown" | "json",
): string {
  if (format === "json") {
    return JSON.stringify(report, null, 2);
  }

  const lines: string[] = [];
  lines.push("# IPC Contract Drift Report");
  lines.push("");
  lines.push(`**Timestamp**: ${report.timestamp}`);
  lines.push(
    `**Summary**: handlers=${report.summary.totalHandlers}, preloads=${report.summary.totalPreloads}, drifts=${report.summary.drifts}, orphans=${report.summary.orphans}`,
  );
  lines.push("");

  if (report.passed && report.drifts.length === 0) {
    lines.push("## ALL CHECKS PASSED");
    return lines.join("\n");
  }

  if (report.drifts.length > 0) {
    lines.push("## Drifts");
    lines.push("");
    lines.push("| Channel | Rule | Severity | Message |");
    lines.push("| --- | --- | --- | --- |");
    for (const d of report.drifts) {
      lines.push(`| ${d.channel} | ${d.rule} | ${d.severity} | ${d.message} |`);
    }
    lines.push("");
  }

  if (report.orphans.length > 0) {
    lines.push("## Orphans");
    lines.push("");
    lines.push("| Channel | Side | File | Line |");
    lines.push("| --- | --- | --- | --- |");
    for (const o of report.orphans) {
      lines.push(`| ${o.channel} | ${o.side} | ${o.file} | ${o.line} |`);
    }
    lines.push("");
  }

  lines.push(
    report.passed ? "## Result: PASSED (warnings only)" : "## Result: FAILED",
  );
  return lines.join("\n");
}

function collectTsFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "__tests__" || entry.name === "node_modules") continue;
      results.push(...collectTsFiles(full));
    } else if (
      entry.isFile() &&
      entry.name.endsWith(".ts") &&
      !entry.name.endsWith(".test.ts") &&
      !entry.name.endsWith(".d.ts")
    ) {
      if (!full.includes("__tests__")) {
        results.push(full);
      }
    }
  }
  return results;
}

export function main(argv: string[]): void {
  const reportOnly = argv.includes("--report-only");
  const strict = argv.includes("--strict");
  const formatIdx = argv.indexOf("--format");
  const format: "markdown" | "json" =
    formatIdx !== -1 && argv[formatIdx + 1] === "json" ? "json" : "markdown";

  const scriptFile = process.argv[1] ?? "";
  const scriptDir = scriptFile.includes("check-ipc-contracts")
    ? path.dirname(path.resolve(scriptFile))
    : path.join(process.cwd(), "apps", "desktop", "scripts");
  const projectRoot = path.resolve(scriptDir, "..");
  const mainDir = path.join(projectRoot, "src", "main");
  const preloadDir = path.join(projectRoot, "src", "preload");
  const channelsFile = path.join(preloadDir, "channels.ts");

  let channelMap: Map<string, string> = new Map();
  if (fs.existsSync(channelsFile)) {
    const content = fs.readFileSync(channelsFile, "utf-8");
    channelMap = resolveChannelMap(content);
  }

  const mainFiles = collectTsFiles(mainDir);
  const preloadFiles = collectTsFiles(preloadDir);

  const allHandlers: HandlerEntry[] = [];
  for (const f of mainFiles) {
    const content = fs.readFileSync(f, "utf-8");
    allHandlers.push(...extractMainHandlers(content, f));
  }

  const allPreloads: PreloadEntry[] = [];
  for (const f of preloadFiles) {
    const content = fs.readFileSync(f, "utf-8");
    allPreloads.push(...extractPreloadEntries(content, f));
  }

  const report = matchAndValidate(allHandlers, allPreloads, channelMap);
  const output = generateReport(report, format);
  console.log(output);

  if (reportOnly) {
    return;
  }

  const errors = report.drifts.filter((d) => d.severity === "error");
  const warnings = report.drifts.filter((d) => d.severity === "warning");

  if (errors.length > 0) {
    console.error(`\n${errors.length} error(s) found. Exit code: 1`);
    process.exitCode = 1;
    return;
  }

  if (strict && warnings.length > 0) {
    console.error(
      `\n${warnings.length} warning(s) found (--strict mode). Exit code: 1`,
    );
    process.exitCode = 1;
    return;
  }
}

const scriptName = "check-ipc-contracts";
const isDirectRun = process.argv[1]?.includes(scriptName);

if (isDirectRun) {
  try {
    main(process.argv.slice(2));
  } catch (err) {
    console.error(
      `Fatal error: ${err instanceof Error ? err.message : String(err)}`,
    );
    process.exitCode = 2;
  }
}

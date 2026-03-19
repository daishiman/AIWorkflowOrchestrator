#!/usr/bin/env node
/**
 * 仕様検索スクリプト
 *
 * 用途: references/ と indexes/ 配下のドキュメントからキーワード検索
 * 実行: node scripts/search-spec.js <keyword> [options]
 *
 * オプション:
 *   --context, -C <n>  前後n行を表示（デフォルト: 2）
 *   --files-only, -l   ファイル名のみ表示
 *   --count, -c        マッチ数のみ表示
 *   --help, -h         ヘルプ表示
 */

import { readdir, readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REFS_DIR = join(__dirname, "..", "references");
const INDEXES_DIR = join(__dirname, "..", "indexes");
const KEYWORDS_INDEX_PATH = join(INDEXES_DIR, "keywords.json");
const SEARCH_TARGETS = [
  { scope: "indexes", dir: INDEXES_DIR },
  { scope: "references", dir: REFS_DIR },
];
const DEFAULT_MAX_FILES = 12;
const PATH_PRIORITY = new Map([
  ["indexes/quick-reference-search-patterns.md", 100],
  ["indexes/quick-reference.md", 95],
  ["indexes/resource-map.md", 90],
  ["indexes/topic-map.md", 85],
  ["references/workflow-ai-runtime-authmode-unification.md", 80],
  ["references/api-ipc-system-core.md", 79],
  ["references/interfaces-rag.md", 78],
  ["references/interfaces-rag-entity-extraction.md", 77],
  ["references/interfaces-rag-search.md", 76],
  ["references/interfaces-rag-graphrag-query.md", 75],
  ["references/interfaces-rag-community-summarization.md", 74],
  ["references/api-internal-embedding.md", 73],
  ["references/rag-services.md", 72],
  ["references/rag-query-pipeline.md", 71],
  ["references/rag-search-hybrid.md", 70],
  ["references/rag-search-crag.md", 69],
  ["references/error-handling.md", 68],
  ["references/security-electron-ipc.md", 67],
  ["references/quality-requirements.md", 66],
  ["references/task-workflow.md", 72],
  ["references/lessons-learned.md", 71],
  ["references/lessons-learned-current.md", 70],
]);
const EXCLUDED_PATH_PATTERNS = [
  /^references\/logs-archive-/,
  /^references\/.*-history.*\.md$/,
  /^references\/task-workflow-(active|backlog|history|completed.*)\.md$/,
  /^references\/lessons-learned-(current|archive.*)\.md$/,
  /^references\/phase-12-documentation-retrospective\.md$/,
];
const COMPOSITE_PHRASES = [
  ["entity", "extraction"],
  ["relation", "extraction"],
  ["community", "summary"],
  ["graph", "summary"],
  ["query", "classifier"],
  ["auth", "mode"],
  ["safe", "invoke"],
  ["terminal", "surface"],
  ["integrated", "api", "runtime"],
  ["long", "running", "job"],
];
const QUERY_EXPANSIONS = new Map([
  ["aicheckconnection", ["AI_CHECK_CONNECTION", "legacy health check", "api-ipc-system-core.md"]],
  ["aiindex", ["AI_INDEX", "long-running job", "api-ipc-system-core.md"]],
  ["entityextraction", ["IEntityExtractor", "Entity Extraction", "interfaces-rag-entity-extraction.md"]],
  ["relationextraction", ["IRelationExtractor", "Relation Extraction", "interfaces-rag.md"]],
  ["communitysummary", ["ICommunitySummarizer", "Community Summary", "interfaces-rag-community-summarization.md"]],
  ["graphsummary", ["community summary", "ICommunitySummarizer", "rag-services.md"]],
  ["queryclassifier", ["LLMQueryClassifier", "query classification", "rag-services.md"]],
  ["llmqueryclassifier", ["query classifier", "rag-services.md"]],
  ["integratedapiruntime", ["workflow-ai-runtime-authmode-unification.md", "runtime capability"]],
  ["terminalsurface", ["Claude Code terminal surface", "guidance-only"]],
  ["guidanceonly", ["guidance-only", "guidance only"]],
  ["longrunningjob", ["AI_INDEX", "job lifecycle", "long-running job"]],
]);

// ANSI colors
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function printHelp() {
  console.log(`
${colors.bright}仕様検索スクリプト${colors.reset}

${colors.cyan}使用方法:${colors.reset}
  node scripts/search-spec.js <keyword> [options]

${colors.cyan}オプション:${colors.reset}
  --context, -C <n>  前後n行を表示（デフォルト: 2）
  --files-only, -l   ファイル名のみ表示
  --count, -c        マッチ数のみ表示
  --case-sensitive   大文字小文字を区別
  --all              canonical 以外（history / archive 等）も含めて検索
  --max-files <n>    通常表示時の最大ファイル数（デフォルト: 12）
  --help, -h         ヘルプ表示

${colors.cyan}例:${colors.reset}
  node scripts/search-spec.js "認証"
  node scripts/search-spec.js "Turso" -C 5
  node scripts/search-spec.js "API" --files-only
  node scripts/search-spec.js "authentication" --case-sensitive

※ 既定では canonical spec を優先し、history / archive 系は除外します。
`);
}

function parseArgs(args) {
  const options = {
    keyword: null,
    context: 2,
    filesOnly: false,
    countOnly: false,
    caseSensitive: false,
    canonicalOnly: true,
    maxFiles: DEFAULT_MAX_FILES,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else if (arg === "--context" || arg === "-C") {
      options.context = parseInt(args[++i], 10) || 2;
    } else if (arg === "--files-only" || arg === "-l") {
      options.filesOnly = true;
    } else if (arg === "--count" || arg === "-c") {
      options.countOnly = true;
    } else if (arg === "--case-sensitive") {
      options.caseSensitive = true;
    } else if (arg === "--all") {
      options.canonicalOnly = false;
    } else if (arg === "--max-files") {
      options.maxFiles = parseInt(args[++i], 10) || DEFAULT_MAX_FILES;
    } else if (!arg.startsWith("-")) {
      options.keyword = arg;
    }
  }

  return options;
}

function normalizeLookup(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9\u3040-\u30ff\u3400-\u9fff]+/giu, "");
}

function highlightMatch(line, keyword, caseSensitive) {
  const flags = caseSensitive ? "g" : "gi";
  const regex = new RegExp(`(${escapeRegex(keyword)})`, flags);
  return line.replace(regex, `${colors.red}${colors.bright}$1${colors.reset}`);
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function splitCompositeKeyword(keyword) {
  const rawTokens = keyword
    .split(/[\s,/]+/u)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);

  const tokens = [];
  for (let i = 0; i < rawTokens.length; i++) {
    let matchedPhrase = null;
    for (const phrase of COMPOSITE_PHRASES) {
      const segment = rawTokens
        .slice(i, i + phrase.length)
        .map((token) => token.toLowerCase());
      if (segment.length === phrase.length && segment.join(" ") === phrase.join(" ")) {
        matchedPhrase = rawTokens.slice(i, i + phrase.length).join(" ");
        i += phrase.length - 1;
        break;
      }
    }

    if (matchedPhrase) {
      tokens.push(matchedPhrase);
      continue;
    }

    tokens.push(rawTokens[i]);
  }

  return [...new Set(tokens)];
}

function getPathPriority(path) {
  if (PATH_PRIORITY.has(path)) {
    return PATH_PRIORITY.get(path);
  }

  if (path.startsWith("indexes/")) {
    return 60;
  }
  if (/^references\/workflow-/.test(path)) {
    return 55;
  }
  if (/^references\/api-ipc-/.test(path)) {
    return 50;
  }
  if (/^references\/interfaces-/.test(path)) {
    return 45;
  }
  if (/^references\/(architecture|rag|llm|api-internal)-/.test(path)) {
    return 40;
  }

  return 0;
}

function isSearchablePath(path, options) {
  if (!options.canonicalOnly) {
    return true;
  }
  return !EXCLUDED_PATH_PATTERNS.some((pattern) => pattern.test(path));
}

function isHintedPath(path, hintedFiles) {
  if (!hintedFiles || hintedFiles.size === 0) {
    return false;
  }
  const fileName = path.split("/").pop();
  return hintedFiles.has(path) || hintedFiles.has(fileName);
}

function getMatchedKeywords(results) {
  const keywords = new Set();
  for (const result of results) {
    if (!result.keywords) {
      continue;
    }
    for (const keyword of result.keywords) {
      keywords.add(keyword);
    }
  }
  return [...keywords];
}

function sortFileResults(fileResults, hintedFiles = new Set()) {
  return [...fileResults].sort((a, b) => {
    const aHint = isHintedPath(a.path, hintedFiles) ? 1 : 0;
    const bHint = isHintedPath(b.path, hintedFiles) ? 1 : 0;
    if (aHint !== bHint) {
      return bHint - aHint;
    }

    const aKeywordCount = getMatchedKeywords(a.results).length || 1;
    const bKeywordCount = getMatchedKeywords(b.results).length || 1;
    const keywordDiff = bKeywordCount - aKeywordCount;
    if (keywordDiff !== 0) {
      return keywordDiff;
    }

    const priorityDiff = getPathPriority(b.path) - getPathPriority(a.path);
    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    const focusDiff = a.results.length - b.results.length;
    if (focusDiff !== 0) {
      return focusDiff;
    }

    return a.path.localeCompare(b.path);
  });
}

async function loadKeywordsIndex() {
  try {
    const raw = JSON.parse(await readFile(KEYWORDS_INDEX_PATH, "utf-8"));
    return raw.keywords && typeof raw.keywords === "object" ? raw.keywords : {};
  } catch {
    return {};
  }
}

function addUniqueTerm(terms, seen, term) {
  if (!term) {
    return;
  }
  const normalized = normalizeLookup(term);
  if (normalized.length === 0 || seen.has(normalized)) {
    return;
  }
  seen.add(normalized);
  terms.push(term);
}

function buildQueryTerms(keyword) {
  const seen = new Set();
  const terms = [];
  addUniqueTerm(terms, seen, keyword);

  const compositeTerms = splitCompositeKeyword(keyword);
  for (const term of compositeTerms) {
    addUniqueTerm(terms, seen, term);
  }

  const expansionCandidates = [keyword, ...compositeTerms];
  for (const candidate of expansionCandidates) {
    const normalized = normalizeLookup(candidate);
    const expansions = QUERY_EXPANSIONS.get(normalized) || [];
    for (const expansion of expansions) {
      addUniqueTerm(terms, seen, expansion);
    }
  }

  return terms;
}

function collectKeywordIndexHints(keywordIndex, terms) {
  const hintedFiles = new Set();
  const normalizedTerms = terms
    .map((term) => normalizeLookup(term))
    .filter((term) => term.length >= 5);

  for (const [key, files] of Object.entries(keywordIndex)) {
    if (!Array.isArray(files)) {
      continue;
    }
    const normalizedKey = normalizeLookup(key);

    for (const term of normalizedTerms) {
      const keyMatch =
        normalizedKey === term ||
        normalizedKey.includes(term) ||
        term.includes(normalizedKey);

      for (const file of files) {
        const normalizedFile = normalizeLookup(file);
        if (keyMatch || normalizedFile.includes(term)) {
          hintedFiles.add(file);
        }
      }
    }
  }

  return hintedFiles;
}

async function searchInFile(filePath, keyword, options) {
  const content = await readFile(filePath, "utf-8");
  const lines = content.split("\n");
  const results = [];
  const flags = options.caseSensitive ? "" : "i";
  const regex = new RegExp(escapeRegex(keyword), flags);

  for (let i = 0; i < lines.length; i++) {
    if (regex.test(lines[i])) {
      results.push({
        lineNum: i + 1,
        line: lines[i],
        context: {
          before: lines.slice(Math.max(0, i - options.context), i),
          after: lines.slice(i + 1, i + 1 + options.context),
        },
      });
    }
  }

  return results;
}

async function collectSearchResults(keyword, options, hintedFiles = new Set()) {
  let totalMatches = 0;
  const fileResults = [];

  for (const target of SEARCH_TARGETS) {
    const files = await readdir(target.dir);
    const mdFiles = files.filter((f) => f.endsWith(".md")).sort();

    for (const file of mdFiles) {
      const relativePath = `${target.scope}/${file}`;
      if (!isSearchablePath(relativePath, options)) {
        continue;
      }
      const filePath = join(target.dir, file);
      const results = await searchInFile(filePath, keyword, options);

      if (results.length > 0) {
        totalMatches += results.length;
        fileResults.push({
          path: relativePath,
          results,
        });
      }
    }
  }

  return {
    keyword,
    totalMatches,
    fileResults: sortFileResults(fileResults, hintedFiles),
  };
}

function aggregateRuns(runs, hintedFiles = new Set()) {
  const fileMap = new Map();

  for (const run of runs) {
    for (const { path, results } of run.fileResults) {
      if (!fileMap.has(path)) {
        fileMap.set(path, new Map());
      }
      const lineMap = fileMap.get(path);

      for (const result of results) {
        if (!lineMap.has(result.lineNum)) {
          lineMap.set(result.lineNum, {
            ...result,
            keywords: new Set(),
          });
        }
        lineMap.get(result.lineNum).keywords.add(run.keyword);
      }
    }
  }

  const fileResults = [...fileMap.entries()]
    .map(([path, lineMap]) => ({
      path,
      results: [...lineMap.values()].sort((a, b) => a.lineNum - b.lineNum),
    }));

  const totalMatches = fileResults.reduce(
    (sum, entry) => sum + entry.results.length,
    0,
  );

  return { totalMatches, fileResults: sortFileResults(fileResults, hintedFiles) };
}

function highlightMatches(line, keywords, caseSensitive) {
  let highlighted = line;
  for (const keyword of keywords) {
    highlighted = highlightMatch(highlighted, keyword, caseSensitive);
  }
  return highlighted;
}

function printResults(
  { keyword, totalMatches, fileResults, fallbackKeywords, expansionReason },
  options,
) {
  const { filesOnly, countOnly, caseSensitive, maxFiles } = options;

  if (countOnly) {
    console.log(`${totalMatches}`);
    return;
  }

  if (fileResults.length === 0) {
    console.log(
      `${colors.yellow}「${keyword}」に一致する結果はありません${colors.reset}`,
    );
    return;
  }

  if (fallbackKeywords && fallbackKeywords.length > 0) {
    console.log(
      `${colors.yellow}${expansionReason || "直接一致が不足したため、補助クエリを追加検索しました"}:${colors.reset} ${fallbackKeywords.join(", ")}`,
    );
  }

  const shownFileResults = filesOnly ? fileResults : fileResults.slice(0, maxFiles);
  const hiddenFileCount = filesOnly ? 0 : Math.max(0, fileResults.length - shownFileResults.length);
  console.log(
    `\n${colors.green}${colors.bright}検索結果: "${keyword}"${colors.reset} (${totalMatches}件 / ${fileResults.length}ファイル)\n`,
  );

  if (filesOnly) {
    for (const { path } of shownFileResults) {
      console.log(path);
    }
    return;
  }

  for (const { path, results } of shownFileResults) {
    const matchedKeywords = getMatchedKeywords(results);
    const keywordSummary =
      matchedKeywords.length > 0
        ? ` / ${matchedKeywords.length}語一致: ${matchedKeywords.join(", ")}`
        : "";
    console.log(
      `${colors.cyan}${colors.bright}${path}${colors.reset} (${results.length}件${keywordSummary})`,
    );

    for (const { lineNum, line, context: ctx, keywords } of results) {
      console.log(
        `${colors.dim}─────────────────────────────────${colors.reset}`,
      );

      ctx.before.forEach((l, idx) => {
        const num = lineNum - ctx.before.length + idx;
        console.log(
          `${colors.dim}${num.toString().padStart(4)}│${colors.reset} ${l}`,
        );
      });

      const highlighted = keywords
        ? highlightMatches(line, [...keywords], caseSensitive)
        : highlightMatch(line, keyword, caseSensitive);
      console.log(
        `${colors.yellow}${lineNum.toString().padStart(4)}│${colors.reset} ${highlighted}`,
      );

      ctx.after.forEach((l, idx) => {
        const num = lineNum + 1 + idx;
        console.log(
          `${colors.dim}${num.toString().padStart(4)}│${colors.reset} ${l}`,
        );
      });
    }
    console.log("");
  }

  console.log(`${colors.dim}─────────────────────────────────${colors.reset}`);
  console.log(
    `${colors.green}合計: ${totalMatches}件 (${fileResults.length}ファイル)${colors.reset}\n`,
  );
  if (hiddenFileCount > 0) {
    console.log(
      `${colors.dim}表示は上位 ${shownFileResults.length} ファイルまでです。残り ${hiddenFileCount} ファイルを見る場合は --max-files または --all を使用してください。${colors.reset}\n`,
    );
  }
}

function shouldExpandResults(fileResults) {
  return (
    fileResults.length === 0 ||
    fileResults.every(({ path }) => path.startsWith("indexes/"))
  );
}

async function search(options) {
  const { keyword } = options;

  if (!keyword) {
    console.error(
      `${colors.red}エラー: 検索キーワードを指定してください${colors.reset}`,
    );
    console.log("使用方法: node scripts/search-spec.js <keyword>");
    process.exit(2);
  }

  const keywordIndex = await loadKeywordsIndex();
  const queryTerms = buildQueryTerms(keyword);
  const hintedFiles = collectKeywordIndexHints(keywordIndex, queryTerms);

  const directRun = await collectSearchResults(keyword, options, hintedFiles);
  if (!shouldExpandResults(directRun.fileResults)) {
    printResults(directRun, options);
    return;
  }

  const fallbackKeywords = queryTerms.filter(
    (term) => normalizeLookup(term) !== normalizeLookup(keyword),
  );
  if (fallbackKeywords.length === 0) {
    printResults(directRun, options);
    return;
  }

  const runs = [];
  if (directRun.fileResults.length > 0) {
    runs.push(directRun);
  }

  for (const token of fallbackKeywords) {
    const run = await collectSearchResults(token, options, hintedFiles);
    if (run.fileResults.length > 0) {
      runs.push(run);
    }
  }

  if (runs.length === 0) {
    printResults(directRun, options);
    return;
  }

  const aggregated = aggregateRuns(runs, hintedFiles);
  printResults(
    {
      keyword,
      totalMatches: aggregated.totalMatches,
      fileResults: aggregated.fileResults,
      fallbackKeywords,
      expansionReason:
        directRun.fileResults.length === 0
          ? "直接一致が0件だったため"
          : "索引ドキュメントのみ一致したため、formal anchor と canonical spec へ展開しました",
    },
    options,
  );
}

// メイン実行
const args = process.argv.slice(2);
const options = parseArgs(args);
search(options).catch((err) => {
  console.error(`${colors.red}エラー:${colors.reset}`, err.message);
  process.exit(1);
});

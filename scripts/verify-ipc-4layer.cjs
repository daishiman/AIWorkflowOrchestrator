#!/usr/bin/env node
/**
 * IPC 4層整合性検証スクリプト
 *
 * shared → preload → main → renderer の4層で定義・使用される
 * IPCチャネルの整合性を自動検証する。
 *
 * @typedef {Object} ValidationResult
 * @property {string} rule
 * @property {"pass" | "fail"} status
 * @property {string[]} missing
 * @property {string} description
 *
 * @typedef {Object} ParsedPreload
 * @property {Set<string>} invoke
 * @property {Set<string>} on
 * @property {Set<string>} defined
 */

"use strict";

const fs = require("fs");
const path = require("path");

// ====== パス定数 ======
const PATHS = {
  SHARED_CHANNELS: "packages/shared/src/ipc/channels.ts",
  PRELOAD_CHANNELS: "apps/desktop/src/preload/channels.ts",
  MAIN_IPC_DIR: "apps/desktop/src/main",
  PRELOAD_DIR: "apps/desktop/src/preload",
  RENDERER_DIR: "apps/desktop/src/renderer",
};

// ====== 参照マーカープレフィックス ======
/** ipcMain.handle(IPC_CHANNELS.KEY, ...) 等で未解決のキー参照 */
const REF_IPC_CHANNELS = "__IPC_CHANNELS_REF__:";
/** ipcMain.handle(OTHER_CONST.KEY, ...) 等で未解決のグループ参照 */
const REF_CHANNELS = "__CHANNELS_REF__:";
/** preload 内で GROUP.MEMBER 参照が未解決の場合 */
const REF_PRELOAD = "__REF__:";
/** preload 内で standalone 参照が未解決の場合 */
const REF_STANDALONE = "__STANDALONE__:";

// ====== ユーティリティ ======

/**
 * コメントを除去する（文字列リテラル内のコメントパターンは保持）
 * @param {string} content
 * @returns {string}
 */
function stripComments(content) {
  let result = "";
  let i = 0;
  while (i < content.length) {
    // 文字列リテラル (ダブルクォート)
    if (content[i] === '"') {
      let j = i + 1;
      while (j < content.length && content[j] !== '"') {
        if (content[j] === "\\") j++; // エスケープ
        j++;
      }
      result += content.slice(i, j + 1);
      i = j + 1;
      continue;
    }
    // 文字列リテラル (シングルクォート)
    if (content[i] === "'") {
      let j = i + 1;
      while (j < content.length && content[j] !== "'") {
        if (content[j] === "\\") j++;
        j++;
      }
      result += content.slice(i, j + 1);
      i = j + 1;
      continue;
    }
    // テンプレートリテラル (バッククォート)
    if (content[i] === "`") {
      let j = i + 1;
      while (j < content.length && content[j] !== "`") {
        if (content[j] === "\\") j++;
        j++;
      }
      result += content.slice(i, j + 1);
      i = j + 1;
      continue;
    }
    // ブロックコメント
    if (
      content[i] === "/" &&
      i + 1 < content.length &&
      content[i + 1] === "*"
    ) {
      let j = i + 2;
      while (
        j < content.length - 1 &&
        !(content[j] === "*" && content[j + 1] === "/")
      ) {
        j++;
      }
      // コメントを空白に置換（改行は維持）
      const commentBlock = content.slice(i, j + 2);
      result += commentBlock.replace(/[^\n]/g, " ");
      i = j + 2;
      continue;
    }
    // 行コメント
    if (
      content[i] === "/" &&
      i + 1 < content.length &&
      content[i + 1] === "/"
    ) {
      let j = i + 2;
      while (j < content.length && content[j] !== "\n") {
        j++;
      }
      i = j;
      continue;
    }
    result += content[i];
    i++;
  }
  return result;
}

/**
 * sharedGroupMap をフラットな KEY → value マップに変換する
 * 複数のグループにまたがるキーを一意の名前でアクセスするために使用
 * @param {Map<string, Map<string, string>>} sharedGroupMap
 * @returns {Map<string, string>}
 */
function flattenSharedGroupMap(sharedGroupMap) {
  const flat = new Map();
  for (const [, keyMap] of sharedGroupMap) {
    for (const [key, value] of keyMap) {
      flat.set(key, value);
    }
  }
  return flat;
}

/**
 * 文字列を正規表現リテラル用にエスケープする
 * @param {string} value
 * @returns {string}
 */
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * const で定義されたオブジェクト/文字列から key → value マップを作る
 * @param {string} content
 * @returns {Map<string, string>}
 */
function buildConstValueMap(content) {
  const stripped = stripComments(content);
  const map = new Map();

  const objectRegex =
    /(?:export\s+)?const\s+(\w+)\s*(?::\s*[^=]+)?\s*=\s*\{([\s\S]*?)\}\s*(?:as\s+const)?/g;
  let objectMatch;
  while ((objectMatch = objectRegex.exec(stripped)) !== null) {
    const constName = objectMatch[1];
    const body = objectMatch[2];
    const entryRegex = /(\w+)\s*:\s*["']([^"']+)["']/g;
    let entryMatch;
    while ((entryMatch = entryRegex.exec(body)) !== null) {
      map.set(`${constName}.${entryMatch[1]}`, entryMatch[2]);
    }
  }

  const stringRegex =
    /(?:export\s+)?const\s+(\w+)\s*(?::\s*[^=]+)?\s*=\s*["']([^"']+)["']\s+as\s+const/g;
  let stringMatch;
  while ((stringMatch = stringRegex.exec(stripped)) !== null) {
    const name = stringMatch[1];
    const value = stringMatch[2];
    map.set(name, value);
    map.set(`${name}.${name}`, value);
  }

  return map;
}

/**
 * ipcMain を束縛したローカル alias 名を集める
 * @param {string} content
 * @returns {Set<string>}
 */
function collectIpcMainAliases(content) {
  const stripped = stripComments(content);
  const aliases = new Set(["ipcMain", "main"]);

  const aliasRegex =
    /(?:const|let|var)\s+(\w+)\s*(?::\s*[^=]+)?\s*=\s*[^;\n]*\bipcMain\b[^;\n]*;/g;
  let match;
  while ((match = aliasRegex.exec(stripped)) !== null) {
    aliases.add(match[1]);
  }

  return aliases;
}

/**
 * 参照式をチャネル文字列または検出マーカーへ解決する
 * @param {string} reference
 * @param {Map<string, string>} localMap
 * @param {Map<string, string>} [externalMap]
 * @returns {string | null}
 */
function resolveChannelReference(reference, localMap, externalMap) {
  const trimmed = reference
    .trim()
    .replace(/^[[(]+/, "")
    .replace(/[),;]+$/g, "");
  if (!trimmed) return null;

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith("`") && trimmed.endsWith("`"))
  ) {
    const value = trimmed.slice(1, -1);
    return value.includes(":") ? value : null;
  }

  const propMatch = trimmed.match(/^(\w+)\.(\w+)$/);
  if (propMatch) {
    const constName = propMatch[1];
    const keyName = propMatch[2];
    const qualified = `${constName}.${keyName}`;

    if (localMap.has(qualified)) {
      return localMap.get(qualified) ?? null;
    }

    if (externalMap && externalMap.has(keyName) && constName === "IPC_CHANNELS") {
      return externalMap.get(keyName) ?? null;
    }

    if (localMap.has(keyName)) {
      return localMap.get(keyName) ?? null;
    }

    if (constName === "IPC_CHANNELS") {
      return `${REF_IPC_CHANNELS}${keyName}`;
    }
    return `${REF_CHANNELS}${constName}.${keyName}`;
  }

  if (localMap.has(trimmed)) {
    const value = localMap.get(trimmed);
    return value && value.includes(":") ? value : null;
  }

  if (externalMap && externalMap.has(trimmed)) {
    return externalMap.get(trimmed) ?? null;
  }

  return null;
}

/**
 * 任意ディレクトリを再帰走査して対象ファイルを拾う
 * @param {string} rootDir
 * @param {(filePath: string) => void} visitor
 * @param {{ extensions?: string[] }} [options]
 */
function walkSourceFiles(rootDir, visitor, options = {}) {
  if (!fs.existsSync(rootDir)) return;

  const extensions = options.extensions ?? [".ts", ".tsx"];

  /** @param {string} dir */
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (
        entry.name === "__tests__" ||
        entry.name === "__mocks__" ||
        entry.name === "node_modules" ||
        entry.name === "dist" ||
        entry.name === "build" ||
        entry.name === "coverage"
      ) {
        continue;
      }

      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }

      if (!entry.isFile()) continue;
      if (!extensions.some((ext) => entry.name.endsWith(ext))) continue;
      if (
        entry.name.endsWith(".test.ts") ||
        entry.name.endsWith(".spec.ts") ||
        entry.name.endsWith(".test.tsx") ||
        entry.name.endsWith(".spec.tsx") ||
        entry.name.endsWith(".d.ts") ||
        entry.name.endsWith(".d.tsx")
      ) {
        continue;
      }

      visitor(fullPath);
    }
  }

  walk(rootDir);
}

/**
 * タプル配列の先頭要素からチャネル参照を抽出する
 * @param {string} content
 * @param {Map<string, string>} localMap
 * @param {Map<string, string>} [externalMap]
 * @returns {Set<string>}
 */
function extractTupleChannels(content, localMap, externalMap) {
  const stripped = stripComments(content);
  const channels = new Set();
  const tupleRegex = /\[\s*([^,\]]+?)\s*,/g;
  let match;
  while ((match = tupleRegex.exec(stripped)) !== null) {
    const resolved = resolveChannelReference(match[1], localMap, externalMap);
    if (resolved) {
      channels.add(resolved);
    }
  }
  return channels;
}

/**
 * 関数呼び出しの第1引数からチャネル参照を抽出する
 * @param {string} content
 * @param {RegExp[]} patterns
 * @param {Map<string, string>} localMap
 * @param {Map<string, string>} [externalMap]
 * @returns {Set<string>}
 */
function extractCallChannels(content, patterns, localMap, externalMap) {
  const stripped = stripComments(content);
  const channels = new Set();

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(stripped)) !== null) {
      const resolved = resolveChannelReference(match[1], localMap, externalMap);
      if (resolved) {
        channels.add(resolved);
      }
    }
  }

  return channels;
}

// ====== パーサー ======

/**
 * shared/channels.ts からチャネル名を抽出
 * @param {string} content
 * @returns {Set<string>}
 */
function parseSharedChannels(content) {
  const stripped = stripComments(content);
  const channels = new Set();
  // domain:operation パターン (camelCase対応)
  const pattern = /["']([a-zA-Z][a-zA-Z0-9-]*:[a-zA-Z][a-zA-Z0-9:_-]*)["']/g;
  let m;
  while ((m = pattern.exec(stripped)) !== null) {
    channels.add(m[1]);
  }
  return channels;
}

/**
 * shared/channels.ts からグループ定数マップを構築
 * 例: CHAT_EXPORT_CHANNELS.EXPORT_SESSION → "chat:exportSession"
 * @param {string} content
 * @returns {Map<string, Map<string, string>>} グループ名 → (キー名 → チャネル文字列)
 */
function parseSharedGroupMap(content) {
  const stripped = stripComments(content);
  /** @type {Map<string, Map<string, string>>} */
  const groups = new Map();

  // export const GROUP_NAME = { KEY: "channel", ... } as const パターン
  const blockRegex = /export\s+const\s+(\w+)\s*=\s*\{([^}]*)\}\s*as\s+const/gs;
  let blockMatch;
  while ((blockMatch = blockRegex.exec(stripped)) !== null) {
    const groupName = blockMatch[1];
    const body = blockMatch[2];
    const keyMap = new Map();

    const entryRegex = /(\w+)\s*:\s*["']([^"']+)["']/g;
    let entryMatch;
    while ((entryMatch = entryRegex.exec(body)) !== null) {
      keyMap.set(entryMatch[1], entryMatch[2]);
    }

    if (keyMap.size > 0) {
      groups.set(groupName, keyMap);
    }
  }

  // 単独 export const (文字列リテラルの場合)
  const singleRegex =
    /export\s+const\s+(\w+)\s*=\s*["']([^"']+)["']\s+as\s+const/g;
  let singleMatch;
  while ((singleMatch = singleRegex.exec(stripped)) !== null) {
    const name = singleMatch[1];
    const value = singleMatch[2];
    // 単独定数はキー名と同じ名前で保存
    const keyMap = new Map();
    keyMap.set(name, value);
    groups.set(name, keyMap);
  }

  return groups;
}

/**
 * preload/channels.ts からホワイトリストをパース
 * @param {string} content
 * @param {Set<string>} _sharedChannels (互換性のために残す)
 * @returns {ParsedPreload}
 */
function parsePreloadWhitelist(content, _sharedChannels, sharedGroupMap) {
  const stripped = stripComments(content);
  if (!sharedGroupMap) sharedGroupMap = new Map();

  const flatSharedMap = flattenSharedGroupMap(sharedGroupMap);

  // ステップ1: IPC_CHANNELS オブジェクト内のチャネルマッピングを構築
  const channelMap = new Map(); // KEY → "channel:name"

  const ipcChannelsMatch = stripped.match(
    /export\s+const\s+IPC_CHANNELS\s*=\s*\{([\s\S]*?)\}\s*as\s+const/,
  );
  if (ipcChannelsMatch) {
    const body = ipcChannelsMatch[1];

    // 直接文字列リテラル: KEY: "value"
    const directRegex = /(\w+)\s*:\s*["']([^"']+)["']/g;
    let dm;
    while ((dm = directRegex.exec(body)) !== null) {
      channelMap.set(dm[1], dm[2]);
    }

    // 参照: KEY: IMPORTED_CONST.KEY (例: APPROVAL_CHANNELS.APPROVAL_RESPOND)
    const refRegex = /(\w+)\s*:\s+(\w+)\.(\w+)/g;
    let rm;
    while ((rm = refRegex.exec(body)) !== null) {
      // shared のグループマップから解決を試行
      const group = sharedGroupMap.get(rm[2]);
      if (group && group.has(rm[3])) {
        channelMap.set(rm[1], group.get(rm[3]));
      } else {
        channelMap.set(rm[1], `${REF_PRELOAD}${rm[2]}.${rm[3]}`);
      }
    }

    // spread: ...SPREAD_NAME → shared グループマップで解決
    const spreadRegex = /\.\.\.(\w+)/g;
    let sm;
    while ((sm = spreadRegex.exec(body)) !== null) {
      const groupName = sm[1];
      const group = sharedGroupMap.get(groupName);
      if (group) {
        for (const [key, value] of group) {
          if (!channelMap.has(key)) {
            channelMap.set(key, value);
          }
        }
      }
    }

    // 単独定数参照: KEY (コンマ区切りまたは末尾)
    const standaloneRegex = /^\s+(\w+),?\s*$/gm;
    let stm;
    while ((stm = standaloneRegex.exec(body)) !== null) {
      const name = stm[1];
      if (!name.startsWith("__") && !channelMap.has(name)) {
        // shared のフラットマップから解決を試行
        const fromShared = flatSharedMap.get(name);
        if (fromShared) {
          channelMap.set(name, fromShared);
        } else {
          channelMap.set(name, `${REF_STANDALONE}${name}`);
        }
      }
    }
  }

  /**
   * ALLOWED_*_CHANNELS 配列から参照を解決して Set<string> を返すヘルパー
   * @param {string} constName 定数名（"ALLOWED_INVOKE_CHANNELS" 等）
   * @returns {Set<string>}
   */
  function resolveAllowedChannels(constName) {
    const result = new Set();
    const pattern = new RegExp(
      `export\\s+const\\s+${constName}[\\s\\S]*?=\\s*\\[([\\s\\S]*?)\\];`,
    );
    const match = stripped.match(pattern);
    if (match) {
      const body = match[1];
      const refPattern = /IPC_CHANNELS\.(\w+)/g;
      let ref;
      while ((ref = refPattern.exec(body)) !== null) {
        const key = ref[1];
        const resolved = channelMap.get(key);
        if (resolved && !resolved.startsWith("__")) {
          result.add(resolved);
        }
      }
      const strPattern = /["']([^"']+)["']/g;
      let str;
      while ((str = strPattern.exec(body)) !== null) {
        result.add(str[1]);
      }
    }
    return result;
  }

  // ステップ2+3: ALLOWED_INVOKE_CHANNELS / ALLOWED_ON_CHANNELS から参照を解決
  const invokeChannels = resolveAllowedChannels("ALLOWED_INVOKE_CHANNELS");
  const onChannels = resolveAllowedChannels("ALLOWED_ON_CHANNELS");

  // ステップ4: IPC_CHANNELS で定義されたすべてのチャネル
  const definedChannels = new Set();
  for (const [, value] of channelMap) {
    if (value && !value.startsWith("__")) {
      definedChannels.add(value);
    }
  }

  return {
    invoke: invokeChannels,
    on: onChannels,
    defined: definedChannels,
  };
}

/**
 * ファイル内容から ipcMain.handle/on のチャネル名を抽出
 * @param {string} content
 * @param {Map<string, string>} [externalMap]
 * @returns {Set<string>}
 */
function parseMainHandlersFromContent(content, externalMap) {
  const channels = new Set();
  const localConstMap = buildConstValueMap(content);
  const aliases = [...collectIpcMainAliases(content)].map(escapeRegExp);
  const handlerTargets = aliases.length > 0 ? aliases.join("|") : "ipcMain";

  // 直接登録: ipcMain.handle/on, main.handle/on, alias.handle/on
  const directPattern = new RegExp(
    `(?:${handlerTargets})\\.(?:handle|on)\\s*\\(\\s*([^,\\n)]+)`,
    "g",
  );
  let directMatch;
  while ((directMatch = directPattern.exec(stripComments(content))) !== null) {
    const resolved = resolveChannelReference(
      directMatch[1],
      localConstMap,
      externalMap,
    );
    if (resolved) {
      channels.add(resolved);
    }
  }

  // ラッパー: registerXxxHandler(IPC_CHANNELS.KEY, ...) / createIpcHandler(...)
  const wrapperPattern =
    /(?:register\w*(?:Handler|Handlers)|createIpcHandler)[^(]*\(\s*([^,\n)]+)/g;
  let wrapperMatch;
  while (
    (wrapperMatch = wrapperPattern.exec(stripComments(content))) !== null
  ) {
    const resolved = resolveChannelReference(
      wrapperMatch[1],
      localConstMap,
      externalMap,
    );
    if (resolved) {
      channels.add(resolved);
    }
  }

  // handler 配列: [IPC_CHANNELS.KEY, async () => ...] など
  for (const resolved of extractTupleChannels(
    content,
    localConstMap,
    externalMap,
  )) {
    channels.add(resolved);
  }

  return channels;
}

/**
 * ディレクトリ内の *.ts ファイルから ipcMain.handle/on のチャネル名を抽出
 * @param {string} dirPath
 * @param {Map<string, string>} [externalMap]
 * @returns {Set<string>}
 */
function parseMainHandlers(dirPath, externalMap) {
  const channels = new Set();
  if (!fs.existsSync(dirPath)) {
    return channels;
  }

  walkSourceFiles(dirPath, (filePath) => {
    const content = fs.readFileSync(filePath, "utf-8");
    const fileChannels = parseMainHandlersFromContent(content, externalMap);
    for (const ch of fileChannels) {
      channels.add(ch);
    }
  });
  return channels;
}

/**
 * ファイル内容から safeInvoke/safeOn / direct invoke のチャネル名を抽出
 * @param {string} content
 * @param {Map<string, string>} [channelMap] IPC_CHANNELS キー→チャネル名のマップ
 * @returns {Set<string>}
 */
function parseRendererUsageFromContent(content, channelMap) {
  const localMap = buildConstValueMap(content);
  const mergedMap = new Map();
  if (channelMap) {
    for (const [key, value] of channelMap) {
      mergedMap.set(key, value);
    }
  }
  for (const [key, value] of localMap) {
    mergedMap.set(key, value);
  }

  const callPatterns = [
    /safeInvokeUnwrap[^(]*\(\s*([^,\n)]+)/g,
    /safeInvoke[^(]*\(\s*([^,\n)]+)/g,
    /safeOn[^(]*\(\s*([^,\n)]+)/g,
    /invokeIpc[^(]*\(\s*([^,\n)]+)/g,
    /(?:window\.)?electronAPI(?:\?\.|\.)invoke[^(]*\(\s*([^,\n)]+)/g,
  ];

  return extractCallChannels(content, callPatterns, mergedMap);
}

/**
 * ディレクトリ内の *.ts/*.tsx ファイルから safeInvoke/safeOn / direct invoke のチャネル名を抽出
 * @param {string} dirPath
 * @param {Map<string, string>} [sharedChannelMap] 外部から渡されたチャネルマップ
 * @returns {Set<string>}
 */
function parseRendererUsage(dirPath, sharedGroupMap, sharedChannelMap) {
  const channels = new Set();
  if (!fs.existsSync(dirPath)) {
    return channels;
  }

  // preload/channels.ts から channelMap を構築（shared グループマップで拡充）
  const channelsFilePath = path.join(dirPath, "channels.ts");
  let channelMap = new Map();
  if (fs.existsSync(channelsFilePath)) {
    const channelsContent = fs.readFileSync(channelsFilePath, "utf-8");
    channelMap = buildPreloadChannelMap(channelsContent, sharedGroupMap);
  }

  if (sharedChannelMap) {
    for (const [key, value] of sharedChannelMap) {
      if (!channelMap.has(key)) {
        channelMap.set(key, value);
      }
    }
  }

  walkSourceFiles(dirPath, (filePath) => {
    if (
      path.basename(filePath) === "channels.ts" ||
      path.basename(filePath) === "types.ts" ||
      path.basename(filePath) === "types.d.ts"
    ) {
      return;
    }

    const content = fs.readFileSync(filePath, "utf-8");
    const fileChannels = parseRendererUsageFromContent(content, channelMap);
    for (const ch of fileChannels) {
      channels.add(ch);
    }
  });

  return channels;
}

// ====== バリデーター ======

/**
 * Rule-1: shared で定義されたチャネルが preload ホワイトリストに登録されているか
 * @param {Set<string>} shared
 * @param {ParsedPreload} preload
 * @returns {ValidationResult}
 */
function validateSharedToPreload(shared, preload) {
  const preloadAll = new Set([...preload.invoke, ...preload.on]);
  const missing = [...shared].filter((ch) => !preloadAll.has(ch));
  return {
    rule: "Rule-1",
    status: missing.length === 0 ? "pass" : "fail",
    missing,
    description: "shared で定義されたチャネルが preload ホワイトリストに未登録",
  };
}

/**
 * Rule-2: preload invoke ホワイトリストのチャネルが main ハンドラに実装されているか
 * @param {ParsedPreload} preload
 * @param {Set<string>} main
 * @returns {ValidationResult}
 */
function validatePreloadToMain(preload, main) {
  const missing = [...preload.invoke].filter((ch) => !main.has(ch));
  return {
    rule: "Rule-2",
    status: missing.length === 0 ? "pass" : "fail",
    missing,
    description:
      "preload invoke ホワイトリストのチャネルが main ハンドラに未実装",
  };
}

/**
 * Rule-3: renderer で使用されたチャネルが shared/preload に定義されているか
 * @param {Set<string>} renderer
 * @param {Set<string>} shared
 * @param {ParsedPreload} preload
 * @returns {ValidationResult}
 */
function validateRendererToShared(renderer, shared, preload) {
  const known = new Set([...shared, ...preload.defined]);
  const missing = [...renderer].filter((ch) => !known.has(ch));
  return {
    rule: "Rule-3",
    status: missing.length === 0 ? "pass" : "fail",
    missing,
    description: "renderer で使用されたチャネルが shared/preload に未定義",
  };
}

// ====== レポーター ======

/**
 * バリデーション結果をフォーマットする
 * @param {ValidationResult[]} results
 * @returns {{ text: string, hasErrors: boolean }}
 */
function formatReport(results) {
  const lines = ["=== IPC 4-Layer Alignment Verification ===", ""];
  for (const r of results) {
    if (r.status === "pass") {
      lines.push(`[${r.rule}] ${r.description}: PASS`);
    } else {
      lines.push(
        `[${r.rule}] ${r.description}: FAIL (${r.missing.length} missing)`,
      );
      for (const ch of r.missing) {
        lines.push(`  ::error::${r.rule}: Channel "${ch}" - ${r.description}`);
      }
    }
  }
  lines.push("");
  lines.push("--- Summary ---");
  const passed = results.filter((r) => r.status === "pass").length;
  const failed = results.filter((r) => r.status === "fail").length;
  lines.push(`Total rules: ${results.length}`);
  lines.push(`Passed: ${passed}`);
  lines.push(`Failed: ${failed}`);

  return { text: lines.join("\n"), hasErrors: failed > 0 };
}

// ====== メイン実行 ======

/**
 * main 側の IPC_CHANNELS 参照を解決する
 * @param {Set<string>} rawMainChannels parseMainHandlers の生結果
 * @param {Map<string, Map<string, string>>} sharedGroupMap shared のグループマップ
 * @param {Map<string, string>} preloadChannelMap preload の IPC_CHANNELS マップ
 * @returns {Set<string>}
 */
function resolveMainChannelRefs(
  rawMainChannels,
  sharedGroupMap,
  preloadChannelMap,
) {
  const resolved = new Set();

  const flatSharedMap = flattenSharedGroupMap(sharedGroupMap);

  for (const ch of rawMainChannels) {
    if (ch.startsWith(REF_IPC_CHANNELS)) {
      const key = ch.slice(REF_IPC_CHANNELS.length);
      // preload のマップで解決を試行
      const fromPreload = preloadChannelMap.get(key);
      if (fromPreload && !fromPreload.startsWith("__")) {
        resolved.add(fromPreload);
        continue;
      }
      // shared のフラットマップで解決を試行
      const fromShared = flatSharedMap.get(key);
      if (fromShared) {
        resolved.add(fromShared);
        continue;
      }
      // 解決できない場合はスキップ（warning）
    } else if (ch.startsWith(REF_CHANNELS)) {
      const ref = ch.slice(REF_CHANNELS.length);
      const [groupName, keyName] = ref.split(".");
      const group = sharedGroupMap.get(groupName);
      if (group) {
        const value = group.get(keyName);
        if (value) {
          resolved.add(value);
          continue;
        }
      }
    } else {
      resolved.add(ch);
    }
  }

  return resolved;
}

/**
 * preload の IPC_CHANNELS からキー→値マップを構築
 * @param {string} content
 * @returns {Map<string, string>}
 */
function buildPreloadChannelMap(content, sharedGroupMap) {
  const stripped = stripComments(content);
  const channelMap = new Map();
  if (!sharedGroupMap) sharedGroupMap = new Map();

  const flatSharedMap = flattenSharedGroupMap(sharedGroupMap);

  const ipcMatch = stripped.match(
    /export\s+const\s+IPC_CHANNELS\s*=\s*\{([\s\S]*?)\}\s*as\s+const/,
  );
  if (ipcMatch) {
    const body = ipcMatch[1];

    // 直接文字列リテラル
    const directRegex = /(\w+)\s*:\s*["']([^"']+)["']/g;
    let dm;
    while ((dm = directRegex.exec(body)) !== null) {
      channelMap.set(dm[1], dm[2]);
    }

    // spread: ...SPREAD_NAME → shared グループマップで解決
    const spreadRegex = /\.\.\.(\w+)/g;
    let sm;
    while ((sm = spreadRegex.exec(body)) !== null) {
      const group = sharedGroupMap.get(sm[1]);
      if (group) {
        for (const [key, value] of group) {
          if (!channelMap.has(key)) {
            channelMap.set(key, value);
          }
        }
      }
    }

    // 単独定数参照
    const standaloneRegex = /^\s+(\w+),?\s*$/gm;
    let stm;
    while ((stm = standaloneRegex.exec(body)) !== null) {
      const name = stm[1];
      if (!channelMap.has(name)) {
        const fromShared = flatSharedMap.get(name);
        if (fromShared) {
          channelMap.set(name, fromShared);
        }
      }
    }

    // 参照: KEY: GROUP.MEMBER
    const refRegex = /(\w+)\s*:\s+(\w+)\.(\w+)/g;
    let rm;
    while ((rm = refRegex.exec(body)) !== null) {
      if (!channelMap.has(rm[1])) {
        const group = sharedGroupMap.get(rm[2]);
        if (group && group.has(rm[3])) {
          channelMap.set(rm[1], group.get(rm[3]));
        }
      }
    }
  }
  return channelMap;
}

function main() {
  const projectRoot = path.resolve(__dirname, "..");

  // 1. ファイル読み込み
  const sharedPath = path.join(projectRoot, PATHS.SHARED_CHANNELS);
  const preloadPath = path.join(projectRoot, PATHS.PRELOAD_CHANNELS);

  if (!fs.existsSync(sharedPath)) {
    console.error(`ERROR: shared channels file not found: ${sharedPath}`);
    process.exitCode = 1;
    return;
  }
  if (!fs.existsSync(preloadPath)) {
    console.error(`ERROR: preload channels file not found: ${preloadPath}`);
    process.exitCode = 1;
    return;
  }

  const sharedContent = fs.readFileSync(sharedPath, "utf-8");
  const preloadContent = fs.readFileSync(preloadPath, "utf-8");

  // 2. パース
  const sharedChannels = parseSharedChannels(sharedContent);
  const sharedGroupMap = parseSharedGroupMap(sharedContent);
  const preload = parsePreloadWhitelist(
    preloadContent,
    sharedChannels,
    sharedGroupMap,
  );
  const preloadChannelMap = buildPreloadChannelMap(
    preloadContent,
    sharedGroupMap,
  );
  const mainExternalChannelMap = new Map([
    ...flattenSharedGroupMap(sharedGroupMap),
    ...preloadChannelMap,
  ]);

  const rawMainHandlers = parseMainHandlers(
    path.join(projectRoot, PATHS.MAIN_IPC_DIR),
    mainExternalChannelMap,
  );
  const mainHandlers = resolveMainChannelRefs(
    rawMainHandlers,
    sharedGroupMap,
    preloadChannelMap,
  );

  const preloadRendererUsage = parseRendererUsage(
    path.join(projectRoot, PATHS.PRELOAD_DIR),
    sharedGroupMap,
    preloadChannelMap,
  );
  const rendererDirectUsage = parseRendererUsage(
    path.join(projectRoot, PATHS.RENDERER_DIR),
    sharedGroupMap,
    preloadChannelMap,
  );
  const rendererUsage = new Set([
    ...preloadRendererUsage,
    ...rendererDirectUsage,
  ]);

  // 3. バリデーション
  const results = [
    validateSharedToPreload(sharedChannels, preload),
    validatePreloadToMain(preload, mainHandlers),
    validateRendererToShared(rendererUsage, sharedChannels, preload),
  ];

  // 4. レポート
  const report = formatReport(results);
  console.log(report.text);
  if (report.hasErrors) {
    process.exitCode = 1;
  }
}

// エントリポイント
if (require.main === module) {
  main();
}

// テスト用エクスポート
module.exports = {
  stripComments,
  flattenSharedGroupMap,
  parseSharedChannels,
  parseSharedGroupMap,
  parsePreloadWhitelist,
  parseMainHandlers,
  parseMainHandlersFromContent,
  parseRendererUsage,
  parseRendererUsageFromContent,
  buildPreloadChannelMap,
  resolveMainChannelRefs,
  validateSharedToPreload,
  validatePreloadToMain,
  validateRendererToShared,
  formatReport,
  PATHS,
  REF_IPC_CHANNELS,
  REF_CHANNELS,
  REF_PRELOAD,
  REF_STANDALONE,
};

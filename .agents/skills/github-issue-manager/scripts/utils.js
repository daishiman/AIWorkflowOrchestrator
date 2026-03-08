/**
 * GitHub Issue Manager - 共通ユーティリティ
 *
 * Progressive Disclosure: 全スクリプトで共通使用
 */

const fs = require("fs");
const path = require("path");
const { execSync, spawnSync } = require("child_process");

// ================================
// 定数定義
// ================================

const LABEL_MAPPING = {
  priority: {
    高: "priority:high",
    中: "priority:medium",
    低: "priority:low",
  },
  scale: {
    大規模: "scale:large",
    中規模: "scale:medium",
    小規模: "scale:small",
  },
  category: {
    要件: "type:requirements",
    改善: "type:improvement",
    バグ修正: "type:bugfix",
    リファクタリング: "type:refactoring",
    セキュリティ: "type:security",
    パフォーマンス: "type:performance",
  },
  status: {
    未実施: "status:unassigned",
    進行中: "status:in-progress",
    完了: "status:completed",
  },
};

const SCORE_WEIGHTS = {
  priority: { 高: 100, 中: 50, 低: 25 },
  scale: { 小規模: 30, 中規模: 20, 大規模: 10 },
  dependencyMet: 50,
  dependencyUnmet: -100,
  agePerDay: 1,
  ageMax: 30,
};

// ================================
// gh CLI ヘルパー
// ================================

/**
 * gh CLI コマンドを実行
 * @param {string[]} args - コマンド引数
 * @param {object} options - オプション
 * @returns {string} 実行結果
 */
function execGh(args, options = {}) {
  // spawnSyncを使用して引数を配列として渡す（シェルエスケープ不要）
  const result = spawnSync("gh", args, {
    encoding: "utf-8",
    maxBuffer: 10 * 1024 * 1024,
    ...options,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    const error = new Error(
      `gh command failed with exit code ${result.status}`,
    );
    error.stderr = result.stderr;
    if (result.stderr) {
      console.error(`gh CLI error: ${result.stderr}`);
    }
    throw error;
  }

  return (result.stdout || "").trim();
}

/**
 * gh CLIが利用可能かチェック
 * @returns {boolean}
 */
function isGhAvailable() {
  try {
    execSync("gh --version", { encoding: "utf-8" });
    return true;
  } catch {
    return false;
  }
}

/**
 * gh auth状態をチェック
 * @returns {boolean}
 */
function isGhAuthenticated() {
  try {
    execSync("gh auth status", { encoding: "utf-8", stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

// ================================
// メタ情報解析
// ================================

/**
 * YAMLキーからcamelCaseキーへのマッピング
 */
const YAML_KEY_MAP = {
  issue_number: "issueNumber",
  task_id: "taskId",
  task_name: "taskName",
  category: "category",
  target_feature: "targetFeature",
  priority: "priority",
  scale: "scale",
  status: "status",
  source_phase: "sourcePhase",
  created_date: "createdDate",
  updated_date: "updatedDate",
  dependencies: "dependencies",
  spec_path: "specPath",
};

/**
 * Markdownからメタ情報を抽出（YAML優先、テーブルフォールバック）
 * @param {string} content - Markdownコンテンツ
 * @returns {object} メタ情報オブジェクト
 */
function extractMetadata(content) {
  // 1. まずYAMLコードブロックを試行
  const yamlMetadata = extractMetadataFromYaml(content);
  if (Object.keys(yamlMetadata).length > 0) {
    // YAMLにtaskNameがない場合、タイトル行から補完
    if (!yamlMetadata.taskName) {
      const titleName = extractTaskNameFromTitle(content);
      if (titleName) {
        yamlMetadata.taskName = titleName;
      }
    }
    return yamlMetadata;
  }

  // 2. フォールバック: Markdownテーブルから抽出
  const tableMetadata = extractMetadataFromTable(content);

  // taskNameがない場合、タイトル行から補完
  if (!tableMetadata.taskName) {
    const titleName = extractTaskNameFromTitle(content);
    if (titleName) {
      tableMetadata.taskName = titleName;
    }
  }

  return tableMetadata;
}

/**
 * タイトル行からタスク名を抽出
 * @param {string} content - Markdownコンテンツ
 * @returns {string|null} タスク名
 */
function extractTaskNameFromTitle(content) {
  // "# タスク名 - サフィックス" または "# タスク名" の形式を検出
  const titleMatch = content.match(/^#\s+(.+?)(?:\s*[-–—]\s*.+)?$/m);
  if (titleMatch) {
    let title = titleMatch[1].trim();
    // 「未タスク指示書:」などのプレフィックスを除去
    title = title.replace(/^未タスク指示書[：:]\s*/i, "");
    title = title.replace(/^タスク指示書[：:]\s*/i, "");
    title = title.replace(/^タスク仕様書[：:]\s*/i, "");
    return title;
  }
  return null;
}

/**
 * YAMLコードブロックからメタ情報を抽出
 * @param {string} content - Markdownコンテンツ
 * @returns {object} メタ情報オブジェクト
 */
function extractMetadataFromYaml(content) {
  const metadata = {};

  // ```yaml ... ``` ブロックを検出
  const yamlMatch = content.match(/```yaml\n([\s\S]*?)```/);
  if (!yamlMatch) {
    return metadata;
  }

  try {
    // 簡易YAMLパーサー（js-yaml不要）
    const lines = yamlMatch[1].split("\n");
    for (const line of lines) {
      const colonIndex = line.indexOf(":");
      if (colonIndex === -1) continue;

      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();

      // 配列の簡易処理
      if (value === "[]") {
        value = [];
      } else if (value.startsWith("[") && value.endsWith("]")) {
        // [#123, #456] 形式
        value = value
          .slice(1, -1)
          .split(",")
          .map((v) => v.trim())
          .filter((v) => v);
      }

      // キーを正規化
      const normalizedKey = YAML_KEY_MAP[key];
      if (normalizedKey) {
        metadata[normalizedKey] = value;
      }
    }
  } catch {
    // パース失敗時は空を返す
  }

  return metadata;
}

/**
 * Markdownテーブルからメタ情報を抽出（レガシーサポート）
 * @param {string} content - Markdownコンテンツ
 * @returns {object} メタ情報オブジェクト
 */
function extractMetadataFromTable(content) {
  const metadata = {};

  // メタ情報セクションを検出（複数のセクション名に対応）
  const sectionPatterns = [
    /## メタ情報\s*\n([\s\S]*?)(?=\n---|\n## |$)/,
    /## タスク概要\s*\n([\s\S]*?)(?=\n---|\n## |$)/,
    /## タスク情報\s*\n([\s\S]*?)(?=\n---|\n## |$)/,
    /## 基本情報\s*\n([\s\S]*?)(?=\n---|\n## |$)/,
  ];

  let metaSection = null;
  for (const pattern of sectionPatterns) {
    metaSection = content.match(pattern);
    if (metaSection) break;
  }

  if (!metaSection) {
    return metadata;
  }

  // テーブル行を解析
  const tablePattern = /\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|/g;
  let match;

  while ((match = tablePattern.exec(metaSection[1])) !== null) {
    const key = match[1].trim();
    const value = match[2].trim();

    // ヘッダー行をスキップ
    if (key === "項目" || key.includes("-")) continue;

    // キー名を正規化
    const normalizedKey = normalizeKey(key);
    if (normalizedKey) {
      metadata[normalizedKey] = value;
    }
  }

  return metadata;
}

/**
 * キー名を正規化
 * @param {string} key - 元のキー名
 * @returns {string|null} 正規化されたキー名
 */
function normalizeKey(key) {
  const keyMap = {
    // 日本語キー
    タスクID: "taskId",
    タスク名: "taskName",
    分類: "category",
    対象機能: "targetFeature",
    優先度: "priority",
    見積もり規模: "scale",
    見積もり: "scale",
    規模: "scale",
    ステータス: "status",
    発見元: "sourcePhase",
    発見日: "createdDate",
    作成日: "createdDate",
    依存タスク: "dependencies",
    仕様書: "specPath",
    仕様書パス: "specPath",
    // 英語キー
    Priority: "priority",
    Scale: "scale",
    Category: "category",
    Status: "status",
    "Task ID": "taskId",
    "Task Name": "taskName",
    "Target Feature": "targetFeature",
    "Created Date": "createdDate",
    Dependencies: "dependencies",
    "Spec Path": "specPath",
  };

  return keyMap[key] || null;
}

/**
 * メタ情報からラベル配列を生成
 * @param {object} metadata - メタ情報オブジェクト
 * @returns {string[]} ラベル配列
 */
function metadataToLabels(metadata) {
  const labels = [];

  if (metadata.priority && LABEL_MAPPING.priority[metadata.priority]) {
    labels.push(LABEL_MAPPING.priority[metadata.priority]);
  }

  if (metadata.scale && LABEL_MAPPING.scale[metadata.scale]) {
    labels.push(LABEL_MAPPING.scale[metadata.scale]);
  }

  if (metadata.category && LABEL_MAPPING.category[metadata.category]) {
    labels.push(LABEL_MAPPING.category[metadata.category]);
  }

  if (metadata.status && LABEL_MAPPING.status[metadata.status]) {
    labels.push(LABEL_MAPPING.status[metadata.status]);
  }

  return labels;
}

/**
 * ラベルからメタ情報を逆引き
 * @param {string[]} labels - ラベル配列
 * @returns {object} メタ情報オブジェクト
 */
function labelsToMetadata(labels) {
  const metadata = {};

  const reverseMapping = {
    priority: Object.fromEntries(
      Object.entries(LABEL_MAPPING.priority).map(([k, v]) => [v, k]),
    ),
    scale: Object.fromEntries(
      Object.entries(LABEL_MAPPING.scale).map(([k, v]) => [v, k]),
    ),
    category: Object.fromEntries(
      Object.entries(LABEL_MAPPING.category).map(([k, v]) => [v, k]),
    ),
    status: Object.fromEntries(
      Object.entries(LABEL_MAPPING.status).map(([k, v]) => [v, k]),
    ),
  };

  for (const label of labels) {
    for (const [type, mapping] of Object.entries(reverseMapping)) {
      if (mapping[label]) {
        metadata[type] = mapping[label];
        break;
      }
    }
  }

  return metadata;
}

/**
 * メタ情報オブジェクトからYAML文字列を生成
 * @param {object} metadata - メタ情報オブジェクト
 * @returns {string} YAML文字列
 */
function metadataToYaml(metadata) {
  const reverseKeyMap = Object.fromEntries(
    Object.entries(YAML_KEY_MAP).map(([k, v]) => [v, k]),
  );

  const lines = [];
  const orderedKeys = [
    "taskId",
    "taskName",
    "category",
    "targetFeature",
    "priority",
    "scale",
    "status",
    "sourcePhase",
    "createdDate",
    "dependencies",
    "specPath",
  ];

  for (const key of orderedKeys) {
    if (metadata[key] !== undefined) {
      const yamlKey = reverseKeyMap[key] || key;
      let value = metadata[key];

      // 配列の処理
      if (Array.isArray(value)) {
        value = value.length > 0 ? `[${value.join(", ")}]` : "[]";
      }

      lines.push(`${yamlKey}: ${value}`);
    }
  }

  return lines.join("\n");
}

// ================================
// スコアリング
// ================================

/**
 * Issueのスコアを計算
 * @param {object} issue - Issue情報
 * @param {object} metadata - メタ情報
 * @param {Set<number>} completedIssues - 完了済みIssue番号のセット
 * @returns {number} スコア
 */
function calculateScore(issue, metadata, completedIssues = new Set()) {
  let score = 0;

  // 優先度スコア
  if (metadata.priority && SCORE_WEIGHTS.priority[metadata.priority]) {
    score += SCORE_WEIGHTS.priority[metadata.priority];
  }

  // 規模スコア（小さい方が高スコア）
  if (metadata.scale && SCORE_WEIGHTS.scale[metadata.scale]) {
    score += SCORE_WEIGHTS.scale[metadata.scale];
  }

  // 依存関係スコア
  const dependencies = parseDependencies(metadata.dependencies);
  if (dependencies.length === 0) {
    score += SCORE_WEIGHTS.dependencyMet;
  } else {
    const allMet = dependencies.every((dep) => completedIssues.has(dep));
    score += allMet
      ? SCORE_WEIGHTS.dependencyMet
      : SCORE_WEIGHTS.dependencyUnmet;
  }

  // 経過日数スコア
  if (metadata.createdDate) {
    const created = new Date(metadata.createdDate);
    const now = new Date();
    const days = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    score += Math.min(days * SCORE_WEIGHTS.agePerDay, SCORE_WEIGHTS.ageMax);
  }

  return score;
}

/**
 * 依存関係文字列をパース
 * @param {string} dependencies - 依存関係文字列
 * @returns {number[]} Issue番号の配列
 */
function parseDependencies(dependencies) {
  if (!dependencies || dependencies === "なし" || dependencies === "-") {
    return [];
  }

  const matches = dependencies.match(/#(\d+)/g);
  if (!matches) return [];

  return matches.map((m) => parseInt(m.slice(1), 10));
}

// ================================
// ファイル操作
// ================================

/**
 * 仕様書ファイルを検出
 * @param {string} basePath - 検索ベースパス
 * @returns {string[]} ファイルパスの配列
 */
function detectSpecFiles(basePath = "docs/30-workflows/unassigned-task") {
  const fullPath = path.resolve(basePath);

  if (!fs.existsSync(fullPath)) {
    return [];
  }

  const files = fs
    .readdirSync(fullPath)
    .filter((f) => f.endsWith(".md") && f.startsWith("task-"))
    .map((f) => path.join(fullPath, f));

  return files;
}

/**
 * ファイル内容を読み込み
 * @param {string} filePath - ファイルパス
 * @returns {string} ファイル内容
 */
function readFile(filePath) {
  return fs.readFileSync(filePath, "utf-8");
}

/**
 * ファイルに書き込み
 * @param {string} filePath - ファイルパス
 * @param {string} content - 内容
 */
function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, "utf-8");
}

// ================================
// 出力ヘルパー
// ================================

/**
 * 成功メッセージを出力
 * @param {string} message - メッセージ
 */
function success(message) {
  console.log(`✓ ${message}`);
}

/**
 * エラーメッセージを出力
 * @param {string} message - メッセージ
 */
function error(message) {
  console.error(`✗ ${message}`);
}

/**
 * 情報メッセージを出力
 * @param {string} message - メッセージ
 */
function info(message) {
  console.log(`ℹ ${message}`);
}

/**
 * 警告メッセージを出力
 * @param {string} message - メッセージ
 */
function warn(message) {
  console.warn(`⚠ ${message}`);
}

// ================================
// エクスポート
// ================================

module.exports = {
  // 定数
  LABEL_MAPPING,
  SCORE_WEIGHTS,

  // gh CLI
  execGh,
  isGhAvailable,
  isGhAuthenticated,

  // メタ情報
  extractMetadata,
  extractMetadataFromYaml,
  extractMetadataFromTable,
  normalizeKey,
  metadataToLabels,
  metadataToYaml,
  labelsToMetadata,
  YAML_KEY_MAP,

  // スコアリング
  calculateScore,
  parseDependencies,

  // ファイル操作
  detectSpecFiles,
  readFile,
  writeFile,

  // 出力
  success,
  error,
  info,
  warn,
};

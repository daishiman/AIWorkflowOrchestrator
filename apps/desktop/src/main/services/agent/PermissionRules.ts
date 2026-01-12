/**
 * PermissionRules - 宣言的権限ルールの定義と変換
 *
 * deny → allow → ask の評価順序で権限を制御
 *
 * @see docs/30-workflows/claude-code-integration/outputs/phase-2/architecture-design.md
 */
import {
  DANGEROUS_PATTERNS,
  type PermissionRules,
  type PermissionRule,
} from "@repo/shared";

/**
 * デフォルトの権限ルール
 */
export const DEFAULT_PERMISSION_RULES: PermissionRules = {
  // 自動許可ルール（読み取り系ツール）
  allow: [{ tool: "Read" }, { tool: "Grep" }, { tool: "Glob" }],

  // 拒否ルール（危険なコマンド・パス）
  deny: [
    {
      tool: "Bash",
      commands: [...DANGEROUS_PATTERNS.BASH_COMMANDS],
    },
    {
      tool: "Write",
      paths: [...DANGEROUS_PATTERNS.PROTECTED_PATHS],
    },
    {
      tool: "Edit",
      paths: [...DANGEROUS_PATTERNS.PROTECTED_PATHS],
    },
  ],

  // 確認要求ルール（書き込み系ツール）
  ask: [{ tool: "Write" }, { tool: "Edit" }, { tool: "Bash" }],
};

/**
 * プロジェクトルートをパスに適用する
 *
 * @param paths パスパターンの配列
 * @param projectRoot プロジェクトルート
 * @returns 変換されたパスパターン
 */
function applyProjectRoot(
  paths: string[] | undefined,
  projectRoot: string,
): string[] | undefined {
  if (!paths) return undefined;

  return paths.map((path) => {
    if (path.startsWith("**")) {
      // グローバルパターンはそのまま
      return path;
    }
    if (path.startsWith("/")) {
      // 絶対パスはそのまま
      return path;
    }
    // 相対パスはプロジェクトルートを付加
    return `${projectRoot}/${path}`;
  });
}

/**
 * PermissionRuleをSDKのpermissionsオプション形式に変換
 *
 * @param rule 単一の権限ルール
 * @param projectRoot プロジェクトルート
 * @returns SDK形式のルール
 */
function convertRule(
  rule: PermissionRule,
  projectRoot: string,
): Record<string, unknown> {
  const converted: Record<string, unknown> = {
    tool: rule.tool,
  };

  if (rule.paths) {
    converted.paths = applyProjectRoot(rule.paths, projectRoot);
  }

  if (rule.commands) {
    converted.commands = rule.commands;
  }

  return converted;
}

/**
 * PermissionRulesをSDKのpermissionsオプション形式に変換
 *
 * @param rules 権限ルールセット
 * @param projectRoot プロジェクトルート
 * @returns SDK形式のpermissionsオプション
 */
export function createPermissionOptions(
  rules: PermissionRules,
  projectRoot: string,
): Record<string, unknown> {
  const permissions: Record<string, unknown> = {};

  if (rules.allow) {
    permissions.allow = rules.allow.map((rule) =>
      convertRule(rule, projectRoot),
    );
  }

  if (rules.deny) {
    permissions.deny = rules.deny.map((rule) => convertRule(rule, projectRoot));
  }

  if (rules.ask) {
    permissions.ask = rules.ask.map((rule) => convertRule(rule, projectRoot));
  }

  return permissions;
}

/**
 * デフォルトルールとカスタムルールをマージ
 *
 * @param customRules カスタムルール
 * @returns マージされたルール
 */
export function mergeRules(customRules?: PermissionRules): PermissionRules {
  if (!customRules) {
    return DEFAULT_PERMISSION_RULES;
  }

  return {
    allow: [
      ...(DEFAULT_PERMISSION_RULES.allow || []),
      ...(customRules.allow || []),
    ],
    deny: [
      ...(DEFAULT_PERMISSION_RULES.deny || []),
      ...(customRules.deny || []),
    ],
    ask: [...(DEFAULT_PERMISSION_RULES.ask || []), ...(customRules.ask || [])],
  };
}

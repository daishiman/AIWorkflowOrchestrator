/**
 * toolMetadata - ツールリスクレベル・セキュリティ影響メタデータ
 *
 * PermissionDialogで表示するツールのリスクレベルとセキュリティ影響テキストを定義する。
 * security-skill-execution.mdのALLOWED_TOOLS_WHITELISTに準拠したリスクレベルを提供する。
 *
 * @module @repo/desktop/renderer/components/skill/toolMetadata
 */

/** リスクレベル型 */
export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

/** ツールメタデータ型 */
export interface ToolMetadata {
  riskLevel: RiskLevel;
  securityImpact: string;
}

/** デフォルトメタデータ（未定義ツール用） */
const DEFAULT_METADATA: ToolMetadata = {
  riskLevel: "Medium",
  securityImpact: "ツールを実行します",
};

/** ツール名→メタデータのマッピング（12ツール） */
const TOOL_METADATA: Record<string, ToolMetadata> = {
  Bash: {
    riskLevel: "High",
    securityImpact: "システムコマンドを実行します。任意のコード実行が可能です",
  },
  Read: {
    riskLevel: "Low",
    securityImpact: "ファイルの内容を読み取ります",
  },
  Write: {
    riskLevel: "Medium",
    securityImpact: "ファイルに新しい内容を書き込みます",
  },
  Edit: {
    riskLevel: "Medium",
    securityImpact: "既存ファイルの内容を変更します",
  },
  Glob: {
    riskLevel: "Low",
    securityImpact: "ファイルパターンで検索します",
  },
  Grep: {
    riskLevel: "Low",
    securityImpact: "テキスト内容を検索します",
  },
  WebSearch: {
    riskLevel: "Low",
    securityImpact: "Web検索を実行します",
  },
  Task: {
    riskLevel: "Medium",
    securityImpact: "サブタスクを実行します",
  },
  NotebookEdit: {
    riskLevel: "Medium",
    securityImpact: "Jupyterノートブックを編集します",
  },
  WebFetch: {
    riskLevel: "Medium",
    securityImpact: "Webコンテンツを取得します",
  },
  Skill: {
    riskLevel: "Medium",
    securityImpact: "スキルを実行します",
  },
  AskUser: {
    riskLevel: "Low",
    securityImpact: "ユーザーに確認を行います",
  },
};

/**
 * ツール名からリスクレベルを取得する
 * 未定義ツールの場合は 'Medium' を返す
 */
export function getRiskLevel(toolName: string): RiskLevel {
  return (TOOL_METADATA[toolName] ?? DEFAULT_METADATA).riskLevel;
}

/**
 * ツール名からセキュリティ影響テキストを取得する
 * 未定義ツールの場合は 'ツールを実行します' を返す
 */
export function getSecurityImpact(toolName: string): string {
  return (TOOL_METADATA[toolName] ?? DEFAULT_METADATA).securityImpact;
}

/**
 * ツール名からメタデータ全体を取得する
 * 未定義ツールの場合はデフォルトメタデータを返す
 */
export function getToolMetadata(toolName: string): ToolMetadata {
  return TOOL_METADATA[toolName] ?? DEFAULT_METADATA;
}

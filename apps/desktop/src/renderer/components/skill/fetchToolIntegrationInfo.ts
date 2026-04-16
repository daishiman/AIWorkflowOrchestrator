/**
 * @file fetchToolIntegrationInfo.ts
 * @description 外部ツールの統合情報を取得するユーティリティ
 * @task UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001
 */

export interface ExternalToolIntegration {
  toolName: string;
  apiEndpoints: string[];
  authMethods: string[];
  mainOperations: string[];
}

const TOOL_INTEGRATION_MAP: Record<
  string,
  Omit<ExternalToolIntegration, "toolName">
> = {
  Slack: {
    apiEndpoints: ["https://api.slack.com/api"],
    authMethods: ["OAuth2"],
    mainOperations: [
      "send_message",
      "create_channel",
      "list_channels",
      "post_message",
    ],
  },
  GitHub: {
    apiEndpoints: ["https://api.github.com"],
    authMethods: ["OAuth2", "PAT"],
    mainOperations: ["create_issue", "create_pr", "list_repos", "push_commit"],
  },
  Notion: {
    apiEndpoints: ["https://api.notion.com/v1"],
    authMethods: ["OAuth2", "integration_token"],
    mainOperations: [
      "create_page",
      "update_page",
      "list_databases",
      "create_database",
    ],
  },
};

export async function fetchToolIntegrationInfo(
  toolName: string,
): Promise<ExternalToolIntegration> {
  const info = TOOL_INTEGRATION_MAP[toolName];
  if (!info) {
    throw new Error(`Unsupported tool: ${toolName}`);
  }
  return { toolName, ...info };
}

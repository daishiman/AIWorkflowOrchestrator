/**
 * Phase 11: 手動テスト用コード
 * DX（開発者体験）検証
 *
 * このファイルは型推論・JSDoc表示・エラーメッセージの確認用です。
 * 実際にVSCodeで開いて以下を確認してください：
 * - 型がホバーで正しく表示される
 * - JSDocコメントが表示される
 * - Discriminated Unionの型絞り込みが機能する
 */

// Task 11-1: インポート体験テスト
// 以下のインポートが自動補完で完成することを確認
import type {
  SkillMetadata,
  SkillSubResource,
  SkillOtherFile as _SkillOtherFile,
  ImportedSkill,
  SkillExecutionRequest as _SkillExecutionRequest,
  SkillExecutionResponse as _SkillExecutionResponse,
  SkillExecutionStatus,
  SkillStreamMessage,
  SkillStreamMessageType as _SkillStreamMessageType,
  AssistantMessageContent as _AssistantMessageContent,
  ToolUseMessageContent as _ToolUseMessageContent,
  ToolResultMessageContent as _ToolResultMessageContent,
  StatusMessageContent as _StatusMessageContent,
  ErrorMessageContent as _ErrorMessageContent,
  SkillPermissionRequest as _SkillPermissionRequest,
  SkillPermissionResponse as _SkillPermissionResponse,
} from "../skill";

// Task 11-2: 型推論テスト
// 各変数にホバーして型情報を確認してください

// SkillMetadataの型推論
const metadata: SkillMetadata = {
  name: "test-skill",
  description: "Test skill description",
  path: "/path/to/skill",
  updatedAt: new Date(),
  agents: [],
  references: [],
  scripts: [],
  assets: [],
  schemas: [],
  indexes: [],
  otherFiles: [],
};

// SkillSubResourceの型推論
const subResource: SkillSubResource = {
  filename: "agent.md",
  relativePath: "agents/agent.md",
  size: 1024,
};

// ImportedSkillの型推論
const importedSkill: ImportedSkill = {
  ...metadata,
  importedAt: new Date(),
  status: "active",
};

// SkillExecutionStatusの型推論
const status: SkillExecutionStatus = "running";

// Discriminated Union の型絞り込みテスト
function handleStreamMessage(message: SkillStreamMessage): void {
  // switch文で型が絞り込まれることを確認
  switch (message.type) {
    case "assistant":
      // message.contentがAssistantMessageContentに絞り込まれる
      // message.content.textにアクセスできることを確認
      console.log("Assistant:", message.content.text);
      console.log("Is Partial:", message.content.isPartial);
      break;

    case "tool_use":
      // message.contentがToolUseMessageContentに絞り込まれる
      console.log("Tool:", message.content.toolName);
      console.log("Args:", message.content.args);
      console.log("ID:", message.content.toolUseId);
      break;

    case "tool_result":
      // message.contentがToolResultMessageContentに絞り込まれる
      console.log("Result:", message.content.result);
      console.log("Success:", message.content.success);
      break;

    case "status":
      // message.contentがStatusMessageContentに絞り込まれる
      console.log("Status:", message.content.status);
      console.log("Detail:", message.content.detail);
      break;

    case "error":
      // message.contentがErrorMessageContentに絞り込まれる
      console.log("Error:", message.content.message);
      console.log("Code:", message.content.code);
      console.log("Retryable:", message.content.retryable);
      break;
  }
}

// Task 11-3: JSDoc 表示テスト
// 以下の型名・プロパティにホバーしてJSDocコメントを確認

// SkillMetadata にホバー → 「スキルメタデータ（SKILL.md frontmatter）」が表示される
// metadata.name にホバー → 「スキル識別子（ディレクトリ名と一致）」が表示される
// metadata.agents にホバー → 「agents/ 配下のファイル一覧」が表示される

// Task 11-4: エラーメッセージテスト
// 以下のコードをコメントアウトを外すとエラーが発生
// エラーメッセージが明確かどうかを確認

// 必須プロパティ欠落エラー
// const invalidMetadata: SkillMetadata = {
//   name: "test",
//   // description, path, updatedAt, agents, references, etc. が欠落
// };

// 型不一致エラー
// const wrongStatus: SkillExecutionStatus = "invalid_status";

// Discriminated Union の型不一致
// const wrongMessage: SkillStreamMessage = {
//   executionId: "123",
//   type: "assistant",
//   content: { toolName: "read" }, // AssistantMessageContentにはtoolNameがない
//   timestamp: Date.now(),
// };

// テスト用のダミーエクスポート
export { metadata, subResource, importedSkill, status, handleStreamMessage };

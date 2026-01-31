---
id: TASK-7D
tier: 1
title: ChatPanel 統合
phase: 7
depends_on: [TASK-7A, TASK-7B, TASK-7C]
parallel_with: []
blocks: [TASK-8A, TASK-8B, TASK-8C]
status: pending
priority: high
estimated_complexity: medium
tags: [frontend, renderer, ui, integration]
---

# ChatPanel 統合

## 概要

既存の ChatPanel に SkillSelector を統合し、スキル実行結果のストリーミング表示を実装する。

## 入力

- TASK-7A の SkillSelector
- TASK-7B の SkillImportDialog
- TASK-7C の PermissionDialog
- 既存の ChatPanel コンポーネント

## 出力

- ChatPanel の修正
- スキル実行結果表示の拡張

## 実装詳細

### ChatPanel への統合

```typescript
// apps/desktop/src/renderer/components/chat/ChatPanel.tsx の修正

import { SkillSelector } from "../skill/SkillSelector";
import { SkillImportDialog } from "../skill/SkillImportDialog";
import { PermissionDialog } from "../skill/PermissionDialog";

export const ChatPanel: React.FC = () => {
  const {
    selectedSkillName,
    streamingMessages,
    isExecuting,
    executionStatus,
    fetchSkills,
  } = useAppStore();

  const [importDialogSkill, setImportDialogSkill] = useState<SkillMetadata | null>(null);

  // スキル一覧を取得
  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  return (
    <div className="flex flex-col h-full">
      {/* ヘッダー */}
      <div className="flex items-center gap-4 px-4 py-2 border-b">
        <ModelSelector />
        <SkillSelector
          onImportRequest={(skill) => setImportDialogSkill(skill)}
        />
      </div>

      {/* メッセージ一覧 */}
      <div className="flex-1 overflow-y-auto">
        <MessageList />
        {/* スキル実行中のストリーミング表示 */}
        {isExecuting && selectedSkillName && (
          <SkillStreamingView
            skillName={selectedSkillName}
            messages={streamingMessages}
            status={executionStatus}
          />
        )}
      </div>

      {/* 入力エリア */}
      <ChatInput />

      {/* ダイアログ */}
      {importDialogSkill && (
        <SkillImportDialog
          skill={importDialogSkill}
          isOpen={true}
          onClose={() => setImportDialogSkill(null)}
        />
      )}
      <PermissionDialog />
    </div>
  );
};
```

### スキル実行結果のストリーミング表示

```typescript
// apps/desktop/src/renderer/components/skill/SkillStreamingView.tsx

import React from "react";
import type { SkillStreamMessage, SkillExecutionStatus } from "@repo/shared";

interface SkillStreamingViewProps {
  skillName: string;
  messages: SkillStreamMessage[];
  status: SkillExecutionStatus | null;
}

export const SkillStreamingView: React.FC<SkillStreamingViewProps> = ({
  skillName,
  messages,
  status,
}) => {
  const { abortExecution } = useAppStore();

  return (
    <div className="border-t p-4 bg-gray-50">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span>🤖</span>
          <span className="font-medium">アシスタント ({skillName})</span>
          <StatusBadge status={status} />
        </div>
        {status === "running" && (
          <button
            type="button"
            onClick={abortExecution}
            className="px-3 py-1 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50"
          >
            ⏹ 停止する
          </button>
        )}
      </div>

      {/* メッセージ表示 */}
      <div className="space-y-3">
        {messages.map((msg, index) => (
          <StreamMessageItem key={`${msg.timestamp}-${index}`} message={msg} />
        ))}
      </div>

      {/* ツール実行履歴 */}
      <ToolExecutionHistory messages={messages} />
    </div>
  );
};

// ステータスバッジ
const StatusBadge: React.FC<{ status: SkillExecutionStatus | null }> = ({
  status,
}) => {
  const config: Record<string, { color: string; label: string }> = {
    running: { color: "bg-blue-500", label: "実行中..." },
    permission_pending: { color: "bg-yellow-500", label: "権限確認" },
    completed: { color: "bg-green-500", label: "完了" },
    cancelled: { color: "bg-gray-500", label: "キャンセル" },
    error: { color: "bg-red-500", label: "エラー" },
  };

  if (!status || status === "idle") return null;

  const { color, label } = config[status] || { color: "bg-gray-500", label: status };

  return (
    <span className={`px-2 py-0.5 text-xs text-white rounded ${color}`}>
      {label}
    </span>
  );
};

// ストリームメッセージアイテム
const StreamMessageItem: React.FC<{ message: SkillStreamMessage }> = ({
  message,
}) => {
  switch (message.type) {
    case "assistant":
      return (
        <div className="text-gray-700 whitespace-pre-wrap">
          {message.content.text}
          {message.content.isPartial && <span className="animate-pulse">▌</span>}
        </div>
      );
    case "tool_use":
      return (
        <div className="flex items-center gap-2 text-sm bg-blue-50 p-2 rounded">
          <span>🔧</span>
          <span>ツール使用: {message.content.toolName}</span>
        </div>
      );
    case "tool_result":
      return (
        <div
          className={`flex items-center gap-2 text-sm p-2 rounded ${
            message.content.success ? "bg-green-50" : "bg-red-50"
          }`}
        >
          <span>{message.content.success ? "✅" : "❌"}</span>
          <span>
            {message.content.success ? "完了" : `エラー: ${message.content.error}`}
          </span>
        </div>
      );
    case "error":
      return (
        <div className="text-red-600 bg-red-50 p-3 rounded">
          <div className="font-medium">エラーが発生しました</div>
          <div className="text-sm">{message.content.message}</div>
        </div>
      );
    default:
      return null;
  }
};

// ツール実行履歴
const ToolExecutionHistory: React.FC<{ messages: SkillStreamMessage[] }> = ({
  messages,
}) => {
  const toolMessages = messages.filter(
    (m) => m.type === "tool_use" || m.type === "tool_result"
  );

  if (toolMessages.length === 0) return null;

  return (
    <details className="mt-4">
      <summary className="cursor-pointer text-sm text-gray-500">
        🔧 ツール実行履歴 ({toolMessages.length / 2}件)
      </summary>
      <div className="mt-2 space-y-1">
        {/* ツール履歴の詳細表示 */}
      </div>
    </details>
  );
};
```

## ファイル

| 操作 | パス                                                                               |
| ---- | ---------------------------------------------------------------------------------- |
| 修正 | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`                          |
| 作成 | `apps/desktop/src/renderer/components/skill/SkillStreamingView.tsx`                |
| 修正 | `apps/desktop/src/renderer/components/skill/index.ts`                              |
| 作成 | `apps/desktop/src/renderer/components/skill/__tests__/SkillStreamingView.test.tsx` |

## 依存パッケージ

なし（既存パッケージのみ使用）

## 完了条件

- [ ] SkillSelector が ChatPanel ヘッダーに配置されている
- [ ] ModelSelector の隣に配置されている
- [ ] スキル選択時にスキル名が表示される
- [ ] スキル実行中にストリーミング表示が動作する
- [ ] ツール使用が表示される
- [ ] ツール結果（成功/失敗）が表示される
- [ ] 「停止する」ボタンが機能する
- [ ] 権限確認ダイアログが表示される
- [ ] インポートダイアログが表示される
- [ ] 既存機能（通常のチャット）に影響がない
- [ ] コンポーネントテストが全て通過する

## テスト要件

### コンポーネントテスト

```typescript
describe("ChatPanel with Skills", () => {
  it("should render SkillSelector in header");
  it("should show streaming view when skill is executing");
  it("should hide streaming view when idle");
  it("should render PermissionDialog when pendingPermission exists");
});

describe("SkillStreamingView", () => {
  it("should render assistant messages");
  it("should render tool use notifications");
  it("should render tool results");
  it("should render error messages");
  it("should show abort button when running");
  it("should call abortExecution when abort clicked");
});
```

## 参考資料

- [specification.md - 4.1 既存チャット画面へのスキルセレクター統合](../specification.md)
- [specification.md - 4.4.1 実行中（ストリーミング表示）](../specification.md)
- [specification.md - 4.7 複数ツール実行時のUIフロー](../specification.md)

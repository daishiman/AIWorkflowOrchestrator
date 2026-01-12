# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目       | 値                 |
| ---------- | ------------------ |
| Phase      | 4                  |
| 機能名     | agent-execution-ui |
| 作成日     | 2026-01-12         |
| ステータス | 未実施             |

## 目的

期待される動作を検証するテストを実装より先に作成する（Red状態）。

## 実行タスク

- **TDD原則適用**: テストファースト開発の実践
- **コンポーネントテスト**: 各UIコンポーネントのテスト作成
- **状態管理テスト**: agentSlice拡張のテスト作成
- **統合テスト設計**: IPC通信・ストリーミング・Permissionのテスト設計

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料            | パス                                                                        | 内容                 |
| ------------------- | --------------------------------------------------------------------------- | -------------------- |
| Agent SDK仕様       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | 型定義・テスト観点   |
| UI/UXコンポーネント | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`     | アクセシビリティ観点 |

### 前Phase成果物

| 資料               | パス                                      | 説明          |
| ------------------ | ----------------------------------------- | ------------- |
| 設計レビュー結果   | `outputs/phase-3/design-review-result.md` | Phase 3成果物 |
| 型定義設計         | `outputs/phase-2/type-definitions.md`     | Phase 2成果物 |
| コンポーネント設計 | `outputs/phase-2/component-design.md`     | Phase 2成果物 |

## 実行手順

### ステップ1: agentSlice実行状態テスト

```typescript
// apps/desktop/src/renderer/store/slices/__tests__/agentSlice.execution.test.ts

describe("agentSlice execution", () => {
  describe("startExecution", () => {
    it("should set status to executing", () => {});
    it("should set currentSkill", () => {});
    it("should set startedAt", () => {});
    it("should clear previous messages", () => {});
  });

  describe("stopExecution", () => {
    it("should set status to cancelled", () => {});
    it("should clear currentStreamingMessage", () => {});
  });

  describe("addMessage", () => {
    it("should add user message to messages array", () => {});
    it("should add assistant message to messages array", () => {});
    it("should set timestamp automatically", () => {});
  });

  describe("appendStreamingContent", () => {
    it("should append content to currentStreamingMessage", () => {});
    it("should set status to streaming", () => {});
  });

  describe("finalizeStreamingMessage", () => {
    it("should create message from currentStreamingMessage", () => {});
    it("should clear currentStreamingMessage", () => {});
    it("should set isStreaming to false", () => {});
  });

  describe("setExecutionError", () => {
    it("should set error message", () => {});
    it("should set status to error", () => {});
  });

  describe("clearMessages", () => {
    it("should clear all messages", () => {});
    it("should reset status to idle", () => {});
  });

  describe("resetExecutionState", () => {
    it("should reset all execution state to initial values", () => {});
  });
});
```

### ステップ2: agentSlice Permission関連テスト

```typescript
// apps/desktop/src/renderer/store/slices/__tests__/agentSlice.permission.test.ts

describe("agentSlice permission", () => {
  describe("setPermissionRequest", () => {
    it("should set pending permission request", () => {});
    it("should set status to awaiting_permission", () => {});
    it("should clear pending permission when null", () => {});
  });

  describe("respondToPermission", () => {
    it("should clear pending permission on approve", () => {});
    it("should clear pending permission on deny", () => {});
    it("should set status back to executing", () => {});
  });

  describe("rememberPermissionChoice", () => {
    it("should remember approved choice for tool", () => {});
    it("should remember denied choice for tool", () => {});
    it("should overwrite previous choice", () => {});
  });

  describe("getRememberedChoice", () => {
    it("should return remembered choice for known tool", () => {});
    it("should return undefined for unknown tool", () => {});
  });

  describe("clearRememberedChoices", () => {
    it("should clear all remembered choices", () => {});
  });
});
```

### ステップ3: AgentChatInterfaceテスト

```typescript
// apps/desktop/src/renderer/components/organisms/AgentChatInterface/__tests__/AgentChatInterface.test.tsx

describe("AgentChatInterface", () => {
  describe("rendering", () => {
    it("should render message list", () => {});
    it("should render streaming output when streaming", () => {});
    it("should show empty state when no messages", () => {});
  });

  describe("user messages", () => {
    it("should display user messages with correct styling", () => {});
    it("should display user avatar", () => {});
  });

  describe("assistant messages", () => {
    it("should display assistant messages with correct styling", () => {});
    it("should display assistant avatar", () => {});
    it("should render markdown content", () => {});
  });

  describe("streaming", () => {
    it("should display streaming content with cursor", () => {});
    it("should auto-scroll to bottom on new content", () => {});
  });

  describe("accessibility", () => {
    it("should have proper aria-labels", () => {});
    it("should be keyboard navigable", () => {});
  });
});
```

### ステップ4: AgentMessageInputテスト

```typescript
// apps/desktop/src/renderer/components/molecules/AgentMessageInput/__tests__/AgentMessageInput.test.tsx

describe("AgentMessageInput", () => {
  describe("input behavior", () => {
    it("should update value on input", () => {});
    it("should clear input after send", () => {});
    it("should disable when executing", () => {});
  });

  describe("send behavior", () => {
    it("should call onSend when button clicked", () => {});
    it("should call onSend when Enter pressed", () => {});
    it("should not send empty message", () => {});
    it("should allow Shift+Enter for newline", () => {});
  });

  describe("accessibility", () => {
    it("should have proper aria-label", () => {});
    it("should have proper placeholder", () => {});
  });
});
```

### ステップ5: AgentExecutionControlsテスト

```typescript
// apps/desktop/src/renderer/components/molecules/AgentExecutionControls/__tests__/AgentExecutionControls.test.tsx

describe("AgentExecutionControls", () => {
  describe("cancel button", () => {
    it("should show cancel button when executing", () => {});
    it("should hide cancel button when idle", () => {});
    it("should call onCancel when clicked", () => {});
    it("should be disabled when not executing", () => {});
  });

  describe("clear button", () => {
    it("should show clear button", () => {});
    it("should show confirmation dialog when clicked", () => {});
    it("should call onClear after confirmation", () => {});
    it("should not call onClear when cancelled", () => {});
  });

  describe("accessibility", () => {
    it("should have proper aria-labels", () => {});
    it("should be keyboard accessible", () => {});
  });
});
```

### ステップ6: PermissionDialogテスト

```typescript
// apps/desktop/src/renderer/components/organisms/PermissionDialog/__tests__/PermissionDialog.test.tsx

describe("PermissionDialog", () => {
  describe("rendering", () => {
    it("should not render when request is null", () => {});
    it("should render dialog when request exists", () => {});
    it("should display tool name", () => {});
    it("should display tool arguments", () => {});
    it("should display reason if provided", () => {});
  });

  describe("approve behavior", () => {
    it("should call onApprove when approve clicked", () => {});
    it("should pass rememberChoice=false by default", () => {});
    it("should pass rememberChoice=true when checked", () => {});
  });

  describe("deny behavior", () => {
    it("should call onDeny when deny clicked", () => {});
    it("should pass rememberChoice=false by default", () => {});
    it("should pass rememberChoice=true when checked", () => {});
  });

  describe("remember checkbox", () => {
    it("should be unchecked by default", () => {});
    it("should toggle on click", () => {});
  });

  describe("accessibility", () => {
    it("should have proper dialog role", () => {});
    it("should trap focus", () => {});
    it("should have proper aria-labels", () => {});
  });
});
```

### ステップ7: AgentExecutionViewテスト

```typescript
// apps/desktop/src/renderer/views/AgentExecutionView/__tests__/AgentExecutionView.test.tsx

describe("AgentExecutionView", () => {
  describe("rendering", () => {
    it("should render skill header", () => {});
    it("should render chat interface", () => {});
    it("should render message input", () => {});
    it("should render execution controls", () => {});
  });

  describe("navigation", () => {
    it("should navigate back when back button clicked", () => {});
    it("should display current skill name", () => {});
  });

  describe("message flow", () => {
    it("should send message on submit", () => {});
    it("should display received messages", () => {});
  });

  describe("execution control", () => {
    it("should cancel execution on cancel click", () => {});
    it("should clear messages on clear confirm", () => {});
  });

  describe("permission dialog", () => {
    it("should show permission dialog when pending", () => {});
    it("should handle approve", () => {});
    it("should handle deny", () => {});
  });
});
```

## 統合テスト連携【必須】

統合テストシナリオを全カテゴリで設計する:

| シナリオカテゴリ     | 検証内容                               | テストファイル         |
| -------------------- | -------------------------------------- | ---------------------- |
| IPC接続テスト        | agent:start/stop/stream チャンネル疎通 | `*.ipc.test.ts`        |
| ストリーミングテスト | Main→Rendererのリアルタイム配信        | `*.streaming.test.ts`  |
| Permission連携テスト | Request/Responseフローの検証           | `*.permission.test.ts` |
| 状態同期テスト       | Zustand状態とUI表示の同期              | `*.sync.test.ts`       |
| エラーハンドリング   | IPC障害時のUI表示・リトライ            | `*.error.test.ts`      |

## 成果物

| 成果物           | パス                                           | 説明               |
| ---------------- | ---------------------------------------------- | ------------------ |
| テスト仕様書     | `outputs/phase-4/test-specification.md`        | テスト設計         |
| テストケース一覧 | `outputs/phase-4/test-cases.md`                | ケース一覧         |
| 統合テスト設計   | `outputs/phase-4/integration-test-design.md`   | 統合テスト設計     |
| テストファイル   | `apps/desktop/src/renderer/**/*.test.{ts,tsx}` | 実際のテストコード |

## 完了条件

- [ ] agentSlice execution関連テストがある（9テストケース）
- [ ] agentSlice permission関連テストがある（7テストケース）
- [ ] AgentChatInterfaceテストがある（9テストケース）
- [ ] AgentMessageInputテストがある（8テストケース）
- [ ] AgentExecutionControlsテストがある（7テストケース）
- [ ] PermissionDialogテストがある（12テストケース）
- [ ] AgentExecutionViewテストがある（10テストケース）
- [ ] 統合テストシナリオが全カテゴリで定義されている
- [ ] すべてのテストが失敗状態（Red）
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
```

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 2/3成果物）
2. agentSlice executionテストの作成
3. agentSlice permissionテストの作成
4. AgentChatInterfaceテストの作成
5. AgentMessageInputテストの作成
6. AgentExecutionControlsテストの作成
7. PermissionDialogテストの作成
8. AgentExecutionViewテストの作成
9. 統合テストシナリオの設計
10. テスト仕様書の作成
11. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/agent-execution-ui --phase 4
```

## 次のPhase

Phase 5: 実装（TDD: Green）

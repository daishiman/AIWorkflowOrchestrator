# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目       | 値                 |
| ---------- | ------------------ |
| Phase      | 5                  |
| 機能名     | agent-execution-ui |
| 作成日     | 2026-01-12         |
| ステータス | 未実施             |

## 目的

テストを通すための最小限の実装を行う。

## 実行タスク

- **型定義実装**: AgentExecutionState/PermissionRequest/PermissionResponse型を実装
- **agentSlice拡張**: 実行状態・Permission関連のアクションを実装
- **コンポーネント実装**: 各UIコンポーネントを実装
- **IPC連携実装**: Renderer ↔ Main間のストリーミング通信を接続

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料            | パス                                                                        | 内容                    |
| ------------------- | --------------------------------------------------------------------------- | ----------------------- |
| Agent SDK仕様       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | 既存型定義・Preload API |
| UI/UXコンポーネント | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`     | Atomic Design原則       |

### 前Phase成果物

| 資料               | パス                                    | 説明          |
| ------------------ | --------------------------------------- | ------------- |
| テスト仕様書       | `outputs/phase-4/test-specification.md` | Phase 4成果物 |
| 型定義設計         | `outputs/phase-2/type-definitions.md`   | Phase 2成果物 |
| コンポーネント設計 | `outputs/phase-2/component-design.md`   | Phase 2成果物 |
| IPC通信設計        | `outputs/phase-2/ipc-design.md`         | Phase 2成果物 |

## 実行手順

### ステップ1: 型定義実装

```typescript
// packages/shared/src/types/agent.ts に追加

export type AgentExecutionStatus =
  | "idle"
  | "executing"
  | "streaming"
  | "awaiting_permission"
  | "completed"
  | "cancelled"
  | "error";

export interface AgentMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface PermissionRequest {
  executionId: string;
  requestId: string;
  toolName: string;
  args: Record<string, unknown>;
  reason?: string;
}

export interface PermissionResponse {
  requestId: string;
  approved: boolean;
  rememberChoice?: boolean;
}

export interface AgentExecutionState {
  status: AgentExecutionStatus;
  currentSkill: Skill | null;
  messages: AgentMessage[];
  currentStreamingMessage: string;
  error: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  pendingPermission: PermissionRequest | null;
  rememberedChoices: Map<string, boolean>;
}
```

### ステップ2: agentSlice拡張実装

```typescript
// apps/desktop/src/renderer/store/slices/agentSlice.ts

// 実行状態の初期値
const initialExecutionState: AgentExecutionState = {
  status: "idle",
  currentSkill: null,
  messages: [],
  currentStreamingMessage: "",
  error: null,
  startedAt: null,
  completedAt: null,
  pendingPermission: null,
  rememberedChoices: new Map(),
};

// アクション実装
// - startExecution
// - stopExecution
// - addMessage
// - appendStreamingContent
// - finalizeStreamingMessage
// - setExecutionError
// - clearMessages
// - resetExecutionState
// - setPermissionRequest
// - respondToPermission
// - rememberPermissionChoice
// - getRememberedChoice
// - clearRememberedChoices
```

### ステップ3: AgentMessageInput実装

```typescript
// apps/desktop/src/renderer/components/molecules/AgentMessageInput/index.tsx

interface AgentMessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const AgentMessageInput: React.FC<AgentMessageInputProps> = ({
  onSend,
  disabled = false,
  placeholder = "メッセージを入力...",
}) => {
  // 実装
};
```

### ステップ4: AgentOutputStream実装

```typescript
// apps/desktop/src/renderer/components/molecules/AgentOutputStream/index.tsx

interface AgentOutputStreamProps {
  content: string;
  isStreaming: boolean;
}

export const AgentOutputStream: React.FC<AgentOutputStreamProps> = ({
  content,
  isStreaming,
}) => {
  // 実装（カーソルブリンクアニメーション含む）
};
```

### ステップ5: AgentExecutionControls実装

```typescript
// apps/desktop/src/renderer/components/molecules/AgentExecutionControls/index.tsx

interface AgentExecutionControlsProps {
  status: AgentExecutionStatus;
  onCancel: () => void;
  onClear: () => void;
}

export const AgentExecutionControls: React.FC<AgentExecutionControlsProps> = ({
  status,
  onCancel,
  onClear,
}) => {
  // 実装
};
```

### ステップ6: AgentChatInterface実装

```typescript
// apps/desktop/src/renderer/components/organisms/AgentChatInterface/index.tsx

interface AgentChatInterfaceProps {
  messages: AgentMessage[];
  streamingContent: string;
  isStreaming: boolean;
}

export const AgentChatInterface: React.FC<AgentChatInterfaceProps> = ({
  messages,
  streamingContent,
  isStreaming,
}) => {
  // 実装（メッセージリスト + ストリーミング出力）
};
```

### ステップ7: PermissionDialog実装

```typescript
// apps/desktop/src/renderer/components/organisms/PermissionDialog/index.tsx

interface PermissionDialogProps {
  request: PermissionRequest | null;
  onApprove: (rememberChoice: boolean) => void;
  onDeny: (rememberChoice: boolean) => void;
}

export const PermissionDialog: React.FC<PermissionDialogProps> = ({
  request,
  onApprove,
  onDeny,
}) => {
  // 実装
};
```

### ステップ8: AgentExecutionView実装

```typescript
// apps/desktop/src/renderer/views/AgentExecutionView/index.tsx

export const AgentExecutionView: React.FC = () => {
  // Zustand store接続
  // IPC通信接続
  // 各コンポーネント配置
  // PermissionDialog連携
};
```

### ステップ9: IPC通信接続

```typescript
// apps/desktop/src/renderer/views/AgentExecutionView/hooks/useAgentExecution.ts

export const useAgentExecution = (skillId: string) => {
  // agent:start 送信
  // agent:stop 送信
  // agent:stream 受信
  // agent:status 受信
  // agent:permission 受信
  // agent:permission:res 送信
};
```

## 統合テスト連携【必須】

Renderer/Main Process接続の実装とテスト支援コード整備:

| 実装項目           | 内容                                   |
| ------------------ | -------------------------------------- |
| IPC接続            | agent:start/stop/stream チャンネル実装 |
| ストリーミング     | Main→Rendererのリアルタイム配信実装    |
| Permission連携     | Request/Response フロー実装            |
| エラーハンドリング | IPC障害時のUI表示実装                  |

## 成果物

| 成果物                 | パス                                                                     | 説明               |
| ---------------------- | ------------------------------------------------------------------------ | ------------------ |
| 型定義                 | `packages/shared/src/types/agent.ts`                                     | 拡張型定義         |
| agentSlice拡張         | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                   | 状態管理           |
| AgentMessageInput      | `apps/desktop/src/renderer/components/molecules/AgentMessageInput/`      | 入力コンポーネント |
| AgentOutputStream      | `apps/desktop/src/renderer/components/molecules/AgentOutputStream/`      | 出力コンポーネント |
| AgentExecutionControls | `apps/desktop/src/renderer/components/molecules/AgentExecutionControls/` | 制御コンポーネント |
| AgentChatInterface     | `apps/desktop/src/renderer/components/organisms/AgentChatInterface/`     | チャットUI         |
| PermissionDialog       | `apps/desktop/src/renderer/components/organisms/PermissionDialog/`       | 権限確認ダイアログ |
| AgentExecutionView     | `apps/desktop/src/renderer/views/AgentExecutionView/`                    | メインビュー       |

## 完了条件

- [ ] 型定義が実装されている
- [ ] agentSlice拡張が実装されている
- [ ] AgentMessageInputが実装されている
- [ ] AgentOutputStreamが実装されている
- [ ] AgentExecutionControlsが実装されている
- [ ] AgentChatInterfaceが実装されている
- [ ] PermissionDialogが実装されている
- [ ] AgentExecutionViewが実装されている
- [ ] IPC通信が接続されている（モック対応含む）
- [ ] すべてのテストが成功状態（Green）
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
```

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 2/4成果物）
2. 型定義の実装
3. agentSlice拡張の実装
4. AgentMessageInputの実装
5. AgentOutputStreamの実装
6. AgentExecutionControlsの実装
7. AgentChatInterfaceの実装
8. PermissionDialogの実装
9. AgentExecutionViewの実装
10. IPC通信の接続
11. テスト実行・Green確認
12. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/agent-execution-ui --phase 5
```

## 次のPhase

Phase 6: テスト拡充

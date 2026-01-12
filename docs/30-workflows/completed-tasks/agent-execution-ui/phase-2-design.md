# Phase 2: 設計

## メタ情報

| 項目       | 値                 |
| ---------- | ------------------ |
| Phase      | 2                  |
| 機能名     | agent-execution-ui |
| 作成日     | 2026-01-12         |
| ステータス | 未実施             |

## 目的

要件を実現可能な構造に落とし込む。型定義、コンポーネント構造、IPC通信フローを設計する。

## 実行タスク

- **型定義設計**: AgentExecutionState/PermissionRequest/PermissionResponse型の設計
- **コンポーネント設計**: Atomic Designに基づくコンポーネント階層設計
- **IPC通信設計**: Renderer ↔ Main間のストリーミング通信設計
- **状態管理設計**: agentSlice拡張の設計

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                         | 内容                     |
| ---------------------- | ---------------------------------------------------------------------------- | ------------------------ |
| Agent SDK仕様          | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`  | 既存型定義・Preload API  |
| UI/UXコンポーネント    | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`      | Atomic Design原則        |
| アーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | レイヤードアーキテクチャ |

### 前Phase成果物

| 資料         | パス                                         | 説明          |
| ------------ | -------------------------------------------- | ------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | Phase 1成果物 |

## 実行手順

### ステップ1: 型定義設計

**1. 実行状態の型定義**

```typescript
// packages/shared/src/types/agent.ts に追加

export type AgentExecutionStatus =
  | "idle" // 待機中
  | "executing" // 実行中
  | "streaming" // ストリーミング受信中
  | "awaiting_permission" // 権限確認待ち
  | "completed" // 完了
  | "cancelled" // キャンセル
  | "error"; // エラー

export interface AgentMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

// Permission Request（Main → Renderer）
export interface PermissionRequest {
  executionId: string;
  requestId: string;
  toolName: string;
  args: Record<string, unknown>;
  reason?: string;
}

// Permission Response（Renderer → Main）
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

**2. agentSlice拡張**

```typescript
// apps/desktop/src/renderer/store/slices/agentSlice.ts 拡張

export interface AgentSlice {
  // 既存のフィールド...

  // 実行状態
  executionState: AgentExecutionState;

  // アクション
  startExecution: (skill: Skill) => void;
  stopExecution: () => void;
  addMessage: (message: AgentMessage) => void;
  appendStreamingContent: (content: string) => void;
  finalizeStreamingMessage: () => void;
  setExecutionError: (error: string) => void;
  clearMessages: () => void;
  resetExecutionState: () => void;

  // Permission関連アクション
  setPermissionRequest: (request: PermissionRequest | null) => void;
  respondToPermission: (response: PermissionResponse) => void;
  rememberPermissionChoice: (toolName: string, approved: boolean) => void;
  getRememberedChoice: (toolName: string) => boolean | undefined;
  clearRememberedChoices: () => void;
}
```

### ステップ2: コンポーネント設計

**コンポーネント階層**

```
AgentExecutionView (view)
├── SkillHeader (選択中のスキル表示)
├── AgentChatInterface (organism)
│   ├── AgentMessageList
│   │   └── AgentMessageItem[]
│   └── AgentOutputStream (ストリーミング表示)
├── AgentMessageInput (molecule)
│   ├── TextArea
│   └── SendButton
├── AgentExecutionControls (molecule)
│   ├── ExecuteButton
│   ├── CancelButton
│   └── ClearButton
└── PermissionDialog (organism)
    ├── ToolInfo (ツール名・引数表示)
    ├── RememberChoiceCheckbox
    ├── ApproveButton
    └── DenyButton
```

**レイアウト設計**

```
┌──────────────────────────────────────────────────────────────┐
│ ← Back   tdd-principles                          [⚙️ Settings]│
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ 👤 User                                                 │  │
│ │ TDDでユーザー認証機能を実装してください                 │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ 🤖 Agent                                                │  │
│ │ TDDの原則に従って、まずはテストを作成します...         │  │
│ │ █ (streaming)                                           │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ [メッセージを入力...                              ] [Send]   │
├──────────────────────────────────────────────────────────────┤
│                    [Cancel] [Clear]                          │
└──────────────────────────────────────────────────────────────┘
```

### ステップ3: IPC通信設計

**IPCチャンネル一覧**

| チャンネル             | 方向            | ペイロード                            | 説明                     |
| ---------------------- | --------------- | ------------------------------------- | ------------------------ |
| `agent:start`          | Renderer → Main | `{ skillId: string, prompt: string }` | エージェント実行開始     |
| `agent:stop`           | Renderer → Main | `{ executionId: string }`             | 実行停止（AbortSignal）  |
| `agent:stream`         | Main → Renderer | `{ type: string, content: string }`   | ストリーミングメッセージ |
| `agent:status`         | Main → Renderer | `{ status: AgentExecutionStatus }`    | 実行状態変更通知         |
| `agent:permission`     | Main → Renderer | `PermissionRequest`                   | 権限確認要求             |
| `agent:permission:res` | Renderer → Main | `PermissionResponse`                  | 権限確認応答             |

**シーケンス図**

```
Renderer                    Main Process              Claude Agent SDK
   │                            │                           │
   │─── agent:start ───────────►│                           │
   │    { skillId, prompt }     │──── query() ─────────────►│
   │                            │                           │
   │◄── agent:stream ───────────│◄─── message ─────────────│
   │    { type, content }       │                           │
   │◄── agent:stream ───────────│◄─── message ─────────────│
   │    { type, content }       │                           │
   │                            │                           │
   │                         Permission Request Flow        │
   │                            │◄─── PermissionRequest ────│
   │◄── agent:permission ───────│    (ask rule triggered)   │
   │    { toolName, args }      │                           │
   │                            │       (User approves)     │
   │─── agent:permission:res ──►│───── proceed: true ──────►│
   │    { approved: true }      │                           │
   │                            │                           │
   │◄── agent:status ───────────│◄─── completed ───────────│
   │    { status: "completed" } │                           │
   │                            │                           │
   │─── agent:stop ────────────►│                           │
   │                            │──── abort() ─────────────►│
   │◄── agent:status ───────────│                           │
   │    { status: "cancelled" } │                           │
```

### ステップ4: PermissionDialogコンポーネント設計

```typescript
// PermissionDialog/index.tsx
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
  const [rememberChoice, setRememberChoice] = useState(false);

  if (!request) return null;

  return (
    <Dialog open={true}>
      <DialogHeader>
        <DialogTitle>権限の確認</DialogTitle>
      </DialogHeader>
      <DialogContent>
        <p>エージェントが以下のツールを使用しようとしています：</p>
        <ToolInfo toolName={request.toolName} args={request.args} />
        <Checkbox
          checked={rememberChoice}
          onChange={setRememberChoice}
          label="このツールの選択を記憶する"
        />
      </DialogContent>
      <DialogFooter>
        <Button variant="secondary" onClick={() => onDeny(rememberChoice)}>
          拒否
        </Button>
        <Button variant="primary" onClick={() => onApprove(rememberChoice)}>
          許可
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
```

## 統合テスト連携【必須】

統合ポイント/契約（IPCチャンネル・メッセージ型）を設計に反映する:

| 統合ポイント             | 契約定義                                           |
| ------------------------ | -------------------------------------------------- |
| Renderer → Main (start)  | `{ skillId: string, prompt: string }`              |
| Renderer → Main (stop)   | `{ executionId: string }`                          |
| Main → Renderer (stream) | `{ type: "text" \| "tool_use", content: string }`  |
| Main → Renderer (status) | `{ status: AgentExecutionStatus, error?: string }` |
| Permission Request       | `PermissionRequest` 型                             |
| Permission Response      | `PermissionResponse` 型                            |

## 成果物

| 成果物             | パス                                     | 説明                 |
| ------------------ | ---------------------------------------- | -------------------- |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md` | コンポーネント構造   |
| 型定義設計         | `outputs/phase-2/type-definitions.md`    | TypeScript型定義     |
| IPC通信設計        | `outputs/phase-2/ipc-design.md`          | シーケンス図含む     |
| コンポーネント設計 | `outputs/phase-2/component-design.md`    | 各コンポーネント詳細 |

## 完了条件

- [ ] 型定義が完成している（AgentExecutionState/PermissionRequest/PermissionResponse）
- [ ] コンポーネント構造がAtomic Designに基づき設計されている
- [ ] IPC通信フローが設計されている（シーケンス図含む）
- [ ] agentSlice拡張が設計されている
- [ ] 統合ポイント/契約が設計に反映されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認（Agent SDK仕様、UI/UXコンポーネント）
2. 型定義の設計（AgentExecutionState/PermissionRequest/PermissionResponse）
3. agentSlice拡張の設計
4. コンポーネント階層の設計
5. IPC通信フローの設計（シーケンス図作成）
6. 統合ポイント/契約の定義
7. 成果物の作成・配置
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/agent-execution-ui --phase 2
```

## 次のPhase

Phase 3: 設計レビューゲート

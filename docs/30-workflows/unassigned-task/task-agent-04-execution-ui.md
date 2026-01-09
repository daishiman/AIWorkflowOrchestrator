# エージェント実行UI - タスク指示書

## メタ情報

| 項目         | 内容               |
| ------------ | ------------------ |
| タスクID     | AGENT-004          |
| タスク名     | エージェント実行UI |
| 分類         | 要件               |
| 対象機能     | エージェント機能   |
| 優先度       | 高                 |
| 見積もり規模 | 大規模             |
| ステータス   | 未実施             |
| 発見元       | ユーザー要求       |
| 発見日       | 2026-01-09         |

---

## 依存関係と並行実行

### 依存関係マップ

```
task-agent-01-dashboard-foundation.md (AGENT-001)
    │
    ├──► task-agent-02-skill-management-ui.md (AGENT-002)
    │
    └──► task-agent-03-skill-management-backend.md (AGENT-003)
              │
              ├──► task-agent-04-execution-ui.md (AGENT-004/本タスク)
              │
              └──► task-agent-05-claude-code-integration.md (AGENT-005) ※本タスクと並行可能
                        │
                        ├──► task-agent-06-custom-environment-ui.md (AGENT-006)
                        │
                        └──► task-agent-07-environment-backend.md (AGENT-007)
```

### 本タスクの位置づけ

| 項目                     | 内容                                                           |
| ------------------------ | -------------------------------------------------------------- |
| 直接依存                 | AGENT-002（スキル管理UI）, AGENT-003（スキル管理バックエンド） |
| 並行実行可能             | AGENT-005（Claude Code統合）※バックエンドはモックで並行開発可  |
| 本タスク完了後に開始可能 | AGENT-006（カスタム実行環境UI）                                |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Claude Codeのスキルを実行し、エージェントとの対話を行うためのUIが必要。ユーザーはスキルを選択後、そのスキルに基づいたエージェントとチャット形式で対話し、タスクを実行したい。

### 1.2 問題点・課題

- スキルを実行するUIがない
- エージェントとの対話（チャット）インターフェースがない
- 実行中の状態（ストリーミング出力）を表示する機能がない
- 実行のキャンセル・中断機能がない
- 権限確認ダイアログ（Permission Dialog）がない

### 1.3 放置した場合の影響

- スキルベースのエージェント機能が利用できない
- CLI経由でのみスキル実行が可能となり、GUIの価値が低下
- ユーザーエクスペリエンスの大幅な劣化

---

## 2. 何を達成するか（What）

### 2.1 目的

選択したスキルに基づいてClaude Codeエージェントを実行し、ストリーミング出力を表示し、ユーザーと対話できるUIを提供する。

### 2.2 最終ゴール

- スキル選択後、実行画面に遷移できる
- ユーザーがメッセージを入力してエージェントに送信できる
- エージェントの出力がストリーミングで表示される
- 実行をキャンセルできる
- 実行履歴が保持される

### 2.3 スコープ

#### 含むもの

- AgentExecutionViewコンポーネント
- AgentChatInterfaceコンポーネント（チャット形式のUI）
- AgentOutputStreamコンポーネント（ストリーミング出力表示）
- PermissionDialogコンポーネント（権限確認ダイアログ）
- 実行制御ボタン（実行、キャンセル、クリア）
- 実行状態管理（agentSlice拡張）
- IPC通信（ストリーミング対応、Permission対応）

#### 含まないもの

- カスタム実行環境（別タスク: AGENT-006）
- バックエンドのClaude Code統合（別タスク: AGENT-005）
- 実行履歴の永続化（別タスク候補）

### 2.4 成果物

| 成果物                 | パス                                                                              |
| ---------------------- | --------------------------------------------------------------------------------- |
| AgentExecutionView     | `apps/desktop/src/renderer/views/AgentExecutionView/index.tsx`                    |
| AgentChatInterface     | `apps/desktop/src/renderer/components/organisms/AgentChatInterface/index.tsx`     |
| AgentOutputStream      | `apps/desktop/src/renderer/components/molecules/AgentOutputStream/index.tsx`      |
| AgentMessageInput      | `apps/desktop/src/renderer/components/molecules/AgentMessageInput/index.tsx`      |
| AgentExecutionControls | `apps/desktop/src/renderer/components/molecules/AgentExecutionControls/index.tsx` |
| PermissionDialog       | `apps/desktop/src/renderer/components/organisms/PermissionDialog/index.tsx`       |
| agentSlice更新         | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                            |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- AGENT-001（エージェントダッシュボード基盤）が完了している
- AGENT-002（スキル管理UI）が完了している
- AGENT-006（Claude Code統合）が完了している、またはモックで開発

### 3.2 依存タスク

- AGENT-001: エージェントダッシュボード基盤
- AGENT-002: スキル管理UI
- AGENT-006: Claude Code統合（並行開発可能、モック使用）

### 3.3 必要な知識・スキル

- React/TypeScript
- Electron IPC（ストリーミング通信）
- Zustand状態管理
- チャットUI実装

### 3.4 推奨アプローチ

1. 実行状態の型定義を拡張
2. AgentMessageInputから実装（入力UI）
3. AgentOutputStreamを実装（出力表示）
4. AgentChatInterfaceで統合
5. AgentExecutionControlsを実装
6. AgentExecutionViewで全体統合
7. ストリーミングIPC通信の接続

---

## 4. 実行手順

### Phase構成

Phase 1-13の標準フローに従って実装する。

### Phase 1: 要件定義

#### 使用スキル

| スキル名                    | パス                                                  | 選定理由                                |
| --------------------------- | ----------------------------------------------------- | --------------------------------------- |
| acceptance-criteria-writing | `.claude/skills/acceptance-criteria-writing/SKILL.md` | Given-When-Then形式で受け入れ基準を定義 |

#### 受け入れ基準（Given-When-Then）

```gherkin
Feature: エージェント実行UI

Scenario: スキル選択後に実行画面に遷移する
  Given ユーザーがスキル詳細パネルを表示している
  When 「実行」ボタンをクリックする
  Then AgentExecutionViewが表示される
  And 選択したスキルが上部に表示される

Scenario: メッセージを送信できる
  Given ユーザーが実行画面を表示している
  And メッセージ入力欄にテキストを入力している
  When 送信ボタンをクリックする（またはEnterキーを押す）
  Then メッセージがチャット履歴に表示される
  And エージェントへのリクエストが送信される

Scenario: エージェントの出力がストリーミング表示される
  Given ユーザーがメッセージを送信した
  When エージェントが応答を生成している
  Then 出力がリアルタイムで表示される
  And ローディングインジケーターが表示される

Scenario: 実行をキャンセルできる
  Given エージェントが実行中である
  When 「キャンセル」ボタンをクリックする
  Then 実行が中断される
  And 「実行がキャンセルされました」と表示される

Scenario: チャット履歴をクリアできる
  Given チャット履歴にメッセージがある
  When 「クリア」ボタンをクリックする
  Then 確認ダイアログが表示される
  And 「はい」を選択するとチャット履歴がクリアされる

Scenario: エラーが発生した場合にエラーメッセージが表示される
  Given ユーザーがメッセージを送信した
  When エージェント実行中にエラーが発生する
  Then エラーメッセージがチャット履歴に表示される
  And 実行状態が停止に変わる

Scenario: 権限確認ダイアログが表示される
  Given エージェントが実行中である
  When askルールに該当するツールが呼び出される
  Then PermissionDialogが表示される
  And ツール名と引数が表示される

Scenario: 権限確認ダイアログで許可できる
  Given PermissionDialogが表示されている
  When 「許可」ボタンをクリックする
  Then ダイアログが閉じる
  And エージェントの実行が続行される

Scenario: 権限確認ダイアログで拒否できる
  Given PermissionDialogが表示されている
  When 「拒否」ボタンをクリックする
  Then ダイアログが閉じる
  And エージェントにツール使用が拒否されたことが通知される

Scenario: 権限確認ダイアログで選択を記憶できる
  Given PermissionDialogが表示されている
  When 「このツールの選択を記憶する」にチェックを入れる
  And 「許可」または「拒否」をクリックする
  Then 同一ツールの次回以降の確認がスキップされる
```

#### 成果物

- `outputs/phase-1/requirements.md`

#### 完了条件

- [ ] 受け入れ基準がGiven-When-Then形式で定義されている
- [ ] UI/UXフローが定義されている

---

### Phase 2: 設計

#### 使用スキル

| スキル名          | パス                                        | 選定理由           |
| ----------------- | ------------------------------------------- | ------------------ |
| responsive-design | `.claude/skills/responsive-design/SKILL.md` | チャットUI設計     |
| domain-modeling   | `.claude/skills/domain-modeling/SKILL.md`   | 実行状態モデル設計 |

#### 設計内容

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

// Permission Request（AGENT-005から受信）
export interface PermissionRequest {
  executionId: string;
  requestId: string;
  toolName: string;
  args: Record<string, unknown>;
  reason?: string;
}

// Permission Response（AGENT-005へ送信）
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
  pendingPermission: PermissionRequest | null; // 保留中の権限確認
  rememberedChoices: Map<string, boolean>; // 記憶された選択（toolName → approved）
}
```

**2. agentSlice拡張**

```typescript
// agentSlice.ts 拡張
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

**3. コンポーネント構造**

```
AgentExecutionView
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
└── PermissionDialog (organism) ← NEW
    ├── ToolInfo (ツール名・引数表示)
    ├── RememberChoiceCheckbox
    ├── ApproveButton
    └── DenyButton
```

**PermissionDialogコンポーネント設計**

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

**4. レイアウト設計**

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

**5. IPC通信フロー**

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

**IPCチャネル一覧**

| チャネル               | 方向            | 説明                       |
| ---------------------- | --------------- | -------------------------- |
| `agent:start`          | Renderer → Main | エージェント実行開始       |
| `agent:stop`           | Renderer → Main | 実行停止（AbortSignal）    |
| `agent:stream`         | Main → Renderer | ストリーミングメッセージ   |
| `agent:status`         | Main → Renderer | 実行状態変更通知           |
| `agent:permission`     | Main → Renderer | 権限確認要求（ダイアログ） |
| `agent:permission:res` | Renderer → Main | 権限確認応答（許可/拒否）  |

#### 成果物

- `outputs/phase-2/design.md`
- シーケンス図

#### 完了条件

- [ ] 型定義が完成している
- [ ] コンポーネント構造が設計されている
- [ ] IPC通信フローが設計されている

---

### Phase 3: 設計レビューゲート

#### 使用スキル

| スキル名             | パス                                           | 選定理由         |
| -------------------- | ---------------------------------------------- | ---------------- |
| code-smell-detection | `.claude/skills/code-smell-detection/SKILL.md` | 設計品質チェック |

#### 完了条件

- [ ] 既存ChatViewとの整合性が確認されている
- [ ] ストリーミング処理の設計が適切

---

### Phase 4: テスト作成

#### 使用スキル

| スキル名       | パス                                     | 選定理由        |
| -------------- | ---------------------------------------- | --------------- |
| tdd-principles | `.claude/skills/tdd-principles/SKILL.md` | TDDでテスト先行 |

#### テストケース

```typescript
// agentSlice.test.ts - 実行状態関連
describe("agentSlice execution", () => {
  it("should start execution with skill", () => {});
  it("should stop execution", () => {});
  it("should add user message", () => {});
  it("should append streaming content", () => {});
  it("should finalize streaming message", () => {});
  it("should set execution error", () => {});
  it("should clear messages", () => {});
});

// AgentChatInterface.test.tsx
describe("AgentChatInterface", () => {
  it("should display messages", () => {});
  it("should display streaming content", () => {});
  it("should scroll to bottom on new message", () => {});
});

// AgentMessageInput.test.tsx
describe("AgentMessageInput", () => {
  it("should call onSend when button clicked", () => {});
  it("should call onSend when Enter pressed", () => {});
  it("should be disabled when executing", () => {});
  it("should clear input after send", () => {});
});

// AgentExecutionControls.test.tsx
describe("AgentExecutionControls", () => {
  it("should show cancel button when executing", () => {});
  it("should call onCancel when cancel clicked", () => {});
  it("should call onClear when clear clicked after confirmation", () => {});
});

// PermissionDialog.test.tsx
describe("PermissionDialog", () => {
  it("should not render when request is null", () => {});
  it("should display tool name and args", () => {});
  it("should call onApprove when approve clicked", () => {});
  it("should call onDeny when deny clicked", () => {});
  it("should pass rememberChoice flag on approve", () => {});
  it("should pass rememberChoice flag on deny", () => {});
});

// agentSlice.test.ts - Permission関連
describe("agentSlice permission", () => {
  it("should set pending permission request", () => {});
  it("should clear pending permission on respond", () => {});
  it("should remember permission choice", () => {});
  it("should return remembered choice for tool", () => {});
  it("should clear all remembered choices", () => {});
});
```

#### 完了条件

- [ ] 実行状態管理のテストがある
- [ ] 各コンポーネントのテストがある
- [ ] すべてのテストが失敗状態（Red）

---

### Phase 5: 実装

#### 使用スキル

| スキル名          | パス                                        | 選定理由       |
| ----------------- | ------------------------------------------- | -------------- |
| responsive-design | `.claude/skills/responsive-design/SKILL.md` | チャットUI実装 |

#### 実装ファイル

1. `packages/shared/src/types/agent.ts`（更新）
2. `apps/desktop/src/renderer/store/slices/agentSlice.ts`（更新）
3. `apps/desktop/src/renderer/components/molecules/AgentMessageInput/index.tsx`
4. `apps/desktop/src/renderer/components/molecules/AgentOutputStream/index.tsx`
5. `apps/desktop/src/renderer/components/molecules/AgentExecutionControls/index.tsx`
6. `apps/desktop/src/renderer/components/organisms/AgentChatInterface/index.tsx`
7. `apps/desktop/src/renderer/components/organisms/PermissionDialog/index.tsx`
8. `apps/desktop/src/renderer/views/AgentExecutionView/index.tsx`
9. `apps/desktop/src/renderer/views/AgentView/index.tsx`（ルーティング追加）

#### 完了条件

- [ ] 全コンポーネントが実装されている
- [ ] チャットUIが動作する
- [ ] ストリーミング表示が動作する
- [ ] 実行制御が動作する
- [ ] テストがすべて通過（Green）

---

### Phase 6-13: 標準フロー

標準のPhase 6-13フローに従って実装を完了する。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] スキル選択後に実行画面に遷移できる
- [ ] メッセージを送信できる
- [ ] エージェントの出力がストリーミング表示される
- [ ] 実行をキャンセルできる
- [ ] チャット履歴をクリアできる
- [ ] エラー時にエラーメッセージが表示される
- [ ] Permission Dialogが表示される（askルールのツール使用時）
- [ ] Permission Dialogで許可/拒否を選択できる
- [ ] Permission Dialogで選択を記憶できる

### 品質要件

- [ ] テストカバレッジ: Line 80%以上
- [ ] TypeScript型エラーなし
- [ ] ESLint/Prettierエラーなし

### ドキュメント要件

- [ ] コンポーネントにJSDocコメントがある
- [ ] 実装ガイドが作成されている

---

## 6. 検証方法

### テストケース

```bash
# ユニットテスト
pnpm --filter @repo/desktop test src/renderer/store/slices/agentSlice.test.ts
pnpm --filter @repo/desktop test src/renderer/components/organisms/AgentChatInterface/
pnpm --filter @repo/desktop test src/renderer/views/AgentExecutionView/
```

### 検証手順

1. AgentViewでスキルを選択
2. 「実行」ボタンをクリック
3. 実行画面が表示されることを確認
4. メッセージを入力して送信
5. ストリーミング出力が表示されることを確認
6. 「キャンセル」ボタンで実行が中断されることを確認
7. 「クリア」ボタンで履歴がクリアされることを確認

---

## 7. リスクと対策

| リスク                           | 影響度 | 発生確率 | 対策                                   |
| -------------------------------- | ------ | -------- | -------------------------------------- |
| ストリーミングの遅延・途切れ     | 高     | 中       | 再接続ロジック、タイムアウト処理       |
| 長時間実行時のメモリリーク       | 中     | 中       | メッセージ数上限、古いメッセージの削除 |
| キャンセル時のクリーンアップ失敗 | 中     | 低       | プロセス強制終了、リソース解放の徹底   |

---

## 8. 参照情報

### 関連ドキュメント

- `apps/desktop/src/renderer/views/ChatView/` - 既存チャットUI参照
- `apps/desktop/src/renderer/components/organisms/ChatInput/` - 既存入力コンポーネント
- `apps/desktop/src/preload/channels.ts` - IPC通信パターン

### 参考資料

- [React Streaming Patterns](https://react.dev/reference/react/useSyncExternalStore)
- 既存のLLMストリーミング実装（`llmSlice.ts`、`llmHandlers.ts`）

---

## 9. 備考

### 補足事項

- 既存のChatViewとの共通化を検討（将来的にリファクタリング）
- メッセージはMarkdown形式で表示（コードハイライト対応）
- ストリーミング表示はカーソルブリンクアニメーション付き

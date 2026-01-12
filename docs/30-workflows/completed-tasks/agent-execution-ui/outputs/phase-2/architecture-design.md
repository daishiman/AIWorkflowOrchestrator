# エージェント実行UI アーキテクチャ設計

## 概要

| 項目     | 内容               |
| -------- | ------------------ |
| タスクID | AGENT-004          |
| 機能名   | agent-execution-ui |
| Phase    | 2                  |
| 作成日   | 2026-01-12         |

---

## 全体アーキテクチャ

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Renderer Process                                  │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                              React UI                                   │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │ │
│  │  │                      AgentExecutionView                           │  │ │
│  │  │  ┌──────────────┐ ┌──────────────────┐ ┌───────────────────────┐ │  │ │
│  │  │  │ SkillHeader  │ │AgentChatInterface│ │   PermissionDialog    │ │  │ │
│  │  │  └──────────────┘ │  ┌─────────────┐ │ │  (Modal/Overlay)      │ │  │ │
│  │  │                    │  │MessageList  │ │ └───────────────────────┘ │  │ │
│  │  │  ┌──────────────┐ │  │OutputStream │ │                           │  │ │
│  │  │  │ MessageInput │ │  └─────────────┘ │ ┌───────────────────────┐ │  │ │
│  │  │  │ ExecControls │ └──────────────────┘ │      Toast/Error      │ │  │ │
│  │  │  └──────────────┘                       └───────────────────────┘ │  │ │
│  │  └───────────────────────────────────────────────────────────────────┘  │ │
│  │                                 │                                        │ │
│  │                                 │ useStore (Zustand)                     │ │
│  │                                 ▼                                        │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐   │ │
│  │  │                         agentSlice                                │   │ │
│  │  │   skills | availableSkills | executionState | actions            │   │ │
│  │  └──────────────────────────────────────────────────────────────────┘   │ │
│  │                                 │                                        │ │
│  └─────────────────────────────────┼────────────────────────────────────────┘ │
│                                    │ window.agentAPI                         │
└────────────────────────────────────┼─────────────────────────────────────────┘
                                     │ IPC (contextBridge)
┌────────────────────────────────────┼─────────────────────────────────────────┐
│                              Main Process                                     │
│  ┌─────────────────────────────────┴────────────────────────────────────────┐│
│  │                        IPC Handler (agent-handler)                        ││
│  │   agent:start | agent:stop | agent:permission:res                        ││
│  └─────────────────────────────────┬────────────────────────────────────────┘│
│  ┌─────────────────────────────────┴────────────────────────────────────────┐│
│  │                        Agent Executor Service                             ││
│  │   executeAgent() | handlePermission() | cancelExecution()                ││
│  └─────────────────────────────────┬────────────────────────────────────────┘│
│  ┌─────────────────────────────────┴────────────────────────────────────────┐│
│  │                      Agent Client (@repo/shared)                          ││
│  │   query() | abort() | onMessage() | onPermission()                        ││
│  └─────────────────────────────────┬────────────────────────────────────────┘│
└────────────────────────────────────┼─────────────────────────────────────────┘
                                     │ Claude Agent SDK / Mock
┌────────────────────────────────────┴─────────────────────────────────────────┐
│                      Claude Agent SDK (External)                              │
│                      - query() with streaming                                 │
│                      - PermissionRequest callback                             │
│                      - abort() signal                                         │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

## レイヤー構成

### Renderer Process層

| レイヤー        | 責務                   | 主要ファイル                 |
| --------------- | ---------------------- | ---------------------------- |
| View            | 画面構成、ルーティング | `views/AgentExecutionView/`  |
| Organism        | 複合コンポーネント     | `components/organisms/`      |
| Molecule        | 単機能コンポーネント   | `components/molecules/`      |
| Store (Zustand) | 状態管理               | `store/slices/agentSlice.ts` |
| Hooks           | カスタムロジック       | `hooks/useAgentExecution.ts` |
| API             | IPC通信ラッパー        | `preload/agentApi.ts`        |

### Main Process層

| レイヤー    | 責務             | 主要ファイル                   |
| ----------- | ---------------- | ------------------------------ |
| IPC Handler | IPC受信・応答    | `main/agent/agent-handler.ts`  |
| Service     | ビジネスロジック | `main/agent/agent-executor.ts` |
| Client      | SDK通信          | `shared/agent/agent-client.ts` |

### Shared層

| レイヤー   | 責務                   | 主要ファイル                 |
| ---------- | ---------------------- | ---------------------------- |
| Types      | 共有型定義             | `shared/types/agent.ts`      |
| Validation | バリデーションスキーマ | `shared/agent/validation.ts` |

---

## データフロー

### メッセージ送信フロー

```
[User Input]
     │
     ▼
[AgentMessageInput] ─────► onChange(value)
     │
     ▼ (Enterキー or ボタン)
[onSubmit] ─────► agentSlice.addUserMessage(content)
     │
     ▼
[useAgentExecution] ─────► window.agentAPI.start({ skillId, prompt })
     │
     ▼ (IPC)
[agent-handler] ─────► generateExecutionId()
     │                    │
     │                    ▼
     │               sendStatus('executing')
     │                    │
     ▼                    ▼
[agent-executor] ─────► agentClient.query(prompt, options)
     │
     ▼ (streaming)
[agent:stream] ─────► (IPC to Renderer)
     │
     ▼
[agentSlice.appendStreamingContent] ─────► UI更新
```

### 権限確認フロー

```
[Agent SDK]
     │ PermissionRequest
     ▼
[agent-executor] ─────► pendingPermissions.set(requestId, resolver)
     │
     ▼
[agent-handler] ─────► sendPermissionRequest(window, request)
     │
     ▼ (IPC: agent:permission)
[Renderer] ─────► agentSlice.setPermissionRequest(request)
     │
     ▼
[PermissionDialog] ─────► 表示
     │
     ▼ (ユーザー選択)
[onApprove/onDeny] ─────► window.agentAPI.respondPermission(response)
     │
     ▼ (IPC: agent:permission:res)
[agent-handler] ─────► handlePermissionResponse(response)
     │
     ▼
[agent-executor] ─────► pendingPermissions.get(requestId).resolve(approved)
     │
     ▼
[Agent SDK] ─────► 続行 or 中断
```

---

## 状態管理設計

### Zustand Store構造

```typescript
interface RootStore {
  // Skill Dashboard機能（既存）
  skills: Skill[];
  availableSkills: Skill[];
  selectedSkill: Skill | null;
  // ...その他既存フィールド

  // Agent Execution機能（新規）
  executionState: AgentExecutionState;
}
```

### 状態遷移図

```
                  ┌─────────────────┐
                  │      idle       │
                  └────────┬────────┘
                           │ startExecution()
                           ▼
                  ┌─────────────────┐
                  │   executing     │
                  └────────┬────────┘
                           │ onStream()
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  streaming      │ │awaiting_permission│ │    error       │
└────────┬────────┘ └────────┬────────┘ └─────────────────┘
         │                   │
         │ onComplete()      │ respondPermission()
         │                   │
         ▼                   ▼
┌─────────────────┐ ┌─────────────────┐
│   completed     │ │   streaming     │
└─────────────────┘ └─────────────────┘

                stopExecution() → cancelled (from any state)
```

---

## 依存関係

### パッケージ依存

```
@repo/desktop
├── @repo/shared (型定義、バリデーション)
├── @repo/ui (共通UIコンポーネント)
├── react
├── zustand
├── electron
└── lucide-react

@repo/shared
├── zod
└── typescript
```

### モジュール依存（Renderer）

```
AgentExecutionView
├── useAgentExecution (hook)
│   ├── useStore (zustand)
│   └── window.agentAPI
├── AgentChatInterface
│   ├── AgentMessageList
│   │   └── AgentMessageItem
│   └── AgentOutputStream
├── AgentMessageInput
├── AgentExecutionControls
└── PermissionDialog
    └── ToolInfo
```

### モジュール依存（Main）

```
agent-handler
├── agent-executor
│   └── agent-client (shared)
└── validation (shared)
```

---

## エラーハンドリング戦略

### エラー分類

| エラー種別           | 処理方法               | UI表示               |
| -------------------- | ---------------------- | -------------------- |
| バリデーションエラー | ローカルエラー表示     | 入力欄下にメッセージ |
| IPC通信エラー        | システムメッセージ追加 | チャット内エラー     |
| SDK接続エラー        | システムメッセージ追加 | チャット内エラー     |
| タイムアウト         | 自動キャンセル         | チャット内通知       |
| ユーザーキャンセル   | 正常終了扱い           | チャット内通知       |

### Error Boundary

```typescript
// Renderer側のError Boundary配置
<ErrorBoundary fallback={<AgentExecutionErrorFallback />}>
  <AgentExecutionView />
</ErrorBoundary>
```

---

## セキュリティ考慮

### IPC通信

| 対策           | 実装方法                              |
| -------------- | ------------------------------------- |
| 入力検証       | Zodスキーマによるバリデーション       |
| 権限確認       | PermissionDialogによるユーザー承認    |
| contextBridge  | 最小限のAPIのみ公開                   |
| チャンネル命名 | `agent:` プレフィックスで名前空間分離 |

### 権限管理

| 対策           | 実装方法                         |
| -------------- | -------------------------------- |
| askルール      | ツール実行前にユーザー確認       |
| 記憶機能       | ツール単位で記憶、セッション限定 |
| 拒否オプション | ユーザーは常に拒否可能           |

---

## パフォーマンス考慮

### ストリーミング最適化

| 対策           | 実装方法                             |
| -------------- | ------------------------------------ |
| バッチ更新     | requestAnimationFrameでバッチ処理    |
| 仮想スクロール | 長いチャット履歴の最適化（将来対応） |
| メモ化         | useMemoでメッセージリストを最適化    |

### メモリ管理

| 対策           | 実装方法                         |
| -------------- | -------------------------------- |
| リスナー解除   | useEffect cleanup                |
| 履歴上限       | 最大メッセージ数制限（将来対応） |
| ストリーム完了 | 完了後の一時データ解放           |

---

## テスト戦略

### テストレベル

| レベル      | 対象                         | ツール      |
| ----------- | ---------------------------- | ----------- |
| Unit        | コンポーネント、フック、状態 | Vitest, RTL |
| Integration | IPC通信、状態連携            | Vitest      |
| E2E         | 全フロー                     | Playwright  |

### モック戦略

| 対象          | モック方法          |
| ------------- | ------------------- |
| IPC通信       | vi.mock('electron') |
| Claude SDK    | MockAgentClient     |
| Zustand Store | createMockStore()   |

---

## ファイル配置

```
apps/desktop/src/
├── main/
│   └── agent/
│       ├── agent-handler.ts
│       ├── agent-executor.ts
│       └── agent-executor.test.ts
├── preload/
│   └── agentApi.ts
└── renderer/
    ├── views/
    │   └── AgentExecutionView/
    │       ├── index.tsx
    │       ├── AgentExecutionView.test.tsx
    │       └── components/
    ├── components/
    │   ├── molecules/
    │   │   ├── AgentMessageInput.tsx
    │   │   ├── AgentMessageList.tsx
    │   │   ├── AgentMessageItem.tsx
    │   │   ├── AgentOutputStream.tsx
    │   │   ├── AgentExecutionControls.tsx
    │   │   ├── SkillHeader.tsx
    │   │   └── ToolInfo.tsx
    │   └── organisms/
    │       ├── AgentChatInterface.tsx
    │       └── PermissionDialog.tsx
    ├── hooks/
    │   └── useAgentExecution.ts
    └── store/
        └── slices/
            └── agentSlice.ts

packages/shared/src/
├── types/
│   └── agent.ts
└── agent/
    ├── validation.ts
    └── agent-client.ts
```

---

## 変更履歴

| Version | Date       | Author | Changes  |
| ------- | ---------- | ------ | -------- |
| 1.0.0   | 2026-01-12 | Claude | 初版作成 |

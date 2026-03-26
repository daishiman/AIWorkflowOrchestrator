# LLM・Embedding インターフェース仕様

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 概要

本ドキュメントはAIWorkflowOrchestratorプロジェクトのLLM・Embeddingインターフェースのインデックスです。
各カテゴリは以下の分割ドキュメントで詳細を定義しています。

---

## ドキュメント構成

| カテゴリ               | ファイル                                                     | 説明                                        |
| ---------------------- | ------------------------------------------------------------ | ------------------------------------------- |
| IPC型定義・Multi-LLM   | [llm-ipc-types.md](./llm-ipc-types.md)                       | Desktop IPC型、プロバイダー切替、Zod Schema |
| ストリーミング         | [llm-streaming.md](./llm-streaming.md)                       | SSE、AbortController、キャンセル機構        |
| Embedding Generation   | [llm-embedding.md](./llm-embedding.md)                       | チャンキング、バッチ処理、パイプライン      |
| Workspace Chat Edit    | [llm-workspace-chat-edit.md](./llm-workspace-chat-edit.md)   | ファイルI/O、コンテキスト構築、LLM統合      |

---

## アーキテクチャ概要

LLM統合アーキテクチャは、Electronのセキュアなプロセス分離モデルに基づき、Renderer ProcessとMain Processの2層構成で設計されている。

### Renderer Process（UIレイヤー）

ユーザーインターフェースを担当し、以下のコンポーネントで構成される。

| コンポーネント     | 責務                                   |
| ------------------ | -------------------------------------- |
| ProviderSelector   | LLMプロバイダーの選択UI                |
| ModelSelector      | モデルの選択UI                         |
| StreamingMessage   | ストリーミングレスポンスの表示         |
| WorkspaceChatPanel | file context / mention / streaming UI |

これらのコンポーネントは、contextBridgeを介したIPC Bridgeを通じてMain Processと通信する。

### Main Process（バックエンドレイヤー）

セキュアな処理を担当し、IPC Handlersがリクエストを受け付けて以下のサービスに振り分ける。

| サービス           | 責務                                   |
| ------------------ | -------------------------------------- |
| LLM Adapters       | 各プロバイダー（OpenAI, Anthropic等）への接続とリクエスト処理 |
| Embedding Provider | テキストのベクトル化処理               |
| ChatEdit Service   | ワークスペースコンテキストを含むチャット処理 |
| RuntimeResolver    | auth mode / API key から integrated と handoff を判定 |
| AnthropicLLMAdapter | Anthropic API への直接呼び出し（`net.fetch` 使用） |
| TerminalHandoffBuilder | handoff 時の `terminalCommand` / `contextSummary` を構築 |

### 通信フロー

Renderer Processの各コンポーネントからのリクエストは、IPC Bridge（contextBridge）を経由してMain ProcessのIPC Handlersに到達する。IPC Handlersは処理内容に応じて適切なサービス（LLM Adapters、Embedding Provider、ChatEdit Service）にルーティングする

---

## 対応LLMプロバイダー

current branch の provider catalog 正本は
`packages/shared/src/types/llm/schemas/provider-registry.ts`。
本節は代表例のみを載せ、詳細な current contract は
[llm-ipc-types.md](./llm-ipc-types.md) を参照する。

| プロバイダー | 代表モデル例 | current note |
| ------------ | ------------ | ------------ |
| OpenAI | `gpt-5.4`, `o3` | `gpt-` / `o3` / `o4` prefix で推定 |
| Anthropic | `claude-sonnet-4-6`, `claude-haiku-4-5` | `claude-` prefix |
| Google | `gemini-3-flash-preview`, `gemini-3.1-pro-preview` | `gemini-` prefix |
| xAI | `grok-4-1-fast-non-reasoning`, `grok-3-mini` | `grok-` prefix |
| OpenRouter | `openai/gpt-4o`, `anthropic/claude-3.5-sonnet` | slash form を `specialMatcher` で判定 |

### 読む順番

1. provider/model 正本を確認する: [llm-ipc-types.md](./llm-ipc-types.md)
2. UI surface を確認する: [ui-ux-llm-selector.md](./ui-ux-llm-selector.md)
3. stream / workspace 実行経路を確認する: [llm-streaming.md](./llm-streaming.md), [llm-workspace-chat-edit.md](./llm-workspace-chat-edit.md)

---

## 主要IPCチャンネル

| チャンネル           | 方向            | 説明                     | 詳細                     |
| -------------------- | --------------- | ------------------------ | ------------------------ |
| llm:get-providers    | Renderer → Main | プロバイダー一覧取得     | [llm-ipc-types.md](./llm-ipc-types.md) |
| llm:send-chat        | Renderer → Main | チャット送信             | [llm-ipc-types.md](./llm-ipc-types.md) |
| llm:stream-chat      | Renderer ↔ Main | ストリーミングチャット   | [llm-streaming.md](./llm-streaming.md) |
| chat-edit:send-with-context | Renderer → Main | コンテキスト付きチャット（`SendWithContextResponse.handoff/guidance` を含む） | [llm-workspace-chat-edit.md](./llm-workspace-chat-edit.md) |
| conversation:create / add-message | Renderer → Main | 04B の会話永続化 | [interfaces-chat-history.md](./interfaces-chat-history.md) |

---

## 主要型定義（v2.4.0 追加分）

TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 で追加・変更された型定義。詳細は [llm-workspace-chat-edit.md](./llm-workspace-chat-edit.md) を参照。

### RuntimeResolution

```typescript
type RuntimeResolution =
  | { type: "integrated"; adapter: LLMAdapter }
  | { type: "handoff"; reason: string };
```

### HandoffGuidance

```typescript
interface HandoffGuidance {
  terminalCommand: string;
  contextSummary: string;
  reason: string;
}
```

### SendWithContextRequest / Response 変更点

| フィールド | 変更内容 |
| --- | --- |
| `SendWithContextRequest.workspacePath?` | `string` 型で追加（任意） |
| `SendWithContextRequest.message` | `string` → `string?`（optional に変更） |
| `SendWithContextResponse.handoff?` | `boolean` 型で追加（任意） |
| `SendWithContextResponse.guidance?` | `HandoffGuidance` 型で追加（任意） |

### chatEditSlice 型変更

| 型 | フィールド | 変更内容 |
| --- | --- | --- |
| `ChatEditState` | `selection` | `TextSelection \| null` を追加 |
| `ChatEditActions` | `setSelection` | `(selection: TextSelection \| null) => void` を追加 |

---

## 品質メトリクス サマリー

| コンポーネント      | テスト数 | Line Coverage | Branch Coverage |
| ------------------- | -------- | ------------- | --------------- |
| LLM Adapter         | 360      | 99.25%        | 90.56%          |
| Streaming           | 129      | -             | 全PASS          |
| Embedding Pipeline  | 104 + 14 | 91.39%        | 87.13%          |
| Workspace Chat Edit | 164 + 45 | 95%           | 90%             |
| Workspace Chat Panel | 14 | 83.80%（task-scope） | 77.44%（task-scope） |

---

## 完了タスク

### Workspace Chat Edit Main Process（TASK-WCE-MAIN-001）

| 項目         | 内容                                                           |
| ------------ | -------------------------------------------------------------- |
| タスクID     | TASK-WCE-MAIN-001                                              |
| Issue        | #469                                                           |
| 完了日       | 2026-01-25                                                     |
| 実装内容     | FileService, ContextBuilder, ChatEditService, chatEditHandlers |
| テスト数     | 164（自動）+ 23（手動検証項目）                                |
| カバレッジ   | Line 92.55%, Branch 92.85%                                     |

### LLMストリーミングレスポンス（UT-LLM-STREAM-001）

| 項目         | 内容                                                                                          |
| ------------ | --------------------------------------------------------------------------------------------- |
| タスクID     | UT-LLM-STREAM-001                                                                             |
| 完了日       | 2026-01-24                                                                                    |
| テスト数     | 129（自動テスト）+ 19（手動テスト項目）                                                       |
| 発見課題     | 0件（Critical/Major/Minor）、2件（Info）                                                      |

### 会話履歴永続化（UT-LLM-HISTORY-001）

| 項目         | 内容                                                                                      |
| ------------ | ----------------------------------------------------------------------------------------- |
| タスクID     | UT-LLM-HISTORY-001                                                                        |
| 完了日       | 2026-01-24                                                                                |
| テスト数     | 114（自動テスト）+ 12（手動テスト項目）                                                   |
| カバレッジ   | Line 100%, Branch 100%, Function 100%                                                     |

### Workspace管理統合（TASK-WCE-WORKSPACE-001）

| 項目         | 内容                                                                                    |
| ------------ | --------------------------------------------------------------------------------------- |
| タスクID     | TASK-WCE-WORKSPACE-001                                                                  |
| Issue        | #660                                                                                    |
| 完了日       | 2026-02-02                                                                              |
| 実装内容     | workspacePathパラメータ追加、isWithinWorkspace検証、folderFileTreesからファイル一覧取得 |
| 修正ファイル | chatEditHandlers.ts, useFileContext.ts, fileTreeUtils.ts（新規）                        |
| テスト数     | 45（ユニット＋統合）                                                                    |
| カバレッジ   | Line 95%, Branch 90%, Function 100%                                                     |
| 詳細         | [llm-workspace-chat-edit.md](./llm-workspace-chat-edit.md#workspace管理統合task-wce-workspace-0012026-02-02完了) |

### Workspace Chat Panel統合（TASK-UI-04B-WORKSPACE-CHAT）

| 項目         | 内容 |
| ------------ | ---- |
| タスクID     | TASK-UI-04B-WORKSPACE-CHAT |
| 完了日       | 2026-03-11 |
| 実装内容     | `WorkspaceView` へ `WorkspaceChatPanel` を統合。`useWorkspaceChatController` で file context / mention / stream / conversation 保存を結線 |
| 主要API      | `llm:stream-chat`, `llm:cancel-stream`, `conversation:create`, `conversation:add-message`, `file:read` |
| テスト       | 3 files / 14 tests PASS |
| 証跡         | `docs/30-workflows/completed-tasks/task-059a-ui-04b-workspace-chat-panel/outputs/phase-11/screenshots/` |

### Workspace Chat Edit Runtime Activation（TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001）

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |
| 完了日 | 2026-03-14 |
| 実装内容 | `RuntimeResolver` / `AnthropicLLMAdapter` / `TerminalHandoffBuilder` を追加し、`chat-edit:send-with-context` で integrated/handoff を分岐 |
| 契約更新 | `SendWithContextRequest.workspacePath?`、`SendWithContextResponse.handoff?` / `guidance?` |
| セキュリティ | `workspacePath` 指定時に `isAllowedPath()` で context file を検証、handoff command へ secret 非混入 |
| 検証 | `chatEditHandlers.*` 4 files / 55 tests PASS、`@repo/desktop typecheck` PASS |

---

## ChatPanel コンポーネント設計（TASK-IMP-CHATPANEL-REAL-AI-CHAT-001）

TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 で設計された ChatPanel の実チャット配線仕様。placeholder 3箇所（model-selector-slot, message-list-slot, chat-input-slot）を実コンポーネントに置換する設計定義。

### コンポーネント階層（12コンポーネント）

| コンポーネント | 種類 | 親 | 役割 |
| --- | --- | --- | --- |
| `RuntimeBanner` | molecule | `ChatPanel` | AccessCapability（integratedRuntime/terminalSurface/both/none）を視覚表示 |
| `ChatMessage` | molecule | `ChatMessageList` | user/assistant メッセージ表示 |
| `ChatMessageList` | organism | `ChatPanel` | 会話履歴の一覧表示、role="log" aria-live="polite" |
| `ErrorGuidance` | molecule | `ChatPanel` | retryable エラー時の再試行導線表示 |
| `HandoffBlock` | molecule | `ChatPanel` | handoff 状態時のターミナル起動促進表示 |
| `PersistentTerminalLauncher` | molecule | `HandoffBlock` | ターミナルコマンド表示とコピー/起動ボタン |
| `ComposerInput` | atom | `ComposerArea` | テキスト入力フィールド（P42 3段バリデーション対応） |
| `SendButton` | atom | `ComposerArea` | 送信ボタン（streaming中は disabled） |
| `ComposerArea` | molecule | `ChatPanel` | ComposerInput + SendButton の統合エリア |
| `LLMSelectorPanel` | organism | `ChatPanel` | プロバイダー/モデル選択（既存コンポーネント活用） |
| `StreamingMessage` | molecule | `ChatMessageList` | ストリーミング中のリアルタイム表示（既存コンポーネント活用） |
| `ChatPanel` | organism | view | 全体制御、8状態管理、IPC結線 |

### AccessCapability 4値定義

| 値 | 意味 | RuntimeBanner 表示 |
| --- | --- | --- |
| `integratedRuntime` | integrated mode で動作可能 | 「統合ランタイムで接続中」 |
| `terminalSurface` | ターミナル経由での実行が必要 | 「ターミナル経由で利用可能」 |
| `both` | 両方利用可能 | 「統合・ターミナル両対応」 |
| `none` | APIキー未設定等で利用不可 | 「設定が必要です」→ ErrorGuidance へ委譲 |

### useStreamingChat hook 契約

```typescript
interface StreamingChatState {
  isStreaming: boolean;
  content: string;
  error: StreamingError | null;
}

interface StreamingChatActions {
  startStream: (message: string) => Promise<void>;
  cancelStream: () => void;
}

// hook シグネチャ
function useStreamingChat(): {
  state: StreamingChatState;
  actions: StreamingChatActions;
};
```

- P31/P48 準拠: 個別セレクタ + useShallow で派生セレクタの無限ループを防止
- P42 準拠: ComposerInput の送信前バリデーションは `typeof` → `=== ""` → `.trim() === ""` の 3段バリデーション
- P62 準拠: DEFAULT_CONFIG への暗黙 fallback 禁止。Provider/Model 未設定時は `blocked` 状態へ遷移し `ErrorGuidance` を表示

### ChatPanel 8状態定義

| 状態 | 説明 | RuntimeBanner | ChatMessageList | ComposerArea | ErrorGuidance | HandoffBlock |
| --- | --- | --- | --- | --- | --- | --- |
| `idle` | 初期状態（LLM未選択） | - | - | disabled | - | - |
| `ready` | LLM選択済み・送信可能 | capability表示 | 履歴表示 | enabled | - | - |
| `streaming` | AI応答ストリーミング中 | capability表示 | +StreamingMessage | cancel可 | - | - |
| `cancelled` | ユーザーがストリームをキャンセル | capability表示 | 履歴+中断メッセージ | enabled | - | - |
| `completed` | AI応答完了 | capability表示 | 履歴+完了メッセージ | enabled | - | - |
| `error` | retryable エラー発生 | capability表示 | 履歴+エラー表示 | enabled | retryableのみ表示 | - |
| `blocked` | APIキー未設定/Provider未選択 | capability表示 | - | 非表示 | 表示 | - |
| `handoff` | ターミナル経由での実行が必要 | capability表示 | - | 非表示 | - | 表示 |

---

## 変更履歴

| Version | Date       | Changes                                                                                |
| ------- | ---------- | -------------------------------------------------------------------------------------- |
| 2.5.0   | 2026-03-18 | TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 を追加。ChatPanel 12コンポーネント階層、AccessCapability 4値、useStreamingChat hook 契約、8状態定義を同期 |
| 2.4.0   | 2026-03-14 | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 を追加。RuntimeResolution/HandoffGuidance 型定義、AnthropicLLMAdapter サービス、SendWithContextRequest/Response 変更点、chatEditSlice 型変更（selection/setSelection）を同期 |
| 2.3.0   | 2026-03-11 | TASK-UI-04B-WORKSPACE-CHAT を追加。WorkspaceChatPanel の stream / conversation 連携、task-scope メトリクス、完了タスク記録を同期 |
| 2.2.0   | 2026-02-02 | TASK-WCE-WORKSPACE-001完了: Workspace管理統合エントリ追加、品質メトリクス更新          |
| 2.1.0   | 2026-01-26 | アーキテクチャ概要をコードブロックから表形式・文章に変換（spec-guidelines準拠）        |
| 2.0.0   | 2026-01-26 | 4ファイルに分割（901行→インデックス+詳細ファイル）                                     |
| 1.2.0   | 2026-01-25 | Workspace Chat Edit サービスインターフェース追加                                       |
| 1.1.0   | 2026-01-24 | LLMストリーミングレスポンス仕様セクション追加                                          |
| 1.0.0   | 2026-01-24 | 初版作成                                                                               |

---

## 関連ドキュメント

- [アーキテクチャ設計](./05-architecture.md)
- [エラーハンドリング仕様](./07-error-handling.md)
- [セキュリティガイドライン](./17-security-guidelines.md)
- [RAGアーキテクチャ](./architecture-rag.md)

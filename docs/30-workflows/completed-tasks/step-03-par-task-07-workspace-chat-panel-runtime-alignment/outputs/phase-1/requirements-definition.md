# Phase 1: 要件定義書

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001 |
| Phase      | 1                                            |
| ステータス | completed                                    |
| 作成日     | 2026-03-18                                   |
| 機能名     | workspace-chat-panel-runtime-alignment       |

---

## T1-1: 機能インベントリ（6機能の既存実装状態）

### 1. ストリーミング（stream）

| 項目     | 状態                                                                                                               |
| -------- | ------------------------------------------------------------------------------------------------------------------ |
| 実装状態 | 実装済み（Task059a）                                                                                               |
| Main側   | `llm.ts`: `handleStreamChat` で AbortController + for-await ループ、`LLM_STREAM_CHUNK/END/ERROR` チャンネル送信    |
| Renderer | `useWorkspaceChatController.ts`: `onStreamChunk/End/Error` 購読、`streamContent` + `streamContentRef` で race 防止 |
| GAP      | authMode/accessCapability に基づくルーティングなし                                                                 |

### 2. キャンセル（cancel）

| 項目     | 状態                                                                          |
| -------- | ----------------------------------------------------------------------------- |
| 実装状態 | Controller 内に実装済み（Task059a）                                           |
| Main側   | `handleStreamCancel` で `AbortController.abort()` + `activeStreams.delete()`  |
| Renderer | `cancelStream` 関数あり、ただし WorkspaceChatPanel に cancel ボタン UI なし   |
| GAP      | cancel ボタンがパネルに存在しない（ストリーミング中に中断できない UI が不在） |

### 3. 選択ファイル（selected files / file context）

| 項目     | 状態                                                                                  |
| -------- | ------------------------------------------------------------------------------------- |
| 実装状態 | 実装済み（Task059a）                                                                  |
| Main側   | `file:read` チャンネルで読み取り                                                      |
| Renderer | `WorkspaceFileContextChips` で最大3件チップ表示、`attachFileAsContext` でファイル添付 |
| GAP      | ファイルサイズ超過時の guidance 表示が不十分                                          |

### 4. メンション（mention）

| 項目     | 状態                                                                              |
| -------- | --------------------------------------------------------------------------------- |
| 実装状態 | 実装済み（Task059a）                                                              |
| Renderer | `WorkspaceMentionDropdown` + `useWorkspaceMentionQuery` で `@` 入力候補表示・選択 |
| GAP      | なし（Task08 スコープ外）                                                         |

### 5. 会話永続化（conversation persistence）

| 項目     | 状態                                                                                                  |
| -------- | ----------------------------------------------------------------------------------------------------- |
| 実装状態 | 実装済み（Task059a）                                                                                  |
| Main側   | `ConversationRepository`（SQLite/better-sqlite3）で CRUD 全操作実装済み                               |
| Renderer | `ensureConversation` で `conversationAPI.create`、`persistAssistantMessage` で `addMessage`           |
| GAP      | `addMessage` 呼び出し時に `llmProvider` / `llmModel` フィールドが渡されていない（スキーマは対応済み） |

### 6. 選択設定（selected config: provider/model）

| 項目     | 状態                                                                                            |
| -------- | ----------------------------------------------------------------------------------------------- |
| 実装状態 | 部分実装（Task059a + Task06 パターン確立済み）                                                  |
| Main側   | `handleSetSelectedConfig` / `handleGetProviders` / `handleCheckHealth` は llm.ts に実装済み     |
| Renderer | `useAppStore` から `selectedProviderId` / `selectedModelId` を取得                              |
| GAP      | **P62違反**: L138 `selectedModelId ?? "gpt-4o"` の暗黙フォールバック。null 時はエラー表示すべき |

---

## T1-2: 権限マッピング（5つの concern の Main/Renderer/IPC 配置）

### 権限配置テーブル

| Concern             | 判定場所       | 通知方向        | IPC チャンネル                        | 根拠                                   |
| ------------------- | -------------- | --------------- | ------------------------------------- | -------------------------------------- |
| Access Capability   | Main Process   | Main → Renderer | 新規 `runtime:resolve` または既存利用 | RuntimeResolver.resolve() が Main 所有 |
| Provider/Model 選択 | Renderer Store | Renderer → Main | `llm:set-selected-config`             | Task06 確立済み                        |
| File Context        | Main + Render  | 双方向          | `file:read`                           | Renderer で添付、Main で読み取り       |
| Conversation 永続化 | Main Process   | Renderer → Main | `conversation:create` / `addMessage`  | Repository は Main 所有                |
| Stream Lifecycle    | Main Process   | Main → Renderer | `llm:stream-chat` / `cancel-stream`   | AbortController は Main 所有           |

### RuntimeResolver API（Task01/06 確立済み）

```typescript
// apps/desktop/src/main/services/runtime/RuntimeResolver.ts
class RuntimeResolver {
  async resolve(): Promise<RuntimeResolution>;
  // { type: "integrated" } | { type: "handoff"; reason: string }
  // ルール:
  //   subscription × any  → handoff（"subscription mode"）
  //   api-key × hasKey    → integrated
  //   api-key × !hasKey   → handoff（"API key not configured"）
}
```

### Renderer が local 判定を禁止する項目

| 項目                       | 禁止理由                                       |
| -------------------------- | ---------------------------------------------- |
| authMode の直接参照        | Main の RuntimeResolver が唯一の判定源         |
| API key 有無の直接チェック | Renderer に key 情報を渡さない（セキュリティ） |
| provider 互換性チェック    | Main の LLMAdapterFactory が判定する           |

---

## T1-3: GAP 分析

### GAP-01: P62 違反（DEFAULT_CONFIG fallback）

| 項目     | 内容                                                                  |
| -------- | --------------------------------------------------------------------- |
| 場所     | `useWorkspaceChatController.ts` L138                                  |
| 現状     | `modelId: params.selectedModelId ?? "gpt-4o"` で暗黙フォールバック    |
| あるべき | `selectedModelId === null` 時は送信不可、GuidanceBlock で設定画面誘導 |
| 優先度   | Critical（P62 準拠必須）                                              |

### GAP-02: errorMessage 未表示

| 項目     | 内容                                                         |
| -------- | ------------------------------------------------------------ |
| 場所     | `WorkspaceChatPanel.tsx`                                     |
| 現状     | `controller.errorMessage` を保持するが UI に描画していない   |
| あるべき | エラー種別に応じて fail-fast / guidance / silent の3段階表示 |
| 優先度   | High                                                         |

### GAP-03: cancel ボタン不在

| 項目     | 内容                                                             |
| -------- | ---------------------------------------------------------------- |
| 場所     | `WorkspaceChatPanel.tsx` / `WorkspaceChatInput.tsx`              |
| 現状     | `cancelStream` 関数は controller にあるが、UI ボタンが存在しない |
| あるべき | ストリーミング中は送信ボタンが cancel ボタンに変化               |
| 優先度   | High                                                             |

### GAP-04: authMode/accessCapability 非連携

| 項目     | 内容                                                                   |
| -------- | ---------------------------------------------------------------------- |
| 場所     | `useWorkspaceChatController.ts` 全体                                   |
| 現状     | authMode を一切参照していない                                          |
| あるべき | RuntimeResolver の結果（integrated/handoff）に応じて UI 状態を切り替え |
| 優先度   | Critical（Task08 の主スコープ）                                        |

### GAP-05: llmProvider/llmModel 未保存

| 項目     | 内容                                                                |
| -------- | ------------------------------------------------------------------- |
| 場所     | `useWorkspaceChatController.ts` L365-371                            |
| 現状     | `addMessage` 呼び出し時に `llmProvider` / `llmModel` を渡していない |
| あるべき | assistant メッセージ保存時に使用 provider/model を記録              |
| 優先度   | Medium                                                              |

### GAP-06: 新規コンポーネント3件未実装

| コンポーネント           | 状態   | 用途                                            |
| ------------------------ | ------ | ----------------------------------------------- |
| GuidanceBlock            | 未実装 | 実行不能時の説明（failure reason + 再設定手順） |
| TranscriptProvenanceChip | 未実装 | メッセージ出典の表示（3つの共有方法）           |
| CompactLayout            | 未実装 | 360px 以下のレスポンシブレイアウト              |

### GAP-07: buildMessages 乖離

| 項目     | 内容                                                                  |
| -------- | --------------------------------------------------------------------- |
| 場所     | `buildMessages.ts` vs `useWorkspaceChatController.ts`                 |
| 現状     | Controller が独自の `buildChatRequest` を定義、`buildMessages` と並立 |
| あるべき | 責務を統一し、一方を正本とする（Phase 8 リファクタリング対象）        |
| 優先度   | Low（Phase 8 で対処）                                                 |

---

## T1-4: 非機能要件

### ストリーミングレイテンシ

| 項目             | 基準値                                  |
| ---------------- | --------------------------------------- |
| 初回チャンク表示 | リクエスト送信から 2 秒以内             |
| チャンク間遅延   | 知覚可能な途切れなし（16ms 以内の描画） |
| キャンセル応答   | ボタン押下から 500ms 以内に UI 反映     |

### ファイルコンテキスト制約

| 制約               | 値                                        |
| ------------------ | ----------------------------------------- |
| 単一ファイルサイズ | 10MB 以下（FileService 制約）             |
| コンテキスト合計   | 100KB 以下（ContextBuilder 制約）         |
| ファイル数上限     | 10 ファイル（ContextBuilder）             |
| UI チップ表示      | 最大 3 件                                 |
| パス制約           | `isAllowedPath()` で workspacePath 境界内 |

### 会話永続化タイミング

| イベント               | 永続化タイミング                               |
| ---------------------- | ---------------------------------------------- |
| ユーザーメッセージ送信 | 送信直後に `conversation:addMessage`           |
| アシスタント応答完了   | stream end 時に `conversation:addMessage`      |
| 会話初回作成           | 最初のメッセージ送信前に `conversation:create` |

### セキュリティ要件

| 要件                   | 適用箇所                               |
| ---------------------- | -------------------------------------- |
| validateIpcSender      | 全 IPC ハンドラの先頭                  |
| P42 3段バリデーション  | 全文字列引数（modelId, providerId 等） |
| Renderer local判定禁止 | authMode, API key 有無                 |
| token/key 非送信       | Renderer に key 情報を渡さない         |

### アクセシビリティ要件

| 要件           | 仕様                                    |
| -------------- | --------------------------------------- |
| メッセージログ | `role="log"` + `aria-live="polite"`     |
| エラー通知     | `role="alert"`                          |
| キーボード操作 | Tab/Enter/Escape で全機能アクセス可能   |
| コントラスト比 | WCAG 2.1 AA: 4.5:1 以上（通常テキスト） |

---

## 参照した文書一覧

| 文書名                                      | 用途                         |
| ------------------------------------------- | ---------------------------- |
| interfaces-llm.md                           | LLM IPC インターフェース定義 |
| llm-streaming.md                            | ストリーミング仕様           |
| llm-ipc-types.md                            | IPC 型定義                   |
| ui-ux-feature-components-details.md         | UI/UX コンポーネント要件     |
| arch-state-management-core.md               | 状態管理アーキテクチャ       |
| security-electron-ipc-core.md               | IPC セキュリティ制約         |
| error-handling-core.md                      | エラーハンドリング方針       |
| workflow-ai-runtime-authmode-unification.md | ワークフロー統合仕様         |
| ui-ux-realization.md                        | UI/UX 実現マトリクス         |
| RuntimeResolver.ts                          | Runtime 判定実装             |
| Task06 contract-matrix.md                   | IPC 契約正本                 |

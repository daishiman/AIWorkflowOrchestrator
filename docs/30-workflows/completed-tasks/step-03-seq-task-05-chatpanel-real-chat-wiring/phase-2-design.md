# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| Phase      | 2                                   |
| Phase名    | 設計                                |
| タスクID   | TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 |
| 前提Phase  | Phase 1（要件定義）                 |
| 後続Phase  | Phase 3（設計レビュー）             |
| ステータス | not_started                         |
| 作成日     | 2026-03-13                          |
| 更新日     | 2026-03-17                          |
| 機能名     | chatpanel-real-chat-wiring          |

## 目的

ChatPanel を real chat 契約へ接続するための設計を確定する。状態機械、コンポーネント階層、Main/Renderer 責務境界、IPC 契約マトリクス、UX 全状態表示、transcript 受け取り、アクセシビリティ、セキュリティの 8 領域を網羅的に設計する。

## 実行タスク

- Task 2-1 state 設計: ChatPanel の状態機械を設計する（8 状態 + 遷移定義 + Store 設計）
- Task 2-2 コンポーネント階層設計: ChatPanel の子コンポーネント階層と props 契約を設計する
- Task 2-3 runtime 境界設計: Main Process と Renderer Process の責務境界を設計する
- Task 2-4 IPC 契約マトリクス: ChatPanel が使用する全 IPC チャンネルの契約一覧を設計する
- Task 2-5 UX 設計: 全状態（empty / streaming / error / blocked / handoff）の UI 表示を設計する
- Task 2-6 transcript 受け取り設計: terminal transcript の手動共有契約を設計する
- Task 2-7 アクセシビリティ設計: WCAG 2.1 AA 準拠のアクセシビリティ要件を設計する
- Task 2-8 セキュリティ設計: Electron 3 プロセスモデル準拠のセキュリティ要件を設計する

## 設計方針

- runtime 解決は main、表示状態は renderer の責務とする
- ChatPanel と Chat Edit は context を共有しても command surface は分ける
- placeholder を local mock で延命せず real contract へ置き換える
- silent fallback 禁止: capability 不足時は guidance block を表示し、見かけ成功にしない
- Store 統一: useStreamingChat は useStore() を使用、ChatPanel は useAppStore() を使用しているため、統一方針を決定する

## Agent Team / SubAgent 分担

| 役割                    | 主担当                                                             |
| ----------------------- | ------------------------------------------------------------------ |
| Chat Surface Agent      | Task 2-1（state 設計）、Task 2-2（コンポーネント階層）を整理する   |
| Main Chat Runtime Agent | Task 2-3（runtime 境界）、Task 2-4（IPC 契約マトリクス）を整理する |
| UX Agent                | Task 2-5（UX 設計）、Task 2-6（transcript）を整理する              |
| Security Agent          | Task 2-7（アクセシビリティ）、Task 2-8（セキュリティ）を整理する   |

## 参照資料

| 参照資料            | パス                                                                       | 内容                                                  |
| ------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------- |
| Phase 1（要件定義） | `phase-1-requirements.md`                                                  | 依存する前提成果物を確認する                          |
| code research       | `outputs/code-research-report.md`                                          | コード調査レポート（GAP 分析含む）                    |
| spec research       | `outputs/spec-research-report.md`                                          | システム仕様調査レポート（型・IPC・UI 状態定義）      |
| pack parent index   | `docs/30-workflows/ai-runtime-authmode-unification/index.md`               | 実行順序、依存グラフ、共通方針の正本を確認する        |
| pack design audit   | `docs/30-workflows/ai-runtime-authmode-unification/design-audit-matrix.md` | 多角的監査の結論、禁止事項、依存整合を確認する        |
| pack UI/UX 図解     | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-diagrams.md`      | 5 図セットの画面構成、状態遷移、CTA 導線を確認する    |
| ChatPanel           | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`                  | placeholder UI の現状を確認する（161 行）             |
| useStreamingChat    | `apps/desktop/src/renderer/hooks/useStreamingChat.ts`                      | streaming hook の契約を確認する（179 行）             |
| StreamingMessage    | `apps/desktop/src/renderer/components/chat/StreamingMessage.tsx`           | streaming 表示コンポーネントの契約を確認する（83 行） |
| ai handlers         | `apps/desktop/src/main/ipc/aiHandlers.ts`                                  | AI_CHAT ハンドラの契約を確認する（234 行）            |
| llm handlers        | `apps/desktop/src/main/handlers/llm.ts`                                    | LLM streaming ハンドラの契約を確認する（442 行）      |
| ChatPanel tests     | `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.test.tsx`   | 既存 UI 契約を確認する（313 行、12 テスト）           |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                                        | パス                                                                                                   | 内容                                                                |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| interfaces-llm                                  | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`                                  | LLM と chat contract の正本                                         |
| api-ipc-system                                  | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                                  | AI_CHAT と selected config の IPC 正本                              |
| ui-ux-feature-components                        | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                        | Workspace Chat Panel と ChatPanel 関連 UI 正本                      |
| ui-ux-settings                                  | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                                  | access capability と settings 表示契約                              |
| ui-ux-panels                                    | `.claude/skills/aiworkflow-requirements/references/ui-ux-panels.md`                                    | ChatPanel 統合パターンの正本                                        |
| workflow-apikey-chat-tool-integration-alignment | `.claude/skills/aiworkflow-requirements/references/workflow-apikey-chat-tool-integration-alignment.md` | selected config と auth key の既存ルール                            |
| pack UI/UX 正本                                 | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md`                               | ChatPanel の empty / streaming / handoff 状態を確認する             |
| llm-ipc-types                                   | `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`                                   | LLM IPC 型定義（AIChatRequest/Response、LLMErrorCode）              |
| llm-streaming                                   | `.claude/skills/aiworkflow-requirements/references/llm-streaming.md`                                   | ストリーミング型定義（StreamChunk、StreamingState）                 |
| llm-workspace-chat-edit                         | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`                         | RuntimeResolution、HandoffGuidance 型定義                           |
| arch-state-management                           | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md`                      | Zustand Store設計・Slice構成・P31/P48対策の正本                     |
| workflow-ai-runtime-authmode                    | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md`        | access capability 4値定義・runtime境界の参照元                      |
| security-electron-ipc                           | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                           | IPCセキュリティ（ホワイトリスト・送信元検証・引数サニタイズ）の正本 |
| ui-ux-settings-core                             | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings-core.md`                             | blocked状態時のSettings CTA導線・access card仕様                    |

## 実行手順

### ステップ 1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、ChatPanel の実 AI チャット配線の対象範囲を固定する。特に以下を重点確認する:

- code-research-report.md の GAP 分析サマリ（現状 vs 目標）
- spec-research-report.md の型定義・IPC 契約・UI 状態定義
- useStreamingChat が useStore() を使用している点と ChatPanel が useAppStore() を使用している点の Store 統一方針

### ステップ 2: 実行タスクを上から順に実施する

8 つの実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

#### Task 2-1: state 設計

ChatPanel の状態機械を設計する。

**状態定義**（8 状態）:

| 状態        | 条件                              | 表示内容                                   |
| ----------- | --------------------------------- | ------------------------------------------ |
| `idle`      | 初期状態、会話なし                | empty state（capability 判定結果に応じて） |
| `ready`     | capability ok、入力待ち           | composer 有効、送信ボタン有効              |
| `streaming` | チャンク受信中                    | StreamingMessage + パルスカーソル + cancel |
| `cancelled` | ユーザーキャンセル                | 蓄積コンテンツ表示、composer 有効に復帰    |
| `completed` | ストリーム正常完了                | 完了メッセージ表示、会話永続化             |
| `error`     | ストリームエラー / API エラー     | ErrorGuidance（retryable / non-retryable） |
| `blocked`   | capability 不足（API key 未設定） | capability banner + 設定誘導 CTA           |
| `handoff`   | terminal handoff 選択             | HandoffBlock + PersistentTerminalLauncher  |

**状態遷移図**:

```
[*] --> idle
idle --> ready: capability ok (API key configured)
idle --> blocked: no capability (API key missing)
ready --> streaming: user sends message
streaming --> streaming: chunk received (accumulate)
streaming --> completed: done signal (persist message)
streaming --> error: error signal (preserve accumulated)
streaming --> cancelled: user cancels (preserve accumulated)
completed --> ready: reset for next message
cancelled --> ready: reset for next message
error --> ready: user dismisses / retry
blocked --> ready: API key configured (settings change)
ready --> handoff: terminal-handoff button clicked
handoff --> ready: return from terminal
```

**キャンセルトリガー**:

| トリガー           | アクション                     |
| ------------------ | ------------------------------ |
| Cancel ボタン      | `onCancel()` -> `abort()`      |
| Escape キー        | key event -> `abort()`         |
| コンポーネント解除 | useEffect cleanup -> `abort()` |
| 新規メッセージ送信 | 前のストリームを自動キャンセル |

**Store 設計**:

既存の `chatSlice` を拡張する方針とする。新規 `chatPanelSlice` は作成しない（P31/P48 対策として個別セレクタパターンを適用）。

**個別セレクタ定義**（P31/P48 対策）:

| セレクタ名                 | 戻り値型                                 | 用途                       |
| -------------------------- | ---------------------------------------- | -------------------------- |
| `useChatPanelStatus`       | `ChatPanelStatus`                        | ChatPanel の現在の状態     |
| `useChatMessages`          | `ChatMessage[]`（useShallow 適用 — P48） | メッセージ一覧             |
| `useCurrentConversationId` | `string \| null`                         | 現在の会話 ID              |
| `useSetChatPanelStatus`    | `(status: ChatPanelStatus) => void`      | 状態更新アクション         |
| `useAddChatMessage`        | `(message: ChatMessage) => void`         | メッセージ追加アクション   |
| `useResetChat`             | `() => void`                             | チャットリセットアクション |

**型定義**:

```typescript
type ChatPanelStatus =
  | "idle"
  | "ready"
  | "streaming"
  | "cancelled"
  | "completed"
  | "error"
  | "blocked"
  | "handoff";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  conversationId: string;
}
```

| State フィールド        | 型                                                                                                    | 配置先    |
| ----------------------- | ----------------------------------------------------------------------------------------------------- | --------- |
| `chatPanelStatus`       | `"idle" \| "ready" \| "streaming" \| "cancelled" \| "completed" \| "error" \| "blocked" \| "handoff"` | chatSlice |
| `chatMessages`          | `ChatMessage[]`                                                                                       | chatSlice |
| `currentConversationId` | `string \| null`                                                                                      | chatSlice |
| `streamingContent`      | `string`                                                                                              | 既存維持  |
| `isStreaming`           | `boolean`                                                                                             | 既存維持  |
| `streamingError`        | `{ code: string; message: string; retryable: boolean } \| null`                                       | 既存維持  |

**Store 統一方針**: useStreamingChat 内の `useStore()` を `useAppStore()` に統一する。P31 対策として全アクセスは個別セレクタ経由とする。

#### Task 2-2: コンポーネント階層設計

ChatPanel の子コンポーネント階層を設計する。

```
ChatPanel (organism)
  +-- RuntimeBanner (molecule)          # capability 表示 + terminal ボタン
  +-- ChatMessageList (molecule)        # メッセージ一覧 (role="log", aria-live="polite")
  |     +-- ChatMessage (atom)          # 個別メッセージ (user / assistant)
  |     +-- StreamingMessage (atom)     # ストリーミング中メッセージ（既存 83 行を接続）
  |     +-- ErrorGuidance (molecule)    # エラー表示 (capability / network / API key)
  +-- HandoffBlock (molecule)           # terminal handoff ブロック
  |     +-- PersistentTerminalLauncher  # terminal 常設起動ボタン
  |     +-- TranscriptProvenanceLabel   # transcript 出所ラベル
  +-- ComposerArea (molecule)           # 入力エリア
  |     +-- ComposerInput (atom)        # テキスト入力
  |     +-- SendButton (atom)           # 送信ボタン
  |     +-- ComposerAttachmentChip (atom) # 添付ファイルチップ
  +-- [TerminalDock は Task02 の所有コンポーネント。ChatPanel は HandoffBlock 経由で起動を委譲する]
  +-- SkillStreamingView (既存維持)     # スキル実行中表示（条件: isExecuting && selectedSkillName）
  +-- SkillManagementPanel (既存維持)   # スキル管理パネル
```

**コンポーネント数**: 12（既存 2 + 新規 10）

**主要 Props 設計**:

| コンポーネント             | 主要 Props                                                                     |
| -------------------------- | ------------------------------------------------------------------------------ |
| RuntimeBanner              | `capability: "integrated" \| "handoff" \| "both" \| "none"`, `onTerminalClick` |
| ChatMessageList            | `messages: ChatMessage[]`, `isStreaming: boolean`                              |
| StreamingMessage           | `content: string`, `isStreaming: boolean`, `onCancel?: () => void` (既存)      |
| ErrorGuidance              | `error: LLMError`, `onRetry?: () => void`, `onSettings?: () => void`           |
| HandoffBlock               | `guidance: HandoffGuidance`, `onLaunch: () => void`                            |
| PersistentTerminalLauncher | `onLaunch: () => void`                                                         |
| ComposerInput              | `value: string`, `onChange`, `onSubmit`, `disabled: boolean`                   |
| SendButton                 | `onClick`, `disabled: boolean`, `isStreaming: boolean`                         |
| ComposerAttachmentChip     | `fileName: string`, `onRemove: () => void`                                     |
| TranscriptProvenanceLabel  | `source: "terminal" \| "file"`, `timestamp: Date`                              |

#### Task 2-3: runtime 境界設計

Main Process と Renderer Process の責務境界を設計する。

**Main Process 責務**:

| 責務               | 実装箇所                  | 説明                                                  |
| ------------------ | ------------------------- | ----------------------------------------------------- |
| Runtime 解決       | RuntimeResolver.resolve() | authMode + API key から integrated/handoff を判定する |
| Provider 解決      | getSelectedLLMConfig()    | Renderer で選択された provider/model を Main 側で保持 |
| API key 確認       | SecureStorage.getApiKey() | API key の有無を確認する（Renderer には返さない）     |
| ストリーミング実行 | handleStreamChat()        | LLMAdapterFactory 経由でストリーミングを実行する      |
| 会話永続化         | conversation:addMessage   | メッセージを SQLite に保存する                        |
| ヘルスチェック     | handleCheckHealth()       | Provider 接続状態を確認する                           |

**Renderer Process 責務**:

| 責務                 | 実装箇所                | 説明                                                |
| -------------------- | ----------------------- | --------------------------------------------------- |
| UI 状態管理          | chatSlice (useAppStore) | chatPanelStatus、messages、streaming 状態を管理する |
| ユーザー操作         | ComposerArea            | 入力、送信、キャンセル、添付を処理する              |
| 表示切替             | ChatPanel               | 状態に応じたコンポーネントの条件レンダリング        |
| Store → IPC 同期     | useStreamingChat        | Store 状態と IPC イベントを同期する                 |
| Selected config 同期 | llm:set-selected-config | Renderer の選択を Main に同期する                   |

**Capability 解決フロー**:

```
1. ChatPanel マウント時
   -> Renderer: window.electronAPI.llm.checkHealth({ providerId }) を呼び出し
   -> Main: SecureStorage.getApiKey(providerId) で API key 存在確認
   -> Main: { exists: boolean } を返却

2. Capability 判定ロジック（Renderer 側）
   -> selectedProviderId が設定済み && API key exists → "integratedRuntime"
   -> terminal 利用可能（Task02 Phase 2 から契約取得） → "terminalSurface"
   -> 両方利用可能 → "both"
   -> いずれも不可 → "none"

3. 判定結果の反映
   -> chatSlice.chatPanelStatus を "ready" | "blocked" に設定
   -> RuntimeBanner に capability 値を渡す
```

**注意**: Capability 判定は ChatPanel マウント時と Settings 変更検知時の 2 タイミングで実行する。Settings 変更は `llm:set-selected-config` の成功コールバックで再判定する。

**境界原則**:

1. Renderer から Node.js API を直接使用しない（contextBridge 経由のみ）
2. API key は Main Process に留め、Renderer には `exists: boolean` のみ返す
3. Runtime 判定結果（integrated / handoff）は Main が判定し、Renderer は表示のみ担当する
4. Provider/Model 未選択時は Main がエラーを返す（Renderer で silent fallback しない — GAP-03/P62 準拠）

#### Task 2-4: IPC 契約マトリクス

ChatPanel が使用する全 IPC チャンネルの契約一覧を設計する。

**主要チャンネル（6 + 補助 4 = 10 チャンネル）**:

| #   | チャンネル                | 方向             | リクエスト型                  | レスポンス型          | 用途                 |
| --- | ------------------------- | ---------------- | ----------------------------- | --------------------- | -------------------- |
| 1   | `llm:stream-chat`         | Renderer -> Main | LLMChatRequest                | requestId (string)    | ストリーミング開始   |
| 2   | `llm:stream-chunk`        | Main -> Renderer | -                             | StreamChunk           | チャンク受信         |
| 3   | `llm:stream-done`         | Main -> Renderer | -                             | `{ requestId }`       | ストリーム完了       |
| 4   | `llm:stream-error`        | Main -> Renderer | -                             | LLMError              | ストリームエラー     |
| 5   | `llm:cancel-stream`       | Renderer -> Main | `{ requestId }`               | void                  | ストリームキャンセル |
| 6   | `llm:set-selected-config` | Renderer -> Main | `{ providerId, modelId }`     | `{ success, error? }` | 設定同期             |
| 7   | `llm:check-health`        | Renderer -> Main | `{ providerId }`              | HealthCheckResult     | ヘルスチェック       |
| 8   | `conversation:create`     | Renderer -> Main | `{ userId, title }`           | Conversation          | 会話作成             |
| 9   | `conversation:addMessage` | Renderer -> Main | `{ conversationId, message }` | Message               | メッセージ永続化     |
| 10  | `auth-key:exists`         | Renderer -> Main | none                          | `{ exists, source? }` | API key 存在確認     |

**命名マッピング注記**: 正本仕様（api-ipc-system.md）では `conversation:addMessage` の引数名は `sessionId` だが、本設計では chatSlice の `currentConversationId` と命名を統一するため `conversationId` を使用する。実装時に IPC ハンドラ側の引数名も `conversationId` に統一すること（P45 命名ドリフト防止）。

**IPC レスポンス形式**: wrapper 形式 `{ success: boolean, data?: T, error?: { code: string, message: string } }` を標準とする（P60 準拠）。

**バリデーション**: 全文字列引数は P42 準拠 3 段バリデーション（型チェック -> 空文字列 -> .trim() 空文字列）を適用する。

**型レイヤーの区別**:

| 型名                  | 定義元                 | 用途                                     | 備考                                    |
| --------------------- | ---------------------- | ---------------------------------------- | --------------------------------------- |
| `AIChatRequest`       | aiHandlers.ts          | `AI_CHAT` チャンネル（非ストリーミング） | message, conversationId, systemPrompt   |
| `LLMChatRequest`      | handlers/llm.ts        | `llm:stream-chat`（ストリーミング）      | providerId, modelId, messages[], stream |
| `LLMChatRequestInput` | llm-streaming.md (Zod) | Renderer 側の入力型                      | LLMChatRequest の Zod バリデーション版  |

ChatPanel は**ストリーミング経路（`llm:stream-chat`）を主経路**とする。`AI_CHAT` は非ストリーミング用途であり ChatPanel では使用しない。Renderer 側では `LLMChatRequestInput` を使用し、Zod バリデーション（`LLMChatRequestSchema.parse()`）を経由してから IPC に送信する。

#### Task 2-5: UX 設計

全状態の UI 表示を設計する。

**画面構成図**:

```
+------------------------------------------------------------------+
| Runtime Banner                                      [Terminal]   |
+------------------------------------------------------------------+
| Message List                                                     |
| - empty state / streaming message / error guidance               |
+------------------------------------------------------------------+
| Composer: input | send | terminal handoff                        |
+------------------------------------------------------------------+
| Terminal Dock (bottom sheet / side dock)                         |
+------------------------------------------------------------------+
```

**状態別 UI 表示**:

| 状態        | RuntimeBanner               | MessageList                        | ComposerArea                 |
| ----------- | --------------------------- | ---------------------------------- | ---------------------------- |
| `idle`      | capability 表示             | empty state（下記参照）            | disabled                     |
| `ready`     | capability 表示             | メッセージ履歴 or empty state      | 有効（入力 + 送信ボタン）    |
| `streaming` | capability 表示             | StreamingMessage（パルスカーソル） | cancel ボタン表示            |
| `cancelled` | capability 表示             | 蓄積コンテンツ表示（途中まで）     | 有効に復帰                   |
| `completed` | capability 表示             | 完了メッセージ追加                 | 有効に復帰                   |
| `error`     | capability 表示             | ErrorGuidance（下記参照）          | 有効（retry 可能な場合）     |
| `blocked`   | capability banner（警告色） | 設定誘導ガイダンス                 | disabled + 「設定を開く」CTA |
| `handoff`   | capability 表示             | HandoffBlock                       | terminal launcher 表示       |

**empty state**: 「まず質問を書く」ではなく「この画面で自動実行できるか」を先に示す。capability 判定結果に応じて以下を表示:

| capability          | empty state 表示                                       |
| ------------------- | ------------------------------------------------------ |
| `integratedRuntime` | 「AI チャットが利用可能です。質問を入力してください」  |
| `terminalSurface`   | 「Terminal 経由で AI を利用できます」+ Terminal ボタン |
| `both`              | 「AI チャットと Terminal の両方が利用可能です」        |
| `none`              | 「AI 機能を利用するには設定が必要です」+ 設定誘導 CTA  |

**ErrorGuidance 分岐**:

| エラーコード              | retryable | ガイダンス                                     |
| ------------------------- | --------- | ---------------------------------------------- |
| `API_KEY_MISSING`         | No        | 「API key が設定されていません」+ 設定画面誘導 |
| `API_KEY_INVALID`         | No        | 「API key が無効です」+ 設定画面誘導           |
| `NETWORK_ERROR`           | Yes       | 「ネットワークエラー」+ retry ボタン           |
| `TIMEOUT`                 | Yes       | 「タイムアウト」+ retry ボタン                 |
| `RATE_LIMIT`              | Yes       | 「レート制限」+ 待機時間表示 + 自動 retry      |
| `SERVICE_UNAVAILABLE`     | Yes       | 「サービス停止中」+ retry ボタン               |
| `CONTENT_FILTER`          | No        | 「コンテンツフィルタ」+ メッセージ修正誘導     |
| `CONTEXT_LENGTH_EXCEEDED` | No        | 「コンテキスト長超過」+ 会話リセット誘導       |
| `MODEL_NOT_FOUND`         | No        | 「モデル未検出」+ モデル選択誘導               |
| `UNKNOWN`                 | No        | 「予期しないエラー」+ retry ボタン             |

**Primary / Secondary CTA**:

| CTA           | ラベル                | 条件                   |
| ------------- | --------------------- | ---------------------- |
| Primary CTA   | 「送信する」          | ready 状態かつ入力あり |
| Secondary CTA | 「Terminal で続ける」 | handoff 可能時         |
| Secondary CTA | 「設定を開く」        | blocked 状態時         |

#### Task 2-6: transcript 受け取り設計

terminal transcript の手動共有契約を設計する。

**共有フロー**:

1. ユーザーが Terminal Dock 内で「直近出力を添付」または「選択範囲を送る」を選択
2. transcript 内容が ComposerAttachmentChip として composer に添付される
3. TranscriptProvenanceLabel で出所（terminal / 手動ファイル添付）とタイムスタンプを表示
4. 送信時に transcript 内容がメッセージの先頭に `[Terminal Transcript]\n` プレフィックス付きで結合される

**制約**:

- auto send 禁止: Terminal が自動で ChatPanel にメッセージを送信しない
- hidden prompt injection 禁止: transcript に隠しプロンプトを付与しない
- silent fallback 禁止: transcript 添付失敗時はエラーを明示する

**ComposerAttachmentChip 契約**:

| Props        | 型       | 説明                          |
| ------------ | -------- | ----------------------------- |
| `fileName`   | string   | 表示名（「Terminal 出力」等） |
| `content`    | string   | transcript 内容               |
| `onRemove`   | function | 削除コールバック              |
| `provenance` | object   | 出所情報                      |

**TranscriptProvenanceLabel 契約**:

| Props       | 型                     | 説明     |
| ----------- | ---------------------- | -------- |
| `source`    | `"terminal" \| "file"` | 出所種別 |
| `timestamp` | Date                   | 添付日時 |

#### Task 2-7: アクセシビリティ設計

WCAG 2.1 AA 準拠のアクセシビリティ要件を設計する。

| 要素                      | 属性                                 | 目的                                   |
| ------------------------- | ------------------------------------ | -------------------------------------- |
| ChatMessageList           | `role="log"`, `aria-live="polite"`   | メッセージ追加のスクリーンリーダー通知 |
| StreamingMessage          | `aria-busy={isStreaming}`            | ストリーミング中の状態通知             |
| StreamingMessage カーソル | `aria-label="入力中"`                | カーソルの意味                         |
| StreamingMessage cancel   | `aria-label="応答をキャンセル"`      | キャンセルボタンの説明                 |
| ErrorGuidance             | `role="alert"`                       | エラーの即時通知                       |
| RuntimeBanner             | `role="status"`                      | capability 状態の通知                  |
| ComposerInput             | `aria-label="メッセージを入力"`      | 入力欄の説明                           |
| SendButton                | `aria-label="送信"`, `aria-disabled` | 送信ボタンの説明と状態                 |

**読み上げ順序**: RuntimeBanner（capability 状態）-> ErrorGuidance（エラー）-> ChatMessageList（メッセージ）-> ComposerArea（入力）。capability banner と error guidance は message list より先に読める DOM 順序にする。

**キーボード操作**:

| 操作        | 動作                     |
| ----------- | ------------------------ |
| Enter       | メッセージ送信           |
| Shift+Enter | 改行                     |
| Escape      | ストリーミングキャンセル |
| Tab         | フォーカス移動           |

#### Task 2-8: セキュリティ設計

Electron 3 プロセスモデル準拠のセキュリティ要件を設計する。

**Renderer 3 段階防御パターン**:

| 段階                | 防御内容                              | コード例                                               |
| ------------------- | ------------------------------------- | ------------------------------------------------------ |
| 1. API 存在確認     | `window.electronAPI?.llm`             | `const api = window.electronAPI?.llm;`                 |
| 2. メソッド存在確認 | `api?.streamChat` + warn + fallback   | `if (!api?.streamChat) { console.warn(...); return; }` |
| 3. レスポンス形状   | `Array.isArray()` / optional chaining | `const data = result?.data ?? fallback;`               |

**API key 保護**:

| 観点            | 措置                                                               |
| --------------- | ------------------------------------------------------------------ |
| 暗号化          | `safeStorage.encryptString()` で保存                               |
| Renderer 隔離   | `apiKey:get` / `auth-key:getKey` は Main-only（Renderer に非公開） |
| IPC 検証        | `withValidation()` wrapper で sender 検証                          |
| handoff command | API key を含めない                                                 |
| ログ出力        | key 値をログに含めない                                             |

**IPC セキュリティ**:

- チャンネル名はホワイトリスト管理、定数で参照（ハードコード禁止 — P27 準拠）
- 全ハンドラで送信元ウィンドウを検証
- P42 準拠 3 段バリデーション: `typeof === "string"` -> `=== ""` -> `.trim() === ""`
- エラーはサニタイズしてから Renderer に送る（内部情報を漏洩しない）

### ステップ 3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、以下の整合を確認する:

| 確認項目                       | 照合先                                 |
| ------------------------------ | -------------------------------------- |
| AIChatRequest/Response 型      | llm-ipc-types.md                       |
| StreamChunk/StreamingState 型  | llm-streaming.md                       |
| RuntimeResolution 型           | llm-workspace-chat-edit.md             |
| LLMErrorCode 10 値             | llm-ipc-types.md                       |
| ChatPanel 統合パターン         | ui-ux-panels.md                        |
| Workspace Chat Panel UI States | ui-ux-feature-components.md            |
| IPC チャンネル定義             | api-ipc-system.md                      |
| API key 保護規則               | security-electron-ipc.md               |
| Selected config 同期フロー     | api-ipc-system.md                      |
| Provider/Model 未選択時の動作  | GAP-03（DEFAULT_CONFIG fallback 禁止） |

### ステップ 4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

AI_CHAT、selected config、access capability、workspace context、streaming UX の契約、state、IPC、security 境界を設計へ反映する。

| テスト観点           | 設計への反映内容                                        |
| -------------------- | ------------------------------------------------------- |
| ストリーミング E2E   | IPC 契約マトリクス（#1-#5）で全チャンネルを網羅         |
| Selected config 同期 | IPC 契約マトリクス（#6）で双方向同期を定義              |
| Capability 判定      | state 設計で blocked 状態の遷移条件を明確化             |
| エラーハンドリング   | UX 設計で全 LLMErrorCode のガイダンス分岐を定義         |
| 会話永続化           | IPC 契約マトリクス（#8-#9）で永続化チャンネルを定義     |
| Terminal handoff     | transcript 受け取り設計で制約（auto send 禁止等）を定義 |

## 多角的チェック観点

| 観点               | 適用 | 確認内容                                                  |
| ------------------ | ---- | --------------------------------------------------------- |
| セキュリティ       | Yes  | API key 漏洩防止、IPC sender 検証、P42 バリデーション     |
| UI/UX              | Yes  | 全状態の UI 表示、empty state、ErrorGuidance、CTA 設計    |
| アーキテクチャ     | Yes  | Main/Renderer 責務境界、Store 統一、コンポーネント階層    |
| API 設計           | Yes  | IPC 契約マトリクス、レスポンス wrapper 形式               |
| エラーハンドリング | Yes  | LLMErrorCode 全 10 値のガイダンス分岐                     |
| アクセシビリティ   | Yes  | WCAG 2.1 AA、role/aria 属性、キーボード操作、読み上げ順序 |

**Electron デスクトップアプリ観点**:

| 層                         | 適用 | 確認内容                                           |
| -------------------------- | ---- | -------------------------------------------------- |
| フロントエンド（Renderer） | Yes  | コンポーネント階層、State 設計、P31/P48 対策       |
| バックエンド（Main）       | Yes  | Runtime 解決、Provider 解決、ストリーミング実行    |
| IPC 通信                   | Yes  | 10 チャンネルの契約定義、wrapper 形式、P60 準拠    |
| Preload/セキュリティ       | Yes  | 3 段階防御、API key 隔離、チャンネルホワイトリスト |

## 成果物

| 成果物                  | パス                                           | 内容                                                           |
| ----------------------- | ---------------------------------------------- | -------------------------------------------------------------- |
| 設計サマリー            | `outputs/phase-2/design-summary.md`            | 責務境界、依存関係、接続順序を整理する                         |
| 契約一覧                | `outputs/phase-2/contract-matrix.md`           | IPC（10 チャンネル）、state、runtime 契約を一覧化する          |
| UI/UX 実体化            | `outputs/phase-2/ui-ux-realization.md`         | banner、message list、composer、handoff の全状態表示を整理する |
| transcript 受け取り設計 | `outputs/phase-2/transcript-ingestion-flow.md` | terminal transcript の手動添付と composer 反映を整理する       |
| 状態機械                | `outputs/phase-2/state-machine.md`             | 状態遷移図と各状態の定義（8 状態 + 遷移条件）                  |
| コンポーネント階層      | `outputs/phase-2/component-hierarchy.md`       | コンポーネント階層（12 コンポーネント）と props 設計           |

## 完了条件

- [ ] ChatPanel の状態機械（8 状態 + 遷移）が定義されている
- [ ] コンポーネント階層（12 コンポーネント）が設計されている
- [ ] Main/Renderer の責務境界が明確に設計されている
- [ ] IPC 契約マトリクス（10 チャンネル）が定義されている
- [ ] empty / streaming / error / blocked / handoff の各状態の UI 表示が定義されている
- [ ] terminal transcript の手動添付と provenance 表示が設計されている
- [ ] アクセシビリティ要件（WCAG 2.1 AA、role/aria 属性、キーボード操作、読み上げ順序）が設計されている
- [ ] セキュリティ要件（3 段階防御、P42 バリデーション、API key 隔離）が設計されている
- [ ] Chat Edit と責務重複しない設計になっている
- [ ] Store 統一（useStore -> useAppStore）の方針が決定されている
- [ ] LLMErrorCode 全 10 値のガイダンス分岐が定義されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## サブタスク管理

Phase 実行開始時に、TodoWrite ツールで以下のサブタスクを作成すること:

1. 参照資料の確認（code-research-report.md、spec-research-report.md、Phase 1 成果物）
2. Task 2-1: state 設計（8 状態 + 遷移 + Store 設計）
3. Task 2-2: コンポーネント階層設計（12 コンポーネント + props）
4. Task 2-3: runtime 境界設計（Main/Renderer 責務分担）
5. Task 2-4: IPC 契約マトリクス（10 チャンネル）
6. Task 2-5: UX 設計（全状態 UI 表示 + ErrorGuidance + CTA）
7. Task 2-6: transcript 受け取り設計（手動共有契約）
8. Task 2-7: アクセシビリティ設計（WCAG 2.1 AA）
9. Task 2-8: セキュリティ設計（3 段階防御 + P42）
10. system spec との整合確認
11. 成果物の作成・配置（6 ファイル）
12. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## タスク 100% 実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている（6 ファイル）
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-seq-task-05-chatpanel-real-chat-wiring --phase 2
```

## 次のPhase

- [Phase 3（設計レビュー）](./phase-3-design-review.md) に進む

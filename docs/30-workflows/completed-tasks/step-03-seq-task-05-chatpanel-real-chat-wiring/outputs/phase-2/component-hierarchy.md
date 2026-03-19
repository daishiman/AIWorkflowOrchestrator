# Phase 2 Task 2-2: コンポーネント階層設計

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| タスクID   | TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 |
| Phase      | 2                                   |
| Task       | 2-2                                 |
| Phase名    | 設計 / コンポーネント階層           |
| 作成日     | 2026-03-18                          |
| ステータス | completed                           |
| 担当Agent  | Chat Surface Agent (Phase 2)        |

---

## 1. コンポーネント階層ツリー

Atomic Design に従い、ChatPanel (organism) を頂点として molecule / atom を組み合わせる。NFR-05「organisms のみ Store を参照し、molecules / atoms は props 経由のみ」を遵守する。

```
ChatPanel (organism)                    [既存 / 大幅改修]
  +-- RuntimeBanner (molecule)          [新規]
  +-- ChatMessageList (molecule)        [新規]
  |     +-- ChatMessage (atom)          [新規]
  |     +-- StreamingMessage (atom)     [既存 83行 / 変更なし]
  |     +-- ErrorGuidance (molecule)    [新規]
  +-- HandoffBlock (molecule)           [新規]
  |     +-- PersistentTerminalLauncher  [新規 / Task02依存]
  |     +-- TranscriptProvenanceLabel   [新規 / P2対応]
  +-- ComposerArea (molecule)           [新規]
  |     +-- ComposerInput (atom)        [新規]
  |     +-- SendButton (atom)           [新規]
  |     +-- ComposerAttachmentChip (atom) [将来拡張・今回はスタブ]
  +-- LLMSelectorPanel (molecule)       [新規 / model-selector-slot置換]
  +-- SkillStreamingView (organism)     [既存 / 変更なし]
  +-- SkillManagementPanel (organism)   [既存 / 変更なし]
```

### Atomic Design 分類根拠

| 分類     | コンポーネント         | 根拠                                                               |
| -------- | ---------------------- | ------------------------------------------------------------------ |
| organism | ChatPanel              | Store を直接参照し、複数 molecule を組み合わせる統合コンポーネント |
| organism | SkillStreamingView     | 既存 organism（変更なし）                                          |
| organism | SkillManagementPanel   | 既存 organism（変更なし）                                          |
| molecule | RuntimeBanner          | capability props を受け取り複数 atom を組み合わせる                |
| molecule | ChatMessageList        | messages[] を受け取りリスト表示する                                |
| molecule | ErrorGuidance          | error props に応じてボタン・リンクを組み合わせる                   |
| molecule | HandoffBlock           | HandoffGuidance props を受け取り複数 atom を組み合わせる           |
| molecule | ComposerArea           | input / button を組み合わせた入力エリア                            |
| molecule | LLMSelectorPanel       | provider/model の複合セレクター                                    |
| atom     | ChatMessage            | 単一メッセージを表示するシンプルなバブル                           |
| atom     | StreamingMessage       | 既存 atom（変更なし）                                              |
| atom     | ComposerInput          | テキスト入力フィールド単体                                         |
| atom     | SendButton             | 送信ボタン単体                                                     |
| atom     | ComposerAttachmentChip | 添付ファイルチップ単体（将来拡張スタブ）                           |

---

## 2. 主要 Props 設計

### 2-1. ChatPanel（organism）

```typescript
// apps/desktop/src/renderer/components/chat/ChatPanel.tsx
export interface ChatPanelProps {
  /** スキルインポート要求時のコールバック（既存）*/
  onImportRequest?: (skill: SkillMetadata) => void;
}

export interface ChatPanelHandle {
  /** スキルインポートダイアログを開く（既存）*/
  handleImportRequest: (skill: SkillMetadata) => void;
}
```

Store から直接取得するフィールド（個別セレクタ経由）:

- `useChatPanelStatus()` → `chatPanelStatus`
- `useChatMessagesShallow()` → `chatMessages`
- `useIsStreaming()` → `isStreaming`（既存セレクタ追加予定）
- `useStreamingContent()` → `streamingContent`（既存セレクタ追加予定）
- `useStreamingError()` → `streamingError`（既存セレクタ追加予定）
- `useSelectedProviderId()` → `selectedProviderId`
- `useSelectedModelId()` → `selectedModelId`

### 2-2. RuntimeBanner（molecule）

```typescript
// apps/desktop/src/renderer/components/chat/RuntimeBanner.tsx
export type AccessCapability =
  | "integratedRuntime"
  | "terminalSurface"
  | "both"
  | "none";

export interface RuntimeBannerProps {
  /** Access Capability 値 */
  capability: AccessCapability;
  /** ターミナル切替ボタン押下コールバック（both の場合のみ表示） */
  onTerminalSwitch?: () => void;
  /** カスタムクラス名 */
  className?: string;
}
```

表示ロジック:

- `integratedRuntime` / `both`: 「API 利用中」バッジ（`role="status"`）
- `both`: 上記 + ターミナル切替ボタン
- `terminalSurface`: ターミナルハンドオフバナー（`role="status"`）
- `none`: API キー未設定バナー（`role="status"`）

### 2-3. ChatMessageList（molecule）

```typescript
// apps/desktop/src/renderer/components/chat/ChatMessageList.tsx
export interface ChatMessageListProps {
  /** メッセージ一覧 */
  messages: ChatMessage[];
  /** ストリーミング中かどうか */
  isStreaming: boolean;
  /** ストリーミング中のコンテンツ */
  streamingContent: string;
  /** キャンセルコールバック（streaming 状態時のみ使用） */
  onCancelStream?: () => void;
  /** エラー情報 */
  error: StreamingError | null;
  /** エラーリトライコールバック */
  onRetry?: () => void;
  /** カスタムクラス名 */
  className?: string;
}
```

アクセシビリティ: `role="log"` + `aria-live="polite"` + `aria-label="チャットメッセージ"`

### 2-4. ChatMessage（atom）

```typescript
// apps/desktop/src/renderer/components/chat/ChatMessage.tsx
export interface ChatMessageProps {
  /** メッセージデータ */
  message: ChatMessage;
  /** カスタムクラス名 */
  className?: string;
}
```

表示ロジック:

- `role === "user"`: 右寄せバブル、背景色 `var(--accent-primary)`
- `role === "assistant"`: 左寄せバブル、背景色 `var(--bg-secondary)`
- `isStreaming === true` の場合: このコンポーネントではなく `StreamingMessage` を使用

### 2-5. ErrorGuidance（molecule）

```typescript
// apps/desktop/src/renderer/components/chat/ErrorGuidance.tsx
export type ErrorCode =
  | "API_KEY_MISSING"
  | "API_KEY_INVALID"
  | "NETWORK_ERROR"
  | "RATE_LIMIT"
  | "STREAM_START_ERROR"
  | "NO_IPC"
  | string;

export interface ErrorGuidanceProps {
  /** エラーコード */
  code: ErrorCode;
  /** エラーメッセージ */
  message: string;
  /** リトライ可能かどうか */
  retryable: boolean;
  /** 再試行コールバック（retryable=true の場合） */
  onRetry?: () => void;
  /** 設定画面へ遷移するコールバック（API_KEY 系エラーの場合） */
  onNavigateToSettings?: () => void;
  /** カスタムクラス名 */
  className?: string;
}
```

アクセシビリティ: `role="alert"` + `aria-live="assertive"`

表示ロジック:

- `API_KEY_MISSING` / `API_KEY_INVALID`: 「設定画面で API キーを登録してください」+ 設定リンク
- `NETWORK_ERROR` / `RATE_LIMIT` / `STREAM_START_ERROR` で `retryable=true`: 「もう一度試す」ボタン
- その他: 汎用エラーメッセージのみ

### 2-6. HandoffBlock（molecule）

```typescript
// apps/desktop/src/renderer/components/chat/HandoffBlock.tsx

// Task02 Phase 2 依存型（インターフェース定義が確定次第 @repo/shared に移動）
export interface HandoffGuidance {
  /** ターミナルで実行するコマンド */
  terminalCommand: string;
  /** コンテキストサマリー（ユーザーに表示する説明） */
  contextSummary: string;
  /** ハンドオフ理由 */
  reason: string;
}

export interface HandoffBlockProps {
  /** ハンドオフガイダンス */
  guidance: HandoffGuidance;
  /** ターミナルを開くコールバック */
  onOpenTerminal?: () => void;
  /** カスタムクラス名 */
  className?: string;
}
```

表示内容:

- `contextSummary` のテキスト説明
- `terminalCommand` のコピー可能なコードブロック（`<pre><code>` + コピーボタン）
- `PersistentTerminalLauncher`（ターミナルを開くボタン、Task02 実装待ち）
- `TranscriptProvenanceLabel`（来歴情報）

Terminal Boundary ルール遵守:

- auto-send: HandoffBlock は `terminalCommand` を自動実行しない
- hidden prompt injection: contextSummary は表示のみ、コマンドへの埋め込みなし
- silent fallback: capability チェックは ChatPanel 側で実施済み

### 2-7. PersistentTerminalLauncher（atom / Task02 依存）

```typescript
// apps/desktop/src/renderer/components/chat/PersistentTerminalLauncher.tsx
export interface PersistentTerminalLauncherProps {
  /** ターミナルを開くコールバック */
  onOpen: () => void;
  /** disabled 状態 */
  disabled?: boolean;
  /** カスタムクラス名 */
  className?: string;
}
```

> 依存: Task02 Phase 2 の設計が完了するまでスタブ実装（ボタン表示のみ）。

### 2-8. TranscriptProvenanceLabel（atom）

```typescript
// apps/desktop/src/renderer/components/chat/TranscriptProvenanceLabel.tsx
export interface TranscriptProvenance {
  /** 取得元（"local-db" | "handoff" 等） */
  source: string;
  /** 取得日時 */
  retrievedAt: Date;
  /** 会話ID */
  conversationId: string;
}

export interface TranscriptProvenanceLabelProps {
  /** 来歴情報 */
  provenance: TranscriptProvenance;
  /** カスタムクラス名 */
  className?: string;
}
```

### 2-9. ComposerArea（molecule）

```typescript
// apps/desktop/src/renderer/components/chat/ComposerArea.tsx
export interface ComposerAreaProps {
  /** 入力値 */
  value: string;
  /** 入力変更コールバック */
  onChange: (value: string) => void;
  /** 送信コールバック */
  onSubmit: (message: string) => void;
  /** 送信可能かどうか（false = disabled） */
  canSubmit: boolean;
  /** ストリーミング中かどうか（true = 送信不可 + キャンセルボタン表示） */
  isStreaming: boolean;
  /** キャンセルコールバック */
  onCancel?: () => void;
  /** placeholder テキスト */
  placeholder?: string;
  /** カスタムクラス名 */
  className?: string;
}
```

### 2-10. ComposerInput（atom）

```typescript
// apps/desktop/src/renderer/components/chat/ComposerInput.tsx
export interface ComposerInputProps {
  /** 入力値 */
  value: string;
  /** 入力変更コールバック */
  onChange: (value: string) => void;
  /** Enter キー送信コールバック（Shift+Enter は改行） */
  onEnterSubmit: () => void;
  /** disabled 状態 */
  disabled?: boolean;
  /** placeholder テキスト */
  placeholder?: string;
  /** カスタムクラス名 */
  className?: string;
}
```

### 2-11. SendButton（atom）

```typescript
// apps/desktop/src/renderer/components/chat/SendButton.tsx
export interface SendButtonProps {
  /** クリックコールバック */
  onClick: () => void;
  /** disabled 状態（空文字 / ストリーミング中 / provider未選択） */
  disabled?: boolean;
  /** ローディング状態（送信中） */
  isLoading?: boolean;
  /** カスタムクラス名 */
  className?: string;
}
```

アクセシビリティ: `aria-label="メッセージを送信"` + `aria-disabled={disabled}`

### 2-12. LLMSelectorPanel（molecule）

```typescript
// apps/desktop/src/renderer/components/chat/LLMSelectorPanel.tsx
export interface LLMSelectorPanelProps {
  /** プロバイダー一覧 */
  providers: LLMProvider[];
  /** 選択中プロバイダーID */
  selectedProviderId: LLMProviderId | null;
  /** 選択中モデルID */
  selectedModelId: string | null;
  /** プロバイダー選択コールバック */
  onSelectProvider: (providerId: LLMProviderId) => void;
  /** モデル選択コールバック */
  onSelectModel: (modelId: string) => void;
  /** ローディング状態 */
  isLoading?: boolean;
  /** カスタムクラス名 */
  className?: string;
}
```

機能:

- Provider と Model を連動して選択（Provider 変更時に Model をデフォルトにリセット）
- 選択変更時に `llm:set-selected-config` を IPC 経由で Main Process へ同期（既存 `syncSelectedConfigToMain` で実装済み）
- provider / model 未選択の場合は `SendButton` を disabled にする（FR-01 受入基準）

---

## 3. コンポーネント配置ファイルパス

すべての新規コンポーネントは `apps/desktop/src/renderer/components/chat/` に配置する。

```
apps/desktop/src/renderer/components/chat/
  ChatPanel.tsx                    [既存 / 大幅改修]
  StreamingMessage.tsx             [既存 / 変更なし]
  RuntimeBanner.tsx                [新規]
  ChatMessageList.tsx              [新規]
  ChatMessage.tsx                  [新規]
  ErrorGuidance.tsx                [新規]
  HandoffBlock.tsx                 [新規]
  PersistentTerminalLauncher.tsx   [新規 / スタブ]
  TranscriptProvenanceLabel.tsx    [新規]
  ComposerArea.tsx                 [新規]
  ComposerInput.tsx                [新規]
  SendButton.tsx                   [新規]
  LLMSelectorPanel.tsx             [新規]
  index.ts                         [既存 / export 追加]
```

### index.ts への追加 export

```typescript
// apps/desktop/src/renderer/components/chat/index.ts (追加分)
export { RuntimeBanner } from "./RuntimeBanner";
export type { RuntimeBannerProps, AccessCapability } from "./RuntimeBanner";
export { ChatMessageList } from "./ChatMessageList";
export type { ChatMessageListProps } from "./ChatMessageList";
export { ChatMessage } from "./ChatMessage";
export type { ChatMessageProps } from "./ChatMessage";
export { ErrorGuidance } from "./ErrorGuidance";
export type { ErrorGuidanceProps, ErrorCode } from "./ErrorGuidance";
export { HandoffBlock } from "./HandoffBlock";
export type { HandoffBlockProps, HandoffGuidance } from "./HandoffBlock";
export { PersistentTerminalLauncher } from "./PersistentTerminalLauncher";
export type { PersistentTerminalLauncherProps } from "./PersistentTerminalLauncher";
export { TranscriptProvenanceLabel } from "./TranscriptProvenanceLabel";
export type {
  TranscriptProvenanceLabelProps,
  TranscriptProvenance,
} from "./TranscriptProvenanceLabel";
export { ComposerArea } from "./ComposerArea";
export type { ComposerAreaProps } from "./ComposerArea";
export { ComposerInput } from "./ComposerInput";
export type { ComposerInputProps } from "./ComposerInput";
export { SendButton } from "./SendButton";
export type { SendButtonProps } from "./SendButton";
export { LLMSelectorPanel } from "./LLMSelectorPanel";
export type { LLMSelectorPanelProps } from "./LLMSelectorPanel";
```

---

## 4. 条件レンダリングロジック

ChatPanel の `chatPanelStatus` に応じて表示するコンポーネントを制御する。

### 4-1. ヘッダーエリア（`data-testid="chat-header"`）

```tsx
// 常時表示
<RuntimeBanner capability={resolvedCapability} />

// 既存: 常時表示
<SkillSelector />

// 新規: model-selector-slot 置換
<LLMSelectorPanel
  providers={providers}
  selectedProviderId={selectedProviderId}
  selectedModelId={selectedModelId}
  onSelectProvider={selectProvider}
  onSelectModel={selectModel}
  isLoading={llmIsLoading}
/>
```

### 4-2. メッセージエリア（`data-testid="message-area"`）

`showSkillManagement === false` の場合の `<>` フラグメント内の条件分岐:

```tsx
{/* message-list-slot 置換 */}
{chatPanelStatus === "handoff" ? (
  <HandoffBlock
    guidance={handoffGuidance}
    onOpenTerminal={handleOpenTerminal}
  />
) : chatPanelStatus === "blocked" ? (
  <ErrorGuidance
    code="API_KEY_MISSING"
    message="API キーが設定されていません"
    retryable={false}
    onNavigateToSettings={handleNavigateToSettings}
  />
) : (
  <ChatMessageList
    messages={chatMessages}
    isStreaming={isStreaming}
    streamingContent={streamingContent}
    onCancelStream={cancelStream}
    error={streamingError}
    onRetry={handleRetry}
  />
)}

{/* 既存: SkillStreamingView */}
{isExecuting && selectedSkillName && (
  <SkillStreamingView ... />
)}
```

### 4-3. 入力エリア（`data-testid="input-area"`）

```tsx
{
  /* chat-input-slot 置換 */
}
{
  chatPanelStatus !== "handoff" && chatPanelStatus !== "blocked" ? (
    <ComposerArea
      value={chatInput}
      onChange={setChatInput}
      onSubmit={handleSendMessage}
      canSubmit={
        !!selectedProviderId && !!selectedModelId && !isStreaming && !isSending
      }
      isStreaming={isStreaming}
      onCancel={cancelStream}
      placeholder="AI にメッセージを送信..."
    />
  ) : null;
}
```

### 4-4. 状態別レンダリングサマリー

| `chatPanelStatus` | RuntimeBanner | LLMSelectorPanel | メッセージエリア                   | ComposerArea             |
| ----------------- | ------------- | ---------------- | ---------------------------------- | ------------------------ |
| `idle`            | 表示          | 表示             | 空（ChatMessageList / zero state） | 表示（disabled）         |
| `ready`           | 表示          | 表示             | ChatMessageList                    | 表示（enabled）          |
| `streaming`       | 表示          | 表示             | ChatMessageList + StreamingMessage | disabled + Cancel ボタン |
| `cancelled`       | 表示          | 表示             | ChatMessageList（キャンセル済み）  | 表示（enabled）          |
| `completed`       | 表示          | 表示             | ChatMessageList（完了）            | 表示（enabled）          |
| `error`           | 表示          | 表示             | ChatMessageList + ErrorGuidance    | 表示（enabled）          |
| `blocked`         | 表示          | 非表示           | ErrorGuidance（API key 誘導）      | 非表示                   |
| `handoff`         | 表示          | 非表示           | HandoffBlock                       | 非表示                   |

---

## 5. コンポーネント間のデータフロー

```
useAppStore (Zustand)
  |
  +-- useChatPanelStatus()         --> ChatPanel --> (props) --> RuntimeBanner
  +-- useChatMessagesShallow()     --> ChatPanel --> (props) --> ChatMessageList
  |                                                                  +-- ChatMessage (atom)
  |                                                                  +-- StreamingMessage (atom)
  |                                                                  +-- ErrorGuidance (molecule)
  +-- useSelectedProviderId()      --> ChatPanel --> (props) --> LLMSelectorPanel
  +-- useSelectedModelId()         --> ChatPanel --> (props) --> LLMSelectorPanel
  +-- useLLMProviders()            --> ChatPanel --> (props) --> LLMSelectorPanel
  |
  +-- useStreamingChat() hook
        state.isStreaming          --> ChatPanel --> (props) --> ComposerArea
        state.content              --> ChatPanel --> (props) --> ChatMessageList
        state.error                --> ChatPanel --> (props) --> ChatMessageList
        actions.startStream        --> ChatPanel.handleSendMessage
        actions.cancelStream       --> ChatPanel --> (props) --> ComposerArea.onCancel
                                                                ChatMessageList.onCancelStream
```

---

## 6. 実装優先度と依存関係

### 実装順序（Phase 5 実装の推奨順）

1. **先行実装（依存なし）**
   - `ComposerInput` (atom)
   - `SendButton` (atom)
   - `ChatMessage` (atom)

2. **次段階（atom 完成後）**
   - `ComposerArea` (molecule) ← ComposerInput + SendButton
   - `ChatMessageList` (molecule) ← ChatMessage + StreamingMessage（既存）+ ErrorGuidance
   - `LLMSelectorPanel` (molecule) ← 独立実装可能

3. **次段階（molecule 完成後）**
   - `RuntimeBanner` (molecule) ← 独立実装可能
   - `ErrorGuidance` (molecule) ← 独立実装可能
   - `HandoffBlock` (molecule) ← Task02 スタブ含む

4. **最終段階（全コンポーネント完成後）**
   - `ChatPanel` (organism) の改修 ← すべての molecule が完成してから

### Task02 / Task06 依存関係

| コンポーネント              | 依存タスク     | ブロッキング | 対応方針                                |
| --------------------------- | -------------- | ------------ | --------------------------------------- |
| PersistentTerminalLauncher  | Task02 Phase 2 | あり         | スタブ実装（ボタン表示のみ）            |
| HandoffBlock の guidance 型 | Task02 Phase 2 | あり         | ローカル型定義で仮実装                  |
| RuntimeBanner の capability | Task06 Phase 2 | なし         | 固定値 `"integratedRuntime"` で開発可能 |

---

## 変更履歴

| バージョン | 日付       | 変更内容                                    |
| ---------- | ---------- | ------------------------------------------- |
| v1.0.0     | 2026-03-18 | 初版作成（Task 2-2 コンポーネント階層設計） |

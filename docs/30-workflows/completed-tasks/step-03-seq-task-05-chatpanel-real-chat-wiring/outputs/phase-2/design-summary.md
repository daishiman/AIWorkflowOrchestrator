# Phase 2: 設計サマリー（Task 2-3: Runtime境界設計）

## メタ情報

| 項目             | 内容                                |
| ---------------- | ----------------------------------- |
| タスクID         | TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 |
| Phase            | 2 - 設計                            |
| Task             | 2-3 Runtime境界設計                 |
| 作成日           | 2026-03-18                          |
| 担当エージェント | Agent D (Task 2-3 / Task 2-4)       |
| 依存成果物       | outputs/phase-1/scope-definition.md |
|                  | outputs/phase-1/asset-inventory.md  |

---

## 1. Main Process 責務テーブル

Main Process は Node.js フルアクセス権を持ち、セキュリティ境界の内側に存在する。
以下の責務はすべて Main Process 側に留め、Renderer には最小限の結果のみを返す。

| 責務                 | 実装箇所                                                        | 説明                                                                                                                             |
| -------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Runtime解決          | `llmConfigProvider.getSelectedLLMConfig()`                      | 現在選択中の providerId / modelId を返す。未選択時は `null` を返す（P62 fallback 禁止）                                          |
| Provider解決         | `handleGetProviders()` in `handlers/llm.ts`                     | 利用可能プロバイダー一覧と各モデル一覧を返す。SecureStorage でキー存在を確認し isAvailable に反映                                |
| API key確認          | `SecureStorage.getApiKey(providerId)`                           | API キーを Main 内で参照し、`exists: boolean` のみ Renderer に返却する（生値は非公開）                                           |
| ストリーミング実行   | `handleStreamChat()` in `handlers/llm.ts`                       | `LLMAdapterFactory.getAdapter(providerId)` 経由でストリームを開始し、チャンクを push で送信                                      |
| 非ストリーミング送信 | `handleSendChat()` in `handlers/llm.ts`                         | `adapter.sendChat(request)` を呼び出し、完成レスポンスを一括返却                                                                 |
| ストリームキャンセル | `handleStreamCancel()` in `handlers/llm.ts`                     | `activeStreams` Map から AbortController を取得し `abort()` する                                                                 |
| 会話永続化（作成）   | `CONVERSATION_CREATE` handler in `conversationHandlers.ts`      | SQLite に新規 Conversation レコードを挿入し Conversation オブジェクトを返す                                                      |
| 会話永続化（追記）   | `CONVERSATION_ADD_MESSAGE` handler in `conversationHandlers.ts` | 指定 conversationId にメッセージを追加し Message オブジェクトを返す                                                              |
| ヘルスチェック       | `handleCheckHealth()` in `handlers/llm.ts`                      | `LLMAdapterFactory.getAdapter(providerId).checkHealth()` を呼び出す。例外時は `status: "disconnected"` を返す（GAP-02 修正済み） |
| Auth Key 存在確認    | `AUTH_KEY_EXISTS` handler in `authKeyHandlers.ts`               | Claude Agent SDK 用 API キーの存在を確認し `{ exists: boolean, source? }` を返す                                                 |

---

## 2. Renderer Process 責務テーブル

Renderer Process は DOM のみアクセス可能。Node.js API への直接アクセスは禁止。
IPC（Preload Bridge 経由）を通じて Main と通信する。

| 責務                   | 実装箇所                                                                         | 説明                                                                                             |
| ---------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| UI状態管理             | `chatSlice` (Zustand store)                                                      | `chatMessages`, `isStreaming`, `streamingContent`, `currentStreamId`, `streamingError` を管理    |
| Provider/Model選択状態 | `llmSlice` (Zustand store)                                                       | `providers`, `selectedProviderId`, `selectedModelId` を管理                                      |
| ユーザー入力操作       | `ComposerArea` コンポーネント（新規実装予定）                                    | テキスト入力・送信ボタン・ストリーミングキャンセルボタン                                         |
| メッセージ表示         | `ChatMessageList` コンポーネント（新規実装予定）                                 | `chatMessages` 配列を受け取りリスト表示。`StreamingMessage` でストリーミング中メッセージを表示   |
| Provider/Model選択UI   | `LLMSelectorPanel` コンポーネント（新規実装予定）                                | `providers` 一覧から provider / model を選択し `llmSlice` を更新する                             |
| 全体パネル表示切替     | `ChatPanel.tsx`                                                                  | `chatPanelStatus` に応じた条件レンダリング。3つのプレースホルダーを実コンポーネントに置換        |
| Store⇔IPC 同期         | `useStreamingChat` フック (`renderer/hooks/useStreamingChat.ts`)                 | `onStreamChunk` / `onStreamEnd` / `onStreamError` リスナーを登録し chatSlice アクションと同期    |
| Selected config 同期   | `llm:set-selected-config` IPC 経由（`window.electronAPI.llm.setSelectedConfig`） | Provider/Model 選択変更時に Main へ同期（P62 準拠: 未選択時は IPC 呼び出しなし）                 |
| Capability 判定・表示  | `ChatPanel.tsx` 内インライン or カスタムフック                                   | HealthCheck 結果 + authMode 状態からパネル状態（ready/no-key/disconnected 等）を判定して表示切替 |

---

## 3. Capability 解決フロー（3ステップ）

ChatPanel マウント時に以下の3ステップで AI チャット利用可能性を判定し、UI 状態に反映する。

### Step 1: ChatPanel マウント時に checkHealth を呼び出す

```
ChatPanel mounted
  → useEffect で window.electronAPI.llm.checkHealth(selectedProviderId) を呼び出す
  → selectedProviderId が null の場合は checkHealth をスキップし、status = "no-provider" とする
```

### Step 2: Capability 判定ロジック（Renderer 側）

```
HealthCheckResult.status が "connected"
  AND selectedProviderId が非 null
  AND selectedModelId が非 null
  → chatPanelStatus = "ready"

HealthCheckResult.status が "disconnected" or "error"
  → chatPanelStatus = "disconnected"
    （errorMessage を表示し、再接続ボタンを提供する）

selectedProviderId が null or selectedModelId が null
  → chatPanelStatus = "no-provider"
    （LLMSelectorPanel を前面に出し選択を促す）

window.electronAPI.authKey.exists() が { exists: false }
  AND authMode が "api-key" モード
  → chatPanelStatus = "no-api-key"
    （API キー設定への誘導を表示する）
```

**判定優先順位**: no-provider > no-api-key > disconnected > ready

### Step 3: 判定結果の反映（chatSlice.chatPanelStatus）

```
chatPanelStatus を chatSlice または ChatPanel ローカル state に格納
ChatPanel が chatPanelStatus に応じて:
  - "ready"       → 通常チャットUI を表示（3スロット全展開）
  - "no-provider" → LLMSelectorPanel のみ表示
  - "no-api-key"  → 警告バナー + 設定画面リンクを表示
  - "disconnected"→ エラーバナー + 再接続ボタンを表示
```

---

## 4. 境界原則（4項目）

以下の原則はアーキテクチャルール（01-architecture.md）およびセキュリティルール（04-electron-security.md）を
ChatPanel 実装に具体的に適用したものである。

### 原則 1: Renderer から Node.js 直接アクセス禁止

Renderer は `window.electronAPI.*` / `window.conversationAPI.*` のみを経由する。
`require('fs')` 等の Node.js API を Renderer から直接呼び出してはならない。

```
禁止: import fs from 'fs'  (Renderer コードでの直接 Node.js 使用)
許可: window.electronAPI.llm.streamChat(request)
```

### 原則 2: API key は Main 限定、exists: boolean のみ返却

API キー（文字列）を Renderer に渡してはならない。
Renderer が必要とするのは「キーが存在するか否か」のみ。

```
禁止: event.sender.send("api-key:value", apiKeyString)
許可: return { exists: true, source: "saved" }
```

### 原則 3: Runtime 判定は Main、Renderer は表示のみ

「どのプロバイダーを使うか」「API キーが有効か」等の判定は Main で行い、
Renderer は判定結果（HealthCheckResult など）を受け取って表示切替するだけ。

```
Main: handleCheckHealth() → { status: "connected" | "disconnected" | "error" }
Renderer: status に応じた chatPanelStatus 変数を更新 → 条件レンダリング
```

### 原則 4: Provider/Model 未選択時は Main がエラー返却（P62 silent fallback 禁止）

`llmConfigProvider.getSelectedLLMConfig()` が `null` を返した場合、
Main は DEFAULT_CONFIG への暗黙 fallback を行わず、エラーを送信する。
これにより意図しないプロバイダーへのリクエスト送信を防ぐ（P62 対策）。

```
禁止: const config = getSelectedLLMConfig() ?? DEFAULT_CONFIG
許可: const config = getSelectedLLMConfig()
      if (!config) {
        safeSend(IPC_CHANNELS.LLM_STREAM_ERROR, {
          code: "MODEL_NOT_FOUND",
          message: "Provider/Model not selected",
          retryable: false,
        })
        return { requestId }
      }
```

---

## 5. コンポーネント階層（新規実装 vs 既存再利用）

```
ChatPanel.tsx  [既存・改修]
  ├── ChatHeader [既存]
  │   ├── LLMSelectorPanel [新規実装]  ← model-selector-slot を置換
  │   └── SkillSelector [既存・変更なし]
  ├── MessageArea [既存]
  │   ├── ChatMessageList [新規実装]  ← message-list-slot を置換
  │   │   ├── ChatMessageItem [新規実装]  (通常メッセージ)
  │   │   └── StreamingMessage [既存再利用]  (ストリーミング中)
  │   └── SkillStreamingView [既存・変更なし]
  └── InputArea [既存]
      └── ComposerArea [新規実装]  ← chat-input-slot を置換
```

**フック接続**:

```
ChatPanel または ChatMessageList
  └── useStreamingChat()  [既存フック・ChatPanelに新規接続]
        ├── state: { isStreaming, content, error }
        └── actions: { startStream, cancelStream }
```

---

## 6. 状態機械（chatPanelStatus 8状態 + 遷移）

| 状態           | 表示内容                               | 遷移トリガー                                         |
| -------------- | -------------------------------------- | ---------------------------------------------------- |
| `initializing` | ローディングスピナー                   | ChatPanel マウント時の初期状態                       |
| `no-provider`  | LLMSelectorPanel を前面表示            | selectedProviderId = null の場合                     |
| `no-api-key`   | API キー設定の誘導バナー               | authKey.exists() = false かつ authMode = "api-key"   |
| `checking`     | ヘルスチェック中インジケーター         | checkHealth() 実行中                                 |
| `disconnected` | 接続エラーバナー + 再接続ボタン        | checkHealth() result.status = "disconnected"/"error" |
| `ready`        | 通常チャット UI（3スロット全展開）     | checkHealth() result.status = "connected"            |
| `streaming`    | ストリーミング中 UI（送信ボタン→停止） | startStream() 呼び出し後                             |
| `error`        | エラーバナー + 再試行ボタン            | streamingError セット後                              |

**主要な遷移図**:

```
initializing → checking (マウント時)
checking → no-provider (selectedProviderId = null)
checking → no-api-key (API key 未設定)
checking → disconnected (health = disconnected/error)
checking → ready (health = connected)
ready → streaming (startStream 呼び出し)
streaming → ready (endStreaming)
streaming → error (streamingError セット)
error → ready (再試行成功)
error → checking (再接続ボタン押下)
no-provider → checking (Provider/Model 選択後)
no-api-key → checking (設定画面で API キー設定後)
```

---

## アクセシビリティ設計

> Task 2-7 担当: Security Agent
> 参照: `ui-ux-panels.md`, `apps/desktop/src/renderer/components/chat/StreamingMessage.tsx`

### 1. ARIA属性マッピングテーブル

既存実装（StreamingMessage.tsx L49-51）では `role="status"`, `aria-live="polite"`, `aria-busy={isStreaming}` が実装済み。カーソル span には `aria-label="入力中"`（L59）、キャンセルボタンは `aria-label="ストリーミングを停止"`（L68）として実装されている。

以下は本タスクで配線する全コンポーネントの ARIA 属性定義。

| 要素                            | role / aria 属性                                                 | 目的                                                             |
| ------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------- |
| ChatMessageList（外側コンテナ） | `role="log"`, `aria-live="polite"`, `aria-label="チャット履歴"`  | メッセージ追加をスクリーンリーダーに通知（polite: 割り込まない） |
| StreamingMessage（既存実装）    | `role="status"`, `aria-live="polite"`, `aria-busy={isStreaming}` | ストリーミング中の状態通知（実装済み）                           |
| StreamingMessage カーソル span  | `aria-label="入力中"`                                            | カーソルアニメーションの意味（実装済み）                         |
| キャンセルボタン                | `aria-label="応答をキャンセル"`                                  | キャンセル操作の説明（現在"ストリーミングを停止"→統一推奨）      |
| ErrorGuidance コンポーネント    | `role="alert"`                                                   | エラー発生時の即時通知（assertive 相当）                         |
| RuntimeBanner                   | `role="status"`, `aria-live="polite"`                            | capability 状態変化の通知（非割り込み）                          |
| ComposerInput（テキストエリア） | `aria-label="メッセージを入力"`, `aria-multiline="true"`         | 入力欄の説明                                                     |
| SendButton（送信可能時）        | `aria-label="送信"`, `aria-disabled={!canSend}`                  | 送信ボタンの状態（送信不可時は disabled を aria に反映）         |
| SendButton（ストリーミング中）  | `aria-label="送信中..."`, `aria-busy="true"`                     | ストリーミング実行中を示す                                       |

**注意**: ChatMessageList の `aria-live="polite"` と ErrorGuidance の `role="alert"` は意図的に分離する。エラーは即時通知（alert）、通常メッセージは非割り込み（polite）とする。

### 2. 読み上げ順序（DOM 順序設計）

スクリーンリーダーは DOM 順序に沿って読み上げるため、以下の順序でコンポーネントを配置する。

```
[RuntimeBanner]          role="status"        - capability 状態（最上部で文脈を提供）
[ErrorGuidance]          role="alert"         - エラー情報（メッセージより優先度高）
[ChatMessageList]        role="log"           - チャット履歴（メインコンテンツ）
  └── [StreamingMessage] role="status"        - ストリーミング中メッセージ
[ComposerArea]
  ├── [ComposerInput]    aria-multiline="true" - 入力欄
  └── [SendButton]       aria-disabled         - 送信ボタン
```

**設計根拠**: RuntimeBanner と ErrorGuidance を ChatMessageList より先に DOM 配置することで、ページ先頭から読む際に現在の capability（Claudeモード/APIキーモード等）とエラー状態を把握してからメッセージを読める。

### 3. キーボード操作マッピング

| 操作              | 対象要素                    | 動作                                                              |
| ----------------- | --------------------------- | ----------------------------------------------------------------- |
| `Enter`           | ComposerInput（送信可能時） | メッセージ送信（`canSend && !isStreaming` の場合のみ）            |
| `Shift+Enter`     | ComposerInput               | 改行挿入（送信しない）                                            |
| `Escape`          | 任意（ストリーミング中）    | ストリーミングキャンセル（`onCancel` コールバック呼び出し）       |
| `Tab`             | 全インタラクティブ要素      | フォーカス移動（SendButton ↔ ComposerInput ↔ RuntimeBanner など） |
| `Space` / `Enter` | SendButton にフォーカス時   | メッセージ送信（ボタン標準動作）                                  |

**実装上の注意**: Escape キーは `ComposerInput` の `onKeyDown` ハンドラでキャプチャする。ストリーミング非実行時は Escape を ComposerInput のクリアに使用するか、デフォルト動作（何もしない）にする。

### 4. WCAG 2.1 AA 準拠チェックリスト

| 基準                          | 要件                               | 実装方針                                                                 |
| ----------------------------- | ---------------------------------- | ------------------------------------------------------------------------ |
| 1.4.3 コントラスト（最小）    | 通常テキスト 4.5:1 以上            | Apple HIG systemBlue `#007AFF` / ライト背景 `#FFFFFF` の組み合わせで確認 |
| 1.4.11 非テキストコントラスト | UI部品・グラフィック 3:1 以上      | SendButton のボーダー・アイコンで確認                                    |
| 2.1.1 キーボード              | 全機能をキーボードで操作可能       | 上記キーボードマッピング参照                                             |
| 2.4.3 フォーカス順序          | DOM 順序と一致した論理的フォーカス | tabIndex を使わず自然な DOM 順序で実現                                   |
| 2.4.7 フォーカスの可視性      | フォーカスインジケーター表示       | Tailwind `focus:ring-2 focus:ring-blue-500`                              |
| 4.1.2 名前・役割・値          | 全 UI 部品に name と role          | 上記 ARIA 属性マッピング参照                                             |
| 1.3.1 情報と関係性            | 色だけで情報を伝えない             | エラー: アイコン（X）+ 赤テキスト + role="alert" の3要素で伝達           |

**既存実装との整合**: `StreamingMessage.tsx` は `aria-busy` / `aria-label` を適切に実装済み。本タスクでは StreamingMessage 単体を使う ChatMessageList コンテナレベルの ARIA を追加することが主要作業となる。

---

## セキュリティ設計

> Task 2-8 担当: Security Agent
> 参照: `security-electron-ipc-core.md`, `security-principles.md`, `apps/desktop/src/preload/channels.ts`

### 1. Renderer 3段階防御パターン

`security-electron-ipc-core.md` の「Renderer 境界での Preload Payload 防御」パターン（2026-03-07追加）を本タスクのチャット接続に適用する。

| 段階                       | 防御内容                                                             | 具体的コード例                                                                    |
| -------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| 1. namespace 存在確認      | `window.electronAPI?.llm` で optional chaining                       | `const api = window.electronAPI?.llm;`                                            |
| 2. メソッド存在確認 + 警告 | `api?.streamChat` の存在を確認し、不在時は `console.warn` + fallback | `if (!api?.streamChat) { console.warn("llm.streamChat not available"); return; }` |
| 3. レスポンス形状検証      | `Array.isArray()` / optional chaining で shape を保証                | `const content = result?.data?.content ?? "";`                                    |

**適用箇所**:

- `useChatPanel` フック内の `handleSend` 関数
- LLM ストリーミング開始呼び出し: `window.electronAPI?.llm?.streamChat`
- LLM ストリーミングキャンセル: `window.electronAPI?.llm?.cancelStream`

**P62 対策（DEFAULT_CONFIG 暗黙 fallback 禁止）**: Provider / Model が未選択の場合は SendButton を `aria-disabled` にしてチャット送信を拒否する。フォールバック設定でリクエストを送信してはならない（Section 4 の境界原則4と整合）。

### 2. API キー保護テーブル

本タスク（ChatPanel 実チャット接続）に関連する API キー保護の実装確認。

| 観点                   | 措置                                                                | 実装確認箇所                                                                                              |
| ---------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 暗号化保存             | `safeStorage.encryptString()` で electron-store に保存              | `apps/desktop/src/main/infrastructure/secureStorage.ts`                                                   |
| Renderer 隔離          | `auth-key:getKey` は Main Process 内部のみ。Renderer には公開しない | `channels.ts` の `ALLOWED_INVOKE_CHANNELS` に `AUTH_KEY_GET`（キー値直接取得）は含まれない（NFR-SEC-008） |
| IPC 送信元検証         | `withValidation()` wrapper で sender 検証                           | `apps/desktop/src/main/infrastructure/security/ipc-validator.ts`                                          |
| チャット送信ペイロード | API キーを含めない。Main Process が内部でキーを付加する             | `LLM_STREAM_CHAT` / `LLM_SEND_CHAT` の引数設計                                                            |
| ログ出力禁止           | API キー値をログに含めない                                          | Main Process ハンドラ内でのみキーを参照し、ログには含めない                                               |

**channels.ts 確認結果**: `API_KEY_SAVE`, `API_KEY_DELETE`, `API_KEY_VALIDATE`, `API_KEY_LIST` は `ALLOWED_INVOKE_CHANNELS` に含まれる（必要な操作）。`API_KEY_GET`（キー値の直接取得）は定義されておらず、Renderer からキー値を取得する手段が存在しない設計になっている。

### 3. IPC セキュリティ設計（LLM ストリーミング チャンネル）

本タスクで使用する IPC チャンネルの一覧と検証設計。

| チャンネル定数      | 文字列値              | 方向            | 種別   | ホワイトリスト確認                           |
| ------------------- | --------------------- | --------------- | ------ | -------------------------------------------- |
| `LLM_STREAM_CHAT`   | `"llm:stream-chat"`   | Renderer → Main | invoke | `ALLOWED_INVOKE_CHANNELS` に含まれる（L451） |
| `LLM_STREAM_CANCEL` | `"llm:stream-cancel"` | Renderer → Main | invoke | `ALLOWED_INVOKE_CHANNELS` に含まれる（L452） |
| `LLM_STREAM_CHUNK`  | `"llm:stream-chunk"`  | Main → Renderer | on     | `ALLOWED_ON_CHANNELS` に含まれる（L645）     |
| `LLM_STREAM_END`    | `"llm:stream-end"`    | Main → Renderer | on     | `ALLOWED_ON_CHANNELS` に含まれる（L646）     |
| `LLM_STREAM_ERROR`  | `"llm:stream-error"`  | Main → Renderer | on     | `ALLOWED_ON_CHANNELS` に含まれる（L647）     |
| `AUTH_MODE_GET`     | `"auth-mode:get"`     | Renderer → Main | invoke | `ALLOWED_INVOKE_CHANNELS` に含まれる（L585） |
| `AUTH_MODE_CHANGED` | `"auth-mode:changed"` | Main → Renderer | on     | `ALLOWED_ON_CHANNELS` に含まれる（L675）     |

**P27 準拠確認**: 全チャンネルは `IPC_CHANNELS` 定数経由で参照し、文字列リテラルを直接使用しない。

**引数バリデーション設計（P42準拠 3段バリデーション）**:

```typescript
// LLM_STREAM_CHAT ハンドラの引数検証（Main Process 側）
// 1. 型チェック
if (typeof args?.message !== "string") {
  /* VALIDATION_ERROR */
}
// 2. 空文字列チェック
if (args.message === "") {
  /* VALIDATION_ERROR */
}
// 3. トリム空文字列チェック
if (args.message.trim() === "") {
  /* VALIDATION_ERROR */
}
```

### 4. CSP 設定（確認済み）

`security-electron-ipc-core.md` に記載の実装済み CSP 設定（`apps/desktop/src/main/infrastructure/security/csp.ts`）を確認。

| 環境 | `script-src`                           | `object-src` | `frame-ancestors` | `unsafe-eval` |
| ---- | -------------------------------------- | ------------ | ----------------- | ------------- |
| 本番 | `'self'`                               | `'none'`     | `'none'`          | 禁止          |
| 開発 | `'self' 'unsafe-inline' 'unsafe-eval'` | `'none'`     | `'none'`          | HMR 用に許可  |

本タスクの実装では CSP 設定変更は不要。既存設定を継承する。

### 5. Preload API 公開確認チェックリスト（P59 対策）

本タスクで新規 IPC 呼び出しを Renderer から使用する前に確認する項目。

- [ ] `preload/index.ts` の `contextBridge.exposeInMainWorld()` ブロックに `llm` API が公開されていること
- [ ] `preload/index.ts` の `else` ブロック（非 contextBridge 環境）にも同じ API が定義されていること
- [ ] DevTools の Console で `window.electronAPI.llm` が `undefined` でないことを確認
- [ ] `grep -c "exposeInMainWorld" preload/index.ts` で公開 API 数と定義済み API 数が一致すること

### 6. 多層防御サマリー

```
[Renderer 境界]
  1. namespace 存在確認 (window.electronAPI?.llm)
  2. メソッド存在確認 + console.warn
  3. レスポンス形状検証 (Array.isArray / optional chaining)
        ↓
[Preload Bridge / contextBridge]
  - ALLOWED_INVOKE_CHANNELS ホワイトリスト
  - safeInvoke でチャンネル名を IPC_CHANNELS 定数参照 (P27 準拠)
        ↓
[Main Process IPC Handler]
  - validateIpcSender() でウィンドウ検証
  - P42 準拠 3段バリデーション（型 → 空 → トリム）
  - API キーを内部付加（Renderer には非公開）
  - P62 準拠: Provider/Model 未選択時は DEFAULT_CONFIG fallback 禁止
        ↓
[External AI Service]
```

この多層防御は `security-electron-ipc-core.md` の「Renderer 境界での Preload Payload 防御」パターンと整合しており、Section 4 の境界原則（原則2: API key は Main 限定 / 原則4: Provider未選択時エラー返却）とも一致する。

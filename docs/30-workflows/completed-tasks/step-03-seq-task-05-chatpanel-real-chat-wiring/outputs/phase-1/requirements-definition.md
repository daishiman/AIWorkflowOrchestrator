# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| タスクID   | TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 |
| Phase      | 1                                   |
| Phase名    | 要件定義                            |
| 作成日     | 2026-03-18                          |
| ステータス | completed                           |
| 担当Agent  | Agent B (Task 1-4 / 1-5)            |

---

## 機能要件 (FR)

### 概要

ChatPanel の 3 箇所の placeholder（`model-selector-slot` L95 / `message-list-slot` L124 / `chat-input-slot` L141）を実 AI チャット機能に置換するために必要な機能要件。

### FR テーブル

| ID    | 名称                                      | 説明                                                                                                                                                                                                                                             | 受入基準                                                                                                                                                                                                                                                                                                                       | 優先度 |
| ----- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| FR-01 | AI モデルセレクター表示                   | Provider（OpenAI / Anthropic / Google / xAI）と Model を選択する UI を `model-selector-slot` に表示する。選択値は `llmSlice`（`selectedProviderId` / `selectedModelId`）と双方向同期し、`llm:set-selected-config` で Main Process に即時通知する | - LLMSelectorPanel が `model-selector-slot` に描画される<br>- Provider / Model 選択時に `llm:set-selected-config` が invoke される<br>- 未選択状態では送信ボタンが無効化される<br>- `providerId` と `modelId` は必ず同時に設定される（部分設定禁止）                                                                           | P0     |
| FR-02 | メッセージリスト表示                      | user / assistant のメッセージ履歴を `message-list-slot` に表示する。会話開始前は zero state（提案バブル）、メッセージがある場合はロールごとにバブル表示する                                                                                      | - `role="user"` / `role="assistant"` メッセージが時系列順に表示される<br>- zero state では空の場合のみ提案バブルが表示される<br>- メッセージリストは `role="log"` + `aria-live="polite"` を持つ                                                                                                                                | P0     |
| FR-03 | ストリーミング応答表示                    | `llm:stream-chunk` で受け取ったチャンクをリアルタイムに累積表示する。ストリーミング中はパルスアニメーションカーソルを表示し、`aria-busy={isStreaming}` で状態を通知する                                                                          | - chunk 受信のたびに画面が更新される<br>- パルスカーソルがストリーミング中のみ表示される<br>- `aria-busy` が `isStreaming` 状態に連動する<br>- 完了後（`llm:stream-done`）にカーソルが消える                                                                                                                                   | P0     |
| FR-04 | チャット入力・送信                        | `chat-input-slot` にテキスト入力フィールドと送信ボタンを配置する。Enter キー送信をサポートし、ストリーミング中は送信不可にする。送信前に Provider / Model の選択状態を検証する                                                                   | - テキストフィールドが `chat-input-slot` に描画される<br>- Enter キーで送信が実行される（Shift+Enter は改行）<br>- ストリーミング中は送信ボタンが disabled になる<br>- 空文字 / trim 後空文字は送信不可（P42 準拠）                                                                                                            | P0     |
| FR-05 | ストリーミングキャンセル                  | ストリーミング中に中断ボタンまたは Escape キーで `llm:cancel-stream` を送信し、AbortController を abort する。キャンセル後は累積済みコンテンツを保持する                                                                                         | - 中断ボタンが `isStreaming=true` のときのみ表示される<br>- ボタン押下 / Escape キーで `llm.cancelStream()` が呼ばれる<br>- キャンセル後に累積済みテキストが消えずに残る<br>- コンポーネント unmount 時に自動 abort される                                                                                                     | P0     |
| FR-06 | エラー表示・リカバリー誘導                | ストリーミングエラー（`llm:stream-error`）または AI_CHAT エラー時にエラー種別に応じたメッセージを表示する。API key 未設定（`API_KEY_MISSING`）は設定画面誘導、リトライ可能エラーは再試行ボタンを提示する                                         | - `API_KEY_MISSING` / `API_KEY_INVALID` 時に設定画面へのリンクが表示される<br>- `NETWORK_ERROR` / `RATE_LIMIT` 等リトライ可能エラーには再試行ボタンが表示される<br>- エラー表示領域は `role="alert"` を持つ<br>- エラー時に累積済みコンテンツが保持される                                                                      | P0     |
| FR-07 | ランタイムステータス表示（RuntimeBanner） | ChatPanel ヘッダーに Access Capability に基づく RuntimeBanner を表示する。`integratedRuntime` / `both` は API 利用中バッジ、`terminalSurface` は terminal handoff バナー、`none` は blocked バナーを表示する                                     | - RuntimeBanner が ChatPanel ヘッダーに常時表示される<br>- capability 変化に連動してバナーが切り替わる<br>- `role="status"` を持つ                                                                                                                                                                                             | P1     |
| FR-08 | ハンドオフブロック表示（HandoffBlock）    | Access Capability が `terminalSurface` の場合、HandoffBlock を message-list-slot に表示する。`HandoffGuidance`（terminalCommand / contextSummary / reason）を整形表示し、ターミナルを開く導線を提供する                                          | - `terminalSurface` 時に HandoffBlock が表示される<br>- `terminalCommand` がコピー可能なコードブロックで表示される<br>- ターミナルを開くボタン（PersistentTerminalLauncher）が表示される<br>- auto-send / hidden prompt injection を行わない（terminal boundary 遵守）                                                         | P1     |
| FR-09 | 会話永続化                                | 初回送信時に `conversation:create` で会話を作成し、以降の user / assistant メッセージを `conversation:addMessage` で保存する。`conversationId` はセッション内で再利用する                                                                        | - 初回送信で `conversation:create` が呼ばれ `conversationId` が取得される<br>- user メッセージ送信後に `conversation:addMessage(role=user)` が呼ばれる<br>- ストリーミング完了後に `conversation:addMessage(role=assistant)` が呼ばれる<br>- DB 未初期化（`DB_NOT_AVAILABLE`）でも画面表示は継続される（Graceful Degradation） | P1     |
| FR-10 | トランスクリプト来歴表示                  | 既存 `conversationId` がある場合はメッセージ来歴（TranscriptProvenanceLabel）を表示する。会話再開時に `conversation:get` でメッセージ履歴を取得して ChatMessageList に復元する                                                                   | - 既存 conversationId がある場合に `conversation:get` が呼ばれる<br>- 取得した過去メッセージが ChatMessageList に表示される<br>- `TranscriptProvenanceLabel` が来歴情報（取得元・日時）を表示する                                                                                                                              | P2     |

---

## 非機能要件 (NFR)

| ID     | 名称                                                | 説明                                                                                                                                                                                                                                                                                | 基準値                                                                                                                                                                                                                                                          | 検証方法                                                            |
| ------ | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| NFR-01 | アクセシビリティ（WCAG 2.1 AA）                     | ChatPanel 全体が WCAG 2.1 AA 基準を満たす。メッセージリストは `role="log"` + `aria-live="polite"`、ストリーミング領域は `role="status"` + `aria-live="polite"` + `aria-busy`、エラー表示は `role="alert"`、キャンセルボタンは `aria-label="応答をキャンセル"` を持つ                | - コントラスト比 4.5:1 以上（通常テキスト）<br>- 全操作がキーボードで実行可能<br>- スクリーンリーダーでストリーミング更新が通知される                                                                                                                           | `axe-core` 自動検査 + Phase 11 手動確認（スクリーンリーダーテスト） |
| NFR-02 | パフォーマンス（再レンダー最適化）                  | StreamingMessage は `memo` + `forwardRef` で最適化済みであること。Store セレクタは個別セレクタ（P31 / P48 対策）を使用し、chunk 受信時の不要な再レンダーを防ぐ。派生セレクタ（filter / map）には `useShallow` を適用する                                                            | - chunk 受信時に ChatPanel 全体が再レンダーされない<br>- `useShallow` を使わない派生セレクタが存在しない<br>- 合成 Hook（useXxxStore()）の戻り値を useEffect 依存配列に含めない                                                                                 | React DevTools Profiler + Vitest のパフォーマンステスト             |
| NFR-03 | セキュリティ（API key 隔離・IPC 保護）              | API key は Main Process にのみ保持し、Renderer に送信しない（`apiKey:get` は Main-only）。全 IPC ハンドラで `withValidation()` / `validateIpcSender()` による sender 検証を実施する。`contextIsolation: true` + `nodeIntegration: false` + `sandbox: true` を維持する               | - `apiKey:get` / `auth-key:getKey` が Preload 経由で公開されていない<br>- IPC チャンネルはホワイトリスト管理（定数参照）<br>- 全文字列引数に P42 3 段バリデーション（`typeof` → `=== ""` → `.trim() === ""`）を適用<br>- handoff command に secret が含まれない | セキュリティチェックスクリプト + コードレビュー                     |
| NFR-04 | 状態管理（3層分離）                                 | UI state（isStreaming / content / error）は `useStreamingChat` フックで管理、transport state（selectedProviderId / selectedModelId）は `llmSlice` で管理、workspace context state（conversationId / messages）は `useWorkspaceChatController` パターンで管理する。3層を混在させない | - `chatSlice` に UI 一時状態を混在させない<br>- 新規グローバル Slice を追加しない（既存 `llmSlice` / `chatSlice` を再利用）<br>- `isStreamingRef` による ref 同期で race condition を防ぐ                                                                       | Vitest によるスライス境界テスト + typecheck PASS                    |
| NFR-05 | Atomic Design 準拠（atoms / molecules / organisms） | ChatPanel は organism として、ChatMessageList / ComposerInput / RuntimeBanner 等の molecules / atoms を組み合わせて構成する。organisms は store セレクタを直接参照してよいが、molecules / atoms は props 経由のみで状態を受け取る                                                   | - organisms のみ Zustand Store を参照する<br>- molecules / atoms は pure component として props だけで描画できる<br>- コンポーネント分割が Atomic Design の原則に従う                                                                                           | コードレビュー + Storybook（未実装の場合はテスト）                  |

---

## Access Capability 要件

### 4 値定義テーブル

Access Capability は Main Process の `RuntimeResolver` が `authMode` と API key 設定状態から導出する。Renderer は IPC 経由で capability 値を受け取り、表示制御に使用する。

| 値                  | 意味                                     | 導出条件                                                                                                    | ChatPanel 動作                                                                                                  | UI 語彙       | 補足                                                               |
| ------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------ |
| `integratedRuntime` | 統合 API ランタイムのみ利用可能          | `authMode === "api-key"` かつ API key が設定済み（`auth-key:exists` → `exists=true`）かつ terminal 利用不可 | 通常 AI チャット UI（RuntimeBanner: API 利用中 / 送信ボタン有効 / HandoffBlock 非表示）                         | `ready`       | AnthropicLLMAdapter 経由で直接 API 呼び出しが可能                  |
| `terminalSurface`   | ターミナルのみ利用可能                   | `authMode === "subscription"` または API key 未設定（handoff 先のみ）                                       | HandoffBlock 表示（terminalCommand / contextSummary 表示 / PersistentTerminalLauncher 表示 / チャット入力無効） | `unavailable` | auto-send 禁止・hidden prompt injection 禁止・silent fallback 禁止 |
| `both`              | 統合ランタイムとターミナルの両方利用可能 | `authMode === "api-key"` かつ API key 設定済み かつ terminal も利用可能                                     | 通常 AI チャット UI + 切替オプション（RuntimeBanner に terminal handoff ボタンあり）                            | `ready`       | TerminalDock から任意で terminal に切り替え可能                    |
| `none`              | 利用不可                                 | API key 未設定 かつ terminal も利用不可（例: 設定未完了の初回起動）                                         | blocked 表示（エラーガイダンス: 設定画面での API key 登録を誘導）                                               | `blocked`     | 設定画面は AuthGuard バイパスで常時アクセス可能                    |

### Capability → UI 語彙 対応

| capability          | UI 語彙       | 表示テキスト例                   |
| ------------------- | ------------- | -------------------------------- |
| `integratedRuntime` | `ready`       | AI に送信する                    |
| `both`              | `ready`       | AI に送信する（Terminal 切替可） |
| `terminalSurface`   | `unavailable` | Terminal で実行してください      |
| `none`              | `blocked`     | API キーを設定してください       |

### Capability 判定フロー

```
[Main Process: RuntimeResolver]
authMode === "api-key" AND api-key exists
  -> integrated available: true
authMode === "subscription" OR api-key missing
  -> integrated available: false

terminal available: depends on Task02 Phase 2 contract

integrated=true,  terminal=true  -> both
integrated=true,  terminal=false -> integratedRuntime
integrated=false, terminal=true  -> terminalSurface
integrated=false, terminal=false -> none
```

### ChatPanel 状態遷移（Capability 連動）

```
[*] --> Empty
Empty --> Ready:       capability === integratedRuntime | both
Empty --> TerminalOnly: capability === terminalSurface
Empty --> Blocked:     capability === none
Ready --> Streaming:   user sends message
Ready --> TerminalDockOpen: terminal button clicked
Streaming --> Cancelled:  cancel
Streaming --> Completed:  llm:stream-done
Streaming --> Error:      llm:stream-error
Blocked --> Ready:     API key configured (settings redirect)
TerminalOnly --> Ready: API key configured (settings redirect)
```

### Terminal Boundary ルール（必須）

| ルール                       | 内容                                                                                        | 違反時の扱い              |
| ---------------------------- | ------------------------------------------------------------------------------------------- | ------------------------- |
| auto-send 禁止               | Terminal が自動でコマンドを送信してはならない                                               | Critical セキュリティ違反 |
| hidden prompt injection 禁止 | 隠しプロンプトを terminal コマンドに埋め込んではならない                                    | Critical セキュリティ違反 |
| silent fallback 禁止         | capability 不足時に黙って terminal に切り替えてはならない（必ず UI でガイダンスを表示する） | UX 違反                   |

### Auth Key Preflight ルール

| preflight 結果                                                  | UI 動作                                                          |
| --------------------------------------------------------------- | ---------------------------------------------------------------- |
| `auth-key:exists` -> `{ exists: false, source: "not-set" }`     | 送信ボタン無効化 + 「設定画面で API キーを登録してください」表示 |
| `auth-key:exists` -> `{ exists: true, source: "saved" }`        | 通常送信可能                                                     |
| `auth-key:exists` -> `{ exists: true, source: "env-fallback" }` | 通常送信可能（環境変数フォールバック中の旨を表示）               |

---

## 受入基準（AC）と FR / NFR の対応マトリクス

| AC ID | 受入基準                                                                                                                                | 対応 FR / NFR         |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| AC-01 | ChatPanel の `model-selector-slot`（L95）に LLMSelectorPanel が表示され、Provider / Model 選択時に `llm:set-selected-config` が呼ばれる | FR-01                 |
| AC-02 | ChatPanel の `message-list-slot`（L124）に ChatMessageList が表示され、`role="log"` + `aria-live="polite"` を持つ                       | FR-02, NFR-01         |
| AC-03 | ストリーミング中に StreamingMessage のパルスカーソルが表示され、`aria-busy={isStreaming}` が連動する                                    | FR-03, NFR-01, NFR-02 |
| AC-04 | ChatPanel の `chat-input-slot`（L141）に ComposerInput + SendButton が表示され、Enter 送信・空文字拒否が動作する                        | FR-04                 |
| AC-05 | ストリーミング中に中断ボタンが表示され、押下時に `llm.cancelStream()` が呼ばれ累積コンテンツが保持される                                | FR-05                 |
| AC-06 | API_KEY_MISSING エラー時に設定画面誘導リンクが表示され、`role="alert"` を持つ                                                           | FR-06, NFR-01         |
| AC-07 | RuntimeBanner が capability 値に応じて切り替わり、`role="status"` を持つ                                                                | FR-07                 |
| AC-08 | capability === `terminalSurface` 時に HandoffBlock が表示され、terminal boundary ルール（auto-send 禁止等）が守られる                   | FR-08                 |
| AC-09 | 初回送信で `conversation:create` が呼ばれ、user / assistant メッセージが `conversation:addMessage` で保存される                         | FR-09                 |
| AC-10 | 既存 `conversationId` がある場合に `conversation:get` で履歴が復元され、TranscriptProvenanceLabel が表示される                          | FR-10                 |
| AC-11 | API key が Renderer に漏洩せず、IPC sender 検証が全ハンドラで実施される                                                                 | NFR-03                |
| AC-12 | chunk 受信時に ChatPanel 全体が再レンダーされず、`useShallow` が派生セレクタに適用されている                                            | NFR-02                |
| AC-13 | UI state / transport state / workspace context state が混在せず 3 層分離が維持される                                                    | NFR-04                |
| AC-14 | ChatPanel は organism、ChatMessageList / ComposerInput 等は molecules として Atomic Design に従う                                       | NFR-05                |

---

## IPC 契約接続要件

### 接続ポイント一覧

| 接続ポイント                        | IPC チャンネル            | 定数名                                  | 方向             | 要件                                                                                             |
| ----------------------------------- | ------------------------- | --------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------ |
| AI チャット送信（非ストリーミング） | `AI_CHAT`                 | `IPC_CHANNELS.AI_CHAT`                  | Renderer -> Main | AIChatRequest に providerId / modelId 明示 or selected config を使用。P42 3 段バリデーション必須 |
| ストリーミング開始                  | `llm:stream-chat`         | `IPC_CHANNELS.LLM_STREAM_CHAT`          | Renderer -> Main | LLMChatRequestInput（providerId, modelId, messages[], stream: true）。Zod バリデーション適用     |
| ストリーミングチャンク受信          | `llm:stream-chunk`        | `LLM_STREAM_CHUNK`                      | Main -> Renderer | StreamChunk（type: content / error / done）                                                      |
| ストリーミング完了                  | `llm:stream-done`         | `LLM_STREAM_END`                        | Main -> Renderer | requestId で紐付け                                                                               |
| ストリーミングキャンセル            | `llm:cancel-stream`       | `IPC_CHANNELS.LLM_STREAM_CANCEL`        | Renderer -> Main | AbortController と連携                                                                           |
| Selected Config 同期                | `llm:set-selected-config` | `IPC_CHANNELS.LLM_SET_SELECTED_CONFIG`  | Renderer -> Main | providerId + modelId の同時設定（部分設定禁止 / GAP-03 準拠）                                    |
| 会話作成                            | `conversation:create`     | `IPC_CHANNELS.CONVERSATION_CREATE`      | Renderer -> Main | `{ userId, title }` -> Conversation                                                              |
| メッセージ保存                      | `conversation:addMessage` | `IPC_CHANNELS.CONVERSATION_ADD_MESSAGE` | Renderer -> Main | `{ sessionId, message: { role, content } }` -> Message                                           |
| Auth Key 確認（preflight）          | `auth-key:exists`         | `IPC_CHANNELS.AUTH_KEY_EXISTS`          | Renderer -> Main | `{ exists: boolean, source? }` を取得して送信可否判定                                            |

### Provider / Model 解決順（GAP-03 準拠）

| 優先度 | 条件                                             | 解決方法                                                              |
| ------ | ------------------------------------------------ | --------------------------------------------------------------------- |
| 1      | AIChatRequest に providerId + modelId が両方存在 | リクエスト値を使用                                                    |
| 2      | リクエストに provider / model なし               | Main Process 保存の selected config（`getSelectedLLMConfig()`）を使用 |
| 3      | 両方未設定                                       | エラー返却（LLM 未選択エラー）— DEFAULT_CONFIG への暗黙 fallback 禁止 |

---

## 依存タスク Handoff 要件

| 依存タスク                                      | 提供契約                                                                                                                             | ChatPanel 側の前提条件                                                            |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| Task02 Phase 2（Claude Code Terminal Surface）  | HandoffGuidance 型（terminalCommand / contextSummary / reason）の定義、PersistentTerminalLauncher コンポーネントの設計               | HandoffBlock の実装前に Task02 Phase 2 の設計が完了していること                   |
| Task06 Phase 2（Main Chat/Settings AI Runtime） | access capability card（integratedRuntime / terminalSurface / both / none）の IPC 契約、LLMSelectorPanel の selected config 同期仕様 | RuntimeBanner / LLMSelectorPanel 接続前に Task06 Phase 2 の設計が完了していること |

---

## 変更履歴

| バージョン | 日付       | 変更内容                                                          |
| ---------- | ---------- | ----------------------------------------------------------------- |
| v1.0.0     | 2026-03-18 | 初版作成（Task 1-4 FR/NFR 分類、Task 1-5 Access Capability 要件） |

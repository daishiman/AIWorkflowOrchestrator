# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 2                                            |
| Phase名    | 設計                                         |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001 |
| 前提Phase  | Phase 1（要件定義）                          |
| 後続Phase  | Phase 3（設計レビュー）                      |
| ステータス | not_started                                  |
| 作成日     | 2026-03-13                                   |
| 更新日     | 2026-03-17                                   |
| 機能名     | workspace-chat-panel-runtime-alignment       |

## 目的

Workspace Chat Panel の authority と handoff 境界を確定し、streaming / file context / conversation / terminal transcript の各責務を IPC 契約・state 管理・UI 状態遷移の粒度で設計する。

## 実行タスク

### T2-1: authority 設計

以下の各関心について、最終判定主体を `Main Process` / `Renderer (Zustand Store)` / `IPC 境界` に配置する。

| 関心              | 最終判定主体 | 判定ロジック配置先                          | 根拠                                                    |
| ----------------- | ------------ | ------------------------------------------- | ------------------------------------------------------- |
| access capability | Main Process | Task01 の AccessCapabilityResolver          | local 判定禁止（design-audit-matrix.md）                |
| selected config   | Main Process | `llm:stream-chat` handler 内の config 解決  | P62 対策: DEFAULT_CONFIG fallback 禁止                  |
| streaming         | Main Process | LLMAdapter.streamChat + AbortController     | Renderer は chunk 受信と表示のみ                        |
| file context      | Renderer     | useWorkspaceChatController.buildFileContext | file read は electronAPI.file.read 経由だが組立は local |
| conversation      | Main Process | conversationRepository                      | Renderer 直アクセス禁止                                 |
| mention           | Renderer     | useWorkspaceMentionQuery                    | UI 入力解析は Renderer 責務                             |
| cancel            | Main Process | activeStreams Map + AbortController.abort() | cancel 判定は stream 所有者が行う                       |

**DI 境界の型配置判断**（phase-template-core.md / P61 対策）:

| 境界                              | 型配置先                                         | 判断根拠                                                |
| --------------------------------- | ------------------------------------------------ | ------------------------------------------------------- |
| `llm:stream-chat` ハンドラ        | `LLMPort` インターフェース（`main/ports/` 配下） | 具象クラス（LLMAdapter）を IPC ハンドラが直接参照しない |
| `conversation:create` ハンドラ    | `ConversationRepositoryPort` インターフェース    | 具象クラス（conversationRepository）と分離              |
| AccessCapabilityResolver          | `AccessCapabilityPort` インターフェース          | Task01 と本タスクが同一 Port を参照し結合しない         |
| AccessCapabilityResolver の結果型 | `packages/shared/src/` 配下                      | Renderer の Zustand Store と Main Process が両参照      |

### T2-2: IPC 契約設計

各 IPC チャンネルの引数型・戻り値型・エラー型を定義する。

**IPC レスポンス形式の統一方針**（P60 対策）:

- `llm:stream-chat` / `llm:cancel-stream`: 直接値返却（ストリーミング開始確認は `requestId`、エラーはイベント経由）
- `conversation:create` / `conversation:addMessage`: `{ success, data?, error? }` ラッパー形式（CRUD 操作のため）

#### `llm:stream-chat`

```typescript
// 引数
interface StreamChatRequest {
  modelId: string; // 必須: P62 対策で fallback 禁止。null/undefined は VALIDATION_ERROR
  providerId: LLMProviderId; // 必須: P62 対策で省略不可。Main Process での fallback 禁止
  temperature: number;
  stream: true;
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
}

// 戻り値（直接値返却: ストリーミング開始を確認するのみ）
// { success: false, error } ラッパーは使わず、引数バリデーション失敗時は throw する
interface StreamChatResponse {
  requestId: string; // cancel 用の一意識別子
}

// エラー（IPC_CHANNELS.LLM_STREAM_ERROR 経由のイベント）
interface StreamError {
  code:
    | "VALIDATION_ERROR"
    | "API_KEY_MISSING"
    | "MODEL_NOT_FOUND"
    | "NETWORK_ERROR";
  message: string;
  retryable: boolean;
}
```

#### `llm:cancel-stream`

```typescript
// 引数
interface CancelStreamRequest {
  requestId: string;
}

// 戻り値
interface CancelStreamResponse {
  success: boolean;
}
```

#### `conversation:create`

```typescript
// 引数
interface ConversationCreateRequest {
  userId: string;
  title: string;
}

// 戻り値
interface ConversationCreateResponse {
  success: boolean;
  data?: { id: string };
  error?: { message: string };
}
```

#### `conversation:addMessage`

```typescript
// 引数
interface ConversationAddMessageRequest {
  sessionId: string;
  message: { role: "user" | "assistant"; content: string };
}

// 戻り値
interface ConversationAddMessageResponse {
  success: boolean;
  error?: { message: string };
}
```

### T2-3: state 管理設計

useWorkspaceChatController の state を Zustand slice へ移行するか local state のまま残すかの判断基準を定義する。

| state              | 配置先                | 判断理由                                                     |
| ------------------ | --------------------- | ------------------------------------------------------------ |
| messages           | local useState        | WorkspaceChatPanel 固有であり他 surface と共有しない         |
| conversationId     | local useState        | panel インスタンスに紐付く一時的な識別子                     |
| input / cursorPos  | local useState        | composer UI 固有の入力状態                                   |
| isSending          | local useState        | 送信中フラグは panel 内部の UX 制御のみ                      |
| isStreaming        | local useState        | streaming 表示は panel 内部の UX 制御のみ                    |
| streamContent      | local useState        | 受信中の chunk 蓄積は panel 固有                             |
| errorMessage       | local useState        | panel 固有のエラー表示                                       |
| selectedFiles      | Zustand Store         | 既に useSelectedFiles として Store に配置済み（維持）        |
| selectedProviderId | Zustand Store         | 既に useAppStore 経由で取得済み（維持）                      |
| selectedModelId    | Zustand Store         | 既に useAppStore 経由で取得済み（維持）                      |
| accessCapability   | Zustand Store（新規） | Task01 の AccessCapabilityResolver の結果を Store で共有する |

**判断基準**: panel インスタンス固有の UI state は local、複数 surface が参照する状態は Zustand Store。

### T2-4: flow 設計

mention / file attach / stream / cancel / conversation 保存 の順序をシーケンスレベルで定義する。

#### メッセージ送信フロー

```
1. Renderer: input.trim() が空でないか検証
2. Renderer: isSending=true, messages に userMessage 追加
3. Renderer: ensureConversation() -> Main: conversation:create (初回のみ)
4. Main: conversationRepository.create() -> conversationId 返却
5. Renderer: conversationAPI.addMessage(sessionId, userMessage) -> Main: conversation:addMessage
6. Main: conversationRepository.addMessage()
7. Renderer: buildFileContextBlock(selectedFiles) -> file.read x N
8. Renderer: buildChatRequest(input, contextBlock, selectedModelId, selectedProviderId)
   - P62 対策: selectedModelId が null の場合は送信しない（fallback 禁止）
9. Renderer: electronAPI.llm.streamChat(request) -> Main: llm:stream-chat
10. Main: API key 検証 -> adapter.streamChat() -> chunk 送信開始
11. Renderer: onStreamChunk -> streamContent 蓄積・表示
12. Main: stream 完了 -> LLM_STREAM_END 送信
13. Renderer: onStreamEnd -> assistantMessage 作成・messages 追加
14. Renderer: persistAssistantMessage() -> Main: conversation:addMessage
```

#### mention フロー

```
1. Renderer: input に '@' 検出 -> useWorkspaceMentionQuery 発火
2. Renderer: mentionCandidates（folderFileTrees から flattenFiles で生成）をフィルタ
3. Renderer: ユーザーが候補を選択 -> insertMention()
4. Renderer: input に @filename を挿入、cursorPosition 更新
5. Renderer: attachContextFile(candidate.path) -> electronAPI.file.read
6. Renderer: addFiles() で selectedFiles へ追加
7. Renderer: onOpenPreviewFromMention() でプレビュー表示
```

#### file attach フロー

```
1. Renderer: selectedFilePath が存在する状態で attachSelectedFile()
2. Renderer: onAttachSelectedFile(selectedFilePath) -> electronAPI.file.read
3. Renderer: file metadata 取得成功 -> createSelectedFile -> addFiles()
4. Renderer: file context chips に表示
```

#### cancel フロー

```
1. Renderer: cancelStream() -> electronAPI.llm.cancelStream(requestId)
2. Main: activeStreams.get(requestId).abort() -> stream 中断
3. Renderer: isStreaming=false, streamContent=""
```

### T2-5: error policy 設計

| エラー種別               | 分類      | 表示方針                                                      | 回復導線                     |
| ------------------------ | --------- | ------------------------------------------------------------- | ---------------------------- |
| file read failure        | fail-fast | 「背景情報の読み込みに失敗しました: {path}」を errorMessage   | ファイルを除外して再送信可能 |
| stream failure (NETWORK) | guidance  | 「AI応答に失敗しました: {message}」を errorMessage            | 再送信ボタン表示             |
| API_KEY_MISSING          | guidance  | 「APIキーが未設定です」+ 設定画面への導線                     | Settings へ遷移              |
| MODEL_NOT_FOUND          | fail-fast | 「モデルが見つかりません」を errorMessage                     | モデル再選択を促す           |
| 未対応 capability        | guidance  | GuidanceBlock で「この操作は terminal で実行してください」    | terminal handoff ボタン      |
| cancel 時                | silent    | エラー表示なし、streamContent クリア                          | 再入力可能状態に戻る         |
| conversation create fail | fail-fast | 「会話作成に失敗しました」を errorMessage                     | 再送信で自動リトライ         |
| conversation addMsg fail | guidance  | 「メッセージ保存に失敗しました」を errorMessage（送信は続行） | 手動保存リトライ不要         |
| selectedModelId が null  | blocked   | Composer を非活性化し「モデルを選択してください」表示         | LLMSelectorPanel への導線    |

**原則**: fail-fast は即時エラー表示で操作を停止する。guidance は次のアクションを同じ領域に表示する。silent は UI 状態のみリセットする。

### T2-6: transcript 受け取り設計

terminal transcript の手動共有を context chips / composer attachment として受け取る契約を定義する。

| 項目                   | 定義                                                                           |
| ---------------------- | ------------------------------------------------------------------------------ |
| source                 | Terminal Dock の transcript からユーザーが選択した範囲、直近出力、session 全体 |
| destination            | WorkspaceChatPanel の composer attachment area                                 |
| 共有操作               | 「選択範囲をチャットへ送る」「直近出力を添付」「セッションを貼り付ける」       |
| 表示                   | transcript provenance chip（file context chip と区別）                         |
| provenance chip ラベル | 「Terminal transcript から添付」                                               |
| provenance chip 色     | file context chip とは異なる色系統（terminal 起点であることを視覚区別）        |
| 禁止事項               | transcript を自動で chat message 化しない                                      |
| 禁止事項               | chat 入力を自動で terminal へ返送しない                                        |
| 禁止事項               | hidden parsing / silent summarization を行わない                               |
| セキュリティ           | 共有前に内容が見える状態を保つ                                                 |

### T2-7: compact UX 設計

narrow width でのレイアウト崩れ防止策を定義する。

| 観点                   | compact 幅ルール                                                       |
| ---------------------- | ---------------------------------------------------------------------- |
| breakpoint             | panel 幅 360px 以下を compact と判定する                               |
| file context chips     | 横スクロール可能な1行表示に切り替え、チップ省略表示（+N more）         |
| composer actions       | アイコンのみ表示にし、ラベルを非表示にする                             |
| message log            | 最大幅制限を解除し、padding を縮小する                                 |
| guidance block         | 折りたたみ可能にし、summary 1行 + expand で詳細表示                    |
| terminal button        | panel header に固定で残す（compact でも非表示にしない）                |
| suggestion bubbles     | 1列縦並びに切り替える                                                  |
| keyboard accessibility | compact 幅でも Tab で chips / composer actions / send に到達可能を保証 |

## 設計方針

### streaming と file context は別責務として扱う

streaming は Main Process の LLMAdapter が所有する非同期チャンク送信の責務であり、file context は Renderer が selectedFiles から組み立てるプロンプト構築の責務である。両者を混在させると、file read failure が streaming 障害と誤認される。streaming の開始判定に file context の成否を含めない。file context の組立失敗は fail-fast でエラー表示し、streaming は開始しない。

### workspace 文脈の組み立ては access capability 判定に依存させない

file context の組立（buildFileContextBlock）は、access capability の結果に関わらず同じロジックで動作する。access capability が `guidance-only` の場合でも file context は組み立て可能であり、terminal handoff 時の context summary として再利用できる。capability 判定と文脈組立を結合させると、terminal handoff 時に文脈が失われる。

### terminal surface は別 capability として扱い、launcher / guidance を返す

Workspace Chat Panel は terminal を直接操作しない。terminal が必要な場合は Handoff Card を表示し、context summary と suggested command を提示する。terminal dock の開閉は PersistentTerminalLauncher 経由で行い、panel 内部から terminal session を直接操作する経路を作らない。

### selected config authority は Main Process の `llm:stream-chat` handler が持つ（P62 対策）

Renderer が `selectedModelId` / `selectedProviderId` を request に含めるが、Main Process の handler がそれらの値を検証し、未設定の場合は DEFAULT_CONFIG への暗黙 fallback を行わず `VALIDATION_ERROR` を返す。Renderer 側でも `selectedModelId === null` の場合は送信ボタンを非活性化する二重防御を行う。

### conversation 永続化は Main Process の conversationRepository 経由（Renderer 直アクセス禁止）

conversation の create / addMessage / load は全て IPC 経由で Main Process に委譲する。Renderer が SQLite や file system に直接アクセスする経路を作らない。これは Electron の 3 プロセスモデル（04-electron-security.md）に準拠する。

## Agent Team / SubAgent 分担

| 役割               | 主担当                                                     |
| ------------------ | ---------------------------------------------------------- |
| Streaming Agent    | `llm:stream-chat` / cancel / chunk 表示の契約を整理する    |
| Context Agent      | selected files / mention / file context handoff を整理する |
| Conversation Agent | conversation 保存と state handoff の契約を整理する         |

## 参照資料

| 参照資料                   | パス                                                                                | 内容                                                                     |
| -------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Phase 1（要件定義）        | `phase-1-requirements.md`                                                           | 依存する前提成果物を確認する                                             |
| Phase 1 成果物: 要件整理   | `outputs/phase-1/requirements-definition.md`                                        | 要件、制約、受入基準を確認する                                           |
| Phase 1 成果物: スコープ   | `outputs/phase-1/scope-definition.md`                                               | 対象範囲と除外範囲を確認する                                             |
| pack parent index          | `docs/30-workflows/ai-runtime-authmode-unification/index.md`                        | 実行順序、依存グラフ、共通方針の正本を確認する                           |
| pack design audit          | `docs/30-workflows/ai-runtime-authmode-unification/design-audit-matrix.md`          | 多角的監査の結論、禁止事項、依存整合を確認する                           |
| pack UI/UX 正本            | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md`            | Workspace Chat Panel の zero / streaming / guidance / compact を確認する |
| pack UI/UX 図解            | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-diagrams.md`               | 5図セットの画面構成、状態遷移、CTA 導線を確認する                        |
| useWorkspaceChatController | `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts` | stream / selected config / file context handoff を確認する               |
| llm handlers               | `apps/desktop/src/main/handlers/llm.ts`                                             | `llm:stream-chat` / cancel / selected config authority を確認する        |
| WorkspaceView              | `apps/desktop/src/renderer/views/WorkspaceView/index.tsx`                           | panel 統合位置と file preview 連携を確認する                             |
| WorkspaceChatPanel         | `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`              | panel UI 構造と5領域構成を確認する                                       |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                 | パス                                                                            | 内容                                                                                           |
| ------------------------ | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| interfaces-llm           | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`           | workspace chat と conversation の正本                                                          |
| llm-streaming            | `.claude/skills/aiworkflow-requirements/references/llm-streaming.md`            | stream chat / cancel 契約の正本                                                                |
| ui-ux-feature-components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | Workspace Chat Panel UI の正本                                                                 |
| ui-ux-navigation         | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`         | workspace 導線の正本                                                                           |
| arch-state-management    | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`    | selected files / state handoff の正本                                                          |
| error-handling           | `.claude/skills/aiworkflow-requirements/references/error-handling.md`           | fail-fast / guidance / silent / blocked の error category 設計根拠（T2-5 error policy の正本） |
| security-electron-ipc    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`    | IPC sender 検証 / path traversal 防止 / error masking の設計要件（T2-1 authority 設計の根拠）  |

## UI/UX リアライズ

### 5 領域構成

| 領域               | 責務                                                                  | 含むコンポーネント                                   |
| ------------------ | --------------------------------------------------------------------- | ---------------------------------------------------- |
| panel header       | タイトル表示、capability 状態、Terminal ボタン                        | WorkspaceChatHeader, PersistentTerminalLauncher      |
| file context chips | 選択ファイルと transcript provenance の表示・削除                     | WorkspaceFileContextChips, TranscriptProvenanceChip  |
| message log        | user / assistant メッセージの時系列表示、streaming 中間表示           | WorkspaceChatMessageList, StreamingMessage           |
| composer           | テキスト入力、mention 候補、送信、file add、terminal handoff          | WorkspaceChatInput, MentionDropdown, ComposerActions |
| guidance block     | error guidance、blocked 説明、terminal handoff card、compact fallback | GuidanceBlock, HandoffCard, CompactGuidanceBlock     |

### 状態遷移テーブル

| 現在状態  | トリガー                      | 遷移先    | 条件                                                  |
| --------- | ----------------------------- | --------- | ----------------------------------------------------- |
| zero      | context prepared（file 選択） | ready     | selectedFiles.length > 0 または input.length > 0      |
| zero      | input 入力                    | ready     | input.trim().length > 0                               |
| ready     | send ボタン押下               | streaming | selectedModelId !== null かつ input.trim().length > 0 |
| ready     | terminal button 押下          | handoff   | access capability が terminal-handoff の場合          |
| ready     | panel 幅 <= 360px             | compact   | ResizeObserver で幅を監視                             |
| streaming | cancel ボタン押下             | cancelled | streamRequestId が存在する                            |
| streaming | stream 完了                   | ready     | onStreamEnd 受信                                      |
| streaming | stream エラー                 | guidance  | onStreamError 受信                                    |
| cancelled | （自動遷移）                  | ready     | cancel 処理完了後                                     |
| guidance  | 回復操作                      | ready     | エラー解消後                                          |
| compact   | panel 幅 > 360px              | ready     | ResizeObserver で幅を監視                             |

### CTA 活性/非活性条件テーブル

| CTA               | 活性条件                                                                                | 非活性条件                                   |
| ----------------- | --------------------------------------------------------------------------------------- | -------------------------------------------- |
| 送信する          | input.trim().length > 0 かつ !isSending かつ !isStreaming かつ selectedModelId !== null | 上記いずれかが false                         |
| キャンセル        | isStreaming === true                                                                    | isStreaming === false                        |
| ファイルを追加    | selectedFilePath !== null かつ !isStreaming                                             | selectedFilePath === null または isStreaming |
| mention を開く    | !isStreaming                                                                            | isStreaming === true                         |
| terminal で続ける | access capability が terminal-handoff または terminal-only                              | capability が integrated-api                 |
| Terminal ボタン   | 常時活性                                                                                | なし（compact 含め常時表示）                 |

### マイクロコピー定義

| 状態        | 表示テキスト                                                                     |
| ----------- | -------------------------------------------------------------------------------- |
| zero        | 「最初の質問を選ぶか、そのまま入力して始めてください。」+ suggestion bubbles     |
| streaming   | streaming indicator + 「応答を生成中...」（cancel ボタン併設）                   |
| cancel      | （テキスト表示なし、ready 状態に戻る）                                           |
| guidance    | エラー種別に応じた具体的メッセージ + 次アクションボタン                          |
| blocked     | 「この操作は terminal で実行してください。ワークスペースの文脈は保持されます。」 |
| compact     | chips と composer action のラベル省略、guidance は折りたたみ summary 表示        |
| model未選択 | 「モデルを選択してください」+ Settings への導線リンク                            |

### compact 幅レイアウトルール

| コンポーネント     | 通常幅              | compact 幅 (<=360px)              |
| ------------------ | ------------------- | --------------------------------- |
| file context chips | 横並び表示          | 横スクロール1行 + 「+N more」省略 |
| composer actions   | アイコン + ラベル   | アイコンのみ                      |
| suggestion bubbles | 横並び表示          | 縦1列                             |
| message log        | padding: 20px       | padding: 12px                     |
| guidance block     | 展開表示            | 折りたたみ summary + expand       |
| terminal button    | ラベル付き          | アイコンのみ（非表示にしない）    |
| panel header       | title + description | title のみ（description 非表示）  |

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断                    | 仕様参照先                                             |
| -------------------------- | --------------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | UI/React実装の場合          | `aiworkflow-requirements: ui-ux-*.md`                  |
| バックエンド（Main）       | サービス/ロジック実装の場合 | `aiworkflow-requirements: architecture-*.md`           |
| IPC通信                    | Main-Renderer連携の場合     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| Preload/セキュリティ       | API公開の場合               | `aiworkflow-requirements: security-api-electron.md`    |
| ローカルストレージ         | データ永続化の場合          | `aiworkflow-requirements: database-*.md`               |

### UI/UX

- WorkspaceChatPanel の 5 領域（panel header / file context chips / message log / composer / guidance block）が独立した責務を持つ
- zero / streaming / cancel / guidance / compact の各状態で表示内容が明確に定義されている
- CTA の活性/非活性条件が全状態で矛盾しない
- compact 幅でも keyboard 操作で全 CTA に到達可能

### アーキテクチャ

- streaming は Main Process、context 組立は Renderer、conversation 永続化は Main Process に配置されている
- Renderer -> Preload (contextBridge) -> Main の一方向依存を守っている
- file context と streaming が別責務として扱われている

### API 設計

- `llm:stream-chat` / `llm:cancel-stream` / `conversation:create` / `conversation:addMessage` の引数型・戻り値型が定義されている
- エラー型が code / message / retryable の構造を持つ
- P42 準拠で文字列引数に .trim() バリデーションが含まれている

### セキュリティ

- file context の path traversal 防止: electronAPI.file.read が Main Process でパス検証する
- conversation データは Main Process の repository 経由のみアクセス可能
- transcript 共有はユーザーの明示操作に限定（hidden parsing / silent summarization 禁止）
- streaming chunk の sender 検証: safeSend で isDestroyed() チェック

### エラーハンドリング

- fail-fast（即時停止）: file read failure, MODEL_NOT_FOUND, conversation create failure
- guidance（次アクション提示）: API_KEY_MISSING, NETWORK_ERROR, 未対応 capability
- silent（UI リセットのみ）: cancel
- blocked（送信不可）: selectedModelId が null

## 統合テスト連携

| 契約対象          | 検証観点                                                 | テスト種別         |
| ----------------- | -------------------------------------------------------- | ------------------ |
| stream            | chunk 受信 -> streamContent 蓄積 -> message 追加         | unit + integration |
| cancel            | requestId 指定 -> AbortController.abort() -> state reset | unit               |
| selected files    | addFiles -> buildFileContextBlock -> request body 組立   | unit               |
| mention           | '@' 入力 -> 候補フィルタ -> 選択 -> attachContextFile    | unit               |
| conversation      | create -> addMessage(user) -> addMessage(assistant)      | integration        |
| access capability | capability resolve -> CTA 活性/非活性 -> guidance 表示   | integration        |
| selected config   | selectedModelId null -> 送信非活性 / P62 fallback 禁止   | unit               |
| compact UX        | panel 幅変化 -> layout 切替 -> keyboard 到達性           | visual + a11y      |
| transcript share  | 手動共有 -> provenance chip 表示 -> 自動共有禁止         | integration        |

## 実行手順

### ステップ1: Phase 1 成果物の確認

`outputs/phase-1/requirements-definition.md` と `outputs/phase-1/scope-definition.md` を読み、要件・制約・受入基準・対象範囲を確認する。Phase 1 で列挙された authority と gap が本 Phase の設計対象と一致することを検証する。

### ステップ2: ソースコード確認

`useWorkspaceChatController.ts` の現行 state 管理（useState 14個、useRef 4個、useEffect 4個）を読み、T2-3 の判断材料を収集する。`llm.ts` の handleStreamChat / handleStreamCancel の引数形式と戻り値形式を確認し、T2-2 の IPC 契約と一致することを検証する。

### ステップ3: 設計タスク T2-1 ~ T2-7 を順次実施

T2-1（authority）-> T2-2（IPC 契約）-> T2-3（state 管理）-> T2-4（flow）-> T2-5（error policy）-> T2-6（transcript）-> T2-7（compact UX）の順序で設計し、成果物に反映する。各タスクの設計結果が前のタスクと矛盾しないことを逐次確認する。

### ステップ4: system spec との整合確認

aiworkflow-requirements の正本（interfaces-llm.md, llm-streaming.md, ui-ux-feature-components.md, arch-state-management.md）と照合し、契約、UI、security、state のズレを残さない。

### ステップ5: 成果物と完了条件の確認

成果物パス、完了条件、次の Phase への handoff を確認して記録する。全ての完了条件のチェックボックスが true になることを検証する。

## 成果物

| 成果物                  | パス                                           | 内容                                                      |
| ----------------------- | ---------------------------------------------- | --------------------------------------------------------- |
| 設計サマリー            | `outputs/phase-2/design-summary.md`            | 責務境界、依存関係、接続順序を整理する                    |
| 契約一覧                | `outputs/phase-2/contract-matrix.md`           | IPC、state、runtime 契約を一覧化する                      |
| UI/UX 実体化            | `outputs/phase-2/ui-ux-realization.md`         | zero state、context chips、streaming、guidance を整理する |
| transcript 受け取り設計 | `outputs/phase-2/transcript-ingestion-flow.md` | transcript provenance chip と composer 反映を整理する     |
| state 管理設計          | `outputs/phase-2/state-management-design.md`   | state 配置判断と Zustand / local の境界を整理する         |
| IPC 契約設計            | `outputs/phase-2/ipc-contract-design.md`       | IPC チャンネルの型定義と error code を整理する            |

## 完了条件

- [ ] streaming / context / conversation の authority 境界が明文化されている
- [ ] terminal handoff guidance 条件と fail-fast 条件が説明されている
- [ ] zero / streaming / compact / guidance の UI 状態が定義されている
- [ ] terminal transcript の手動共有と provenance chip 表示が定義されている
- [ ] IPC 契約（llm:stream-chat / cancel / conversation）の型定義が含まれている
- [ ] P62 対策（DEFAULT_CONFIG fallback 禁止）が設計に反映されている
- [ ] compact 幅でのレイアウトルールが定義されている
- [ ] state 管理の Zustand / local 判断基準が明文化されている
- [ ] CTA の活性/非活性条件テーブルが全状態で矛盾しない
- [ ] マイクロコピーが全状態（zero / streaming / cancel / guidance / blocked / compact / model未選択）で定義されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

| サブタスク | 内容                    | 依存         | ステータス  |
| ---------- | ----------------------- | ------------ | ----------- |
| T2-1       | authority 設計          | Phase 1 完了 | not_started |
| T2-2       | IPC 契約設計            | T2-1         | not_started |
| T2-3       | state 管理設計          | T2-1         | not_started |
| T2-4       | flow 設計               | T2-1, T2-2   | not_started |
| T2-5       | error policy 設計       | T2-2, T2-4   | not_started |
| T2-6       | transcript 受け取り設計 | T2-1         | not_started |
| T2-7       | compact UX 設計         | T2-3         | not_started |

## タスク 100% 実行確認【必須】

- [ ] T2-1 ~ T2-7 の全サブタスクが完了している
- [ ] 成果物 6 ファイルの全てが作成されている
- [ ] 完了条件の全チェックボックスが true である
- [ ] system spec との整合確認が完了している
- [ ] 多角的チェック観点の全項目が確認されている

## 設計書分割判断

phase-template-core.md の「concern 数による設計書分割基準」より:

| concern 数              | 本設計書の状況                      | 判断                                                                                                                                                                                                                    |
| ----------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T2-1〜T2-7 の 7 concern | 単一 `phase-2-design.md` に全て記述 | **意図的な単一ファイル維持**: 各 concern の行数が100行未満であり、分割するとPhase 3 レビューでの cross-concern 参照コストが増大するため。Phase 10 最終レビューで追加コストが生じた場合は concern 分割を未タスク化する。 |

## 次のPhase

- [Phase 3（設計レビュー）](./phase-3-design-review.md) に進む

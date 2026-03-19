# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                                          |
| ---------- | ------------------------------------------------------------- |
| Phase      | 4                                                             |
| Phase名    | テスト作成                                                    |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001                  |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）、Phase 3（設計レビュー） |
| 後続Phase  | Phase 5（実装）                                               |
| ステータス | not_started                                                   |
| 作成日     | 2026-03-13                                                    |
| 更新日     | 2026-03-17                                                    |
| 機能名     | workspace-chat-panel-runtime-alignment                        |

## 目的

Phase 2 設計の authority 境界・IPC 契約・state 管理・error policy に基づき、streaming / mention / file context / conversation / fail-fast / access capability の回帰テスト仕様を TDD で作成する。

## 実行タスク

### T4-1: テスト観点整理

Phase 2 の T2-1（authority）、T2-2（IPC 契約）、T2-5（error policy）から、テスト対象の関心と層を整理する。

### T4-2: Renderer 層テストケース作成

useWorkspaceChatController の state 遷移・callback 動作をテストする。

### T4-3: Main 層テストケース作成

llm handlers の stream / cancel / error 応答をテストする。

### T4-4: IPC 統合テストケース作成

Renderer -> Preload -> Main の契約一致を検証する。

### T4-5: UI コンポーネントテストケース作成

WorkspaceChatPanel の表示状態・CTA 活性/非活性をテストする。

## テストマトリクス

### Renderer 層: useWorkspaceChatController

| ID   | テストケース                                     | 検証対象                 | 期待結果                                             | 分類    |
| ---- | ------------------------------------------------ | ------------------------ | ---------------------------------------------------- | ------- |
| R-01 | 初期状態で messages が空配列                     | 初期 state               | messages=[], input="", isStreaming=false             | 正常系  |
| R-02 | input 入力で state 更新                          | setInputValue            | input と cursorPosition が更新される                 | 正常系  |
| R-03 | suggestion 選択で input 反映                     | applySuggestion          | input=選択テキスト, pendingCursorPosition=テキスト長 | 正常系  |
| R-04 | sendMessage で user message 追加                 | sendMessage              | messages に userMessage 追加、input クリア           | 正常系  |
| R-05 | sendMessage で streaming 開始                    | sendMessage              | isStreaming=true, isSending=true -> false            | 正常系  |
| R-06 | onStreamChunk で streamContent 蓄積              | stream chunk listener    | streamContent に delta 追加                          | 正常系  |
| R-07 | onStreamEnd で assistant message 追加            | stream end listener      | messages に assistantMessage 追加、isStreaming=false | 正常系  |
| R-08 | cancelStream で streaming 中断                   | cancelStream             | isStreaming=false, streamContent=""                  | 正常系  |
| R-09 | 空入力で sendMessage が no-op                    | sendMessage guard        | messages 変化なし                                    | 境界値  |
| R-10 | isSending 中に sendMessage が no-op              | 二重送信防止             | 2回目の sendMessage が無視される                     | 境界値  |
| R-11 | isStreaming 中に sendMessage が no-op            | streaming 中送信防止     | sendMessage が無視される                             | 境界値  |
| R-12 | file read failure で errorMessage 設定           | attachContextFile        | errorMessage に失敗パスが含まれる                    | 異常系  |
| R-13 | stream error で errorMessage 設定                | onStreamError listener   | errorMessage="AI応答に失敗しました: {message}"       | 異常系  |
| R-14 | conversation create failure で errorMessage 設定 | ensureConversation       | errorMessage に失敗メッセージが含まれる              | 異常系  |
| R-15 | mention '@' 入力で候補表示                       | useWorkspaceMentionQuery | mention.isOpen=true, mention.options に候補          | 正常系  |
| R-16 | mention 候補選択で file attach                   | insertMention            | selectedFiles に候補ファイル追加                     | 正常系  |
| R-17 | mention 範囲外で候補非表示                       | useWorkspaceMentionQuery | mention.isOpen=false                                 | 境界値  |
| R-18 | attachSelectedFile で file 追加                  | attachSelectedFile       | selectedFiles に追加、errorMessage=null              | 正常系  |
| R-19 | selectedModelId=null で sendMessage が実行不可   | P62 対策                 | sendMessage 呼出前に guard（送信ボタン非活性）       | 異常系  |
| R-20 | unmount 時に active stream を cancel             | cleanup effect           | cancelStream が呼ばれる                              | cleanup |
| R-21 | conversation addMessage failure で errorMessage  | persistAssistantMessage  | errorMessage に保存失敗メッセージが含まれる          | 異常系  |
| R-22 | handleComposerKeyDown Enter で sendMessage 呼出  | keyboard handler         | sendMessage が呼ばれる                               | 正常系  |
| R-23 | handleComposerKeyDown Shift+Enter で改行         | keyboard handler         | sendMessage が呼ばれない                             | 境界値  |
| R-24 | handleComposerKeyDown ArrowDown で mention 移動  | keyboard handler         | mention.moveHighlight(1) が呼ばれる                  | 正常系  |

### Main 層: llm handlers

| ID   | テストケース                           | 検証対象           | 期待結果                                        | 分類   |
| ---- | -------------------------------------- | ------------------ | ----------------------------------------------- | ------ |
| M-01 | 正常な streamChat リクエスト           | handleStreamChat   | requestId を返し、chunk を送信開始              | 正常系 |
| M-02 | messages 空配列で VALIDATION_ERROR     | handleStreamChat   | LLM_STREAM_ERROR: VALIDATION_ERROR              | 異常系 |
| M-03 | provider 不明で MODEL_NOT_FOUND        | handleStreamChat   | LLM_STREAM_ERROR: MODEL_NOT_FOUND               | 異常系 |
| M-04 | API key 未設定で API_KEY_MISSING       | handleStreamChat   | LLM_STREAM_ERROR: API_KEY_MISSING               | 異常系 |
| M-05 | cancel で AbortController.abort()      | handleStreamCancel | success: true, stream 中断                      | 正常系 |
| M-06 | 存在しない requestId で cancel         | handleStreamCancel | success: false                                  | 境界値 |
| M-07 | stream 途中で sender destroyed         | safeSend guard     | chunk 送信をスキップ                            | 異常系 |
| M-08 | network error で NETWORK_ERROR         | handleStreamChat   | LLM_STREAM_ERROR: NETWORK_ERROR, retryable=true | 異常系 |
| M-09 | setSelectedConfig の providerId 検証   | handleSetConfig    | invalid providerId で success=false             | 異常系 |
| M-10 | setSelectedConfig の modelId trim 検証 | handleSetConfig    | 空文字列 modelId で success=false（P42 準拠）   | 異常系 |

### IPC 統合テスト

| ID   | テストケース                                     | 検証観点                                    | 分類   |
| ---- | ------------------------------------------------ | ------------------------------------------- | ------ |
| I-01 | stream-chat -> chunk -> end の完全フロー         | Renderer <-> Main の契約一致                | 正常系 |
| I-02 | stream-chat -> cancel の中断フロー               | cancel 後に chunk が来ないことを検証        | 正常系 |
| I-03 | conversation create -> addMessage の永続化フロー | conversationId の引き継ぎが正しいことを検証 | 正常系 |
| I-04 | stream-chat の request 形式が IPC 契約に一致     | T2-2 の StreamChatRequest 型との整合        | 契約   |
| I-05 | stream error のレスポンス形式が契約に一致        | T2-2 の StreamError 型との整合              | 契約   |

### UI コンポーネントテスト: WorkspaceChatPanel

| ID   | テストケース                                | 検証対象              | 期待結果                                     | 分類   |
| ---- | ------------------------------------------- | --------------------- | -------------------------------------------- | ------ |
| U-01 | zero state で suggestion bubbles 表示       | showSuggestionBubbles | data-testid="workspace-chat-zero-state" 存在 | 正常系 |
| U-02 | messages 存在時に suggestion bubbles 非表示 | showSuggestionBubbles | zero-state 要素が存在しない                  | 正常系 |
| U-03 | streaming 中に streaming indicator 表示     | isStreaming=true      | StreamingMessage コンポーネント表示          | 正常系 |
| U-04 | file context chips に selectedFiles 表示    | selectedFiles         | chip の数が selectedFiles.length と一致      | 正常系 |
| U-05 | errorMessage 存在時にエラー表示             | errorMessage          | エラーメッセージテキストが表示される         | 正常系 |
| U-06 | selectedModelId=null で送信ボタン非活性     | P62 CTA guard         | 送信ボタンが disabled                        | 異常系 |

## Phase 4 事前確認【必須】

### 既存ユーティリティ重複検出

テスト対象機能で使用する可能性のあるユーティリティ関数が既に存在しないか確認する。

```bash
# buildFileContextBlock、buildChatRequest 等の既存実装を検索
grep -rn "export.*function.*buildFileContext\|export.*function.*buildChatRequest" packages/ apps/
grep -rn "export const buildFileContext\|export const buildChatRequest" packages/ apps/
# stream / cancel 関連ユーティリティを検索
grep -rn "export.*function.*stream\|export.*function.*cancel" apps/desktop/src/main/handlers/
```

重複が検出された場合は、既存実装を再利用する設計に変更する。

### IPC レスポンス形式の事前合意（P60 対策）

テスト設計時に、IPC ハンドラのレスポンス形式を明示的に決定する。

| チャンネル                         | 形式                                                     | 根拠                           |
| ---------------------------------- | -------------------------------------------------------- | ------------------------------ |
| `llm:stream-chat`                  | requestId（string）を直接返却                            | 非同期 stream 開始の確認値のみ |
| `llm:stream-cancel`                | `{ success: boolean }`                                   | cancel 成否の判定値            |
| `llm:set-selected-config`          | `{ success: boolean, error?: E }`                        | CRUD 操作                      |
| `conversation:create`              | `{ success: boolean, data?: T, error?: E }`              | CRUD 操作（外部サービス連携）  |
| `conversation:add-message`         | `{ success: boolean, error?: E }`                        | CRUD 操作                      |
| `llm:stream-chunk`（IPC イベント） | delta: string（直接値）                                  | 単純な chunk 転送              |
| `llm:stream-error`（IPC イベント） | `{ code: string, message: string, retryable?: boolean }` | エラー構造体                   |

テストの期待値をこのテーブルと一致させること。

### テスト対象ファイルの import 副作用チェック

テスト対象ファイルを `import` した際にトップレベル副作用が実行されないか確認する。

```bash
# llm.ts のモジュールスコープ副作用を確認
grep -n "^[^/]*\(app\.\|ipcMain\.\|BrowserWindow\|initialize\|connect\)" \
  apps/desktop/src/main/handlers/llm.ts
# useWorkspaceChatController.ts の副作用を確認
grep -n "^[^/]*\(ipcRenderer\.\|window\.\|document\.\)" \
  apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts
```

副作用が検出された場合の選択肢:

1. **vi.mock で副作用モジュールをモック化** — 副作用が少数の場合
2. **ファイル分離を Phase 5 で先行実施** — 副作用が広範囲の場合（Phase 5 の判断基準を参照）

---

## テスト環境・制約

| 項目                   | 内容                                                         |
| ---------------------- | ------------------------------------------------------------ |
| テストランナー         | Vitest                                                       |
| DOM 環境               | happy-dom（P39: userEvent 非互換のため fireEvent を使用）    |
| React テストライブラリ | @testing-library/react + renderHook                          |
| モック戦略             | vi.mock で electronAPI / conversationAPI をモック            |
| テスト実行ディレクトリ | `cd apps/desktop && pnpm vitest run`（P40 準拠）             |
| state リセット         | beforeEach で全 mock を reset（P9 準拠）                     |
| 非同期ハンドラ         | `await act(async () => { fireEvent.click(el) })`（P39 準拠） |

## テストファイル配置計画

| テストファイル                                                            | テスト対象                 | ケース数        |
| ------------------------------------------------------------------------- | -------------------------- | --------------- |
| `hooks/__tests__/useWorkspaceChatController.test.ts`                      | useWorkspaceChatController | R-01〜R-24 (24) |
| `__tests__/WorkspaceChatPanel.test.tsx`                                   | WorkspaceChatPanel         | U-01〜U-06 (6)  |
| `apps/desktop/src/main/handlers/__tests__/llm-stream.test.ts`             | handleStreamChat/Cancel    | M-01〜M-10 (10) |
| `apps/desktop/src/main/handlers/__tests__/llm-stream-integration.test.ts` | IPC 統合                   | I-01〜I-05 (5)  |

## 参照資料

| 参照資料                       | パス                                                                                   | 内容                                                      |
| ------------------------------ | -------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Phase 1（要件定義）            | `phase-1-requirements.md`                                                              | 要件前提を確認する                                        |
| Phase 2（設計）                | `phase-2-design.md`                                                                    | authority 境界・IPC 契約・error policy を確認する         |
| Phase 3（設計レビュー）        | `phase-3-design-review.md`                                                             | レビューで確定した観点を確認する                          |
| Phase 3 成果物（レビュー報告） | `outputs/phase-3/design-review-report.md`                                              | PASS 判定根拠・MINOR 指摘・system spec 整合結果を確認する |
| WorkspaceChatPanel             | `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`                 | UI surface の主要ケースを確認する                         |
| useWorkspaceChatController     | `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts`    | controller の state 管理を確認する                        |
| llm handlers                   | `apps/desktop/src/main/handlers/llm.ts`                                                | `llm:stream-chat` / cancel の主要ケースを確認する         |
| 既存 mention テスト            | `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceMentionQuery.test.ts` | mention の既存テストパターンを確認する                    |

### システム仕様（aiworkflow-requirements）

> テストケースの期待値・境界値・エラーコードの根拠として参照する。

| 参照資料                 | パス                                                                            | 照合内容                                                                                              |
| ------------------------ | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| interfaces-llm           | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`           | IPC 契約のインデックス（詳細型定義は llm-ipc-types.md を参照）                                        |
| llm-ipc-types            | `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`            | AIChatRequest / LLMProvider 実型定義、`providerId`/`modelId` バリデーション規則（テスト期待値の根拠） |
| llm-streaming            | `.claude/skills/aiworkflow-requirements/references/llm-streaming.md`            | stream chunk format / cancel protocol（M-01〜M-08 テストケースの期待値根拠）                          |
| error-handling           | `.claude/skills/aiworkflow-requirements/references/error-handling.md`           | error category / error code（M-02〜M-08、R-12〜R-14、R-19 の期待エラーコード根拠）                    |
| security-electron-ipc    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`    | sender 検証・error masking（M-07 safeSend guard テストケースの根拠）                                  |
| arch-state-management    | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`    | Zustand / local state の配置（R-01 初期 state テストの根拠）                                          |
| ui-ux-feature-components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | Workspace Chat Panel の 5 状態（U-01〜U-06 UI テストケースの根拠）                                    |

### Pitfall 準拠チェックリスト

| Pitfall | 内容                                  | テスト設計への影響                                   |
| ------- | ------------------------------------- | ---------------------------------------------------- |
| P9      | テスト間 state リーク                 | beforeEach で全 mock と module state をリセットする  |
| P39     | happy-dom で userEvent 非互換         | fireEvent + act(async) を使用する                    |
| P40     | テスト実行ディレクトリ依存            | apps/desktop/ から実行する                           |
| P41     | v8 カバレッジのインライン関数カウント | インラインコールバックのテストカバレッジを意識する   |
| P60     | IPC テスト応答形式の不一致            | wrapper 形式 { success, data, error } を期待値にする |
| P62     | DEFAULT_CONFIG fallback               | selectedModelId=null のテストケースを必ず含める      |
| P63     | サブエージェントの import パス誤り    | 既存テストの import パスを参照してから記述する       |

## 統合テスト連携

stream、cancel、mention、file context、conversation 保存、access capability、selected config を 1 つの test matrix にまとめ、Phase 5 実装時に Red -> Green で回す。

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

| 観点               | 適用判断                           | 仕様参照先                                   |
| ------------------ | ---------------------------------- | -------------------------------------------- |
| セキュリティ       | 認証・認可・入力検証が関係する場合 | `aiworkflow-requirements: security-*.md`     |
| UI/UX              | フロントエンド実装の場合           | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | 設計・構造変更の場合               | `aiworkflow-requirements: architecture-*.md` |
| API設計            | API実装・変更の場合                | `aiworkflow-requirements: api-*.md`          |
| データ整合性       | DB操作の場合                       | `aiworkflow-requirements: database-*.md`     |
| エラーハンドリング | 例外処理が必要な場合               | `aiworkflow-requirements: error-handling.md` |
| パフォーマンス     | 性能要件がある場合                 | `aiworkflow-requirements: architecture-*.md` |
| アクセシビリティ   | UI実装の場合                       | `aiworkflow-requirements: ui-ux-*.md`        |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断                    | 仕様参照先                                             |
| -------------------------- | --------------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | UI/React実装の場合          | `aiworkflow-requirements: ui-ux-*.md`                  |
| バックエンド（Main）       | サービス/ロジック実装の場合 | `aiworkflow-requirements: architecture-*.md`           |
| IPC通信                    | Main-Renderer連携の場合     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| Preload/セキュリティ       | API公開の場合               | `aiworkflow-requirements: security-api-electron.md`    |
| ローカルストレージ         | データ永続化の場合          | `aiworkflow-requirements: database-*.md`               |

## 実行手順

### ステップ1: Phase 2 設計成果物の確認

`outputs/phase-2/contract-matrix.md` と `outputs/phase-2/ipc-contract-design.md` を読み、IPC 契約の型定義を確認する。テストの期待値がこれらの型と一致することを保証する。

### ステップ2: 既存テストパターンの確認

`useWorkspaceMentionQuery.test.ts` 等の既存テストファイルの import パス・mock パターン・assertion スタイルを確認し、新規テストのテンプレートにする。

### ステップ3: テストケース設計

T4-1（観点整理）-> T4-2（Renderer）-> T4-3（Main）-> T4-4（IPC 統合）-> T4-5（UI）の順にテストケースを設計し、テストコードを作成する。

### ステップ4: テスト実行（全 Red 確認）

`cd apps/desktop && pnpm vitest run` で全テストが Red（未実装のため失敗）であることを確認する。Phase 5 で Green にする。

### ステップ5: 成果物と完了条件の確認

test matrix が全ケースをカバーしていること、テストコードがコンパイル可能であることを確認する。

## 成果物

| 成果物           | パス                             | 内容                                            |
| ---------------- | -------------------------------- | ----------------------------------------------- |
| テストマトリクス | `outputs/phase-4/test-matrix.md` | 主要ケースと責務境界を整理する                  |
| テストコード     | 上記テストファイル配置計画参照   | TDD の Red フェーズとしてテストコードを作成する |

## 完了条件

- [ ] テストマトリクスが stream / context / conversation / fail-fast / access capability / P62 を含んでいる
- [ ] Renderer 層テストケースが 20 ケース以上定義されている
- [ ] Main 層テストケースが 8 ケース以上定義されている
- [ ] IPC 統合テストケースが 3 ケース以上定義されている
- [ ] UI コンポーネントテストケースが 4 ケース以上定義されている
- [ ] テスト環境制約（P39/P40/P60/P63）が考慮されている
- [ ] テストコードが `cd apps/desktop && pnpm vitest run --passWithNoTests` でコンパイルエラーなく実行できる
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

| サブタスク | 内容                              | 依存           | ステータス  |
| ---------- | --------------------------------- | -------------- | ----------- |
| T4-1       | テスト観点整理                    | Phase 2,3 完了 | not_started |
| T4-2       | Renderer 層テストケース作成       | T4-1           | not_started |
| T4-3       | Main 層テストケース作成           | T4-1           | not_started |
| T4-4       | IPC 統合テストケース作成          | T4-2, T4-3     | not_started |
| T4-5       | UI コンポーネントテストケース作成 | T4-2           | not_started |

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] T4-1 ~ T4-5 の全サブタスクが完了している
- [ ] テストマトリクス成果物が作成されている
- [ ] テストコードが作成されている
- [ ] 完了条件の全チェックボックスが true である
- [ ] 本Phase内の全タスクを100%実行完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
ls -la outputs/phase-4/test-matrix.md
cd apps/desktop && pnpm vitest run --passWithNoTests 2>&1 | tail -5
```

## 次のPhase

- [Phase 5（実装）](./phase-5-implementation.md) に進む

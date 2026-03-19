# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                                          |
| ---------- | ------------------------------------------------------------- |
| Phase      | 4                                                             |
| Phase名    | テスト作成                                                    |
| タスクID   | TASK-IMP-CHATPANEL-REAL-AI-CHAT-001                           |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）、Phase 3（設計レビュー） |
| 後続Phase  | Phase 5（実装）                                               |
| ステータス | not_started                                                   |
| 作成日     | 2026-03-13                                                    |
| 更新日     | 2026-03-17                                                    |
| 機能名     | chatpanel-real-chat-wiring                                    |

## 目的

> **注記**: 本タスクは「設計」タスクであり、本 Phase は実装仕様書として設計内容を記述する。実際のコード実装は後続の実装タスクで行う。

Phase 2 の設計に基づき、ChatPanel の実 AI チャット配線に必要なテストケースを TDD（Red）フェーズとして先行定義する。8 状態の UI レンダリング、ストリーミングライフサイクル、設定同期、アクセシビリティ、IPC 統合、既存 26 テストとの回帰互換を包括的にカバーする。

## 実行タスク

- Task 4-1 UI レンダリングテスト定義: ChatPanel の全 8 状態（idle/ready/streaming/cancelled/completed/error/blocked/handoff）の条件レンダリングテストを定義する
- Task 4-2 ストリーミングテスト定義: useStreamingChat 接続、chunk 受信・蓄積、完了遷移、エラー遷移、キャンセル（ボタン・Escape・unmount・新規送信）のテストを定義する
- Task 4-3 設定同期テスト定義: selected config 同期（llm:set-selected-config）、missing credentials（API_KEY_MISSING/INVALID）、capability 判定（integratedRuntime/terminalSurface/both/none）のテストを定義する
- Task 4-4 アクセシビリティテスト定義: role="log"、aria-live="polite"、aria-busy、role="alert"、role="status"、aria-label、キーボードナビゲーション（Enter/Shift+Enter/Escape/Tab）のテストを定義する
- Task 4-5 IPC 統合テスト定義: llm:stream-chat/chunk/done/cancel-stream のモック設計、IPC レスポンス wrapper 形式（P60 準拠: {success, data?, error?}）のアサーション設計を定義する
- Task 4-6 回帰テスト設計: 既存 26 テスト（ChatPanel.test.tsx 12 + ChatPanel.skill-management.test.tsx 14）との共存確認、テストファイル分割方針を定義する

## 参照資料

### 前提 Phase 成果物

| 参照資料                   | パス                                      | 内容                                                                  |
| -------------------------- | ----------------------------------------- | --------------------------------------------------------------------- |
| Phase 1（要件定義）        | `phase-1-requirements.md`                 | FR/NFR 分類、受入基準、access capability 要件                         |
| Phase 2（設計）            | `phase-2-design.md`                       | 状態機械、コンポーネント階層、IPC 契約マトリクス、UX/セキュリティ設計 |
| Phase 3（設計レビュー）    | `phase-3-design-review.md`                | 16 レビュー観点の判定結果                                             |
| コード調査レポート         | `outputs/code-research-report.md`         | ChatPanel 現行コード・GAP 分析                                        |
| 仕様調査レポート           | `outputs/spec-research-report.md`         | 型定義・IPC 契約・セキュリティ要件                                    |
| Phase 3 設計レビュー報告書 | `outputs/phase-3/design-review-report.md` | MAJOR/MINOR 指摘一覧を確認しテスト設計に反映する                      |

### コードベース

| 参照資料                  | パス                                                                                      | 内容                                        |
| ------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------- |
| ChatPanel                 | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`                                 | placeholder UI の現状（161 行、3 箇所）     |
| useStreamingChat          | `apps/desktop/src/renderer/hooks/useStreamingChat.ts`                                     | streaming hook 契約（179 行、IPC 接続済み） |
| StreamingMessage          | `apps/desktop/src/renderer/components/chat/StreamingMessage.tsx`                          | streaming 表示（83 行、memo + forwardRef）  |
| ChatPanel tests           | `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.test.tsx`                  | 既存 UI テスト（313 行、12 テスト）         |
| ChatPanel skill-mgmt test | `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx` | スキル管理テスト（375 行、14 テスト）       |
| llm handlers              | `apps/desktop/src/main/handlers/llm.ts`                                                   | LLM streaming ハンドラ（442 行）            |
| aiHandlers                | `apps/desktop/src/main/ipc/aiHandlers.ts`                                                 | AI_CHAT ハンドラ（234 行）                  |
| chatSlice                 | `apps/desktop/src/renderer/store/slices/chatSlice.ts`                                     | Chat 状態管理                               |
| llmSlice                  | `apps/desktop/src/renderer/store/slices/llmSlice.ts`                                      | LLM 状態管理                                |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                     | パス                                                                                            | 内容                                                          |
| ---------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| interfaces-llm               | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`                           | LLM と chat contract の正本                                   |
| llm-ipc-types                | `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`                            | AIChatRequest/Response、LLMErrorCode 型定義                   |
| llm-streaming                | `.claude/skills/aiworkflow-requirements/references/llm-streaming.md`                            | StreamChunk、StreamingState、チャンネル定義                   |
| api-ipc-system               | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                           | AI_CHAT と selected config の IPC 正本                        |
| ui-ux-feature-components     | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                 | Workspace Chat Panel と ChatPanel 関連 UI 正本                |
| ui-ux-panels                 | `.claude/skills/aiworkflow-requirements/references/ui-ux-panels.md`                             | ChatPanel 統合パターンの正本                                  |
| arch-state-management        | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md`               | Store hooks テスト設計・P31/P48対策パターンの参照元           |
| workflow-ai-runtime-authmode | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md` | capability別テストケース設計の参照元                          |
| llm-workspace-chat-edit      | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`                  | RuntimeResolution/HandoffGuidance型の契約検証テスト参照元     |
| ui-ux-settings               | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings-core.md`                      | capability:none時のUI表示テスト設計・Settings CTA導線の参照元 |

## 実行手順

### ステップ 1: 参照資料と Phase 1-3 成果物を確認する

Phase 2 の設計成果物（状態機械 8 状態、コンポーネント階層 12 コンポーネント、IPC 契約マトリクス 10 チャンネル）を読み込み、テスト対象の範囲を確定する。Phase 3 のレビュー結果で MINOR 指摘があれば、テスト設計に反映する。

### ステップ 2: Task 4-1 から Task 4-6 を上から順に実施する

6 つの実行タスクを上から順に処理する。各タスクでテストケースを定義し、テストマトリクスに集約する。

### ステップ 3: テストマトリクスとモック戦略を成果物として作成する

テストケース一覧（test-matrix.md）と IPC モック設計（test-mock-strategy.md）を作成する。

### ステップ 4: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、以下の整合を確認する:

- LLMErrorCode 全 10 値がテストケースに含まれていること
- IPC レスポンス wrapper 形式が P60 準拠であること
- アクセシビリティ属性が llm-streaming.md および ui-ux-feature-components.md と一致すること

### ステップ 5: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## テストマトリクス

### A. UI レンダリングテスト（Task 4-1）

| #    | テストケース                               | 状態       | 期待結果                                                     | 優先度 |
| ---- | ------------------------------------------ | ---------- | ------------------------------------------------------------ | ------ |
| A-01 | idle 状態で empty state を表示             | idle       | capability 判定結果に応じた empty state メッセージを表示     | P0     |
| A-02 | ready 状態で composer を有効化             | ready      | ComposerInput が enabled、SendButton が enabled              | P0     |
| A-03 | streaming 状態で StreamingMessage を表示   | streaming  | StreamingMessage が表示、パルスカーソル、cancel ボタン表示   | P0     |
| A-04 | cancelled 状態で蓄積コンテンツを保持       | cancelled  | streaming 蓄積コンテンツが表示、composer が有効に復帰        | P0     |
| A-05 | completed 状態で完了メッセージを追加       | completed  | assistant メッセージが ChatMessageList に追加、composer 有効 | P0     |
| A-06 | error 状態で ErrorGuidance を表示          | error      | ErrorGuidance コンポーネントが表示、role="alert"             | P0     |
| A-07 | blocked 状態で設定誘導 CTA を表示          | blocked    | capability banner（警告色）、「設定を開く」CTA 表示          | P0     |
| A-08 | handoff 状態で HandoffBlock を表示         | handoff    | HandoffBlock + PersistentTerminalLauncher が表示             | P1     |
| A-09 | RuntimeBanner が capability に応じて表示   | all        | integratedRuntime/terminalSurface/both/none で表示が変化     | P0     |
| A-10 | SkillStreamingView が isExecuting 時に表示 | (既存維持) | isExecuting && selectedSkillName で条件レンダリング維持      | P1     |

### B. ストリーミングテスト（Task 4-2）

| #    | テストケース                                     | 期待結果                                                       | 優先度 |
| ---- | ------------------------------------------------ | -------------------------------------------------------------- | ------ |
| B-01 | useStreamingChat の startStream を呼び出す       | isStreaming が true、streaming 状態に遷移                      | P0     |
| B-02 | chunk 受信で streamingContent が蓄積される       | content が chunk ごとに累積、StreamingMessage に反映           | P0     |
| B-03 | done signal で completed 状態に遷移              | isStreaming が false、chatMessages に assistant メッセージ追加 | P0     |
| B-04 | error signal で error 状態に遷移                 | streamingError が設定、蓄積コンテンツ保持                      | P0     |
| B-05 | cancel ボタンで cancelStream を呼び出す          | isStreaming が false、蓄積コンテンツ保持                       | P0     |
| B-06 | Escape キーで cancelStream を呼び出す            | key event -> abort()、cancelled 状態に遷移                     | P1     |
| B-07 | コンポーネント unmount で cleanup                | useEffect cleanup -> abort()                                   | P1     |
| B-08 | 新規メッセージ送信で前ストリームを自動キャンセル | 前の streaming が cancelled、新しい streaming 開始             | P1     |
| B-09 | provider/model 未選択で送信を試行                | error 状態（「LLM が選択されていません」メッセージ）           | P0     |

### C. 設定同期テスト（Task 4-3）

| #    | テストケース                                  | 期待結果                                            | 優先度 |
| ---- | --------------------------------------------- | --------------------------------------------------- | ------ |
| C-01 | selected config が Store に設定されている場合 | llm:stream-chat に providerId/modelId が含まれる    | P0     |
| C-02 | selected config が未設定の場合                | blocked 状態、エラーメッセージ表示                  | P0     |
| C-03 | API key 未設定（API_KEY_MISSING）の場合       | blocked 状態、Settings 誘導 CTA 表示                | P0     |
| C-04 | API key 無効（API_KEY_INVALID）の場合         | error 状態、Settings リダイレクト誘導               | P1     |
| C-05 | capability=integratedRuntime の場合           | RuntimeBanner に「API 利用可能」表示、composer 有効 | P0     |
| C-06 | capability=terminalSurface の場合             | RuntimeBanner に「Terminal 利用可能」表示           | P1     |
| C-07 | capability=both の場合                        | RuntimeBanner に両方利用可能を表示                  | P1     |
| C-08 | capability=none の場合                        | RuntimeBanner に「設定が必要」表示、blocked 状態    | P0     |

### D. アクセシビリティテスト（Task 4-4）

| #    | テストケース                                        | 期待結果                                             | 優先度 |
| ---- | --------------------------------------------------- | ---------------------------------------------------- | ------ |
| D-01 | ChatMessageList に role="log" が付与されている      | `getByRole("log")` で取得可能                        | P0     |
| D-02 | ChatMessageList に aria-live="polite" が設定        | 属性値が "polite"                                    | P0     |
| D-03 | StreamingMessage に aria-busy={isStreaming} が設定  | streaming 中は true、完了後は false                  | P0     |
| D-04 | ErrorGuidance に role="alert" が付与されている      | `getByRole("alert")` で取得可能                      | P0     |
| D-05 | RuntimeBanner に role="status" が付与されている     | `getByRole("status")` で取得可能                     | P1     |
| D-06 | cancel ボタンに aria-label="Cancel response" が設定 | `getByLabelText("Cancel response")` で取得可能       | P1     |
| D-07 | Enter キーでメッセージ送信                          | fireEvent.keyDown(input, { key: "Enter" }) で送信    | P0     |
| D-08 | Shift+Enter で改行                                  | 送信されず改行が挿入される                           | P1     |
| D-09 | Escape キーでストリーミングキャンセル               | fireEvent.keyDown で cancelStream 呼び出し           | P0     |
| D-10 | Tab でフォーカス移動                                | フォーカス順序が正しい（Banner -> List -> Composer） | P2     |

### E. IPC 統合テスト（Task 4-5）

| #    | テストケース                                    | 期待結果                                                      | 優先度 |
| ---- | ----------------------------------------------- | ------------------------------------------------------------- | ------ |
| E-01 | llm:stream-chat 呼び出しで requestId を受信     | startStream 後に requestId が返却される                       | P0     |
| E-02 | llm:stream-chunk イベントで content を受信      | onStreamChunk コールバックが content を受け取る               | P0     |
| E-03 | llm:stream-done イベントで完了通知を受信        | onStreamEnd コールバックが呼ばれ、isStreaming が false になる | P0     |
| E-04 | llm:stream-error イベントでエラーを受信         | error オブジェクト {code, message, retryable} を受け取る      | P0     |
| E-05 | llm:cancel-stream 呼び出しでストリーム中断      | AbortController.abort() が呼ばれる                            | P0     |
| E-06 | IPC レスポンスが wrapper 形式を遵守（P60 準拠） | {success: true, data: {...}} / {success: false, error: {...}} | P0     |
| E-07 | NETWORK_ERROR（retryable）で retry 可能を表示   | ErrorGuidance に retry ボタン、retryable: true                | P1     |
| E-08 | RATE_LIMIT で待機時間表示と自動 retry           | retryAfterMs を表示、自動 retry ロジック                      | P1     |
| E-09 | CONTENT_FILTER（non-retryable）でフィルタ通知   | ErrorGuidance にフィルタメッセージ、retryable: false          | P2     |
| E-10 | CONTEXT_LENGTH_EXCEEDED で会話リセット誘導      | ErrorGuidance にリセットボタン、retryable: false              | P2     |

### F. 回帰テスト（Task 4-6）

| #    | テストケース                              | 期待結果                                                    | 優先度 |
| ---- | ----------------------------------------- | ----------------------------------------------------------- | ------ |
| F-01 | 既存 SkillSelector 表示テストが PASS      | ChatPanel.test.tsx の既存 12 テストが全て PASS              | P0     |
| F-02 | 既存 SkillManagement テストが PASS        | ChatPanel.skill-management.test.tsx の既存 14 テストが PASS | P0     |
| F-03 | fetchSkills 初期化が引き続き動作          | マウント時に fetchSkills が呼ばれる                         | P0     |
| F-04 | SkillStreamingView の条件レンダリング維持 | isExecuting && selectedSkillName で表示切替                 | P0     |
| F-05 | SkillImportDialog の ref 経由表示が動作   | onImportRequest コールバック経由でダイアログ表示            | P1     |

## IPC モック戦略（Task 4-5 詳細）

### モック対象と設計方針

| モック対象                   | モック手法                       | 設計根拠                                       |
| ---------------------------- | -------------------------------- | ---------------------------------------------- |
| `window.electronAPI.llm`     | `vi.fn()` で各メソッドをモック   | Renderer 3 段階防御の API 存在チェックをテスト |
| `useStreamingChat`           | hook のモック（vi.mock）         | ChatPanel テストでは hook を分離テスト         |
| `useAppStore` 個別セレクタ   | `vi.mock` + `mockReturnValue`    | P31/P48 対策としてセレクタ単位でモック         |
| `llm:stream-chat` レスポンス | `mockResolvedValue` wrapper 形式 | P60 準拠 {success, data?, error?}              |
| `llm:stream-chunk` イベント  | `EventEmitter` パターン          | Main -> Renderer のイベント送信をシミュレート  |
| `llm:stream-error` イベント  | LLMError 型のモックオブジェクト  | 全 10 LLMErrorCode をパラメタライズテスト      |

### IPC レスポンス wrapper 形式（P60 準拠）

```typescript
// 成功レスポンス
{ success: true, data: { requestId: "req-123" } }

// エラーレスポンス
{ success: false, error: { code: "VALIDATION_ERROR", message: "..." } }

// ストリーミングエラーイベント
{ code: "NETWORK_ERROR", message: "Connection lost", retryable: true }
```

### テスト環境の注意事項

| 注意事項                | 対策                                                                 | 関連 Pitfall |
| ----------------------- | -------------------------------------------------------------------- | ------------ |
| happy-dom 環境          | `fireEvent` を使用、`userEvent.setup()` は使用禁止                   | P39          |
| テスト実行ディレクトリ  | `cd apps/desktop && pnpm vitest run` で実行                          | P40          |
| Store モックの安定性    | 個別セレクタ + `useShallow` 適用の派生セレクタをテスト               | P31, P48     |
| IPC 応答形式            | wrapper 形式 `{success, data?, error?}` で統一                       | P60          |
| v8 カバレッジ           | インライン arrow function も関数カウントされる                       | P41          |
| SubAgent インポートパス | 同ディレクトリの既存テストファイルのインポートパスを参照してから記述 | P63          |

## テストファイル分割方針

| ファイル名                            | テスト範囲                              | 新規/既存 |
| ------------------------------------- | --------------------------------------- | --------- |
| `ChatPanel.test.tsx`                  | 既存 12 テスト（スキル統合）            | 既存維持  |
| `ChatPanel.skill-management.test.tsx` | 既存 14 テスト（スキル管理）            | 既存維持  |
| `ChatPanel.chat-wiring.test.tsx`      | 8 状態レンダリング + ストリーミング統合 | **新規**  |
| `ChatPanel.accessibility.test.tsx`    | アクセシビリティ全般                    | **新規**  |
| `ChatPanel.settings-sync.test.tsx`    | 設定同期 + capability 判定              | **新規**  |

## 統合テスト連携

Phase 4 で定義するテストケースは、以下の統合テスト観点を包含する:

| テスト観点           | テストマトリクス対応 | 検証内容                                          |
| -------------------- | -------------------- | ------------------------------------------------- |
| ストリーミング E2E   | B-01 〜 B-09         | IPC 契約マトリクス #1-#5 の全チャンネルを網羅     |
| Selected config 同期 | C-01 〜 C-02         | IPC 契約マトリクス #6 の双方向同期をテスト        |
| Capability 判定      | C-05 〜 C-08         | 4 値判定と UI 表示の対応をテスト                  |
| エラーハンドリング   | E-06 〜 E-10         | LLMErrorCode 全 10 値のガイダンス分岐をテスト     |
| 会話永続化           | B-03                 | IPC 契約マトリクス #8-#9 の永続化呼び出しをテスト |
| 回帰互換             | F-01 〜 F-05         | 既存 26 テストの PASS 維持を検証                  |

## 多角的チェック観点

| 観点               | 適用 | チェック内容                                                                         |
| ------------------ | ---- | ------------------------------------------------------------------------------------ |
| UI/UX              | 該当 | 全 8 状態のレンダリングテストが定義されていること                                    |
| セキュリティ       | 該当 | IPC モックが wrapper 形式を遵守し、API key 漏洩パスがないこと                        |
| IPC 通信           | 該当 | P42 バリデーション、P60 wrapper 形式、チャンネルホワイトリストのテスト               |
| アクセシビリティ   | 該当 | WCAG 2.1 AA 要件（role/aria 属性、キーボード操作）が全てテストケース化されていること |
| エラーハンドリング | 該当 | LLMErrorCode 全 10 値のガイダンス分岐テストが定義されていること                      |
| パフォーマンス     | 該当 | StreamingMessage の memo 最適化テスト（不要な再レンダーがないこと）                  |

**Electron デスクトップアプリ観点**:

| 層                         | 適用 | チェック内容                                             |
| -------------------------- | ---- | -------------------------------------------------------- |
| フロントエンド（Renderer） | 該当 | 8 状態の条件レンダリング、Store 個別セレクタのモック設計 |
| バックエンド（Main）       | 該当 | IPC ハンドラのモック設計（llm:stream-chat 等）           |
| IPC 通信                   | 該当 | 10 チャンネルのモック設計、wrapper 形式アサーション      |
| Preload/セキュリティ       | 該当 | window.electronAPI モックの 3 段階防御テスト             |

## 成果物

| 成果物                  | パス                                    | 内容                                                  |
| ----------------------- | --------------------------------------- | ----------------------------------------------------- |
| テストマトリクス        | `outputs/phase-4/test-matrix.md`        | 全テストケース一覧（A-01〜F-05、計 52 ケース）        |
| モック戦略              | `outputs/phase-4/test-mock-strategy.md` | IPC モック設計、Store モック設計、テスト環境注意事項  |
| テストコード（TDD Red） | プロジェクト該当ディレクトリ            | 新規 3 ファイルのテストスケルトン（全テスト failing） |

## 完了条件

- [ ] 全 8 状態（idle/ready/streaming/cancelled/completed/error/blocked/handoff）のレンダリングテストが定義されている
- [ ] ストリーミングライフサイクル（開始・chunk 受信・完了・エラー・キャンセル 4 トリガー）のテストが定義されている
- [ ] 設定同期テスト（selected config 同期、missing credentials、capability 4 値判定）が定義されている
- [ ] アクセシビリティテスト（role/aria 属性 6 項目、キーボード操作 4 項目）が定義されている
- [ ] IPC 統合テスト（wrapper 形式アサーション、LLMErrorCode 全 10 値）が定義されている
- [ ] 既存 26 テスト（12 + 14）との回帰互換が確認されている
- [ ] テストマトリクス（52 テストケース）が作成されている
- [ ] IPC モック戦略（test-mock-strategy.md）が作成されている
- [ ] テスト環境注意事項（P39/P40/P31/P48/P60/P41）が記載されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## サブタスク管理

Phase 実行開始時に、TodoWrite ツールで以下のサブタスクを作成すること:

1. 参照資料と Phase 1-3 成果物の確認
2. Task 4-1: UI レンダリングテスト定義（8 状態 + RuntimeBanner + 既存維持）
3. Task 4-2: ストリーミングテスト定義（9 ケース）
4. Task 4-3: 設定同期テスト定義（8 ケース）
5. Task 4-4: アクセシビリティテスト定義（10 ケース）
6. Task 4-5: IPC 統合テスト定義 + モック戦略作成（10 ケース）
7. Task 4-6: 回帰テスト設計（5 ケース + ファイル分割方針）
8. テストマトリクスの集約（test-matrix.md 作成）
9. system spec との整合確認
10. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## タスク 100% 実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスク（Task 4-1〜4-6）を 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-seq-task-05-chatpanel-real-chat-wiring --phase 4
```

## 次のPhase

- [Phase 5（実装）](./phase-5-implementation.md) に進む

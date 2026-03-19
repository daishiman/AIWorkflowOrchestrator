# Phase 3: 設計レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 3                                    |
| Phase名    | 設計レビュー                         |
| タスクID   | TASK-IMP-CHATPANEL-REAL-AI-CHAT-001  |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計） |
| 後続Phase  | Phase 4（テスト作成）                |
| ステータス | not_started                          |
| 作成日     | 2026-03-13                           |
| 更新日     | 2026-03-17                           |
| 機能名     | chatpanel-real-chat-wiring           |

## 目的

Phase 1（要件定義）と Phase 2（設計）の成果物を多角的にレビューし、ChatPanel の real chat 設計が他 surface（Chat Edit, Workspace Chat Panel）と矛盾しないか、セキュリティ・アーキテクチャ・UI/UX・既知の落とし穴の観点から検証する。

## 実行タスク

- Task 3-1: アーキテクチャ観点レビュー（4項目）
- Task 3-2: IPC/セキュリティ観点レビュー（4項目）
- Task 3-3: UI/UX 観点レビュー（4項目）
- Task 3-4: 既知の落とし穴チェック（4項目）
- Task 3-5: Task01/Task02/Task06 との契約矛盾チェック

## 参照資料

| 参照資料            | パス                                                                     | 内容                                       |
| ------------------- | ------------------------------------------------------------------------ | ------------------------------------------ |
| Phase 1（要件定義） | `phase-1-requirements.md`                                                | 依存する前提成果物を確認する               |
| Phase 2（設計）     | `phase-2-design.md`                                                      | 依存する前提成果物を確認する               |
| Phase 1 成果物      | `outputs/phase-1/requirements-definition.md`                             | 要件、制約、受入基準                       |
| Phase 2 成果物      | `outputs/phase-2/design-summary.md`                                      | 責務境界、依存関係、接続順序               |
| Phase 2 契約一覧    | `outputs/phase-2/contract-matrix.md`                                     | IPC、state、runtime 契約一覧               |
| Phase 2 UI/UX       | `outputs/phase-2/ui-ux-realization.md`                                   | banner、message list、composer、handoff    |
| Phase 2 transcript  | `outputs/phase-2/transcript-ingestion-flow.md`                           | terminal transcript 手動添付               |
| ChatPanel           | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`                | placeholder UI の現状                      |
| useStreamingChat    | `apps/desktop/src/renderer/hooks/useStreamingChat.ts`                    | streaming hook の current contract         |
| StreamingMessage    | `apps/desktop/src/renderer/components/chat/StreamingMessage.tsx`         | streaming 表示コンポーネント               |
| ai handlers         | `apps/desktop/src/main/ipc/aiHandlers.ts`                                | AI_CHAT と selected config の current path |
| LLM handlers        | `apps/desktop/src/main/handlers/llm.ts`                                  | LLM_STREAM_CHAT ハンドラ                   |
| ChatPanel tests     | `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.test.tsx` | 既存 UI 契約テスト                         |
| コード調査レポート  | `outputs/code-research-report.md`                                        | ChatPanel 現行コード・GAP分析              |
| 仕様調査レポート    | `outputs/spec-research-report.md`                                        | システム仕様・IPC契約・セキュリティ要件    |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                                        | パス                                                                                                   | 内容                                                |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| interfaces-llm                                  | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`                                  | LLM と chat contract の正本                         |
| api-ipc-system                                  | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                                  | AI_CHAT と selected config の IPC 正本              |
| ui-ux-feature-components                        | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                        | Workspace Chat Panel と ChatPanel 関連 UI 正本      |
| ui-ux-settings                                  | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                                  | access capability と settings 表示契約              |
| ui-ux-panels                                    | `.claude/skills/aiworkflow-requirements/references/ui-ux-panels.md`                                    | ChatPanel 統合パターンの正本                        |
| workflow-apikey-chat-tool-integration-alignment | `.claude/skills/aiworkflow-requirements/references/workflow-apikey-chat-tool-integration-alignment.md` | selected config と auth key の既存ルール            |
| llm-ipc-types                                   | `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`                                   | LLM IPC 型定義・エラーコード・ストリーミング型      |
| llm-streaming                                   | `.claude/skills/aiworkflow-requirements/references/llm-streaming.md`                                   | ストリーミングチャネル・状態・キャンセル契約        |
| security-api-electron                           | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                           | Electron IPC セキュリティ・API key 保護             |
| arch-state-management                           | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md`                      | Store設計レビュー・個別セレクタパターン検証の参照元 |
| workflow-ai-runtime-authmode                    | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md`        | capability判定ロジックのレビュー観点参照元          |
| security-electron-ipc                           | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                           | IPC セキュリティレビュー観点の正本                  |

## レビュー観点

### A. アーキテクチャ観点（4項目）

#### A-1: selected config と access capability の反映経路 1 本化

- **検証内容**: Renderer -> Preload -> Main の一方向依存で selected config と access capability が一貫した経路で反映されているか
- **判定基準**: llmSlice の selectedProviderId/selectedModelId -> `llm:set-selected-config` -> Main の `setSelectedLLMConfig()` -> AI_CHAT/LLM_STREAM_CHAT の provider 解決ロジックが 1 本の経路で完結している
- **NG例**: Renderer 側で独自に provider を解決する、複数の selected config 保存先が存在する

#### A-2: Chat Edit との command surface 二重実装防止

- **検証内容**: ChatPanel が Chat Edit (`chat-edit:send-with-context`) と同じ command surface を二重実装していないか
- **判定基準**: ChatPanel は `llm:stream-chat` / `AI_CHAT` を使用し、Chat Edit は `chat-edit:send-with-context` を使用する。それぞれの IPC チャンネルが分離されている
- **NG例**: ChatPanel が `chat-edit:send-with-context` を直接呼ぶ、ChatPanel 内に RuntimeResolver を再実装する

#### A-3: Main/Renderer 責務境界のレイヤー依存方向準拠

- **検証内容**: runtime 解決（provider 選択、API key 取得、adapter 選択）は Main Process、表示状態管理は Renderer の責務として分離されているか
- **判定基準**: `01-architecture.md` のレイヤー依存方向 `Renderer -> Preload (contextBridge) -> Main -> External Services` に従っている
- **NG例**: Renderer から直接 HTTP リクエストを送信する、Renderer が API key を保持する

#### A-4: Store 設計の P31/P48 対策

- **検証内容**: Zustand Store の設計が P31（合成Hook無限ループ）と P48（useShallow未適用）に対策済みか
- **判定基準**:
  - 個別セレクタ（`useIsStreaming()`, `useStreamingContent()` 等）を使用している
  - `.filter()` / `.map()` で配列を返す派生セレクタに `useShallow` が適用されている
  - 合成 Store Hook の戻り値関数を `useEffect` 依存配列に含めていない
- **NG例**: `useAppStore()` の分割代入でアクション関数を取得し `useEffect` に渡す

### B. IPC/セキュリティ観点（4項目）

#### B-1: IPC 契約マトリクスのホワイトリスト管理

- **検証内容**: Phase 2 の契約一覧に記載された全 IPC チャンネルが `IPC_CHANNELS` 定数で管理されているか
- **判定基準**: 以下のチャンネルが全て `preload/channels.ts` のホワイトリストに含まれている
  - `llm:stream-chat` (IPC_CHANNELS.LLM_STREAM_CHAT), `llm:stream-chunk` (LLM_STREAM_CHUNK), `llm:stream-done` (LLM_STREAM_END), `llm:stream-error` (LLM_STREAM_ERROR), `llm:cancel-stream` (LLM_STREAM_CANCEL)
  - `llm:set-selected-config` (LLM_SET_SELECTED_CONFIG), `llm:get-providers` (LLM_GET_PROVIDERS), `llm:check-health` (LLM_CHECK_HEALTH)
  - `ai:chat` (AI_CHAT), `conversation:create`, `conversation:addMessage`
- **NG例**: チャンネル名をハードコード文字列で指定する（P27）

#### B-2: P42 3-step validation の全文字列引数適用

- **検証内容**: ChatPanel が送信する全ての文字列 IPC 引数に P42 準拠の 3 段バリデーションが設計されているか
- **判定基準**: `typeof === "string"` -> `=== ""` -> `.trim() === ""` の 3 ステップが以下の引数に適用される
  - `AIChatRequest.message`
  - `AIChatRequest.providerId` / `modelId`（明示指定時）
  - `AIChatRequest.systemPrompt`（指定時）
  - `conversation:create` の `title`
  - `conversation:addMessage` の `content`
- **NG例**: `.trim()` チェックを省略する（P42）

#### B-3: Renderer 3 段階防御パターンの設計

- **検証内容**: ChatPanel から IPC を呼び出す際に Renderer 側 3 段階防御パターンが設計されているか
- **判定基準**:
  1. API 存在チェック: `window.electronAPI?.llm`
  2. メソッド存在チェック: `api?.streamChat` + warn + fallback
  3. レスポンス shape チェック: `Array.isArray()` / optional chaining による実行時型検証
- **NG例**: `window.electronAPI.llm.streamChat()` を直接呼ぶ（API 不在時に TypeError）

#### B-4: API key の Renderer/handoff command 漏洩防止

- **検証内容**: API key が Renderer Process や handoff command（terminal handoff）に漏洩しない設計になっているか
- **判定基準**:
  - API key の取得は Main Process 内（`SecureStorage.getApiKey()`）で完結する
  - `apiKey:get` / `auth-key:getKey` は Renderer に公開されていない
  - handoff command に API key やトークンが含まれない
  - エラーメッセージに API key の値が含まれない
- **NG例**: Renderer に API key を IPC で送信する、エラーメッセージに key 値をログ出力する

### C. UI/UX 観点（4項目）

#### C-1: missing credentials と streaming error の UX 定義

- **検証内容**: API key 未設定（`API_KEY_MISSING`）とストリーミングエラー（`NETWORK_ERROR`, `TIMEOUT`, `RATE_LIMIT` 等）の UX が Phase 2 で定義されているか
- **判定基準**:
  - `API_KEY_MISSING`: Settings への誘導 UI（Secondary CTA「設定を開く」）が定義されている
  - `API_KEY_INVALID`: エラー表示 + Settings リダイレクト
  - `NETWORK_ERROR` / `TIMEOUT` / `SERVICE_UNAVAILABLE`: リトライ可能エラー -> リトライボタン表示
  - `RATE_LIMIT`: 待機時間表示 + 自動リトライ
  - `CONTENT_FILTER`: フィルタ通知
- **NG例**: エラー時に何も表示しない、全エラーを同一 UI で表示する

#### C-2: 全状態での UI 表示定義

- **検証内容**: ChatPanel の全状態（empty / streaming / cancelled / handoff / blocked）で UI 表示が定義されているか
- **判定基準**: Phase 2 の ui-ux-realization.md に以下の全状態の表示内容が記載されている
  - **empty**: capability banner + 入力ガイダンス（「この画面で自動実行できるか」を先に示す）
  - **ready**: message list + composer（送信可能状態）
  - **streaming**: StreamingMessage（パルスカーソル + キャンセルボタン）+ 蓄積コンテンツ表示
  - **cancelled**: 蓄積コンテンツ保持 + 再入力可能状態
  - **handoff**: HandoffBlock + terminal command 表示 + PersistentTerminalLauncher
  - **blocked**: capability 不足ガイダンス（ErrorGuidance）+ Settings 誘導
- **NG例**: 状態が欠落している、状態間の遷移条件が未定義

#### C-3: アクセシビリティ要件（WCAG 2.1 AA）

- **検証内容**: ChatPanel のアクセシビリティ要件が Phase 2 で設計されているか
- **判定基準**:
  - message list: `role="log"` + `aria-live="polite"`
  - streaming message: `role="status"` + `aria-busy={isStreaming}`
  - error guidance: `role="alert"`
  - capability banner: message list より先に読める DOM 順序
  - cancel button: `aria-label="Cancel response"`
  - keyboard: Enter で送信、Escape でキャンセル、Tab でフォーカス移動
  - コントラスト比 4.5:1 以上（通常テキスト）
- **NG例**: `aria-live` 未設定、keyboard 操作でアクセスできない機能がある

#### C-4: silent fallback 禁止（guidance block 表示）

- **検証内容**: capability 不足時に silent fallback（黙ってエラーを握りつぶす）ではなく、明示的な guidance block が表示される設計になっているか
- **判定基準**:
  - provider/model 未選択: エラー表示 + LLMSelectorPanel への誘導（P62 準拠）
  - API key 未設定: `blocked` 状態 -> ErrorGuidance + Settings 誘導
  - terminal 不可: handoff 不可の旨を表示
  - いずれの場合も見かけ成功にしない
- **NG例**: DEFAULT_CONFIG への暗黙 fallback（P62）、エラーを console.log のみで処理

### D. 既知の落とし穴チェック（4項目）

#### D-1: P62 DEFAULT_CONFIG fallback 禁止

- **検証内容**: Provider/Model が未選択の場合にエラー返却する設計になっているか
- **判定基準**: Main Process の provider 解決ロジックで、selected config が未設定の場合は `DEFAULT_CONFIG` への fallback ではなくエラーを返却する。aiHandlers.ts L69-180 の既存実装と整合する
- **NG例**: `const provider = selectedConfig ?? DEFAULT_CONFIG` のようなフォールバック

#### D-2: P31/P48 Zustand 無限ループ対策

- **検証内容**: 設計で使用する Store セレクタが無限ループを引き起こさない構造になっているか
- **判定基準**:
  - P31: `useStreamingChat` の `useStore()` 使用が安全か（個別セレクタへの移行が必要か）
  - P48: `messages.filter()` 等の派生セレクタに `useShallow` が適用される設計か
  - `useEffect` 依存配列にアクション関数を含む場合、個別セレクタ経由で取得する設計か
- **NG例**: `const { startStreaming, cancelStreaming } = useStore()` を `useEffect` 依存配列に含む

#### D-3: P39 happy-dom 環境テスト互換性

- **検証内容**: テスト設計で `fireEvent` を使用する方針になっているか
- **判定基準**: Phase 4 で作成するテストは happy-dom 環境で動作する `fireEvent` を使用し、`userEvent.setup()` は使用しない
- **NG例**: `const user = userEvent.setup(); await user.click(element);`

#### D-4: P60 IPC 応答形式統一

- **検証内容**: 全 IPC レスポンスが wrapper 形式 `{ success: boolean, data?: T, error?: { code: string, message: string } }` で統一されているか
- **判定基準**:
  - `AI_CHAT`: `{ success: true, data: { message, conversationId } }` / `{ success: false, error: string }`
  - `llm:stream-chat` (LLM_STREAM_CHAT): requestId を返す invoke + chunk (`llm:stream-chunk`) / done (`llm:stream-done`) / error (`llm:stream-error`) イベント
  - `llm:set-selected-config`: `{ success: boolean, error?: string }`
  - 新規追加するチャンネルも同一形式に従う
- **NG例**: フラットな `{ code: "VALIDATION_ERROR" }` を返す（wrapper 形式と不整合）

## レビューゲート

設計レビュー の判定基準は `.claude/skills/task-specification-creator/references/review-gate-criteria.md` に従う。

| 判定  | 条件                     | 次のアクション                   |
| ----- | ------------------------ | -------------------------------- |
| PASS  | 重大な問題がない         | Phase 4 に進む                   |
| MINOR | 軽微な指摘がある         | 指摘を未タスクとして記録して次へ |
| MAJOR | 戻り先が必要な問題がある | 下表の戻り先へ戻す               |

| 問題の種類 | 戻り先              |
| ---------- | ------------------- |
| 要件の問題 | Phase 1（要件定義） |
| 設計の問題 | Phase 2（設計）     |

## 実行手順

### ステップ1: 参照資料と Phase 1-2 成果物を確認する

Phase 1 の要件定義成果物と Phase 2 の設計成果物を読み込み、ChatPanel の real chat 設計の全体像を把握する。コード調査レポートと仕様調査レポートも参照し、現行実装と設計の差分を確認する。

### ステップ2: アーキテクチャ観点レビュー（Task 3-1）

レビュー観点 A-1 から A-4 を順に検証する。各項目について Phase 2 設計成果物の該当箇所を特定し、判定基準に基づいて PASS / MINOR / MAJOR を判定する。

### ステップ3: IPC/セキュリティ観点レビュー（Task 3-2）

レビュー観点 B-1 から B-4 を順に検証する。IPC 契約マトリクス、バリデーション設計、防御パターン、API key 保護を確認する。

### ステップ4: UI/UX 観点レビュー（Task 3-3）

レビュー観点 C-1 から C-4 を順に検証する。エラー UX、全状態 UI、アクセシビリティ、silent fallback 禁止を確認する。

### ステップ5: 既知の落とし穴チェック（Task 3-4）

レビュー観点 D-1 から D-4 を順に検証する。P62, P31/P48, P39, P60 の各パターンに該当しないことを確認する。

### ステップ6: Task01/Task02/Task06 との契約矛盾チェック（Task 3-5）

ChatPanel の設計が以下の隣接タスクと矛盾しないことを確認する:

| 依存先タスク | 確認内容                                                              |
| ------------ | --------------------------------------------------------------------- |
| Task01       | auth mode 判定ロジックと capability 解決が ChatPanel 設計と整合するか |
| Task02       | terminal launcher / handoff の契約が ChatPanel の導線設計と整合するか |
| Task06       | selected config 同期と access card の契約が ChatPanel と整合するか    |

### ステップ7: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ8: 成果物と完了条件を確認する

設計レビュー報告を作成し、全観点の判定結果を記録する。完了条件を全て満たすことを確認する。

## 統合テスト連携

AI_CHAT、selected config、access capability、workspace context、streaming UX の設計が Phase 1 と Phase 2 に整合するかをレビューする。レビュー結果は Phase 4 のテスト設計に反映する。

## 多角的チェック観点

タスクの性質に応じて、以下の観点を確認する。

| 観点               | 適用判断 | 仕様参照先                                                                                |
| ------------------ | -------- | ----------------------------------------------------------------------------------------- |
| セキュリティ       | 適用     | `security-api-electron.md`, `security-electron-ipc.md`                                    |
| UI/UX              | 適用     | `ui-ux-feature-components.md`, `ui-ux-panels.md`                                          |
| アーキテクチャ     | 適用     | `architecture-overview.md`, `architecture-implementation-patterns.md`                     |
| API設計            | 適用     | `api-ipc-system.md`, `llm-ipc-types.md`                                                   |
| エラーハンドリング | 適用     | `.claude/skills/aiworkflow-requirements/references/error-handling.md`, `llm-streaming.md` |
| アクセシビリティ   | 適用     | `ui-ux-feature-components.md`, `ui-ux-panels.md`                                          |

**Electron デスクトップアプリ観点**:

| 層                         | 適用判断 | 仕様参照先                                       |
| -------------------------- | -------- | ------------------------------------------------ |
| フロントエンド（Renderer） | 適用     | `ui-ux-feature-components.md`, `ui-ux-panels.md` |
| バックエンド（Main）       | 適用     | `architecture-overview.md`                       |
| IPC通信                    | 適用     | `api-ipc-system.md`, `llm-ipc-types.md`          |
| Preload/セキュリティ       | 適用     | `security-api-electron.md`                       |

## 成果物

| 成果物           | パス                                      | 内容                                                             |
| ---------------- | ----------------------------------------- | ---------------------------------------------------------------- |
| 設計レビュー報告 | `outputs/phase-3/design-review-report.md` | 全観点（A-1〜A-4, B-1〜B-4, C-1〜C-4, D-1〜D-4）の判定根拠を記録 |

## 完了条件

- [ ] MAJOR 指摘 0 件
- [ ] アーキテクチャ観点の全項目（A-1〜A-4）が PASS または MINOR
- [ ] IPC/セキュリティ観点の全項目（B-1〜B-4）が PASS または MINOR
- [ ] UI/UX 観点の全項目（C-1〜C-4）が PASS または MINOR
- [ ] 既知の落とし穴チェック（D-1〜D-4）が PASS
- [ ] Task01, Task02, Task06 との契約矛盾がない
- [ ] 設計レビュー報告（`outputs/phase-3/design-review-report.md`）が作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase 実行開始時に、TodoWrite ツールで以下のサブタスクを作成すること:

1. 参照資料と Phase 1-2 成果物の確認
2. Task 3-1: アーキテクチャ観点レビュー
3. Task 3-2: IPC/セキュリティ観点レビュー
4. Task 3-3: UI/UX 観点レビュー
5. Task 3-4: 既知の落とし穴チェック
6. Task 3-5: Task01/Task02/Task06 との契約矛盾チェック
7. system spec との整合確認
8. 設計レビュー報告の作成

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## タスク100%実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスク（Task 3-1〜3-5）を 100% 実行完了
- [ ] 各タスクの判定結果が設計レビュー報告に記録されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-seq-task-05-chatpanel-real-chat-wiring --phase 3
```

## 次のPhase

- [Phase 4（テスト作成）](./phase-4-test-creation.md) に進む

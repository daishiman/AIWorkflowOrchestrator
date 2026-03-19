# Phase 4: テストマトリクス

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| タスクID   | TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 |
| Phase      | 4                                   |
| Task       | 4-1〜4-6 テストケース集約           |
| 作成日     | 2026-03-18                          |
| 総ケース数 | 52                                  |

---

## テストファイル対応

| ファイル名                            | テスト範囲                            | 新規/既存 | テストID                           |
| ------------------------------------- | ------------------------------------- | --------- | ---------------------------------- |
| `ChatPanel.chat-wiring.test.tsx`      | UIレンダリング + ストリーミング + IPC | **新規**  | A-01〜A-10, B-01〜B-09, E-01〜E-10 |
| `ChatPanel.accessibility.test.tsx`    | アクセシビリティ全般                  | **新規**  | D-01〜D-10                         |
| `ChatPanel.settings-sync.test.tsx`    | 設定同期 + capability 判定            | **新規**  | C-01〜C-08                         |
| `ChatPanel.test.tsx`                  | 既存 12 テスト（スキル統合）          | 既存維持  | F-01, F-03〜F-05                   |
| `ChatPanel.skill-management.test.tsx` | 既存 14 テスト（スキル管理）          | 既存維持  | F-02                               |

---

## A. UI レンダリングテスト（Task 4-1）

**対象ファイル**: `ChatPanel.chat-wiring.test.tsx`

**依存モック**:

- `useAppStore` / `useChatPanelStatus` / `useChatMessagesShallow`
- `useStreamingChat`（hook モック）
- `StreamingMessage`, `RuntimeBanner`, `ErrorGuidance`, `HandoffBlock` コンポーネントモック

| #    | テストケース                               | 状態       | 期待結果                                                     | 優先度 | Phase 3 MINOR 対応                                           |
| ---- | ------------------------------------------ | ---------- | ------------------------------------------------------------ | ------ | ------------------------------------------------------------ |
| A-01 | idle 状態で empty state を表示             | idle       | capability 判定結果に応じた empty state メッセージを表示     | P0     | -                                                            |
| A-02 | ready 状態で composer を有効化             | ready      | ComposerInput が enabled、SendButton が enabled              | P0     | -                                                            |
| A-03 | streaming 状態で StreamingMessage を表示   | streaming  | StreamingMessage が表示、パルスカーソル、cancel ボタン表示   | P0     | -                                                            |
| A-04 | cancelled 状態で蓄積コンテンツを保持       | cancelled  | streaming 蓄積コンテンツが表示、composer が有効に復帰        | P0     | -                                                            |
| A-05 | completed 状態で完了メッセージを追加       | completed  | assistant メッセージが ChatMessageList に追加、composer 有効 | P0     | -                                                            |
| A-06 | error 状態で ErrorGuidance を表示          | error      | ErrorGuidance コンポーネントが表示、role="alert"             | P0     | -                                                            |
| A-07 | blocked 状態で設定誘導 CTA を表示          | blocked    | capability banner（警告色）、「設定を開く」CTA 表示          | P0     | -                                                            |
| A-08 | handoff 状態で HandoffBlock を表示         | handoff    | HandoffBlock + PersistentTerminalLauncher が表示             | P1     | MINOR-3 capability 接続点: 固定値 `integratedRuntime` で開発 |
| A-09 | RuntimeBanner が capability に応じて表示   | all        | integratedRuntime/terminalSurface/both/none で表示が変化     | P0     | -                                                            |
| A-10 | SkillStreamingView が isExecuting 時に表示 | (既存維持) | isExecuting && selectedSkillName で条件レンダリング維持      | P1     | -                                                            |

---

## B. ストリーミングテスト（Task 4-2）

**対象ファイル**: `ChatPanel.chat-wiring.test.tsx`

**依存モック**:

- `useStreamingChat`（hook 全体モック: `{ startStream, cancelStream, isStreaming, streamingContent, streamingError }`）
- `window.electronAPI.llm`（モック: `streamChat`, `cancelStream`, `onStreamChunk`, `onStreamEnd`, `onStreamError`）
- `useAppStore` / `useChatPanelStatus`

| #    | テストケース                                     | 期待結果                                                       | 優先度 | Phase 3 MINOR 対応                         |
| ---- | ------------------------------------------------ | -------------------------------------------------------------- | ------ | ------------------------------------------ |
| B-01 | useStreamingChat の startStream を呼び出す       | isStreaming が true、streaming 状態に遷移                      | P0     | -                                          |
| B-02 | chunk 受信で streamingContent が蓄積される       | content が chunk ごとに累積、StreamingMessage に反映           | P0     | -                                          |
| B-03 | done signal で completed 状態に遷移              | isStreaming が false、chatMessages に assistant メッセージ追加 | P0     | -                                          |
| B-04 | error signal で error 状態に遷移                 | streamingError が設定、蓄積コンテンツ保持                      | P0     | -                                          |
| B-05 | cancel ボタンで cancelStream を呼び出す          | isStreaming が false、蓄積コンテンツ保持                       | P0     | -                                          |
| B-06 | Escape キーで cancelStream を呼び出す            | key event -> abort()、cancelled 状態に遷移                     | P1     | MINOR-2（P39対策）: fireEvent.keyDown 使用 |
| B-07 | コンポーネント unmount で cleanup                | useEffect cleanup -> abort()                                   | P1     | -                                          |
| B-08 | 新規メッセージ送信で前ストリームを自動キャンセル | 前の streaming が cancelled、新しい streaming 開始             | P1     | -                                          |
| B-09 | provider/model 未選択で送信を試行                | error 状態（「LLM が選択されていません」メッセージ）           | P0     | P62 fallback 禁止テスト                    |

---

## C. 設定同期テスト（Task 4-3）

**対象ファイル**: `ChatPanel.settings-sync.test.tsx`

**依存モック**:

- `useAppStore` / `useChatPanelStatus` / `useSelectedProviderId` / `useSelectedModelId`
- `window.electronAPI.llm.setSelectedConfig`（mockResolvedValue、P60 wrapper 形式）
- `window.electronAPI.authKey.exists`（mockResolvedValue）

| #    | テストケース                                  | 期待結果                                            | 優先度 | Phase 3 MINOR 対応   |
| ---- | --------------------------------------------- | --------------------------------------------------- | ------ | -------------------- |
| C-01 | selected config が Store に設定されている場合 | llm:stream-chat に providerId/modelId が含まれる    | P0     | -                    |
| C-02 | selected config が未設定の場合                | blocked 状態、エラーメッセージ表示                  | P0     | P62 fallback 禁止    |
| C-03 | API key 未設定（API_KEY_MISSING）の場合       | blocked 状態、Settings 誘導 CTA 表示                | P0     | MINOR-1（P42テスト） |
| C-04 | API key 無効（API_KEY_INVALID）の場合         | error 状態、Settings リダイレクト誘導               | P1     | MINOR-1（P42テスト） |
| C-05 | capability=integratedRuntime の場合           | RuntimeBanner に「API 利用可能」表示、composer 有効 | P0     | -                    |
| C-06 | capability=terminalSurface の場合             | RuntimeBanner に「Terminal 利用可能」表示           | P1     | -                    |
| C-07 | capability=both の場合                        | RuntimeBanner に両方利用可能を表示                  | P1     | -                    |
| C-08 | capability=none の場合                        | RuntimeBanner に「設定が必要」表示、blocked 状態    | P0     | -                    |

---

## D. アクセシビリティテスト（Task 4-4）

**対象ファイル**: `ChatPanel.accessibility.test.tsx`

**依存モック**:

- `useAppStore` / `useChatPanelStatus` / `useChatMessagesShallow`
- `useStreamingChat`（最小モック）
- コンポーネントモック（最低限）

| #    | テストケース                                        | 期待結果                                             | 優先度 | Phase 3 MINOR 対応                 |
| ---- | --------------------------------------------------- | ---------------------------------------------------- | ------ | ---------------------------------- |
| D-01 | ChatMessageList に role="log" が付与されている      | `getByRole("log")` で取得可能                        | P0     | -                                  |
| D-02 | ChatMessageList に aria-live="polite" が設定        | 属性値が "polite"                                    | P0     | -                                  |
| D-03 | StreamingMessage に aria-busy={isStreaming} が設定  | streaming 中は true、完了後は false                  | P0     | -                                  |
| D-04 | ErrorGuidance に role="alert" が付与されている      | `getByRole("alert")` で取得可能                      | P0     | -                                  |
| D-05 | RuntimeBanner に role="status" が付与されている     | `getByRole("status")` で取得可能                     | P1     | -                                  |
| D-06 | cancel ボタンに aria-label="Cancel response" が設定 | `getByLabelText("Cancel response")` で取得可能       | P1     | -                                  |
| D-07 | Enter キーでメッセージ送信                          | fireEvent.keyDown(input, { key: "Enter" }) で送信    | P0     | MINOR-2（P39対策）: fireEvent 使用 |
| D-08 | Shift+Enter で改行                                  | 送信されず改行が挿入される                           | P1     | MINOR-2（P39対策）: fireEvent 使用 |
| D-09 | Escape キーでストリーミングキャンセル               | fireEvent.keyDown で cancelStream 呼び出し           | P0     | MINOR-2（P39対策）: fireEvent 使用 |
| D-10 | Tab でフォーカス移動                                | フォーカス順序が正しい（Banner -> List -> Composer） | P2     | MINOR-2（P39対策）: fireEvent 使用 |

---

## E. IPC 統合テスト（Task 4-5）

**対象ファイル**: `ChatPanel.chat-wiring.test.tsx`

**依存モック**:

- `window.electronAPI.llm`（フル mock: 全 7 メソッド）
- `window.conversationAPI`（`create`, `addMessage` モック）
- `window.electronAPI.authKey`（`exists` モック）
- EventEmitter パターンで push チャンネルをシミュレート

| #    | テストケース                                    | 期待結果                                                      | 優先度 | Phase 3 MINOR 対応                                                   |
| ---- | ----------------------------------------------- | ------------------------------------------------------------- | ------ | -------------------------------------------------------------------- |
| E-01 | llm:stream-chat 呼び出しで requestId を受信     | startStream 後に requestId が返却される                       | P0     | フラット形式（P60 wrapper 非適用）                                   |
| E-02 | llm:stream-chunk イベントで content を受信      | onStreamChunk コールバックが content を受け取る               | P0     | push イベント（P60 wrapper 非適用）                                  |
| E-03 | llm:stream-end イベントで完了通知を受信         | onStreamEnd コールバックが呼ばれ、isStreaming が false になる | P0     | push イベント（P60 wrapper 非適用）、`stream-end` = `LLM_STREAM_END` |
| E-04 | llm:stream-error イベントでエラーを受信         | error オブジェクト {code, message, retryable} を受け取る      | P0     | push イベント（P60 wrapper 非適用）                                  |
| E-05 | llm:cancel-stream 呼び出しでストリーム中断      | AbortController.abort() が呼ばれる                            | P0     | フラット形式（P60 wrapper 非適用）                                   |
| E-06 | IPC レスポンスが wrapper 形式を遵守（P60 準拠） | {success: true, data: {...}} / {success: false, error: {...}} | P0     | CH-06/CH-08/CH-09 が対象                                             |
| E-07 | NETWORK_ERROR（retryable）で retry 可能を表示   | ErrorGuidance に retry ボタン、retryable: true                | P1     | LLMErrorCode テスト                                                  |
| E-08 | RATE_LIMIT で待機時間表示と自動 retry           | retryAfterMs を表示、自動 retry ロジック                      | P1     | LLMErrorCode テスト                                                  |
| E-09 | CONTENT_FILTER（non-retryable）でフィルタ通知   | ErrorGuidance にフィルタメッセージ、retryable: false          | P2     | LLMErrorCode テスト                                                  |
| E-10 | CONTEXT_LENGTH_EXCEEDED で会話リセット誘導      | ErrorGuidance にリセットボタン、retryable: false              | P2     | LLMErrorCode テスト                                                  |

### E テスト補足: LLMErrorCode 全 10 値カバレッジ計画

| LLMErrorCode              | retryable | テストID | 備考                           |
| ------------------------- | --------- | -------- | ------------------------------ |
| `VALIDATION_ERROR`        | false     | C-03相当 | messages 配列空 / modelId 不明 |
| `API_KEY_MISSING`         | false     | C-03     | Settings 誘導                  |
| `API_KEY_INVALID`         | false     | C-04     | Settings 誘導                  |
| `NETWORK_ERROR`           | true      | E-07     | retry ボタン表示               |
| `TIMEOUT`                 | true      | E-07相当 | retry ボタン表示               |
| `RATE_LIMIT`              | true      | E-08     | retryAfterMs 表示              |
| `CONTEXT_LENGTH_EXCEEDED` | false     | E-10     | リセット誘導                   |
| `CONTENT_FILTER`          | false     | E-09     | フィルタ通知                   |
| `MODEL_NOT_FOUND`         | false     | B-09相当 | 設定誘導                       |
| `SERVICE_UNAVAILABLE`     | true      | E-07相当 | retry ボタン表示               |
| `UNKNOWN`                 | false     | B-04相当 | 汎用エラー表示                 |

---

## F. 回帰テスト（Task 4-6）

**対象ファイル**: 既存ファイル（変更なし）

**依存モック**: 既存テストファイルの既存モック構成を維持

| #    | テストケース                              | 期待結果                                                    | 優先度 | 確認方法                                              |
| ---- | ----------------------------------------- | ----------------------------------------------------------- | ------ | ----------------------------------------------------- |
| F-01 | 既存 SkillSelector 表示テストが PASS      | ChatPanel.test.tsx の既存 12 テストが全て PASS              | P0     | `pnpm vitest run ChatPanel.test.tsx`                  |
| F-02 | 既存 SkillManagement テストが PASS        | ChatPanel.skill-management.test.tsx の既存 14 テストが PASS | P0     | `pnpm vitest run ChatPanel.skill-management.test.tsx` |
| F-03 | fetchSkills 初期化が引き続き動作          | マウント時に fetchSkills が呼ばれる                         | P0     | ChatPanel.test.tsx 内既存テスト                       |
| F-04 | SkillStreamingView の条件レンダリング維持 | isExecuting && selectedSkillName で表示切替                 | P0     | A-10 との統合確認                                     |
| F-05 | SkillImportDialog の ref 経由表示が動作   | onImportRequest コールバック経由でダイアログ表示            | P1     | ChatPanel.test.tsx 内既存テスト                       |

---

## テストケース総数サマリー

| グループ | ファイル                         | ケース数 | 新規/既存 |
| -------- | -------------------------------- | -------- | --------- |
| A        | ChatPanel.chat-wiring.test.tsx   | 10       | 新規      |
| B        | ChatPanel.chat-wiring.test.tsx   | 9        | 新規      |
| C        | ChatPanel.settings-sync.test.tsx | 8        | 新規      |
| D        | ChatPanel.accessibility.test.tsx | 10       | 新規      |
| E        | ChatPanel.chat-wiring.test.tsx   | 10       | 新規      |
| F        | 既存ファイル                     | 5        | 既存確認  |
| **合計** | -                                | **52**   | -         |

---

## Phase 3 MINOR 指摘への対応マッピング

| MINOR ID | 指摘内容                             | 対応テストケース       | 対応方針                                                 |
| -------- | ------------------------------------ | ---------------------- | -------------------------------------------------------- |
| MINOR-1  | CH-01/CH-05 P42 バリデーション未明記 | C-03, C-04, B-09, E-01 | P42 準拠 3段バリデーション境界値テストを C/B/E に含める  |
| MINOR-2  | P39 テスト方針（fireEvent）未記載    | D-07〜D-10, B-06       | 全キーボード操作テストで `fireEvent.keyDown` を使用      |
| MINOR-3  | handoff capability 接続点不明確      | A-08, C-06〜C-08       | 固定値 `integratedRuntime` で開発し、Task02 確定後に更新 |

---

## 変更履歴

| バージョン | 日付       | 変更内容                             |
| ---------- | ---------- | ------------------------------------ |
| v1.0.0     | 2026-03-18 | 初版作成（Phase 4 テストマトリクス） |

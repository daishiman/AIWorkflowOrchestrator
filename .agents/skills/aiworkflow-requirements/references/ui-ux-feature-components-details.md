# 機能別 UI コンポーネント / detail specification

> 親仕様書: [ui-ux-feature-components.md](ui-ux-feature-components.md)
> 役割: detail specification

## Workspace Layout Foundation（TASK-UI-04A-WORKSPACE-LAYOUT）

`WorkspaceView` を 1-pane 起点の作業スペース基盤へ引き上げた UI。chat を主役に維持しつつ、file browser / preview / status bar / file watcher を後続 04B / 04C が再利用できる境界で提供する。

### コンポーネント階層

| コンポーネント | 種類 | 親 | 役割 |
| --- | --- | --- | --- |
| `WorkspaceView` | view | - | store selector、file read/watch、layout hook 結線 |
| `WorkspaceShell` | template | `WorkspaceView` | inline / overlay / status bar の3領域を構成 |
| `PanelToggleBar` | molecule | `WorkspaceView` | file / preview panel の表示切替 |
| `FileBrowserPanel` | organism | `WorkspaceShell` | zero state / tree / error surface / context menu |
| `FileTreeNode` | molecule | `FileBrowserPanel` | 再帰 tree item と keyboard nav |
| `FileContextMenu` | molecule | `FileBrowserPanel` | 背景情報追加 / preview open |
| `PanelResizeHandle` | molecule | `WorkspaceShell` | drag / keyboard / reset |
| `WorkspaceStatusBar` | molecule | `WorkspaceShell` | selected file / ext / size / watch state 表示 |

### レイアウトモード

| モード | 条件 | 表示 |
| --- | --- | --- |
| `chat-only` | 初期状態 | chat のみ |
| `chat+files` | file toggle ON | 左に file panel |
| `chat+preview` | preview toggle ON | 右に preview panel |
| `3-pane` | 両 toggle ON かつ 1440px 以上 | file + chat + preview 同時表示 |

### UI 契約

| 項目 | 契約 |
| --- | --- |
| mobile | 1023px 以下では panel を overlay 表示し、Escape で閉じる |
| tablet | 1024px 以上 1439px 以下では最後に開いた panel を 1 枚だけ inline 表示 |
| desktop wide | 1440px 以上では 3-pane を許可する |
| status bar | `role="status"` + `aria-live="polite"` を維持する |
| visual quality | light theme の補助テキストは WCAG を満たす濃度まで調整する |

### 実装結果

| 項目 | 内容 |
| --- | --- |
| store reuse | `workspaceSlice` / `fileSelectionSlice` を再利用、新規 slice なし |
| watcher | `file:watch-start` / `file:watch-stop` / `file:changed` を selected file 単位で利用 |
| test | task scope 12 files / 61 tests PASS |
| screenshot | Phase 11 で 8 ケースを current workflow 配下に保存 |

### 画面検証結果

| 観点 | 判定 | 補足 |
| --- | --- | --- |
| desktop 3-pane | PASS | dark theme で 3 列の視線誘導が安定 |
| tablet chat+files | PASS | 1 sidebar に圧縮しても hierarchy が崩れない |
| mobile overlay | PASS | panel と scrim の分離が明確 |
| light theme contrast | PASS | 初回 screenshot の弱い補助テキストを調整後に再撮影 |

### 関連タスク

| タスクID | 内容 | ステータス |
| --- | --- | --- |
| TASK-UI-04A-WORKSPACE-LAYOUT | layout / file browser / watcher 基盤 | **完了（2026-03-10、Phase 13保留）** |
| TASK-UI-04B | chat 本体統合 | **完了（2026-03-11、Phase 1-12）** |
| TASK-UI-04C | preview / quick search 統合 | 後続 |

### 関連未タスク

| 未タスクID | 概要 | 参照 |
| --- | --- | --- |
| UT-IMP-WORKSPACE-PHASE11-CURRENT-BUILD-CAPTURE-GUARD-001 | Workspace 系 UI の screenshot source を current build へ固定し、reverse resize / watcher 更新 / light theme contrast の再監査を共通化する | `docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser/unassigned-task/task-imp-workspace-phase11-current-build-capture-guard-001.md` |

---

## Workspace Chat Panel（TASK-UI-04B-WORKSPACE-CHAT）

`WorkspaceView` に統合された 04B の chat 本体。04A の layout 基盤を再利用し、file context / mention / streaming / conversation 保存を 1 つの panel で提供する。

### コンポーネント階層

| コンポーネント | 種類 | 親 | 役割 |
| --- | --- | --- | --- |
| `WorkspaceChatPanel` | organism | `WorkspaceView` | zero state / log / chips / input の統合 |
| `WorkspaceChatMessageList` | molecule | `WorkspaceChatPanel` | user/assistant/streaming 表示 |
| `WorkspaceFileContextChips` | molecule | `WorkspaceChatPanel` | 添付背景情報の表示・削除 |
| `WorkspaceChatInput` | molecule | `WorkspaceChatPanel` | 送信・mention・cancel・error 表示 |
| `WorkspaceMentionDropdown` | molecule | `WorkspaceChatInput` | `@mention` 候補表示と選択 |
| `WorkspaceSuggestionBubbles` | molecule | `WorkspaceChatPanel` | 初回提案バブル |
| `useWorkspaceChatController` | hook | `WorkspaceView` | stream / conversation / mention / attach の制御 |

### UI 契約

| 項目 | 契約 |
| --- | --- |
| zero state | 会話開始前は提案バブルを表示し、入力導線を明示する |
| file context | 選択中ファイルを背景情報へ追加し、最大3件をチップ表示する |
| mention | `@` 入力でファイル候補を表示し、keyboard（Arrow/Enter/Tab）で選択できる |
| stream | chunk/end/error/cancel を UI 状態へ反映する |
| persistence | user/assistant を `conversationAPI.addMessage` で保存する |
| a11y | `role="log"` + `aria-live="polite"` と `role="alert"` を維持する |

### 実装結果

| 項目 | 内容 |
| --- | --- |
| 変更範囲 | `WorkspaceView` と `WorkspaceView/*` の chat 関連コンポーネント群 |
| テスト | 3 files / 14 tests PASS（`WorkspaceView.test.tsx` ほか） |
| 型検証 | `pnpm exec tsc --noEmit` PASS |
| 画面証跡 | Phase 11 screenshot 8件（zero/mention/stream/error/compact/keyboard） |
| 視覚レビュー | Apple UI/UX 観点で light/dark 階層・compact 幅を確認 |

### 関連タスク

| タスクID | 内容 | ステータス |
| --- | --- | --- |
| TASK-UI-04A-WORKSPACE-LAYOUT | layout / file browser / watcher 基盤 | **完了** |
| TASK-UI-04B-WORKSPACE-CHAT | chat panel 統合 | **完了（2026-03-11、Phase 1-12）** |
| TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001 | AI runtime 同期・P62三層防御・GuidanceBlock | **完了（2026-03-18、Phase 1-12）** |
| TASK-UI-04C | preview / quick search 統合 | 後続 |

### 完了タスク記録

#### TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001（2026-03-18）

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001 |
| 機能 | WorkspaceChatPanel の AI runtime 同期・送信ガード・GuidanceBlock 統合 |
| ステータス | completed（Phase 1-12） |
| ワークフロー | `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-par-task-07-workspace-chat-panel-runtime-alignment/` |

**レイアウト構成（5領域）**

| 領域 | 役割 |
| --- | --- |
| header | タイトル・ランタイム状態バッジ |
| chips | 添付ファイルコンテキスト（最大3件） |
| messages | user/assistant/streaming メッセージ一覧 |
| composer | 入力欄・送信・キャンセルボタン |
| guidance | GuidanceBlock（blocked/error/handoff variant） |

**P62三層防御（DEFAULT_CONFIG fallback 禁止）**

| 層 | 防御内容 |
| --- | --- |
| UI canSend | provider/model 未選択時は送信ボタンを disabled |
| Controller guard | `useWorkspaceChatController` で runtime 未設定を早期リターン |
| Main validation | IPC ハンドラで provider/model の空文字列バリデーション |

**状態遷移**

`idle → sending → streaming → completed / cancelled / error`

**GuidanceBlock variant**

| variant | 表示条件 |
| --- | --- |
| blocked | provider/model 未設定（設定画面への誘導リンク付き） |
| error | streaming エラー発生時（エラーコード・再試行ボタン） |
| handoff | AbortController.abort() 後に streamContent をクリアして idle へ戻す |

**streaming キャンセルフロー**

`cancelStream → AbortController.abort() → streamContent クリア → idle 遷移`

### 関連未タスク

| 未タスクID | 概要 | 優先度 | タスク仕様書 |
| --- | --- | --- | --- |
| UT-REFACTOR-WORKSPACE-CHAT-CONTROLLER-HOOK-001 | useWorkspaceChatController 640行リファクタリング（責務分割） | 中 | `docs/30-workflows/unassigned-task/task-ut-refactor-workspace-chat-controller-hook-001.md` |
| UT-INTEGRATE-COMPACT-LAYOUT-WORKSPACE-CHAT-001 | CompactLayout との WorkspaceChatPanel 統合 | 低 | `docs/30-workflows/unassigned-task/task-ut-integrate-compact-layout-workspace-chat-001.md` |
| UT-INTEGRATE-ACCESS-CAPABILITY-RESOLVER-WORKSPACE-001 | AccessCapabilityResolver による Workspace 機能制御統合 | 高 | `docs/30-workflows/unassigned-task/task-ut-integrate-access-capability-resolver-workspace-001.md` |

---

## Workspace Preview / Quick Search（TASK-UI-04C-WORKSPACE-PREVIEW）

`WorkspaceView` 右ペインの `PreviewPanel` と `Cmd/Ctrl+P` の `QuickFileSearch` を 04A 基盤へ追加した UI。preview 表示とファイル探索を chat 本体から分離し、renderer 側 timeout / retry / fallback で堅牢性を補強する。

### コンポーネント階層

| コンポーネント | 種類 | 親 | 役割 |
| --- | --- | --- | --- |
| `PreviewPanel` | organism | `WorkspaceView` | Source / Preview 切替、toolbar、error / zero state |
| `PreviewToolbar` | molecule | `PreviewPanel` | refresh、wrap、open-in-editor、meta toggle |
| `SourceView` | molecule | `PreviewPanel` | read-only source 表示、行番号、double click 導線 |
| `PreviewErrorBoundary` | molecule | `PreviewPanel` | iframe / render crash 隔離と reset |
| `QuickFileSearch` | organism | `WorkspaceView` | modal dialog、focus trap、検索結果一覧 |
| `useQuickFileSearch` | hook | `WorkspaceView` | fuzzy ranking、shortcut、highlight / submit 制御 |

### UI 契約

| 項目 | 契約 |
| --- | --- |
| preview tab | `Source` / `Preview` の2状態を維持し、文言は Task 5D 語彙に合わせる |
| HTML preview | sandbox + CSP 付き iframe を使い、危険 URL を除去した内容だけを描画する |
| JSON/YAML | pretty print 失敗時は alert banner を出しつつ `SourceView` fallback を表示する |
| image preview | 画像本体とメタ情報表示を切り替え可能にする |
| source surface | read-only、行番号ガター、double click で EditorView へ遷移する |
| quick search | `Cmd/Ctrl+P` で開き、ArrowUp / ArrowDown / Enter / Escape をサポートする |
| result policy | fuzzy 検索の上位10件のみを表示し、score 0 は候補に含めない |

### 実装結果

| 項目 | 内容 |
| --- | --- |
| IPC reuse | 新規 channel 追加なし。`file:read` と 04A の `file:changed` を再利用 |
| renderer resilience | `Promise.race` で 5秒 timeout、1秒間隔で最大3回 retry、最終失敗は preview error surface へ表示 |
| test | task scope 13 files / 52 tests PASS |
| coverage | Statements 89.47 / Branches 79.43 / Functions 93.87 / Lines 89.47 |
| screenshot | current build static serve で Phase 11 screenshot 11件を取得 |

### 画面検証結果

| 観点 | 判定 | 補足 |
| --- | --- | --- |
| source / preview hierarchy | PASS | toolbar、body、status の階層が明瞭 |
| quick search dialog | PASS | 480px 幅、12px radius、控えめな shadow で集中を妨げない |
| mobile overlay | PASS | scrim と sheet の境界が自然で、overlay close も視覚的に明確 |
| terminology consistency | PASS | `Source` / `Preview` / `ファイルをすばやく探す` の語彙を統一 |

### 関連タスク

| タスクID | 内容 | ステータス |
| --- | --- | --- |
| TASK-UI-04A-WORKSPACE-LAYOUT | layout / file browser / watcher 基盤 | 完了 |
| TASK-UI-04B-WORKSPACE-CHAT | chat 本体統合 | 完了 |
| TASK-UI-04C-WORKSPACE-PREVIEW | preview / quick search | **完了（2026-03-11、Phase 13保留）** |

### 実装時の苦戦箇所

| 苦戦箇所 | 再発条件 | 今回の対処 | 再利用ルール |
| --- | --- | --- | --- |
| fuzzy search が非一致 query まで候補化する | subsequence score 0 でも定数 boost を足す | `score > 0` 条件を先に切り、no match を空配列へ戻した | fuzzy score は「一致判定」と「順位補正」を分離する |
| file read が hang すると preview 全体が loading に残る | renderer 側 timeout がなく IPC 成功/失敗待ちに依存する | `Promise.race` で 5秒 timeout を追加し、3回 retry 後に明示 error へ落とした | preview 系の invoke は renderer timeout + retry を標準にする |
| structured preview parse error が full error になり UX が途切れる | JSON/YAML 整形失敗を致命的 error と同列扱いする | alert banner + `SourceView` fallback に分離した | parse error は recoverable error として source fallback を残す |

### 関連未タスク

| タスクID | 目的 | 優先度 | タスク仕様書 |
| --- | --- | --- | --- |
| UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001 | Workspace Preview / QuickFileSearch の fuzzy no-match、renderer timeout+retry、error taxonomy を共通ガードへ昇格する | 中 | `docs/30-workflows/unassigned-task/task-imp-workspace-preview-search-resilience-guard-001.md` |

---

## Light Theme Contrast Regression Guard（TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001）

> **詳細仕様**: [workflow-light-theme-contrast-regression-guard.md](./workflow-light-theme-contrast-regression-guard.md)

light theme remediation を直接行わず、representative screen と hardcoded color audit で回帰を検出する guard workflow。current build static serve と selector-based capture を正本手順に固定する。

### 実装内容（要点）

| 項目 | 内容 |
| --- | --- |
| audit | `ThemeSelector` / `AuthView` / `WorkspaceSearchPanel` を baseline、`SettingsView` / `DashboardView` を current として監査 |
| harness | `phase11-light-theme-contrast-guard.html` と `phase11-light-theme-contrast-guard.tsx` を build output に含める |
| readiness | `ThemeSelector` / `AuthView` に minimal な `data-testid` を追加 |
| capture | Settings / Dashboard / Auth / WorkspaceSearch + Dashboard dark baseline の 5 ケースを取得 |

### 実測結果

| 項目 | 値 |
| --- | --- |
| currentViolations | 0 |
| baselineViolations | 64 |
| screenshot | 5 png + metadata 1件 |
| targeted tests | 46 PASS |

### Apple UI/UX 視覚レビュー

| 画面 | 判定 | 所見 |
| --- | --- | --- |
| Settings light | PASS with baseline note | settings shell は読めるが ThemeSelector の淡い chip が弱い |
| Dashboard light | PASS | hierarchy / spacing / materiality が安定 |
| Auth light | PASS with baseline note | helper text が light panel 上で沈む |
| WorkspaceSearch light | PASS with baseline note | light 指定でも dark slate surface が残るため remediation 対象が明確 |

### baseline backlog routing

| backlog | 参照 |
| --- | --- |
| ThemeSelector / Auth / WorkspaceSearch の actual remediation | `docs/30-workflows/completed-tasks/light-theme-token-foundation/unassigned-task/task-fix-light-theme-shared-color-migration-001.md` |
| current build capture preflight bundle | `docs/30-workflows/unassigned-task/task-imp-phase11-current-build-preflight-bundle-001.md` |
| guard workflow の維持 | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/` |

### 再利用ルール

1. guard workflow は remediation task と分離する。
2. current build screenshot は build artifact を static serve して取得する。
3. selector-based capture を優先し、route 全景は fallback に留める。
4. `current=0` でも baseline backlog と routing を必ず残す。

---

## ChatPanel 実チャット配線設計（TASK-IMP-CHATPANEL-REAL-AI-CHAT-001）

TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 で設計された ChatPanel の実チャット配線仕様。placeholder 3箇所（model-selector-slot, message-list-slot, chat-input-slot）を実コンポーネントに置換する設計。

### コンポーネント階層

| コンポーネント | 種類 | 親 | 役割 |
| --- | --- | --- | --- |
| `ChatPanel` | organism | view | 全体制御、8状態管理、IPC結線 |
| `RuntimeBanner` | molecule | `ChatPanel` | AccessCapability（integratedRuntime/terminalSurface/both/none）を視覚表示 |
| `ChatMessageList` | organism | `ChatPanel` | 会話履歴の一覧表示、role="log" aria-live="polite" |
| `ChatMessage` | molecule | `ChatMessageList` | user/assistant メッセージ表示 |
| `StreamingMessage` | molecule | `ChatMessageList` | ストリーミング中のリアルタイム表示（既存活用） |
| `ErrorGuidance` | molecule | `ChatPanel` | retryable エラー時の再試行導線表示 |
| `HandoffBlock` | molecule | `ChatPanel` | handoff 状態時のターミナル起動促進表示 |
| `PersistentTerminalLauncher` | molecule | `HandoffBlock` | ターミナルコマンド表示とコピー/起動ボタン |
| `ComposerArea` | molecule | `ChatPanel` | ComposerInput + SendButton の統合エリア |
| `ComposerInput` | atom | `ComposerArea` | テキスト入力フィールド（P42 3段バリデーション対応） |
| `SendButton` | atom | `ComposerArea` | 送信ボタン（streaming中は disabled） |
| `LLMSelectorPanel` | organism | `ChatPanel` | プロバイダー/モデル選択（既存活用） |

### 8状態 UI 表示テーブル

| 状態 | RuntimeBanner | ChatMessageList | ComposerArea | ErrorGuidance | HandoffBlock |
| --- | --- | --- | --- | --- | --- |
| `idle` | - | - | disabled | - | - |
| `ready` | capability表示 | 履歴表示 | enabled | - | - |
| `streaming` | capability表示 | +StreamingMessage | cancel可（送信disabled） | - | - |
| `cancelled` | capability表示 | 履歴+中断メッセージ | enabled | - | - |
| `completed` | capability表示 | 履歴+完了メッセージ | enabled | - | - |
| `error` | capability表示 | 履歴+エラー表示 | enabled | retryableのみ表示 | - |
| `blocked` | capability表示 | - | 非表示 | 表示 | - |
| `handoff` | capability表示 | - | 非表示 | - | 表示 |

### UI 契約

| 項目 | 契約 |
| --- | --- |
| blocked 導線 | Provider/Model 未設定時は `ErrorGuidance` を表示し、設定画面への導線を提供する（P62 準拠） |
| stream cancel | streaming 中は ComposerArea の SendButton を cancel ボタンへ切り替え、`llm:cancel-stream` を呼び出す |
| 入力バリデーション | ComposerInput は `typeof` → `=== ""` → `.trim() === ""` の P42 準拠 3段バリデーションで空送信を防止 |
| 状態フック | `useStreamingChat()` が `{ state: { isStreaming, content, error }, actions: { startStream, cancelStream } }` を提供 |
| セレクタ | P31/P48 準拠で個別セレクタ + `useShallow` を使用し、派生セレクタの無限ループを防止 |
| a11y | `ChatMessageList` は `role="log"` + `aria-live="polite"`、`ErrorGuidance` は `role="alert"` を維持する |

### 関連タスク

| タスクID | 内容 | ステータス |
| --- | --- | --- |
| TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 | ChatPanel placeholder → 実コンポーネント置換、8状態管理、IPC配線 | 設計完了（2026-03-18） |

### 関連未タスク（Phase 7/8/10 検出）

| タスクID | 内容 | 優先度 | 指示書 |
| --- | --- | --- | --- |
| UT-CHATPANEL-GUARD-001 | handleSendMessage ストリーミング中ガード追加 | LOW | `docs/30-workflows/unassigned-task/task-chatpanel-streaming-guard.md` |
| UT-CHATPANEL-COV-001 | ChatPanel handleNavigateToSettings テスト追加 | LOW | `docs/30-workflows/unassigned-task/task-chatpanel-function-coverage-handlenavigatetosettings.md` |
| UT-CHATPANEL-COV-002 | chatSlice streaming系アクション直接テスト追加 | MEDIUM | `docs/30-workflows/unassigned-task/task-chatslice-streaming-actions-test.md` |
| UT-CHATPANEL-COV-003 | useStreamingChat 専用テストファイル作成 | HIGH | `docs/30-workflows/unassigned-task/task-usestreamingchat-test-creation.md` |
| UT-CHATPANEL-STUB-001 | ChatPanel スタブコンポーネント本格実装 | LOW | `docs/30-workflows/unassigned-task/task-chatpanel-stub-components-implementation.md` |
| UT-CHATPANEL-REFACTOR-001 | パルスカーソル表示ロジック共通化 | LOW | `docs/30-workflows/unassigned-task/task-streaming-pulse-cursor-commonization.md` |

---

## SkillStreamDisplay コンポーネント（TASK-3-2）

> **詳細仕様**: [ui-ux-feature-skill-stream.md](./ui-ux-feature-skill-stream.md)

スキル実行結果をリアルタイムでストリーミング表示するUIコンポーネント群。TASK-3-2シリーズで段階的に機能拡張。

### コンポーネント概要

| コンポーネント     | 責務                             | 主要機能                       |
| ------------------ | -------------------------------- | ------------------------------ |
| SkillStreamDisplay | スキル実行ストリームの表示・制御 | 実行開始/中断/リセット         |
| useSkillExecution  | 状態管理・IPC通信                | メッセージ管理、ステータス追跡 |
| MessageTimestamp   | 相対時刻表示                     | 自動更新、i18n対応             |
| CopyButton         | クリップボードコピー             | フィードバック表示             |

### タスク履歴

| タスクID   | 機能名                 | 完了日     | 主要追加機能                                     |
| ---------- | ---------------------- | ---------- | ------------------------------------------------ |
| TASK-3-2   | 基盤実装               | 2026-01-25 | SkillStreamDisplay、useSkillExecution            |
| TASK-3-2-A | UX改善                 | 2026-01-27 | LoadingSpinner、MessageTimestamp、CopyButton     |
| TASK-3-2-B | i18n対応               | 2026-01-28 | formatRelativeTime locale対応、日英2言語         |
| TASK-3-2-C | タイムスタンプ自動更新 | 2026-01-28 | TimestampContext、useInterval、usePageVisibility |

### IPC API概要

| メソッド  | 用途                     |
| --------- | ------------------------ |
| execute   | スキル実行開始           |
| onStream  | ストリームメッセージ購読 |
| abort     | 実行中断                 |
| getStatus | ステータス照会           |

### 認証 preflight UX ガード（TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001）

`useSkillExecution` / `AgentView` / `agentSlice.executeSkill` は、実行前に `auth-key:exists` を使った preflight を実施する。`exists=false` の場合は execute を中断し、設定導線メッセージを優先表示する。

| 観点 | 仕様 |
| --- | --- |
| 実行前判定 | `preflightSkillExecutionAuth()` が `ok=false` を返したら `skill:execute` を呼ばない |
| ユーザー導線 | 「設定画面でAPIキーを登録してください。」を表示 |
| エラーコード | `AUTHENTICATION_ERROR` を UI 層で保持し、後続分岐に利用 |
| 回帰観測点 | execute 呼び出し抑止、二重状態遷移なし、トースト/エラー表示の整合 |

**画面証跡（Phase 11）**:
- `docs/30-workflows/TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001/outputs/phase-11/screenshots/TC-01-agent-view-before-execute-2026-03-04.png`
- `docs/30-workflows/TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001/outputs/phase-11/screenshots/TC-02-agent-view-auth-preflight-error-2026-03-04.png`
- `docs/30-workflows/TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001/outputs/phase-11/screenshots/TC-03-agent-view-before-execute-recheck-2026-03-04.png`

---

## i18n対応（TASK-3-2-B）

SkillStreamDisplayコンポーネントの多言語対応機能。

### 対応言語

| 言語   | ロケールコード | フォールバック |
| ------ | -------------- | -------------- |
| 日本語 | ja             | -（デフォルト）|
| 英語   | en             | ja             |

### 使用ライブラリ

| ライブラリ                       | バージョン | 用途                 |
| -------------------------------- | ---------- | -------------------- |
| i18next                          | ^23.x      | 国際化フレームワーク |
| react-i18next                    | ^14.x      | React統合            |
| i18next-browser-languagedetector | ^7.x       | 言語自動検出         |

### 翻訳対象

| カテゴリ | 対象テキスト                       |
| -------- | ---------------------------------- |
| status   | 待機中, 実行中, 完了, エラー, 中断 |
| time     | たった今, X秒前, X分前, X時間前, X日前 |
| button   | 中断, リセット                     |
| aria     | 実行中, メッセージをコピー, etc.   |
| feedback | コピーしました                     |

### i18n設定

| 項目        | パス                                         |
| ----------- | -------------------------------------------- |
| 設定ファイル | `apps/desktop/src/renderer/i18n/config.ts`   |
| 型定義      | `apps/desktop/src/renderer/i18n/types.d.ts`  |
| 日本語翻訳  | `apps/desktop/src/renderer/i18n/locales/ja/skill-stream.json` |
| 英語翻訳    | `apps/desktop/src/renderer/i18n/locales/en/skill-stream.json` |

### テスト品質（TASK-3-2-B）

| ファイル                         | テスト数 | カバレッジ |
| -------------------------------- | -------- | ---------- |
| config.test.ts                   | 20       | 100%       |
| formatTime.i18n.test.ts          | 30       | 100%       |
| SkillStreamDisplay.i18n.test.tsx | 24       | 100%       |
| 合計                             | 74       | -          |

---

## 完了タスク

### TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001（2026-03-18 完了）

WorkspaceChatPanel の AI Runtime 整合。P62 三層防御（UI canSend / Controller guard / Main validation）を導入し、DEFAULT_CONFIG fallback を排除。

| 項目           | 内容                                                                    |
| -------------- | ----------------------------------------------------------------------- |
| タスクID       | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001                            |
| ステータス     | **完了**                                                                |
| テスト数       | 77（自動）+ 8（手動）                                                  |
| 5領域構成      | header / file context chips / message log / composer / guidance block  |
| 状態遷移       | idle → sending → streaming → completed / cancelled / error / blocked   |
| 実装ガイド     | `docs/30-workflows/.../outputs/phase-12/implementation-guide.md`        |
| 未タスク       | 3件（controller hook 抽出 / CompactLayout 統合 / AccessCapability 統合）|


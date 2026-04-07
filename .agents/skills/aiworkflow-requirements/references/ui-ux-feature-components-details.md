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
| `WorkspaceChatInput` | molecule | `WorkspaceChatPanel` | 送信・mention・cancel・legacy error fallback 表示 |
| `StreamingErrorDisplay` | molecule | `WorkspaceChatPanel` | structured streaming error の primary 表示 |
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
| stream error | `StreamingErrorDisplay` が `streamingError` を primary surface として扱い、`errorMessage` は inline fallback としてのみ使う |
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

### 完了タスク記録（TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR）

| 項目 | 内容 |
| --- | --- |
| 完了日 | 2026-03-22 |
| 対象 | `WorkspaceChatPanel` / `StreamingErrorDisplay` / `useWorkspaceChatController` |
| 要点 | `streamingError` を primary にし、`errorMessage` は legacy fallback に分離。`Settings` / `Retry` / dismiss の3導線を統合した |

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
| UT-REFACTOR-WORKSPACE-CHAT-CONTROLLER-HOOK-001 | useWorkspaceChatController 640行リファクタリング（責務分割） | 中 | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-ut-refactor-workspace-chat-controller-hook-001.md` |
| UT-INTEGRATE-COMPACT-LAYOUT-WORKSPACE-CHAT-001 | CompactLayout との WorkspaceChatPanel 統合 | 低 | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-ut-integrate-compact-layout-workspace-chat-001.md` |
| UT-INTEGRATE-ACCESS-CAPABILITY-RESOLVER-WORKSPACE-001 | AccessCapabilityResolver による Workspace 機能制御統合 | 高 | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-ut-integrate-access-capability-resolver-workspace-001.md` |

---

## Slide Workspace Runtime Alignment（TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001）

> **ステータス**: `UI implemented with runtime follow-up`（2026-03-21 同期）

SlideWorkspace は slide runtime/auth-mode alignment の user-facing surface。current branch では task 09 で定義した 4領域 UI が renderer へ実装済みで、残課題は runtime / IPC 契約の未収束部分に絞られる。

### 4領域コンポーネント

| コンポーネント | 役割 | 状態 |
| --- | --- | --- |
| `SlideSyncCard` | project path、sync state、最終同期時刻、degraded reason を集約 | 実装済み |
| `SlideProgressRow` | running 時の progress / cancel surface | 実装済み |
| `SlideWatchStatus` | watcher 接続状態を表示 | 実装済み |
| `SlideGuidanceBlock` | degraded / guidance 時の reason と CTA を表示 | 実装済み |

### 状態と CTA

| UI 状態 | 表示条件 | 主 CTA | current branch 備考 |
| --- | --- | --- | --- |
| `synced` | handoff なし、error なし、syncing でもない | phase 実行 | `out-of-sync` はこのシェルへ吸収される |
| `running` | phase 実行中または `syncing` | cancel | `SlideProgressRow` を表示 |
| `degraded` | `error !== null` または `syncStatus === "error"` | retry / terminal fallback | retry は `manualSync` へ結線済み |
| `guidance` | `handoffGuidance !== null` | settings / terminal fallback | 設定画面へ遷移可能 |

### 実装詳細

| 項目 | current branch の挙動 |
| --- | --- |
| `SlideSyncCard` | `variantStyles` を export し、synced badge は黒文字でコントラスト改善済み |
| `SlideWatchStatus` | `watchPath={project.path}` を渡し、監視中 / 停止中を明示 |
| `SlideGuidanceBlock` | guidance/degraded で別タイトル・手順・CTA を出し分ける |
| `TerminalLauncher` | `handoffGuidance.terminalCommand` を表示し、copy は実動作する |

**Persistent Terminal Launcher**: 全状態で右下固定表示。現状の `onLaunch` は native terminal IPC が無いため copy fallback として動作する。

### current audit（2026-03-21）

| 観点 | 現在の確認結果 |
| --- | --- |
| empty state | open CTA が存在 |
| synced state | sync card / watch status / phase panel が表示される |
| guidance state | `handoffGuidance` を起点に settings 導線と terminal command を表示 |
| running state | progress / cancel surface が表示される |
| degraded state | reason / retry / terminal fallback を表示 |
| out-of-sync | `synced` シェルへ吸収。reverse-sync 専用表現は未実装 |

### screenshot 証跡

| TC-ID | 証跡 |
| --- | --- |
| `TC-11-01` | `docs/30-workflows/ut-slide-ui-001/outputs/phase-11/screenshots/TC-11-01-empty-light.png` / `TC-11-01-empty-dark.png` |
| `TC-11-02` | `docs/30-workflows/ut-slide-ui-001/outputs/phase-11/screenshots/TC-11-02-synced-light.png` / `TC-11-02-synced-dark.png` |
| `TC-11-03` | `docs/30-workflows/ut-slide-ui-001/outputs/phase-11/screenshots/TC-11-03-running-light.png` / `TC-11-03-running-dark.png` |
| `TC-11-04` | `docs/30-workflows/ut-slide-ui-001/outputs/phase-11/screenshots/TC-11-04-degraded-light.png` / `TC-11-04-degraded-dark.png` |
| `TC-11-05` | `docs/30-workflows/ut-slide-ui-001/outputs/phase-11/screenshots/TC-11-05-guidance-light.png` / `TC-11-05-guidance-dark.png` |

| 補助証跡 | パス |
| --- | --- |
| metadata | `docs/30-workflows/ut-slide-ui-001/outputs/phase-11/screenshots/phase11-capture-metadata.json` |
| manual result | `docs/30-workflows/ut-slide-ui-001/outputs/phase-11/manual-test-result.md` |

live preview は `esbuild` native binary mismatch で失敗したため、current workflow では static fallback capture を正式証跡として扱う。

### follow-up

| 未タスクID | 内容 |
| --- | --- |
| `UT-SLIDE-IMPL-001` | runtime/auth-mode 実装収束、native terminal 起動、reverse-sync surface |
| `UT-SLIDE-UI-CLOSE-ERROR-001` | close/cancel エラーの UI surfacing |
| `UT-SLIDE-UI-HIG-LEGACY-001` | legacy slide コンポーネントの色統一 |

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
| UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001 | Workspace Preview / QuickFileSearch の fuzzy no-match、renderer timeout+retry、error taxonomy を共通ガードへ昇格する | 中 | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-imp-workspace-preview-search-resilience-guard-001.md` |

---



---

## 続き

後半コンテンツは分割ファイルを参照:
- [ui-ux-feature-components-theme-chat.md](ui-ux-feature-components-theme-chat.md) — Light Theme + ChatPanel実チャット配線設計

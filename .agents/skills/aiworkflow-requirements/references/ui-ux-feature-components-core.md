# 機能別 UI コンポーネント / core specification

> 親仕様書: [ui-ux-feature-components.md](ui-ux-feature-components.md)
> 役割: core specification

## 概要

本ドキュメントはAIWorkflowOrchestratorの機能別UIコンポーネント群の仕様を集約する。各機能は独立したセクションとして記述され、コンポーネント階層・仕様・IPC API・テスト要件を定義する。

### 収録機能一覧

| 機能                                                                  | タスクID                                | 主要コンポーネント                                                                               | 状態                       | 詳細仕様                                                                                                  |
| --------------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------- | --------------------------------------------------------------------------------------------------------- |
| Community Visualization                                               | CONV-08-05                              | CommunityGraph, CommunityDetailPanel                                                             | 完了                       | 本ファイル                                                                                                |
| Custom Execution Environment                                          | AGENT-006                               | ExecutionEnvironment, HTMLPreviewEnvironment                                                     | 完了                       | 本ファイル                                                                                                |
| Workspace Chat Edit                                                   | Issue #468, #494                        | FileAttachmentButton, FileContextList, DiffPreview                                               | 完了                       | 本ファイル                                                                                                |
| Workspace Layout Foundation                                           | TASK-UI-04A                             | WorkspaceView, FileBrowserPanel, PanelToggleBar, WorkspaceStatusBar                              | 完了（Phase 13保留）       | `docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser/`                        |
| Workspace Chat Panel                                                  | TASK-UI-04B                             | WorkspaceChatPanel, WorkspaceChatInput, WorkspaceChatMessageList, WorkspaceMentionDropdown       | 完了（Phase 1-12）         | `docs/30-workflows/task-059a-ui-04b-workspace-chat-panel/`                                                |
| Workspace Preview / Quick Search                                      | TASK-UI-04C                             | PreviewPanel, PreviewToolbar, QuickFileSearch, SourceView                                        | 完了（Phase 13保留）       | `docs/30-workflows/completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch/`                       |
| Skill Stream Display                                                  | TASK-3-2                                | SkillStreamDisplay, useSkillExecution                                                            | 完了                       | [ui-ux-feature-skill-stream.md](./ui-ux-feature-skill-stream.md)                                          |
| Skill Stream Copy History                                             | TASK-3-2-D                              | CopyHistoryPanel, CopyHistoryContext, useCopyHistory                                             | 完了                       | [ui-ux-feature-skill-stream.md](./ui-ux-feature-skill-stream.md)                                          |
| Skill Editor UI                                                       | TASK-9A                                 | SkillEditor, SkillCodeEditor                                                                     | 完了                       | `docs/30-workflows/completed-tasks/TASK-9A-skill-editor/`                                                 |
| Skill Center View                                                     | TASK-UI-05                              | SkillCenterView, FeaturedSection, SkillDetailPanel                                               | 完了                       | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/`                                         |
| Skill Center CTA Routing                                              | TASK-SKILL-LIFECYCLE-02                 | SkillLifecycleJourneyPanel, HeaderCTA, useSkillCenter nav                                        | 完了                       | `docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-02-skillcenter-create-route/`           |
| Skill Detail Action Buttons                                           | TASK-IMP-SKILLDETAIL-ACTION-BUTTONS-001 | SkillDetailPanel, useSkillCenter, SkillEditorView, SkillAnalysisView                             | 完了                       | `docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-03-skilldetail-action-buttons/`         |
| Skill Editor View                                                     | TASK-UI-05A                             | SkillEditorView, FileTreePanel, EditorPanel                                                      | spec_created（統合未完了） | `docs/30-workflows/skill-editor-view/`                                                                    |
| Skill Analysis View                                                   | TASK-10A-B                              | SkillAnalysisView, ScoreDisplay, SuggestionList, RiskPanel                                       | 完了                       | `docs/30-workflows/completed-tasks/skill-analysis-view/`                                                  |
| Skill Create Wizard                                                   | TASK-10A-C                              | SkillCreateWizard, StepIndicator, SkillInfo/Configure/Generate/Complete                          | 完了                       | `docs/30-workflows/completed-tasks/skill-create-wizard/`                                                  |
| Store-Driven Lifecycle Integration                                    | TASK-10A-F                              | SkillAnalysisView, SkillCreateWizard, useSkillAnalysis                                           | 完了                       | `docs/30-workflows/store-driven-lifecycle-ui/`                                                            |
| Skill Runtime API Key Panel                                           | TASK-RT-04                              | SkillLifecyclePanel, ApiKeySettingsPanel                                                         | 完了                       | `docs/30-workflows/step-08-par-task-rt-04-api-key-management-ui/`                                         |
| LLM Adapter Error Banner                                              | TASK-RT-01                              | LLMAdapterErrorBanner, useLLMAdapterStatus                                                       | 完了                       | 本ファイル                                                                                                |
| Organisms Foundation                                                  | TASK-UI-00-ORGANISMS                    | CardGrid, MasterDetailLayout, SearchFilterList                                                   | 完了                       | `docs/30-workflows/completed-tasks/task-054-ui-00-4-organisms-components/`                                |
| Global Navigation Core                                                | TASK-UI-02                              | GlobalNavStrip, MobileNavBar, MoreMenu, AppLayout, useNavShortcuts                               | 完了                       | [ui-ux-navigation.md](./ui-ux-navigation.md)                                                              |
| Skill Advanced Views                                                  | TASK-UI-05B                             | SkillChainBuilder, ScheduleManager, DebugPanel, AnalyticsDashboard                               | 完了                       | `docs/30-workflows/completed-tasks/TASK-UI-05B-SKILL-ADVANCED-VIEWS/`                                     |
| Notification / History Domain                                         | TASK-UI-01-C                            | NotificationCenter, HistorySearchView                                                            | 完了                       | `docs/30-workflows/completed-tasks/task-056c-notification-history-domain/`                                |
| History Timeline Refresh                                              | TASK-UI-06                              | HistorySearchView, HistorySearchBar, TimelineGroup, Chat/File/Skill cards                        | 完了                       | [ui-history-search-view.md](./ui-history-search-view.md)                                                  |
| AgentView Redesign (Tap & Discover)                                   | TASK-UI-03                              | SkillChip, ExecuteButton, FloatingExecutionBar, AdvancedSettingsPanel, RecentExecutionList       | 完了                       | `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/`                                    |
| Dashboard Home Enhancement                                            | TASK-UI-07                              | DashboardView, GreetingHeader, DashboardSuggestionSection, RecentTimeline                        | 完了                       | `docs/30-workflows/completed-tasks/task-058d-ui-07-dashboard-enhancement/`                                |
| ChatPanel Real AI Chat Wiring                                         | TASK-IMP-CHATPANEL-REAL-AI-CHAT-001     | RuntimeBanner, ChatMessageList, ComposerArea, ErrorGuidance, HandoffBlock                        | spec_created               | `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-seq-task-05-chatpanel-real-chat-wiring/` |
| UI→Runtime Connection (plan/execute)                                  | TASK-SC-06-UI-RUNTIME-CONNECTION        | SkillLifecyclePanel, agentSlice, store/index.ts                                                  | 完了                       | `docs/30-workflows/w4b-2-sc-ui-runtime-connection/`                                                       |
| Wizard LLM / template Flow                                            | TASK-SC-07                              | SkillCreateWizard, SkillInfoStep, ConversationRoundStep, GenerateStep, CompleteStep             | 完了                       | `docs/30-workflows/TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION/`                                       |
| Wizard LLM Generation Flow（W2-seq-03a）                              | TASK-SC-07                              | SkillCreateWizard, SkillInfoStep, ConversationRoundStep, GenerateStep, CompleteStep              | 完了（2026-04-09）         | `docs/30-workflows/completed-tasks/TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION/`                        |
| Skill Create Wizard — SkillInfoStep（Redesign W1）                    | UT-SKILL-WIZARD-W1-par-02a              | SkillInfoStep                                                                                    | 完了                       | `docs/30-workflows/W1-par-02a-skill-info-step/`                                                           |
| Skill Lifecycle Panel — ウィザード遷移ボタン化（Redesign W1-par-02d） | UT-SKILL-WIZARD-W1-par-02d              | SkillLifecyclePanel（`onOpenSkillWizard` Props追加・テキストエリア削除・ウィザード起動ボタン化） | 完了                       | `docs/30-workflows/W1-par-02d-lifecycle-panel/`                                                           |

#### 未タスク（TASK-SC-06 後続）

- TASK-SC-07: SkillCreateWizard への LLM / template 併用フロー接続 → **完了**（2026-04-09）
- [TASK-SC-08](../../../../docs/30-workflows/unassigned-task/TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE.md): onProgress コールバックによるリアルタイムプログレス更新
- [TASK-SC-09](../../../../docs/30-workflows/unassigned-task/TASK-SC-09-IMPROVE-MODE-HANDLING.md): detectMode "improve" モードハンドリング実装
- [TASK-SC-10](../../../../docs/30-workflows/unassigned-task/TASK-SC-10-AGENT-SLICE-GENERATION-SPLIT.md): agentSlice LLM Generation state を generationSlice に分割
- [TASK-SC-11](../../../../docs/30-workflows/unassigned-task/TASK-SC-11-ABORT-CONTROLLER-PLAN-CANCEL.md): AbortController による planSkill/executePlan キャンセル機構
- [TASK-SC-12](../../../../docs/30-workflows/unassigned-task/TASK-SC-12-HYBRID-STATE-PATTERN-GUIDE.md): Hybrid State Pattern ガイドドキュメント化

### 共通仕様

| 項目                 | 基準                              |
| -------------------- | --------------------------------- |
| アクセシビリティ     | WCAG 2.1 AA準拠                   |
| スタイリング         | Tailwind CSS + cn()ユーティリティ |
| 状態管理             | Zustand                           |
| テストフレームワーク | Vitest + React Testing Library    |
| Storybook            | 全コンポーネント必須              |

---

## Skill Runtime API Key Panel（TASK-RT-04）

`SkillLifecyclePanel` 上で Claude Agent SDK 向け auth key 設定導線を補助表示する。`SettingsView` を主導線とし、本パネルは同一 `auth-key:*` 契約を再利用する補助導線として扱う。

### コンポーネント責務

| コンポーネント        | 役割                                | 契約                                                              |
| --------------------- | ----------------------------------- | ----------------------------------------------------------------- |
| `SkillLifecyclePanel` | runtime lane 操作面での補助導線表示 | `ApiKeySettingsPanel` を常時表示し、既存 lifecycle 操作と並置する |
| `ApiKeySettingsPanel` | key の保存/削除/状態表示            | `window.electronAPI.authKey.exists/set/delete` を利用する         |

### 状態遷移ルール

| 条件                                              | UI状態              |
| ------------------------------------------------- | ------------------- |
| 初期 `exists=false`                               | `not_set`           |
| 保存開始                                          | `validating`        |
| 保存成功                                          | `configured`        |
| 保存/削除失敗                                     | `error`             |
| 削除成功後に `exists=true`（`env-fallback` など） | `configured` を維持 |
| 削除成功後に `exists=false`                       | `not_set`           |

### Severity フィルタ（UT-SDK-L34-UI-DISPLAY-SEVERITY-FILTER-001）

`SkillLifecyclePanel` の Layer3/4 verify detail に severity ベースのフィルタを提供する。check 件数が多いスキルでも重要度の高い問題に集中できる UI 拡張。Renderer 内完結の変更で、IPC / shared type / preload の変更はない。

#### フィルタ値

| フィルタ値 | UI 表示ラベル | 表示対象                  | 既定 |
| ---------- | ------------- | ------------------------- | ---- |
| `all`      | `すべて`      | 全件表示                  | ✓    |
| `warning+` | `⚠ Warning+`  | `warning` と `error` のみ | -    |
| `error`    | `✗ Error`     | `error` のみ              | -    |

#### 状態管理

- `severityFilter` は `useState<'all' | 'warning+' | 'error'>('all')` で管理
- `expandedLayers` state とは独立（責務分離）
- reverify 時にリセットしない（ユーザー選択を維持）
- `useMemo` で `checksByLayer` から filter 条件に合致する check のみを抽出
- filter 適用後に check が 0 件の Layer は非表示
- `warning+` / `error` 選択時のみ件数サマリを表示する

#### ARIA 属性

| 要素                   | 属性                                           |
| ---------------------- | ---------------------------------------------- |
| セグメントコントロール | `role="group"`, `aria-label="Severity filter"` |
| 各フィルタボタン       | `aria-pressed` によるトグル状態                |

#### 件数サマリ

`warning+` または `error` が選択されたときのみ、`role="status"` のライブ領域で `表示中 X / 全 Y 件` を表示する。フィルタ結果を視覚・音声の両方で即時に把握できるようにするための補助情報である。

---

## LLM Adapter Error Banner（TASK-RT-01）

`SkillLifecyclePanel` の最上部に置く失敗通知 surface。Main プロセスが保持する LLMAdapter の状態を preload 経由で pull + push し、`failed` 状態のときのみエラーバナーを表示する。

### コンポーネント階層

| コンポーネント          | 種類     | 親                    | 子要素 / 役割                                                         |
| ----------------------- | -------- | --------------------- | --------------------------------------------------------------------- |
| `SkillLifecyclePanel`   | organism | -                     | banner の配置先。`LLMAdapterErrorBanner` を最上部へ挿入               |
| `useLLMAdapterStatus`   | hook     | `SkillLifecyclePanel` | `skillCreator.getAdapterStatus()` / `onAdapterStatusChanged()` を同期 |
| `LLMAdapterErrorBanner` | molecule | `SkillLifecyclePanel` | エラー表示、任意の設定導線、`role="alert"`                            |

### 表示ルール

| 条件                                                       | 挙動                                                                                    |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `status !== "failed"`                                      | `null` を返して非表示                                                                   |
| `failureReason` が `api.?key` / `ANTHROPIC_API_KEY` を含む | 「APIキーが設定されていないか、無効です。設定画面でAPIキーを確認してください。」 を表示 |
| 上記以外の `failed`                                        | `LLMアダプターの初期化に失敗しました: <failureReason>` を表示                           |
| `onOpenSettings` がある                                    | 「設定を開く」ボタンを表示し、設定導線を再利用                                          |

### アクセシビリティ

| 要素             | 要件                                       |
| ---------------- | ------------------------------------------ |
| banner container | `role="alert"`                             |
| warning icon     | `aria-hidden="true"`                       |
| action button    | 通常の `button` として keyboard focus 可能 |
| theme            | light / dark でコントラストを維持          |

### 実装連携

- `LLMAdapterStatusPayload` は `packages/shared/src/types/skillCreator.ts` の正本を使う
- `SkillLifecyclePanel` は banner の有無に関わらず既存の作成 / 実行 / 改善導線を維持する
- `validate-phase11-screenshot-coverage.js` の対象 TC-11-01〜TC-11-06 で視覚回帰を固定する
- `phase11-capture-metadata.json` と `screenshot-plan.json` は current build の撮影証跡として残す

---

## Community Visualization UI コンポーネント（CONV-08-05）

コミュニティ構造を可視化するUIコンポーネント群。グラフベースのコミュニティ表示、フィルタリング、検索、詳細表示などの機能を提供する。

### コンポーネント階層

| コンポーネント         | 種類      | 親                     | 子要素                                                               |
| ---------------------- | --------- | ---------------------- | -------------------------------------------------------------------- |
| CommunityVisualization | templates | -                      | CommunityFilter, CommunityGraph, CommunityDetailPanel                |
| CommunityFilter        | organisms | CommunityVisualization | レベル選択ドロップダウン, 検索入力                                   |
| CommunityGraph         | organisms | CommunityVisualization | SVGベースのグラフ描画, ノード（コミュニティ）, エッジ（親子関係）    |
| CommunityDetailPanel   | organisms | CommunityVisualization | 基本情報, 要約テキスト, キーワードリスト, メンバーエンティティリスト |

### コンポーネント仕様

#### CommunityVisualization

| 項目     | 仕様                                                                               |
| -------- | ---------------------------------------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/components/community/templates/CommunityVisualization/` |
| 責務     | 全体レイアウト、状態管理、コンポーネント統合                                       |
| Props    | `className?: string`                                                               |

**レイアウト構造**

画面は3つの領域で構成される。

| 領域           | 位置           | 内容                                               |
| -------------- | -------------- | -------------------------------------------------- |
| フィルターバー | 上部（全幅）   | レベル選択と検索入力を配置                         |
| グラフエリア   | 左側（メイン） | コミュニティグラフをズーム/パン対応で表示          |
| 詳細パネル     | 右側（サブ）   | 選択したコミュニティの詳細情報を表示（選択時のみ） |

#### CommunityGraph

| 項目     | 仕様                                                                       |
| -------- | -------------------------------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/components/community/organisms/CommunityGraph/` |
| 責務     | SVGベースのグラフ描画、ズーム/パン、ノード選択                             |
| Props    | `communities`, `selectedId`, `highlightedIds`, `onSelect`, `onZoomChange`  |

**機能**

| 機能           | 説明                                |
| -------------- | ----------------------------------- |
| 階層レイアウト | dagreアルゴリズムによるレベル別配置 |
| ズーム/パン    | マウスホイール、ドラッグ操作        |
| ノード選択     | クリックで選択、詳細パネル表示      |
| ハイライト     | 検索結果マッチノードの強調表示      |
| キーボード操作 | Tab/Enter/Escapeでナビゲーション    |

#### CommunityDetailPanel

| 項目     | 仕様                                                                             |
| -------- | -------------------------------------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/components/community/organisms/CommunityDetailPanel/` |
| 責務     | 選択コミュニティの詳細情報表示                                                   |
| Props    | `community`, `summary`, `members`, `isLoading`, `onClose`                        |

**表示内容**

| セクション       | 内容                                 |
| ---------------- | ------------------------------------ |
| ヘッダー         | コミュニティID、レベル、サイズ       |
| 要約             | CommunitySummaryのテキスト           |
| キーワード       | タグ形式で表示                       |
| 主要エンティティ | 重要度順リスト                       |
| センチメント     | ポジティブ/ニュートラル/ネガティブ   |
| メンバー         | エンティティリスト（スクロール可能） |

#### CommunityFilter

| 項目     | 仕様                                                                                |
| -------- | ----------------------------------------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/components/community/organisms/CommunityFilter/`         |
| 責務     | レベルフィルタリング、検索機能                                                      |
| Props    | `levels`, `selectedLevel`, `searchQuery`, `totalCount`, `filteredCount`, `onChange` |

**機能**

| 機能           | 説明                               |
| -------------- | ---------------------------------- |
| レベル選択     | ドロップダウンで階層レベル絞り込み |
| キーワード検索 | デバウンス付きテキスト入力         |
| カウント表示   | フィルター結果件数表示             |
| クリア         | Escapeキーまたはクリアボタン       |

### IPC API

CommunityAPIは以下のメソッドを提供する。

| メソッド   | 引数                     | 戻り値                                      | 説明                         |
| ---------- | ------------------------ | ------------------------------------------- | ---------------------------- |
| getAll     | なし                     | `Promise<Result<Community[]>>`              | 全コミュニティ取得           |
| getByLevel | level: number            | `Promise<Result<Community[]>>`              | レベル指定でコミュニティ取得 |
| getSummary | communityId: CommunityId | `Promise<Result<CommunitySummary \| null>>` | コミュニティサマリー取得     |
| getMembers | communityId: CommunityId | `Promise<Result<StoredEntity[]>>`           | メンバーエンティティ取得     |
| search     | query: string            | `Promise<Result<Community[]>>`              | キーワード検索               |

### 使用ライブラリ

| ライブラリ | バージョン | 用途                             |
| ---------- | ---------- | -------------------------------- |
| dagre      | ^0.8.5     | 階層グラフレイアウトアルゴリズム |

---

---

## 続き

後半コンテンツは分割ファイルを参照:

- [ui-ux-feature-components-advanced.md](ui-ux-feature-components-advanced.md) — Custom Execution/WorkspaceChat/ChatPanel系

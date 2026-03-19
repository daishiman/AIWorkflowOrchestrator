# 機能別 UI コンポーネント / core specification

> 親仕様書: [ui-ux-feature-components.md](ui-ux-feature-components.md)
> 役割: core specification

## 概要

本ドキュメントはAIWorkflowOrchestratorの機能別UIコンポーネント群の仕様を集約する。各機能は独立したセクションとして記述され、コンポーネント階層・仕様・IPC API・テスト要件を定義する。

### 収録機能一覧

| 機能                         | タスクID         | 主要コンポーネント                                 | 状態 | 詳細仕様                                                         |
| ---------------------------- | ---------------- | -------------------------------------------------- | ---- | ---------------------------------------------------------------- |
| Community Visualization      | CONV-08-05       | CommunityGraph, CommunityDetailPanel               | 完了 | 本ファイル                                                       |
| Custom Execution Environment | AGENT-006        | ExecutionEnvironment, HTMLPreviewEnvironment       | 完了 | 本ファイル                                                       |
| Workspace Chat Edit          | Issue #468, #494 | FileAttachmentButton, FileContextList, DiffPreview | 完了 | 本ファイル                                                       |
| Workspace Layout Foundation  | TASK-UI-04A      | WorkspaceView, FileBrowserPanel, PanelToggleBar, WorkspaceStatusBar | 完了（Phase 13保留） | `docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser/` |
| Workspace Chat Panel         | TASK-UI-04B      | WorkspaceChatPanel, WorkspaceChatInput, WorkspaceChatMessageList, WorkspaceMentionDropdown | 完了（Phase 1-12） | `docs/30-workflows/task-059a-ui-04b-workspace-chat-panel/` |
| Workspace Preview / Quick Search | TASK-UI-04C | PreviewPanel, PreviewToolbar, QuickFileSearch, SourceView | 完了（Phase 13保留） | `docs/30-workflows/completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch/` |
| Skill Stream Display         | TASK-3-2         | SkillStreamDisplay, useSkillExecution              | 完了 | [ui-ux-feature-skill-stream.md](./ui-ux-feature-skill-stream.md) |
| Skill Stream Copy History    | TASK-3-2-D       | CopyHistoryPanel, CopyHistoryContext, useCopyHistory | 完了 | [ui-ux-feature-skill-stream.md](./ui-ux-feature-skill-stream.md) |
| Skill Editor UI              | TASK-9A          | SkillEditor, SkillCodeEditor                       | 完了 | `docs/30-workflows/completed-tasks/TASK-9A-skill-editor/` |
| Skill Center View            | TASK-UI-05       | SkillCenterView, FeaturedSection, SkillDetailPanel | 完了 | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/` |
| Skill Center CTA Routing  | TASK-SKILL-LIFECYCLE-02 | SkillLifecycleJourneyPanel, HeaderCTA, useSkillCenter nav | 完了 | `docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-02-skillcenter-create-route/` |
| Skill Detail Action Buttons | TASK-IMP-SKILLDETAIL-ACTION-BUTTONS-001 | SkillDetailPanel, useSkillCenter, SkillEditorView, SkillAnalysisView | 完了 | `docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-03-skilldetail-action-buttons/` |
| Skill Editor View            | TASK-UI-05A      | SkillEditorView, FileTreePanel, EditorPanel | spec_created（統合未完了） | `docs/30-workflows/skill-editor-view/` |
| Skill Analysis View          | TASK-10A-B       | SkillAnalysisView, ScoreDisplay, SuggestionList, RiskPanel | 完了 | `docs/30-workflows/completed-tasks/skill-analysis-view/` |
| Skill Create Wizard          | TASK-10A-C       | SkillCreateWizard, StepIndicator, Describe/Configure/Generate/Complete | 完了 | `docs/30-workflows/completed-tasks/skill-create-wizard/` |
| Store-Driven Lifecycle Integration | TASK-10A-F | SkillAnalysisView, SkillCreateWizard, useSkillAnalysis | 完了 | `docs/30-workflows/store-driven-lifecycle-ui/` |
| Organisms Foundation         | TASK-UI-00-ORGANISMS | CardGrid, MasterDetailLayout, SearchFilterList | 完了 | `docs/30-workflows/completed-tasks/task-054-ui-00-4-organisms-components/` |
| Global Navigation Core       | TASK-UI-02       | GlobalNavStrip, MobileNavBar, MoreMenu, AppLayout, useNavShortcuts | 完了 | [ui-ux-navigation.md](./ui-ux-navigation.md) |
| Skill Advanced Views         | TASK-UI-05B      | SkillChainBuilder, ScheduleManager, DebugPanel, AnalyticsDashboard | 完了 | `docs/30-workflows/completed-tasks/TASK-UI-05B-SKILL-ADVANCED-VIEWS/` |
| Notification / History Domain | TASK-UI-01-C | NotificationCenter, HistorySearchView | 完了 | `docs/30-workflows/completed-tasks/task-056c-notification-history-domain/` |
| History Timeline Refresh | TASK-UI-06 | HistorySearchView, HistorySearchBar, TimelineGroup, Chat/File/Skill cards | 完了 | [ui-history-search-view.md](./ui-history-search-view.md) |
| AgentView Redesign (Tap & Discover) | TASK-UI-03 | SkillChip, ExecuteButton, FloatingExecutionBar, AdvancedSettingsPanel, RecentExecutionList | 完了 | `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/` |
| Dashboard Home Enhancement | TASK-UI-07 | DashboardView, GreetingHeader, DashboardSuggestionSection, RecentTimeline | 完了 | `docs/30-workflows/completed-tasks/task-058d-ui-07-dashboard-enhancement/` |
| ChatPanel Real AI Chat Wiring | TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 | RuntimeBanner, ChatMessageList, ComposerArea, ErrorGuidance, HandoffBlock | spec_created | `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-seq-task-05-chatpanel-real-chat-wiring/` |

### 共通仕様

| 項目                 | 基準                              |
| -------------------- | --------------------------------- |
| アクセシビリティ     | WCAG 2.1 AA準拠                   |
| スタイリング         | Tailwind CSS + cn()ユーティリティ |
| 状態管理             | Zustand                           |
| テストフレームワーク | Vitest + React Testing Library    |
| Storybook            | 全コンポーネント必須              |

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

## Custom Execution Environment UI コンポーネント（AGENT-006）

エージェント実行結果をリアルタイムでプレビューするためのUIコンポーネント群。
HTML、Markdownのプレビューに対応し、3層セキュリティ防御を実装。

### コンポーネント階層

| コンポーネント       | 種類      | 親                       | 子要素                                                                     |
| -------------------- | --------- | ------------------------ | -------------------------------------------------------------------------- |
| AgentExecutionView   | views     | -                        | SplitLayout                                                                |
| SplitLayout          | organisms | AgentExecutionView       | leftPanel (AgentChatInterface), Divider, rightPanel (ExecutionEnvironment) |
| ExecutionEnvironment | organisms | SplitLayout (rightPanel) | EnvironmentSelector, HTMLPreviewEnvironment / MarkdownPreviewEnvironment   |
| EnvironmentSelector  | molecules | ExecutionEnvironment     | 環境タイプ選択ドロップダウン                                               |

### コンポーネント仕様

| コンポーネント             | 種類     | 責務                             |
| -------------------------- | -------- | -------------------------------- |
| SplitLayout                | organism | 左右分割レイアウト、ドラッグ調整 |
| EnvironmentSelector        | molecule | 環境タイプ選択ドロップダウン     |
| ExecutionEnvironment       | organism | 環境タイプに応じたプレビュー切替 |
| HTMLPreviewEnvironment     | organism | sandbox iframe内でHTMLを安全表示 |
| MarkdownPreviewEnvironment | organism | Markdownをレンダリング表示       |

### ファイル配置

| コンポーネント             | パス                                                                         |
| -------------------------- | ---------------------------------------------------------------------------- |
| SplitLayout                | `apps/desktop/src/renderer/components/organisms/SplitLayout/`                |
| EnvironmentSelector        | `apps/desktop/src/renderer/components/molecules/EnvironmentSelector/`        |
| ExecutionEnvironment       | `apps/desktop/src/renderer/components/organisms/ExecutionEnvironment/`       |
| HTMLPreviewEnvironment     | `apps/desktop/src/renderer/components/organisms/HTMLPreviewEnvironment/`     |
| MarkdownPreviewEnvironment | `apps/desktop/src/renderer/components/organisms/MarkdownPreviewEnvironment/` |
| sanitize.ts                | `apps/desktop/src/renderer/utils/sanitize.ts`                                |

### SplitLayout Props

| Prop           | 型                        | 必須 | デフォルト | 説明                 |
| -------------- | ------------------------- | ---- | ---------- | -------------------- |
| leftPanel      | `React.ReactNode`         | ✓    | -          | 左パネルコンテンツ   |
| rightPanel     | `React.ReactNode`         | ✓    | -          | 右パネルコンテンツ   |
| initialRatio   | `number`                  | -    | 50         | 初期分割比率 (%)     |
| minRatio       | `number`                  | -    | 20         | 最小比率 (%)         |
| maxRatio       | `number`                  | -    | 80         | 最大比率 (%)         |
| onRatioChange  | `(ratio: number) => void` | -    | -          | 比率変更コールバック |
| showRightPanel | `boolean`                 | -    | true       | 右パネル表示         |
| className      | `string`                  | -    | -          | カスタムクラス       |

### SplitLayout キーボード操作

| キー       | 動作             |
| ---------- | ---------------- |
| ArrowLeft  | 左パネルを5%縮小 |
| ArrowRight | 左パネルを5%拡大 |
| Home       | 最小比率に設定   |
| End        | 最大比率に設定   |

### セキュリティ（3層防御）

| レイヤー | 実装                     | 防御対象                         |
| -------- | ------------------------ | -------------------------------- |
| Layer 1  | DOMPurify HTMLサニタイズ | scriptタグ、イベントハンドラ除去 |
| Layer 2  | CSP（script-src 'none'） | インラインスクリプト防止         |
| Layer 3  | iframe sandbox           | スクリプト実行、ポップアップ禁止 |

---

## workspace-chat-edit-ui コンポーネント（Issue #468, #494）

AIアシスタントとのチャット中にファイル編集を依頼し、差分プレビュー・適用を行うためのUIコンポーネント群。

### コンポーネント階層

| コンポーネント       | 種類      | 親                   | 子要素                                                                                    |
| -------------------- | --------- | -------------------- | ----------------------------------------------------------------------------------------- |
| ChatView             | views     | -                    | FileContextDropZone, FileContextList, FileAttachmentButton, EditCommandInput, DiffPreview |
| FileAttachmentButton | molecules | ChatView             | なし                                                                                      |
| FileContextList      | organisms | ChatView             | FileContextBadge（複数）                                                                  |
| FileContextDropZone  | organisms | ChatView             | ChatContent                                                                               |
| FileContextBadge     | molecules | FileContextList      | なし                                                                                      |
| EditCommandInput     | molecules | ChatView             | CommandTypeSelector, TextInput + SendButton                                               |
| DiffPreview          | organisms | ChatView（モーダル） | DiffEditor, ApplyControls                                                                 |
| DiffEditor           | -         | DiffPreview          | Monaco DiffEditor                                                                         |

### コンポーネント仕様

#### FileAttachmentButton（Issue #494）

| 項目     | 仕様                                                                                            |
| -------- | ----------------------------------------------------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/features/workspace-chat-edit/components/FileAttachmentButton.tsx`    |
| 責務     | ファイル選択ダイアログを開き、選択されたファイルをコンテキストに追加                            |
| 依存     | useFileContext, electronAPI.fileSelection                                                       |
| Props    | `onFilesSelected?`, `multiple?`, `accept?`, `maxFiles?`, `disabled?`, `className?`, `children?` |

**Props詳細**

| Prop            | 型                               | 必須 | デフォルト | 説明                       |
| --------------- | -------------------------------- | ---- | ---------- | -------------------------- |
| onFilesSelected | `(files: FileContext[]) => void` | No   | -          | ファイル選択時コールバック |
| multiple        | `boolean`                        | No   | true       | 複数選択許可               |
| accept          | `string[]`                       | No   | ["*"]      | 許可する拡張子             |
| maxFiles        | `number`                         | No   | 10         | 最大ファイル数             |
| disabled        | `boolean`                        | No   | false      | 無効状態                   |

**機能**

| 機能             | 説明                                   |
| ---------------- | -------------------------------------- |
| ダイアログ表示   | クリックでファイル選択ダイアログを開く |
| 最大数制限       | canAddContext: falseで自動無効化       |
| キーボード操作   | Enter/Spaceでダイアログを開く          |
| ローディング状態 | 処理中はボタン無効化                   |

#### FileContextList（Issue #494）

| 項目     | 仕様                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/features/workspace-chat-edit/components/FileContextList.tsx`           |
| 責務     | 添付ファイル一覧の表示、削除・選択操作のハンドリング                                              |
| 依存     | useFileContext, FileContextBadge                                                                  |
| Props    | `contexts?`, `onRemove?`, `onSelect?`, `selectedId?`, `emptyMessage?`, `maxHeight?`, `className?` |

**Props詳細**

| Prop         | 型                     | 必須 | デフォルト                     | 説明                 |
| ------------ | ---------------------- | ---- | ------------------------------ | -------------------- |
| contexts     | `FileContext[]`        | No   | (Zustandから取得)              | 表示するコンテキスト |
| onRemove     | `(id: string) => void` | No   | -                              | 削除時コールバック   |
| onSelect     | `(id: string) => void` | No   | -                              | 選択時コールバック   |
| selectedId   | `string`               | No   | (Zustandから取得)              | 選択中のID           |
| emptyMessage | `string`               | No   | "ファイルが添付されていません" | 空状態メッセージ     |

**機能**

| 機能                     | 説明                               |
| ------------------------ | ---------------------------------- |
| 一覧表示                 | FileContextBadgeで各ファイルを表示 |
| 空状態表示               | ファイルなし時にメッセージ表示     |
| スクロール               | 大量ファイル時にスクロール可能     |
| キーボードナビゲーション | Tab/Enter/Deleteで操作             |

#### FileContextBadge

| 項目     | 仕様                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------ |
| ファイル | `apps/desktop/src/renderer/features/workspace-chat-edit/components/FileContextBadge.tsx`         |
| 責務     | 添付ファイルの表示と削除                                                                         |
| Props    | `file: FileContext`, `isSelected?: boolean`, `onRemove?: (id) => void`, `onClick?: (id) => void` |

#### ApplyControls

| 項目     | 仕様                                                                                  |
| -------- | ------------------------------------------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/features/workspace-chat-edit/components/ApplyControls.tsx` |
| 責務     | 差分の適用または却下                                                                  |
| Props    | `resultId: string`, `onApplied?: () => void`, `onRejected?: () => void`               |

#### FileContextDropZone

| 項目     | 仕様                                                                                        |
| -------- | ------------------------------------------------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/features/workspace-chat-edit/components/FileContextDropZone.tsx` |
| 責務     | ドラッグ&ドロップでのファイル添付                                                           |
| Props    | `children: ReactNode`, `disabled?: boolean`, `onFilesDropped?: (files) => void`             |

#### DiffPreview

| 項目     | 仕様                                                                                                                                                 |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/features/workspace-chat-edit/components/DiffPreview.tsx`                                                                  |
| 責務     | 差分プレビューモーダルの表示                                                                                                                         |
| Props    | `original: string`, `modified: string`, `fileName: string`, `language?: string`, `resultId: string`, `onClose: () => void`, `onApplied?: () => void` |

#### DiffEditor

| 項目     | 仕様                                                                               |
| -------- | ---------------------------------------------------------------------------------- | ------- |
| ファイル | `apps/desktop/src/renderer/features/workspace-chat-edit/components/DiffEditor.tsx` |
| 責務     | Monaco Editorによる差分表示                                                        |
| Props    | `original: string`, `modified: string`, `language?: string`, `height?: string      | number` |

#### EditCommandInput

| 項目     | 仕様                                                                                     |
| -------- | ---------------------------------------------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/features/workspace-chat-edit/components/EditCommandInput.tsx` |
| 責務     | 編集コマンドの入力と送信                                                                 |
| Props    | `onSubmit: (command: EditCommand) => void`, `disabled?: boolean`, `placeholder?: string` |

### 状態管理

| Hook           | 責務                                           |
| -------------- | ---------------------------------------------- |
| useFileContext | ファイルコンテキストの管理（添付/削除/クリア） |
| useDiffApply   | 差分適用状態の管理（適用/却下/リセット）       |

### バリデーション

| 項目               | 制限値     |
| ------------------ | ---------- |
| 最大ファイル数     | 10ファイル |
| 最大ファイルサイズ | 10MB       |

### キーボード操作

| キー             | コンポーネント   | 動作                       |
| ---------------- | ---------------- | -------------------------- |
| Delete/Backspace | FileContextBadge | 選択中のバッジを削除       |
| Ctrl+Enter       | EditCommandInput | コマンド送信               |
| Escape           | DiffPreview      | プレビューを閉じる         |
| Tab              | DiffPreview      | フォーカストラップ内を循環 |

---

## ChatPanel Real AI Chat Wiring（TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 / spec_created）

> 設計タスク。ChatPanel の placeholder を real AI chat 経路へ接続し、streaming/error/handoff 各状態の表示を設計する。

### コンポーネント階層

```
ChatPanel (organism) - 全面書換（3 placeholder 置換 + 8 状態条件レンダリング）
  +-- RuntimeBanner (atom)              # capability 表示バナー + terminal ボタン
  +-- ChatMessageList (molecule)        # メッセージ一覧 (role="log", aria-live="polite")
  |     +-- ChatMessage (atom)          # 個別メッセージ (user / assistant)
  |     +-- StreamingMessage (atom)     # ストリーミング中メッセージ（既存接続）
  +-- ErrorGuidance (molecule)          # エラー表示 (capability / network / API key)
  +-- HandoffBlock (molecule)           # terminal handoff ブロック
  |     +-- PersistentTerminalLauncher (atom) # terminal 常設起動ボタン
  +-- ComposerArea (molecule)           # 入力エリア
  |     +-- ComposerInput (atom)        # テキスト入力
  |     +-- SendButton (atom)           # 送信ボタン
  +-- LLMSelectorPanel (molecule)       # Provider/Model セレクタ（既存接続）
  +-- SkillStreamingView (既存維持)     # スキル実行中表示
  +-- SkillManagementPanel (既存維持)   # スキル管理パネル
```

### Atomic Design 分類

| コンポーネント             | 分類     | 新規/既存 | ファイルパス                                                                   |
| -------------------------- | -------- | --------- | ------------------------------------------------------------------------------ |
| RuntimeBanner              | atom     | 新規      | `apps/desktop/src/renderer/components/chat/RuntimeBanner.tsx`              |
| ChatMessage                | atom     | 新規      | `apps/desktop/src/renderer/components/chat/ChatMessage.tsx`                |
| ComposerInput              | atom     | 新規      | `apps/desktop/src/renderer/components/chat/ComposerInput.tsx`              |
| SendButton                 | atom     | 新規      | `apps/desktop/src/renderer/components/chat/SendButton.tsx`                 |
| PersistentTerminalLauncher | atom     | 新規      | `apps/desktop/src/renderer/components/chat/PersistentTerminalLauncher.tsx` |
| ChatMessageList            | molecule | 新規      | `apps/desktop/src/renderer/components/chat/ChatMessageList.tsx`            |
| ErrorGuidance              | molecule | 新規      | `apps/desktop/src/renderer/components/chat/ErrorGuidance.tsx`              |
| HandoffBlock               | molecule | 新規      | `apps/desktop/src/renderer/components/chat/HandoffBlock.tsx`               |
| ComposerArea               | molecule | 新規      | `apps/desktop/src/renderer/components/chat/ComposerArea.tsx`               |
| LLMSelectorPanel           | molecule | 新規      | `apps/desktop/src/renderer/components/chat/LLMSelectorPanel.tsx`           |
| ChatPanel                  | organism | 変更      | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`                  |
| StreamingMessage           | atom     | 既存      | `apps/desktop/src/renderer/components/chat/StreamingMessage.tsx`           |

### 主要 Props 設計

| コンポーネント             | 主要 Props                                                                      |
| -------------------------- | ------------------------------------------------------------------------------- |
| RuntimeBanner              | `capability: AccessCapability`, `onTerminalClick?: () => void`                  |
| ChatMessageList            | `messages: ChatMessage[]`, `isStreaming: boolean`                               |
| ChatMessage                | `message: ChatMessage`                                                          |
| ErrorGuidance              | `error: LLMError`, `onRetry?: () => void`, `onSettings?: () => void`            |
| HandoffBlock               | `guidance: HandoffGuidance`, `onLaunch: () => void`                             |
| PersistentTerminalLauncher | `onLaunch: () => void`                                                          |
| ComposerInput              | `value: string`, `onChange: (v: string) => void`, `onSubmit: () => void`, `disabled: boolean` |
| SendButton                 | `onClick: () => void`, `disabled: boolean`, `isStreaming: boolean`              |
| ComposerArea               | `children: ReactNode`                                                           |
| LLMSelectorPanel           | `selectedProviderId: string \| null`, `selectedModelId: string \| null`, `providers: Provider[]`, `onSelect: (providerId, modelId) => void` |

### 8 状態条件レンダリング

| 状態        | RuntimeBanner | ChatMessageList | ComposerArea | ErrorGuidance | HandoffBlock |
| ----------- | ------------- | --------------- | ------------ | ------------- | ------------ |
| `idle`      | 表示          | empty state     | 無効         | -             | -            |
| `ready`     | 表示          | 表示            | 有効         | -             | -            |
| `streaming` | 表示          | 表示+streaming  | 無効         | -             | -            |
| `cancelled` | 表示          | 表示            | 有効         | -             | -            |
| `completed` | 表示          | 表示            | 有効         | -             | -            |
| `error`     | 表示          | 表示            | 有効         | 表示          | -            |
| `blocked`   | 表示(警告)    | -               | 無効         | -             | -            |
| `handoff`   | 表示          | -               | 無効         | -             | 表示         |

### アクセシビリティ

| コンポーネント    | ARIA 属性                      |
| ----------------- | ------------------------------ |
| ChatMessageList   | `role="log"`, `aria-live="polite"` |
| RuntimeBanner     | `role="status"`                |
| ErrorGuidance     | `role="alert"`                 |
| ComposerInput     | `aria-label="メッセージ入力"`  |
| SendButton        | `aria-label="送信"`            |

### キーボード操作

| キー           | コンポーネント | 動作                  |
| -------------- | -------------- | --------------------- |
| Enter          | ComposerInput  | メッセージ送信        |
| Shift+Enter    | ComposerInput  | 改行挿入              |
| Escape         | ComposerInput  | ストリーミングキャンセル |

### 関連タスク

| タスクID | 内容 | ステータス |
| --- | --- | --- |
| TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 | ChatPanel の実 AI チャット配線（設計） | spec_created（2026-03-18） |
| TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 | Main Chat/Settings AI runtime 同期 | 完了（2026-03-17） |

---

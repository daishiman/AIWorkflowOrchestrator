# 機能別 UI コンポーネント

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
>
> **親ドキュメント**: [ui-ux-components.md](./ui-ux-components.md)

---

## 概要

本ドキュメントはAIWorkflowOrchestratorの機能別UIコンポーネント群の仕様を集約する。各機能は独立したセクションとして記述され、コンポーネント階層・仕様・IPC API・テスト要件を定義する。

### 収録機能一覧

| 機能                         | タスクID         | 主要コンポーネント                                 | 状態 | 詳細仕様                                                         |
| ---------------------------- | ---------------- | -------------------------------------------------- | ---- | ---------------------------------------------------------------- |
| Community Visualization      | CONV-08-05       | CommunityGraph, CommunityDetailPanel               | 完了 | 本ファイル                                                       |
| Custom Execution Environment | AGENT-006        | ExecutionEnvironment, HTMLPreviewEnvironment       | 完了 | 本ファイル                                                       |
| Workspace Chat Edit          | Issue #468, #494 | FileAttachmentButton, FileContextList, DiffPreview | 完了 | 本ファイル                                                       |
| Skill Stream Display         | TASK-3-2         | SkillStreamDisplay, useSkillExecution              | 完了 | [ui-ux-feature-skill-stream.md](./ui-ux-feature-skill-stream.md) |
| Skill Stream Copy History    | TASK-3-2-D       | CopyHistoryPanel, CopyHistoryContext, useCopyHistory | 完了 | [ui-ux-feature-skill-stream.md](./ui-ux-feature-skill-stream.md) |
| Skill Editor UI              | TASK-9A          | SkillEditor, SkillCodeEditor                       | 完了 | `docs/30-workflows/completed-tasks/TASK-9A-skill-editor/` |
| Skill Center View            | TASK-UI-05       | SkillCenterView, FeaturedSection, SkillDetailPanel | 完了 | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/` |
| Skill Editor View            | TASK-UI-05A      | SkillEditorView, FileTreePanel, EditorPanel | spec_created（統合未完了） | `docs/30-workflows/skill-editor-view/` |
| Skill Analysis View          | TASK-10A-B       | SkillAnalysisView, ScoreDisplay, SuggestionList, RiskPanel | 完了 | `docs/30-workflows/completed-tasks/skill-analysis-view/` |
| Skill Create Wizard          | TASK-10A-C       | SkillCreateWizard, StepIndicator, Describe/Configure/Generate/Complete | 完了 | `docs/30-workflows/completed-tasks/skill-create-wizard/` |
| Skill Advanced Views         | TASK-UI-05B      | SkillChainBuilder, ScheduleManager, DebugPanel, AnalyticsDashboard | 完了 | `docs/30-workflows/completed-tasks/TASK-UI-05B-SKILL-ADVANCED-VIEWS/` |

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

## コピー履歴機能（TASK-3-2-D）

SkillStreamDisplayコンポーネントにコピー履歴機能を追加。過去にコピーした内容を一覧表示し、再コピー・複数選択一括コピーを可能にする。

### コンポーネント階層

| コンポーネント      | 種類     | 親                 | 子要素                           |
| ------------------- | -------- | ------------------ | -------------------------------- |
| CopyHistoryProvider | context  | SkillStreamDisplay | history, selectedIds, methods    |
| CopyHistoryPanel    | organism | SkillStreamDisplay | CopyHistoryItem[], ActionBar     |
| CopyHistoryItem     | molecule | CopyHistoryPanel   | Checkbox, Preview, CopyButton    |
| CopyHistoryToggle   | atom     | StreamHeader       | Icon, Badge                      |

### コンポーネント仕様

#### CopyHistoryContext

| 項目     | 仕様                                                        |
| -------- | ----------------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/contexts/CopyHistoryContext.tsx` |
| 責務     | コピー履歴の状態管理とContext提供                           |
| 定数     | `MAX_HISTORY_SIZE = 50`                                     |

**CopyHistoryEntry型**

| フィールド | 型     | 説明                     |
| ---------- | ------ | ------------------------ |
| id         | string | 一意識別子（uuid）       |
| content    | string | コピー内容               |
| messageId  | string | 元メッセージID           |
| timestamp  | number | コピー日時（UNIXミリ秒） |

**CopyHistoryContextValue**

| プロパティ        | 型                                         | 説明                 |
| ----------------- | ------------------------------------------ | -------------------- |
| history           | CopyHistoryEntry[]                         | 履歴配列             |
| selectedIds       | Set<string>                                | 選択中のID           |
| historyCount      | number                                     | 履歴件数             |
| selectedCount     | number                                     | 選択件数             |
| addToHistory      | (content, messageId) => void               | 履歴追加             |
| copyFromHistory   | (id) => Promise<void>                      | 個別コピー           |
| copySelectedItems | () => Promise<void>                        | 選択一括コピー       |
| clearHistory      | () => void                                 | 履歴クリア           |
| toggleSelection   | (id) => void                               | 選択トグル           |
| clearSelection    | () => void                                 | 選択クリア           |

#### CopyHistoryPanel

| 項目     | 仕様                                                                  |
| -------- | --------------------------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/components/AgentView/CopyHistoryPanel.tsx` |
| 責務     | 履歴パネルUI、ユーザー操作処理                                        |
| Props    | `isOpen`, `onClose`, `className?`                                     |
| 定数     | `PREVIEW_LENGTH = 100`, `COPY_FEEDBACK_MS = 2000`                     |

**機能**

| 機能               | 説明                               |
| ------------------ | ---------------------------------- |
| 履歴一覧表示       | 最大50件、新しい順に表示           |
| プレビュー表示     | 100文字で省略、改行を空白に変換    |
| 個別コピー         | 履歴項目からクリップボードにコピー |
| 複数選択           | チェックボックスで選択             |
| 一括コピー         | 選択項目を改行区切りで結合コピー   |
| 履歴クリア         | 全履歴を削除                       |
| パネル外クリック   | パネルを閉じる                     |

#### useCopyHistory Hook

| 項目     | 仕様                                                  |
| -------- | ----------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/hooks/useCopyHistory.ts`   |
| 責務     | CopyHistoryContext へのアクセスを提供                 |
| 使用条件 | CopyHistoryProvider 内で使用必須                      |
| エラー   | Provider外で使用時に Error throw                      |

### キーボード操作

| キー   | 機能                   |
| ------ | ---------------------- |
| Tab    | フォーカス移動         |
| Enter  | 項目コピー             |
| Escape | パネル閉じる           |
| Space  | チェックボックストグル |

### ARIA属性

| 要素   | 属性                 | 値                     |
| ------ | -------------------- | ---------------------- |
| パネル | role                 | dialog                 |
| パネル | aria-label           | コピー履歴             |
| パネル | aria-modal           | true                   |
| リスト | role                 | listbox                |
| リスト | aria-multiselectable | true                   |
| 項目   | role                 | option                 |
| 項目   | aria-selected        | 選択状態に応じて       |

### テスト品質（TASK-3-2-D）

| ファイル                    | テスト数 | 結果    |
| --------------------------- | -------- | ------- |
| CopyHistoryContext.test.tsx | 18       | 全PASS  |
| useCopyHistory.test.tsx     | 8        | 全PASS  |
| CopyHistoryPanel.test.tsx   | 20       | 全PASS  |
| 合計                        | 46       | 全PASS  |

---

## アクセシビリティ（全コンポーネント共通 WCAG 2.1 AA）

| 要件                     | 実装方法                                            |
| ------------------------ | --------------------------------------------------- |
| キーボードナビゲーション | Tab順序、Enter/Escapeでの操作、全要素にtabIndex設定 |
| スクリーンリーダー       | aria-label、role属性の適切な設定、`aria-live`       |
| フォーカス管理           | パネル/モーダル開閉時のフォーカス移動               |
| 色コントラスト           | 4.5:1以上のコントラスト比確保（Tailwind CSS標準色） |

---

## SkillStreamingView コンポーネント（TASK-7D）

TASK-7D ChatPanel Agent統合で新規追加されたOrganism級コンポーネント。ChatPanel内で条件レンダーされ、Agent Executionのストリーミング表示を担当する。

### コンポーネント概要

| 項目 | 内容 |
|------|------|
| ファイル | `apps/desktop/src/renderer/components/skill/SkillStreamingView.tsx` |
| レイヤー | Organism（ChatPanel子コンポーネント） |
| テスト | 33テスト（Line: 99.31%, Branch: 93.75%, Function: 100%） |
| 表示条件 | `isExecuting && selectedSkillName` が真のとき |

### 構成サブコンポーネント

| コンポーネント | 役割 | Props |
|---------------|------|-------|
| StatusBadge | 実行ステータス表示（信号機パターン） | `status: DisplayableStatus` |
| StreamMessageItem | ストリーミングメッセージ1件の表示 | `message: SkillStreamMessage` |
| ToolExecutionHistory | ツール実行履歴の折りたたみ表示 | `entries: ToolExecution[]` |

### 型定義

| 型名 | 定義 | 用途 |
|------|------|------|
| `DisplayableStatus` | `Exclude<SkillExecutionStatus, 'idle'>` | idle除外の厳密なステータス型 |
| `SkillStreamMessage` | 判別共用体（text/tool_use/tool_result/error/permission_request） | メッセージ種別の型安全な分岐 |

### 適用パターン

| パターン | 内容 |
|----------|------|
| forwardRef + useImperativeHandle | ChatPanel→SkillStreamingViewへの外部メソッド公開 |
| React.memo + 個別セレクタ | Store変更時の不要再レンダー防止 |
| aria-live="polite" | ストリーミングメッセージのスクリーンリーダー通知 |

### 関連仕様

- [SkillStreamDisplay詳細仕様](./ui-ux-feature-skill-stream.md) - TASK-3-2シリーズとの統合仕様
- [ChatPanel統合UIフロー](./ui-ux-agent-execution.md) - Agent Execution UI全体フロー
- [ChatPanel統合仕様](./interfaces-agent-sdk-ui.md) - TASK-7D完了タスクセクション

---

<a id="skill-editor-ui-task-9a"></a>
## SkillEditor UI（TASK-9A / 完了）

TASK-9A-skill-editor で SkillEditor / SkillCodeEditor の実装と検証（Phase 1-12）が完了。
旧 `TASK-9A-C-skill-editor-ui` は仕様書作成フェーズの履歴として保持し、実装の正本は `docs/30-workflows/completed-tasks/TASK-9A-skill-editor/` とする。

### 実装済みコンポーネント

| コンポーネント | 役割 | 想定配置 |
| --- | --- | --- |
| SkillEditor | ファイル選択・読込・保存制御 | `apps/desktop/src/renderer/components/skill/SkillEditor.tsx` |
| SkillCodeEditor | テキスト編集UI | `apps/desktop/src/renderer/components/skill/SkillCodeEditor.tsx` |

### 進捗ステータス

| 項目 | 状態 | 参照 |
| --- | --- | --- |
| ワークフロー仕様（Phase 1-13） | ✅ 完了 | `docs/30-workflows/completed-tasks/TASK-9A-skill-editor/` |
| 実装コード | ✅ 完了 | `apps/desktop/src/renderer/components/skill/SkillEditor.tsx`, `SkillCodeEditor.tsx` |
| テスト | ✅ 完了 | `SkillEditor.test.tsx`, `SkillCodeEditor.test.tsx`, `buildFileTree.test.ts`, `getLanguage.test.ts` |

### 関連ドキュメント

- [TASK-9A ワークフロー](../../../../docs/30-workflows/completed-tasks/TASK-9A-skill-editor/index.md)
- [TASK-9A 実装ガイド](../../../../docs/30-workflows/completed-tasks/TASK-9A-skill-editor/outputs/phase-12/implementation-guide.md)
- [TASK-9A 仕様更新サマリー](../../../../docs/30-workflows/completed-tasks/TASK-9A-skill-editor/outputs/phase-12/spec-update-summary.md)
- [旧 TASK-9A-C 仕様書（履歴）](../../../../docs/30-workflows/completed-tasks/TASK-9A-C-skill-editor-ui/index.md)

### 関連未タスク

| タスクID | 概要 | 仕様書 |
| --- | --- | --- |
| TASK-9A-C-001 | シンタックスハイライト機能 | `docs/30-workflows/unassigned-task/task-9a-c-syntax-highlighting.md` |
| ~~TASK-9A-C-002~~ | ~~ファイル作成・削除機能~~ **完了: 2026-02-26（TASK-9Aへ統合）** | `docs/30-workflows/completed-tasks/unassigned-task/task-9a-c-file-crud-operations.md` |
| TASK-9A-C-003 | Monaco/CodeMirrorエディタ移行 | `docs/30-workflows/unassigned-task/task-9a-c-code-editor-migration.md` |
| ~~TASK-9A-C-004~~ | ~~Phase 12仕様同期ガード自動化~~ **完了: 2026-02-26（Phase 12完了に伴い移管）** | `docs/30-workflows/completed-tasks/unassigned-task/task-9a-c-phase12-spec-sync-guard.md` |

### コンポーネント階層

| コンポーネント  | 種類     | 親           | 子要素                                       |
| --------------- | -------- | ------------ | -------------------------------------------- |
| SkillEditor     | organism | AgentView    | FileTreeSidebar, EditorToolbar, SkillCodeEditor |
| FileTreeSidebar | molecule | SkillEditor  | カテゴリ展開リスト、ファイルアイテム         |
| EditorToolbar   | molecule | SkillEditor  | 保存ボタン、閉じるボタン、未保存インジケーター |
| SkillCodeEditor | molecule | SkillEditor  | textarea（コード編集領域）                   |

### コンポーネント仕様

#### SkillEditor

| 項目     | 仕様                                                               |
| -------- | ------------------------------------------------------------------ |
| ファイル | `apps/desktop/src/renderer/components/skill/SkillEditor.tsx`       |
| 責務     | ファイル選択・読込・保存制御、全体レイアウト統括                   |
| Props    | `skill: ImportedSkill`, `onClose: () => void`                      |

**レイアウト構造**

| 領域               | 位置                | 内容                               |
| ------------------ | ------------------- | ---------------------------------- |
| FileTreeSidebar    | 左側（w-64, 256px） | カテゴリ別ファイルツリー           |
| EditorToolbar      | 右上部              | 保存/閉じるボタン、未保存表示      |
| SkillCodeEditor    | 右メイン（flex-1）  | テキスト編集エリア                 |

#### SkillCodeEditor

| 項目     | 仕様                                                                    |
| -------- | ----------------------------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/components/skill/SkillCodeEditor.tsx`        |
| 責務     | textareaベースのコード編集UI（外部ライブラリ不使用）                    |
| Props    | `value: string`, `onChange: (value: string) => void`, `language: string`, `isReadOnly?: boolean` |

**機能**

| 機能           | 説明                                      |
| -------------- | ----------------------------------------- |
| Tab→2スペース  | Tabキー押下時にスペース2個を挿入          |
| spellCheck無効 | `spellCheck={false}` でスペルチェック抑制 |
| 等幅フォント   | `font-family: monospace` 適用             |
| 読み取り専用   | `isReadOnly` で編集不可モード切替         |

### 状態管理

| 状態の種類        | 管理方法                   | 判断基準                                    |
| ----------------- | -------------------------- | ------------------------------------------- |
| 選択ファイル      | `useState<string \| null>` | コンポーネント固有UI                        |
| ファイル内容      | `useState<string>`         | エディター内ローカル状態                    |
| カテゴリ展開状態  | `useState<Set<string>>`    | FileTreeSidebar固有UI                       |
| 未保存フラグ      | `useState<boolean>`        | 保存アクション制御用                        |

> **設計判断**: Zustand Storeを使用せず、useState のみで管理する（P31: Zustand Store Hooks無限ループの事前対策）

### IPC 依存

| メソッド                         | 用途               | 前提タスク |
| -------------------------------- | ------------------ | ---------- |
| `window.electronAPI.skill.readFile`  | ファイル内容読み込み | TASK-9A-B  |
| `window.electronAPI.skill.writeFile` | ファイル内容書き込み | TASK-9A-B  |

### キーボード操作

| キー       | コンポーネント  | 動作                 |
| ---------- | --------------- | -------------------- |
| Cmd+S      | SkillEditor     | ファイル保存         |
| Escape     | SkillEditor     | エディターを閉じる   |
| Tab        | SkillCodeEditor | 2スペース挿入        |

### ARIA属性

| 要素               | 属性           | 値                 |
| ------------------ | -------------- | ------------------ |
| FileTreeSidebar    | role           | tree               |
| ファイルアイテム   | role           | treeitem           |
| SkillCodeEditor    | role           | textbox            |
| SkillCodeEditor    | aria-multiline | true               |
| SkillCodeEditor    | aria-label     | コードエディター   |

### 今回実装（監査反映）内容

| 区分 | 反映内容 |
| --- | --- |
| 仕様整合 | `TASK-9A-C（spec_created）` 表記を `TASK-9A（完了）` に統合更新 |
| 機能実装 | read/write/create/delete/listBackups/restoreBackup を UI から実行可能化 |
| 成果物整合 | Phase 1-12 の outputs/artifacts と仕様書リンクを同期 |
| 品質検証 | UIテスト15件 + 回帰テスト + `verify-all-specs` / `verify-unassigned-links` の最終PASSを確認 |

---

<a id="skill-center-view-task-ui-05"></a>
## SkillCenterView UI（TASK-UI-05 / 完了）

TASK-UI-05-SKILL-CENTER-VIEW で、ツール探索専用ビュー `SkillCenterView` の実装と検証（Phase 1-12）が完了。
AgentView の「実行」責務と分離し、ツールの探索・追加・詳細確認を一画面で完結できる UI として定義する。

### 実装済みコンポーネント / Hook

| 区分 | コンポーネント / Hook | 役割 | 想定配置 |
| --- | --- | --- | --- |
| view | SkillCenterView | 画面統合（検索、カテゴリ、おすすめ、グリッド、詳細パネル） | `apps/desktop/src/renderer/views/SkillCenterView/index.tsx` |
| organism | FeaturedSection | 未追加ツールのおすすめ表示（最大3件） | `.../components/FeaturedSection/FeaturedSection.tsx` |
| organism | SkillDetailPanel | ツール詳細表示、削除導線 | `.../components/SkillDetailPanel/SkillDetailPanel.tsx` |
| molecule | FeaturedCard / SkillCard / CategoryTabs / SkillEmptyState | カード表示・カテゴリ切替・空状態表示 | `.../components/` |
| atom | AddButton | 追加ボタン状態遷移（idle/processing/success） | `.../components/AddButton.tsx` |
| hook | useSkillCenter | Store接続、フィルタリング、詳細パネル状態管理 | `.../hooks/useSkillCenter.ts` |
| hook | useFeaturedSkills | 未追加ツール抽出 + 多様性考慮のおすすめ選定 | `.../hooks/useFeaturedSkills.ts` |

### 進捗ステータス

| 項目 | 状態 | 参照 |
| --- | --- | --- |
| ワークフロー仕様（Phase 1-13） | ✅ Phase 1-12 完了 | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/` |
| 実装コード | ✅ 完了 | `apps/desktop/src/renderer/views/SkillCenterView/` |
| テスト資産 | ✅ 完了（10ファイル / 132テストケース定義） | `apps/desktop/src/renderer/views/SkillCenterView/__tests__/` |
| Phase 12成果物 | ✅ 完了（5必須 + 補助1） | `outputs/phase-12/*.md` |

### 状態管理・IPC依存

| 観点 | 採用方針 |
| --- | --- |
| Store接続 | `useAvailableSkillsMetadata` / `useImportedSkills` / `useSetSkillFilter` など個別セレクタを使用（P31準拠） |
| ローカル状態 | 詳細パネル開閉、削除確認、追加中アニメーション状態を `useState` で管理 |
| IPC利用 | Rendererは Store アクション経由で利用（`skill:list`, `skill:import`, `skill:remove`） |
| 契約変更 | 新規IPCチャンネル追加なし（既存契約の再利用） |

### 欠損メタデータ防御（TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001）

| 観点 | 実装 |
| --- | --- |
| 文字列防御 | `String(skill.description ?? "")` を `SkillCard` / `SkillDetailPanel` / Hook検索で統一し、null/undefined 表示クラッシュを防止 |
| 配列防御 | `safeLength` / `safeSubResources` / `safeOtherFiles` で `agents/references/indexes/scripts/otherFiles` の nullish を空配列扱い |
| 検索防御 | `normalizeSearchText` を導入し、フィルタ・カテゴリ推論で `.toLowerCase()` 例外を防止 |
| Featured 防御 | `useFeaturedSkills` の入力既定値を `allSkills=[]` / `importedSkillNames=[]` に固定 |
| 結果 | 欠損メタデータを含むスキルでも SkillCenterView の一覧/詳細/おすすめ表示が継続可能 |

### 画面検証証跡（2026-03-04）

| TC | 証跡 | ファイル |
| --- | --- | --- |
| TC-01 | 欠損説明文ありカード表示（通常表示） | `docs/30-workflows/03-TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001/outputs/phase-11/screenshots/TC-01-skill-center-initial.png` |
| TC-02 | 欠損説明文でフィルタ遷移 | `docs/30-workflows/03-TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001/outputs/phase-11/screenshots/TC-02-search-with-missing-description.png` |
| TC-03 | 欠損サブリソースを含む詳細パネル | `docs/30-workflows/03-TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001/outputs/phase-11/screenshots/TC-03-detail-panel-malformed-metadata.png` |
| TC-04 | 欠損データ混在でのおすすめ表示 | `docs/30-workflows/03-TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001/outputs/phase-11/screenshots/TC-04-featured-and-category.png` |

### Skill Import Idempotency Guard 追補（2026-03-04）

| 観点 | UI契約 |
| --- | --- |
| 追加中ガード | `useSkillCenter.handleAddSkill` は `addingSkills.has(skillName)` で同一スキル再実行を抑止する |
| 既存追加済み時の挙動 | 既に追加済みスキルでは追加成功アニメーションを開始せず、状態同期のみを実施する |
| 状態視認性 | ボタン状態は `追加する` → `追加中...` → 一覧反映（対象カード除外）を維持し、誤操作を誘発しない |

| TC | 証跡 | ファイル |
| --- | --- | --- |
| TC-01 | 追加済み/未追加の初期分離表示 | `docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001/outputs/phase-11/screenshots/TC-01-initial-imported-state.png` |
| TC-02 | 追加中ステータス表示 | `docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001/outputs/phase-11/screenshots/TC-02-new-skill-processing.png` |
| TC-03 | 追加完了後の一覧整合 | `docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001/outputs/phase-11/screenshots/TC-03-post-import-state.png` |
| TC-04 | 追加済み詳細パネル表示 | `docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001/outputs/phase-11/screenshots/TC-04-imported-detail-panel.png` |

### workflow02 追補の関連未タスク（2026-03-04）

| タスクID | 概要 | 仕様書 |
| --- | --- | --- |
| ~~UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001~~ | ~~Phase 12 UI証跡再取得コマンドを `pnpm run screenshot:*` で公開し、実行経路を一意化するガード~~ **完了: 2026-03-04（scripts 登録 + 文書同期 + coverage 4/4 PASS）** | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-screenshot-command-registration-guard-001.md` |
| UT-IMP-PHASE12-CAPTURE-SCRIPT-NAVIGATION-STABILITY-GUARD-001 | capture script の遷移待機（`domcontentloaded` 基準 + 補助待機）を標準化するガード | `docs/30-workflows/unassigned-task/task-imp-phase12-capture-script-navigation-stability-guard-001.md` |
| UT-IMP-PHASE12-SCREENSHOT-PORT-CONFLICT-GUARD-001 | screenshot 実行時の `Port 5174` 競合を事前検査し、分岐結果を記録するガード | `docs/30-workflows/unassigned-task/task-imp-phase12-screenshot-port-conflict-guard-001.md` |
| UT-IMP-PHASE11-SCREENSHOT-COVERAGE-MATRIX-GUARD-001 | `phase-11-manual-test.md` の画面カバレッジマトリクス（視覚/非視覚TC区分 + 期待証跡）を必須化するガード | `docs/30-workflows/unassigned-task/task-imp-phase11-screenshot-coverage-matrix-guard-001.md` |

### workflow02 追補の苦戦箇所（再利用用）

| 苦戦箇所 | 再発条件 | 今回の対処 | 再利用ルール |
| --- | --- | --- | --- |
| screenshot 実行コマンドが scripts 一覧に露出していない | `node scripts/...` 直実行前提で運用し、`pnpm run` 経路へ未登録のとき | 未タスク `UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001` を起票し、`screenshot:*` 命名で登録後に `run` 表示確認 + 文書同期 + coverage 4/4 PASS まで完了化（2026-03-04 反映済み） | UI証跡は「スクリプト実体」ではなく「run コマンド公開」まで完了条件にする |
| capture script の `page.goto` 待機戦略が環境依存で timeout する | `waitUntil: load` 固定で画面遷移待機するとき | 未タスク `UT-IMP-PHASE12-CAPTURE-SCRIPT-NAVIGATION-STABILITY-GUARD-001` を起票し、`domcontentloaded` 基準 + 補助待機の標準化を追加 | 失敗時ログ（待機段階/URL）を残し、1回目失敗で切り分け可能にする |
| screenshot 実行時に `Port 5174 is already in use` が混在する | 既存 preview/dev server が残った状態で screenshot コマンドを再実行するとき | `lsof -nP -iTCP:5174 -sTCP:LISTEN` を再確認手順へ追加し、競合時分岐を未タスク `UT-IMP-PHASE12-SCREENSHOT-PORT-CONFLICT-GUARD-001` として切り出した | 再撮影は「ポート検査 → 再撮影 → coverage検証 → 台帳同期」を1セットで完了判定する |
| Phase 11 証跡を別workflow参照のまま残し coverage validator が失敗する | `manual-test-result.md` の証跡列のみ更新し、対象workflow配下 `outputs/phase-11/screenshots` を未配置のままにするとき | 対象workflow配下へ証跡を正規配置し、視覚TCは `screenshots/*.png`、非視覚TCは `NON_VISUAL:` 記法へ統一して `validate-phase11-screenshot-coverage` PASS を再取得した | UI証跡は「対象workflow配下の実体 + TC証跡記法 + coverage PASS」を同時に満たして完了判定する |
| `validate-phase11-screenshot-coverage` が PASS でも matrix 未記載 warning が残る | `phase-11-manual-test.md` に画面カバレッジマトリクスを持たないまま運用するとき | 未タスク `UT-IMP-PHASE11-SCREENSHOT-COVERAGE-MATRIX-GUARD-001` を追加し、matrix 必須列（TC-ID/区分/期待証跡/理由）を運用ルールへ分離した | UI証跡は「画像実体」だけでなく「Phase 11設計意図（matrix）」まで揃えて完了判定する |

### 2026-03-04 追補: 削除導線ホットフィックス

| 観点 | 追補内容 |
| --- | --- |
| 不具合 | 「ツールを削除」押下後に削除が実行されない（`handleRequestDelete` 後の確認UIが未描画） |
| 修正 | `SkillCenterView/index.tsx` に削除確認ダイアログを追加し、`handleConfirmDelete` / `handleCancelDelete` / `Escape` キー導線を接続 |
| 追加テスト | `SkillCenterView.delete-confirm.test.tsx`（表示/確認/キャンセルの3ケース） |
| 回帰検証 | `SkillCenterView.delete-confirm.test.tsx` + `useSkillCenter.test.ts` + `useFeaturedSkills.test.ts` の 3 files / 30 tests PASS |
| カバレッジ | `index.tsx + useSkillCenter.ts + useFeaturedSkills.ts` で `Stmts/Lines 86.89`, `Branch 84.61`, `Functions 88.88`（全指標80%以上） |
### 関連未タスク

| タスクID | 概要 | 仕様書 |
| --- | --- | --- |
| UT-UI-05-001 | CategoryId / SkillCategory 型統一 | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-categoryid-skillcategory-type-unification.md` |
| UT-UI-05-002 | SkillDetailPanel 内部 Molecule 分離 | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-skill-detail-panel-molecule-split.md` |
| UT-UI-05-003 | ローディングスケルトン実装 | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-loading-skeleton-implementation.md` |
| UT-UI-05-004 | モバイルスワイプ閉じ実装 | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-mobile-swipe-close-detail-panel.md` |
| UT-UI-05-005 | SKILL.md 全文 Markdown レンダリング | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-skill-markdown-full-rendering.md` |
| UT-UI-05-006 | useFeaturedSkills 選定アルゴリズム改善 | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-featured-skills-algorithm-improvement.md` |
| UT-UI-05-007 | Phase 12 UI仕様同期プロファイル適用ガード | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-phase12-ui-spec-sync-guard.md` |

### 実装時の苦戦箇所（TASK-UI-05）

| 苦戦箇所 | 再発条件 | 今回の対処 | 再利用ルール |
| --- | --- | --- | --- |
| `CategoryId` / `SkillCategory` の境界が分散しやすい | 表示都合の `all` とドメインカテゴリを同じ層で扱う場合 | 変換点を限定し、`UT-UI-05-001` として型統一を追跡可能化 | 型は「表示ID層」「ドメイン層」「変換層」で分離する |
| `SkillDetailPanel` への責務集中 | 表示/操作/状態を1コンポーネントで同時拡張する場合 | `UT-UI-05-002`〜`005` へ分解し、Phase 12で残課題を明示化 | 大型UIは完了時に Molecule 分割の未タスクを先に切る |
| Phase 12証跡の同期漏れ | 成果物更新と仕様書更新を別ターンで実施する場合 | `verify/validate/links/audit` の結果を `task-workflow` / `lessons` へ同一ターン反映 | 実装記録と教訓記録は同一ターン同期を完了条件にする |

### 同種課題の簡潔解決手順（4ステップ）

1. UI責務を `view / organism / molecule / hook` に分解し、拡張点を先に決める。  
2. 未タスク候補を `docs/30-workflows/unassigned-task/` に分離登録する。  
3. `verify-unassigned-links` と `audit --target-file` で参照と形式を機械確認する。  
4. `task-workflow.md` と `lessons-learned.md` に苦戦箇所を同一ターンで同期する。  

### 関連ドキュメント

- [TASK-UI-05 ワークフロー](../../../../docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/index.md)
- [TASK-UI-05 実装ガイド](../../../../docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/outputs/phase-12/implementation-guide.md)
- [TASK-UI-05 仕様更新サマリー](../../../../docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/outputs/phase-12/spec-update-summary.md)
- [TASK-UI-05 未タスク検出](../../../../docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/outputs/phase-12/unassigned-task-detection.md)

---

<a id="skill-advanced-views-task-ui-05b"></a>
## Skill Advanced Views UI（TASK-UI-05B / completed）

TASK-UI-05B-SKILL-ADVANCED-VIEWS は、SkillCenter 拡張として 4 ビュー（3A ChainBuilder / 3B ScheduleManager / 3C DebugPanel / 3D AnalyticsDashboard）を実装した完了タスク。
UI 実装コード・IPC 統合・自動テスト・画面検証証跡を正本として管理する。

### 対象ビューと責務

| ビュー | 主要責務 | バックエンド依存 |
| --- | --- | --- |
| 3A SkillChainBuilder | ツールチェーン作成・編集・実行 | TASK-9D（`skill:chain:*`） |
| 3B ScheduleManager | 定期実行設定と履歴確認 | TASK-9G（`skill:schedule:*`） |
| 3C DebugPanel | 実行ステップ可視化・停止/継続制御 | TASK-9H（`skill:debug:*`） |
| 3D AnalyticsDashboard | 実行統計・トレンド確認・エクスポート | TASK-9J（`skill:analytics:*`） |

### 進捗ステータス

| 項目 | 状態 | 参照 |
| --- | --- | --- |
| ワークフロー仕様（Phase 1-13） | ✅ completed | `docs/30-workflows/completed-tasks/TASK-UI-05B-SKILL-ADVANCED-VIEWS/` |
| 実装コード | ✅ 完了 | `apps/desktop/src/renderer/views/` |
| 自動テスト資産 | ✅ 完了 | `apps/desktop/src/renderer/views/*/__tests__/` |
| 画面検証証跡（スクリーンショット） | ✅ 取得済み | `docs/30-workflows/completed-tasks/TASK-UI-05B-SKILL-ADVANCED-VIEWS/outputs/phase-11/screenshots/` |

### 仕様書別SubAgent分担（Phase 12 再同期）

| SubAgent | 担当仕様書 | 主担当作業 | 完了条件 |
| --- | --- | --- | --- |
| A | `ui-ux-components.md` | 主要UI一覧・完了タスク同期 | UI索引と実装導線が一致 |
| B | `ui-ux-feature-components.md` | 4ビュー機能仕様・苦戦箇所同期 | 機能仕様と実装が一致 |
| C | `arch-ui-components.md` | UI構造・責務境界同期 | コンポーネント構造が一致 |
| D | `arch-state-management.md` | 状態管理・P31対策同期 | 状態分離方針が一致 |
| E | `task-workflow.md` | 完了台帳・検証証跡同期 | 証跡値が同日同期済み |
| F | `lessons-learned.md` | 再発条件付き教訓同期 | 同種課題に再利用可能 |

### 実装時の苦戦箇所（再利用用）

| 苦戦箇所 | 原因 | 対処 | 標準化ルール |
| --- | --- | --- | --- |
| Phase 12 再確認で `verify-all-specs` warning が残る | `phase-12-documentation.md` の参照資料に依存Phase成果物が不足 | Phase 2/5/6/7/8/9/10 の成果物参照を追記して依存関係を明示 | UIタスクの再確認は参照資料の依存Phaseを先に埋める |
| 画面検証が既存画像の存在確認に寄る | スクリーンショット再取得コマンドが固定されていない | `capture-skill-advanced-views-screenshots.mjs` を実行して TC-04〜TC-07 を再取得 | UI完了判定は「画像存在」ではなく「再撮影 + 更新時刻確認」で行う |
| 未タスク監査の baseline ノイズ誤読 | `current` と `baseline` を同じ判定として扱ってしまう | `audit --diff-from HEAD` の `currentViolations` を合否、`baseline` を改善バックログとして分離記録 | 未タスク監査は二軸（current/baseline）で記録する |

### 関連未タスク

| 未タスクID | 概要 | タスク仕様書 |
| --- | --- | --- |
| UT-UI-05B-001 | Phase 12 画面証跡再取得ガード（再撮影 + 更新時刻確認の標準化） | `docs/30-workflows/completed-tasks/TASK-UI-05B-SKILL-ADVANCED-VIEWS/unassigned-task/task-ui-05b-phase12-screenshot-evidence-recapture-guard.md` |

### 同種課題の簡潔解決手順（5ステップ）

1. 更新対象を 1仕様書=1SubAgent で分割し、担当責務を先に固定する。  
2. `verify-all-specs` と `validate-phase-output` を実行し、warning/error の根拠を抽出する。  
3. Phase 12 文書の参照資料に依存Phase成果物を追加して再検証する。  
4. UI画面はスクリーンショットを再撮影し、更新時刻で当日証跡を固定する。  
5. 未タスク監査結果は `current` を合否、`baseline` を改善バックログとして分離記録する。  

### 実装着手前のガード条件

| 観点 | ガード |
| --- | --- |
| 型境界 | 05B UI Props と task-9 系 shared types の境界を実装前に再監査する |
| IPC契約 | `api-ipc-agent.md` / `interfaces-agent-sdk-skill.md` / `security-electron-ipc.md` の3点を同時更新する |
| 状態管理 | `agentSlice` の個別セレクタ利用（P31）を維持し、Viewごとに Hook を分離する |
| Phase 12同期 | `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` を同一ターンで実行する |

### 関連ドキュメント

- [TASK-UI-05B ワークフロー](../../../../docs/30-workflows/completed-tasks/TASK-UI-05B-SKILL-ADVANCED-VIEWS/index.md)
- [TASK-UI-05B Phase 11 手動テスト仕様](../../../../docs/30-workflows/completed-tasks/TASK-UI-05B-SKILL-ADVANCED-VIEWS/phase-11-manual-test.md)
- [TASK-UI-05B 画面証跡スクリーンショット](../../../../docs/30-workflows/completed-tasks/TASK-UI-05B-SKILL-ADVANCED-VIEWS/outputs/phase-11/screenshots/)

---

<a id="skill-analysis-view-task-10a-b"></a>
## SkillAnalysisView UI（TASK-10A-B / completed）

TASK-10A-B で `SkillAnalysisView`（分析結果の可視化と改善操作UI）を実装し、Phase 1-12 を完了。
`ScoreDisplay`（スコア表示）、`SuggestionList`（改善提案選択）、`RiskPanel`（リスク表示）を `useSkillAnalysis` で統合する構成を採用した。

### コンポーネント構成

| 区分 | コンポーネント / Hook | 役割 | 想定配置 |
| --- | --- | --- | --- |
| view-like component | SkillAnalysisView | 画面統合、分析実行、改善アクション、エラー/ローディング表示 | `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx` |
| molecule | ScoreDisplay | 総合スコア/カテゴリ別スコアの表示 | `.../components/skill/ScoreDisplay.tsx` |
| molecule | SuggestionList | 優先度別提案リスト、チェック選択、auto-fixable表示 | `.../components/skill/SuggestionList.tsx` |
| molecule | RiskPanel | リスクレベル別表示（critical/high/medium/low） | `.../components/skill/RiskPanel.tsx` |
| hook | useSkillAnalysis | 分析API呼び出し、選択状態、改善適用、再分析制御 | `.../components/skill/hooks/useSkillAnalysis.ts` |

### 進捗ステータス

| 項目 | 状態 | 参照 |
| --- | --- | --- |
| ワークフロー仕様（Phase 1-13） | ✅ Phase 1-12 完了 | `docs/30-workflows/completed-tasks/skill-analysis-view/` |
| 実装コード | ✅ 完了 | `apps/desktop/src/renderer/components/skill/` |
| テスト資産 | ✅ 完了 | `apps/desktop/src/renderer/components/skill/__tests__/` |
| 画面検証証跡（スクリーンショット） | ✅ 取得済み | `docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-11/screenshots/` |

### 状態管理・IPC依存

| 観点 | 採用方針 |
| --- | --- |
| 状態管理 | コンポーネントローカル状態 + `useSkillAnalysis` に集約（Store追加なし） |
| IPC利用 | `window.electronAPI.skill.analyze` / `applyImprovements` / `autoImprove` |
| エラー処理 | `role=\"alert\"` のUI表示 + 再試行導線 |
| 設計方針 | UI表示とビジネスロジックを hook 分離（Refactor済み） |

### アクセシビリティ・デザイントークン補正（Phase 11 反映）

| 観点 | 反映内容 |
| --- | --- |
| リストラベル | `SuggestionList` の優先度別リスト / `RiskPanel` リストへ `aria-label` を追加 |
| 色トークン | `SkillAnalysisView` のボタン文字色を `text-[var(--text-inverse)]` に統一 |
| テスト補強 | `SuggestionList.test.tsx` / `RiskPanel.test.tsx` に `aria-label` 検証を追加 |

### 画面検証証跡（2026-03-02）

| 証跡 | ファイル |
| --- | --- |
| 初期表示（分析結果） | `docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-11/screenshots/TC-01-analysis-default.png` |
| 提案選択状態 | `docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-11/screenshots/TC-02-analysis-selection.png` |
| 改善後状態 | `docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-11/screenshots/TC-03-analysis-improved.png` |
| エラー表示 | `docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-11/screenshots/TC-04-analysis-error.png` |

### 実装時の苦戦箇所（TASK-10A-B）

| 苦戦箇所 | 再発条件 | 今回の対処 | 再利用ルール |
| --- | --- | --- | --- |
| Phase 11 がコード分析ベースのまま残りやすい | UI起動制約を理由にスクリーンショット取得を省略する場合 | 専用スクリプトで 4 状態（通常/選択/改善後/エラー）を再撮影し、manual-test-result を実証跡ベースへ更新 | UIタスクのPhase 11は「実画面証跡」を完了条件に固定する |
| Phase 11 必須セクション欠落で `validate-phase-output` が落ちる | `phase-11-manual-test.md` の章立てを簡略化しすぎる場合 | 「統合テスト連携」節を追加し、Phase 12未タスク連携を明記 | 仕様書更新前にテンプレート必須節を機械検証する |
| Phase 12 で未タスク件数が古いまま残る | 修正済み課題（D1/D2）を未タスク台帳から除外し忘れる場合 | `unassigned-task-detection.md` を 7件→5件へ再同期し、task-workflow と合わせて更新 | 未タスク台帳は「現状有効件数」で毎回再計算する |

### 同種課題の簡潔解決手順（5ステップ）

1. 画面証跡を先に再取得し、`outputs/phase-11/screenshots` を更新する。  
2. `manual-test-result` と `discovered-issues` を実証跡ベースに書き換える。  
3. `verify-all-specs` と `validate-phase-output` を実行し、不足セクションを埋める。  
4. 未タスク台帳（作成済みID）を再計算し、`task-workflow.md` と同期する。  
5. 苦戦箇所を `lessons-learned.md` に転記して再利用ルール化する。  

### 関連未タスク

| 未タスクID | 概要 | タスク仕様書 |
| --- | --- | --- |
| UT-TASK-10A-B-001 | 自動修正可能フィルタボタン実装 | `docs/30-workflows/completed-tasks/unassigned-task/task-10a-b-autofixable-filter-button.md` |
| UT-TASK-10A-B-002 | 改善結果トースト通知実装 | `docs/30-workflows/completed-tasks/unassigned-task/task-10a-b-improvement-toast-notification.md` |
| UT-TASK-10A-B-003 | 改善結果内訳表示実装 | `docs/30-workflows/completed-tasks/unassigned-task/task-10a-b-improvement-result-breakdown-ui.md` |
| UT-TASK-10A-B-004 | Props 契約整合（`skill` vs `skillName`） | `docs/30-workflows/completed-tasks/unassigned-task/task-10a-b-props-contract-alignment.md` |
| UT-TASK-10A-B-005 | molecule 分割設計追補（Header/Error/Actions） | `docs/30-workflows/completed-tasks/unassigned-task/task-10a-b-analysis-view-molecule-separation.md` |
| UT-TASK-10A-B-006 | Phase 11 必須セクション検証ガード（統合テスト連携/完了条件） | `docs/30-workflows/completed-tasks/unassigned-task/task-10a-b-phase11-required-sections-validation-guard.md` |
| UT-TASK-10A-B-007 | Phase 11 画面証跡鮮度ガード（再撮影 + 更新時刻確認） | `docs/30-workflows/completed-tasks/unassigned-task/task-10a-b-phase11-screenshot-freshness-guard.md` |
| UT-TASK-10A-B-008 | 未タスク件数再計算同期ガード（detection/task-workflow/ui-ux-feature） | `docs/30-workflows/completed-tasks/unassigned-task/task-10a-b-unassigned-count-resync-guard.md` |

---

<a id="skill-create-wizard-task-10a-c"></a>
## SkillCreateWizard UI（TASK-10A-C / completed）

TASK-10A-C で `SkillCreateWizard`（説明入力→設定→生成→完了の4ステップ）を実装し、Phase 1-12 を完了。
`useWizardStep` でステップ遷移を管理し、`window.electronAPI.skill.create` を通じて Main の `skill:create` IPC と接続する。

### コンポーネント構成

| 区分 | コンポーネント / Hook | 役割 | 想定配置 |
| --- | --- | --- | --- |
| view-like component | SkillCreateWizard | ウィザード全体状態管理（description/options/error/skillPath） | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` |
| molecule | StepIndicator | ステップ進捗表示（active/completed/pending） | `.../components/skill/wizard/StepIndicator.tsx` |
| molecule | DescribeStep | 説明入力 + 次へ遷移 | `.../components/skill/wizard/DescribeStep.tsx` |
| molecule | ConfigureStep | 生成オプション設定（generateTasks/addAgents/addReferences） | `.../components/skill/wizard/ConfigureStep.tsx` |
| molecule | GenerateStep | 生成中ローディング / エラー表示 | `.../components/skill/wizard/GenerateStep.tsx` |
| molecule | CompleteStep | 生成完了表示（作成パス表示 + close） | `.../components/skill/wizard/CompleteStep.tsx` |
| hook | useWizardStep | ステップ遷移ロジック（goNext/goBack/goToStep） | `.../components/skill/hooks/useWizardStep.ts` |

### 進捗ステータス

| 項目 | 状態 | 参照 |
| --- | --- | --- |
| ワークフロー仕様（Phase 1-13） | ✅ Phase 1-12 完了 | `docs/30-workflows/completed-tasks/skill-create-wizard/` |
| 実装コード | ✅ 完了 | `apps/desktop/src/renderer/components/skill/` |
| テスト資産 | ✅ 完了 | `apps/desktop/src/renderer/components/skill/__tests__/` |
| 画面検証証跡（スクリーンショット） | ✅ 取得済み | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-11/screenshots/` |

### 状態管理・IPC依存

| 観点 | 採用方針 |
| --- | --- |
| 状態管理 | ローカル state + `useWizardStep` で完結（Store追加なし） |
| IPC利用 | `window.electronAPI.skill.create({ description, options })` |
| エラー処理 | `GenerateStep` 上でエラーメッセージ表示 |
| 契約整合 | `skill:create`（P42準拠3段バリデーション + sender検証） |

### 画面検証証跡（2026-03-02）

| 証跡 | ファイル |
| --- | --- |
| Step1 初期表示（Dark） | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-11/screenshots/TC-01-step1-initial-dark.png` |
| Step1 入力後（Dark） | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-11/screenshots/TC-02-step1-filled-dark.png` |
| Step2 設定（Dark） | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-11/screenshots/TC-03-step2-configure-dark.png` |
| Step3 生成中（Dark） | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-11/screenshots/TC-04-step3-generating-dark.png` |
| Step4 完了（Dark） | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-11/screenshots/TC-05-step4-complete-dark.png` |
| Step3 エラー（Dark） | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-11/screenshots/TC-06-step3-error-dark.png` |
| Step1 初期表示（Light） | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-11/screenshots/TC-07-step1-initial-light.png` |
| Step1 初期表示（Mobile Dark） | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-11/screenshots/TC-08-step1-initial-mobile-dark.png` |

### 実装時の苦戦箇所（TASK-10A-C）

| 苦戦箇所 | 再発条件 | 今回の対処 | 再利用ルール |
| --- | --- | --- | --- |
| ウィザード状態の画面証跡が不足しやすい | 正常系のみ撮影して生成中/エラー状態を取り逃がす場合 | 専用スクリプトで 8 状態を一括撮影し、TCとの対応表を作成 | UIタスクは状態遷移ごとに screenshot-plan を先に固定する |
| `skill:create` 契約が仕様未反映のまま残る | Main/Preload更新後に仕様同期を後回しにする場合 | `api-ipc-agent`/`interfaces`/`security`/`architecture` を同一ターン更新 | 新規 `skill:*` 追加時は4仕様書同時更新を必須化 |
| Phase 12 成果物名の揺れ | `unassigned-task-report` など旧命名を残す場合 | `unassigned-task-detection.md` へ統一し artifacts を同期 | 命名規約と `validate-phase-output` を完了前に必ず照合する |

### 関連未タスク

本タスクで新規未タスクは検出されていない（`unassigned-task-detection.md`: 0件）。

---

## 完了タスク

| Issue #    | 機能名                                                         | 完了日     | 関連ドキュメント                                                                                    |
| ---------- | -------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------- |
| TASK-UI-05 | SkillCenterView（ツール探索UI、7コンポーネント + 2フック + 10テストファイル） | 2026-03-01 | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/` |
| TASK-UI-05B | Skill Advanced Views（4ビュー + 共通IPC Hooks + 導線追加） | 2026-03-02 | `docs/30-workflows/completed-tasks/TASK-UI-05B-SKILL-ADVANCED-VIEWS/` |
| TASK-10A-B | SkillAnalysisView（分析・改善UI、4コンポーネント + 1 Hook） | 2026-03-02 | `docs/30-workflows/completed-tasks/skill-analysis-view/` |
| TASK-10A-C | SkillCreateWizard（4ステップUI + IPC `skill:create`） | 2026-03-02 | `docs/30-workflows/completed-tasks/skill-create-wizard/` |
| TASK-9A    | skill-editor（SkillEditor / SkillCodeEditor + CRUD + backups） | 2026-02-26 | `docs/30-workflows/completed-tasks/TASK-9A-skill-editor/`                                                           |
| TASK-7D    | chatpanel-agent-integration（ChatPanel統合・SkillStreamingView） | 2026-01-31 | `docs/30-workflows/TASK-7D-chatpanel-agent-integration/`                                            |
| TASK-3-2-D | skill-stream-copy-history                                      | 2026-01-28 | `docs/30-workflows/TASK-3-2-D-skill-stream-copy-history/`                                           |
| TASK-3-2-B | skill-stream-i18n                                              | 2026-01-28 | `docs/30-workflows/TASK-3-2-B-skill-stream-i18n/`                                                   |
| TASK-3-2-C | timestamp-autoupdate                                           | 2026-01-28 | `docs/30-workflows/TASK-3-2-C-timestamp-autoupdate/`                                                |
| TASK-3-2-A | skill-stream-ux-improvements                                   | 2026-01-27 | `docs/30-workflows/TASK-3-2-A-skill-stream-ux-improvements/`                                        |
| TASK-3-2   | skillexecutor-ipc-integration                                  | 2026-01-25 | `docs/30-workflows/TASK-3-2-skillexecutor-ipc-integration/`                                         |
| #468       | workspace-chat-edit-ui (基盤)                                  | 2026-01-25 | `docs/30-workflows/workspace-chat-edit-ui/`                                                         |
| #494       | workspace-chat-edit-ui (FileAttachmentButton, FileContextList) | 2026-01-27 | `docs/30-workflows/completed-tasks/workspace-chat-edit-ui/outputs/phase-12/implementation-guide.md` |

---

## 仕様書作成済みタスク（spec_created）

### SkillEditorView UI（TASK-UI-05A / 統合未完了）

TASK-UI-05A-SKILL-EDITOR-VIEW は、SkillEditorView の Phase 1-13 仕様書作成まで完了している。`views/SkillEditorView` の実装ファイルは存在するが、ナビゲーション導線と `skill:getFileTree` IPC連携が未完了のため、統合状態は未完了。
既存の `EditorView` と `SkillEditor` とは責務が異なり、専用ビューとしては未配線の状態。

| 項目 | 状態 | 参照 |
| --- | --- | --- |
| ワークフロー仕様（Phase 1-13） | ✅ 作成済み | `docs/30-workflows/skill-editor-view/` |
| 実装コード（`views/SkillEditorView`） | ⚠️ 実装済み（統合未完了） | `apps/desktop/src/renderer/views/SkillEditorView/` |
| ナビゲーション導線（`ViewType` / `AppDock`） | ❌ 未配線 | `apps/desktop/src/renderer/store/types.ts`, `App.tsx` |
| 画面検証証跡 | ✅ 取得済み | `docs/30-workflows/skill-editor-view/outputs/phase-11/` |
| `skill:getFileTree` IPCチャネル | ❌ 未実装 | UT-UI-05A-GETFILETREE-001 で対応予定。`api-ipc-agent.md` に仕様追加済み |
| 実装残課題の統合管理 | ✅ 正式登録済み | `docs/30-workflows/completed-tasks/skill-editor-view-closure/unassigned-task/task-ui-05a-editor-view-implementation-closure.md` |
| `useFileTree` 契約整合 | ✅ 正式登録済み | `docs/30-workflows/completed-tasks/skill-editor-view-closure/unassigned-task/task-ui-05a-spec-consistency-filetree-contract.md` |

### 画面検証証跡

| 証跡 | ファイル |
| --- | --- |
| 現行 Dashboard 画面 | `docs/30-workflows/skill-editor-view/outputs/phase-11/screenshots/UI05A-01-current-dashboard.png` |
| 現行 Editor 画面 | `docs/30-workflows/skill-editor-view/outputs/phase-11/screenshots/UI05A-02-current-editor-view.png` |
| 再監査 Dashboard 画面（2026-03-02） | `docs/30-workflows/skill-editor-view/outputs/phase-11/screenshots/UI05A-03-current-dashboard-20260302.png` |
| 再監査 Editor 画面（2026-03-02） | `docs/30-workflows/skill-editor-view/outputs/phase-11/screenshots/UI05A-04-current-editor-20260302.png` |
| 手動検証結果 | `docs/30-workflows/skill-editor-view/outputs/phase-11/manual-test-result.md` |
| 発見課題 | `docs/30-workflows/skill-editor-view/outputs/phase-11/discovered-issues.md` |

---

## 仕様書作成済みタスク（spec_created）

現時点で本ドキュメント内に `spec_created` 状態の UI タスクはなし（TASK-UI-05B は 2026-03-02 時点で completed へ移行）。

---

## 関連ドキュメント

### 分割ファイル

- [SkillStreamDisplay詳細仕様](./ui-ux-feature-skill-stream.md) - TASK-3-2シリーズの完全な仕様
- [SkillStreamingView統合仕様](./interfaces-agent-sdk-ui.md) - TASK-7D ChatPanel統合仕様

### 親・関連仕様

- [UI/UXコンポーネント概要](./ui-ux-components.md)
- [デザイン原則](./ui-ux-design-principles.md)
- [Agent Execution UI](./ui-ux-agent-execution.md)

### 実装ガイド

- [SkillStreamDisplay UX改善](../../../docs/30-workflows/TASK-3-2-A-skill-stream-ux-improvements/outputs/phase-12/implementation-guide.md)
- [タイムスタンプ自動更新](../../../docs/30-workflows/TASK-3-2-C-timestamp-autoupdate/outputs/phase-12/implementation-guide.md)
- [SkillStreamDisplay i18n](../../../docs/30-workflows/TASK-3-2-B-skill-stream-i18n/outputs/phase-12/implementation-guide.md)
- [SkillStreamDisplay コピー履歴](../../../docs/30-workflows/TASK-3-2-D-skill-stream-copy-history/outputs/phase-12/implementation-guide.md)
- [TASK-9A SkillEditor実装](../../../docs/30-workflows/completed-tasks/TASK-9A-skill-editor/outputs/phase-12/implementation-guide.md)
- [workspace-chat-edit-ui](../../../docs/30-workflows/completed-tasks/workspace-chat-edit-ui/outputs/phase-12/implementation-guide.md)
- [TASK-UI-05 SkillCenterView実装](../../../docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/outputs/phase-12/implementation-guide.md)
- [TASK-UI-05A SkillEditorView仕様（spec_created）](../../../docs/30-workflows/skill-editor-view/index.md)
- [TASK-UI-05A 画面検証結果](../../../docs/30-workflows/skill-editor-view/outputs/phase-11/manual-test-result.md)
- [TASK-10A-B SkillAnalysisView仕様](../../../docs/30-workflows/completed-tasks/skill-analysis-view/index.md)
- [TASK-10A-B 手動検証結果](../../../docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-11/manual-test-result.md)
- [TASK-10A-B 画面検証スクリーンショット](../../../docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-11/screenshots/)
- [TASK-10A-C SkillCreateWizard仕様](../../../docs/30-workflows/completed-tasks/skill-create-wizard/index.md)
- [TASK-10A-C 手動検証結果](../../../docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-11/manual-test-result.md)
- [TASK-10A-C 画面検証スクリーンショット](../../../docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-11/screenshots/)

---

## 変更履歴

| 日付       | バージョン | 変更内容                                                                                        |
| ---------- | ---------- | ----------------------------------------------------------------------------------------------- |
| 2026-03-04 | v1.14.9    | workflow02 追補へ `UT-IMP-PHASE11-SCREENSHOT-COVERAGE-MATRIX-GUARD-001` を追加。`phase-11-manual-test.md` の画面カバレッジマトリクス未記載 warning を苦戦箇所として追記し、matrix 必須列（TC-ID/区分/期待証跡/理由）を再利用ルールへ反映 |
| 2026-03-04 | v1.14.8    | workflow02 追補へ「Phase 11証跡の別workflow参照による coverage validator fail」を苦戦箇所として追加。対象workflow配下への証跡正規配置、`NON_VISUAL:` 記法、`validate-phase11-screenshot-coverage` PASS 固定を再利用ルールへ反映 |
| 2026-03-04 | v1.14.7    | workflow02 追補へ `UT-IMP-PHASE12-SCREENSHOT-PORT-CONFLICT-GUARD-001` を追加。`Port 5174 is already in use` 混在時の再発条件・対処（`lsof` 事前検査 + 分岐記録）を苦戦箇所テーブルへ追記し、未タスク正本リンクを同期 |
| 2026-03-04 | v1.14.6    | workflow02 追補の状態同期を実施。`UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001` を関連未タスク表で完了化（取り消し線 + 完了注記）し、苦戦箇所テーブルへ実施済み対処（scripts 登録 + 文書同期 + coverage 4/4 PASS）を反映 |
| 2026-03-04 | v1.13.5    | SkillCenter削除導線ホットフィックスの実測値を再確定。対象テストを `delete-confirm/useSkillCenter/useFeaturedSkills` の3ファイルへ固定し、再検証値を `3 files / 30 tests`、coverage `86.89/84.61/88.88` へ更新 |
| 2026-03-04 | v1.13.4    | TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001 追補: SkillCenter 削除導線ホットフィックス（確認ダイアログ未描画の解消）を追加。テスト資産件数を `10ファイル / 132テスト` に更新し、再検証値（3 files / 30 tests、coverage 86.89/84.61/88.88）を記録 |
| 2026-03-04 | v1.13.3    | TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001 反映: SkillStreamDisplay セクションに認証 preflight UX ガード（`auth-key:exists` 事前判定、`AUTHENTICATION_ERROR` 表示、execute抑止）を追加。Phase 11 画面証跡3件を同期 |
| 2026-03-04 | v1.14.5    | workflow02 追補を反映。`UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001` / `UT-IMP-PHASE12-CAPTURE-SCRIPT-NAVIGATION-STABILITY-GUARD-001` を Skill Import Idempotency Guard 節へ追記し、苦戦箇所（コマンド公開不足 / `page.goto` timeout）の再利用ルールを追加 |
| 2026-03-04 | v1.14.4    | TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001 を反映。SkillCenterView セクションへ欠損メタデータ防御契約（description nullish、配列 nullish、検索/おすすめ防御）を追加し、Phase 11 画面証跡 TC-01〜TC-04 を同期。完了タスク台帳へ同タスクを登録 |
| 2026-03-04 | v1.14.3    | TASK-10A-D の再確認苦戦箇所から未タスク2件を追加。`UT-IMP-TASK10A-D-SUBAGENT-EXECUTION-LOG-GUARD-001`（仕様書別SubAgent実行ログ必須化）と `UT-IMP-TASK10A-D-SCREENSHOT-PURPOSE-DISAMBIGUATION-GUARD-001`（画面証跡の状態名+検証目的分離）を関連未タスクへ登録 |
| 2026-03-04 | v1.14.2    | TASK-10A-D 仕様書別SubAgent反映ログを追加。`ui-ux-feature-components` / `task-workflow` / `lessons-learned` の3仕様書分担で実装内容と苦戦箇所を同一ターン同期する運用を明文化し、5ステップの簡潔解決手順へ再編 |
| 2026-03-04 | v1.14.1    | TASK-10A-D 再確認追補: Phase 12再検証値（13/13, 28項目, TC 5/5, current=0/baseline=85）を追加。TC-02（analysis遷移時フォールバック）とTC-05（意図的エラー検証）の証跡意図を分離し、画面証跡レビューの運用ルールを明文化 |
| 2026-03-03 | v1.14.0    | TASK-10A-D 完了反映: 収録機能一覧・完了タスクへスキルライフサイクルUI統合を追加。専用セクション（コンポーネント階層/ビュー構成/ChatPanel統合/Store拡張/テスト132件/苦戦箇所3件）を新設 |
| 2026-03-02 | v1.13.2    | TASK-10A-C 完了反映: 収録機能一覧・完了タスクへ SkillCreateWizard を追加。専用セクション（構成/IPC依存/画面証跡8件/苦戦箇所）を新設し、未タスク0件を同期 |
| 2026-03-02 | v1.13.1    | TASK-10A-B 未タスク追補: 苦戦箇所3件（Phase 11必須節検証/画面証跡鮮度/未タスク件数再計算）を独立未タスク `UT-TASK-10A-B-006〜008` として追加し、関連未タスク表を8件へ拡張 |
| 2026-03-02 | v1.13.0    | TASK-10A-B 追補: 実装時の苦戦箇所（Phase 11 実証跡化/必須節不足/未タスク件数ドリフト）と5ステップ簡潔解決手順を追加 |
| 2026-03-02 | v1.12.9    | TASK-10A-B 完了反映: 収録機能一覧・完了タスクへ SkillAnalysisView を追加。専用セクション（構成/IPC/a11y補正/画面証跡/未タスク5件）を新設 |
| 2026-03-02 | v1.12.5    | TASK-UI-05A 再監査反映: SkillEditorView を「実装未着手」から「実装済み（統合未完了）」へ更新。再取得した画面証跡（UI05A-03/04）を追加し、未タスク正本を `docs/30-workflows/unassigned-task/` へ統一 |
| 2026-03-01 | v1.12.4    | TASK-UI-05A spec_created 反映: 収録機能一覧へ `Skill Editor View`（実装未着手）を追加。`仕様書作成済みタスク` セクションを新設し、未実装ギャップ（View未生成・導線未配線）と画面検証証跡を明記 |
| 2026-03-02 | v1.12.8    | UT-UI-05B-001 登録: TASK-UI-05B の苦戦箇所（画面証跡の再撮影漏れリスク）を未タスク化し、関連未タスク表へ `task-ui-05b-phase12-screenshot-evidence-recapture-guard.md` を追加 |
| 2026-03-02 | v1.12.7    | TASK-UI-05B テンプレート最適化: 仕様書別SubAgent分担（6責務）を追加し、簡潔解決手順を5ステップへ再編 |
| 2026-03-02 | v1.12.6    | TASK-UI-05B 再確認追補: 苦戦箇所（Phase 12参照不足warning、画面証跡再撮影、未タスク監査のcurrent/baseline分離）と4ステップの簡潔解決手順を追加 |
| 2026-03-02 | v1.12.5    | TASK-UI-05B 実装完了同期: 収録機能一覧を `完了` に更新し、専用セクションの進捗を `completed` へ反映。完了タスクへ TASK-UI-05B を追加し、spec_created 台帳を解消 |
| 2026-03-01 | v1.12.4    | TASK-UI-05B spec_created を反映: 収録機能一覧に Skill Advanced Views を追加し、専用セクション（4ビュー責務・実装前ガード・画面証跡）と `仕様書作成済みタスク` テーブルを新設 |
| 2026-03-01 | v1.12.3    | TASK-UI-05 completed-tasks 移管: ワークフロー参照を `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/` へ更新し、関連未タスク7件の参照先を同ディレクトリ配下 `unassigned-task/` へ同期 |
| 2026-03-01 | v1.12.2    | TASK-UI-05追補: 関連未タスクに UT-UI-05-007（Phase 12 UI仕様同期プロファイル適用ガード）を追加し、task-workflow/ui-ux-components との参照整合を統一 |
| 2026-03-01 | v1.12.1    | TASK-UI-05追補: SkillCenterView 実装時の苦戦箇所（型境界/責務集中/Phase 12同期）と4ステップ簡潔解決手順を追加 |
| 2026-03-01 | v1.12.0    | TASK-UI-05完了反映: SkillCenterView セクション追加（コンポーネント/状態管理/IPC依存/関連未タスク）。収録機能一覧・完了タスク・関連ドキュメントを同期 |
| 2026-02-26 | v1.11.2    | TASK-9A成果物移管を反映。参照正本を `completed-tasks/TASK-9A-skill-editor/` に更新し、`TASK-9A-C-004` を完了化して `completed-tasks/unassigned-task/` へ移管 |
| 2026-02-26 | v1.11.1    | TASK-9A-C-004 を関連未タスクへ追加。Phase 12再確認で顕在化した Part 1/2 要件漏れ・監査判定誤読・メタ情報重複・3仕様書同期漏れの再発防止タスクを台帳化 |
| 2026-02-26 | v1.11.0    | TASK-9A完了反映: SkillEditor UI を `spec_created` から `完了` に更新。`TASK-9A-skill-editor` を正本参照へ追加し、未タスク `TASK-9A-C-002` を完了化（統合実装） |
| 2026-02-19 | v1.10.0    | TASK-9A-C: 関連未タスク3件参照テーブル追加。仕様書ディレクトリをcompleted-tasks/にパス移行 |
| 2026-02-19 | v1.9.0     | TASK-9A-C: SkillEditorコンポーネント仕様追加（コンポーネント階層、レイアウト、状態管理、IPC依存、キーボード、アクセシビリティ） |
| 2026-02-19 | v1.8.1     | TASK-9A-C: Phase 12準拠監査結果（`phase12-compliance-audit.md`）と監査反映内容を追記 |
| 2026-02-19 | v1.8.0     | TASK-9A-C: SkillEditor UIの仕様書作成済み状態を追加（実装未着手を明記、関連ドキュメントリンク追加） |
| 2026-01-31 | v1.7.0     | TASK-7D: SkillStreamingViewコンポーネント仕様追加、完了タスクテーブルにTASK-7D追加、関連ドキュメントリンク追加 |
| 2026-01-28 | v1.6.0     | TASK-3-2-D: コピー履歴機能追加（CopyHistoryPanel、CopyHistoryContext、useCopyHistory）          |
| 2026-01-28 | v1.5.0     | 構造最適化: SkillStreamDisplay関連を ui-ux-feature-skill-stream.md に分割（826行→約400行）      |
| 2026-01-28 | v1.4.0     | TASK-3-2-B: i18n対応追加（formatRelativeTime localeパラメータ、日英2言語、翻訳テーブル）        |
| 2026-01-28 | v1.3.0     | TASK-3-2-C: タイムスタンプ自動更新機能追加（TimestampProvider, useInterval, usePageVisibility） |
| 2026-01-27 | v1.2.0     | TASK-3-2-A: SkillStreamDisplay UX改善（R1スピナー、R2タイムスタンプ、R3コピー）追加             |
| 2026-01-27 | v1.1.1     | 構造最適化: 概要セクション追加（収録機能一覧・共通仕様テーブル）                                |
| 2026-01-27 | v1.1.0     | Issue #494: FileAttachmentButton, FileContextList コンポーネント仕様追加                        |
| 2026-01-26 | v1.0.0     | 仕様ガイドライン準拠: コード例を表形式・文章に変換                                              |

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
| テスト資産 | ✅ 完了（9ファイル / 125テストケース定義） | `apps/desktop/src/renderer/views/SkillCenterView/__tests__/` |
| Phase 12成果物 | ✅ 完了（5必須 + 補助1） | `outputs/phase-12/*.md` |

### 状態管理・IPC依存

| 観点 | 採用方針 |
| --- | --- |
| Store接続 | `useAvailableSkillsMetadata` / `useImportedSkills` / `useSetSkillFilter` など個別セレクタを使用（P31準拠） |
| ローカル状態 | 詳細パネル開閉、削除確認、追加中アニメーション状態を `useState` で管理 |
| IPC利用 | Rendererは Store アクション経由で利用（`skill:list`, `skill:import`, `skill:remove`） |
| 契約変更 | 新規IPCチャンネル追加なし（既存契約の再利用） |

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

## 完了タスク

| Issue #    | 機能名                                                         | 完了日     | 関連ドキュメント                                                                                    |
| ---------- | -------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------- |
| TASK-UI-05 | SkillCenterView（ツール探索UI、7コンポーネント + 2フック + 9テストファイル） | 2026-03-01 | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/` |
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

---

## 変更履歴

| 日付       | バージョン | 変更内容                                                                                        |
| ---------- | ---------- | ----------------------------------------------------------------------------------------------- |
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

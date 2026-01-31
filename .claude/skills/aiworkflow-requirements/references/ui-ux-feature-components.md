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

## 完了タスク

| Issue #    | 機能名                                                         | 完了日     | 関連ドキュメント                                                                                    |
| ---------- | -------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------- |
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
- [workspace-chat-edit-ui](../../../docs/30-workflows/completed-tasks/workspace-chat-edit-ui/outputs/phase-12/implementation-guide.md)

---

## 変更履歴

| 日付       | バージョン | 変更内容                                                                                        |
| ---------- | ---------- | ----------------------------------------------------------------------------------------------- |
| 2026-01-31 | v1.7.0     | TASK-7D: SkillStreamingViewコンポーネント仕様追加、完了タスクテーブルにTASK-7D追加、関連ドキュメントリンク追加 |
| 2026-01-28 | v1.6.0     | TASK-3-2-D: コピー履歴機能追加（CopyHistoryPanel、CopyHistoryContext、useCopyHistory）          |
| 2026-01-28 | v1.5.0     | 構造最適化: SkillStreamDisplay関連を ui-ux-feature-skill-stream.md に分割（826行→約400行）      |
| 2026-01-28 | v1.4.0     | TASK-3-2-B: i18n対応追加（formatRelativeTime localeパラメータ、日英2言語、翻訳テーブル）        |
| 2026-01-28 | v1.3.0     | TASK-3-2-C: タイムスタンプ自動更新機能追加（TimestampProvider, useInterval, usePageVisibility） |
| 2026-01-27 | v1.2.0     | TASK-3-2-A: SkillStreamDisplay UX改善（R1スピナー、R2タイムスタンプ、R3コピー）追加             |
| 2026-01-27 | v1.1.1     | 構造最適化: 概要セクション追加（収録機能一覧・共通仕様テーブル）                                |
| 2026-01-27 | v1.1.0     | Issue #494: FileAttachmentButton, FileContextList コンポーネント仕様追加                        |
| 2026-01-26 | v1.0.0     | 仕様ガイドライン準拠: コード例を表形式・文章に変換                                              |

# 機能別 UI コンポーネント

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
>
> **親ドキュメント**: [ui-ux-components.md](./ui-ux-components.md)

---

## Community Visualization UI コンポーネント（CONV-08-05）

コミュニティ構造を可視化するUIコンポーネント群。グラフベースのコミュニティ表示、フィルタリング、検索、詳細表示などの機能を提供する。

### コンポーネント階層

| コンポーネント | 種類 | 親 | 子要素 |
| -------------- | ---- | --- | ------ |
| CommunityVisualization | templates | - | CommunityFilter, CommunityGraph, CommunityDetailPanel |
| CommunityFilter | organisms | CommunityVisualization | レベル選択ドロップダウン, 検索入力 |
| CommunityGraph | organisms | CommunityVisualization | SVGベースのグラフ描画, ノード（コミュニティ）, エッジ（親子関係） |
| CommunityDetailPanel | organisms | CommunityVisualization | 基本情報, 要約テキスト, キーワードリスト, メンバーエンティティリスト |

### コンポーネント仕様

#### CommunityVisualization

| 項目 | 仕様 |
| ---- | ---- |
| ファイル | `apps/desktop/src/renderer/components/community/templates/CommunityVisualization/` |
| 責務 | 全体レイアウト、状態管理、コンポーネント統合 |
| Props | `className?: string` |

**レイアウト構造**

画面は3つの領域で構成される。

| 領域 | 位置 | 内容 |
| ---- | ---- | ---- |
| フィルターバー | 上部（全幅） | レベル選択と検索入力を配置 |
| グラフエリア | 左側（メイン） | コミュニティグラフをズーム/パン対応で表示 |
| 詳細パネル | 右側（サブ） | 選択したコミュニティの詳細情報を表示（選択時のみ） |

#### CommunityGraph

| 項目 | 仕様 |
| ---- | ---- |
| ファイル | `apps/desktop/src/renderer/components/community/organisms/CommunityGraph/` |
| 責務 | SVGベースのグラフ描画、ズーム/パン、ノード選択 |
| Props | `communities`, `selectedId`, `highlightedIds`, `onSelect`, `onZoomChange` |

**機能**

| 機能 | 説明 |
| ---- | ---- |
| 階層レイアウト | dagreアルゴリズムによるレベル別配置 |
| ズーム/パン | マウスホイール、ドラッグ操作 |
| ノード選択 | クリックで選択、詳細パネル表示 |
| ハイライト | 検索結果マッチノードの強調表示 |
| キーボード操作 | Tab/Enter/Escapeでナビゲーション |

#### CommunityDetailPanel

| 項目 | 仕様 |
| ---- | ---- |
| ファイル | `apps/desktop/src/renderer/components/community/organisms/CommunityDetailPanel/` |
| 責務 | 選択コミュニティの詳細情報表示 |
| Props | `community`, `summary`, `members`, `isLoading`, `onClose` |

**表示内容**

| セクション | 内容 |
| ---------- | ---- |
| ヘッダー | コミュニティID、レベル、サイズ |
| 要約 | CommunitySummaryのテキスト |
| キーワード | タグ形式で表示 |
| 主要エンティティ | 重要度順リスト |
| センチメント | ポジティブ/ニュートラル/ネガティブ |
| メンバー | エンティティリスト（スクロール可能） |

#### CommunityFilter

| 項目 | 仕様 |
| ---- | ---- |
| ファイル | `apps/desktop/src/renderer/components/community/organisms/CommunityFilter/` |
| 責務 | レベルフィルタリング、検索機能 |
| Props | `levels`, `selectedLevel`, `searchQuery`, `totalCount`, `filteredCount`, `onChange` |

**機能**

| 機能 | 説明 |
| ---- | ---- |
| レベル選択 | ドロップダウンで階層レベル絞り込み |
| キーワード検索 | デバウンス付きテキスト入力 |
| カウント表示 | フィルター結果件数表示 |
| クリア | Escapeキーまたはクリアボタン |

### IPC API

CommunityAPIは以下のメソッドを提供する。

| メソッド | 引数 | 戻り値 | 説明 |
| -------- | ---- | ------ | ---- |
| getAll | なし | `Promise<Result<Community[]>>` | 全コミュニティ取得 |
| getByLevel | level: number | `Promise<Result<Community[]>>` | レベル指定でコミュニティ取得 |
| getSummary | communityId: CommunityId | `Promise<Result<CommunitySummary \| null>>` | コミュニティサマリー取得 |
| getMembers | communityId: CommunityId | `Promise<Result<StoredEntity[]>>` | メンバーエンティティ取得 |
| search | query: string | `Promise<Result<Community[]>>` | キーワード検索 |

### 使用ライブラリ

| ライブラリ | バージョン | 用途 |
| ---------- | ---------- | ---- |
| dagre | ^0.8.5 | 階層グラフレイアウトアルゴリズム |

---

## Custom Execution Environment UI コンポーネント（AGENT-006）

エージェント実行結果をリアルタイムでプレビューするためのUIコンポーネント群。
HTML、Markdownのプレビューに対応し、3層セキュリティ防御を実装。

### コンポーネント階層

| コンポーネント | 種類 | 親 | 子要素 |
| -------------- | ---- | --- | ------ |
| AgentExecutionView | views | - | SplitLayout |
| SplitLayout | organisms | AgentExecutionView | leftPanel (AgentChatInterface), Divider, rightPanel (ExecutionEnvironment) |
| ExecutionEnvironment | organisms | SplitLayout (rightPanel) | EnvironmentSelector, HTMLPreviewEnvironment / MarkdownPreviewEnvironment |
| EnvironmentSelector | molecules | ExecutionEnvironment | 環境タイプ選択ドロップダウン |

### コンポーネント仕様

| コンポーネント             | 種類     | 責務                              |
| -------------------------- | -------- | --------------------------------- |
| SplitLayout                | organism | 左右分割レイアウト、ドラッグ調整  |
| EnvironmentSelector        | molecule | 環境タイプ選択ドロップダウン      |
| ExecutionEnvironment       | organism | 環境タイプに応じたプレビュー切替  |
| HTMLPreviewEnvironment     | organism | sandbox iframe内でHTMLを安全表示  |
| MarkdownPreviewEnvironment | organism | Markdownをレンダリング表示        |

### ファイル配置

| コンポーネント             | パス                                                                    |
| -------------------------- | ----------------------------------------------------------------------- |
| SplitLayout                | `apps/desktop/src/renderer/components/organisms/SplitLayout/`           |
| EnvironmentSelector        | `apps/desktop/src/renderer/components/molecules/EnvironmentSelector/`   |
| ExecutionEnvironment       | `apps/desktop/src/renderer/components/organisms/ExecutionEnvironment/`  |
| HTMLPreviewEnvironment     | `apps/desktop/src/renderer/components/organisms/HTMLPreviewEnvironment/`|
| MarkdownPreviewEnvironment | `apps/desktop/src/renderer/components/organisms/MarkdownPreviewEnvironment/` |
| sanitize.ts                | `apps/desktop/src/renderer/utils/sanitize.ts`                           |

### SplitLayout Props

| Prop            | 型                      | 必須 | デフォルト | 説明               |
| --------------- | ----------------------- | ---- | ---------- | ------------------ |
| leftPanel       | `React.ReactNode`       | ✓    | -          | 左パネルコンテンツ |
| rightPanel      | `React.ReactNode`       | ✓    | -          | 右パネルコンテンツ |
| initialRatio    | `number`                | -    | 50         | 初期分割比率 (%)   |
| minRatio        | `number`                | -    | 20         | 最小比率 (%)       |
| maxRatio        | `number`                | -    | 80         | 最大比率 (%)       |
| onRatioChange   | `(ratio: number) => void` | -  | -          | 比率変更コールバック |
| showRightPanel  | `boolean`               | -    | true       | 右パネル表示       |
| className       | `string`                | -    | -          | カスタムクラス     |

### SplitLayout キーボード操作

| キー       | 動作             |
| ---------- | ---------------- |
| ArrowLeft  | 左パネルを5%縮小 |
| ArrowRight | 左パネルを5%拡大 |
| Home       | 最小比率に設定   |
| End        | 最大比率に設定   |

### セキュリティ（3層防御）

| レイヤー | 実装                   | 防御対象                         |
| -------- | ---------------------- | -------------------------------- |
| Layer 1  | DOMPurify HTMLサニタイズ | scriptタグ、イベントハンドラ除去 |
| Layer 2  | CSP（script-src 'none'） | インラインスクリプト防止         |
| Layer 3  | iframe sandbox         | スクリプト実行、ポップアップ禁止 |

---

## workspace-chat-edit-ui コンポーネント（Issue #468）

AIアシスタントとのチャット中にファイル編集を依頼し、差分プレビュー・適用を行うためのUIコンポーネント群。

### コンポーネント階層

| コンポーネント | 種類 | 親 | 子要素 |
| -------------- | ---- | --- | ------ |
| ChatView | views | - | FileContextDropZone, FileContextBadge, EditCommandInput, DiffPreview |
| FileContextDropZone | organisms | ChatView | ChatContent |
| FileContextBadge | molecules | ChatView | なし（複数配置可） |
| EditCommandInput | molecules | ChatView | CommandTypeSelector, TextInput + SendButton |
| DiffPreview | organisms | ChatView（モーダル） | DiffEditor, ApplyControls |
| DiffEditor | - | DiffPreview | Monaco DiffEditor |

### コンポーネント仕様

#### FileContextBadge

| 項目 | 仕様 |
| ---- | ---- |
| ファイル | `apps/desktop/src/renderer/features/workspace-chat-edit/components/FileContextBadge.tsx` |
| 責務 | 添付ファイルの表示と削除 |
| Props | `file: FileContext`, `isSelected?: boolean`, `onRemove?: (id) => void`, `onClick?: (id) => void` |

#### ApplyControls

| 項目 | 仕様 |
| ---- | ---- |
| ファイル | `apps/desktop/src/renderer/features/workspace-chat-edit/components/ApplyControls.tsx` |
| 責務 | 差分の適用または却下 |
| Props | `resultId: string`, `onApplied?: () => void`, `onRejected?: () => void` |

#### FileContextDropZone

| 項目 | 仕様 |
| ---- | ---- |
| ファイル | `apps/desktop/src/renderer/features/workspace-chat-edit/components/FileContextDropZone.tsx` |
| 責務 | ドラッグ&ドロップでのファイル添付 |
| Props | `children: ReactNode`, `disabled?: boolean`, `onFilesDropped?: (files) => void` |

#### DiffPreview

| 項目 | 仕様 |
| ---- | ---- |
| ファイル | `apps/desktop/src/renderer/features/workspace-chat-edit/components/DiffPreview.tsx` |
| 責務 | 差分プレビューモーダルの表示 |
| Props | `original: string`, `modified: string`, `fileName: string`, `language?: string`, `resultId: string`, `onClose: () => void`, `onApplied?: () => void` |

#### DiffEditor

| 項目 | 仕様 |
| ---- | ---- |
| ファイル | `apps/desktop/src/renderer/features/workspace-chat-edit/components/DiffEditor.tsx` |
| 責務 | Monaco Editorによる差分表示 |
| Props | `original: string`, `modified: string`, `language?: string`, `height?: string | number` |

#### EditCommandInput

| 項目 | 仕様 |
| ---- | ---- |
| ファイル | `apps/desktop/src/renderer/features/workspace-chat-edit/components/EditCommandInput.tsx` |
| 責務 | 編集コマンドの入力と送信 |
| Props | `onSubmit: (command: EditCommand) => void`, `disabled?: boolean`, `placeholder?: string` |

### 状態管理

| Hook | 責務 |
| ---- | ---- |
| useFileContext | ファイルコンテキストの管理（添付/削除/クリア） |
| useDiffApply | 差分適用状態の管理（適用/却下/リセット） |

### バリデーション

| 項目 | 制限値 |
| ---- | ------ |
| 最大ファイル数 | 10ファイル |
| 最大ファイルサイズ | 10MB |

### キーボード操作

| キー | コンポーネント | 動作 |
| ---- | -------------- | ---- |
| Delete/Backspace | FileContextBadge | 選択中のバッジを削除 |
| Ctrl+Enter | EditCommandInput | コマンド送信 |
| Escape | DiffPreview | プレビューを閉じる |
| Tab | DiffPreview | フォーカストラップ内を循環 |

---

## SkillStreamDisplay コンポーネント（TASK-3-2）

スキル実行結果をリアルタイムでストリーミング表示するUIコンポーネント。

### コンポーネント階層

| コンポーネント | 種類 | 親 | 子要素 |
| -------------- | ---- | --- | ------ |
| SkillStreamDisplay | organisms | - | StreamHeader, StreamContent |
| StreamHeader | - | SkillStreamDisplay | StatusBadge, AbortButton（running時）, ResetButton（completed/error/aborted時） |
| StreamContent | - | SkillStreamDisplay | MessageItem（複数、React.memo適用） |

StreamContentにはrole="log"およびaria-live="polite"を設定する。

### コンポーネント仕様

#### SkillStreamDisplay

| 項目 | 仕様 |
| ---- | ---- |
| ファイル | `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx` |
| 責務 | スキル実行ストリームの表示、実行制御 |
| 依存Hook | `useSkillExecution` |

**Props**

| Prop | 型 | 必須 | デフォルト | 説明 |
| ---- | --- | ---- | ---------- | ---- |
| skillId | `string` | Yes | - | 実行対象のスキルID |
| initialPrompt | `string` | No | - | 初期プロンプト |
| autoExecute | `boolean` | No | false | 自動実行フラグ |
| onComplete | `() => void` | No | - | 完了時コールバック |
| onError | `(error: SkillExecutionError) => void` | No | - | エラー時コールバック |
| onStatusChange | `(status: string) => void` | No | - | ステータス変更コールバック |
| height | `string \| number` | No | "auto" | コンポーネント高さ |
| className | `string` | No | - | カスタムクラス名 |

**ステータス表示**

| ステータス | 日本語表示 | 色 |
| ---------- | ---------- | --- |
| idle | 待機中 | gray |
| running | 実行中 | blue |
| completed | 完了 | green |
| error | エラー | red |
| aborted | 中断 | red |

#### useSkillExecution Hook

| 項目 | 仕様 |
| ---- | ---- |
| ファイル | `apps/desktop/src/renderer/hooks/useSkillExecution.ts` |
| 責務 | スキル実行状態管理、IPC通信 |

**戻り値**

| プロパティ | 型 | 説明 |
| ---------- | --- | ---- |
| messages | `SkillStreamMessage[]` | ストリームメッセージ一覧 |
| status | `ExecutionStatus` | 現在のステータス |
| executionId | `string \| null` | 現在の実行ID |
| error | `SkillExecutionError \| null` | エラー情報 |
| isAborting | `boolean` | 中断処理中フラグ |
| execute | `(prompt: string) => Promise<Response>` | 実行開始関数 |
| abort | `() => Promise<void>` | 中断関数 |
| reset | `() => void` | リセット関数 |

### IPC API（Preload）

SkillAPIは以下のメソッドを提供する。

| メソッド | 引数 | 戻り値 | 説明 |
| -------- | ---- | ------ | ---- |
| execute | request: SkillExecutionRequest | `Promise<SkillExecutionResponse>` | スキル実行開始 |
| onStream | callback: (message: SkillStreamMessage) => void | `() => void`（クリーンアップ関数） | ストリームメッセージ購読 |
| abort | executionId: string | `Promise<boolean>` | 実行中断 |
| getExecutionStatus | executionId: string | `Promise<ExecutionInfo \| null>` | ステータス照会 |

**IPCチャンネル**

| チャンネル | 方向 | 用途 |
| ---------- | ---- | ---- |
| skill:execute | Renderer → Main | 実行開始 |
| skill:stream | Main → Renderer | メッセージストリーム |
| skill:abort | Renderer → Main | 実行中断 |
| skill:get-status | Renderer → Main | ステータス照会 |

---

## アクセシビリティ（全コンポーネント共通 WCAG 2.1 AA）

| 要件 | 実装方法 |
| ---- | -------- |
| キーボードナビゲーション | Tab順序、Enter/Escapeでの操作、全要素にtabIndex設定 |
| スクリーンリーダー | aria-label、role属性の適切な設定、`aria-live` |
| フォーカス管理 | パネル/モーダル開閉時のフォーカス移動 |
| 色コントラスト | 4.5:1以上のコントラスト比確保（Tailwind CSS標準色） |

---

## 完了タスク

| Issue # | 機能名 | 完了日 | 関連ドキュメント |
| ------- | ------ | ------ | ---------------- |
| TASK-3-2 | skillexecutor-ipc-integration | 2026-01-25 | `docs/30-workflows/TASK-3-2-skillexecutor-ipc-integration/` |
| #468 | workspace-chat-edit-ui | 2026-01-25 | `docs/30-workflows/workspace-chat-edit-ui/` |

---

## 関連ドキュメント

- [UI/UXコンポーネント概要](./ui-ux-components.md)
- [デザイン原則](./ui-ux-design-principles.md)
- [Agent Execution UI](./ui-ux-agent-execution.md)

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
| ---- | ---------- | -------- |
| 2026-01-26 | - | 仕様ガイドライン準拠: コード例を表形式・文章に変換 |

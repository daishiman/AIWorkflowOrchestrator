# TASK-UI-04A-WORKSPACE-LAYOUT: 作業スペース

> 実装 workflow 正本: [task-058b-ui-04a-workspace-layout-filebrowser](../../../completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser/index.md)

## 1. メタ情報

| 項目             | 値                                                                                                                                                                     |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID         | TASK-UI-04A-WORKSPACE-LAYOUT                                                                                                                                           |
| 元タスクID       | TASK-UI-04-WORKSPACE-VIEW（分割元）                                                                                                                                    |
| ステータス       | completed（実装 workflow は completed-tasks 正本へ移管済み）                                                                                                           |
| 優先度           | high                                                                                                                                                                   |
| 複雑度           | large                                                                                                                                                                  |
| 推定ファイル数   | ~14                                                                                                                                                                    |
| 依存タスク       | TASK-UI-00（デザイン基盤）, TASK-UI-01（アーキテクチャ）, TASK-UI-02（ナビコア）                                                                                       |
| ブロック対象     | TASK-UI-04B（チャットパネル）, TASK-UI-04C（プレビュー・クイック検索）                                                                                                 |
| 対象ビュー       | WorkspaceView（新規作成、ViewType=`workspace`）                                                                                                                        |
| 関連スライス     | `workspaceSlice`（既存拡張）, `fileSelectionSlice`（既存利用）                                                                                                         |
| 関連 IPC         | `workspace:*`, `file:*`                                                                                                                                                |
| 関連ドキュメント | [04B-workspace-chat-panel.md](./task-059a-ui-04b-workspace-chat-panel.md), [04C-workspace-preview-quicksearch.md](./task-059b-ui-04c-workspace-preview-quicksearch.md) |

## 2. 目的と背景

### 目的

**チャットを主役とした1ペイン**から始まり、ユーザーが必要に応じてファイルパネルやプレビューをサイドバーとして明示的に開く作業スペースを新規作成する。「タップ＆ディスカバー」の設計哲学に基づき、初期表示をチャット入力欄とサジェスチョンだけに絞り込み、操作に応じて段階的に機能を開示する。

本ドキュメント（04A）では、チャット中心レイアウトの基盤構造、サイドバートグル、ファイルパネル、リサイズ機構、WorkspaceStatusBar、ファイル変更監視を定義する。チャットパネル本体は [04B](./task-059a-ui-04b-workspace-chat-panel.md)、プレビューとクイック検索は [04C](./task-059b-ui-04c-workspace-preview-quicksearch.md) を参照。

### 背景

現状のアプリケーションでは、ファイル内容を確認する（EditorView）→ AIに質問する（ChatView）→ 結果をプレビューする（EditorView に戻る）というワークフローで**3回のビュー切替**が必要になる。作業スペースはこの一連のフローを1画面で完結させることで、背景情報（コンテキスト）の切替コストを排除する。

### 設計哲学: 「タップ＆ディスカバー」

| 原則                          | 適用                                                                      |
| ----------------------------- | ------------------------------------------------------------------------- |
| Level 1 = 4個以下の大きな要素 | 初期表示: チャット入力欄 + サジェスチョンバブル3つ + アイコントグル2つ    |
| Level 2 = タップで詳細        | アイコンタップでサイドバーがスライドイン                                  |
| 全操作にフィードバック        | トグル: 背景色変化 + scale(0.97)、サイドバー: スライドイン 200ms ease-out |

### Before → After

| 観点             | Before（従来設計） | After（チャット中心設計）                           |
| ---------------- | ------------------ | --------------------------------------------------- |
| 初期表示         | 3ペイン同時表示    | **チャットパネルのみ**（SuggestionBubble + 入力欄） |
| サイドパネル     | 常時表示           | **明示的にアイコンタップで開く**                    |
| 3ペイン同時      | 1024px 以上        | **1440px 以上のデスクトップ広幅時のみ**             |
| デフォルトモード | なし               | `chat-only`（チャット中心モード）                   |
| ゼロステート     | フォルダ選択のみ   | 「作業スペースへようこそ」+ SuggestionBubble 3つ    |
| UX言語           | ワークスペース     | **作業スペース**                                    |
| UX言語           | コンテキスト       | **背景情報**                                        |

### 既存画面との棲み分け

| 観点             | 作業スペース（新規）                             | EditorView（既存・変更なし）   | ChatView（既存・変更なし） |
| ---------------- | ------------------------------------------------ | ------------------------------ | -------------------------- |
| **主目的**       | AI協働ワークフロー                               | 精密なコード編集               | 自由なチャット会話         |
| **パネル構成**   | チャット中心 + サイドバー（ファイル/プレビュー） | Sidebar + Editor + SearchPanel | ChatMessages + Input       |
| **AI連携**       | ファイルの背景情報を自動付与                     | なし（コード補完のみ）         | フリーチャット             |
| **ファイル操作** | 閲覧 + AIへの質問                                | 直接編集 + 保存                | なし                       |
| **ユースケース** | 「このコードを説明して」「バグを探して」         | コーディング                   | 一般的なAI対話             |
| **遷移関係**     | ファイルダブルクリック → EditorView へ遷移       | -                              | -                          |

### Why（なぜ必要か）

1. **背景情報の切替コスト削減**: ファイル確認 → AIに質問 → 結果プレビューのループで画面遷移が不要になる
2. **チャット中心の体験**: 初回はチャット入力欄とサジェスチョンのみ表示し、ユーザーが必要に応じてファイルやプレビューを開く「段階的開示」パターン
3. **既存画面との棲み分け**: EditorView = 精密なコード編集、ChatView = 自由なチャット、作業スペース = AI協働ワークフロー

## 3. レイアウト設計

### 3.1 レイアウトモード定義

作業スペースには4つのレイアウトモードがあり、ユーザーのトグル操作とウィンドウ幅に応じて自動遷移する:

| モード                    | 説明                           | パネル構成                               | 遷移条件                               |
| ------------------------- | ------------------------------ | ---------------------------------------- | -------------------------------------- |
| `chat-only`（デフォルト） | チャットが主役。サイドバーなし | チャットパネルのみ（全幅）               | 初期表示 / 両トグルOFF                 |
| `chat+files`              | チャット + 左サイドバー        | ファイルパネル(260px) + チャット(flex-1) | ファイルトグルON                       |
| `chat+preview`            | チャット + 右サイドバー        | チャット(flex-1) + プレビュー(360px)     | プレビュートグルON                     |
| `3-pane`                  | 3ペイン同時表示                | ファイル + チャット + プレビュー         | 両トグルON かつ ウィンドウ幅 >= 1440px |

モード切替は `workspaceSlice.layoutMode` で管理し、`localStorage` に永続化する。

### 3.2 チャット中心レイアウト（chat-only モード）

#### 初期表示: チャットパネルのみ

```
+-------------------------------------------------------------+
| WorkspaceView                                                |
| +---[ 上部トグルバー ]-----------------------------------+ |
| | [folder] ファイル    [eye] プレビュー                    | |
| +---------------------------------------------------------+ |
| |                                                         | |
| |                   ChatPanel（全幅）                     | |
| |                                                         | |
| |            「作業スペースへようこそ」                    | |
| |                                                         | |
| |     [ファイルを開いてみよう]                            | |
| |     [AIに質問してみよう]                                | |
| |     [コードを見てみよう]                                | |
| |                                                         | |
| |  +---------------------------------------------------+ | |
| |  | メッセージを入力...                                 | | |
| |  +---------------------------------------------------+ | |
| +---------------------------------------------------------+ |
| | StatusBar: ファイル未選択                                | |
| +---------------------------------------------------------+ |
+-------------------------------------------------------------+
```

#### ファイルサイドバーON時: chat+files

```
+-------------------------------------------------------------+
| WorkspaceView                                                |
| +---[ 上部トグルバー ]-----------------------------------+ |
| | [folder*] ファイル    [eye] プレビュー                   | |
| +--------------+-:+--------------------------------------+ |
| | ファイル     | : | ChatPanel（flex-1）                   | |
| | サイドバー   | : |                                       | |
| | (260px)      | : | +-----------------------------------+ | |
| |              | : | | メッセージ履歴                     | | |
| | [folder] src/| : | |                                    | | |
| | +-- app/     | : | +-----------------------------------+ | |
| | +-- lib/     | : | | 入力エリア                         | | |
| | +-- utils/   | : | +-----------------------------------+ | |
| +--------------+-:+--------------------------------------+ |
| | StatusBar: src/App.tsx | 42行 | UTF-8 | TS               | |
| +---------------------------------------------------------+ |
+-------------------------------------------------------------+

[folder*] = active状態（背景色変化 + scale(0.97)）
: = ドラッグリサイズハンドル（4px幅）
```

#### 3ペイン同時（デスクトップ広幅 >= 1440px、両トグルON）

```
+-------------------------------------------------------------+
| WorkspaceView                                                |
| +---[ 上部トグルバー ]-----------------------------------+ |
| | [folder*] ファイル    [eye*] プレビュー                  | |
| +-----------+-:+-------------------+-:+------------------+ |
| | ファイル  | : | ChatPanel         | : | プレビュー       | |
| | サイドバー| : |                   | : |                  | |
| | (260px)   | : | (flex-1,min 360px)| : | (360px)          | |
| |           | : |                   | : | +-------------+  | |
| | [f] src/  | : | +--------------+  | : | | [ソース][表示]| | |
| | +-- app/  | : | | メッセージ   |  | : | +--------------+ | |
| | +-- lib/  | : | | 履歴         |  | : | |              | | |
| | +-- utils/| : | +--------------+  | : | | CodeViewer   | | |
| |           | : | | 入力エリア   |  | : | |              | | |
| | [長押し   | : | +--------------+  | : | +--------------+ | |
| |  メニュー]| : |                   | : |                  | |
| +-----------+-:+-------------------+-:+------------------+ |
| | StatusBar: src/App.tsx | 42行 | UTF-8 | TS               | |
| +---------------------------------------------------------+ |
+-------------------------------------------------------------+
```

### 3.3 レスポンシブブレークポイント仕様

| ブレークポイント | レイアウト                     | パネル挙動                                                                     |
| ---------------- | ------------------------------ | ------------------------------------------------------------------------------ |
| >= 1440px        | チャット + 最大2サイドバー同時 | ファイル(260px) + チャット(flex-1) + プレビュー(360px)                         |
| 1024px - 1439px  | チャット + 1サイドバー         | チャット(flex-1) + 選択パネル(260-360px)。両トグルON時は後からONにした方を表示 |
| < 1024px         | チャットのみ                   | サイドバーはオーバーレイ表示（背面に半透明オーバーレイ `rgba(0,0,0,0.3)`）     |

### 3.4 上部アイコントグルバー

上部に配置する2つのアイコントグルで、サイドバーの表示/非表示を制御する。

```typescript
interface PanelToggleBarProps {
  /** ファイルサイドバーの表示状態 */
  isFilePanelOpen: boolean;
  /** プレビューサイドバーの表示状態 */
  isPreviewOpen: boolean;
  /** ファイルサイドバートグル */
  onToggleFilePanel: () => void;
  /** プレビューサイドバートグル */
  onTogglePreview: () => void;
}
```

#### トグルボタン仕様

| 状態       | スタイル                                                   |
| ---------- | ---------------------------------------------------------- |
| OFF        | `text-[var(--text-secondary)]` + `bg-transparent`          |
| ON         | `text-[var(--status-primary)]` + `bg-[var(--bg-tertiary)]` |
| ホバー     | `bg-[var(--bg-tertiary)]` + `scale(var(--scale-hover))`    |
| アクティブ | `scale(0.97)` 50ms + 背景色変化                            |

- タップターゲット: 44 x 44px（5C.2準拠）
- アイコン: `FolderTree`（ファイル）、`Eye`（プレビュー）、各20px
- ラベル: アイコン右に `--text-sm` で「ファイル」「プレビュー」
- トランジション: `--duration-fast` `--ease-out`
- ARIA: `role="switch"`, `aria-checked={isOpen}`, `aria-label="ファイルサイドバーの表示切替"`

#### マイクロインタラクション: アイコントグル

```css
/* トグルボタン: active時の背景色変化 + scale */
.toggle-button {
  transition:
    background-color 200ms var(--ease-out),
    transform 50ms var(--ease-out);
}

.toggle-button:active {
  transform: scale(0.97);
}

.toggle-button[aria-checked="true"] {
  background-color: var(--bg-tertiary);
  color: var(--status-primary);
}
```

### 3.5 サイドバー スライドインアニメーション

サイドバーは `SlideInPanel`（00で定義済み）の挙動に準拠し、以下のアニメーションで表示する:

```css
/* ファイルサイドバー: 左からスライドイン 200ms */
.sidebar-file-enter {
  transform: translateX(-100%);
  opacity: 0;
}
.sidebar-file-enter-active {
  transform: translateX(0);
  opacity: 1;
  transition:
    transform 200ms var(--ease-out),
    opacity 200ms var(--ease-out);
}

/* プレビューサイドバー: 右からスライドイン 200ms */
.sidebar-preview-enter {
  transform: translateX(100%);
  opacity: 0;
}
.sidebar-preview-enter-active {
  transform: translateX(0);
  opacity: 1;
  transition:
    transform 200ms var(--ease-out),
    opacity 200ms var(--ease-out);
}
```

### 3.6 リサイズ制約

リサイズハンドルは**3ペインモード（`3-pane`）時のみ有効**。`chat+files` / `chat+preview` 時はサイドバー幅固定。

| パネル             | 最小幅 | 最大幅 | デフォルト | 折りたたみ       |
| ------------------ | ------ | ------ | ---------- | ---------------- |
| ファイルサイドバー | 180px  | 400px  | 260px      | トグルで開閉     |
| ChatPanel          | 360px  | -      | flex-1     | 不可（常に表示） |
| プレビュー         | 280px  | 500px  | 360px      | トグルで開閉     |

- リサイズハンドル: 4px幅、ホバーで `var(--status-primary)` の縦線表示
- リサイズ中: `cursor: col-resize`、半透明オーバーレイで現在幅を表示
- リサイズ完了: `localStorage` にサイズを保存（キー: `workspace-panel-sizes`）
- リサイズハンドルダブルクリック: デフォルト幅にリセット

## 4. ゼロステート

### 4.1 初回表示（フォルダ未選択・メッセージなし）

`EmptyState` mood="welcoming" + `SuggestionBubble` 3つで構成する:

```
+---------------------------------------------+
|                                             |
|              [message-circle]               |
|                                             |
|        作業スペースへようこそ                |
|                                             |
|    AIと一緒にコードを探索しましょう。        |
|    ファイルを開いて質問したり、              |
|    直接チャットで相談できます。              |
|                                             |
|  [ファイルを開いてみよう]                   |
|  [AIに質問してみよう]                       |
|  [コードを見てみよう]                       |
|                                             |
|  +---------------------------------------+ |
|  | メッセージを入力...                     | |
|  +---------------------------------------+ |
|                                             |
+---------------------------------------------+
```

**コンポーネント構成**:

```typescript
<EmptyState
  icon="MessageCircle"
  heading="作業スペースへようこそ"
  description="AIと一緒にコードを探索しましょう。ファイルを開いて質問したり、直接チャットで相談できます。"
  mood="welcoming"
  suggestions={[
    { label: "ファイルを開いてみよう", icon: "FolderOpen", onClick: handleOpenFilePanel },
    { label: "AIに質問してみよう", icon: "MessageCircle", onClick: handleFocusInput },
    { label: "コードを見てみよう", icon: "Code", onClick: handleSuggestCode },
  ]}
/>
```

- **トリガー**: チャット履歴が空 AND ファイル未選択時
- **SuggestionBubble クリック**:
  - 「ファイルを開いてみよう」 → ファイルサイドバーをトグルONにする
  - 「AIに質問してみよう」 → チャット入力欄にフォーカスを移動する
  - 「コードを見てみよう」 → 「コードを見せて」テキストをチャット入力に挿入し、入力欄にフォーカス
- **ファイルサイドバーへの導線**: サジェスチョンバブルの下に `text-[var(--text-secondary)]` で「ファイルパネルを開いてコードを選ぼう」テキストリンク

### 4.2 フォルダ未選択（ファイルサイドバーON時）

ファイルサイドバー内に `EmptyState` mood="encouraging" を表示:

```
+----------------------+
|                      |
|       [folder]       |
|                      |
|  フォルダを選んで     |
|  はじめよう           |
|                      |
|  [フォルダを選択]     |
|                      |
|  ヒント: ファイルを    |
|  ドラッグ&ドロップ    |
|  もできます           |
|                      |
+----------------------+
```

- **トリガー**: `workspace.folders.length === 0` AND ファイルサイドバーが表示中
- **アクション**: `addFolder()` → `window.electronAPI.workspace.addFolder()`

### 4.3 ファイル未選択（フォルダは存在）

- ファイルサイドバー: ツリー表示（通常動作）
- ChatPanel: 通常動作（ファイルの背景情報なしでチャット可能）
- プレビュー: ゼロステート表示（[04C セクション 6.7](./task-059b-ui-04c-workspace-preview-quicksearch.md) 参照）

## 5. ファイルパネル設計

### 5.1 概要

既存 `WorkspaceSlice.folderFileTrees`（`Map<FolderId, FileNode[]>`）を活用して、作業スペースに追加されたフォルダのファイルツリーを再帰的に表示する。

### 5.2 ツリービュー仕様

| 機能              | 実装方針                                                                                                        |
| ----------------- | --------------------------------------------------------------------------------------------------------------- |
| ツリー表示        | 既存 `WorkspaceSidebar` のツリーロジックを流用。`FileTreeNode` で再帰描画                                       |
| ファイル選択      | シングルタップで選択 → チャットの背景情報に自動追加。ダブルクリックで EditorView へ遷移                         |
| 長押しメニュー    | 右クリック/長押しで表示: パスをコピー / 名前を変更 / 削除 / チャットに送る / 新しいファイル / EditorView で開く |
| ドラッグ&ドロップ | ファイルをチャット入力エリアへドロップ → 背景情報として添付                                                     |
| 展開状態の永続化  | 既存 `workspaceSlice.toggleFolderExpansion` を使用                                                              |

#### ファイル選択時のフィードバック

ファイルをタップすると、選択状態を示す左ボーダーがスライドインする:

```css
/* ファイルノード: ホバー時の背景色変化 */
.file-node:hover {
  background-color: var(--bg-tertiary);
  transition: background-color 200ms var(--ease-out);
}

/* ファイルノード: 選択時の左ボーダースライドイン */
.file-node-selected {
  border-left: 3px solid var(--accent);
  animation: border-slide-in 200ms var(--ease-out);
}

@keyframes border-slide-in {
  from {
    border-left-width: 0px;
    border-left-color: transparent;
  }
  to {
    border-left-width: 3px;
    border-left-color: var(--accent);
  }
}
```

#### ファイル選択 → 背景情報自動追加フロー

```
ファイルタップ
  → selectedFilePath を更新
  → file:read IPC でファイル内容を取得
  → チャットの背景情報としてファイルパス + 内容を自動追加
  → StatusBar にファイル情報を表示
  → 左ボーダーがスライドインして選択を視覚フィードバック
```

### 5.3 ファイルアイコンマッピング

拡張子ごとに lucide-react アイコンを割り当てる。

```typescript
// utils/fileIconMap.ts
import {
  FileCode,
  FileText,
  FileImage,
  FileJson,
  File,
  Folder,
  FolderOpen,
} from "lucide-react";

const FILE_ICON_MAP: Record<string, React.ComponentType> = {
  // TypeScript / JavaScript
  ts: FileCode,
  tsx: FileCode,
  js: FileCode,
  jsx: FileCode,
  // Markup / Style
  html: FileCode,
  css: FileCode,
  scss: FileCode,
  // Data
  json: FileJson,
  yaml: FileText,
  yml: FileText,
  // Documentation
  md: FileText,
  mdx: FileText,
  txt: FileText,
  // Images
  png: FileImage,
  jpg: FileImage,
  jpeg: FileImage,
  svg: FileImage,
  gif: FileImage,
  webp: FileImage,
  // Config
  toml: FileJson,
  env: File,
};

export function getFileIcon(filename: string): React.ComponentType {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return FILE_ICON_MAP[ext] ?? File;
}

export function getFolderIcon(isExpanded: boolean): React.ComponentType {
  return isExpanded ? FolderOpen : Folder;
}
```

### 5.4 長押しメニュー仕様

| メニュー項目      | アクション                                                                  | ショートカット |
| ----------------- | --------------------------------------------------------------------------- | -------------- |
| パスをコピー      | `navigator.clipboard.writeText(absolutePath)`                               | Cmd+Shift+C    |
| 相対パスをコピー  | `navigator.clipboard.writeText(relativePath)`                               | -              |
| 名前を変更        | インラインテキスト入力に切替 → `file:rename` IPC                            | Enter          |
| 削除              | 確認ダイアログ表示（ConfirmDialog、00参照） → `file:delete` IPC（将来拡張） | Delete         |
| チャットに送る    | ファイル内容を ChatPanel の入力に背景情報として添付                         | -              |
| 新しいファイル    | 選択フォルダ内に新規ファイル作成（将来拡張）                                | Cmd+N          |
| EditorView で開く | `setCurrentView("editor")` + ファイルパスを渡す                             | Cmd+O          |

長押しメニューの表示位置: クリック座標に追従。画面端に接する場合は反転表示（上方向 or 左方向）。

**マイクロインタラクション**: メニュー出現時は `opacity: 0 → 1` + `translateY(8px → 0)` 200ms `var(--ease-out)`（5C.3準拠）

### 5.5 ドラッグ&ドロップ仕様

- ドラッグソース: `FileTreeNode`（ファイルノードのみ、フォルダは不可）
- ドロップターゲット: `WorkspaceChatInput`（チャット入力エリア）
- ドラッグ中の表示: ファイル名のゴーストを表示（opacity: 0.7）
- ドロップ効果: ファイルパスとファイル内容を背景情報としてチャットパネルに添付
- HTML5 Drag and Drop API を使用（外部ライブラリ不要）

### 5.6 キーボードナビゲーション

| キー        | 動作                                            |
| ----------- | ----------------------------------------------- |
| Arrow Up    | 前のノードにフォーカス移動                      |
| Arrow Down  | 次のノードにフォーカス移動                      |
| Arrow Right | フォルダを展開 / 既展開なら最初の子にフォーカス |
| Arrow Left  | フォルダを折りたたみ / 親にフォーカス           |
| Enter       | ファイル選択（背景情報に追加）                  |
| Space       | ファイル選択（背景情報に追加）                  |
| Cmd+P       | クイック検索モーダルを開く（04C 参照）          |

### 5.7 アクセシビリティ（WCAG 2.1 AA）

```html
<ul role="tree" aria-label="ファイル">
  <li role="treeitem" aria-expanded="true" aria-level="1">
    <!-- フォルダ -->
    <ul role="group">
      <li role="treeitem" aria-level="2" aria-selected="true">
        <!-- ファイル -->
      </li>
    </ul>
  </li>
</ul>
```

- `role="tree"` をルートリストに付与
- `role="treeitem"` を各ノードに付与
- `aria-expanded` をフォルダノードに付与
- `aria-selected` を選択中ファイルに付与
- `aria-level` でネストレベルを明示
- フォーカスリング: `outline: 2px solid var(--status-primary)`, `outline-offset: 2px`

## 6. WorkspaceStatusBar 設計

```
+----------------------------------------------------------+
| [file-icon] src/components/Button.tsx  |  42行  |  UTF-8  |  TS   |
+----------------------------------------------------------+
```

| セクション       | 内容                         | 条件             |
| ---------------- | ---------------------------- | ---------------- |
| ファイルアイコン | 選択ファイルの拡張子アイコン | ファイル選択時   |
| ファイルパス     | 相対パス表示                 | ファイル選択時   |
| 行数             | `{lineCount} 行`             | ファイル選択時   |
| エンコーディング | `UTF-8`（固定）              | ファイル選択時   |
| 言語             | 拡張子に基づく言語名         | ファイル選択時   |
| 未選択時         | 「ファイル未選択」のみ表示   | ファイル未選択時 |

- 高さ: 28px固定
- 背景: `var(--bg-secondary)`
- テキスト: `var(--text-secondary)`, `font-size: 12px`
- ボーダー上: `1px solid var(--border-default)`

## 7. マイクロインタラクション一覧

本タスクで実装する全マイクロインタラクションの定義:

| 対象                     | トリガー     | アニメーション                                  | 時間  | イージング        |
| ------------------------ | ------------ | ----------------------------------------------- | ----- | ----------------- |
| サイドバー開閉           | トグルタップ | `translateX` スライドイン/アウト + `opacity`    | 200ms | `var(--ease-out)` |
| アイコントグル（active） | タップ       | 背景色変化 + `scale(0.97)`                      | 50ms  | `var(--ease-out)` |
| ファイルツリー項目       | ホバー       | `background-color` 変化                         | 200ms | `var(--ease-out)` |
| ファイル選択             | タップ       | 左ボーダーが `var(--accent)` にスライドイン     | 200ms | `var(--ease-out)` |
| 長押しメニュー出現       | 右クリック   | `opacity: 0→1` + `translateY(8px→0)`            | 200ms | `var(--ease-out)` |
| SuggestionBubble         | ホバー       | `scale(var(--scale-hover))` + `box-shadow` 変化 | 200ms | `var(--ease-out)` |
| リサイズハンドル         | ホバー       | `var(--status-primary)` 縦線表示                | 150ms | `var(--ease-out)` |

## 8. コンポーネント階層

### 8.1 ファイルツリー（04A 責務範囲）

```
WorkspaceView/ (organisms) -- ViewType="workspace" 用
+-- index.tsx                             # メインレイアウト + サイドバートグルロジック
+-- components/
|   +-- PanelToggleBar/
|   |   +-- PanelToggleBar.tsx           # 上部アイコントグルバー [folder] [eye]（molecules）
|   +-- FileBrowserPanel/
|   |   +-- FileBrowserPanel.tsx          # ツリー表示 + 長押しメニュー（organisms）
|   |   +-- FileTreeNode.tsx             # 再帰ツリーノード（molecules）
|   |   |   +-- FileIcon.tsx             # 拡張子別アイコン（atoms）
|   |   |   +-- FileName.tsx             # ファイル/フォルダ名表示（atoms）
|   |   +-- FileContextMenu.tsx          # 長押しメニュー（molecules）
|   |   +-- FolderSelector.tsx           # プロジェクトフォルダ選択ボタン（atoms）
|   +-- PanelResizeHandle.tsx            # ドラッグリサイズハンドル（atoms）
|   +-- WorkspaceStatusBar.tsx           # 下部ステータスバー（molecules）
+-- hooks/
    +-- useWorkspaceLayout.ts            # パネルサイズ・レスポンシブ・トグル管理
    +-- useFileWatcher.ts                # ファイル変更監視（P5対策）
    +-- useFileContextMenu.ts            # 長押しメニューロジック
    +-- usePanelResize.ts                # パネルリサイズロジック
```

> **注**: WorkspaceChatPanel は [04B](./task-059a-ui-04b-workspace-chat-panel.md)、プレビュー・クイック検索は [04C](./task-059b-ui-04c-workspace-preview-quicksearch.md) を参照。

### 8.2 Atomic Design 分類（04A 範囲）

| レベル    | コンポーネント                                                    |
| --------- | ----------------------------------------------------------------- |
| atoms     | FileIcon, FileName, FolderSelector, PanelResizeHandle             |
| molecules | PanelToggleBar, FileTreeNode, FileContextMenu, WorkspaceStatusBar |
| organisms | FileBrowserPanel, WorkspaceView（レイアウトコンテナ）             |

## 9. 状態管理

### 9.1 既存スライスの利用

| スライス             | 利用する状態/アクション                                                                                                                                                                                                      |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `workspaceSlice`     | `workspace`, `folderFileTrees`, `workspaceIsLoading`, `workspaceError`, `loadWorkspace()`, `addFolder()`, `removeFolder()`, `toggleFolderExpansion()`, `toggleSubfolder()`, `setWorkspaceSelectedFile()`, `loadFolderTree()` |
| `fileSelectionSlice` | `selectedFiles`, `addFiles()`, `removeFile()`                                                                                                                                                                                |
| `navigationSlice`    | `setCurrentView("workspace")`, `setCurrentView("editor")`                                                                                                                                                                    |
| `uiSlice`            | `responsiveMode`, `windowSize`                                                                                                                                                                                               |

### 9.2 画面固有の状態（コンポーネントローカル useState）

WorkspaceView は**新規スライスを作成しない**。画面固有の状態は `useState` / `useReducer` でコンポーネントローカルに管理する。

```typescript
// WorkspaceView ローカル状態
interface WorkspaceViewLocalState {
  // レイアウトモード（トグル状態 + ウィンドウ幅から自動算出）
  layoutMode: "chat-only" | "chat+files" | "chat+preview" | "3-pane";

  // パネルトグル状態
  isFilePanelOpen: boolean; // デフォルト: false
  isPreviewOpen: boolean; // デフォルト: false

  // パネルサイズ（3-pane時のみリサイズ可能）
  fileBrowserWidth: number; // デフォルト: 260, 最小: 180, 最大: 400
  previewWidth: number; // デフォルト: 360, 最小: 280, 最大: 500

  // アクティブサイドバー（1024-1439px で両トグルON時に使用）
  activeSidePanel: "fileBrowser" | "preview";

  // プレビューモード
  previewMode: "source" | "preview";

  // 選択中ファイル（背景情報の対象）
  selectedFilePath: string | null;
  selectedFileContent: string | null;
  selectedFileLanguage: string | null;

  // 長押しメニュー
  contextMenu: {
    isOpen: boolean;
    position: { x: number; y: number };
    targetPath: string | null;
    targetType: "file" | "folder";
  };

  // クイック検索
  isQuickSearchOpen: boolean;

  // ワードラップ
  isWordWrapEnabled: boolean;
}
```

### 9.3 個別セレクタ利用（P31対策）

WorkspaceSlice の既存セレクタを使用する（合成 Hook は使用しない）。

```typescript
// 既存の workspaceSlice 個別セレクタ
const workspace = useStore((s) => s.workspace);
const folderFileTrees = useStore((s) => s.folderFileTrees);
const workspaceIsLoading = useStore((s) => s.workspaceIsLoading);
const loadWorkspace = useStore((s) => s.loadWorkspace);
const addFolder = useStore((s) => s.addFolder);
const toggleFolderExpansion = useStore((s) => s.toggleFolderExpansion);
```

### 9.4 レイアウトモード永続化

```typescript
// localStorage キー
const PANEL_SIZES_KEY = "workspace-panel-sizes";
const PANEL_TOGGLE_KEY = "workspace-panel-toggles";

// 初期化時に復元
const savedToggles = JSON.parse(
  localStorage.getItem(PANEL_TOGGLE_KEY) ?? '{"file":false,"preview":false}',
);

// layoutMode は isFilePanelOpen, isPreviewOpen, windowWidth から算出
function computeLayoutMode(
  isFilePanelOpen: boolean,
  isPreviewOpen: boolean,
  windowWidth: number,
): "chat-only" | "chat+files" | "chat+preview" | "3-pane" {
  if (!isFilePanelOpen && !isPreviewOpen) return "chat-only";
  if (isFilePanelOpen && isPreviewOpen && windowWidth >= 1440) return "3-pane";
  if (isFilePanelOpen) return "chat+files";
  return "chat+preview";
}
```

## 10. IPC 連携

### 10.1 既存 IPC チャネルの活用（workspace:_ / file:_）

| チャネル名                 | 方向   | 用途                   | ハンドラ位置           |
| -------------------------- | ------ | ---------------------- | ---------------------- |
| `workspace:load`           | invoke | 作業スペース読み込み   | `workspaceHandlers.ts` |
| `workspace:save`           | invoke | 作業スペース保存       | `workspaceHandlers.ts` |
| `workspace:add-folder`     | invoke | フォルダ追加ダイアログ | `workspaceHandlers.ts` |
| `workspace:validate-paths` | invoke | パスの有効性検証       | `workspaceHandlers.ts` |
| `workspace:folder-changed` | on     | フォルダ変更通知       | `workspaceHandlers.ts` |
| `file:get-tree`            | invoke | ファイルツリー取得     | `fileHandlers.ts`      |
| `file:read`                | invoke | ファイル内容読み込み   | `fileHandlers.ts`      |
| `file:rename`              | invoke | ファイル名変更         | `fileHandlers.ts`      |
| `file:watch-start`         | invoke | ファイル変更監視開始   | `fileHandlers.ts`      |
| `file:watch-stop`          | invoke | ファイル変更監視停止   | `fileHandlers.ts`      |
| `file:changed`             | on     | ファイル変更通知       | `fileHandlers.ts`      |

> **注**: `llm:*`, `conversation:*` チャネルは [04B](./task-059a-ui-04b-workspace-chat-panel.md) を参照。`search:*` チャネルは [04C](./task-059b-ui-04c-workspace-preview-quicksearch.md) を参照。

### 10.2 新規 IPC チャネル（必要に応じて追加）

本タスクでは新規 IPC チャネルの追加は不要。既存チャネルの組み合わせで全機能を実現する。将来的に以下が必要になる可能性がある:

| チャネル名（候補）         | 用途                                 | 追加タイミング       |
| -------------------------- | ------------------------------------ | -------------------- |
| `file:delete`              | ファイル削除                         | 長押しメニュー拡張時 |
| `file:create`              | 新規ファイル作成                     | 長押しメニュー拡張時 |
| `workspace:get-file-stats` | ファイルの行数・エンコーディング取得 | StatusBar 拡張時     |

## 11. ファイル変更監視（P5対策）

### 11.1 二重登録防止パターン

```typescript
// hooks/useFileWatcher.ts
let fileWatcherRegistered = false;

export function useFileWatcher(folderPath: string | null) {
  useEffect(() => {
    if (!folderPath || fileWatcherRegistered) return;

    fileWatcherRegistered = true;
    const unsubscribe = window.electronAPI?.file?.onChanged(
      (event: FileChangedEvent) => {
        // ファイル変更ハンドリング
        // 1. folderFileTrees の該当ノードを更新
        // 2. 選択中ファイルが変更された場合、プレビューを更新（300ms デバウンス）
      },
    );

    return () => {
      fileWatcherRegistered = false;
      unsubscribe?.();
    };
  }, [folderPath]);
}

// テスト用: フラグリセット関数
export function resetFileWatcherFlag(): void {
  fileWatcherRegistered = false;
}
```

### 11.2 ファイル変更時の更新フロー

```
file:changed イベント受信
  → debounce 300ms
  → selectedFilePath と一致するか確認
    → 一致: file:read で再取得 → プレビュー更新
    → 不一致: folderFileTrees のみ更新（ツリー表示の整合性維持）
```

## 12. ファイルシステム権限エラーハンドリング（C8対策）

### パーミッションエラーUI

- `file:get-tree` / `file:read` が EACCES/EPERM エラーを返した場合のUI表示
- エラーメッセージ: 「このフォルダにアクセスできませんでした」
- アクション: 「別のフォルダを選ぶ」ボタン表示
- ツリーノード上: 権限エラーのフォルダは warning アイコン + グレーアウト表示

### エラーリカバリーフロー

1. ファイルツリー取得時: 権限エラーのサブフォルダはスキップし、アクセス可能な部分のみ表示
2. ファイル読み込み時: プレビューに EmptyState（00参照）でエラー表示
3. ファイル監視開始時: 権限エラーの場合、該当フォルダの監視をスキップ（エラーログのみ）

## 13. 大規模ファイルツリーの仮想スクロール（C12対策）

### パフォーマンス要件

- 10,000ノード以上のファイルツリーをスムーズにレンダリング
- 仮想スクロール: 表示領域内のノードのみDOM生成（react-virtual または自前実装）
- 各ノードの高さ: 32px固定（仮想スクロール計算用）

### 実装方針

- `FileTreeNode` の再帰描画をフラットリスト化（展開済みノードのみ一次元配列に変換）
- `useVirtualizer` でビューポート内のアイテムのみレンダリング
- 初期展開レベル: 2階層まで自動展開、以降はユーザー操作で展開
- `node_modules/`, `.git/` 等は自動折りたたみ（デフォルト非展開）

## 14. テスト計画

### 14.1 コンポーネントテスト

| テストファイル                | テスト対象         | テスト項目                                                                                                       |
| ----------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `WorkspaceView.test.tsx`      | WorkspaceView 全体 | chat-only初期表示（チャットのみ）、トグルでサイドバー表示、レスポンシブ切替、ゼロステート、layoutMode自動算出    |
| `PanelToggleBar.test.tsx`     | PanelToggleBar     | トグルON/OFF切替、aria-checked反映、active時scale(0.97)+背景色変化                                               |
| `FileBrowserPanel.test.tsx`   | FileBrowserPanel   | ツリー表示、フォルダ展開/折りたたみ、ファイル選択 → 背景情報自動追加、長押しメニュー                             |
| `FileTreeNode.test.tsx`       | FileTreeNode       | 再帰レンダリング、アイコン表示、展開トグル、キーボードナビゲーション、選択時左ボーダースライドインフィードバック |
| `PanelResizeHandle.test.tsx`  | PanelResizeHandle  | ドラッグリサイズ、最小/最大幅制約、ダブルクリックリセット、3-pane時のみ有効                                      |
| `WorkspaceStatusBar.test.tsx` | WorkspaceStatusBar | ファイル情報表示、未選択時の表示                                                                                 |

### 14.2 Hook テスト

| テストファイル               | テスト対象         | テスト項目                                                                                                                            |
| ---------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `useWorkspaceLayout.test.ts` | useWorkspaceLayout | パネルサイズ計算、レスポンシブモード判定、サイズ永続化、トグル状態管理、computeLayoutMode（chat-only/chat+files/chat+preview/3-pane） |
| `useFileWatcher.test.ts`     | useFileWatcher     | 監視開始/停止、二重登録防止（P5）、デバウンス更新                                                                                     |

### 14.3 P31/P39/P40/P42 対策

- **P31**: 全テストで個別セレクタ（`useStore((s) => s.xxx)`）を使用。合成 Hook をモックしない
- **P39**: happy-dom 環境では `fireEvent` を使用。`userEvent.setup()` は使わない
- **P40**: テスト実行は `cd apps/desktop && pnpm vitest run` で実行
- **P42**: ファイルパスの引数には3段バリデーション（`typeof` → 空文字列 → `trim()` 空文字列）を適用

### 14.4 テストユーティリティ

```typescript
// テスト用ヘルパー
function createMockFileTree(): Map<FolderId, FileNode[]> {
  const tree: FileNode[] = [
    {
      name: "src",
      type: "directory",
      path: "/project/src",
      children: [
        { name: "App.tsx", type: "file", path: "/project/src/App.tsx" },
        { name: "index.ts", type: "file", path: "/project/src/index.ts" },
      ],
    },
    {
      name: "README.md",
      type: "file",
      path: "/project/README.md",
    },
  ];
  return new Map([["folder-1" as FolderId, tree]]);
}
```

## 15. 成果物一覧

### 15.1 プロダクションコード

```
apps/desktop/src/renderer/
+-- views/WorkspaceView/
|   +-- index.tsx                             # WorkspaceView メインコンポーネント
|   +-- components/
|       +-- PanelToggleBar/
|       |   +-- PanelToggleBar.tsx           # 上部アイコントグルバー
|       +-- FileBrowserPanel/
|       |   +-- FileBrowserPanel.tsx          # ファイルサイドバー
|       |   +-- FileTreeNode.tsx             # 再帰ツリーノード
|       |   +-- FileContextMenu.tsx          # 長押しメニュー
|       |   +-- FolderSelector.tsx           # フォルダ選択ボタン
|       +-- PanelResizeHandle.tsx            # リサイズハンドル
|       +-- WorkspaceStatusBar.tsx           # ステータスバー
+-- views/WorkspaceView/hooks/
|   +-- useWorkspaceLayout.ts               # レイアウト・トグル管理
|   +-- useFileWatcher.ts                   # ファイル監視
|   +-- useFileContextMenu.ts               # 長押しメニュー
|   +-- usePanelResize.ts                   # パネルリサイズ
+-- utils/
    +-- fileIconMap.ts                       # ファイルアイコンマッピング
```

### 15.2 テストコード

```
apps/desktop/src/renderer/
+-- views/WorkspaceView/__tests__/
|   +-- WorkspaceView.test.tsx
|   +-- PanelToggleBar.test.tsx
|   +-- FileBrowserPanel.test.tsx
|   +-- FileTreeNode.test.tsx
|   +-- PanelResizeHandle.test.tsx
|   +-- WorkspaceStatusBar.test.tsx
+-- views/WorkspaceView/hooks/__tests__/
    +-- useWorkspaceLayout.test.ts
    +-- useFileWatcher.test.ts
```

### 15.3 推定ファイル数

- プロダクションコード: ~13 ファイル
- テストコード: ~8 ファイル
- 合計: ~21 ファイル

## 16. 完了条件

### 16.1 チャット中心レイアウト

- [ ] chat-only モードで初期表示がチャットパネルのみであること
- [ ] EmptyState mood="welcoming" + SuggestionBubble 3つ（「ファイルを開いてみよう」「AIに質問してみよう」「コードを見てみよう」）が表示されること
- [ ] 「ファイルを開いてみよう」クリックでファイルサイドバーがトグルONになること
- [ ] 「AIに質問してみよう」クリックでチャット入力欄にフォーカスが移動すること
- [ ] 「コードを見てみよう」クリックでチャット入力にテキストが挿入されること
- [ ] 上部の [folder ファイル] [eye プレビュー] アイコントグルが動作すること
- [ ] トグルON時: 背景色変化 + active時 scale(0.97) が適用されること
- [ ] トグルの `role="switch"` + `aria-checked` が正しく設定されること
- [ ] サイドバーが 200ms ease-out でスライドインすること
- [ ] layoutMode が chat-only / chat+files / chat+preview / 3-pane に正しく自動遷移すること

### 16.2 レスポンシブ

- [ ] > = 1440px: チャット + 最大2サイドバー同時表示が動作すること
- [ ] 1024px - 1439px: チャット + 1サイドバーが動作すること
- [ ] < 1024px: チャットのみ表示、サイドバーはオーバーレイ表示であること
- [ ] リサイズ後のサイズが `localStorage` に永続化されること
- [ ] リサイズハンドルは 3-pane モード時のみ有効であること

### 16.3 ファイルパネル

- [ ] `folderFileTrees` を再帰的にツリー表示できること
- [ ] フォルダ展開/折りたたみが動作すること
- [ ] ファイルタップで選択 → チャットの背景情報に自動追加されること
- [ ] ファイル選択時に左ボーダーが `var(--accent)` でスライドインすること
- [ ] ファイルツリー項目ホバーで背景色が変化すること
- [ ] ファイルダブルクリックで EditorView へ遷移すること
- [ ] 長押しメニューが表示され、各メニュー項目が動作すること
- [ ] ファイルアイコンが拡張子別に正しく表示されること
- [ ] キーボード（Arrow Up/Down/Left/Right, Enter, Space）でツリーナビゲーションが可能なこと
- [ ] ARIA属性（`role="tree"`, `role="treeitem"`, `aria-expanded`）が正しく設定されていること

### 16.4 マイクロインタラクション

- [ ] サイドバー開閉: スライドイン 200ms var(--ease-out) が動作すること
- [ ] アイコントグル: active時に背景色変化 + scale(0.97) が動作すること
- [ ] ファイルツリー項目hover: 背景色が変化すること
- [ ] ファイル選択: 左ボーダーが var(--accent) にスライドインすること
- [ ] 長押しメニュー出現: opacity + translateY アニメーションが動作すること

### 16.5 テスト・品質

- [ ] 全コンポーネントテストが PASS すること
- [ ] ファイル変更監視のIPCリスナーが二重登録されていないこと（P5対策）
- [ ] 個別セレクタパターンを使用していること（P31対策）
- [ ] happy-dom 環境で `fireEvent` を使用していること（P39対策）
- [ ] テスト実行が `cd apps/desktop` から行われること（P40対策）
- [ ] キーボードでの全操作が可能（WCAG 2.1 AA）
- [ ] EditorView, ChatView に変更がないこと

## 17. 既知の落とし穴・教訓

| Pitfall | 該当箇所                      | 対策                                                                                                     |
| ------- | ----------------------------- | -------------------------------------------------------------------------------------------------------- |
| **P5**  | ファイル変更監視 IPC リスナー | `useFileWatcher` でモジュールスコープフラグによる二重登録防止。`resetFileWatcherFlag()` をテスト用に公開 |
| **P9**  | テスト間状態リーク            | `beforeEach` で `resetFileWatcherFlag()` を呼び出し。パネルサイズの `localStorage` もリセット            |
| **P13** | タイマーテストの無限ループ    | デバウンス検索（300ms）のテストで `advanceTimersByTime` を使用。`runAllTimers` は使わない                |
| **P31** | Store Hook 依存配列           | 個別セレクタ使用。合成 Hook を useEffect 依存配列に含めない                                              |
| **P39** | happy-dom 環境 userEvent      | `fireEvent` を使用。`userEvent.setup()` は使わない                                                       |
| **P40** | テスト実行ディレクトリ        | `cd apps/desktop && pnpm vitest run` で実行                                                              |
| **P42** | IPC 引数バリデーション        | ファイルパス引数に `.trim()` 3段バリデーション                                                           |

## 18. 関連ドキュメント

### 04 シリーズ分割ドキュメント

| ファイル                                                                                    | 責務                                                                              |
| ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **本ドキュメント（04A）**                                                                   | チャット中心レイアウト + ファイルサイドバー + StatusBar + リサイズ + ファイル監視 |
| [04B-workspace-chat-panel.md](./task-059a-ui-04b-workspace-chat-panel.md)                   | チャットパネル + ファイル背景情報連携 + @mention + ストリーミング                 |
| [04C-workspace-preview-quicksearch.md](./task-059b-ui-04c-workspace-preview-quicksearch.md) | プレビュー + ソース/表示切替 + クイック検索(Cmd+P) + CSP                          |

### 参照資料

| 資料                       | パス / タスク ID                                                   |
| -------------------------- | ------------------------------------------------------------------ |
| デザイン基盤               | TASK-UI-00 `00-ui-design-foundation.md`                            |
| UIアーキテクチャ           | TASK-UI-01 `01-store-ipc-architecture.md`                          |
| ナビゲーションコア         | TASK-UI-02 `02-global-nav-core.md`                                 |
| ダッシュボード             | TASK-UI-07 `07-dashboard-enhancement.md`（統計表示は 07 の責務）   |
| 既存 WorkspaceSidebar      | `apps/desktop/src/renderer/components/organisms/WorkspaceSidebar/` |
| 既存 workspaceSlice        | `apps/desktop/src/renderer/store/slices/workspaceSlice.ts`         |
| 既存 WorkspaceSlice 型定義 | `apps/desktop/src/renderer/store/types/workspace.ts`               |
| 既存 fileSelectionSlice    | `apps/desktop/src/renderer/store/slices/fileSelectionSlice.ts`     |
| IPCチャネル定義            | `apps/desktop/src/preload/channels.ts`                             |
| セキュリティルール         | `.claude/rules/04-electron-security.md`                            |
| P5: リスナー二重登録       | `.claude/rules/06-known-pitfalls.md#P5`                            |
| P31: Store Hook 無限ループ | `.claude/rules/06-known-pitfalls.md#P31`                           |
| P39: happy-dom userEvent   | `.claude/rules/06-known-pitfalls.md#P39`                           |

## 19. 次の Phase

- 04A 完了後、[04B](./task-059a-ui-04b-workspace-chat-panel.md)（チャットパネル）と [04C](./task-059b-ui-04c-workspace-preview-quicksearch.md)（プレビュー + クイック検索）を**並列実装可能**
- TASK-UI-05（ツールを探す）、TASK-UI-06（あなたの記録）とも**並列実行可能**
- 全画面が揃った後、TASK-UI-07（ダッシュボード）で作業スペース統計を統合する

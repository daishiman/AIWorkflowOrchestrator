# コンポーネント設計: Custom Execution Environment UI

## メタ情報

| 項目     | 値                              |
| -------- | ------------------------------- |
| タスクID | AGENT-006                       |
| タスク名 | Custom Execution Environment UI |
| Phase    | 2                               |
| 作成日   | 2026-01-13                      |

---

## コンポーネント階層

```
AgentExecutionView (views)
├── Header
│   ├── BackButton
│   └── SkillInfo
├── SplitLayout (organisms) ← 新規
│   ├── LeftPanel
│   │   └── AgentChatInterface (既存)
│   ├── Divider (ドラッグ可能)
│   └── RightPanel
│       ├── EnvironmentSelector (molecules) ← 新規
│       │   ├── Dropdown (環境選択)
│       │   ├── RefreshButton
│       │   └── FullscreenButton
│       └── ExecutionEnvironment (organisms) ← 新規
│           ├── HTMLPreviewEnvironment ← 新規
│           ├── MarkdownPreviewEnvironment ← 新規
│           └── NoPreviewPlaceholder ← 新規
├── AgentExecutionControls (既存)
├── AgentMessageInput (既存)
└── PermissionDialog (既存)
```

---

## コンポーネント配置

| コンポーネント             | パス                                                                                  | 種別     |
| -------------------------- | ------------------------------------------------------------------------------------- | -------- |
| SplitLayout                | `apps/desktop/src/renderer/components/organisms/SplitLayout/index.tsx`                | organism |
| EnvironmentSelector        | `apps/desktop/src/renderer/components/molecules/EnvironmentSelector/index.tsx`        | molecule |
| ExecutionEnvironment       | `apps/desktop/src/renderer/components/organisms/ExecutionEnvironment/index.tsx`       | organism |
| HTMLPreviewEnvironment     | `apps/desktop/src/renderer/components/organisms/HTMLPreviewEnvironment/index.tsx`     | organism |
| MarkdownPreviewEnvironment | `apps/desktop/src/renderer/components/organisms/MarkdownPreviewEnvironment/index.tsx` | organism |

---

## 1. SplitLayout

### 概要

左右2ペインの分割レイアウトを提供するコンポーネント。ドラッグによる比率調整とキーボードアクセシビリティをサポート。

### ファイル構成

```
SplitLayout/
├── index.tsx          # エントリポイント
├── SplitLayout.tsx    # メインコンポーネント
├── Divider.tsx        # 分割バー
├── useDragResize.ts   # ドラッグリサイズhook
└── SplitLayout.test.tsx
```

### Props

```typescript
interface SplitLayoutProps {
  /** 左パネルのコンテンツ */
  leftPanel: React.ReactNode;
  /** 右パネルのコンテンツ */
  rightPanel: React.ReactNode;
  /** 初期分割比率（0-100、左パネル） */
  initialRatio?: number;
  /** 最小分割比率 */
  minRatio?: number;
  /** 最大分割比率 */
  maxRatio?: number;
  /** 比率変更時のコールバック */
  onRatioChange?: (ratio: number) => void;
  /** 右パネルの表示/非表示 */
  showRightPanel?: boolean;
}
```

### デフォルト値

| Prop           | デフォルト値 |
| -------------- | ------------ |
| initialRatio   | 50           |
| minRatio       | 20           |
| maxRatio       | 80           |
| showRightPanel | true         |

### レイアウト

```
分割レイアウト（showRightPanel=true）:
┌─────────────────────┬─┬─────────────────────┐
│                     │ │                     │
│     Left Panel      │◄│    Right Panel      │
│     (Chat)          │►│    (Preview)        │
│                     │ │                     │
└─────────────────────┴─┴─────────────────────┘

チャットのみ（showRightPanel=false）:
┌───────────────────────────────────────────┐
│                                           │
│              Left Panel (Chat)            │
│                                           │
└───────────────────────────────────────────┘
```

### アクセシビリティ

| 要件               | 実装                                        |
| ------------------ | ------------------------------------------- |
| キーボード操作     | Dividerにtabindex=0、矢印キーで比率調整     |
| スクリーンリーダー | aria-valuenow, aria-valuemin, aria-valuemax |
| フォーカス表示     | :focus-visible でフォーカスリング表示       |

---

## 2. EnvironmentSelector

### 概要

環境タイプを選択するドロップダウンと、更新・フルスクリーンボタンを提供。

### ファイル構成

```
EnvironmentSelector/
├── index.tsx              # エントリポイント
├── EnvironmentSelector.tsx
└── EnvironmentSelector.test.tsx
```

### Props

```typescript
interface EnvironmentSelectorProps {
  /** 現在選択中の環境タイプ */
  currentEnvironment: EnvironmentType;
  /** 利用可能な環境タイプ一覧 */
  availableEnvironments: EnvironmentType[];
  /** 環境変更時のコールバック */
  onEnvironmentChange: (type: EnvironmentType) => void;
  /** 更新ボタン押下時のコールバック */
  onRefresh?: () => void;
  /** フルスクリーンボタン押下時のコールバック */
  onFullscreen?: () => void;
  /** 無効化フラグ */
  disabled?: boolean;
}
```

### 環境タイプ表示名

| EnvironmentType | 表示名   |
| --------------- | -------- |
| none            | なし     |
| html            | HTML     |
| markdown        | Markdown |
| terminal        | Terminal |
| code            | Code     |

### レイアウト

```
┌─────────────────────────────────────────┐
│ [HTML ▼]   [↻ Refresh]   [⛶ Fullscreen]│
└─────────────────────────────────────────┘
```

---

## 3. ExecutionEnvironment

### 概要

環境タイプに応じた適切なプレビューコンポーネントを表示する切り替えコンポーネント。

### ファイル構成

```
ExecutionEnvironment/
├── index.tsx              # エントリポイント
├── ExecutionEnvironment.tsx
├── NoPreviewPlaceholder.tsx
└── ExecutionEnvironment.test.tsx
```

### Props

```typescript
interface ExecutionEnvironmentProps {
  /** 表示する環境タイプ */
  environmentType: EnvironmentType;
  /** プレビューコンテンツ */
  content: PreviewContent | null;
  /** 更新時のコールバック */
  onRefresh?: () => void;
}
```

### 環境タイプに応じたレンダリング

```typescript
const renderEnvironment = () => {
  switch (environmentType) {
    case "html":
      return <HTMLPreviewEnvironment content={content?.content ?? ""} />;
    case "markdown":
      return <MarkdownPreviewEnvironment content={content?.content ?? ""} />;
    case "terminal":
      return <TerminalPlaceholder />; // 将来実装
    case "code":
      return <CodePlaceholder />; // 将来実装
    case "none":
    default:
      return <NoPreviewPlaceholder />;
  }
};
```

---

## 4. HTMLPreviewEnvironment

### 概要

sandbox付きiframe内でHTMLコンテンツを安全にプレビュー表示するコンポーネント。

### ファイル構成

```
HTMLPreviewEnvironment/
├── index.tsx                  # エントリポイント
├── HTMLPreviewEnvironment.tsx
├── useSecureIframe.ts         # iframe設定hook
└── HTMLPreviewEnvironment.test.tsx
```

### Props

```typescript
interface HTMLPreviewEnvironmentProps {
  /** 表示するHTMLコンテンツ */
  content: string;
  /** sandbox属性フラグ */
  sandboxFlags?: string[];
  /** Content Security Policy */
  csp?: string;
  /** ロード完了時のコールバック */
  onLoad?: () => void;
  /** エラー時のコールバック */
  onError?: (error: Error) => void;
}
```

### セキュリティ設定

```typescript
// デフォルトsandbox属性
const DEFAULT_SANDBOX_FLAGS = ["allow-same-origin"];

// デフォルトCSP
const DEFAULT_CSP = [
  "default-src 'self'",
  "script-src 'none'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' https:",
  "connect-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join("; ");
```

### レンダリングフロー

```
1. content propを受け取る
   ↓
2. sanitizeHTML(content) でサニタイズ
   ↓
3. CSP meta tagを含むHTML文書を構築
   ↓
4. srcdoc属性でiframeに設定
   ↓
5. sandbox属性でスクリプト実行を制限
```

---

## 5. MarkdownPreviewEnvironment

### 概要

Markdownコンテンツをレンダリングして表示するコンポーネント。

### ファイル構成

```
MarkdownPreviewEnvironment/
├── index.tsx                      # エントリポイント
├── MarkdownPreviewEnvironment.tsx
└── MarkdownPreviewEnvironment.test.tsx
```

### Props

```typescript
interface MarkdownPreviewEnvironmentProps {
  /** Markdownコンテンツ */
  content: string;
  /** 追加CSSクラス */
  className?: string;
}
```

### レンダリング

- Markdownパーサー: react-markdown（または同等のライブラリ）
- コードブロックハイライト: Prism.js（オプション）
- XSS対策: デフォルトでHTMLタグは無効化

---

## レイアウト詳細設計

### 分割レイアウト（プレビューあり）

```
┌──────────────────────────────────────────────────────────────────┐
│ ← Back   slide-creator                           [⚙️ Settings]   │
├─────────────────────────────┬──┬─────────────────────────────────┤
│                             │  │ [HTML ▼] [↻ Refresh] [⛶ Full]  │
│ ┌─────────────────────────┐ │  │ ┌─────────────────────────────┐ │
│ │ 👤 User                  │ │  │ │                             │ │
│ │ スライドを作成して      │ │  │ │     HTML Preview            │ │
│ └─────────────────────────┘ │◄►│ │                             │ │
│ ┌─────────────────────────┐ │  │ │   <h1>Title</h1>            │ │
│ │ 🤖 Agent                 │ │  │ │   <p>Content...</p>         │ │
│ │ HTMLスライドを生成中... │ │  │ │                             │ │
│ └─────────────────────────┘ │  │ └─────────────────────────────┘ │
│                             │  │                                 │
├─────────────────────────────┴──┴─────────────────────────────────┤
│ [メッセージを入力...                              ] [Send]        │
└──────────────────────────────────────────────────────────────────┘
```

### プレビューなしレイアウト

```
┌──────────────────────────────────────────────────────────────────┐
│ ← Back   general-assistant                       [⚙️ Settings]   │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ 👤 User                                                       │ │
│ │ コードをレビューして                                         │ │
│ └──────────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ 🤖 Agent                                                      │ │
│ │ コードをレビューしています...                                │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│ [メッセージを入力...                              ] [Send]        │
└──────────────────────────────────────────────────────────────────┘
```

---

## スタイリング

### Tailwind CSSクラス設計

| コンポーネント      | 主要クラス                                         |
| ------------------- | -------------------------------------------------- |
| SplitLayout         | `flex h-full`                                      |
| LeftPanel           | `flex-1 min-w-0 overflow-hidden`                   |
| Divider             | `w-1 bg-border cursor-col-resize hover:bg-primary` |
| RightPanel          | `flex-1 min-w-0 overflow-hidden flex flex-col`     |
| EnvironmentSelector | `flex items-center gap-2 p-2 border-b`             |
| PreviewArea         | `flex-1 overflow-auto`                             |

---

## 完了確認

- [x] コンポーネント階層が設計されている
- [x] 各コンポーネントのProps設計が完成している
- [x] ファイル構成が定義されている
- [x] レイアウト詳細が設計されている
- [x] アクセシビリティ要件が含まれている
- [x] スタイリング方針が定義されている

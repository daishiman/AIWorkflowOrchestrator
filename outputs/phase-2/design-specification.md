# Phase 2: 設計仕様書 - Custom Execution Environment UI

## タスク情報

- **タスクID**: AGENT-006
- **タスク名**: Custom Execution Environment UI
- **フェーズ**: Phase 2 - 設計
- **作成日**: 2026-01-13
- **ステータス**: 完了

## アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────────┐
│                       SplitLayout                           │
│  ┌──────────────────┬───┬──────────────────────────────┐   │
│  │                  │   │                              │   │
│  │    Left Panel    │ D │        Right Panel           │   │
│  │   (Chat View)    │ i │  ┌──────────────────────┐   │   │
│  │                  │ v │  │ EnvironmentSelector  │   │   │
│  │                  │ i │  ├──────────────────────┤   │   │
│  │                  │ d │  │                      │   │   │
│  │                  │ e │  │ ExecutionEnvironment │   │   │
│  │                  │ r │  │   - HTMLPreview      │   │   │
│  │                  │   │  │   - MarkdownPreview  │   │   │
│  │                  │   │  │   - Terminal (TBD)   │   │   │
│  │                  │   │  │   - Code (TBD)       │   │   │
│  │                  │   │  │                      │   │   │
│  └──────────────────┴───┴──────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## コンポーネント設計

### コンポーネント階層

```
components/
├── molecules/
│   └── EnvironmentSelector/      # 環境選択UI
└── organisms/
    ├── SplitLayout/              # 分割レイアウト
    ├── ExecutionEnvironment/     # 環境切り替えコンテナ
    ├── HTMLPreviewEnvironment/   # HTMLプレビュー
    └── MarkdownPreviewEnvironment/ # Markdownプレビュー
```

### SplitLayout

**責務**: 左右パネルの分割レイアウトとサイズ調整

**Props**:

```typescript
interface SplitLayoutProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  initialRatio?: number; // default: 50
  minRatio?: number; // default: 20
  maxRatio?: number; // default: 80
  onRatioChange?: (ratio: number) => void;
  showRightPanel?: boolean; // default: true
  className?: string;
}
```

**状態**:

- `ratio: number` - 現在の分割比率
- `isDragging: boolean` - ドラッグ中フラグ

**イベント処理**:

- マウスドラッグ (mousedown, mousemove, mouseup)
- タッチドラッグ (touchstart, touchmove, touchend)
- キーボード (ArrowLeft, ArrowRight, Home, End)

### EnvironmentSelector

**責務**: 環境タイプの選択とアクションボタン

**Props**:

```typescript
interface EnvironmentSelectorProps {
  currentEnvironment: EnvironmentType;
  availableEnvironments: EnvironmentType[];
  onEnvironmentChange: (type: EnvironmentType) => void;
  onRefresh?: () => void;
  onFullscreen?: () => void;
  disabled?: boolean;
  className?: string;
}
```

### ExecutionEnvironment

**責務**: 環境タイプに応じたプレビュー環境の表示

**Props**:

```typescript
interface ExecutionEnvironmentProps {
  environmentType: EnvironmentType;
  content: PreviewContent | null;
  onRefresh?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}
```

**レンダリングロジック**:

```
switch (environmentType) {
  case 'html': return <HTMLPreviewEnvironment />
  case 'markdown': return <MarkdownPreviewEnvironment />
  case 'terminal': return <TerminalPlaceholder />
  case 'code': return <CodePlaceholder />
  case 'none':
  default: return <NoPreviewPlaceholder />
}
```

### HTMLPreviewEnvironment

**責務**: sandboxed iframeによるHTMLプレビュー

**Props**:

```typescript
interface HTMLPreviewEnvironmentProps {
  content: string;
  sandboxFlags?: string[];
  onLoad?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}
```

**セキュリティ処理フロー**:

```
Input HTML
    ↓
sanitizeHTML() - DOMPurifyで危険な要素を除去
    ↓
buildCSPMetaTag() - CSPメタタグを追加
    ↓
buildFullHtml() - 完全なHTML文書を構築
    ↓
<iframe srcDoc={...} sandbox={...} />
```

### MarkdownPreviewEnvironment

**責務**: MarkdownをHTMLに変換してサニタイズ表示

**Props**:

```typescript
interface MarkdownPreviewEnvironmentProps {
  content: string;
  className?: string;
}
```

**処理フロー**:

```
Input Markdown
    ↓
marked.parse() - MarkdownをHTMLに変換
    ↓
sanitizeHTML() - DOMPurifyで危険な要素を除去
    ↓
<div dangerouslySetInnerHTML={...} />
```

## 状態管理設計

### agentSlice拡張

```typescript
// 状態
interface AgentState {
  // 既存の状態...

  // プレビュー関連 (AGENT-006)
  previewContent: PreviewContent | null;
  selectedEnvironment: EnvironmentType;
  splitRatio: number; // 0-100
}

// アクション
interface AgentActions {
  // 既存のアクション...

  // プレビュー操作 (AGENT-006)
  setPreviewContent: (content: PreviewContent | null) => void;
  setSelectedEnvironment: (type: EnvironmentType) => void;
  setSplitRatio: (ratio: number) => void;
  clearPreview: () => void;
}
```

## 型定義

```typescript
// packages/shared/src/types/agent.ts

export type EnvironmentType =
  | "none"
  | "html"
  | "markdown"
  | "terminal"
  | "code";

export interface PreviewEnvironmentConfig {
  type: EnvironmentType;
  autoRefresh: boolean;
  refreshDebounce: number;
  sandboxFlags?: string[];
}

export interface PreviewContent {
  type: EnvironmentType;
  content: string;
  timestamp: Date;
}
```

## データフロー

```
User Action → EnvironmentSelector
                    ↓
            setSelectedEnvironment()
                    ↓
              agentSlice
                    ↓
            ExecutionEnvironment
                    ↓
      HTMLPreviewEnvironment / MarkdownPreviewEnvironment
```

## エラーハンドリング

| エラー種類           | 対処方法                          |
| -------------------- | --------------------------------- |
| サニタイズエラー     | 空文字列を返し、onErrorを呼び出す |
| Markdownパースエラー | 空文字列を返す                    |
| iframe読み込みエラー | onErrorを呼び出す                 |

## 次のフェーズ

Phase 3: 設計レビューゲート - 本設計のレビューと承認

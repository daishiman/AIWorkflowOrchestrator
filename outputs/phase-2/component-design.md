# Phase 2: コンポーネント設計書 - Custom Execution Environment UI

## タスク情報

- **タスクID**: AGENT-006
- **タスク名**: Custom Execution Environment UI
- **フェーズ**: Phase 2 - 設計（コンポーネント詳細）
- **作成日**: 2026-01-13
- **ステータス**: 完了

## コンポーネント階層

```
components/
├── molecules/
│   └── EnvironmentSelector/      # 環境選択UI（ドロップダウン+アクションボタン）
└── organisms/
    ├── SplitLayout/              # 分割レイアウト（リサイズ可能）
    ├── ExecutionEnvironment/     # 環境切り替えコンテナ
    ├── HTMLPreviewEnvironment/   # HTMLプレビュー（sandboxed iframe）
    └── MarkdownPreviewEnvironment/ # Markdownプレビュー
```

## 各コンポーネント詳細設計

### 1. SplitLayout（organisms）

#### 責務

- 左右2パネルの分割レイアウト提供
- マウスドラッグによるリサイズ
- キーボードによるリサイズ
- アクセシビリティ対応（ARIA属性）

#### インターフェース

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

#### 内部状態

```typescript
const [ratio, setRatio] = useState(initialRatio);
const [isDragging, setIsDragging] = useState(false);
```

#### イベントハンドラ

| イベント   | ハンドラ         | 処理内容                           |
| ---------- | ---------------- | ---------------------------------- |
| mousedown  | handleMouseDown  | ドラッグ開始、isDragging=true      |
| mousemove  | handleMouseMove  | 比率計算、ratio更新                |
| mouseup    | handleMouseUp    | ドラッグ終了、isDragging=false     |
| touchstart | handleTouchStart | タッチドラッグ開始                 |
| touchmove  | handleTouchMove  | タッチ位置から比率計算             |
| touchend   | handleTouchEnd   | タッチドラッグ終了                 |
| keydown    | handleKeyDown    | 矢印キーで±5%、Home/Endで最小/最大 |

#### DOM構造

```tsx
<div className="split-layout">
  <div className="left-panel" style={{ width: `${ratio}%` }}>
    {leftPanel}
  </div>
  <div
    className="divider"
    role="separator"
    tabIndex={0}
    aria-valuenow={ratio}
    aria-valuemin={minRatio}
    aria-valuemax={maxRatio}
    aria-label="分割位置を調整"
  />
  {showRightPanel && (
    <div className="right-panel" style={{ width: `${100 - ratio}%` }}>
      {rightPanel}
    </div>
  )}
</div>
```

---

### 2. EnvironmentSelector（molecules）

#### 責務

- 環境タイプの選択（ドロップダウン）
- リフレッシュ/フルスクリーンアクションボタン
- 選択状態の表示

#### インターフェース

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

#### 環境タイプラベルマッピング

```typescript
const ENVIRONMENT_LABELS: Record<EnvironmentType, string> = {
  none: "プレビューなし",
  html: "HTML",
  markdown: "Markdown",
  terminal: "Terminal",
  code: "Code",
};
```

#### DOM構造

```tsx
<div className="environment-selector">
  <select
    value={currentEnvironment}
    onChange={(e) => onEnvironmentChange(e.target.value)}
    disabled={disabled}
    aria-label="実行環境を選択"
  >
    {availableEnvironments.map((env) => (
      <option key={env} value={env}>
        {ENVIRONMENT_LABELS[env]}
      </option>
    ))}
  </select>
  {onRefresh && (
    <button onClick={onRefresh} aria-label="リフレッシュ">
      <RefreshIcon />
    </button>
  )}
  {onFullscreen && (
    <button onClick={onFullscreen} aria-label="フルスクリーン">
      <FullscreenIcon />
    </button>
  )}
</div>
```

---

### 3. ExecutionEnvironment（organisms）

#### 責務

- 環境タイプに応じた適切なプレビュー環境の表示
- プレースホルダー表示（terminal, code, none）
- エラーハンドリング

#### インターフェース

```typescript
interface ExecutionEnvironmentProps {
  environmentType: EnvironmentType;
  content: PreviewContent | null;
  onRefresh?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}
```

#### レンダリングロジック

```typescript
const renderEnvironment = () => {
  switch (environmentType) {
    case "html":
      return <HTMLPreviewEnvironment content={content?.content || ""} />;
    case "markdown":
      return <MarkdownPreviewEnvironment content={content?.content || ""} />;
    case "terminal":
      return <Placeholder {...PLACEHOLDER_CONFIG.terminal} />;
    case "code":
      return <Placeholder {...PLACEHOLDER_CONFIG.code} />;
    case "none":
    default:
      return <Placeholder {...PLACEHOLDER_CONFIG.noPreview} />;
  }
};
```

#### プレースホルダー設定

```typescript
const PLACEHOLDER_CONFIG = {
  noPreview: {
    iconPath: "M...",
    title: "プレビューなし",
    subtitle: "環境タイプを選択してください",
    testId: "no-preview-placeholder",
  },
  terminal: {
    iconPath: "M...",
    title: "Terminal",
    subtitle: "ターミナル環境は準備中です",
    testId: "terminal-placeholder",
  },
  code: {
    iconPath: "M...",
    title: "Code",
    subtitle: "コード実行環境は準備中です",
    testId: "code-placeholder",
  },
} as const;
```

---

### 4. HTMLPreviewEnvironment（organisms）

#### 責務

- sandboxed iframeによる安全なHTMLレンダリング
- DOMPurifyによるサニタイズ
- CSPメタタグの注入

#### インターフェース

```typescript
interface HTMLPreviewEnvironmentProps {
  content: string;
  sandboxFlags?: string[];
  onLoad?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}
```

#### 処理フロー

```
Input HTML
    ↓
sanitizeHTML(content)  ← DOMPurifyで危険要素を除去
    ↓
buildCSPMetaTag()  ← CSPメタタグを生成
    ↓
buildFullHtml(sanitized, csp)  ← 完全なHTML文書を構築
    ↓
filterSandboxFlags(sandboxFlags)  ← 危険なsandboxフラグを除去
    ↓
<iframe srcDoc={fullHtml} sandbox={safeFlags} />
```

#### iframeの属性

```tsx
<iframe
  srcDoc={fullHtml}
  sandbox={sandboxAttribute}
  title="HTML Preview"
  className="w-full h-full border-0"
  onLoad={onLoad}
  onError={() => onError?.(new Error("Failed to load iframe"))}
/>
```

---

### 5. MarkdownPreviewEnvironment（organisms）

#### 責務

- MarkdownからHTMLへの変換
- サニタイズされたHTMLの表示
- proseスタイリングの適用

#### インターフェース

```typescript
interface MarkdownPreviewEnvironmentProps {
  content: string;
  className?: string;
}
```

#### 処理フロー

```
Input Markdown
    ↓
marked.parse(content)  ← MarkdownをHTMLに変換
    ↓
sanitizeHTML(parsedHtml)  ← DOMPurifyで危険要素を除去
    ↓
<div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
```

#### スタイリング

```typescript
const PROSE_CLASSES = [
  "prose prose-invert prose-sm max-w-none",
  "prose-headings:text-[var(--text-primary)]",
  "prose-p:text-[var(--text-secondary)]",
  "prose-a:text-[var(--color-accent)]",
  "prose-code:bg-[var(--bg-tertiary)]",
  "prose-pre:bg-[var(--bg-tertiary)]",
  // ... その他のスタイル
] as const;
```

## コンポーネント間の依存関係

```
SplitLayout
    ├── leftPanel (ChatView等)
    └── rightPanel
        └── ExecutionEnvironment
            ├── HTMLPreviewEnvironment
            │   └── sanitize.ts (sanitizeHTML, buildCSPMetaTag, filterSandboxFlags)
            └── MarkdownPreviewEnvironment
                └── sanitize.ts (sanitizeHTML)

EnvironmentSelector (独立)
    └── agentSlice (Zustand state)
```

## テストデータID（data-testid）

| コンポーネント                       | testid                 |
| ------------------------------------ | ---------------------- |
| SplitLayout divider                  | split-layout-divider   |
| EnvironmentSelector select           | environment-selector   |
| ExecutionEnvironment container       | execution-environment  |
| HTMLPreviewEnvironment iframe        | html-preview-iframe    |
| MarkdownPreviewEnvironment container | markdown-preview       |
| NoPreview placeholder                | no-preview-placeholder |
| Terminal placeholder                 | terminal-placeholder   |
| Code placeholder                     | code-placeholder       |

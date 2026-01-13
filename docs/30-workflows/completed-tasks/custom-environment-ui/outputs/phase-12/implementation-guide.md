# 実装ガイド: Custom Execution Environment UI

## メタ情報

| 項目     | 値                              |
| -------- | ------------------------------- |
| タスクID | AGENT-006                       |
| タスク名 | Custom Execution Environment UI |
| Phase    | 12                              |
| 作成日   | 2026-01-13                      |

---

# Part 1: 概念的な説明（非技術者向け）

## このUIは何をするの？

AIエージェントが作業している間、その結果をリアルタイムで見ることができる画面です。

### 例えると...

本を読みながらノートを取るときを想像してください：

- **左側の画面** = AIとチャットする場所（本を読む）
- **右側の画面** = AIの作品をプレビューする場所（ノートを見る）

### なぜ便利なの？

1. **すぐに確認できる**: AIがHTMLを書いたら、即座にブラウザで見られる
2. **安全**: 悪意のあるコードは自動的にブロック
3. **自由に調整**: 画面の分割サイズを好きに変えられる

### どんな種類のプレビューがあるの？

| 種類     | 説明                         | 状態     |
| -------- | ---------------------------- | -------- |
| HTML     | ウェブページの見た目を確認   | 利用可能 |
| Markdown | 文書の整形表示を確認         | 利用可能 |
| Terminal | コマンド実行結果（将来対応） | 未対応   |
| Code     | コード実行結果（将来対応）   | 未対応   |

---

# Part 2: 技術的な詳細（開発者向け）

## アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────────┐
│                   AgentExecutionView                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    SplitLayout                        │  │
│  │  ┌──────────────────┬───┬──────────────────────────┐  │  │
│  │  │    leftPanel     │ D │       rightPanel         │  │  │
│  │  │                  │ i │                          │  │  │
│  │  │  AgentChat       │ v │  ExecutionEnvironment    │  │  │
│  │  │  Interface       │ i │  ┌────────────────────┐  │  │  │
│  │  │                  │ d │  │EnvironmentSelector │  │  │  │
│  │  │                  │ e │  ├────────────────────┤  │  │  │
│  │  │                  │ r │  │ HTMLPreview /      │  │  │  │
│  │  │                  │   │  │ MarkdownPreview    │  │  │  │
│  │  │                  │   │  └────────────────────┘  │  │  │
│  │  └──────────────────┴───┴──────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## コンポーネント構成

### ファイル構造

```
apps/desktop/src/renderer/
├── components/
│   ├── molecules/
│   │   └── EnvironmentSelector/
│   │       └── index.tsx
│   └── organisms/
│       ├── SplitLayout/
│       │   └── index.tsx
│       ├── ExecutionEnvironment/
│       │   └── index.tsx
│       ├── HTMLPreviewEnvironment/
│       │   └── index.tsx
│       └── MarkdownPreviewEnvironment/
│           └── index.tsx
├── store/slices/
│   └── agentSlice.ts         # 拡張
└── utils/
    └── sanitize.ts           # 新規
packages/shared/src/types/
    └── agent.ts              # 拡張
```

## 状態管理（Zustand）

### 追加された状態

```typescript
// agentSlice拡張
interface AgentState {
  // 既存...
  previewContent: PreviewContent | null;
  selectedEnvironment: EnvironmentType;
  splitRatio: number; // 0-100
}

interface AgentActions {
  // 既存...
  setPreviewContent: (content: PreviewContent | null) => void;
  setSelectedEnvironment: (type: EnvironmentType) => void;
  setSplitRatio: (ratio: number) => void;
  clearPreview: () => void;
}
```

### データフロー

```
Agent SDK → setPreviewContent() → previewContent state
                                         ↓
ExecutionEnvironment ← useAppStore().previewContent
         ↓
HTMLPreviewEnvironment / MarkdownPreviewEnvironment
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

export interface PreviewContent {
  type: EnvironmentType;
  content: string;
  timestamp: Date;
}

export interface PreviewEnvironmentConfig {
  type: EnvironmentType;
  autoRefresh: boolean;
  refreshDebounce: number;
  sandboxFlags?: string[];
}
```

## セキュリティ実装

### 3層防御アーキテクチャ

```
                      ┌─────────────────────┐
  Untrusted HTML  →   │  Layer 1: DOMPurify │  → Sanitized HTML
                      └─────────────────────┘
                               ↓
                      ┌─────────────────────┐
                      │  Layer 2: CSP Meta  │  → script-src 'none'
                      └─────────────────────┘
                               ↓
                      ┌─────────────────────┐
                      │  Layer 3: sandbox   │  → allow-same-origin only
                      └─────────────────────┘
                               ↓
                         Safe Rendering
```

### Layer 1: HTMLサニタイズ（DOMPurify）

```typescript
import DOMPurify from "dompurify";

export const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["h1", "h2", "h3", "p", "div", "span", "ul", "ol", "li", ...],
    FORBID_TAGS: ["script", "iframe", "object", "embed", "form", "input"],
    FORBID_ATTR: ["onerror", "onload", "onclick", ...],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|data):)/i, // javascript: blocked
  });
};
```

### Layer 2: Content Security Policy

```typescript
export const CSP_DIRECTIVES = {
  "default-src": "'self'",
  "script-src": "'none'",
  "style-src": "'self' 'unsafe-inline'",
  "img-src": "'self' data: https:",
  "connect-src": "'none'",
  "frame-ancestors": "'none'",
  "form-action": "'none'",
  "base-uri": "'none'",
  "object-src": "'none'",
};
```

### Layer 3: iframe sandbox

```html
<iframe sandbox="allow-same-origin" srcdoc="..." />
```

**禁止されたsandboxフラグ**:

- `allow-scripts` - スクリプト実行禁止
- `allow-popups` - ポップアップ禁止
- `allow-top-navigation` - 親フレームナビゲーション禁止
- `allow-forms` - フォーム送信禁止

## コンポーネント使用例

### SplitLayout

```tsx
import { SplitLayout } from "@/components/organisms/SplitLayout";

<SplitLayout
  leftPanel={<AgentChatInterface />}
  rightPanel={<ExecutionEnvironment />}
  initialRatio={60}
  minRatio={20}
  maxRatio={80}
  onRatioChange={(ratio) => setSplitRatio(ratio)}
  showRightPanel={selectedEnvironment !== "none"}
/>;
```

### ExecutionEnvironment

```tsx
import { ExecutionEnvironment } from "@/components/organisms/ExecutionEnvironment";

<ExecutionEnvironment
  environmentType={selectedEnvironment}
  content={previewContent}
  onRefresh={() => refreshPreview()}
  onError={(err) => console.error(err)}
/>;
```

## テスト戦略

### テストカバレッジ目標

| メトリクス | 目標 | 達成 |
| ---------- | ---- | ---- |
| Line       | 80%  | 85%  |
| Branch     | 60%  | 68%  |
| Function   | 80%  | 88%  |

### セキュリティテストケース

```typescript
describe("HTMLPreviewEnvironment Security", () => {
  it("removes script tags", () => {
    const input = '<script>alert("xss")</script><p>Safe</p>';
    render(<HTMLPreviewEnvironment content={input} />);
    expect(screen.queryByText("xss")).not.toBeInTheDocument();
  });

  it("blocks javascript: URLs", () => {
    const input = '<a href="javascript:alert(1)">Click</a>';
    render(<HTMLPreviewEnvironment content={input} />);
    const link = screen.getByRole("link");
    expect(link).not.toHaveAttribute("href", expect.stringContaining("javascript:"));
  });
});
```

## 拡張方法

### 新しい環境タイプを追加する

1. `EnvironmentType`型に新しいタイプを追加:

```typescript
export type EnvironmentType =
  | "none"
  | "html"
  | "markdown"
  | "terminal" // 新規
  | "code";
```

2. 対応するPreviewEnvironmentコンポーネントを作成:

```tsx
// components/organisms/TerminalPreviewEnvironment/index.tsx
export const TerminalPreviewEnvironment: React.FC<Props> = ({ content }) => {
  return <pre className="terminal-output">{content}</pre>;
};
```

3. `ExecutionEnvironment`のswitchに追加:

```tsx
switch (environmentType) {
  case "html":
    return <HTMLPreviewEnvironment {...props} />;
  case "markdown":
    return <MarkdownPreviewEnvironment {...props} />;
  case "terminal":
    return <TerminalPreviewEnvironment {...props} />; // 追加
  default:
    return <NoPreviewPlaceholder />;
}
```

## 依存パッケージ

| パッケージ       | バージョン | 用途             |
| ---------------- | ---------- | ---------------- |
| dompurify        | ^3.2.5     | HTMLサニタイズ   |
| @types/dompurify | ^3.2.0     | 型定義           |
| marked           | ^15.0.6    | Markdownパーサー |
| clsx             | ^2.1.1     | クラス名結合     |

## トラブルシューティング

### Q: HTMLが表示されない

**確認事項**:

1. `previewContent.content`が空でないか
2. `environmentType`が"html"に設定されているか
3. サニタイズでコンテンツが除去されていないか

### Q: スタイルが適用されない

**対応**:

- インラインスタイル（`style`属性）を使用する
- 外部CSSは読み込まれない（セキュリティ制限）

### Q: パフォーマンスが遅い

**最適化**:

- デバウンス時間を500ms以上に設定
- 大きなHTMLは分割して送信
- `useMemo`/`useCallback`を活用

---

## 関連ドキュメント

| ドキュメント     | パス                                    |
| ---------------- | --------------------------------------- |
| APIドキュメント  | `outputs/phase-12/api-documentation.md` |
| 要件定義書       | `outputs/phase-1/requirements.md`       |
| セキュリティ設計 | `outputs/phase-2/security-design.md`    |

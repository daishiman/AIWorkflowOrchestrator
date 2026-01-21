# Custom Execution Environment UI - API ドキュメント

## タスク情報

- **タスクID**: AGENT-006
- **フェーズ**: Phase 12 - ドキュメント作成
- **実行日時**: 2026-01-13

## 概要

Custom Execution Environment UIは、AIエージェントの実行結果をプレビューするための分割レイアウトUIを提供します。HTML、Markdown、ターミナル、コード実行環境のプレビューに対応しています。

## コンポーネント API

### SplitLayout

分割レイアウトを提供するコンポーネント。ドラッグとキーボードによるサイズ調整が可能。

#### Props

```typescript
interface SplitLayoutProps {
  /** 左パネルのコンテンツ */
  leftPanel: React.ReactNode;
  /** 右パネルのコンテンツ */
  rightPanel: React.ReactNode;
  /** 初期分割比率（0-100、左パネルの幅%） */
  initialRatio?: number; // default: 50
  /** 最小分割比率 */
  minRatio?: number; // default: 20
  /** 最大分割比率 */
  maxRatio?: number; // default: 80
  /** 比率変更時のコールバック */
  onRatioChange?: (ratio: number) => void;
  /** 右パネル表示フラグ */
  showRightPanel?: boolean; // default: true
  /** カスタムクラス名 */
  className?: string;
}
```

#### 使用例

```tsx
import { SplitLayout } from "@/components/organisms/SplitLayout";

<SplitLayout
  leftPanel={<ChatView />}
  rightPanel={<PreviewPane />}
  initialRatio={60}
  onRatioChange={(ratio) => console.log(`New ratio: ${ratio}%`)}
/>;
```

#### キーボード操作

| キー       | 動作             |
| ---------- | ---------------- |
| ArrowLeft  | 左パネルを5%縮小 |
| ArrowRight | 左パネルを5%拡大 |
| Home       | 最小比率に設定   |
| End        | 最大比率に設定   |

---

### EnvironmentSelector

実行環境タイプを選択するドロップダウンコンポーネント。

#### Props

```typescript
interface EnvironmentSelectorProps {
  /** 現在選択中の環境タイプ */
  currentEnvironment: EnvironmentType;
  /** 利用可能な環境タイプ */
  availableEnvironments: EnvironmentType[];
  /** 環境変更ハンドラ */
  onEnvironmentChange: (type: EnvironmentType) => void;
  /** リフレッシュボタンクリックハンドラ */
  onRefresh?: () => void;
  /** フルスクリーンボタンクリックハンドラ */
  onFullscreen?: () => void;
  /** 無効状態 */
  disabled?: boolean; // default: false
  /** カスタムクラス */
  className?: string;
}
```

#### 使用例

```tsx
import { EnvironmentSelector } from "@/components/molecules/EnvironmentSelector";

<EnvironmentSelector
  currentEnvironment="html"
  availableEnvironments={["none", "html", "markdown"]}
  onEnvironmentChange={(type) => setEnvironment(type)}
  onRefresh={() => refreshPreview()}
/>;
```

---

### ExecutionEnvironment

環境タイプに応じて適切なプレビュー環境を表示するコンテナコンポーネント。

#### Props

```typescript
interface ExecutionEnvironmentProps {
  /** 環境タイプ */
  environmentType: EnvironmentType;
  /** プレビューコンテンツ */
  content: PreviewContent | null;
  /** リフレッシュハンドラ */
  onRefresh?: () => void;
  /** エラーハンドラ */
  onError?: (error: Error) => void;
  /** カスタムクラス */
  className?: string;
}
```

#### 使用例

```tsx
import { ExecutionEnvironment } from "@/components/organisms/ExecutionEnvironment";

<ExecutionEnvironment
  environmentType="html"
  content={{
    type: "html",
    content: "<h1>Hello World</h1>",
    timestamp: new Date(),
  }}
  onError={(err) => console.error(err)}
/>;
```

---

### HTMLPreviewEnvironment

sandboxed iframeによる安全なHTMLプレビュー環境。

#### Props

```typescript
interface HTMLPreviewEnvironmentProps {
  /** プレビューするHTMLコンテンツ */
  content: string;
  /** sandbox属性の値（配列） */
  sandboxFlags?: string[];
  /** 読み込み完了ハンドラ */
  onLoad?: () => void;
  /** エラーハンドラ */
  onError?: (error: Error) => void;
  /** カスタムクラス */
  className?: string;
}
```

#### セキュリティ機能

- **HTMLサニタイズ**: DOMPurifyによる危険なタグ・属性の除去
- **CSP**: `script-src 'none'`等の厳格なポリシー
- **sandbox**: `allow-same-origin`のみ許可

#### 使用例

```tsx
import { HTMLPreviewEnvironment } from "@/components/organisms/HTMLPreviewEnvironment";

<HTMLPreviewEnvironment
  content="<p>Safe HTML content</p>"
  onLoad={() => console.log("Loaded")}
/>;
```

---

### MarkdownPreviewEnvironment

Markdownをサニタイズ済みHTMLに変換して表示。

#### Props

```typescript
interface MarkdownPreviewEnvironmentProps {
  /** Markdownコンテンツ */
  content: string;
  /** カスタムクラス */
  className?: string;
}
```

#### 使用例

```tsx
import { MarkdownPreviewEnvironment } from "@/components/organisms/MarkdownPreviewEnvironment";

<MarkdownPreviewEnvironment content="# Hello\n\nThis is **markdown**." />;
```

---

## 型定義

### EnvironmentType

```typescript
type EnvironmentType = "none" | "html" | "markdown" | "terminal" | "code";
```

### PreviewContent

```typescript
interface PreviewContent {
  type: EnvironmentType;
  content: string;
  timestamp: Date;
}
```

### PreviewEnvironmentConfig

```typescript
interface PreviewEnvironmentConfig {
  type: EnvironmentType;
  autoRefresh: boolean;
  refreshDebounce: number;
  sandboxFlags?: string[];
}
```

---

## 状態管理 (Zustand)

### agentSlice プレビュー拡張

```typescript
// 状態
interface AgentState {
  previewContent: PreviewContent | null;
  selectedEnvironment: EnvironmentType;
  splitRatio: number; // 0-100
}

// アクション
interface AgentActions {
  setPreviewContent: (content: PreviewContent | null) => void;
  setSelectedEnvironment: (type: EnvironmentType) => void;
  setSplitRatio: (ratio: number) => void;
  clearPreview: () => void;
}
```

### 使用例

```typescript
import { useAppStore } from "@/store";

const PreviewComponent = () => {
  const { previewContent, selectedEnvironment, setSelectedEnvironment } =
    useAppStore();

  return (
    <ExecutionEnvironment
      environmentType={selectedEnvironment}
      content={previewContent}
    />
  );
};
```

---

## ユーティリティ

### sanitizeHTML

HTMLコンテンツをサニタイズしてXSS攻撃を防止。

```typescript
import { sanitizeHTML } from "@/utils/sanitize";

const safeHtml = sanitizeHTML('<script>alert("xss")</script><p>Safe</p>');
// safeHtml = '<p>Safe</p>'
```

### buildCSPMetaTag

CSPメタタグを生成。

```typescript
import { buildCSPMetaTag } from "@/utils/sanitize";

const cspTag = buildCSPMetaTag();
// '<meta http-equiv="Content-Security-Policy" content="...">'
```

### filterSandboxFlags

危険なsandboxフラグをフィルタリング。

```typescript
import { filterSandboxFlags } from "@/utils/sanitize";

const safeFlags = filterSandboxFlags(["allow-same-origin", "allow-scripts"]);
// safeFlags = 'allow-same-origin'
```

---

## セキュリティ考慮事項

### 許可されていないsandboxフラグ

以下のフラグは自動的にフィルタリングされます：

- `allow-scripts`
- `allow-popups`
- `allow-top-navigation`
- `allow-forms`
- `allow-modals`
- `allow-pointer-lock`
- `allow-downloads`

### CSPディレクティブ

```
default-src 'self';
script-src 'none';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
connect-src 'none';
frame-ancestors 'none';
form-action 'none';
base-uri 'none';
object-src 'none';
```

---

## テスト

```bash
# 全テスト実行
pnpm --filter @repo/desktop test

# 特定コンポーネントのテスト
npx vitest run src/renderer/components/organisms/HTMLPreviewEnvironment
```

---

## 依存パッケージ

```json
{
  "dependencies": {
    "dompurify": "^3.x",
    "marked": "^15.x",
    "clsx": "^2.x"
  },
  "devDependencies": {
    "@types/dompurify": "^3.x"
  }
}
```

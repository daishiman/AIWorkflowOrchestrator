# Monaco Diff Editor 統合設計書

## メタ情報

| 項目   | 内容                   |
| ------ | ---------------------- |
| Phase  | 2                      |
| タスク | Monaco統合設計         |
| 作成日 | 2026-01-24             |
| 機能名 | workspace-chat-edit-ui |

---

## 1. 概要

### 1.1 使用ライブラリ

| ライブラリ           | バージョン | 用途                           |
| -------------------- | ---------- | ------------------------------ |
| @monaco-editor/react | ^4.6.0     | React向けMonaco Editorラッパー |
| monaco-editor        | ^0.44.0    | コアエディタ（ピア依存）       |

### 1.2 機能要件

| 機能                   | 対応状況 | 説明                         |
| ---------------------- | -------- | ---------------------------- |
| サイドバイサイド差分   | 必須     | 左右に元/変更後を表示        |
| インライン差分         | 必須     | モバイル向け1カラム表示      |
| シンタックスハイライト | 必須     | 言語別のハイライト           |
| 行番号表示             | 必須     | 差分箇所の特定を容易に       |
| 読み取り専用           | 必須     | 編集防止                     |
| レスポンシブ           | 必須     | 幅に応じてレイアウト切り替え |
| ミニマップ             | 推奨     | 無効化（画面サイズ節約）     |
| 差分ナビゲーション     | 推奨     | F7/Shift+F7で差分間移動      |

---

## 2. コンポーネント設計

### 2.1 DiffEditor Props

```typescript
interface DiffEditorProps {
  /** 元のコンテンツ */
  original: string;
  /** 変更後のコンテンツ */
  modified: string;
  /** プログラミング言語 */
  language: string;
  /** 読み取り専用（デフォルト: true） */
  readOnly?: boolean;
  /** 高さ（デフォルト: 400px） */
  height?: string | number;
  /** サイドバイサイド表示（デフォルト: true, モバイルではfalse） */
  renderSideBySide?: boolean;
  /** テーマ（デフォルト: システム設定に従う） */
  theme?: "vs" | "vs-dark" | "hc-black";
  /** 追加のクラス名 */
  className?: string;
  /** マウント完了時コールバック */
  onMount?: (editor: monaco.editor.IStandaloneDiffEditor) => void;
}
```

### 2.2 コンポーネント実装

```tsx
import { DiffEditor as MonacoDiffEditor } from "@monaco-editor/react";
import type * as monaco from "monaco-editor";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/utils/cn";

export const DiffEditor: React.FC<DiffEditorProps> = ({
  original,
  modified,
  language,
  readOnly = true,
  height = 400,
  renderSideBySide: propsSideBySide,
  theme,
  className,
  onMount,
}) => {
  const editorRef = useRef<monaco.editor.IStandaloneDiffEditor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [internalSideBySide, setInternalSideBySide] = useState(true);

  // レスポンシブ対応
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setInternalSideBySide(propsSideBySide ?? !isMobile);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [propsSideBySide]);

  // エディタマウント時
  const handleEditorDidMount = useCallback(
    (editor: monaco.editor.IStandaloneDiffEditor) => {
      editorRef.current = editor;
      setIsLoading(false);
      onMount?.(editor);
    },
    [onMount],
  );

  // リサイズ時のレイアウト更新
  useEffect(() => {
    const handleResize = () => {
      editorRef.current?.layout();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // システムテーマの検出
  const resolvedTheme =
    theme ??
    (window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "vs-dark"
      : "vs");

  return (
    <div
      className={cn("relative", className)}
      role="application"
      aria-label="差分エディタ"
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-slate-500">読み込み中...</span>
          </div>
        </div>
      )}
      <MonacoDiffEditor
        original={original}
        modified={modified}
        language={language}
        height={height}
        theme={resolvedTheme}
        options={{
          readOnly,
          renderSideBySide: internalSideBySide,
          minimap: { enabled: false },
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          wordWrap: "on",
          automaticLayout: true,
          renderOverviewRuler: false,
          scrollbar: {
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          },
          diffWordWrap: "on",
          ignoreTrimWhitespace: false,
          renderIndicators: true,
          originalEditable: false,
        }}
        onMount={handleEditorDidMount}
      />
    </div>
  );
};
```

---

## 3. Monaco Editor オプション詳細

### 3.1 差分エディタオプション

| オプション           | 値         | 説明                        |
| -------------------- | ---------- | --------------------------- |
| readOnly             | true       | 編集不可                    |
| renderSideBySide     | true/false | サイドバイサイド/インライン |
| minimap.enabled      | false      | ミニマップ無効              |
| lineNumbers          | 'on'       | 行番号表示                  |
| scrollBeyondLastLine | false      | 最終行以降スクロール無効    |
| wordWrap             | 'on'       | 折り返し有効                |
| automaticLayout      | true       | 自動レイアウト調整          |
| renderOverviewRuler  | false      | オーバービュールーラー無効  |
| diffWordWrap         | 'on'       | 差分表示での折り返し        |
| ignoreTrimWhitespace | false      | 空白差分を無視しない        |
| renderIndicators     | true       | 差分インジケータ表示        |
| originalEditable     | false      | 元コンテンツ編集不可        |

### 3.2 パフォーマンス最適化オプション

```typescript
const performanceOptions: monaco.editor.IDiffEditorConstructionOptions = {
  // 大きなファイル向け最適化
  largeFileOptimizations: true,

  // 折りたたみ無効（差分表示では不要）
  folding: false,

  // マッチングブラケット無効
  matchBrackets: "never",

  // セレクション・ハイライト無効
  selectionHighlight: false,
  occurrencesHighlight: "off",

  // フォーカス時のみカーソル表示
  renderLineHighlight: "none",

  // スクロールバー最適化
  fastScrollSensitivity: 5,
  mouseWheelScrollSensitivity: 1,
};
```

---

## 4. 言語サポート

### 4.1 サポート言語一覧

| 言語       | Monaco ID  | 拡張子                |
| ---------- | ---------- | --------------------- |
| TypeScript | typescript | .ts, .tsx             |
| JavaScript | javascript | .js, .jsx, .mjs, .cjs |
| Python     | python     | .py                   |
| Java       | java       | .java                 |
| C/C++      | cpp        | .c, .cpp, .h, .hpp    |
| C#         | csharp     | .cs                   |
| Go         | go         | .go                   |
| Rust       | rust       | .rs                   |
| Ruby       | ruby       | .rb                   |
| PHP        | php        | .php                  |
| HTML       | html       | .html, .htm           |
| CSS        | css        | .css                  |
| SCSS       | scss       | .scss, .sass          |
| JSON       | json       | .json                 |
| YAML       | yaml       | .yml, .yaml           |
| Markdown   | markdown   | .md                   |
| Shell      | shell      | .sh, .bash            |
| SQL        | sql        | .sql                  |
| XML        | xml        | .xml                  |
| Plain Text | plaintext  | その他                |

### 4.2 言語検出ユーティリティ

```typescript
const LANGUAGE_MAP: Record<string, string> = {
  ".ts": "typescript",
  ".tsx": "typescript",
  ".js": "javascript",
  ".jsx": "javascript",
  ".mjs": "javascript",
  ".cjs": "javascript",
  ".py": "python",
  ".java": "java",
  ".c": "c",
  ".cpp": "cpp",
  ".h": "cpp",
  ".hpp": "cpp",
  ".cs": "csharp",
  ".go": "go",
  ".rs": "rust",
  ".rb": "ruby",
  ".php": "php",
  ".html": "html",
  ".htm": "html",
  ".css": "css",
  ".scss": "scss",
  ".sass": "scss",
  ".json": "json",
  ".yml": "yaml",
  ".yaml": "yaml",
  ".md": "markdown",
  ".sh": "shell",
  ".bash": "shell",
  ".sql": "sql",
  ".xml": "xml",
};

export const detectLanguage = (filePath: string): string => {
  const ext = filePath.slice(filePath.lastIndexOf(".")).toLowerCase();
  return LANGUAGE_MAP[ext] ?? "plaintext";
};
```

---

## 5. 遅延読み込み

### 5.1 Dynamic Import

```typescript
// components/DiffEditor/index.tsx
import dynamic from 'next/dynamic';
import type { DiffEditorProps } from './DiffEditor';

// 遅延読み込み（SSR無効）
export const DiffEditor = dynamic<DiffEditorProps>(
  () => import('./DiffEditor').then((mod) => mod.DiffEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[400px] bg-slate-100 dark:bg-slate-800">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-500">エディタを読み込み中...</span>
        </div>
      </div>
    ),
  }
);

// 型エクスポート
export type { DiffEditorProps } from './DiffEditor';
```

### 5.2 Webpack設定（Monaco Editor Worker）

```typescript
// next.config.js または webpack.config.js
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");

module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(
        new MonacoWebpackPlugin({
          // 必要な言語のみバンドル
          languages: [
            "typescript",
            "javascript",
            "python",
            "json",
            "markdown",
            "html",
            "css",
            "yaml",
          ],
          // 必要な機能のみバンドル
          features: [
            "bracketMatching",
            "caretOperations",
            "clipboard",
            "contextmenu",
            "diffEditor",
            "find",
            "folding",
            "fontZoom",
            "hover",
            "inPlaceReplace",
            "indentation",
            "lineNumbers",
            "links",
            "multicursor",
            "wordHighlighter",
          ],
        }),
      );
    }
    return config;
  },
};
```

---

## 6. レスポンシブ対応

### 6.1 ブレークポイント定義

| ブレークポイント | 幅         | 差分表示モード        |
| ---------------- | ---------- | --------------------- |
| sm               | < 640px    | インライン（1カラム） |
| md               | 640-1024px | サイドバイサイド      |
| lg               | > 1024px   | サイドバイサイド      |

### 6.2 レスポンシブ Hook

```typescript
const useResponsiveSideBySide = (override?: boolean): boolean => {
  const [sideBySide, setSideBySide] = useState(true);

  useEffect(() => {
    // 初期値はサーバーサイドでは true
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(min-width: 768px)");

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setSideBySide(override ?? e.matches);
    };

    handleChange(mediaQuery);
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [override]);

  return sideBySide;
};
```

### 6.3 高さ調整

```typescript
const useResponsiveHeight = (
  defaultHeight: number | string,
): string | number => {
  const [height, setHeight] = useState(defaultHeight);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const calculateHeight = () => {
      const vh = window.innerHeight;

      // モバイル: 50vh
      if (window.innerWidth < 640) {
        setHeight(Math.max(300, vh * 0.5));
      }
      // タブレット: 60vh
      else if (window.innerWidth < 1024) {
        setHeight(Math.max(400, vh * 0.6));
      }
      // デスクトップ: 70vh（最大600px）
      else {
        setHeight(Math.min(600, Math.max(400, vh * 0.7)));
      }
    };

    calculateHeight();
    window.addEventListener("resize", calculateHeight);

    return () => window.removeEventListener("resize", calculateHeight);
  }, [defaultHeight]);

  return height;
};
```

---

## 7. テーマ対応

### 7.1 ダークモード連動

```typescript
const useMonacoTheme = (): "vs" | "vs-dark" => {
  const [theme, setTheme] = useState<"vs" | "vs-dark">("vs");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setTheme(e.matches ? "vs-dark" : "vs");
    };

    handleChange(mediaQuery);
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return theme;
};
```

### 7.2 カスタムテーマ（オプション）

```typescript
import * as monaco from "monaco-editor";

const defineKanagawaTheme = () => {
  monaco.editor.defineTheme("kanagawa", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "727169", fontStyle: "italic" },
      { token: "keyword", foreground: "957FB8" },
      { token: "string", foreground: "98BB6C" },
      { token: "number", foreground: "D27E99" },
      { token: "type", foreground: "7E9CD8" },
      { token: "function", foreground: "7AA89F" },
    ],
    colors: {
      "editor.background": "#1F1F28",
      "editor.foreground": "#DCD7BA",
      "editor.lineHighlightBackground": "#2A2A37",
      "editorLineNumber.foreground": "#54546D",
      "editorDiffAdd.background": "#76946A33",
      "editorDiffDelete.background": "#C34043" + "33",
      "editorDiffModified.background": "#DCA561" + "33",
    },
  });
};
```

---

## 8. エラーハンドリング

### 8.1 エラー境界

```tsx
import { Component, ErrorInfo, ReactNode } from "react";

interface DiffEditorErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface DiffEditorErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class DiffEditorErrorBoundary extends Component<
  DiffEditorErrorBoundaryProps,
  DiffEditorErrorBoundaryState
> {
  state: DiffEditorErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): DiffEditorErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("DiffEditor error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            className="flex flex-col items-center justify-center h-[400px] bg-slate-100 dark:bg-slate-800 rounded-lg"
            role="alert"
          >
            <svg
              className="w-12 h-12 text-red-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
              差分エディタの読み込みに失敗しました
            </p>
            <p className="text-sm text-slate-500 mt-2">
              {this.state.error?.message}
            </p>
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={() => window.location.reload()}
            >
              ページを再読み込み
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

### 8.2 使用例

```tsx
<DiffEditorErrorBoundary>
  <DiffEditor
    original={result.originalContent}
    modified={result.generatedContent}
    language={detectLanguage(result.fileName)}
  />
</DiffEditorErrorBoundary>
```

---

## 9. パフォーマンス考慮事項

### 9.1 大きなファイルの処理

| ファイルサイズ | 対応策                     |
| -------------- | -------------------------- |
| < 100KB        | 通常処理                   |
| 100KB - 1MB    | largeFileOptimizations有効 |
| 1MB - 10MB     | 仮想化 + 差分計算の遅延    |
| > 10MB         | 添付拒否（要件定義通り）   |

### 9.2 メモリ最適化

```typescript
// コンポーネントアンマウント時のクリーンアップ
useEffect(() => {
  return () => {
    if (editorRef.current) {
      editorRef.current.dispose();
      editorRef.current = null;
    }
  };
}, []);
```

### 9.3 差分計算の最適化

```typescript
// 差分計算をメモ化
const diffStats = useMemo(() => {
  if (!original || !modified) return { added: 0, removed: 0, changed: 0 };

  const originalLines = original.split("\n");
  const modifiedLines = modified.split("\n");

  // 軽量な差分カウント（詳細差分はMonacoに任せる）
  let added = 0,
    removed = 0;

  // 行数比較による簡易推定
  const lengthDiff = modifiedLines.length - originalLines.length;
  if (lengthDiff > 0) {
    added = lengthDiff;
  } else if (lengthDiff < 0) {
    removed = -lengthDiff;
  }

  return { added, removed, changed: 0 };
}, [original, modified]);
```

---

## 10. テスト戦略

### 10.1 ユニットテスト

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { DiffEditor } from './DiffEditor';

// Monaco Editorのモック
vi.mock('@monaco-editor/react', () => ({
  DiffEditor: vi.fn(({ original, modified, language, onMount }) => {
    // マウント時にコールバック呼び出し
    React.useEffect(() => {
      onMount?.({
        layout: vi.fn(),
        dispose: vi.fn(),
      });
    }, [onMount]);

    return (
      <div data-testid="mock-monaco-diff-editor">
        <div data-testid="original">{original}</div>
        <div data-testid="modified">{modified}</div>
        <div data-testid="language">{language}</div>
      </div>
    );
  }),
}));

describe('DiffEditor', () => {
  it('should render with original and modified content', () => {
    render(
      <DiffEditor
        original="const x = 1;"
        modified="const x = 2;"
        language="typescript"
      />
    );

    expect(screen.getByTestId('original')).toHaveTextContent('const x = 1;');
    expect(screen.getByTestId('modified')).toHaveTextContent('const x = 2;');
  });

  it('should detect language from file extension', () => {
    expect(detectLanguage('/path/to/file.ts')).toBe('typescript');
    expect(detectLanguage('/path/to/file.py')).toBe('python');
    expect(detectLanguage('/path/to/file.unknown')).toBe('plaintext');
  });

  it('should have correct aria attributes', () => {
    render(
      <DiffEditor
        original=""
        modified=""
        language="plaintext"
      />
    );

    const container = screen.getByRole('application');
    expect(container).toHaveAttribute('aria-label', '差分エディタ');
  });
});
```

---

## 作成日時

- 作成: 2026-01-24
- 作成者: Claude Code

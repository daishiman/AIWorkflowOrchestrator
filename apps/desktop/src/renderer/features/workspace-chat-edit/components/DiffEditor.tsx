/**
 * DiffEditor コンポーネント
 *
 * Monaco Editorを使用した差分表示コンポーネント
 */

import type { FC } from "react";
import { memo } from "react";
import { DiffEditor as MonacoDiffEditor } from "@monaco-editor/react";
import { cn } from "../../../lib/utils";
import { Spinner } from "./common";

export interface DiffEditorProps {
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
  /** テーマ（デフォルト: vs-dark） */
  theme?: string;
  /** 並べて表示（デフォルト: true） */
  sideBySide?: boolean;
  /** フォントサイズ（デフォルト: 14） */
  fontSize?: number;
  /** ワードラップ（デフォルト: off） */
  wordWrap?: "off" | "on" | "wordWrapColumn" | "bounded";
  /** 追加のクラス名 */
  className?: string;
}

/**
 * DiffEditor コンポーネント
 *
 * React.memo で最適化（Monaco Editorの不要な再初期化を防止）
 */
export const DiffEditor: FC<DiffEditorProps> = memo(
  ({
    original,
    modified,
    language,
    readOnly = true,
    height = "400px",
    theme = "vs-dark",
    sideBySide = true,
    fontSize = 14,
    wordWrap = "off",
    className,
  }) => {
    return (
      <div
        role="region"
        aria-label="差分エディタ"
        aria-describedby="diff-editor-description"
        className={cn("relative", className)}
        style={{ height }}
      >
        <span id="diff-editor-description" className="sr-only">
          左側に元のコード、右側に変更後のコードを表示しています
        </span>
        <MonacoDiffEditor
          original={original}
          modified={modified}
          language={language}
          theme={theme}
          height="100%"
          options={{
            readOnly,
            renderSideBySide: sideBySide,
            minimap: { enabled: false },
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            fontSize,
            wordWrap,
          }}
          loading={
            <div className="flex items-center justify-center h-full bg-slate-100 dark:bg-slate-800">
              <Spinner size="lg" className="text-blue-500" />
            </div>
          }
        />
      </div>
    );
  },
);

DiffEditor.displayName = "DiffEditor";

export default DiffEditor;

import { useEffect, useMemo, useState } from "react";
import { parse as parseYaml } from "yaml";
import { HtmlPreview } from "./HtmlPreview";
import { ImagePreview } from "./ImagePreview";
import { MarkdownPreview } from "./MarkdownPreview";
import { PreviewEmptyState } from "./PreviewEmptyState";
import { PreviewErrorBoundary } from "./PreviewErrorBoundary";
import { PreviewToolbar } from "./PreviewToolbar";
import { SourceView } from "./SourceView";
import { StructuredPreview } from "./StructuredPreview";
import {
  detectPreviewKind,
  guessLanguage,
  isPreviewAvailable,
  type PreviewMode,
} from "./preview-utils";

export interface PreviewPanelProps {
  filePath: string | null;
  extension: string | null;
  content: string;
  size: number | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  onOpenEditor: () => void;
}

interface StructuredResult {
  formatted: string;
  format: "json" | "yaml";
  error: string | null;
}

function formatStructuredContent(
  content: string,
  extension: string | null,
): StructuredResult {
  try {
    if (extension === ".json") {
      return {
        formatted: JSON.stringify(JSON.parse(content), null, 2),
        format: "json",
        error: null,
      };
    }

    return {
      formatted: JSON.stringify(parseYaml(content), null, 2),
      format: "yaml",
      error: null,
    };
  } catch (error) {
    return {
      formatted: "",
      format: extension === ".json" ? "json" : "yaml",
      error:
        error instanceof Error
          ? `Structured preview failed: ${error.message}`
          : "Structured preview failed",
    };
  }
}

export function PreviewPanel({
  filePath,
  extension,
  content,
  size,
  isLoading,
  error,
  onRefresh,
  onOpenEditor,
}: PreviewPanelProps): JSX.Element {
  const [mode, setMode] = useState<PreviewMode>("source");
  const [isWrap, setIsWrap] = useState(false);

  const previewKind = useMemo(() => detectPreviewKind(extension), [extension]);
  const canPreview = isPreviewAvailable(extension);

  const structured = useMemo(() => {
    if (previewKind !== "structured") {
      return null;
    }

    return formatStructuredContent(content, extension);
  }, [content, extension, previewKind]);

  useEffect(() => {
    if (!canPreview && mode === "preview") {
      setMode("source");
    }
  }, [canPreview, mode]);

  useEffect(() => {
    setMode("source");
  }, [filePath]);

  const renderBody = (): JSX.Element => {
    if (!filePath) {
      return <PreviewEmptyState />;
    }

    if (isLoading) {
      return (
        <div
          className="flex h-full min-h-0 items-center justify-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-primary)]"
          data-testid="preview-loading"
        >
          <p className="text-sm text-[var(--text-secondary)]">
            ファイルを読み込んでいます...
          </p>
        </div>
      );
    }

    const structuredError = structured?.error ?? null;

    if (error) {
      return (
        <div
          className="flex h-full min-h-0 flex-col gap-3 rounded-2xl border border-[var(--status-error)] bg-[var(--bg-primary)] p-4"
          role="alert"
          data-testid="preview-alert"
        >
          <p className="text-sm font-semibold text-[var(--status-error)]">
            プレビューの取得に失敗しました
          </p>
          <p className="text-xs text-[var(--text-secondary)]">{error}</p>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-full border border-[var(--border-subtle)] px-3 py-1 text-xs text-[var(--text-secondary)]"
              onClick={onRefresh}
              data-testid="preview-retry"
            >
              再読み込み
            </button>
            <button
              type="button"
              className="rounded-full border border-[var(--border-subtle)] px-3 py-1 text-xs text-[var(--text-secondary)]"
              onClick={() => setMode("source")}
              data-testid="preview-fallback-source"
            >
              コード表示へ戻る
            </button>
          </div>
        </div>
      );
    }

    if (structuredError && mode === "preview" && previewKind === "structured") {
      return (
        <div className="flex h-full min-h-0 flex-col gap-3">
          <div
            className="rounded-2xl border border-[var(--status-error)] bg-[var(--bg-primary)] p-4"
            role="alert"
            data-testid="preview-structured-fallback-alert"
          >
            <p className="text-sm font-semibold text-[var(--status-error)]">
              整形プレビューに失敗したため、コード表示に切り替えました
            </p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              {structuredError}
            </p>
          </div>
          <div className="min-h-0 flex-1">
            <SourceView
              filePath={filePath}
              content={content}
              language={guessLanguage(extension)}
              isWrap={isWrap}
              onOpenEditor={onOpenEditor}
            />
          </div>
        </div>
      );
    }

    if (mode === "source" || !canPreview) {
      return (
        <SourceView
          filePath={filePath}
          content={content}
          language={guessLanguage(extension)}
          isWrap={isWrap}
          onOpenEditor={onOpenEditor}
        />
      );
    }

    switch (previewKind) {
      case "html":
        return <HtmlPreview html={content} />;
      case "markdown":
        return <MarkdownPreview markdown={content} />;
      case "structured":
        return (
          <StructuredPreview
            formatted={structured?.formatted ?? ""}
            format={structured?.format ?? "json"}
          />
        );
      case "image":
        return (
          <ImagePreview content={content} extension={extension} size={size} />
        );
      default:
        return (
          <SourceView
            filePath={filePath}
            content={content}
            language={guessLanguage(extension)}
            isWrap={isWrap}
            onOpenEditor={onOpenEditor}
          />
        );
    }
  };

  return (
    <section
      data-testid="workspace-preview-panel"
      className="flex h-full min-h-0 flex-col rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]"
    >
      <PreviewToolbar
        mode={mode}
        canPreview={canPreview}
        isWrap={isWrap}
        onModeChange={setMode}
        onRefresh={onRefresh}
        onWrapToggle={() => setIsWrap((prev) => !prev)}
      />
      <div className="min-h-0 flex-1 p-3">
        <PreviewErrorBoundary>{renderBody()}</PreviewErrorBoundary>
      </div>
    </section>
  );
}

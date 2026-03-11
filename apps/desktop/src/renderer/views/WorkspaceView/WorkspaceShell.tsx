import { SlideInPanel } from "@/renderer/components/molecules/SlideInPanel";
import type { ReactNode } from "react";
import { PanelResizeHandle } from "./PanelResizeHandle";
import type { UsePanelResizeReturn } from "./hooks/usePanelResize";

export interface WorkspaceShellProps {
  topBar: ReactNode;
  filePanel: ReactNode;
  chatPanel: ReactNode;
  previewPanel: ReactNode;
  statusBar: ReactNode;
  showFilePanelInline: boolean;
  showPreviewPanelInline: boolean;
  showFilePanelOverlay: boolean;
  showPreviewPanelOverlay: boolean;
  closeOverlayPanel: () => void;
  fileResize: UsePanelResizeReturn;
  previewResize: UsePanelResizeReturn;
  filePanelWidth: number;
  previewPanelWidth: number;
}

export function WorkspaceShell({
  topBar,
  filePanel,
  chatPanel,
  previewPanel,
  statusBar,
  showFilePanelInline,
  showPreviewPanelInline,
  showFilePanelOverlay,
  showPreviewPanelOverlay,
  closeOverlayPanel,
  fileResize,
  previewResize,
  filePanelWidth,
  previewPanelWidth,
}: WorkspaceShellProps): JSX.Element {
  return (
    <div
      data-testid="workspace-view"
      className="flex h-full min-h-0 flex-col gap-4 rounded-[32px] bg-[var(--bg-primary)]"
    >
      <div className="shrink-0">{topBar}</div>

      <div className="flex min-h-0 flex-1 gap-0 overflow-hidden">
        {showFilePanelInline ? (
          <div style={{ width: filePanelWidth }} className="min-h-0 shrink-0">
            {filePanel}
          </div>
        ) : null}
        {showFilePanelInline ? (
          <PanelResizeHandle
            testId="workspace-resize-file"
            label="ファイルパネル幅の調整"
            resize={fileResize}
          />
        ) : null}

        <div
          data-testid="workspace-chat-panel"
          className="min-h-0 min-w-0 flex-1"
        >
          {chatPanel}
        </div>

        {showPreviewPanelInline ? (
          <PanelResizeHandle
            testId="workspace-resize-preview"
            label="プレビューパネル幅の調整"
            resize={previewResize}
          />
        ) : null}
        {showPreviewPanelInline ? (
          <div
            style={{ width: previewPanelWidth }}
            className="min-h-0 shrink-0"
          >
            {previewPanel}
          </div>
        ) : null}
      </div>

      <div className="shrink-0">{statusBar}</div>

      <SlideInPanel
        isOpen={showFilePanelOverlay}
        onClose={closeOverlayPanel}
        side="left"
        width="min(100vw, 320px)"
        title="ファイル"
      >
        {filePanel}
      </SlideInPanel>

      <SlideInPanel
        isOpen={showPreviewPanelOverlay}
        onClose={closeOverlayPanel}
        side="right"
        width="min(100vw, 420px)"
        title="プレビュー"
      >
        {previewPanel}
      </SlideInPanel>
    </div>
  );
}

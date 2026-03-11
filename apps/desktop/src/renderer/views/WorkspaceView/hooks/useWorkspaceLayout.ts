import { useEffect, useMemo, useState } from "react";

export const WORKSPACE_MOBILE_BREAKPOINT = 1024;
export const WORKSPACE_THREE_PANE_BREAKPOINT = 1440;
export const DEFAULT_FILE_PANEL_WIDTH = 260;
export const DEFAULT_PREVIEW_PANEL_WIDTH = 360;
export const MIN_FILE_PANEL_WIDTH = 180;
export const MAX_FILE_PANEL_WIDTH = 400;
export const MIN_PREVIEW_PANEL_WIDTH = 280;
export const MAX_PREVIEW_PANEL_WIDTH = 560;
export const DEFAULT_RESET_WIDTH = 320;

export type WorkspaceLayoutMode =
  | "chat-only"
  | "chat+files"
  | "chat+preview"
  | "3-pane";

export interface WorkspacePanelSizes {
  filePanelWidth: number;
  previewPanelWidth: number;
}

export interface UseWorkspaceLayoutReturn {
  layoutMode: WorkspaceLayoutMode;
  windowWidth: number;
  isMobile: boolean;
  isDesktopWide: boolean;
  isFilePanelOpen: boolean;
  isPreviewOpen: boolean;
  showFilePanelInline: boolean;
  showPreviewPanelInline: boolean;
  showFilePanelOverlay: boolean;
  showPreviewPanelOverlay: boolean;
  filePanelWidth: number;
  previewPanelWidth: number;
  setFilePanelWidth: (value: number) => void;
  setPreviewPanelWidth: (value: number) => void;
  toggleFilePanel: () => void;
  togglePreviewPanel: () => void;
  closeOverlayPanel: () => void;
}

const LAYOUT_STORAGE_KEY = "workspace-layout-mode";
const PANEL_SIZE_STORAGE_KEY = "workspace-panel-sizes";

function getWindowWidth(): number {
  if (typeof window === "undefined") {
    return WORKSPACE_THREE_PANE_BREAKPOINT;
  }
  return window.innerWidth;
}

function readStoredBoolean(mode: WorkspaceLayoutMode): {
  isFilePanelOpen: boolean;
  isPreviewOpen: boolean;
  lastOpenedPanel: "file" | "preview";
} {
  switch (mode) {
    case "chat+files":
      return {
        isFilePanelOpen: true,
        isPreviewOpen: false,
        lastOpenedPanel: "file",
      };
    case "chat+preview":
      return {
        isFilePanelOpen: false,
        isPreviewOpen: true,
        lastOpenedPanel: "preview",
      };
    case "3-pane":
      return {
        isFilePanelOpen: true,
        isPreviewOpen: true,
        lastOpenedPanel: "preview",
      };
    default:
      return {
        isFilePanelOpen: false,
        isPreviewOpen: false,
        lastOpenedPanel: "file",
      };
  }
}

function readStoredLayoutMode(): {
  isFilePanelOpen: boolean;
  isPreviewOpen: boolean;
  lastOpenedPanel: "file" | "preview";
} {
  if (typeof window === "undefined") {
    return readStoredBoolean("chat-only");
  }

  const raw = window.localStorage.getItem(LAYOUT_STORAGE_KEY);
  if (
    raw === "chat-only" ||
    raw === "chat+files" ||
    raw === "chat+preview" ||
    raw === "3-pane"
  ) {
    return readStoredBoolean(raw);
  }

  return readStoredBoolean("chat-only");
}

function clamp(
  value: number,
  min: number,
  max: number,
  fallback: number,
): number {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, value));
}

function readStoredPanelSizes(): WorkspacePanelSizes {
  if (typeof window === "undefined") {
    return {
      filePanelWidth: DEFAULT_FILE_PANEL_WIDTH,
      previewPanelWidth: DEFAULT_PREVIEW_PANEL_WIDTH,
    };
  }

  try {
    const raw = window.localStorage.getItem(PANEL_SIZE_STORAGE_KEY);
    if (!raw) {
      return {
        filePanelWidth: DEFAULT_FILE_PANEL_WIDTH,
        previewPanelWidth: DEFAULT_PREVIEW_PANEL_WIDTH,
      };
    }

    const parsed = JSON.parse(raw) as Partial<WorkspacePanelSizes>;
    return {
      filePanelWidth: clamp(
        parsed.filePanelWidth ?? DEFAULT_FILE_PANEL_WIDTH,
        MIN_FILE_PANEL_WIDTH,
        MAX_FILE_PANEL_WIDTH,
        DEFAULT_FILE_PANEL_WIDTH,
      ),
      previewPanelWidth: clamp(
        parsed.previewPanelWidth ?? DEFAULT_PREVIEW_PANEL_WIDTH,
        MIN_PREVIEW_PANEL_WIDTH,
        MAX_PREVIEW_PANEL_WIDTH,
        DEFAULT_PREVIEW_PANEL_WIDTH,
      ),
    };
  } catch {
    return {
      filePanelWidth: DEFAULT_FILE_PANEL_WIDTH,
      previewPanelWidth: DEFAULT_PREVIEW_PANEL_WIDTH,
    };
  }
}

function resolveLayoutMode(input: {
  isFilePanelOpen: boolean;
  isPreviewOpen: boolean;
  lastOpenedPanel: "file" | "preview";
  width: number;
}): WorkspaceLayoutMode {
  if (input.isFilePanelOpen && input.isPreviewOpen) {
    if (input.width >= WORKSPACE_THREE_PANE_BREAKPOINT) {
      return "3-pane";
    }
    return input.lastOpenedPanel === "file" ? "chat+files" : "chat+preview";
  }

  if (input.isFilePanelOpen) {
    return "chat+files";
  }

  if (input.isPreviewOpen) {
    return "chat+preview";
  }

  return "chat-only";
}

export function useWorkspaceLayout(): UseWorkspaceLayoutReturn {
  const initialLayout = readStoredLayoutMode();
  const initialSizes = readStoredPanelSizes();

  const [windowWidth, setWindowWidth] = useState<number>(() =>
    getWindowWidth(),
  );
  const [isFilePanelOpen, setIsFilePanelOpen] = useState(
    initialLayout.isFilePanelOpen,
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState(
    initialLayout.isPreviewOpen,
  );
  const [lastOpenedPanel, setLastOpenedPanel] = useState<"file" | "preview">(
    initialLayout.lastOpenedPanel,
  );
  const [filePanelWidth, setFilePanelWidthState] = useState(
    initialSizes.filePanelWidth,
  );
  const [previewPanelWidth, setPreviewPanelWidthState] = useState(
    initialSizes.previewPanelWidth,
  );

  useEffect(() => {
    const handleResize = (): void => {
      setWindowWidth(getWindowWidth());
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const layoutMode = useMemo(
    () =>
      resolveLayoutMode({
        isFilePanelOpen,
        isPreviewOpen,
        lastOpenedPanel,
        width: windowWidth,
      }),
    [isFilePanelOpen, isPreviewOpen, lastOpenedPanel, windowWidth],
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(LAYOUT_STORAGE_KEY, layoutMode);
  }, [layoutMode]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(
      PANEL_SIZE_STORAGE_KEY,
      JSON.stringify({
        filePanelWidth,
        previewPanelWidth,
      } satisfies WorkspacePanelSizes),
    );
  }, [filePanelWidth, previewPanelWidth]);

  const isMobile = windowWidth < WORKSPACE_MOBILE_BREAKPOINT;
  const isDesktopWide = windowWidth >= WORKSPACE_THREE_PANE_BREAKPOINT;
  const showFilePanelInline =
    !isMobile && (layoutMode === "chat+files" || layoutMode === "3-pane");
  const showPreviewPanelInline =
    !isMobile && (layoutMode === "chat+preview" || layoutMode === "3-pane");
  const showFilePanelOverlay = isMobile && layoutMode === "chat+files";
  const showPreviewPanelOverlay = isMobile && layoutMode === "chat+preview";

  const toggleFilePanel = (): void => {
    setIsFilePanelOpen((prev) => !prev);
    setLastOpenedPanel("file");
  };

  const togglePreviewPanel = (): void => {
    setIsPreviewOpen((prev) => !prev);
    setLastOpenedPanel("preview");
  };

  const closeOverlayPanel = (): void => {
    if (!isMobile) {
      return;
    }

    if (layoutMode === "chat+files") {
      setIsFilePanelOpen(false);
      return;
    }

    if (layoutMode === "chat+preview") {
      setIsPreviewOpen(false);
    }
  };

  return {
    layoutMode,
    windowWidth,
    isMobile,
    isDesktopWide,
    isFilePanelOpen,
    isPreviewOpen,
    showFilePanelInline,
    showPreviewPanelInline,
    showFilePanelOverlay,
    showPreviewPanelOverlay,
    filePanelWidth,
    previewPanelWidth,
    setFilePanelWidth: (value) =>
      setFilePanelWidthState(
        clamp(
          value,
          MIN_FILE_PANEL_WIDTH,
          MAX_FILE_PANEL_WIDTH,
          DEFAULT_FILE_PANEL_WIDTH,
        ),
      ),
    setPreviewPanelWidth: (value) =>
      setPreviewPanelWidthState(
        clamp(
          value,
          MIN_PREVIEW_PANEL_WIDTH,
          MAX_PREVIEW_PANEL_WIDTH,
          DEFAULT_PREVIEW_PANEL_WIDTH,
        ),
      ),
    toggleFilePanel,
    togglePreviewPanel,
    closeOverlayPanel,
  };
}

export function resetWorkspaceLayoutStorage(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(LAYOUT_STORAGE_KEY);
  window.localStorage.removeItem(PANEL_SIZE_STORAGE_KEY);
}

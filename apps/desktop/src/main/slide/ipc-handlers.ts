/**
 * IPC handlers
 * Main/Renderer間のIPC通信を管理する
 * @module main/slide/ipc-handlers
 */

import { ipcMain, BrowserWindow } from "electron";
import type { IpcMainInvokeEvent } from "electron";
import type {
  SkillPhase,
  SkillExecutionResult,
  SlideResponse,
  SlideErrorCode,
  SlideCapabilityDTO,
} from "@repo/shared";
/** Valid SkillPhase values for runtime validation */
const VALID_PHASES: readonly string[] = [
  "hearing",
  "structure",
  "html",
  "modifier",
];

function isValidPhase(value: string): value is SkillPhase {
  return VALID_PHASES.includes(value);
}

import { createSlideWatcher, SlideWatcher } from "./file-watcher";
import { createSkillExecutor, SkillExecutor } from "./skill-executor";
import { createSyncManager, SyncManager } from "./sync-manager";
import { validateIpcSender } from "../infrastructure/security/ipc-validator";
import { sanitizeErrorMessage } from "../ipc/sanitizeErrorMessage";

// invoke (Renderer -> Main): 7 channels
export const SLIDE_INVOKE_CHANNELS = {
  EXECUTE_PHASE: "slide:executePhase",
  WATCH_START: "slide:watch-start",
  WATCH_STOP: "slide:watch-stop",
  SYNC_STATUS: "slide:sync-status",
  REVERSE_SYNC: "slide:reverse-sync",
  CANCEL: "slide:cancel",
  CAPABILITY_GET: "slide:capability:get",
} as const;

// push (Main -> Renderer): 6 channels
export const SLIDE_PUSH_CHANNELS = {
  SYNC_STATUS_CHANGED: "slide:sync-status-changed",
  SYNC_PROGRESS: "slide:sync-progress",
  SYNC_ERROR: "slide:sync-error",
  EXECUTION_PROGRESS: "slide:execution-progress",
  STRUCTURE_CHANGED: "slide:structureChanged",
  WATCH_STATUS: "slide:watch-status",
} as const;

/**
 * Path traversal detection helper (P42 compliant)
 */
function detectPathTraversal(targetPath: string): string | null {
  if (targetPath.includes("\0")) return "Invalid path: null byte detected";
  if (targetPath.includes("..")) return "Path traversal not allowed";
  if (targetPath.includes("%2e") || targetPath.includes("%2E"))
    return "URL encoded path traversal not allowed";
  return null;
}

/**
 * Create a SlideResponse error
 */
function slideError(code: SlideErrorCode, message: string): SlideResponse {
  return { success: false, error: { code, message } };
}

/**
 * Validate IPC sender only (for handlers without projectPath: watch-stop, cancel)
 * @returns SlideResponse error if validation fails, undefined if valid
 */
function validateSlideSenderOnly(
  event: IpcMainInvokeEvent,
  channelName: string,
  mainWindow: BrowserWindow,
): SlideResponse | undefined {
  const senderValidation = validateIpcSender(event, channelName, {
    getAllowedWindows: () => [mainWindow],
  });
  if (!senderValidation.valid) {
    return slideError("SLIDE_E010", "IPC sender validation failed");
  }
  return undefined;
}

/**
 * Validate IPC sender + projectPath (P42 3-stage + path traversal)
 * @returns validation result with either validated projectPath or error response
 */
function validateSlideRequestWithPath(
  event: IpcMainInvokeEvent,
  channelName: string,
  projectPath: unknown,
  mainWindow: BrowserWindow,
):
  | { valid: true; projectPath: string }
  | { valid: false; response: SlideResponse } {
  const senderError = validateSlideSenderOnly(event, channelName, mainWindow);
  if (senderError) {
    return { valid: false, response: senderError };
  }

  // P42 3-stage validation
  if (
    typeof projectPath !== "string" ||
    projectPath === "" ||
    projectPath.trim() === ""
  ) {
    return {
      valid: false,
      response: slideError(
        "SLIDE_E011",
        "projectPath must be a non-empty string",
      ),
    };
  }

  // Path traversal detection
  const traversalError = detectPathTraversal(projectPath);
  if (traversalError) {
    return {
      valid: false,
      response: slideError("SLIDE_E011", traversalError),
    };
  }

  return { valid: true, projectPath: projectPath.trim() };
}

/**
 * Resolve slide capability based on current state
 * @param _sessionId - Session identifier (for future per-session state)
 */
function resolveSlideCapability(_sessionId: string): SlideCapabilityDTO {
  // 現時点では静的な状態を返す
  // 将来的に authKeyService / RuntimePolicyResolver との統合時に動的化
  return {
    lane: "integrated",
    apiKeySource: "env",
    uiStatus: "synced",
  };
}

/** Current watcher */
let watcher: SlideWatcher | null = null;
/** Skill executor */
let executor: SkillExecutor | null = null;
/** Sync manager */
let syncManager: SyncManager | null = null;

/**
 * Register slide IPC handlers
 * @param mainWindow - Main BrowserWindow
 */
export const registerSlideIpcHandlers = (mainWindow: BrowserWindow): void => {
  // Skill execution
  ipcMain.handle(
    SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE,
    async (
      event: IpcMainInvokeEvent,
      phase: unknown,
      projectPath: unknown,
    ): Promise<SlideResponse<SkillExecutionResult>> => {
      // 1. Sender validation
      const senderError = validateSlideSenderOnly(
        event,
        SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE,
        mainWindow,
      );
      if (senderError)
        return senderError as SlideResponse<SkillExecutionResult>;

      // 2. P42 3-stage validation for phase
      if (typeof phase !== "string" || phase === "" || phase.trim() === "") {
        return {
          success: false,
          error: {
            code: "SLIDE_E011",
            message: "phase must be a non-empty string",
          },
        };
      }
      if (!isValidPhase(phase.trim())) {
        return {
          success: false,
          error: {
            code: "SLIDE_E011",
            message: "invalid phase value",
          },
        };
      }
      const validPhase = phase.trim() as SkillPhase;

      // 3. projectPath validation (P42 + path traversal)
      const pathValidation = validateSlideRequestWithPath(
        event,
        SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE,
        projectPath,
        mainWindow,
      );
      if (!pathValidation.valid) {
        return pathValidation.response as SlideResponse<SkillExecutionResult>;
      }

      try {
        if (!executor) {
          executor = createSkillExecutor();
          // Forward progress events
          executor.onProgress((progress) => {
            mainWindow.webContents.send(
              SLIDE_PUSH_CHANNELS.EXECUTION_PROGRESS,
              progress,
            );
          });
        }

        // Mark as skill-triggered change (infinite loop prevention)
        const validatedPath = pathValidation.projectPath;
        if (watcher) {
          const structurePath = `${validatedPath}/structure.md`;
          watcher.markAsSkillChange(structurePath, validPhase);
        }

        const result = await executor.execute(validPhase, validatedPath);

        // Update sync status and notify
        if (result.success && syncManager) {
          const status = await syncManager.getStatus(validatedPath);
          mainWindow.webContents.send(
            SLIDE_PUSH_CHANNELS.SYNC_STATUS_CHANGED,
            status,
          );
        }

        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: {
            code: "SLIDE_E006",
            message: sanitizeErrorMessage(error, "Skill execution failed"),
          },
        };
      }
    },
  );

  // Watch start
  ipcMain.handle(
    SLIDE_INVOKE_CHANNELS.WATCH_START,
    async (
      event: IpcMainInvokeEvent,
      projectPath: unknown,
    ): Promise<SlideResponse> => {
      const pathValidation = validateSlideRequestWithPath(
        event,
        SLIDE_INVOKE_CHANNELS.WATCH_START,
        projectPath,
        mainWindow,
      );
      if (!pathValidation.valid) return pathValidation.response;

      const validatedPath = pathValidation.projectPath;

      try {
        // Stop existing watcher
        if (watcher) {
          watcher.stop();
        }

        // Create new watcher
        watcher = createSlideWatcher(validatedPath);
        watcher.onStructureChange(async (path) => {
          // Notify renderer
          mainWindow.webContents.send(
            SLIDE_PUSH_CHANNELS.STRUCTURE_CHANGED,
            path,
          );

          // Update and notify sync status
          if (syncManager) {
            const status = await syncManager.getStatus(validatedPath);
            mainWindow.webContents.send(
              SLIDE_PUSH_CHANNELS.SYNC_STATUS_CHANGED,
              status,
            );
          }
        });
        watcher.start();

        // Initialize sync manager
        if (!syncManager) {
          syncManager = createSyncManager();
        }

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: {
            code: "SLIDE_E001",
            message: sanitizeErrorMessage(error, "Failed to start watching"),
          },
        };
      }
    },
  );

  // Watch stop
  ipcMain.handle(
    SLIDE_INVOKE_CHANNELS.WATCH_STOP,
    async (event: IpcMainInvokeEvent): Promise<SlideResponse> => {
      const senderError = validateSlideSenderOnly(
        event,
        SLIDE_INVOKE_CHANNELS.WATCH_STOP,
        mainWindow,
      );
      if (senderError) return senderError;

      try {
        if (watcher) {
          watcher.stop();
          watcher = null;
        }
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: {
            code: "SLIDE_E001",
            message: sanitizeErrorMessage(error, "Failed to stop watching"),
          },
        };
      }
    },
  );

  // Sync status
  ipcMain.handle(
    SLIDE_INVOKE_CHANNELS.SYNC_STATUS,
    async (
      event: IpcMainInvokeEvent,
      projectPath: unknown,
    ): Promise<SlideResponse<string>> => {
      const pathValidation = validateSlideRequestWithPath(
        event,
        SLIDE_INVOKE_CHANNELS.SYNC_STATUS,
        projectPath,
        mainWindow,
      );
      if (!pathValidation.valid) {
        return pathValidation.response as SlideResponse<string>;
      }

      const validatedPath = pathValidation.projectPath;

      try {
        if (!syncManager) {
          syncManager = createSyncManager();
        }
        const status = await syncManager.getStatus(validatedPath);
        return { success: true, data: status };
      } catch (error) {
        return {
          success: false,
          error: {
            code: "SLIDE_E007",
            message: sanitizeErrorMessage(error, "Failed to get sync status"),
          },
        };
      }
    },
  );

  // Reverse sync (formerly manualSync)
  ipcMain.handle(
    SLIDE_INVOKE_CHANNELS.REVERSE_SYNC,
    async (
      event: IpcMainInvokeEvent,
      projectPath: unknown,
    ): Promise<SlideResponse> => {
      const pathValidation = validateSlideRequestWithPath(
        event,
        SLIDE_INVOKE_CHANNELS.REVERSE_SYNC,
        projectPath,
        mainWindow,
      );
      if (!pathValidation.valid) return pathValidation.response;

      const validatedPath = pathValidation.projectPath;

      try {
        if (!syncManager) {
          syncManager = createSyncManager();
        }

        // Notify syncing state
        mainWindow.webContents.send(
          SLIDE_PUSH_CHANNELS.SYNC_STATUS_CHANGED,
          "syncing",
        );

        await syncManager.sync(validatedPath);

        // Notify synced state
        mainWindow.webContents.send(
          SLIDE_PUSH_CHANNELS.SYNC_STATUS_CHANGED,
          "synced",
        );

        return { success: true };
      } catch (error) {
        // Notify error state
        mainWindow.webContents.send(
          SLIDE_PUSH_CHANNELS.SYNC_STATUS_CHANGED,
          "error",
        );

        return {
          success: false,
          error: {
            code: "SLIDE_E007",
            message: sanitizeErrorMessage(error, "Reverse sync failed"),
          },
        };
      }
    },
  );

  // Cancel execution
  ipcMain.handle(
    SLIDE_INVOKE_CHANNELS.CANCEL,
    async (event: IpcMainInvokeEvent): Promise<SlideResponse> => {
      const senderError = validateSlideSenderOnly(
        event,
        SLIDE_INVOKE_CHANNELS.CANCEL,
        mainWindow,
      );
      if (senderError) return senderError;

      try {
        if (executor) {
          executor.cancel();
        }
        if (syncManager) {
          syncManager.cancel();
        }
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: {
            code: "SLIDE_E008",
            message: sanitizeErrorMessage(error, "Failed to cancel execution"),
          },
        };
      }
    },
  );

  // Capability get
  ipcMain.handle(
    SLIDE_INVOKE_CHANNELS.CAPABILITY_GET,
    async (
      event: IpcMainInvokeEvent,
      args: unknown,
    ): Promise<SlideResponse<SlideCapabilityDTO>> => {
      // 1. Sender validation
      const senderError = validateSlideSenderOnly(
        event,
        SLIDE_INVOKE_CHANNELS.CAPABILITY_GET,
        mainWindow,
      );
      if (senderError) return senderError as SlideResponse<SlideCapabilityDTO>;

      // 2. P42 3-stage validation for sessionId
      const typedArgs = args as { sessionId?: unknown } | null | undefined;
      if (typeof typedArgs?.sessionId !== "string") {
        return {
          success: false,
          error: {
            code: "SLIDE_E011",
            message: "sessionId must be a string",
          },
        };
      }
      if (typedArgs.sessionId === "") {
        return {
          success: false,
          error: {
            code: "SLIDE_E011",
            message: "sessionId must not be empty",
          },
        };
      }
      if (typedArgs.sessionId.trim() === "") {
        return {
          success: false,
          error: {
            code: "SLIDE_E011",
            message: "sessionId must not be whitespace only",
          },
        };
      }

      try {
        const capability = resolveSlideCapability(typedArgs.sessionId.trim());
        return { success: true, data: capability };
      } catch (error) {
        return {
          success: false,
          error: {
            code: "SLIDE_E006",
            message: sanitizeErrorMessage(
              error,
              "Failed to resolve capability",
            ),
          },
        };
      }
    },
  );
};

/**
 * Unregister slide IPC handlers
 */
export const unregisterSlideIpcHandlers = (): void => {
  ipcMain.removeHandler(SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE);
  ipcMain.removeHandler(SLIDE_INVOKE_CHANNELS.WATCH_START);
  ipcMain.removeHandler(SLIDE_INVOKE_CHANNELS.WATCH_STOP);
  ipcMain.removeHandler(SLIDE_INVOKE_CHANNELS.SYNC_STATUS);
  ipcMain.removeHandler(SLIDE_INVOKE_CHANNELS.REVERSE_SYNC);
  ipcMain.removeHandler(SLIDE_INVOKE_CHANNELS.CANCEL);
  ipcMain.removeHandler(SLIDE_INVOKE_CHANNELS.CAPABILITY_GET);

  // Cleanup
  if (watcher) {
    watcher.stop();
    watcher = null;
  }
  executor = null;
  syncManager = null;
};

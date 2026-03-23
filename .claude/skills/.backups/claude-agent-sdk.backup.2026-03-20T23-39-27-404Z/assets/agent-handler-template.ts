/**
 * Agent Handler Template for Electron Main Process
 *
 * This template provides the foundational IPC handlers for integrating
 * Claude Agent SDK with an Electron application.
 *
 * Usage:
 *   1. Copy this file to apps/desktop/src/main/ipc/agentHandlers.ts
 *   2. Customize permission rules and tool configurations
 *   3. Register handlers in your main process entry point
 */

import {
  query,
  type Options,
  type HookInput,
  type SDKMessage,
} from "@anthropic-ai/claude-agent-sdk";
import { ipcMain, BrowserWindow } from "electron";

// ============================================================================
// Types
// ============================================================================

interface AgentStartConfig {
  initialPrompt: string;
  tools?: string[];
  systemPrompt?: string;
}

interface PermissionResponse {
  requestId: string;
  approved: boolean;
}

interface AgentStatus {
  type: "tool_completed" | "completed" | "error";
  tool?: string;
  error?: string;
  timestamp: number;
}

// ============================================================================
// State Management
// ============================================================================

let currentConversation: ReturnType<typeof query> | null = null;
let abortController: AbortController | null = null;
const permissionResolvers = new Map<string, (approved: boolean) => void>();

// ============================================================================
// Configuration
// ============================================================================

/**
 * Patterns that should be blocked for security
 * Customize based on your application requirements
 */
const BLOCKED_COMMAND_PATTERNS = [
  "rm -rf",
  "sudo",
  "> /dev/",
  "mkfs",
  "dd if=",
  "chmod 777",
  ":(){ :|:& };:", // Fork bomb
];

/**
 * Tools that require user approval before execution
 */
const APPROVAL_REQUIRED_TOOLS = ["Write", "Edit", "Bash"];

/**
 * Default tools available to the agent
 */
const DEFAULT_TOOLS = ["Read", "Edit", "Write", "Bash", "Glob", "Grep"];

// ============================================================================
// Handler Setup
// ============================================================================

export function setupAgentHandlers(mainWindow: BrowserWindow): void {
  // Agent Start
  ipcMain.handle(
    "agent:start",
    async (_event, config: AgentStartConfig) => {
      return handleAgentStart(mainWindow, config);
    },
  );

  // Agent Stop
  ipcMain.handle("agent:stop", async () => {
    return handleAgentStop();
  });

  // Agent Message (additional prompts)
  ipcMain.handle("agent:message", async (_event, message: string) => {
    return handleAgentMessage(message);
  });

  // Permission Response
  ipcMain.on(
    "agent:permission:res",
    (_event, response: PermissionResponse) => {
      handlePermissionResponse(response);
    },
  );
}

// ============================================================================
// Handler Implementations
// ============================================================================

async function handleAgentStart(
  mainWindow: BrowserWindow,
  config: AgentStartConfig,
): Promise<{ success: boolean; error?: string }> {
  // Cleanup previous conversation
  if (currentConversation) {
    abortController?.abort();
    currentConversation = null;
  }

  abortController = new AbortController();

  const options: Options = {
    tools: config.tools || DEFAULT_TOOLS,
    permissionMode: "default",
    permissions: {
      allow: [
        { tool: "Read" },
        { tool: "Glob" },
        { tool: "Grep" },
      ],
      ask: APPROVAL_REQUIRED_TOOLS.map((tool) => ({ tool })),
    },
    hooks: createHooks(mainWindow),
  };

  try {
    currentConversation = query({
      prompt: config.initialPrompt,
      options,
    });

    // Start streaming in background
    processStream(mainWindow).catch((error) => {
      console.error("Stream processing error:", error);
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function handleAgentStop(): { success: boolean } {
  abortController?.abort();
  currentConversation = null;
  abortController = null;
  return { success: true };
}

function handleAgentMessage(
  message: string,
): { success: boolean; error?: string } {
  if (!currentConversation) {
    return { success: false, error: "No active conversation" };
  }
  // Note: Implementation depends on SDK's multi-turn conversation API
  console.log("Additional message:", message);
  return { success: true };
}

function handlePermissionResponse(response: PermissionResponse): void {
  const resolver = permissionResolvers.get(response.requestId);
  if (resolver) {
    resolver(response.approved);
    permissionResolvers.delete(response.requestId);
  }
}

// ============================================================================
// Hooks Factory
// ============================================================================

function createHooks(mainWindow: BrowserWindow): Options["hooks"] {
  return {
    PreToolUse: async (input, _toolUseID, { signal }) => {
      // Check abort signal
      if (signal.aborted) {
        return { proceed: false, message: "Operation aborted" };
      }

      // Block dangerous commands
      if (shouldBlockTool(input)) {
        return {
          proceed: false,
          message: "This operation is not permitted for security reasons",
        };
      }

      // Request user approval for sensitive tools
      if (requiresUserApproval(input)) {
        const approved = await requestPermission(mainWindow, input);
        return { proceed: approved };
      }

      return { proceed: true };
    },

    PostToolUse: async (input, _toolUseID, { signal }) => {
      if (signal.aborted) return {};

      // Notify UI of tool completion
      sendStatus(mainWindow, {
        type: "tool_completed",
        tool: input.toolName,
        timestamp: Date.now(),
      });

      return {};
    },

    PermissionRequest: async (input, _toolUseID, { signal }) => {
      if (signal.aborted) {
        return { proceed: false };
      }

      const approved = await requestPermission(mainWindow, input);
      return { proceed: approved };
    },
  };
}

// ============================================================================
// Stream Processing
// ============================================================================

async function processStream(mainWindow: BrowserWindow): Promise<void> {
  if (!currentConversation) return;

  try {
    for await (const message of currentConversation.stream()) {
      // Send message to renderer
      mainWindow.webContents.send("agent:stream", {
        type: message.type,
        data: sanitizeForIPC(message),
        timestamp: Date.now(),
      });
    }

    // Notify completion
    sendStatus(mainWindow, {
      type: "completed",
      timestamp: Date.now(),
    });
  } catch (error) {
    sendStatus(mainWindow, {
      type: "error",
      error: error instanceof Error ? error.message : String(error),
      timestamp: Date.now(),
    });
  }
}

// ============================================================================
// Permission Handling
// ============================================================================

async function requestPermission(
  mainWindow: BrowserWindow,
  input: HookInput,
): Promise<boolean> {
  const requestId = crypto.randomUUID();

  return new Promise<boolean>((resolve) => {
    permissionResolvers.set(requestId, resolve);

    // Send permission request to renderer
    mainWindow.webContents.send("agent:permission", {
      requestId,
      toolName: input.toolName,
      args: sanitizeForIPC(input.args),
    });

    // Timeout: auto-deny after 30 seconds
    setTimeout(() => {
      if (permissionResolvers.has(requestId)) {
        permissionResolvers.delete(requestId);
        resolve(false);
      }
    }, 30000);
  });
}

// ============================================================================
// Utility Functions
// ============================================================================

function shouldBlockTool(input: HookInput): boolean {
  if (input.toolName !== "Bash") return false;

  const command = String(input.args?.command || "");
  return BLOCKED_COMMAND_PATTERNS.some((pattern) => command.includes(pattern));
}

function requiresUserApproval(input: HookInput): boolean {
  return APPROVAL_REQUIRED_TOOLS.includes(input.toolName);
}

function sendStatus(mainWindow: BrowserWindow, status: AgentStatus): void {
  mainWindow.webContents.send("agent:status", status);
}

function sanitizeForIPC(data: unknown): unknown {
  try {
    return JSON.parse(JSON.stringify(data));
  } catch {
    return String(data);
  }
}

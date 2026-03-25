import { spawn, type ChildProcess, type SpawnOptions } from "child_process";
import path from "path";
import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";
import type {
  TerminalOpenRequest,
  TerminalOpenResponse,
} from "../../preload/types";
import type { IApprovalGate } from "../services/runtime/ApprovalGate";

export interface TerminalHandlerDependencies {
  ipcMain?: typeof ipcMain;
  spawn?: typeof spawn;
  platform?: NodeJS.Platform;
  cwdResolver?: () => string;
  approvalGate?: IApprovalGate;
}

function quoteForShell(input: string): string {
  return `'${input.replace(/'/g, "'\"'\"'")}'`;
}

function buildTerminalShellCommand(cwd: string, command?: string): string {
  const cdCommand = `cd ${quoteForShell(cwd)}`;

  if (!command || command.trim().length === 0) {
    return cdCommand;
  }

  return `${cdCommand} && ${command}`;
}

function buildTerminalLaunchConfig(
  platform: NodeJS.Platform,
  cwd: string,
  command?: string,
): { file: string; args: string[] } {
  const shellCommand = buildTerminalShellCommand(cwd, command);

  switch (platform) {
    case "darwin":
      return {
        file: "osascript",
        args: [
          "-e",
          'tell application "Terminal" to activate',
          "-e",
          `tell application "Terminal" to do script ${JSON.stringify(shellCommand)}`,
        ],
      };
    case "win32":
      return {
        file: "powershell.exe",
        args: [
          "-NoExit",
          "-Command",
          [
            `Set-Location -LiteralPath ${JSON.stringify(cwd)}`,
            command?.trim().length ? command : undefined,
          ]
            .filter(Boolean)
            .join("; "),
        ],
      };
    default:
      return {
        file: "x-terminal-emulator",
        args: ["-e", "bash", "-lc", `${shellCommand}; exec bash`],
      };
  }
}

export function registerTerminalHandlers(
  deps: TerminalHandlerDependencies = {},
): void {
  const ipc = deps.ipcMain ?? ipcMain;
  const spawnProcess = deps.spawn ?? spawn;
  const platform = deps.platform ?? process.platform;
  const cwdResolver = deps.cwdResolver ?? process.cwd;

  ipc.handle(
    IPC_CHANNELS.TERMINAL_OPEN,
    async (
      _event,
      request: TerminalOpenRequest = {},
    ): Promise<TerminalOpenResponse> => {
      try {
        // DENY-9: 承認なしの外部プロセス起動を拒否 (APR-T3)
        const gate = deps.approvalGate;
        if (gate) {
          const sessionId = (request as Record<string, unknown>).sessionId;
          const approvalToken = (request as Record<string, unknown>)
            .approvalToken;
          if (
            typeof sessionId !== "string" ||
            typeof approvalToken !== "string"
          ) {
            return {
              success: false,
              error: "Approval is required to open an external terminal",
            };
          }
          const status = gate.checkApproval(
            sessionId,
            "terminal:open",
            approvalToken,
          );
          if (!status.approved) {
            return {
              success: false,
              error: `Terminal open rejected: ${status.reason}`,
            };
          }
        }

        const cwd = path.resolve(request.cwd ?? cwdResolver());
        const command = request.command?.trim() || undefined;
        const { file, args } = buildTerminalLaunchConfig(
          platform,
          cwd,
          command,
        );
        const child = spawnProcess(file, args, {
          cwd,
          detached: true,
          stdio: "ignore",
        } satisfies SpawnOptions) as ChildProcess;

        child.unref?.();

        return {
          success: true,
          data: {
            cwd,
            command,
          },
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  );
}

import type { AccessCapability } from "@repo/shared/types/execution-capability";

export const MAINLINE_TERMINAL_COMMAND = "claude --continue";
export const MAINLINE_HELP_URL =
  "https://docs.anthropic.com/ja/docs/claude-code";
export const MAINLINE_SETUP_GUIDE_URL =
  "https://docs.anthropic.com/ja/docs/claude-code";

export function getTerminalLauncherDisabledReason(
  capability: AccessCapability,
  isAuthenticated: boolean,
  isLoading: boolean,
): string | undefined {
  if (isLoading) {
    return "実行経路を確認中です";
  }

  if (!isAuthenticated) {
    return "認証が必要です";
  }

  if (capability === "integratedRuntime") {
    return "現在は統合ランタイムが利用可能です";
  }

  if (capability === "none") {
    return "利用可能なターミナル経路がありません";
  }

  return undefined;
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "true");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand("copy");
      document.body.removeChild(textarea);
      return copied;
    } catch {
      return false;
    }
  }
}

export async function launchMainlineTerminal(
  command: string = MAINLINE_TERMINAL_COMMAND,
): Promise<boolean> {
  await copyTextToClipboard(command);

  if (!window.electronAPI?.terminal?.open) {
    return false;
  }

  const response = await window.electronAPI.terminal.open({ command });
  return response.success;
}

export function openRuntimeAccessUrl(url: string): void {
  window.open(url, "_blank", "noopener,noreferrer");
}
